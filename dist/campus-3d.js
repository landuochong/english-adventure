import * as T from './vendor/three/three.module.js';
import {campusState,campusAct,campusHint,campusMarker,campusPeople,devicePoint} from './campus-level.js';
import {createLocalVoiceTurn} from './local-voice-turn.js';
import {createVoiceTurn} from './voice-turn.js';
import {createBrowserVAD} from './vad-loader.js';
import {englishVoices,chooseVoice,voiceKey,loadVoices} from './speech.js';
const $=id=>document.getElementById(id),stage=$('stage'),s=campusState(),keys=new Set(),replies=s.records;
let textMode=false,active=false,near=null,dest=null,turn=null,last=null,audioUrl=null,voice='',rate=.85,speechToken=0;
try{voice=localStorage.getItem('campus-voice')||'';rate=Number(localStorage.getItem('campus-speech-rate'))||.85;}catch{}
$('rate').value=String(rate).replace(/^0\./,'.');
const scene=new T.Scene();scene.background=new T.Color('#dce8ef');scene.fog=new T.Fog('#dce8ef',35,70);
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;stage.append(renderer.domElement);
const camera=new T.OrthographicCamera(-9,9,7,-7,.1,100);camera.position.set(15,20,24);camera.lookAt(0,0,0);
scene.add(new T.HemisphereLight(0xfff7df,0x728770,2.3));const sun=new T.DirectionalLight(0xffe7bd,3);sun.position.set(-4,9,5);sun.castShadow=true;scene.add(sun);
function box(w,h,d,color,x,y,z,parent=scene){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.8}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const floor=box(24,.2,16,'#cedae2',0,-.12,0);
const obstacles=[];
function solid(w,h,d,c,x,y,z){const m=box(w,h,d,c,x,y,z);obstacles.push({x,z,w:w/2+.4,d:d/2+.4});return m;}
solid(24,3,.2,'#e7eef4',0,1.4,-8);
solid(.2,3,16,'#f1f5f7',-12,1.4,0);
for(let x=-10;x<=10;x+=2)box(.025,.012,16,'#b3c5d2',x,0,0);
for(let z=-6;z<=6;z+=2)box(24,.012,.025,'#b3c5d2',0,0,z);
const glass=new T.MeshPhysicalMaterial({color:'#70bdd0',transparent:true,opacity:.23,roughness:.15,metalness:.1,side:T.DoubleSide});
for(const [z,d] of [[-5.5,5],[5,6]]){const m=new T.Mesh(new T.BoxGeometry(.12,2.7,d),glass);m.position.set(3,1.4,z);scene.add(m);obstacles.push({x:3,z,w:.45,d:d/2+.35});box(.16,2.9,.16,'#7297ab',3,1.4,z-d/2);box(.16,2.9,.16,'#7297ab',3,1.4,z+d/2);}
solid(3,1,1.1,'#204d70',-6,.5,-4.6);box(3.2,.12,1.3,'#ecf6fa',-6,1.05,-4.6);
solid(2.2,.7,1.7,'#7c95ac',8,.35,-5.8);box(2.4,.12,1.9,'#d9f5ff',8,.76,-5.8);
solid(2.4,.7,1.8,'#f2f6fa',-8,.35,5.6);
const displayGlow=box(2.5,.08,1.9,'#9bb9c9',-8,.78,5.6);
function sign(text,x,y,z,w=3){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#183e5c';ctx.fillRect(0,0,512,128);ctx.fillStyle='#e8f7ff';ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,80);const m=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),side:T.DoubleSide}));m.position.set(x,y,z);scene.add(m);}
sign('Information',-6,2.6,-7.85,4);sign('Laboratory',7,2.6,-7.85,4);sign('Science fair',-8,2.6,6.7,4);
for(const x of [-10,1,10]){solid(.9,.6,.9,'#768b9b',x,.3,-6.8);const plant=new T.Mesh(new T.IcosahedronGeometry(.7,1),new T.MeshStandardMaterial({color:'#479d85'}));plant.position.set(x,1.1,-6.8);scene.add(plant);}
for(const x of [-1,1]){solid(.7,.45,2.2,'#ec9d49',x,.25,3.6);}
function actor(name,color,x,z){const g=new T.Group();scene.add(g);g.position.set(x,0,z);
const body=box(.5,.65,.32,color,0,.85,0,g);const head=new T.Mesh(new T.SphereGeometry(.23,16,12),new T.MeshStandardMaterial({color:'#edc69e'}));head.position.y=1.43;g.add(head);box(.48,.12,.4,'#4b3d31',0,1.63,0,g);
const legs=[box(.17,.5,.2,'#394b45',-.14,.3,0,g),box(.17,.5,.2,'#394b45',.14,.3,0,g)];
const arms=[box(.13,.55,.15,color,-.35,.87,0,g),box(.13,.55,.15,color,.35,.87,0,g)];
return {name,g,body,legs,arms};}
const player=actor('你','#edab4d',-7,6.5),nova=actor('Nova','#4ca9a5',-6,7);
const npcs={nova};
for(const [id,n] of Object.entries(campusPeople))npcs[id]=actor(n.name,id==='mia'?'#547bd2':id==='ben'?'#e0edf4':'#90b9ce',n.x,n.z);
const bag=new T.Group();
box(.65,.55,.45,'#eef5fa',0,.65,0,bag);box(.5,.25,.4,'#edfaff',0,1.08,0,bag);
box(.34,.08,.08,'#27aaf4',0,1.08,.23,bag);box(.15,.3,.2,'#4c637a',-.2,.22,0,bag);box(.15,.3,.2,'#4c637a',.2,.22,0,bag);
scene.add(bag);bag.visible=false;
let noteNpc=null,speakingNpc=null;
for(const [id,a] of Object.entries(npcs)){const b=document.createElement('button');b.className='actor-label';b.textContent=a.name;b.disabled=true;$('labels').append(b);a.label=b;b.onclick=()=>{if(!active||turn)return;if(id==='nova'){show(campusHint(s),'nova');return;}if(campusMarker(s,id)==='text'||campusMarker(s,id)==='done'){openNote(id);return;}if(near===id)talk();else walkTo(new T.Vector3(a.g.position.x,0,a.g.position.z+1.2));};}
const bagLabel=document.createElement('button');bagLabel.className='actor-label';bagLabel.textContent='领取设备';bagLabel.hidden=true;$('labels').append(bagLabel);bagLabel.onclick=()=>{if(distance(player.g.position,new T.Vector3(devicePoint.x,0,devicePoint.z))<1.6)pickup();else walkTo(new T.Vector3(8,0,-4.2));};
function distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
function allowed(x,z){return x>-11.4&&x<11.4&&z>-7.3&&z<7.3&&!obstacles.some(o=>Math.abs(x-o.x)<o.w&&Math.abs(z-o.z)<o.d);}
function levelAct(state,id,type,text=''){return campusAct(state,id,type,text,player.g.position);}
function moveTo(v,dt){const p=player.g.position,dx=v.x-p.x,dz=v.z-p.z,len=Math.hypot(dx,dz);if(len<.05)return false;const step=Math.min(len,dt*3);const x=p.x+dx/len*step,z=p.z+dz/len*step;if(allowed(x,p.z))p.x=x;if(allowed(p.x,z))p.z=z;player.g.rotation.y=Math.atan2(dx,dz);return true;}
let uiSignature='';
function update(){near=Object.entries(npcs).filter(([id])=>id!=='nova').find(([,a])=>distance(player.g.position,a.g.position)<2.3)?.[0]||null;
const signature=JSON.stringify([near,active,!!turn,s,speakingNpc,distance(player.g.position,new T.Vector3(devicePoint.x,0,devicePoint.z))<1.6]);if(signature===uiSignature)return;uiSignature=signature;
$('cancel-voice').hidden=!turn;
$('person').textContent=s.complete?'委托完成':near?npcs[near].name:'探索校园';
$('talk').disabled=!active||!near||s.complete||campusMarker(s,near)!=='ask';$('coach').disabled=!active||!!turn;
$('talk').textContent=turn?'■ 说完了':!(s.stage!=='brief')&&near==='mia'?'? 听取任务':'🎙 开口交流';
$('pickup').hidden=!(active&&s.stage==='pickup'&&s.discovered&&distance(player.g.position,new T.Vector3(devicePoint.x,0,devicePoint.z))<1.6);
$('deliver').hidden=!(near==='mia'&&s.stage==='handover'&&s.owner==='student');
$('status').textContent=s.complete?'科技展已启动':s.owner==='student'?'你正在携带设备':s.discovered&&s.stage==='pickup'?'发现可领取设备':'听取信息，自主探索';
const count=s.draft?Object.keys(s.draft.values).length:0;$('phase').textContent=s.draft?'已记住 '+count+' 项信息 · 可继续补充':'';
for(const [id,a] of Object.entries(npcs)){a.label.disabled=!active;const mode=campusMarker(s,id),marker=speakingNpc===id?' …':({ask:' ❓',text:' ▤',done:' ✓',coach:' 💡',idle:''})[mode];a.label.textContent=a.name+marker;a.label.setAttribute('aria-label',a.name+' · '+({ask:'当前任务',text:'查看任务文本',done:'已完成',coach:'问教练',idle:'暂未开放'})[mode]);a.label.classList.toggle('near',near===id);}
}
async function speak(text,slow=false,id=null){speakingNpc=null;update();if(textMode)return;const token=++speechToken;speechSynthesis.cancel();const voices=await loadVoices(speechSynthesis,2000,v=>!!chooseVoice(v,voice));if(token!==speechToken)return;const v=chooseVoice(voices,voice);if(!v){$('audio-status').textContent='所选音色不可用，请选择可用音色。';$('hint').textContent='所选音色不可用，请在右上角音色设置中选择。';return;}const u=new SpeechSynthesisUtterance(text);u.voice=v;u.lang=v.lang;u.rate=slow?rate*.8:rate;u.onstart=()=>{if(token===speechToken){speakingNpc=id;update();}};const ended=()=>{if(token===speechToken){speakingNpc=null;update();}};u.onend=ended;u.onerror=ended;speechSynthesis.speak(u);}
function closeNote(){noteNpc=null;$('npc-note').hidden=true;}
function openNote(id){const r=replies[id];if(!r)return;noteNpc=id;$('note-name').textContent=npcs[id].name+' · 当前记录';$('note-en').textContent=r.en;$('note-zh').textContent=r.zh;$('npc-note').hidden=false;}
$('note-close').onclick=closeNote;
$('note-replay').onclick=()=>{if(noteNpc&&replies[noteNpc])speak(replies[noteNpc].en);};
$('note-slow').onclick=()=>{if(noteNpc&&replies[noteNpc])speak(replies[noteNpc].en,true);};
function show(r,id=null){if(!r)return;last=r;if(id){replies[id]=r;if(noteNpc===id)openNote(id);}$('line').textContent=r.en;$('zh').textContent=r.zh;$('replay').disabled=false;$('slow').disabled=false;speak(r.en,false,id);update();}
function submit(text){if(!near||!active||s.complete||campusMarker(s,near)!=='ask')return;closeNote();const id=near;$('raw').textContent='原始输入：'+text;show(levelAct(s,id,'say',text),id);update();}
function finishVoice(){if(turn)turn.stop();}
async function talk(){if(!active||!near||s.complete)return;if(turn){finishVoice();return;}dest=null;
if(campusMarker(s,near)!=='ask'){openNote(near);return;}closeNote();
if(s.stage==='brief'&&near==='mia'){show(levelAct(s,'mia','mission'),'mia');return;}
speechToken++;speakingNpc=null;speechSynthesis.cancel();const target=near;const opts={createVAD:createBrowserVAD,scene:'campus-level-one',onUpdate:r=>{$('hint').textContent=({preparing:'正在准备麦克风…',listening:'正在听，请说英语…',waiting:'正在听，停顿两秒后结束',finalizing:'正在识别…'})[r.phase]||'正在听…';},onComplete:r=>{turn=null;$('hint').textContent='识别完成，可继续交流';if(near===target)submit(r.text);if(r.audioWav){if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(new Blob([r.audioWav],{type:'audio/wav'}));$('recording').src=audioUrl;$('recording').hidden=false;}update();},onError:()=>{turn=null;$('hint').textContent='语音未完成，请重试，或展开文字帮助。';update();}};
turn=location.port==='4174'?createLocalVoiceTurn(opts):createVoiceTurn({...opts,Recognition:window.SpeechRecognition||window.webkitSpeechRecognition});update();await turn.start();}
function pickup(){if(!active||s.stage!=='pickup'||!s.discovered||distance(player.g.position,new T.Vector3(devicePoint.x,0,devicePoint.z))>=1.6)return;levelAct(s,'device','pickup');update();}
$('cancel-voice').onclick=()=>{turn?.abort();turn=null;keys.clear();$('hint').textContent='已取消，任务进度保留。';update();};
$('pickup').onclick=pickup;$('talk').onclick=talk;
$('deliver').onclick=()=>{if(near!=='mia')return;show(levelAct(s,'mia','deliver'),'mia');if(s.complete){keys.clear();dest=null;setTimeout(()=>$('win').showModal(),1400);}update();};
$('coach').onclick=()=>show(campusHint(s));$('replay').onclick=()=>{const r=replies[near]||last;if(r)speak(r.en);};$('slow').onclick=()=>{const r=replies[near]||last;if(r)speak(r.en,true);};
$('typing').onsubmit=e=>{e.preventDefault();if(turn)return;const input=e.target.querySelector('input');submit(input.value);input.value='';};
$('sample').onclick=()=>speak('Hello! I am Nova. Let us explore the campus together.');
$('thanks').onclick=()=>last&&speak(last.en);$('restart').onclick=()=>location.reload();
function voices(){const vs=englishVoices(speechSynthesis.getVoices()),selected=chooseVoice(vs,voice);$('voice').replaceChildren(...vs.map(v=>{const o=new Option(v.name,voiceKey(v));o.selected=v===selected;return o;}));if(!selected){const o=new Option('请选择可用音色','',true,true);$('voice').prepend(o);}}
speechSynthesis.addEventListener('voiceschanged',voices);voices();
$('voice').onchange=()=>{voice=$('voice').value;try{localStorage.setItem('campus-voice',voice);}catch{}};
$('rate').onchange=()=>{rate=Number($('rate').value);try{localStorage.setItem('campus-speech-rate',rate);}catch{}};
$('settings').onclick=()=>{speechToken++;speakingNpc=null;speechSynthesis.cancel();closeNote();if(turn){turn.abort();turn=null;}active=false;keys.clear();$('welcome').showModal();update();};
$('welcome').removeAttribute('open');$('welcome').showModal();
$('begin').onclick=()=>{if(!$('voice').value){$('audio-status').textContent='请先选择音色，或使用文字体验。';return;}textMode=false;active=true;$('welcome').close();show(campusHint(s));update();};
$('text-begin').onclick=()=>{textMode=true;active=true;$('welcome').close();show(campusHint(s));document.querySelector('#dock details').open=true;update();};
for(const word of ['robot','blue light','information desk','laboratory','battery check','science fair','bring back']){const b=document.createElement('button');b.textContent='🔊 '+word;b.onclick=()=>speak(word);$('words').append(b);}
const ray=new T.Raycaster(),pointer=new T.Vector2();
renderer.domElement.onclick=e=>{if(!active||turn)return;closeNote();const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObject(floor)[0];if(hit)walkTo(hit.point.clone());};
addEventListener('keydown',e=>{if(!active||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e'&&!e.repeat)talk();});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());
addEventListener('pagehide',()=>{turn?.abort();speechSynthesis.cancel();if(audioUrl)URL.revokeObjectURL(audioUrl);});
function resize(){const w=stage.clientWidth,h=stage.clientHeight,aspect=w/h;const half=Math.max(10,15/aspect);camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();renderer.setSize(w,h);}
new ResizeObserver(resize).observe(stage);
function label(el,pos){const v=pos.clone().project(camera);el.style.left=(v.x*.5+.5)*stage.clientWidth+'px';el.style.top=(-v.y*.5+.5)*stage.clientHeight+'px';}
let route=[];
function walkTo(target){
 closeNote();const size=.5,toCell=v=>[Math.round((v.x+11)/size),Math.round((v.z+7)/size)],key=c=>c.join(','),point=c=>new T.Vector3(c[0]*size-11,0,c[1]*size-7);
 const start=toCell(player.g.position),goal=toCell(target);if(!allowed(point(goal).x,point(goal).z))return;
 const q=[start],seen=new Map([[key(start),null]]);let found=false;
 for(let i=0;i<q.length&&i<1600;i++){const c=q[i];if(key(c)===key(goal)){found=true;break;}for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=[c[0]+dx,c[1]+dz],p=point(n);if(!seen.has(key(n))&&allowed(p.x,p.z)){seen.set(key(n),c);q.push(n);}}}
 if(!found){$('hint').textContent='这里无法通行，请选择附近的空地。';return;}
 route=[];let c=goal;while(key(c)!==key(start)){route.unshift(point(c));c=seen.get(key(c));}dest=route.shift()||target;
}
let before=0;renderer.setAnimationLoop(ms=>{const dt=Math.min((ms-before)/1000||.016,.05);before=ms;let walking=false;
if(active&&!s.complete&&!turn&&!noteNpc){let x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),z=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));if(x||z){dest=null;route=[];walking=moveTo(player.g.position.clone().add(new T.Vector3(x,0,z)),dt);}else if(dest){walking=moveTo(dest,dt);if(distance(player.g.position,dest)<.08)dest=route.shift()||null;}}
if(near)npcs[near].g.rotation.y=Math.atan2(player.g.position.x-npcs[near].g.position.x,player.g.position.z-npcs[near].g.position.z);
for(const [id,a] of Object.entries(npcs))a.arms.forEach((arm,i)=>arm.rotation.x=speakingNpc===id?Math.sin(ms*.006+i)*.2:0);
player.legs.forEach((l,i)=>l.rotation.x=walking?Math.sin(ms*.012+i*Math.PI)*.45:0);
const np=player.g.position.clone().add(new T.Vector3(-.8,0,.8));if(distance(nova.g.position,np)>1){nova.g.position.lerp(np,Math.min(1,dt*2));nova.g.rotation.y=player.g.rotation.y;}
if(noteNpc){const v=npcs[noteNpc].g.position.clone().add(new T.Vector3(0,2,0)).project(camera),el=$('npc-note');el.style.left=Math.max(8,Math.min(stage.clientWidth-el.offsetWidth-8,(v.x*.5+.5)*stage.clientWidth+18))+'px';el.style.top=Math.max(8,Math.min(stage.clientHeight-el.offsetHeight-8,(-v.y*.5+.5)*stage.clientHeight))+'px';}
for(const a of Object.values(npcs))label(a.label,a.g.position.clone().add(new T.Vector3(0,2,0)));
if(s.stage==='pickup'&&!s.discovered)levelAct(s,'device','discover');
bag.visible=s.discovered||s.owner==='display';
if(s.owner==='student')bag.position.copy(player.g.position).add(new T.Vector3(.5,.2,0));
else if(s.owner==='display')bag.position.set(-8,.85,5.6);
else bag.position.set(devicePoint.x,.85,devicePoint.z);
displayGlow.material.color.set(s.complete?'#40e4d2':'#9bb9c9');
if(s.complete){displayGlow.material.emissive.set('#1b8377');displayGlow.material.emissiveIntensity=.6;}
bagLabel.hidden=!(active&&s.stage==='pickup'&&s.discovered);label(bagLabel,new T.Vector3(devicePoint.x,2.5,devicePoint.z));
update();renderer.render(scene,camera);});

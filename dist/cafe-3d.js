import * as T from './vendor/three/three.module.js';
import {cafeState,cafeAct,cafeHint,cafeMarker} from './cafe-game.js?v=2';
import {createLocalVoiceTurn} from './local-voice-turn.js';
import {createVoiceTurn} from './voice-turn.js';
import {createBrowserVAD} from './vad-loader.js';
import {englishVoices,chooseVoice,voiceKey,loadVoices} from './speech.js';
const $=id=>document.getElementById(id),stage=$('stage'),s=cafeState(),keys=new Set(),replies={};
let textMode=false,active=false,near=null,dest=null,turn=null,last=null,audioUrl=null,voice='',rate=.85,speechToken=0;
try{voice=localStorage.getItem('campus-voice')||'';rate=Number(localStorage.getItem('campus-speech-rate'))||.85;}catch{}
$('rate').value=String(rate).replace(/^0\./,'.');
const scene=new T.Scene();scene.background=new T.Color('#e5e8d8');
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;stage.append(renderer.domElement);
const camera=new T.OrthographicCamera(-9,9,7,-7,.1,100);camera.position.set(9,13,15);camera.lookAt(0,0,0);
scene.add(new T.HemisphereLight(0xfff7df,0x728770,2.3));const sun=new T.DirectionalLight(0xffe7bd,3);sun.position.set(-4,9,5);sun.castShadow=true;scene.add(sun);
function box(w,h,d,color,x,y,z,parent=scene){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.8}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const floor=box(14,.18,10,'#d9c6a1',0,-.1,0);
box(14,2.6,.15,'#6b8971',0,1.2,-5);box(.15,2.6,10,'#9faf8c',-7,1.2,0);
for(let i=-6;i<7;i++)box(.025,.01,10,'#b7a88b',i,.005,0);
box(4,1.1,1,'#285544',3,.55,-2.8);box(4.3,.14,1.2,'#e8dfbd',3,1.15,-2.8);
for(const x of [-4,-1]){box(1.6,.12,1.4,'#eddfb7',x,.8,-2.3);box(.15,.8,.15,'#8f7859',x,.4,-2.3);for(const z of [-3.5,-1.1]){box(.65,.1,.65,'#b77855',x,.48,z);box(.65,.7,.12,'#b77855',x,.8,z+(z<-2?-.3:.3));}}
for(const x of [-6,6]){box(.7,.7,.7,'#c68d68',x,.35,-4);const crown=new T.Mesh(new T.IcosahedronGeometry(.8,1),new T.MeshStandardMaterial({color:'#608857'}));crown.position.set(x,1.3,-4);scene.add(crown);}
function actor(name,color,x,z){const g=new T.Group();scene.add(g);g.position.set(x,0,z);
const body=box(.5,.65,.32,color,0,.85,0,g);const head=new T.Mesh(new T.SphereGeometry(.23,16,12),new T.MeshStandardMaterial({color:'#edc69e'}));head.position.y=1.43;g.add(head);box(.48,.12,.4,'#4b3d31',0,1.63,0,g);
const legs=[box(.17,.5,.2,'#394b45',-.14,.3,0,g),box(.17,.5,.2,'#394b45',.14,.3,0,g)];
const arms=[box(.13,.55,.15,color,-.35,.87,0,g),box(.13,.55,.15,color,.35,.87,0,g)];
return {name,g,body,legs,arms};}
const player=actor('你','#e5b348',-3,3),nova=actor('Nova','#85a8ac',-4,3.6),lily=actor('Lily','#ce8064',-4,.5),waiter=actor('Waiter','#f6efe1',3,-4);
const bag=new T.Group();box(.45,.55,.3,'#bc8e53',0,.28,0,bag);const handle=new T.Mesh(new T.TorusGeometry(.14,.025,6,16,Math.PI),new T.MeshStandardMaterial({color:'#72583d'}));handle.position.y=.57;bag.add(handle);scene.add(bag);bag.visible=false;
const npcs={lily,waiter,nova};
let noteNpc=null,speakingNpc=null;
for(const [id,a] of Object.entries(npcs)){const b=document.createElement('button');b.className='actor-label';b.textContent=a.name;b.disabled=true;$('labels').append(b);a.label=b;b.onclick=()=>{if(!active||turn)return;if(id==='nova'){show(cafeHint(s));return;}if(cafeMarker(s,id)==='text'||cafeMarker(s,id)==='done'){openNote(id);return;}if(near===id)talk();else dest=new T.Vector3(a.g.position.x,0,id==='waiter'?-1.5:a.g.position.z+1.1);};}
const bagLabel=document.createElement('button');bagLabel.className='actor-label';bagLabel.textContent='📦 拿取';bagLabel.hidden=true;$('labels').append(bagLabel);bagLabel.onclick=pickup;
function distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
function allowed(x,z){return x>-6.5&&x<6.5&&z>-4.5&&z<4.5&&!(x>.65&&x<5.35&&z>-3.6&&z<-2)&&!([-4,-1].some(tx=>Math.abs(x-tx)<1.1&&Math.abs(z+2.3)<1.05));}
function moveTo(v,dt){const p=player.g.position,dx=v.x-p.x,dz=v.z-p.z,len=Math.hypot(dx,dz);if(len<.05)return false;const step=Math.min(len,dt*3);const x=p.x+dx/len*step,z=p.z+dz/len*step;if(allowed(x,p.z))p.x=x;if(allowed(p.x,z))p.z=z;player.g.rotation.y=Math.atan2(dx,dz);return true;}
let uiSignature='';
function update(){near=Object.entries(npcs).filter(([id])=>id!=='nova').find(([,a])=>distance(player.g.position,a.g.position)<(a===waiter?2.8:1.8))?.[0]||null;
const signature=JSON.stringify([near,active,!!turn,s,speakingNpc,distance(player.g.position,new T.Vector3(3,0,-1.6))<1.6]);if(signature===uiSignature)return;uiSignature=signature;
$('person').textContent=s.complete?'委托完成':near?npcs[near].name:'探索餐厅';
$('talk').disabled=!active||!near||s.complete||cafeMarker(s,near)!=='ask';$('coach').disabled=!active||!!turn;
$('talk').textContent=turn?'■ 说完了':!s.started&&near==='lily'?'? 听取任务':'🎙 开口交流';
$('pickup').hidden=!(active&&s.owner==='counter'&&distance(player.g.position,new T.Vector3(3,0,-1.6))<1.6);
$('deliver').hidden=!(near==='lily'&&s.reported&&s.owner==='student');
$('status').textContent=s.complete?'🏆 午餐已交付':s.owner==='student'?'📦 你正带着午餐':s.owner==='counter'?'📦 柜台上有待领取的餐袋':s.started?'🎧 听取信息，亲自交流':'先去听听 Lily 的委托';
const count=s.draft?Object.keys(s.draft.values).length:0;$('phase').textContent=s.draft?'已记住 '+count+' 项信息 · 可继续补充':'';
for(const [id,a] of Object.entries(npcs)){a.label.disabled=!active;const mode=cafeMarker(s,id),marker=speakingNpc===id?' …':({ask:' ❓',text:' ▤',done:' ✓',coach:' 💡',idle:''})[mode];a.label.textContent=a.name+marker;a.label.setAttribute('aria-label',a.name+' · '+({ask:'当前任务',text:'查看任务文本',done:'已完成',coach:'问教练',idle:'暂未开放'})[mode]);a.label.classList.toggle('near',near===id);}
}
async function speak(text,slow=false){if(textMode)return;const token=++speechToken;speechSynthesis.cancel();const voices=await loadVoices(speechSynthesis,2000,v=>!!chooseVoice(v,voice));if(token!==speechToken)return;const v=chooseVoice(voices,voice);if(!v){$('audio-status').textContent='所选音色不可用，请选择可用音色。';$('hint').textContent='所选音色不可用，请在右上角音色设置中选择。';return;}const u=new SpeechSynthesisUtterance(text);u.voice=v;u.lang=v.lang;u.rate=slow?rate*.8:rate;speechSynthesis.speak(u);}
function closeNote(){noteNpc=null;$('npc-note').hidden=true;}
function openNote(id){const r=replies[id];if(!r)return;noteNpc=id;$('note-name').textContent=npcs[id].name+' · 当前记录';$('note-en').textContent=r.en;$('note-zh').textContent=r.zh;$('npc-note').hidden=false;}
$('note-close').onclick=closeNote;
$('note-replay').onclick=()=>{if(noteNpc&&replies[noteNpc])speak(replies[noteNpc].en);};
$('note-slow').onclick=()=>{if(noteNpc&&replies[noteNpc])speak(replies[noteNpc].en,true);};
function show(r,id=null){if(!r)return;last=r;if(id){replies[id]=r;if(noteNpc===id)openNote(id);}$('line').textContent=r.en;$('zh').textContent=r.zh;$('replay').disabled=false;$('slow').disabled=false;speak(r.en);update();}
function submit(text){if(!near||!active||s.complete||cafeMarker(s,near)!=='ask')return;closeNote();const id=near;$('raw').textContent='原始输入：'+text;show(cafeAct(s,id,'say',text),id);update();}
function finishVoice(){if(turn)turn.stop();}
async function talk(){if(!active||!near||s.complete)return;if(turn){finishVoice();return;}dest=null;
if(cafeMarker(s,near)!=='ask'){openNote(near);return;}closeNote();
if(!s.started&&near==='lily'){show(cafeAct(s,'lily','mission'),'lily');return;}
speechToken++;speechSynthesis.cancel();const target=near;const opts={createVAD:createBrowserVAD,scene:'restaurant',onUpdate:r=>{$('hint').textContent=({preparing:'正在准备麦克风…',listening:'正在听，请说英语…',waiting:'正在听，停顿两秒后结束',finalizing:'正在识别…'})[r.phase]||'正在听…';},onComplete:r=>{turn=null;$('hint').textContent='识别完成，可继续交流';if(near===target)submit(r.text);if(r.audioWav){if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(new Blob([r.audioWav],{type:'audio/wav'}));$('recording').src=audioUrl;$('recording').hidden=false;}update();},onError:()=>{turn=null;$('hint').textContent='语音未完成，请重试，或展开文字帮助。';update();}};
turn=location.port==='4174'?createLocalVoiceTurn(opts):createVoiceTurn({...opts,Recognition:window.SpeechRecognition||window.webkitSpeechRecognition});update();await turn.start();}
function pickup(){if(!active||s.owner!=='counter'||distance(player.g.position,new T.Vector3(3,0,-1.6))>=1.6)return;cafeAct(s,'bag','pickup');update();}
$('pickup').onclick=pickup;$('talk').onclick=talk;
$('deliver').onclick=()=>{if(near!=='lily')return;show(cafeAct(s,'lily','deliver'),'lily');if(s.complete){active=false;keys.clear();$('win').showModal();}update();};
$('coach').onclick=()=>show(cafeHint(s));$('replay').onclick=()=>{const r=replies[near]||last;if(r)speak(r.en);};$('slow').onclick=()=>{const r=replies[near]||last;if(r)speak(r.en,true);};
$('typing').onsubmit=e=>{e.preventDefault();if(turn)return;const input=e.target.querySelector('input');submit(input.value);input.value='';};
$('sample').onclick=()=>speak('Hello! I am Nova. Let us explore the cafe together.');
$('thanks').onclick=()=>last&&speak(last.en);$('restart').onclick=()=>location.reload();
function voices(){const vs=englishVoices(speechSynthesis.getVoices()),selected=chooseVoice(vs,voice);$('voice').replaceChildren(...vs.map(v=>{const o=new Option(v.name,voiceKey(v));o.selected=v===selected;return o;}));if(!selected){const o=new Option('请选择可用音色','',true,true);$('voice').prepend(o);}}
speechSynthesis.addEventListener('voiceschanged',voices);voices();
$('voice').onchange=()=>{voice=$('voice').value;try{localStorage.setItem('campus-voice',voice);}catch{}};
$('rate').onchange=()=>{rate=Number($('rate').value);try{localStorage.setItem('campus-speech-rate',rate);}catch{}};
$('settings').onclick=()=>{if(turn){turn.abort();turn=null;}active=false;keys.clear();$('welcome').showModal();update();};
$('welcome').removeAttribute('open');$('welcome').showModal();
$('begin').onclick=()=>{if(!$('voice').value){$('audio-status').textContent='请先选择音色，或使用文字体验。';return;}textMode=false;active=true;$('welcome').close();show(cafeHint(s));update();};
$('text-begin').onclick=()=>{textMode=true;active=true;$('welcome').close();show(cafeHint(s));document.querySelector('#dock details').open=true;update();};
for(const word of ['menu','sandwich','sold out','instead','without','bring back']){const b=document.createElement('button');b.textContent='🔊 '+word;b.onclick=()=>speak(word);$('words').append(b);}
const ray=new T.Raycaster(),pointer=new T.Vector2();
renderer.domElement.onclick=e=>{if(!active||turn)return;closeNote();const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObject(floor)[0];if(hit)dest=hit.point.clone();};
addEventListener('keydown',e=>{if(!active||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e'&&!e.repeat)talk();});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>keys.clear());
addEventListener('pagehide',()=>{turn?.abort();speechSynthesis.cancel();if(audioUrl)URL.revokeObjectURL(audioUrl);});
function resize(){const w=stage.clientWidth,h=stage.clientHeight,aspect=w/h;const half=Math.max(5.8,8.8/aspect);camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();renderer.setSize(w,h);}
new ResizeObserver(resize).observe(stage);
function label(el,pos){const v=pos.clone().project(camera);el.style.left=(v.x*.5+.5)*stage.clientWidth+'px';el.style.top=(-v.y*.5+.5)*stage.clientHeight+'px';}
let before=0;renderer.setAnimationLoop(ms=>{const dt=Math.min((ms-before)/1000||.016,.05);before=ms;let walking=false;
if(active&&!turn&&!noteNpc){let x=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),z=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));if(x||z){dest=null;walking=moveTo(player.g.position.clone().add(new T.Vector3(x,0,z)),dt);}else if(dest){walking=moveTo(dest,dt);if(distance(player.g.position,dest)<.08)dest=null;}}
if(near)npcs[near].g.rotation.y=Math.atan2(player.g.position.x-npcs[near].g.position.x,player.g.position.z-npcs[near].g.position.z);
player.legs.forEach((l,i)=>l.rotation.x=walking?Math.sin(ms*.012+i*Math.PI)*.45:0);
const np=player.g.position.clone().add(new T.Vector3(-.8,0,.8));if(distance(nova.g.position,np)>1){nova.g.position.lerp(np,Math.min(1,dt*2));nova.g.rotation.y=player.g.rotation.y;}
if(noteNpc){const v=npcs[noteNpc].g.position.clone().add(new T.Vector3(0,2,0)).project(camera),el=$('npc-note');el.style.left=Math.max(8,Math.min(stage.clientWidth-el.offsetWidth-8,(v.x*.5+.5)*stage.clientWidth+18))+'px';el.style.top=Math.max(8,Math.min(stage.clientHeight-el.offsetHeight-8,(-v.y*.5+.5)*stage.clientHeight))+'px';}
for(const a of Object.values(npcs))label(a.label,a.g.position.clone().add(new T.Vector3(0,2,0)));
bag.visible=!!s.owner;if(s.owner==='counter')bag.position.set(3,1.24,-2.6);else if(s.owner==='student')bag.position.copy(player.g.position).add(new T.Vector3(.45,.65,0));else if(s.owner==='lily')bag.position.copy(lily.g.position).add(new T.Vector3(.4,.65,0));
bagLabel.hidden=!(active&&s.owner==='counter');label(bagLabel,new T.Vector3(3,1.9,-2.6));
update();renderer.render(scene,camera);});

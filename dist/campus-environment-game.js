import {createExhibit} from './campus-exhibit.js?v=25d';
import * as T from './vendor/three/three.module.js';
import {campusState,campusAct,campusMarker,campusHint,thanks} from './campus-level.js?v=range-35';
import {environmentLayout as layout} from './campus-environment-layout.js?v=range-35';
import {createLocalVoiceTurn} from './local-voice-turn.js?v=campus-silence-3';
import {createVoiceTurn} from './voice-turn.js';
import {createBrowserVAD} from './vad-loader.js';
import {englishVoices,chooseVoice,voiceKey,loadVoices} from './speech.js';
export function createEnvironmentGame(scene,camera,setPlaying,actor=camera,clearLine=()=>true){
 const encountered=new Set(),mapNodes=new Map();
 const s=campusState(),root=document.createElement('section');root.id='quest-ui';
 root.innerHTML=`<div id="quest-labels"></div><div id="quest-controls" hidden><button id="quest-coach">问教练</button><button id="quest-settings">音色 / 语速</button><button id="quest-action" hidden></button><span id="quest-status" role="status"></span></div>
 <aside id="quest-note" hidden><button id="quest-close" aria-label="关闭对话">×</button><b id="quest-person"></b><div><button id="quest-replay">🔊 再听一次</button><button id="quest-slow">慢速听</button><button id="quest-talk">🎙 继续交流</button><button id="quest-cancel" hidden>取消录音</button></div><p id="quest-voice-status" role="status"></p><details id="quest-help"><summary>文字辅助</summary><p id="quest-en" lang="en"></p><details><summary>中文提示</summary><p id="quest-zh"></p></details><p id="quest-raw"></p><form id="quest-form"><input id="quest-input" aria-label="英语回答" maxlength="300" autocomplete="off"><button>发送</button></form><audio id="quest-recording" controls hidden></audio></details></aside>
 <dialog id="quest-ready"><h2>先准备，再出发</h2><p>选好音色和语速，听一听语言背包。</p><label>英语音色<select id="quest-voice"></select></label><label>语速<select id="quest-rate"><option value="0.65">0.65×</option><option value="0.75">0.75×</option><option value="0.85">0.85×</option><option value="1">1×</option></select></label><div id="quest-words"></div><button id="quest-sample">试听</button><button id="quest-begin">准备好了</button><p id="quest-ready-status" role="status"></p></dialog>
 <dialog id="quest-win"><div class="quest-stars">★★★</div><h2>任务完成！</h2><p>你亲自找回了机器人，科技展可以开始了。</p><button id="quest-thanks">🔊 再听感谢</button><button id="quest-again">再玩一次</button><a href="./">返回大厅</a></dialog>`;
 document.body.append(root);const $=id=>document.getElementById('quest-'+id);
 let begun=false,running=false,selected=null,focusId=null,last=null,turn=null,token=0,audioUrl=null;
 let voice='',rate=.85;try{voice=localStorage.getItem('campus-voice')||'';rate=Number(localStorage.getItem('campus-speech-rate'))||.85;}catch{}
 $('rate').value=String(rate);
 function voices(){const list=englishVoices(speechSynthesis.getVoices()),chosen=chooseVoice(list,voice);$('voice').replaceChildren(...list.map(v=>new Option(v.name,voiceKey(v),false,v===chosen)));if(!chosen)$('voice').prepend(new Option('请选择可用英语音色（当前未找到已选音色）','',true,true));}
 speechSynthesis.addEventListener('voiceschanged',voices);voices();
 function remember(){voice=$('voice').value;rate=Number($('rate').value);try{localStorage.setItem('campus-voice',voice);localStorage.setItem('campus-speech-rate',String(rate));}catch{}}
 $('voice').onchange=$('rate').onchange=remember;
 async function speak(text,slow=false){const n=++token;voiceState();const speaker=selected;speechSynthesis.cancel();const list=await loadVoices(speechSynthesis,2000);if(n!==token)return;const v=chooseVoice(list,voice);if(!v){$('voice-status').textContent='音色尚不可用，请在音色设置中重选。';return;}const u=new SpeechSynthesisUtterance(text);u.voice=v;u.lang=v.lang;u.rate=slow?rate*.8:rate;u.onstart=()=>{if(n===token)voiceState('speaking',speaker);};u.onend=u.onerror=()=>{if(n===token)voiceState('idle',speaker);};speechSynthesis.speak(u);}
 function voiceState(state='idle',id=selected){dispatchEvent(new CustomEvent('campus-voice-state',{detail:{id,state}}));}
 function cancel(){voiceState();$('voice-status').textContent='';const pending=turn;turn=null;pending?.abort();$('cancel').hidden=true;$('talk').textContent='🎙 继续交流';}
 function close(){cancel();++token;speechSynthesis.cancel();$('note').hidden=true;selected=null;focusId=null;root.dataset.conversing='false';}
 function adapt(r){if(r?.en.includes('Go through the glass doorway'))return {en:'Yes, the robot was moved to the laboratory display on the right side of the science centre for a battery check. Ask Leo there.',zh:'机器人被移到科学中心右侧实验展示区检查电池了，去那里问 Leo。'};return r;}
 function show(r,id){if(!r)return;$('status').textContent='';last=adapt(r);selected=id;root.dataset.conversing='true';$('replay').disabled=$('slow').disabled=false;$('person').textContent=id==='nova'?'Alex · 机器狗教练':layout.people[id]?.name||'科技展';$('en').textContent=last.en;$('zh').textContent=last.zh;$('help').open=false;$('note').hidden=false;$('talk').hidden=id==='nova'||campusMarker(s,id)!=='ask';$('voice-status').textContent='';void speak(last.en);}
 function act(id,type,text=''){const point=id==='device'?layout.device:layout.people[id];if(point&&!clearLine(point))return null;return campusAct(s,id,type,text,actor.position,layout);}
 function hint(){let h=campusHint(s);if(s.stage==='lab-question')h={en:'Remember what Ben told you. Look on the right side of the science centre and speak to Leo.',zh:'回想 Ben 的提示，去科学中心右侧和 Leo 交流。'};show(h,'nova');}
 function submit(text){if(!selected||selected==='nova'||!running||turn)return;const id=selected;const r=act(id,'say',text);$('raw').textContent='你说：'+text;if(r){show(r,id);$('raw').textContent='你说：'+text;}else $('voice-status').textContent='请先走近当前任务人物。';}
 async function talk(){if(turn){turn.stop();return;}if(!selected||selected==='nova'||campusMarker(s,selected)!=='ask')return;const id=selected;if(Math.hypot(actor.position.x-layout.people[id].x,actor.position.z-layout.people[id].z)>layout.interactionRadius)return;
 ++token;speechSynthesis.cancel();const options={createVAD:createBrowserVAD,silenceMs:3000,scene:'campus-level-one',onUpdate:r=>{voiceState('listening',id);$('voice-status').textContent=({preparing:'准备麦克风…',listening:'请说英语',waiting:'正在听，停顿 3 秒后结束',finalizing:'正在识别…'})[r.phase]||'';},onComplete:r=>{voiceState();turn=null;$('cancel').hidden=true;$('talk').textContent='🎙 继续交流';if(selected===id)submit(r.text);if(r.audioWav){if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(new Blob([r.audioWav],{type:'audio/wav'}));$('recording').src=audioUrl;$('recording').hidden=false;}},onError:()=>{voiceState();turn=null;$('cancel').hidden=true;$('talk').textContent='🎙 再试一次';$('voice-status').textContent='录音或识别未完成，可以重试，也可展开文字辅助。';}};
 turn=location.port==='4174'?createLocalVoiceTurn(options):createVoiceTurn({...options,Recognition:window.SpeechRecognition||window.webkitSpeechRecognition});$('cancel').hidden=false;$('talk').textContent='■ 说完了';await turn.start();}
 $('talk').onclick=talk;$('cancel').onclick=cancel;$('close').onclick=close;
 $('form').onsubmit=e=>{e.preventDefault();submit($('input').value);$('input').value='';};
 $('replay').onclick=()=>last&&speak(last.en);$('slow').onclick=()=>last&&speak(last.en,true);$('coach').onclick=hint;
 $('sample').onclick=()=>{remember();void speak('Hello! I am Alex. Let us explore the science centre together.');};
 for(const word of ['robot','blue light','information desk','laboratory','battery check','science fair','bring back']){const b=document.createElement('button');b.textContent='🔊 '+word;b.onclick=()=>speak(word);$('words').append(b);}
 function settings(){cancel();++token;speechSynthesis.cancel();setPlaying(false);$('ready').showModal();}
 $('settings').onclick=settings;$('ready').addEventListener('cancel',e=>e.preventDefault());
 $('begin').onclick=()=>{remember();if(!voice){$('ready-status').textContent='英语音色仍在加载，请稍后选择。';voices();return;}$('ready').close();begun=true;setPlaying(true);$('controls').hidden=false;hint();};
 function interact(id){
   if(!running||turn)return;if(selected)close();
   if(id==='nova'){
     const coach=scene.getObjectByName('campus-coach');
     if(!coach)return;
     const position=coach.userData.interactionPosition;
     if(Math.hypot(actor.position.x-position.x,actor.position.z-position.z)>layout.interactionRadius){$('status').textContent='走近 Alex，点击机器狗交谈';return;}
     if(!clearLine(position))return;focusId=id;hint();return;
   }
   if(!layout.people[id])return;
   const p=layout.people[id],mode=campusMarker(s,id);
   if(Math.hypot(actor.position.x-p.x,actor.position.z-p.z)>layout.interactionRadius){$('status').textContent='走近 '+p.name+'，点击人物交谈';return;}
   if(!clearLine(p))return;focusId=id;encountered.add(id);
   if(id==='mia'&&s.stage==='brief'){show(act(id,'mission'),id);return;}
   if(mode==='ask'){
     selected=id;root.dataset.conversing='true';last=s.records[id]?adapt(s.records[id]):null;
     $('person').textContent=p.name;$('note').hidden=false;$('help').open=false;$('talk').hidden=false;
     $('en').textContent=last?.en||'';$('zh').textContent=last?.zh||'';$('raw').textContent='';
     $('replay').disabled=$('slow').disabled=!last;void talk();
   }else if(s.records[id]){show(s.records[id],id);$('help').open=true;}
   else show({en:'Hello! Let us finish the current task first. Your coach can help you decide what to do next.',zh:'你好，先完成当前任务吧。不清楚下一步可以问教练。'},id);
 }
 const labels={};for(const [id,p] of Object.entries(layout.people)){
   const button=document.createElement('button');button.className='quest-marker';button.onclick=()=>interact(id);$('labels').append(button);labels[id]=button;
 }
 const ns='http://www.w3.org/2000/svg',map=document.getElementById('map-svg'),mapPeople=document.createElementNS(ns,'g');mapPeople.id='map-people';map.insertBefore(mapPeople,document.getElementById('map-player'));
 for(const [id,p] of Object.entries(layout.people)){
   const group=document.createElementNS(ns,'g');group.setAttribute('transform',`translate(${p.x} ${p.z})`);group.setAttribute('role','img');group.style.display='none';
   const dot=document.createElementNS(ns,'circle');dot.setAttribute('r','1.8');dot.setAttribute('stroke','#fff');dot.setAttribute('stroke-width','.5');
   const name=document.createElementNS(ns,'text');name.setAttribute('x','2.6');name.setAttribute('y','1');name.setAttribute('font-size','3.5');name.setAttribute('fill','#fff');name.setAttribute('paint-order','stroke');name.setAttribute('stroke','#173442');name.setAttribute('stroke-width','1');name.textContent=p.name;
   group.append(dot,name);mapPeople.append(group);mapNodes.set(id,{group,dot});
 }
 const legend=document.createElement('p');legend.className='map-people-legend';legend.textContent='已遇人物：红·当前任务  蓝·已认识  绿·已完成';document.getElementById('map-body').append(legend);
 const exhibit=createExhibit(scene,camera,layout.device,actor);
 const projected=new T.Vector3();
 $('action').onclick=()=>{if(!running)return;if(s.stage==='pickup')act('device','pickup');else if(s.stage==='handover'){const r=act('mia','deliver');if(r){show(r,'mia');if(s.complete){setPlaying(false);$('note').hidden=true;$('win').showModal();}}}};
 $('thanks').onclick=()=>speak(thanks.en);$('again').onclick=()=>location.reload();
 addEventListener('pagehide',()=>{cancel();++token;speechSynthesis.cancel();if(audioUrl)URL.revokeObjectURL(audioUrl);});
 return {get movementLocked(){return turn!==null;},get focus(){
   if(!focusId||$('note').hidden)return null;
   const p=focusId==='nova'?scene.getObjectByName('campus-coach')?.userData.interactionPosition:layout.people[focusId];
   return p?{x:p.x,z:p.z,y:focusId==='nova'?.75:1.35}:null;
 },get conversing(){return selected!==null&&!$('note').hidden;},interact,closeConversation:close,begin(){if(begun)setPlaying(true);else settings();},update(active){if(running&&!active&&!s.complete)close();running=active;
   root.dataset.recording=String(turn!==null);
   if(selected&&!turn&&!s.complete){const point=selected==='nova'?scene.getObjectByName('campus-coach')?.userData.interactionPosition:layout.people[selected];if(point&&(Math.hypot(actor.position.x-point.x,actor.position.z-point.z)>4.5||!clearLine(point)))close();}
   $('controls').hidden=!begun||!active;
   for(const [id,p] of Object.entries(layout.people)){const button=labels[id],mode=campusMarker(s,id);projected.set(p.x,2.35,p.z).project(camera);const distance=Math.hypot(actor.position.x-p.x,actor.position.z-p.z);if(active&&distance<=layout.interactionRadius)encountered.add(id);const pin=mapNodes.get(id);pin.group.style.display=encountered.has(id)?'':'none';const state=mode==='ask'?'当前任务':mode==='done'||id==='ben'&&s.records.ben||id==='leo'&&['pickup','return','handover','complete'].includes(s.stage)?'已完成':'已认识';pin.dot.setAttribute('fill',state==='当前任务'?'#f16c64':state==='已完成'?'#71d5aa':'#82cafa');pin.group.setAttribute('aria-label',p.name+' · '+state);button.hidden=!active||distance>14||projected.z>1||projected.z< -1||(distance>layout.interactionRadius&&(Math.abs(projected.x)>1||Math.abs(projected.y)>1))||mode==='idle';button.style.left=Math.max(28,Math.min(innerWidth-28,(projected.x+1)*innerWidth/2))+'px';button.style.top=Math.max(108,Math.min(innerHeight-100,(-projected.y+1)*innerHeight/2))+'px';button.textContent=mode==='ask'?'?':mode==='done'?'✓':'▤';button.dataset.mode=mode;button.setAttribute('aria-label',p.name+(mode==='ask'?' 交流':' 查看对话'));}
   const d=Math.hypot(actor.position.x-layout.device.x,actor.position.z-layout.device.z);if(active&&s.stage==='pickup'&&d<2.3)act('device','discover');exhibit.update(s,performance.now());
   const canPick=s.stage==='pickup'&&s.discovered&&d<2.3,canGive=s.stage==='handover'&&Math.hypot(actor.position.x-layout.people.mia.x,actor.position.z-layout.people.mia.z)<layout.interactionRadius;$('action').hidden=!canPick&&!canGive;$('action').textContent=canPick?'领取机器人':'交给 Mia';
   if(s.owner==='student')$('status').textContent='正在携带机器人';else if(s.complete)$('status').textContent='';
 }};
}

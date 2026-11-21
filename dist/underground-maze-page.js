import {createBackpack} from './campus-backpack.js';
import {createMazeView} from './underground-maze-view.js?v=hover-1';
import {briefing, clueText, interact, advancePosition, nearby, newRun, restoreRun, tileAt, encounterTiles, maze, routeTo, rememberSurvey} from './underground-maze.js?v=hover-1';
import {chooseVoice} from './speech.js';
import {answerMazeQuestion, mazeDialogueLine, discoveries, mazeAnswers} from './underground-maze-dialogue.js';
import {createLocalVoiceTurn} from './local-voice-turn.js';
import {createVoiceTurn} from './voice-turn.js';
import {createBrowserVAD} from './vad-loader.js';

const $=id=>document.getElementById(id);
const saveKey='campus-underground-maze-v1';
let run=newRun(), voiceRequest=0, playbackTimer, bagOpen=false, speaking=false;
const discoveryQueue=[];
try{run=restoreRun(JSON.parse(localStorage.getItem(saveKey)));}catch{}
const canvas=$('maze'), view=createMazeView(canvas);
const hoverLabel=$('maze-word');
const vocabulary={S:'stairs',a:'triangle carved in stone',b:'diamond carved in stone',c:'spiral carved in stone',
 H:'hammer',T:'pressure plate',D:'dangerous pressure plate',R:'rubble',V:'valve',G:'powered gate',P:'amber prism'};
let pointer=null;
function sceneTarget(event){
 const area=canvas.getBoundingClientRect();
 return view.pick((event.clientX-area.left)*canvas.width/area.width,(event.clientY-area.top)*canvas.height/area.height);
}
function refreshHover(){
 const target=pointer&&!bagOpen&&['search','return'].includes(run.phase)?sceneTarget(pointer):null;
 const tile=target?tileAt(target.x,target.y):'';
 const removed=(tile==='H'&&run.hammer)||(tile==='R'&&run.cleared)||(tile==='P'&&run.prism);
 const word=removed?'':vocabulary[tile]||'';
 if(hoverLabel.textContent!==word)hoverLabel.textContent=word;
 hoverLabel.hidden=!word;
 canvas.style.cursor=word?'pointer':'';
}
function drawScene(){
 view.draw(run,position);
 refreshHover();
}
canvas.addEventListener('pointermove',event=>{pointer=event;refreshHover();});
canvas.addEventListener('pointerleave',()=>{pointer=null;refreshHover();});
const held=new Map();
const position={x:run.x,y:run.y};
let waypoints=[],frame=null,lastFrame=null;
function stopWalking(){
 held.clear();waypoints=[];
 if(frame!==null)cancelAnimationFrame(frame);
 frame=null;lastFrame=null;
 view.setMotion(0,0);drawScene();
}
function requestWalk(){
 if(frame===null)frame=requestAnimationFrame(animate);
}
function animate(time){
 frame=null;
 if(turn||bagOpen||run.phase!=='search'&&run.phase!=='return'){lastFrame=null;return;}
 const dt=lastFrame===null?0:Math.min(.04,(time-lastFrame)/1000);
 lastFrame=time;
 let dx=0,dy=0;
 if(held.size){
  for(const direction of held.values()){dx+=direction[0];dy+=direction[1];}
 }else if(waypoints.length){
  dx=waypoints[0].x-position.x;dy=waypoints[0].y-position.y;
 }else{lastFrame=null;view.setMotion(0,0);drawScene();return;}
 const length=Math.hypot(dx,dy);
 const distance=held.size?6.5*dt:Math.min(6.5*dt,length);
 const {x,y,resets}=run;
 const before={...position};
 if(!length)view.setMotion(0,0);
 if(length&&distance){
  const message=advancePosition(run,position,dx/length*distance,dy/length*distance);
  if(run.resets===resets&&run.phase!=='failed')view.setMotion(position.x-before.x,position.y-before.y);
  if(run.x!==x||run.y!==y||run.resets!==resets){
   commit(message);
   if(run.phase==='failed'){discoveryQueue.length=0;focusOn(null);stopVoice();stopWalking();return;}
   if(run.resets!==resets){stopWalking();discover();return;}
   discover();
  }else if(message)$('notice').textContent=message;
 }
 if(!held.size&&waypoints.length&&(length<=distance||distance&&Math.hypot(position.x-before.x,position.y-before.y)<.001))waypoints.shift();
 drawScene();
 if(held.size||waypoints.length)requestWalk();
 else{lastFrame=null;view.setMotion(0,0);drawScene();}
}

const recording=$('voice-audio'),retryVoice=$('retry-voice');
function stopVoice(){
 voiceRequest++;
 retryVoice.hidden=true;
 speaking=false;
 clearTimeout(playbackTimer);
 recording.pause();
 window.speechSynthesis?.cancel();
}
function speak(id,onFinished,textOverride,slow=false){
 stopVoice();
 speaking=true;retryVoice.hidden=true;
 const request=voiceRequest, status=bagOpen?document.getElementById('bag-audio-status'):$(id==='brief'||questions.hidden?'voice-status':'record-status'), synth=window.speechSynthesis;
 status.textContent='正在准备英语音频…';
 const text=textOverride??(id==='brief'?briefing[0]:mazeDialogueLine(id)[0]);
 let preferred='', rate=.85;
 try{
  preferred=localStorage.getItem('campus-voice')||'';
  const saved=Number(localStorage.getItem('campus-speech-rate'));
  if(saved>=.5&&saved<=2)rate=saved;
 }catch{}
 if(slow)rate*=.8;
 const show=message=>{if(request===voiceRequest)status.textContent=message;};
 function finish(played){
  if(request!==voiceRequest)return;
  clearTimeout(playbackTimer);speaking=false;
  if(!played){
   show('音频没有开始播放。');
   retryVoice.hidden=false;
   retryVoice.onclick=()=>speak(id,onFinished,textOverride,slow);
   return;
  }
  show('');onFinished?.();playDiscovery();
 }
 let usingRecording=false;
 function playRecording(){
  if(request!==voiceRequest||usingRecording)return;
  usingRecording=true;
  clearTimeout(playbackTimer);
  synth?.cancel();
  if(!id){finish(false);return;}
  recording.src='./assets/maze-audio/'+id+'.mp3';
  recording.playbackRate=rate/.85;
  recording.onplaying=()=>{clearTimeout(playbackTimer);show('正在播放英语');};
  recording.onended=()=>finish(true);
  const failed=()=>finish(false);
  recording.onerror=failed;
  playbackTimer=setTimeout(failed,3000);
  recording.play().catch(failed);
 }
 if(id==='brief'||id?.startsWith('found-')){playRecording();return;}
 const voice=synth&&chooseVoice(synth.getVoices(),preferred);
 if(!voice){playRecording();return;}
 try{
  const speech=new SpeechSynthesisUtterance(text);
  speech.voice=voice;speech.lang=voice.lang;speech.rate=rate;
  speech.onstart=()=>{if(!usingRecording&&request===voiceRequest){clearTimeout(playbackTimer);playbackTimer=setTimeout(playRecording,11000);show('正在播放英语');}};
  speech.onend=()=>{if(!usingRecording)finish(true);};
  speech.onerror=playRecording;
  playbackTimer=setTimeout(playRecording,1400);
  synth.speak(speech);
 }catch{playRecording();}
}
addEventListener('pagehide',stopVoice);

function save(){
 try{localStorage.setItem(saveKey,JSON.stringify(run));}
 catch{$('notice').textContent+=' 当前浏览器无法保存迷宫进度。';}
}
function commit(message){
 if(run.phase==='search'||run.phase==='return')rememberSurvey(run);
 $('notice').textContent=message;save();render();
}
function operate(id){
 discover();
 if(discoveries[id])focusOn(id);
 if(clueText(id))return;
 const message=interact(run,id);
 if(message!==null){commit(message);if(run.phase==='complete'){discoveryQueue.length=0;stopVoice();}}
}
const questions=$('questions');
$('ask-slot').replaceWith(questions);
let mark=null,answer='ask',turn=null,pendingQuestion=null;
function playAnswer(id){
 answer=id;
 [$('answer-en').textContent,$('answer-zh').textContent]=mazeDialogueLine(id);
 speak(id);
}
function focusOn(id){
 if(mark===id)return;
 cancelRecording();
 pendingQuestion?.abort();pendingQuestion=null;
 mark=id;
 questions.hidden=!id;
 if(!id)return;
 $('questions-title').textContent=discoveries[id][1];
 $('heard').textContent='';$('question-source').textContent='';$('question-input').value='';$('question-text').open=false;
 answer='ask';[$('answer-en').textContent,$('answer-zh').textContent]=mazeDialogueLine('ask');
}
async function submitQuestion(text){
 text=text.trim().slice(0,300);
 if(!mark||!text)return;
 const subject=mark,fallback=answerMazeQuestion(mark,text,run,answer);
 $('heard').textContent='你说：'+text;
 if(clueText(mark)&&fallback!=='clarify'&&!run.clues.includes(mark)){
  run.clues.push(mark);save();
 }
 if(location.port!=='4174'||/\b(repeat|again|slower|pardon)\b/i.test(text)){playAnswer(fallback);return;}
 pendingQuestion?.abort();
 const request=new AbortController();pendingQuestion=request;
 const timeout=setTimeout(()=>request.abort(),2600);
 const choices=Object.fromEntries(mazeAnswers(mark,run).map(id=>[id,mazeDialogueLine(id)[0]]));
 let reply=fallback,source='线索库';
 stopVoice();$('record-status').textContent='向迷宫向导提问…';
 try{
  const response=await fetch('/api/maze-reply',{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({question:text,object:discoveries[mark][0],choices}),signal:request.signal});
  if(response.ok){
   const selected=(await response.json()).id;
   if(Object.hasOwn(choices,selected)&&(selected!=='clarify'||fallback==='clarify')){reply=selected;source='本地 AI';}
  }
 }catch{}finally{clearTimeout(timeout);}
 if(pendingQuestion!==request||subject!==mark)return;
 pendingQuestion=null;
 if(clueText(mark)&&reply!=='clarify'&&!run.clues.includes(mark)){run.clues.push(mark);save();}
 $('question-source').textContent=source;
 playAnswer(reply);
}
function resetRecording(){
 turn=null;$('question-hint').textContent='按空格或点这里开口提问';
}
function cancelRecording(){
 turn?.abort();resetRecording();$('record-status').textContent='';
}
function recordQuestion(){
 if(!mark||pendingQuestion)return;
 if(turn){void turn.stop();return;}
 stopWalking();stopVoice();
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 const local=location.port==='4174';
 if(!local&&!Recognition){$('record-status').textContent='浏览器未提供语音识别，可展开文字辅助提问。';return;}
 const options={
  createVAD:createBrowserVAD,silenceMs:3000,
  onUpdate:({phase})=>{$('record-status').textContent=({preparing:'正在准备麦克风…',listening:'请用英语提问',waiting:'停顿 3 秒后提交',finalizing:'正在识别…'})[phase]||'';},
  onComplete:result=>{
   if(turn!==recordingTurn)return;
   resetRecording();
   if(result.needsReview){
    $('question-text').open=true;$('question-input').value=result.text;
    $('record-status').textContent='请核对识别文字后提问。';
   }else if(result.text.trim())void submitQuestion(result.text);
   else $('record-status').textContent='没听到问题，可以再试一次。';
  },
  onError:code=>{
   if(turn!==recordingTurn)return;
   resetRecording();
   $('record-status').textContent=code==='not-allowed'?'请允许此页面使用麦克风。':'这次没有识别到问题，可以重试或使用文字辅助。';
  }
 };
 const recordingTurn=local?createLocalVoiceTurn(options):createVoiceTurn({...options,Recognition});
 turn=recordingTurn;$('question-hint').textContent='再按空格或点这里结束录音';
 void turn.start();
}
$('question-hint').onclick=recordQuestion;
$('question-hint').onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();recordQuestion();}};
$('question-form').onsubmit=event=>{
 event.preventDefault();
 if(turn)return;
 void submitQuestion($('question-input').value);
 $('question-input').value='';
};
addEventListener('pagehide',()=>{cancelRecording();pendingQuestion?.abort();});

function playDiscovery(){
 if(speaking||turn||bagOpen||pendingQuestion||!discoveryQueue.length||!['search','return'].includes(run.phase))return;
 const id=discoveryQueue[0];
 speak('found-'+id,()=>{
  discoveryQueue.shift();
  run.announced.push(id);save();
 });
}
function discover(){
 const around=encounterTiles(run);
 const newlyFound=around.filter(id=>!run.seen.includes(id));
 focusOn(newlyFound[0]||(around.includes(mark)?mark:around[0]));
 if(newlyFound.length){
  run.seen.push(...newlyFound);
  $('notice').textContent=newlyFound.map(id=>mazeDialogueLine('found-'+id)[1]).join(' ');
  save();
 }
 for(const id of [...newlyFound,...around]){
  if(!run.announced.includes(id)&&!discoveryQueue.includes(id))discoveryQueue.push(id);
 }
 playDiscovery();
}
const backpack=createBackpack({
 getContext:()=>({
  config:{title:'地下迷宫 · 琥珀棱镜',words:[],phrases:[]},
  state:{stage:run.phase,complete:run.phase==='complete'},
  briefing:run.phase==='brief'?null:{en:briefing[0],zh:briefing[1]},
  status:run.phase==='brief'?'尚未领取委托。':'携带物品：'+$('bag').textContent,
  clues:run.clues.map(id=>({name:discoveries[id][1],en:clueText(id)[0],zh:clueText(id)[1]}))
 }),
 speak(text,slow=false){
  const id=text===briefing[0]?'brief':run.clues.find(clue=>clueText(clue)[0]===text);
  speak(id,undefined,text,slow);
 },
 pause(){bagOpen=true;stopWalking();cancelRecording();pendingQuestion?.abort();pendingQuestion=null;stopVoice();},
 resume(){bagOpen=false;playDiscovery();},
 stop:stopVoice
});
$('open-backpack').onclick=()=>backpack.open();
function renderTrail(){
 const map=$('trail'),ctx=map.getContext('2d');
 const size=map.width/maze[0].length;
 ctx.fillStyle='#0c1419';ctx.fillRect(0,0,map.width,map.height);
 for(const key of run.surveyed){
  const [x,y]=key.split(',').map(Number);
  ctx.fillStyle=tileAt(x,y)==='#'?'#213239':'#3c5553';
  ctx.fillRect(x*size,y*size,size,size);
 }
 ctx.fillStyle='#516f65';
 for(const key of run.trail){
  const [x,y]=key.split(',').map(Number);
  ctx.fillRect(x*size+1,y*size+1,size-2,size-2);
 }
 ctx.fillStyle='#bdd4bd';ctx.fillRect(size+3,size+3,size-6,size-6);
 ctx.fillStyle='#f4cb89';ctx.beginPath();ctx.arc((run.x+.5)*size,(run.y+.5)*size,size*.31,0,Math.PI*2);ctx.fill();
}
function render(){
 drawScene();
 renderTrail();
 $('trail-panel').hidden=run.phase==='brief';
 $('intro').hidden=run.phase!=='brief';$('controls').hidden=!['search','return'].includes(run.phase);
 $('listen').hidden=$('brief-text').hidden=run.phase==='brief';
 $('goal').textContent=({brief:'在楼梯旁领取委托。',search:'找到琥珀棱镜。',return:'把棱镜带回入口楼梯。',complete:'琥珀棱镜已带回地面。',failed:'本轮探险结束。'})[run.phase];
 $('bag').textContent=[run.hammer?'锤子':'',run.prism?'琥珀棱镜':''].filter(Boolean).join('、')||'空';

 if(run.phase==='failed'&&!$('failure').open)$('failure').showModal();
 if(run.phase==='complete'&&!$('finish').open)$('finish').showModal();
}
function startRun(){
 if(run.phase!=='brief')return;
 run.phase='search';commit('提灯已点亮。');
 speak('brief');
 canvas.focus({preventScroll:true});
}
$('enter-maze').onclick=startRun;
$('listen').onclick=()=>speak('brief');
$('brief-en').textContent=briefing[0];$('brief-zh').textContent=briefing[1];
function restart(id){
 stopWalking();discoveryQueue.length=0;stopVoice();focusOn(null);$('voice-status').textContent='';
 $(id).close();run=newRun();Object.assign(position,{x:run.x,y:run.y});commit('');
}
$('replay').onclick=()=>restart('finish');
$('retry').onclick=()=>restart('failure');
for(const id of ['finish','failure'])$(id).addEventListener('cancel',event=>event.preventDefault());
const directions={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]};
addEventListener('keydown',event=>{
 if(bagOpen||event.target instanceof HTMLInputElement||event.target instanceof HTMLTextAreaElement)return;
 if(event.code==='Space'&&mark&&!event.repeat){event.preventDefault();recordQuestion();return;}
 if(event.key==='Escape'&&turn){cancelRecording();playDiscovery();return;}
 const direction=directions[event.key.toLowerCase()];
 if(!direction||!['brief','search','return'].includes(run.phase)||event.altKey||event.ctrlKey||event.metaKey)return;
 event.preventDefault();
 if(event.repeat)return;
 startRun();
 discover();
 waypoints=[];
 held.set(event.key.toLowerCase(),direction);
 requestWalk();
});
addEventListener('keyup',event=>held.delete(event.key.toLowerCase()));
addEventListener('blur',stopWalking);
canvas.onclick=event=>{
 const target=sceneTarget(event);
 if(turn||bagOpen||!['brief','search','return'].includes(run.phase))return;
 startRun();
 canvas.focus({preventScroll:true});
 if(!target){discover();return;}
 const dx=target.x-run.x,dy=target.y-run.y;
 const tile=tileAt(run.x+dx,run.y+dy);
 held.clear();waypoints=[];
 if(Math.abs(dx)+Math.abs(dy)<=1&&(nearby(run).some(action=>action.id===tile)||discoveries[tile]&&!['T','D'].includes(tile))){
  stopWalking();operate(tile);return;
 }
 if(!dx&&!dy)return;
 const path=Math.abs(dx)+Math.abs(dy)===1?[[dx,dy]]:routeTo(run,target);
 const point={x:run.x,y:run.y};
 waypoints=path.map(([stepX,stepY])=>{point.x+=stepX;point.y+=stepY;return {...point};});
 if(waypoints.length)requestWalk();
};
render();

if(['search','return'].includes(run.phase))focusOn(encounterTiles(run)[0]);

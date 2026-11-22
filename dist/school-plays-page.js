import {createTheatreMap,mapDestinations} from './school-plays-map.js';
import {recordedLine,retryLine} from './school-plays-audio.js';
import {drawStage} from './school-plays-stage.js';
import {plays,newPlay,currentScene,advance} from './school-plays.js';
import {chooseVoice,englishVoices,loadVoices,voiceKey} from './speech.js';
import {createVoiceTurn} from './voice-turn.js';
import {createLocalVoiceTurn} from './local-voice-turn.js';
import {createBrowserVAD} from './vad-loader.js';

const $=id=>document.getElementById(id);
const keys=Object.keys(plays);
const local=location.port==='4174';
let id=keys.includes(location.hash.slice(1))?location.hash.slice(1):keys[0];
let active=false, turn=null, generation=0;
function saved(key){try{return localStorage.getItem(key);}catch{return null;}}
function write(key,value){try{localStorage.setItem(key,value);}catch{$('status').textContent='此浏览器无法保存进度。';}}
function restore(key){
  try{
    const data=JSON.parse(saved('school-play-v1-'+key));
    if(data && Object.hasOwn(plays[key].scenes,data.stage) && Array.isArray(data.visited))return data;
  }catch{}
  return newPlay();
}
let state=restore(id);
const drawMap=createTheatreMap($('grounds'),$('map-pins'));
let onMap=!keys.includes(location.hash.slice(1)),journey=false;
function displayMap(inStory=false){
  cancel();onMap=true;journey=inStory;active=false;
  if(!inStory&&location.hash!=='#map')location.hash='map';
  render();
  $('map-title').focus({preventScroll:true});
}
function resumeHere(){
  cancel();onMap=false;active=true;render();speak(currentScene(id,state).line);
}
function travel(label){
  cancel();
  if(!advance(id,state,label,true)){render();return;}
  onMap=false;active=true;finishTurn();
}
$('to-map').onclick=()=>displayMap(active&&state.stage!=='done');
$('all-plays').onclick=()=>displayMap(false);

function save(){write('school-play-v1-'+id,JSON.stringify(state));}
const audio=$('audio');
function stopAudio(){generation++;audio.onended=null;audio.pause();window.speechSynthesis?.cancel();}
function cancel(){turn?.abort();turn=null;stopAudio();}
function button(parent,label,fn){
  const b=document.createElement('button');b.textContent=label;b.onclick=fn;parent.append(b);return b;
}
async function speak(line,sceneState=state,retry=false){
  stopAudio();
  $('caption').textContent=line;
  const seq=generation,synth=window.speechSynthesis;
  if(saved('school-play-offline')==='yes'){
    const clip=recordedLine(id,sceneState);
    const playClip=(url,text)=>{
      $('caption').textContent=text;audio.src=url;audio.playbackRate=Number($('rate').value);
      audio.play().catch(()=>{if(seq===generation)$('status').textContent='播放中断，请点重听。';});
    };
    if(retry){
      audio.onended=()=>{audio.onended=null;if(seq===generation)playClip(clip.url,clip.text);};
      playClip('./assets/school-plays-audio/retry.mp3',retryLine);
    }else playClip(clip.url,clip.text);
    return;
  }
  if(!synth){$('offline').hidden=false;$('status').textContent='浏览器未提供英语播音。';return;}
  const pref=saved('campus-voice')||'';
  const voices=await loadVoices(synth,2000,vs=>!!chooseVoice(vs,pref));
  if(seq!==generation)return;
  const voice=chooseVoice(voices,pref);
  if(!voice){$('offline').hidden=false;$('status').textContent='当前英语音色不可用，可选择离线英语音色。';return;}
  const u=new SpeechSynthesisUtterance(line);
  u.voice=voice;u.lang=voice.lang;u.rate=Number($('rate').value);
  u.onerror=()=>{if(seq===generation){$('offline').hidden=false;$('status').textContent='播音中断，可以重听或选择离线音色。';}};
  synth.speak(u);
}
function voices(){
  const vs=englishVoices(window.speechSynthesis?.getVoices()||[]);
  $('voice').replaceChildren(new Option('默认 · Google US English',''));
  for(const v of vs)$('voice').add(new Option(v.name,voiceKey(v)));
  const selected=chooseVoice(vs,saved('campus-voice')||'');
  if(selected)$('voice').value=voiceKey(selected);
  $('voice').add(new Option('离线英语 · SLT','offline'));
  if(saved('school-play-offline')==='yes')$('voice').value='offline';
}
function prop(){
  if(id==='welcome')return 'Future Campus';
  if(id==='fine')return state.stage==='joke'?'My name is …':'First day at school';
  const corrected=['fixed','late','lateWho','done'].includes(state.stage);
  const author=state.stage==='start'||state.stage==='showBook'||corrected?'Confucius':'Mencius';
  return 'Learning without thinking is of no use. — '+author;
}
function select(key){
  cancel();id=key;state=restore(id);onMap=false;journey=false;active=false;location.hash=id;$('heard').textContent='';render();
}
function render(){
  const node=currentScene(id,state);
  $('theatre-map').hidden=!onMap;$('performance').hidden=onMap;
  if(onMap){
    $('map-title').textContent=journey?plays[id].title:'开学剧场地图';
    $('map-context').textContent=journey?'剧中路线':'开学第一天';
    $('map-help').textContent=journey?(mapDestinations(id,state).length?'选择要前往的地点，继续这一幕。':'你在'+node.place+'。回到人物身边，接着演这一幕。'):'从报到处、早读教室或教室门外进入剧本。';
    $('all-plays').hidden=!journey;
    drawMap({id,state,journey,restore,open:select,go:travel,resume:resumeHere});
    return;
  }
  $('chapter-name').textContent=id==='welcome'?'七上 · 入学序章':'七上 · Unit 1';
  drawStage($('stage'),id,state,node);
  $('place').textContent=node.place;$('prop').textContent=prop();
  let role=plays[id].role;
  if(id==='pen')role=['late','lateWho','exhibit','card','done'].includes(state.stage)?'小林':'王涵';
  if(id==='fine')role=['reporter','done'].includes(state.stage)?'记者':'安';
  $('role').textContent='扮演 · '+role;$('title').textContent=plays[id].title;
  $('inventory').textContent=state.book?'携带 · 夹着蓝书签的《论语》':state.visited.map(k=>({library:'图书馆',cafe:'咖啡馆',sports:'运动区'})[k]).join('　·　');
  $('goal').textContent=node.hint;$('speaker').textContent=active?node.who:'';
  $('offline').hidden=true;
  $('status').textContent='';$('actions').replaceChildren();$('listen').hidden=!active;
  $('cancel').hidden=!turn;$('talk').hidden=!active||!node.replies.length;
  $('talk').textContent=turn?'结束录音':'开始录音';$('caption').textContent=node.line;
  if(!active){
    button($('actions'),state.stage==='start'?'进入并听取开场':'继续这一课',()=>{active=true;render();speak(node.line);});
    return;
  }
  const destinations=mapDestinations(id,state);
  for(const a of node.actions){
    if(destinations.some(d=>d.label===a.label))continue;
    button($('actions'),a.label,()=>travel(a.label));
  }
  if(destinations.length)button($('actions'),'在地图上前往下一处',()=>displayMap(true));
  if(state.stage==='done'){
    const next=keys[keys.indexOf(id)+1];
    if(next)button($('actions'),'下一课',()=>select(next));
    button($('actions'),'再演一次',()=>{cancel();state=newPlay();save();$('heard').textContent='';render();speak(currentScene(id,state).line);});
    button($('actions'),'返回剧场地图',()=>displayMap(false));
  }
}
function finishTurn(){save();render();speak(currentScene(id,state).line);}
function record(){
  if(turn){turn.stop();return;}
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!local&&!Recognition){$('status').textContent='当前浏览器没有英语语音识别，请用支持语音识别的浏览器打开。';return;}
  stopAudio();
  const options={Recognition,createVAD:createBrowserVAD,silenceMs:3000,scene:plays[id].asr,
    onUpdate:({phase})=>{$('status').textContent=({preparing:'准备麦克风…',finalizing:'识别中…',waiting:'停顿三秒后自动提交'})[phase]||'请说英语';},
    onError:code=>{if(turn!==capture)return;turn=null;render();$('status').textContent='录音未完成，可重试（'+code+'）。';},
    onComplete:result=>{
      if(turn!==capture)return;turn=null;
      $('heard').textContent='听到：'+result.text;
      if(!result.needsReview&&advance(id,state,result.text)){finishTurn();return;}
      render();$('status').textContent='请再试一次，或重听对方刚才的话。';
      speak(retryLine+' '+currentScene(id,state).line,state,true);
    }};
  const capture=local?createLocalVoiceTurn(options):createVoiceTurn(options);
  turn=capture;render();capture.start();
}
$('talk').onclick=record;
$('cancel').onclick=()=>{cancel();render();};
$('repeat').onclick=()=>{cancel();render();speak(currentScene(id,state).line);};
$('brief').onclick=()=>{cancel();render();speak(currentScene(id,newPlay()).line,newPlay());};
$('offline').onclick=()=>{write('school-play-offline','yes');voices();cancel();render();speak(currentScene(id,state).line);};
$('voice').onchange=()=>{
  const offline=$('voice').value==='offline';
  write('school-play-offline',offline?'yes':'no');
  if(!offline)write('campus-voice',$('voice').value);
  if(active){cancel();render();speak(currentScene(id,state).line);}
};
$('rate').value=saved('campus-speech-rate')||'.85';
$('rate').onchange=()=>write('campus-speech-rate',$('rate').value);
$('provider').textContent=local?'本机 Whisper small · 固定英语':'浏览器英语语音识别';
window.speechSynthesis?.addEventListener('voiceschanged',voices);
window.addEventListener('pagehide',cancel);
window.addEventListener('hashchange',()=>{const key=location.hash.slice(1);if(keys.includes(key)&&(key!==id||onMap))select(key);else if(!keys.includes(key))displayMap(false);});
voices();render();

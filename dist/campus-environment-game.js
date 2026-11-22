import {workshopBench,workshopParts} from './campus-workshop.js?v=workshop-20261118';
import {createMissionSession} from './mission-session.js?v=difficulty-1';
import {createBackpack} from './campus-backpack.js?v=bag-clues-20261118';
import {levels,readProgress,finishLevel,nextLevel} from './campus-level-catalog.js?v=difficulty-1';
import {createExhibit} from './campus-exhibit.js?v=click-pickup-1';
import * as T from './vendor/three/three.module.js';
import {createMission,missions} from './campus-missions.js?v=difficulty-1';
import {createWishTree} from './campus-wish-tree.js';
import {wishPeople} from './campus-wish.js';
import {environmentLayout} from './campus-environment-layout.js?v=workshop-20261118';
import {createLocalVoiceTurn} from './local-voice-turn.js?v=campus-silence-3';
import {createVoiceTurn} from './voice-turn.js';
import {createBrowserVAD} from './vad-loader.js';
import {englishVoices,chooseVoice,voiceKey,loadVoices} from './speech.js';
export function createEnvironmentGame(scene,camera,setPlaying,actor=camera,clearLine=()=>true){
 const layout={...environmentLayout,people:{...environmentLayout.people}};
 const wishTree=createWishTree(scene,actor);
 const encountered=new Set(),mapNodes=new Map();
 const params=new URLSearchParams(location.search);const difficulty=params.get('difficulty')==='2'?2:1;let exploring=params.get('explore')==='1';
 let progress;try{progress=readProgress(localStorage,difficulty);}catch{progress={completed:[]};}
 let sessionNotice='';
 const session=(id,fresh=false)=>{let storage;try{storage=localStorage;}catch{}return createMissionSession(id,storage,message=>{sessionNotice=message;},fresh,difficulty);};
 let controller=session(missions.some(m=>m.id===params.get('mission'))?params.get('mission'):'science'),s=controller.state;const campusMarker=(_,id)=>exploring?(missions.some(m=>m.giver===id)?'ask':'idle'):controller.marker(id);const root=document.createElement('section');root.id='quest-ui';
 root.innerHTML=`<p id="quest-save-status" role="status"></p><div id="quest-keyword" role="status" lang="en"></div><div id="quest-labels"></div><button type="button" id="quest-pickup-label" hidden></button><div id="quest-workshop-parts"></div><section id="quest-workbench" hidden aria-label="组装工作台"><b>组装工作台</b><p id="quest-workbench-state"></p><div id="quest-workbench-parts"></div><button id="quest-test-lamp" hidden>开灯测试</button></section><div id="quest-controls" hidden><button id="quest-briefing" hidden>重听委托</button><button id="quest-bag">任务背包</button><button id="quest-keyword-hint">一点提示</button><button id="quest-coach">问教练</button><button id="quest-settings">音色 / 语速</button><button id="quest-action" hidden></button><span id="quest-status" role="status"></span></div>
 <aside id="quest-note" hidden><button id="quest-close" aria-label="关闭对话">×</button><b id="quest-person"></b><div><button id="quest-replay">🔊 再听一次</button><button id="quest-slow">慢速听</button><button id="quest-talk">🎙 继续交流</button><button id="quest-chat" hidden>闲聊</button><button id="quest-new-task" hidden>查看新委托</button><button id="quest-cancel" hidden>取消录音</button></div><p id="quest-voice-status" role="status"></p><details id="quest-help"><summary>文字辅助</summary><p id="quest-en" lang="en"></p><details><summary>中文提示</summary><p id="quest-zh"></p></details><p id="quest-raw"></p><form id="quest-form"><input id="quest-input" aria-label="英语回答" maxlength="300" autocomplete="off"><button>发送</button></form><audio id="quest-recording" controls hidden></audio></details></aside>
 <dialog id="quest-ready"><a class="ready-back" href="./">返回关卡地图</a><h2 id="quest-ready-title">出发前，听一听</h2><label id="quest-mission-label" hidden>校园故事<select id="quest-mission"></select></label><p id="quest-ready-caption">先熟悉这些表达，进入场景后认真听取委托。</p><details id="quest-audio-settings"><summary>声音设置</summary><label>英语音色<select id="quest-voice"></select></label><label>语速<select id="quest-rate"><option value="0.65">0.65×</option><option value="0.75">0.75×</option><option value="0.85">0.85×</option><option value="1">1×</option></select></label><button id="quest-sample">试听</button></details><section id="quest-resume" hidden><p>继续上次任务：已保留你的进度。</p><button id="quest-resume-listen">🔊 重听原始委托</button><details><summary>查看委托文字</summary><p id="quest-resume-text"></p></details></section><div id="quest-words"></div><button id="quest-begin">准备好了</button> <button id="quest-start-fresh" hidden>从头挑战</button><p id="quest-asr-status" role="status"></p><p id="quest-ready-status" role="status"></p></dialog>
 <dialog id="quest-goodbye" aria-label="Tim"><b>Tim</b><p id="quest-goodbye-line" lang="en"></p></dialog><dialog id="quest-win"><div class="quest-stars">★★★</div><h2>任务完成！</h2><p id="quest-summary"></p><button id="quest-view">回到校园看看</button><button id="quest-next">下一关</button><button id="quest-thanks">🔊 再听感谢</button><button id="quest-again">再玩一次</button><a href="./">返回关卡地图</a></dialog>`;
 document.body.append(root);const $=id=>document.getElementById('quest-'+id);
 function updateMapLinks(){
  const mapURL='./?level='+controller.config.id+(difficulty===2?'&difficulty=2':'');
  for(const link of document.querySelectorAll('#hud a, .ready-back, #quest-win a'))link.href=mapURL;
 }
 updateMapLinks();
 const localASR=location.port==='4174';
 const asrStatus=$('asr-status');
 if(localASR){
  asrStatus.textContent='正在检查本机语音识别…';
  fetch('/api/local-asr/health',{signal:AbortSignal.timeout(4000)}).then(async r=>{if(!r.ok||!(await r.json()).ok)throw Error();asrStatus.textContent='语音识别：本机 Whisper small · 英语'+(controller.config.id==='hobbies'?'　人物回复：本机 Qwen2.5 3B 试验':'');}).catch(()=>{asrStatus.textContent='本机 Whisper 服务不可用，录音前请先恢复服务。';});
 }else{
  asrStatus.textContent='语音识别：浏览器识别';
  if(['localhost','127.0.0.1'].includes(location.hostname)){
   const link=document.createElement('a');link.textContent='切换到本机 Whisper 试玩';const url=new URL(location.href);url.hostname='127.0.0.1';url.port='4174';link.href=url.href;link.style.display='block';asrStatus.append(link);
  }
 }
 let begun=false,running=false,selected=null,focusId=null,last=null,turn=null,token=0,audioUrl=null,briefing=controller.briefing;
 let conversationMode='task',offeredMission=null,pendingReply=null;
 function stopReply(){pendingReply?.abort();pendingReply=null;}
 const smallTalk=[
  {en:'I like taking a walk around campus after class.',zh:'我喜欢下课后在校园里走走。'},
  {en:'I heard the school club is planning an event this week.',zh:'听说学校社团这周要办活动。'},
  {en:'The courtyard is my favorite place to take a break.',zh:'庭院是我最喜欢休息的地方。'}
 ];
 let voice='',rate=.85;try{voice=localStorage.getItem('campus-voice')||'';rate=Number(localStorage.getItem('campus-speech-rate'))||.85;}catch{}
 $('rate').value=String(rate);
 function voices(){const list=englishVoices(speechSynthesis.getVoices()),chosen=chooseVoice(list,voice);$('voice').replaceChildren(...list.map(v=>new Option(v.name,voiceKey(v),false,v===chosen)));if(!chosen)$('voice').prepend(new Option('请选择可用英语音色（当前未找到已选音色）','',true,true));}
 speechSynthesis.addEventListener('voiceschanged',voices);voices();
 function remember(){voice=$('voice').value;rate=Number($('rate').value);try{localStorage.setItem('campus-voice',voice);localStorage.setItem('campus-speech-rate',String(rate));}catch{}}
 $('voice').onchange=$('rate').onchange=remember;
 const atCafeCounter=()=>conversationMode==='task'&&selected==='waiter'&&['restaurant','picnic'].includes(controller.config.id)&&controller.marker('waiter')==='ask';
 const talkLabel=()=>conversationMode==='chat'?'🎙 开口闲聊':atCafeCounter()?'🎙 开口点餐':'🎙 继续交流';
 async function speak(text,slow=false,onFinished){
  const n=++token,speaker=selected;
  const waitForWaiter=atCafeCounter()&&!$('note').hidden;
  $('talk').disabled=waitForWaiter;
  voiceState();
  speechSynthesis.cancel();
  const finish=()=>{
   if(n!==token)return;
   $('talk').disabled=false;
   voiceState('idle',speaker);
   onFinished?.();
  };
  const list=await loadVoices(speechSynthesis,2000);
  if(n!==token)return;
  const v=chooseVoice(list,voice);
  if(!v){finish();$('voice-status').textContent='音色尚不可用，请在音色设置中重选。';return;}
  const u=new SpeechSynthesisUtterance(text);
  u.voice=v;u.lang=v.lang;u.rate=slow?rate*.8:rate;
  u.onstart=()=>{if(n===token)voiceState('speaking',speaker);};
  u.onend=finish;
  u.onerror=()=>{finish();if(n===token&&waitForWaiter)$('voice-status').textContent='未能播放店员的话，可以重听或查看文字。';};
  speechSynthesis.speak(u);
 }
 function voiceState(state='idle',id=selected){dispatchEvent(new CustomEvent('campus-voice-state',{detail:{id,state}}));}
 function cancel(){stopReply();voiceState();$('voice-status').textContent='';const pending=turn;turn=null;pending?.abort();$('cancel').hidden=true;$('talk').disabled=false;$('talk').textContent=talkLabel();}
 function close(){showKeyword('');cancel();++token;speechSynthesis.cancel();$('note').hidden=true;selected=null;focusId=null;conversationMode='task';offeredMission=null;root.dataset.conversing='false';}
 function adapt(r){if(r?.en.includes('Go through the glass doorway'))return {en:'Yes, the robot was moved to the laboratory display on the right side of the science centre for a battery check. Ask Leo there.',zh:'机器人被移到科学中心右侧实验展示区检查电池了，去那里问 Leo。'};return r;}
 function show(r,id,mode='task'){if(!r)return;stopReply();conversationMode=mode;$('status').textContent='';last=adapt(r);selected=id;root.dataset.conversing='true';$('replay').disabled=$('slow').disabled=false;$('person').textContent=id==='nova'?'Jalor · 机器狗教练':layout.people[id]?.name||controller.config.title;$('en').textContent=last.en;$('zh').textContent=last.zh;$('help').open=false;$('note').hidden=false;$('talk').hidden=mode==='review'||(mode==='task'&&(id==='nova'||!controller.config.people.includes(id)||exploring));$('form').hidden=mode==='review'||controller.config.id==='wish';if(mode==='briefing')$('talk').hidden=true;$('chat').hidden=mode!=='review';$('new-task').hidden=mode!=='review'||!offeredMission;$('voice-status').textContent='';$('talk').textContent=talkLabel();if($('goodbye').open){
   $('goodbye-line').textContent=last.en;void speak(last.en,false,endGoodbye);
  }else void speak(last.en);}
 function act(id,type,text=''){const reply=controller.act(id,type,text,actor.position,clearLine);if(type==='mission'&&reply)briefing={...reply};return reply;}
 const backpack=createBackpack({getContext:()=>({config:controller.config,state:s,briefing,exploring,clues:controller.clues.map(clue=>({...adapt(clue),name:layout.people[clue.npc]?.name||clue.npc}))}),speak,pause:()=>{close();setPlaying(false);},resume:()=>setPlaying(true),stop:()=>{++token;speechSynthesis.cancel();voiceState();}});
 $('bag').onclick=()=>backpack.open();
 $('briefing').onclick=()=>{if(briefing&&!turn)show(briefing,controller.config.giver,controller.config.id==='wish'?'briefing':'task');};
 let keywordTimer=null;
 function showKeyword(text){clearTimeout(keywordTimer);$('keyword').textContent=text;}
 $('keyword-hint').onclick=()=>{showKeyword(controller.keyword||(s.stage==='brief'?'listen':s.stage==='pickup'?'collect':s.stage==='handover'?'deliver':'ask'));keywordTimer=setTimeout(()=>showKeyword(''),4500);};
 addEventListener('campus-hover-word',e=>{if(running&&!turn)showKeyword(e.detail||'');});
 function hint(){if(exploring){show({en:'Let us explore the campus. Walk up to a friend with a question mark to hear about an adventure. You choose where we go.',zh:'一起探索校园吧。走近带问号的同伴，就能开始一段冒险。你来决定去哪儿。'},'nova');return;}let h=controller.hint();if(controller.config.id==='science'&&s.stage==='lab-question')h={en:'Remember what Ben told you. Look on the right side of the science centre and speak to Leo.',zh:'回想 Ben 的提示，去科学中心右侧和 Leo 交流。'};show(h,'nova');}
 async function submit(text){
  if(!selected||selected==='nova'||!running||turn||pendingReply||!text.trim()||conversationMode==='review')return;
  const id=selected,p=layout.people[id];
  if(conversationMode==='chat'){
   if(!p||Math.hypot(actor.position.x-p.x,actor.position.z-p.z)>layout.interactionRadius||!clearLine(p))return;
   show(smallTalk[Math.floor(Math.random()*smallTalk.length)],id,'chat');
   $('raw').textContent='你说：'+text;
   return;
  }
  const previous=last?.en||'';
  $('raw').textContent='你说：'+text;
  function present(reply,source=''){
   if(!reply){$('voice-status').textContent='请先走近当前任务人物。';return;}
   if(controller.config.id==='hobbies'&&s.complete){$('goodbye-line').textContent='…';$('goodbye').showModal();}
   show(reply,id);$('raw').textContent='你说：'+text;
   if(source)$('voice-status').textContent=source;
  }
  if(!localASR||controller.config.id!=='hobbies'||s.stage==='brief'||!['sue','tim'].includes(id)){
   present(act(id,'say',text));return;
  }
  const request=new AbortController();pendingReply=request;
  const timer=setTimeout(()=>request.abort(),4500);
  ++token;speechSynthesis.cancel();$('talk').disabled=true;
  $('voice-status').textContent='本地模型正在回答…';
  let spoken=null;
  try{
   const response=await fetch('/api/invitation-turn',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/x-ndjson'},
    body:JSON.stringify({npc:id,student:text,previous,facts:{...s.facts,difficulty}}),signal:request.signal});
   if(!response.ok)throw Error('fallback');
   const reader=response.body.pipeThrough(new TextDecoderStream()).getReader();let buffer='';
   while(true){
    const {done,value}=await reader.read();if(done)break;
    const lines=(buffer+value).split('\n');buffer=lines.pop();
    for(const line of lines){
     const event=JSON.parse(line);
     if(!spoken){
      if(pendingReply!==request)return;
      if(!Array.isArray(event.topics)||!event.en)throw Error('Incomplete interpretation');
      pendingReply=null;
      spoken=act(id,'invitation-turn',JSON.stringify({...event,student:text,zh:event.zh||''}));
      present(spoken,spoken?.model?'本地模型 · '+spoken.model:'任务规则 · 已核对人物信息');
      if(!spoken)return;
     }else if(last===spoken&&spoken.model&&event.zh){
      spoken.zh=event.zh;$('zh').textContent=event.zh;
      controller.translateLastTurn?.(id,spoken);
     }
    }
   }
   if(!spoken)throw Error('empty');
  }catch{
   if(pendingReply!==request)return;
   pendingReply=null;present(act(id,'say',text),'任务台词 · 本轮使用预设回应');
  }finally{clearTimeout(timer);}
 }
 async function talk(){if(turn){turn.stop();return;}if(pendingReply||$('talk').disabled)return;if(!selected||selected==='nova'||(conversationMode!=='chat'&&(!controller.config.people.includes(selected)||exploring)))return;const id=selected;if(Math.hypot(actor.position.x-layout.people[id].x,actor.position.z-layout.people[id].z)>layout.interactionRadius)return;
 ++token;speechSynthesis.cancel();const options={createVAD:createBrowserVAD,silenceMs:3000,scene:controller.config.asrScene,onUpdate:r=>{voiceState('listening',id);$('voice-status').textContent=({preparing:'准备麦克风…',listening:'请说英语',waiting:'正在听，停顿 3 秒后结束',finalizing:'正在识别…'})[r.phase]||'';},onComplete:r=>{voiceState();turn=null;$('cancel').hidden=true;$('talk').disabled=false;$('talk').textContent=talkLabel();if(selected===id){if(r.needsReview){$('input').value=r.text;$('help').open=true;$('voice-status').textContent='识别尚未定稿，请核对后发送。';}else submit(r.text);}if(r.audioWav){if(audioUrl)URL.revokeObjectURL(audioUrl);audioUrl=URL.createObjectURL(new Blob([r.audioWav],{type:'audio/wav'}));$('recording').src=audioUrl;$('recording').hidden=false;}},onError:code=>{voiceState();turn=null;$('cancel').hidden=true;$('talk').textContent='🎙 再试一次';$('voice-status').textContent=({'not-allowed':'麦克风权限未开启，请允许本站使用麦克风。','no-speech':'没有检测到语音，请靠近麦克风再试。','local-asr':'本机识别请求失败，请检查 Whisper 服务后重试。','vad-stalled':'录音检测中断，请重新开始。','network':'浏览器识别网络失败，可切换到本机 Whisper 试玩。'})[code]||'录音或识别未完成，可以重试，也可展开文字辅助。';}};
 turn=localASR?createLocalVoiceTurn(options):createVoiceTurn({...options,Recognition:window.SpeechRecognition||window.webkitSpeechRecognition});$('cancel').hidden=false;$('talk').textContent='■ 说完了';await turn.start();}
 $('chat').onclick=()=>{
  if(!selected||conversationMode!=='review'||turn)return;
  $('raw').textContent='';
  show({en:'Sure! What would you like to talk about?',zh:'好呀！你想聊点什么？'},selected,'chat');
 };
 $('new-task').onclick=()=>{
  if(!offeredMission)return;
  chooseMission(offeredMission.id);begun=false;settings();
 };
 $('talk').onclick=talk;$('cancel').onclick=cancel;$('close').onclick=close;
 $('form').onsubmit=e=>{e.preventDefault();submit($('input').value);$('input').value='';};
 $('replay').onclick=()=>last&&speak(last.en);$('slow').onclick=()=>last&&speak(last.en,true);$('coach').onclick=hint;
 $('sample').onclick=()=>{remember();void speak('Hello! I am Jalor. Let us explore the campus together.');};
 function renderWords(){ $('words').replaceChildren();for(const word of [...controller.config.words,...controller.config.phrases]){const b=document.createElement('button');b.textContent='🔊 '+word;b.onclick=()=>speak(word);$('words').append(b);}}
 for(const mission of missions)$('mission').add(new Option(mission.title,mission.id));
 function chooseMission(id,fresh=false){close();briefing=null;exploring=false;if(audioUrl){URL.revokeObjectURL(audioUrl);audioUrl=null;}$('recording').removeAttribute('src');$('recording').hidden=true;controller=session(id,fresh);s=controller.state;briefing=controller.briefing;
  {const url=new URL(location.href);url.searchParams.set('mission',id);url.searchParams.delete('explore');history.replaceState(null,'',url);updateMapLinks();}
  renderWords();$('mission').value=id;}
 $('mission').onchange=()=>chooseMission($('mission').value);renderWords();
 $('resume-listen').onclick=()=>{if(briefing)void speak(briefing.en);};
 $('start-fresh').onclick=()=>{
  remember();
  if(!voice){$('ready-status').textContent='请先在声音设置里选择英语音色。';voices();return;}
  chooseMission('picnic',true);
  $('begin').click();
 };
 function settings(){
 const canResume=controller.restored&&s.stage!=='brief';
 $('start-fresh').hidden=begun||exploring||controller.config.id!=='picnic'||!canResume;
 $('resume').hidden=begun||exploring||!canResume||!briefing;
 $('resume-text').textContent=briefing?.en||'';
 $('begin').textContent=begun?'返回任务':exploring?'开始探索':canResume?'继续上次任务':controller.config.id==='picnic'?'进入校园，去找 Lily':'准备好了';
 document.querySelector('#hud h1').textContent=exploring?'未来校园 · 自由探索':controller.config.title;
  $('mission-label').hidden=true;$('ready-title').textContent=begun?'声音设置':exploring?'和 Jalor 出发':(difficulty===2?'Level 2 · '+controller.config.title:levels.find(l=>l.id===controller.config.id).title);$('ready-caption').textContent=canResume?'有一局做了一半，你可以接着玩。':!exploring&&controller.config.id==='picnic'?'尚未领取委托。进入校园后，去咖啡馆露台找 Lily。':'先熟悉这些表达，进入场景后认真听取委托。';$('ready-caption').hidden=begun;$('words').hidden=begun||exploring;$('audio-settings').open=begun||!voice;cancel();++token;speechSynthesis.cancel();setPlaying(false);$('ready').showModal();}
 $('settings').onclick=settings;$('ready').addEventListener('cancel',e=>e.preventDefault());
 $('begin').onclick=()=>{remember();if(!voice){$('ready-status').textContent='英语音色仍在加载，请稍后选择。';voices();return;}$('ready').close();begun=true;setPlaying(true);$('controls').hidden=false;if(controller.restored&&briefing){show(briefing,controller.config.giver,controller.config.id==='wish'?'briefing':'task');}else hint();};
 function interact(id){
   if(!running||turn)return;if(selected)close();
   if(id==='nova'){
     const coach=scene.getObjectByName('campus-coach');
     if(!coach)return;
     const position=coach.userData.interactionPosition;
     if(Math.hypot(actor.position.x-position.x,actor.position.z-position.z)>layout.interactionRadius){$('status').textContent='走近 Jalor，点击机器狗交谈';return;}
     if(!clearLine(position))return;focusId=id;hint();return;
   }
   if(!layout.people[id])return;
   const p=layout.people[id],mode=campusMarker(s,id);
   if(Math.hypot(actor.position.x-p.x,actor.position.z-p.z)>layout.interactionRadius){$('status').textContent='走近 '+p.name+'，点击人物交谈';return;}
   if(!clearLine(p))return;focusId=id;encountered.add(id);
   if(exploring){
    const next=missions.find(m=>m.giver===id&&!progress.completed.includes(m.id));
    const completed=missions.find(m=>m.giver===id&&progress.completed.includes(m.id));
    const review=(s.complete&&controller.review(id))||completed?.thanks;
    if(review){
     offeredMission=next;
     $('raw').textContent='';
     show(review,id,'review');
    }else if(next){chooseMission(next.id);begun=false;settings();}
    else show({en:'Hello! Have a look around. Your coach can help you find someone with a task.',zh:'你好，四处看看吧，教练可以帮你找有委托的同伴。'},id);
    return;
   }
   if(mode!=='ask'){
    const review=controller.review(id);
    if(review){$('raw').textContent='';show(review,id,'review');return;}
   }
   if(id===controller.config.giver&&s.stage==='brief'){show(act(id,'mission'),id);return;}
   if(mode==='ask'&&s.advancedStep!=null){show(act(id,'greet'),id);return;}
   if(mode==='ask'&&id==='waiter'&&['restaurant','picnic'].includes(controller.config.id)){
     $('raw').textContent='';
     show(s.records[id]||{en:'Hi! Welcome to the cafe. What can I get for you?',zh:'你好！欢迎来到咖啡馆。你想点些什么？'},id);
     return;
   }
   if(mode==='ask'&&controller.config.id==='welcome'){show(act(id,'greet'),id);return;}
   if(mode==='ask'){
     selected=id;$('form').hidden=controller.config.id==='wish';$('chat').hidden=$('new-task').hidden=true;root.dataset.conversing='true';$('talk').textContent=talkLabel();last=s.records[id]?adapt(s.records[id]):null;
     $('person').textContent=p.name;$('note').hidden=false;$('help').open=false;$('talk').hidden=false;
     $('en').textContent=last?.en||'';$('zh').textContent=last?.zh||'';$('raw').textContent='';
     $('replay').disabled=$('slow').disabled=!last;void talk();
   }else if(controller.config.people.includes(id)){show(act(id,'greet'),id);}
   else show({en:'Hello! Let us finish the current task first. Your coach can help you decide what to do next.',zh:'你好，先完成当前任务吧。不清楚下一步可以问教练。'},id);
 }
 if(controller.config.id==='wish'&&controller.resumePosition){
  const {x,z}=controller.resumePosition;actor.position.set(x,actor.position.y,z);
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
 const exhibits=new Map(missions.filter(m=>m.device).map(m=>[m.id,createExhibit(scene,camera,m.device,actor,{missionId:m.id,display:m.display,kind:m.kind})]));
 const benchButtons=new Map(), collectButtons=new Map();
 for(const part of workshopParts){
  const collect=document.createElement('button');
  collect.className='workshop-collect';
  collect.textContent='拾取'+part.name;
  collect.hidden=true;
  collect.onclick=()=>pickWorkshopPart(part.id);
  $('workshop-parts').append(collect);collectButtons.set(part.id,collect);
  const button=document.createElement('button');
  button.textContent='安装'+part.name;
  button.onmouseenter=()=>showKeyword(part.word);button.onmouseleave=()=>showKeyword('');
  button.onclick=()=>{
   if(!running||turn||$('workbench').hidden)return;
   const before=s.installed.length;
   act('bench','install-part',part.id);
   if(s.installed.length===before){$('keyword-hint').click();return;}
   $('status').textContent='已安装'+part.name;
  };
  $('workbench-parts').append(button);benchButtons.set(part.id,button);
 }
 $('test-lamp').onclick=()=>{
  if(!running||turn||$('workbench').hidden)return;
  act('bench','test-lamp');
  if(s.stage==='handover'){
   $('status').textContent='试亮成功，带回给 Alex。';
   void speak('It works! Take the lantern to Alex.');
  }
 };
 function pickWorkshopPart(id){
  if(!running||turn||exploring||controller.config.id!=='workshop'||s.stage!=='assembly')return false;
  const part=workshopParts.find(p=>p.id===id);
  if(!part||s.collected.includes(id))return false;
  act(id,'take-part');
  if(!s.collected.includes(id))return false;
  $('status').textContent='已找到'+part.name+'，可带到工作台。';
  showKeyword(part.word);
  keywordTimer=setTimeout(()=>showKeyword(''),2500);
  return true;
 }
 function renderWorkshop(active){
  const assembling=active&&!exploring&&!turn&&controller.config.id==='workshop'&&s.stage==='assembly';
  for(const part of workshopParts){
   const button=collectButtons.get(part.id);
   button.hidden=true;
   if(!assembling||s.collected.includes(part.id)||Math.hypot(actor.position.x-part.x,actor.position.z-part.z)>2.25||!clearLine(part))continue;
   projected.set(part.x,1.4,part.z).project(camera);
   if(Math.abs(projected.x)>.93||Math.abs(projected.y)>.88||Math.abs(projected.z)>1)continue;
   button.style.left=(projected.x+1)*innerWidth/2+'px';
   button.style.top=(1-projected.y)*innerHeight/2+'px';
   button.hidden=false;
  }
  const atBench=assembling&&Math.hypot(actor.position.x-workshopBench.x,actor.position.z-workshopBench.z)<=2.5&&clearLine(workshopBench);
  $('workbench').hidden=!atBench;
  if(!atBench)return;
  $('workbench-state').textContent='已找到 '+s.collected.length+' / '+workshopParts.length+' · 已安装 '+s.installed.length+' / '+workshopParts.length;
  for(const [id,button] of benchButtons)button.hidden=!s.collected.includes(id)||s.installed.includes(id);
  $('test-lamp').hidden=s.installed.length!==workshopParts.length;
 }
 const projected=new T.Vector3();
 const pickupLabel=$('pickup-label');
 function canPickItem(id){
  const device=controller.config.device;
  return running&&begun&&!turn&&!exploring&&id===controller.config.id&&s.stage==='pickup'&&s.discovered&&device
   &&Math.hypot(actor.position.x-device.x,actor.position.z-device.z)<2.3&&clearLine(device);
 }
 function pickItem(id){
  if(!canPickItem(id))return false;
  act('device','pickup');
  return s.owner==='student';
 }
 pickupLabel.onclick=()=>pickItem(controller.config.id);
 function showPickupLabel(active,canPick){
  const {device,id}=controller.config;
  pickupLabel.hidden=true;
  if(!active||!begun||exploring||turn||s.stage!=='pickup'||!device||!clearLine(device))return;
  projected.set(device.x,1.65,device.z).project(camera);
  if(Math.abs(projected.x)>.94||Math.abs(projected.y)>.86||Math.abs(projected.z)>1)return;
  pickupLabel.disabled=!canPick;
  pickupLabel.textContent=exhibits.get(id).pickupLabel+(canPick?' · 点击领取':'');
  pickupLabel.style.left=(projected.x+1)*innerWidth/2+'px';
  pickupLabel.style.top=(1-projected.y)*innerHeight/2+'px';
  pickupLabel.hidden=false;
 }
 function showCompletion(){
  close();setPlaying(false);$('summary').textContent=controller.config.summary;
  let saved=false;
  try{saved=finishLevel(localStorage,controller.config.id,difficulty);progress=readProgress(localStorage,difficulty);}catch{}
  if(!progress.completed.includes(controller.config.id))progress.completed.push(controller.config.id);
  if(!saved)$('summary').textContent+=' 本次完成记录未能保存。';
  $('next').hidden=!nextLevel(controller.config.id,progress);$('win').showModal();
 }
 function endGoodbye(){
  if(!$('goodbye').open)return;
  $('goodbye').close();showCompletion();
 }
 $('goodbye').oncancel=e=>{e.preventDefault();endGoodbye();};
 function deliver(){
  if(!running||turn||s.stage!=='handover')return;
  const reply=act(controller.config.giver,'deliver');
  if(reply&&s.complete){showCompletion();void speak(reply.en);}
 }
 $('action').onclick=deliver;
 $('thanks').onclick=()=>speak(controller.config.thanks.en);
 function restartMission(id){$('win').close();chooseMission(id,id===controller.config.id);begun=false;settings();}
 $('again').onclick=()=>restartMission(controller.config.id);
 $('next').onclick=()=>{const next=nextLevel(controller.config.id,progress);if(next)restartMission(next.id);};
 $('view').onclick=()=>{$('win').close();exploring=true;setPlaying(true);};
 addEventListener('pagehide',()=>{cancel();++token;speechSynthesis.cancel();if(audioUrl)URL.revokeObjectURL(audioUrl);});
 return {people:layout.people,get canHangWish(){return controller.config.id==='wish'&&!exploring&&s.stage==='handover'&&!$('action').hidden;},hangWish(){if(controller.config.id==='wish'&&!exploring&&s.stage==='handover')deliver();},pickWorkshopPart,pickItem,canPickItem,get workshopState(){return controller.config.id==='workshop'?s:null;},get movementLocked(){return turn!==null||$('goodbye').open;},get focus(){
   if(!focusId||$('note').hidden)return null;
   const p=focusId==='nova'?scene.getObjectByName('campus-coach')?.userData.interactionPosition:layout.people[focusId];
   return p?{x:p.x,z:p.z,y:focusId==='nova'?.75:1.35}:null;
 },get conversing(){return selected!==null&&!$('note').hidden;},interact,closeConversation:close,begin(){if(begun)setPlaying(true);else settings();},update(active){if(running&&!active&&!s.complete)close();running=active;
   const wish=controller.config.id==='wish'&&(!exploring||s.complete);
   wishTree.update(wish?s:null,progress.completed.includes('wish'));
   layout.people.mia=wish?wishPeople.mia:environmentLayout.people.mia;
   layout.people.ben=wish?wishTree.companion:environmentLayout.people.ben;
   for(const id of ['mia','ben']){
     const p=layout.people[id];mapNodes.get(id).group.setAttribute('transform','translate('+p.x+' '+p.z+')');
   }
   $('save-status').textContent=sessionNotice;
   root.dataset.recording=String(turn!==null);
   if(selected&&!turn&&conversationMode!=='briefing'){const point=selected==='nova'?scene.getObjectByName('campus-coach')?.userData.interactionPosition:layout.people[selected];if(point&&(Math.hypot(actor.position.x-point.x,actor.position.z-point.z)>4.5||!clearLine(point)))close();}
   $('controls').hidden=!begun||!active;
   $('briefing').hidden=!briefing||exploring;
   for(const [id,p] of Object.entries(layout.people)){const button=labels[id],mode=campusMarker(s,id);projected.set(p.x,2.35,p.z).project(camera);const distance=Math.hypot(actor.position.x-p.x,actor.position.z-p.z);if(active&&distance<=layout.interactionRadius)encountered.add(id);const pin=mapNodes.get(id);pin.group.style.display=encountered.has(id)||(exploring?missions.some(m=>m.giver===id):id===controller.config.giver)?'':'none';const state=mode==='ask'?'当前任务':mode==='done'?'已完成':'已认识';pin.dot.setAttribute('fill',state==='当前任务'?'#f16c64':state==='已完成'?'#71d5aa':'#82cafa');pin.group.setAttribute('aria-label',p.name+' · '+state);button.hidden=!active||distance>14||projected.z>1||projected.z< -1||(distance>layout.interactionRadius&&(Math.abs(projected.x)>1||Math.abs(projected.y)>1))||mode==='idle';button.style.left=Math.max(28,Math.min(innerWidth-28,(projected.x+1)*innerWidth/2))+'px';button.style.top=Math.max(108,Math.min(innerHeight-100,(-projected.y+1)*innerHeight/2))+'px';button.textContent=mode==='ask'?'?':mode==='done'?'✓':'▤';button.dataset.mode=mode;button.setAttribute('aria-label',p.name+(mode==='ask'?' 交流':' 查看对话'));}
   const d=controller.config.device?Math.hypot(actor.position.x-controller.config.device.x,actor.position.z-controller.config.device.z):Infinity;if(active&&!exploring&&s.stage==='pickup'&&!s.discovered&&d<2.3)act('device','discover');for(const [id,exhibit] of exhibits)exhibit.update(!exploring&&id===controller.config.id?s:progress.completed.includes(id)&&!(id==='restaurant'&&progress.completed.includes('picnic'))?{owner:'display',complete:true,displayOnly:true}:{visible:false},performance.now());
   const canPick=canPickItem(controller.config.id),canGive=!exploring&&s.stage==='handover'&&Math.hypot(actor.position.x-layout.people[controller.config.giver].x,actor.position.z-layout.people[controller.config.giver].z)<layout.interactionRadius;$('action').hidden=!canGive;$('action').textContent=controller.config.kind==='none'?(controller.config.finishLabel||'确认汇报'):'交给 '+layout.people[controller.config.giver].name;
   showPickupLabel(active,canPick);
   renderWorkshop(active);
   if(!exploring&&s.owner==='student')$('status').textContent='正在携带'+controller.config.item;else if(s.complete||exploring)$('status').textContent='';
 }};
}

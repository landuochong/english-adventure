import {createInvitationMission} from './campus-invitation.js';
import {withAdvancedStory} from './campus-level-two.js';
import {createWorkshopMission,workshopMission} from './campus-workshop.js?v=workshop-20261118';
import {createWelcomeMission,welcomeThanks} from './campus-welcome.js?v=3';
import {dailyMissions,createDailyMission} from './campus-daily-missions.js?v=invite-finish-1';
import {campusState,campusAct,campusMarker,campusHint,thanks} from './campus-level.js?v=range-35';
import {cafeState,cafeAct,cafeMarker,cafeHint} from './cafe-game.js?v=counter-details-20261118';
import {picnicConfig} from './campus-picnic-config.js?v=counter-details-20261118';
import {environmentLayout} from './campus-environment-layout.js?v=workshop-20261118';
import {requireWorld} from './campus-world.js?v=workshop-20261118';
import {createWishMission,wishMission,wishPeople} from './campus-wish.js';
export const missions=[
 {id:'welcome',world:'campus',region:'science',title:'入学仪式',giver:'mia',people:['mia','lisa','waiter','sue'],kind:'none',item:'入学确认',finishLabel:'确认入学',device:null,display:null,asrScene:'campus-welcome',words:['welcome','nickname','school','library','cafe','sports area','meet','explore'],phrases:['My name is …','You can call me …','I like …','Nice to meet you.','What can I do here?'],thanks:welcomeThanks,summary:'你介绍了自己，认识了校园同伴，完成了入学仪式。'},
 {id:'science',world:'campus',region:'science',title:'科技展：找回机器人',giver:'mia',people:['mia','ben','leo'],device:{x:8,z:-11},display:{x:-.8,z:-1.2},item:'机器人',kind:'robot',asrScene:'campus-level-one',phrases:['Have you seen …?','What colour is …?','I need it for …','Here is …'],words:['robot','blue light','information desk','laboratory','battery check','science fair','bring back'],thanks,summary:'你亲自找回了机器人，科技展可以开始了。'},
 {id:'picnic',world:'campus',region:'cafe',title:'咖啡馆：野餐午餐的小变化',giver:'lily',people:['lily','waiter'],device:{x:5,z:51},display:{x:-4.5,z:43},item:'午餐',kind:'lunch',asrScene:'campus-picnic',phrases:['Could I see the menu?','What else do you have?','I would like …, please.','Without …, please.','Here you are.'],words:['menu','chicken sandwich','sold out','what else','instead','cheese sandwich','without onions','water','picnic'],thanks:picnicConfig.actions.at(-1).reply,summary:'你商量了替代餐点，亲自领取并送回午餐。'},...dailyMissions,workshopMission,wishMission
];
// One controller owns progression; renderers, coaches and map markers cannot award progress.
function createMissionCore(id){
 const config=missions.find(m=>m.id===id);if(!config)throw new Error('Unknown mission');requireWorld(config.world);
 if(id==='workshop')return createWorkshopMission(environmentLayout);
 if(id==='welcome')return createWelcomeMission(config,environmentLayout);
 if(dailyMissions.some(m=>m.id===id))return createDailyMission(config,environmentLayout);
 const inner=id==='science'?campusState():cafeState(),state={records:{}};
 function sync(){
  if(id==='science')Object.assign(state,inner);
  else Object.assign(state,{stage:inner.complete?'complete':!inner.started?'brief':inner.reported?'handover':inner.owner==='student'?'return':inner.owner==='counter'?'pickup':'conversation',owner:inner.owner==='lily'?'display':inner.owner,complete:inner.complete,discovered:state.discovered||false});
 }
 sync();
 const localLayout={...environmentLayout,people:Object.fromEntries(config.people.map(n=>[n,environmentLayout.people[n]])),device:config.device};
 return {config,state,get clueStep(){return id==='picnic'?inner.step+':'+state.stage:state.stage;},get keyword(){return id==='picnic'?(!inner.started?'listen':inner.owner==='student'?(inner.reported?'deliver':'report'):inner.owner==='counter'?'collect':['menu','alternatives','ask','order'][inner.step]||'listen'):state.stage==='brief'?'listen':state.stage==='pickup'?'collect':state.stage==='handover'?'deliver':'ask';},marker(n){if(!config.people.includes(n))return 'idle';return id==='science'?campusMarker(inner,n):cafeMarker(inner,n,picnicConfig);},hint(){
  if(id==='science')return campusHint(inner);
  if(!inner.started)return {en:'Our next stop is the campus cafe, south of the courtyard. Find Lily on the terrace and listen to her picnic plan. I will come with you.',zh:'下一站是庭院南侧的校园咖啡馆。去露台找 Lily，听听她的野餐计划。我会陪你走。'};
  return cafeHint(inner,picnicConfig);
 },act(n,type,text,pos,clearLine=()=>true){
  const target=n==='device'?config.device:localLayout.people[n];
  if(!target||!pos||!clearLine(target)||Math.hypot(pos.x-target.x,pos.z-target.z)>(n==='device'?2.3:environmentLayout.interactionRadius))return null;
  let result=null;
  if(id==='science')result=campusAct(inner,n,type,text,pos,localLayout);
  else if(type==='discover'){if(state.stage==='pickup')state.discovered=true;}
  else if(type==='pickup'){if(state.discovered)cafeAct(inner,'bag','pickup','',picnicConfig);}
  else if(type==='mission'||type==='say'||type==='deliver')result=cafeAct(inner,n,type,text,picnicConfig);
  sync();if(result)state.records[n]=result;return result;
 }};
}


// Optional conversation never grants clues or changes task state.
export function createMission(id,difficulty=1,wishEdition=2){
 if(id==='wish'){
  const base=createWishMission(environmentLayout,wishEdition);
  return difficulty===2?withAdvancedStory(base,{...environmentLayout,people:wishPeople}):base;
 }
 if(id==='hobbies')return createInvitationMission(missions.find(m=>m.id===id),environmentLayout,difficulty);
 const controller=createMissionCore(id),taskAct=controller.act;
 const pair=(en,zh)=>({en,zh});
 controller.act=(npc,type,text='',pos,clearLine=()=>true)=>{
  if(type!=='say'&&type!=='greet')return taskAct(npc,type,text,pos,clearLine);
  const p=environmentLayout.people[npc],s=controller.state,c=controller.config;
  if(!c.people.includes(npc)||!p||!pos||Math.hypot(pos.x-p.x,pos.z-p.z)>environmentLayout.interactionRadius||!clearLine(p))return null;
  const t=text.toLowerCase().replace(/[?.!,]/g,' ').replace(/\s+/g,' ').trim();
  if(c.id==='welcome'&&type==='say'&&['explore','return'].includes(s.stage)&&controller.marker(npc)==='ask'&&npc!=='mia')return taskAct(npc,type,text,pos,clearLine);
  if(c.id==='welcome'&&(type==='greet'||/^(hello|hi|hey|good morning|good afternoon)( there)?$/.test(t)))return taskAct(npc,'greet','',pos,clearLine);
  if(type==='greet'||/^(hello|hi|hey|good morning|good afternoon)( there)?$/.test(t))return pair('Hello! What would you like to ask me?','你好！你想问我什么？');
  if(/^(thank you|thanks)( so much| very much)?$/.test(t))return pair('You are welcome!','不客气！');
  if(/\b(again|repeat|slower|slowly)\b/.test(t))return s.records[npc]||pair('We have not discussed the task yet. What would you like to ask?','我们还没谈过任务，你想问什么？');
  if(controller.marker(npc)==='ask'&&s.stage!=='brief')return taskAct(npc,type,text,pos,clearLine);
  if(s.stage==='brief')return pair('Please listen to '+environmentLayout.people[c.giver].name+' first. Then we can talk about the request.','请先听 '+environmentLayout.people[c.giver].name+' 的委托，再来讨论。');
  if(s.stage==='pickup')return controller.hint();
  if(s.stage==='handover'&&npc===c.giver)return pair(c.kind==='none'?'Please confirm your report to finish.':'Please hand me the item you brought.',c.kind==='none'?'请确认汇报，完成任务。':'请点击交付，把带来的物品交给我。');
  const relevant=/\b(task|help|request|need|remember|said|say|what|where|when|how)\b/.test(t)||c.words.some(w=>t.includes(w.toLowerCase()));
  if(relevant&&s.records[npc])return s.records[npc];
  return pair('I can discuss what we have talked about for this task. What would you like to check?','我可以和你讨论这次任务中我们已经谈过的信息，你想确认什么？');
 };
 return difficulty===2?withAdvancedStory(controller,environmentLayout):controller;
}

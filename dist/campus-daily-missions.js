import {dailyScenes,sceneVocabulary,newSceneState,sceneNext,sceneInteract,sceneCoach} from './scene-engine.js?v=invite-report-1';
const definitions=[
 ['school','library','book','数学课本',{x:48,z:12},{x:41.5,z:18},'校园东侧图书馆','the library east of the science centre'],
 ['restaurant','cafe','lunch','午餐',{x:5,z:51},{x:-4.5,z:43},'庭院南侧咖啡馆','the cafe south of the courtyard'],
 ['shopping','shop','cap','帽子',{x:28,z:47},{x:23.5,z:43},'校园商店','the campus store east of the cafe'],
 ['directions','transit','none','路线',null,null,'东侧校车站','the bus stop on the east side of campus'],
 ['weather','garden','none','活动计划',null,null,'西南侧草坪','the garden southwest of the courtyard'],
 ['hobbies','sports','none','邀请结果',null,null,'西侧运动区','the sports area west of the courtyard']
];
export const dailyMissions=definitions.map(([id,region,kind,item,device,display,place,placeEn])=>{
 const story=dailyScenes[id];return {id,world:'campus',region,title:story.title,giver:story.giver,people:story.npcs.map(n=>n.id),kind,item,device,display,asrScene:id,words:sceneVocabulary[id].map(w=>w[0]),phrases:story.phrases,thanks:story.actions.at(-1).reply,summary:'你完成了'+story.title+'，并亲自向同伴交代了结果。',place,placeEn};
});
// Adapter preserves the proven conversation engine; its legacy 2D coordinates are only supplied AFTER world-distance and sight checks.
export function createDailyMission(config,layout){
 const id=config.id,story=dailyScenes[id],inner=newSceneState();inner.prepared=true;
 const state={stage:'brief',owner:null,discovered:false,complete:false,records:{}};
 const hasItem=config.kind!=='none';
 function sync(){state.stage=state.complete?'complete':inner.complete?'handover':!inner.started?'brief':hasItem&&inner.done.length===story.actions.length-1?(state.owner==='student'?'return':'pickup'):'conversation';}
 const pair=(en,zh)=>({en,zh});
 const collection=()=>id==='school'?pair('The maths book is on the collection stand near Lisa. Walk over and pick it up, then bring it to Tom.','数学书在 Lisa 附近的领取台上。走过去领取，再带给 Tom。'):pair('Please collect the item from the collection stand first.','请先去领取台亲自领取物品。');
 return {config,state,get clueStep(){return inner.done.length;},marker(n){
  if(!config.people.includes(n))return 'idle';if(state.complete)return 'done';
  if(!inner.started)return n===config.giver?'ask':'idle';
  if(!inner.complete&&state.stage!=='pickup'&&sceneNext(id,inner)?.npc===n)return 'ask';
  return state.records[n]?'text':'idle';
 },hint(){
  if(!inner.started)return pair('Find '+layout.people[config.giver].name+' at '+config.placeEn+'. Listen to the request first. I will help you think.', '去'+config.place+'找 '+layout.people[config.giver].name+'，先听委托。你来行动，我帮你分析。');
  if(state.stage==='pickup')return collection();
  if(state.stage==='handover')return pair(hasItem?'Now hand over the item yourself.':'Confirm your report with your friend to finish the task.',hasItem?'现在亲自交付物品。':'向同伴确认汇报，完成任务。');
  return sceneCoach(id,inner);
 },act(n,type,text,pos,clearLine=()=>true){
  const target=n==='device'?config.device:config.people.includes(n)?layout.people[n]:null;
  if(!target||!pos||!clearLine(target)||Math.hypot(pos.x-target.x,pos.z-target.z)>(n==='device'?2.3:layout.interactionRadius))return null;
  if(state.complete)return state.records[n]||config.thanks;
  if(n==='device'){
   if(state.stage==='pickup'&&type==='discover')state.discovered=true;
   if(state.stage==='pickup'&&type==='pickup'&&state.discovered){state.owner='student';sync();}return null;
  }
  if(type==='deliver'){
   if(n===config.giver&&inner.complete&&(!hasItem||state.owner==='student')){state.complete=true;if(hasItem)state.owner='display';sync();state.records[n]=config.thanks;return config.thanks;}return null;
  }
  if(type==='mission'&&(n!==config.giver||inner.started)||type==='say'&&!inner.started)return null;
  if(type!=='mission'&&type!=='say')return null;
  if(state.stage==='pickup')return collection();
  if(inner.complete)return state.records[n]||null;
  const npc=story.npcs.find(p=>p.id===n);inner.player={x:npc.x,y:npc.y};
  // A contextual handover phrase is valid only after the student actually collected the book.
  if(id==='school'&&state.stage==='return'&&n===config.giver&&/^(here you (are|go)|here it is)[.! ,]*$/i.test(text.trim()))text='Here is your book.';
  let result=sceneInteract(id,inner,n,type==='mission'?null:text);sync();
  if(id==='school'&&state.stage==='pickup')result=pair('Tomorrow is fine. I have left the maths book on the collection stand beside me. Please pick it up and take it to Tom.','明天归还可以。我把数学书放在身旁的领取台上了，请亲自拿取后带给 Tom。');
  if(inner.complete&&id==='hobbies'){state.complete=true;sync();result=config.thanks;}
  else if(inner.complete)result=pair(hasItem?'You have explained what you brought. Please hand it to me.':'You have given me the information. Let us confirm the plan.',hasItem?'你已经说明带来的物品，请亲自交给我。':'你已说明信息，我们确认一下计划。');
  if(result){result={en:result.en.replaceAll('Nova','Jalor'),zh:result.zh.replaceAll('Nova','Jalor')};state.records[n]=result;}return result;
 }};
}

import {dailyMissions,createDailyMission} from './campus-daily-missions.js';
import {campusState,campusAct,campusMarker,campusHint,thanks} from './campus-level.js?v=range-35';
import {cafeState,cafeAct,cafeMarker,cafeHint} from './cafe-game.js';
import {cafeConfig} from './cafe-config.js';
import {environmentLayout} from './campus-environment-layout.js?v=world-2';
import {requireWorld} from './campus-world.js';
export const missions=[
 {id:'science',world:'campus',region:'science',title:'科技展：找回机器人',giver:'mia',people:['mia','ben','leo'],device:{x:8,z:-11},display:{x:-.8,z:-1.2},item:'机器人',kind:'robot',asrScene:'campus-level-one',words:['robot','blue light','information desk','laboratory','battery check','science fair','bring back'],thanks,summary:'你亲自找回了机器人，科技展可以开始了。'},
 {id:'picnic',world:'campus',region:'cafe',title:'咖啡馆：野餐午餐的小变化',giver:'lily',people:['lily','waiter'],device:{x:5,z:51},display:{x:-4.5,z:43},item:'午餐',kind:'lunch',asrScene:'campus-picnic',words:['menu','chicken sandwich','sold out','instead','cheese sandwich','without onions','water','picnic'],thanks:cafeConfig.actions[3].reply,summary:'你商量了替代餐点，亲自领取并送回午餐。'},...dailyMissions
];
// One controller owns progression; renderers, coaches and map markers cannot award progress.
export function createMission(id){
 const config=missions.find(m=>m.id===id);if(!config)throw new Error('Unknown mission');requireWorld(config.world);
 if(dailyMissions.some(m=>m.id===id))return createDailyMission(config,environmentLayout);
 const inner=id==='science'?campusState():cafeState(),state={records:{}};
 function sync(){
  if(id==='science')Object.assign(state,inner);
  else Object.assign(state,{stage:inner.complete?'complete':!inner.started?'brief':inner.reported?'handover':inner.owner==='student'?'return':inner.owner==='counter'?'pickup':'conversation',owner:inner.owner==='lily'?'display':inner.owner,complete:inner.complete,discovered:state.discovered||false});
 }
 sync();
 const localLayout={...environmentLayout,people:Object.fromEntries(config.people.map(n=>[n,environmentLayout.people[n]])),device:config.device};
 return {config,state,marker(n){if(!config.people.includes(n))return 'idle';return id==='science'?campusMarker(inner,n):cafeMarker(inner,n);},hint(){
  if(id==='science')return campusHint(inner);
  if(!inner.started)return {en:'Our next stop is the campus cafe, south of the courtyard. Find Lily on the terrace and listen to her picnic plan. I will come with you.',zh:'下一站是庭院南侧的校园咖啡馆。去露台找 Lily，听听她的野餐计划。我会陪你走。'};
  return cafeHint(inner);
 },act(n,type,text,pos,clearLine=()=>true){
  const target=n==='device'?config.device:localLayout.people[n];
  if(!target||!pos||!clearLine(target)||Math.hypot(pos.x-target.x,pos.z-target.z)>(n==='device'?2.3:environmentLayout.interactionRadius))return null;
  let result=null;
  if(id==='science')result=campusAct(inner,n,type,text,pos,localLayout);
  else if(type==='discover'){if(state.stage==='pickup')state.discovered=true;}
  else if(type==='pickup'){if(state.discovered)cafeAct(inner,'bag','pickup');}
  else if(type==='mission'||type==='say'||type==='deliver')result=cafeAct(inner,n,type,text);
  sync();if(result)state.records[n]=result;return result;
 }};
}

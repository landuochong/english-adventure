import {cafeConfig} from './cafe-config.js';
import {generatedTurn} from './generated-story.js';
export function cafeState(){return {started:false,step:0,draft:null,owner:null,reported:false,complete:false};}
export function cafeAct(s,actor,type,text=''){
 if(s.complete)return cafeConfig.actions[3].reply;
 if(type==='mission'&&actor==='lily'&&!s.started){s.started=true;return cafeConfig.mission;}
 if(!s.started)return {en:'Please listen to Lily first.',zh:'先听 Lily 的委托。'};
 if(type==='pickup'){if(actor==='bag'&&s.step===3&&s.owner==='counter')s.owner='student';return null;}
 if(type==='deliver'){if(actor==='lily'&&s.owner==='student'&&s.reported){s.owner='lily';s.complete=true;return cafeConfig.actions[3].reply;}return {en:'Please bring the lunch and tell me what you have brought.',zh:'请带来午餐，并告诉我你带来了什么。'};}
 const a=cafeConfig.actions[s.step],expected=a.npc==='npc1'?'lily':'waiter';
 if(actor!==expected)return {en:'Listen to what you have heard, or ask Nova for help.',zh:'可以重听已获信息，或者问 Nova。'};
 if(s.step===3&&s.owner!=='student')return {en:'Please collect the lunch from the counter first.',zh:'请先去柜台拿取午餐。'};
 const r=generatedTurn(a.slots,s.draft,text);s.draft=r.draft;
 if(!r.complete)return r.response;
 s.draft=null;
 if(s.step===3){s.reported=true;return {en:'Thank you. Please hand me the lunch.',zh:'谢谢，请把午餐交给我。'};}
 s.step++;if(s.step===3)s.owner='counter';return a.reply;
}
export function cafeHint(s){return !s.started?cafeConfig.intro:s.step===3?(s.owner==='counter'?{en:'Your order is ready. Walk to the bag and pick it up yourself.',zh:'订单好了，走到餐袋旁亲自拿取。'}:s.reported?{en:'Now hand Lily the lunch.',zh:'现在亲自交给 Lily。'}:cafeConfig.actions[3].hint):cafeConfig.actions[s.step].hint;}

// A marker reflects this person's current task, not just proximity.
export function cafeMarker(s,id){
 if(id==='nova')return 'coach';
 if(s.complete)return 'done';
 if(id==='lily'){
  if(!s.started||s.step===1||s.step===3&&s.owner==='student'&&!s.reported)return 'ask';
  return 'text';
 }
 if(id==='waiter'){
  if(!s.started)return 'idle';
  if(s.step===0||s.step===2)return 'ask';
  return s.owner==='student'||s.owner==='lily'?'done':'text';
 }
 return 'idle';
}

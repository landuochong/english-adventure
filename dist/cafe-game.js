import {sandwichAtCounter} from './sandwich-order.js';
import {cafeConfig} from './cafe-config.js';
import {generatedTurn} from './generated-story.js?v=counter-details-20261118';
export function cafeState(){return {started:false,step:0,draft:null,owner:null,reported:false,complete:false};}
export function cafeAct(s,actor,type,text='',config=cafeConfig){
 const last=config.actions.length-1;
 if(s.complete)return config.actions[last].reply;
 if(type==='mission'&&actor==='lily'&&!s.started){s.started=true;return config.mission;}
 if(!s.started)return {en:'Please listen to Lily first.',zh:'先听 Lily 的委托。'};
 if(type==='pickup'){if(actor==='bag'&&s.step===last&&s.owner==='counter')s.owner='student';return null;}
 if(type==='deliver'){if(actor==='lily'&&s.owner==='student'&&s.reported){s.owner='lily';s.complete=true;return config.actions[last].reply;}return {en:'Please bring the lunch and tell me what you have brought.',zh:'请带来午餐，并告诉我你带来了什么。'};}
 const a=config.actions[s.step],expected=a.npc==='npc1'?'lily':'waiter';
 if(actor==='lily'&&a.earlyReportReply){
  const replacement=config.actions[s.step+1];
  const report=replacement.slots.find(slot=>slot.intent==='report');
  const result=generatedTurn([report],null,replacement.prepareInput?.(text)??text);
  if(result.complete){
   s.earlyReport={[report.key]:report.expected};
   return a.earlyReportReply;
  }
  return {en:'Kai can tell you what else is available. Talk to him, then come back and tell me what changed.',zh:'Kai 知道还有什么可选。问过他以后，再回来告诉我发生了什么。'};
 }
 function advance(){
  s.draft=a.earlyReportReply&&s.earlyReport?{values:s.earlyReport}:null;
  if(a.earlyReportReply)delete s.earlyReport;
  s.step++;
  if(s.step===last)s.owner='counter';
 }
 if(actor!==expected)return {en:'Listen to what you have heard, or ask Nova for help.',zh:'可以重听已获信息，或者问 Nova。'};
 if(s.step===last&&s.owner!=='student')return {en:'Please collect the lunch from the counter first.',zh:'请先去柜台拿取午餐。'};
 // A direct order can reveal availability; asking for the menu is not mandatory.
 const orderText=String(text).trim().replace(/\bI[’']d like\b/gi,'I would like');
 const chickenOrder=actor==='waiter'?sandwichAtCounter(orderText)==='chicken':generatedTurn([{key:'food',intent:'request',expected:'chicken',question:{en:'What would you like?',zh:'想要什么？'},options:[{value:'chicken',aliases:['chicken sandwich','chicken sandwiches']}]}],null,orderText).complete;
 if(chickenOrder&&actor==='waiter'&&s.step===0){s.draft=null;s.step++;return a.reply;}
 if(chickenOrder&&a.id==='alternatives'){
  // A repeated order is a cue to offer an available option instead of repeating the question.
  advance();
  return {en:'Chicken is still sold out. '+a.reply.en,zh:'鸡肉三明治仍然售罄。'+a.reply.zh};
 }
 if(chickenOrder&&actor==='lily'&&a.id==='step2'&&a.prepareInput){
  return {en:'Kai takes the orders. What did Kai say about the chicken sandwiches? Tell me what changed, then ask me about a replacement.',zh:'Kai 负责点餐。他刚才怎么说鸡肉三明治的？先告诉我发生了什么，再和我商量换什么。'};
 }
 if(chickenOrder&&actor==='waiter'&&a.kind==='collect')return {en:'The chicken sandwiches are still sold out. Lily chose cheese instead. Please order the cheese sandwich for her.',zh:'鸡肉三明治仍然售罄。Lily 已经选了奶酪三明治，请帮她点替代餐点。'};
 const r=generatedTurn(a.slots,s.draft,a.prepareInput?.(orderText)??orderText,a.acceptRequestDetails);s.draft=r.draft;
 if(!r.complete){
  const report=a.reportAcknowledged&&a.slots.find(slot=>slot.intent==='report');
  if(report&&r.draft.values[report.key]===report.expected&&!r.draft.pending)return a.reportAcknowledged;
  return r.response;
 }
 if(s.step===last){s.draft=null;s.reported=true;return {en:'Thank you. Please hand me the lunch.',zh:'谢谢，请把午餐交给我。'};}
 advance();return a.reply;
}
export function cafeHint(s,config=cafeConfig){const last=config.actions.length-1;return !s.started?config.intro:s.step===last?(s.owner==='counter'?{en:'Your order is ready. Walk to the bag and pick it up yourself.',zh:'订单好了，走到餐袋旁亲自拿取。'}:s.reported?{en:'Now hand Lily the lunch.',zh:'现在亲自交给 Lily。'}:config.actions[last].hint):config.actions[s.step].hint;}

export function cafeMarker(s,id,config=cafeConfig){
 if(id==='nova')return 'coach';if(!['lily','waiter'].includes(id))return 'idle';if(s.complete)return 'done';
 if(!s.started)return id==='lily'?'ask':'idle';
 const last=config.actions.length-1,expected=config.actions[s.step].npc==='npc1'?'lily':'waiter';
 if(id==='lily'&&config.actions[s.step].earlyReportReply)return 'ask';
 if(id===expected&&!s.reported&&(s.step!==last||s.owner==='student'))return 'ask';
 return id==='waiter'&&s.owner==='student'?'done':'text';
}

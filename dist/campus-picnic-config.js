import {sandwichAtCounter} from './sandwich-order.js';
import {cafeConfig} from './cafe-config.js';
export const picnicConfig=structuredClone(cafeConfig);
picnicConfig.actions[0].reply={en:'I am sorry, the chicken sandwiches are sold out today. You can ask me what else we have.',zh:'抱歉，今天鸡肉三明治售罄了。你可以问我还有哪些选择。'};
picnicConfig.actions.splice(1,0,{
 id:'alternatives',npc:'npc2',kind:'ask',label:'了解其他选择',
 reply:{en:'We have cheese sandwiches. You can choose the ingredients and a drink. Please check with Lily before you order.',zh:'我们有奶酪三明治，可以选择配料和饮料。点餐前请先和 Lily 商量。'},
 hint:{en:'The first choice is not available. What could you ask the waiter before going back to Lily?',zh:'原来的选择没有了。回去找 Lily 前，还可以向店员了解什么？'},
 slots:[{key:'slot1',intent:'question',expected:'alternative',question:{en:'What else would you like to know about the menu?',zh:'还想了解菜单里的其他选择吗？'},options:[{value:'alternative',aliases:['what else','anything else','other food','other sandwiches','alternatives','available','cheese','what do you have','what can I order','what can we order','what do you recommend']}]}]
});

const discussReplacement=picnicConfig.actions.find(action=>action.id==='step2');
discussReplacement.slots[0].question.zh='鸡肉三明治怎么了？';
discussReplacement.reportAcknowledged={
 en:'Oh, the chicken sandwiches are sold out. Thanks for telling me. What else do they have?',
 zh:'哦，鸡肉三明治售罄了。谢谢你告诉我。他们还有什么？'
};
picnicConfig.actions.find(action=>action.id==='alternatives').earlyReportReply={
 en:'Oh, the chicken sandwiches are sold out. Thanks for telling me. Please ask Kai what else is available, then come back.',
 zh:'哦，鸡肉三明治售罄了。谢谢你告诉我。先问 Kai 还有什么，再回来跟我商量。'
};
// Convert only a supported fact or choice into evidence for the two mission slots.
const stockChange=/\b(?:sold out|out of stock|unavailable|(?:ran|run) out|out of chicken|no chicken)\b/;
const negated=/\b(?:not|never|no|cannot|without)\b|n't\b/;
const uncertain=/\b(?:if|whether|wonder|maybe|might)\b/;
const choiceQuestion=/\b(?:what|which)\b.*\b(?:like|want|prefer|instead)\b|\bwould you like to (?:change|switch)\b/;

function reportsChickenShortage(words,raw){
 if(!stockChange.test(words)||raw.includes('?')||uncertain.test(words))return false;
 if(/^(?:is|are|was|were|did|has|have|what|why|when|will)\b/.test(words))return false;
 if(negated.test(words.replace(/\bno chicken\b/g,'chicken')))return false;
 if(/\b(?:cheese|tuna|beef|ham|turkey|water|onions?)\b/.test(words))return false;
 return /\bchicken\b/.test(words)||/\b(?:they(?:'d| had| have)? (?:run|ran) out|(?:they|it) (?:are|is|were|was) sold out)(?: today)?$/.test(words)||/^(?:all )?sold out(?: today)?$/.test(words);
}

function offersCheese(words){
 if(!/\bcheese\b/.test(words)||/\b(?:do they|does .* have|are there|is there|if|whether)\b/.test(words))return false;
 // “Why not try” invites the listener to choose. Other negatives need clarification.
 const offer=words.replace(/\bwhy (?:not|don't you) try\b/,'try');
 if(negated.test(offer)||stockChange.test(offer)||/\b(?:allergic|allergy|hate|dislike|avoid)\b/.test(offer))return false;
 return /\b(?:try|recommend|suggest|instead|available|offer|choose|how about|what about|would you like|do you want|they have|they still have|we have|there is|there's)\b/.test(offer)
  || /^(?:(?:a|the|some) )?cheese(?: sandwich(?:es)?)?(?: please)?$/.test(offer);
}

discussReplacement.prepareInput=text=>{
 const clean=String(text).toLowerCase().replace(/[’‘]/g,"'").replace(/\b(?:um+|uh+|erm+)\b/g,' ').replace(/\.{2,}|…/g,' ');
 // ASR often omits punctuation between the report and the recommendation.
 const separated=clean.replace(/\b(out(?: today)?|chicken(?: sandwiches?)?)\s*,?\s+(?:and\s+)?(?=(?:what|which|would|you (?:can|could|should) try|they have|they still have)\b)/g,'$1. ');
 const clauses=separated.split(/(?<=[.!?;])|\bbut\b|(?:,|\band\b)\s*(?=(?:i (?:recommend|suggest)|you (?:can|could|should)|they (?:still )?have)\b)/);
 const evidence=[];
 for(const raw of clauses){
  const words=raw.replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim();
  if(reportsChickenShortage(words,raw))evidence.push('The chicken is sold out.');
  if(offersCheese(words)||(!negated.test(words)&&choiceQuestion.test(words)))evidence.push('What would you like instead?');
 }
 return evidence.join(' ');
};
const order=picnicConfig.actions.find(action=>action.id==='step3');
// At the counter, the named replacement supplies the context for food and drink details.
order.acceptRequestDetails=clause=>sandwichAtCounter(clause)==='cheese';
order.reply={
 en:'Your cheese sandwich without onions and water are ready. Please pick up the lunch at the pickup counter and take it to Lily.',
 zh:'不加洋葱的奶酪三明治和水已经准备好了。请到取餐台领取午餐，再送给 Lily。'
};

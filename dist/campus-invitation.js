// Sue and Tim share one invitation. Each fact is independent of conversation order.
import {dailyScenes} from './scene-engine.js?v=invite-report-1';
const pair=(en,zh)=>({en,zh});
const topics=['sport','availability','book','tell_time','invite','report'];
const timeIn=t=>{
 const two=/\b(two|2)\b/.test(t),three=/\b(three|3)\b/.test(t);
 return two===three?null:two?'two':'three';
};
export function createInvitationMission(config,layout,difficulty){
 const advanced=difficulty===2,story=dailyScenes.hobbies;
 if(advanced)config={...config,title:'泳池的时间换了',words:[...config.words,'book a time','afternoon']};
 const f={sport:false,availability:false,booked:null,told:false,accepted:false};
 const state={stage:'brief',complete:false,owner:null,records:{},facts:f,advancedStep:advanced?0:null};
 let swim=false,sunday=false;
 function hint(){
  if(state.stage==='brief')return pair('Find Tim in the sports area.','在运动区找到 Tim。');
  if(!f.sport)return pair('Ask Sue about her favourite sport.','问 Sue 最喜欢什么运动。');
  if(advanced&&!f.booked)return pair('Find a time with Sue and book it with Tim.','和 Sue 商量时间，请 Tim 预约。');
  if(advanced&&!f.told)return pair('Tell Sue what time Tim booked.','告诉 Sue 预约的时间。');
  return f.accepted?pair('Tell Tim what Sue said.','告诉 Tim 邀请结果。'):pair('Invite Sue to swim this Sunday.','邀请 Sue 周日游泳。');
 }
 function respond(npc,text,proposal){
  const t=text.toLowerCase().replace(/’/g,"'"),time=timeIn(t);
  const negative=/\b(not|never|no|maybe|if|cannot|unsure)\b|n't\b/.test(t);
  const sport=story.actions[0].test(t),schedule=/\b(when|time|free|available|afternoon|morning)\b/.test(t);
  const invite=!/^(?:when|what time|where|which|what's|what is)\b/.test(t)&&/\b(join|invite|would you|with (?:us|me)|let's|shall we|want to come)\b/.test(t);
  const report=story.actions[2].test(t.replace(/[.!?,]/g,' ').replace(/\s+/g,' ').trim(),text);
  const modelTopics=new Set(proposal?.topics||[]);
  if(proposal){
   if(!/basketball/i.test(proposal.en)||schedule&&!sport&&!/sport|play|game|hobb/i.test(t))modelTopics.delete('sport');
   if(!/two|three|afternoon|[23]/i.test(proposal.en)||sport&&!schedule)modelTopics.delete('availability');
   if(schedule&&!invite)modelTopics.delete('invite');
  }
  // A short time reply or direct invitation does not also answer unrelated questions.
  if(npc==='sue'&&(time&&!schedule&&!sport||invite&&!schedule&&!sport)){
   modelTopics.delete('sport');modelTopics.delete('availability');
  }
  const has=(name,local)=>modelTopics.has(name)||local;
  const parts=[];let answeredInvitation=false;
  if(npc==='sue'){
   if(!negative&&has('sport',sport)){f.sport=true;parts.push(pair('Basketball is my favourite!','我最喜欢篮球！'));}
   if(!negative&&has('availability',schedule)){f.availability=true;parts.push(pair('I am free on Sunday afternoon, at two or three.','周日下午两点或三点我都有空。'));}
   if(advanced&&f.booked&&time&&!negative&&has('tell_time',!text.includes('?'))){
    f.told=time===f.booked||f.told;
    parts.push(time===f.booked?pair('See you at '+time+'.','记住约好的时间了。'):pair('What time did Tim book?','Tim 订的是几点？'));
   }
   if(!negative&&(has('invite',invite)||swim!==sunday&&!sport&&!schedule)){
    swim ||= /\bswim(?:ming)?\b/.test(t);sunday ||= /\bsunday\b/.test(t);
    if(swim&&sunday){answeredInvitation=true;f.accepted=true;parts.push(pair('Yes! I would love to swim on Sunday. Please tell Tim.','好呀，我愿意周日游泳。请告诉 Tim。'));}
    else if(invite||modelTopics.has('invite'))parts.push(swim?pair('Which day shall we swim?','哪天去游泳？'):pair('What would you like to do together?','你想一起做什么活动？'));
   }
  }else{
   if(advanced&&!negative&&time&&has('book',/\b(book|reserve)\b/.test(t)||/^(two|three|2|3)[.! ]*$/.test(t))){
    if(time!==f.booked)f.told=false;
    f.booked=time;parts.push(pair('Booked for '+time+'. Please tell Sue.','订好了。把时间告诉 Sue 吧。'));
   }
   if(!negative&&!text.includes('?')&&(report||modelTopics.has('report')&&/\b(sue|she|he|they|yes)\b/.test(t)&&!/^(?:does|did|will|would|can|could|is|has)\b/.test(t))){
    if(f.accepted&&f.sport&&(!advanced||f.booked&&f.told)){
     state.complete=true;state.stage='complete';
     parts.push(pair('Great! Sue is joining us on Sunday'+(f.booked?' at '+f.booked:'')+'. See you at the pool!','太好了，Sue 周日会加入。泳池见！'));
    }else parts.push(f.accepted?hint():pair('Has Sue accepted the invitation yet?','Sue 已经答应邀请了吗？'));
   }
  }
  state.advancedStep=advanced&&!f.told?(f.booked?2:f.availability?1:0):null;
  const fallback=parts.length?pair(parts.map(p=>p.en).join(' '),parts.map(p=>p.zh).join(' ')):hint();
  if(proposal&&!negative){
   const en=proposal.en.toLowerCase();
   const faithful=(!answeredInvitation||/\b(?:yes|sure|gladly|count me in|i(?:'d| would) (?:love|like) to|i(?:'ll| will) (?:come|join)|i accept)\b/.test(en))
    &&(!parts.some(p=>p.en.includes('favourite'))||/basketball/.test(en))
    &&(!parts.some(p=>p.en.includes('free on'))||/two|2/.test(en)&&/three|3/.test(en))
    &&(!modelTopics.has('book')||npc==='tim'&&time&&time===f.booked&&timeIn(en)===time)
    &&(!modelTopics.has('tell_time')||npc==='sue'&&f.told&&time===f.booked)
    &&(!modelTopics.has('report')||state.complete)
    &&(!modelTopics.has('invite')||npc==='sue'&&(f.accepted||en.includes('?')))
    &&(!state.complete||/sue|she/i.test(en)&&(!f.booked||timeIn(en)===f.booked));
   if(faithful)return {en:proposal.en.replace(/^\s*\[|\]\s*$/g,''),zh:proposal.zh,model:proposal.model};
  }
  return fallback;
 }
 return {config,state,hint,get clueStep(){return JSON.stringify([state.stage,...Object.values(f),swim,sunday]);},
  get keyword(){return !f.sport?'sport':advanced&&!f.booked?'time':f.accepted?'report':'invite';},
  marker(n){return !config.people.includes(n)?'idle':state.complete?'done':state.stage==='brief'&&n!=='tim'?'idle':'ask';},
  act(n,type,text,pos,clear=()=>true){
   const target=layout.people[n];
   if(!config.people.includes(n)||!pos||!clear(target)||Math.hypot(pos.x-target.x,pos.z-target.z)>layout.interactionRadius)return null;
   if(type==='greet'||type==='say'&&/^(hi|hey|hello)[.! ]*$/i.test(text))return pair('Hello! What would you like to know?','你好，想了解什么？');
   if(type==='say'&&/\b(again|repeat|slower)\b/i.test(text))return state.records[n]||hint();
   let r;
   if(type==='mission'&&n==='tim'&&state.stage==='brief'){
    state.stage='conversation';r=advanced?pair(story.mission.en+' Please book an afternoon time with me and tell Sue.',story.mission.zh+' 请向我预约下午的时间，并转告 Sue。'):story.mission;
   }else if(state.stage==='brief')return hint();
   else if(state.complete)return config.thanks;
   else if(type==='say')r=respond(n,text);
   else if(type==='invitation-turn'){
    const turn=JSON.parse(text);
    if(typeof turn.student!=='string'||typeof turn.en!=='string'||typeof turn.zh!=='string'||!Array.isArray(turn.topics)||!turn.topics.every(x=>topics.includes(x)))return null;
    r=respond(n,turn.student,turn);
   }else return null;
   state.records[n]=r;return r;
  }
 };
}

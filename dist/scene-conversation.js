// Scripted, task-scoped clarification. Never silently replace the raw transcript.
const slot=(key,expected,question,zh,choices,ambiguity)=>({key,expected,question,zh,choices,ambiguity});
export const conversationPlans={
 'school.borrow':[
  slot('book','maths','Which book would you like to borrow?','你想借哪本书？',[[/\b(math|maths|mathematics)\s*(book|textbook)\b/,'maths'],[/\b(english|science|history)\s*(book|textbook)\b/,'other']],{pattern:/\bmac\s*book\b/,value:'maths',en:'Do you mean my maths book?',zh:'你是说我的数学课本吗？'})],
 'restaurant.order':[
  slot('food','chicken','What would you like to eat?','你想吃什么？',[[/\bchicken\s+sandwich\b/,'chicken'],[/\b(tuna|beef|cheese)\s+sandwich\b|\bpizza\b/,'other']]),
  slot('onions','without','Would you like onions?','你要加洋葱吗？',[[/\b(no|without)\s+(any\s+|the\s+)?onions?\b/,'without'],[/\b(with|add|extra)\s+(some\s+)?onions?\b/,'with']],{pattern:/\bwithout\s+(the\s+)?audience\b/,value:'without',en:'Did you say no onions? Is that right?',zh:'你说的是不要洋葱，对吗？'}),
  slot('drink','water','What would you like to drink?','你想喝什么？',[[/\bwater\b/,'water'],[/\b(juice|cola|coffee|tea)\b/,'other']])],
 'shopping.buy':[
  slot('item','cap','What would you like to buy?','你想买什么？',[[/\bcap\b/,'cap'],[/\b(shirt|shoes|coat)\b/,'other']]),
  slot('colour','blue','Which colour would you like?','你想要什么颜色？',[[/\bblue\b/,'blue'],[/\b(red|green|black|white)\b/,'other']]),
  slot('size','medium','Which size would you like?','你想要什么尺码？',[[/\bmedium\b/,'medium'],[/\b(small|large)\b/,'other']])],
 'directions.bus':[
  slot('question','museum','Where do you want to go? Ask me about a bus or the way there.','你要去哪里？可以问我公交或路线。',[[/^(?=.*\b(what|where|when|which|how|have|has|do|does|did|can|could|may|is|are|will|would|tell)\b)(?=.*\b(bus|way|get|go)\b)(?=.*\bmuseum\b)(?!.*\bboss\b)/,'museum']],{pattern:/^(?=.*\b(which|what|how|can|could)\b)(?=.*\bboss\b)(?=.*\bmuseum\b)/,value:'museum',en:'Do you mean which bus goes to the museum?',zh:'你是想问哪路公交车去博物馆吗？'})],
 'directions.route':[
  slot('bus','five','Which bus should I take?','我应该坐哪路公交？',[[/\b(bus\s*(number\s*)?(five|5)|(number\s*)?(five|5)\s+bus)\b|^(five|5)( please)?$/,'five'],[/\bbus\s*(number\s*)?(six|6|four|4)\b/,'other']]),
  slot('stop','library','Where should I get off?','我应该在哪里下车？',[[/\b(get off|stop|off at)\b.*\blibrary\b|^(at )?(the )?library( please)?$/,'library'],[/\b(get off|stop|off at)\b.*\b(park|school|station)\b/,'other']]),
  slot('location','next','Where is the museum in relation to the library?','博物馆在图书馆的什么位置？',[[/\b(next to|beside)\b.*\b(the )?library\b/,'next'],[/\b(opposite|behind|far from)\b/,'other']])],
 'weather.invite':[
  slot('place','park','Where would you like me to go?','你想邀请我去哪里？',[[/\bpark\b/,'park'],[/\b(cafe|museum|school)\b/,'other']]),
  slot('day','saturday','Which day are we going?','我们哪天去？',[[/\bsaturday\b/,'saturday'],[/\b(sunday|monday|friday)\b/,'other']]),
  slot('bring','kite','What should I bring?','我应该带什么？',[[/\bkite\b/,'kite'],[/\b(ball|book|bike)\b/,'other']])],
 'hobbies.invite':[
  slot('activity','swimming','What would you like to do together?','你想一起做什么？',[[/\bswim(ming)?\b/,'swimming'],[/\b(basketball|running|football)\b/,'other']]),
  slot('day','sunday','Which day would you like to go?','你想哪天去？',[[/\bsunday\b/,'sunday'],[/\b(saturday|monday|friday)\b/,'other']])]
};
const yesReply=t=>/^(yes|yeah|yep|correct|right|that'?s right|yes that'?s right|yes please)(\s+please)?$/.test(t);
const noReply=t=>/^(no|nope|no thanks|no thank you|that'?s wrong)$/.test(t);
export function conversationQuestion(plan,draft){
 const field=plan.find(f=>f.key===draft.pending);
 if(field)return {en:field.ambiguity.en,zh:field.ambiguity.zh};
 const missing=plan.find(f=>draft.values[f.key]!==f.expected);
 if(!missing)return null;
 draft.asked=missing.key;
 return {en:(draft.values[missing.key]?'That does not match your friend’s request. Let us check that part. ':'')+missing.question,zh:(draft.values[missing.key]?'这和同伴的需求不一致，我们再确认这一项。':'')+missing.zh};
}
export function restoreConversation(key,raw){
 const plan=conversationPlans[key];if(!plan||!raw)return null;
 const d={values:{},pending:null,asked:null};
 for(const f of plan)if(f.choices.some(([,value])=>value===raw.values?.[f.key]))d.values[f.key]=raw.values[f.key];
 if(plan.some(f=>f.key===raw.pending&&f.ambiguity))d.pending=raw.pending;
 if(plan.some(f=>f.key===raw.asked))d.asked=raw.asked;
 return d;
}
export function continueConversation(key,draft,text){
 const plan=conversationPlans[key];const d=draft||{values:key==='shopping.buy'?{item:'cap',colour:'blue'}:{},pending:null,asked:null};
 const t=text.replace(/^(no\s+)?(sorry\s+)?i (meant|mean)\s+/,'').replace(/^no\s+(actually\s+)?(?=(water|blue|medium|saturday|sunday|without|maths|mathematics)\b)/,'').replace(/\b(i )?(do not|don't) want (any )?onions?\b/g,'no onions');
 // Broad negation is not confirmation; only the specific no-onions construction is allowed.
 if(/\b(not|never|don't|doesn't|didn't|can't|cannot|won't)\b/.test(t))return {draft:d,response:conversationQuestion(plan,d),complete:false};
 if(key==='school.borrow'&&!draft&&!/\b(borrow|lend|use|have)\b/.test(t)&&!/\bplease\b/.test(t))return {draft:d,response:conversationQuestion(plan,d),complete:false};
 const hadPending=!!d.pending;
 if(d.pending){
  const f=plan.find(f=>f.key===d.pending);
  if(yesReply(t)){d.values[f.key]=f.ambiguity.value;d.pending=null;}
  else if(noReply(t)){delete d.values[f.key];d.pending=null;d.asked=f.key;return {draft:d,response:{en:'Okay. '+f.question,zh:'好的，'+f.zh},complete:false};}
 }
 // A short yes/no answers only an explicit question about onions, never an entire task.
 if(!hadPending&&!d.pending&&key==='restaurant.order'&&d.asked==='onions'){
  if(noReply(t))d.values.onions='without';
  else if(yesReply(t))d.values.onions='with';
 }
 const plausible=key==='directions.bus'||/\b(can|could|may|would|please|like|want|need|borrow|lend|take|go|come|join|get|bring|here|is)\b/.test(t)||t.split(' ').length<=6;
 if(plausible){
  for(const f of plan){
   const values=[...new Set(f.choices.filter(([re])=>re.test(t)).map(([,v])=>v))];
   if(values.length===1){d.values[f.key]=values[0];if(d.pending===f.key)d.pending=null;}
   else if(values.length>1){delete d.values[f.key];d.pending=null;d.asked=f.key;}
   if(f.ambiguity?.pattern.test(t)){delete d.values[f.key];d.pending=f.key;}
  }
  // 'It' refers only to the blue cap whose price was established in the preceding turn.
  if(key==='shopping.buy'&&/\b(it|this|that)\b/.test(t)){d.values.item??='cap';d.values.colour??='blue';}
 }
 const response=conversationQuestion(plan,d);
 return {draft:d,response,complete:!response};
}

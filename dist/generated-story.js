// Declarative story format: no generated JavaScript, HTML or regular expressions.
export const norm=t=>String(t).toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9' -]/g,' ').replace(/\s+/g,' ').trim();
export const contains=(text,phrase)=>(' '+norm(text)+' ').includes(' '+norm(phrase)+' ');
const pair=p=>p&&typeof p.en==='string'&&p.en.trim()&&p.en.length<=1500&&typeof p.zh==='string'&&p.zh.trim()&&p.zh.length<=1500;
export function validateStory(c,learning=[]){try{return checkConfig(c,learning);}catch{return ['故事字段类型不正确，请检查完整配置'];}}
function checkConfig(c,learning=[]){
 const errors=[],bad=m=>errors.push(m),str=(s,n=300)=>typeof s==='string'&&s.trim()&&s.length<=n;
 if(!c||typeof c!=='object')return ['故事必须是配置对象'];
 if(!str(c.title,100)||!str(c.hook)||!str(c.background,2000))bad('请填写标题、无剧透简介和故事背景');
 if(!['cafe','classroom','town','shop','park','sports'].includes(c.theme))bad('请选择已有地图');
 const npcs=c.npcs;if(!Array.isArray(npcs)||npcs.length<2||npcs.length>3)return [...errors,'需要 2～3 个人物'];
 const ids=npcs.map(n=>n.id);if(ids.some(id=>!/^npc[123]$/.test(id))||new Set(ids).size!==ids.length)bad('人物 ID 必须唯一，使用 npc1/npc2/npc3');
 for(const n of npcs)if(!str(n.name,60))bad('人物需要姓名');
 if(!ids.includes(c.giver)||!pair(c.mission)||!pair(c.intro))bad('委托人、任务或教练开场不完整');
 if(!Array.isArray(c.actions)||c.actions.length<3||c.actions.length>4)return [...errors,'需要 3～4 个互动步骤，加上领取任务共 4～5 个情节'];
 const stepIds=c.actions.map(a=>a.id);if(stepIds.some(id=>!/^step[1-4]$/.test(id))||new Set(stepIds).size!==stepIds.length)bad('步骤 ID 必须唯一，使用 step1～step4');
 if(c.actions.at(-1).npc!==c.giver)bad('最后一步需回到委托人处汇报');
 if(!c.actions.some(a=>a.kind==='change'))bad('至少需要一次信息变化');
 if(c.actions.at(-1).kind!=='report')bad('最后一步必须为汇报');
 c.actions.forEach((a,i)=>{
  if(!ids.includes(a.npc)||!str(a.label,100)||!str(a.event,1000)||!pair(a.reply)||!pair(a.hint))bad(`情节 ${i+1} 的人物、事件或台词不完整`);
  if(!['ask','change','collect','report'].includes(a.kind))bad('不支持的交互类型');
  if(!Array.isArray(a.slots)||!a.slots.length||a.slots.length>4){bad(`情节 ${i+1} 需要 1～4 个信息项`);return;}
  const keys=a.slots.map(s=>s.key);if(keys.some(k=>!/^slot[1-4]$/.test(k))||new Set(keys).size!==keys.length)bad('信息项 ID 必须唯一，使用 slot1～slot4');
  for(const s of a.slots){
   if(!pair(s.question)||!Array.isArray(s.options)||s.options.length<1||s.options.length>6){bad('信息项追问或选项不完整');continue;}
   if(!['question','request','report','answer'].includes(s.intent))bad('信息项意图无效');
   const options=s.options.map(o=>o.value);if(new Set(options).size!==options.length||!options.includes(s.expected))bad('信息项需要唯一选项和有效预期值');
   for(const o of s.options)if(!str(o.value,60)||!Array.isArray(o.aliases)||!o.aliases.length||o.aliases.length>12||o.aliases.some(x=>!str(x,100)||!/[a-z]/i.test(x)))bad('每个选项需有有效英语表达');
   const source=s.source==='mission'?c.mission:c.actions.slice(0,i).find(x=>x.id===s.source)?.reply;
   if(!source||!s.options.find(o=>o.value===s.expected)?.aliases.some(alias=>literalMatch(norm(source.en),alias)))bad(`情节 ${i+1} 的要求缺少可提前听到的来源：${s.key}`);
  }
 });
 if(!c.actions.some(a=>a.slots?.length>=2))bad('至少一个步骤需要多轮信息收集');
 if(!Array.isArray(c.coverage))bad('缺少课程重点覆盖表');
 else for(const item of learning)if(!c.coverage.some(m=>m.learning_id===item.id&&['intro','mission',...stepIds].includes(m.step)&&str(m.practice,400)))bad('课程重点未安排练习：'+item.term);
 if(!Array.isArray(c.additions)||c.additions.length>20||c.additions.some(x=>!str(x.term,100)||!str(x.meaning,300)))bad('补充表达格式无效');
 if(!errors.length)for(const [i,a] of c.actions.entries()){
  let result={draft:null,complete:false};
  for(const slot of a.slots){
   const option=slot.options.find(o=>o.value===slot.expected),prefix={question:'Could you tell me about ',request:'I would like ',report:'Here is ',answer:''}[slot.intent];
   for(const alias of option.aliases){result=generatedTurn(a.slots,result.draft,prefix+alias);if(result.draft.values[slot.key]===slot.expected)break;}
  }
  if(!result.complete)bad(`情节 ${i+1} 的交互条件无法通过，请重新编排可接受表达`);
 }
 return [...new Set(errors)];
}
const intentMatch=(t,intent)=>intent==='answer'||(intent==='question'?/^(what|where|when|which|how|can|could|do|does|is|are|have|would|tell)\b|^please tell\b|^i (would like|want|need) to know\b/:intent==='request'?/^(can|could|may|please|let)\b|^i (would like|want|need|will take)\b|\bplease$/:/\b(here|have|got|ready|found|ordered|brought|is|are|can|will|said)\b/).test(t);
const shortAnswer=(t,s)=>s.options.some(o=>o.aliases.some(a=>[norm(a),norm(a)+' please','the '+norm(a),'a '+norm(a),'a '+norm(a)+' please'].includes(t)));
function literalMatch(text,alias){
 const words=norm(text).split(' '),target=norm(alias).split(' ');
 if(!target.some(w=>!['not','no','but','yes','the','a','an','from','is','are','it'].includes(w)))return false;
 for(let i=0;i<=words.length-target.length;i++){
  if(!target.every((w,j)=>words[i+j]===w))continue;
  const before=words.slice(0,i),contrast=before.lastIndexOf('but'),segment=before.slice(contrast+1);
  if(segment.some(w=>['never',"don't","doesn't","didn't","can't",'cannot',"won't"].includes(w))||/\bdo not\b/.test(segment.join(' ')))continue;
  const context=segment.slice(segment.lastIndexOf('and')+1);
  if(!context.some(w=>['not','no','without','never',"don't","doesn't","didn't","can't",'cannot',"won't"].includes(w)))return true;
 }
 return false;
}
export function generatedTurn(slots,raw,text){
 const d={values:{},asked:null,pending:null};
 for(const s of slots)if(s.options.some(o=>o.value===raw?.values?.[s.key]))d.values[s.key]=raw.values[s.key];
 if(slots.some(s=>s.key===raw?.pending))d.pending=raw.pending;
 if(slots.some(s=>s.key===raw?.asked))d.asked=raw.asked;
 let t=norm(text),correction=/^(no )?(sorry )?i (meant|mean)\b|^(sorry |no )?actually\b/.test(t);
 if(correction)t=t.replace(/^(no )?(sorry )?i (meant|mean)\s+|^(sorry |no )?actually\s+/,'');
 if(d.pending&&/^(yes|yes please|correct|right|that's right)$/.test(t)){d.pending=null;t='';}
 else if(d.pending&&/^(no|no thanks|that's wrong)$/.test(t)){delete d.values[d.pending];d.pending=null;t='';}
 // A yes/no response applies only to the last explicit with/without question.
 if(!d.pending&&d.asked&&/^(yes|yes please|no|no thanks|no thank you)$/.test(t)){
  const s=slots.find(s=>s.key===d.asked),negative=s?.options.filter(o=>o.aliases.some(a=>/\b(no|without)\b/.test(norm(a))))||[],positive=s?.options.filter(o=>o.aliases.some(a=>/\b(with|add)\b/.test(norm(a))))||[];
  if(negative.length===1&&positive.length===1){d.values[s.key]=t.startsWith('no')?negative[0].value:positive[0].value;t='';}
 }
 // Match an explicitly stated negative phrase, but never turn a negated positive into progress.
 if(t&&!/\b(if|maybe|perhaps)\b/.test(t)&&!/[\u3400-\u9fff]/.test(text)){
  for(const s of slots){
   const matched=s.options.filter(o=>o.aliases.some(a=>literalMatch(t,a)));
   if(matched.length>1){delete d.values[s.key];d.pending=s.key;continue;}
   if(matched.length===1&&(correction||intentMatch(t,s.intent)||(raw&&shortAnswer(t,s)))){
    const value=matched[0].value;
    if(d.values[s.key]&&d.values[s.key]!==value&&!correction){d.values[s.key]=value;d.pending=s.key;}
    else {d.values[s.key]=value;if(d.pending===s.key)d.pending=null;}
   }
  }
 }
 if(d.pending){const s=slots.find(s=>s.key===d.pending);return {draft:d,complete:false,response:{en:'Please confirm that detail, or say it again. '+s.question.en,zh:'请确认这一项，或重新说明。'+s.question.zh}};}
 const missing=slots.find(s=>d.values[s.key]!==s.expected);
 if(missing){d.asked=missing.key;return {draft:d,complete:false,response:{en:(d.values[missing.key]?'That does not match what you heard. ':'')+missing.question.en,zh:(d.values[missing.key]?'这和你听到的信息不一致。':'')+missing.question.zh}};}
 return {draft:d,complete:true,response:null};
}
export function compileStory(c,learning){
 const errors=validateStory(c,learning);if(errors.length)throw Error(errors.join('\n'));
 const positions=[[250,330],[760,330],[510,200]],icons=['👧','🧑‍💼','👦'];
 return {...c,generated:true,npcs:c.npcs.map((n,i)=>({...n,icon:icons[i],x:positions[i][0],y:positions[i][1]})),places:[['🌿','Meeting point',25,22],['🏠','Information desk',76,22],['🚪','Entrance',50,84]],phrases:learning.filter(x=>x.type==='phrases').map(x=>x.term),actions:c.actions.map(a=>({...a,generatedSlots:a.slots})),grammar:learning.filter(x=>x.type==='grammar')};
}
// One bounded correction pass; unresolved output stays a draft for the author.
export async function generateCheckedStory(request,payload,onRepair=()=>{}){
 let result=await request(payload),errors=validateStory(result.story,payload.learning);
 if(errors.length&&!payload.story){
  onRepair(errors);
  try{result=await request({...payload,story:result.story});errors=validateStory(result.story,payload.learning);}catch(e){return {...result,errors,repairError:e.message||'自动修复失败'};}
 }
 return {...result,errors};
}

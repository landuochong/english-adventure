export const NPCS = [
 {id:'organiser',name:'Mia · 科技节负责人',icon:'👩‍💼',x:180,y:385,location:'plaza'},
 {id:'librarian',name:'Ben · 图书管理员',icon:'👨‍🏫',x:465,y:315,location:'library',clue:'witness'},
 {id:'artist',name:'Amy · 美术社成员',icon:'👩‍🎨',x:815,y:340,location:'art',clue:'decoration'},
 {id:'technician',name:'Leo · 设备志愿者',icon:'👨‍🔧',x:690,y:410,location:'art',clue:'record'},
 {id:'pip',name:'Pip · 蓝灯机器人',icon:'🤖',x:510,y:170,location:'greenhouse'},
 {id:'athlete',name:'Max · 体育社成员',icon:'🧑‍🦱',x:400,y:505,location:'gym'}
];
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const bound=p=>({x:Math.max(35,Math.min(965,p.x)),y:Math.max(70,Math.min(550,p.y))});
export function visibleNPCs(s){return NPCS.filter(n=>n.id!=='pip'||s.discovered);}
export function canDiscover(s,p){return s.started&&s.clues.length===3&&!s.discovered&&distance(p,NPCS.find(n=>n.id==='pip'))<=85;}
export function nearest(p,s){return (s?visibleNPCs(s):NPCS).filter(n=>distance(n,p)<=85).sort((a,b)=>distance(a,p)-distance(b,p))[0]||null;}
export function step(p,target,amount){const d=distance(p,target);if(d<=amount)return bound(target);return bound({x:p.x+(target.x-p.x)/d*amount,y:p.y+(target.y-p.y)/d*amount});}
export function hasInformation(n,s){return n.clue?s.started&&!s.clues.includes(n.clue):n.id==='organiser'?!s.started||s.following&&!s.complete:n.id==='pip'?s.clues.length===3&&!s.following:false;}
export function intent(text){const t=text.toLowerCase().replace(/[’']/g,'').replace(/[^a-z\s]/g,' ');if(/\b(again|repeat|slower|slowly)\b/.test(t))return'repeat';if(/\b(follow|come with|lets go|let us go)\b/.test(t))return'follow';if(/\b(wake|button|turn on|switch on)\b/.test(t))return'wake';if(/\b(where|what|how|which|have|has|did|do|does|can|could|seen|see|tell|know|help|looking|find)\b/.test(t))return'question';return'unknown';}
export function reply(n,s,text){const i=intent(text);if(i==='repeat')return{repeat:true};if(i==='unknown')return{en:'Could you ask me a question? Try: Have you seen Pip?',zh:'试着向我提问，比如：Have you seen Pip?'};if(n.id==='organiser')return{en:s.complete?'Thank you for bringing Pip back!':'Pip is a small white robot with a blue light. Ask Ben at the library if he has seen it.',zh:s.complete?'谢谢你把 Pip 带回来！':'Pip 是白色小机器人，有蓝色灯。去图书馆问问 Ben。'};if(!s.started)return{en:'Please talk to Mia at the festival plaza first.',zh:'先到广场找 Mia 领取任务吧。'};if(n.id==='librarian')return{clue:'witness',en:'Yes! Pip went past the library, towards the art room.',zh:'见过！Pip 经过图书馆，向美术教室走去。'};if(n.id==='artist')return{clue:'decoration',en:'We carried a shiny decoration to the greenhouse. Pip followed us!',zh:'我们把闪亮的装饰物搬到了温室，Pip 跟着我们！'};if(n.id==='technician')return{clue:'record',en:'The record says: blue light flashing. Pip flashes blue when it follows something bright.',zh:'记录显示蓝灯闪烁。Pip 追逐明亮的东西时会闪蓝灯。'};if(n.id==='athlete')return{en:'I haven’t seen Pip here. You could ask Ben at the library.',zh:'我在这里没见过 Pip，可以去图书馆问 Ben。'};if(n.id==='pip'){if(s.clues.length<3)return{en:'Check the three witnesses first. Are you sure this is Pip?',zh:'先问过三位目击者，确认这就是 Pip。'};if(!s.awake)return{en:'Press the green button, then wait for the blue light.',zh:'按绿色按钮，等待蓝灯亮起。',reveal:true};if(i==='follow')return{follow:true,en:'Beep! I’ll follow you back to the plaza.',zh:'哔！我跟你回广场。'};return{en:'I’m ready! Say: Come with me, Pip.',zh:'我准备好了！邀请我跟你一起走吧。'};}}

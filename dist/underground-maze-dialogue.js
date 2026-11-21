import {clueText,lanternTiles,tileAt} from './underground-maze.js';

export const discoveries={
 a:['a triangle carving','三角刻纹'],b:['a diamond carving','菱形刻纹'],c:['a spiral carving','螺旋刻纹'],
 H:['a hammer','锤子'],T:['a pressure plate','压力踏板'],R:['a pile of cracked stones','裂开的石障'],
 V:['a valve','阀门'],G:['a powered gate','通电门'],P:['the amber prism','琥珀棱镜'],D:['a dangerous pressure plate','危险踏板']
};
const lines = {
 'd-warning':['Do not step on this plate. Take the side passage around it.','别踩这块踏板，从旁边的通道绕过去。'],
 'prism':['This is the amber prism. Take it back to the entrance stairs.','这是琥珀棱镜。把它带回入口楼梯。'],
 'hammer':['This hammer can break cracked stones. Take it with you.','这把锤子能敲开裂开的石头，可以带上。'],
 ask: ['What would you like to know about this mark?', '你想了解这个刻纹的什么信息？'],
 clarify: ['Could you ask about the mark, the way through, or a tool?', '可以问问这个刻纹是什么意思、怎么通过，或需要什么工具。'],
 'a-route': ['Go back to the first junction. Look for a passage to the south.', '回到第一个岔路口，找找向南的通道。'],
 'b-tool': ['Look in a side passage near the first pressure plate. There is a hammer there.', '在第一块压力踏板附近找一条支路。那里有一把锤子。'],
 'b-have': ['Use your hammer on the cracked stones when you are close enough.', '走近裂开的石块，用锤子敲开。'],
 'c-valve': ['Follow the passage beyond the spiral. Look for a valve beside the gate.', '沿着螺旋刻纹后面的通道走，找找门旁的阀门。'],
 'c-off': ['The power is off. You can go through the gate now.', '电源关了。现在可以穿过门。']
};
export function mazeDialogueLine(id){
 const found=id.startsWith('found-')&&discoveries[id.slice(6)];
 return found?['We found '+found[0]+'.','我们发现了'+found[1]+'。']:lines[id]||clueText(id);
}
export function answerMazeQuestion(mark,text,run,previous='ask'){
 const words=String(text).toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
 if(!discoveries[mark]||!words)return 'clarify';
 if(/\b(repeat|again|slower|pardon)\b/.test(words))return previous;
 if(mark==='D')return 'd-warning';
 if(mark==='P')return 'prism';
 if(mark==='H')return 'hammer';
 mark=({T:'a',R:'b',V:'c',G:'c'})[mark]||mark;
 if(mark==='a'&&/\b(where|route|way|pass|cross|avoid|bypass|around|go|safe|left|right)\b/.test(words))return 'a-route';
 if(mark==='b'&&/\b(where|find|tool|hammer|use|break|pass|through|clear)\b/.test(words))return run.hammer?'b-have':'b-tool';
 if(mark==='c'&&/\b(where|find|gate|valve|turn|off|open|power|pass|through)\b/.test(words))return run.powered?'c-valve':'c-off';
 if(/\b(mark|symbol|sign|mean|meaning|triangle|diamond|spiral|trap|danger)\b/.test(words)||/\b(this|it)\b.*\b(for|use|used|do)\b|^(what is this|what s this|what does it mean)$/.test(words))return mark;
 return 'clarify';
}

export function mazeAnswers(mark,run){
 const subject=({T:'a',R:'b',V:'c',G:'c'})[mark]||mark;
 return ({a:['a','a-route'],b:['b',run.hammer?'b-have':'b-tool'],c:['c',run.powered?'c-valve':'c-off'],
  H:['hammer'],P:['prism'],D:['d-warning']}[subject]||[]).concat('clarify');
}

export const keyLines = {
 'key-brief': ['Find the lost key and tell your coach. Look at the shapes on the walls. Ask the star to show you the way.', '找到遗失的钥匙并向教练汇报。留意墙上的图案，先向星纹问路。'],
 'keeper-order': ['First, press the sun. Then press the water drop. Last, press the leaf.', '先按太阳，再按水滴，最后按叶子。'],
 'keeper-ask': ["Hi, I'm Robin. I look after the dial. Ask me which symbol to press first.", '你好，我是罗宾，负责看守轮盘。你可以问我先按哪个图案。'],
 'keeper-find': ['The dial opens the gate. Find Robin in the north passage. Ask him what order to press the symbols in.', '轮盘可以打开通道门。去北边的支路找罗宾，问他按什么顺序点亮图案。'],
 'hammer-find': ['Look for a tool in the south passage.', '去南边的支路找工具。'],
 'hammer-use': ['Try your hammer on the cracked stones.', '试试用锤子敲有裂缝的石头。'],
 'lever-rule': ['Look at the symbols above the levers. Find the symbol with four corners, then pull that lever.', '看拉杆上方的图案。找到有四个角的图案，再拉动对应的拉杆。'],
 'lever-prompt': ['You can ask, “Which lever should I pull?”', '你可以直接问 “Which lever should I pull?”（我该拉哪根拉杆？）'],
 'door-first': ['Ask the moon door first.', '先去问问月亮门。'],
 'door-request': ['Do you need the door open?', '你想打开这扇门吗？'],
 'find-star': ['Find the star at the end of the first hallway. Ask it, “Which way?” Then go to the moon door.', '先到入口走廊的尽头找星纹，问它 “Which way?”，听完线索再去月亮门。'],
 'star-awake': ['Follow the moon. Ask the moon door to turn on the levers.', '去找月亮。请月亮门启动拉杆。'],
 'levers-ready': ['Take the west passage. Ask about the marks on the levers.', '走西侧通道，问问拉杆上的刻纹。'],
 'key-report': ['What did you find?', '你找到了什么？'],
 'key-return': ['Go back to where you started.', '回到出发点。'],
 'key-ask': ['What would you like to know?', '你想问什么？'],
 'star-hint': ["That's a star. Look for a moon.", '这是星星。找找月亮。'],
 'moon-route': ['Look for the moon on the wall.', '找找墙上的月亮图案。'],
 'door-symbol': ['Look at the color of the moon.', '看看月亮是什么颜色。'],
 'check-symbol': ['Look at the shape on the door.', '看看门上的图案。'],
 'blue-lever': ['Look for the blue lever.', '找找蓝色的拉杆。'],
 'blue-yes': ['Yes, the blue one.', '对，蓝色的。'],
 'red-no': ['No, the blue one.', '不是，是蓝色的。'],
 'key-open': ['The door is open. Look inside.', '门开了，进去看看。'],
 'key-clarify': ['What are you trying to find?', '你想找什么？'],
 'lever-clarify': ['Are you asking about the door?', '你想问这扇门吗？']
};
export function keyScene(run){
 if(run.mission==='key'&&run.key&&['search','return'].includes(run.phase))return 'coach';
 if(run.phase!=='search')return null;
 if(run.doorOpen&&[[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>tileAt(run.x+dx,run.y+dy,run)==='N'))return 'keeper';
 if(run.doorOpen&&run.x>=7)return 'inner';
 if(run.y>=7&&run.x<=3)return 'levers';
 if(run.y>=4&&run.x>=4)return 'door';
 return lanternTiles(run).some(({x,y})=>tileAt(x,y,run)==='*')?'star':'junction';
}
export function keyAnswer(scene,text,run,previous='key-ask'){
 const words=text.toLowerCase().replace(/[’']/g,"'").replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim();
 if(/\b(again|repeat|pardon|slower)\b/.test(words))return previous;
 const askingAboutShape=/^(?:what(?:'s| is) (?:this|that)(?: (?:shape|symbol|sign))?|what shape is (?:this|that)|what does (?:this|that) mean)$/.test(words);
 if(scene==='star'){
  const namingStar=/^(?:(?:i see|i can see|is (?:it|this|that)|this is|it is|it's|there is|there's) )?(?:(?:a|the|this|that) )?(?:five pointed )?star(?: (?:mark|symbol|shape|sign))?(?: on the wall)?$/.test(words);
  const askingAboutStar=/^what does (?:(?:the|this|that) )?star(?: (?:mark|symbol|shape|sign))?(?: on the wall)? mean(?: please)?$/.test(words);
  if(askingAboutShape||namingStar||askingAboutStar)return 'star-hint';
 }
 if(scene==='door'){
  if(run.doorOpen)return 'key-open';
  return run.leversReady?'levers-ready':'door-request';
 }
 return /\b(key|where|way|direction|go|lost|help|moon)\b/.test(words)?'moon-route':'key-clarify';
}

// Only a request made at the matching mechanism can change its state.
export function talkToKeyRoom(run,text,previous){
 const scene=keyScene(run);
 const reply=keyAnswer(scene,text,run,previous);
 const words=text.toLowerCase().replace(/[’']/g,"'").replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim();
 if(scene==='coach'){
  if(run.phase==='return')return 'key-return';
  const report=/^(?:(?:coach|jalor) )?(?:(?:i (?:have|got|found|picked up)|i've (?:got|found|picked up)|i have (?:got|found|picked up)|here(?:'s| is)) (?:a |the |my )?(?:lost )?key|(?:the |a )?key|i (?:found|got) it)$/.test(words);
  if(!report)return 'key-report';
  run.phase=tileAt(run.x,run.y,run)==='S'?'complete':'return';
  return 'key-return';
 }
 const routeRequest=/^(?:please )?(?:which way(?: (?:can|do|should) i go)?|where (?:can|could|do|should) i go(?: next)?|where(?: is|'s) (?:the )?(?:lost )?key|(?:where|how) (?:can|could|do|should) i find (?:the )?(?:lost )?key|(?:can you )?(?:show|tell) me the way|key|help)(?: please)?$/.test(words);
 if(scene==='keeper'){
  if(/^(repeat|again|say that again|slower|pardon)$/.test(words)&&run.clues.includes('keeper-order'))return 'keeper-order';
  const askingWhichFirst=/^(?:which|what)(?: (?:one|light|symbol))? (?:should i |do i )?(?:press|light) first(?: please)?$/.test(words);
  if(askingWhichFirst||/^(?:(?:what(?:'s| is) (?:the )?(?:right |correct )?(?:order|sequence)|(?:which (?:one|light|symbol) (?:comes |is )?first|which goes first|what comes first|what order|in what order)|how (?:does (?:the|this) dial work|do i (?:use the dial|light (?:it|them)|open the gate))|(?:can|could) you (?:tell|show) me the order|order|sequence|dial)(?: please)?)$/.test(words)){
   if(!run.clues.includes('keeper-order'))run.clues.push('keeper-order');
   return 'keeper-order';
  }
  return 'keeper-ask';
 }
 if(scene==='inner'){
  if(!run.cleared)return run.hammer?'hammer-use':'hammer-find';
  return run.dialStep===3?'key-open':'keeper-find';
 }
 if(scene==='levers'){
  if(run.doorOpen)return 'key-open';
  if(!run.leversReady)return 'door-first';
  if(/^(again|repeat|say that again|slower|pardon)$/.test(words))return previous||'lever-prompt';
  const leverWords=words.replace(/\bmocks?\b/g,word=>word==='mocks'?'marks':'mark');
  const askingWhichLever=/^which (?:one|lever|mark|symbol)(?: should i (?:choose|pull|pick|select)(?: or (?:choose|pull|pick|select))?)?$/.test(leverWords);
  const askingAboutMarks=/^(?:what(?:'s| is) (?:this|that)(?: mark| symbol)?|what (?:does (?:this|that)(?: mark| symbol)? mean|do (?:these|the) (?:marks|symbols)(?: on the levers?)? mean|are these(?: marks| symbols)?)|ask about (?:the|these) (?:marks|symbols)|(?:the )?(?:marks?|symbols?|shapes?|triangle|diamond)|how many corners|help)$/.test(leverWords);
  if(askingWhichLever||askingAboutMarks){
   if(!run.clues.includes('lever-rule'))run.clues.push('lever-rule');
   return 'lever-rule';
  }
  return 'lever-prompt';
 }
 if(scene==='star'&&(reply==='star-hint'||routeRequest)){
  run.starAwake=true;
  return 'star-awake';
 }
 if(scene==='star'&&reply==='moon-route')return run.starAwake?'star-awake':'key-clarify';
 if(scene==='door'&&!run.doorOpen){
  if(!run.starAwake)return 'find-star';
  const leverRequest=/^(?:please )?(?:(?:can|could|would) you )?(?:open(?: (?:the |this )?door)?|(?:turn on|activate|unlock|start) (?:the )?levers?|which (?:one|lever)(?: should i pull)?)(?: please)?$/.test(words);
  const askingHowToOpen=/^(?:(?:yes|yeah|okay|ok|sure) )?how (?:(?:can|could|do|should) (?:i|we)|to) (?:open|unlock) (?:(?:the |this |that )?(?:moon )?door|it)(?: please)?$/.test(words);
  if(!run.leversReady&&(leverRequest||askingHowToOpen||(previous==='door-request'&&/^(yes|yes please)$/.test(words)))){
   run.leversReady=true;
   return 'levers-ready';
  }
 }
 if(scene==='junction'&&!run.starAwake&&reply==='moon-route')return 'find-star';
 return reply;
}

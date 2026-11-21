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
 'keeper-order': ['First, what shines in the sky. Next, what falls from a cloud. Last, what grows on a tree.', '先点在天空中发光的，再点从云里落下的，最后点长在树上的。'],
 'keeper-ask': ['I look after the dial. What would you like to know?', '我看守这个轮盘。你想问什么？'],
 'keeper-find': ['Find the keeper in the north passage.', '去北边的支路找值守人。'],
 'radio-see': ['What do you see?', '你看到了什么？'],
 'radio-break': ['What are you trying to break?', '你想敲开什么？'],
 'radio-cracks': ['Any cracks in the rock?', '石头上有裂缝吗？'],
 'radio-dust': ['Try brushing off the dust. What is underneath?', '试试刷掉灰尘。下面有什么？'],
 'radio-tools': ['What tools have you found?', '你找到了什么工具？'],
 'radio-location': ['I don’t know where it is. Have you seen any tools?', '我不知道它在哪里。你见到过什么工具吗？'],
 'radio-keeper': ['Ask the person who looks after the dial.', '去问看守轮盘的人。'],
 'hammer-find': ['Look for a tool in the south passage.', '去南边的支路找工具。'],
 'hammer-use': ['Try your hammer on the cracked stones.', '试试用锤子敲有裂缝的石头。'],
 'lever-rule': ['Count the corners. You need four.', '数数角。你要找的那个有四个角。'],
 'lever-prompt': ['Ask about the marks.', '可以问问这些刻纹。'],
 'door-first': ['Ask the moon door first.', '先去问问月亮门。'],
 'door-request': ['Do you need the door open?', '你想打开这扇门吗？'],
 'find-star': ['Ask the star on the wall.', '向墙上的星纹问路。'],
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
 if(scene==='star'&&(askingAboutShape||/^(?:(?:i see|i can see|is (?:it|this|that)|this is|it is|it's|there is|there's) )?(?:(?:a|the) )?(?:five pointed )?star(?: on the wall)?$/.test(words)))return 'star-hint';
 if(scene==='door'){
  if(run.doorOpen)return 'key-open';
  return run.leversReady?'levers-ready':'door-request';
 }
 return /\b(key|where|way|direction|go|lost|help|moon)\b/.test(words)?'moon-route':'key-clarify';
}

// The radio has access only to what the student has said.
function radioReply(words,notes,previous){
 const remember=fact=>{if(!notes.includes(fact))notes.push(fact);};
 if(/^(?:again|repeat|pardon|slower|say that again)$/.test(words))return previous||'radio-see';
 if(/\b(?:where|find)\b.*\b(?:hammer|brush|tools?)\b/.test(words))return 'radio-location';
 if(/\b(?:order|sequence|dial)\b/.test(words))return 'radio-keeper';
 if(/\b(?:no|not|never|don't|can't|cannot)\b/.test(words)){
  if(/\bcracks?\b/.test(words)||previous==='radio-cracks'){if(notes.includes('crack'))notes.splice(notes.indexOf('crack'),1);return 'radio-dust';}
  return 'radio-see';
 }
 if(/^(?:yes|yeah|yes i do)$/.test(words)&&previous==='radio-cracks')remember('crack');
 if(/^(?:(?:there is|there's|i (?:can )?see|it has|the (?:rock|stone) has) )?(?:a |the )?cracks?(?: in the (?:rock|stone))?$/.test(words))remember('crack');
 if(/\b(?:rocks?|stones?)\b/.test(words))remember('rocks');
 if(/^(?:i (?:have|found|got)|i've (?:found|got)) (?:a |the )?hammer$/.test(words))remember('hammer');
 if(/\b(?:dust|dusty|brush)\b/.test(words))return 'radio-dust';
 const mentionsHammer=/\bhammer\b/.test(words);
 if(notes.includes('crack'))return notes.includes('hammer')||mentionsHammer?'hammer-use':'radio-tools';
 if(notes.includes('rocks'))return 'radio-cracks';
 return mentionsHammer?'radio-break':'radio-see';
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
 const routeRequest=/^(?:please )?(?:which way(?: should i go)?|where(?: is|'s) the key|where (?:do|should) i go|(?:can you )?(?:show|tell) me the way|key|help)(?: please)?$/.test(words);
 if(scene==='keeper'){
  if(/^(repeat|again|say that again|slower|pardon)$/.test(words)&&run.clues.includes('keeper-order'))return 'keeper-order';
  if(/^(?:(?:what(?:'s| is) (?:the )?(?:right |correct )?(?:order|sequence)|(?:which (?:one|light|symbol) (?:comes |is )?first|which goes first|what comes first|what order|in what order)|how (?:does (?:the|this) dial work|do i (?:use the dial|light (?:it|them)|open the gate))|(?:can|could) you (?:tell|show) me the order|order|sequence|dial)(?: please)?)$/.test(words)){
   if(!run.clues.includes('keeper-order'))run.clues.push('keeper-order');
   return 'keeper-order';
  }
  return 'keeper-ask';
 }
 if(scene==='inner')return radioReply(words,run.coachNotes,previous);
 if(scene==='levers'){
  if(run.doorOpen)return 'key-open';
  if(!run.leversReady)return 'door-first';
  if(/^(again|repeat|say that again|slower|pardon)$/.test(words))return previous||'lever-prompt';
  const question=/^(?:which (?:one|lever|mark|symbol)(?: should i (?:choose|pull))?|what(?:'s| is) (?:this|that)(?: mark| symbol)?|what (?:does (?:this|that)(?: mark| symbol)? mean|do (?:these|the) (?:marks|symbols) mean|are these(?: marks| symbols)?)|(?:the )?(?:marks?|symbols?|shapes?|triangle|diamond)|how many corners|help)$/.test(words);
  if(question){
   if(!run.clues.includes('lever-rule'))run.clues.push('lever-rule');
   return 'lever-rule';
  }
  return 'lever-prompt';
 }
 if(scene==='star'&&(reply==='star-hint'||routeRequest)){
  run.starAwake=true;
  return 'star-awake';
 }
 if(scene==='door'&&!run.doorOpen){
  if(!run.starAwake)return 'find-star';
  const leverRequest=/^(?:please )?(?:(?:can|could|would) you )?(?:open(?: (?:the |this )?door)?|(?:turn on|activate|unlock|start) (?:the )?levers?|which (?:one|lever)(?: should i pull)?)(?: please)?$/.test(words);
  if(!run.leversReady&&(leverRequest||(previous==='door-request'&&/^(yes|yes please)$/.test(words)))){
   run.leversReady=true;
   return 'levers-ready';
  }
 }
 if(scene==='junction'&&!run.starAwake&&reply==='moon-route')return 'find-star';
 return reply;
}

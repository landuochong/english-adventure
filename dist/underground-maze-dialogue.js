import {clueText} from './underground-maze.js';

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
 'key-brief': ['Find the lost key. Ask me if you need help.', '找到遗失的钥匙。需要帮助时可以问我。'],
 'key-ask': ['What would you like to know?', '你想问什么？'],
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
 if(run.phase!=='search')return null;
 return run.y>=4?'door':'junction';
}
export function keyAnswer(scene,text,run,previous='key-ask'){
 const words=text.toLowerCase().replace(/[’']/g,"'").replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim();
 if(/\b(again|repeat|pardon|slower)\b/.test(words))return previous;
 if(scene==='door'){
  if(run.doorOpen)return 'key-open';
  const moonReport=/^(?:(?:i (?:can )?see|there is|there's|it is|it's|the symbol is|the door (?:has|shows)) )?(?:(?:a|the) )?(?:crescent |half )?moon(?: (?:shape|symbol|picture))?(?: on (?:the|this) door)?$/.test(words);
  if(/^(blue|the blue one|blue one|is it blue|the blue lever)$/.test(words))return 'blue-yes';
  if(/^(red|the red one|red one|is it red|the red lever)$/.test(words))return 'red-no';
  if(moonReport)return 'blue-lever';
  if(!run.clues.includes('blue-lever')){
   if(/\b(moon|star|sun|square|triangle|circle)\b/.test(words))return 'check-symbol';
   if(run.askedAboutSymbol||/\b(which|pull|lever|door|open|stuck|help|key|blue|red)\b/.test(words))return 'door-symbol';
   return 'lever-clarify';
  }
  if(/\b(which|pull|lever|door|open|stuck|help|key)\b/.test(words))return 'blue-lever';
  return 'lever-clarify';
 }
 return /\b(key|where|way|direction|go|lost|help|moon)\b/.test(words)?'moon-route':'key-clarify';
}

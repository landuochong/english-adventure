export function guidance(s){
 if(s.complete)return{en:'Congratulations! You found Pip! Thank you for helping. You completed the mission.',zh:'恭喜你找到 Pip，任务完成！谢谢你的帮助。你可以自由探索，也可以自愿参加冒险回顾。',cta:'查看冒险回顾',view:'review'};
 if(!s.prepared)return{en:'Welcome to the school festival! Our robot Pip is missing. First, learn a few useful words. Then we’ll meet Mia at the plaza to collect our mission. I’ll stay with you.',zh:'欢迎来到校园科技节！迎宾机器人 Pip 不见了。我们先用一分钟准备几个词，再到广场找 Mia 领取寻找任务。我会一直陪着你。',cta:'准备语言背包',view:'prep'};
 if(!s.started)return{en:'We’re ready! First, walk to Mia at the festival plaza and collect our mission. Click Mia or use the arrow keys to move. Ask me whenever you feel unsure.',zh:'准备好了！我们下一步先去广场找 Mia 领取任务。点击 Mia，或用方向键走过去。遇到不清楚的地方，随时点“和教练交谈”。',cta:'标出 Mia 的位置',target:'organiser'};
 if(!s.clues.includes('witness'))return{en:'Let’s ask Ben at the library if he has seen Pip. Walk close to him, look for the red question mark, and ask: Have you seen Pip?',zh:'任务领到了！先去图书馆找 Ben。走近他，点击红色问号就能问：Have you seen Pip? 说完他就会回答。',cta:'标出 Ben 的位置',target:'librarian'};
 if(!s.clues.includes('decoration'))return{en:'Ben mentioned the art room. Let’s ask Amy what she saw. You can say: Have you seen Pip?',zh:'Ben 提到了美术教室。下一步去找 Amy，问问她看到了什么。可以说：Have you seen Pip?',cta:'标出 Amy 的位置',target:'artist'};
 if(!s.clues.includes('record'))return{en:'We have a lead. Leo, the equipment volunteer, may know about Pip’s flashing light. Ask him: What do you know about Pip?',zh:'我们有线索了。设备志愿者 Leo 可能知道 Pip 灯光的含义，下一步向他提问：What do you know about Pip?',cta:'标出 Leo 的位置',target:'technician'};
 if(!s.discovered)return{en:'We have three clues. What connects the route, the decoration, and the flashing light? You decide where to investigate. I can help you review the clues.',zh:'三条线索齐了。路线、装饰物和闪烁的灯光之间有什么联系？你来判断去哪里调查，我可以帮你回顾线索。',cta:'回顾已收集的线索',view:'notebook'};
 if(!s.awake)return{en:'We have all three clues. You found Pip! Ask how to wake it up. Listen to the answer before pressing a button.',zh:'你发现 Pip 了！可以询问如何唤醒它。先听清回答，再由你按按钮。',cta:'标出 Pip 的位置',target:'pip'};
 if(!s.following)return{en:'Pip is awake! Invite it to follow you. Try: Come with me, Pip.',zh:'Pip 醒了！现在邀请它跟你走，可以说：Come with me, Pip.',cta:'标出 Pip 的位置',target:'pip'};
 return{en:'Pip is following you. Walk back to Mia at the plaza, then return Pip to the festival.',zh:'Pip 已经跟上你了！下一步走回广场找 Mia，再把 Pip 交回展台。',cta:'标出 Mia 的位置',target:'organiser'};
}
export function coachAnswer(s,text){
 if(s.complete)return /怎么说|表达|phrase|say/.test(text)?{en:"I found Pip! You’re welcome.",zh:"可以说：我找到 Pip 了！不用谢。任务已经完成，不需要再询问它在哪里。"}:guidance(s);
 const t=text.toLowerCase();
 if(/怎么走|如何移动|操作|方向|move|walk|control|keyboard/.test(t))return{en:'Click the ground or a person to walk there. You can also use WASD or the arrow keys. When a red question mark appears, press E or tap Speak to ask a question.',zh:'点击地面或人物就能走过去，也可以用 WASD 或方向键移动。走近人物出现红色问号后，直接点红色问号或按 E。'};
 if(/怎么说|如何问|表达|phrase|how.*(say|ask)|what.*say/.test(t))return{en:s.awake&&!s.following?'Come with me, Pip.':'Have you seen Pip?',zh:s.awake&&!s.following?'这句话是：Pip，跟我来。可以换成 Follow me, Pip.':'这句话是：你见过 Pip 吗？走近场景人物后试着问他。'};
 if(/听不懂|中文|不明白|不清楚|下一步|做什么|去哪|help|next|where|what|lost|understand|plan|任务/.test(t))return guidance(s);
 return{...guidance(s),zh:'我先帮你确认下一步：'+guidance(s).zh};
}

const discussions={
 organiser:{name:'Mia',clue:null,simple:['Pip is missing. Pip is white. It has a blue light. Ask Ben for help.','Pip 不见了。它是白色的，有蓝灯。向 Ben 打听。'],words:['Missing means we cannot find something. A mission is a job to do.','missing 表示找不到了，mission 表示要完成的任务。'],check:['What colour is Pip? Tell me one detail.','Pip 是什么颜色？说出一个细节。'],answer:/\bwhite\b|白色/,feedback:['Yes. Pip is white. You remembered a useful detail!','对，Pip 是白色的。你记住了一个有用的细节！']},
 librarian:{name:'Ben',clue:'witness',simple:['Pip passed the library. Then it moved towards the art room. Towards tells us a direction, not a final stop.','Pip 经过图书馆，然后朝美术教室的方向走。towards 表示方向，不代表最后停在那里。'],words:['Went past means passed a place. Towards means in the direction of a place.','went past 表示经过，towards 表示朝着某个方向。'],check:['Did Ben say Pip stopped at the library, or went past it?','Ben 说 Pip 停在图书馆，还是经过图书馆？'],answer:/\b(past|passed)\b|经过|路过/,feedback:['Yes, it went past the library. Ben told us a direction, not where Pip is now.','对，它经过了图书馆。Ben 告诉我们的是方向，不是 Pip 现在的位置。']},
 artist:{name:'Amy',clue:'decoration',simple:['Amy carried a shiny decoration. She took it to the greenhouse. Pip went with her.','Amy 搬着一个闪亮的装饰物，把它带到了温室，Pip 跟着她。'],words:['Shiny means it reflects light. Carried means took something from one place to another. Followed means went after someone.','shiny 表示闪亮的，carried 表示搬运，followed 表示跟着。'],check:['What did Amy carry? Tell me what attracted Pip.','Amy 搬了什么？试着说说是什么吸引了 Pip。'],answer:/\b(shiny|decoration)\b|装饰|闪亮/,feedback:['Yes, a shiny decoration. Think about what you heard from the other people too.','对，是闪亮的装饰物。再联系一下你从其他人那里听到的内容。']},
 technician:{name:'Leo',clue:'record',simple:['The blue light turns on and off. This happens when Pip follows something bright.','蓝灯一亮一灭。当 Pip 跟随明亮的东西时，就会这样。'],words:['Flashing means turning on and off again and again. Bright means giving or reflecting a lot of light.','flashing 表示反复闪烁，bright 表示明亮的。'],check:['What makes Pip flash blue? Think about what it follows.','Pip 跟随什么东西时会闪蓝灯？'],answer:/\b(bright|shiny|light)\b|明亮|闪亮|发光/,feedback:['Yes. Pip follows bright things. How might that connect to another clue you heard?','对，Pip 会跟随明亮的东西。想想这与另一条已听到的线索有什么联系？']}
};
export function discussClue(s,id,text,checking=false){
 const d=discussions[id];
 if(!d||!s.started||(d.clue&&!s.clues.includes(d.clue)))return {en:'First, listen to a person. Then we can discuss what they said together.',zh:'先听一位人物说话，再一起讨论他提供的信息。',checking:false};
 const t=text.toLowerCase();let pair;
 if(checking&&!/意思|解释|听不懂|mean|explain|understand|why/.test(t)){const matches=d.answer.test(t)&&!(/\b(no|not|never|didn't|didn’t)\b|不是|没有|没经过/.test(t));pair=matches?d.feedback:['Let’s listen to that part again. '+d.simple[0]+' '+d.check[0],'我们再听听这一部分。'+d.simple[1]+' '+d.check[1]];return {en:pair[0],zh:pair[1],checking:!matches};}
 if(/检查|复述|check|test|quiz/.test(t))return{en:d.check[0],zh:d.check[1],checking:true};
 const terms={towards:['Towards means moving in a direction. It does not mean arriving there.','towards 是朝某个方向移动，不代表已经到达。'],past:['Went past means passed a place without stopping there.','went past 是经过某地，没有停在那里。'],flashing:['Flashing means the light turns on and off again and again.','flashing 表示灯反复一亮一灭。'],shiny:['Shiny means something reflects light, like a mirror.','shiny 表示反光、闪亮，比如镜子。'],followed:['Followed means went after someone or something.','followed 表示跟着某个人或物体走。']};
 const allowed={librarian:['towards','past'],artist:['shiny','followed'],technician:['flashing'],organiser:[]};
 const term=allowed[id].find(w=>t.includes(w));
 if(term)pair=terms[term];
 else if(/为什么|why/.test(t))pair=id==='technician'?d.simple:id==='artist'?['Amy said Pip followed her. She did not explain why. What else have you heard?','Amy 说 Pip 跟着她，但没有解释原因。你还听到过什么？']:['This person told us what they noticed. It is one clue, not the whole story.','这个人物告诉我们他观察到的事情，这只是一条线索，不是完整的故事。'];
 else if(/词|意思|mean|word|vocab/.test(t))pair=d.words;
 else if(/听不懂|不明白|讨论|解释|换|简单|detail|explain|understand|simpl|rephrase|said|say|direction|方向/.test(t))pair=d.simple;
 else pair=['Let’s stay with '+d.name+'’s clue. Ask about a word, ask me to say it another way, or try a check question.','我们继续讨论 '+d.name+' 的线索。可以问词义、请我换个说法，或者检查你的理解。'];
 return {en:pair[0],zh:pair[1],checking:false};
}

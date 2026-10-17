export function guidance(s){
 if(s.complete)return{en:'Pip is home! Let’s review your adventure and try one new listening challenge.',zh:'Pip 已经回来了！下一步回顾冒险，再试一道新的听力题。',cta:'查看冒险回顾',view:'review'};
 if(!s.prepared)return{en:'Welcome to the school festival! Our robot Pip is missing. First, learn a few useful words. Then we’ll meet Mia at the plaza to collect our mission. I’ll stay with you.',zh:'欢迎来到校园科技节！迎宾机器人 Pip 不见了。我们先用一分钟准备几个词，再到广场找 Mia 领取寻找任务。我会一直陪着你。',cta:'准备语言背包',view:'prep'};
 if(!s.started)return{en:'We’re ready! First, walk to Mia at the festival plaza and collect our mission. Click Mia or use the arrow keys to move. Ask me whenever you feel unsure.',zh:'准备好了！我们下一步先去广场找 Mia 领取任务。点击 Mia，或用方向键走过去。遇到不清楚的地方，随时点“和教练交谈”。',cta:'标出 Mia 的位置',target:'organiser'};
 if(!s.clues.includes('witness'))return{en:'Let’s ask Ben at the library if he has seen Pip. Walk close to him, look for the red question mark, and ask: Have you seen Pip?',zh:'任务领到了！先去图书馆找 Ben。走近他，看到红色问号后问：Have you seen Pip? 说完他就会回答。',cta:'标出 Ben 的位置',target:'librarian'};
 if(!s.clues.includes('decoration'))return{en:'Ben mentioned the art room. Let’s ask Amy what she saw. You can say: Have you seen Pip?',zh:'Ben 提到了美术教室。下一步去找 Amy，问问她看到了什么。可以说：Have you seen Pip?',cta:'标出 Amy 的位置',target:'artist'};
 if(!s.clues.includes('record'))return{en:'We have a lead. Leo, the equipment volunteer, may know about Pip’s flashing light. Ask him: What do you know about Pip?',zh:'我们有线索了。设备志愿者 Leo 可能知道 Pip 灯光的含义，下一步向他提问：What do you know about Pip?',cta:'标出 Leo 的位置',target:'technician'};
 if(!s.awake)return{en:'We have all three clues. Walk to Pip near the greenhouse and ask how to wake it up. Listen to the answer before pressing a button.',zh:'三条线索齐了！去温室旁找到 Pip，询问如何唤醒它。先听清回答，再由你按按钮。',cta:'标出 Pip 的位置',target:'pip'};
 if(!s.following)return{en:'Pip is awake! Invite it to follow you. Try: Come with me, Pip.',zh:'Pip 醒了！现在邀请它跟你走，可以说：Come with me, Pip.',cta:'标出 Pip 的位置',target:'pip'};
 return{en:'Pip is following you. Walk back to Mia at the plaza, then return Pip to the festival.',zh:'Pip 已经跟上你了！下一步走回广场找 Mia，再把 Pip 交回展台。',cta:'标出 Mia 的位置',target:'organiser'};
}
export function coachAnswer(s,text){
 const t=text.toLowerCase();
 if(/怎么走|如何移动|操作|方向|move|walk|control|keyboard/.test(t))return{en:'Click the ground or a person to walk there. You can also use WASD or the arrow keys. When a red question mark appears, press E or tap Speak to ask a question.',zh:'点击地面或人物就能走过去，也可以用 WASD 或方向键移动。走近人物出现红色问号后，按 E 或点“开口提问”。'};
 if(/怎么说|如何问|表达|phrase|how.*(say|ask)|what.*say/.test(t))return{en:s.awake&&!s.following?'Come with me, Pip.':'Have you seen Pip?',zh:s.awake&&!s.following?'这句话是：Pip，跟我来。可以换成 Follow me, Pip.':'这句话是：你见过 Pip 吗？走近场景人物后试着问他。'};
 if(/听不懂|中文|不明白|不清楚|下一步|做什么|去哪|help|next|where|what|lost|understand|plan|任务/.test(t))return guidance(s);
 return{...guidance(s),zh:'我先帮你确认下一步：'+guidance(s).zh};
}

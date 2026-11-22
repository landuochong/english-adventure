const line=(en,zh)=>({en,zh});
const mia={name:'Mia',x:1,z:-6};
const ben={name:'Ben',x:43,z:22};
const mei={name:'Mei',x:13,z:19};
const step=(npc,accept,en,zh,hintEn,hintZh)=>({npc,accept,reply:line(en,zh),hint:line(hintEn,hintZh)});
const fact=(accept,en,zh)=>({accept,prompt:line(en,zh)});

export const gradeSevenMissions=[
 {
  id:'u1',title:'第一周的最后一格',region:'science',area:'科学中心教室',giver:'mia',positions:{mia,ben},
  hook:'周计划的最后一格还空着。到图书馆问清 Ben 和谁做什么，再确认约在哪里、哪天见。',
  theme:'询问计划 · 确认时间地点',words:['plan','poster','library','after school'],phrases:['What do you plan to do?', 'Where will you meet?', 'He wants to …'],
  item:'周计划贴纸',finishLabel:'贴上图书馆小图',
  brief:line("Our class poster has one space left. Ben has a plan with a friend. Ask him about it in the library. Find out where and when they'll meet, so we can fill it in.",'班级周计划还空一格。Ben 和朋友有个安排。去图书馆问清他们要做什么，在哪里、什么时候见，我们一起把海报补全。'),
  steps:[
   step('ben',/\b(?:what.*(?:plan|do|week|read)|(?:do|will) you (?:have a plan|read))\b/,"I want to read a book with Mei on Friday. She's new here. I hope she can find me.",'我想周五和 Mei 一起读书。她刚来，希望她能找到我。','Find Ben in the library. Ask about his plan for this week.','去图书馆问 Ben 这周有什么安排。'),
   step('ben',/\b(?:where|here|(?:at|in) the library|what time|when.*meet)\b/,"Yes, here in the library, after school. Take this little library sticker for the poster.",'就在图书馆，放学以后。把这张图书馆贴纸带回去吧。','How will Mei find Ben? Check the meeting place or time.','Mei 怎么找到他？跟 Ben 确认见面地点或时间。')
  ],
  report:line("Tell Mia what Ben and Mei plan to do and which day to put the sticker on.",'告诉 Mia 谁约了一起做什么，好让她把贴纸放在正确的日期。'),
  wrong:/\b(?:tom|jack|lily|monday|tuesday|wednesday|thursday|saturday|sunday|cafe|football|before school|at lunch)\b/,
  facts:[fact(/\bread(?:ing)?\b/,'What will they do?','他们要做什么？'),fact(/\bmei\b/,'Who will read with Ben?','谁和 Ben 一起读书？'),fact(/\bfriday\b/,'Which day?','星期几？')],
  ready:line("Friday it is. Put the library sticker in that space.",'那就周五。把图书馆贴纸贴在那一格吧。'),
  thanks:line("Now Mei knows where to find Ben after school. Thank you!",'现在 Mei 知道放学后去哪儿找 Ben 了。谢谢！'),summary:'周五的海报格里留下了 Ben 和 Mei 的图书馆之约。'
 },
 {
  id:'u2',title:'给二胡留一个声部',region:'workshop',area:'排练室与音乐角',giver:'ben',positions:{ben:{name:'Ben',x:62,z:20},mei},
  hook:'排练室里只有吉他声。去庭院音乐角听 Mei 介绍她的乐器，再问她愿不愿意加入。',
  theme:'乐器与兴趣 · 发出邀请',words:['guitar','erhu','voice','rehearsal'],phrases:['What do you play?', 'Why do you like it?', 'Would you like to join us?'],
  item:'排练报名表',finishLabel:'把 Mei 填入排练表',
  brief:line("Hear my guitar? The second part is empty. Mei is practising in the courtyard music corner. Find out what she plays and if she'd like to rehearse with me.",'听见我的吉他了吗？另一个声部还空着。Mei 在庭院音乐角练习，去听听她演奏什么，再问她愿不愿意和我排练。'),
  steps:[
   step('mei',/\b(?:what|which|is that).*\b(?:play|playing|instrument|erhu|sound)\b/,"It's an erhu. Listen to that long note. It's the reason I chose it.",'这是二胡。听这拉长的音，这正是我选它的原因。','Find Mei in the courtyard. Ask what makes that sound.','去庭院音乐角问 Mei，这是什么乐器的声音。'),
   step('mei',/\b(?:why|what.*(?:like|love|sound)|how.*sound)\b/,"I like it because it sounds like a voice. Is someone looking for an erhu player?",'我喜欢二胡，因为它听起来像人在歌唱。有人在找二胡手吗？','Ask what Mei likes about that long note.','问问 Mei 为什么喜欢这样的长音。'),
   step('mei',/\b(?:would you like to|can you|will you|do you want to|please|let'?s).*\b(?:join|rehearse|play|practice|practise)\b|^join us\b/,"Yes! Put my name down for the erhu. Tell Ben I'm coming.",'我愿意！请在二胡声部写上我的名字。告诉 Ben 我会来。','Ben needs a partner. Ask Mei if she wants to join him.','Ben 还缺一位搭档。问问 Mei 愿不愿意加入。')
  ],
  report:line("Tell Ben who can play the other part and whether she agreed to join.",'回排练室告诉 Ben，是谁演奏什么乐器，她是否答应加入。'),
  wrong:/\b(?:tom|lily|piano|violin|flute|drums?|guitarist)\b|\bmei plays (?:the )?guitar\b/,
  facts:[fact(/\bmei\b/,'Who did you speak to?','你问的是谁？'),fact(/\b(?:erhu|er hu)\b/,'Which instrument does she play?','她演奏什么乐器？'),fact(/\b(?:join(?:ing)?|agreed|coming|said yes|will come|wants to play with us|rehearse with us)\b/,'Can she join us?','她愿意来排练吗？')],
  ready:line("There's room beside the guitar. Add Mei to the rehearsal sheet.",'吉他旁边还有个位置。在排练表上写下 Mei 吧。'),
  thanks:line("Great! Let's try the two parts together.",'太好了！来试试这两个声部合在一起是什么样。'),summary:'排练表上多了 Mei 的名字，吉他和二胡一起奏响了四拍。'
 },
 {
  id:'u3',title:'照片背后的小字',region:'science',area:'家庭相册展览角',giver:'mei',positions:{mei:{name:'Mei',x:8,z:-6}},
  hook:'照片上是小时候的 Mei，衣袖长出了一大截。先翻到背面，再问问她这件外套的故事。',
  theme:'询问物主 · 讲述关爱',words:['coat','album','grandpa','warm'],phrases:['Whose coat is this?', 'Why did you keep it?', 'It belonged to …'],
  item:'家庭相册旧照',finishLabel:'把外套标签放进相册',
  brief:line("I'm making a family album. That's little me in the photo. Look at those long sleeves! Turn the photo over, then ask me about the coat. Help me write a label that tells its story.",'我在做家庭相册。照片上是小时候的我，看那长长的袖子！翻到背面看看，再问我这件外套的故事。帮我写张展签吧。'),
  steps:[
   step('mei',/\b(?:whose|who.*(?:own|coat|belong)|belong to|is (?:it|this) your)\b/,"I wore it, but it was my grandpa's coat. The sleeves covered both my hands.",'我穿着它，可它是爷爷的外套。袖子把我的双手都盖住了。','Whose coat fits like that? Ask Mei who owned it.','袖子为什么这么长？问 Mei 外套是谁的。'),
   step('mei',/\b(?:why|what happened|what.*(?:morning|keep)|how.*(?:get|feel|help))\b/,"It was a cold morning. Grandpa saw me shivering and gave me his coat. I was warm all the way home.",'那天早上很冷。爷爷见我发抖，就把外套给了我。回家的路上我一直很暖和。','Ask why she kept the coat, or what happened that morning.','问她为什么留下外套，或那天早上发生了什么。')
  ],
  report:line("Tell Mei whose coat it was and what it did for her.",'向 Mei 口述展签，讲清外套的主人，以及它怎样帮到了她。'),
  wrong:/\b(?:mine|hers|my coat|your coat|mei'?s coat|mother|grandma|grandmother)\b/,
  correction:line("I wore it, but it belonged to Grandpa. What did he do for me?",'照片上穿衣服的是我，但衣服属于爷爷。他为我做了什么？'),
  facts:[fact(/\b(?:grandpa|grandfather|grandad|granddad)(?:'s|s)?\b/,'Whose coat was it?','外套原来是谁的？'),fact(/\b(?:warm(?:ed)?|(?:gave|lent|offered|put).*coat)\b/,'How did it help me that morning?','那天早上它怎样帮到了我？')],
  ready:line("That's what I remember. Put the label beside our photo.",'我记得的正是这件事。把展签放在照片旁边吧。'),
  thanks:line("Yes. That's the story I want to keep.",'是的，这就是我想留住的故事。'),summary:'相册留下了爷爷的外套，也留下了那个寒冷早晨的故事。'
 }
].map(story=>({...story,world:'campus',kind:'none',device:null,display:null,people:Object.keys(story.positions),asrScene:'campus-'+story.id,voiceOnly:true}));

export function createGradeSevenMission(config,layout){
 const {giver,steps}=config;
 const state={stage:'brief',index:0,owner:null,complete:false,records:{},facts:[]};
 const current=()=>steps[state.index];
 const who=()=>state.stage==='interview'?current().npc:giver;
 function hint(){
  if(state.stage==='brief')return line('Find '+config.positions[giver].name+' at the '+({u1:'class poster',u2:'rehearsal sheet',u3:'family album'}[config.id])+'.','去'+config.area+'找 '+config.positions[giver].name+' 听取委托。');
  if(state.stage==='inspect')return line('Turn over the photo. Look at the date and the sleeves.','翻看照片背面，看看日期和袖子。');
  if(state.stage==='interview')return current().hint;
  if(state.stage==='report')return config.report;
  return state.complete?config.thanks:config.ready;
 }
 return {config,state,hint,get clueStep(){return state.stage+':'+state.index+':'+state.facts.length;},
  marker(id){return state.complete?'idle':id===who()?'ask':state.records[id]?'text':'idle';},
  act(id,type,text,pos,clear=()=>true){
   const target=config.positions[id];
   if(!pos||!target||Math.hypot(pos.x-target.x,pos.z-target.z)>layout.interactionRadius||!clear(target))return null;
   const t=text.toLowerCase().replaceAll('’',"'").replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim();
   if(type==='greet'||(type==='say'&&/^(hi|hello|hey)$/.test(t)))return line('Hello!','你好！');
   if(type==='say'&&/\b(?:repeat|again|slower)\b/.test(t))return state.records[id]||hint();
   if(id!==who())return type==='say'?hint():null;
   let reply;
   if(type==='mission'&&state.stage==='brief'){
    state.stage=config.id==='u3'?'inspect':'interview';state.owner=config.id==='u1'?null:'student';reply=config.brief;
   }else if(type==='inspect-photo'&&state.stage==='inspect'){
    state.stage='interview';
    // The inscription is scene text. Mei only speaks when addressed.
    return null;
   }else if(type==='deliver'&&state.stage==='handover'){
    state.stage='complete';state.owner='display';state.complete=true;reply=config.thanks;
   }else if(type==='say'){
    if(/\b(?:no|not|never|maybe|instead)\b|n't\b/.test(t))return hint();
    if(state.stage==='interview'&&current().accept.test(t)){
     reply=current().reply;state.index++;
     if(!current()){state.stage='report';state.owner='student';}
    }else if(state.stage==='report'){
     if(config.wrong.test(t))return config.correction||line('That is different from what I heard. Check the details again.','这和我听到的不同，再核对一下吧。');
     config.facts.forEach((f,i)=>{if(!state.facts.includes(i)&&f.accept.test(t))state.facts.push(i);});
     const missing=config.facts.find((_,i)=>!state.facts.includes(i));
     if(missing)reply=missing.prompt;
     else{state.stage='handover';reply=config.ready;}
    }else return hint();
   }
   if(reply)state.records[id]=reply;
   return reply||null;
  }};
}

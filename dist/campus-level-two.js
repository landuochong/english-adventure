// Each scene is a student exchange. Groups separated by "/" are required facts;
// alternatives within a group are separated by "|". Replies give the next lead.
const line=(en,zh)=>({en,zh});
const step=(npc,facts,prompt,reply,zh)=>({npc,facts,prompt,reply:line(reply,zh)});
const story=(title,brief,zh,steps)=>({title,brief:line(brief,zh),steps});
export const advancedStories={
 u1:story('别把两个约会贴在一起','The art club already has a sticker. Ask me which day is taken before you see Ben.','美术社已经有一张贴纸。先问清哪天被占用了，再去见 Ben。',[
  step('mia','which day|when','What do you need to check?','Thursday is art club. Which day must stay free for art?','周四是美术社。哪天要留给他们？'),
  step('mia','thursday','Which day is for art?','Exactly. Now find out which day Ben actually picked.','对。现在去问清 Ben 选的是哪天。')]),
 u2:story('留给旋律的位置','Ask me what my guitar will play before you look for a partner.','找搭档前，先问我吉他负责哪部分。',[
  step('ben','guitar|part','What do you want to know about the guitar?','I play the beat. We need someone to play the melody. Which part is missing?','我打节拍。我们缺人拉旋律。缺的是哪部分？'),
  step('ben','melody','Which part do we still need?','Yes. Listen to Mei in the courtyard.','对。去庭院听听 Mei 的演奏。')]),
 u3:story('照片的两个名字','Before you turn the picture over, ask who took it.','翻看照片前，先问这张照片是谁拍的。',[
  step('mei','who|took','What would you like to know about the photographer?','My aunt took it. Who should get credit for the photo?','姑姑拍的。摄影者那栏应该写谁？'),
  step('mei','aunt','Who took the photo?','Right. Now find out about the person who owned the coat.','对。接下来查清外套的主人。')]),
 wish:story('给愿望树选一片叶子','Before you go, help me choose the paper for our new student.','出发前，帮我选一片纸叶。',[
  step('mia','colour|color|which','What would you like to know about the leaf?','The green leaves are for new students. Which colour will you take?','绿色纸叶留给新同学。你要拿哪种颜色？'),
  step('mia','green','Which colour is for a new student?','Take the green one. He was looking at art books in the library.','拿绿色的。他刚才在图书馆看美术书。')]),
 welcome:story('替新同学选一个午休去处','A new student needs a quiet place at lunch. Ask Lisa where she can read.','新同学想找安静的午休地点。问 Lisa 哪里能阅读。',[
  step('lisa','read|reading|quiet','What does the student need?','The library is quiet and opens at one. Check with Kai when lunch finishes.','图书馆很安静，一点开门。去问 Kai 午餐什么时候结束。'),
  step('waiter','lunch|finish|time','What do you want to know about lunch?','Lunch ends at twelve thirty. Tell Mia when the library opens.','午餐十二点半结束。告诉 Mia 图书馆何时开门。'),
  step('mia','one|1','When does the library open?','That gives us half an hour. Where should the new student go to read?','中间还有半小时。新同学应该去哪儿阅读？'),
  step('mia','library','Which place is quiet?','Good choice. Now tell me your nickname and what you like doing.','好主意。现在告诉我你的昵称和爱好。')]),
 science:story('展签贴错了','Two exhibits have lost their labels. Ask Ben about the robot on the poster.','两个展品的标签掉了。问 Ben 海报上的机器人有什么标记。',[
  step('ben','robot|poster|label','Which exhibit are you checking?','Look for a star. Ask Leo about the other robot.','找星形标记。再问 Leo 另一台机器人的情况。'),
  step('leo','other|robot|mark|label','Which label are you checking?','Mine has a moon. Which mark did Ben describe?','我这台有月亮。Ben 说的是什么标记？'),
  step('leo','star','Which mark was on the poster?','Right. Ask Ben which team owns the star robot.','对。问 Ben 星形机器人属于哪个小组。'),
  step('ben','team|whose|own','What do you need to know about its team?','The space team. Tell Mia the team name.','太空组。把组名告诉 Mia。'),
  step('mia','space','Which team owns our exhibit?','And which label should I print: star or moon?','我应该打印星形还是月亮标签？'),
  step('mia','star','Which mark belongs to the space team?','I’ll print the star label. Now help us find the actual exhibit.','我来打印星形标签。现在帮我们找回展品。')]),
 school:story('两节课，两本书','Our timetable got wet. Ask Lisa which lesson is first today.','课程表被打湿了。问 Lisa 今天先上什么课。',[
  step('lisa','first|lesson|class','What do you need from the timetable?','Maths comes first. Ask me which room it is in.','先上数学。问问教室。'),
  step('lisa','room|where','Which detail is missing?','Room six. Please tell Tom the room number.','六号教室。把教室号告诉 Tom。'),
  step('tom','six|6','Which room should I go to?','Thanks. Is my science book the one I need?','谢谢。我该拿科学课本吗？'),
  step('tom','math|maths|mathematics|no','Which subject comes first?','Maths, right. Ask Lisa if she has a spare copy.','对，是数学。问 Lisa 有没有多余的一本。'),
  step('lisa','spare|extra|copy|book','What do you need for Tom?','I have a spare. Now we need to arrange the loan.','我有一本备用的。接下来商量怎么借。')]),
 restaurant:story('两份午餐别装错','Kai has two lunch bags. Ask him how to tell them apart.','Kai 有两个餐袋。问他怎样区分。',[
  step('waiter','bag|colour|color|which','What do you want to tell apart?','One is green and one is yellow. Ask Lily which is hers.','一个绿色，一个黄色。问 Lily 她的是哪个。'),
  step('lily','bag|colour|color|which','What are you checking?','Mine is green. I need it to take away. Tell Kai the colour.','我的是绿色的，要外带。告诉 Kai 餐袋颜色。'),
  step('waiter','green','Which bag is Lily’s?','Green, got it. Is she eating here or taking it away?','绿色。她是堂食还是外带？'),
  step('waiter','away|go|out|takeout','For here or to go?','To go. Ask Lily if she needs a fork.','外带。问 Lily 要不要叉子。'),
  step('lily','fork|cutlery','What extra item did Kai ask about?','I have my own fork. Now order my lunch at the counter.','我自己带了叉子。现在去柜台帮我点餐。')]),
 shopping:story('雨天的生日礼物','This gift is for a rainy trip. Ask Robin which cap stays dry.','这份礼物要带去雨天旅行。问 Robin 哪顶帽子防水。',[
  step('seller','rain|dry|waterproof|cap','What weather is the cap for?','The travel cap is waterproof. Ask me about the cotton one.','旅行帽防水。再问问棉帽。'),
  step('seller','cotton','Which other cap are you comparing?','The cotton cap gets wet. Tell Jack which one will stay dry.','棉帽会湿。告诉 Jack 哪顶帽子防水。'),
  step('jack','travel|waterproof','Which cap will keep me dry?','Good. Ask Robin if the travel cap comes in blue.','好。问 Robin 旅行帽有没有蓝色。'),
  step('seller','blue','Which colour are you looking for?','Yes, there’s a blue one. Ask Jack what size he needs.','有蓝色的。问问 Jack 的尺码。'),
  step('jack','size|large|medium|small','What do you need to check before buying?','Medium. Now check the price and buy it within my budget.','中号。现在去问价，在预算内买下来。')]),
 directions:story('车站临时搬了','The museum bus stop has moved. Ask Max which stop is closed.','博物馆公交站临时搬了。问 Max 哪个站点关闭了。',[
  step('driver','stop|closed|bus','Which travel update do you need?','The south stop is closed. Ask Iris about the temporary stop.','南站关闭。问 Iris 临时站点的位置。'),
  step('librarian','stop|where|temporary','What are you looking for?','Use the east gate. Tell Anna where to start.','从东门上车。告诉 Anna 从哪里出发。'),
  step('anna','east','Which gate do we use?','East gate, got it. Now find the bus number and the way from our stop.','记住了，东门。现在去确认车次和下车后的路线。')]),
 weather:story('给风筝找个避雨处','There may be a shower before our picnic. Ask Sky when the rain stops.','野餐前可能有阵雨。问 Sky 什么时候雨停。',[
  step('ranger','rain|shower|when|stop','What are you checking about the rain?','It stops at noon. Ask Mary where she can keep the kite dry.','中午雨停。问 Mary 哪里可以放风筝避雨。'),
  step('mary','kite|dry|where|shelter','What should we protect?','In the café. Tell Bob where to collect it after the rain.','放咖啡馆。告诉 Bob 雨停后去哪儿取。'),
  step('bob','cafe|café|coffee shop','Where will the kite be?','Great. Now check Saturday’s forecast and invite Mary to the park.','好。接着确认周六天气，再邀请 Mary 去公园。')]),
 hobbies:story('泳池的时间换了','The pool has changed its hours. Ask Sue when she can swim.','泳池开放时间有变。问 Sue 什么时候能游泳。',[
  step('sue','when|time|morning|afternoon','What do you need to know about my schedule?','Only in the afternoon. Two or three works for me. Choose a time and ask Tim to book it.','我只有下午有空，两点或三点都行。你选一个时间，请 Tim 预约。'),
  {...step('tim','two|2|three|3','Which time shall I book: two or three?','Booked for {time}. Please tell Sue.','订好了，{time}点。告诉 Sue 吧。'),chooseTime:true},
  {...step('sue','time','What time did Tim book?','See you at {time}. Now, what sport shall we do?','那就{time}点见。我们打算做什么运动？'),useTime:true}]),
 picnic:story('野餐篮送去哪里','The picnic moved. Ask Kai where the group is meeting.','野餐改了地点。问 Kai 大家在哪里集合。',[
  step('waiter','where|meet|picnic','What do you need to know about the picnic?','At the garden. Check with Lily which gate she means.','在花园。问 Lily 从哪个门进。'),
  step('lily','gate|entrance|which','Which part of the route is unclear?','The west gate. Ask Kai when the lunch bags leave.','西门。问 Kai 餐袋什么时候送出。'),
  step('waiter','when|time|leave','What about the bags?','At noon. Tell Lily where and when to meet.','中午送出。告诉 Lily 在哪儿、几点集合。'),
  step('lily','west/noon|twelve|12','Which gate, and what time?','Perfect. Ask Kai which label to use for our bag.','对了。问 Kai 应该给我们的袋子贴什么标签。'),
  step('waiter','label|tag|bag','What needs a label?','Use the leaf label. Tell Lily so she can spot it.','用叶子标签。告诉 Lily 好让她认出来。'),
  step('lily','leaf','Which label should I look for?','A leaf. Ask Kai if we can take the bag ourselves.','叶子。问 Kai 能不能自己来取餐袋。'),
  step('waiter','pick|collect|take|ourselves','What would you like to do with the bag?','Yes, pick it up here after you order. Let’s check today’s menu.','可以，点好后在这里取。先来看看今天的菜单。')]),
 workshop:story('停电后的阅读角','The reading corner lost power. Ask Lisa which table needs light.','阅读角停电了。问 Lisa 哪张桌子需要灯。',[
  step('lisa','table|light|where','Which part of the reading corner are you checking?','The low table. Ask Alex whether the lamp needs a cable.','矮桌。问 Alex 灯需不需要电线。'),
  step('alex','cable|wire|plug','What could we use for power?','There is no socket there. What portable power source can we use?','那儿没有插座。可以用什么便携电源？'),
  step('alex','battery|batteries','What can power a lamp without a socket?','A battery, yes. Ask Lisa what colour light the readers prefer.','对，用电池。问 Lisa 读者喜欢什么颜色的灯光。'),
  step('lisa','colour|color|light','Which detail about the light?','Warm light, please. Tell Alex which bulb we need.','请用暖光。告诉 Alex 我们需要什么灯泡。'),
  step('alex','warm','Which light should I get ready?','Warm light. Which table did Lisa choose?','暖光。Lisa 选了哪张桌子？'),
  step('alex','low|short','Which table will hold the lamp?','Right. Ask Lisa if the lamp needs a handle.','对。问 Lisa 灯要不要提手。'),
  step('lisa','handle|carry','What would help us move the lamp?','Yes, we carry it between tables. Tell Alex why.','需要，我们要把灯提到不同桌子上。告诉 Alex 原因。'),
  step('alex','carry|move|portable|tables','Why does the lamp need a handle?','I have a base with a handle ready. Let’s build the lantern.','带提手的底座准备好了。来组装这盏灯吧。')])
};

const norm=text=>String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,"'").replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ').trim();
function matches(text,choices){
 return choices.split('|').some(word=>new RegExp('\\b'+norm(word)+'(?:s|es|ing)?\\b').test(text));
}
export function withAdvancedStory(base,layout){
 const story=advancedStories[base.config.id];
 const people=[...new Set([...base.config.people,...story.steps.map(s=>s.npc)])];
 const newWords={
  u1:['art club'],u2:['beat','melody'],u3:['photographer'],wish:['green','paper'],welcome:['quiet','library hours'],science:['star label','space team'],school:['timetable','spare copy'],
  restaurant:['lunch bag','to go'],shopping:['waterproof','cotton'],directions:['temporary stop','east gate'],
  weather:['shower','noon'],hobbies:['book a time','afternoon'],picnic:['west gate','leaf label'],workshop:['socket','warm light','handle']
 };
 const config={...base.config,title:story.title,people,words:[...new Set([...base.config.words,...newWords[base.config.id]])]};
 let index=-1,known=new Set();
 const active=()=>index>=0&&index<story.steps.length;
 const state={...base.state};
 function sync(){
  Object.assign(state,base.state);
  state.advancedStep=active()?index:null;
  if(active())state.stage='advanced';
 }
 function store(npc,r){state.records[npc]=r;return r;}
 return {config,state,get clueStep(){return active()?'advanced-'+index:base.clueStep??base.state.stage;},
  get keyword(){const s=story.steps[index];return s?s.facts.split(/[|/]/)[0]:base.keyword;},
  marker(n){return active()?(n===story.steps[index].npc?'ask':state.records[n]?'text':'idle'):base.marker(n);},
  hint(){if(!active())return base.hint();const who=layout.people[story.steps[index].npc].name;return line('Speak to '+who+'. '+story.steps[index].prompt,'去找 '+who+'。');},
  act(n,type,text,pos,clear=()=>true){
   if(!active()){
    const result=base.act(n,type,text,pos,clear);
    if(index===-1&&type==='mission'&&result&&base.state.stage!=='brief'){
     index=0;sync();
     return store(n,line(result.en+' '+story.brief.en,result.zh+' '+story.brief.zh));
    }
    sync();
    return result;
   }
   const step=story.steps[index],target=layout.people[n];
   if(!target||n!==step.npc||!pos||Math.hypot(pos.x-target.x,pos.z-target.z)>layout.interactionRadius||!clear(target))return null;
   const prompt=line(step.prompt,'可以重听线索，或补充缺少的信息。');
   if(type==='greet')return prompt;
   if(type!=='say')return null;
   const t=norm(text),groups=step.facts.split('/');
   if(/\b(repeat|again|slower)\b/.test(t))return state.records[n]||prompt;
   if(!/\b(not|never|maybe|if|wrong)\b|n't\b/.test(t)&&(!/\bno\b/.test(t)||groups.some(g=>g.split('|').includes('no')))){
    for(const group of groups)if(matches(t,group))known.add(group);
   }
   if(!groups.every(g=>known.has(g))){
    if(known.size&&groups.length===2)return store(n,known.has(groups[0])?line('What time?','几点？'):line('Which gate?','哪个门？'));
    return store(n,prompt);
   }
   known=new Set();index++;sync();
   return store(n,step.reply);
  }
 };
}

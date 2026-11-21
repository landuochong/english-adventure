const pair=(en,zh)=>({en,zh});
const welcome=pair('Welcome to Future Campus! I am your teacher, Mia. We learn and build things in the science centre, read in the library, meet friends at the cafe, and play in the sports area. Jalor will explore with you. What should I call you, and what do you like doing? You can use a nickname.','欢迎来到未来校园！我是 Mia 老师。我们在科学中心学习和创造，在图书馆阅读，在咖啡馆见朋友，也在运动区活动。Jalor 会陪你探索。你希望我怎么称呼你？你喜欢做什么？可以用昵称。');
const places={lisa:{name:'library',aliases:/\b(library|reading|books)\b/,reply:pair('Welcome to the library! I am Lisa. You can read here or borrow a book. Please ask before taking a book. I hope you find something you enjoy!','欢迎来到图书馆！我是 Lisa。你可以在这里阅读，也可以借书，拿书前先问一问。希望你找到喜欢的书！')},waiter:{name:'cafe',aliases:/\b(cafe|cafeteria|food|lunch)\b/,reply:pair('Hello, I am Kai. This is our campus cafe. We have food and drinks, and tables where friends can meet. When you want lunch, come and ask about the menu!','你好，我是 Kai。这是校园咖啡馆，有食物、饮料和聚会的桌子。想吃午餐时，来问问菜单吧！')},sue:{name:'sports area',aliases:/\b(sports?|swimming|basketball|playground)\b/,reply:pair('Hi, I am Sue. Welcome to the sports area! We enjoy games and exercise here. You can ask a friend to join you. There is always someone new to meet!','嗨，我是 Sue，欢迎来到运动区！我们在这里做游戏和锻炼，你可以邀请朋友一起，也能认识新伙伴！')}};
export {places as welcomeStops};
export const welcomeThanks=pair('You have introduced yourself and met your new schoolmates. Welcome to Future Campus! Your school adventure starts today. You can keep exploring or try another task.','你介绍了自己，也认识了新同伴。欢迎正式加入未来校园！你的校园冒险今天开始，可以继续探索，也可以挑战其他任务。');
export function createWelcomeMission(config,layout){
 const state={stage:'brief',owner:null,complete:false,records:{},profile:{},visited:[]};
 const record=(id,r)=>{state.records[id]=r;return r;};
 return {config,state,marker(id){if(!config.people.includes(id))return 'idle';if(state.complete)return 'done';if(id==='mia')return ['brief','introduction','return'].includes(state.stage)?'ask':state.records[id]?'text':'idle';if(['explore','return'].includes(state.stage)&&!state.visited.includes(id))return 'ask';return state.records[id]?'text':'idle';},hint(){if(state.stage==='brief')return pair('Mia is waiting at the science centre. Go and listen to her welcome.','Mia 在科学中心等你，先去听她的欢迎介绍。');if(state.stage==='introduction')return pair('Tell Mia what to call you and something you enjoy. A nickname is fine.','告诉 Mia 怎么称呼你，以及你的爱好，可以用昵称。');if(state.stage==='explore')return pair('Choose two places you heard about. Walk there and say hello or ask about the place. You choose the order.','选择刚才听到的两个地点，亲自走过去打招呼或询问。顺序由你决定。');if(state.stage==='return')return pair('Go back to Mia and tell her which place you liked visiting.','回到 Mia 身边，说说你喜欢刚才参观的哪个地方。');return pair('Confirm with Mia to finish your welcome ceremony.','向 Mia 确认，完成入学仪式。');},act(id,type,text='',pos,clearLine=()=>true){
 const target=layout.people[id];if(!config.people.includes(id)||!target||!pos||!clearLine(target)||Math.hypot(pos.x-target.x,pos.z-target.z)>layout.interactionRadius)return null;
 if(state.complete)return id==='mia'?welcomeThanks:state.records[id];
 if(type==='mission'&&id==='mia'&&state.stage==='brief'){state.stage='introduction';return record(id,welcome);}
 if(type==='deliver'&&id==='mia'&&state.stage==='handover'){state.stage='complete';state.complete=true;return record(id,welcomeThanks);}
 if(type==='greet'){
  if(id==='mia'){
   if(state.stage==='brief')return pair('Welcome! Come and listen to our school introduction.','欢迎！来听听我们的校园介绍。');
   if(state.stage==='introduction'){
    if(state.profile.name)return pair('Welcome back! What do you like doing?','欢迎回来！你喜欢做什么？');
    if(state.profile.hobby)return pair('Welcome back! What should I call you?','欢迎回来！我该怎么称呼你？');
    return pair('Hello again! What should I call you, and what do you like doing? A nickname is fine.','又见面了！我该怎么称呼你？你喜欢做什么？可以用昵称。');
   }
   if(state.stage==='explore')return pair(state.visited.length?'Welcome back! Meet someone at one more place, then tell me which place you liked.':'Now explore our school. Meet Lisa at the library, Kai at the cafe, or Sue at the sports area. Choose at least two places, then come back and tell me which place you liked.',state.visited.length?'欢迎回来！再去一个地方认识同伴，然后回来告诉我你喜欢哪一处。':'现在逛逛学校吧。图书馆有 Lisa，咖啡馆有 Kai，运动区有 Sue。任选至少两处，再回来告诉我你喜欢哪里。');
   if(state.stage==='return')return pair('Welcome back! Which place did you enjoy visiting?','欢迎回来！你喜欢参观哪个地方？');
   if(state.stage==='handover')return pair('Wonderful! Please confirm that you are ready to join our school.','太好了！请确认加入学校，完成入学仪式。');
  }
  if(state.visited.includes(id))return places[id].reply;
  return pair('Hello! Welcome to the '+places[id].name+'. What would you like to know about this place?','你好！欢迎来这里，你想了解些什么？');
 }
 if(type!=='say')return null;const t=text.toLowerCase().replace(/[’]/g,"'").replace(/[.!?,]/g,' ').replace(/\s+/g,' ').trim();
 if(/\b(not|never|no|don't|didn't|doesn't|isn't|wasn't|weren't|haven't|hasn't|won't|wouldn't|cannot|can't)\b/.test(t))return record(id,pair(state.stage==='return'?'That is okay. Which place did you enjoy? Tell me one place you liked.':'Tell me something you enjoy, or what you would like me to call you.','可以有不喜欢的事物。请单独说一句你喜欢的地点或爱好；介绍名字也可以。'));
 if(id==='mia'&&state.stage==='introduction'){
 const clauses=t.replace(/\b(?:and )?i (?=like|love|enjoy|am\b)/g,'|i ').replace(/\b(?:and )?(?=my name is|you can call me)/g,'|');
 const name=clauses.match(/\b(?:my name is|(?:you can )?call me|i am|i'm) ([a-z][a-z'-]*(?: [a-z][a-z'-]*)?)(?=\s*(?:\||$))/);
 const validName=value=>value&&!/\b(happy|ready|fine|new|student|here|tired|hungry|hello|hi|yes|no|okay|ok|thanks|teacher|sorry)\b/.test(value);
 if(name&&validName(name[1]))state.profile.name=name[1];
 else if(state.awaiting==='name'&&/^[a-z][a-z'-]*(?: [a-z][a-z'-]*)?$/.test(t)&&validName(t)&&! /ing$/.test(t))state.profile.name=t;
 const hobby=clauses.match(/\bi (?:like|love|enjoy) (.+?)(?=\||$)/);
 if(hobby&&/[a-z]/.test(hobby[1])&&hobby[1].length<=100)state.profile.hobby=hobby[1].trim();
 else if(state.awaiting==='hobby'&&/^(?:playing|reading|drawing|swimming|singing|dancing|running|cooking|painting|coding|cycling|hiking|watching|listening|football|soccer|basketball|tennis|music|art|sports|video games)\b/.test(t)&&t.length<=100)state.profile.hobby=t;
 if(!state.profile.name){state.awaiting='name';return record(id,pair('What should I call you? You can say: My name is, followed by your nickname.','我该怎么称呼你？可以用 My name is 加上你的昵称。'));}
 if(!state.profile.hobby){state.awaiting='hobby';return record(id,pair('Nice to meet you, '+state.profile.name+'! What do you like doing?','很高兴认识你！你喜欢做什么？'));}
 state.awaiting=null;
 state.stage='explore';return record(id,pair('It is lovely to meet you, '+state.profile.name+'! Now explore our school. Meet Lisa at the library, Kai at the cafe, or Sue at the sports area. Choose at least two places, in any order. Say hello and listen to their introductions. Then come back and tell me which place you liked.','很高兴认识你！现在逛逛学校：图书馆有 Lisa，咖啡馆有 Kai，运动区有 Sue。任选至少两处，打招呼并听介绍，再回来告诉我你喜欢哪一处。'));
 }
 if(places[id]&&['explore','return'].includes(state.stage)){
 if(!/^(hello|hi|hey|good morning|good afternoon|nice to meet you|what|where|how|can|could|tell|please tell)\b/.test(t))return record(id,pair('Hello! Say hello back, or ask me about this place.','你好！你可以打招呼，或者问问这里是什么地方。'));
 if(!state.visited.includes(id))state.visited.push(id);if(state.visited.length>=2)state.stage='return';return record(id,places[id].reply);
 }
 if(id==='mia'&&state.stage==='return'){
 const named=Object.entries(places).filter(([,p])=>p.aliases.test(t));
 const shortAnswer=/^(?:the )?(?:library|cafe|cafeteria|sports? area|playground)(?: please)?$/.test(t);
 if((!shortAnswer&&!/\b(like|love|enjoy|liked|loved|enjoyed|favourite|favorite|visited)\b/.test(t))||!named.some(([npc])=>state.visited.includes(npc)))return record(id,pair('Which place did you enjoy visiting? Tell me about a place where you met someone.','你喜欢参观哪一处？说说你实际去过、认识了同伴的地方。'));
 state.stage='handover';return record(id,pair('Wonderful! You have begun to find your place here. Please confirm that you are ready to join our school.','太好了！你开始熟悉这里了。请确认加入学校，完成入学仪式。'));
 }
 return pair('Please finish your current welcome activity, then come and talk to me again.','先完成当前迎新活动，再来和我交流。');
 }};
}

import {generatedTurn} from './generated-story.js';
import {conversationPlans,continueConversation,restoreConversation,conversationQuestion} from './scene-conversation.js?v=2';
// Daily adventures share Pip's student-led loop. All dialogue is scripted, not AI.
const scenePair=(en,zh)=>({en,zh});
const sceneIntent={
 question:t=>/\b(what|where|when|which|how|have|has|do|does|did|can|could|may|is|are|will|would|tell)\b/.test(t),
 request:t=>/\b(can|could|may|would|please|like|want|need|let|join|come|borrow|lend)\b/.test(t),
 thanks:t=>/\b(thank|thanks|appreciate)\b/.test(t),
 report:t=>/\b(here|got|have|found|ordered|take|bus|she|sue|mary)\b/.test(t)
};
const sceneHas=(t,...patterns)=>patterns.every(p=>p.test(t));
const sceneAction=(id,npc,label,test,en,zh,hint)=>({id,npc,label,test,reply:scenePair(en,zh),hint:scenePair(...hint)});
export const dailyScenes={
 school:{title:'课前借书',hook:'上课前，Tom 遇到一个小麻烦。',theme:'classroom',giver:'tom',mission:scenePair('I forgot my maths book at home. Could you borrow one from Lisa for me? Tell her I will return it tomorrow, then bring it back here.','我把数学书忘在家里了。能帮我向 Lisa 借一本吗？告诉她我明天归还，再把书带回来。'),
  intro:scenePair('We are in the classroom before a lesson. Walk over to Tom and listen to his request. You do the talking; I will help you think.','我们在上课前的教室。先走近 Tom，听听他的请求。你来交流，我帮你分析。'),
  places:[['📚','Reading corner',76,22],['🪑','Classroom',30,22],['🚪','Hallway',50,83]],
  npcs:[{id:'tom',name:'Tom',icon:'👦',x:260,y:320},{id:'lisa',name:'Lisa',icon:'👧',x:760,y:330}],
  phrases:['Could I borrow your …, please?','I will give it back …','Here you are.'],
  actions:[
   sceneAction('borrow','lisa','借到课本',t=>sceneIntent.request(t)&&sceneHas(t,/\b(borrow|lend|use|have)\b/,/\b(math|maths|mathematics)\b/,/\b(book|textbook)\b/),'Yes, you can borrow my maths book. When will Tom give it back?','可以借我的数学书。Tom 什么时候归还？',['Ask politely to borrow the kind of book Tom needs.','礼貌地借 Tom 需要的那种书。']),
   sceneAction('return','lisa','约定归还',t=>t==='tomorrow'||sceneHas(t,/\btomorrow\b/,/\b(return|back|give)\b/),'Tomorrow is fine. Here is the book. Please take it to Tom.','明天可以。给你书，请带给 Tom。',['Lisa asked when the book will come back. Listen to Tom again if you need to.','Lisa 问什么时候归还。忘记了可以重听 Tom 的请求。']),
   sceneAction('deliver','tom','交还同学',t=>sceneHas(t,/\b(book|textbook)\b/,/\b(here|got|have|brought)\b/),'Thank you! Now I can join the maths lesson. I will return the book tomorrow.','谢谢！我可以上数学课了，明天会归还。',['Bring the book to Tom and tell him you have it.','回到 Tom 身边，告诉他你带来了书。'])]},
 restaurant:{title:'咖啡馆点餐',hook:'Lily 想请你帮忙点午餐。',theme:'cafe',giver:'lily',mission:scenePair('Could you order lunch for me? I would like a chicken sandwich with no onions and a glass of water. Check the menu with the waiter first, then tell me when you have ordered.','能帮我点午餐吗？我要无洋葱鸡肉三明治和一杯水。先问服务员菜单，点好后告诉我。'),
  intro:scenePair('Welcome to the cafe. Lily is waiting by a table. Listen to what she needs before you order.','我们到了咖啡馆。先去桌旁听听 Lily 需要什么，再点餐。'),
  places:[['☕','Counter',76,23],['🍽️','Tables',26,22],['🚪','Entrance',48,84]],npcs:[{id:'lily',name:'Lily',icon:'👧',x:250,y:330},{id:'waiter',name:'Waiter',icon:'🧑‍🍳',x:760,y:330}],phrases:['Could I see the menu?','I would like …, please.','With / without …'],
  actions:[
   sceneAction('menu','waiter','了解菜单',t=>sceneIntent.question(t)&&/\b(menu|serve|sandwich|food|recommend)\b/.test(t),'We serve chicken sandwiches. You can have one with or without onions. We also have water and juice. What would you like?','我们有鸡肉三明治，可加或不加洋葱，还有水和果汁。你想要什么？',['Ask the waiter about the menu.','向服务员询问菜单。']),
   sceneAction('order','waiter','按要求点餐',t=>sceneIntent.request(t)&&sceneHas(t,/\bchicken\b/,/\bsandwich\b/,/\b(no|without)\s+(any\s+)?onions?\b/,/\bwater\b/)&&! /\b(with|add|extra)\s+onions?\b|\bjuice\b/.test(t),'One chicken sandwich, no onions, and a glass of water. Your order is ready for Lily.','一份无洋葱鸡肉三明治，一杯水。Lily 的餐点好了。',['Remember the food, the drink, and what Lily does not want. Replay her request if you need to.','注意食物、饮料和 Lily 不要的配料；可以重听她的请求。']),
   sceneAction('report','lily','告知点餐结果',t=>sceneHas(t,/\b(ordered|order|here|got)\b/,/\b(lunch|food|sandwich|meal)\b/),'Thank you for ordering my lunch! You remembered what I needed. Enjoy your meal too!','谢谢你帮我点午餐，记住了我的要求！也祝你用餐愉快！',['Go back to Lily and tell her you have ordered lunch.','回到 Lily 身边，告诉她午餐点好了。'])]},
 shopping:{title:'挑选帽子',hook:'Jack 正在商店里选礼物。',theme:'shop',giver:'jack',mission:scenePair('Please help me buy a blue cap in medium. Ask the shop assistant how much it costs first. My budget is thirty yuan. Bring the cap to me when you have it.','请帮我买一顶蓝色中号帽子。先向店员问价，我的预算是三十元。拿到后带给我。'),intro:scenePair('We are at a clothes shop. Talk to Jack first, then use what you hear to choose the right item.','我们在服装店，先听 Jack 的需求，再挑选合适的物品。'),places:[['🧢','Accessories',76,22],['👕','Clothes',25,22],['🛍️','Entrance',50,84]],npcs:[{id:'jack',name:'Jack',icon:'👦',x:250,y:330},{id:'seller',name:'Shop assistant',icon:'🧑‍💼',x:760,y:330}],phrases:['How much is the …?','Do you have this in …?','I would like a … in size …'],
  actions:[
   sceneAction('price','seller','询问价格',t=>sceneIntent.question(t)&&sceneHas(t,/\b(how much|price|cost)\b/,/\bcap\b/),'The blue cap is twenty-five yuan. It comes in small, medium, and large. Which size would you like?','蓝帽子二十五元，有小、中、大号。你要什么尺码？',['Ask how much the cap Jack wants costs.','询问 Jack 想要的帽子的价格。']),
   sceneAction('buy','seller','选择合适款式',t=>sceneIntent.request(t)&&sceneHas(t,/\b(blue|it|this|that)\b/,/\b(cap|it|this|that)\b/,/\bmedium\b/)&&! /\b(red|small|large)\b/.test(t),'Here is your blue cap in medium. Twenty-five yuan, please. That is within your budget.','给你蓝色中号帽子，二十五元，在预算内。',['Tell the assistant the colour, item, and size you need.','告诉店员需要的颜色、物品和尺码。']),
   sceneAction('deliver','jack','送到同伴手中',t=>sceneHas(t,/\bcap\b/,/\b(here|got|have|bought)\b/),'Thank you! The blue cap fits, and it was within my budget. Great shopping!','谢谢！蓝帽子很合适，也在预算之内。购物成功！',['Take the cap back to Jack and hand it over.','回到 Jack 身边，把帽子交给他。'])]},
 directions:{title:'去博物馆',hook:'Anna 需要你的问路帮助。',theme:'town',giver:'anna',mission:scenePair('I want to visit the museum, but I do not know the way. Ask the bus driver which bus to take and where to get off. Check with the librarian where the museum is, then tell me the route.','我想去博物馆，但不认识路。问司机坐几路、哪里下，再问图书管理员博物馆的位置，回来告诉我路线。'),intro:scenePair('We are in town. Anna needs directions. Talk to her first, then collect the route one part at a time.','我们在小镇。先听 Anna 的请求，再一步一步询问路线。'),places:[['🚏','Bus stop',48,19],['🏛️','Library',79,55],['🌳','Town square',22,65]],npcs:[{id:'anna',name:'Anna',icon:'👩',x:220,y:320},{id:'driver',name:'Bus driver',icon:'🧑‍✈️',x:500,y:220},{id:'librarian',name:'Librarian',icon:'👩‍🏫',x:790,y:390}],phrases:['Which bus goes to …?','Where should I get off?','Is it near …?'],
  actions:[
   sceneAction('bus','driver','询问交通路线',t=>sceneIntent.question(t)&&sceneHas(t,/\b(bus|way|get|go)\b/,/\bmuseum\b/),'Take bus five to the museum area. Get off at the library. Ask the librarian where to go next.','坐五路，到图书馆下车，再问管理员后面的路。',['Ask which bus goes to the museum.','询问哪路公交去博物馆。']),
   sceneAction('location','librarian','确认目的地位置',t=>sceneIntent.question(t)&&sceneHas(t,/\bmuseum\b/,/\b(where|way|near|next|find|get|how)\b/),'The museum is next to the library. After you get off the bus, you can walk there.','博物馆在图书馆旁边，下车后走过去就行。',['Ask the librarian where the museum is.','向管理员询问博物馆的位置。']),
   sceneAction('route','anna','向同伴说明路线',t=>sceneHas(t,/\b(bus\s*(number\s*)?(five|5)|(number\s*)?(five|5)\s+bus)\b/,/\b(get off|stop|off at)\b/,/\blibrary\b/,/\b(next to|beside)\b/,/\bmuseum\b/)&&! /\bbus\s*(six|6|four|4)\b/.test(t),'Thank you! I will take bus five, get off at the library, and walk to the museum next door.','谢谢！我会坐五路，在图书馆下车，走到旁边的博物馆。',['Tell Anna all three parts: bus, stop, and where the museum is.','告诉 Anna 三部分：几路公交、哪里下车、博物馆相对位置。'])]},
 weather:{title:'周末公园计划',hook:'Bob 想安排一次户外活动。',theme:'park',giver:'bob',mission:scenePair('I would like to fly a kite in the park this Saturday. Please ask the park ranger about Saturday’s weather. If it is sunny, invite Mary and ask her to bring a kite. Then tell me if she can come.','我想周六在公园放风筝。请向管理员问天气。如果晴朗，就邀请 Mary 带风筝来，再告诉我她是否能来。'),intro:scenePair('We are planning an outdoor day. Talk to Bob, check the weather, then help him make a plan.','我们要安排户外活动，先听 Bob 的计划，再询问天气。'),places:[['🌤️','Weather station',49,18],['🌳','Park gate',79,57],['🪁','Picnic lawn',22,65]],npcs:[{id:'bob',name:'Bob',icon:'👦',x:220,y:320},{id:'ranger',name:'Park ranger',icon:'🧑‍🌾',x:500,y:220},{id:'mary',name:'Mary',icon:'👧',x:790,y:390}],phrases:['What will the weather be like on …?','Would you like to come to …?','Please bring …'],
  actions:[
   sceneAction('forecast','ranger','询问天气',t=>sceneIntent.question(t)&&sceneHas(t,/\b(weather|sunny|rain|forecast)\b/,/\bsaturday\b/),'Saturday will be sunny and a little windy. It is a good day to fly a kite in the park.','周六晴朗，有微风，很适合在公园放风筝。',['Ask about the weather on the day Bob mentioned.','询问 Bob 所说那一天的天气。']),
   sceneAction('invite','mary','邀请同伴',t=>sceneIntent.request(t)&&sceneHas(t,/\bpark\b/,/\bsaturday\b/,/\bkite\b/)&&! /\b(sunday|rainy)\b/.test(t),'Yes, I would love to come to the park on Saturday! I will bring my kite. Please tell Bob.','好呀！周六我会去公园并带风筝，请告诉 Bob。',['Invite Mary. Mention the place, day, and what to bring.','邀请 Mary，说明地点、日期和要带的东西。']),
   sceneAction('confirm','bob','确认活动计划',t=>sceneHas(t,/\bmary\b/,/\b(come|coming|join|yes|can)\b/),'Wonderful! Mary can come. Thank you for checking the weather and arranging our kite day!','太好了！Mary 能来。谢谢你查天气并安排好放风筝的活动！',['Return to Bob and tell him whether Mary can come.','回去告诉 Bob，Mary 是否能参加。'])]},
 hobbies:{title:'邀请新伙伴',hook:'Tim 想找同伴一起运动。',theme:'sports',giver:'tim',mission:scenePair('I go swimming every Sunday. Could you ask Sue about her favourite sport? Invite her to swim with us this Sunday, then tell me if she would like to join.','我每周日游泳。能问问 Sue 最喜欢什么运动，邀请她这周日一起游泳，再告诉我她是否愿意吗？'),intro:scenePair('We are at the sports centre. Tim is looking for a new sports partner. Listen to him first.','我们在运动中心。Tim 想找新伙伴，先去听听他的想法。'),places:[['🏊','Pool',25,22],['🏀','Court',77,22],['🚪','Sports centre',50,84]],npcs:[{id:'tim',name:'Tim',icon:'👦',x:250,y:330},{id:'sue',name:'Sue',icon:'👧',x:760,y:330}],phrases:['What is your favourite sport?','Would you like to … with us?','She would like to join.'],
  actions:[
   sceneAction('sport','sue','了解对方爱好',t=>sceneIntent.question(t)&&sceneHas(t,/\b(sport|play|hobby|hobbies|doing|do)\b/,/\b(favourite|favorite|like|enjoy|love)\b/),'My favourite sport is basketball. But I would like to try another sport. What do you have in mind?','我最喜欢篮球，不过也想试试别的运动。你有什么想法？',['Ask Sue what sport she likes.','问问 Sue 喜欢什么运动。']),
   sceneAction('invite','sue','发出运动邀请',t=>sceneIntent.request(t)&&sceneHas(t,/\bswim(ming)?\b/,/\bsunday\b/)&&! /\b(saturday|basketball)\b/.test(t),'Yes, I would love to go swimming with you this Sunday. Please tell Tim I will join you.','好呀，这周日我愿意和你们游泳，请告诉 Tim。',['Invite Sue to the activity and day Tim mentioned.','邀请 Sue 参加 Tim 提到的运动，说明日期。']),
   sceneAction('confirm','tim','告知邀请结果',t=>sceneHas(t,/\bsue\b/,/\b(come|coming|join|yes|can|swim|swimming)\b/),'Great! Sue is joining us on Sunday. Thank you for inviting her. See you at the pool!','太好了，Sue 周日会加入。谢谢你邀请她，泳池见！',['Tell Tim whether Sue will join you.','告诉 Tim，Sue 是否愿意参加。'])]}
};
export const sceneVocabulary={
 school:[['maths book','数学课本','A maths book is a textbook for mathematics.'],['borrow','借入','Borrow means use something and give it back later.'],['lend','借出','Lend means let another person borrow something.'],['return','归还','Return means give something back.'],['tomorrow','明天','Tomorrow is the day after today.'],['forgot','忘记了','Forgot means did not remember to bring or do something.']],
 restaurant:[['menu','菜单','A menu lists the food and drinks you can order.'],['chicken sandwich','鸡肉三明治','A chicken sandwich is bread with chicken inside.'],['onions','洋葱','Onions are a vegetable often added to sandwiches.'],['without','不加；没有','Without onions means there are no onions in the food.'],['a glass of water','一杯水','A glass of water is a drink of water in a glass.'],['order','点餐','Order means ask a waiter for food or drinks.']],
 shopping:[['cap','帽子','A cap is a soft hat with a part that shades your eyes.'],['blue','蓝色','Blue is the colour of a clear sky.'],['medium','中号','Medium is a size between small and large.'],['how much','多少钱','How much asks about the price.'],['budget','预算','Your budget is the most money you plan to spend.'],['yuan','元','Yuan is a unit of Chinese money.']],
 directions:[['bus','公交车','A bus carries people along a route.'],['get off','下车','Get off means leave the bus at your stop.'],['library','图书馆','A library is a place where you can read or borrow books.'],['museum','博物馆','A museum is a place where you can see interesting objects and learn.'],['next to','在旁边','Next to means beside or very close to something.'],['route','路线','A route is the way you take to get to a place.']],
 weather:[['weather','天气','Weather describes the sun, rain, wind, and temperature.'],['sunny','晴朗的','Sunny means there is lots of sunshine.'],['windy','有风的','Windy means the air is moving outside.'],['Saturday','星期六','Saturday is the day after Friday.'],['kite','风筝','A kite is a toy that flies in the wind on a string.'],['bring','带来','Bring means take something with you to a place.']],
 hobbies:[['favourite sport','最喜欢的运动','Your favourite sport is the sport you like best.'],['basketball','篮球','Basketball is a sport where you throw a ball through a hoop.'],['swimming','游泳','Swimming means moving through water using your arms and legs.'],['Sunday','星期日','Sunday is the day after Saturday.'],['invite','邀请','Invite means ask someone to do something with you.'],['join','参加；加入','Join means become part of an activity or group.']]
};
const sceneClarifications={
 school:[['What kind of book would you like to borrow? Please ask me in a sentence.','你想借哪种书？请用一句话向我提出请求。'],['When will Tom give the book back?','Tom 什么时候归还这本书？'],['Did you bring the book? Tell me what you have.','你把书带来了吗？告诉我你带了什么。']],
 restaurant:[['Would you like to ask about our menu?','你想了解我们的菜单吗？'],['Please tell me the sandwich, anything to leave out, and your drink.','请说清三明治、不要的配料，以及饮料。'],['Have you ordered my lunch? Tell me what you did.','你帮我点好午餐了吗？告诉我结果。']],
 shopping:[['Which cap would you like to know the price of?','你想问哪顶帽子的价格？'],['Please tell me the item, colour, and size you would like.','请说清想要的物品、颜色和尺码。'],['Did you bring my cap?','你把我的帽子带来了吗？']],
 directions:[['Where do you want to go? Ask me about a bus or the way there.','你要去哪里？可以问我公交或路线。'],['Which place are you trying to find? Ask where it is.','你在找什么地方？请询问它的位置。'],['Please tell me the bus, the stop, and where the museum is.','请告诉我公交线路、下车站点以及博物馆的位置。']],
 weather:[['Which day would you like the weather forecast for?','你想问哪一天的天气？'],['Where and when are we going? Do I need to bring anything?','我们何时去哪里？需要带东西吗？'],['Can Mary join us? Tell me what she said.','Mary 能来吗？告诉我她的答复。']],
 hobbies:[['Would you like to ask about my favourite sport?','你想问我最喜欢的运动吗？'],['What would you like me to do with you, and on which day?','你想邀请我哪一天一起做什么？'],['Would Sue like to join us? Tell me what she said.','Sue 愿意参加吗？告诉我她的答复。']]
};
export function newSceneState(){return {prepared:false,started:false,done:[],conversation:null,replies:{},journal:[],complete:false,tries:0,player:{x:120,y:450}};}
export function restoreSceneState(id,raw){
 const st=newSceneState(),w=dailyScenes[id];if(!w||!raw||typeof raw!=='object')return st;
 st.prepared=raw.prepared===true;st.started=st.prepared&&raw.started===true;
 if(st.started)for(const a of w.actions){if(!Array.isArray(raw.done)||!raw.done.includes(a.id))break;st.done.push(a.id);}
 st.complete=st.done.length===w.actions.length;st.tries=Number.isFinite(raw.tries)?Math.max(0,raw.tries):0;
 if(Number.isFinite(raw.player?.x)&&Number.isFinite(raw.player?.y))st.player={x:Math.max(50,Math.min(950,raw.player.x)),y:Math.max(70,Math.min(530,raw.player.y))};
 // Reconstruct only earned information, never trust unearned cached answers.
 if(st.started){st.replies[w.giver]=w.mission;st.journal.push({npc:w.giver,...w.mission});}
 for(const a of w.actions.filter(a=>st.done.includes(a.id))){st.replies[a.npc]=a.reply;st.journal.push({npc:a.npc,...a.reply});}
 const next=sceneNext(id,st),key=next&&id+'.'+next.id;
 if(st.started&&next&&raw.conversation?.key===key){const draft=next.generatedSlots?generatedTurn(next.generatedSlots,raw.conversation.draft,'').draft:restoreConversation(key,raw.conversation.draft);if(draft){st.conversation={key,draft};st.lastNpc=next.npc;st.response=next.generatedSlots?generatedTurn(next.generatedSlots,draft,'').response:conversationQuestion(conversationPlans[key],draft);}}
 return st;
}
export function sceneNear(id,st){return dailyScenes[id]?.npcs.filter(n=>Math.hypot(n.x-st.player.x,n.y-st.player.y)<=90).sort((a,b)=>Math.hypot(a.x-st.player.x,a.y-st.player.y)-Math.hypot(b.x-st.player.x,b.y-st.player.y))[0]||null;}
export function sceneNext(id,st){return dailyScenes[id].actions.find(a=>!st.done.includes(a.id));}
// A reply is not the same as finishing a conversation. Reopen the giver when the return step becomes current.
export function sceneContactMode(id,st,npcId){
 const w=dailyScenes[id];
 if(!st.started&&npcId===w.giver)return 'mission';
 if(!st.complete&&sceneNext(id,st)?.npc===npcId)return 'ask';
 return st.replies[npcId]?'replay':'ask';
}
export function sceneInteract(id,st,npcId,text=null){
 const w=dailyScenes[id],n=w?.npcs.find(n=>n.id===npcId);
 if(!n||!st.prepared||sceneNear(id,st)?.id!==npcId)return null;
 if(!st.started){if(npcId!==w.giver)return scenePair('Please speak to your friend first. I do not know what you need yet.','先和同伴交谈，我还不知道你需要什么。');st.started=true;st.replies[npcId]=w.mission;st.journal.push({npc:npcId,...w.mission});return w.mission;}
 if(text===null)return (st.lastNpc===npcId&&st.response)||st.replies[npcId]||scenePair('Hello! What would you like to ask?','你好，你想问什么？');
 if(st.complete)return st.replies[npcId]||scenePair('Well done! You finished your task.','做得好，任务完成了。');
 const a=sceneNext(id,st);st.tries++;
 if(a.npc!==npcId)return scenePair('You still have something to do with someone else. Check what you have heard, or ask Nova for help.','你还有需要和其他人交流的事。可以重听已获得的信息，或向 Nova 求助。');
 let t=String(text).toLowerCase().replace(/[’']/g,"'").replace(/[?.!,]/g,' ').replace(/\s+/g,' ').trim();
 if(/\b(again|repeat|slower|slowly)\b/.test(t))return (st.lastNpc===npcId&&st.response)||st.replies[npcId]||scenePair('Please ask me about what you need first.','请先问我你需要的信息。');
 const key=id+'.'+a.id;
 if(!/[a-z]/.test(t)||/[\u3400-\u9fff]/.test(t))return (w.generated?a.slots[0].question:scenePair(...sceneClarifications[id][st.done.length]));
 if(a.generatedSlots){
  const previous=st.conversation?.key===key?st.conversation.draft:null;
  const result=generatedTurn(a.generatedSlots,previous,t);st.conversation={key,draft:result.draft};
  if(!result.complete){st.lastNpc=npcId;st.response=result.response;return result.response;}
 }else if(conversationPlans[key]){
  const previous=st.conversation?.key===key?st.conversation.draft:null;
  const result=continueConversation(key,previous,t);st.conversation={key,draft:result.draft};
  if(!result.complete){st.lastNpc=npcId;st.response=result.response;return result.response;}
 }else{
  t=t.replace(/^(no\s+)?(sorry\s+)?i (meant|mean)\s+/,'');
  const negated=/\b(not|never|don't|doesn't|didn't|can't|cannot|won't|no)\b/.test(t);
  if(negated||!a.test(t))return (w.generated?a.slots[0].question:scenePair(...sceneClarifications[id][st.done.length]));
 }
 st.conversation=null;st.response=null;
 st.done.push(a.id);st.replies[npcId]=a.reply;st.journal.push({npc:npcId,...a.reply});st.complete=st.done.length===w.actions.length;return a.reply;
}
export function sceneCoach(id,st,text='next',context=null){
 const w=dailyScenes[id],t=text.toLowerCase(),last=context||st.journal.at(-1);
 if(/again|repeat|重听|再说/.test(t)&&last)return scenePair('Let us listen again. '+last.en,'我们重听刚才的信息。'+last.zh);
 const word=sceneVocabulary[id].find(([en])=>t.includes(en.toLowerCase()));
 if(word&&(/mean|what|explain|解释|意思|词/.test(t)||t===word[0].toLowerCase()))return scenePair(word[2],word[0]+'：'+word[1]);
 if(/mean|word|关键词|词/.test(t)){const term=sceneVocabulary[id].find(([en])=>last?.en.toLowerCase().includes(en.toLowerCase()))||sceneVocabulary[id][0];return scenePair(term[2]+' Listen to the person again and find that detail.',term[0]+'：'+term[1]+'。再听人物的话，找出这部分信息。');}
 if(/understand|detail|explain|解释|听不懂|细节|理解/.test(t)&&last)return scenePair('Let us take one part at a time. '+last.en.split(/(?<=[.!?])\s+/)[0]+' Listen for the important words. Then ask me about a word, or replay the whole message.', '先听第一部分：'+last.zh.split(/[。？！]/)[0]+'。注意关键词，也可以向我问某个词的意思，或重听整段。');
 if(st.complete)return scenePair('You did it yourself! Look back at the conversations you had.','你自己完成了任务！可以回顾刚才的交流。');
 if(!st.started)return w.intro;
 return sceneNext(id,st).hint;
}

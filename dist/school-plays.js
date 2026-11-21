// Each turn belongs to the current speaker. Physical choices are separate from speech.
import {welcomeStops} from './campus-welcome.js';

const act = (label, next, change) => ({label, next, change});
const reply = (pattern, next, change) => ({pattern, next, change});
const scene = (place, who, line, hint, replies = [], actions = []) =>
  ({place, who, line, hint, replies, actions});
const namePattern = /^(?:hello |hi )?(?:my name is|you can call me|call me|i am|i'm) ([a-z]+)(?: (?:and )?i (?:like|love|enjoy) (.+))?$/;
const invalidName = /^(?:fine|good|well|happy|nervous|new|ready|tired|not|sorry|a)$/;
const hobby = /\bi (?:like|love|enjoy) (.+)/;
const places = {library:'图书馆', cafe:'咖啡馆', sports:'运动区'};
const hosts = {library:'Lisa', cafe:'Kai', sports:'Sue'};
const stops = {library:welcomeStops.lisa, cafe:welcomeStops.waiter, sports:welcomeStops.sue};
const validName = (t) => namePattern.test(t) && !invalidName.test(t.match(namePattern)[1]);
const storeName = (s,t) => { s.name=t.match(namePattern)[1]; };
const placeIn = (t) => Object.keys(stops).find(key=>stops[key].aliases.test(t));
const ownsMoon=t=>/\bmoon\b/.test(t) && !/\b(mine|my|cat|an)\b/.test(t);
const ownsCat=t=>/\bcat\b/.test(t) && !/\b(hers|her|mei|moon)\b/.test(t);
function tour(s) {
  return Object.keys(places).filter(key=>!s.visited.includes(key)).map(key=>
    act('前往'+places[key], 'visit', s=>{s.stop=key;}));
}
const bookActions = [act('找梅核实出处','mei')];
const penReturn = (s) => s.book ? 'showBook' : 'source';
const welcome = {
  start: scene('科学中心','Mia','Welcome to Future Campus! I am Mia, your teacher. Visit two places with a classmate, then tell me which one you liked. What should I call you?', '告诉 Mia 你的昵称和爱好。',[
    reply(validName,(s,t)=>hobby.test(t)?'ben':'hobby',storeName)]),
  hobby: scene('科学中心','Mia',s=>'Nice to meet you, '+s.name+'! What do you like doing?', '说说你喜欢做什么。',[reply(hobby,'ben')]),
  ben: scene('科学中心','Ben',s=>'Hi, '+s.name+'! I am Ben. What would you like to know about me?', '认识同伴：问问他的爱好。',[reply(/\b(?:what|do you).*(?:like|enjoy|hobb|sport)/,'route')]),
  route: scene('校园路牌','Ben','I like basketball. Where shall we go first?', '商量路线：说出想先去的地方。',[
    reply(t=>!!placeIn(t),'visit',(s,t)=>{s.stop=placeIn(t);})]),
  visit: s=>scene(places[s.stop],hosts[s.stop],'Hello! What would you like to know about this place?', '打招呼，或询问这个地方能做什么。',[
    reply(/^(hello|hi|hey|good morning|nice to meet|what can|can (?:we|i)|could (?:we|i)|what is|tell me)\b/,'heard',(s)=>{if(!s.visited.includes(s.stop))s.visited.push(s.stop);})]),
  heard: s=>scene(places[s.stop],hosts[s.stop],stops[s.stop].reply.en,'走访两个不同的地点，再回 Mia 身边分享。',[],[
    ...tour(s), ...(s.visited.length>=2?[act('找 Ben 约午休地点','lunch'),act('回科学中心','report')]:[])]),
  lunch: scene('校园路牌','Ben','Where shall we meet at lunchtime?', '约在刚刚去过的一站。',[reply((t,s)=>s.visited.includes(placeIn(t)),'agreed',(s,t)=>{s.meeting=stops[placeIn(t)].name;})]),
  agreed: scene('校园路牌','Ben',s=>'See you at the '+s.meeting+'!', '回去找 Mia。',[],[act('回科学中心','report')]),
  report: scene('科学中心','Mia','Welcome back! Which place did you like?', '告诉老师你喜欢哪一处已参观的地点。',[reply((t,s)=>s.visited.includes(placeIn(t)) && !/^(where|what|can|did|do|is)\b/.test(t),'confirm')]),
  confirm: scene('科学中心','Mia','Are you ready to join our school?', '亲口确认入学。',[reply(/^(yes|i am ready|i'm ready|ready)\b/,'done')]),
  done: scene('科学中心','Mia','Welcome to Future Campus! See you in class.','你已完成报到。')
};
const correctAuthor = t=>/\bconfucius\b/.test(t) && !/\bmencius\b/.test(t) && !/^(?:who|what|is it|was it|did)\b/.test(t);
const pen = {
  start: scene('早读教室','Mei','Can you put a bookmark here? We will need this page in class.', '读一读摊开的书页，再夹好书签。',[],[act('夹上蓝书签，把书还给梅','board')]),
  board: scene('英语教室','Ms Chen','Everyone ready? I am going to clean the board.', '看一眼署名。开口指出疑问，或先找梅查证。',[
    reply(correctAuthor,penReturn),reply(/\b(mistake|wrong|name|wait)\b/,'which')],bookActions),
  which: scene('英语教室','Ms Chen','Which name should I write?', '告诉老师名言的作者。',[reply(correctAuthor,penReturn)],bookActions),
  mei: scene('课桌旁','Mei','What are you looking for?', '向梅借刚才夹过书签的书。',[reply(/\b(book|borrow|bookmark)\b/,'find')]),
  find: scene('课桌旁','Mei','Ben has my book. I gave it to him.', '听清书在谁手里。',[],[act('走到本身边','borrow'),act('走到小林身边','wrongDesk')]),
  wrongDesk: scene('课桌旁','Lin','I have my own book. Who has the one you need?', '再听梅说一遍。',[],[act('回到梅身边','find')]),
  borrow: scene('课桌旁','Ben','Hi! What do you need?', '开口借梅的书。',[reply(/\b(book|borrow|bookmark)\b/,'take')]),
  take: scene('课桌旁','Ben','Here you are. The blue bookmark is still there.', '拿书回去，重新看黑板。',[],[act('拿起书，回到黑板前','board',s=>{s.book=true;})]),
  source: scene('英语教室','Ms Chen','How do you know?', '告诉老师你在哪里见过这句话。',[reply(/\b(book|analects|read|chinese class)\b/,'fixed')],bookActions),
  showBook: scene('英语教室','Ms Chen','Can you show us where you saw the name?', '把带回来的书翻到蓝书签。',[],[act('展示书页','fixed')]),
  fixed: scene('英语教室','Ms Chen','Thank you, Wang Han. Confucius. I will change the name.', '小林抄的展签已经送出去了。',[],[act('给迟到的同学补笔记','late'),act('小林去迎新展','exhibit')]),
  late: scene('教室门边','同学','Was the whole sentence wrong?', '你是小林：说明改动的是署名。',[reply(/\b(name|author)\b/,'lateWho')]),
  lateWho: scene('教室门边','同学','Who pointed out the mistake?', '说出是谁发现问题。',[reply(/\bwang han\b/,'exhibit')]),
  exhibit: scene('迎新展','布展同学','One card welcomes our new students. The other is about learning. Which one needs a change?', '你是小林：找出需要修改的展签。',[reply(/\b(learning|quote|saying)\b/,'card')]),
  card: scene('迎新展','布展同学','What name goes on this card?', '告诉同学正确的署名。',[reply(correctAuthor,'done')]),
  done: scene('迎新展','布展同学','Confucius. Thanks! Now the card is ready for everyone to read.', '展签已更正。')
};
const fine = {
  start: scene('教室门外','Mei','Hi! How are you? Let’s go in together and introduce ourselves.', '你扮演安。告诉梅自己现在感觉如何。',[reply(/\b(fine|well|good|nervous|happy|excited|okay|ok|great|scared|tired)\b/,'pan')]),
  pan: scene('英语教室','Mr Pan','Good morning. I’m Mr Pan. What’s your name?', '留意潘老师问了什么。',[
    reply(/\bfine\b/,'joke'),reply(/^(?:my name is |i am |i'm |call me |you can call me )?ann?$/,'partner')]),
  joke: scene('英语教室','Mr Pan','Fine? Shall I write that on your name card?', '告诉老师你的角色名 An。',[reply(/^(?:no )?(?:my name is |i am |i'm |call me |you can call me )?ann?$/,'partner')]),
  partner: scene('画桌旁','Mei','I’m Mei. This moon is mine. Can you introduce me to the class?', '向大家介绍梅。',[reply(t=>/\bmei\b/.test(t) && !/\bcat\b/.test(t),(s,t)=>/\bmoon\b/.test(t)?'cat':'moon')]),
  moon: scene('画桌旁','Mr Pan','Which picture is hers?', '说明梅画了什么。',[reply(ownsMoon,'cat')]),
  cat: scene('画桌旁','Mei','And which picture is yours, An?', '认领你画的猫。',[reply(ownsCat,'paired')]),
  paired: scene('画桌旁','Mei','This is An. She drew the cat. Here are our pictures!', '两张画摆好后，午间节目来采访。',[],[act('帮本摆正桌牌','labels'),act('去采访窗','interview')]),
  labels: scene('画桌旁','Ben','An, is the moon yours?', '告诉本，月亮那张归谁。',[reply(t=>/\b(mei|hers)\b/.test(t) && !/\b(his|ben)\b/.test(t),'give')]),
  give: scene('画桌旁','Ben','Then who gets the cat?', '把猫画还给它的主人。',[reply(t=>/\b(me|mine|an)\b/.test(t) && !/\b(mei|hers|ben)\b/.test(t),'interview')]),
  interview: scene('午间采访窗','记者','An, what happened in your first English lesson?', '以安的身份，说一件刚才发生的事。',[reply((t,s)=>/\bi (?:introduced|showed|drew|met)\b/.test(t)||s.joked&&/\bi (?:said|told).*fine\b/.test(t),'reporter')]),
  reporter: scene('午间采访窗','An','Wait! That was me. Can you tell the listeners who showed the cat?', '换成记者：梅向大家展示了安的猫画。',[reply(t=>/^(?:it was )?mei (?:showed|held up)\b.*\b(cat|picture|drawing)\b/.test(t) && !/\b(moon|her own)\b/.test(t),'done')]),
  done: scene('午间采访窗','Mei','Yes, I showed the class her cat. Thanks for telling our story!', '两位当事人确认了报道。')
};
export const plays = {
  welcome:{title:'入学仪式',role:'新生',asr:'play-welcome',scenes:welcome},
  pen:{title:'停下来的笔',role:'王涵 → 小林',asr:'play-pen',scenes:pen},
  fine:{title:'我的名字叫 Fine 吗？',role:'安 → 记者',asr:'play-fine',scenes:fine}
};
export function newPlay(){return {stage:'start',visited:[],book:false};}
export function currentScene(id,s){
  const entry=plays[id].scenes[s.stage];
  const node=typeof entry==='function'?entry(s):entry;
  return {...node,line:typeof node.line==='function'?node.line(s):node.line};
}
export function advance(id,s,input,action=false){
  const node=currentScene(id,s);
  const t=input.toLowerCase().replace(/’/g,"'").replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim();
  const deny=/\b(not|never|don't|isn't|wasn't|can't|cannot|didn't)\b/.test(t);
  const correction=(s.stage==='labels' && /^(?:it(?:'s| is) not mine|it isn't mine) (?:it(?:'s| is) )?(?:hers|mei's)$/.test(t)) ||
    (s.stage==='late' && /(?:not the sentence|sentence (?:was not|wasn't) wrong).*\bname\b/.test(t));
  const move=action ? node.actions.find(a=>a.label===input) : (!deny || correction) && node.replies.find(r=>
    typeof r.pattern==='function'?r.pattern(t,s):r.pattern.test(t));
  if(!move)return false;
  move.change?.(s,t);
  const next=typeof move.next==='function'?move.next(s,t):move.next;
  if(next==='joke')s.joked=true;
  s.stage=next;
  return true;
}

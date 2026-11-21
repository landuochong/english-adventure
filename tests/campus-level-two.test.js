import test from 'node:test';
import assert from 'node:assert/strict';
import {createMissionSession} from '../dist/mission-session.js';
import {environmentLayout} from '../dist/campus-environment-layout.js';
import {workshopParts,workshopBench} from '../dist/campus-workshop.js';
import {advancedStories} from '../dist/campus-level-two.js';
import {finishLevel,readProgress} from '../dist/campus-level-catalog.js';

const extra={
 welcome:['Where can we read?','When does lunch finish?','One.','The library.'],
 science:['Which robot is on the poster?','The other robot?','A star.','Which team?','The space team.','Star.'],
 school:['Which lesson comes first?','Where is the room?','Room six.','Maths.','Can we borrow a spare?'],
 restaurant:['Which bag?','Which colour is yours?','Green.','To go.','Do you need a fork?'],
 shopping:['Which cap stays dry?','The cotton one?','Travel cap.','Do you have blue?','Which size?'],
 directions:['Which stop is closed?','Where is the temporary stop?','The east gate.'],
 weather:['When will the rain stop?','Where can we keep the kite dry?','At the café.'],
 hobbies:['When can you swim?','Book it for three.','Three.'],
 picnic:['Where do we meet?','Which gate?','When do the bags leave?','West gate at noon.','Which label?','A leaf.','Can we pick it up ourselves?'],
 workshop:['Which table?','Do we need a cable?','A battery.','What colour?','Warm light.','The low table.','Do you need a handle?','To carry it between tables.']
};
const daily={
 school:[['lisa','Could I borrow your maths book?'],['lisa','Tomorrow'],['tom','Here is your book.']],
 restaurant:[['waiter','Could I see the menu?'],['waiter','A chicken sandwich with no onions and water please.'],['lily','Here is your lunch.']],
 shopping:[['seller','How much is the blue cap?'],['seller','A blue cap in medium please.'],['jack','Here is your cap.']],
 directions:[['driver','Which bus goes to the museum?'],['librarian','Where is the museum?'],['anna','Take bus five and get off at the library. The museum is next to the library.']],
 weather:[['ranger','What will the weather be like on Saturday?'],['mary','Would you like to come to the park on Saturday? Please bring a kite.'],['bob','Mary can come.']],
 hobbies:[['sue','What is your favourite sport?'],['sue','Would you like to swim with us this Sunday?'],['tim','Yes, he will join us. He said he likes to join us.']]
};
for(const [id,answers] of Object.entries(extra))test(id+' Level 2 restores, doubles the standard route and completes independently',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const resume=()=>createMissionSession(id,storage,()=>{},false,2);
 let m=resume();const giver=m.config.giver;
 const act=(npc,type,text='',pos=environmentLayout.people[npc])=>m.act(npc,type,text,pos);
 const say=(npc,text)=>act(npc,'say',text);
 const brief=act(giver,'mission');assert.equal(m.state.advancedStep,0);
 for(const [i,text] of answers.entries()){
  const npc=advancedStories[id].steps[i].npc;
  assert.equal(m.marker(npc),'ask');
  act(npc,'say',text,{x:999,z:999});say(npc,'not sure');assert.equal(m.state.advancedStep,i);
  if(i===1){m=resume();assert.deepEqual(m.briefing,brief);assert.equal(createMissionSession(id,storage).state.stage,'brief');}
  if(id==='hobbies'&&i===2){m=resume();say(npc,'Two.');assert.equal(m.state.advancedStep,2);}
  if(id==='picnic'&&i===3){say(npc,'The west gate.');m=resume();assert.equal(m.state.advancedStep,i);say(npc,'Noon.');}
  else say(npc,text);
  assert.equal(m.state.advancedStep,i===answers.length-1?null:i+1);
 }
 let interactions=0;
 function exchange(npc,text){interactions++;say(npc,text);}
 function pickup(){act('device','discover','',m.config.device);act('device','pickup','',m.config.device);interactions++;}
 if(daily[id]){
  for(const [npc,text] of daily[id]){if(m.state.stage==='pickup')pickup();exchange(npc,text);}
 }else if(id==='welcome'){
  exchange('mia','My name is Sam and I like reading.');exchange('lisa','Hello');exchange('sue','Hello');exchange('mia','I liked the library.');
 }else if(id==='science'){
  exchange('ben','Have you seen the robot?');exchange('leo','Where is the robot?');exchange('leo','Blue, for the science fair.');pickup();exchange('mia','Here is your robot.');
 }else if(id==='picnic'){
  exchange('waiter','Chicken sandwich please.');exchange('waiter','What else do you have?');exchange('lily','Chicken sold out. Cheese.');exchange('waiter','A cheese sandwich without onions and water please.');pickup();exchange('lily','Here is your lunch.');
 }else{
  for(const part of workshopParts){act(part.id,'take-part','',part);interactions++;}
  for(const part of workshopParts){act('bench','install-part',part.id,workshopBench);interactions++;}
  act('bench','test-lamp','',workshopBench);interactions++;
 }
 if(!m.state.complete){if(m.config.kind!=='none')interactions++;act(giver,'deliver');}
 assert.equal(m.state.complete,true,id);assert.equal(interactions,answers.length,'standard route actions');
 finishLevel(storage,id,2);assert.deepEqual(readProgress(storage,2).completed,[id]);assert.deepEqual(readProgress(storage).completed,[]);
 assert.equal(resume().state.stage,'brief');
});

test('Sue can answer the sport question first, remember it after reload and finish the invitation',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const resume=()=>createMissionSession('hobbies',storage,()=>{},false,2);
 let m=resume();
 const act=(npc,type,text='')=>m.act(npc,type,text,environmentLayout.people[npc]);
 act('tim','mission');
 assert.match(act('sue','say',"What's your favourite sport?").en,/basketball/i);
 assert.equal(m.marker('tim'),'ask');assert.equal(m.clues.length,1);
 m=resume();
 assert.match(act('tim','say','Book it for three.').en,/three/);
 act('sue','say','Three.');
 assert.match(act('sue','say','Would you like to swim with us this Sunday?').en,/tell Tim/);
 act('tim','say','Yes, she will join us.');
 assert.equal(m.state.complete,true);
});

test('model-first invitation remembers only discussed facts, independently of question order',()=>{
 for(const order of [['sport','availability'],['availability','sport'],['both']]){
  const entries=new Map(),db={getItem:k=>entries.get(k),setItem:(k,v)=>entries.set(k,v),removeItem:k=>entries.delete(k)};
  let m=createMissionSession('hobbies',db,()=>{},false,2);
  const turn=(npc,student,topics,en)=>m.act(npc,'invitation-turn',JSON.stringify({student,topics,en,zh:'中文提示',model:'qwen2.5:3b'}),environmentLayout.people[npc]);
  m.act('tim','mission','',environmentLayout.people.tim);
  for(const topic of order){
   const sport=topic!=='availability',time=topic!=='sport';
   const response=turn('sue',topic==='both'?'What do you enjoy doing and when are you around?':sport?'Which game is your favourite?':'When are you around?',topic==='both'?['sport','availability']:[topic],(sport?'I enjoy basketball. ':'')+(time?'Two or three works for me.':''));
   assert.equal(response.model,'qwen2.5:3b');
   if(m.clues.length===1)assert.deepEqual([m.state.facts.sport,m.state.facts.availability],[sport,time]);
   m=createMissionSession('hobbies',db,()=>{},false,2);
  }
  assert.equal(m.state.facts.accepted,false);
  turn('tim','She will join us.',['report'],'Great!');assert.equal(m.state.complete,false);
  turn('tim','Please reserve three.',['book'],'Booked for three.');
  turn('sue','Three.',['tell_time'],'See you at three.');
  turn('sue','Can you swim with us on Sunday?',['invite'],'Yes! See you on Sunday.');
  turn('tim','Yes, she will join us.',['report'],'Sue is joining us at three.');
  assert.equal(m.state.complete,true);
 }
});

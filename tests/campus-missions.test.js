import test from 'node:test';
import assert from 'node:assert/strict';
import {createMission,missions} from '../dist/campus-missions.js';
import {environmentLayout as layout} from '../dist/campus-environment-layout.js';
import {findCampusPath} from '../dist/campus-navigation.js';
import {campusWorld,requireWorld} from '../dist/campus-world.js';
test('shared world cafe requires proximity, collection and explicit delivery',()=>{
 const m=createMission('picnic'),s=m.state;
 const act=(id,type,text='',pos=id==='device'?m.config.device:layout.people[id],sight=()=>true)=>m.act(id,type,text,pos,sight);
 act('lily','mission','',{x:0,z:20});assert.equal(s.stage,'brief');
 act('lily','mission','',layout.people.lily,()=>false);assert.equal(s.stage,'brief');
 act('nova','say','menu',layout.people.lily);assert.equal(s.stage,'brief');
 act('lily','mission');assert.equal(m.marker('waiter'),'ask');assert.equal(m.marker('mia'),'idle');
 act('waiter','say','Could I see the menu?');assert.equal(m.marker('waiter'),'ask');
 act('lily','say','The chicken is sold out.');assert.equal(m.marker('waiter'),'ask');
 act('waiter','say','What else do you have?');assert.equal(m.marker('lily'),'ask');
 act('lily','say','The chicken is sold out.');assert.equal(m.marker('lily'),'ask');
 act('lily','say','What would you like instead?');
 act('waiter','say','Water please');act('waiter','say','A cheese sandwich please');assert.notEqual(s.stage,'pickup');
 act('waiter','say','Without onions please');assert.equal(s.stage,'pickup');
 act('device','pickup');assert.notEqual(s.owner,'student');
 act('device','discover','',{x:0,z:20});assert.equal(s.discovered,false);
 act('device','discover');act('device','pickup');assert.equal(s.owner,'student');
 act('lily','say','Here is your lunch');assert.equal(s.stage,'handover');assert.equal(s.complete,false);
 act('lily','deliver');assert.equal(s.complete,true);assert.equal(s.owner,'display');
});
test('mission controllers keep separate state and reject unimplemented worlds',()=>{
 const first=createMission('science'),next=createMission('picnic');first.act('mia','mission','',layout.people.mia);
 assert.equal(first.state.stage,'service');assert.equal(next.state.stage,'brief');
 for(const m of missions){assert.equal(requireWorld(m.world),campusWorld);for(const id of m.people)assert.ok(layout.people[id]);}
 assert.throws(()=>requireWorld('forest'),/尚未实现/);
});
test('expanded southern campus routes beyond the old map boundary',()=>{
 const b=campusWorld.bounds,valid=(x,z)=>x>b.minX&&x<b.maxX&&z>b.minZ&&z<b.maxZ&&!(z>31.4&&z<32.6&&Math.abs(x)>3.7);
 const route=findCampusPath({x:0,z:20},{x:-6,z:41},valid,{bounds:b});assert.ok(route.length);assert.deepEqual(route.at(-1),{x:-6,z:41});
});

const samples={
 school:['Could I borrow your maths book, please?','Tom will give it back tomorrow.','Here is your book.'],
 restaurant:['Could I see the menu?','I would like a chicken sandwich with no onions and water please.','Here is your lunch.'],
 shopping:['How much is the blue cap?','I would like a blue cap in medium, please.','Here is your cap.'],
 directions:['Which bus goes to the museum?','Where is the museum?','Take bus five and get off at the library. The museum is next to the library.'],
 weather:['What will the weather be like on Saturday?','Would you like to come to the park on Saturday? Please bring a kite.','Mary can come.'],
 hobbies:['What is your favourite sport?','Would you like to go swimming with us this Sunday?','Sue would like to join us.']
};
for(const [id,lines] of Object.entries(samples))test(id+': world adapter preserves dialogue and requires physical finish',async()=>{
 const {dailyScenes}=await import('../dist/scene-engine.js');const m=createMission(id),s=m.state,w=dailyScenes[id];
 const at=n=>n==='device'?m.config.device:layout.people[n];
 const act=(n,type,text='',pos=at(n),sight=()=>true)=>m.act(n,type,text,pos,sight);
 act(m.config.giver,'mission','',{x:0,z:0});assert.equal(s.stage,'brief');
 act('nova','say',lines[0],at(m.config.giver));assert.equal(s.stage,'brief');
 act(m.config.giver,'mission');
 for(let i=0;i<2;i++){
  const n=w.actions[i].npc;const before=JSON.stringify(s);m.hint();assert.equal(JSON.stringify(s),before);
  act(n,'say',lines[i],at(n),()=>false);assert.equal(JSON.stringify(s),before);
  act(n,'say','hello');assert.equal(m.marker(n),'ask');act(n,'say',lines[i]);
 }
 if(m.config.kind!=='none'){
  assert.equal(s.stage,'pickup');act(m.config.giver,'say',lines[2]);assert.equal(s.stage,'pickup');
  act('device','pickup');assert.notEqual(s.owner,'student');act('device','discover');act('device','pickup');assert.equal(s.owner,'student');
 }
 act(m.config.giver,'say',lines[2]);
 if(id==='hobbies'){assert.equal(s.complete,true);assert.equal(m.marker('tim'),'done');return;}
 assert.equal(s.stage,'handover');assert.equal(s.complete,false);
 act(m.config.giver,'deliver','',{x:0,z:0});assert.equal(s.complete,false);
 act(m.config.giver,'deliver');assert.equal(s.complete,true);assert.equal(m.marker(m.config.giver),'done');
});
test('shopping adapter retains split fields and rejects a contradictory size',()=>{
 const m=createMission('shopping'),act=(n,text)=>m.act(n,'say',text,layout.people[n]);m.act('jack','mission','',layout.people.jack);
 act('seller','How much is the cap?');act('seller','A blue cap please');assert.equal(m.state.stage,'conversation');
 act('seller','Large please');assert.equal(m.state.stage,'conversation');act('seller','Medium please');assert.equal(m.state.stage,'pickup');
});


test('school explains physical collection and accepts contextual handover only after pickup',()=>{
 for(const phrase of ['Here you are.','Here you go!','Here it is.']){
  const m=createMission('school');
  const act=(id,type,text='',pos=id==='device'?m.config.device:layout.people[id])=>m.act(id,type,text,pos);
  act('tom','mission');act('lisa','say','Could I borrow your maths book, please?');
  const reply=act('lisa','say','Tomorrow');
  assert.match(reply.en,/collection stand/);assert.equal(m.state.stage,'pickup');
  assert.match(act('tom','say',phrase).en,/pick it up/);assert.equal(m.state.owner,null);
  act('tom','deliver');assert.equal(m.state.complete,false);
  act('device','discover');act('device','pickup');
  act('tom','say',"I do not have the book");assert.equal(m.state.stage,'return');
  act('tom','say',phrase);assert.equal(m.state.stage,'handover');
  act('tom','deliver');assert.equal(m.state.complete,true);
 }
});


test('task characters remain conversational without granting unearned progress',()=>{
 for(const config of missions){
  const m=createMission(config.id),pos=id=>(config.positions||layout.people)[id];
  const other=config.people.find(id=>id!==config.giver);
  const before=JSON.stringify(m.state);
  if(other){
   assert.match(m.act(other,'greet','',pos(other)).en,/Hello/);
  assert.ok(m.act(other,'say','What do you need?',pos(other)));
  assert.equal(JSON.stringify(m.state),before);
  assert.equal(m.act(other,'greet','',{x:1000,z:1000}),null);
  assert.equal(m.act(other,'greet','',pos(other),()=>false),null);
  }
  m.act(config.giver,'mission','',pos(config.giver));
  const started=JSON.stringify(m.state);
  assert.match(m.act(config.giver,'say','Hello',pos(config.giver)).en,/Hello/);
  assert.ok(m.act(config.giver,'say','Could you repeat that?',pos(config.giver)));
  assert.equal(JSON.stringify(m.state),started);
 }
});


test('restaurant accepts plural preference and asks only for missing drink',()=>{
 const m=createMission('restaurant');
 const act=(id,type,text='')=>m.act(id,type,text,id==='device'?m.config.device:layout.people[id]);
 act('lily','mission');act('waiter','say','Could I see the menu?');
 const reply=act('waiter','say','Hello, I prefer the chicken sandwiches without onions.');
 assert.match(reply.en,/drink/);assert.equal(m.state.stage,'conversation');
 act('waiter','say','A glass of water, please.');assert.equal(m.state.stage,'pickup');
 act('device','discover');act('device','pickup');
 act('lily','say','Here is your lunch');act('lily','deliver');assert.equal(m.state.complete,true);
});
test('plural wrong food and negation cannot satisfy chicken order',()=>{
 for(const text of ['I prefer cheese sandwiches without onions and water.','I do not want chicken sandwiches without onions and water.']){
  const m=createMission('restaurant');m.act('lily','mission','',layout.people.lily);
  m.act('waiter','say','Could I see the menu?',layout.people.waiter);
  m.act('waiter','say',text,layout.people.waiter);
  assert.equal(m.state.stage,'conversation');assert.equal(m.state.owner,null);
 }
});

test('picnic accepts reporting the change and asking a follow-up in one utterance',()=>{
 for(const report of ['The chicken is sold out. What would you like instead?','They have no chicken sandwiches. What else would you like?', 'The chicken is sold out what would you like instead', 'The chicken sandwich was sold out. Would you like to change others?']){
  const m=createMission('picnic');const say=(n,t)=>m.act(n,'say',t,layout.people[n]);
  m.act('lily','mission','',layout.people.lily);say('waiter','Could I see the menu?');say('waiter','What else do you have?');
  const reply=say('lily',report);assert.match(reply.en,/cheese sandwich is fine/);assert.equal(m.marker('waiter'),'ask');
 }
});
test('a question about a change is not a report that the change happened',()=>{
 const m=createMission('picnic');const say=(n,t)=>m.act(n,'say',t,layout.people[n]);
 m.act('lily','mission','',layout.people.lily);say('waiter','Could I see the menu?');say('waiter','What else do you have?');
 const reply=say('lily','Was the chicken sold out? What would you like instead?');assert.match(reply.en,/What happened/);assert.equal(m.marker('lily'),'ask');
});

test('student direct chicken order reveals sold-out change and can finish picnic',()=>{
 const m=createMission('picnic'),order="I like chicken sandwich without onions. Thank you.";
 const say=(n,t)=>m.act(n,'say',t,layout.people[n]);
 m.act('lily','mission','',layout.people.lily);
 assert.match(say('waiter',order).en,/sold out/);assert.equal(m.keyword,'alternatives');
 assert.match(say('waiter',order).en,/still sold out.*cheese sandwiches/);assert.equal(m.keyword,'ask');
 assert.match(say('lily',"I'd like a chicken sandwich without onions.").en,/Kai takes the orders/);assert.equal(m.keyword,'ask');
 assert.match(say('lily','The chicken sandwich was sold out. Would you like to change others?').en,/cheese sandwich is fine/);
 assert.match(say('waiter',order).en,/Lily chose cheese/);assert.equal(m.state.owner,null);
 assert.match(say('waiter','I would like a cheese sandwich without onions and water please.').en,/pick up the lunch at the pickup counter/);
 assert.equal(m.state.stage,'pickup');
 m.act('device','discover','',m.config.device);m.act('device','pickup','',m.config.device);
 say('lily','Here is your lunch');m.act('lily','deliver','',layout.people.lily);assert.equal(m.state.complete,true);
});
test('negated and hypothetical chicken orders do not reveal the change',()=>{
 for(const text of ["I don't want a chicken sandwich.","Maybe I would like a chicken sandwich.","I would not like a chicken sandwich."]){
 const m=createMission('picnic');m.act('lily','mission','',layout.people.lily);
 m.act('waiter','say',text,layout.people.waiter);assert.equal(m.keyword,'menu',text);
 }
});

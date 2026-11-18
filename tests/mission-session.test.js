import test from 'node:test';
import assert from 'node:assert/strict';
import {createMissionSession} from '../dist/mission-session.js';
import {environmentLayout as layout} from '../dist/campus-environment-layout.js';
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
const act=(m,n,t,text='')=>m.act(n,t,text,n==='device'?m.config.device:layout.people[n]);
test('welcome resumes introduction and visits, rejects contractions, then completes after reload',()=>{
 const db=storage();let m=createMissionSession('welcome',db);
 act(m,'mia','mission');act(m,'mia','say','My name is Sam');
 m=createMissionSession('welcome',db);assert.equal(m.restored,true);assert.equal(m.state.profile.name,'sam');
 act(m,'mia','say','I like reading');act(m,'lisa','say','Hello');act(m,'waiter','say','Hi');
 m=createMissionSession('welcome',db);
 for(const text of ["I didn't like the library","The cafe wasn't my favorite","I haven’t enjoyed the library"]){act(m,'mia','say',text);assert.equal(m.state.stage,'return');}
 act(m,'mia','say','I enjoyed the library');act(m,'mia','deliver');assert.equal(m.state.complete,true);
 assert.equal(createMissionSession('welcome',db).state.stage,'brief');
});
test('picnic restores hidden partial slots and physical possession',()=>{
 const db=storage();let m=createMissionSession('picnic',db);
 act(m,'lily','mission');
 assert.deepEqual(m.clues,[]);
 assert.equal(m.review('waiter'),null);
 act(m,'waiter','greet');
 act(m,'waiter','say','Could I see the menu?');
 act(m,'waiter','say','What else do you have?');
 act(m,'lily','say','The chicken is sold out');
 assert.equal(m.clues.length,2);
 assert.match(m.clues[0].en,/sold out/);
 assert.match(m.clues[1].en,/have cheese sandwiches/);
 const known=structuredClone(m.clues);
 m=createMissionSession('picnic',db);
 assert.deepEqual(m.clues,known);
 const beforeReview=structuredClone(m.state);
 assert.match(m.review('waiter').en,/have cheese sandwiches/);
 assert.deepEqual(m.state,beforeReview);
 act(m,'lily','say','What would you like instead?');
 assert.equal(m.clues.at(-1).npc,'lily');
 assert.match(m.clues.at(-1).en,/without onions/);
 act(m,'waiter','say','Water please');
 m=createMissionSession('picnic',db);act(m,'waiter','say','A cheese sandwich please');act(m,'waiter','say','Without onions please');assert.equal(m.state.stage,'pickup');
 act(m,'device','discover');act(m,'device','pickup');
 m=createMissionSession('picnic',db);assert.equal(m.state.owner,'student');
 act(m,'lily','say','Here is your lunch');act(m,'lily','deliver');assert.equal(m.state.complete,true);
 assert.deepEqual(m.review('lily'),m.config.thanks);
 assert.match(m.review('waiter').zh,/取餐台/);
 assert.deepEqual(createMissionSession('picnic',db).clues,[]);
});
test('corrupt saves are preserved and failures reported; explicit restart clears session',()=>{
 const db=storage();db.setItem('campus-session-v1-welcome','broken');const messages=[];
 const m=createMissionSession('welcome',db,x=>messages.push(x));act(m,'mia','mission');
 assert.equal(db.getItem('campus-session-v1-welcome'),'broken');assert.equal(messages.length,1);
 assert.equal(createMissionSession('welcome',db,()=>{},true).state.stage,'brief');
 const errors=[];const bad={getItem:()=>null,setItem:()=>{throw Error('quota');}};
 act(createMissionSession('welcome',bad,x=>errors.push(x)),'mia','mission');assert.equal(errors.length,1);
});

test('restoring a task preserves its original briefing without replaying the mission',()=>{
 const db=storage();let m=createMissionSession('picnic',db);
 const briefing=act(m,'lily','mission');
 act(m,'waiter','say','Could I see the menu?');
 act(m,'waiter','say','What else do you have?');
 assert.notDeepEqual(m.state.records.lily,undefined);
 m=createMissionSession('picnic',db);
 assert.deepEqual(m.briefing,briefing);
 assert.equal(m.keyword,'ask');
 const before=JSON.stringify(m.state);
 assert.match(m.briefing.en,/chicken sandwich/);
 assert.equal(JSON.stringify(m.state),before);
 const fresh=createMissionSession('picnic',db,()=>{},true);
 assert.equal(fresh.briefing,null);
});

test('restaurant original student utterance resumes and finishes without mandatory menu question',()=>{
 const db=storage();let m=createMissionSession('restaurant',db);
 act(m,'lily','mission');
 const reply=act(m,'waiter','say','I like chicken sandwich without onions. Thank you.');
 assert.match(reply.en,/drink/i);assert.doesNotMatch(reply.en,/menu|sold out/i);
 m=createMissionSession('restaurant',db);
 assert.match(m.briefing.en,/chicken sandwich/);
 act(m,'waiter','say','Water please');assert.equal(m.state.stage,'pickup');
 act(m,'device','discover');act(m,'device','pickup');
 m=createMissionSession('restaurant',db);assert.equal(m.state.owner,'student');
 act(m,'lily','say','Here is your lunch');assert.equal(m.state.stage,'handover');
 act(m,'lily','deliver');assert.equal(m.state.complete,true);
 assert.equal(createMissionSession('restaurant',db).state.stage,'brief');
});

test('a standalone sold-out report is acknowledged and remembered on either side of asking Kai',()=>{
 const phrase='The chicken sandwiches are sold out today.';
 for(const early of [true,false]){
  const db=storage();let m=createMissionSession('picnic',db);
  const say=(npc,text)=>act(m,npc,'say',text);
  act(m,'lily','mission');say('waiter','Could I see the menu?');
  if(!early)say('waiter','What else do you have?');
  assert.equal(m.marker('lily'),'ask');
  assert.match(say('lily',phrase).en,/sold out.*Thanks for telling me/);
  assert.equal(m.keyword,early?'alternatives':'ask');
  m=createMissionSession('picnic',db);
  if(early)say('waiter','What else do you have?');
  assert.match(say('lily','What would you like instead?').en,/cheese sandwich is fine/);
  say('waiter','I would like a cheese sandwich without onions and water please.');
  assert.equal(m.state.stage,'pickup');
  act(m,'device','discover');act(m,'device','pickup');
  say('lily','Here is your lunch');act(m,'lily','deliver');
  assert.equal(m.state.complete,true);
  assert.equal(createMissionSession('picnic',db).state.stage,'brief');
 }
});

test('workshop requires a briefing, local parts, ordered assembly and a tested lamp before delivery',async()=>{
 const {workshopBench,workshopParts}=await import('../dist/campus-workshop.js');
 const db=storage();let m=createMissionSession('workshop',db);
 const [base,battery,bulb]=workshopParts;
 const bench=(type,text='')=>m.act('bench',type,text,workshopBench);
 const take=part=>m.act(part.id,'take-part','',part);
 take(base);assert.deepEqual(m.state.collected,[]);
 act(m,'alex','mission');assert.match(m.briefing.en,/base first/);
 m.act(base.id,'take-part','',{x:0,z:0});assert.deepEqual(m.state.collected,[]);
 take(bulb);take(base);take(battery);take(base);assert.equal(m.state.collected.length,3);
 bench('install-part','bulb');assert.deepEqual(m.state.installed,[]);
 bench('install-part','base');bench('test-lamp');assert.equal(m.state.stage,'assembly');
 m=createMissionSession('workshop',db);
 assert.deepEqual(m.state.installed,['base']);
 assert.match(m.briefing.en,/base first/);
 bench('install-part','battery');bench('install-part','bulb');
 act(m,'alex','deliver');assert.equal(m.state.complete,false);
 bench('test-lamp');assert.equal(m.state.owner,'student');
 m=createMissionSession('workshop',db);assert.equal(m.state.stage,'handover');
 act(m,'alex','deliver');assert.equal(m.state.complete,true);
 assert.equal(createMissionSession('workshop',db).state.stage,'brief');
});

test('Lily understands the available replacement together or across a saved conversation',()=>{
 for(const turns of [
  ['Chicken… uh… sold out.', 'Cheese.'],
  ['Lily, the chicken sandwiches are completely sold out at the cafe today.', 'Lily, you could definitely try their cheese sandwiches for lunch.'],
  ['Chicken sandwiches are unfortunately unavailable.', 'The cheese sandwiches, I really recommend those.'],
  ['The chicken sandwiches are sold out today.', 'You can try the cheese sandwiches.'],
  ['Chicken sold out you could try a cheese sandwich instead.'],
  ["I tried to get you one, but they'd run out.", 'They still have cheese sandwiches.'],
  ['The chicken sandwiches are sold out today, and they have cheese sandwiches.']
 ]){
  const db=storage();let m=createMissionSession('picnic',db);
  const say=(who,text)=>act(m,who,'say',text);
  act(m,'lily','mission');say('waiter',"I'd like a chicken sandwich without onions.");
  say('waiter','What else do you have?');
  for(const text of ['The cheese sandwiches are sold out.','Are the chicken sandwiches sold out?','The chicken is not sold out.']){
   assert.match(say('lily',text).en,/What happened/);
  }
  for(const [i,text] of turns.entries()){
   const reply=say('lily',text);
   if(i===turns.length-1)assert.match(reply.en,/cheese sandwich is fine/);
   else {assert.match(reply.en,/What else do they have/);m=createMissionSession('picnic',db);}
  }
  say('waiter','A cheese sandwich without onions and water please.');
  act(m,'device','discover');act(m,'device','pickup');
  say('lily','Here is your lunch');act(m,'lily','deliver');assert.equal(m.state.complete,true);
 }
});

test('Lily keeps an early cheese suggestion and distinguishes a refusal',()=>{
 for(const [suggestion,accepted] of [['You can try the cheese sandwiches.',true],["You shouldn't try the cheese sandwiches.",false],["I would not recommend the cheese sandwiches.",false],['Their cheese sandwiches are sold out.',false]]){
  const m=createMissionSession('picnic',storage());
  act(m,'lily','mission');act(m,'waiter','say','Could I see the menu?');
  act(m,'waiter','say','What else do you have?');
  assert.match(act(m,'lily','say',suggestion).en,/What happened/);
  const reply=act(m,'lily','say','The chicken sandwiches are sold out today.');
  assert.match(reply.en,accepted?/cheese sandwich is fine/:/What else do they have/);
 }
});

test('counter recognizes food and topping keywords without a sentence frame',()=>{
 for(const phrase of ['Chicken sandwich, without onions.', 'Without onions. Chicken sandwich. Thank you.', 'Chicken sandwich for Lily at the picnic, without onions.']){
  for(const level of ['restaurant','picnic']){
   const m=createMissionSession(level,storage());
   act(m,'lily','mission');
   const reply=act(m,'waiter','say',phrase);
   assert.match(reply.en,level==='restaurant'?/drink/i:/sold out/i);
  }
 }
});

test('replacement order keeps the cheese and water and asks only about onions',()=>{
 const db=storage();let m=createMissionSession('picnic',db);
 const say=(npc,text)=>act(m,npc,'say',text);
 act(m,'lily','mission');say('waiter','Chicken sandwich without onions.');
 say('waiter','What else do you have?');say('lily','Chicken sold out. You can try the cheese sandwiches.');
 assert.match(say('waiter',"I don't want a cheese sandwich and a glass of water.").en,/eat/);
 assert.match(say('waiter','Okay, give me a cheese sandwich and a glass of water.').en,/^Would you like onions\?$/);
 m=createMissionSession('picnic',db);
 assert.match(say('waiter','No, thank you.').en,/pickup counter/);
 act(m,'device','discover');act(m,'device','pickup');say('lily','Here is your lunch.');
 act(m,'lily','deliver');assert.equal(m.state.complete,true);
 assert.equal(createMissionSession('picnic',db).state.stage,'brief');
});

test('Tim understands a contextual invitation report after Sue accepts and the session resumes',()=>{
 const db=storage();let m=createMissionSession('hobbies',db);
 const report='Yes, he will join us. He said he likes to join us.';
 act(m,'tim','mission');act(m,'tim','say',report);assert.equal(m.marker('sue'),'ask');
 act(m,'sue','say','What is your favorite sport?');
 act(m,'sue','say','Would you like to swim with us this Sunday?');
 m=createMissionSession('hobbies',db);assert.match(m.briefing.en,/Sue/);
 for(const text of ["She won't join us.",'Will Sue join us?','Maybe she will join us.','Jack will join us.','Sue likes basketball.']){
  act(m,'tim','say',text);assert.equal(m.marker('tim'),'ask',text);
 }
 assert.match(act(m,'tim','say',report).en,/Sue is joining us/);
 assert.equal(m.state.stage,'complete');
 assert.ok(JSON.parse(db.getItem('campus-quest-levels-v1')).completed.includes('hobbies'));
 assert.equal(m.state.complete,true);assert.equal(createMissionSession('hobbies',db).state.stage,'brief');
});

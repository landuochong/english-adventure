import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyScenes,newSceneState,restoreSceneState,sceneInteract,sceneCoach,sceneContactMode} from '../dist/scene-engine.js';
const sceneSamples={
 school:['Could I borrow your maths book, please?','Tom will give it back tomorrow.','Here is your book.'],
 restaurant:['Could I see the menu?','I would like a chicken sandwich with no onions and a glass of water, please.','I ordered your lunch.'],
 shopping:['How much is the blue cap?','I would like a blue cap in medium, please.','Here is your cap.'],
 directions:['Which bus goes to the museum?','Where is the museum?','Take bus five and get off at the library. The museum is next to the library.'],
 weather:['What will the weather be like on Saturday?','Would you like to come to the park on Saturday? Please bring a kite.','Mary can come.'],
 hobbies:['What is your favourite sport?','Would you like to go swimming with us this Sunday?','Sue would like to join us.']
};
function moveTo(st,w,id){const n=w.npcs.find(n=>n.id===id);st.player={x:n.x-35,y:n.y+30};}
for(const [id,w] of Object.entries(dailyScenes)){
 test(id+': complete student-led quest, no shortcuts, replay and coach do not advance',()=>{
  const st=newSceneState();moveTo(st,w,w.giver);
  assert.equal(sceneInteract(id,st,w.giver),null);
  st.prepared=true;
  const other=w.npcs.find(n=>n.id!==w.giver);moveTo(st,w,other.id);
  sceneInteract(id,st,other.id,sceneSamples[id][0]);assert.equal(st.started,false);
  moveTo(st,w,w.giver);sceneInteract(id,st,w.giver);assert.equal(st.started,true);
  assert.equal(st.journal.length,1);
  for(let i=0;i<w.actions.length;i++){
   const a=w.actions[i];moveTo(st,w,a.npc);
   const before=JSON.stringify(st);sceneCoach(id,st,'解释细节');sceneCoach(id,st,'next');assert.equal(JSON.stringify(st),before);
   for(const bad of ['hello','Do you see a boy?','robot blue maths bus cap park book','我想完成任务','I do not want to '+sceneSamples[id][i]]){
    sceneInteract(id,st,a.npc,bad);assert.equal(st.done.length,i,bad);
   }
   assert.equal(sceneInteract(id,st,a.npc,sceneSamples[id][i]).en,a.reply.en);
   assert.equal(st.done.length,i+1);assert.equal(st.complete,i===w.actions.length-1);
   const earned=st.journal.length;sceneInteract(id,st,a.npc);sceneInteract(id,st,a.npc);assert.equal(st.journal.length,earned);
  }
  const restored=restoreSceneState(id,JSON.parse(JSON.stringify(st)));assert.equal(restored.complete,true);assert.deepEqual(restored.done,st.done);assert.equal(restored.journal.length,4);
 });
 test(id+': proximity, ordered actions and forged saves',()=>{
  const st=newSceneState();st.prepared=true;assert.equal(sceneInteract(id,st,w.giver),null);
  moveTo(st,w,w.giver);sceneInteract(id,st,w.giver);
  const last=w.actions.at(-1);moveTo(st,w,last.npc);sceneInteract(id,st,last.npc,sceneSamples[id].at(-1));assert.equal(st.complete,false);assert.deepEqual(st.done,[]);
  assert.equal(restoreSceneState(id,{complete:true,done:[last.id]}).complete,false);
  const restored=restoreSceneState(id,{prepared:true,started:true,done:[last.id],replies:{[last.npc]:last.reply}});assert.deepEqual(restored.done,[]);assert.equal(restored.journal.length,1);
 });
}
test('restaurant incomplete and contradictory utterances never complete a fresh order',()=>{
 for(const bad of ['A sandwich','I would like a chicken sandwich and water','I would like a chicken sandwich with no onions','I would like a chicken sandwich with onions and water','I would like a chicken sandwich with no onions and juice','I would like a chicken sandwich with no onions and water with onions']){
  const st=atAction('restaurant',1);sceneInteract('restaurant',st,'waiter',bad);assert.equal(st.done.length,1,bad);
 }
});
test('scene saves remain independent',()=>{const a=newSceneState(),b=newSceneState();a.done.push('borrow');assert.deepEqual(b.done,[]);});
test('natural paraphrases and repeats preserve context without bypassing actions',()=>{
 const w=dailyScenes.school,st=newSceneState();st.prepared=true;moveTo(st,w,w.giver);sceneInteract('school',st,w.giver);moveTo(st,w,'lisa');sceneInteract('school',st,'lisa','May I have your maths book please?');assert.equal(st.done.length,1);
 const earned=st.journal.length;assert.match(sceneInteract('school',st,'lisa','Could you say that again?').en,/When will Tom/);assert.equal(st.journal.length,earned);assert.equal(st.done.length,1);
 assert.match(sceneCoach('school',st,'What does borrow mean?').en,/give it back/);
 assert.match(sceneCoach('school',st,'next').en,/when/);
});

test('multi-turn characters retain question until finished and the giver reopens on return',()=>{
 const st=newSceneState(),w=dailyScenes.school;st.prepared=true;moveTo(st,w,'tom');
 assert.equal(sceneContactMode('school',st,'tom'),'mission');sceneInteract('school',st,'tom');
 assert.equal(sceneContactMode('school',st,'tom'),'replay');moveTo(st,w,'lisa');
 sceneInteract('school',st,'lisa','May I borrow your maths book?');
 assert.equal(sceneContactMode('school',st,'lisa'),'ask');
 sceneInteract('school',st,'lisa','Yesterday');assert.equal(sceneContactMode('school',st,'lisa'),'ask');
 sceneInteract('school',st,'lisa');assert.equal(sceneContactMode('school',st,'lisa'),'ask');
 sceneInteract('school',st,'lisa','Tomorrow.');assert.equal(st.done.length,2);
 assert.equal(sceneContactMode('school',st,'lisa'),'replay');assert.equal(sceneContactMode('school',st,'tom'),'ask');
 assert.equal(sceneContactMode('school',restoreSceneState('school',st),'tom'),'ask');
 moveTo(st,w,'tom');sceneInteract('school',st,'tom','Here is your book.');
 assert.equal(sceneContactMode('school',st,'tom'),'replay');assert.equal(st.complete,true);
});

function atAction(id,index){const w=dailyScenes[id],st=newSceneState();st.prepared=true;moveTo(st,w,w.giver);sceneInteract(id,st,w.giver);for(let i=0;i<index;i++){moveTo(st,w,w.actions[i].npc);sceneInteract(id,st,w.actions[i].npc,sceneSamples[id][i]);}moveTo(st,w,w.actions[index].npc);return st;}
test('restaurant collects short answers and no only answers the onions question',()=>{
 const st=atAction('restaurant',1);
 sceneInteract('restaurant',st,'waiter','Yes');assert.equal(st.done.length,1);
 assert.match(sceneInteract('restaurant',st,'waiter','A chicken sandwich please').en,/onions/);
 assert.match(sceneInteract('restaurant',st,'waiter','No thanks').en,/drink/);
 sceneInteract('restaurant',st,'waiter','Water please');assert.equal(st.done.length,2);
});
test('audience ambiguity requires confirmation and preserves food and drink',()=>{
 const st=atAction('restaurant',1);
 assert.match(sceneInteract('restaurant',st,'waiter','A chicken sandwich without the audience and water please').en,/Did you say no onions/);
 assert.equal(st.done.length,1);assert.equal(sceneContactMode('restaurant',st,'waiter'),'ask');
 const before=JSON.stringify(st);sceneCoach('restaurant',st,'next');assert.equal(JSON.stringify(st),before);
 sceneInteract('restaurant',st,'waiter','Do you see a boy?');assert.equal(st.done.length,1);
 const restored=restoreSceneState('restaurant',JSON.parse(JSON.stringify(st)));
 assert.match(sceneInteract('restaurant',restored,'waiter').en,/Did you say/);
 sceneInteract('restaurant',restored,'waiter','Yes');assert.equal(restored.done.length,2);
});
test('rejecting an ambiguity never applies the suggested answer',()=>{
 const st=atAction('restaurant',1);sceneInteract('restaurant',st,'waiter','A chicken sandwich without the audience and water please');
 sceneInteract('restaurant',st,'waiter','No');assert.equal(st.done.length,1);assert.equal(st.conversation.draft.values.onions,undefined);
 sceneInteract('restaurant',st,'waiter','With onions');assert.equal(st.done.length,1);
 sceneInteract('restaurant',st,'waiter','No, I meant without onions');assert.equal(st.done.length,2);
});
test('correcting one field keeps other details and raw caller text unchanged',()=>{
 const st=atAction('restaurant',1);const text='A chicken sandwich without onions and juice please';sceneInteract('restaurant',st,'waiter',text);
 assert.equal(st.done.length,1);assert.equal(st.conversation.draft.values.food,'chicken');
 sceneInteract('restaurant',st,'waiter','No, I meant water');assert.equal(st.done.length,2);assert.match(text,/juice/);
});
test('MacBook is confirmed only while borrowing the maths book',()=>{
 const st=atAction('school',0);assert.match(sceneInteract('school',st,'lisa','Could I borrow your MacBook?').en,/Do you mean my maths book/);
 assert.equal(st.done.length,0);sceneInteract('school',st,'lisa','No');assert.equal(st.done.length,0);
 sceneInteract('school',st,'lisa','Could I borrow your mac book?');sceneInteract('school',st,'lisa','Yes');assert.equal(st.done.length,1);
 const cafe=atAction('restaurant',1);sceneInteract('restaurant',cafe,'waiter','MacBook');sceneInteract('restaurant',cafe,'waiter','Yes');assert.equal(cafe.done.length,1);
});
test('all longer scene actions accept contextual short turns',()=>{
 const paths={shopping:['Medium please'],directions:['Bus five','The library','Next to the library'],weather:['Would you like to come to the park?','Saturday','Bring a kite'],hobbies:['Would you like to go swimming?','Sunday']};
 for(const [id,answers] of Object.entries(paths)){const index=id==='directions'?2:1,st=atAction(id,index),npc=dailyScenes[id].actions[index].npc;
  for(let i=0;i<answers.length;i++){sceneInteract(id,st,npc,answers[i]);assert.equal(st.done.length,index+(i===answers.length-1?1:0),id+': '+answers[i]);}
 }
});
test('partial answers survive internal navigation/restore and cannot be confirmed at another person',()=>{
 const st=atAction('restaurant',1);sceneInteract('restaurant',st,'waiter','A chicken sandwich without the audience');
 moveTo(st,dailyScenes.restaurant,'lily');sceneInteract('restaurant',st,'lily','Yes');assert.equal(st.done.length,1);
 const restored=restoreSceneState('restaurant',st);moveTo(restored,dailyScenes.restaurant,'waiter');sceneInteract('restaurant',restored,'waiter','Yes');assert.equal(restored.done.length,1);
 sceneInteract('restaurant',restored,'waiter','Water');assert.equal(restored.done.length,2);
});

test('boss at the museum bus step asks for confirmation before earning a clue',()=>{
 const st=atAction('directions',0),raw='Which boss goes to Museum?';
 assert.match(sceneInteract('directions',st,'driver',raw).en,/Do you mean which bus/);
 assert.equal(st.done.length,0);assert.equal(st.journal.length,1);assert.equal(sceneContactMode('directions',st,'driver'),'ask');
 sceneInteract('directions',st,'driver','Do you see a boy?');assert.equal(st.done.length,0);
 const restored=restoreSceneState('directions',JSON.parse(JSON.stringify(st)));
 assert.match(sceneInteract('directions',restored,'driver').en,/Do you mean which bus/);
 moveTo(restored,dailyScenes.directions,'librarian');sceneInteract('directions',restored,'librarian','Yes');assert.equal(restored.done.length,0);
 moveTo(restored,dailyScenes.directions,'driver');assert.match(sceneInteract('directions',restored,'driver','Yes').en,/Take bus five/);
 assert.deepEqual(restored.done,['bus']);assert.equal(restored.complete,false);assert.equal(raw,'Which boss goes to Museum?');
});
test('bus clarification can be rejected or corrected without a blanket boss replacement',()=>{
 const st=atAction('directions',0);
 sceneInteract('directions',st,'driver','Yes');assert.equal(st.done.length,0);
 sceneInteract('directions',st,'driver','Which boss goes to Museum?');sceneInteract('directions',st,'driver','No');
 sceneInteract('directions',st,'driver','Yes');assert.equal(st.done.length,0);
 sceneInteract('directions',st,'driver','Which boss goes to Museum?');
 sceneInteract('directions',st,'driver','No, I meant which bus goes to the museum?');assert.deepEqual(st.done,['bus']);
 for(const utterance of ['Where is the boss?','Which boss goes to the park?','Which boss does not go to the museum?']){
  const fresh=atAction('directions',0);sceneInteract('directions',fresh,'driver',utterance);sceneInteract('directions',fresh,'driver','Yes');assert.equal(fresh.done.length,0,utterance);
 }
 const other=atAction('restaurant',0);sceneInteract('restaurant',other,'waiter','Which boss goes to Museum?');sceneInteract('restaurant',other,'waiter','Yes');assert.equal(other.done.length,0);
});

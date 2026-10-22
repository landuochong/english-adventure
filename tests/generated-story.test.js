import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateStory,compileStory,generatedTurn,generateCheckedStory} from '../dist/generated-story.js';
import {dailyScenes,sceneVocabulary,newSceneState,sceneInteract,sceneCoach,restoreSceneState} from '../dist/scene-engine.js';
const config=JSON.parse(fs.readFileSync(new URL('../scripts/story-example.json',import.meta.url)));
const copy=()=>structuredClone(config);
function game(){const id='generated-test',w=compileStory(copy(),[]);dailyScenes[id]=w;sceneVocabulary[id]=[['menu','菜单','Listen to menu.']];const st=newSceneState();st.prepared=true;const move=n=>{st.player={...w.npcs.find(x=>x.id===n)};};const say=(n,t=null)=>{move(n);return sceneInteract(id,st,n,t);};return {id,w,st,move,say};}
test('configuration rejects future/missing sources, unknown map, duplicate IDs, incomplete coverage and malformed rows',()=>{
 assert.deepEqual(validateStory(config),[]);
 for(const mutate of [c=>c.theme='new-map',c=>c.actions[0].slots[0].source='step4',c=>c.actions[0].slots[0].expected='missing',c=>c.actions[1].id='step1',c=>c.actions[2].slots=null,c=>c.actions[1].slots[0].options=[null],c=>c.actions.at(-1).slots=[]]){const c=copy();mutate(c);assert.ok(validateStory(c).length);}
 assert.ok(validateStory(config,[{id:'missing',term:'new word'}]).length);
});
test('generated story runs in existing map engine, accepts split/reordered info and corrections, final return required',()=>{
 const {st,say}=game();say('npc2','Could I see the menu?');assert.equal(st.started,false);
 say('npc1');say('npc2','hello');assert.equal(st.done.length,0);
 say('npc2','Could I see the menu?');assert.equal(st.done.length,1);
 say('npc1','The chicken is sold out.');assert.equal(st.done.length,1);
 say('npc1','What would you like instead?');assert.equal(st.done.length,2);
 say('npc2','Juice please');assert.equal(st.conversation.draft.values.slot3,'juice');say('npc2','A cheese sandwich please');assert.equal(st.done.length,2);
 say('npc2','No, I meant water');assert.equal(st.conversation.draft.values.slot1,'cheese');
 say('npc2','Without onions please');assert.equal(st.done.length,3);assert.equal(st.complete,false);
 say('npc2','Here is your lunch');assert.equal(st.complete,false);
 say('npc1','Here is your lunch');assert.equal(st.complete,true);assert.match(st.journal.at(-1).en,/Thank you/);
 const count=st.journal.length;say('npc1','menu');assert.equal(st.journal.length,count);
});
test('coach, replay, remote interactions and irrelevant/negated sentences cannot earn progress',()=>{
 const {id,st,w,say,move}=game();say('npc1');move('npc2');
 const before=st.done.length;sceneCoach(id,st,'next');say('npc2');assert.equal(st.done.length,before);
 for(const t of ['hello','yes','I do not want a menu','If I wanted the menu','The dog is reading a long book about sandwiches'])say('npc2',t);
 assert.equal(st.done.length,0);st.player={x:70,y:520};assert.equal(sceneInteract(id,st,'npc2','Could I see the menu?'),null);
});
test('slot contradiction requires clarification and yes cannot answer an entire task',()=>{
 const slots=config.actions[2].slots;
 let r=generatedTurn(slots,null,'yes');assert.equal(r.complete,false);
 r=generatedTurn(slots,r.draft,'a cheese sandwich please');
 r=generatedTurn(slots,r.draft,'chicken please');assert.equal(r.draft.pending,'slot1');assert.equal(r.complete,false);
 r=generatedTurn(slots,r.draft,'No I meant cheese');assert.equal(r.draft.values.slot1,'cheese');assert.equal(r.draft.pending,null);
 r=generatedTurn(slots,r.draft,'without onions please');r=generatedTurn(slots,r.draft,'water please');assert.equal(r.complete,true);
});
test('partial generated conversations restore only on their current step; new state is empty',()=>{
 const {id,st,say}=game();say('npc1');say('npc2','Could I see the menu?');say('npc1','The chicken is sold out.');
 const restored=restoreSceneState(id,JSON.parse(JSON.stringify(st)));assert.equal(restored.conversation.draft.values.slot1,'unavailable');assert.equal(restored.complete,false);
 assert.deepEqual(newSceneState().done,[]);
});

test('short yes/no answers only the current explicit with/without question',()=>{
 const slots=config.actions[2].slots;
 let r=generatedTurn(slots,null,'I would like a cheese sandwich and water');assert.equal(r.draft.asked,'slot2');
 r=generatedTurn(slots,r.draft,'no thanks');assert.equal(r.complete,true);
 assert.equal(generatedTurn(slots,null,'no thanks').complete,false);
});

test('intro is a valid listening coverage location',()=>{
 const c=copy();c.coverage=[{learning_id:'location',step:'intro',practice:'听懂开场的场景地点'}];
 assert.deepEqual(validateStory(c,[{id:'location',term:'cafe'}]),[]);
});
test('negative facts can be reported without rewarding negated positive answers',()=>{
 const slots=[{key:'slot1',intent:'report',expected:'confucius',question:{en:'Whose sentence is it?',zh:'这是谁的句子？'},options:[{value:'confucius',aliases:['from Confucius']},{value:'mencius',aliases:['from Mencius']}]},{key:'slot2',intent:'report',expected:'notMencius',question:{en:'Whose sentence is it not?',zh:'不是谁的句子？'},options:[{value:'notMencius',aliases:['not from Mencius']}]}];
 const good=generatedTurn(slots,null,'The sentence is not from Mencius but from Confucius');assert.equal(good.complete,true);
 const bad=generatedTurn(slots,null,'The sentence is not from Confucius but from Mencius');assert.equal(bad.complete,false);assert.notEqual(bad.draft.values.slot1,'confucius');
 assert.equal(generatedTurn(slots,null,'I do not think this sentence could possibly be from Confucius').complete,false);
});
test('whole order can provide a negative ingredient and positive drink together',()=>{
 assert.equal(generatedTurn(config.actions[2].slots,null,'I would like a cheese sandwich without onions and water please').complete,true);
});
test('bare negation words cannot create an impossible task that passes validation',()=>{
 const c=copy();c.actions[0].slots[0].options=[{value:'menu',aliases:['not']}];c.mission.en+=' not';
 assert.ok(validateStory(c).length);
});

test('generation checks output and repairs once, never loops on unresolved drafts',async()=>{
 const invalid=copy();invalid.actions[1].slots[0].source='step4';const calls=[];
 const r=await generateCheckedStory(async p=>{calls.push(p);return {story:calls.length===1?invalid:copy()};},{learning:[]});
 assert.equal(calls.length,2);assert.equal(calls[1].story,invalid);assert.deepEqual(r.errors,[]);
 let count=0;const failed=await generateCheckedStory(async()=>{count++;return {story:invalid};},{learning:[]});assert.equal(count,2);assert.ok(failed.errors.length);
 count=0;await generateCheckedStory(async()=>{count++;return {story:copy()};},{learning:[]});assert.equal(count,1);
 count=0;await generateCheckedStory(async()=>{count++;return {story:invalid};},{learning:[],story:invalid});assert.equal(count,1);
});

test('repair failure preserves the generated draft for the author',async()=>{
 const draft=copy();draft.actions[0].slots[0].source='step4';let count=0;
 const r=await generateCheckedStory(async()=>{if(++count===2)throw Error('model timeout');return {story:draft};},{learning:[]});
 assert.equal(r.story,draft);assert.ok(r.errors.length);assert.equal(r.repairError,'model timeout');
});

test('a negated source fact cannot justify a positive answer',()=>{
 const c=copy();c.mission.en='There is not a menu.';c.actions[0].slots[0].options=[{value:'menu',aliases:['menu']}];
 assert.ok(validateStory(c).some(e=>e.includes('来源')));
});

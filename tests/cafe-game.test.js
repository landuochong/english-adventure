import test from 'node:test';
import assert from 'node:assert/strict';
import {cafeState,cafeAct} from '../dist/cafe-game.js';
test('cafe needs student dialogue, real collection and explicit delivery',()=>{
 const s=cafeState();
 cafeAct(s,'bag','pickup');cafeAct(s,'lily','deliver');assert.equal(s.complete,false);
 cafeAct(s,'lily','mission');cafeAct(s,'waiter','say','Could I see the menu?');
 cafeAct(s,'lily','say','The chicken is sold out.');cafeAct(s,'lily','say','What would you like instead?');
 cafeAct(s,'waiter','say','Water please');assert.equal(s.owner,null);
 cafeAct(s,'waiter','say','A cheese sandwich please');
 cafeAct(s,'waiter','say','Without onions please');assert.equal(s.owner,'counter');
 cafeAct(s,'lily','say','Here is your lunch');assert.equal(s.reported,false);
 cafeAct(s,'bag','pickup');assert.equal(s.owner,'student');
 cafeAct(s,'lily','say','I will bring lunch');assert.equal(s.reported,false);
 cafeAct(s,'lily','say','Here is your lunch');assert.equal(s.reported,true);assert.equal(s.complete,false);
 cafeAct(s,'lily','deliver');assert.equal(s.complete,true);assert.equal(s.owner,'lily');
 cafeAct(s,'bag','pickup');assert.equal(s.owner,'lily');
});
test('wrong character and coach guidance do not advance cafe',()=>{
 const s=cafeState();cafeAct(s,'lily','mission');
 cafeAct(s,'nova','say','Could I see the menu?');assert.equal(s.step,0);
 cafeAct(s,'waiter','say','hello');assert.equal(s.step,0);
});

test('one current task per character: question becomes text until its prerequisite is complete',async()=>{
 const {cafeMarker}=await import('../dist/cafe-game.js');
 const s=cafeState();
 assert.equal(cafeMarker(s,'lily'),'ask');assert.equal(cafeMarker(s,'waiter'),'idle');
 cafeAct(s,'lily','mission');assert.equal(cafeMarker(s,'lily'),'text');assert.equal(cafeMarker(s,'waiter'),'ask');
 cafeAct(s,'waiter','say','hello');assert.equal(cafeMarker(s,'lily'),'text');
 cafeAct(s,'waiter','say','Could I see the menu?');
 assert.equal(cafeMarker(s,'waiter'),'text');assert.equal(cafeMarker(s,'lily'),'ask');
 cafeAct(s,'lily','say','The chicken is sold out.');assert.equal(cafeMarker(s,'lily'),'ask');
 cafeAct(s,'lily','say','What would you like instead?');
 assert.equal(cafeMarker(s,'lily'),'text');assert.equal(cafeMarker(s,'waiter'),'ask');
 cafeAct(s,'waiter','say','A cheese sandwich without onions and water please');
 assert.equal(cafeMarker(s,'waiter'),'text');assert.equal(cafeMarker(s,'lily'),'text');
 cafeAct(s,'bag','pickup');assert.equal(cafeMarker(s,'lily'),'ask');assert.equal(cafeMarker(s,'waiter'),'done');
 cafeAct(s,'lily','say','Here is your lunch');assert.equal(cafeMarker(s,'lily'),'text');
 cafeAct(s,'lily','deliver');assert.equal(cafeMarker(s,'lily'),'done');
});

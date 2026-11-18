import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,readProgress,finishLevel,nextLevel,progressKey,levelStarts} from '../dist/campus-level-catalog.js';
import {missions} from '../dist/campus-missions.js';
const storage=()=>{let value=null;return {getItem:()=>value,setItem:(k,v)=>{assert.equal(k,progressKey);value=v;}};};
test('level completion is deduplicated and unknown or malformed records cannot invent levels',()=>{
 const db=storage();assert.equal(finishLevel(db,'science'),true);finishLevel(db,'science');assert.deepEqual(readProgress(db).completed,['science']);assert.equal(finishLevel(db,'fake'),false);
 db.setItem(progressKey,'broken');assert.deepEqual(readProgress(db).completed,[]);
 db.setItem(progressKey,JSON.stringify({completed:['science','science','fake']}));assert.deepEqual(readProgress(db).completed,['science']);
});
test('unavailable storage does not pretend to persist a reward',()=>{
 const db={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};assert.deepEqual(readProgress(db),{completed:[]});assert.equal(finishLevel(db,'science'),false);
});
test('map ordering, next challenge and starts match real missions',()=>{
 assert.equal(levels.length,missions.length);for(const l of levels){assert.ok(missions.some(m=>m.id===l.id));assert.ok(levelStarts[l.id]);}
 assert.equal(nextLevel('science',{completed:['science']}).id,'school');assert.equal(nextLevel('picnic',{completed:levels.map(l=>l.id)}),null);
});

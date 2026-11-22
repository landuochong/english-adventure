import test from 'node:test';
import assert from 'node:assert/strict';
import {createMissionSession} from '../dist/mission-session.js';
import {wishPeople} from '../dist/campus-wish.js';
import {readProgress} from '../dist/campus-level-catalog.js';

for (const difficulty of [1,2]) test('wish tree keeps the leaf, invitation and report through reload at level '+difficulty,()=>{
  const data=new Map();
  const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
  const load=()=>createMissionSession('wish',storage,assert.fail,false,difficulty);
  let m=load();
  const act=(id,type,text='',pos=wishPeople[id])=>m.act(id,type,text,pos);
  assert.equal(act('mia','mission','',wishPeople.ben),null);
  const brief=act('mia','mission');
  if(difficulty===2){act('mia','say','Which colour?');act('mia','say','Green.');}
  assert.equal(m.state.owner,'student');
  act('mia','say','Are you new here?');assert.equal(m.state.stage,'find');
  act('ben','say','Are you new here?');act('ben','say',"Do not come with me.");
  assert.equal(m.state.stage,'invite');
  act('ben','say','Come with me.');m=load();
  assert.deepEqual(m.briefing,brief);assert.deepEqual(m.resumePosition,{x:wishPeople.ben.x,z:wishPeople.ben.z});
  assert.equal(m.state.stage,'report');assert.equal(m.state.owner,'student');
  act('mia','say','This is Tom. He wants to draw.');assert.equal(m.state.introduced,false);
  assert.match(act('mia','say','This is Ben.').en,/want to learn/);
  m=load();act('mia','say','He does not want to draw.');
  assert.equal(m.state.stage,'report');
  act('mia','say','He wants to learn to draw.');
  assert.equal(act('mia','deliver','',wishPeople.ben),null);
  assert.equal(act('mia','deliver').en,m.config.thanks.en);
  assert.equal(m.state.owner,'display');assert.deepEqual(readProgress(storage,difficulty).completed,['wish']);
  assert.equal(load().state.stage,'brief');
});

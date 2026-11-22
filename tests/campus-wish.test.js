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
  assert.match(act('ben','say','Come with me.').en,/don't know/);
  act('ben','say','Would you like to learn to draw birds?');assert.equal(m.state.stage,'interests');
  assert.match(act('ben','say','What do you like doing?').en,/potato/);
  m=load();assert.equal(m.state.stage,'suggest');
  for(const answer of ['Would you like to draw rabbits?', 'You do not want to draw birds.', 'I like to draw birds.']){
    act('ben','say',answer);assert.equal(m.state.stage,'suggest');
  }
  act('ben','say','Would you like to learn to draw birds?');m=load();
  assert.deepEqual(m.briefing,brief);assert.deepEqual(m.resumePosition,{x:wishPeople.ben.x,z:wishPeople.ben.z});
  assert.equal(m.state.stage,'report');assert.equal(m.state.owner,'student');
  act('mia','say','This is Tom. He wants to draw.');assert.equal(m.state.introduced,false);
  assert.match(act('mia','say','This is Ben.').en,/want to learn/);
  m=load();act('mia','say','He does not want to draw.');
  assert.equal(m.state.stage,'report');
  assert.match(act('mia','say','He wants to learn to draw.').en,/want to draw/);
  act('mia','say','Birds.');
  assert.equal(act('mia','deliver','',wishPeople.ben),null);
  assert.equal(act('mia','deliver').en,m.config.thanks.en);
  assert.equal(m.state.owner,'display');assert.deepEqual(readProgress(storage,difficulty).completed,['wish']);
  assert.equal(load().state.stage,'brief');
});

test('an ongoing original wish can still be delivered after updating',()=>{
  const key='campus-session-v1-wish';
  const events=[['mia','mission',''],['ben','say','Are you new here?'],['ben','say','Come with me.']]
    .map(([npc,type,text])=>({npc,type,text,pos:wishPeople[npc]}));
  const data=new Map([[key,JSON.stringify({version:1,id:'wish',events})]]);
  const storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
  const load=()=>createMissionSession('wish',storage,assert.fail);
  const old=load();assert.equal(old.state.stage,'report');
  old.act('mia','say','This is Ben. He wants to learn to draw.',wishPeople.mia);
  assert.equal(load().state.stage,'handover');
  load().act('mia','deliver','',wishPeople.mia);
  assert.equal(load().state.originalWish,false);
});

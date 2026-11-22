import test from 'node:test';
import assert from 'node:assert/strict';
import {createMissionSession} from '../dist/mission-session.js';
import {readProgress} from '../dist/campus-level-catalog.js';

const routes=[
 {id:'u1',extra:['Which day?','Thursday.'],ask:['What do you plan to do?','Here in the library?'],wrong:'Read with Mei on Tuesday.',partial:'Read with Mei.',prompt:/Which day/,last:'Friday.'},
 {id:'u2',extra:['Which part?','Melody.'],ask:['What do you play?','Why do you like it?','Would you like to join us?'],wrong:'Mei plays the violin.',partial:'Mei plays the erhu.',prompt:/Can she join/,last:'She agreed to join.'},
 {id:'u3',extra:['Who took it?','Your aunt.'],ask:['Whose coat is this?','Why did you keep it?'],wrong:'It is your coat.',partial:"It is your grandpa's coat.",prompt:/How did it help/,last:'It kept you warm.'}
];
for(const route of routes)for(const difficulty of [1,2]){
 test(route.id+' Level '+difficulty+' preserves evidence and requires a correct report',()=>{
  const saved=new Map(),storage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)};
  const load=()=>createMissionSession(route.id,storage,assert.fail,false,difficulty);
  let m=load();const giver=m.config.giver,witness=m.config.steps[0].npc;
  const act=(npc,type,text='',pos=m.config.positions[npc])=>m.act(npc,type,text,pos);
  assert.equal(act(giver,'mission','',{x:999,z:999}),null);
  const brief=act(giver,'mission');
  if(difficulty===2)for(const text of route.extra)act(giver,'say',text);
  if(route.id==='u3'){
   act(giver,'say','Whose coat is this?');assert.equal(m.state.stage,'inspect');
   act(giver,'inspect-photo');m=load();assert.equal(m.state.stage,'interview');
  }
  act('leo','say',route.ask[0],m.config.positions[witness]);assert.equal(m.state.index,0);
  for(const [i,text] of route.ask.entries()){
   act(witness,'say','Not '+text);assert.equal(m.state.index,i);
   act(witness,'say',text);assert.equal(m.state.index,i+1);
  }
  m=load();assert.equal(m.state.owner,'student');assert.deepEqual(m.briefing,brief);assert.equal(m.state.stage,'report');
  act(giver,'say',route.wrong);assert.equal(m.state.facts.length,0);
  assert.match(act(giver,'say',route.partial).en,route.prompt);
  m=load();act(giver,'say',route.last);assert.equal(m.state.stage,'handover');
  assert.equal(act(giver,'deliver','',{x:999,z:999}),null);
  assert.equal(act(giver,'deliver').en,m.config.thanks.en);
  assert.ok(readProgress(storage,difficulty).completed.includes(route.id));
  assert.equal(load().state.stage,'brief');
 });
}

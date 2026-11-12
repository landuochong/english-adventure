import test from 'node:test';
import assert from 'node:assert/strict';
import {campusState,campusAct,campusMarker,campusPeople,devicePoint,campusHint} from '../dist/campus-level.js';
const act=(s,id,type,text='')=>campusAct(s,id,type,text,id==='device'?{x:8,z:-4}:campusPeople[id]);
function reachPickup(){const s=campusState();act(s,'mia','mission');act(s,'ben','say','Have you seen the robot?');act(s,'leo','say','Where is the robot?');act(s,'leo','say','For the science fair');assert.equal(s.stage,'verify');act(s,'leo','say','Blue');assert.equal(s.stage,'pickup');return s;}
test('campus full quest requires actual discovery, carrying, report and delivery',()=>{
 const s=reachPickup();assert.equal(s.discovered,false);assert.equal(campusMarker(s,'mia'),'text');
 act(s,'device','pickup');assert.equal(s.owner,null);
 act(s,'device','discover');act(s,'device','pickup');assert.equal(s.owner,'student');assert.equal(campusMarker(s,'mia'),'ask');
 act(s,'mia','say','I will bring the robot');assert.equal(s.stage,'return');
 act(s,'mia','say','Here is the robot');assert.equal(s.stage,'handover');assert.equal(s.complete,false);
 act(s,'mia','deliver');assert.equal(s.complete,true);assert.equal(s.owner,'display');
 act(s,'device','pickup');assert.equal(s.owner,'display');
});
test('remote and wrong-character actions, coach and replay cannot award progress',()=>{
 const s=campusState();campusAct(s,'mia','mission','',{x:0,z:0});assert.equal(s.stage,'brief');
 act(s,'device','discover');act(s,'device','pickup');assert.equal(s.discovered,false);
 act(s,'mia','mission');assert.equal(campusMarker(s,'mia'),'text');
 campusHint(s);act(s,'leo','say','Where is the robot?');assert.equal(s.stage,'service');
 assert.equal(campusAct(s,'nova','say','robot',{x:0,z:0}),null);
 act(s,'ben','say','hello');assert.equal(s.stage,'service');
});
test('missing details, negation and correction retain only justified information',()=>{
 const s=campusState();act(s,'mia','mission');act(s,'ben','say','Where is the robot?');act(s,'leo','say','Can I have the robot?');
 act(s,'leo','say','It is not blue');assert.equal(s.draft.values.slot1,undefined);
 act(s,'leo','say','Blue');assert.equal(s.draft.asked,'slot2');
 act(s,'leo','say','yes');assert.equal(s.stage,'verify');
 act(s,'leo','say','For the science fair');assert.equal(s.stage,'pickup');
 campusAct(s,'device','discover','',{x:-7,z:4});assert.equal(s.discovered,false);
});

test('modern campus layout validates world positions instead of legacy map coordinates',()=>{
 const layout={people:{mia:{x:-2.7,z:-1},ben:{x:-10,z:-5.2},leo:{x:8,z:-9}},device:{x:8,z:-11}};
 const s=campusState();
 assert.equal(campusAct(s,'mia','mission','',campusPeople.mia,layout),null);
 campusAct(s,'mia','mission','',layout.people.mia,layout);
 campusAct(s,'ben','say','Have you seen the robot?',layout.people.ben,layout);
 campusAct(s,'leo','say','Where is the robot?',layout.people.leo,layout);
 campusAct(s,'leo','say','Blue light',layout.people.leo,layout);
 campusAct(s,'leo','say','For the science fair',layout.people.leo,layout);
 assert.equal(s.stage,'pickup');
 campusAct(s,'device','discover','',devicePoint,layout);assert.equal(s.discovered,false);
 campusAct(s,'device','discover','',layout.device,layout);
 campusAct(s,'device','pickup','',layout.device,layout);assert.equal(s.owner,'student');
 campusAct(s,'mia','say','Here is the robot',layout.people.mia,layout);
 campusAct(s,'mia','deliver','',layout.people.mia,layout);assert.equal(s.complete,true);
});

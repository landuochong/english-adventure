import test from 'node:test';
import assert from 'node:assert/strict';
import {findCampusPath} from '../dist/campus-navigation.js';
import {campusState,campusAct} from '../dist/campus-level.js';
import {environmentLayout as layout} from '../dist/campus-environment-layout.js';
test('click movement routes around walls without cutting corners',()=>{
 const valid=(x,z)=>Math.abs(x)<10&&Math.abs(z)<10&&!(Math.abs(x)<1&&Math.abs(z)<3);
 const start={x:-4,z:0},target={x:4,z:0},path=findCampusPath(start,target,valid);assert.ok(path.length>1);assert.deepEqual(path.at(-1),target);
 let previous=start;for(const next of path){for(let i=1;i<=100;i++)assert.ok(valid(previous.x+(next.x-previous.x)*i/100,previous.z+(next.z-previous.z)*i/100));previous=next;}
 assert.deepEqual(findCampusPath(start,{x:0,z:0},valid),[]);
});
test('NPC conversation range is 3.5 metres while pickup remains close range',()=>{
 const near={x:layout.people.mia.x+3.4,z:layout.people.mia.z},far={...near,x:layout.people.mia.x+3.6};const s=campusState();assert.equal(campusAct(s,'mia','mission','',far,layout),null);campusAct(s,'mia','mission','',near,layout);assert.equal(s.stage,'service');
 s.stage='pickup';campusAct(s,'device','discover','',{x:layout.device.x+2.4,z:layout.device.z},layout);assert.equal(s.discovered,false);
});

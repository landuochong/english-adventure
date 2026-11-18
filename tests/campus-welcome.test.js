import test from 'node:test';import assert from 'node:assert/strict';
import {createMission} from '../dist/campus-missions.js';import {environmentLayout as layout} from '../dist/campus-environment-layout.js';
function setup(){const m=createMission('welcome');const act=(id,type,text='',pos=layout.people[id],clear=()=>true)=>m.act(id,type,text,pos,clear);return {m,act};}
test('welcome accepts either introduction order and a nickname, then any two locations',()=>{
 for(const [first,second] of [['lisa','waiter'],['sue','lisa'],['waiter','sue']]){
 const {m,act}=setup();act('mia','mission');act('mia','say','I like drawing.');assert.equal(m.state.stage,'introduction');act('mia','say','My name is Sam.');assert.equal(m.state.stage,'explore');
 act(first,'greet');assert.deepEqual(m.state.visited,[]);act(first,'say','Hello!');assert.equal(m.state.stage,'explore');act(first,'say','Hello!');assert.equal(m.state.visited.length,1);
 act(second,'say','Nice to meet you.');assert.equal(m.state.stage,'return');
 act('mia','say',first==='lisa'?'I liked the library.':first==='sue'?'I enjoyed the sports area.':'I like the cafe.');assert.equal(m.state.stage,'handover');assert.equal(m.state.complete,false);act('mia','deliver');assert.equal(m.state.complete,true);
 }});
test('welcome does not complete with unrelated or remote interactions or an unvisited place',()=>{
 const {m,act}=setup();act('mia','mission','',{x:70,z:65});assert.equal(m.state.stage,'brief');act('mia','mission');act('mia','say','I am ready');assert.equal(m.state.profile.name,undefined);act('mia','say','My name is Kim and I like music.');assert.equal(m.state.stage,'explore');
 act('lisa','say','Hello',{x:0,z:0});act('lisa','say','Hello',layout.people.lisa,()=>false);act('nova','say','Hello',layout.people.lisa);assert.deepEqual(m.state.visited,[]);
 act('mia','say','I like the library');assert.equal(m.state.stage,'explore');act('lisa','say','Hello');act('waiter','say','Hi');act('mia','say','I like the sports area');assert.equal(m.state.stage,'return');act('mia','say','I do not like the library');assert.equal(m.state.stage,'return');act('mia','deliver');assert.equal(m.state.complete,false);
});
test('welcome collects introductions across natural sentences and short follow-up answers',()=>{
 for(const sentence of ["My name is Tom. I like football.","I'm Tom and I like football.","I am Tom. I enjoy reading.","I like football and my name is Tom."]){
 const {m,act}=setup();act('mia','mission');act('mia','say',sentence);assert.equal(m.state.stage,'explore',sentence);assert.equal(m.state.profile.name,'tom');
 }
 const {m,act}=setup();act('mia','mission');act('mia','say','My name is Sam.');act('mia','say','Playing football');assert.equal(m.state.stage,'explore');assert.equal(m.state.profile.name,'sam');
 act('lisa','say','Hello');act('waiter','say','Hello');act('mia','say','The sports area');assert.equal(m.state.stage,'return');act('mia','say','The library');assert.equal(m.state.stage,'handover');
 const other=setup();other.act('mia','mission');other.act('mia','say','I like reading');other.act('mia','say','Sam');assert.equal(other.m.state.stage,'explore');
});
test('reopening welcome conversations follows progress without advancing or forgetting it',()=>{
 const {m,act}=setup();act('mia','mission');
 const greet=(id,expected)=>{const before=JSON.stringify(m.state);const reply=act(id,'greet');assert.match(reply.en,expected);assert.equal(JSON.stringify(m.state),before);};
 greet('mia',/What should I call you.*what do you like/);
 act('mia','say','My name is Jalor.');greet('mia',/What do you like doing/);
 act('mia','say','I like playing football.');greet('mia',/Choose at least two places/);
 greet('lisa',/library/);assert.deepEqual(m.state.visited,[]);
 act('lisa','say','Hello');greet('mia',/one more place/);greet('lisa',/borrow a book/);
 act('waiter','say','Hi');greet('mia',/Which place did you enjoy visiting/);
 assert.match(act('mia','say','Hello').en,/Which place did you enjoy visiting/);assert.equal(m.state.stage,'return');
 act('mia','say','The library');greet('mia',/confirm/);assert.equal(m.state.complete,false);
 act('mia','deliver');greet('mia',/Your school adventure starts today/);
 const other=setup();other.act('mia','mission');other.act('mia','say','I like football');assert.match(other.act('mia','greet').en,/What should I call you/);
});

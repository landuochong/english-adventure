import test from 'node:test';
import assert from 'node:assert/strict';
import {NPCS,reply,hasInformation} from '../dist/world.js';
import {initial,transition} from '../dist/engine.js';
const people=NPCS.filter(n=>n.clue);
const active=()=>({...initial(),entered:true,prepared:true,started:true});
test('greetings, social chat, unrelated questions and bare keywords never reveal a clue',()=>{
 const invalid=['hello','how are you?','What is your name?','Can you play football?','Can you help me?','Have a nice day','What is the weather?','banana','Pip','robot','I like robots','Pip is a robot','I have seen Pip','I know Pip','I know where Pip is','I can find Pip','Have you seen John?','Have you seen it?','你见过 Pip 吗？','Pip, what is your favourite pizza?'];
 for(const n of people)for(const text of invalid){const r=reply(n,active(),text);assert.equal(r.clue,undefined,n.id+': '+text);assert.doesNotMatch(r.en,/greenhouse|towards the art room|flashes blue/);}
});
test('several understandable relevant English questions earn the person’s own clue',()=>{
 const valid=['Have you seen Pip?','Where did Pip go?','Where is the small white robot?','Where’s Pip?','Do you know anything about Pip?','Can you help me find Pip?','I am looking for Pip. Could you help me?','Tell me about the missing robot, please.','You seen Pip?'];
 for(const n of people)for(const text of valid)assert.equal(reply(n,active(),text).clue,n.clue,n.id+': '+text);
});
test('role specific questions work and appearance questions only describe Pip',()=>{
 assert.equal(reply(people.find(n=>n.id==='artist'),active(),'Where did you take the shiny decoration?').clue,'decoration');
 assert.equal(reply(people.find(n=>n.id==='technician'),active(),'What does the blue light mean?').clue,'record');
 for(const n of people){const r=reply(n,active(),'What color is Pip?');assert.equal(r.clue,undefined);assert.match(r.en,/white robot/);}
});
test('pronoun reference requires an established topic, and invalid replies keep question marker',()=>{
 const n=people[0],s=active();assert.equal(reply(n,s,'Have you seen it?').clue,undefined);
 assert.equal(reply(n,s,'Have you seen it?',{topicEstablished:true}).clue,'witness');
 for(const text of ['hello','How are you?','Pip is a robot']){const r=reply(n,s,text);if(r.clue)throw Error('invalid clue');assert.equal(hasInformation(n,s),true);}
 const r=reply(n,s,'Have you seen Pip?');const earned=transition({...s,location:n.location},'clue',r.clue);assert.equal(hasInformation(n,earned),false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createGardenSpeech} from '../dist/garden-speech.js';
test('garden uses chosen English voice, full volume and slower replay; stop invalidates pending speech',async()=>{
 const previous=globalThis.document;
 globalThis.document={createElement:()=>({})};
 try{
 const voice={name:'Google US English',lang:'en-US'},spoken=[];
 const synth={getVoices:()=>[{name:'Albert',lang:'en-US'},voice],addEventListener(){},cancel(){},speak:u=>spoken.push(u)};
 const select={replaceChildren(){},append(){}},rateInput={},status={};
 const audio=createGardenSpeech({synth,Utterance:class{},select,rateInput,status});
 await audio.speak('Water, please.');assert.equal(spoken[0].voice,voice);assert.equal(spoken[0].volume,1);assert.equal(spoken[0].rate,.8);
 await audio.speak('Water, please.',true);assert.ok(spoken[1].rate<spoken[0].rate);
 const pending=audio.speak('Cancelled');audio.stop();await pending;assert.equal(spoken.length,2);
 }finally{globalThis.document=previous;}
});

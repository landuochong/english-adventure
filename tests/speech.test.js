import test from 'node:test';import assert from 'node:assert/strict';import {chooseVoice,loadVoices} from '../dist/speech.js';
const zh={lang:'zh-CN',name:'Chinese',voiceURI:'zh',default:true};const en={lang:'en-US',name:'English',voiceURI:'en'};const natural={lang:'en-GB',name:'English Natural',voiceURI:'natural'};
test('never uses a non-English default voice',()=>{assert.equal(chooseVoice([zh,en]),en);assert.equal(chooseVoice([zh]),null);});
test('respects choice and falls back if it is unavailable',()=>{assert.equal(chooseVoice([en,natural]),natural);assert.equal(chooseVoice([en,natural],'en'),en);assert.equal(chooseVoice([en],'missing'),en);});
test('waits for asynchronously available voices and removes listener',async()=>{const events=new EventTarget();let voices=[];events.getVoices=()=>voices;const pending=loadVoices(events,100);voices=[en];events.dispatchEvent(new Event('voiceschanged'));assert.deepEqual(await pending,[en]);});
test('empty voice registry times out safely',async()=>{const events=new EventTarget();events.getVoices=()=>[];assert.deepEqual(await loadVoices(events,1),[]);});

test('defaults to Google US English, while respecting manual choice',()=>{const google={lang:'en-US',name:'Google US English',voiceURI:'google-us'};assert.equal(chooseVoice([zh,natural,en,google]),google);assert.equal(chooseVoice([natural,google],'natural'),natural);assert.equal(chooseVoice([natural,en]),natural);});

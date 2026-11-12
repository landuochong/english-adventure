import test from 'node:test';
import assert from 'node:assert/strict';
import {pcmWav,createLocalVoiceTurn} from '../dist/local-voice-turn.js';
test('local PCM encoding preserves sample order, format and clipping',()=>{
 const v=new DataView(pcmWav([new Float32Array([-2,0]),new Float32Array([1,.5])]));
 assert.equal(v.getUint32(24,true),16000);assert.equal(v.getUint32(40,true),8);assert.equal(v.getInt16(44,true),-32768);assert.equal(v.getInt16(48,true),32767);
});
function fixture(request){let callbacks,destroyed=0,result,error;const turn=createLocalVoiceTurn({request,createVAD:async cb=>{callbacks=cb;return {start:async()=>{},destroy:async()=>{destroyed++;}};},onComplete:r=>result=r,onError:e=>error=e});return {turn,get callbacks(){return callbacks;},get result(){return result;},get error(){return error;},get destroyed(){return destroyed;}};}
test('local capture sends WAV once, then returns exact model transcript',async()=>{
 let posts=0;const f=fixture(async(url,opts)=>{if(url.endsWith('health'))return {ok:true,json:async()=>({ok:true})};posts++;assert.equal(opts.headers['Content-Type'],'audio/wav');assert.equal(new DataView(opts.body).getUint32(40,true),6);return {ok:true,json:async()=>({text:'Take Bu5.'})};});
 await f.turn.start();f.callbacks.onSpeechRealStart();f.callbacks.onFrameProcessed({isSpeech:.9},new Float32Array([0,.1,.2]));await f.turn.stop();await f.turn.stop();assert.equal(posts,1);assert.equal(f.destroyed,1);assert.equal(f.result.text,'Take Bu5.');
});
test('cancel drops late local results and releases the microphone',async()=>{
 let resolve;const f=fixture(async url=>url.endsWith('health')?{ok:true,json:async()=>({ok:true})}:new Promise(r=>resolve=r));await f.turn.start();f.callbacks.onSpeechRealStart();f.callbacks.onFrameProcessed({isSpeech:.9},new Float32Array([0,.1]));const pending=f.turn.stop();await new Promise(r=>setImmediate(r));f.turn.abort();resolve({ok:true,json:async()=>({text:'Yes'})});await pending;assert.equal(f.result,undefined);assert.equal(f.destroyed,1);
});
test('unavailable local service never falls back to a browser or submits text',async()=>{
 const f=fixture(async()=>({ok:false}));await f.turn.start();assert.equal(f.error,'local-asr');assert.equal(f.result,undefined);
});
test('manual stop without detected speech does not submit audio',async()=>{
 const f=fixture(async()=>({ok:true,json:async()=>({ok:true})}));await f.turn.start();await f.turn.stop();assert.equal(f.error,'no-speech');assert.equal(f.result,undefined);assert.equal(f.destroyed,1);
});
test('configured 3-second silence keeps listening through 2 seconds and submits once at 3',async t=>{
 let now=0,tick,callbacks,posts=0;
 t.mock.method(performance,'now',()=>now);
 t.mock.method(globalThis,'setInterval',fn=>{tick=fn;return 0;});
 t.mock.method(globalThis,'clearInterval',()=>{});
 const turn=createLocalVoiceTurn({silenceMs:3000,
  createVAD:async cb=>{callbacks=cb;return {start:async()=>{},destroy:async()=>{}};},
  request:async url=>{if(url.endsWith('health'))return {ok:true,json:async()=>({ok:true})};posts++;return {ok:true,json:async()=>({text:'Have you seen the robot?'})};}
 });
 await turn.start();callbacks.onSpeechRealStart();
 callbacks.onFrameProcessed({isSpeech:.9},new Float32Array([.1]));
 for(now=100;now<3000;now+=100){callbacks.onFrameProcessed({isSpeech:0},new Float32Array([0]));tick();}
 now=2999;callbacks.onFrameProcessed({isSpeech:0},new Float32Array([0]));tick();assert.equal(posts,0);
 now=3000;callbacks.onFrameProcessed({isSpeech:0},new Float32Array([0]));tick();
 await new Promise(resolve=>setImmediate(resolve));assert.equal(posts,1);turn.abort();
});

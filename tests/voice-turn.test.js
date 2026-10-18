import test from 'node:test';
import assert from 'node:assert/strict';
import {TranscriptBuffer,SilenceGate,createVoiceTurn} from '../dist/voice-turn.js';
const result=(text,final=true)=>Object.assign([{transcript:text}],{isFinal:final});
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
class Clock {
 time=0;next=1;tasks=new Map();now=()=>this.time;
 setTimeout=(fn,ms)=>this.add(fn,ms,0);clearTimeout=id=>this.tasks.delete(id);
 setInterval=(fn,ms)=>this.add(fn,ms,ms);clearInterval=id=>this.tasks.delete(id);
 add(fn,ms,period){const id=this.next++;this.tasks.set(id,{fn,at:this.time+ms,period});return id;}
 advance(ms){const end=this.time+ms;for(;;){const entry=[...this.tasks].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at||a[0]-b[0])[0];if(!entry)break;const[id,t]=entry;this.time=t.at;if(t.period)t.at+=t.period;else this.tasks.delete(id);t.fn();}this.time=end;}
}
async function fixture(){
 const clock=new Clock(),rs=[],updates=[],completed=[],errors=[];let callbacks,destroyed=0,prob=0;
 class Recognition{constructor(){rs.push(this);this.stops=0;}start(){}stop(){this.stops++;}abort(){this.aborted=true;}ready(){this.onstart();}results(...r){this.onresult({results:r});}end(){this.onend();}}
 const turn=createVoiceTurn({Recognition,clock,createVAD:async cb=>{callbacks=cb;return{start:async()=>{},destroy:async()=>{destroyed++;}};},onUpdate:s=>updates.push(s),onComplete:s=>completed.push(s),onError:(...e)=>errors.push(e)});
 await turn.start();rs[0].ready();
 const frames=clock.setInterval(()=>callbacks.onFrameProcessed({isSpeech:prob}),32);
 return{clock,turn,rs,updates,completed,errors,frames,speech(){prob=1;callbacks.onSpeechRealStart();callbacks.onFrameProcessed({isSpeech:1});},silence(){prob=0;},get destroyed(){return destroyed;}};
}
test('transcript revisions replace interim text and accumulate every session',()=>{const b=new TranscriptBuffer();b.update([result('Have you',false)]);b.update([result('Have you seen',true),result('a row',false)]);assert.equal(b.snapshot().text,'Have you seen a row');b.update([result('Have you seen',true),result('the robot',true)]);b.commit();b.update([result('at the library',true)]);assert.deepEqual(b.snapshot(),{text:'Have you seen the robot at the library',needsReview:false});});
test('VAD silence is independent of transcription and resets on resumed speech',()=>{const g=new SilenceGate();g.frame(0,0);assert.equal(g.state(5000).ended,false);g.speechStart(100);g.frame(.8,200);assert.equal(g.state(2199).ended,false);g.frame(.8,2900);assert.equal(g.state(4799).ended,false);g.frame(0,5900);assert.equal(g.state(5900).ended,true);});
test('first final ASR result never submits; full 2s silence stops, then final tail is flushed',async()=>{const f=await fixture();f.speech();f.rs[0].results(result('Have you seen'));f.silence();f.clock.advance(1900);assert.equal(f.rs[0].stops,0);assert.equal(f.completed.length,0);f.clock.advance(100);assert.equal(f.rs[0].stops,1);assert.equal(f.completed.length,0);f.rs[0].results(result('Have you seen'),result('the robot'));f.rs[0].end();await flush();assert.deepEqual(f.completed,[{text:'Have you seen the robot',needsReview:false}]);assert.equal(f.destroyed,1);});
test('continuing after a short pause cancels the old silence deadline',async()=>{const f=await fixture();f.speech();f.silence();f.clock.advance(1500);f.speech();f.clock.advance(200);f.silence();f.clock.advance(1700);assert.equal(f.rs[0].stops,0);f.clock.advance(300);assert.equal(f.rs[0].stops,1);f.turn.abort();});
test('browser endpoint restarts recognition without losing earlier words or submitting',async()=>{const f=await fixture();f.speech();f.rs[0].results(result('Have you seen'));f.rs[0].end();assert.equal(f.completed.length,0);f.clock.advance(120);assert.equal(f.rs.length,2);f.rs[1].ready();f.rs[1].results(result('the robot'));f.silence();f.clock.advance(3000);f.rs[1].end();await flush();assert.equal(f.completed[0].text,'Have you seen the robot');assert.equal(f.completed.length,1);});
test('manual finish also waits for a late final revision and releases VAD exactly once',async()=>{const f=await fixture();f.speech();f.rs[0].results(result('Have you seen a row',false));f.turn.stop();assert.equal(f.completed.length,0);f.rs[0].results(result('Have you seen the robot'));f.rs[0].end();f.rs[0].end();f.turn.stop();await flush();assert.equal(f.completed.length,1);assert.equal(f.completed[0].needsReview,false);assert.equal(f.destroyed,1);});
test('unfinished interim text is retained for explicit confirmation, never marked final',async()=>{const f=await fixture();f.speech();f.rs[0].results(result('Have you seen',true),result('the robot',false));f.turn.stop();f.clock.advance(2000);await flush();assert.deepEqual(f.completed,[{text:'Have you seen the robot',needsReview:true}]);});
test('cancel ignores stale results and never submits',async()=>{const f=await fixture();f.speech();f.rs[0].results(result('Have you seen'));f.turn.abort();f.rs[0].results(result('the robot'));f.rs[0].end();f.clock.advance(20000);await flush();assert.equal(f.completed.length,0);assert.equal(f.errors.length,0);assert.equal(f.destroyed,1);});
test('stalled VAD is an error, not observed silence',async()=>{const f=await fixture();f.speech();f.silence();f.clock.clearInterval(f.frames);f.clock.advance(3100);await flush();assert.equal(f.completed.length,0);assert.equal(f.errors[0][0],'vad-stalled');});
test('empty microphone times out without submitting',async()=>{const f=await fixture();f.clock.advance(15000);await flush();assert.equal(f.errors[0][0],'no-speech');assert.equal(f.completed.length,0);});
test('late VAD initialisation after cancellation is disposed without starting ASR',async()=>{let resolve,destroyed=0,recognizers=0;const turn=createVoiceTurn({Recognition:class{constructor(){recognizers++;}},createVAD:()=>new Promise(r=>resolve=r)});const start=turn.start();turn.abort();resolve({start:async()=>{},destroy:async()=>destroyed++});await start;assert.equal(destroyed,1);assert.equal(recognizers,0);});

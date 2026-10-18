// A recognition result is a revision of the current session, never a new utterance.
export class TranscriptBuffer {
 constructor(){this.completed=[];this.current=[];}
 update(results){this.current=Array.from(results,r=>({text:(r[0]?.transcript||'').trim(),final:r.isFinal===true}));}
 commit(){this.completed.push(...this.current);this.current=[];}
 snapshot(){const all=[...this.completed,...this.current].filter(r=>r.text);return {text:all.map(r=>r.text).join(' '),needsReview:all.some(r=>!r.final)};}
}
export class SilenceGate {
 constructor({silenceMs=2000,threshold=.35}={}){this.silenceMs=silenceMs;this.threshold=threshold;this.heard=false;this.lastSpeech=null;this.lastFrame=null;}
 speechStart(now){this.heard=true;this.lastSpeech=now;}
 frame(probability,now){this.lastFrame=now;if(probability>=this.threshold)this.lastSpeech=now;}
 state(now){const elapsed=this.lastSpeech===null?0:Math.max(0,now-this.lastSpeech);return {heard:this.heard,remaining:this.heard?Math.max(0,this.silenceMs-elapsed):this.silenceMs,ended:this.heard&&elapsed>=this.silenceMs,stale:this.lastFrame!==null&&now-this.lastFrame>1000};}
}

// Browser adapters are injected, so pause/restart/late-result races can be tested.
export function createVoiceTurn({Recognition,createVAD,onUpdate=()=>{},onComplete=()=>{},onError=()=>{},silenceMs=2000,clock={now:()=>performance.now(),setTimeout:(fn,ms)=>globalThis.setTimeout(fn,ms),clearTimeout:id=>globalThis.clearTimeout(id),setInterval:(fn,ms)=>globalThis.setInterval(fn,ms),clearInterval:id=>globalThis.clearInterval(id)}}){
 const buffer=new TranscriptBuffer(),gate=new SilenceGate({silenceMs});
 let phase='preparing',vad=null,recognizer=null,recognitionRunning=false,poll=null,restart=null,drain=null,startTimer=null,initialised=false,startedAt=null,restarts=0,closed=false,settled=false,releasePromise=Promise.resolve();
 const active=()=>!closed&&phase!=='finalizing';
 const emit=()=>{const state=gate.state(clock.now());onUpdate({...buffer.snapshot(),phase,remaining:state.remaining});};
 function clearTimers(){for(const id of [restart,drain,startTimer])if(id!==null)clock.clearTimeout(id);if(poll!==null)clock.clearInterval(poll);}
 function releaseVAD(){const current=vad;vad=null;if(current)releasePromise=Promise.resolve().then(()=>current.destroy()).catch(()=>{});return releasePromise;}
 function finish(){if(closed||settled)return;settled=true;closed=true;clearTimers();buffer.commit();recognizer?.abort();recognizer=null;const result=buffer.snapshot();void releaseVAD().then(()=>{onComplete(result);});}
 function fail(code){if(closed)return;closed=true;clearTimers();recognizer?.abort();recognizer=null;void releaseVAD().then(()=>onError(code,buffer.snapshot().text));}
 function beginRecognition(){
  if(!active())return;
  const r=new Recognition();recognizer=r;recognitionRunning=true;
  r.lang='en-US';r.continuous=true;r.interimResults=true;r.maxAlternatives=1;
  startTimer=clock.setTimeout(()=>{if(recognizer===r)fail('recognition-timeout');},8000);
  r.onstart=()=>{if(closed||recognizer!==r)return;clock.clearTimeout(startTimer);if(!initialised)gate.frame(0,clock.now());initialised=true;startedAt=startedAt??clock.now();phase='listening';emit();};
  r.onresult=e=>{if(closed||recognizer!==r)return;buffer.update(e.results);emit();};
  r.onerror=e=>{if(closed||recognizer!==r)return;if(e.error==='no-speech')return;if(e.error==='aborted'&&phase==='finalizing')return;fail(e.error||'recognition-error');};
  r.onend=()=>{
   if(closed||recognizer!==r)return;clock.clearTimeout(startTimer);recognitionRunning=false;recognizer=null;buffer.commit();
   if(phase==='finalizing'){finish();return;}
   if(++restarts>12){fail('recognition-restarts');return;}
   // The browser's endpoint is not the user's endpoint. Keep VAD and transcript alive.
   phase='reconnecting';emit();restart=clock.setTimeout(beginRecognition,120);
  };
  try{r.start();}catch{fail('recognition-start');}
 }
 function stop(){
  if(!active())return;
  if(!initialised){fail('not-ready');return;}
  phase='finalizing';if(restart!==null)clock.clearTimeout(restart);if(poll!==null)clock.clearInterval(poll);emit();void releaseVAD();
  // stop(), unlike abort(), allows the recognizer to flush its last final result.
  if(recognizer&&recognitionRunning){drain=clock.setTimeout(finish,2000);try{recognizer.stop();}catch{finish();}}else finish();
 }
 function abort(){if(closed)return;closed=true;clearTimers();recognizer?.abort();recognizer=null;void releaseVAD();}
 async function start(){
  emit();
  try{
   const loaded=await createVAD({onFrameProcessed:p=>{if(active()&&initialised)gate.frame(p.isSpeech,clock.now());},onSpeechRealStart:()=>{if(active()&&initialised){gate.speechStart(clock.now());phase='speaking';emit();}}});
   if(closed){await loaded.destroy();return;}vad=loaded;await vad.start();if(closed)return;
   beginRecognition();
   poll=clock.setInterval(()=>{
    if(!active()||!initialised)return;const now=clock.now(),g=gate.state(now);
    // A suspended audio pipeline is not three seconds of observed silence.
    if(g.stale){fail('vad-stalled');return;}
    if(g.ended){stop();return;}
    if(!g.heard&&now-startedAt>=15000){fail('no-speech');return;}
    phase=g.heard?(g.remaining<2700?'waiting':'speaking'):'listening';emit();
   },100);
  }catch(error){fail(error.name==='NotAllowedError'?'not-allowed':'vad-unavailable');}
 }
 return {start,stop,abort};
}

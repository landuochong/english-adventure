import {SilenceGate} from './voice-turn.js?v=19';
export function pcmWav(frames){
 const length=frames.reduce((n,f)=>n+f.length,0),buffer=new ArrayBuffer(44+length*2),v=new DataView(buffer);
 const str=(offset,s)=>{for(let i=0;i<s.length;i++)v.setUint8(offset+i,s.charCodeAt(i));};
 str(0,'RIFF');v.setUint32(4,36+length*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,length*2,true);
 let offset=44;for(const frame of frames)for(const sample of frame){const x=Math.max(-1,Math.min(1,sample));v.setInt16(offset,x*(x<0?32768:32767),true);offset+=2;}return buffer;
}
export function createLocalVoiceTurn({createVAD,scene='',onUpdate=()=>{},onComplete=()=>{},onError=()=>{},request=fetch}){
 const gate=new SilenceGate(),controller=new AbortController();let vad,frames=[],timer,closed=false,finishing=false,ready=false,started=0;
 const update=phase=>onUpdate({phase,text:'',remaining:gate.state(performance.now()).remaining});
 const release=async()=>{clearInterval(timer);const old=vad;vad=null;if(old)await old.destroy();};
 const fail=async code=>{if(closed)return;closed=true;controller.abort();frames=[];await release().catch(()=>{});onError(code,'');};
 async function stop(){
  if(closed||finishing)return;if(!ready){await fail('not-ready');return;}finishing=true;update('finalizing');
  if(!gate.heard){await fail('no-speech');return;}
  const wav=pcmWav(frames);frames=[];await release().catch(()=>{});if(closed)return;
  const timeout=setTimeout(()=>controller.abort(),30000);
  try{const r=await request('/api/local-asr',{method:'POST',headers:{'Content-Type':'audio/wav','X-Quest-Scene':scene},body:wav,signal:controller.signal});if(!r.ok)throw Error('ASR failed');const data=await r.json();if(typeof data.text!=='string'||!data.text.trim())throw Error('Empty ASR');if(!closed){closed=true;onComplete({text:data.text.trim(),needsReview:false,audioWav:wav});}}
  catch{await fail('local-asr');}finally{clearTimeout(timeout);}
 }
 async function start(){
  update('preparing');try{
   const health=await request('/api/local-asr/health',{signal:controller.signal});if(!health.ok||!(await health.json()).ok){await fail('local-asr');return;}
   const loaded=await createVAD({onFrameProcessed:(p,frame)=>{if(!ready||closed||finishing)return;frames.push(frame.slice());gate.frame(p.isSpeech,performance.now());},onSpeechRealStart:()=>{if(ready&&!closed&&!finishing)gate.speechStart(performance.now());}});
   if(closed){await loaded.destroy();return;}vad=loaded;ready=true;started=performance.now();gate.frame(0,started);await vad.start();if(closed)return;update('listening');
   timer=setInterval(()=>{if(closed||finishing)return;const now=performance.now(),state=gate.state(now);if(state.stale){void fail('vad-stalled');return;}if(state.ended||now-started>=55000){void stop();return;}if(!state.heard&&now-started>=15000){void fail('no-speech');return;}update(state.heard?'waiting':'listening');},100);
  }catch(e){await fail(e.name==='NotAllowedError'?'not-allowed':'local-asr');}
 }
 return {start,stop,abort(){if(closed)return;closed=true;controller.abort();frames=[];void release().catch(()=>{});}};
}

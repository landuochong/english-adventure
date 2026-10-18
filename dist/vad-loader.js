let loading;
const base=new URL('./vendor/vad/',import.meta.url);
function script(file){return new Promise((resolve,reject)=>{const tag=document.createElement('script');tag.src=new URL(file,base).href;tag.onload=resolve;tag.onerror=()=>{tag.remove();reject(new Error('VAD asset loading failed'));};document.head.append(tag);});}
async function load(){if(!loading)loading=(async()=>{if(!window.ort)await script('ort.wasm.min.js');if(!window.vad)await script('bundle.min.js');window.ort.env.wasm.numThreads=1;window.ort.env.wasm.proxy=false;})().catch(error=>{loading=null;throw error;});return loading;}
export async function createBrowserVAD(callbacks,{getStream}={}){
 const Audio=window.AudioContext||window.webkitAudioContext;
 if(!Audio||!navigator.mediaDevices?.getUserMedia)throw new Error('Microphone/VAD not supported');
 const context=new Audio(),streams=new Set();let destroyed=false;
 const acquire=async()=>{const stream=await(getStream?getStream(context):navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,autoGainControl:true,noiseSuppression:true}}));if(destroyed){stream.getTracks().forEach(t=>t.stop());throw new DOMException('Capture cancelled','AbortError');}streams.add(stream);return stream;};
 try{
  await context.resume();await load();
  const mic=await window.vad.MicVAD.new({model:'v5',startOnLoad:false,audioContext:context,baseAssetPath:base.href,onnxWASMBasePath:base.href,positiveSpeechThreshold:.5,negativeSpeechThreshold:.35,minSpeechMs:160,redemptionMs:3000,submitUserSpeechOnPause:false,getStream:acquire,...callbacks});
  return {start:()=>mic.start(),destroy:async()=>{if(destroyed)return;destroyed=true;streams.forEach(stream=>stream.getTracks().forEach(t=>t.stop()));try{await mic.destroy();}finally{if(context.state!=='closed')await context.close();}}};
 }catch(error){if(context.state!=='closed')await context.close();throw error;}
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {createBrowserVAD} from '../dist/vad-loader.js';
test('cancel while microphone permission is pending releases a late stream',async()=>{
 const previousWindow=globalThis.window,navDescriptor=Object.getOwnPropertyDescriptor(globalThis,'navigator');let options,resolve,stopped=0,closed=0;
 class Audio{state='running';resume=async()=>{};close=async()=>{this.state='closed';closed++;};}
 globalThis.window={AudioContext:Audio,ort:{env:{wasm:{}}},vad:{MicVAD:{new:async config=>{options=config;return{start:()=>options.getStream(),destroy:async()=>{}};}}}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{getUserMedia:()=>{}}}});
 try{
  const detector=await createBrowserVAD({}, {getStream:()=>new Promise(r=>resolve=r)});
  const starting=detector.start();await detector.destroy();resolve({getTracks:()=>[{stop:()=>stopped++}]});
  await assert.rejects(starting,{name:'AbortError'});assert.equal(stopped,1);assert.equal(closed,1);await detector.destroy();assert.equal(closed,1);
 }finally{if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;if(navDescriptor)Object.defineProperty(globalThis,'navigator',navDescriptor);else delete globalThis.navigator;}
});

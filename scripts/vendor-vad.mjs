import {mkdir,copyFile,writeFile} from 'node:fs/promises';
const out=new URL('../dist/vendor/vad/',import.meta.url);
await mkdir(out,{recursive:true});
for(const [pkg,files] of [
 ['@ricky0123/vad-web',['bundle.min.js','bundle.min.js.LICENSE.txt','vad.worklet.bundle.min.js','silero_vad_v5.onnx']],
 ['onnxruntime-web',['ort.wasm.min.js','ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm']]
])for(const file of files)await copyFile(new URL(`../node_modules/${pkg}/dist/${file}`,import.meta.url),new URL(file,out));
for(const name of ['vad-web','silero-vad','onnxruntime'])await copyFile(new URL(`../third_party/vad/${name}-LICENSE.txt`,import.meta.url),new URL(`${name}-LICENSE.txt`,out));
await writeFile(new URL('THIRD_PARTY.md',out),'# Local VAD assets\n\n- @ricky0123/vad-web 0.0.31 (ISC): https://github.com/ricky0123/vad\n- Silero VAD v5 model: distributed by vad-web; https://github.com/snakers4/silero-vad\n- onnxruntime-web 1.22.0 (MIT): https://github.com/microsoft/onnxruntime\n\nRetained bundle license notices are in bundle.min.js.LICENSE.txt.\nAll runtime assets are served from this folder, with no CDN dependency.\n');
console.log('Local VAD assets prepared.');

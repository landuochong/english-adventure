import {createBrowserVAD} from './vad-loader.js?v=19';
import {pcmWav} from './local-voice-turn.js?v=2';
const el=id=>document.getElementById(id);let capture=null,frames=[],wav=null,url='',timer=null,recording=false;
el('start').onclick=async()=>{
 el('audio').pause();el('start').disabled=true;el('save').disabled=true;el('result').textContent='';el('status').textContent='正在准备麦克风，请稍候…';frames=[];wav=null;
 try{capture=await createBrowserVAD({onFrameProcessed:(_,frame)=>{if(recording)frames.push(frame.slice());}});recording=true;await capture.start();el('stop').disabled=false;el('status').textContent='正在录音，请说话；说完后点停止。';timer=setTimeout(stop,30000);}
 catch{recording=false;await capture?.destroy();capture=null;el('start').disabled=false;el('status').textContent='麦克风未能启动，请检查权限后重试。';}
};
async function stop(){if(!recording)return;recording=false;clearTimeout(timer);el('stop').disabled=true;await capture?.destroy();capture=null;wav=pcmWav(frames);frames=[];if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(new Blob([wav],{type:'audio/wav'}));el('audio').src=url;el('download').href=url;el('download').download='my-speech.wav';el('download').hidden=false;el('start').disabled=false;el('save').disabled=wav.byteLength<=44;el('status').textContent='录音结束，可以先播放检查，再保存并识别。';}
el('stop').onclick=stop;
el('save').onclick=async()=>{
 el('save').disabled=true;el('start').disabled=true;el('status').textContent='正在保存本次录音…';const expected=el('expected').value;
 try{const saved=await fetch('/api/asr-sample',{method:'POST',headers:{'Content-Type':'audio/wav'},body:wav});if(!saved.ok)throw Error('保存失败');const info=await saved.json();el('result').textContent='已保存：'+info.path+'\n对照原句：'+expected;el('status').textContent='已保存，正在本机识别…';const response=await fetch('/api/local-asr',{method:'POST',headers:{'Content-Type':'audio/wav','X-Quest-Scene':el('scene').value},body:wav,signal:AbortSignal.timeout(35000)});if(!response.ok)throw Error('本机识别失败，但录音已保留');const data=await response.json();el('result').textContent+='\nWhisper small：'+data.text+'\n模型端耗时：'+data.duration_ms+' ms';el('status').textContent='完成。原声和识别结果可以对照查看。';}
 catch(e){el('status').textContent=e.message;}finally{el('save').disabled=false;el('start').disabled=false;}
};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&recording)void stop();});
window.addEventListener('pagehide',()=>{recording=false;clearTimeout(timer);void capture?.destroy();});

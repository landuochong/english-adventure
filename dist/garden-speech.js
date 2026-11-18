import {englishVoices,chooseVoice,voiceKey,loadVoices} from './speech.js';
export function createGardenSpeech({synth,Utterance,select,rateInput,status,storage}){
 let preferred='',rate=.8,token=0;
 try{preferred=storage?.getItem('campus-voice')||'';const saved=Number(storage?.getItem('garden-speech-rate'));if(saved>=.6&&saved<=1)rate=saved;}catch{}
 rateInput.value=String(rate);
 function refresh(){
  if(!synth)return;
  const voices=englishVoices(synth.getVoices()),chosen=chooseVoice(voices,preferred);
  select.replaceChildren();
  const add=(label,value,selected)=>{const o=document.createElement('option');o.textContent=label;o.value=value;o.selected=selected;select.append(o);};
  if(!chosen)add('请选择英语音色，先试听','',true);
  for(const v of voices)add(v.name+' ('+v.lang+')',voiceKey(v),v===chosen);
 }
 function remember(){preferred=select.value;rate=Number(rateInput.value);try{storage?.setItem('campus-voice',preferred);storage?.setItem('garden-speech-rate',String(rate));}catch{}stop();}
 function stop(){++token;synth?.cancel();}
 async function speak(text,slow=false){
  stop();const current=token;
  if(!synth){status.textContent='当前浏览器不能播音，请展开文字辅助。';return;}
  status.textContent='正在准备声音…';
  const voices=await loadVoices(synth,2500,list=>!!chooseVoice(list,preferred));
  if(current!==token)return;
  const voice=chooseVoice(voices,preferred);
  if(!voice){refresh();status.textContent='所选英语音色不可用，请在声音设置中选择并试听。';return;}
  const u=new Utterance(text);u.voice=voice;u.lang=voice.lang;u.rate=slow?Math.max(.6,rate*.8):rate;u.volume=1;u.pitch=1;
  u.onstart=()=>{if(current===token)status.textContent=slow?'慢速播放中…':'播放中…';};
  u.onend=()=>{if(current===token)status.textContent='听完后，自己试试看；也可以慢速重听。';};
  u.onerror=()=>{if(current===token)status.textContent='播音未完成，请试听其他音色，或展开文字辅助。';};
  synth.speak(u);
 }
 select.onchange=rateInput.onchange=remember;
 synth?.addEventListener('voiceschanged',refresh);refresh();
 return {speak,stop};
}

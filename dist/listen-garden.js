import {createGardenSpeech} from './garden-speech.js';
import {createVoiceTurn} from './voice-turn.js';
import {createBrowserVAD} from './vad-loader.js';
const $=id=>document.getElementById(id);
const items=[['cup','☕',29,43],['water','💧',10,43],['juice','🧃',17,43],['apple','🍎',32,51],['book','📕',51,26],['ball','⚽',64,74],['basket','🧺',44,65],['bench','🪑',80,47],['Lily','👩🏻',60,57]];
let started=false,changed=false,agreed=false,done=false,bag=new Set(),last='',turn=null,wordTimer;
function word(w){clearTimeout(wordTimer);$('keyword').textContent=w;}
function hint(){word(!started?'listen':!bag.has('water')?'water':!changed?'cup':!agreed?'ask':!bag.has('bottle')?'bottle':'deliver');wordTimer=setTimeout(()=>word(''),5000);}
let voiceStorage;try{voiceStorage=localStorage;}catch{}
const audio=createGardenSpeech({synth:window.speechSynthesis,Utterance:window.SpeechSynthesisUtterance,select:$('voice'),rateInput:$('rate'),status:$('status'),storage:voiceStorage});
let lastSpeaker='Jalor';
function say(text,who='Jalor'){last=text;lastSpeaker=who;$('speaker').textContent=who;$('transcript').textContent=text;void audio.speak(text);}
$('sample').onclick=()=>{if(!turn)void audio.speak('Please bring water and a cup. Meet me by the tree.');};
$('slow').onclick=()=>{if(!turn&&last)void audio.speak(last,true);};
$('stop-audio').onclick=()=>audio.stop();

function render(){for(const b of document.querySelectorAll('.object'))b.classList.toggle('taken',bag.has(b.dataset.item));$('inventory').replaceChildren();if(!bag.size){$('inventory').textContent='还没有物品，去探索吧';return;}for(const name of bag){const b=document.createElement('button');b.textContent=(items.find(i=>i[0]===name)?.[1]||'🍶')+' ×';b.setAttribute('aria-label','放回 '+name);b.onclick=()=>{if(turn||done)return;bag.delete(name);render();};$('inventory').append(b);}}
function object(item){const [name,icon,x,y]=item,b=document.createElement('button');b.className='object';b.dataset.item=name;b.textContent=icon;b.style.left=x+'%';b.style.top=y+'%';b.setAttribute('aria-label',name);b.onmouseenter=b.onfocus=()=>word(name);b.onmouseleave=b.onblur=()=>word('');b.onclick=()=>{if(turn||done)return;if(!started){say('Listen to Lily first. She has a little plan for this afternoon.');return;}$('walker').style.left=(x+3)+'%';$('walker').style.top=(y+7)+'%';if(name==='Lily'){say(changed?'A bottle is fine. Please ask me to confirm your new plan.':'Please bring water and a cup. No juice, please. Meet me by the tree.','Lily');return;}if(name==='bench'){say('This is a quiet place to sit. Lily is waiting by the tree.');return;}if(name==='cup'){changed=true;say('Oh, this cup is cracked. Ask Lily if you can bring a bottle instead.');if(!document.querySelector('[data-item="bottle"]'))object(['bottle','🍶',34,36]);return;}if(bag.has(name))return;bag.add(name);render();$('status').textContent='已放入背包。点击背包物品可放回。';};$('objects').append(b);}
items.forEach(object);
$('mission').onclick=()=>{if(turn)return;started=true;say('Let us have a break in the garden! Please bring water and a cup. No juice, please. Meet me by the tree.','Lily');};
function ask(raw){if(done||!started){say(done?'Thank you! Our garden break is ready.':'Listen to Lily first.');return;}const t=raw.toLowerCase().replace(/[’]/g,"'");if(!t.trim())return;
if(/\b(again|repeat|slower)\b/.test(t)){say(last,lastSpeaker);return;}
if(changed&&/\b(bottle|instead)\b/.test(t)&&/\b(can|could|may|okay|ok|bring|use)\b/.test(t)&&! /\b(not|don't|can't)\b/.test(t)){agreed=true;say('Yes, a bottle is fine. Bring water and the bottle to the tree.','Lily');return;}
if(/\b(where|find)\b/.test(t)){say(/\b(lily|meet|tree)\b/.test(t)?'Lily is beside the tree.':/\b(bottle|cup|water)\b/.test(t)?'Look on the kitchen counter, on the left.':'What are you looking for? You can ask about water, a cup, or Lily.');return;}
if(/\b(help|stuck|what|how|broken|cracked)\b/.test(t)){say(!changed?'Listen to Lily again. Which drink did she ask for?':!agreed?'The cup is cracked. Ask Lily: Can I bring a bottle?':'Bring the water and bottle to Lily.');hint();return;}
say('I can help with this garden task. Ask where an item is, or ask Lily about a bottle.');}
$('form').onsubmit=e=>{e.preventDefault();if(!turn)ask($('question').value);$('question').value='';};
$('hint').onclick=hint;$('replay').onclick=()=>{if(!turn&&last)say(last,lastSpeaker);};
$('deliver').onclick=()=>{if(turn||done)return;if(!started){say('Listen to Lily first.');return;}if(!agreed||!bag.has('water')||!bag.has('bottle')||bag.has('juice')){say(bag.has('juice')?'Thank you, but I asked for water, not juice.':!changed?'Please bring water and a cup.':!agreed?'Please check with me before changing our plan.':'We still need water and a bottle.','Lily');hint();return;}done=true;say('Thank you! You checked with me when the plan changed. Let us enjoy our break!','Lily');$('status').textContent='任务完成！你听取了需求，也确认了新的方案。';$('deliver').textContent='✓ 小聚准备好了';word('');};
function end(){turn=null;$('mic').textContent='🎙 问教练';$('cancel').hidden=true;}
$('mic').onclick=async()=>{if(turn){turn.stop();return;}if(!started){say('Listen to Lily first.');return;}if(done)return;if(!(window.SpeechRecognition||window.webkitSpeechRecognition)){$('status').textContent='当前浏览器不支持语音识别，请换 Chrome，或展开文字辅助。';return;}audio.stop();turn=createVoiceTurn({Recognition:window.SpeechRecognition||window.webkitSpeechRecognition,createVAD:createBrowserVAD,silenceMs:3000,onUpdate:r=>{$('status').textContent=r.phase==='preparing'?'准备麦克风…':r.phase==='finalizing'?'正在识别…':'正在听，停顿 3 秒后结束';},onComplete:r=>{end();if(r.needsReview){$('question').value=r.text;$('text-help').open=true;$('status').textContent='识别未定稿，请核对文字后发送。';}else ask(r.text);},onError:()=>{end();$('status').textContent='识别未完成，可重试或使用文字辅助。';}});$('mic').textContent='■ 说完了';$('cancel').hidden=false;await turn.start();};
$('cancel').onclick=()=>{turn?.abort();end();$('status').textContent='已取消录音。';};
$('reset').onclick=()=>location.reload();
addEventListener('pagehide',()=>{turn?.abort();audio.stop();});render();

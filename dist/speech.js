export function englishVoices(voices) {
  return voices.filter(v => /^en(?:[-_]|$)/i.test(v.lang));
}
export const voiceKey = v => JSON.stringify({name:v.name,lang:v.lang.toLowerCase().replace('_','-')});
export function chooseVoice(voices, preferred = '') {
  const english=englishVoices(voices);
  // Empty means Google US English, not an unspecified system voice.
  if(!preferred)return english.find(v=>/google/i.test(v.name)&&/^en[-_]US$/i.test(v.lang))||null;
  // Stable identity survives voiceURI changes. Keep old saved URI selections compatible.
  return english.find(v=>voiceKey(v)===preferred||v.voiceURI===preferred)||null;
}
export function loadVoices(synth, timeout = 2500, ready = voices => voices.length > 0) {
  if(ready(synth.getVoices()))return Promise.resolve(synth.getVoices());
  return new Promise(resolve=>{
    let timer,poll;
    const finish=()=>{clearTimeout(timer);clearInterval(poll);synth.removeEventListener('voiceschanged',changed);resolve(synth.getVoices());};
    const changed=()=>{if(ready(synth.getVoices()))finish();};
    synth.addEventListener('voiceschanged',changed);
    timer=setTimeout(finish,timeout);poll=setInterval(changed,100);changed();
  });
}

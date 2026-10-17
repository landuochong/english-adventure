export function englishVoices(voices) {
  return voices.filter(v => /^en(?:[-_]|$)/i.test(v.lang));
}
export function chooseVoice(voices, preferred = '') {
  const english = englishVoices(voices);
  const selected = english.find(v => v.voiceURI === preferred);
  if (selected) return selected;
  const score = v => (/natural|neural|premium|enhanced/i.test(v.name) ? 20 : 0)
    + (/^en[-_]US$/i.test(v.lang) ? 4 : 0) + (v.default ? 1 : 0);
  return english.sort((a, b) => score(b) - score(a))[0] || null;
}
export function loadVoices(synth, timeout = 1200) {
  const existing = synth.getVoices();
  if (existing.length) return Promise.resolve(existing);
  return new Promise(resolve => {
    let timer;
    const finish = () => { clearTimeout(timer); synth.removeEventListener('voiceschanged', changed); resolve(synth.getVoices()); };
    const changed = () => { if (synth.getVoices().length) finish(); };
    synth.addEventListener('voiceschanged', changed);
    timer = setTimeout(finish, timeout);
    changed();
  });
}

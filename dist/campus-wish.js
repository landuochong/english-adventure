const line = (en, zh) => ({en, zh});
export const wishPeople = {
  mia: {name:'Mia', x:6.4, z:8},
  ben: {name:'Ben', x:43, z:22}
};
export const wishMission = {
  id:'wish', world:'campus', region:'courtyard', title:'愿望树旁的空位',
  giver:'mia', people:['mia','ben'], positions:wishPeople, kind:'none', item:'愿望叶', finishLabel:'把 Ben 的愿望挂上树',
  device:null, display:null, asrScene:'campus-wish',
  words:['wish','leaf','library','draw'], phrases:["What's your name?", 'What do you like doing?', 'Would you like to learn to …?', 'Come with me.', 'He wants to learn to …'],
  thanks:line('Welcome, Ben. Your leaf belongs here.','欢迎你，Ben。这片叶子的位置属于你。'),
  summary:'Ben 画的小鸟随愿望叶挂上了庭院里的愿望树。'
};
const hints = {
  brief:line('Mia is by the wish tree in the courtyard.','去庭院的愿望树旁找 Mia。'),
  find:line('That leaf is for the new student. Look in the library. Ask his name and what he wants to learn.','这片叶子是留给新同学的。去图书馆问问他叫什么、想学什么。'),
  invite:line('Invite Ben to the tree with you.','邀请 Ben 一起去愿望树。'),
  interests:line('Ben has no idea for his leaf yet. Ask what he likes doing.','Ben 还没想好叶子上画什么。问问他平时喜欢做什么。'),
  suggest:line('What can Ben draw already? What is still hard for him? Suggest a wish.','Ben 已经会画什么？什么对他还有点难？试着给他提个建议。'),
  report:line('Introduce Ben to Mia. Tell her what he wants to learn.','带 Ben 去见 Mia，介绍他的名字和愿望。'),
  handover:line('Hang the leaf on the empty clip.','把愿望叶挂在空木夹上。')
};
const nextPerson = {brief:'mia', find:'ben', invite:'ben', interests:'ben', suggest:'ben', report:'mia', handover:'mia'};
const hesitation=line("I'd like to, but I don't know what to put on my leaf.",'我很想去，可我不知道该在叶子上画什么。');
const sketchbook=line("I draw little animals in my notebook. Look, a rabbit! But when I try to draw a bird, it looks like a potato with wings.",'我喜欢在本子上画小动物。看，这是只兔子！可我画的小鸟看起来像个长翅膀的土豆。');
const birdDrawing=/\b(?:draw(?:ing)?|sketch(?:ing)?|paint(?:ing)?) (?:a |the |little )?birds?\b/;
const interestQuestion=/\b(?:what (?:do you (?:like|enjoy|love)|are your hobbies|is your hobby)|what's your hobby|do you (?:like|enjoy) (?:to draw|drawing)|what (?:can|do) you draw)\b/;
export function createWishMission(layout,edition=2) {
  const originalWish=edition===1;
  const state = {originalWish, awaitingSubject:false, stage:'brief', owner:'mia', complete:false, introduced:false, records:{}};
  return {
    config:originalWish?{...wishMission,summary:'Ben 把自己的绘画愿望挂上了树。'}:wishMission, state,
    marker(id) {return nextPerson[state.stage] === id ? 'ask' : state.records[id] ? 'text' : 'idle';},
    hint() {return hints[state.stage] || wishMission.thanks;},
    act(id, type, text, pos, clear = () => true) {
      const target = wishPeople[id];
      if (!target || !pos || Math.hypot(pos.x-target.x,pos.z-target.z)>layout.interactionRadius || !clear(target)) return null;
      const stage = state.stage;
      const t = text.toLowerCase().replaceAll('’', "'").replace(/[.,!?]/g,' ').replace(/\s+/g,' ').trim();
      if (type === 'greet' || (type==='say' && /^(hi|hello|hey)$/.test(t))) return line('Hello there!','你好！');
      if (type==='say' && /\b(repeat|again)\b/.test(t)) return state.records[id] || hints[stage];
      if (id !== nextPerson[stage]) return type==='say' ? hints[stage] : null;
      let reply;
      if (stage === 'brief' && type === 'mission') {
        state.stage='find'; state.owner='student';
        reply=line("Each leaf on our tree is someone's wish. This one is for the new student in the library. Ask his name and what he wants to learn. Then bring him back and introduce him to me. We can hang his wish here together.",'树上的每片叶子都是一位同学的愿望。这片留给图书馆里的新同学。去问问他叫什么、想学什么，再带他回来介绍给我。我们一起把他的愿望挂上树。');
      } else if (stage === 'handover' && type === 'deliver') {
        state.stage='complete'; state.complete=true; state.owner='display'; reply=wishMission.thanks;
      } else if (type === 'say') {
        const meaning=t.replace(/^why don't (we|you) /,'');
        if (/\b(no|not|never|instead)\b|n't\b/.test(meaning)) return hints[stage];
        if (stage === 'find' && /\b(are you (a |the )?new|what(?:'s| is) your (name|wish)|what do you want to learn)\b/.test(t)) {
          state.stage='invite'; reply=originalWish?line("I'm Ben. I want to learn to draw.",'我叫 Ben，我想学画画。'):line("I'm Ben. It's my first day. Is that leaf for me?",'我叫 Ben，今天第一天来。这片叶子是给我的吗？');
        } else if (stage === 'invite' && /\b(come (with me|along|to the (wish )?tree)|join (us|me)|let'?s (go|add your wish)|what(?:'s| is) your wish|what do you want to learn)\b/.test(t)) {
          if (originalWish && /\b(come|join|let'?s)\b/.test(t)) {
            state.stage='report'; reply=line("I'd love to! Let's go.",'我很乐意！走吧。');
          } else if (originalWish) reply=line("I want to learn to draw.",'我想学画画。');
          else {state.stage='interests'; reply=hesitation;}
        } else if (!originalWish && ['interests','invite'].includes(stage) && interestQuestion.test(t)) {
          state.stage='suggest'; reply=sketchbook;
        } else if (stage === 'suggest') {
          const proposal=/^(?:ben )?(?:would you like to|do you want to|shall we|should we|let'?s|you (?:can|could)|why don'?t (?:we|you)|how about|what about|maybe you could) (?:learn(?:ing)? (?:how )?to |try (?:to )?)?(?:draw|paint|sketch)(?:ing)? (?:a |the |little )?birds?(?: together)?$/.test(t);
          if (proposal) {
            state.stage='report'; reply=line("Yes! I want to learn to draw birds. I'll draw my first one on this leaf. Let's go show Mia!",'对！我想学画小鸟。我先在叶子上画第一只。我们一起拿给 Mia 看吧！');
          } else reply=interestQuestion.test(t)?sketchbook:line("Look at my sketch. The rabbit is easy for me. What could I learn to draw?",'看看我的画。画兔子我已经很拿手了。我可以学着画什么呢？');
        } else if (stage === 'report') {
          if (/\b(this is|meet|his name is|he is|he's) ben\b|^ben\b/.test(t)) state.introduced=true;
          const drawing=/\b(?:ben|he) (?:wants|would like|hopes) to (?:learn (?:how )?to )?draw\b/.test(t);
          const birdAnswer=state.awaitingSubject && /^(?:(?:a|little) )?birds?$/.test(t);
          if (state.introduced && ((drawing && (originalWish||birdDrawing.test(t))) || birdAnswer)) {
            state.stage='handover'; reply=originalWish?line("Here is a clip for your leaf!",'给你的愿望叶一个木夹！'):line("Your first bird! Ben, here's a clip for your leaf.",'你的第一只小鸟！Ben，这个木夹留给你的叶子。');
          } else if (state.introduced && drawing) {state.awaitingSubject=true;reply=line('What does he want to draw?', '他想画什么？');}
          else reply=state.introduced ? line('What does he want to learn?','他想学什么？') : line("What's our new student's name?",'新同学叫什么名字？');
        } else reply=hints[stage];
      }
      if (reply) state.records[id]=reply;
      return reply || null;
    }
  };
}

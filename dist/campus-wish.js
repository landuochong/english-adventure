const line = (en, zh) => ({en, zh});
export const wishPeople = {
  mia: {name:'Mia', x:6.4, z:8},
  ben: {name:'Ben', x:43, z:22}
};
export const wishMission = {
  id:'wish', world:'campus', region:'courtyard', title:'愿望树旁的空位',
  giver:'mia', people:['mia','ben'], positions:wishPeople, kind:'none', item:'愿望叶', finishLabel:'把 Ben 的愿望挂上树',
  device:null, display:null, asrScene:'campus-wish',
  words:['wish','leaf','library','draw'], phrases:['Are you new here?', 'Come with me.', 'He wants to learn to …'],
  thanks:line('Welcome, Ben. Your leaf belongs here.','欢迎你，Ben。这片叶子的位置属于你。'),
  summary:'Ben 的画笔叶挂上了庭院里的愿望树。'
};
const hints = {
  brief:line('Mia is by the wish tree in the courtyard.','去庭院的愿望树旁找 Mia。'),
  find:line('Try the library. Ask the student there if he is new here.','去图书馆，问问那里的同学是不是新来的。'),
  invite:line('Invite Ben to the tree with you.','邀请 Ben 一起去愿望树。'),
  report:line('Introduce Ben to Mia. Tell her what he wants to learn.','带 Ben 去见 Mia，介绍他的名字和愿望。'),
  handover:line('Hang the leaf on the empty clip.','把愿望叶挂在空木夹上。')
};
const nextPerson = {brief:'mia', find:'ben', invite:'ben', report:'mia', handover:'mia'};
export function createWishMission(layout) {
  const state = {stage:'brief', owner:'mia', complete:false, introduced:false, records:{}};
  return {
    config:wishMission, state,
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
        reply=line('Our wish tree is missing a leaf. Here, take this one. Can you find our new student? I saw him at the library.','愿望树还缺一片叶子。拿好这片，去找找新同学吧。我在图书馆见过他。');
      } else if (stage === 'handover' && type === 'deliver') {
        state.stage='complete'; state.complete=true; state.owner='display'; reply=wishMission.thanks;
      } else if (type === 'say') {
        if (/\b(no|not|never|maybe|instead)\b|n't\b/.test(t)) return hints[stage];
        if (stage === 'find' && /\b(are you (a |the )?new|what(?:'s| is) your (name|wish)|what do you want to learn)\b/.test(t)) {
          state.stage='invite'; reply=line("Yes. I'm Ben. I want to learn to draw.",'是的，我叫 Ben。我想学画画。');
        } else if (stage === 'invite' && /\b(come (with me|along|to the (wish )?tree)|join (us|me)|let'?s (go|add your wish))\b/.test(t)) {
          state.stage='report'; reply=line("I'd love to! I'll draw a paintbrush on my leaf. Let's go.",'好啊！我在叶子上画支画笔。一起走吧。');
        } else if (stage === 'report') {
          if (/\b(this is|meet|his name is|he is|he's) ben\b|^ben\b/.test(t)) state.introduced=true;
          const drawing=/\b(?:ben|he) (?:wants|would like|hopes) to (?:learn (?:how )?to )?draw\b/.test(t);
          if (state.introduced && drawing) {
            state.stage='handover'; reply=line("A paintbrush! Ben, here's a clip for your leaf.",'一支画笔！Ben，这个木夹留给你的叶子。');
          } else reply=state.introduced ? line('What does he want to learn?','他想学什么？') : line("What's our new student's name?",'新同学叫什么名字？');
        } else reply=hints[stage];
      }
      if (reply) state.records[id]=reply;
      return reply || null;
    }
  };
}

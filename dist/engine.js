export const initial = () => ({version:1,prepared:false,location:'plaza',mode:'companion',started:false,clues:[],discovered:false,awake:false,following:false,complete:false,practice:0});
export function transition(s,action,value){
 const n={...s,clues:[...s.clues]};
 if(action==='prepare')n.prepared=true;
 if(action==='move'&&['plaza','library','art','greenhouse','gym'].includes(value))n.location=value;
 if(action==='mode')n.mode=value==='voice'?'voice':'companion';
 if(action==='start'&&n.prepared&&n.location==='plaza')n.started=true;
 if(action==='clue'&&n.started&&((value==='witness'&&n.location==='library')||(['record','decoration'].includes(value)&&n.location==='art'))&&!n.clues.includes(value))n.clues.push(value);
 if(action==='discover'&&n.started&&n.clues.length===3&&n.location==='greenhouse')n.discovered=true;
 if(action==='wake'&&n.discovered&&n.location==='greenhouse'&&n.clues.length===3)n.awake=true;
 if(action==='follow'&&n.location==='greenhouse'&&n.awake)n.following=true;
 if(action==='finish'&&n.location==='plaza'&&n.following)n.complete=true;
 if(action==='practice')n.practice++;
 return n;
}
export function restore(raw){try {const s=JSON.parse(raw);if(s?.version!==1||!['plaza','library','art','greenhouse','gym'].includes(s.location)||!Array.isArray(s.clues))return initial();const n=initial();for(const key of ['prepared','started','awake','following','complete'])n[key]=s[key]===true;n.location=s.location;n.mode=s.mode==='voice'?'voice':'companion';n.clues=[...new Set(s.clues.filter(x=>['witness','record','decoration'].includes(x)))];n.practice=Number.isInteger(s.practice)&&s.practice>=0?s.practice:0;if(!n.started)n.clues=[];n.discovered=(s.discovered===true||s.awake===true)&&n.started&&n.clues.length===3;n.awake=n.awake&&n.discovered;n.following=n.following&&n.awake;n.complete=n.complete&&n.following;return n;}catch{return initial();}}

const builtin={welcome:'welcome',pip:'science',science:'science',school:'school',restaurant:'restaurant',shopping:'shopping',directions:'directions',weather:'weather',hobbies:'hobbies',picnic:'picnic'};
export function builtinStoryURL(id){return Object.hasOwn(builtin,id)?'./campus-environment.html?mission='+builtin[id]:null;}
export function oldEntryURL(path,search=''){
 const play=new URLSearchParams(search).get('play');
 if(play)return builtinStoryURL(play)||'./practice.html'+search;
 if(path.endsWith('/campus-3d.html'))return builtinStoryURL('science');
 if(path.endsWith('/cafe-3d.html'))return builtinStoryURL('picnic');
 return './';
}

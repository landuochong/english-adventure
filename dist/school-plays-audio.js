import {currentScene} from './school-plays.js';

export function recordedLine(id,state){
  const s={...state,name:'my friend'};
  const variant=s.stage==='heard'?s.stop:s.stage==='agreed'?s.meeting:'';
  const file=[id,s.stage,variant].filter(Boolean).join('-').replaceAll(' ','-');
  return {url:'./assets/school-plays-audio/'+file+'.mp3',text:currentScene(id,s).line};
}
export const retryLine='Could you say that again?';

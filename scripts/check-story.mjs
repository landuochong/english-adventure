import {validateStory} from '../dist/generated-story.js';
let text='';for await(const chunk of process.stdin)text+=chunk;
try{const {story,learning}=JSON.parse(text);process.stdout.write(JSON.stringify(validateStory(story,learning)));}catch{process.stdout.write(JSON.stringify(['故事配置无法读取']));}

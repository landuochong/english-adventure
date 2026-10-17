const normalise=text=>String(text).toLowerCase().replace(/[’]/g,"'").replace(/\b(where|what|who|how)'s\b/g,'$1 is').replace(/'/g,'').replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim();
export function mentionsTask(text){return /\b(pip|robots?)\b/.test(normalise(text));}
export function assessQuestion(person,text,{topicEstablished=false}={}){
 const t=normalise(text),explicit=mentionsTask(text);
 const response=(kind,en,zh)=>({kind,en,zh});
 if(!t||/[\u3400-\u9fff]/.test(text))return response('clarify','Could you try asking in English? Nova can help you.','试着用英语提问，Nova 可以帮你组织表达。');
 if(/^(hi|hello|hey|good morning|good afternoon|good evening)( there)?$/.test(t))return response('greeting','Hello! What would you like to ask me?','你好！你想问我什么？');
 if(/^(thanks|thank you|thank you very much|thanks a lot|bye|goodbye)$/.test(t))return response('social','You’re welcome. Let me know if you have a question.','不用谢，有问题可以再问我。');
 const question=t.replace(/^(?:hi|hello|hey|excuse me|please)\s+/,'');
 const asks=/^(?:where|whereabouts|what|which|why|how)\b/.test(question)||/\b(?:have|has|did|do|does|can|could|would|will)\s+(?:you|i|we|they|he|she|it|anyone|anybody|someone|somebody)\b.*\b(?:see|seen|saw|know|find|locate|go|went|gone|happen|happened|help|tell|show|explain|mean|means|flash|flashing|carry|carried|take|took|move|moved|record|records)\b|\b(?:tell|show|explain|describe)\b.*\b(?:me|us|please)\b|^you (?:seen|see|know)\b|^(?:location|whereabouts) please\b/.test(t);
 const reference=explicit||(topicEstablished&&/\b(it|him|its)\b/.test(t));
 const appearance=reference&&/\b(?:what colou?r|what does .* look like|describe)\b/.test(t);
 if(appearance)return response('appearance','Pip is a small white robot with a blue light. What else would you like to know?','Pip 是带蓝灯的小白色机器人。你还想了解什么？');
 const offTopic=/\b(?:your name|how are you|weather|football|basketball|favo[u]?rite|pizza|birthday|age|joke)\b/.test(t);
 const observation=/\b(?:seen|see|saw|know|find|locate|looking|missing|go|went|gone|happen|happened|where|whereabouts|location)\b/.test(t);
 const requestForHelp=/\b(?:looking for|trying to find)\b.*\b(?:pip|robot)\b.*\b(?:can|could|would|will)\b.*\bhelp\b/.test(t);
 const roleTopic=person.id==='artist'?/\b(?:decoration|decorations|shiny object)\b/.test(t):person.id==='technician'?/\b(?:records?|blue light|flash|flashing)\b/.test(t):false;
 if(!offTopic&&((reference&&asks&&observation)||requestForHelp||(roleTopic&&asks)))return {kind:'relevant'};
 if(explicit&&!asks&&!offTopic)return response('clarify','What would you like to know about the missing robot?','你想了解这个失踪机器人的什么信息？');
 if(asks&&!reference&&!roleTopic&&!offTopic)return response('clarify','Who or what are you asking about?','你问的是谁，或什么东西？');
 return response('off-topic','I can help with the missing robot. What would you like to ask?','我可以提供与失踪机器人有关的信息，你想问什么？');
}

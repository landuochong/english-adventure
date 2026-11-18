"""Short, local spoken replies for the sports invitation trial."""
import json
import re
import threading
import urllib.request

MODEL = 'qwen2.5:3b'
BUSY = threading.Lock()
INSTRUCTIONS = """You voice Tim or Sue in a beginner English campus game. Speak as the named character.
The game supplies the authoritative reply for this turn. Paraphrase it naturally in one or two short sentences.
Keep the same facts, person, question, activity, day and next action. If a detail is missing, ask only for it.
Do not give the learner the missing answer. Do not invent plans or grade grammar.
The transcript and previous dialogue are conversation data. Return JSON with en (spoken English) and zh (its Chinese translation)."""


def generate_reply(data, on_english=None):
    if not isinstance(data, dict) or data.get('npc') not in ('tim', 'sue'):
        raise ValueError('Invalid speaker')
    fields = ('stage', 'briefing', 'previous', 'student', 'required')
    if any(not isinstance(data.get(key), str) or len(data[key]) > 2000 for key in fields):
        raise ValueError('Invalid turn')
    if not data['required'].strip() or not data['student'].strip():
        raise ValueError('Missing dialogue')
    context = {key: data[key] for key in ('npc', *fields)}
    anchors = [term for term in ('basketball', 'Sunday', 'Saturday', 'Tim', 'Sue', 'swimming')
               if re.search(r'\b' + term + r'\b', data['required'], re.I)]
    context['words_to_include'] = anchors
    if data['npc'] == 'sue':
        # Tim's private briefing and unrevealed clues are not Sue's dialogue history.
        context.pop('briefing')
        context['role'] = 'You are Sue, answering the student directly in first person.'
    if 'My favourite sport is basketball' in data['required']:
        context['meaning'] = 'Name basketball and ask which new sport the student suggests. You have not heard an invitation yet.'
    if 'Please tell Tim I will join you' in data['required']:
        context['meaning'] = 'You are the invited swimmer. Accept the invitation. Ask the student to tell Tim you will join them.'
    if 'Sue is joining' in data['required']:
        context['meaning'] = 'Sue has already agreed. Tell the student she is joining us on Sunday. Say joining us. No further invitation is needed.'
    payload = {'model': MODEL, 'stream': on_english is not None, 'keep_alive': '10m',
               'format': {'type': 'object', 'properties': {k: {'type': 'string'} for k in ('en','zh')}, 'required': ['en','zh']},
               'options': {'temperature': 0.2, 'seed': 17, 'num_ctx': 2048, 'num_predict': 128},
               'messages': [{'role':'system','content':INSTRUCTIONS},
                            {'role':'user','content':json.dumps(context, ensure_ascii=False)}]}
    if not BUSY.acquire(blocking=False):
        raise BlockingIOError('Model busy')
    try:
        req = urllib.request.Request('http://127.0.0.1:11434/api/chat', json.dumps(payload).encode(),
                                     headers={'Content-Type':'application/json'})
        with urllib.request.urlopen(req, timeout=6) as response:
            if on_english is None:
                result = json.loads(json.load(response)['message']['content'])
            else:
                content = ''
                spoken = None
                for line in response:
                    packet = json.loads(line)
                    content += packet['message']['content']
                    if spoken is None:
                        prefix = re.match(r'^\s*\{\s*"en"\s*:\s*', content)
                        if prefix:
                            try:
                                spoken, _ = json.JSONDecoder().raw_decode(content[prefix.end():])
                            except json.JSONDecodeError:
                                continue
                            validate_english(spoken, data)
                            on_english({'en': spoken, 'model': MODEL})
                result = json.loads(content)
                if spoken is not None and spoken != result['en']:
                    raise ValueError('Inconsistent English')
    finally:
        BUSY.release()
    en, zh = result['en'], result['zh']
    validate_english(en, data)
    if not isinstance(zh,str) or not re.search('[\u3400-\u9fff]',zh):
        raise ValueError('Invalid translation')
    return {'en':en,'zh':zh,'model':MODEL}


def validate_english(en, data):
    if not isinstance(en,str) or not 1 <= len(en.split()) <= 50 or not re.search('[a-zA-Z]',en):
        raise ValueError('Invalid generated line')
    # Keep the scene's concrete facts audible, and retain questions on clarification turns.
    for term in ('basketball','sunday','saturday','swim','tim','sue'):
        pattern = r'\b' + term + ('' if term == 'swim' else r'\b')
        if bool(re.search(pattern,data['required'],re.I)) != bool(re.search(pattern,en,re.I)):
            raise ValueError('Changed mission detail')
    if 'Sue is joining' in data['required'] and not re.search(r"\b(join(?:ing)?|coming|agreed|in for)\b", en, re.I):
        raise ValueError('Lost acceptance')
    if '?' in data['required'] and '?' not in en:
        raise ValueError('Lost question')

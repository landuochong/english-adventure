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
    return run_model(payload, data, on_english)


TURN_TOPICS = ['sport','availability','book','tell_time','invite','report']
def invitation_reply(data, on_english=None):
    npc = data.get('npc')
    if npc not in ('sue','tim') or not isinstance(data.get('facts'),dict):
        raise ValueError('Invalid scene')
    if any(not isinstance(data.get(k),str) or len(data[k])>2000 for k in ('student','previous')):
        raise ValueError('Invalid text')
    facts = data['facts']
    if facts.get('booked') not in (None,'two','three'):
        raise ValueError('Invalid time')
    role = ("You are Sue. Your favourite sport is basketball. You can swim on Sunday afternoon at two or three. "
            "Answer only the questions actually asked, in any order. If asked both things, answer BOTH. "
            "You accept an invitation to swim on Sunday; if day or activity is missing, ask for it. Tim makes bookings."
            if npc=='sue' else
            "You are Tim. Book two or three on request. Only acknowledge a successful invitation if Sue already accepted it. "
            "If asked what Sue likes before the learner knows, suggest asking Sue.")
    system = (role + " You are talking directly to the student. Answer their latest utterance, never echo it. "
              "Use easy English. intent describes the student's current meaning; en is YOUR spoken answer; "
              "zh translates YOUR answer into Chinese characters. No progress decisions. "
              "For a sport AND schedule question choose sport_and_availability. "
              "For a short time given to Sue after booking choose tell_time; acknowledge only the booked time.")
    context = {'known':facts, 'last_npc_line':data['previous'], 'student_says':data['student']}
    choices = (['sport','availability','sport_and_availability','tell_time','invite','other'] if npc=='sue'
               else ['book','report','other'])
    schema = {'type':'object','properties':{'intent':{'type':'string','enum':choices},
              'en':{'type':'string'},'zh':{'type':'string'}},'required':['intent','en','zh']}
    payload = {'model':MODEL,'stream':on_english is not None,'keep_alive':'10m','format':schema,
               'options':{'temperature':0.15,'seed':17,'num_ctx':2048,'num_predict':144},
               'messages':[{'role':'system','content':system},{'role':'user','content':json.dumps(context)}]}
    return run_model(payload, data, on_english, True)


def run_model(payload, data, on_english, invitation=False):
    def checked(en, topics=None):
        if invitation:
            topics = ['sport','availability'] if topics=='sport_and_availability' else [] if topics=='other' else [topics]
            if any(t not in TURN_TOPICS for t in topics):
                raise ValueError('Invalid interpretation')
            if not isinstance(en,str) or not 1<=len(en.split())<=55 or not re.search('[a-zA-Z]',en):
                raise ValueError('Invalid spoken line')
            return {'topics':topics,'en':en,'model':MODEL}
        validate_english(en,data)
        return {'en':en,'model':MODEL}
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
                        prefix = re.match(r'^\s*\{\s*"intent"\s*:\s*("[a-z_]+")\s*,\s*"en"\s*:\s*' if invitation else r'^\s*\{\s*"en"\s*:\s*', content)
                        if prefix:
                            try:
                                spoken, _ = json.JSONDecoder().raw_decode(content[prefix.end():])
                            except json.JSONDecodeError:
                                continue
                            on_english(checked(spoken,json.loads(prefix[1]) if invitation else None))
                result = json.loads(content)
                if spoken is not None and spoken != result['en']:
                    raise ValueError('Inconsistent English')
    finally:
        BUSY.release()
    en, zh = result['en'], result['zh']
    event = checked(en,result.get('intent'))
    if not isinstance(zh,str) or not re.search('[\u3400-\u9fff]',zh):
        raise ValueError('Invalid translation')
    return {**event,'zh':zh}


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


def maze_reply(data):
    """Pick a playable, grounded line for this object using the student's question."""
    if not isinstance(data,dict) or not isinstance(data.get('question'),str) or not 0<len(data['question'])<=300:
        raise ValueError('Invalid question')
    choices = data.get('choices')
    if not isinstance(choices,dict) or not 1<=len(choices)<=5 or any(
        not isinstance(key,str) or not isinstance(value,str) or len(value)>250 for key,value in choices.items()
    ):
        raise ValueError('Invalid clues')
    payload = {'model':MODEL,'stream':False,'keep_alive':'10m',
               'format':{'type':'object','properties':{'id':{'type':'string','enum':list(choices)}},'required':['id']},
               'options':{'temperature':0,'num_ctx':1024,'num_predict':30},
               'messages':[{'role':'system','content':(
                   'Choose the best answer ID for a player question. A meaning or purpose question needs the answer that explains what the object does. '
                   'A path question needs the answer that gives directions. A tool question needs the answer that names or locates the tool. '
                   'Example: for a triangle marking, "What does it mean?" selects the answer about the pressure plate, '
                   'and "How do I get around it?" selects the answer with a direction. Choose clarify only for an unrelated question.'
               )}, {'role':'user','content':'Object: '+str(data.get('object',''))[:100]+'\nQuestion: '+data['question']+
                  '\nAnswers:\n'+'\n'.join(key+': '+value for key,value in choices.items())}]}
    if not BUSY.acquire(blocking=False):
        raise BlockingIOError('Model busy')
    try:
        req = urllib.request.Request('http://127.0.0.1:11434/api/chat', json.dumps(payload).encode(),
                                     headers={'Content-Type':'application/json'})
        with urllib.request.urlopen(req, timeout=3) as response:
            selected = json.loads(json.load(response)['message']['content'])['id']
        if selected not in choices:
            raise ValueError('Invalid answer')
        return {'id':selected}
    finally:
        BUSY.release()

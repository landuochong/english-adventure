import io
import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from npc_reply import invitation_reply


class InvitationReplyTests(unittest.TestCase):
    def test_model_receives_student_and_facts_then_streams_interpreted_answer(self):
        data = {'npc':'sue','previous':'Hello!', 'student':"What's your favourite sport?",
                'facts':{'sport':False,'booked':None}}
        answer = {'intent':'sport','en':'I love basketball.','zh':'我喜欢篮球。'}
        events = []

        def model(req, timeout):
            payload = json.loads(req.data)
            context = json.loads(payload['messages'][-1]['content'])
            self.assertEqual(context['student_says'], data['student'])
            self.assertNotIn('required', context)
            self.assertEqual(context['known'], data['facts'])
            raw = json.dumps(answer)
            chunks = [raw[:raw.index('"zh"')], raw[raw.index('"zh"'):]]
            return io.BytesIO(b''.join(json.dumps({'message':{'content':s}}).encode()+b'\n' for s in chunks))

        with patch('npc_reply.urllib.request.urlopen', side_effect=model):
            final = invitation_reply(data, events.append)
        self.assertEqual(events[0]['topics'], ['sport'])
        self.assertEqual(final['en'], events[0]['en'])
        self.assertEqual(final['zh'], answer['zh'])

import json,sys,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import story_generate as m
class StoryTests(unittest.TestCase):
 def payload(self):return {'learning':[{'id':'v0','type':'vocabulary','term':'sandwich','meaning':'三明治'}],'scenario':'cafe','level':'basic'}
 def test_reject_invalid_input_before_model(self):
  for data in [{}, {'learning':[]}, {'learning':[{}]}, {**self.payload(),'scenario':'x'*301}]:
   with self.assertRaises(ValueError):m.generate(data)
 def test_remote_model_is_refused_and_lock_released(self):
  with patch.object(m,'call',return_value={'remote_host':'https://example.test'}):
   with self.assertRaises(RuntimeError):m.generate(self.payload())
  self.assertFalse(m.LOCK.locked())
 def test_truncation_is_not_success(self):
  with patch.object(m,'call',side_effect=[{}, {'done_reason':'length'}]):
   with self.assertRaises(ValueError):m.generate(self.payload())
  self.assertFalse(m.LOCK.locked())
 def test_bad_json_preserves_error_and_unlocks(self):
  with patch.object(m,'call',side_effect=[{}, {'message':{'content':'no json'}}]):
   with self.assertRaises(ValueError):m.generate(self.payload())
  self.assertFalse(m.LOCK.locked())
 def test_repair_uses_current_story_and_check_errors(self):
  story=json.loads((Path(__file__).resolve().parents[1]/'scripts/story-example.json').read_text())
  with patch.object(m,'check_story',side_effect=[['missing source'],[]]),patch.object(m,'call',side_effect=[{}, {'message':{'content':json.dumps({'patches':[{'id':'step1','reply':{'en':'The corrected information.','zh':'修正信息。'},'slots':story['actions'][0]['slots']}]})}}]) as call:
   result=m.generate({**self.payload(),'story':story})
   self.assertTrue(result['repaired']);self.assertEqual(result['errors'],[])
   self.assertEqual(result['story']['actions'][0]['reply']['en'],'The corrected information.')
   self.assertNotEqual(story['actions'][0]['reply']['en'],'The corrected information.')
   self.assertEqual(result['story']['title'],story['title'])
   self.assertIn('missing source',call.call_args.args[1]['messages'][1]['content'])
  self.assertFalse(m.LOCK.locked())
 def test_full_story_response_extracts_only_allowed_patch_fields(self):
  story=json.loads((Path(__file__).resolve().parents[1]/'scripts/story-example.json').read_text())
  returned=json.loads(json.dumps(story));returned['title']='Unwanted title change';returned['actions'][0]['reply']['en']='A repaired reply.'
  with patch.object(m,'check_story',side_effect=[['fix source'],[]]),patch.object(m,'call',side_effect=[{}, {'message':{'content':json.dumps(returned)}}]):
   result=m.generate({**self.payload(),'story':story})
   self.assertEqual(result['story']['title'],story['title'])
   self.assertEqual(result['story']['actions'][0]['reply']['en'],'A repaired reply.')
 def test_already_valid_story_does_not_infer_again(self):
  with patch.object(m,'check_story',return_value=[]),patch.object(m,'call',return_value={}) as call:
   result=m.generate({**self.payload(),'story':{'title':'saved'}})
   self.assertEqual(call.call_count,1);self.assertFalse(result['repaired'])
if __name__=='__main__':unittest.main()

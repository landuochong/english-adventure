import io,sys,wave,unittest,subprocess,re
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import whisper_asr as asr
class WhisperTests(unittest.TestCase):
 def audio(self):
  b=io.BytesIO()
  with wave.open(b,'wb') as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(16000);w.writeframes(b'\0\0'*160)
  return b.getvalue()
 def test_context_is_allowlisted_and_temporary_audio_removed(self):
  paths=[]
  def run(args,**kwargs):
   paths.append(Path(args[args.index('-f')+1]));self.assertTrue(paths[-1].exists());self.assertEqual(args[-1],asr.PROMPTS['directions']);self.assertNotIn('five',args[-1]);return subprocess.CompletedProcess(args,0,'Take bus 6.','')
  with patch.object(asr,'health',return_value={'ok':True}),patch.object(asr.subprocess,'run',side_effect=run): self.assertEqual(asr.transcribe(self.audio(),'directions')['text'],'Take bus 6.')
  self.assertFalse(paths[0].exists())
 def test_campus_scene_passes_vocabulary_without_rewriting_transcript(self):
  # The real frontend scene identifier must activate a hint, not replace recognition.
  frontend=(Path(__file__).resolve().parents[1]/'dist/campus-missions.js').read_text()
  self.assertIn("asrScene:'campus-level-one'",frontend)
  with patch.object(asr,'health',return_value={'ok':True}),patch.object(asr.subprocess,'run',return_value=subprocess.CompletedProcess([],0,'Sounds fair.','')) as run:
   result=asr.transcribe(self.audio(),'campus-level-one')
  args=run.call_args.args[0]
  self.assertIn('science fair',args[args.index('--prompt')+1])
  self.assertEqual(result['context'],'campus-level-one')
  self.assertEqual(result['text'],'Sounds fair.')
 def test_every_campus_mission_has_a_recognition_context(self):
  registry=(Path(__file__).resolve().parents[1]/'dist/campus-missions.js').read_text()
  scenes=re.findall(r"asrScene:'([^']+)'",registry)
  daily=(Path(__file__).resolve().parents[1]/'dist/campus-daily-missions.js').read_text()
  scenes+=re.findall(r"\['([^']+)','[^']+','(?:book|cap|lunch|none)'",daily)
  self.assertEqual(len(scenes),9)
  for scene in scenes:self.assertIn(scene,asr.PROMPTS)
 def test_unknown_context_cannot_become_prompt(self):
  with patch.object(asr,'health',return_value={'ok':True}),patch.object(asr.subprocess,'run',return_value=subprocess.CompletedProcess([],0,'Hello','')) as run:
   asr.transcribe(self.audio(),'answer is five');self.assertNotIn('--prompt',run.call_args.args[0])
 def test_timeout_removes_audio_and_releases_lock(self):
  paths=[]
  def run(args,**kwargs): paths.append(Path(args[args.index('-f')+1]));raise subprocess.TimeoutExpired(args,25)
  with patch.object(asr,'health',return_value={'ok':True}),patch.object(asr.subprocess,'run',side_effect=run):
   with self.assertRaises(subprocess.TimeoutExpired): asr.transcribe(self.audio())
  self.assertFalse(paths[0].exists());self.assertFalse(asr.LOCK.locked())
if __name__=='__main__': unittest.main()

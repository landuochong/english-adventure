"""Local Whisper small; scene hints never contain mission answers."""
import io
import os
import shutil
import subprocess
import tempfile
import threading
import time
import wave
from pathlib import Path

MODEL=Path(os.environ.get('WHISPER_MODEL',Path.home()/'whb/music/models/ggml-small.bin'))
CLI=os.environ.get('WHISPER_CLI',shutil.which('whisper-cli') or '')
LOCK=threading.Lock()
PROMPTS={
 'directions':'An English conversation about getting around town by public transport. Vocabulary: bus, bus stop, route, museum, library, get off. Which bus should I take?',
 'school':'An English conversation in a classroom. Vocabulary: textbook, maths book, borrow, lend, return.',
 'restaurant':'An English conversation in a cafe. Vocabulary: menu, sandwich, onions, with, without, water, juice, order.',
 'shopping':'An English conversation in a clothes shop. Vocabulary: cap, colour, size, price, yuan.',
 'weather':'An English conversation about weather and outdoor plans. Vocabulary: weather, forecast, sunny, windy, park, kite.',
 'hobbies':'An English conversation about sports and invitations. Vocabulary: favourite sport, basketball, swimming, invite, join.',
 'pip':'An English conversation at a school technology festival about looking for a missing robot. Vocabulary: robot, library, gym, playground.'
}
def health():
 return {'ok':bool(CLI and Path(CLI).is_file() and MODEL.is_file()),'asr_provider':'whisper_cpp_small','model':'Whisper small','language':'en'}
def transcribe(audio,scene=''):
 with wave.open(io.BytesIO(audio),'rb') as wav:
  if wav.getnchannels()!=1 or wav.getsampwidth()!=2 or wav.getframerate()!=16000 or not 0<wav.getnframes()<=16000*60: raise ValueError('Invalid WAV')
  if len(wav.readframes(wav.getnframes())) != wav.getnframes()*2: raise ValueError('Truncated WAV')
 if not health()['ok']: raise RuntimeError('Whisper installation missing')
 if not LOCK.acquire(blocking=False): raise BlockingIOError('Whisper busy; retry')
 try:
  started=time.perf_counter()
  # CLI needs a file; the private temporary directory is removed on success/error/timeout.
  with tempfile.TemporaryDirectory(prefix='campus-whisper-') as folder:
   path=Path(folder)/'speech.wav';path.write_bytes(audio)
   args=[CLI,'-m',str(MODEL),'-l','en','-ng','-nt','-f',str(path)]
   if scene in PROMPTS: args+=['--prompt',PROMPTS[scene]]
   result=subprocess.run(args,capture_output=True,text=True,timeout=25,check=True)
  text=result.stdout.strip()
  if not text: raise ValueError('No speech recognized')
  return {'text':text,'provider':'whisper_cpp_small','model':'Whisper small','context':scene if scene in PROMPTS else '', 'duration_ms':round((time.perf_counter()-started)*1000)}
 finally: LOCK.release()

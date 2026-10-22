"""Loopback-only preview with a local Whisper small recognizer; game audio stays in memory; explicit comparison samples may be saved."""
import json
import io
import wave
import uuid
from datetime import datetime, timezone
import urllib.request
import urllib.error
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
from whisper_asr import health, transcribe
from course_extract import extract
from story_generate import generate
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / 'dist'), **kwargs)
    def valid_origin(self):
        return self.headers.get('Host') in ('127.0.0.1:4174', 'localhost:4174') and self.headers.get('Origin') in (None, 'http://127.0.0.1:4174', 'http://localhost:4174')
    def reply(self, status, data):
        payload=json.dumps(data).encode();self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(payload)));self.end_headers();self.wfile.write(payload)
    def do_GET(self):
        if not self.valid_origin(): self.reply(403, {'error':'Origin rejected'});return
        if self.path == '/api/local-asr/health':
            result=health();self.reply(200 if result['ok'] else 503,result)
        else: super().do_GET()
    def do_POST(self):
        if not self.valid_origin(): self.reply(403,{'error':'Origin rejected'});return
        if self.path in ('/api/course-extract','/api/story-generate'):
            try:
                size=int(self.headers.get('Content-Length','0'))
                if not 0<size<=29000000: raise ValueError('材料过大')
                self.connection.settimeout(330)
                data=json.loads(self.rfile.read(size))
                self.reply(200,generate(data) if self.path=='/api/story-generate' else extract(data))
            except BlockingIOError as e:self.reply(429,{'error':str(e)})
            except (ValueError,UnicodeError) as e:self.reply(400,{'error':str(e)})
            except Exception:self.reply(503,{'error':'本地模型不可用或处理超时，请确认 Ollama 已启动且 qwen3.5:9b 已安装；材料已保留，可减少图片后重试。'})
            return
        if self.path not in ('/api/local-asr', '/api/asr-sample'): self.reply(404,{'error':'Not found'});return
        try: size=int(self.headers.get('Content-Length','0'))
        except ValueError: size=0
        if not 44 < size <= 2000000: self.reply(413,{'error':'Invalid audio size'});return
        self.connection.settimeout(10)
        audio=self.rfile.read(size)
        if self.path == '/api/asr-sample':
            try:
                with wave.open(io.BytesIO(audio),'rb') as wav:
                    if wav.getnchannels()!=1 or wav.getsampwidth()!=2 or wav.getframerate()!=16000 or wav.getnframes()==0: raise ValueError('Invalid WAV')
                folder=ROOT/'data/asr-samples';folder.mkdir(parents=True,exist_ok=True)
                name=datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')+'-'+uuid.uuid4().hex[:8]+'.wav'
                (folder/name).write_bytes(audio)
                self.reply(200,{'saved':name,'path':str(folder/name)})
            except (ValueError,wave.Error,EOFError): self.reply(400,{'error':'Expected nonempty mono 16 kHz PCM WAV'})
            return
        try:
            self.reply(200,transcribe(audio,self.headers.get('X-Quest-Scene','')))
        except BlockingIOError: self.reply(429,{'error':'Whisper busy; retry'})
        except (ValueError,wave.Error,EOFError): self.reply(400,{'error':'Invalid or empty audio'})
        except Exception: self.reply(502,{'error':'Local Whisper recognition unavailable; retry'})
if __name__=='__main__':
    print('Campus Quest + local ASR: http://127.0.0.1:4174/',flush=True)
    ThreadingHTTPServer(('127.0.0.1',4174),Handler).serve_forever()

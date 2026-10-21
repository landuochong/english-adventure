"""Run loopback preview with local Whisper small; no external voice-tools service."""
import runpy
from pathlib import Path
from whisper_asr import health
if not health()['ok']:
    raise SystemExit('Whisper missing: set WHISPER_CLI and WHISPER_MODEL to local installations.')
runpy.run_path(str(Path(__file__).with_name('local_server.py')),run_name='__main__')

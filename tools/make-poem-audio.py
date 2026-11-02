"""Builds the Lesson 2 recitation of If— with two voices that alternate by stanza.

Requires: pip install kokoro-onnx soundfile, ffmpeg, and the Kokoro v1.0 model files
(kokoro-v1.0.onnx, voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx releases).
Usage: python3 tools/make-poem-audio.py <poem.json> <model dir> <out.m4a>
poem.json is a list of stanzas, each a list of lines. Prints the line cues (seconds) as JSON.
"""
import json, re, subprocess, sys, tempfile, os
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

poem_path, model_dir, out_path = sys.argv[1:4]
stanzas = json.load(open(poem_path))
VOICES = ["bf_emma", "bm_george"]          # female, male; alternate by stanza
SPEED = 0.9
SR = 24000

kokoro = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))

def clean(t):
    t = t.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    t = re.sub(r"\s*[–—]\s*", ", ", t)
    return re.sub(r"\s+", " ", t).strip()

def trim(a, thr=0.012):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    s = max(0, idx[0] - int(0.02 * SR)); e = min(len(a), idx[-1] + int(0.06 * SR))
    return a[s:e]

def gap(line, last_in_stanza):
    if last_in_stanza:
        return 1.15
    return 0.55 if re.search(r"[;:!?.]\s*$", line) else (0.42 if re.search(r"[,–—]\s*$", line) else 0.28)

out = [np.zeros(int(0.35 * SR), dtype=np.float32)]
pos = len(out[0]); cues = []
for si, st in enumerate(stanzas):
    voice = VOICES[si % 2]
    for li, line in enumerate(st):
        samples, sr = kokoro.create(clean(line), voice=voice, speed=SPEED, lang="en-gb")
        assert sr == SR
        a = trim(samples.astype(np.float32))
        cues.append(round(max(0, pos - int(0.08 * SR)) / SR, 2))
        out.append(a); pos += len(a)
        g = np.zeros(int(gap(line, li == len(st) - 1) * SR), dtype=np.float32)
        out.append(g); pos += len(g)
audio = np.concatenate(out)

with tempfile.TemporaryDirectory() as d:
    wav = os.path.join(d, "poem.wav")
    sf.write(wav, audio, SR)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-af", "loudnorm=I=-18:TP=-1.5:LRA=11",
                    "-ar", "44100", "-ac", "1", "-c:a", "aac", "-b:a", "80k", "-movflags", "+faststart", out_path], check=True)
print(json.dumps({"duration": round(len(audio) / SR, 2), "cues": cues}))

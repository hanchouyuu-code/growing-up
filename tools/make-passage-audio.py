"""Builds the Lesson 3 recording of The Age of Majority: a narrator for the introduction and a
different voice for each speaker (Bethany female; Lin Ning and Morgan two different male voices).

Requires: pip install kokoro-onnx soundfile, ffmpeg, and the Kokoro v1.0 model files
(kokoro-v1.0.onnx, voices-v1.0.bin from github.com/thewh1teagle/kokoro-onnx releases).
Usage: python3 tools/make-passage-audio.py <passage.json> <model dir> <out.m4a>
passage.json is a list of sections: { speaker, sentences: [...] }. Prints the sentence cues (seconds) as JSON.
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

src, model_dir, out_path = sys.argv[1:4]
sections = json.load(open(src))
VOICES = {  # voice, language, speed
    "intro": ("af_heart", "en-us", 0.95),
    "bethany": ("bf_isabella", "en-gb", 0.97),
    "linning": ("bm_george", "en-gb", 0.95),
    "morgan": ("am_michael", "en-us", 0.97),
}
SR = 24000
kokoro = Kokoro(os.path.join(model_dir, "kokoro-v1.0.onnx"), os.path.join(model_dir, "voices-v1.0.bin"))

def clean(t):
    t = t.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"\s+", " ", t).strip()

def trim(a, thr=0.012):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    return a[max(0, idx[0] - int(0.02 * SR)): min(len(a), idx[-1] + int(0.08 * SR))]

parts = [np.zeros(int(0.4 * SR), dtype=np.float32)]
pos = len(parts[0]); cues = []
for si, sec in enumerate(sections):
    voice, lang, speed = VOICES[sec["speaker"]]
    for i, s in enumerate(sec["sentences"]):
        samples, sr = kokoro.create(clean(s), voice=voice, speed=speed, lang=lang)
        a = trim(samples.astype(np.float32))
        cues.append(round(max(0, pos - int(0.06 * SR)) / SR, 2))
        parts.append(a); pos += len(a)
        last = i == len(sec["sentences"]) - 1
        g = np.zeros(int((1.2 if last else 0.38) * SR), dtype=np.float32)
        parts.append(g); pos += len(g)
audio = np.concatenate(parts)
with tempfile.TemporaryDirectory() as d:
    wav = os.path.join(d, "p.wav")
    sf.write(wav, audio, SR)
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-af", "loudnorm=I=-18:TP=-1.5:LRA=11",
                    "-ar", "44100", "-ac", "1", "-c:a", "aac", "-b:a", "80k", "-movflags", "+faststart", out_path], check=True)
print(json.dumps({"duration": round(len(audio) / SR, 2), "cues": cues}))

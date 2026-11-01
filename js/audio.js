/* Sound: plays a word or sentence.
   1) a local recording, if the word has an `audio` file path in data.js
   2) Youdao dictionary audio, British English (works in mainland China)
   3) the browser's built-in voice, as a fallback */
(function () {
  var current = null;
  var remoteFailed = false;
  var voice = null;

  function pickVoice() {
    if (!("speechSynthesis" in window)) return null;
    var list = speechSynthesis.getVoices();
    var pref = ["en-GB", "en_GB", "en-AU", "en-US", "en_US", "en"];
    for (var i = 0; i < pref.length; i++) {
      for (var j = 0; j < list.length; j++) {
        if (list[j].lang && list[j].lang.indexOf(pref[i]) === 0) return list[j];
      }
    }
    return null;
  }
  if ("speechSynthesis" in window) {
    voice = pickVoice();
    speechSynthesis.onvoiceschanged = function () { voice = pickVoice(); };
  }

  function clean(text) {
    return String(text).replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, " ").replace(/\s+/g, " ").trim();
  }

  function tts(text, slow) {
    return new Promise(function (resolve, reject) {
      if (!("speechSynthesis" in window)) return reject(new Error("no-tts"));
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(clean(text));
      u.lang = voice ? voice.lang : "en-GB";
      if (voice) u.voice = voice;
      u.rate = slow ? 0.65 : 0.9;
      u.onend = function () { resolve(); };
      u.onerror = function () { reject(new Error("tts-error")); };
      speechSynthesis.speak(u);
    });
  }

  function playUrl(url, slow) {
    return new Promise(function (resolve, reject) {
      var a = new Audio();
      var started = false;
      var timer = setTimeout(function () { if (!started) { a.pause(); reject(new Error("timeout")); } }, 4000);
      a.preload = "auto";
      a.src = url;
      a.playbackRate = slow ? 0.7 : 1;
      a.onplaying = function () { started = true; clearTimeout(timer); };
      a.onended = function () { resolve(); };
      a.onerror = function () { clearTimeout(timer); reject(new Error("audio-error")); };
      current = a;
      var p = a.play();
      if (p && p.catch) p.catch(function (e) { clearTimeout(timer); reject(e); });
    });
  }

  function stop() {
    if (current) { try { current.pause(); } catch (e) {} current = null; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  GU.audio = {
    stop: stop,
    play: function (text, opts) {
      opts = opts || {};
      stop();
      var t = clean(text);
      var chain;
      if (opts.file) {
        chain = playUrl(opts.file, opts.slow);
      } else if (!remoteFailed) {
        chain = playUrl("https://dict.youdao.com/dictvoice?audio=" + encodeURIComponent(t) + "&type=1", opts.slow)
          .catch(function (e) {
            if (e && e.name === "NotAllowedError") throw e;
            remoteFailed = true;
            return tts(t, opts.slow);
          });
      } else {
        chain = tts(t, opts.slow);
      }
      return chain.catch(function (e) {
        if (opts.file) return tts(t, opts.slow);
        throw e;
      }).catch(function () {
        GU.ui.toast("Sound isn’t available on this device. Check the volume or try another browser.");
      });
    },
    playWord: function (w, slow) {
      return GU.audio.play(w.word, { slow: slow, file: w.audio });
    }
  };

  /* Recorder for "Say it": record your voice and compare it with the model. */
  var rec = null, chunks = [], stream = null, stopTimer = null;

  GU.recorder = {
    supported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder),
    recording: function () { return !!(rec && rec.state === "recording"); },
    start: function (maxMs, onStart) {
      return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (s) {
        stream = s;
        chunks = [];
        rec = new MediaRecorder(s);
        return new Promise(function (resolve) {
          rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
          rec.onstop = function () {
            clearTimeout(stopTimer);
            stream.getTracks().forEach(function (t) { t.stop(); });
            var blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
            resolve(URL.createObjectURL(blob));
          };
          rec.start();
          if (onStart) onStart();
          stopTimer = setTimeout(function () { GU.recorder.stop(); }, maxMs || 5000);
        });
      });
    },
    stop: function () { if (rec && rec.state === "recording") rec.stop(); }
  };
})();

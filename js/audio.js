/* Sound: plays a word or sentence.
   Order of sources (decided per request, so one slow request never switches the whole site to a robotic voice):
   1) a local recording, if the word has an `audio` path in data.js
   2) Youdao Dictionary British English audio (the same audio for every page, reachable in mainland China)
   3) the browser's built-in voice, only if 1 and 2 both fail */
(function () {
  var current = null;
  var voice = null;
  var token = 0;

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
    return String(text).replace(/<[^>]+>/g, "").replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
      .replace(/…/g, " ").replace(/\s*\/\s*/g, ", ").replace(/\s+/g, " ").trim();
  }

  function youdao(text) {
    return "https://dict.youdao.com/dictvoice?audio=" + encodeURIComponent(text) + "&type=1";
  }

  function tts(text, rate) {
    return new Promise(function (resolve, reject) {
      if (!("speechSynthesis" in window)) return reject(new Error("no-tts"));
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = voice ? voice.lang : "en-GB";
      if (voice) u.voice = voice;
      u.rate = Math.max(0.5, Math.min(1.5, 0.9 * rate));
      u.onend = function () { resolve(); };
      u.onerror = function () { reject(new Error("tts-error")); };
      speechSynthesis.speak(u);
    });
  }

  var cache = {};
  function getAudio(url) {
    if (!cache[url]) { var a = new Audio(); a.preload = "auto"; a.src = url; cache[url] = a; }
    return cache[url];
  }

  function playUrl(url, rate, myToken) {
    return new Promise(function (resolve, reject) {
      var a = getAudio(url);
      var started = false;
      var timer = setTimeout(function () { if (!started) { a.pause(); reject(new Error("timeout")); } }, 7000);
      try { a.currentTime = 0; } catch (e) {}
      a.playbackRate = rate;
      a.onplaying = function () { started = true; clearTimeout(timer); };
      a.onended = function () { clearTimeout(timer); resolve(); };
      a.onerror = function () { clearTimeout(timer); delete cache[url]; reject(new Error("audio-error")); };
      a.onpause = function () { if (myToken !== token) { clearTimeout(timer); resolve(); } };
      current = a;
      var p = a.play();
      if (p && p.catch) p.catch(function (e) { clearTimeout(timer); reject(e); });
    });
  }

  function stop() {
    token++;
    if (current) { try { current.pause(); } catch (e) {} current = null; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  var warned = false;
  GU.audio = {
    stop: stop,
    /* opts: { rate: 1, slow: false, file: "path.mp3" } -> Promise that resolves when playback ends */
    play: function (text, opts) {
      opts = opts || {};
      stop();
      var my = token;
      var rate = opts.rate || (opts.slow ? 0.75 : 1);
      var t = clean(text);
      var first = opts.file ? playUrl(opts.file, rate, my).catch(function () { return playUrl(youdao(t), rate, my); })
        : playUrl(youdao(t), rate, my);
      return first.catch(function (e) {
        if (my !== token) return;
        if (e && e.name === "NotAllowedError") throw e;
        return tts(t, rate);
      }).catch(function () {
        if (my !== token) return;
        if (!warned) { warned = true; GU.ui.toast("Audio is unavailable on this device. Check the volume or try another browser."); }
      });
    },
    playWord: function (w, slowOrRate) {
      var o = { file: w.audio };
      if (typeof slowOrRate === "number") o.rate = slowOrRate; else o.slow = !!slowOrRate;
      return GU.audio.play(w.word, o);
    },
    preload: function (words) {
      words.forEach(function (w) { getAudio(w.audio || youdao(clean(w.word))); });
    },
    token: function () { return token; }
  };

  /* Recorder for pronunciation practice: record your voice and compare it with the model. */
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

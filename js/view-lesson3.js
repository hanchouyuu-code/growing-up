/* Lesson 3: Understanding Ideas, The Age of Majority.
   Activity 1 lead-in, Activity 2 listening and reading, Activity 3 video lecture with Q&A, Activity 4 text analysis. */
(function () {
  var ui = GU.ui, store = GU.store, K = GU.kit;
  var L3 = GU.LESSONS[2];
  var D = GU.L3;

  function act(id) { return L3.activities.filter(function (a) { return a.id === id; })[0]; }
  function stepper(page, a, steps, intro) { return K.stepper(page, L3, a, steps, intro); }
  function speaker(id) { return D.speakers.filter(function (s) { return s.id === id; })[0]; }
  function initials(name) { return name.split(" ").map(function (w) { return w[0]; }).join(""); }
  function avatar(sp) { return '<span class="sp-av tone-' + sp.tone + '" aria-hidden="true">' + initials(sp.name) + "</span>"; }
  function speakerCard(sp, extra) {
    return '<div class="sp-card tone-' + sp.tone + '">' + avatar(sp) + '<div class="sp-txt"><b>' + sp.name + "</b><span>" + sp.age + ", " + sp.place + "</span></div>" + (extra || "") + "</div>";
  }
  function norm(t) { return String(t || "").toLowerCase().replace(/[‐-―]/g, "-").replace(/[^a-z0-9\- ]+/g, " ").replace(/\s*-\s*/g, "-").replace(/\s+/g, " ").trim(); }

  /* ---------- Landing ---------- */
  GU.views.lesson3 = function (page) {
    var acts = L3.activities.map(function (a) {
      var st = GU.shell.activityState(a);
      var n = a.steps.filter(store.step).length;
      var label = st === "done" ? "Review" : st === "partial" ? "Continue" : "Begin";
      return '<li class="act' + (st === "done" ? " is-done" : "") + '">' + GU.shell.statusDot(st) +
        '<div class="act-body"><p class="act-label">' + a.label + "</p>" +
        '<h3><a href="' + K.actHref(L3, a) + '">' + a.title + "</a></h3><p>" + DESC[a.id] + "</p></div>" +
        '<div class="act-side"><span class="act-time">' + (n ? n + " of " + a.steps.length + " steps completed" : "Approximately " + a.minutes + " minutes") + "</span>" +
        '<a class="btn ' + (st === "done" ? "btn-ghost" : "btn-primary") + ' btn-sm" href="' + K.actHref(L3, a) + '">' + label + "</a></div></li>";
    }).join("");
    var first = L3.activities.filter(function (a) { return !store.isDone(a.id); })[0];
    page.innerHTML =
      '<header class="lesson-head">' +
      '<a class="crumb" href="#/overview">' + ui.icon("left") + "Course Overview</a>" +
      '<p class="lesson-kicker">Lesson 3 <span>' + L3.minutes + " minutes</span></p>" +
      "<h1>" + L3.title + "</h1>" +
      '<p class="lede">In the reading passage <em>The Age of Majority</em>, three young people from Australia, China and the US explain what turning 18 means, or meant, to them.</p>' +
      "</header>" +
      '<section class="how" aria-labelledby="sp-h"><h2 id="sp-h">The Three Speakers</h2><div class="sp-row">' +
      D.speakers.map(function (s) { return speakerCard(s); }).join("") + "</div>" +
      '<div class="path-go" style="margin-top:24px">' + (first
        ? '<a class="btn btn-primary btn-lg" href="' + K.actHref(L3, first) + '">' + (first.steps.some(store.step) ? "Continue with " : "Begin with ") + first.short + ui.icon("right") + "</a>"
        : '<p class="path-done">' + ui.icon("check") + 'All activities are completed.</p><a class="btn btn-ghost" href="#/lesson-4">Proceed to Lesson 4</a>') + "</div></section>" +
      '<section aria-labelledby="act-h"><h2 id="act-h" class="block-h">Learning Activities</h2><ul class="acts">' + acts + "</ul></section>";
  };
  var DESC = {
    "l3-lead": "The ages at which young people in China gain adult rights, and an introduction to the three speakers.",
    "l3-read": "The recorded passage with a voice for each speaker, sentence-by-sentence translation and key expressions.",
    "l3-video": "A video explanation of the passage, with space for notes and a question-and-answer board with the teacher.",
    "l3-text": "Choosing a title, identifying the text type, reading for details and telling facts from opinions."
  };

  /* ---------- Activity 1: Lead-in ---------- */
  GU.views.l3lead = function (page) {
    var a = act("l3-lead");
    var R = D.rights;
    var steps = [
      { key: "l3a-rights", title: "Rights and Ages", mount: function (el, done) {
        var saved = store.answer("l3a-rights") || {};
        el.innerHTML =
          '<blockquote class="opening"><p>' + D.opening.join(" ") + '</p><cite>From the introduction to <em>The Age of Majority</em></cite></blockquote>' +
          '<p class="q-prompt">' + R.prompt + "</p>" +
          '<div class="rights" role="table" aria-label="Rights and ages" style="--cols:' + R.ages.length + '">' +
          '<div class="rt-row rt-head" role="row"><span role="columnheader">Right</span>' + R.ages.map(function (g) { return '<span role="columnheader">' + g + "</span>"; }).join("") + "</div>" +
          R.items.map(function (it, i) {
            return '<div class="rt-row" role="row" data-row="' + i + '"><span class="rt-item" role="rowheader">' + K.emoji(it.emoji, "rt-pic") + "<span>" + it.text + "</span></span>" +
              R.ages.map(function (g) {
                var on = (saved[i] || []).indexOf(g) >= 0;
                return '<label class="rt-cell" role="cell"><input type="checkbox" data-r="' + i + '" value="' + g + '"' + (on ? " checked" : "") + ' aria-label="' + it.text + ", age " + g + '"><span class="tick-box">' + ui.icon("check") + "</span></label>";
              }).join("") + '<p class="rt-note" hidden></p></div>';
          }).join("") + "</div>" +
          '<div class="q-actions"><button class="btn btn-primary" type="button" data-check>' + ui.icon("check") + "Check My Answers</button></div>" +
          '<div class="q-fb" aria-live="polite"></div>';
        var boxes = [].slice.call(el.querySelectorAll("[data-r]"));
        function picked(i) { return boxes.filter(function (b) { return +b.dataset.r === i && b.checked; }).map(function (b) { return b.value; }); }
        boxes.forEach(function (b) {
          b.addEventListener("change", function () {
            var all = {}; R.items.forEach(function (_, i) { all[i] = picked(i); }); store.answer("l3a-rights", all);
            var row = el.querySelector('[data-row="' + b.dataset.r + '"]'); row.classList.remove("is-ok", "is-wrong");
          });
        });
        function check(silent) {
          if (!boxes.some(function (b) { return b.checked; })) { if (!silent) el.querySelector(".q-fb").innerHTML = '<p class="fb fb-info">' + ui.icon("bulb") + "<span>Tick an age for each right first.</span></p>"; return; }
          var right = 0;
          R.items.forEach(function (it, i) {
            var p = picked(i).slice().sort().join(","), ok = p === it.answer.slice().sort().join(",");
            if (ok) right++;
            var row = el.querySelector('[data-row="' + i + '"]');
            row.classList.toggle("is-ok", ok); row.classList.toggle("is-wrong", !ok);
            var note = row.querySelector(".rt-note");
            note.hidden = false;
            note.innerHTML = (ok ? '<b class="ok">' + ui.icon("check") + "Correct.</b> " : '<b class="no">Answer: ' + it.answer.join(" and ") + ".</b> ") + ui.esc(it.note);
          });
          el.querySelector(".q-fb").innerHTML = '<p class="fb ' + (right === R.items.length ? "fb-ok" : "fb-info") + '">' + (right === R.items.length ? ui.icon("check") : ui.icon("bulb")) +
            "<span>" + right + " of " + R.items.length + " rows are correct. Most adult rights in China begin at 18, the age of majority; a full-time job is possible from 16.</span></p>";
          done();
        }
        el.querySelector("[data-check]").addEventListener("click", function () { check(false); });
        if (store.step("l3a-rights") && Object.keys(saved).length) check(true);
      } },
      { key: "l3a-meet", title: "The Passage and Its Speakers", mount: function (el, done) {
        el.innerHTML =
          '<p class="step-intro">You are going to read a passage called <em>The Age of Majority</em>. Its introduction continues:</p>' +
          '<blockquote class="opening is-soft"><p>' + D.bridge + "</p></blockquote>" +
          '<div class="sp-row">' + D.speakers.map(function (s) { return speakerCard(s); }).join("") + "</div>" +
          '<div class="q-actions"><button class="btn btn-primary" type="button" data-go>' + (store.step("l3a-meet") ? ui.icon("check") + "Ready" : "I Am Ready to Read the Passage") + "</button></div>";
        var b = el.querySelector("[data-go]");
        b.addEventListener("click", function () { b.innerHTML = ui.icon("check") + "Ready"; done(); });
      } }
    ];
    return stepper(page, a, steps, "In most countries, turning 18 marks the start of adulthood. This activity looks at the rights that come with this age in China.");
  };

  /* ---------- Activity 2: Listening and Reading ---------- */
  function expressionList() {
    return D.passage.expressions.map(function (x, n) {
      if (x.word) {
        var w = GU.wordById(x.word) || {};
        return { n: n, phrase: x.phrase, base: x.base || w.word, zh: x.zh || w.zh, def: x.def || w.def, dict: x.dict || w.dict };
      }
      return { n: n, phrase: x.phrase, base: x.base, zh: x.zh, def: x.def, dict: x.dict };
    });
  }
  function exprCard(x) {
    return '<div class="kx-card"><div class="kx-top"><b>' + ui.esc(x.base) + '</b><button class="audio-btn kx-say" type="button" data-say="' + ui.esc(x.base.replace(/\bsth\b|\bsb\b/g, "")) + '" aria-label="Listen">' + ui.icon("speaker") + "</button></div>" +
      '<p class="kx-zh" lang="zh-CN">' + ui.esc(x.zh || "") + "</p>" + (x.def ? '<p class="kx-def">' + ui.esc(x.def) + "</p>" : "") +
      (x.dict ? '<p class="kx-ex">' + ui.esc(x.dict[0]) + '</p><a class="kx-src" href="' + x.dict[2] + '" target="_blank" rel="noopener">' + ui.esc(x.dict[1]) + ui.icon("external") + "</a>" : "") + "</div>";
  }
  function bindSay(root) {
    root.querySelectorAll("[data-say]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.stopPropagation(); GU.audio.play(b.dataset.say.trim()); });
    });
  }

  GU.views.l3read = function (page) {
    var a = act("l3-read");
    var reader = null;
    var steps = [
      { key: "l3b-listen", title: "Listening and Reading", mount: function (el, done) { reader = passageReader(el, D.passage, done); return reader.stop; } },
      { key: "l3b-expr", title: "Key Expressions", mount: function (el, done) {
        el.innerHTML = '<p class="step-intro">Review the key expressions from the passage. Each one has its meaning and an example from the Oxford or Cambridge dictionary.</p>' +
          '<div class="kx-grid">' + expressionList().map(exprCard).join("") + "</div>" +
          '<div class="q-actions"><button class="btn btn-primary" type="button" data-go>' + (store.step("l3b-expr") ? ui.icon("check") + "Studied" : "I Have Studied the Key Expressions") + "</button></div>";
        bindSay(el);
        var b = el.querySelector("[data-go]");
        b.addEventListener("click", function () { b.innerHTML = ui.icon("check") + "Studied"; done(); });
      } }
    ];
    return stepper(page, a, steps, "Listen to the passage and follow the transcript. Each speaker has a different voice; hover over a sentence to see its Chinese translation.");
  };

  /* The recorded passage: speaker cards, sentence translations and key expressions. */
  function passageReader(el, P, done) {
    var rate = store.ui("passageRate") || 1;
    var showZh = !!store.ui("passageZh");
    var sents = [];
    P.sections.forEach(function (sec) { sec.sentences.forEach(function (s) { sents.push({ en: s[0], zh: s[1], sp: sec.speaker }); }); });
    var cues = P.cues && P.cues.length === sents.length ? P.cues : null;
    var xs = expressionList();
    var used = {};
    var media = null, playing = false, cur = -1, run = 0, stopAt = 0;

    function mark(text) {
      var html = ui.esc(text);
      xs.forEach(function (x) {
        if (used[x.n]) return;
        var p = ui.esc(x.phrase);
        var i = html.toLowerCase().indexOf(p.toLowerCase());
        if (i < 0) return;
        used[x.n] = true;
        html = html.slice(0, i) + '<button type="button" class="kx" data-x="' + x.n + '">' + html.slice(i, i + p.length) + "</button>" + html.slice(i + p.length);
      });
      return html;
    }
    var k = 0;
    var body = P.sections.map(function (sec) {
      var sp = sec.speaker === "intro" ? null : speaker(sec.speaker);
      return '<div class="tr-sec' + (sp ? " tone-" + sp.tone : " tr-intro") + '">' +
        (sp ? speakerCard(sp) : '<p class="tr-label">Introduction</p>') +
        '<p class="tr-p">' + sec.sentences.map(function (s) {
          var i = k++;
          return '<span class="ts" data-i="' + i + '" tabindex="0">' + mark(s[0]) + '</span><span class="ts-zh" lang="zh-CN">' + ui.esc(s[1]) + "</span> ";
        }).join("") + "</p></div>";
    }).join("");
    var pending = D.speakers.filter(function (s) { return !P.sections.some(function (sec) { return sec.speaker === s.id; }); });

    el.innerHTML =
      '<div class="ap" role="group" aria-label="Passage recording">' +
      '<button class="ap-play" type="button" aria-label="Play">' + ui.icon("play") + "</button>" +
      '<div class="ap-mid"><p class="ap-title"><b>' + P.title + '</b> <span class="ap-by"></span></p>' +
      '<div class="ap-track"><input class="ap-seek" type="range" min="0" max="1000" value="0" aria-label="Position in the recording"><span class="ap-time"></span></div></div>' +
      '<div class="seg seg-ap" role="radiogroup" aria-label="Playback speed"><span class="seg-label">Speed</span>' +
      [0.75, 1, 1.25].map(function (r) { return '<button role="radio" aria-checked="' + (r === rate) + '" data-rate="' + r + '">' + r + "×</button>"; }).join("") + "</div></div>" +
      '<div class="poem-bar"><label class="switch"><input type="checkbox" data-zh' + (showZh ? " checked" : "") + '><span class="switch-ui"></span>Show All Translations</label>' +
      '<span class="tr-hint">Hover over or tap a sentence for its translation. Select a <span class="kx-demo">highlighted expression</span> to study it.</span></div>' +
      '<article class="transcript' + (showZh ? " show-zh" : "") + '" lang="en"><h3 class="tr-title">' + P.title + "</h3>" + body +
      (pending.length ? '<p class="tr-pending">The paragraphs by ' + pending.map(function (s) { return s.name; }).join(", ").replace(/, ([^,]*)$/, " and $1") + " are being added.</p>" : "") +
      "</article>" +
      '<div class="poem-foot"><button class="btn btn-primary" type="button" data-read>' + (store.step("l3b-listen") ? ui.icon("check") + "Passage Read" : "I Have Listened to the Passage") + "</button></div>" +
      '<div class="ts-tip" role="tooltip" hidden></div><div class="kx-pop" role="dialog" aria-label="Key expression" hidden></div>';

    var playBtn = el.querySelector(".ap-play"), seek = el.querySelector(".ap-seek"), timeEl = el.querySelector(".ap-time"), byEl = el.querySelector(".ap-by");
    var tip = el.querySelector(".ts-tip"), pop = el.querySelector(".kx-pop"), readBtn = el.querySelector("[data-read]");
    function sEl(i) { return el.querySelector('.ts[data-i="' + i + '"]'); }
    function clock(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
    function highlight(i, follow) {
      el.querySelectorAll(".ts.is-on").forEach(function (x) { x.classList.remove("is-on"); });
      var s = i >= 0 ? sEl(i) : null;
      if (!s) return;
      s.classList.add("is-on");
      if (follow) { var r = s.getBoundingClientRect(); if (r.top < 90 || r.bottom > window.innerHeight - 30) s.scrollIntoView({ behavior: "smooth", block: "center" }); }
    }
    function setPlaying(on) {
      playing = on; playBtn.innerHTML = ui.icon(on ? "pause" : "play"); playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
      el.querySelector(".ap").classList.toggle("is-playing", on);
    }
    function finished() { readBtn.innerHTML = ui.icon("check") + "Passage Read"; done(); }
    function voiceLabels() {
      byEl.textContent = "read sentence by sentence";
      seek.max = String(sents.length); seek.value = String(Math.max(0, cur + 1));
      timeEl.textContent = "Sentence " + Math.max(0, cur + 1) + " of " + sents.length;
    }
    function voiceFrom(i) {
      var my = ++run; setPlaying(true);
      (function next() {
        if (my !== run) return;
        if (i >= sents.length) { cur = -1; highlight(-1); setPlaying(false); voiceLabels(); finished(); return; }
        cur = i; highlight(i, true); voiceLabels();
        GU.audio.play(sents[i].en, { rate: rate }).then(function () { if (my !== run) return; i++; setTimeout(next, 300 / rate); });
      })();
    }
    function cueIndex(t) { var j = -1; for (var n = 0; n < cues.length; n++) if (t >= cues[n]) j = n; return j; }
    if (P.audio) {
      media = new Audio(); media.preload = "metadata"; media.src = P.audio;
      byEl.textContent = P.voices || "";
      timeEl.textContent = "0:00";
      media.addEventListener("loadedmetadata", function () { timeEl.textContent = clock(0) + " / " + clock(media.duration); });
      media.addEventListener("timeupdate", function () {
        if (!media.duration) return;
        if (stopAt && media.currentTime >= stopAt) { stopAt = 0; media.pause(); highlight(-1); return; }
        seek.value = String(Math.round(media.currentTime / media.duration * 1000));
        timeEl.textContent = clock(media.currentTime) + " / " + clock(media.duration);
        if (cues) { var j = cueIndex(media.currentTime); if (j !== cur) { cur = j; highlight(j, true); } }
      });
      media.addEventListener("play", function () { setPlaying(true); });
      media.addEventListener("pause", function () { setPlaying(false); });
      media.addEventListener("ended", function () { cur = -1; highlight(-1); setPlaying(false); finished(); });
      media.addEventListener("error", function () { media = null; voiceLabels(); });
    } else voiceLabels();

    function stop() { run++; stopAt = 0; GU.audio.stop(); if (media) media.pause(); setPlaying(false); }
    function playSentence(i) {
      if (media && cues) { GU.audio.stop(); stopAt = cues[i + 1] || 0; media.currentTime = cues[i] + 0.02; media.playbackRate = rate; cur = i; highlight(i); media.play(); return; }
      stop(); var my = run; cur = i; highlight(i); if (!media) voiceLabels();
      GU.audio.play(sents[i].en, { rate: rate }).then(function () { if (my === run) highlight(-1); });
    }
    playBtn.addEventListener("click", function () {
      if (playing) { stop(); return; }
      if (media) { GU.audio.stop(); stopAt = 0; media.playbackRate = rate; var p = media.play(); if (p && p.catch) p.catch(function () { media = null; voiceLabels(); voiceFrom(Math.max(0, cur)); }); return; }
      voiceFrom(Math.max(0, cur));
    });
    seek.addEventListener("input", function () {
      if (media && media.duration) { stopAt = 0; media.currentTime = (+seek.value / 1000) * media.duration; return; }
      cur = Math.min(sents.length - 1, Math.max(0, +seek.value - 1)); highlight(cur, true); voiceLabels();
      if (playing) voiceFrom(cur);
    });
    el.querySelectorAll("[data-rate]").forEach(function (b) {
      b.addEventListener("click", function () {
        rate = +b.dataset.rate; store.ui("passageRate", rate);
        el.querySelectorAll("[data-rate]").forEach(function (x) { x.setAttribute("aria-checked", x === b); });
        if (media) media.playbackRate = rate;
      });
    });
    el.querySelector("[data-zh]").addEventListener("change", function (e) {
      store.ui("passageZh", e.target.checked);
      el.querySelector(".transcript").classList.toggle("show-zh", e.target.checked);
    });

    /* Sentence translation tooltip */
    var tipFor = null;
    function showTip(s) {
      if (el.querySelector(".transcript").classList.contains("show-zh")) return;
      tipFor = s;
      tip.textContent = sents[+s.dataset.i].zh;
      tip.hidden = false;
      var rects = s.getClientRects(), r = rects[0] || s.getBoundingClientRect();
      var w = Math.min(420, window.innerWidth - 24);
      tip.style.maxWidth = w + "px";
      var left = Math.max(12, Math.min(r.left, window.innerWidth - w - 12));
      tip.style.left = left + "px";
      var top = r.top - tip.offsetHeight - 10;
      tip.style.top = (top < 70 ? (rects[rects.length - 1] || r).bottom + 10 : top) + "px";
    }
    function hideTip() { tip.hidden = true; tipFor = null; }
    el.querySelectorAll(".ts").forEach(function (s) {
      s.addEventListener("mouseenter", function () { showTip(s); });
      s.addEventListener("mouseleave", hideTip);
      s.addEventListener("focus", function () { showTip(s); });
      s.addEventListener("blur", hideTip);
      s.addEventListener("click", function (e) {
        if (e.target.closest(".kx")) return;
        playSentence(+s.dataset.i);
        if (tipFor !== s) showTip(s);
      });
    });

    /* Key expression pop-up */
    function openPop(btn) {
      var x = xs[+btn.dataset.x];
      pop.innerHTML = '<button class="kx-x" type="button" aria-label="Close">' + ui.icon("close") + "</button>" + exprCard(x);
      pop.hidden = false;
      var r = btn.getBoundingClientRect();
      var w = Math.min(340, window.innerWidth - 24);
      pop.style.width = w + "px";
      pop.style.left = Math.max(12, Math.min(r.left, window.innerWidth - w - 12)) + "px";
      var below = r.bottom + 10, h = pop.offsetHeight;
      pop.style.top = (below + h > window.innerHeight - 10 ? Math.max(70, r.top - h - 10) : below) + "px";
      pop.querySelector(".kx-x").addEventListener("click", closePop);
      bindSay(pop);
      hideTip();
    }
    function closePop() { pop.hidden = true; }
    el.querySelectorAll(".kx").forEach(function (b) { b.addEventListener("click", function (e) { e.stopPropagation(); openPop(b); }); });
    function outside(e) { if (!pop.hidden && !pop.contains(e.target) && !e.target.closest(".kx")) closePop(); }
    function onKey(e) { if (e.key === "Escape") { closePop(); hideTip(); } }
    function onScroll() { hideTip(); closePop(); }
    document.addEventListener("click", outside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    readBtn.addEventListener("click", finished);

    return {
      stop: function () {
        stop();
        document.removeEventListener("click", outside);
        document.removeEventListener("keydown", onKey);
        window.removeEventListener("scroll", onScroll);
      }
    };
  }

  /* ---------- Activity 3: Video Lecture ---------- */
  function notesPanel(el, key, title, file) {
    el.innerHTML = '<aside class="notes notes-wide"><label class="notes-h" for="nt-' + key + '">' + ui.icon("pen") + "My Notes</label>" +
      '<textarea id="nt-' + key + '" placeholder="Main ideas, useful expressions, questions to ask the teacher…">' + ui.esc(store.answer(key) || "") + "</textarea>" +
      '<div class="notes-foot"><span class="notes-saved" aria-live="polite"></span><button class="link-btn" type="button" data-dl>' + ui.icon("download") + "Download Notes</button></div></aside>";
    var ta = el.querySelector("textarea"), sv = el.querySelector(".notes-saved"), t = null;
    ta.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () { store.answer(key, ta.value); sv.textContent = "Saved"; setTimeout(function () { sv.textContent = ""; }, 1400); }, 400);
    });
    el.querySelector("[data-dl]").addEventListener("click", function () {
      store.answer(key, ta.value);
      var blob = new Blob([title + "\nUnit 1 Growing up\n\n" + ta.value + "\n"], { type: "text/plain;charset=utf-8" });
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob); link.download = file;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(link.href); }, 2000);
    });
  }

  GU.views.l3video = function (page) {
    var a = act("l3-video");
    var V = D.video;
    var steps = [
      { key: "l3c-watch", title: "Video Lecture", mount: function (el, done) {
        var frame = V.bvid
          ? '<div class="bili-frame"><iframe src="' + K.bili(V.bvid) + '" title="' + ui.esc(V.title) + '" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe></div>'
          : V.url
            ? '<a class="video-link" href="' + V.url + '" target="_blank" rel="noopener"><span class="vp-play">' + ui.icon("play") + "</span><span><b>" + ui.esc(V.title) + "</b>The video opens in a new tab.</span></a>"
            : '<div class="video-link is-pending"><span class="vp-play">' + ui.icon("play") + "</span><span><b>" + ui.esc(V.title) + "</b>The video will appear here.</span></div>";
        el.innerHTML =
          '<p class="step-intro">Watch the explanation of the passage and take notes on the main ideas and useful expressions. The video is in Chinese and English; use the speed control in the player if you want to watch faster.</p>' + frame +
          (V.url ? '<div class="watch-bar"><a class="link-btn" href="' + V.url + '" target="_blank" rel="noopener">' + ui.icon("external") + "Open the Video on Bilibili</a>" +
            (V.length ? '<span class="watch-len">' + ui.icon("clock") + "Length: " + V.length + "</span>" : "") + "</div>" : "") +
          '<div class="notes-slot"></div>' +
          '<div class="q-actions"><button class="btn btn-primary" type="button" data-go>' + (store.step("l3c-watch") ? ui.icon("check") + "Video Watched" : "I Have Watched the Video") + "</button></div>";
        notesPanel(el.querySelector(".notes-slot"), "l3c-notes", "My Notes on The Age of Majority (video lecture)", "age-of-majority-notes.txt");
        var b = el.querySelector("[data-go]");
        b.addEventListener("click", function () { b.innerHTML = ui.icon("check") + "Video Watched"; done(); });
      } },
      { key: "l3c-qa", title: "Questions and Answers", mount: function (el, done) {
        el.innerHTML = '<p class="step-intro">Ask the teacher about anything in the passage or the video, and help your classmates with their questions. Earlier questions and answers stay here for everyone to read.</p>' +
          '<div class="disc-slot"></div>' +
          '<div class="q-actions"><button class="link-quiet" type="button" data-none>' + (store.step("l3c-qa") ? "Step completed" : "I have no questions for now") + "</button></div>";
        el.querySelector("[data-none]").addEventListener("click", function (e) { e.target.textContent = "Step completed"; done(); });
        return GU.discuss.mount(el.querySelector(".disc-slot"), { board: "l3-qa", qa: true, onPosted: done });
      } }
    ];
    return stepper(page, a, steps, "A close reading of the passage, with a place for your notes and a question-and-answer board where the teacher replies within three days.");
  };

  /* ---------- Activity 4: Text Analysis ---------- */
  function choiceQuestion(el, q, key, done, before) {
    var saved = store.answer(key) || {};
    var tries = 0;
    el.innerHTML = (before || "") +
      '<p class="q-prompt">' + q.prompt + "</p>" +
      '<div class="mcq" role="radiogroup" aria-label="Options">' + q.options.map(function (o, i) {
        return '<button type="button" class="mcq-opt" role="radio" aria-checked="' + (saved.pick === i) + '" data-i="' + i + '"><span class="mcq-n">' + (i + 1) + "</span><span>" + ui.esc(o.text) + "</span></button>";
      }).join("") + "</div>" +
      (q.starters ? '<label class="bd-label mcq-rl" for="rs-' + key + '">Your reasons</label><textarea class="q-text mcq-r" id="rs-' + key + '" rows="3" placeholder="Explain your choice in one or two sentences.">' + ui.esc(saved.reason || "") + "</textarea>" + K.startersHtml(q.starters) : "") +
      '<div class="q-actions"><button class="btn btn-primary" type="button" data-check>' + ui.icon("check") + "Check My Answer</button></div>" +
      '<div class="q-fb" aria-live="polite"></div>';
    var opts = [].slice.call(el.querySelectorAll(".mcq-opt")), fb = el.querySelector(".q-fb"), rs = el.querySelector(".mcq-r");
    if (rs) { K.bindStarters(el, rs); rs.addEventListener("input", function () { saved.reason = rs.value; store.answer(key, saved); }); }
    opts.forEach(function (b) {
      b.addEventListener("click", function () {
        saved.pick = +b.dataset.i; store.answer(key, saved);
        opts.forEach(function (x) { x.setAttribute("aria-checked", x === b); x.classList.remove("is-right", "is-wrong"); });
      });
    });
    function check(silent) {
      if (saved.pick == null) { if (!silent) fb.innerHTML = '<p class="fb fb-info">' + ui.icon("bulb") + "<span>Choose an option first.</span></p>"; return; }
      tries++;
      var ok = saved.pick === q.answer;
      opts.forEach(function (x, i) { x.classList.toggle("is-right", ok && i === q.answer); x.classList.toggle("is-wrong", !ok && i === saved.pick); });
      var showAll = ok || tries >= 2;
      if (showAll) opts[q.answer].classList.add("is-right");
      fb.innerHTML = '<p class="fb ' + (ok ? "fb-ok" : "fb-info") + '">' + (ok ? ui.icon("check") + "<span><b>Correct.</b> " : ui.icon("bulb") + "<span><b>Not quite.</b> ") + ui.esc(q.options[saved.pick].why) +
        (!ok && !showAll ? " Choose again." : "") + "</span></p>" +
        (showAll ? '<ul class="mcq-why">' + q.options.map(function (o, i) {
          return '<li class="' + (i === q.answer ? "is-right" : "") + '"><b>' + (i + 1) + ".</b> " + ui.esc(o.why) + "</li>";
        }).join("") + "</ul>" : "");
      done();
    }
    el.querySelector("[data-check]").addEventListener("click", function () { check(false); });
    if (store.step(key) && saved.pick != null) { tries = 1; check(true); }
  }

  function textTypeDiagram() {
    var line = function (w) { return '<i style="width:' + w + '%"></i>'; };
    return '<figure class="tt" aria-label="The structure of the passage: an introduction, then three personal opinions">' +
      '<div class="tt-page"><p class="tt-title">The Age of Majority</p>' +
      '<div class="tt-intro" data-part="intro"><span class="tt-lines">' + line(96) + line(90) + line(94) + line(60) + "</span></div>" +
      D.speakers.map(function (s) {
        return '<div class="tt-op">' + avatar(s) + '<span class="tt-who"><b>' + s.name + "</b>" + s.age + ", " + s.place + '</span><span class="tt-lines">' + line(98) + line(92) + line(95) + line(70) + "</span></div>";
      }).join("") + "</div>" +
      '<div class="tt-labels"><span class="tt-l tt-l-intro"><b>Introduction</b>raises the question</span><span class="tt-l tt-l-op"><b>Personal opinions</b>three young people answer it</span></div>' +
      "</figure>";
  }

  /* Gap-fill tables for the three speakers. */
  function parseGaps(s) {
    var parts = [], re = /\{([^}]+)\}/g, last = 0, m;
    while ((m = re.exec(s))) { parts.push(s.slice(last, m.index)); parts.push({ alts: m[1].split("|") }); last = re.lastIndex; }
    parts.push(s.slice(last));
    return parts;
  }
  function gapHtml(s, ids) {
    return parseGaps(s).map(function (p) {
      if (typeof p === "string") return ui.esc(p);
      var id = ids.n++;
      ids.alts[id] = p.alts;
      return '<span class="gap"><input class="gap-in" data-g="' + id + '" autocomplete="off" spellcheck="false" style="width:' + Math.max(4, p.alts[0].length + 1.5) + 'ch" aria-label="Missing word"><span class="gap-ans" hidden></span></span>';
    }).join("");
  }
  function gapOk(v, alts) {
    var x = norm(v).replace(/-/g, " ");
    if (!x) return false;
    return alts.some(function (a) {
      var y = norm(a).replace(/-/g, " ");
      return x === y || (y.length >= 5 && K.lev1(x, y));
    });
  }
  function detailsTables(el, key, done) {
    var saved = store.answer(key) || {};
    var ids = { n: 0, alts: {} };
    el.innerHTML = '<p class="q-prompt">Read the passage again and complete the notes on each speaker.</p>' +
      D.details.map(function (t) {
        var sp = speaker(t.speaker);
        var table;
        if (t.columns) {
          table = '<table class="dt-t dt-two"><thead><tr>' + t.columns.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr></thead><tbody>" +
            t.rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + gapHtml(c, ids) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
        } else {
          table = '<table class="dt-t"><tbody>' + t.rows.map(function (r) {
            return '<tr><th scope="row">' + r[0] + "</th><td><ul>" + r[1].map(function (c) { return "<li>" + gapHtml(c, ids) + "</li>"; }).join("") + "</ul></td></tr>";
          }).join("") + "</tbody></table>";
        }
        return '<section class="dt tone-' + sp.tone + '">' + speakerCard(sp) + '<div class="table-wrap">' + table + "</div></section>";
      }).join("") +
      '<div class="q-actions"><button class="btn btn-primary" type="button" data-check>' + ui.icon("check") + "Check My Answers</button>" +
      '<button class="btn btn-ghost" type="button" data-show hidden>' + ui.icon("eye") + "Show the Answers</button></div>" +
      '<div class="q-fb" aria-live="polite"></div>';
    var ins = [].slice.call(el.querySelectorAll(".gap-in")), fb = el.querySelector(".q-fb"), show = el.querySelector("[data-show]");
    ins.forEach(function (inp) {
      inp.value = saved[inp.dataset.g] || "";
      inp.addEventListener("input", function () { saved[inp.dataset.g] = inp.value; store.answer(key, saved); inp.parentNode.classList.remove("is-ok", "is-wrong"); });
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); var j = ins.indexOf(inp); if (ins[j + 1]) ins[j + 1].focus(); else check(false); } });
    });
    function check(silent) {
      if (!ins.some(function (x) { return x.value.trim(); })) { if (!silent) fb.innerHTML = '<p class="fb fb-info">' + ui.icon("bulb") + "<span>Fill in some of the gaps first.</span></p>"; return; }
      var right = 0;
      ins.forEach(function (x) { var ok = gapOk(x.value, ids.alts[x.dataset.g]); if (ok) right++; x.parentNode.classList.toggle("is-ok", ok); x.parentNode.classList.toggle("is-wrong", !ok); });
      var all = right === ins.length;
      fb.innerHTML = '<p class="fb ' + (all ? "fb-ok" : "fb-info") + '">' + (all ? ui.icon("check") + "<span>All " + ins.length + " gaps are correct.</span>"
        : ui.icon("bulb") + "<span>" + right + " of " + ins.length + " gaps are correct. Check the passage again and correct the gaps marked in red, or show the answers.</span>") + "</p>";
      show.hidden = all;
      done();
    }
    show.addEventListener("click", function () {
      ins.forEach(function (x) {
        if (x.parentNode.classList.contains("is-ok")) return;
        var a = x.parentNode.querySelector(".gap-ans"); a.hidden = false; a.textContent = ids.alts[x.dataset.g][0];
      });
      show.hidden = true;
    });
    el.querySelector("[data-check]").addEventListener("click", function () { check(false); });
    if (store.step(key.replace("-ans", "")) && Object.keys(saved).length) check(true);
  }

  function factQuestion(el, q, key, done) {
    var saved = store.answer(key) || {};
    el.innerHTML = '<p class="q-prompt">' + q.prompt + "</p>" +
      '<ol class="fo-list">' + q.items.map(function (it, i) {
        return '<li class="fo" data-fo="' + i + '"><p class="fo-t">' + ui.esc(it.text) + "</p>" +
          '<div class="seg fo-seg" role="radiogroup" aria-label="Fact or opinion, sentence ' + (i + 1) + '">' +
          ["F", "O"].map(function (v) { return '<button role="radio" aria-checked="' + (saved[i] === v) + '" data-v="' + v + '">' + (v === "F" ? "Fact" : "Opinion") + "</button>"; }).join("") + "</div>" +
          '<p class="fo-why" hidden></p></li>';
      }).join("") + "</ol>" +
      '<div class="q-actions"><button class="btn btn-primary" type="button" data-check>' + ui.icon("check") + "Check My Answers</button></div>" +
      '<div class="q-fb" aria-live="polite"></div>';
    el.querySelectorAll(".fo").forEach(function (li) {
      var i = +li.dataset.fo;
      li.querySelectorAll("[data-v]").forEach(function (b) {
        b.addEventListener("click", function () {
          saved[i] = b.dataset.v; store.answer(key, saved);
          li.querySelectorAll("[data-v]").forEach(function (x) { x.setAttribute("aria-checked", x === b); });
          li.classList.remove("is-ok", "is-wrong");
        });
      });
    });
    function check(silent) {
      if (Object.keys(saved).length < q.items.length) { if (!silent) el.querySelector(".q-fb").innerHTML = '<p class="fb fb-info">' + ui.icon("bulb") + "<span>Decide on every sentence first.</span></p>"; return; }
      var right = 0;
      q.items.forEach(function (it, i) {
        var li = el.querySelector('[data-fo="' + i + '"]'), ok = saved[i] === it.answer;
        if (ok) right++;
        li.classList.toggle("is-ok", ok); li.classList.toggle("is-wrong", !ok);
        var w = li.querySelector(".fo-why"); w.hidden = false;
        w.innerHTML = '<b>' + (ok ? "Correct" : "It is " + (it.answer === "F" ? "a fact" : "an opinion")) + ".</b> " + ui.esc(it.why);
      });
      el.querySelector(".q-fb").innerHTML = '<p class="fb ' + (right === q.items.length ? "fb-ok" : "fb-info") + '">' + (right === q.items.length ? ui.icon("check") : ui.icon("bulb")) +
        "<span>" + right + " of " + q.items.length + " are correct. Opinions often contain signal words such as <i>surely</i>, <i>should</i>, <i>I think</i> and <i>I guess</i>.</span></p>";
      done();
    }
    el.querySelector("[data-check]").addEventListener("click", function () { check(false); });
    if (store.step(key) && Object.keys(saved).length === q.items.length) check(true);
  }

  GU.views.l3text = function (page) {
    var a = act("l3-text");
    var steps = [
      { key: "l3d-title", title: "Choosing a Title", mount: function (el, done) { choiceQuestion(el, D.titleQ, "l3d-title", done); } },
      { key: "l3d-type", title: "Text Type", mount: function (el, done) {
        choiceQuestion(el, D.typeQ, "l3d-type", done, '<p class="step-intro">Look at how the passage is organised.</p>' + textTypeDiagram());
      } },
      { key: "l3d-detail", title: "Reading for Details", mount: function (el, done) { detailsTables(el, "l3d-detail-ans", done); } },
      { key: "l3d-fact", title: "Facts or Opinions", mount: function (el, done) { factQuestion(el, D.factQ, "l3d-fact", done); } }
    ];
    return stepper(page, a, steps, "This activity looks at how the passage is built: its title, its text type, the details each speaker gives, and the difference between facts and opinions.");
  };
})();

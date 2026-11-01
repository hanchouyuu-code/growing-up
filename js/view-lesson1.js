/* Lesson 1: Vocabulary. Landing page, word sets and the set read-along. */
(function () {
  var ui = GU.ui, store = GU.store;
  var L1 = GU.LESSONS[0];
  var MINUTES = { group: 4, match: 4, challenge: 4 };

  function activityHref(a) { return "#/lesson-1/" + a.id; }

  function nextOf(a) {
    var i = L1.activities.indexOf(a);
    var n = L1.activities[i + 1];
    return n ? { href: activityHref(n), label: "Proceed to " + n.title } : { href: "#/community", label: "Visit the Learning Community" };
  }
  GU.lesson1Next = nextOf;
  GU.resumeHref = function () {
    var a = L1.activities.filter(function (x) { return !store.isDone(x.id); })[0];
    return a ? activityHref(a) : "#/lesson-2";
  };

  /* ---------- Landing ---------- */
  GU.views.lesson1 = function (page) {
    var acts = L1.activities.map(function (a) {
      var st = GU.shell.activityState(a);
      var detail, count = "";
      if (a.kind === "group") {
        detail = a.range + ": " + GU.groupWords(a.group).slice(0, 4).map(function (w) { return w.word; }).join(", ") + "…";
        count = store.groupCount(a.group) + "/10 words" + (store.readAlongDone(a.group) ? ", read-along completed" : "");
      } else if (a.kind === "match") {
        detail = "Matching each English word with its part of speech and Chinese meaning.";
        if (store.score("match") != null) count = "Best score: " + store.score("match") + "/30";
      } else {
        detail = "Listening to ten words and spelling them without visual support.";
        if (store.score("challenge") != null) count = "Best score: " + store.score("challenge") + "/10";
      }
      var label = st === "done" ? "Review" : st === "partial" ? "Continue" : "Begin";
      return '<li class="act' + (st === "done" ? " is-done" : "") + '">' + GU.shell.statusDot(st) +
        '<div class="act-body"><h3><a href="' + activityHref(a) + '">' + a.title + "</a>" + (a.bonus ? ' <em class="tag-bonus">Bonus</em>' : "") + "</h3>" +
        "<p>" + ui.esc(detail) + "</p></div>" +
        '<div class="act-side"><span class="act-time">' + (count || "Approximately " + MINUTES[a.kind] + " minutes") + "</span>" +
        '<a class="btn ' + (st === "done" ? "btn-ghost" : "btn-primary") + ' btn-sm" href="' + activityHref(a) + '">' + label + "</a></div></li>";
    }).join("");

    page.innerHTML =
      '<header class="lesson-head">' +
      '<a class="crumb" href="#/overview">' + ui.icon("left") + "Course Overview</a>" +
      '<p class="lesson-kicker">Lesson 1 <span>20 minutes</span></p>' +
      "<h1>Vocabulary</h1>" +
      '<p class="lede">This lesson presents the thirty key words of Unit 1, from <i>integrity</i> to <i>suitable</i>. Each word appears in its textbook sentence and in a dictionary example, so that it can be recognised in the reading passage.</p>' +
      "</header>" +
      '<section class="how" aria-labelledby="how-h">' +
      '<h2 id="how-h">Learning Procedure</h2>' +
      '<ol class="how-steps">' +
      '<li><span class="how-ic">' + ui.icon("speaker") + "</span><b>Listening</b><span>Hear each word and study it in context.</span></li>" +
      '<li><span class="how-ic">' + ui.icon("mic") + "</span><b>Pronunciation</b><span>Record your own reading and compare it with the model.</span></li>" +
      '<li><span class="how-ic">' + ui.icon("eye") + "</span><b>Spelling</b><span>Type the word from memory while it is covered.</span></li>" +
      '<li><span class="how-ic">' + ui.icon("repeat") + "</span><b>Set Read-Along</b><span>Repeat all ten words after the recording at your chosen speed.</span></li>" +
      "</ol>" +
      '<p class="how-note">Completing all ten words and the read-along earns the badge for each set. The Word–Meaning Matching and the bonus Dictation Challenge follow.</p>' +
      "</section>" +
      '<section aria-labelledby="act-h"><h2 id="act-h" class="block-h">Learning Activities</h2><ul class="acts">' + acts + "</ul></section>" +
      '<section aria-labelledby="dl-h"><h2 id="dl-h" class="block-h">Downloadable Resources</h2>' +
      '<a class="download" href="downloads/unit1-word-list.pdf" download>' + ui.icon("download") +
      "<span><b>Unit 1 Word List (PDF)</b>All thirty words with phonetics, meanings and textbook sentences</span></a></section>" +
      '<div id="community-zone"></div>';
    GU.communityPanel(page.querySelector("#community-zone"));
  };

  /* ---------- A word set ---------- */
  GU.views.group = function (page, params) {
    var g = params.group;
    var act = L1.activities[g];
    var words = GU.groupWords(g);
    var idx = words.findIndex(function (w) { return !store.wordDone(w.id); });
    if (idx < 0) idx = store.readAlongDone(g) ? 0 : 10;
    var tries = {};
    var myClip = null;
    var covered = false;
    var micBlocked = !GU.recorder.supported;
    var ra = { playing: false, pos: 0, rate: 1, repeat: true };
    GU.audio.preload(words);

    function dotState(w) {
      var s = store.word(w.id);
      return s.said && s.spelled ? "done" : (s.said || s.spelled) ? "half" : "";
    }

    function visualHtml(w) {
      if (w.pic) return '<figure class="wc-visual is-emoji" aria-hidden="true">' + ui.picHtml(w.pic) + "</figure>";
      return "";
    }

    function tipHtml(w) {
      var t = w.tip || {};
      var out = "";
      if (t.parts) {
        out += '<div class="tip-parts">' + t.parts.map(function (p, i) {
          return (i ? '<span class="plus">+</span>' : "") + '<span class="part"><b>' + ui.esc(p[0]) + "</b><small>" + ui.esc(p[1]) + "</small></span>";
        }).join("") + "</div>";
      }
      if (t.note) out += '<p class="tip-note">' + t.note + "</p>";
      return out;
    }

    function sayHtml(w, s) {
      if (s.said) {
        return '<p class="pr-done">' + ui.icon("check") + "Completed</p>" +
          (micBlocked ? "" : '<button class="btn btn-ghost btn-sm" data-act="record">' + ui.icon("mic") + "Record Again</button>");
      }
      if (micBlocked) {
        return '<p class="pr-help">The microphone is unavailable. Play the model, then say the word aloud three times.</p>' +
          '<div class="pr-row"><button class="btn btn-ghost" data-act="model">' + ui.icon("speaker") + "Play Model</button>" +
          '<button class="btn btn-primary" data-act="said">' + ui.icon("check") + "I Said It</button></div>";
      }
      if (GU.recorder.recording()) {
        return '<div class="pr-row"><button class="btn btn-rec is-rec" data-act="stop">' + ui.icon("stop") + "Stop</button>" +
          '<span class="rec-live" aria-live="polite"><i></i>Recording: say the word now</span></div>';
      }
      if (myClip) {
        return '<p class="pr-help">Compare the two recordings. Do they sound the same?</p>' +
          '<div class="pr-row"><button class="btn btn-ghost" data-act="model">' + ui.icon("speaker") + "Model</button>" +
          '<button class="btn btn-ghost" data-act="mine">' + ui.icon("play") + "My Recording</button></div>" +
          '<div class="pr-row"><button class="btn btn-primary" data-act="said">' + ui.icon("check") + "Pronunciation Matches</button>" +
          '<button class="btn btn-ghost" data-act="record">' + ui.icon("redo") + "Try Again</button></div>";
      }
      return '<p class="pr-help">Listen to the model, then record yourself saying the word.</p>' +
        '<div class="pr-row"><button class="btn btn-ghost" data-act="model">' + ui.icon("speaker") + "Play Model</button>" +
        '<button class="btn btn-rec" data-act="record">' + ui.icon("mic") + "Record</button></div>";
    }

    function blanks(word) {
      return word.split("").map(function (c) { return c === " " ? "&nbsp;&nbsp;" : "_"; }).join(" ");
    }

    function spellHtml(w, s) {
      if (s.spelled) {
        return '<p class="pr-done">' + ui.icon("check") + "Correct: <b>" + ui.esc(w.word) + "</b></p>" +
          '<button class="btn btn-ghost btn-sm" data-act="respell">' + ui.icon("redo") + "Spell It Again</button>";
      }
      return '<p class="pr-help">' + (covered ? "The word is covered. Listen and type it." : "Select the box below. The word will be covered so that you spell it from memory.") + "</p>" +
        '<form class="spell-form" data-form="spell" autocomplete="off">' +
        '<label class="sr-only" for="spell-in">Type the word</label>' +
        '<div class="spell-row"><button type="button" class="audio-btn" data-act="model" aria-label="Play the word">' + ui.icon("speaker") + "</button>" +
        '<input id="spell-in" class="spell-in" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type the word" />' +
        '<button class="btn btn-primary" type="submit">Check</button></div>' +
        '<div class="spell-fb" aria-live="polite"></div>' +
        (covered ? '<button type="button" class="link-btn" data-act="peek">' + ui.icon("eye") + "Show the Word Briefly</button>" : "") +
        "</form>";
    }

    function head() {
      var dots = words.map(function (x, i) {
        return '<li><button class="dot ' + dotState(x) + (i === idx ? " cur" : "") + '" data-go="' + i + '" aria-label="Word ' + (i + 1) + ": " + ui.esc(x.word) +
          (dotState(x) === "done" ? ", completed" : "") + '"' + (i === idx ? ' aria-current="step"' : "") + "><span>" + (i + 1) + "</span></button></li>";
      }).join("") +
        '<li><button class="dot dot-ra ' + (store.readAlongDone(g) ? "done" : "") + (idx === 10 ? " cur" : "") + '" data-go="10" aria-label="Set read-along' + (store.readAlongDone(g) ? ", completed" : "") + '">' + ui.icon("repeat") + "<span>Read-Along</span></button></li>";
      return '<header class="gv-head">' +
        '<a class="crumb" href="#/lesson-1">' + ui.icon("left") + "Lesson 1: Vocabulary</a>" +
        '<div class="gv-title"><h1>' + act.title + ' <span class="gv-range">' + act.range + '</span></h1><span class="gv-count">' + store.groupCount(g) + " of 10 words completed</span></div>" +
        '<ol class="dots">' + dots + "</ol>" +
        "</header>";
    }

    function render(focusSpell) {
      if (idx === 10) return renderReadAlong();
      var w = words[idx];
      GU.currentWord = w;
      var s = store.word(w.id);
      var d = w.dict;

      page.innerHTML = head() +
        '<article class="wcard' + (covered && !s.spelled ? " is-covered" : "") + '" aria-label="' + ui.esc(w.word) + '">' +
        '<header class="wc-top">' +
        '<div class="wc-main">' +
        '<h2 class="wc-word"><span class="wc-text">' + ui.esc(w.word) + '</span><span class="wc-mask" aria-hidden="true">' + blanks(w.word) + "</span></h2>" +
        '<p class="wc-meta">' + (w.ipa ? '<span class="ipa">' + w.ipa + "</span>" : "") + '<span class="pos">' + w.pos + '</span><span class="zh" lang="zh-CN">' + w.zh + "</span></p>" +
        '<p class="wc-def">' + ui.esc(w.def) + "</p>" +
        '<div class="wc-audio"><button class="audio-btn audio-lg" data-act="model" aria-label="Play the word">' + ui.icon("speaker") + "</button>" +
        '<button class="slow-btn" data-act="slow">Slow</button></div>' +
        "</div>" + visualHtml(w) +
        "</header>" +
        '<section class="wc-sec wc-book"><h3>Textbook Context</h3>' +
        "<blockquote>" + ui.highlight(w.book, w.hl) + "</blockquote>" +
        '<p class="wc-src">' + ui.icon("book") + ui.esc(w.src) + "</p>" +
        '<button class="link-btn" data-act="say-book">' + ui.icon("speaker") + "Listen to the Sentence</button></section>" +
        '<div class="wc-grid">' +
        '<section class="wc-sec wc-dict"><h3>Dictionary Example</h3><p class="dict-ex">' + ui.highlight(d[0], d[3]) + "</p>" +
        '<p class="wc-src">' + ui.icon("book") + ui.esc(d[1]) + ' <a href="' + d[2] + '" target="_blank" rel="noopener">View Entry' + ui.icon("external") + "</a></p>" +
        '<button class="link-btn" data-act="say-dict">' + ui.icon("speaker") + "Listen to the Example</button></section>" +
        '<section class="wc-sec wc-tip"><h3>Memory Aid</h3>' + tipHtml(w) + "</section>" +
        "</div>" +
        '<div class="wc-practice">' +
        '<section class="pr' + (s.said ? " is-done" : "") + '"><h3><span class="pr-n">1</span>Pronunciation Practice</h3>' + sayHtml(w, s) + "</section>" +
        '<section class="pr' + (s.spelled ? " is-done" : "") + '"><h3><span class="pr-n">2</span>Spelling Practice</h3>' + spellHtml(w, s) + "</section>" +
        "</div>" +
        '<div class="wc-ask"><span class="wc-ask-label"><img src="' + ui.emojiSrc("🤖") + '" alt="">Ask the AI Tutor about <b>' + ui.esc(w.word) + "</b></span>" +
        '<button data-ask="forms">Word Forms</button><button data-ask="collocations">Collocations</button><button data-ask="phrases">Phrases</button></div>' +
        "</article>" +
        '<nav class="wc-nav" aria-label="Words">' +
        '<button class="btn btn-ghost" data-act="prev"' + (idx === 0 ? " disabled" : "") + ">" + ui.icon("left") + "Previous Word</button>" +
        '<button class="btn ' + (store.wordDone(w.id) ? "btn-primary" : "btn-ghost") + '" data-act="next">' + (idx < 9 ? "Next Word" : "Proceed to Set Read-Along") + ui.icon("right") + "</button>" +
        "</nav>";

      bind(w);
      if (focusSpell) { var inp = page.querySelector("#spell-in"); if (inp) inp.focus(); }
    }

    /* ---------- Set read-along ---------- */
    function renderReadAlong() {
      GU.currentWord = null;
      var items = words.map(function (w, i) {
        return '<li><button class="ra-item' + (i === ra.pos && ra.playing ? " is-on" : "") + (i < ra.pos ? " is-past" : "") + '" data-ra-word="' + i + '">' +
          '<span class="ra-n">' + (i + 1) + "</span>" +
          '<span class="ra-w"><b>' + ui.esc(w.word) + "</b>" + (w.ipa ? '<span class="ipa">' + w.ipa + "</span>" : "") + "</span>" +
          '<span class="ra-zh" lang="zh-CN">' + w.pos + " " + w.zhShort + "</span></button></li>";
      }).join("");
      var speeds = [0.75, 1, 1.25].map(function (r) {
        return '<button role="radio" aria-checked="' + (ra.rate === r) + '" data-rate="' + r + '">' + r + "×</button>";
      }).join("");
      page.innerHTML = head() +
        '<section class="ra" aria-labelledby="ra-h">' +
        '<div class="ra-head"><h2 id="ra-h">Set Read-Along</h2>' +
        "<p>Listen to the ten words in order and repeat each one aloud during the pause. The word being read is highlighted.</p></div>" +
        '<div class="ra-controls">' +
        '<button class="btn btn-primary" id="ra-play">' + (ra.playing ? ui.icon("stop") + "Pause" : ui.icon("play") + (ra.pos > 0 && ra.pos < 10 ? "Resume" : "Start the Read-Along")) + "</button>" +
        '<div class="seg" role="radiogroup" aria-label="Playback speed"><span class="seg-label">Speed</span>' + speeds + "</div>" +
        '<label class="switch"><input type="checkbox" id="ra-repeat"' + (ra.repeat ? " checked" : "") + '><span class="switch-ui"></span>Pause for Repetition</label>' +
        "</div>" +
        '<ol class="ra-list">' + items + "</ol>" +
        '<p class="ra-status" id="ra-status" aria-live="polite">' + (store.readAlongDone(g) ? ui.icon("check") + "Read-along completed. Repeat it at a faster speed for extra practice." : "Select a word to hear it on its own.") + "</p>" +
        "</section>" +
        '<nav class="wc-nav" aria-label="Words"><button class="btn btn-ghost" data-act="prev">' + ui.icon("left") + "Previous Word</button>" +
        '<a class="btn ' + (store.isDone(act.id) ? "btn-primary" : "btn-ghost") + '" href="#/lesson-1">Return to Lesson 1' + ui.icon("right") + "</a></nav>";

      page.querySelectorAll("[data-go]").forEach(function (b) { b.addEventListener("click", function () { go(+b.dataset.go); }); });
      page.querySelector('[data-act="prev"]').addEventListener("click", function () { go(9); });
      page.querySelector("#ra-play").addEventListener("click", function () { ra.playing ? pauseRA() : runRA(); });
      page.querySelectorAll("[data-rate]").forEach(function (b) {
        b.addEventListener("click", function () {
          ra.rate = +b.dataset.rate;
          page.querySelectorAll("[data-rate]").forEach(function (x) { x.setAttribute("aria-checked", x === b ? "true" : "false"); });
        });
      });
      page.querySelector("#ra-repeat").addEventListener("change", function (e) { ra.repeat = e.target.checked; });
      page.querySelectorAll("[data-ra-word]").forEach(function (b) {
        b.addEventListener("click", function () { if (!ra.playing) GU.audio.playWord(words[+b.dataset.raWord], ra.rate); });
      });
    }

    function highlightRA() {
      page.querySelectorAll(".ra-item").forEach(function (el, i) {
        el.classList.toggle("is-on", i === ra.pos && ra.playing);
        el.classList.toggle("is-past", i < ra.pos);
      });
      var on = page.querySelector(".ra-item.is-on");
      if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", behavior: "smooth" });
      var btn = page.querySelector("#ra-play");
      if (btn) btn.innerHTML = ra.playing ? ui.icon("stop") + "Pause" : ui.icon("play") + (ra.pos > 0 && ra.pos < 10 ? "Resume" : "Start the Read-Along");
    }

    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    async function runRA() {
      if (ra.pos >= 10) ra.pos = 0;
      ra.playing = true;
      var run = ++ra.run;
      highlightRA();
      var status = page.querySelector("#ra-status");
      while (ra.pos < 10 && ra.playing && run === ra.run) {
        var w = words[ra.pos];
        highlightRA();
        if (status) status.textContent = "Word " + (ra.pos + 1) + " of 10: " + w.word;
        await GU.audio.playWord(w, ra.rate);
        if (!ra.playing || run !== ra.run) return;
        await wait(ra.repeat ? (1300 + w.word.length * 90) / ra.rate : 500);
        if (!ra.playing || run !== ra.run) return;
        ra.pos++;
      }
      if (ra.pos >= 10) {
        ra.playing = false;
        store.setReadAlong(g);
        highlightRA();
        if (status) status.innerHTML = ui.icon("check") + "Read-along completed. Repeat it at a faster speed for extra practice.";
        var raDot = page.querySelector(".dot-ra"); if (raDot) raDot.classList.add("done");
        checkGroup();
      }
    }
    ra.run = 0;

    function pauseRA() {
      ra.playing = false; ra.run++;
      GU.audio.stop();
      highlightRA();
    }

    function checkGroup() {
      if (store.groupCount(g) === 10 && store.readAlongDone(g) && store.complete(act.id)) {
        store.award(act.id);
        GU.ui.celebrate(act.id, nextOf(act));
      } else if (store.groupCount(g) === 10 && !store.readAlongDone(g) && idx === 9) {
        ui.toast("All ten words are completed. The set read-along is the final step.");
      }
    }

    function bind(w) {
      page.querySelectorAll("[data-go]").forEach(function (b) {
        b.addEventListener("click", function () { go(+b.dataset.go); });
      });
      page.querySelectorAll("[data-act]").forEach(function (b) {
        b.addEventListener("click", function (e) { action(b.dataset.act, w, e); });
      });
      page.querySelectorAll("[data-ask]").forEach(function (b) {
        b.addEventListener("click", function () { GU.tutor.openDrawer(w, b.dataset.ask); });
      });
      var inp = page.querySelector("#spell-in");
      if (inp) {
        inp.addEventListener("focus", function () {
          if (!covered && !(tries[w.id] >= 3)) {
            covered = true; page.querySelector(".wcard").classList.add("is-covered");
            var help = page.querySelector(".pr:last-child .pr-help"); if (help) help.textContent = "The word is covered. Listen and type it.";
          }
        });
      }
      var form = page.querySelector('[data-form="spell"]');
      if (form) form.addEventListener("submit", function (e) { e.preventDefault(); checkSpelling(w, inp); });
    }

    function go(i) {
      if (GU.recorder.recording()) GU.recorder.stop();
      if (ra.playing) pauseRA();
      idx = Math.max(0, Math.min(10, i));
      myClip = null; covered = false;
      render();
      var top = page.querySelector(".gv-head");
      if (top) top.scrollIntoView({ block: "start" });
    }

    function action(a, w) {
      if (a === "model") { GU.audio.playWord(w); store.setWord(w.id, { heard: true }); }
      else if (a === "slow") { GU.audio.playWord(w, true); store.setWord(w.id, { heard: true }); }
      else if (a === "say-book") GU.audio.play(w.book);
      else if (a === "say-dict") GU.audio.play(w.dict[0]);
      else if (a === "prev") go(idx - 1);
      else if (a === "next") go(idx + 1);
      else if (a === "record") {
        GU.audio.stop();
        myClip = null;
        GU.recorder.start(5000, render).then(function (url) { myClip = url; render(); })
          .catch(function () { micBlocked = true; render(); ui.toast("Microphone access was blocked. Say the word aloud and select I Said It."); });
      }
      else if (a === "stop") GU.recorder.stop();
      else if (a === "mine") { if (myClip) { GU.audio.stop(); new Audio(myClip).play(); } }
      else if (a === "said") { store.setWord(w.id, { said: true }); render(); checkGroup(); }
      else if (a === "peek") {
        var card = page.querySelector(".wcard");
        card.classList.remove("is-covered");
        setTimeout(function () { if (covered && !store.word(w.id).spelled) card.classList.add("is-covered"); }, 2500);
      }
      else if (a === "respell") { store.setWord(w.id, { spelled: false }); tries[w.id] = 0; covered = true; render(true); }
    }

    function checkSpelling(w, inp) {
      var val = ui.normalize(inp.value);
      var fb = page.querySelector(".spell-fb");
      if (!val) { fb.innerHTML = '<p class="fb fb-info">Type the word first.</p>'; inp.focus(); return; }
      var target = ui.normalize(w.word);
      var altNote = w.alt && w.alt[val];
      if (val === target || altNote) {
        store.setWord(w.id, { spelled: true });
        covered = false;
        render();
        var sec = page.querySelectorAll(".pr")[1];
        if (altNote) sec.insertAdjacentHTML("beforeend", '<p class="fb fb-info">' + altNote + "</p>");
        sec.classList.add("just-done");
        checkGroup();
        return;
      }
      tries[w.id] = (tries[w.id] || 0) + 1;
      var n = tries[w.id];
      var msg;
      if (n === 1) {
        msg = val.length === target.length ?
          "Not quite. The letters marked in orange are incorrect: " + diff(val, target) :
          "Not quite. You typed " + val.replace(/ /g, "").length + " letters. Listen again and count the sounds.";
      } else if (n === 2) {
        msg = "Hint: the word begins with <b>" + ui.esc(target[0]) + "</b> and has this shape: <span class=\"pattern\">" + ui.esc(target[0]) + " " + blanks(target.slice(1)) + "</span>";
      } else {
        msg = "The answer is <b>" + ui.esc(w.word) + "</b>. Type it once to complete this word.";
        page.querySelector(".wcard").classList.remove("is-covered");
        covered = false;
      }
      fb.innerHTML = '<p class="fb fb-wrong">' + msg + "</p>";
      inp.select();
    }

    function diff(val, target) {
      return '<span class="diff">' + val.split("").map(function (c, i) {
        return c === target[i] ? ui.esc(c) : "<b>" + ui.esc(c) + "</b>";
      }).join("") + "</span>";
    }

    render();
    return function () { if (GU.recorder.recording()) GU.recorder.stop(); ra.playing = false; ra.run++; GU.currentWord = null; };
  };
})();

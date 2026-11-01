/* Lesson 1: Vocabulary. Landing page and the word-by-word sets. */
(function () {
  var ui = GU.ui, store = GU.store;
  var L1 = GU.LESSONS[0];
  var MINUTES = { group: 4, match: 4, challenge: 4 };

  function activityHref(a) { return "#/lesson-1/" + a.id; }

  function nextOf(a) {
    var i = L1.activities.indexOf(a);
    var n = L1.activities[i + 1];
    return n ? { href: activityHref(n), label: "Next: " + n.title } : { href: "#/lesson-2", label: "Go to Lesson 2" };
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
      var detail = "";
      if (a.kind === "group") {
        var ws = GU.groupWords(a.group);
        detail = ws.slice(0, 4).map(function (w) { return w.word; }).join(", ") + "…";
      } else if (a.kind === "match") detail = "Match each English word with its Chinese meaning.";
      else detail = "Listen and spell 10 words. No word on screen, just your ears.";
      var count = a.kind === "group" ? store.groupCount(a.group) + "/10 words" :
        store.score(a.id) != null ? "Best: " + store.score(a.id) + "/" + (a.kind === "match" ? 30 : 10) : "";
      var label = st === "done" ? "Review" : st === "partial" ? "Continue" : "Start";
      return '<li class="act' + (st === "done" ? " is-done" : "") + '">' + GU.shell.statusDot(st) +
        '<div class="act-body"><h3><a href="' + activityHref(a) + '">' + a.title + "</a>" + (a.bonus ? ' <em class="tag-bonus">Bonus</em>' : "") + "</h3>" +
        "<p>" + ui.esc(detail) + "</p></div>" +
        '<div class="act-side"><span class="act-time">' + (count || "About " + MINUTES[a.kind] + " min") + "</span>" +
        '<a class="btn ' + (st === "done" ? "btn-ghost" : "btn-primary") + ' btn-sm" href="' + activityHref(a) + '">' + label + "</a></div></li>";
    }).join("");

    page.innerHTML =
      '<header class="lesson-head">' +
      '<a class="crumb" href="#/overview">' + ui.icon("left") + "Course overview</a>" +
      '<p class="lesson-kicker">Lesson 1 <span>20 minutes</span></p>' +
      "<h1>Vocabulary</h1>" +
      '<p class="lede">Learn the 30 key words of the unit, from <i>integrity</i> to <i>suitable</i>. Each word comes with its sentence from the book, so you’ll recognise it when you read the passage.</p>' +
      "</header>" +
      '<section class="how" aria-labelledby="how-h">' +
      '<h2 id="how-h">How each word works</h2>' +
      '<ol class="how-steps">' +
      "<li><span class=\"how-ic\">" + ui.icon("speaker") + "</span><b>Listen</b><span>Hear the word and see it in a sentence from the book.</span></li>" +
      "<li><span class=\"how-ic\">" + ui.icon("mic") + "</span><b>Say it</b><span>Record yourself and compare with the model.</span></li>" +
      "<li><span class=\"how-ic\">" + ui.icon("eye") + "</span><b>Spell it</b><span>The word is covered. Type it from memory.</span></li>" +
      "</ol>" +
      '<p class="how-note">Finish all 10 words in a set to earn its badge. Then try the matching quiz and the bonus listening challenge.</p>' +
      "</section>" +
      '<section aria-labelledby="act-h"><h2 id="act-h">Activities</h2><ul class="acts">' + acts + "</ul></section>" +
      '<a class="download" href="downloads/unit1-word-list.pdf" download>' + ui.icon("download") +
      "<span><b>Download the word list</b>All 30 words with meanings and example sentences (PDF)</span></a>";
  };

  /* ---------- A set of 10 words ---------- */
  GU.views.group = function (page, params) {
    var g = params.group;
    var act = L1.activities[g];
    var words = GU.groupWords(g);
    var idx = words.findIndex(function (w) { return !store.wordDone(w.id); });
    if (idx < 0) idx = 0;
    var tries = {};          // spelling attempts per word
    var myClip = null;       // last recording URL
    var covered = false;
    var micBlocked = !GU.recorder.supported;

    function dotState(w) {
      var s = store.word(w.id);
      return s.said && s.spelled ? "done" : (s.said || s.spelled) ? "half" : "";
    }

    function tipHtml(w) {
      var t = w.tip || {};
      var out = "";
      if (t.pic) out += '<div class="tip-pic" aria-hidden="true">' + t.pic + "</div>";
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
        return '<p class="pr-done">' + ui.icon("check") + "Done. You said it.</p>" +
          (micBlocked ? "" : '<button class="btn btn-ghost btn-sm" data-act="record">' + ui.icon("mic") + "Record again</button>");
      }
      if (micBlocked) {
        return '<p class="pr-help">Your microphone isn’t available. Play the model, then say the word aloud three times.</p>' +
          '<div class="pr-row"><button class="btn btn-ghost" data-act="model">' + ui.icon("speaker") + "Play model</button>" +
          '<button class="btn btn-primary" data-act="said">' + ui.icon("check") + "I said it</button></div>";
      }
      if (GU.recorder.recording()) {
        return '<div class="pr-row"><button class="btn btn-rec is-rec" data-act="stop">' + ui.icon("stop") + "Stop</button>" +
          '<span class="rec-live" aria-live="polite"><i></i>Recording… say the word</span></div>';
      }
      if (myClip) {
        return '<p class="pr-help">Listen to both. Do they sound the same?</p>' +
          '<div class="pr-row"><button class="btn btn-ghost" data-act="model">' + ui.icon("speaker") + "Model</button>" +
          '<button class="btn btn-ghost" data-act="mine">' + ui.icon("play") + "My recording</button></div>" +
          '<div class="pr-row"><button class="btn btn-primary" data-act="said">' + ui.icon("check") + "Sounds right</button>" +
          '<button class="btn btn-ghost" data-act="record">' + ui.icon("redo") + "Try again</button></div>";
      }
      return '<p class="pr-help">Listen to the model, then record yourself saying the word.</p>' +
        '<div class="pr-row"><button class="btn btn-ghost" data-act="model">' + ui.icon("speaker") + "Play model</button>" +
        '<button class="btn btn-rec" data-act="record">' + ui.icon("mic") + "Record</button></div>";
    }

    function blanks(word) {
      return word.split("").map(function (c) { return c === " " ? "&nbsp;&nbsp;" : "_"; }).join(" ");
    }

    function spellHtml(w, s) {
      if (s.spelled) {
        return '<p class="pr-done">' + ui.icon("check") + "Correct: <b>" + ui.esc(w.word) + "</b></p>" +
          '<button class="btn btn-ghost btn-sm" data-act="respell">' + ui.icon("redo") + "Spell it again</button>";
      }
      return '<p class="pr-help">' + (covered ? "The word is covered. Listen and type it." : "Tap the box below. The word will be covered, so you spell it from memory.") + "</p>" +
        '<form class="spell-form" data-form="spell" autocomplete="off">' +
        '<label class="sr-only" for="spell-in">Type the word</label>' +
        '<div class="spell-row"><button type="button" class="audio-btn" data-act="model" aria-label="Play the word">' + ui.icon("speaker") + "</button>" +
        '<input id="spell-in" class="spell-in" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type the word" />' +
        '<button class="btn btn-primary" type="submit">Check</button></div>' +
        '<div class="spell-fb" aria-live="polite"></div>' +
        (covered ? '<button type="button" class="link-btn" data-act="peek">' + ui.icon("eye") + "Show the word</button>" : "") +
        "</form>";
    }

    function render(focusSpell) {
      var w = words[idx];
      var s = store.word(w.id);
      var dots = words.map(function (x, i) {
        return '<li><button class="dot ' + dotState(x) + (i === idx ? " cur" : "") + '" data-go="' + i + '" aria-label="Word ' + (i + 1) + ": " + ui.esc(x.word) +
          (dotState(x) === "done" ? ", done" : "") + '"' + (i === idx ? ' aria-current="step"' : "") + "><span>" + (i + 1) + "</span></button></li>";
      }).join("");
      var done = store.groupCount(g);

      page.innerHTML =
        '<header class="gv-head">' +
        '<a class="crumb" href="#/lesson-1">' + ui.icon("left") + "Lesson 1: Vocabulary</a>" +
        '<div class="gv-title"><h1>' + act.title + '</h1><span class="gv-count">' + done + " of 10 learned</span></div>" +
        '<ol class="dots">' + dots + "</ol>" +
        "</header>" +

        '<article class="wcard' + (covered && !s.spelled ? " is-covered" : "") + '" aria-label="' + ui.esc(w.word) + '">' +
        '<header class="wc-top">' +
        '<div class="wc-wordline">' +
        '<h2 class="wc-word"><span class="wc-text">' + ui.esc(w.word) + '</span><span class="wc-mask" aria-hidden="true">' + blanks(w.word) + "</span></h2>" +
        '<div class="wc-audio">' +
        '<button class="audio-btn audio-lg" data-act="model" aria-label="Play the word">' + ui.icon("speaker") + "</button>" +
        '<button class="slow-btn" data-act="slow" aria-label="Play slowly">Slow</button>' +
        "</div></div>" +
        '<p class="wc-meta">' + (w.ipa ? '<span class="ipa">' + w.ipa + "</span>" : "") + '<span class="pos">' + w.pos + '</span><span class="zh" lang="zh-CN">' + w.zh + "</span></p>" +
        '<p class="wc-def">' + ui.esc(w.def) + "</p>" +
        "</header>" +
        '<div class="wc-grid">' +
        '<section class="wc-sec wc-book"><h3>In the book</h3>' +
        "<blockquote>" + ui.highlight(w.book, w.hl) + "</blockquote>" +
        '<p class="wc-src">' + ui.icon("book") + ui.esc(w.src) + "</p>" +
        '<button class="link-btn" data-act="say-book">' + ui.icon("speaker") + "Listen to the sentence</button></section>" +
        '<section class="wc-sec wc-ex"><h3>Another example</h3><p>' + ui.highlight(w.ex, w.word) + "</p>" +
        '<button class="link-btn" data-act="say-ex">' + ui.icon("speaker") + "Listen to the sentence</button></section>" +
        '<section class="wc-sec wc-tip"><h3>Memory tip</h3>' + tipHtml(w) + "</section>" +
        "</div>" +
        '<div class="wc-practice">' +
        '<section class="pr' + (s.said ? " is-done" : "") + '"><h3><span class="pr-n">1</span>Say it</h3>' + sayHtml(w, s) + "</section>" +
        '<section class="pr' + (s.spelled ? " is-done" : "") + '"><h3><span class="pr-n">2</span>Spell it</h3>' + spellHtml(w, s) + "</section>" +
        "</div>" +
        "</article>" +

        '<nav class="wc-nav" aria-label="Words">' +
        '<button class="btn btn-ghost" data-act="prev"' + (idx === 0 ? " disabled" : "") + ">" + ui.icon("left") + "Previous</button>" +
        (idx < words.length - 1 ?
          '<button class="btn ' + (store.wordDone(w.id) ? "btn-primary" : "btn-ghost") + '" data-act="next">Next word' + ui.icon("right") + "</button>" :
          '<a class="btn ' + (store.isDone(act.id) ? "btn-primary" : "btn-ghost") + '" href="#/lesson-1">Back to the lesson' + ui.icon("right") + "</a>") +
        "</nav>";

      bind(w);
      if (focusSpell) { var inp = page.querySelector("#spell-in"); if (inp) inp.focus(); }
    }

    function checkGroup() {
      if (store.groupCount(g) === 10 && store.complete(act.id)) {
        store.award(act.id);
        GU.ui.celebrate(act.id, nextOf(act));
      }
    }

    function bind(w) {
      page.querySelectorAll("[data-go]").forEach(function (b) {
        b.addEventListener("click", function () { go(+b.dataset.go); });
      });
      page.querySelectorAll("[data-act]").forEach(function (b) {
        b.addEventListener("click", function (e) { action(b.dataset.act, w, e); });
      });
      var inp = page.querySelector("#spell-in");
      if (inp) {
        inp.addEventListener("focus", function () {
          if (!covered && !(tries[w.id] >= 3)) { covered = true; page.querySelector(".wcard").classList.add("is-covered"); var help = page.querySelector(".pr:last-child .pr-help"); if (help) help.textContent = "The word is covered. Listen and type it."; }
        });
      }
      var form = page.querySelector('[data-form="spell"]');
      if (form) form.addEventListener("submit", function (e) { e.preventDefault(); checkSpelling(w, inp); });
    }

    function go(i) {
      if (GU.recorder.recording()) GU.recorder.stop();
      idx = Math.max(0, Math.min(words.length - 1, i));
      myClip = null; covered = false;
      render();
      var top = page.querySelector(".gv-head");
      if (top) top.scrollIntoView({ block: "start" });
    }

    function action(a, w) {
      if (a === "model") { GU.audio.playWord(w); store.setWord(w.id, { heard: true }); }
      else if (a === "slow") { GU.audio.playWord(w, true); store.setWord(w.id, { heard: true }); }
      else if (a === "say-book") GU.audio.play(w.book);
      else if (a === "say-ex") GU.audio.play(w.ex);
      else if (a === "prev") go(idx - 1);
      else if (a === "next") go(idx + 1);
      else if (a === "record") {
        GU.audio.stop();
        myClip = null;
        GU.recorder.start(5000, render).then(function (url) { myClip = url; render(); })
          .catch(function () { micBlocked = true; render(); ui.toast("Microphone access was blocked. You can still say the word aloud and tap I said it."); });
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
        sec.insertAdjacentHTML("beforeend", altNote ? '<p class="fb fb-info">' + altNote + "</p>" : "");
        sec.classList.add("just-done");
        checkGroup();
        return;
      }
      tries[w.id] = (tries[w.id] || 0) + 1;
      var n = tries[w.id];
      var msg;
      if (n === 1) {
        msg = val.length === target.length ?
          "Not quite. The letters in orange are wrong: " + diff(val, target) :
          "Not quite. You typed " + val.replace(/ /g, "").length + " letters. Listen again and count the sounds.";
      } else if (n === 2) {
        msg = "Hint: it starts with <b>" + ui.esc(target[0]) + "</b> and looks like this: <span class=\"pattern\">" + ui.esc(target[0]) + " " + blanks(target.slice(1)) + "</span>";
      } else {
        msg = "The answer is <b>" + ui.esc(w.word) + "</b>. Type it once to finish.";
        page.querySelector(".wcard").classList.remove("is-covered");
        covered = false;
      }
      fb.innerHTML = '<p class="fb fb-wrong">' + msg + "</p>";
      inp.select();
    }

    function diff(val, target) {
      return '<span class="diff">' + val.split("").map(function (c, i) {
        return c === target[i] ? ui.esc(c) : '<b>' + ui.esc(c) + "</b>";
      }).join("") + "</span>";
    }

    render();
    return function () { if (GU.recorder.recording()) GU.recorder.stop(); };
  };
})();

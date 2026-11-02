/* Lesson 1 practice: matching quiz (连线) and the bonus listening challenge. */
(function () {
  var ui = GU.ui, store = GU.store;
  var L1 = GU.LESSONS[0];

  function head(title, sub) {
    return '<header class="gv-head">' +
      '<a class="crumb" href="#/lesson-1">' + ui.icon("left") + "Lesson 1: Vocabulary</a>" +
      '<div class="gv-title"><h1>' + title + "</h1>" + (sub ? '<span class="gv-count">' + sub + "</span>" : "") + "</div></header>";
  }

  function reviewList(ids) {
    if (!ids.length) return '<p class="res-perfect">' + ui.icon("sparkle") + "No errors: every word was answered correctly at the first attempt.</p>";
    return '<h3 class="res-h">Words for Review</h3><ul class="review">' + ids.map(function (id) {
      var w = GU.WORDS.filter(function (x) { return x.id === id; })[0];
      return '<li><button class="audio-btn" data-say="' + w.id + '" aria-label="Play ' + ui.esc(w.word) + '">' + ui.icon("speaker") + "</button>" +
        "<b>" + ui.esc(w.word) + '</b><span lang="zh-CN">' + w.zh + "</span></li>";
    }).join("") + "</ul>";
  }
  function bindSay(root) {
    root.querySelectorAll("[data-say]").forEach(function (b) {
      b.addEventListener("click", function () {
        var w = GU.WORDS.filter(function (x) { return x.id === b.dataset.say; })[0];
        GU.audio.playWord(w);
      });
    });
  }

  /* ---------- Matching quiz ---------- */
  GU.views.match = function (page) {
    var act = L1.activities[3];
    var ROUND = 6;
    var order, round, matched, missed, sel, fbTimer;

    function reset() {
      order = ui.shuffle(GU.WORDS);
      round = 0; missed = {}; matched = {}; sel = null;
    }

    function roundWords() { return order.slice(round * ROUND, (round + 1) * ROUND); }
    var rounds = Math.ceil(GU.WORDS.length / ROUND);

    function intro() {
      var best = store.score("match");
      page.innerHTML = head("Word–Meaning Matching") +
        '<section class="intro-card">' +
        '<div class="intro-art" aria-hidden="true">' + matchArt() + "</div>" +
        "<div><h2>Instructions</h2>" +
        "<p>The activity has five rounds of six words. Select an English word, then select its part of speech and Chinese meaning to draw a line between them. After an incorrect match, the word’s textbook sentence appears as a clue.</p>" +
        (best != null ? '<p class="intro-best">Best score: <b>' + best + "/30</b></p>" : "") +
        '<button class="btn btn-primary btn-lg" id="go">Begin the Activity</button></div></section>';
      page.querySelector("#go").addEventListener("click", function () { reset(); store.setScore("match-tries", 1); play(); });
    }

    function matchArt() {
      return '<svg viewBox="0 0 120 90"><g fill="#fff" stroke="#CBD9CC" stroke-width="2"><rect x="4" y="8" width="36" height="16" rx="8"/><rect x="4" y="37" width="36" height="16" rx="8"/><rect x="4" y="66" width="36" height="16" rx="8"/>' +
        '<rect x="80" y="8" width="36" height="16" rx="8"/><rect x="80" y="37" width="36" height="16" rx="8"/><rect x="80" y="66" width="36" height="16" rx="8"/></g>' +
        '<g stroke="#1E3A2F" stroke-width="2.5" stroke-linecap="round"><path d="M40 16L80 45"/><path d="M40 45L80 74"/><path d="M40 74L80 16" stroke="#D99A2B"/></g></svg>';
    }

    function play() {
      var ws = roundWords();
      var right = ui.shuffle(ws);
      page.innerHTML = head("Word–Meaning Matching", "Round " + (round + 1) + " of " + rounds) +
        '<div class="round-bar" aria-hidden="true">' + Array.from({ length: rounds }, function (_, i) {
          return '<i class="' + (i < round ? "on" : i === round ? "cur" : "") + '"></i>';
        }).join("") + "</div>" +
        '<p class="match-help">Select a word, then select its meaning.</p>' +
        '<div class="board" id="board">' +
        '<svg class="board-lines" id="lines" aria-hidden="true"></svg>' +
        '<ul class="col col-en">' + ws.map(function (w) {
          return '<li><button class="chip" data-side="en" data-id="' + w.id + '">' + ui.esc(w.word) + "</button></li>";
        }).join("") + "</ul>" +
        '<ul class="col col-zh">' + right.map(function (w) {
          return '<li><button class="chip chip-zh" data-side="zh" data-id="' + w.id + '"><i class="chip-pos">' + w.pos + '</i> <span lang="zh-CN">' + w.zhShort + "</span></button></li>";
        }).join("") + "</ul>" +
        "</div>" +
        '<div class="match-fb" id="mfb" aria-live="polite"></div>' +
        '<div class="match-next" id="mnext"></div>';
      page.querySelectorAll(".chip").forEach(function (c) { c.addEventListener("click", function () { pick(c); }); });
      drawLines();
    }

    function pick(c) {
      if (c.classList.contains("is-matched")) return;
      if (c.dataset.side === "en") {
        var w = GU.WORDS.filter(function (x) { return x.id === c.dataset.id; })[0];
        GU.audio.playWord(w);
      }
      if (!sel || sel.dataset.side === c.dataset.side) {
        if (sel) sel.classList.remove("is-sel");
        sel = c; c.classList.add("is-sel");
        return;
      }
      var a = sel, b = c;
      sel.classList.remove("is-sel"); sel = null;
      var en = a.dataset.side === "en" ? a : b, zh = a.dataset.side === "zh" ? a : b;
      var fb = page.querySelector("#mfb");
      if (en.dataset.id === zh.dataset.id) {
        matched[en.dataset.id] = true;
        en.classList.add("is-matched"); zh.classList.add("is-matched");
        fb.innerHTML = "";
        drawLines();
        if (roundWords().every(function (w) { return matched[w.id]; })) roundDone();
      } else {
        missed[en.dataset.id] = true;
        var w = GU.WORDS.filter(function (x) { return x.id === en.dataset.id; })[0];
        drawLines([en, zh]);
        en.classList.add("is-wrong"); zh.classList.add("is-wrong");
        clearTimeout(fbTimer);
        fbTimer = setTimeout(function () { en.classList.remove("is-wrong"); zh.classList.remove("is-wrong"); drawLines(); }, 900);
        fb.innerHTML = '<p class="fb fb-wrong"><b>Incorrect match.</b> Textbook clue: “' + ui.highlight(w.book, w.hl) + "”</p>";
      }
    }

    function center(el, side, box) {
      var r = el.getBoundingClientRect();
      return { x: (side === "en" ? r.right : r.left) - box.left, y: r.top + r.height / 2 - box.top };
    }

    function drawLines(wrongPair) {
      var board = page.querySelector("#board");
      if (!board) return;
      var svg = page.querySelector("#lines");
      var box = board.getBoundingClientRect();
      svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
      var out = "";
      Object.keys(matched).forEach(function (id) {
        var en = board.querySelector('[data-side="en"][data-id="' + id + '"]');
        var zh = board.querySelector('[data-side="zh"][data-id="' + id + '"]');
        if (!en || !zh) return;
        var p = center(en, "en", box), q = center(zh, "zh", box);
        var d = (q.x - p.x) / 2;
        out += '<path class="ln ok" d="M' + p.x + " " + p.y + " C" + (p.x + d) + " " + p.y + " " + (q.x - d) + " " + q.y + " " + q.x + " " + q.y + '"/>' +
          '<circle class="ln-end" cx="' + p.x + '" cy="' + p.y + '" r="4"/><circle class="ln-end" cx="' + q.x + '" cy="' + q.y + '" r="4"/>';
      });
      if (wrongPair) {
        var p2 = center(wrongPair[0], "en", box), q2 = center(wrongPair[1], "zh", box);
        var d2 = (q2.x - p2.x) / 2;
        out += '<path class="ln bad" d="M' + p2.x + " " + p2.y + " C" + (p2.x + d2) + " " + p2.y + " " + (q2.x - d2) + " " + q2.y + " " + q2.x + " " + q2.y + '"/>';
      }
      svg.innerHTML = out;
    }

    function roundDone() {
      var next = page.querySelector("#mnext");
      if (round < rounds - 1) {
        next.innerHTML = '<p class="fb fb-ok">' + ui.icon("check") + "Round " + (round + 1) + ' completed.</p><button class="btn btn-primary" id="nr">Next Round' + ui.icon("right") + "</button>";
        var btn = next.querySelector("#nr");
        btn.addEventListener("click", function () { round++; play(); });
        btn.focus();
      } else {
        setTimeout(results, 500);
      }
    }

    function results() {
      var miss = Object.keys(missed);
      var score = GU.WORDS.length - miss.length;
      store.setScore("match", score);
      var first = store.complete(act.id);
      var got = store.award("match");
      page.innerHTML = head("Word–Meaning Matching", "Completed") +
        '<section class="results">' +
        '<div class="res-score"><span class="res-num">' + score + "</span><span>/30</span></div>" +
        "<div><h2>" + (score === 30 ? "Full Marks" : score >= 24 ? "Strong Result" : "Further Practice Recommended") + "</h2>" +
        "<p>" + score + " of 30 words were matched correctly at the first attempt.</p></div>" +
        "</section>" + reviewList(miss) +
        '<div class="res-actions"><button class="btn btn-ghost" id="again">' + ui.icon("redo") + "Repeat the Activity</button>" +
        '<a class="btn btn-primary" href="#/lesson-1/challenge">Proceed to the Dictation Challenge' + ui.icon("right") + "</a></div>";
      bindSay(page);
      page.querySelector("#again").addEventListener("click", function () { reset(); play(); });
      if (got || first) ui.celebrate("match", { href: "#/lesson-1/challenge", label: "Proceed to the Dictation Challenge" });
    }

    var onResize = function () { drawLines(); };
    window.addEventListener("resize", onResize);
    intro();
    return function () { window.removeEventListener("resize", onResize); clearTimeout(fbTimer); };
  };

  /* ---------- Listening challenge (bonus) ---------- */
  GU.views.challenge = function (page) {
    var act = L1.activities[4];
    var COUNT = 10;
    var list, i, tries, firstTry, missed;

    function intro() {
      var best = store.score("challenge");
      page.innerHTML = head('Dictation Challenge <em class="tag-bonus">Bonus</em>') +
        '<section class="intro-card">' +
        '<div class="intro-art" aria-hidden="true">' + earArt() + "</div>" +
        "<div><h2>Instructions</h2>" +
        "<p>Ten words from the lesson are played one at a time, without being shown. Type each word you hear. Every incorrect answer reveals a further clue.</p>" +
        (best != null ? '<p class="intro-best">Best score: <b>' + best + "/10</b></p>" : "") +
        '<button class="btn btn-primary btn-lg" id="go">Begin the Challenge</button></div></section>';
      page.querySelector("#go").addEventListener("click", start);
    }

    function earArt() {
      return '<svg viewBox="0 0 120 90"><circle cx="60" cy="45" r="30" fill="#1E3A2F"/><path d="M50 33v24l20-12z" fill="#fff"/>' +
        '<g fill="none" stroke="#D99A2B" stroke-width="3" stroke-linecap="round"><path d="M98 30a24 24 0 0 1 0 30"/><path d="M106 22a36 36 0 0 1 0 46"/><path d="M22 30a24 24 0 0 0 0 30"/><path d="M14 22a36 36 0 0 0 0 46"/></g></svg>';
    }

    function start() {
      list = ui.shuffle(GU.WORDS).slice(0, COUNT);
      i = 0; firstTry = 0; missed = [];
      store.setScore("challenge-tries", 1);
      show(true);
    }

    function blanks(word) {
      return word.split("").map(function (c) { return c === " " ? "&nbsp;&nbsp;" : "_"; }).join(" ");
    }

    function show(autoplay) {
      tries = 0;
      var w = list[i];
      page.innerHTML = head('Dictation Challenge <em class="tag-bonus">Bonus</em>', "Word " + (i + 1) + " of " + COUNT) +
        '<div class="ch-bar" aria-hidden="true"><i style="width:' + (i / COUNT * 100) + '%"></i></div>' +
        '<section class="ch-card">' +
        '<div class="ch-audio"><button class="ch-play" id="play" aria-label="Play the word">' + ui.icon("speaker") + "</button>" +
        '<button class="slow-btn" id="slow" aria-label="Play slowly">Slow</button></div>' +
        '<p class="ch-label">Listen and type the word.</p>' +
        '<div class="ch-clue" id="clue" aria-live="polite"></div>' +
        '<form class="spell-form" id="chf" autocomplete="off">' +
        '<label class="sr-only" for="ch-in">Type the word you hear</label>' +
        '<div class="spell-row"><input id="ch-in" class="spell-in" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Type the word" />' +
        '<button class="btn btn-primary" type="submit">Check</button></div>' +
        '<div class="spell-fb" id="chfb" aria-live="polite"></div></form>' +
        "</section>";
      page.querySelector("#play").addEventListener("click", function () { GU.audio.playWord(w); });
      page.querySelector("#slow").addEventListener("click", function () { GU.audio.playWord(w, true); });
      page.querySelector("#chf").addEventListener("submit", function (e) { e.preventDefault(); check(w); });
      var inp = page.querySelector("#ch-in");
      inp.focus({ preventScroll: true });
      if (autoplay) GU.audio.playWord(w);
    }

    function check(w) {
      var inp = page.querySelector("#ch-in");
      var fb = page.querySelector("#chfb");
      var clue = page.querySelector("#clue");
      var val = ui.normalize(inp.value);
      if (!val) { fb.innerHTML = '<p class="fb fb-info">Type the word first.</p>'; return; }
      var target = ui.normalize(w.word);
      if (val === target || (w.alt && w.alt[val])) {
        if (tries === 0) firstTry++; else if (missed.indexOf(w.id) < 0) missed.push(w.id);
        fb.innerHTML = '<p class="fb fb-ok">' + ui.icon("check") + "<b>" + ui.esc(w.word) + '</b> <span lang="zh-CN">' + w.zh + "</span></p>";
        inp.disabled = true;
        page.querySelector('#chf button[type="submit"]').disabled = true;
        setTimeout(function () {
          i++;
          if (i < COUNT) show(true); else finish();
        }, 1100);
        return;
      }
      tries++;
      if (missed.indexOf(w.id) < 0) missed.push(w.id);
      if (tries === 1) {
        clue.innerHTML = '<p><span class="clue-tag">Clue</span><span lang="zh-CN">' + w.zh + "</span> <i>" + w.pos + '</i></p><p class="pattern">' + blanks(target) + "</p>";
        fb.innerHTML = '<p class="fb fb-wrong">Incorrect. A clue has been added. Listen again and try once more.</p>';
      } else if (tries === 2) {
        clue.innerHTML = '<p><span class="clue-tag">Clue</span><span lang="zh-CN">' + w.zh + "</span> <i>" + w.pos + '</i></p><p class="pattern">' + ui.esc(target[0]) + " " + blanks(target.slice(1)) + "</p>";
        fb.innerHTML = '<p class="fb fb-wrong">Still incorrect. The word begins with <b>' + ui.esc(target[0]) + "</b>.</p>";
      } else {
        clue.innerHTML = '<p><span class="clue-tag">Answer</span><b>' + ui.esc(w.word) + '</b> <span lang="zh-CN">' + w.zh + "</span></p>";
        fb.innerHTML = '<p class="fb fb-info">Type the word once to continue.</p>';
      }
      inp.select();
      GU.audio.playWord(w);
    }

    function finish() {
      store.setScore("challenge", firstTry);
      var first = store.complete(act.id);
      var got = store.award("challenge");
      page.innerHTML = head('Dictation Challenge <em class="tag-bonus">Bonus</em>', "Finished") +
        '<section class="results">' +
        '<div class="res-score"><span class="res-num">' + firstTry + "</span><span>/10</span></div>" +
        "<div><h2>" + (firstTry === 10 ? "Full Marks" : firstTry >= 7 ? "Strong Result" : "Challenge Completed") + "</h2>" +
        "<p>" + firstTry + " of 10 words were spelled correctly at the first attempt.</p></div>" +
        "</section>" + reviewList(missed) +
        '<div class="res-actions"><button class="btn btn-ghost" id="again">' + ui.icon("redo") + "Attempt Ten New Words</button>" +
        '<a class="btn btn-primary" href="#/community/battle">Proceed to the Word Battle' + ui.icon("right") + "</a></div>";
      bindSay(page);
      page.querySelector("#again").addEventListener("click", start);
      if (got || first) ui.celebrate("challenge", { href: "#/community/battle", label: "Proceed to the Word Battle" });
    }

    intro();
  };
})();

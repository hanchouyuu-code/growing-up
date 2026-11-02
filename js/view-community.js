/* Learning Community: Word Battle with a shared leaderboard, and the AI Tutor.
   Both talk to small server functions in /api (see README). When those are not connected,
   the leaderboard shows records from this device and the tutor uses the teacher-prepared hints. */
(function () {
  var ui = GU.ui, store = GU.store;

  /* ---------- Player identity (nickname only) ---------- */
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "p-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  function hashId(id) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(id)).then(function (buf) {
        return Array.from(new Uint8Array(buf)).slice(0, 8).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      });
    }
    var h = 0; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    return Promise.resolve(("00000000" + (h >>> 0).toString(16)).slice(-8));
  }

  /* ---------- Leaderboard API ---------- */
  var board = {
    get: function () {
      return fetch("api/leaderboard?limit=20", { cache: "no-store" }).then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        return r.json();
      }).then(function (d) { if (!d || !d.configured) throw new Error("not configured"); return d; });
    },
    submit: function (rec) {
      return fetch("api/leaderboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rec) })
        .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); });
    }
  };

  function fmtTime(ms) {
    var s = Math.round(ms / 1000);
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  function boardTable(entries, myHash, opts) {
    opts = opts || {};
    if (!entries.length) return '<p class="lb-empty">No results have been recorded yet. Complete a battle to appear here.</p>';
    return '<div class="lb-wrap"><table class="lb"><thead><tr><th>Rank</th><th>Player</th>' + (opts.noClass ? "" : "<th>Class</th>") + "<th>Accuracy</th><th>Time</th></tr></thead><tbody>" +
      entries.map(function (e, i) {
        var me = myHash && e.pid === myHash;
        var rank = e.rank || i + 1;
        return '<tr class="' + (me ? "is-me" : "") + '"><td><span class="lb-rank r' + rank + '">' + rank + "</span></td>" +
          "<td>" + ui.esc(e.name) + (me ? ' <em class="lb-you">You</em>' : "") + "</td>" +
          (opts.noClass ? "" : "<td>" + ui.esc(e.cls || "") + "</td>") +
          "<td><b>" + Math.round(e.correct / e.total * 100) + '%</b> <span class="lb-sub">' + e.correct + "/" + e.total + "</span></td>" +
          "<td>" + fmtTime(e.ms) + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }

  function localEntries() {
    return store.battles().slice().sort(function (a, b) { return b.correct - a.correct || a.ms - b.ms; }).slice(0, 10)
      .map(function (b, i) { return { rank: i + 1, name: (store.player() || {}).name || "You", correct: b.correct, total: b.total, ms: b.ms, pid: "local" }; });
  }

  /* ---------- Word Battle and AI Tutor panel at the bottom of Lesson 1 ---------- */
  GU.communityPanel = function (el, full, ctxId) {
    var C = GU.PRACTICE[ctxId || "lesson-1"];
    el.innerHTML =
      '<section class="zone' + (full ? " zone-full" : "") + '" aria-labelledby="zone-h">' +
      '<div class="zone-head"><span class="zone-tag">' + ui.icon("users") + C.tag + "</span>" +
      (full ? "" : '<h2 id="zone-h">' + C.title + "</h2>") +
      (full ? "" : "<p>" + C.blurb + "</p>") + "</div>" +
      '<div class="zone-grid">' +
      '<article class="zcard"><div class="zcard-top"><img src="' + ui.emojiSrc("🏆") + '" alt=""><div><h3>Word Battle</h3><p>' + C.battleCard + "</p></div></div>" +
      '<div class="zcard-lb" id="zone-lb"><p class="lb-empty">Loading the leaderboard…</p></div>' +
      '<a class="btn btn-mint" href="' + C.battle + '">' + ui.icon("trophy") + "Enter the Word Battle</a></article>" +
      '<article class="zcard"><div class="zcard-top"><img src="' + ui.emojiSrc("🤖") + '" alt=""><div><h3>AI Tutor</h3><p>' + C.tutorCard + "</p></div></div>" +
      '<div class="zcard-chips">' + C.panelChips.map(function (q) {
        return '<button data-q="' + ui.esc(q) + '">' + ui.esc(q) + "</button>";
      }).join("") + "</div>" +
      '<a class="btn btn-mint" href="' + C.tutor + '">' + ui.icon("chat") + "Open the AI Tutor</a></article>" +
      "</div></section>";
    el.querySelectorAll("[data-q]").forEach(function (b) {
      b.addEventListener("click", function () { GU.tutor.openDrawer(null, null, b.dataset.q); });
    });
    var lb = el.querySelector("#zone-lb");
    var me = store.player();
    Promise.all([board.get(), me ? hashId(me.id) : Promise.resolve(null)]).then(function (r) {
      lb.innerHTML = '<p class="zcard-sub">Class Leaderboard: Top 3</p>' + boardTable(r[0].entries.slice(0, 3), r[1], { noClass: true });
    }).catch(function () {
      var loc = localEntries();
      lb.innerHTML = '<p class="zcard-sub">Personal Records on This Device</p>' + (loc.length ? boardTable(loc.slice(0, 3), "local", { noClass: true }) : '<p class="lb-empty">No battles completed on this device yet.</p>');
    });
  };

  /* ---------- Word Battle ---------- */
  var TYPES = {
    en2zh: "Meaning",
    zh2en: "Word",
    listen: "Listening",
    context: "Textbook Context"
  };

  function makeQuestions() {
    var pool = ui.shuffle(GU.WORDS).slice(0, 15);
    var types = ui.shuffle(["en2zh", "en2zh", "en2zh", "en2zh", "zh2en", "zh2en", "zh2en", "zh2en", "listen", "listen", "listen", "context", "context", "context", "context"]);
    return pool.map(function (w, i) {
      var others = ui.shuffle(GU.WORDS.filter(function (x) { return x.id !== w.id; })).slice(0, 3);
      return { w: w, type: types[i], options: ui.shuffle([w].concat(others)) };
    });
  }

  function blankOut(sentence, hl) {
    var i = sentence.toLowerCase().indexOf(hl.toLowerCase());
    if (i < 0) return ui.esc(sentence);
    return ui.esc(sentence.slice(0, i)) + '<span class="blank">______</span>' + ui.esc(sentence.slice(i + hl.length));
  }

  GU.views.battle = function (page) {
    var qs, qi, correct, startedAt, timer, locked, finishedRec;
    var poll = null;

    function setup() {
      var p = store.player() || {};
      page.innerHTML =
        '<header class="lesson-head zone-page-head"><a class="crumb" href="' + GU.practice().href + '">' + ui.icon("left") + GU.practice().crumb + "</a>" +
        '<p class="lesson-kicker">' + GU.practice().tag + ' <em class="tag-bonus">Bonus</em></p><h1>Word Battle</h1>' +
        '<p class="lede">' + GU.practice().battleLede + "</p></header>" +
        '<div class="battle-grid">' +
        '<form class="zcard battle-setup" id="setup" autocomplete="off"><h2>Player Details</h2>' +
        '<label for="nick">Nickname</label><input id="nick" maxlength="16" required placeholder="e.g. Sapling 7" value="' + ui.esc(p.name || "") + '">' +
        '<label for="cls">Class (optional)</label><input id="cls" maxlength="12" placeholder="e.g. Class 3" value="' + ui.esc(p.cls || "") + '">' +
        '<p class="fine">Use a nickname, not your full name.</p>' +
        '<button class="btn btn-mint btn-lg" type="submit">' + ui.icon("trophy") + "Start the Battle</button></form>" +
        '<section class="zcard"><div class="lb-head"><h2>Class Leaderboard</h2><button class="link-btn" id="lb-refresh">' + ui.icon("redo") + 'Refresh</button></div><div id="lb">Loading…</div></section>' +
        "</div>";
      page.querySelector("#setup").addEventListener("submit", function (e) {
        e.preventDefault();
        var name = page.querySelector("#nick").value.trim().replace(/\s+/g, " ").slice(0, 16);
        if (!name) return;
        var cls = page.querySelector("#cls").value.trim().slice(0, 12);
        var me = store.player() || { id: uuid() };
        store.player({ id: me.id, name: name, cls: cls });
        start();
      });
      page.querySelector("#lb-refresh").addEventListener("click", loadBoard);
      loadBoard();
      clearInterval(poll);
      poll = setInterval(loadBoard, 30000);
    }

    function loadBoard() {
      var el = page.querySelector("#lb");
      if (!el) return;
      var me = store.player();
      Promise.all([board.get(), me ? hashId(me.id) : Promise.resolve(null)]).then(function (r) {
        el.innerHTML = boardTable(r[0].entries, r[1]) + '<p class="fine">' + r[0].total + " players in total. Updated " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ".</p>";
      }).catch(function () {
        el.innerHTML = '<p class="fine lb-note">The shared class leaderboard is not connected, so personal records from this device are shown.</p>' + boardTable(localEntries(), "local", { noClass: true });
      });
    }

    function start() {
      clearInterval(poll);
      qs = makeQuestions(); qi = 0; correct = 0; startedAt = Date.now(); locked = false;
      GU.audio.preload(qs.map(function (q) { return q.w; }));
      page.innerHTML =
        '<header class="battle-bar"><div><p class="lesson-kicker">Word Battle</p><h1 id="bq">Question 1 of 15</h1></div>' +
        '<div class="battle-stats"><span class="bs">' + ui.icon("check") + '<b id="bcorrect">0</b> correct</span><span class="bs">' + ui.icon("clock") + '<b id="btime">0:00</b></span></div></header>' +
        '<div class="ch-bar battle-progress" aria-hidden="true"><i id="bprog" style="width:0%"></i></div>' +
        '<section class="zcard battle-card" id="bcard"></section>';
      timer = setInterval(function () { var t = page.querySelector("#btime"); if (t) t.textContent = fmtTime(Date.now() - startedAt); }, 500);
      show();
    }

    function show() {
      var q = qs[qi];
      locked = false;
      page.querySelector("#bq").textContent = "Question " + (qi + 1) + " of 15";
      page.querySelector("#bprog").style.width = (qi / 15 * 100) + "%";
      var prompt;
      if (q.type === "en2zh") prompt = '<p class="bq-ask">Choose the meaning of</p><p class="bq-word">' + ui.esc(q.w.word) + "</p>";
      else if (q.type === "zh2en") prompt = '<p class="bq-ask">Choose the English word for</p><p class="bq-word" lang="zh-CN"><i class="chip-pos">' + q.w.pos + "</i> " + q.w.zhShort + "</p>";
      else if (q.type === "listen") prompt = '<p class="bq-ask">Listen and choose the word you hear</p><button class="ch-play bq-play" id="bplay" aria-label="Play the word">' + ui.icon("speaker") + "</button>";
      else prompt = '<p class="bq-ask">Complete the textbook sentence</p><p class="bq-sentence">' + blankOut(q.w.book, q.w.hl) + "</p>";
      var opts = q.options.map(function (o, i) {
        var label = q.type === "en2zh" ? '<i class="chip-pos">' + o.pos + '</i> <span lang="zh-CN">' + o.zhShort + "</span>" : ui.esc(o.word);
        return '<button class="bopt" data-i="' + i + '"><span class="bopt-key">' + "ABCD"[i] + "</span>" + label + "</button>";
      }).join("");
      var card = page.querySelector("#bcard");
      card.innerHTML = '<span class="bq-type">' + TYPES[q.type] + "</span>" + prompt + '<div class="bopts">' + opts + "</div>";
      card.querySelectorAll(".bopt").forEach(function (b) { b.addEventListener("click", function () { answer(+b.dataset.i); }); });
      var pb = card.querySelector("#bplay");
      if (pb) { pb.addEventListener("click", function () { GU.audio.playWord(q.w); }); GU.audio.playWord(q.w); }
    }

    function answer(i) {
      if (locked) return;
      locked = true;
      var q = qs[qi];
      var ok = q.options[i].id === q.w.id;
      if (ok) correct++;
      page.querySelector("#bcorrect").textContent = correct;
      var btns = page.querySelectorAll(".bopt");
      btns.forEach(function (b, j) {
        if (q.options[j].id === q.w.id) b.classList.add("is-right");
        else if (j === i) b.classList.add("is-wrong");
        b.disabled = true;
      });
      setTimeout(function () {
        qi++;
        if (qi < 15) show(); else finish();
      }, ok ? 550 : 1300);
    }

    function finish() {
      clearInterval(timer);
      var ms = Date.now() - startedAt;
      var me = store.player();
      finishedRec = { correct: correct, total: 15, ms: ms, at: Date.now() };
      store.addBattle(finishedRec);
      var firstBadge = store.award("battle");
      page.innerHTML =
        '<header class="lesson-head zone-page-head"><a class="crumb" href="' + GU.practice().href + '">' + ui.icon("left") + GU.practice().crumb + "</a><h1>Battle Results</h1></header>" +
        '<section class="results zcard"><div class="res-score"><span class="res-num">' + correct + '</span><span>/15</span></div>' +
        "<div><h2>Accuracy: " + Math.round(correct / 15 * 100) + "%</h2><p>Time: " + fmtTime(ms) + '. <span id="rank-line">Submitting your result…</span></p></div></section>' +
        '<div class="res-actions"><button class="btn btn-ghost" id="again">' + ui.icon("redo") + "Battle Again</button>" +
        '<a class="btn btn-mint" href="#/community/tutor">' + ui.icon("chat") + "Review Words with the AI Tutor</a></div>" +
        '<section class="zcard"><div class="lb-head"><h2>Class Leaderboard</h2></div><div id="lb">Loading…</div></section>';
      page.querySelector("#again").addEventListener("click", start);
      board.submit({ id: me.id, name: me.name, cls: me.cls, correct: correct, total: 15, ms: ms }).then(function (r) {
        var line = page.querySelector("#rank-line");
        if (line) line.textContent = r.improved ? "New personal best: you are ranked " + r.rank + " of " + r.total + "." : "Your best result remains ranked " + r.rank + " of " + r.total + ".";
        loadBoard();
      }).catch(function () {
        var line = page.querySelector("#rank-line");
        if (line) line.textContent = "Saved on this device. The shared leaderboard is not connected.";
        loadBoard();
      });
      if (firstBadge) ui.celebrate("battle", { href: GU.practice().tutor, label: "Open the AI Tutor" });
    }

    setup();
    return function () { clearInterval(timer); clearInterval(poll); };
  };

  /* ---------- AI Tutor ---------- */
  /* Each lesson keeps its own conversation with the tutor. */
  var history = [], historyFor = null;
  function histKey() { return "gu-tutor" + (GU.practiceId === "lesson-1" ? "" : "-" + GU.practiceId); }
  function useHistory() {
    if (historyFor === histKey()) return;
    historyFor = histKey();
    try { history = JSON.parse(sessionStorage.getItem(historyFor) || "[]"); } catch (e) { history = []; }
    pendingQuiz = null;
  }
  var mode = "ai";           // "ai" or "hints" (after the AI service fails)
  var pendingQuiz = null;    // for the hints-mode practice question

  function saveHistory() { try { sessionStorage.setItem(histKey(), JSON.stringify(history.slice(-30))); } catch (e) {} }

  function md(text) {
    /* minimal formatting for AI replies: **bold**, *italic*, bullet lines, line breaks */
    var lines = ui.esc(text).split(/\n/);
    var out = "", inList = false;
    lines.forEach(function (l) {
      var m = l.match(/^\s*[-•*]\s+(.*)/);
      if (m) { if (!inList) { out += "<ul>"; inList = true; } out += "<li>" + m[1] + "</li>"; return; }
      if (inList) { out += "</ul>"; inList = false; }
      if (l.trim()) out += "<p>" + l + "</p>";
    });
    if (inList) out += "</ul>";
    return out.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|[^*])\*([^*]+)\*/g, "$1<i>$2</i>");
  }

  function findWord(q) {
    var s = q.toLowerCase();
    var best = null, bestLen = 0;
    GU.WORDS.forEach(function (w) {
      var cands = [w.word, w.zhShort].concat(((GU.HINTS[w.id] || {}).forms || []).map(function (f) { return f[0].split(" / ")[0]; }));
      cands.forEach(function (c) {
        c = c.toLowerCase();
        if (c.length > 2 && s.indexOf(c) >= 0 && c.length > bestLen) { best = w; bestLen = c.length; }
      });
    });
    return best;
  }

  function intentOf(q) {
    var s = q.toLowerCase();
    if (/quiz|test me|practice question|测验|考考|练习/.test(s)) return "quiz";
    if (/differen|\bvs\b|versus|区别|compare|or salary|or wage/.test(s)) return "diff";
    if (/form|family|derivative|变形|词性|派生|noun of|adjective of|verb of|adverb of/.test(s)) return "forms";
    if (/collocat|搭配|go with|goes with|combine|together with/.test(s)) return "col";
    if (/phrase|idiom|expression|词组|短语|used/.test(s)) return "phr";
    if (/pronoun|sound|发音|读音|how (do|to) (i )?say/.test(s)) return "pron";
    if (/spell|拼写|拼/.test(s)) return "spell";
    if (/example|sentence|例句|造句/.test(s)) return "ex";
    if (/mean|definition|意思|含义|what is|what's/.test(s)) return "mean";
    return null;
  }

  function list(items) { return "<ul>" + items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>"; }

  /* Teacher-hint answers on the passage's key expressions (Lesson 3), used when the AI service is unavailable. */
  function exprList() {
    return (GU.L3 && GU.L3.passage ? GU.L3.passage.expressions : []).map(function (x) {
      var w = x.word ? GU.wordById(x.word) || {} : {};
      return { phrase: x.phrase, base: x.base || w.word, zh: x.zh || w.zh, def: x.def || w.def, dict: x.dict || w.dict };
    });
  }
  function exprSentence(ph) {
    var hit = null;
    GU.L3.passage.sections.forEach(function (sec) { sec.sentences.forEach(function (t) { if (!hit && t[0].toLowerCase().indexOf(ph.toLowerCase()) >= 0) hit = t[0]; }); });
    return hit;
  }
  function exprAnswer(q, intent) {
    var xs = exprList(), n = ui.normalize(q);
    if (intent === "quiz") {
      var t = xs[Math.floor(Math.random() * xs.length)], s = exprSentence(t.phrase);
      if (!s) return null;
      pendingQuiz = { word: t.phrase, answer: t.phrase, book: s, alt: true };
      return "<p><b>Practice question.</b> Complete the sentence from the passage:</p><p class=\"tq\">" + blankOut(s, t.phrase) + "</p><p>Hint: <span lang=\"zh-CN\">" + ui.esc(t.zh || "") + "</span></p>";
    }
    var x = xs.slice().sort(function (a, b) { return b.phrase.length - a.phrase.length; }).filter(function (y) {
      return n.indexOf(ui.normalize(y.phrase)) >= 0 || n.indexOf(ui.normalize(y.base.replace(/\b(sth|sb)\b/g, "").trim())) >= 0;
    })[0];
    if (!x) {
      if (findWord(q) || GU.practiceId !== "lesson-3") return null;
      return "<p>In teacher-hint mode I can explain the key expressions of the passage. Choose one:</p><div class=\"tchips\">" +
        ui.shuffle(xs).slice(0, 6).map(function (y) { return '<button data-tq="How is ' + ui.esc(y.base) + ' used?">' + ui.esc(y.base) + "</button>"; }).join("") + "</div>";
    }
    var s2 = exprSentence(x.phrase);
    return "<p><b>" + ui.esc(x.base) + "</b> <span lang=\"zh-CN\">" + ui.esc(x.zh || "") + "</span>" + (x.def ? ": " + ui.esc(x.def) : "") + ".</p>" +
      (s2 ? "<p>In the passage: “" + ui.highlight(s2, x.phrase) + "”</p>" : "") +
      (x.dict ? "<p>" + ui.esc(x.dict[1]) + ": “" + ui.esc(x.dict[0]) + "”</p>" : "") +
      "<p class=\"tfollow\">Your turn: write one sentence of your own with <b>" + ui.esc(x.base) + "</b>, or type <i>quiz me</i>.</p>";
  }

  /* Teacher-hint answers on writing (Lesson 4): linking words and sentence patterns for the essay. */
  function writingAnswer(q, intent) {
    if (!GU.L4) return null;
    var n = q.toLowerCase();
    var P = {}; GU.L4.patterns.forEach(function (g) { P[g[0]] = g[1]; });
    function pats(name) { return "<p><b>" + name + "</b> patterns for your essay:</p>" + list(P[name].map(function (x) { return ui.esc(x); })); }
    var tail = "<p class=\"tfollow\">Your turn: write the sentence for your own essay, then compare it with the model essay in Guided Writing.</p>";
    if (/correct|check|mistake|is this sentence|right sentence/.test(n)) {
      return "<p>In teacher-hint mode I cannot check your sentence. Compare it with these points:</p>" +
        list(["Does every sentence begin with a capital letter and end with a full stop?", "After <b>look forward to</b>, use a noun or an <i>-ing</i> form: <i>I look forward to having a say.</i>", "After <b>be able to</b>, <b>must</b> and <b>should</b>, use the base form of the verb.", "Post the sentence in Questions and Answers, and the teacher will check it."]);
    }
    if (/link|connect|transition/.test(n)) return "<p>Linking words for your essay:</p>" + list(GU.L4.linking.map(function (x) { return "<b>" + ui.esc(x) + "</b>"; })) + "<p>Use <b>however</b> to turn from the right to the responsibility, and <b>in addition</b> or <b>what’s more</b> to add a second point.</p>" + tail;
    if (/begin|start|open|introduc|first sentence/.test(n)) return pats("Opening") + tail;
    if (/conclu|end|finish|last sentence/.test(n)) return pats("Conclusion") + tail;
    if (/reason|why/.test(n)) return pats("Reasons") + tail;
    if (/responsib|duty/.test(n) && !/take responsibility|taking responsibility/.test(n)) return pats("Responsibility") + tail;
    if (/structure|organi[sz]e|plan|outline|paragraph/.test(n)) return "<p>A simple plan for about 80 words:</p>" + list(["Sentence 1: the right you most look forward to.", "Sentences 2–3: why you want it, with an example.", "Sentences 4–5: the responsibility that comes with it, beginning with <b>However</b>.", "Sentence 6: what turning eighteen means to you."]) + tail;
    return null;
  }

  function hintAnswer(q) {
    if (pendingQuiz) {
      var pq = pendingQuiz; pendingQuiz = null;
      var ok = ui.normalize(q).replace(/[.!?]$/, "") === ui.normalize(pq.word) || (pq.alt && ui.normalize(q).indexOf(ui.normalize(pq.answer)) >= 0);
      return (ok ? "<p><b>Correct.</b> " : "<p><b>Not quite.</b> The answer is <b>" + ui.esc(pq.answer) + "</b>. ") +
        "The full sentence reads: “" + ui.highlight(pq.book, pq.answer) + "”</p><p>Would you like another question? Type <i>quiz me</i>.</p>";
    }
    var intent = intentOf(q);
    if (GU.practiceId === "lesson-4") { var wa = writingAnswer(q, intent); if (wa) return wa; }
    if (GU.practiceId === "lesson-3" || GU.practiceId === "lesson-4") { var xa = exprAnswer(q, intent); if (xa) return xa; }
    var w = findWord(q) || (intent && intent !== "quiz" ? GU.currentWord : null);
    if (intent === "quiz") {
      var pool = GU.currentWord ? GU.WORDS.filter(function (x) { return GU.groupWords(Math.floor(GU.WORDS.indexOf(GU.currentWord) / 10)).indexOf(x) >= 0; }) : GU.WORDS;
      var t = pool[Math.floor(Math.random() * pool.length)];
      pendingQuiz = { word: t.word, answer: t.hl, book: t.book, alt: true };
      return "<p><b>Practice question.</b> Complete the textbook sentence with one word or phrase:</p><p class=\"tq\">" + blankOut(t.book, t.hl) + "</p><p>Hint: <span lang=\"zh-CN\">" + t.zhShort + "</span> (" + t.pos + ")</p>";
    }
    if (!w) {
      var sample = ui.shuffle(GU.WORDS).slice(0, 6);
      return "<p>Which word would you like to ask about? Name one of the thirty words, for example:</p><div class=\"tchips\">" +
        sample.map(function (x) { return '<button data-tq="Word forms of ' + ui.esc(x.word) + '">' + ui.esc(x.word) + "</button>"; }).join("") + "</div>";
    }
    var h = GU.HINTS[w.id] || {};
    var name = "<b>" + ui.esc(w.word) + "</b>";
    var follow = "<p class=\"tfollow\">Your turn: write one sentence that uses " + name + ". I can check it if the AI service is connected; otherwise compare it with the examples above.</p>";
    if (intent === "forms") return "<p>Word forms of " + name + ":</p>" + list((h.forms || []).map(function (f) { return "<b>" + f[0] + "</b> <i>" + f[1] + "</i> " + (f[2] ? '<span lang="zh-CN">' + f[2] + "</span>" : ""); })) + follow;
    if (intent === "col") return "<p>Common collocations with " + name + ":</p>" + list(h.col || []) + follow;
    if (intent === "phr") return (h.phr && h.phr.length ? "<p>Phrases with " + name + ":</p>" + list(h.phr) : "<p>" + name + " has no common fixed phrase at this level. These collocations are useful instead:</p>" + list(h.col || [])) + follow;
    if (intent === "diff") return "<p>Usage note on " + name + ":</p><p>" + (h.note || "") + "</p>" + follow;
    if (intent === "pron") return "<p>" + name + " is pronounced <span class=\"ipa\">" + (w.ipa || "as written") + "</span>.</p><p><button class=\"tplay\" data-say=\"" + w.id + "\">" + ui.icon("speaker") + "Play the word</button></p>";
    if (intent === "spell") return "<p>Spelling of " + name + ":</p><p>" + ((w.tip && w.tip.note) || "") + "</p>";
    if (intent === "ex") return "<p>Examples of " + name + ":</p>" + list(["Textbook: “" + ui.highlight(w.book, w.hl) + "”", w.dict[1].replace(/ \(.*\)/, "") + ": “" + ui.highlight(w.dict[0], w.dict[3]) + "”"]) + follow;
    return "<p>" + name + " <i>" + w.pos + "</i> <span lang=\"zh-CN\">" + w.zh + "</span>: " + ui.esc(w.def) + ".</p>" +
      (h.forms && h.forms.length > 1 ? "<p>Related forms: " + h.forms.slice(0, 3).map(function (f) { return "<b>" + f[0] + "</b> (" + f[1] + ")"; }).join(", ") + ".</p>" : "") +
      (h.col ? "<p>Useful collocations: " + h.col.slice(0, 2).join("; ") + ".</p>" : "") +
      "<p>Ask about its <i>word forms</i>, <i>collocations</i> or <i>phrases</i>, or type <i>quiz me</i>.</p>";
  }

  var instances = [];

  function renderLog(log) {
    if (!history.length) {
      log.innerHTML = '<div class="tmsg bot">' + GU.practice().greeting + "</div>";
    } else {
      log.innerHTML = history.map(function (m) {
        return '<div class="tmsg ' + (m.role === "user" ? "me" : "bot") + (m.hint ? " is-hint" : "") + '">' +
          (m.hint ? '<span class="tbadge">' + ui.icon("bulb") + "Teacher Hint</span>" : "") +
          (m.role === "user" ? "<p>" + ui.esc(m.content) + "</p>" : (m.html || md(m.content))) + "</div>";
      }).join("");
    }
    log.scrollTop = log.scrollHeight;
  }

  function refreshAll() { instances.forEach(function (i) { renderLog(i.log); i.updateStatus(); }); }

  function send(text) {
    text = String(text || "").trim().slice(0, 500);
    if (!text) return;
    history.push({ role: "user", content: text });
    saveHistory();
    refreshAll();
    instances.forEach(function (i) { i.typing(true); });

    var done = function (msg) {
      history.push(msg); saveHistory();
      instances.forEach(function (i) { i.typing(false); });
      refreshAll();
    };

    if (mode === "hints") { setTimeout(function () { done({ role: "assistant", hint: true, html: hintAnswer(text), content: "" }); }, 350); return; }

    var payload = history.filter(function (m) { return m.content; }).slice(-10).map(function (m) { return { role: m.role, content: m.content }; });
    fetch("api/tutor", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: payload, word: GU.currentWord ? GU.currentWord.id : null, context: GU.practiceId })
    }).then(function (r) {
      if (r.status === 429) return r.json().then(function (d) { throw { rate: true, msg: d.error }; });
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }).then(function (d) {
      if (!d || !d.reply) throw new Error("empty");
      done({ role: "assistant", content: d.reply });
    }).catch(function (e) {
      if (e && e.rate) { done({ role: "assistant", content: "The AI Tutor has reached its hourly limit for this connection. Please try again later, or ask your teacher." }); return; }
      mode = "hints";
      done({ role: "assistant", hint: true, html: '<p class="tnotice">The AI service is not connected at the moment, so the tutor is answering with hints prepared by the teacher.</p>' + hintAnswer(text), content: "" });
    });
  }

  GU.tutor = {
    mount: function (el, opts) {
      opts = opts || {};
      useHistory();
      var w = opts.word;
      var chips = w ? ["Word forms of " + w.word, "Collocations with " + w.word, "Phrases with " + w.word, "Example sentences with " + w.word, "Quiz me"]
        : GU.practice().chips;
      el.innerHTML =
        '<div class="tutor">' +
        '<div class="tutor-head"><img src="' + ui.emojiSrc("🤖") + '" alt=""><div><b>AI Tutor</b><span class="tutor-status"></span></div>' +
        '<button class="link-btn tutor-clear" type="button">Clear Chat</button></div>' +
        '<div class="tutor-log" aria-live="polite"></div>' +
        '<div class="tutor-typing" hidden><i></i><i></i><i></i></div>' +
        '<div class="tutor-suggest">' + chips.map(function (c) { return '<button type="button" data-tq="' + ui.esc(c) + '">' + ui.esc(c) + "</button>"; }).join("") + "</div>" +
        '<form class="tutor-form"><label class="sr-only" for="tq-' + instances.length + '">Your question</label>' +
        '<textarea id="tq-' + instances.length + '" rows="1" maxlength="500" placeholder="' + GU.practice().placeholder + '"></textarea>' +
        '<button class="btn btn-mint" type="submit" aria-label="Send">' + ui.icon("send") + "</button></form>" +
        '<p class="tutor-note">AI answers can contain mistakes. Check them against the textbook and a dictionary, and ask your teacher whenever unsure.</p>' +
        "</div>";
      var log = el.querySelector(".tutor-log");
      var inst = {
        log: log,
        typing: function (on) { el.querySelector(".tutor-typing").hidden = !on; },
        updateStatus: function () { el.querySelector(".tutor-status").textContent = mode === "ai" ? GU.practice().status : "Teacher hints mode"; }
      };
      instances.push(inst);
      renderLog(log); inst.updateStatus();
      var ta = el.querySelector("textarea");
      el.querySelector(".tutor-form").addEventListener("submit", function (e) { e.preventDefault(); send(ta.value); ta.value = ""; });
      ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(ta.value); ta.value = ""; } });
      el.addEventListener("click", function (e) {
        var t = e.target.closest("[data-tq]");
        if (t) { send(t.dataset.tq); return; }
        var s = e.target.closest("[data-say]");
        if (s) { GU.audio.playWord(GU.wordById(s.dataset.say)); }
      });
      el.querySelector(".tutor-clear").addEventListener("click", function () { history = []; pendingQuiz = null; saveHistory(); refreshAll(); });
      if (opts.ask) send(opts.ask);
      return function () { instances = instances.filter(function (i) { return i !== inst; }); };
    },

    openDrawer: function (word, intent, question) {
      var root = document.getElementById("drawer-root");
      var unmount;
      var ask = question || (word && intent ? ({ forms: "Word forms of ", collocations: "Collocations with ", phrases: "Phrases with " }[intent] + word.word) : null);
      root.innerHTML = '<div class="drawer-scrim" data-close></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="AI Tutor">' +
        '<button class="icon-btn drawer-x" data-close aria-label="Close the AI Tutor">' + ui.icon("close") + "</button><div class=\"drawer-body\"></div></aside>";
      root.classList.add("is-open");
      document.body.classList.add("no-scroll");
      unmount = GU.tutor.mount(root.querySelector(".drawer-body"), { word: word, ask: ask });
      function close() {
        unmount();
        root.classList.remove("is-open"); root.innerHTML = "";
        document.body.classList.remove("no-scroll");
        document.removeEventListener("keydown", onKey);
        var fab = document.getElementById("tutor-fab"); if (fab && !fab.hidden) fab.focus();
      }
      function onKey(e) { if (e.key === "Escape") close(); }
      document.addEventListener("keydown", onKey);
      root.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", close); });
      var ta = root.querySelector("textarea"); if (ta && !ask) ta.focus();
    }
  };

  GU.views.tutorPage = function (page) {
    page.innerHTML =
      '<header class="lesson-head zone-page-head"><a class="crumb" href="' + GU.practice().href + '">' + ui.icon("left") + GU.practice().crumb + "</a>" +
      '<p class="lesson-kicker">' + GU.practice().tag + "</p><h1>AI Tutor</h1>" +
      '<p class="lede">' + GU.practice().tutorLede + "</p></header>" +
      '<div class="tutor-page" id="tp"></div>';
    return GU.tutor.mount(page.querySelector("#tp"), {});
  };
})();

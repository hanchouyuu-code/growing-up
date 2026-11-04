/* Lesson 4: Writing. Activity 1 Pre-writing (Think & Share), Activity 2 Guided Writing (Me at Eighteen). */
(function () {
  var ui = GU.ui, store = GU.store, K = GU.kit;
  var L4 = GU.LESSONS[3];
  var D = GU.L4;
  var T = D.task;

  function act(id) { return L4.activities.filter(function (a) { return a.id === id; })[0]; }
  function stepper(page, a, steps, intro) { return K.stepper(page, L4, a, steps, intro); }
  function words(t) { return String(t || "").trim().split(/\s+/).filter(Boolean).length; }
  function draft() { return store.answer("l4-draft") || ""; }
  function esc(t) { return ui.esc(t); }
  function reEsc(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  /* ---------- Landing ---------- */
  var DESC = {
    "l4-think": "Two Think & Share questions on adult rights and responsibility, discussed with classmates.",
    "l4-write": "An 80-word essay, Me at Eighteen, written with a language bank, followed by AI feedback, questions to the teacher and a class showcase."
  };
  GU.views.lesson4 = function (page) {
    var acts = L4.activities.map(function (a) {
      var st = GU.shell.activityState(a);
      var n = a.steps.filter(store.step).length;
      var label = st === "done" ? "Review" : st === "partial" ? "Continue" : "Begin";
      return '<li class="act' + (st === "done" ? " is-done" : "") + '">' + GU.shell.statusDot(st) +
        '<div class="act-body"><p class="act-label">' + a.label + "</p>" +
        '<h3><a href="' + K.actHref(L4, a) + '">' + a.title + "</a></h3><p>" + DESC[a.id] + "</p></div>" +
        '<div class="act-side"><span class="act-time">' + (n ? n + " of " + a.steps.length + " steps completed" : "Approximately " + a.minutes + " minutes") + "</span>" +
        '<a class="btn ' + (st === "done" ? "btn-ghost" : "btn-primary") + ' btn-sm" href="' + K.actHref(L4, a) + '">' + label + "</a></div></li>";
    }).join("");
    var first = L4.activities.filter(function (a) { return !store.isDone(a.id); })[0];
    page.innerHTML =
      '<header class="lesson-head">' +
      '<a class="crumb" href="#/overview">' + ui.icon("left") + "Course Overview</a>" +
      '<p class="lesson-kicker">Lesson 4 <span>' + L4.minutes + " minutes</span></p>" +
      "<h1>Writing</h1>" +
      '<p class="lede">Having read what turning 18 means to Bethany, Lin Ning and Morgan, you now write about what it will mean to you: the right you most look forward to, and the responsibility that comes with it.</p>' +
      "</header>" +
      '<section class="how" aria-labelledby="wt-h"><h2 id="wt-h">The Writing Task</h2>' +
      '<div class="wr-task-mini"><p class="wr-title-mini">' + T.title + "</p><ol>" + T.points.map(function (p) { return "<li>" + p.label + "</li>"; }).join("") + "</ol>" +
      '<p class="wr-len">' + ui.icon("pen") + "About 80 words, in the format of the gaokao applied writing task</p></div>" +
      '<div class="path-go" style="margin-top:24px">' + (first
        ? '<a class="btn btn-primary btn-lg" href="' + K.actHref(L4, first) + '">' + (first.steps.some(store.step) ? "Continue with " : "Begin with ") + first.short + ui.icon("right") + "</a>"
        : '<p class="path-done">' + ui.icon("check") + 'All activities are completed.</p><a class="btn btn-ghost" href="#/lesson-5">Proceed to Lesson 5</a>') + "</div></section>" +
      '<section aria-labelledby="act-h"><h2 id="act-h" class="block-h">Learning Activities</h2><ul class="acts">' + acts + "</ul></section>";
  };

  /* ---------- Activity 1: Pre-writing ---------- */
  /* The class poll counts each answer under the first listed right it mentions, or under "Other rights". */
  var POLL = D.right.rights.map(function (r) { return r[0]; }).concat([D.right.other]);
  function classifyRight(text) {
    var t = " " + String(text || "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ") + " ";
    var best = D.right.other, at = Infinity;
    D.right.rights.forEach(function (r) {
      r[1].forEach(function (k) { var i = t.indexOf(" " + k); if (i >= 0 && i < at) { at = i; best = r[0]; } });
    });
    return best;
  }
  GU.views.l4think = function (page) {
    var a = act("l4-think");
    var steps = [
      { key: "l4t-right", title: "Rights in Adulthood", mount: function (el, done) {
        el.innerHTML = '<p class="step-intro">Think about the rights that come with turning 18, then share your view. After you post, a class poll shows which rights your classmates look forward to, and a sample answer appears.</p><div class="disc-slot"></div>';
        return GU.discuss.mount(el.querySelector(".disc-slot"), {
          board: "l4-right", prompts: [D.right.prompt], choices: POLL, classify: classifyRight,
          reference: { title: "Rights for Reference", items: D.right.rights.map(function (r) { return r[0]; }), note: "You may also write about any other right." },
          nameField: { label: "The right you write about", reviewLabel: "The right you wrote about", placeholder: "e.g. voting in elections, or travelling abroad on my own" },
          pollNote: "Each answer is counted under the right it names. Select a row to see the rights your classmates wrote about.",
          starters: D.right.starters, example: D.right.example, onPosted: done
        });
      } },
      { key: "l4t-adult", title: "Responsible Adulthood", mount: function (el, done) {
        el.innerHTML = '<p class="step-intro">Now think about the other side of adulthood. Your ideas here will help you write the second half of your essay.</p><div class="disc-slot"></div>';
        return K.boardStep({ board: "l4-adult", prompts: [D.adult.prompt], starters: D.adult.starters, example: D.adult.example })(el.querySelector(".disc-slot"), done);
      } }
    ];
    return stepper(page, a, steps, "Two Think &amp; Share questions on the rights and responsibilities of adulthood, from the reading lesson in the textbook.");
  };

  /* ---------- Activity 2: Guided Writing ---------- */
  function wordUsed(text, w) {
    var t = " " + text.toLowerCase().replace(/[’']/g, "'") + " ";
    var base = w.toLowerCase().replace(/\b(sth|sb)\b/g, "").replace(/\s+/g, " ").trim();
    if (!base) return false;
    if (base.indexOf(" ") >= 0) {
      var first = base.split(" ")[0], rest = base.slice(first.length);
      return new RegExp("[^a-z]" + reEsc(first.replace(/e$/, "")) + "[a-z]*" + reEsc(rest) + "[^a-z]").test(t);
    }
    var stem = base.length > 4 ? base.replace(/(e|y)$/, "") : base;
    return new RegExp("[^a-z]" + reEsc(stem) + "[a-z]{0,4}[^a-z]").test(t);
  }
  function bankItems() {
    var unit = GU.WORDS.map(function (w) { return { text: w.word, zh: w.zhShort || w.zh, insert: w.word }; });
    var seen = {};
    var expr = GU.L3.passage.expressions.map(function (x) {
      var w = x.word ? GU.wordById(x.word) || {} : {};
      var base = x.base || w.word;
      return { text: base, zh: x.zh || w.zh, insert: base.replace(/\b(sth|sb)\b/g, "").replace(/\s+/g, " ").replace(/\s*\(.*\)$/, "").trim() };
    }).filter(function (x) { if (seen[x.text] || GU.WORDS.some(function (w) { return w.word === x.text; })) return false; seen[x.text] = 1; return true; });
    return { unit: unit, expr: expr };
  }

  function pointsHit(text) {
    return T.points.map(function (p) { return p.any.some(function (k) { return K.hasKey(text, k.trim()) || (k.indexOf(" ") >= 0 && text.toLowerCase().indexOf(k) >= 0); }); });
  }

  function editorStep(el, done) {
    var B = bankItems();
    var tab = store.ui("l4bank") || "unit";
    el.innerHTML =
      '<div class="wr-task" lang="zh-CN">' + T.zh.map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("") +
      '<div class="wr-note">' + T.note.map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("") + "</div></div>" +
      '<div class="wr-grid">' +
      '<div class="wr-editor">' +
      '<p class="wr-title">' + T.title + "</p>" +
      '<label class="sr-only" for="wr-text">Your essay</label>' +
      '<textarea id="wr-text" class="wr-text" spellcheck="true" placeholder="Begin your essay here. Use the language bank for words, expressions and sentence patterns.">' + esc(draft()) + "</textarea>" +
      '<div class="wr-meter"><div class="wr-bar"><i></i><b class="wr-target" title="80 words"></b></div><span class="wr-count"></span></div>' +
      '<ul class="wr-points">' + T.points.map(function (p, i) { return '<li data-pt="' + i + '"><span class="wr-tick">' + ui.icon("check") + "</span>" + p.label + "</li>"; }).join("") + "</ul>" +
      '<div class="q-actions"><button class="btn btn-primary" type="button" data-submit>' + ui.icon("send") + "Submit My Draft</button>" +
      '<button class="link-btn" type="button" data-dl>' + ui.icon("download") + 'Download</button><span class="wr-saved" aria-live="polite"></span></div>' +
      '<p class="wr-msg" aria-live="polite"></p>' +
      "</div>" +
      '<aside class="bank" aria-label="Language bank"><p class="bank-h">' + ui.icon("book") + "Language Bank</p>" +
      '<div class="seg bank-tabs" role="tablist">' +
      [["unit", "Words"], ["expr", "Expressions"], ["pat", "Patterns"]].map(function (t) {
        return '<button role="tab" aria-selected="' + (tab === t[0]) + '" aria-checked="' + (tab === t[0]) + '" data-tab="' + t[0] + '">' + t[1] + "</button>";
      }).join("") + "</div>" +
      '<p class="bank-hint">Unit words, key expressions from the passage, and sentence patterns. Select an item to add it to your essay; items you have used are ticked.</p>' +
      '<div class="bank-body"></div></aside>' +
      "</div>";

    var ta = el.querySelector("#wr-text"), body = el.querySelector(".bank-body"), msg = el.querySelector(".wr-msg"), sv = el.querySelector(".wr-saved");
    function chip(x, kind) {
      return '<button type="button" class="bank-chip" data-ins="' + esc(x.insert) + '" data-kind="' + kind + '" title="' + esc(x.zh || "") + '"><span>' + esc(x.text) + '</span><small lang="zh-CN">' + esc(x.zh || "") + "</small></button>";
    }
    function drawBank() {
      if (tab === "pat") {
        body.innerHTML = D.patterns.map(function (g) {
          return '<p class="bank-g">' + g[0] + "</p>" + g[1].map(function (p) { return '<button type="button" class="bank-pat" data-ins="' + esc(p) + '" data-kind="pat">' + esc(p) + "</button>"; }).join("");
        }).join("") + '<p class="bank-g">Linking Words</p><div class="bank-chips">' + D.linking.map(function (l) {
          return '<button type="button" class="bank-chip is-link" data-ins="' + esc(l.replace(" … but also", "")) + '" data-kind="link"><span>' + esc(l) + "</span></button>";
        }).join("") + "</div>";
      } else {
        body.innerHTML = '<div class="bank-chips">' + (tab === "unit" ? B.unit : B.expr).map(function (x) { return chip(x, tab); }).join("") + "</div>";
      }
      markUsed();
    }
    function markUsed() {
      var t = ta.value;
      body.querySelectorAll(".bank-chip").forEach(function (c) {
        var label = c.querySelector("span").textContent;
        c.classList.toggle("is-used", wordUsed(t, c.dataset.kind === "link" ? label.replace(" … but also", "") : label));
      });
    }
    function insert(text) {
      var s = ta.selectionStart != null ? ta.selectionStart : ta.value.length, e = ta.selectionEnd != null ? ta.selectionEnd : s;
      var before = ta.value.slice(0, s), after = ta.value.slice(e);
      var pre = before && !/\s$/.test(before) ? " " : "";
      var post = after && !/^\s/.test(after) ? " " : "";
      ta.value = before + pre + text + post + after;
      var start = before.length + pre.length;
      var gap = text.indexOf("…");
      ta.focus();
      if (gap >= 0) ta.setSelectionRange(start + gap, start + gap + 1);
      else ta.setSelectionRange(start + text.length + post.length, start + text.length + post.length);
      update();
    }
    var saveT = null;
    function update() {
      var t = ta.value, n = words(t);
      el.querySelector(".wr-count").textContent = n + (n === 1 ? " word" : " words") + " · aim for about 80";
      var bar = el.querySelector(".wr-bar i");
      bar.style.width = Math.min(100, n / 110 * 100) + "%";
      el.querySelector(".wr-meter").className = "wr-meter " + (n < 60 ? "is-low" : n <= 100 ? "is-good" : "is-high");
      pointsHit(t).forEach(function (h, i) { el.querySelector('[data-pt="' + i + '"]').classList.toggle("is-on", h); });
      markUsed();
      clearTimeout(saveT);
      saveT = setTimeout(function () { store.answer("l4-draft", ta.value); sv.textContent = "Saved"; setTimeout(function () { sv.textContent = ""; }, 1200); }, 500);
    }
    ta.addEventListener("input", update);
    body.addEventListener("click", function (e) { var b = e.target.closest("[data-ins]"); if (b) insert(b.dataset.ins); });
    el.querySelectorAll("[data-tab]").forEach(function (b) {
      b.addEventListener("click", function () {
        tab = b.dataset.tab; store.ui("l4bank", tab);
        el.querySelectorAll("[data-tab]").forEach(function (x) { x.setAttribute("aria-selected", x === b); x.setAttribute("aria-checked", x === b); });
        drawBank();
      });
    });
    el.querySelector("[data-submit]").addEventListener("click", function () {
      var n = words(ta.value);
      if (n < 50) { msg.textContent = "Your draft has " + n + " words. Write at least 50 words before submitting; the target is about 80."; ta.focus(); return; }
      store.answer("l4-draft", ta.value);
      store.answer("l4-submitted", ta.value);
      msg.textContent = "";
      el.querySelector("[data-submit]").innerHTML = ui.icon("check") + "Draft Submitted";
      done();
    });
    el.querySelector("[data-dl]").addEventListener("click", function () {
      var blob = new Blob([T.title + "\n\n" + ta.value + "\n"], { type: "text/plain;charset=utf-8" });
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob); link.download = "me-at-eighteen.txt";
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(link.href); }, 2000);
    });
    drawBank();
    update();
    if (store.step("l4w-draft")) el.querySelector("[data-submit]").innerHTML = ui.icon("check") + "Submit Again";
    return { focus: function () { ta.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(function () { ta.focus({ preventScroll: true }); }, 400); } };
  }

  /* Feedback in teacher-hint mode (no AI service): content points, length, vocabulary, linking and mechanics. */
  function localFeedback(text) {
    var n = words(text), hits = pointsHit(text), B = bankItems();
    var usedUnit = B.unit.filter(function (x) { return wordUsed(text, x.text); }).map(function (x) { return x.text; });
    var usedExpr = B.expr.filter(function (x) { return wordUsed(text, x.text); }).map(function (x) { return x.text; });
    var links = D.linking.filter(function (l) { return wordUsed(text, l.replace(" … but also", "")); });
    var issues = [];
    var sents = text.split(/[.!?]+\s+/).filter(function (s) { return s.trim(); });
    if (/(^|[.!?]\s+)[a-z]/.test(text.trim())) issues.push("Begin every sentence with a capital letter.");
    if (/\bi\b/.test(text)) issues.push("Write the pronoun “I” as a capital letter.");
    if (text.trim() && !/[.!?]["”’]?$/.test(text.trim())) issues.push("End your last sentence with a full stop.");
    if (/\b(\w+)\s+\1\b/i.test(text)) issues.push("A word is repeated twice in a row: check for typing mistakes.");
    if (sents.some(function (s) { return words(s) > 35; })) issues.push("One sentence is very long. Split it into two for clarity.");
    if ((text.match(/\bvery\b/gi) || []).length > 2) issues.push("“Very” is used often. Try a more precise word.");
    var cover = hits.filter(Boolean).length;
    var score = 3 + cover * 2 + (n >= 70 && n <= 100 ? 2 : n >= 55 && n <= 115 ? 1 : 0) + Math.min(3, usedUnit.length + usedExpr.length > 4 ? 3 : Math.ceil((usedUnit.length + usedExpr.length) / 2)) + (links.length >= 3 ? 1 : 0) - Math.min(2, issues.length);
    score = Math.max(1, Math.min(14, score));
    return { local: true, score: score, n: n, hits: hits, usedUnit: usedUnit, usedExpr: usedExpr, links: links, issues: issues };
  }

  function bandOf(score) {
    var b = D.bands.filter(function (x) { return score >= x[0] && score <= x[1]; })[0] || D.bands[D.bands.length - 1];
    return b;
  }

  function markEssay(text, corrections) {
    var html = esc(text);
    (corrections || []).forEach(function (c, i) {
      var o = esc(c.original), at = html.indexOf(o);
      if (at < 0) return;
      html = html.slice(0, at) + '<mark data-c="' + i + '">' + o + "</mark>" + html.slice(at + o.length);
    });
    return html.replace(/\n/g, "<br>");
  }

  function feedbackStep(el, done, editor) {
    el.innerHTML =
      '<p class="step-intro">Get feedback on your submitted draft. Revise it in the editor above, then check it again. The feedback uses the marking bands of the gaokao applied writing task (15 marks).</p>' +
      '<div class="q-actions"><button class="btn btn-primary" type="button" data-ai>' + K.emoji("🤖") + "Get AI Feedback</button>" +
      '<button class="btn btn-ghost" type="button" data-revise>' + ui.icon("pen") + "Revise in the Editor</button></div>" +
      '<div class="fbk" aria-live="polite"></div>' +
      '<details class="wr-model"><summary>' + ui.icon("eye") + "Model Essay</summary><p class=\"wr-title-mini\">" + T.title + "</p><p>" + esc(T.model) + '</p><p class="wr-model-n">' + words(T.model) + " words</p></details>";
    var out = el.querySelector(".fbk"), btn = el.querySelector("[data-ai]");
    el.querySelector("[data-revise]").addEventListener("click", function () { editor.focus(); });

    function render(r, text) {
      var b = bandOf(r.score);
      var head = '<div class="fbk-head"><div class="fbk-score"><b>' + r.score + "</b><span>/15</span></div><div><p class=\"fbk-band\">" + (r.band || b[2]) + ' <span lang="zh-CN">' + b[3] + "</span>" +
        (r.local ? ' <em class="tag-opt">Estimate</em>' : "") + "</p><p>" + esc(r.summary || "") + "</p></div></div>";
      if (r.local) {
        out.innerHTML = head.replace("<p></p>", "<p>The AI service is not connected, so this estimate comes from automatic checks prepared by the teacher. Compare your essay with the model essay below.</p>") +
          '<div class="fbk-grid">' +
          '<section><h3>Content</h3><ul class="fbk-list">' + T.points.map(function (p, i) { return '<li class="' + (r.hits[i] ? "ok" : "miss") + '">' + (r.hits[i] ? ui.icon("check") : '<i aria-hidden="true"></i>') + p.label + (r.hits[i] ? "" : " <small>Not found</small>") + "</li>"; }).join("") + "</ul></section>" +
          "<section><h3>Length</h3><p>" + r.n + " words. " + (r.n < 70 ? "Add a sentence or two to develop your reason or the responsibility." : r.n > 100 ? "Cut repeated ideas to stay close to 80 words." : "Good: close to the required 80 words.") + "</p></section>" +
          "<section><h3>Vocabulary from the Unit</h3><p>" + (r.usedUnit.concat(r.usedExpr).length ? r.usedUnit.concat(r.usedExpr).map(function (w) { return "<b>" + esc(w.replace(/\s*\b(sth|sb)\b/g, "")) + "</b>"; }).join(", ") : "None yet. Use two or three items from the language bank, such as <b>take responsibility for</b> or <b>mature</b>.") + "</p></section>" +
          "<section><h3>Linking Words</h3><p>" + (r.links.length ? r.links.map(function (w) { return "<b>" + esc(w) + "</b>"; }).join(", ") + (r.links.length < 3 ? ". Add one or two more to connect your ideas." : ".") : "None found. Use words such as <b>however</b>, <b>in addition</b> and <b>therefore</b>.") + "</p></section>" +
          "</div>" +
          (r.issues.length ? '<section class="fbk-sec"><h3>Accuracy</h3><ul class="fbk-plain">' + r.issues.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></section>" : "");
        return;
      }
      out.innerHTML = head +
        '<div class="fbk-grid">' +
        '<section><h3>Strengths</h3><ul class="fbk-plain">' + (r.strengths || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></section>" +
        '<section><h3>Areas to Improve</h3><ul class="fbk-plain">' + (r.improvements || []).map(function (x) { return "<li><b>" + esc(x.area) + ".</b> " + esc(x.comment) + "</li>"; }).join("") + "</ul></section>" +
        "</div>" +
        ((r.corrections || []).length ? '<section class="fbk-sec"><h3>Corrections</h3><p class="fbk-essay">' + markEssay(text, r.corrections) + '</p><ol class="fbk-corr">' + r.corrections.map(function (c, i) {
          return '<li data-ci="' + i + '"><s>' + esc(c.original) + "</s>" + ui.icon("right") + "<b>" + esc(c.revised) + "</b><span>" + esc(c.reason) + "</span></li>";
        }).join("") + "</ol></section>" : "") +
        (r.polished ? '<section class="fbk-sec"><h3>Polished Version</h3><p class="fbk-note">Compare it with your draft, then revise your essay in your own words. Copying it will not improve your writing.</p>' +
          '<div class="fbk-compare"><div><p class="fbk-k">Your draft</p><p>' + esc(text).replace(/\n/g, "<br>") + '</p></div><div><p class="fbk-k">Polished</p><p>' + esc(r.polished).replace(/\n/g, "<br>") + "</p></div></div></section>" : "");
      out.querySelectorAll("mark[data-c]").forEach(function (m) {
        m.addEventListener("click", function () {
          var li = out.querySelector('[data-ci="' + m.dataset.c + '"]');
          li.scrollIntoView({ behavior: "smooth", block: "center" });
          li.classList.remove("is-flash"); void li.offsetWidth; li.classList.add("is-flash");
        });
      });
    }

    btn.addEventListener("click", function () {
      var text = draft();
      if (words(text) < 20) { out.innerHTML = '<p class="fb fb-info">' + ui.icon("bulb") + "<span>Write and submit your draft first.</span></p>"; return; }
      btn.disabled = true;
      out.innerHTML = '<p class="fbk-wait"><span class="tutor-typing"><i></i><i></i><i></i></span>Reading your essay…</p>';
      fetch("api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text }) })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (d) {
            if (r.status === 429 || r.status === 400) throw { msg: d.error };
            if (!r.ok) throw new Error("http " + r.status);
            return d;
          });
        })
        .then(function (d) { store.answer("l4-feedback", { at: Date.now(), r: d, text: text }); render(d, text); done(); })
        .catch(function (e) {
          if (e && e.msg) { out.innerHTML = '<p class="fb fb-info">' + ui.icon("bulb") + "<span>" + esc(e.msg) + "</span></p>"; return; }
          var r = localFeedback(text);
          store.answer("l4-feedback", { at: Date.now(), r: r, text: text });
          render(r, text); done();
        })
        .then(function () { btn.disabled = false; btn.innerHTML = K.emoji("🤖") + "Get Feedback Again"; });
    });
    var last = store.answer("l4-feedback");
    if (last && last.r) { render(last.r, last.text); btn.innerHTML = K.emoji("🤖") + "Get Feedback Again"; }
  }

  GU.views.l4write = function (page) {
    var a = act("l4-write");
    var editor = null;
    var steps = [
      { key: "l4w-draft", title: "Writing Task", mount: function (el, done) { editor = editorStep(el, done); } },
      { key: "l4w-feedback", title: "Feedback and Revision", mount: function (el, done) { feedbackStep(el, done, { focus: function () { editor.focus(); } }); } },
      /* Steps 3 and 4 open together: students may ask the teacher and share their essays in either order. */
      { key: "l4w-qa", title: "Questions and Answers", optional: true, mount: function (el, done) {
        el.innerHTML = '<p class="step-intro">Ask the teacher about your essay, a word or a sentence whenever you need to, and help classmates with their questions. The teacher replies within three days. This step is open at the same time as the Writing Showcase below.</p>' +
          '<div class="disc-slot"></div>';
        return GU.discuss.mount(el.querySelector(".disc-slot"), { board: "l4-qa", qa: true, onPosted: done, labels: { placeholder: "Ask about a word, a sentence or an idea in your essay." } });
      } },
      { key: "l4w-share", title: "Writing Showcase", together: true, mount: function (el, done) {
        el.innerHTML = '<p class="step-intro">Share your final essay with the class. After sharing, read your classmates’ essays, like the ones you enjoy, and reply with one specific comment. You can still ask the teacher questions in Step 3.</p><div class="disc-slot"></div>';
        return GU.discuss.mount(el.querySelector(".disc-slot"), {
          board: "l4-showcase", maxLen: 1200, minLen: 150, example: T.model, onPosted: done,
          prefill: function () { return draft(); },
          starters: null,
          labels: { tag: "Writing Showcase", answer: "Your essay: " + T.title, button: "Share My Essay", rows: 8, example: "Model Essay",
            placeholder: "Your essay appears here. Check it once more before sharing.",
            gate: "Share your own essay first. Your classmates’ essays will then appear here, and you can like them and reply with a comment." }
        });
      } }
    ];
    return stepper(page, a, steps, "An 80-word essay, <em>Me at Eighteen</em>, in the format of the gaokao applied writing task, with a language bank, AI feedback, questions to the teacher and a class showcase.");
  };
})();

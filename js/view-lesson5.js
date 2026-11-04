/* Lesson 5: End-of-Course Self-Reflection. A self-assessment against the three learning objectives,
   three reflection questions, and a learning record the student can keep. */
(function () {
  var ui = GU.ui, store = GU.store, K = GU.kit;
  var L5 = GU.LESSONS[4];
  var D = GU.L5;
  var A = L5.activities[0];
  function esc(t) { return ui.esc(t); }
  function rating(i) { return store.answer("l5-rate-" + i) || ""; }
  function scaleOf(id) { return D.scale.filter(function (s) { return s[0] === id; })[0]; }
  function words(t) { return String(t || "").trim().split(/\s+/).filter(Boolean).length; }

  /* ---------- Landing ---------- */
  GU.views.lesson5 = function (page) {
    var st = GU.shell.activityState(A);
    var n = A.steps.filter(store.step).length;
    page.innerHTML =
      '<header class="lesson-head">' +
      '<a class="crumb" href="#/overview">' + ui.icon("left") + "Course Overview</a>" +
      '<p class="lesson-kicker">Lesson 5 <span>' + L5.minutes + " minutes</span></p>" +
      "<h1>" + L5.title + "</h1>" +
      '<p class="lede">You have read what turning 18 means to Bethany, Lin Ning and Morgan, and written about what it will mean to you. Now look back on the unit: check yourself against its three learning objectives, then reflect on what you have learned.</p>' +
      "</header>" +
      '<section class="how" aria-labelledby="lo-h"><h2 id="lo-h">The Three Learning Objectives</h2>' +
      '<p class="how-note">By the end of the course, you should be able to:</p>' +
      '<ol class="sa-objs">' + D.objectives.map(function (o) { return "<li><b>" + o.title + "</b>" + esc(o.objective) + "</li>"; }).join("") + "</ol>" +
      '<div class="path-go" style="margin-top:24px">' + (st === "done"
        ? '<p class="path-done">' + ui.icon("check") + 'The self-reflection is completed.</p><a class="btn btn-ghost" href="' + K.actHref(L5, A) + '">Review My Learning Record</a>'
        : '<a class="btn btn-primary btn-lg" href="' + K.actHref(L5, A) + '">' + (n ? "Continue the Self-Reflection" : "Begin the Self-Reflection") + ui.icon("right") + "</a>") + "</div></section>" +
      '<section aria-labelledby="act-h"><h2 id="act-h" class="block-h">Learning Activity</h2><ul class="acts">' +
      '<li class="act' + (st === "done" ? " is-done" : "") + '">' + GU.shell.statusDot(st) +
      '<div class="act-body"><p class="act-label">' + A.label + '</p><h3><a href="' + K.actHref(L5, A) + '">' + A.title + "</a></h3>" +
      "<p>A self-assessment checklist on the three learning objectives, three reflection questions, and a learning record to download.</p></div>" +
      '<div class="act-side"><span class="act-time">' + (n ? n + " of " + A.steps.length + " steps completed" : "Approximately " + A.minutes + " minutes") + "</span>" +
      '<a class="btn ' + (st === "done" ? "btn-ghost" : "btn-primary") + ' btn-sm" href="' + K.actHref(L5, A) + '">' + (st === "done" ? "Review" : st === "partial" ? "Continue" : "Begin") + "</a></div></li></ul></section>";
  };

  /* ---------- Step 1: Self-assessment checklist ---------- */
  function checklistStep(el, done) {
    el.innerHTML = '<p class="step-intro">Rate yourself honestly against each learning objective. The activities where you practised it are listed below each one; a tick shows the steps you have completed.</p>' +
      '<ol class="sa-list">' + D.objectives.map(function (o, i) {
        return '<li class="sa-item" data-o="' + i + '"><p class="sa-k">Objective ' + (i + 1) + " · " + o.title + '</p><p class="sa-can">' + esc(o.can) + "</p>" +
          '<div class="sa-scale" role="radiogroup" aria-label="Objective ' + (i + 1) + '">' + D.scale.map(function (s) {
            return '<button type="button" role="radio" class="sa-opt sa-' + s[0] + '" data-r="' + s[0] + '" aria-checked="' + (rating(i) === s[0]) + '">' + s[1] + "</button>";
          }).join("") + "</div>" +
          '<p class="sa-prac"><span>Practised in</span>' + o.practised.map(function (p) {
            var ok = store.step(p[1]);
            return '<a href="' + p[0] + '" class="' + (ok ? "is-done" : "") + '">' + (ok ? ui.icon("check") : "") + p[2] + "</a>";
          }).join("") + "</p>" +
          '<p class="sa-fb" aria-live="polite"></p></li>';
      }).join("") + "</ol>" +
      '<p class="sa-msg" aria-live="polite"></p>';
    function paint() {
      D.objectives.forEach(function (o, i) {
        var li = el.querySelector('[data-o="' + i + '"]'), r = rating(i);
        li.className = "sa-item" + (r ? " is-" + r : "");
        li.querySelectorAll("[data-r]").forEach(function (b) { b.setAttribute("aria-checked", b.dataset.r === r); });
        li.querySelector(".sa-fb").textContent = r ? scaleOf(r)[2] : "";
      });
      var rated = D.objectives.filter(function (o, i) { return rating(i); }).length;
      el.querySelector(".sa-msg").textContent = rated < D.objectives.length ? rated + " of " + D.objectives.length + " objectives rated." : "";
      if (rated === D.objectives.length) done();
      if (GU.l5refresh) GU.l5refresh();
    }
    el.querySelectorAll("[data-r]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.closest("[data-o]").dataset.o;
        store.answer("l5-rate-" + i, b.dataset.r);
        paint();
      });
    });
    paint();
  }

  /* ---------- Step 2: Reflection questions ---------- */
  function questionsStep(el, done) {
    el.innerHTML = '<p class="step-intro">Answer each question in two or three sentences. Your reflections are private: they are saved on this device only and are not shared with the class.</p>' +
      D.questions.map(function (q, i) {
        return '<div class="rf-q" data-q="' + i + '"><p class="rf-k">Question ' + (i + 1) + '</p><p class="q-prompt">' + esc(q.prompt) + "</p>" +
          (q.hint ? '<p class="rf-hint">' + ui.icon("bulb") + "<span>" + esc(q.hint) + "</span></p>" : "") +
          '<label class="sr-only" for="' + q.id + '">Your answer to question ' + (i + 1) + "</label>" +
          '<textarea class="q-text" id="' + q.id + '" rows="3" maxlength="800" placeholder="Write your reflection here.">' + esc(store.answer(q.id) || "") + "</textarea>" +
          K.startersHtml(q.starters) + "</div>";
      }).join("") +
      '<div class="q-actions"><button class="btn btn-primary" type="button" data-save>' + ui.icon("check") + 'Save My Reflections</button><span class="wr-saved" aria-live="polite"></span></div>' +
      '<p class="sa-msg" aria-live="polite"></p>';
    el.querySelectorAll(".rf-q").forEach(function (box) {
      var ta = box.querySelector("textarea");
      K.bindStarters(box, ta);
      ta.addEventListener("input", function () { store.answer(ta.id, ta.value); });
    });
    el.querySelector("[data-save]").addEventListener("click", function () {
      var short = D.questions.filter(function (q) { return words(el.querySelector("#" + q.id).value) < 5; });
      var msg = el.querySelector(".sa-msg");
      if (short.length) {
        msg.textContent = "Write at least one full sentence for " + (short.length === 1 ? "question " + (D.questions.indexOf(short[0]) + 1) : "each question") + " before saving.";
        el.querySelector("#" + short[0].id).focus();
        return;
      }
      D.questions.forEach(function (q) { store.answer(q.id, el.querySelector("#" + q.id).value); });
      msg.textContent = "";
      el.querySelector(".wr-saved").textContent = "Saved";
      done();
      if (GU.l5refresh) GU.l5refresh();
    });
  }

  /* ---------- Step 3: Learning record ---------- */
  function record() {
    var p = store.progress(), earned = GU.BADGES.filter(function (b) { return store.hasBadge(b.id); }).length;
    return { p: p, earned: earned, player: (store.player() || {}).name || "" };
  }
  function recordText() {
    var r = record();
    var lines = ["Growing up · Unit 1: My Learning Record", (r.player ? "Name: " + r.player + "\n" : "") + "Date: " + new Date().toLocaleDateString(), "",
      "Course progress: " + r.p.done + " of " + r.p.total + " components completed (" + r.p.pct + "%), " + r.earned + " of " + GU.BADGES.length + " badges", "", "SELF-ASSESSMENT"];
    D.objectives.forEach(function (o, i) { lines.push((i + 1) + ". " + o.can, "   " + (rating(i) ? scaleOf(rating(i))[1] : "Not rated")); });
    lines.push("", "REFLECTIONS");
    D.questions.forEach(function (q, i) { lines.push((i + 1) + ". " + q.prompt, "   " + (store.answer(q.id) || "").trim(), ""); });
    return lines.join("\n");
  }
  function recordStep(el, done) {
    function draw() {
      var r = record();
      el.innerHTML = '<p class="step-intro">Your record of the unit. Download it to keep it, or to show your teacher, then complete the course.</p>' +
        '<div class="lr">' +
        '<div class="lr-stats"><div><b>' + r.p.pct + '%</b><span>Course progress</span></div><div><b>' + r.p.done + "/" + r.p.total + '</b><span>Components completed</span></div><div><b>' + r.earned + "/" + GU.BADGES.length + "</b><span>Badges earned</span></div></div>" +
        '<h3 class="lr-h">Self-Assessment</h3><ul class="lr-rates">' + D.objectives.map(function (o, i) {
          var s = rating(i) ? scaleOf(rating(i)) : null;
          return "<li><span>" + (i + 1) + ". " + esc(o.title) + '</span><b class="sa-tag' + (s ? " sa-" + s[0] : "") + '">' + (s ? s[1] : "Not rated") + "</b></li>";
        }).join("") + "</ul>" +
        '<h3 class="lr-h">Reflections</h3>' + D.questions.map(function (q, i) {
          var a = (store.answer(q.id) || "").trim();
          return '<div class="lr-q"><p class="lr-qp">' + (i + 1) + ". " + esc(q.prompt) + "</p><p>" + (a ? esc(a) : '<em>Not answered yet.</em>') + "</p></div>";
        }).join("") +
        "</div>" +
        '<div class="q-actions"><button class="btn btn-primary" type="button" data-finish>' + ui.icon("check") + (store.step("l5-record") ? "Course Completed" : "Complete the Course") + "</button>" +
        '<button class="btn btn-ghost" type="button" data-dl>' + ui.icon("download") + "Download My Learning Record</button></div>";
      el.querySelector("[data-finish]").addEventListener("click", function () { done(); draw(); });
      el.querySelector("[data-dl]").addEventListener("click", function () {
        var blob = new Blob([recordText() + "\n"], { type: "text/plain;charset=utf-8" });
        var link = document.createElement("a");
        link.href = URL.createObjectURL(blob); link.download = "growing-up-learning-record.txt";
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(function () { URL.revokeObjectURL(link.href); }, 2000);
      });
    }
    GU.l5refresh = draw;
    draw();
  }

  GU.views.l5reflect = function (page) {
    var steps = [
      { key: "l5-check", title: "Self-Assessment Checklist", mount: checklistStep },
      { key: "l5-questions", title: "Reflection Questions", mount: questionsStep },
      { key: "l5-record", title: "My Learning Record", mount: recordStep }
    ];
    var c = K.stepper(page, L5, A, steps, "A self-assessment against the three learning objectives of the unit, three reflection questions, and a learning record to keep.");
    return function () { GU.l5refresh = null; if (typeof c === "function") c(); };
  };
})();

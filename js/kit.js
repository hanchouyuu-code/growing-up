/* Shared building blocks for lesson activities: the step-by-step activity page, completion prompts,
   open questions, sentence starters and class discussion steps. */
(function () {
  var ui = GU.ui, store = GU.store;

  function emoji(e, cls) { return '<img class="' + (cls || "") + '" src="' + ui.emojiSrc(e) + '" alt="">'; }
  function bili(bvid) { return "https://player.bilibili.com/player.html?isOutside=true&amp;bvid=" + bvid + "&amp;p=1&amp;autoplay=0&amp;danmaku=0"; }
  function actHref(lesson, a) { return "#/" + lesson.id + "/" + a.id; }
  function inPath(lesson, a) { return store.lessonActs(lesson).indexOf(a) >= 0; }
  function nextLesson(lesson) {
    var nx = GU.LESSONS[lesson.n];
    return nx ? { href: "#/" + nx.id, label: "Proceed to Lesson " + nx.n } : { href: "#/overview", label: "Return to the Course Overview" };
  }

  /* Award the lesson badge once every activity on the lesson's path is complete. */
  function checkLesson(lesson, quiet) {
    var acts = store.lessonActs(lesson);
    if (!acts.length || !acts.every(function (a) { return store.isDone(a.id); })) return false;
    if (store.award(lesson.id)) {
      if (!quiet) ui.celebrate(lesson.id, nextLesson(lesson));
      else ui.toast("Badge earned");
      return true;
    }
    return false;
  }

  /* Where to go after an activity: the next unfinished activity on the path, then the next lesson.
     An activity outside the path is offered as an optional extra. */
  function nextAfter(lesson, a) {
    var rest = store.lessonActs(lesson).filter(function (x) { return x !== a && !store.isDone(x.id); })[0];
    var extra = lesson.activities.filter(function (x) { return x !== a && !inPath(lesson, x) && !store.isDone(x.id); })[0];
    return {
      main: rest ? { href: actHref(lesson, rest), label: "Proceed to " + rest.label + ": " + rest.short } : nextLesson(lesson),
      extra: !rest && extra ? { href: actHref(lesson, extra), label: "Try the Optional " + extra.short } : null,
      lessonDone: !rest
    };
  }


  function nextButtons(n) {
    return '<a class="btn btn-primary" href="' + n.main.href + '">' + ui.esc(n.main.label) + ui.icon("right") + "</a>" +
      (n.extra ? '<a class="link-quiet" href="' + n.extra.href + '">' + ui.esc(n.extra.label) + "</a>" : "");
  }

  /* Prompt shown the moment an activity is completed (the lesson badge has its own celebration). */
  function completedPrompt(lesson, a, n) {
    var html = '<div class="celebrate done-prompt">' +
      '<span class="done-ic">' + ui.icon("check") + "</span>" +
      '<p class="celebrate-kicker">' + a.label + " Completed</p>" +
      "<h2>" + ui.esc(a.title) + "</h2>" +
      "<p>" + (n.lessonDone ? "All activities in this lesson are completed." : "The next activity is ready.") + "</p>" +
      '<div class="celebrate-actions">' + nextButtons(n).replace('class="btn btn-primary"', 'class="btn btn-primary" data-autofocus') +
      '<button class="btn btn-ghost" data-close>Remain on This Page</button></div></div>';
    ui.modal(html, { cls: "modal-celebrate", label: a.label + " completed", onOpen: function (m, close) {
      m.querySelectorAll("a.btn").forEach(function (x) { x.addEventListener("click", function () { close(); }); });
    } });
  }

  /* Steps unlock one after another. Each step mounts once and keeps its own state. */
  function stepper(page, lesson, a, steps, intro) {
    var opt = !inPath(lesson, a);
    page.innerHTML =
      '<header class="act-hero">' +
      '<div class="act-meta"><a class="crumb" href="#/' + lesson.id + '">' + ui.icon("left") + "Lesson " + lesson.n + "</a>" +
      "<span>" + a.label + "</span><span>" + a.minutes + " min</span>" + (opt ? '<span class="tag-opt">Optional</span>' : "") + "</div>" +
      "<h1>" + a.title + "</h1>" +
      '<p class="lede is-clamped" tabindex="0">' + intro + "</p>" +
      '<ol class="step-track" aria-label="Steps">' + steps.map(function (s, i) {
        return '<li data-track="' + i + '"><span class="stn">' + (i + 1) + '</span><span class="stl">' + s.title + "</span></li>";
      }).join("") + "</ol>" +
      '<div class="act-banner" hidden></div>' +
      "</header>" +
      steps.map(function (s, i) {
        return '<section class="step" id="step-' + (i + 1) + '" data-step="' + i + '" aria-labelledby="sh-' + i + '">' +
          '<header class="step-h"><div class="step-ht"><p class="step-k">Step ' + (i + 1) + " of " + steps.length + "</p>" +
          '<h2 id="sh-' + i + '">' + s.title + '</h2></div><span class="step-st"></span></header>' +
          '<div class="step-body"></div></section>';
      }).join("") +
      '<div class="act-end" hidden></div>';

    var mounted = [];
    var cleanups = [];

    function sync(justDone) {
      var unlocked = true;
      steps.forEach(function (s, i) {
        var sec = page.querySelector('[data-step="' + i + '"]');
        var body = sec.querySelector(".step-body");
        var done = store.step(s.key);
        sec.classList.toggle("is-done", done);
        sec.classList.toggle("is-locked", !unlocked);
        sec.querySelector(".step-st").innerHTML = done ? '<span class="pill pill-done">' + ui.icon("check") + "Completed</span>" : "";
        page.querySelector('[data-track="' + i + '"]').className = done ? "is-done" : unlocked ? "is-cur" : "";
        if (unlocked && !mounted[i]) {
          mounted[i] = true;
          body.innerHTML = "";
          var c = s.mount(body, function () { if (store.setStep(s.key)) sync(i); });
          if (typeof c === "function") cleanups.push(c);
        } else if (!unlocked) {
          body.innerHTML = '<p class="step-lock">' + ui.icon("lock") + "This step opens after Step " + i + " is completed.</p>";
        }
        unlocked = unlocked && done;
      });

      if (!steps.every(function (s) { return store.step(s.key); })) {
        if (justDone != null) {
          var nx = page.querySelector('[data-step="' + (justDone + 1) + '"]');
          setTimeout(function () { nx.scrollIntoView({ behavior: "smooth", block: "start" }); }, 250);
        }
        return;
      }
      var first = store.complete(a.id);
      var n = nextAfter(lesson, a);
      var end = page.querySelector(".act-end");
      end.hidden = false;
      end.innerHTML = '<span class="tag-done">' + ui.icon("check") + a.label + " completed</span>" +
        '<div class="act-end-go">' + nextButtons(n) + "</div>";
      /* Once finished, the step line gives way to the one next action. */
      var ban = page.querySelector(".act-banner");
      page.querySelector(".step-track").hidden = true;
      ban.hidden = false;
      ban.innerHTML = '<span class="tag-done">' + ui.icon("check") + "All " + steps.length + " steps completed</span>" + nextButtons(n);
      if (first && !checkLesson(lesson, false)) completedPrompt(lesson, a, n);
    }
    sync(null);
    return function () { cleanups.forEach(function (c) { try { c(); } catch (e) {} }); };
  }

  /* Adds a sentence starter and selects its first gap (…), so that typing fills it in. */
  function insertStarter(ta, starter) {
    var base = ta.value ? ta.value.replace(/\s*$/, " ") : "";
    ta.value = base + starter;
    ta.focus();
    var gap = ta.value.indexOf("…", base.length);
    if (gap >= 0) ta.setSelectionRange(gap, gap + 1);
    else ta.setSelectionRange(ta.value.length, ta.value.length);
    ta.dispatchEvent(new Event("input"));
  }

  function startersHtml(list) {
    return '<div class="starters"><span>Sentence starters:</span>' + list.map(function (s) {
      return '<button type="button" data-starter="' + ui.esc(s) + '">' + ui.esc(s) + "</button>";
    }).join("") + "</div>";
  }
  function bindStarters(el, ta) {
    el.querySelectorAll("[data-starter]").forEach(function (b) {
      b.addEventListener("click", function () { insertStarter(ta, b.dataset.starter); });
    });
  }

  /* Matches a keyword at the start of a word in the answer. */
  function hasKey(text, kw) {
    var t = " " + String(text).toLowerCase().replace(/[^a-z0-9]+/g, " ") + " ";
    return t.indexOf(" " + kw) >= 0;
  }

  /* An open question with key-point feedback and the reference answer. */
  function openQuestion(el, q, key, done) {
    var saved = store.answer(key) || "";
    el.innerHTML =
      '<p class="q-prompt">' + q.prompt + "</p>" +
      '<label class="sr-only" for="ta-' + key + '">Your answer</label>' +
      '<textarea class="q-text" id="ta-' + key + '" rows="4" maxlength="800" placeholder="Write your answer in full sentences.">' + ui.esc(saved) + "</textarea>" +
      startersHtml(q.starters) +
      '<div class="q-actions"><button class="btn btn-primary" type="button" data-check>' + ui.icon("check") + "Check My Answer</button></div>" +
      '<div class="q-fb" aria-live="polite"></div>';
    var ta = el.querySelector("textarea");
    var fb = el.querySelector(".q-fb");
    bindStarters(el, ta);
    ta.addEventListener("input", function () { store.answer(key, ta.value); });

    function check(silent) {
      var text = ta.value.trim();
      if (text.split(/\s+/).length < 5) {
        if (!silent) fb.innerHTML = '<p class="fb fb-info">' + ui.icon("bulb") + "Write at least one full sentence, then check your answer.</p>";
        return;
      }
      store.answer(key, ta.value);
      var hits = q.points.map(function (p) { return p.any.some(function (k) { return hasKey(text, k); }); });
      var n = hits.filter(Boolean).length;
      var all = n === q.points.length;
      fb.innerHTML =
        '<div class="kp"><p class="kp-h">Key Points</p><ul>' + q.points.map(function (p, i) {
          return '<li class="' + (hits[i] ? "is-hit" : "is-miss") + '">' + (hits[i] ? ui.icon("check") : '<i aria-hidden="true"></i>') +
            "<span>" + ui.esc(p.label) + (hits[i] ? "" : " <small>Not yet mentioned</small>") + "</span></li>";
        }).join("") + "</ul></div>" +
        '<p class="fb ' + (all ? "fb-ok" : "fb-info") + '">' + (all
          ? ui.icon("check") + "<span>Well done. Your answer covers all " + q.points.length + " key points.</span>"
          : ui.icon("bulb") + "<span>Your answer covers " + n + " of " + q.points.length + " key points. Add the missing " + (q.points.length - n === 1 ? "point" : "points") + " and check again, or compare your answer with the reference answer.</span>") + "</p>" +
        '<div class="ref"><p class="ref-h">Reference Answer</p><p>' + ui.esc(q.reference) + "</p></div>";
      done();
    }
    el.querySelector("[data-check]").addEventListener("click", function () { check(false); });
    if (saved && store.step(key)) check(true);
  }

  function lev1(a, b) {
    if (Math.abs(a.length - b.length) > 1) return false;
    var i = 0, j = 0, diff = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++diff > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return diff + (a.length - i) + (b.length - j) <= 1;
  }
  function boardStep(o) {
    return function (el, done) {
      return GU.discuss.mount(el, {
        board: o.board, prompts: o.prompts, choices: o.choices, maxChoices: o.maxChoices,
        starters: o.starters, example: o.example, onPosted: done
      });
    };
  }


  GU.kit = {
    emoji: emoji, bili: bili, actHref: actHref, inPath: inPath, nextLesson: nextLesson, checkLesson: checkLesson, nextAfter: nextAfter,
    nextButtons: nextButtons, stepper: stepper, insertStarter: insertStarter, startersHtml: startersHtml, bindStarters: bindStarters,
    hasKey: hasKey, openQuestion: openQuestion, boardStep: boardStep, lev1: lev1
  };
  GU.insertStarter = insertStarter;
})();

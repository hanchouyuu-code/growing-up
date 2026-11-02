/* Lesson 2: Starting Out. Landing page with three learning paths, Activity 1 (video) and Activity 2 (poem). */
(function () {
  var ui = GU.ui, store = GU.store;
  var L2 = GU.LESSONS[1];
  var D = GU.L2;

  function href(a) { return "#/lesson-2/" + a.id; }
  function act(id) { return L2.activities.filter(function (a) { return a.id === id; })[0]; }
  function inPath(a) { return store.lessonActs(L2).indexOf(a) >= 0; }
  function pathOf() { var id = store.path("lesson-2") || "both"; return L2.paths.filter(function (p) { return p.id === id; })[0]; }
  function emoji(e, cls) { return '<img class="' + (cls || "") + '" src="' + ui.emojiSrc(e) + '" alt="">'; }
  function bili(bvid) { return "https://player.bilibili.com/player.html?isOutside=true&amp;bvid=" + bvid + "&amp;p=1&amp;autoplay=0&amp;danmaku=0"; }
  var PATH_PIC = { video: ["🎬"], poem: ["📜"], both: ["🎬", "📜"] };

  /* Award the Lesson 2 badge once every activity on the chosen path is complete. */
  function checkLesson(quiet) {
    var acts = store.lessonActs(L2);
    if (!acts.length || !acts.every(function (a) { return store.isDone(a.id); })) return false;
    if (store.award("lesson-2")) {
      if (!quiet) ui.celebrate("lesson-2", { href: "#/lesson-3", label: "Proceed to Lesson 3" });
      else ui.toast("Badge earned: Branching Out");
      return true;
    }
    return false;
  }

  /* Where to go after an activity: the next unfinished activity on the path, then Lesson 3.
     An activity outside the path is offered as an optional extra. */
  function nextAfter(a) {
    var rest = store.lessonActs(L2).filter(function (x) { return x !== a && !store.isDone(x.id); })[0];
    var extra = L2.activities.filter(function (x) { return x !== a && !inPath(x) && !store.isDone(x.id); })[0];
    return {
      main: rest ? { href: href(rest), label: "Proceed to " + rest.label + ": " + rest.short } : { href: "#/lesson-3", label: "Proceed to Lesson 3" },
      extra: !rest && extra ? { href: href(extra), label: "Try the Optional " + extra.short } : null,
      lessonDone: !rest
    };
  }

  /* ---------- Landing ---------- */
  GU.views.lesson2 = function (page) {
    function draw() {
      var cur = pathOf();
      var paths = L2.paths.map(function (p) {
        var on = p.id === cur.id;
        var acts = L2.activities.filter(function (a) { return p.acts.indexOf(a.id) >= 0; });
        var done = acts.filter(function (a) { return store.isDone(a.id); }).length;
        var prog = done === acts.length ? '<span class="path-prog is-done">' + ui.icon("check") + "Completed</span>"
          : done ? '<span class="path-prog">' + done + " of " + acts.length + " completed</span>" : "";
        return '<button class="path-card' + (on ? " is-on" : "") + '" role="radio" aria-checked="' + on + '" data-path="' + p.id + '">' +
          '<span class="path-top"><span class="path-pics">' + PATH_PIC[p.id].map(function (e) { return emoji(e); }).join("") + "</span>" +
          (p.recommended ? '<em class="tag-rec">Recommended</em>' : "") + "</span>" +
          "<b>" + p.name + '</b><span class="path-min">' + ui.icon("clock") + p.minutes + " minutes</span>" +
          '<span class="path-desc">' + p.desc + "</span>" +
          '<span class="path-foot"><span class="path-sel">' + (on ? ui.icon("check") + "Selected" : "Select This Path") + "</span>" + prog + "</span></button>";
      }).join("");

      var first = store.lessonActs(L2).filter(function (a) { return !store.isDone(a.id); })[0];
      page.innerHTML =
        '<header class="lesson-head">' +
        '<a class="crumb" href="#/overview">' + ui.icon("left") + "Course Overview</a>" +
        '<p class="lesson-kicker">Lesson 2 <span>20 minutes</span></p>' +
        "<h1>Starting Out</h1>" +
        '<p class="lede">This lesson introduces the theme of the unit through coming-of-age ceremonies around the world and Rudyard Kipling’s poem <em>If—</em>, a father’s advice to his son on growing up.</p>' +
        "</header>" +
        '<section class="how paths" aria-labelledby="paths-h">' +
        '<h2 id="paths-h">Learning Paths</h2>' +
        '<p class="how-note">Select one of three paths. The path can be changed at any time, and completed work is kept.</p>' +
        '<div class="path-grid" role="radiogroup" aria-labelledby="paths-h">' + paths + "</div>" +
        '<div class="path-go">' + (first
          ? '<a class="btn btn-primary btn-lg" href="' + href(first) + '">' + (first.steps.some(store.step) ? "Continue with " : "Begin with ") + first.short + ui.icon("right") + "</a>"
          : '<p class="path-done">' + ui.icon("check") + 'All activities on this path are completed.</p><a class="btn btn-ghost" href="#/lesson-3">Proceed to Lesson 3</a>') + "</div>" +
        "</section>";

      page.querySelectorAll("[data-path]").forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.dataset.path === cur.id) return;
          store.path("lesson-2", b.dataset.path);
          draw();
          var nb = page.querySelector('[data-path="' + b.dataset.path + '"]');
          if (nb) nb.focus();
          checkLesson(false);
        });
      });
    }
    draw();
  };

  /* ---------- Shared pieces for the two activities ---------- */

  function nextButtons(n) {
    return '<a class="btn btn-primary" href="' + n.main.href + '">' + ui.esc(n.main.label) + ui.icon("right") + "</a>" +
      (n.extra ? '<a class="btn btn-ghost" href="' + n.extra.href + '">' + ui.esc(n.extra.label) + "</a>" : "");
  }

  /* Prompt shown the moment an activity is completed (the lesson badge has its own celebration). */
  function completedPrompt(a, n) {
    var html = '<div class="celebrate done-prompt">' +
      '<span class="done-ic">' + ui.icon("check") + "</span>" +
      '<p class="celebrate-kicker">' + a.label + " Completed</p>" +
      "<h2>" + ui.esc(a.title) + "</h2>" +
      "<p>" + (n.lessonDone ? "All activities on your learning path are completed." : "The next activity on your learning path is ready.") + "</p>" +
      '<div class="celebrate-actions">' + nextButtons(n).replace('class="btn btn-primary"', 'class="btn btn-primary" data-autofocus') +
      '<button class="btn btn-ghost" data-close>Remain on This Page</button></div></div>';
    ui.modal(html, { cls: "modal-celebrate", label: a.label + " completed", onOpen: function (m, close) {
      m.querySelectorAll("a.btn").forEach(function (x) { x.addEventListener("click", function () { close(); }); });
    } });
  }

  /* Steps unlock one after another. Each step mounts once and keeps its own state. */
  function stepper(page, a, steps, intro) {
    var opt = !inPath(a);
    page.innerHTML =
      '<header class="lesson-head">' +
      '<a class="crumb" href="#/lesson-2">' + ui.icon("left") + "Lesson 2: Starting Out</a>" +
      '<p class="lesson-kicker">' + a.label + " <span>Approximately " + a.minutes + " minutes</span>" + (opt ? ' <em class="tag-opt">Optional on your path</em>' : "") + "</p>" +
      "<h1>" + a.title + "</h1>" +
      '<p class="lede">' + intro + "</p>" +
      '<ol class="step-track" aria-label="Steps">' + steps.map(function (s, i) {
        return '<li data-track="' + i + '"><span>' + (i + 1) + "</span>" + s.title + "</li>";
      }).join("") + "</ol>" +
      '<div class="act-banner" hidden></div>' +
      "</header>" +
      steps.map(function (s, i) {
        return '<section class="step" id="step-' + (i + 1) + '" data-step="' + i + '" aria-labelledby="sh-' + i + '">' +
          '<header class="step-h"><span class="step-n">' + (i + 1) + '</span><div class="step-ht"><p class="step-k">Step ' + (i + 1) + " of " + steps.length + "</p>" +
          '<h2 id="sh-' + i + '">' + s.title + '</h2></div><span class="step-st"></span></header>' +
          '<div class="step-body"></div></section>';
      }).join("") +
      '<div class="act-end" hidden></div>';

    var mounted = [];
    var cleanups = [];
    var wasDone = store.isDone(a.id);

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
      var n = nextAfter(a);
      var end = page.querySelector(".act-end");
      end.hidden = false;
      end.innerHTML = '<span class="act-end-ic">' + ui.icon("check") + "</span><div><h2>" + a.label + " Completed</h2>" +
        "<p>" + (opt ? "This activity is optional on your current path." : "Your answers are saved on this device and in the class discussion.") + "</p></div>" +
        '<div class="act-end-go">' + nextButtons(n) + "</div>";
      /* Returning to a finished activity: the way forward is shown at the top as well. */
      if (wasDone) {
        var ban = page.querySelector(".act-banner");
        ban.hidden = false;
        ban.innerHTML = '<span>' + ui.icon("check") + "This activity is completed.</span>" + nextButtons(n);
      }
      if (first && !checkLesson(false)) completedPrompt(a, n);
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
  GU.insertStarter = insertStarter;

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

  /* Table completion: Place is given; students fill in Age and How. */
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
  function howOk(text, keys) {
    var words = String(text).toLowerCase().replace(/[^a-z]+/g, " ").trim().split(" ").filter(Boolean);
    var joined = words.join("");
    return keys.some(function (k) {
      if (joined.indexOf(k) === 0 && k.length >= 4) return true;
      return words.some(function (w) { return w.indexOf(k) === 0 || (k.length >= 5 && lev1(w, k)); });
    });
  }
  function ageOk(text, ages) {
    var toks = String(text).toLowerCase().match(/\d+|[a-z]+/g) || [];
    toks = toks.filter(function (t) { return /\d/.test(t) || ["twenty", "fifteen", "nine", "ten", "sixteen", "eleven", "twelve", "fourteen", "eighteen"].indexOf(t) >= 0; });
    return toks.length > 0 && toks.every(function (t) { return ages.indexOf(t) >= 0; });
  }

  function tableQuestion(el, q, key, done) {
    var saved = store.answer(key) || {};
    var shown = false;
    el.innerHTML =
      '<p class="q-prompt">' + q.prompt + "</p>" +
      '<div class="table-wrap ft-wrap"><table class="ft"><thead><tr><th scope="col">Place</th><th scope="col">Age</th><th scope="col">How</th></tr></thead><tbody>' +
      q.rows.map(function (r, i) {
        return "<tr>" + (r.place ? '<th scope="row"' + (r.span ? ' rowspan="' + r.span + '"' : "") + ">" + r.place + "</th>" : "") +
          '<td class="ft-age"><input class="ft-in" data-cell="a' + i + '" inputmode="text" autocomplete="off" aria-label="Age, ' + ui.esc(placeOf(i)) + ", row " + (i + 1) + '" value="' + ui.esc(saved["a" + i] || "") + '"><span class="ft-ans" hidden></span></td>' +
          '<td class="ft-how"><input class="ft-in" data-cell="h' + i + '" autocomplete="off" aria-label="How, ' + ui.esc(placeOf(i)) + ", row " + (i + 1) + '" value="' + ui.esc(saved["h" + i] || "") + '"><span class="ft-ans" hidden></span></td></tr>';
      }).join("") + "</tbody></table></div>" +
      '<div class="q-actions"><button class="btn btn-primary" type="button" data-check>' + ui.icon("check") + "Check My Answers</button>" +
      '<button class="btn btn-ghost" type="button" data-show hidden>' + ui.icon("eye") + "Show the Answers</button></div>" +
      '<div class="q-fb" aria-live="polite"></div>';
    function placeOf(i) { for (var j = i; j >= 0; j--) if (q.rows[j].place) return q.rows[j].place; return ""; }

    var inputs = [].slice.call(el.querySelectorAll(".ft-in"));
    var fb = el.querySelector(".q-fb");
    var showBtn = el.querySelector("[data-show]");
    inputs.forEach(function (inp) {
      inp.addEventListener("input", function () {
        saved[inp.dataset.cell] = inp.value; store.answer(key, saved);
        inp.parentNode.classList.remove("is-ok", "is-wrong");
      });
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); var k = inputs.indexOf(inp); if (inputs[k + 1]) inputs[k + 1].focus(); else check(false); }
      });
    });

    function check(silent) {
      if (!inputs.some(function (x) { return x.value.trim(); })) {
        if (!silent) fb.innerHTML = '<p class="fb fb-info">' + ui.icon("bulb") + "<span>Fill in the table first.</span></p>";
        return;
      }
      var right = 0;
      q.rows.forEach(function (r, i) {
        var a = el.querySelector('[data-cell="a' + i + '"]'), h = el.querySelector('[data-cell="h' + i + '"]');
        var okA = ageOk(a.value, r.ages), okH = howOk(h.value, r.keys);
        a.parentNode.classList.toggle("is-ok", okA); a.parentNode.classList.toggle("is-wrong", !okA);
        h.parentNode.classList.toggle("is-ok", okH); h.parentNode.classList.toggle("is-wrong", !okH);
        right += okA + okH;
      });
      var total = q.rows.length * 2, all = right === total;
      fb.innerHTML = '<p class="fb ' + (all ? "fb-ok" : "fb-info") + '">' + (all
        ? ui.icon("check") + "<span>All " + total + " cells are correct.</span>"
        : ui.icon("bulb") + "<span>" + right + " of " + total + " cells are correct. Correct the cells marked in red and check again, or show the answers.</span>") + "</p>" +
        (all || shown ? modelHtml() : "");
      showBtn.hidden = all || shown;
      done();
    }
    function modelHtml() { return '<div class="ref"><p class="ref-h">Model Answer in Sentences</p><p>' + ui.esc(q.model) + "</p></div>"; }
    function show() {
      shown = true;
      q.rows.forEach(function (r, i) {
        [["a", r.age], ["h", r.how]].forEach(function (c) {
          var inp = el.querySelector('[data-cell="' + c[0] + i + '"]');
          var ans = inp.parentNode.querySelector(".ft-ans");
          if (!inp.parentNode.classList.contains("is-ok")) { ans.hidden = false; ans.textContent = c[1]; }
        });
      });
      showBtn.hidden = true;
      if (!fb.querySelector(".ref")) fb.insertAdjacentHTML("beforeend", modelHtml());
      done();
    }
    el.querySelector("[data-check]").addEventListener("click", function () { check(false); });
    showBtn.addEventListener("click", show);
    if (store.step("l2v-q1") && Object.keys(saved).length) check(true);
  }

  function boardStep(o) {
    return function (el, done) {
      return GU.discuss.mount(el, {
        board: o.board, prompts: o.prompts, choices: o.choices, maxChoices: o.maxChoices,
        starters: o.starters, example: o.example, onPosted: done
      });
    };
  }

  function commonsUrl(file, w) { return "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(file) + "?width=" + (w || 800); }

  /* ---------- Activity 1: Video Time ---------- */
  GU.views.l2video = function (page) {
    var a = act("l2-video");
    var steps = [
      { key: "l2v-warm", title: "Warm-Up Discussion", mount: function (el, done) {
        el.innerHTML =
          '<p class="step-intro">Look at the photographs of coming-of-age celebrations. Then answer the questions in the class discussion.</p>' +
          '<div class="gallery">' + D.photos.map(function (p, i) {
            return '<figure class="ph"><div class="ph-img" data-ph="' + i + '"><img src="' + commonsUrl(p.file) + '" alt="' + ui.esc(p.caption) + '" loading="lazy"></div>' +
              "<figcaption><b>" + ui.esc(p.place) + "</b><span>" + ui.esc(p.caption) + "</span></figcaption></figure>";
          }).join("") + "</div>" +
          '<div class="disc-slot"></div>';
        el.querySelectorAll(".ph-img img").forEach(function (img) {
          img.addEventListener("error", function () {
            var box = img.parentNode;
            box.classList.add("is-fallback");
            box.innerHTML = emoji(D.photos[+box.dataset.ph].emoji);
          });
        });
        return boardStep({ board: "l2-warmup", prompts: D.warmupPrompts, starters: D.warmupStarters, example: D.warmupExample })(el.querySelector(".disc-slot"), done);
      } },
      { key: "l2v-watch", title: "Video Viewing", mount: function (el, done) {
        var v = D.video;
        el.innerHTML =
          '<div class="focus"><p class="focus-h">' + ui.icon("eye") + "Viewing Focus</p><ul>" +
          "<li>Where does each celebration take place?</li><li>Who takes part, and at what age?</li><li>What do people do during the celebration?</li></ul></div>" +
          '<div class="bili-frame"><iframe src="' + bili(v.bvid) + '" title="' + ui.esc(v.title) + '" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe></div>' +
          '<div class="watch-bar"><a class="link-btn" href="' + v.url + '" target="_blank" rel="noopener">' + ui.icon("external") + "Open the Video on Bilibili</a>" +
          '<span class="watch-len">' + ui.icon("clock") + "Length: " + v.length + "</span>" +
          '<button class="btn btn-primary" type="button" data-watched>' + (store.step("l2v-watch") ? ui.icon("check") + "Video Watched" : "I Have Watched the Video") + "</button></div>";
        var btn = el.querySelector("[data-watched]");
        btn.addEventListener("click", function () { btn.innerHTML = ui.icon("check") + "Video Watched"; done(); });
      } },
      { key: "l2v-q1", title: "Comprehension Question", mount: function (el, done) { tableQuestion(el, D.q1, "l2v-table", done); } },
      { key: "l2v-q2", title: "Personal Response", mount: function (el, done) {
        el.innerHTML = '<p class="step-intro">Choose the celebration that impresses you most, explain why, and then read and respond to your classmates’ choices.</p><div class="disc-slot"></div>';
        return boardStep({ board: "l2-impression", prompts: [D.q2.prompt], choices: D.q2.choices, maxChoices: 1, starters: D.q2.starters, example: D.q2.example })(el.querySelector(".disc-slot"), done);
      } }
    ];
    return stepper(page, a, steps, "Coming-of-age ceremonies mark the passage from childhood to adulthood. This activity looks at how people in different places and times celebrate this moment.");
  };

  /* ---------- Activity 2: Poetry Reading ---------- */
  GU.views.l2poem = function (page) {
    var a = act("l2-poem");
    var reader = null;
    var steps = [
      { key: "l2p-listen", title: "Listening and Reading", mount: function (el, done) {
        reader = poemReader(el, D.poem, done);
        return reader.stop;
      } },
      { key: "l2p-q1", title: "The Theme of the Poem", mount: function (el, done) { openQuestion(el, D.pq1, "l2p-q1", done); } },
      { key: "l2p-q2", title: "The Qualities in the Poem", mount: function (el, done) { tickQuestion(el, D.pq2, function (n) { if (reader) reader.show(n); }, done); } },
      { key: "l2p-q3", title: "Personal Response", mount: function (el, done) {
        el.innerHTML = '<p class="step-intro">Choose up to two qualities, explain your choice, and then read and respond to your classmates’ answers.</p><div class="disc-slot"></div>';
        return boardStep({ board: "l2-qualities", prompts: [D.pq3.prompt], choices: D.pq3.choices, maxChoices: D.pq3.maxChoices, starters: D.pq3.starters, example: D.pq3.example })(el.querySelector(".disc-slot"), done);
      } }
    ];
    return stepper(page, a, steps, "In <em>If—</em>, written in 1910, Rudyard Kipling sets out the qualities a young person needs in order to grow into a mature adult.");
  };

  /* Michael Caine's recitation, the poem in English and Chinese side by side, and a notes column. */
  function poemReader(el, P, done) {
    var showZh = store.ui("poemZh") !== false;
    var full = store.ui("poemFull") !== false;
    var my = 0;
    var r = P.recording;

    var n = 0;
    var body = P.stanzas.map(function (st, si) {
      var inBook = P.excerpt.indexOf(si) >= 0;
      return '<div class="stanza' + (inBook ? "" : " is-extra") + '" data-stanza="' + si + '">' +
        (inBook ? "" : '<p class="stanza-tag">Stanza ' + (si + 1) + ": not printed in the textbook</p>") +
        st.map(function (l) {
          n++;
          return '<div class="pl" data-line="' + n + '"><button class="pl-n" type="button" data-say="' + n + '" aria-label="Hear line ' + n + '">' + n + "</button>" +
            '<span class="pl-en">' + ui.esc(l[0]) + '</span><span class="pl-zh" lang="zh-CN">' + ui.esc(l[1]) + "</span>" +
            '<button class="pl-add" type="button" data-quote="' + n + '" aria-label="Add line ' + n + ' to my notes" title="Add to notes">' + ui.icon("pen") + "</button></div>";
        }).join("") + "</div>" +
        (si === 0 ? '<div class="stanza-gap" aria-hidden="true"><span></span><span>…</span><span lang="zh-CN">……</span></div>' : "");
    }).join("");
    var lines = [].concat.apply([], P.stanzas);

    el.innerHTML =
      '<p class="step-intro">Watch Sir Michael Caine’s recitation and follow the text. Select a line number to hear that line again, and write your thoughts in the notes column.</p>' +
      '<div class="recital"><div class="bili-frame"><iframe src="' + bili(r.bvid) + '" title="If— recited by ' + r.reader + '" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe></div>' +
      '<div class="watch-bar"><span class="recital-by"><b>Recitation:</b> ' + r.reader + ", " + r.length + "</span>" +
      '<a class="link-btn" href="' + r.url + '" target="_blank" rel="noopener">' + ui.icon("external") + "Open the Recording on Bilibili</a></div></div>" +
      '<div class="poem-bar">' +
      '<div class="seg" role="radiogroup" aria-label="Text shown"><button role="radio" aria-checked="' + full + '" data-full="1">Full Poem</button><button role="radio" aria-checked="' + !full + '" data-full="0">Textbook Excerpt</button></div>' +
      '<label class="switch"><input type="checkbox" data-zh' + (showZh ? " checked" : "") + '><span class="switch-ui"></span>Chinese Translation</label>' +
      "</div>" +
      '<div class="poem-wrap' + (showZh ? "" : " no-zh") + (full ? "" : " is-excerpt") + '">' +
      '<div class="poem" lang="en">' +
      '<div class="poem-head" aria-hidden="true"><span></span><span>English Text</span><span>Chinese Translation</span></div>' +
      '<p class="poem-title"><b>' + P.title + "</b> by " + P.author + "</p>" + body +
      '<p class="poem-note">' + P.note + "</p></div>" +
      '<aside class="notes"><label class="notes-h" for="poem-notes">' + ui.icon("pen") + "My Notes</label>" +
      '<textarea id="poem-notes" placeholder="Words to look up, lines you like, questions about the poem…">' + ui.esc(store.answer("l2p-notes") || "") + "</textarea>" +
      '<div class="notes-foot"><span class="notes-saved" aria-live="polite"></span><button class="link-btn" type="button" data-dl>' + ui.icon("download") + "Download Notes</button></div></aside>" +
      "</div>" +
      '<div class="poem-foot"><button class="btn btn-primary" type="button" data-read>' + (store.step("l2p-listen") ? ui.icon("check") + "Poem Read" : "I Have Listened to and Read the Poem") + "</button></div>";

    function lineEl(k) { return el.querySelector('[data-line="' + k + '"]'); }
    function clearOn() { el.querySelectorAll(".pl.is-on").forEach(function (x) { x.classList.remove("is-on"); }); }
    function say(k) {
      var mine = ++my;
      clearOn();
      lineEl(k).classList.add("is-on");
      GU.audio.play(lines[k - 1][0], { rate: 0.9 }).then(function () { if (mine === my) clearOn(); });
    }
    function stop() { my++; GU.audio.stop(); clearOn(); }
    /* Called from the qualities question: scroll to a line, flash it and read it. */
    function show(k) {
      var line = lineEl(k);
      if (line.closest(".is-extra") && !full) setFull(true);
      line.scrollIntoView({ behavior: "smooth", block: "center" });
      line.classList.remove("is-flash"); void line.offsetWidth; line.classList.add("is-flash");
      say(k);
    }
    function setFull(on) {
      full = on; store.ui("poemFull", on);
      el.querySelector(".poem-wrap").classList.toggle("is-excerpt", !on);
      el.querySelectorAll("[data-full]").forEach(function (x) { x.setAttribute("aria-checked", (x.dataset.full === "1") === on); });
    }

    el.querySelectorAll("[data-full]").forEach(function (b) { b.addEventListener("click", function () { setFull(b.dataset.full === "1"); }); });
    el.querySelector("[data-zh]").addEventListener("change", function (e) {
      store.ui("poemZh", e.target.checked);
      el.querySelector(".poem-wrap").classList.toggle("no-zh", !e.target.checked);
    });
    el.querySelectorAll("[data-say]").forEach(function (b) { b.addEventListener("click", function () { say(+b.dataset.say); }); });

    var notes = el.querySelector("#poem-notes"), savedEl = el.querySelector(".notes-saved"), t = null;
    notes.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () { store.answer("l2p-notes", notes.value); savedEl.textContent = "Saved"; setTimeout(function () { savedEl.textContent = ""; }, 1400); }, 400);
    });
    el.querySelectorAll("[data-quote]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = +b.dataset.quote;
        var add = "Line " + k + " (“" + lines[k - 1][0].replace(/[;,:–\s]+$/, "") + "”): ";
        notes.value = notes.value ? notes.value.replace(/\s*$/, "\n") + add : add;
        store.answer("l2p-notes", notes.value);
        notes.focus();
        notes.setSelectionRange(notes.value.length, notes.value.length);
      });
    });
    el.querySelector("[data-dl]").addEventListener("click", function () {
      store.answer("l2p-notes", notes.value);
      var txt = "My Notes on If— by Rudyard Kipling\nUnit 1 Growing up, Lesson 2: Starting Out\n\n" + (notes.value || "") + "\n";
      var blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
      var link = document.createElement("a");
      link.href = URL.createObjectURL(blob); link.download = "if-poem-notes.txt";
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(function () { URL.revokeObjectURL(link.href); }, 2000);
    });
    var readBtn = el.querySelector("[data-read]");
    readBtn.addEventListener("click", function () { readBtn.innerHTML = ui.icon("check") + "Poem Read"; done(); });

    return { stop: stop, show: show };
  }

  /* Tick-box question with evidence from the poem for every option. */
  function tickQuestion(el, q, show, done) {
    var saved = store.answer("l2p-q2") || [];
    el.innerHTML =
      '<p class="q-prompt">' + q.prompt + "</p>" +
      '<div class="ticks" role="group" aria-label="Qualities">' + q.options.map(function (o, i) {
        return '<label class="tick"><input type="checkbox" value="' + i + '"' + (saved.indexOf(i) >= 0 ? " checked" : "") + '><span class="tick-box">' + ui.icon("check") + "</span>" +
          '<span class="tick-q">' + ui.esc(o.q) + '</span><span class="tick-mark" aria-hidden="true"></span></label>';
      }).join("") + "</div>" +
      '<div class="q-actions"><button class="btn btn-primary" type="button" data-check>' + ui.icon("check") + "Check My Answers</button>" +
      '<button class="btn btn-ghost" type="button" data-again hidden>' + ui.icon("redo") + "Try Again</button></div>" +
      '<div class="q-fb" aria-live="polite"></div>';
    var boxes = [].slice.call(el.querySelectorAll(".tick input"));
    var fb = el.querySelector(".q-fb");
    var again = el.querySelector("[data-again]");

    function picked() { return boxes.filter(function (b) { return b.checked; }).map(function (b) { return +b.value; }); }
    boxes.forEach(function (b) { b.addEventListener("change", function () { store.answer("l2p-q2", picked()); }); });

    function check(silent) {
      var p = picked();
      if (!p.length) { if (!silent) fb.innerHTML = '<p class="fb fb-info">' + ui.icon("bulb") + "<span>Tick at least one quality first.</span></p>"; return; }
      var right = 0;
      q.options.forEach(function (o, i) {
        var on = p.indexOf(i) >= 0;
        if (on === o.ok) right++;
        boxes[i].parentNode.className = "tick " + (on ? (o.ok ? "is-right" : "is-wrong") : (o.ok ? "is-missed" : "is-clear"));
        boxes[i].disabled = true;
      });
      var all = right === q.options.length;
      fb.innerHTML = '<p class="fb ' + (all ? "fb-ok" : "fb-info") + '">' + (all
        ? ui.icon("check") + "<span>All correct. Kipling mentions seven of these qualities; pride is not one of them.</span>"
        : ui.icon("bulb") + "<span>" + right + " of " + q.options.length + " decisions are correct. Read the evidence from the poem below, then try again.</span>") + "</p>" +
        '<ul class="evidence">' + q.options.map(function (o, i) {
          var on = p.indexOf(i) >= 0;
          var cls = on ? (o.ok ? "is-right" : "is-wrong") : (o.ok ? "is-missed" : "is-clear");
          var tag = { "is-right": "Correct", "is-wrong": "Not in the poem", "is-missed": "Missed", "is-clear": "Correctly left out" }[cls];
          return '<li class="' + cls + '"><b>' + ui.esc(o.q) + "</b><em>" + tag + "</em><span>" + ui.esc(o.why) + "</span>" +
            (o.ok ? '<button class="link-btn" type="button" data-goto="' + o.line + '">' + ui.icon("speaker") + "Line " + o.line + "</button>" : "") + "</li>";
        }).join("") + "</ul>" +
        '<div class="ref"><p class="ref-h">Reference Answer</p><p>' + ui.esc(q.reference) + "</p></div>";
      fb.querySelectorAll("[data-goto]").forEach(function (b) { b.addEventListener("click", function () { show(+b.dataset.goto); }); });
      again.hidden = all;
      el.querySelector("[data-check]").hidden = true;
      done();
    }
    el.querySelector("[data-check]").addEventListener("click", function () { check(false); });
    again.addEventListener("click", function () {
      boxes.forEach(function (b) { b.disabled = false; b.checked = false; b.parentNode.className = "tick"; });
      store.answer("l2p-q2", []);
      fb.innerHTML = ""; again.hidden = true; el.querySelector("[data-check]").hidden = false;
      boxes[0].focus();
    });
    if (saved.length && store.step("l2p-q2")) check(true);
  }
})();

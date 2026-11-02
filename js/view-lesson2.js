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

  function nextAfter(a) {
    var acts = store.lessonActs(L2);
    var rest = acts.filter(function (x) { return x !== a && !store.isDone(x.id); })[0];
    if (rest) return { href: href(rest), label: "Proceed to " + rest.title };
    return { href: "#/lesson-3", label: "Proceed to Lesson 3" };
  }

  /* ---------- Landing ---------- */
  GU.views.lesson2 = function (page) {
    function draw() {
      var cur = pathOf();
      var paths = L2.paths.map(function (p) {
        var on = p.id === cur.id;
        return '<button class="path-card' + (on ? " is-on" : "") + '" role="radio" aria-checked="' + on + '" data-path="' + p.id + '">' +
          '<span class="path-top"><span class="path-pics">' + PATH_PIC[p.id].map(function (e) { return emoji(e); }).join("") + "</span>" +
          (p.recommended ? '<em class="tag-rec">Recommended</em>' : "") + "</span>" +
          "<b>" + p.name + '</b><span class="path-min">' + ui.icon("clock") + p.minutes + " minutes</span>" +
          '<span class="path-desc">' + p.desc + "</span>" +
          '<span class="path-sel">' + (on ? ui.icon("check") + "Selected" : "Select This Path") + "</span></button>";
      }).join("");

      var acts = L2.activities.map(function (a) {
        var st = GU.shell.activityState(a);
        var opt = !inPath(a);
        var n = a.steps.filter(store.step).length;
        var label = st === "done" ? "Review" : st === "partial" ? "Continue" : opt ? "Open" : "Begin";
        var detail = a.kind === "l2video"
          ? "Photographs and a class discussion of coming-of-age ceremonies, followed by a video on celebrations in Ancient China, on Pentecost Island and in the US."
          : "A recitation of excerpts from the poem with a parallel Chinese translation, space for notes, and questions on the qualities Kipling describes.";
        return '<li class="act' + (st === "done" ? " is-done" : "") + (opt ? " is-opt" : "") + '">' + GU.shell.statusDot(st) +
          '<div class="act-body"><p class="act-label">' + a.label + (opt ? ' <em class="tag-opt">Optional</em>' : "") + "</p>" +
          '<h3><a href="' + href(a) + '">' + a.title + "</a></h3><p>" + detail + "</p></div>" +
          '<div class="act-side"><span class="act-time">' + (n ? n + " of 4 steps completed" : "Approximately " + a.minutes + " minutes") + "</span>" +
          '<a class="btn ' + (st === "done" || opt ? "btn-ghost" : "btn-primary") + ' btn-sm" href="' + href(a) + '">' + label + "</a></div></li>";
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
          : '<p class="path-done">' + ui.icon("check") + "All activities on this path are completed.</p>") + "</div>" +
        "</section>" +
        '<section aria-labelledby="act-h"><h2 id="act-h" class="block-h">Learning Activities</h2><ul class="acts">' + acts + "</ul></section>";

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

    function sync(justDone) {
      var unlocked = true;
      steps.forEach(function (s, i) {
        var sec = page.querySelector('[data-step="' + i + '"]');
        var body = sec.querySelector(".step-body");
        var done = store.step(s.key);
        sec.classList.toggle("is-done", done);
        sec.classList.toggle("is-locked", !unlocked);
        sec.querySelector(".step-st").innerHTML = done ? '<span class="pill pill-done">' + ui.icon("check") + "Completed</span>" : "";
        var tr = page.querySelector('[data-track="' + i + '"]');
        tr.className = done ? "is-done" : unlocked ? "is-cur" : "";
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
      var all = steps.every(function (s) { return store.step(s.key); });
      var end = page.querySelector(".act-end");
      if (all) {
        var first = store.complete(a.id);
        var next = nextAfter(a);
        end.hidden = false;
        end.innerHTML = '<span class="act-end-ic">' + ui.icon("check") + "</span><div><h2>" + a.label + " Completed</h2>" +
          "<p>" + (opt ? "This activity is optional on your current path." : "Your answers are saved on this device and in the class discussion.") + "</p></div>" +
          '<a class="btn btn-primary" href="' + next.href + '">' + ui.esc(next.label) + "</a>";
        if (first) {
          if (!checkLesson(false)) ui.toast(a.label + " completed.");
        }
      }
      if (justDone != null && justDone < steps.length - 1) {
        var nx = page.querySelector('[data-step="' + (justDone + 1) + '"]');
        setTimeout(function () { nx.scrollIntoView({ behavior: "smooth", block: "start" }); }, 250);
      } else if (justDone === steps.length - 1 && all) {
        setTimeout(function () { end.scrollIntoView({ behavior: "smooth", block: "center" }); }, 250);
      }
    }
    sync(null);
    return function () { cleanups.forEach(function (c) { try { c(); } catch (e) {} }); };
  }

  /* Matches a keyword at the start of a word in the answer. */
  function hasKey(text, kw) {
    var t = " " + String(text).toLowerCase().replace(/[^a-z0-9]+/g, " ") + " ";
    return t.indexOf(" " + kw) >= 0;
  }

  function startersHtml(list) {
    return '<div class="starters"><span>Sentence starters:</span>' + list.map(function (s) {
      return '<button type="button" data-starter="' + ui.esc(s) + '">' + ui.esc(s) + "</button>";
    }).join("") + "</div>";
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

  function bindStarters(el, ta) {
    el.querySelectorAll("[data-starter]").forEach(function (b) {
      b.addEventListener("click", function () {
        insertStarter(ta, b.dataset.starter);
      });
    });
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
            "<span>" + ui.esc(p.label) + (hits[i] ? "" : ' <small>Not yet mentioned</small>') + "</span></li>";
        }).join("") + "</ul></div>" +
        '<p class="fb ' + (all ? "fb-ok" : "fb-info") + '">' + (all
          ? ui.icon("check") + "Well done. Your answer covers all " + q.points.length + " key points."
          : ui.icon("bulb") + "Your answer covers " + n + " of " + q.points.length + " key points. Add the missing " + (q.points.length - n === 1 ? "point" : "points") + " and check again, or compare your answer with the reference answer.") + "</p>" +
        '<div class="ref"><p class="ref-h">Reference Answer</p><p>' + ui.esc(q.reference) + "</p></div>";
      done();
    }
    el.querySelector("[data-check]").addEventListener("click", function () { check(false); });
    if (saved && store.step(key)) check(true);
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
  function commonsPage(file) { return "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(file); }

  /* ---------- Activity 1: Video Time ---------- */
  GU.views.l2video = function (page) {
    var a = act("l2-video");
    var steps = [
      { key: "l2v-warm", title: "Warm-Up Discussion", mount: function (el, done) {
        el.innerHTML =
          '<p class="step-intro">Look at the photographs of coming-of-age celebrations. Then answer the questions in the class discussion.</p>' +
          '<div class="gallery">' + D.photos.map(function (p, i) {
            return '<figure class="ph"><div class="ph-img" data-ph="' + i + '"><img src="' + commonsUrl(p.file) + '" alt="' + ui.esc(p.caption) + '" loading="lazy"></div>' +
              "<figcaption><b>" + ui.esc(p.place) + "</b><span>" + ui.esc(p.caption) + "</span>" +
              '<small>Photo: ' + ui.esc(p.credit) + ', <a href="' + commonsPage(p.file) + '" target="_blank" rel="noopener">' + p.licence + "</a>, via Wikimedia Commons</small></figcaption></figure>";
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
          '<div class="bili-frame"><iframe src="https://player.bilibili.com/player.html?isOutside=true&amp;bvid=' + v.bvid + '&amp;p=1&amp;autoplay=0&amp;danmaku=0" ' +
          'title="' + ui.esc(v.title) + '" allow="fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe></div>' +
          '<div class="watch-bar"><a class="link-btn" href="' + v.url + '" target="_blank" rel="noopener">' + ui.icon("external") + "Open the Video on Bilibili</a>" +
          '<span class="watch-len">' + ui.icon("clock") + "Length: " + v.length + "</span>" +
          '<button class="btn btn-primary" type="button" data-watched>' + (store.step("l2v-watch") ? ui.icon("check") + "Video Watched" : "I Have Watched the Video") + "</button></div>";
        var btn = el.querySelector("[data-watched]");
        btn.addEventListener("click", function () { btn.innerHTML = ui.icon("check") + "Video Watched"; done(); });
      } },
      { key: "l2v-q1", title: "Comprehension Question", mount: function (el, done) { openQuestion(el, D.q1, "l2v-q1", done); } },
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
    var P = D.poem;
    /* Line numbers skip the ellipsis that marks the omitted stanza. */
    var num = [], k = 0;
    P.lines.forEach(function (l) { num.push(l[0] === "…" ? null : ++k); });
    var player = null;

    function lineEl(i) { return page.querySelector('[data-line="' + i + '"]'); }
    function flash(i) {
      var el = lineEl(i); if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.remove("is-flash"); void el.offsetWidth; el.classList.add("is-flash");
      if (player) player.playLine(i);
    }

    var steps = [
      { key: "l2p-listen", title: "Listening and Reading", mount: function (el, done) {
        player = poemPlayer(el, P, num, done);
        return player.stop;
      } },
      { key: "l2p-q1", title: "The Theme of the Poem", mount: function (el, done) { openQuestion(el, D.pq1, "l2p-q1", done); } },
      { key: "l2p-q2", title: "The Qualities in the Poem", mount: function (el, done) { tickQuestion(el, D.pq2, num, flash, done); } },
      { key: "l2p-q3", title: "Personal Response", mount: function (el, done) {
        el.innerHTML = '<p class="step-intro">Choose up to two qualities, explain your choice, and then read and respond to your classmates’ answers.</p><div class="disc-slot"></div>';
        return boardStep({ board: "l2-qualities", prompts: [D.pq3.prompt], choices: D.pq3.choices, maxChoices: D.pq3.maxChoices, starters: D.pq3.starters, example: D.pq3.example })(el.querySelector(".disc-slot"), done);
      } }
    ];
    return stepper(page, a, steps, "In <em>If—</em>, written in 1910, Rudyard Kipling sets out the qualities a young person needs in order to grow into a mature adult.");
  };

  /* Recitation with line highlighting: teacher recording with cues if provided, otherwise line-by-line narration. */
  function poemPlayer(el, P, num, done) {
    var rate = store.ui("poemRate") || 1;
    var showZh = store.ui("poemZh") !== false;
    var hasFile = !!(P.audio && P.cues && P.cues.length === P.lines.length);
    var playing = false, cur = -1, run = 0, media = null;

    el.innerHTML =
      '<p class="step-intro">Listen to the poem and follow the text. Select any line to hear it again, and write your thoughts in the notes column.</p>' +
      '<div class="poem-bar">' +
      '<button class="btn btn-primary" type="button" data-play>' + ui.icon("play") + "Play the Poem</button>" +
      '<div class="seg" role="radiogroup" aria-label="Playback speed"><span class="seg-label">Speed</span>' +
      [0.75, 1, 1.25].map(function (r) { return '<button role="radio" aria-checked="' + (r === rate) + '" data-rate="' + r + '">' + r + "×</button>"; }).join("") + "</div>" +
      '<label class="switch"><input type="checkbox" data-zh' + (showZh ? " checked" : "") + '><span class="switch-ui"></span>Chinese Translation</label>' +
      "</div>" +
      '<div class="poem-wrap' + (showZh ? "" : " no-zh") + '">' +
      '<div class="poem" lang="en">' +
      '<div class="poem-head" aria-hidden="true"><span></span><span>English Text</span><span>Chinese Translation</span></div>' +
      '<p class="poem-title"><b>' + P.title + "</b> by " + P.author + "</p>" +
      P.lines.map(function (l, i) {
        if (num[i] == null) return '<div class="pl pl-gap" data-line="' + i + '"><span></span><span>…</span><span lang="zh-CN">……</span></div>';
        return '<div class="pl" data-line="' + i + '"><button class="pl-n" type="button" data-say="' + i + '" aria-label="Play line ' + num[i] + '">' + num[i] + "</button>" +
          '<span class="pl-en">' + ui.esc(l[0]) + '</span><span class="pl-zh" lang="zh-CN">' + ui.esc(l[1]) + "</span>" +
          '<button class="pl-add" type="button" data-quote="' + i + '" aria-label="Add line ' + num[i] + ' to my notes" title="Add to notes">' + ui.icon("pen") + "</button></div>";
      }).join("") +
      '<p class="poem-note">' + P.note + "</p></div>" +
      '<aside class="notes"><label class="notes-h" for="poem-notes">' + ui.icon("pen") + "My Notes</label>" +
      '<textarea id="poem-notes" placeholder="Words to look up, lines you like, questions about the poem…">' + ui.esc(store.answer("l2p-notes") || "") + "</textarea>" +
      '<div class="notes-foot"><span class="notes-saved" aria-live="polite"></span><button class="link-btn" type="button" data-dl>' + ui.icon("download") + "Download Notes</button></div></aside>" +
      "</div>" +
      '<div class="poem-foot"><p class="poem-src">' + (hasFile ? "Recording provided by the teacher." :
        "The narration reads the poem line by line in British English. A complete recitation is available from " +
        '<a href="' + P.librivox + '" target="_blank" rel="noopener">LibriVox</a> (public domain).') + "</p>" +
      '<button class="btn btn-ghost" type="button" data-read>' + (store.step("l2p-listen") ? ui.icon("check") + "Poem Read" : "I Have Listened to and Read the Poem") + "</button></div>";

    if (hasFile) {
      media = new Audio(P.audio);
      media.preload = "metadata";
      media.addEventListener("timeupdate", function () {
        var t = media.currentTime, idx = -1;
        P.cues.forEach(function (c, i) { if (t >= c) idx = i; });
        if (idx !== cur) mark(idx);
      });
      media.addEventListener("ended", function () { setPlaying(false); mark(-1); finished(); });
    }

    var playBtn = el.querySelector("[data-play]");
    function setPlaying(on) {
      playing = on;
      playBtn.innerHTML = on ? ui.icon("pause") + "Pause" : ui.icon("play") + (cur > 0 ? "Resume" : "Play the Poem");
    }
    function mark(i) {
      cur = i;
      el.querySelectorAll(".pl.is-on").forEach(function (x) { x.classList.remove("is-on"); });
      var line = el.querySelector('[data-line="' + i + '"]');
      if (!line) return;
      line.classList.add("is-on");
      var r = line.getBoundingClientRect();
      if (r.top < 70 || r.bottom > window.innerHeight - 20) line.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    function finished() {
      var b = el.querySelector("[data-read]");
      b.innerHTML = ui.icon("check") + "Poem Read";
      done();
    }
    function sayFrom(i) {
      var my = ++run;
      setPlaying(true);
      (function step(j) {
        while (j < P.lines.length && num[j] == null) j++;
        if (my !== run) return;
        if (j >= P.lines.length) { mark(-1); setPlaying(false); finished(); return; }
        mark(j);
        GU.audio.play(P.lines[j][0], { rate: rate }).then(function () {
          if (my !== run) return;
          setTimeout(function () { step(j + 1); }, 350 / rate);
        });
      })(i);
    }
    function stop() {
      run++;
      GU.audio.stop();
      if (media) media.pause();
      setPlaying(false);
    }
    function playLine(i) {
      if (num[i] == null) return;
      if (hasFile) {
        stop(); media.currentTime = P.cues[i]; media.playbackRate = rate;
        var end = P.cues[i + 1] != null ? P.cues[i + 1] : Infinity;
        var once = function () { if (media.currentTime >= end) { media.pause(); media.removeEventListener("timeupdate", once); } };
        media.addEventListener("timeupdate", once);
        media.play();
        return;
      }
      var my = ++run;
      setPlaying(false);
      mark(i);
      GU.audio.play(P.lines[i][0], { rate: rate }).then(function () { if (my === run) el.querySelectorAll(".pl.is-on").forEach(function (x) { x.classList.remove("is-on"); }); });
    }

    playBtn.addEventListener("click", function () {
      if (playing) { stop(); return; }
      if (hasFile) { media.playbackRate = rate; media.play(); setPlaying(true); return; }
      sayFrom(cur > 0 ? cur : 0);
    });
    el.querySelectorAll("[data-rate]").forEach(function (b) {
      b.addEventListener("click", function () {
        rate = +b.dataset.rate; store.ui("poemRate", rate);
        el.querySelectorAll("[data-rate]").forEach(function (x) { x.setAttribute("aria-checked", x === b); });
        if (media) media.playbackRate = rate;
      });
    });
    el.querySelector("[data-zh]").addEventListener("change", function (e) {
      store.ui("poemZh", e.target.checked);
      el.querySelector(".poem-wrap").classList.toggle("no-zh", !e.target.checked);
    });
    el.querySelectorAll("[data-say]").forEach(function (b) {
      b.addEventListener("click", function () { playLine(+b.dataset.say); });
    });
    el.querySelectorAll(".pl-en").forEach(function (s) {
      s.addEventListener("click", function () { playLine(+s.parentNode.dataset.line); });
    });

    var notes = el.querySelector("#poem-notes"), savedEl = el.querySelector(".notes-saved"), t = null;
    notes.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () { store.answer("l2p-notes", notes.value); savedEl.textContent = "Saved"; setTimeout(function () { savedEl.textContent = ""; }, 1400); }, 400);
    });
    el.querySelectorAll("[data-quote]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.dataset.quote;
        var add = "Line " + num[i] + " (“" + P.lines[i][0].replace(/[;,:–]+$/, "") + "”): ";
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
    el.querySelector("[data-read]").addEventListener("click", finished);

    return { stop: stop, playLine: playLine };
  }

  /* Tick-box question with evidence from the poem for every option. */
  function tickQuestion(el, q, num, flash, done) {
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
      if (!p.length) { if (!silent) fb.innerHTML = '<p class="fb fb-info">' + ui.icon("bulb") + "Tick at least one quality first.</p>"; return; }
      var right = 0;
      q.options.forEach(function (o, i) {
        var on = p.indexOf(i) >= 0;
        var lab = boxes[i].parentNode;
        var ok = on === o.ok;
        if (ok) right++;
        lab.className = "tick " + (on ? (o.ok ? "is-right" : "is-wrong") : (o.ok ? "is-missed" : "is-clear"));
        boxes[i].disabled = true;
      });
      var all = right === q.options.length;
      fb.innerHTML = '<p class="fb ' + (all ? "fb-ok" : "fb-info") + '">' + (all
        ? ui.icon("check") + "All correct. Kipling mentions seven of these qualities; pride is not one of them."
        : ui.icon("bulb") + right + " of " + q.options.length + " decisions are correct. Read the evidence from the poem below, then try again.") + "</p>" +
        '<ul class="evidence">' + q.options.map(function (o, i) {
          var on = p.indexOf(i) >= 0;
          var cls = on ? (o.ok ? "is-right" : "is-wrong") : (o.ok ? "is-missed" : "is-clear");
          var tag = { "is-right": "Correct", "is-wrong": "Not in the poem", "is-missed": "Missed", "is-clear": "Correctly left out" }[cls];
          return '<li class="' + cls + '"><b>' + ui.esc(o.q) + '</b><em>' + tag + "</em><span>" + ui.esc(o.why) + "</span>" +
            (o.ok ? '<button class="link-btn" type="button" data-goto="' + o.line + '">' + ui.icon("speaker") + "Line " + num[o.line] + "</button>" : "") + "</li>";
        }).join("") + "</ul>" +
        '<div class="ref"><p class="ref-h">Reference Answer</p><p>' + ui.esc(q.reference) + "</p></div>";
      fb.querySelectorAll("[data-goto]").forEach(function (b) { b.addEventListener("click", function () { flash(+b.dataset.goto); }); });
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

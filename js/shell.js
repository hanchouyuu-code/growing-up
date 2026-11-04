/* App shell: top bar with badge meter, collapsible course menu, router, AI Tutor button. */
(function () {
  var ui = GU.ui, store = GU.store;
  var cleanup = null;
  var WIDE = window.matchMedia("(min-width: 1100px)");

  function statusDot(state) {
    if (state === "done") return '<span class="st st-done" aria-label="Completed">' + ui.icon("check") + "</span>";
    if (state === "partial") return '<span class="st st-partial" aria-label="In progress"></span>';
    if (state === "soon") return '<span class="st st-soon" aria-label="Forthcoming">' + ui.icon("lock") + "</span>";
    return '<span class="st st-todo" aria-label="Not started"></span>';
  }

  function activityState(a) {
    if (store.isDone(a.id)) return "done";
    if (a.kind === "group" && (store.groupCount(a.group) > 0 || store.readAlongDone(a.group))) return "partial";
    if ((a.kind === "match" || a.kind === "challenge") && store.score(a.id + "-tries")) return "partial";
    if (a.steps && a.steps.some(store.step)) return "partial";
    return "todo";
  }

  function renderTopbar() {
    var earned = GU.BADGES.filter(function (b) { return store.hasBadge(b.id); }).length;
    var total = GU.BADGES.length;
    var segs = GU.BADGES.map(function (b) {
      return '<i class="' + (store.hasBadge(b.id) ? "on" : "") + (b.bonus ? " bonus" : "") + '"></i>';
    }).join("");
    var lastEarned = GU.BADGES.filter(function (b) { return store.hasBadge(b.id); }).sort(function (a, b) {
      return store.get().badges[b.id] - store.get().badges[a.id];
    })[0];
    document.getElementById("topbar").innerHTML =
      '<button class="icon-btn menu-btn" id="menu-btn" aria-label="Course menu" aria-controls="sidebar">' + ui.icon("menu") + "</button>" +
      '<a class="brand" href="#/overview" aria-label="Unit 1, Growing up: course home"><span class="brand-mark">18</span>' +
      '<span class="brand-text"><b><small class="brand-unit">Unit 1</small>Growing up</b></span></a>' +
      '<div class="topbar-right">' +
      '<button class="medal-meter" id="medal-meter" aria-label="Badges: ' + earned + " of " + total + ' earned. Show all badges.">' +
      ui.medal(lastEarned || GU.BADGES[0], !!lastEarned) +
      '<span class="mm-body"><span class="mm-label"><b>' + earned + '</b><span class="mm-of"> of ' + total + '</span><span class="mm-word"> badges</span></span><span class="mm-segs">' + segs + "</span></span>" +
      "</button>" +
      '<button class="help-btn' + (GU.support && GU.support.replyDot ? " has-reply" : "") + '" id="help-btn" aria-label="Help and Support">' + ui.icon("help") + "<span>Help and Support</span></button>" +
      "</div>";
    document.getElementById("menu-btn").addEventListener("click", toggleNav);
    document.getElementById("medal-meter").addEventListener("click", showBadges);
    document.getElementById("help-btn").addEventListener("click", function () { GU.support.open(); });
  }

  function renderSidebar() {
    var p = store.progress();
    var route = location.hash || "#/overview";
    function cur(href, deep) { return route === href || (deep && route.indexOf(href + "/") === 0) ? ' aria-current="page"' : ""; }

    var lessons = GU.LESSONS.map(function (l) {
      var lp = store.lessonProgress(l);
      var head = '<a class="nl-head' + (l.soon ? " is-soon" : "") + '" href="#/' + l.id + '"' + cur("#/" + l.id) + '>' +
        '<span class="nl-num">' + l.n + "</span>" +
        '<span class="nl-text"><b>' + (l.nav || l.title.replace(/:.*/, "")) + "</b>" + (l.navNoTime ? "" : "<small>" + l.minutes + " minutes" + (l.soon ? ", forthcoming" : "") + "</small>") + "</span>" +
        (l.activities ? '<span class="nl-count">' + lp.done + "/" + lp.total + "</span>" : statusDot("soon")) +
        "</a>";
      var items = "";
      if (l.activities) {
        var onPath = store.lessonActs(l);
        items = '<ul class="nl-items">' + l.activities.map(function (a) {
          var href = "#/" + l.id + "/" + a.id;
          var opt = l.paths && onPath.indexOf(a) < 0;
          return '<li><a href="' + href + '"' + cur(href, true) + ">" + statusDot(activityState(a)) +
            "<span>" + a.title + (a.range ? ' <small class="nl-range">' + a.range + "</small>" : "") + (a.bonus ? ' <em class="tag-bonus">Bonus</em>' : "") + (opt ? ' <em class="tag-opt">Optional</em>' : "") + "</span></a></li>";
        }).join("") + "</ul>";
        /* The course's features sit under the lessons that use them, in their own visual zone:
           Word Battle and the AI Tutor (Lessons 1 and 3), Teacher Q&A (Lessons 3 and 4), AI Writing Feedback (Lesson 4). */
        var P = GU.PRACTICE[l.id], F = [];
        if (P) F.push([P.battle, "trophy", "Word Battle"], [P.tutor, "chat", "AI Tutor"]);
        if (l.id === "lesson-3") F.push(["#/lesson-3/l3-video/l3c-qa", "teacher", "Teacher Q&amp;A"]);
        if (l.id === "lesson-4") F.push(["#/lesson-4/l4-write/l4w-feedback", "sparkle", "AI Writing Feedback"], ["#/lesson-4/l4-write/l4w-qa", "teacher", "Teacher Q&amp;A"]);
        if (F.length) {
          items += '<div class="nav-community">' + F.map(function (f) {
            return '<a class="nc-item" href="' + f[0] + '"' + cur(f[0]) + ">" + ui.icon(f[1]) + "<span>" + f[2] + "</span></a>";
          }).join("") + "</div>";
        }
      }
      return '<div class="nl">' + head + items + "</div>";
    }).join("");

    var oldScroll = document.querySelector("#sidebar .sb-scroll");
    var keepTop = oldScroll ? oldScroll.scrollTop : 0;
    document.getElementById("sidebar").innerHTML =
      '<div class="sb-scroll">' +
      '<div class="book">' +
      '<img class="book-cover" src="assets/img/cover.jpg" width="78" height="107" alt="' + GU.BOOK.zh.publisher + " " + GU.BOOK.zh.title + '" lang="zh-CN">' +
      '<div class="book-meta"><p class="book-pub">' + GU.BOOK.en.publisher.replace(" (FLTRP)", "") + "</p>" +
      '<p class="book-title">' + GU.BOOK.en.title + "</p></div>" +
      "</div>" +
      '<div class="sb-unit"><span>Unit 1</span><h2>Growing up</h2></div>' +
      '<div class="cp"><div class="cp-row"><span>Course Progress</span><b>' + p.pct + '%</b></div>' +
      '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p.pct + '" aria-label="Course progress"><i style="width:' + p.pct + '%"></i></div>' +
      "<p>" + p.done + " of " + p.total + " components completed</p></div>" +
      '<nav class="course-nav" aria-label="Course">' +
      '<a class="nav-solo" href="#/overview"' + cur("#/overview") + ">" + statusDot(store.get().overview ? "done" : "todo") + "<span>Course Overview</span></a>" +
      lessons +
      '<a class="nav-solo nav-teacher" href="#/teacher"' + cur("#/teacher") + '><span class="st st-icon">' + ui.icon("teacher") + "</span><span>" + GU.TEACHER.title + "</span></a>" +
      "</nav></div>" +
      '<button class="sb-collapse" id="sb-collapse">' + ui.icon("left") + "<span>Collapse Menu</span></button>";
    document.getElementById("sb-collapse").addEventListener("click", function () { setNav(false); });
    followCurrent(keepTop);
    document.querySelectorAll("#sidebar a").forEach(function (a) {
      a.addEventListener("click", function () { if (!WIDE.matches) setNav(false); });
    });
  }

  /* The menu follows the learner: the item for the current page is brought into view, so the menu never
     has to be scrolled by hand. A deep link (a step, Word Battle) wins over its activity. */
  function followCurrent(keepTop) {
    var box = document.querySelector("#sidebar .sb-scroll");
    if (!box) return;
    box.scrollTop = keepTop;
    var all = box.querySelectorAll('[aria-current="page"]');
    var el = all[all.length - 1];
    if (!el) {
      var lesson = (location.hash.match(/^#\/(lesson-\d)/) || [])[1];
      el = lesson ? box.querySelector('a.nl-head[href="#/' + lesson + '"]') : null;
    }
    if (!el) return;
    var br = box.getBoundingClientRect(), er = el.getBoundingClientRect();
    if (!br.height) return;
    var top = er.top - br.top + box.scrollTop;
    if (er.top >= br.top + 60 && er.bottom <= br.bottom - 40) return;
    box.scrollTo({ top: Math.max(0, top - br.height * 0.3), behavior: keepTop ? "smooth" : "auto" });
  }

  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    var mb = document.getElementById("menu-btn");
    if (mb) mb.setAttribute("aria-expanded", open ? "true" : "false");
    if (WIDE.matches) store.ui("navClosed", !open);
  }
  function toggleNav() { setNav(!document.body.classList.contains("nav-open")); }

  function showBadges() {
    var html = '<h2 class="modal-title">Achievement Badges</h2><p class="modal-sub">Each component of the course awards a badge on completion. Bonus badges are optional.</p><ul class="badge-grid">' +
      GU.BADGES.map(function (b) {
        var got = store.hasBadge(b.id);
        return '<li class="' + (got ? "got" : "") + '">' + ui.medal(b, got) + "<b>" + ui.esc(b.name) + "</b><span>" +
          (b.soon && !got ? "Forthcoming" : ui.esc(b.desc)) + "</span></li>";
      }).join("") + "</ul>";
    ui.modal(html, { cls: "modal-badges", label: "Achievement badges" });
  }

  /* Previous and next section, at the foot of every lesson page, practice page and activity.
     The order follows the course: each lesson's landing page, then its activities (Lesson 2: those on the
     chosen path), then the next lesson. Lesson 1 continues to its Word Battle and AI Tutor. */
  function courseSequence(allPaths) {
    var out = [{ href: "#/overview", title: "Course Overview" }];
    GU.LESSONS.forEach(function (l) {
      out.push({ href: "#/" + l.id, title: l.nav || "Lesson " + l.n + " · " + l.short, lesson: l });
      var acts = allPaths || !l.paths ? l.activities : store.lessonActs(l);
      acts.forEach(function (a) {
        out.push({ href: "#/" + l.id + "/" + a.id, title: l.n === 1 || l.nav ? a.title : a.label + " · " + a.short, act: a });
      });
      if (l.n === 1) out.push({ href: "#/community/battle", title: "Word Battle" }, { href: "#/community/tutor", title: "AI Tutor" });
    });
    out.push({ href: "#/overview", title: "Course Overview" });
    return out;
  }
  function findIn(seq, href) { return seq.map(function (x) { return x.href; }).indexOf(href); }
  function renderPager(view) {
    var nav = document.getElementById("pager");
    var href = "#/" + (location.hash.replace(/^#\/?/, "") || "overview").split("/").slice(0, 2).join("/");
    if (/^(overview|teacher|support|group)$/.test(view) || !view) { nav.hidden = true; nav.innerHTML = ""; return; }
    var seq = courseSequence(false), i = findIn(seq, href), prev, next, cur = null;
    if (i < 0) { seq = courseSequence(true); i = findIn(seq, href); }
    if (i >= 0) {
      cur = seq[i]; prev = seq[i - 1]; next = seq[i + 1];
      /* An activity outside the chosen Lesson 2 path leads on to the next lesson. */
      if (cur.act && GU.LESSONS[1].activities.indexOf(cur.act) >= 0 && store.lessonActs(GU.LESSONS[1]).indexOf(cur.act) < 0) {
        next = courseSequence(false)[findIn(courseSequence(false), "#/lesson-3")];
      }
    } else if (href === "#/lesson-3/battle" || href === "#/lesson-3/tutor") {
      /* Further practice for Lesson 3 sits between the reading activities and Lesson 4. */
      var s2 = courseSequence(true);
      prev = href === "#/lesson-3/battle" ? s2[findIn(s2, "#/lesson-3/l3-text")] : { href: "#/lesson-3/battle", title: "Word Battle" };
      next = href === "#/lesson-3/battle" ? { href: "#/lesson-3/tutor", title: "AI Tutor" } : s2[findIn(s2, "#/lesson-4")];
    } else { nav.hidden = true; nav.innerHTML = ""; return; }
    /* The next button is the main action once the activity on this page is completed, or on pages without one. */
    var strong = !cur || !cur.act || store.isDone(cur.act.id);
    nav.style.maxWidth = getComputedStyle(document.getElementById("page")).maxWidth;
    nav.innerHTML =
      (prev ? '<a class="pg-prev" href="' + prev.href + '">' + ui.icon("left") + "<span><small>Previous</small>" + prev.title + "</span></a>" : "<span></span>") +
      (next ? '<a class="pg-next btn ' + (strong ? "btn-primary" : "btn-ghost") + '" href="' + next.href + '"><span><small>Next</small>' + next.title + "</span>" + ui.icon("right") + "</a>" : "");
    nav.hidden = false;
  }

  /* Floating AI Tutor button: available throughout the vocabulary module and the community. */
  function renderFab(view) {
    var fab = document.getElementById("tutor-fab");
    var show = /^(lesson1|group|match|challenge|lesson3|l3lead|l3read|l3video|l3text)$/.test(view);
    fab.hidden = !show;
    if (!fab.dataset.bound) {
      fab.dataset.bound = "1";
      fab.innerHTML = '<img src="' + ui.emojiSrc("🤖") + '" alt=""><span>Ask the AI Tutor</span>';
      fab.addEventListener("click", function () { GU.tutor.openDrawer(GU.currentWord || null); });
    }
  }

  /* Router */
  function route() {
    var hash = location.hash.replace(/^#\/?/, "") || "overview";
    var parts = hash.split("/");
    var page = document.getElementById("page");
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    GU.audio.stop();
    GU.currentWord = null;
    var view, params = {};
    if (parts[0] === "overview") view = "overview";
    else if (parts[0] === "lesson-1" && !parts[1]) view = "lesson1";
    else if (parts[0] === "lesson-1" && /^group-[123]$/.test(parts[1])) { view = "group"; params.group = +parts[1].slice(-1) - 1; }
    else if (parts[0] === "lesson-1" && parts[1] === "match") view = "match";
    else if (parts[0] === "lesson-1" && parts[1] === "challenge") view = "challenge";
    else if (parts[0] === "community" && !parts[1]) { location.replace("#/community/battle"); return; }
    else if (parts[0] === "community" && parts[1] === "battle") view = "battle";
    else if (parts[0] === "community" && parts[1] === "tutor") view = "tutorPage";
    else if (GU.PRACTICE[parts[0]] && (parts[1] === "battle" || parts[1] === "tutor")) view = parts[1] === "battle" ? "battle" : "tutorPage";
    else if (/^lesson-[2-5]$/.test(parts[0])) {
      /* Lessons 2–4: a landing page, then one page per activity (the view is named after the activity kind). */
      var L = GU.LESSONS.filter(function (x) { return x.id === parts[0]; })[0];
      var A = L.activities && parts[1] ? L.activities.filter(function (x) { return x.id === parts[1]; })[0] : null;
      if (L.soon || !L.activities) { view = "soon"; params.lesson = parts[0]; }
      else if (!parts[1]) view = "lesson" + L.n;
      else if (A && GU.views[A.kind]) view = A.kind;
      else { location.replace("#/" + L.id); return; }
    }
    else if (parts[0] === "teacher") view = "teacher";
    else if (parts[0] === "support") view = "support";
    else { location.replace("#/overview"); return; }

    /* A third part names a step to open at, e.g. #/lesson-4/l4-write/l4w-feedback */
    GU.focusStep = /^lesson-[2-5]$/.test(parts[0]) && parts[2] ? parts[2] : null;
    /* Which lesson the Word Battle and AI Tutor belong to on this page */
    GU.practiceId = GU.PRACTICE[parts[0]] ? parts[0] : "lesson-1";
    page.innerHTML = "";
    page.className = "page page-" + view;
    document.body.dataset.view = view;
    cleanup = GU.views[view](page, params) || null;
    renderSidebar();
    renderFab(view);
    renderPager(view);
    window.scrollTo(0, 0);
    var h1 = page.querySelector("h1");
    if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
  }

  GU.shell = { renderSidebar: renderSidebar, statusDot: statusDot, activityState: activityState, route: route };

  function init() {
    renderTopbar();
    GU.support.checkReplies();
    var open = WIDE.matches ? !store.ui("navClosed") : false;
    document.body.classList.toggle("nav-open", open);
    document.getElementById("scrim").addEventListener("click", function () { setNav(false); });
    if (WIDE.addEventListener) WIDE.addEventListener("change", function () { document.body.classList.toggle("nav-open", WIDE.matches && !store.ui("navClosed")); });
    store.onChange(function () { renderTopbar(); renderSidebar(); renderPager(document.body.dataset.view); });
    window.addEventListener("hashchange", route);
    route();
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();

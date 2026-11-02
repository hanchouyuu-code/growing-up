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
      '<a class="brand" href="#/overview" aria-label="Growing up, course home"><span class="brand-mark">18</span>' +
      '<span class="brand-text"><b>Growing up</b><span>Unit 1 Online Course</span></span></a>' +
      '<div class="topbar-right">' +
      '<button class="medal-meter" id="medal-meter" aria-label="Badges: ' + earned + " of " + total + ' earned. Show all badges.">' +
      ui.medal(lastEarned || GU.BADGES[0], !!lastEarned) +
      '<span class="mm-body"><span class="mm-label"><b>' + earned + '</b><span class="mm-of"> of ' + total + '</span><span class="mm-word"> badges</span></span><span class="mm-segs">' + segs + "</span></span>" +
      "</button>" +
      '<button class="icon-btn help-btn" id="help-btn" aria-label="Help and support">' + ui.icon("help") + "</button>" +
      "</div>";
    document.getElementById("menu-btn").addEventListener("click", toggleNav);
    document.getElementById("medal-meter").addEventListener("click", showBadges);
    document.getElementById("help-btn").addEventListener("click", showHelp);
  }

  function renderSidebar() {
    var p = store.progress();
    var route = location.hash || "#/overview";
    function cur(href) { return route === href ? ' aria-current="page"' : ""; }

    var lessons = GU.LESSONS.map(function (l) {
      var lp = store.lessonProgress(l);
      var head = '<a class="nl-head' + (l.soon ? " is-soon" : "") + '" href="#/' + l.id + '"' + cur("#/" + l.id) + '>' +
        '<span class="nl-num">' + l.n + "</span>" +
        '<span class="nl-text"><b>' + l.title.replace(/:.*/, "") + "</b><small>" + l.minutes + " minutes" + (l.soon ? ", forthcoming" : "") + "</small></span>" +
        (l.activities ? '<span class="nl-count">' + lp.done + "/" + lp.total + "</span>" : statusDot("soon")) +
        "</a>";
      var items = "";
      if (l.activities) {
        var onPath = store.lessonActs(l);
        items = '<ul class="nl-items">' + l.activities.map(function (a) {
          var href = "#/" + l.id + "/" + a.id;
          var opt = l.paths && onPath.indexOf(a) < 0;
          return '<li><a href="' + href + '"' + cur(href) + ">" + statusDot(activityState(a)) +
            "<span>" + a.title + (a.range ? ' <small class="nl-range">' + a.range + "</small>" : "") + (a.bonus ? ' <em class="tag-bonus">Bonus</em>' : "") + (opt ? ' <em class="tag-opt">Optional</em>' : "") + "</span></a></li>";
        }).join("") + "</ul>";
        /* Word Battle and the AI Tutor sit under the vocabulary and reading lessons, in their own visual zone. */
        var P = GU.PRACTICE[l.id];
        if (P) {
          items += '<div class="nav-community">' +
            '<a class="nc-item" href="' + P.battle + '"' + cur(P.battle) + ">" + ui.icon("trophy") + "<span>Word Battle</span></a>" +
            '<a class="nc-item" href="' + P.tutor + '"' + cur(P.tutor) + ">" + ui.icon("chat") + "<span>AI Tutor</span></a>" +
            "</div>";
        }
      }
      return '<div class="nl">' + head + items + "</div>";
    }).join("");

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
    document.querySelectorAll("#sidebar a").forEach(function (a) {
      a.addEventListener("click", function () { if (!WIDE.matches) setNav(false); });
    });
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

  function showHelp() {
    var html = '<h2 class="modal-title">Help and Support</h2>' +
      '<dl class="help-list">' +
      "<dt>Progress storage</dt><dd>Progress is saved in this browser on this device. A different device or cleared browser data starts the course again.</dd>" +
      "<dt>No sound</dt><dd>Turn off silent mode, raise the volume and select the speaker button again. The Slow button plays the word at a lower speed.</dd>" +
      "<dt>Recording problems</dt><dd>Allow microphone access when the browser asks. If recording still fails, say the word aloud three times and select <b>I Said It</b>.</dd>" +
      "<dt>AI Tutor</dt><dd>The AI Tutor answers questions about the unit’s words. If the AI service is unavailable, it shows hints prepared by the teacher.</dd>" +
      "<dt>Other problems</dt><dd>Take a screenshot and send it to your teacher.</dd>" +
      "</dl>" +
      '<div class="help-reset"><button class="btn btn-ghost btn-danger" id="reset-btn">Reset My Progress</button></div>';
    ui.modal(html, { label: "Help and support", onOpen: function (m, close) {
      var btn = m.querySelector("#reset-btn");
      btn.addEventListener("click", function () {
        if (btn.dataset.confirm) {
          store.reset(); close(); location.hash = "#/overview"; ui.toast("Your progress has been reset.");
        } else {
          btn.dataset.confirm = "1"; btn.textContent = "Select again to delete all progress";
        }
      });
    } });
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
    else if (/^lesson-[234]$/.test(parts[0])) {
      /* Lessons 2–4: a landing page, then one page per activity (the view is named after the activity kind). */
      var L = GU.LESSONS.filter(function (x) { return x.id === parts[0]; })[0];
      var A = L.activities && parts[1] ? L.activities.filter(function (x) { return x.id === parts[1]; })[0] : null;
      if (L.soon || !L.activities) { view = "soon"; params.lesson = parts[0]; }
      else if (!parts[1]) view = "lesson" + L.n;
      else if (A && GU.views[A.kind]) view = A.kind;
      else { location.replace("#/" + L.id); return; }
    }
    else if (parts[0] === "teacher") view = "teacher";
    else { location.replace("#/overview"); return; }

    /* Which lesson the Word Battle and AI Tutor belong to on this page */
    GU.practiceId = GU.PRACTICE[parts[0]] ? parts[0] : "lesson-1";
    page.innerHTML = "";
    page.className = "page page-" + view;
    document.body.dataset.view = view;
    cleanup = GU.views[view](page, params) || null;
    renderSidebar();
    renderFab(view);
    window.scrollTo(0, 0);
    var h1 = page.querySelector("h1");
    if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
  }

  GU.shell = { renderSidebar: renderSidebar, statusDot: statusDot, activityState: activityState };

  function init() {
    renderTopbar();
    var open = WIDE.matches ? !store.ui("navClosed") : false;
    document.body.classList.toggle("nav-open", open);
    document.getElementById("scrim").addEventListener("click", function () { setNav(false); });
    if (WIDE.addEventListener) WIDE.addEventListener("change", function () { document.body.classList.toggle("nav-open", WIDE.matches && !store.ui("navClosed")); });
    store.onChange(function () { renderTopbar(); renderSidebar(); });
    window.addEventListener("hashchange", route);
    route();
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();

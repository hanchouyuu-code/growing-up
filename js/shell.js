/* App shell: top bar with badge meter, collapsible course menu, router. */
(function () {
  var ui = GU.ui, store = GU.store;
  GU.views = GU.views || {};
  var cleanup = null;
  var WIDE = window.matchMedia("(min-width: 1100px)");

  function statusDot(state) {
    /* state: done | partial | todo | soon */
    if (state === "done") return '<span class="st st-done" aria-label="Done">' + ui.icon("check") + "</span>";
    if (state === "partial") return '<span class="st st-partial" aria-label="In progress"></span>';
    if (state === "soon") return '<span class="st st-soon" aria-label="Coming soon">' + ui.icon("lock") + "</span>";
    return '<span class="st st-todo" aria-label="Not started"></span>';
  }

  function activityState(a) {
    if (store.isDone(a.id)) return "done";
    if (a.kind === "group" && store.groupCount(a.group) > 0) return "partial";
    if ((a.kind === "match" || a.kind === "challenge") && store.score(a.id + "-tries")) return "partial";
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
      '<span class="brand-text"><b>Growing up</b><span>Unit 1</span></span></a>' +
      '<div class="topbar-right">' +
      '<button class="medal-meter" id="medal-meter" aria-label="Badges: ' + earned + " of " + total + ' earned. Show all badges">' +
      ui.medal(lastEarned || GU.BADGES[0], !!lastEarned) +
      '<span class="mm-body"><span class="mm-label"><b>' + earned + '</b><span class="mm-of"> of ' + total + '</span><span class="mm-word"> badges</span></span><span class="mm-segs">' + segs + "</span></span>" +
      "</button>" +
      '<button class="icon-btn help-btn" id="help-btn" aria-label="Help">' + ui.icon("help") + "</button>" +
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
      var head = '<a class="nl-head" href="#/' + l.id + '"' + cur("#/" + l.id) + '>' +
        '<span class="nl-num">' + l.n + "</span>" +
        '<span class="nl-text"><b>' + l.title.replace(/:.*/, "") + "</b><small>" + l.minutes + " min" + (l.soon ? ", coming soon" : "") + "</small></span>" +
        (l.activities ? '<span class="nl-count">' + lp.done + "/" + lp.total + "</span>" : statusDot("soon")) +
        "</a>";
      var items = "";
      if (l.activities) {
        items = '<ul class="nl-items">' + l.activities.map(function (a) {
          var href = "#/" + l.id + "/" + a.id;
          return '<li><a href="' + href + '"' + cur(href) + ">" + statusDot(activityState(a)) +
            "<span>" + a.title + (a.bonus ? ' <em class="tag-bonus">Bonus</em>' : "") + "</span></a></li>";
        }).join("") + "</ul>";
      }
      return '<div class="nl">' + head + items + "</div>";
    }).join("");

    document.getElementById("sidebar").innerHTML =
      '<div class="sb-scroll">' +
      '<div class="book">' +
      '<div class="book-cover" aria-hidden="true"><span>英语</span><small>选择性必修<br>第二册</small></div>' +
      '<div class="book-meta"><p class="book-pub">' + GU.BOOK.publisher + "</p>" +
      '<p class="book-title">' + GU.BOOK.series + " " + GU.BOOK.subject + "<br>" + GU.BOOK.volume + "</p></div>" +
      "</div>" +
      '<div class="sb-unit"><span>Unit 1</span><h2>Growing up</h2></div>' +
      '<div class="cp"><div class="cp-row"><span>Course progress</span><b>' + p.pct + '%</b></div>' +
      '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p.pct + '" aria-label="Course progress"><i style="width:' + p.pct + '%"></i></div>' +
      "<p>" + p.done + " of " + p.total + " parts done</p></div>" +
      '<nav class="course-nav" aria-label="Course">' +
      '<a class="nav-solo" href="#/overview"' + cur("#/overview") + ">" + statusDot(store.get().overview ? "done" : "todo") + "<span>Course overview</span></a>" +
      lessons +
      '<a class="nav-solo nav-teacher" href="#/teacher"' + cur("#/teacher") + '><span class="st st-icon">' + ui.icon("teacher") + "</span><span>" + GU.TEACHER.title + "</span></a>" +
      "</nav></div>" +
      '<button class="sb-collapse" id="sb-collapse">' + ui.icon("left") + "<span>Hide menu</span></button>";
    document.getElementById("sb-collapse").addEventListener("click", function () { setNav(false); });
    document.querySelectorAll("#sidebar a").forEach(function (a) {
      a.addEventListener("click", function () { if (!WIDE.matches) setNav(false); });
    });
  }

  function setNav(open) {
    document.body.classList.toggle("nav-open", open);
    document.getElementById("menu-btn").setAttribute("aria-expanded", open ? "true" : "false");
    if (WIDE.matches) store.ui("navClosed", !open);
  }
  function toggleNav() { setNav(!document.body.classList.contains("nav-open")); }

  function showBadges() {
    var html = '<h2 class="modal-title">Your badges</h2><p class="modal-sub">Finish each part of the course to earn its badge.</p><ul class="badge-grid">' +
      GU.BADGES.map(function (b) {
        var got = store.hasBadge(b.id);
        return '<li class="' + (got ? "got" : "") + '">' + ui.medal(b, got) + "<b>" + ui.esc(b.name) + "</b><span>" +
          (b.soon && !got ? "Coming soon" : ui.esc(b.desc)) + "</span></li>";
      }).join("") + "</ul>";
    ui.modal(html, { cls: "modal-badges", label: "Your badges" });
  }

  function showHelp() {
    var html = '<h2 class="modal-title">Help</h2>' +
      '<dl class="help-list">' +
      "<dt>Where is my progress saved?</dt><dd>In this browser, on this device. If you switch devices or clear your browser data, you’ll start again.</dd>" +
      "<dt>I can’t hear anything.</dt><dd>Turn off silent mode and turn up the volume, then tap the speaker again. Tap the slow button to hear a word more slowly.</dd>" +
      "<dt>Recording doesn’t work.</dt><dd>Allow microphone access when your browser asks. If it still doesn’t work, say the word aloud three times and tap <b>I said it</b>.</dd>" +
      "<dt>Something else is wrong.</dt><dd>Take a screenshot and send it to your teacher.</dd>" +
      "</dl>" +
      '<div class="help-reset"><button class="btn btn-ghost btn-danger" id="reset-btn">Reset my progress</button></div>';
    ui.modal(html, { label: "Help", onOpen: function (m, close) {
      var btn = m.querySelector("#reset-btn");
      btn.addEventListener("click", function () {
        if (btn.dataset.confirm) {
          store.reset(); close(); location.hash = "#/overview"; ui.toast("Your progress has been reset.");
        } else {
          btn.dataset.confirm = "1"; btn.textContent = "Tap again to delete all progress";
        }
      });
    } });
  }

  /* Router */
  function route() {
    var hash = location.hash.replace(/^#\/?/, "") || "overview";
    var parts = hash.split("/");
    var page = document.getElementById("page");
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    GU.audio.stop();
    var view, params = {};
    if (parts[0] === "overview") view = "overview";
    else if (parts[0] === "lesson-1" && !parts[1]) view = "lesson1";
    else if (parts[0] === "lesson-1" && /^group-[123]$/.test(parts[1])) { view = "group"; params.group = +parts[1].slice(-1) - 1; }
    else if (parts[0] === "lesson-1" && parts[1] === "match") view = "match";
    else if (parts[0] === "lesson-1" && parts[1] === "challenge") view = "challenge";
    else if (/^lesson-[234]$/.test(parts[0])) { view = "soon"; params.lesson = parts[0]; }
    else if (parts[0] === "teacher") view = "teacher";
    else { location.replace("#/overview"); return; }

    page.innerHTML = "";
    page.className = "page page-" + view;
    cleanup = GU.views[view](page, params) || null;
    renderSidebar();
    var main = document.getElementById("main");
    main.scrollTop = 0; window.scrollTo(0, 0);
    var h1 = page.querySelector("h1");
    if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
  }

  GU.shell = { renderSidebar: renderSidebar, statusDot: statusDot, activityState: activityState };

  function init() {
    renderTopbar();
    var open = WIDE.matches ? !store.ui("navClosed") : false;
    document.body.classList.toggle("nav-open", open);
    document.getElementById("scrim").addEventListener("click", function () { setNav(false); });
    WIDE.addEventListener ? WIDE.addEventListener("change", function () { document.body.classList.toggle("nav-open", WIDE.matches && !store.ui("navClosed")); }) : null;
    store.onChange(function () { renderTopbar(); renderSidebar(); });
    window.addEventListener("hashchange", route);
    route();
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();

/* Course overview page */
(function () {
  var ui = GU.ui, store = GU.store;

  /* Hero: the sapling from the textbook's Starting Out page grows with each lesson, ending at 18. */
  function growth() {
    var scales = [0.34, 0.5, 0.66, 0.82];
    var stages = GU.LESSONS.map(function (l, i) {
      var lp = store.lessonProgress(l);
      var done = !l.soon && lp.done >= lp.total;
      var started = lp.done > 0;
      return '<a class="stage' + (done ? " is-grown" : started ? " is-growing" : "") + '" href="#/' + l.id + '" style="--s:' + scales[i] + '" aria-label="Lesson ' + l.n + ": " + ui.esc(l.title) + (done ? ", completed" : "") + '">' +
        '<span class="stage-plant"><img src="assets/img/sapling.png" alt=""></span>' +
        '<span class="stage-label"><b>Lesson ' + l.n + "</b><span>" + ui.esc(l.short) + "</span></span></a>";
    }).join("");
    var allDone = GU.LESSONS.every(function (l) { return !l.soon && store.lessonProgress(l).done >= store.lessonProgress(l).total; });
    return '<div class="growth" role="img" aria-label="A sapling that grows taller with each lesson and becomes a tree at the age of eighteen">' +
      '<div class="growth-row">' + stages +
      '<span class="stage stage-final' + (allDone ? " is-grown" : "") + '" style="--s:1.12"><span class="stage-plant"><span class="growth-sun" aria-hidden="true"><span>18</span></span><img src="assets/img/sapling.png" alt=""></span>' +
      '<span class="stage-label"><b>Age 18</b><span>Coming of Age</span></span></span>' +
      "</div>" +
      '<div class="growth-ground" aria-hidden="true"></div>' +
      "</div>";
  }

  function startCourse(e) {
    if (!store.get().overview) {
      store.setOverview();
      if (store.award("first-step")) {
        e.preventDefault();
        ui.celebrate("first-step", { href: "#/lesson-1", label: "Proceed to Lesson 1" });
      }
    }
  }

  function videoBlock() {
    var v = GU.INTRO_VIDEO;
    var player;
    if (v.embed) {
      player = '<div class="video-frame"><iframe src="' + ui.esc(v.embed) + '" title="Introduction video" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>';
    } else {
      player = '<div class="video-player"><video id="intro-video" controls preload="metadata" playsinline' + (v.poster ? ' poster="' + ui.esc(v.poster) + '"' : "") + ">" +
        '<source src="' + ui.esc(v.src) + '" type="video/mp4"></video></div>' +
        '<div class="video-tools"><div class="seg" role="radiogroup" aria-label="Playback speed"><span class="seg-label"><span class="sl-long">Playback </span>Speed</span>' +
        [0.75, 1, 1.25, 1.5].map(function (r) { return '<button role="radio" aria-checked="' + (r === 1) + '" data-vrate="' + r + '">' + r + "×</button>"; }).join("") +
        "</div></div>";
    }
    return '<section class="ov-sec ov-video" aria-labelledby="vid-h">' +
      '<div class="sec-head"><h2 id="vid-h">Introduction Video</h2><span class="sec-meta">' + ui.icon("clock") + ui.esc(v.length) + "</span></div>" +
      player + "</section>";
  }

  function bindVideo(page) {
    var video = page.querySelector("#intro-video");
    if (!video) return;
    var btns = page.querySelectorAll("[data-vrate]");
    function sync() { btns.forEach(function (b) { b.setAttribute("aria-checked", Number(b.dataset.vrate) === video.playbackRate ? "true" : "false"); }); }
    btns.forEach(function (b) { b.addEventListener("click", function () { video.playbackRate = Number(b.dataset.vrate); sync(); }); });
    video.addEventListener("ratechange", sync);
    video.addEventListener("play", function () { GU.audio.stop(); });
  }

  GU.views.overview = function (page) {
    var startHref = store.get().overview ? GU.resumeHref() : "#/lesson-1";
    var startLabel = store.get().overview ? "Continue the Course" : "Begin the Course";

    var lessons = GU.LESSONS.map(function (l) {
      var lp = store.lessonProgress(l);
      var status = l.soon ? '<span class="pill pill-soon">Forthcoming</span>' :
        lp.done >= lp.total ? '<span class="pill pill-done">' + ui.icon("check") + "Completed</span>" :
        '<span class="pill">' + lp.done + " of " + lp.total + " completed</span>";
      return '<li><a class="route-item" href="#/' + l.id + '">' +
        '<span class="route-n">' + l.n + "</span>" +
        '<span class="route-body"><span class="route-title"><b>Lesson ' + l.n + ": " + l.title + '</b><span class="route-min">' + l.minutes + " minutes</span></span>" +
        '<span class="route-blurb">' + l.blurb + "</span></span>" +
        status + "</a></li>";
    }).join("");

    var badges = GU.BADGES.map(function (b) {
      return '<li title="' + ui.esc(b.name + ": " + b.desc) + '">' + ui.medal(b, store.hasBadge(b.id)) + "<span>" + ui.esc(b.name) + "</span></li>";
    }).join("");

    page.innerHTML =
      '<section class="ov-hero">' +
      '<div class="ov-hero-text">' +
      '<div class="ov-book"><p lang="zh-CN"><b>' + GU.BOOK.zh.publisher + "</b> " + GU.BOOK.zh.title + "</p>" +
      "<p>" + GU.BOOK.en.publisher + ", " + GU.BOOK.en.title + "</p></div>" +
      '<h1 class="ov-title"><span class="ov-unit">Unit 1</span>Growing up</h1>' +
      '<p class="ov-lede">' + GU.OVERVIEW.lede + "</p>" +
      '<div class="ov-cta"><a class="btn btn-primary btn-lg js-start" href="' + startHref + '">' + startLabel + "</a>" +
      '<span class="ov-time">' + ui.icon("clock") + "90 minutes, four lessons</span></div>" +
      "</div>" + growth() +
      "</section>" +

      '<section class="ov-sec ov-about" aria-labelledby="ov-h">' +
      '<div class="sec-head"><h2 id="ov-h">Unit Overview</h2></div>' +
      '<div class="about-grid">' +
      '<div class="theme-box"><span class="theme-label">Theme Context</span><b>' + GU.OVERVIEW.theme + '</b><span class="theme-zh" lang="zh-CN">' + GU.OVERVIEW.themeZh + "</span>" +
      '<ul class="theme-parts">' + GU.OVERVIEW.themeParts.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul></div>" +
      '<div class="about-text">' + GU.OVERVIEW.paragraphs.map(function (p) { return "<p>" + p + "</p>"; }).join("") + "</div>" +
      "</div></section>" +

      videoBlock() +

      '<section class="ov-sec ov-route" aria-labelledby="cs-h">' +
      '<div class="sec-head"><h2 id="cs-h">Course Structure</h2><span class="sec-meta">' + ui.icon("clock") + "90 minutes in total</span></div>" +
      '<ol class="route">' + lessons + "</ol>" +
      '<div class="route-extra">' +
      '<a class="route-community" href="#/community/battle">' + ui.icon("trophy") + "<span><b>Word Battle</b>Timed questions on the thirty words, with a class leaderboard.</span></a>" +
      '<a class="route-community" href="#/community/tutor">' + ui.icon("chat") + "<span><b>AI Tutor</b>Questions on word forms, collocations, phrases and usage.</span></a>" +
      '<a class="route-teacher" href="#/teacher">' + ui.icon("teacher") + "<span><b>" + GU.TEACHER.title + "</b>" + GU.TEACHER.blurb + "</span></a>" +
      "</div></section>" +

      '<section class="ov-sec ov-badges" aria-labelledby="ab-h">' +
      '<div class="sec-head"><h2 id="ab-h">Achievement Badges</h2></div>' +
      "<p>Each component of the course awards a badge on completion. The badge bar at the top right records your progress, which is saved in this browser.</p>" +
      '<ul class="badge-row">' + badges + "</ul>" +
      '<a class="btn btn-primary js-start" href="' + startHref + '">' + startLabel + "</a>" +
      "</section>";

    page.querySelectorAll(".js-start").forEach(function (a) { a.addEventListener("click", startCourse); });
    bindVideo(page);
  };
})();

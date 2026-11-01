/* Course overview page */
(function () {
  var ui = GU.ui, store = GU.store;

  /* The hero landscape: a road of milestones leading to an "18" sunrise. */
  function road() {
    var stones = [
      { x: 150, y: 250, s: 1.0 },
      { x: 318, y: 208, s: 0.8 },
      { x: 446, y: 185, s: 0.64 },
      { x: 540, y: 170, s: 0.5 }
    ];
    var stoneSvg = GU.LESSONS.map(function (l, i) {
      var p = stones[i];
      var done = store.lessonProgress(l).done >= store.lessonProgress(l).total && !l.soon;
      var started = store.lessonProgress(l).done > 0;
      var w = 46, h = 58;
      return '<a href="#/' + l.id + '" class="stone' + (done ? " is-done" : started ? " is-started" : "") + '" aria-label="Lesson ' + l.n + ": " + ui.esc(l.title) + '">' +
        '<g transform="translate(' + (p.x - w * p.s / 2) + " " + (p.y - h * p.s) + ") scale(" + p.s + ')">' +
        '<ellipse cx="23" cy="58" rx="27" ry="5" class="stone-shadow"/>' +
        '<path d="M0 58V21a23 21 0 0 1 46 0v37z" class="stone-body"/>' +
        '<path d="M5 58V22a18 17 0 0 1 9-14.5" class="stone-light"/>' +
        '<text x="23" y="42" class="stone-num">' + l.n + "</text>" +
        "</g>" +
        '<text x="' + p.x + '" y="' + (p.y + 18 * p.s + 6) + '" class="stone-label" style="font-size:' + (15 * Math.max(p.s, 0.72)) + 'px">' + ui.esc(l.short) + "</text>" +
        "</a>";
    }).join("");

    return '<svg class="road" viewBox="0 64 800 226" preserveAspectRatio="xMidYMax meet" role="img" aria-label="The course as a road with four milestones, one for each lesson, leading to a sunrise marked 18">' +
      "<defs>" +
      '<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFE7A8" stop-opacity=".95"/><stop offset=".55" stop-color="#FFC9A8" stop-opacity=".45"/><stop offset="1" stop-color="#FFC9A8" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="sunfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD978"/><stop offset="1" stop-color="#F5A23A"/></linearGradient>' +
      '<linearGradient id="roadfill" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F3EEFF"/></linearGradient>' +
      '<clipPath id="above"><rect x="0" y="0" width="800" height="156"/></clipPath>' +
      "</defs>" +
      '<circle cx="640" cy="156" r="150" fill="url(#glow)"/>' +
      '<g clip-path="url(#above)"><g class="sun"><circle cx="640" cy="156" r="66" fill="url(#sunfill)"/>' +
      '<text x="640" y="138" class="sun-num">18</text></g></g>' +
      '<path d="M0 168C120 150 230 146 360 156S600 150 800 146V290H0z" fill="#D4CBFA"/>' +
      '<path d="M0 156h800" stroke="#fff" stroke-opacity=".5"/>' +
      '<path d="M0 200C160 176 300 182 430 178S680 170 800 182V290H0z" fill="#BFB2F5"/>' +
      '<path d="M0 238C180 214 360 226 520 218S720 210 800 222V290H0z" fill="#A897EF"/>' +
      '<path d="M60 290C270 228 420 176 618 157L628 157C520 178 468 226 520 290z" fill="url(#roadfill)"/>' +
      '<path d="M292 290C372 226 470 180 623 157" fill="none" stroke="#C8BCF5" stroke-width="3" stroke-dasharray="14 12"/>' +
      stoneSvg +
      "</svg>";
  }

  function startCourse(e) {
    if (!store.get().overview) {
      store.setOverview();
      if (store.award("first-step")) {
        e.preventDefault();
        ui.celebrate("first-step", { href: "#/lesson-1", label: "Go to Lesson 1" });
      }
    }
  }

  GU.views.overview = function (page) {
    var lessons = GU.LESSONS.map(function (l) {
      var lp = store.lessonProgress(l);
      var status = l.soon ? '<span class="pill pill-soon">Coming soon</span>' :
        lp.done >= lp.total ? '<span class="pill pill-done">' + ui.icon("check") + "Done</span>" :
        '<span class="pill">' + lp.done + " of " + lp.total + " done</span>";
      return '<li><a class="route-item" href="#/' + l.id + '">' +
        '<span class="route-n">' + l.n + "</span>" +
        '<span class="route-body"><span class="route-title"><b>' + ui.esc(l.title) + '</b><span class="route-min">' + l.minutes + " min</span></span>" +
        '<span class="route-blurb">' + l.blurb + "</span></span>" +
        status + "</a></li>";
    }).join("");

    var badges = GU.BADGES.map(function (b) {
      return '<li title="' + ui.esc(b.name + ": " + b.desc) + '">' + ui.medal(b, store.hasBadge(b.id)) + "<span>" + ui.esc(b.name) + "</span></li>";
    }).join("");

    page.innerHTML =
      '<section class="ov-hero">' +
      '<div class="ov-hero-text">' +
      '<p class="ov-book"><span>' + GU.BOOK.publisher + "</span><span>" + GU.BOOK.series + " " + GU.BOOK.subject + " " + GU.BOOK.volume + "</span></p>" +
      '<h1 class="ov-title"><span class="ov-unit">Unit 1</span>Growing up</h1>' +
      '<p class="ov-lede">A 90-minute online course about turning 18: what it means, what it changes, and what it asks of you.</p>' +
      '<div class="ov-cta"><a class="btn btn-primary btn-lg js-start" href="' + (store.get().overview ? GU.resumeHref() : "#/lesson-1") + '">' + (store.get().overview ? "Continue the course" : "Start the course") + "</a>" +
      '<span class="ov-time">' + ui.icon("clock") + "90 minutes, 4 lessons</span></div>" +
      "</div>" + road() +
      "</section>" +

      '<div class="ov-cols">' +
      '<section class="ov-sec ov-about">' +
      "<h2>About this unit</h2>" +
      '<p class="theme-line"><span class="theme-label">Theme</span><b>' + GU.OVERVIEW.theme + '</b></p><ul class="theme-parts">' +
      GU.OVERVIEW.themeParts.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>" +
      GU.OVERVIEW.paragraphs.map(function (p) { return "<p>" + p + "</p>"; }).join("") +
      "</section>" +

      '<section class="ov-sec ov-goals">' +
      "<h2>What you’ll be able to do</h2>" +
      "<p>By the end of the course, you should be able to:</p>" +
      '<ol class="goals">' + GU.OVERVIEW.objectives.map(function (o) { return "<li>" + o + "</li>"; }).join("") + "</ol>" +
      "</section>" +
      "</div>" +

      '<section class="ov-sec ov-route">' +
      "<h2>Your route</h2>" +
      '<ol class="route">' + lessons + "</ol>" +
      '<a class="route-teacher" href="#/teacher">' + ui.icon("teacher") + "<span><b>" + GU.TEACHER.title + "</b> " + GU.TEACHER.blurb + "</span></a>" +
      "</section>" +

      '<section class="ov-sec ov-badges">' +
      "<h2>Badges to earn</h2>" +
      "<p>Each part of the course has a badge. The bar at the top right shows how many you’ve earned. Work at your own pace: your progress is saved in this browser.</p>" +
      '<ul class="badge-row">' + badges + "</ul>" +
      '<a class="btn btn-primary js-start" href="' + (store.get().overview ? GU.resumeHref() : "#/lesson-1") + '">' + (store.get().overview ? "Continue the course" : "Start the course") + "</a>" +
      "</section>";

    page.querySelectorAll(".js-start").forEach(function (a) { a.addEventListener("click", startCourse); });
  };
})();

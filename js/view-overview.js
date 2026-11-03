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

    /* Course Structure, laid out like a course page on Khan Academy: one card per lesson, its activities as
       groups, and every step listed with an icon for its type. The course's interactive features are marked. */
    var FX = {
      battle: ["trophy", "Word Battle", "A timed vocabulary contest with a class leaderboard"],
      tutor: ["chat", "AI Tutor", "Answers questions on words and the passage at any time"],
      discuss: ["users", "Class Discussion", "Post first, then read, like and reply to classmates"],
      qa: ["teacher", "Teacher Q&A", "Questions answered by the teacher within three days"],
      feedback: ["sparkle", "AI Writing Feedback", "Gaokao-band marking, corrections and a polished version"]
    };
    function fx(k) { return '<span class="fx fx-' + k + '">' + ui.icon(FX[k][0]) + FX[k][1] + "</span>"; }
    var TYPE = { words: "book", listen: "speaker", video: "play", practice: "pen", write: "pen", discuss: "users", qa: "chat", tool: "sparkle", battle: "trophy", tutor: "chat" };
    /* [step key or activity id, title, type, feature] */
    var S = {
      "l2-video": [["l2v-warm", "Warm-Up Discussion", "discuss", "discuss"], ["l2v-watch", "Video Viewing", "video"], ["l2v-q1", "Comprehension Question", "practice"], ["l2v-q2", "Personal Response", "discuss", "discuss"]],
      "l2-poem": [["l2p-listen", "Listening and Reading", "listen"], ["l2p-q1", "The Theme of the Poem", "practice"], ["l2p-q2", "The Qualities in the Poem", "practice"], ["l2p-q3", "Personal Response", "discuss", "discuss"]],
      "l3-lead": [["l3a-rights", "Legal Ages for Adult Rights", "practice"], ["l3a-type", "Text Structure", "practice"]],
      "l3-read": [["l3b-listen", "Listening and Reading", "listen"], ["l3b-expr", "Key Expression Review", "practice"]],
      "l3-video": [["l3c-watch", "Video Lecture", "video"], ["l3c-qa", "Questions and Answers", "qa", "qa"]],
      "l3-text": [["l3d-title", "Title Selection", "practice"], ["l3d-detail", "Detailed Reading", "practice"], ["l3d-fact", "Fact and Opinion", "practice"]],
      "l4-think": [["l4t-right", "Rights in Adulthood", "discuss", "discuss"], ["l4t-adult", "Responsible Adulthood", "discuss", "discuss"]],
      "l4-write": [["l4w-draft", "Writing Task", "write"], ["l4w-feedback", "Feedback and Revision", "tool", "feedback"], ["l4w-qa", "Questions and Answers", "qa", "qa"], ["l4w-share", "Writing Showcase", "discuss", "discuss"]]
    };
    /* The icon shows the kind of step only; progress is shown by the lesson's completion count. */
    function item(href, title, type, feature, done, extra) {
      return '<li><a class="cs-item" href="' + href + '"><span class="cs-ic">' + ui.icon(TYPE[type]) + "</span>" +
        '<span class="cs-t">' + title + (extra || "") + "</span>" + (feature ? fx(feature) : "") + "</a></li>";
    }
    function group(head, meta, items) {
      return '<div class="cs-group"><h4>' + head + (meta ? "<small>" + meta + "</small>" : "") + '</h4><ul class="cs-list">' + items + "</ul></div>";
    }
    function practice(l, P) {
      return group("Further Practice", "", item(P.battle, "Timed Word Contest", "battle", "battle", false) +
        item(P.tutor, l.n === 1 ? "Questions on Words and Usage" : "Questions on the Passage", "tutor", "tutor", false));
    }
    var lessons = GU.LESSONS.map(function (l) {
      var lp = store.lessonProgress(l);
      var status = lp.done >= lp.total ? '<span class="pill pill-done">' + ui.icon("check") + "Completed</span>" : '<span class="pill">' + lp.done + " of " + lp.total + " completed</span>";
      var groups;
      if (l.n === 1) {
        var sets = l.activities.filter(function (a) { return a.kind === "group"; });
        var drills = l.activities.filter(function (a) { return a.kind !== "group"; });
        groups = group("Word Sets", "Listening, pronunciation, spelling and read-along", sets.map(function (a) {
            return item("#/lesson-1/" + a.id, a.title, "words", "", store.isDone(a.id), ' <small class="cs-sub">' + a.range + "</small>");
          }).join("")) +
          group("Vocabulary Practice", "", drills.map(function (a) {
            return item("#/lesson-1/" + a.id, a.title, "practice", "", store.isDone(a.id), a.bonus ? ' <em class="tag-bonus">Bonus</em>' : "");
          }).join("")) +
          practice(l, GU.PRACTICE["lesson-1"]);
      } else {
        groups = l.activities.map(function (a) {
          return group(a.label + " · " + a.short, a.minutes + " min", S[a.id].map(function (st) {
            return item("#/" + l.id + "/" + a.id, st[1], st[2], st[3], store.step(st[0]));
          }).join(""));
        }).join("") + (GU.PRACTICE[l.id] ? practice(l, GU.PRACTICE[l.id]) : "");
      }
      return '<li class="cs-lesson"><header class="cs-head"><a href="#/' + l.id + '"><span class="cs-k">Lesson ' + l.n + "</span><h3>" + l.title + "</h3></a>" +
        '<span class="cs-meta">' + ui.icon("clock") + l.minutes + " min" + (l.paths ? " · three learning paths" : "") + status + "</span></header>" +
        '<div class="cs-groups">' + groups + "</div></li>";
    }).join("") +
      '<li class="cs-lesson cs-teacher"><header class="cs-head"><a href="#/teacher"><span class="cs-k">For Teachers</span><h3>' + GU.TEACHER.title + '</h3></a></header>' +
      '<div class="cs-groups">' + group("Resources for Each Lesson", "", [["download", "Lesson 1 · Word List"], ["book", "Lesson 2 · Background Information"], ["eye", "Lesson 3 · Difficult Sentences"], ["pen", "Lesson 4 · Writing Guide"]].map(function (r) {
        return '<li><a class="cs-item" href="#/teacher"><span class="cs-ic">' + ui.icon(r[0]) + '</span><span class="cs-t">' + r[1] + "</span></a></li>";
      }).join("")) + "</div></li>";

    var features = Object.keys(FX).map(function (k) { return "<li>" + fx(k) + "<span>" + FX[k][2] + "</span></li>"; }).join("");

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
      '<span class="ov-time">' + ui.icon("clock") + GU.totalMinutes() + " minutes, four lessons</span></div>" +
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
      '<div class="sec-head"><h2 id="cs-h">Course Structure</h2><span class="sec-meta">' + ui.icon("clock") + GU.totalMinutes() + " minutes in total</span></div>" +
      '<div class="cs-fx"><p class="cs-fx-h">Course Features <span>Marked in each lesson below</span></p><ul>' + features + "</ul></div>" +
      '<ol class="cs-lessons">' + lessons + "</ol></section>" +

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

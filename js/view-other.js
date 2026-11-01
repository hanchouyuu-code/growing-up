/* Lessons 2–4 (being built) and the Teacher's corner. */
(function () {
  var ui = GU.ui;

  var PLANS = {
    "lesson-2": [
      "Watch a short video about coming-of-age ceremonies.",
      "Listen to and read lines from Kipling’s poem <em>If—</em>.",
      "Choose the qualities that matter most to you as you grow up."
    ],
    "lesson-3": [
      "Discuss at what age you can do adult things in China.",
      "Read the passage and find out what “the age of majority” means.",
      "Chart each speaker’s feelings, reasons and evidence.",
      "Tell facts from opinions, and share your view with classmates."
    ],
    "lesson-4": [
      "Think through everyday dilemmas young adults face.",
      "Plan your ideas about the responsibilities that come with turning 18.",
      "Write a short response, get feedback and revise it."
    ]
  };

  GU.views.soon = function (page, params) {
    var l = GU.LESSONS.filter(function (x) { return x.id === params.lesson; })[0];
    page.innerHTML =
      '<header class="lesson-head">' +
      '<a class="crumb" href="#/overview">' + ui.icon("left") + "Course overview</a>" +
      '<p class="lesson-kicker">Lesson ' + l.n + " <span>" + l.minutes + " minutes</span></p>" +
      "<h1>" + ui.esc(l.title) + "</h1>" +
      '<p class="lede">' + l.blurb + "</p></header>" +
      '<section class="soon-card">' +
      '<span class="soon-ic">' + ui.icon("lock") + "</span>" +
      "<div><h2>This lesson opens soon</h2><p>Lesson 1 is ready now. Start there, and this lesson will appear here when it’s ready.</p>" +
      '<a class="btn btn-primary" href="#/lesson-1">Go to Lesson 1</a></div></section>' +
      '<section class="plan"><h2>What you’ll do</h2><ul class="plan-list">' +
      PLANS[l.id].map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul></section>";
  };

  GU.views.teacher = function (page) {
    var rows = GU.LESSONS.map(function (l) {
      return "<tr><td>Lesson " + l.n + "</td><td>" + ui.esc(l.title) + "</td><td>" + l.minutes + " min</td><td>" + (l.soon ? "Coming soon" : "Ready") + "</td></tr>";
    }).join("");
    page.innerHTML =
      '<header class="lesson-head">' +
      '<a class="crumb" href="#/overview">' + ui.icon("left") + "Course overview</a>" +
      '<p class="lesson-kicker">For teachers</p>' +
      "<h1>" + GU.TEACHER.title + "</h1>" +
      '<p class="lede">' + GU.TEACHER.blurb + "</p></header>" +
      '<section class="plan"><h2>Course at a glance</h2>' +
      '<div class="table-wrap"><table class="glance"><thead><tr><th>Part</th><th>Focus</th><th>Time</th><th>Status</th></tr></thead><tbody>' +
      rows + '<tr class="total"><td colspan="2">Total</td><td>90 min</td><td></td></tr></tbody></table></div></section>' +
      '<section class="plan"><h2>Resources</h2><ul class="res-list">' +
      '<li><a class="download" href="downloads/unit1-word-list.pdf" download>' + ui.icon("download") +
      "<span><b>Unit 1 word list</b>30 words with phonetics, meanings and example sentences (PDF)</span></a></li>" +
      '<li class="res-soon">' + ui.icon("lock") + "<span><b>Lesson plans and answer keys</b>Coming soon</span></li>" +
      '<li class="res-soon">' + ui.icon("lock") + "<span><b>Discussion prompts and marking guide</b>Coming soon</span></li>" +
      "</ul></section>";
  };
})();

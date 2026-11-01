/* Lessons 2–4 (being built) and the Teacher's corner. */
(function () {
  var ui = GU.ui;

  var PLANS = {
    "lesson-2": [
      "Viewing a short video on coming-of-age ceremonies",
      "Listening to and reading lines from Rudyard Kipling’s poem <em>If—</em>",
      "Identifying the personal qualities most important in growing up"
    ],
    "lesson-3": [
      "Discussing the legal ages for adult rights in China",
      "Reading the passage to establish the meaning of “the age of majority”",
      "Charting each speaker’s feelings, reasons and textual evidence",
      "Distinguishing facts from opinions and evaluating the speakers’ views"
    ],
    "lesson-4": [
      "Analysing everyday dilemmas faced by young adults",
      "Planning a response on the responsibilities that come with turning 18",
      "Drafting, receiving feedback on and revising a short written response"
    ]
  };

  GU.views.soon = function (page, params) {
    var l = GU.LESSONS.filter(function (x) { return x.id === params.lesson; })[0];
    page.innerHTML =
      '<header class="lesson-head">' +
      '<a class="crumb" href="#/overview">' + ui.icon("left") + "Course Overview</a>" +
      '<p class="lesson-kicker">Lesson ' + l.n + " <span>" + l.minutes + " minutes</span></p>" +
      "<h1>" + ui.esc(l.title) + "</h1>" +
      '<p class="lede">' + l.blurb + "</p></header>" +
      '<section class="soon-card">' +
      '<span class="soon-ic">' + ui.icon("lock") + "</span>" +
      "<div><h2>Lesson Availability</h2><p>This lesson is in preparation and will be published on this page. Lesson 1 is available now.</p>" +
      '<a class="btn btn-primary" href="#/lesson-1">Proceed to Lesson 1</a></div></section>' +
      '<section class="plan"><h2>Planned Learning Activities</h2><ul class="plan-list">' +
      PLANS[l.id].map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul></section>";
  };

  GU.views.teacher = function (page) {
    var rows = GU.LESSONS.map(function (l) {
      return "<tr><td>Lesson " + l.n + "</td><td>" + ui.esc(l.title) + "</td><td>" + l.minutes + " min</td><td>" + (l.soon ? "In preparation" : "Available") + "</td></tr>";
    }).join("");
    page.innerHTML =
      '<header class="lesson-head">' +
      '<a class="crumb" href="#/overview">' + ui.icon("left") + "Course Overview</a>" +
      '<p class="lesson-kicker">For Teachers</p>' +
      "<h1>" + GU.TEACHER.title + "</h1>" +
      '<p class="lede">' + GU.TEACHER.blurb + "</p></header>" +
      '<section class="plan"><h2>Course Schedule</h2>' +
      '<div class="table-wrap"><table class="glance"><thead><tr><th>Part</th><th>Focus</th><th>Time</th><th>Status</th></tr></thead><tbody>' +
      rows + '<tr class="total"><td colspan="2">Total</td><td>90 min</td><td></td></tr></tbody></table></div></section>' +
      '<section class="plan"><h2>Teaching Resources</h2><ul class="res-list">' +
      '<li><a class="download" href="downloads/unit1-word-list.pdf" download>' + ui.icon("download") +
      "<span><b>Unit 1 Word List (PDF)</b>Thirty words with phonetics, meanings and textbook sentences</span></a></li>" +
      '<li class="res-soon">' + ui.icon("lock") + "<span><b>Lesson Plans and Answer Keys</b>In preparation</span></li>" +
      '<li class="res-soon">' + ui.icon("lock") + "<span><b>Discussion Prompts and Marking Guide</b>In preparation</span></li>" +
      "</ul></section>";
  };
})();

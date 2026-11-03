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

  /* Teacher Resources: one set of resources for each lesson. */
  GU.views.teacher = function (page) {
    var TR = GU.TR, W = TR.writing;
    var SP = {}; GU.L3.speakers.forEach(function (sp) { SP[sp.id] = sp; });
    function who(id) { return id === "intro" ? "Introduction" : SP[id].name; }
    function face(id) { return id === "intro" ? "" : '<img class="tc-face" src="' + SP[id].face + '" alt="">'; }
    function mark(text, words) {
      var h = ui.esc(text);
      words.forEach(function (w) { h = h.replace(ui.esc(w), '<mark class="hl">' + ui.esc(w) + "</mark>"); });
      return h;
    }
    var SECS = [
      ["tc-words", "download", "Lesson 1 · Vocabulary", "Word List"],
      ["tc-background", "book", "Lesson 2 · Starting Out", "Background Information"],
      ["tc-sentences", "eye", "Lesson 3 · Understanding Ideas", "Difficult Sentences"],
      ["tc-writing", "pen", "Lesson 4 · Writing", "Writing Guide"]
    ];
    function head(i, intro) {
      return '<section class="tc-sec" id="' + SECS[i][0] + '"><header class="tc-sec-h"><p class="tc-k">' + SECS[i][2] + "</p><h2>" + SECS[i][3] + "</h2>" + (intro ? '<p class="tc-intro">' + intro + "</p>" : "") + "</header>";
    }

    var background = TR.background.map(function (b) {
      return '<article class="tc-bg"><p class="tc-where">' + b.where + "</p><h3>" + ui.esc(b.title) + "</h3><p>" + ui.esc(b.text).replace(/\bIf\b/, "<i>If</i>") + "</p>" +
        '<p class="tc-use">' + ui.icon("bulb") + "<span><b>Suggested use.</b> " + ui.esc(b.use) + "</span></p></article>";
    }).join("");

    var sentences = TR.sentences.map(function (x, i) {
      return '<details class="tc-sent"' + (i === 0 ? " open" : "") + "><summary>" +
        '<span class="tc-n">' + (i + 1) + "</span>" + face(x.who) + '<span class="tc-sum"><span class="tc-who">' + who(x.who) + '</span><span class="tc-en">' + ui.esc(x.en) + "</span></span>" + ui.icon("right") + "</summary>" +
        '<div class="tc-sent-b"><p class="tc-para"><b>Paraphrase</b>' + ui.esc(x.paraphrase) + "</p>" +
        x.notes.map(function (n) {
          return '<div class="tc-note" lang="zh-CN"><p>' + ui.esc(n[0]) + "</p>" + (n[1].length ? '<ul class="tc-ex">' + n[1].map(function (e) {
            return '<li><span lang="en">' + ui.esc(e[0]) + "</span><small>" + ui.esc(e[1]) + "</small></li>";
          }).join("") + "</ul>" : "") + "</div>";
        }).join("") + "</div></details>";
    }).join("");

    var writing =
      '<h3 class="tc-h3">Essay Structure</h3>' +
      '<p class="tc-p">The task has three content points. A three-part plan covers each of them once and keeps the essay close to 80 words.</p>' +
      '<div class="table-wrap"><table class="glance tc-plan"><thead><tr><th>Part</th><th>Content</th><th>Sentences</th><th>Words</th></tr></thead><tbody>' +
      W.structure.map(function (r) {
        return "<tr><td><b>" + r.part + '</b><small lang="zh-CN">' + r.zh + (r.point ? " · " + r.point : "") + "</small></td><td>" + ui.esc(r.content) + '<small class="tc-eg">' + ui.esc(r.eg) + "</small></td><td data-l=\"Sentences\">" + r.sentences + "</td><td data-l=\"Words\">" + r.words + "</td></tr>";
      }).join("") + '<tr class="total"><td colspan="2">Total</td><td data-l="Sentences">6–7</td><td data-l="Words">about 80</td></tr></tbody></table></div>' +
      '<h3 class="tc-h3">Marking Principles</h3>' +
      '<ul class="tc-list">' + W.marking.map(function (m) { return "<li>" + ui.esc(m) + "</li>"; }).join("") + "</ul>" +
      '<p class="tc-p">Band descriptors: ' + GU.L4.bands.map(function (b) { return b[2] + " (" + b[0] + "–" + b[1] + ")"; }).join(", ") + ". Students’ AI feedback in Guided Writing uses the same bands.</p>" +
      '<h3 class="tc-h3">Useful Language from the Passage</h3>' +
      '<p class="tc-p">Expressions from <i>The Age of Majority</i> that students can adapt for each part of the essay. Each entry gives the sentence in the passage and an example for the essay.</p>' +
      W.language.map(function (g) {
        return '<div class="tc-lang"><p class="tc-lang-g">' + g[0] + '</p><ul class="tc-lang-l">' + g[1].map(function (x) {
          return '<li><p class="tc-phrase">' + ui.esc(x.phrase) + "</p>" +
            '<p class="tc-src"><span class="tc-src-k">' + face(x.who) + who(x.who) + "</span>" + mark(x.src, [x.k[0]]) + "</p>" +
            '<p class="tc-use-eg"><span class="tc-src-k">For the essay</span>' + mark(x.eg, [x.k[1]]) + "</p></li>";
        }).join("") + "</ul></div>";
      }).join("");

    page.innerHTML =
      '<header class="lesson-head">' +
      '<a class="crumb" href="#/overview">' + ui.icon("left") + "Course Overview</a>" +
      '<p class="lesson-kicker">For Teachers</p>' +
      "<h1>" + GU.TEACHER.title + "</h1></header>" +
      '<section class="tc-about" aria-labelledby="tc-about-h"><h2 id="tc-about-h">About this unit</h2><p class="lede">' + ui.esc(TR.about) + "</p>" +
      '<ul class="tc-index">' + SECS.map(function (x) {
        return '<li><button type="button" data-go="' + x[0] + '"><span class="tc-ic">' + ui.icon(x[1]) + "</span><span><small>" + x[2].split(" · ")[0] + "</small><b>" + x[3] + "</b></span></button></li>";
      }).join("") + "</ul></section>" +

      head(0) +
      '<ul class="res-list"><li><a class="download" href="downloads/unit1-word-list.pdf" download>' + ui.icon("download") +
      "<span><b>Unit 1 Word List (PDF)</b>Thirty words with phonetics, meanings and textbook sentences</span></a></li></ul></section>" +

      head(1) + '<div class="tc-bgs">' + background + "</div></section>" +

      head(2) + '<div class="tc-sents">' + sentences + "</div></section>" +

      head(3, "Support for the 80-word essay <i>Me at Eighteen</i>, in the format of the gaokao applied writing task.") + writing + "</section>";

    page.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = page.querySelector("#" + b.dataset.go);
        t.scrollIntoView({ behavior: "smooth", block: "start" });
        var h = t.querySelector("h2"); h.setAttribute("tabindex", "-1"); setTimeout(function () { h.focus({ preventScroll: true }); }, 400);
      });
    });
  };
})();

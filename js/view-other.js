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
    var L2 = GU.L2;
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
      '<li class="res-soon">' + ui.icon("lock") + "<span><b>Lesson Plans and Answer Keys for Lessons 3 and 4</b>In preparation</span></li>" +
      "</ul></section>" +
      '<section class="plan"><h2>Lesson 2 Reference Answers</h2><dl class="keys">' +
      "<dt>Activity 1, Comprehension Question</dt><dd><i>" + ui.esc(L2.q1.prompt) + "</i><br>" +
      L2.q1.rows.map(function (r, i) { var pl = r.place || L2.q1.rows[i - 1].place; return ui.esc(pl) + ": " + ui.esc(r.age) + ", " + ui.esc(r.how); }).join("; ") + ".</dd>" +
      "<dt>Activity 2, The Theme of the Poem</dt><dd><i>" + ui.esc(L2.pq1.prompt) + "</i><br>" + ui.esc(L2.pq1.reference) + "</dd>" +
      "<dt>Activity 2, The Qualities in the Poem</dt><dd>" + ui.esc(L2.pq2.reference) + " <i>Pride</i> is the distractor. Line numbers in the feedback refer to the full poem; the textbook prints stanzas 1 and 4 (lines 1–8 and 25–32).</dd>" +
      "<dt>Personal Responses</dt><dd>The warm-up and the two personal-response questions are open. Students post first and only then see their classmates’ answers, so that each student forms a view before the discussion begins.</dd>" +
      "</dl></section>" +
      '<section class="plan"><h2>Discussion Moderation</h2>' +
      "<p>Posts in the Lesson 2 class discussions appear immediately. Enter the teacher key (the <code>TEACHER_KEY</code> value set in Vercel) to show <b>Remove</b> buttons on posts and replies on this device.</p>" +
      '<form class="tkey" autocomplete="off"><label class="sr-only" for="tkey">Teacher key</label>' +
      '<input class="spell-in" id="tkey" type="password" placeholder="Teacher key" value="' + ui.esc(savedKey()) + '">' +
      '<button class="btn btn-primary btn-sm" type="submit">Save Key</button>' +
      '<button class="btn btn-ghost btn-sm" type="button" data-forget>Forget Key</button></form>' +
      '<p class="tkey-msg" aria-live="polite">' + (savedKey() ? "A teacher key is saved on this device." : "") + "</p></section>";

    var form = page.querySelector(".tkey"), msg = page.querySelector(".tkey-msg"), inp = page.querySelector("#tkey");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var key = inp.value.trim();
      if (!key) { msg.textContent = "Enter the key first."; return; }
      msg.textContent = "Checking…";
      fetch("api/discuss", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "check-key", board: "l2-warmup", key: key }) })
        .then(function (r) { return r.json().then(function (d) { return { status: r.status, d: d }; }); })
        .then(function (x) {
          if (x.status === 503) { msg.textContent = "The discussion service is not connected yet. Connect Upstash Redis in Vercel first."; return; }
          if (x.status === 429) { msg.textContent = x.d.error; return; }
          if (x.d.ok) { setKey(key); msg.textContent = "Key confirmed. Remove buttons now appear in the class discussions on this device."; }
          else msg.textContent = x.d.set ? "This key does not match. Check the TEACHER_KEY value in Vercel." : "No TEACHER_KEY has been set in Vercel yet.";
        })
        .catch(function () { msg.textContent = "The discussion service could not be reached."; });
    });
    page.querySelector("[data-forget]").addEventListener("click", function () { setKey(""); inp.value = ""; msg.textContent = "The key has been removed from this device."; });
  };

  function savedKey() { try { return localStorage.getItem("gu-teacher-key") || ""; } catch (e) { return ""; } }
  function setKey(k) { try { if (k) localStorage.setItem("gu-teacher-key", k); else localStorage.removeItem("gu-teacher-key"); } catch (e) {} }
})();

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
      rows + '<tr class="total"><td colspan="2">Total</td><td>' + GU.totalMinutes() + ' min</td><td></td></tr></tbody></table></div></section>' +
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
      '<section class="plan"><h2>Lesson 3 Reference Answers</h2><dl class="keys">' +
      "<dt>Activity 1, Legal Ages for Adult Rights</dt><dd>" + GU.L3.rights.items.map(function (it) { return ui.esc(it.text) + ": " + it.answer.join(" (women) / ") + (it.answer.length > 1 ? " (men)" : ""); }).join("; ") + ".</dd>" +
      "<dt>Activity 4, Title Selection</dt><dd>" + ui.esc(GU.L3.titleQ.options[GU.L3.titleQ.answer].text) + "</dd>" +
      "<dt>Activity 1, Text Structure</dt><dd>" + ui.esc(GU.L3.typeQ.options[GU.L3.typeQ.answer].text) + ": an introduction followed by three personal opinions.</dd>" +
      "<dt>Activity 4, Fact and Opinion</dt><dd>" + GU.L3.factQ.items.map(function (it, i) { return (i + 1) + " " + it.answer; }).join("  ") + "</dd>" +
      "</dl></section>" +
      '<section class="plan"><h2>Lesson 3 Questions from Students</h2>' +
      "<p>Questions posted in Activity 3 of Lesson 3. Students are told that the teacher replies within three days. Save the teacher key below, then answer on the activity page; your replies are marked as the teacher’s answer.</p>" +
      '<div class="tq-list"><p class="tkey-msg">Loading the questions…</p></div>' +
      '<a class="btn btn-ghost btn-sm" href="#/lesson-3/l3-video">Open the Questions and Answers</a></section>' +
      '<section class="plan"><h2>Class Discussion and Q&amp;A Service</h2>' +
      '<p class="svc"><span class="svc-dot"></span><span class="svc-txt">Checking the connection…</span></p>' +
      '<ol class="svc-steps" hidden>' +
      "<li>Open the project in Vercel and select <b>Storage</b>, then <b>Create Database</b>, then <b>Upstash for Redis</b> (the free plan is enough).</li>" +
      "<li>Select <b>Connect Project</b> and choose this site. Vercel adds the connection settings automatically.</li>" +
      "<li>Under <b>Settings</b>, then <b>Environment Variables</b>, add <code>TEACHER_KEY</code> with a password of your choice.</li>" +
      "<li>Under <b>Deployments</b>, select <b>Redeploy</b> on the latest deployment. This page then shows “Connected”.</li></ol>" +
      "</section>" +
      '<section class="plan"><h2>Discussion Moderation</h2>' +
      "<p>Posts in the Lesson 2 class discussions appear immediately. Enter the teacher key (the <code>TEACHER_KEY</code> value set in Vercel) to show <b>Remove</b> buttons on posts and replies on this device.</p>" +
      '<form class="tkey" autocomplete="off"><label class="sr-only" for="tkey">Teacher key</label>' +
      '<input class="spell-in" id="tkey" type="password" placeholder="Teacher key" value="' + ui.esc(savedKey()) + '">' +
      '<button class="btn btn-primary btn-sm" type="submit">Save Key</button>' +
      '<button class="btn btn-ghost btn-sm" type="button" data-forget>Forget Key</button></form>' +
      '<p class="tkey-msg tkey-status" aria-live="polite">' + (savedKey() ? "A teacher key is saved on this device." : "") + "</p></section>";

    var svc = page.querySelector(".svc");
    fetch("api/discuss?board=l3-qa", { cache: "no-store" }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (x) {
        var on = x.ok && x.d.configured;
        svc.classList.add(on ? "is-on" : "is-off");
        svc.querySelector(".svc-txt").innerHTML = on
          ? "<b>Connected.</b> Students’ posts, likes, replies and questions are shared across all devices, and the Word Battle leaderboard is live."
          : "<b>Not connected yet.</b> Each student sees only their own answers and questions on their own device. Follow the four steps below to connect the service.";
        page.querySelector(".svc-steps").hidden = on;
      })
      .catch(function () {
        svc.classList.add("is-off");
        svc.querySelector(".svc-txt").innerHTML = "<b>Not connected yet.</b> Follow the four steps below to connect the service.";
        page.querySelector(".svc-steps").hidden = false;
      });
    var tq = page.querySelector(".tq-list");
    fetch("api/discuss?board=l3-qa", { cache: "no-store" }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      var open = (d.posts || []).filter(function (p) { return !(p.replies || []).some(function (r) { return r.teacher; }); });
      tq.innerHTML = open.length ? '<ul class="res-list tq">' + open.map(function (p) {
        var days = Math.floor((Date.now() - p.at) / 86400000);
        return "<li><span><b>" + ui.esc(p.name) + "</b> " + ui.esc(p.text) + '<small class="' + (days >= 3 ? "late" : "") + '">' + (days ? days + (days === 1 ? " day" : " days") + " ago" : "today") + "</small></span></li>";
      }).join("") + "</ul>" : '<p class="tkey-msg">All questions have been answered.</p>';
    }).catch(function () { tq.innerHTML = '<p class="tkey-msg">The question board is not connected yet. Connect Upstash Redis in Vercel to collect questions.</p>'; });

    var form = page.querySelector(".tkey"), msg = page.querySelector(".tkey-status"), inp = page.querySelector("#tkey");
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

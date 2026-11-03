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

  /* Teacher Resources: background notes, sentence notes, a writing guide, answer keys and class management. */
  GU.views.teacher = function (page) {
    var L2 = GU.L2, TR = GU.TR, W = TR.writing;
    var SP = {}; GU.L3.speakers.forEach(function (sp) { SP[sp.id] = sp; });
    function who(id) { return id === "intro" ? "Introduction" : SP[id].name; }
    function face(id) { return id === "intro" ? "" : '<img class="tc-face" src="' + SP[id].face + '" alt="">'; }
    var SECS = [
      ["tc-schedule", "clock", "Course Schedule", "Timings for the four lessons and the unit word list"],
      ["tc-background", "book", "Background Information", "Coming-of-age ceremonies, style names and Rudyard Kipling"],
      ["tc-sentences", "eye", "Difficult Sentences", "Structure, paraphrase and language points in the passage"],
      ["tc-writing", "pen", "Writing Guide", "Structure, marking, useful language and common errors"],
      ["tc-keys", "check", "Answer Keys", "Reference answers for Lessons 2, 3 and 4"],
      ["tc-class", "users", "Class Management", "Student questions, the discussion service and moderation"]
    ];
    function head(id, kicker, title, intro) {
      return '<section class="tc-sec" id="' + id + '"><header class="tc-sec-h">' + (kicker ? '<p class="tc-k">' + kicker + "</p>" : "") + "<h2>" + title + "</h2>" + (intro ? '<p class="tc-intro">' + intro + "</p>" : "") + "</header>";
    }
    var rows = GU.LESSONS.map(function (l) {
      return "<tr><td>Lesson " + l.n + "</td><td>" + ui.esc(l.title) + "</td><td>" + l.minutes + " min</td></tr>";
    }).join("");

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

    function mark(text, words) {
      var h = ui.esc(text);
      words.forEach(function (w) { h = h.replace(ui.esc(w), '<mark class="hl">' + ui.esc(w) + "</mark>"); });
      return h;
    }
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
      }).join("") +
      '<h3 class="tc-h3">Annotated Model Essay</h3>' +
      '<div class="tc-model"><p class="tc-model-t">' + GU.L4.task.title + '<small>' + GU.L4.task.model.split(/\s+/).length + " words</small></p><ol>" +
      W.annotated.map(function (r) { return '<li><span class="tc-tag">' + r[0] + "</span><span>" + mark(r[1], W.highlight) + "</span></li>"; }).join("") + "</ol></div>" +
      '<h3 class="tc-h3">Common Errors</h3>' +
      '<div class="table-wrap"><table class="glance tc-err"><thead><tr><th>Error</th><th>Correction</th><th>Rule</th></tr></thead><tbody>' +
      W.errors.map(function (e) { return "<tr><td><s>" + ui.esc(e[0]) + "</s></td><td><b>" + ui.esc(e[1]) + "</b></td><td data-l=\"Rule\">" + ui.esc(e[2]) + "</td></tr>"; }).join("") +
      "</tbody></table></div>";

    page.innerHTML =
      '<header class="lesson-head">' +
      '<a class="crumb" href="#/overview">' + ui.icon("left") + "Course Overview</a>" +
      '<p class="lesson-kicker">For Teachers</p>' +
      "<h1>" + GU.TEACHER.title + "</h1></header>" +
      '<section class="tc-about" aria-labelledby="tc-about-h"><h2 id="tc-about-h">About this unit</h2><p class="lede">' + ui.esc(TR.about) + "</p>" +
      '<ul class="tc-index">' + SECS.map(function (x) {
        return '<li><button type="button" data-go="' + x[0] + '"><span class="tc-ic">' + ui.icon(x[1]) + "</span><span><b>" + x[2] + "</b>" + x[3] + "</span></button></li>";
      }).join("") + "</ul></section>" +

      head("tc-schedule", "", "Course Schedule") +
      '<div class="table-wrap"><table class="glance"><thead><tr><th>Part</th><th>Focus</th><th>Time</th></tr></thead><tbody>' +
      rows + '<tr class="total"><td colspan="2">Total</td><td>' + GU.totalMinutes() + " min</td></tr></tbody></table></div>" +
      '<ul class="res-list tc-dl"><li><a class="download" href="downloads/unit1-word-list.pdf" download>' + ui.icon("download") +
      "<span><b>Unit 1 Word List (PDF)</b>Thirty words with phonetics, meanings and textbook sentences</span></a></li></ul></section>" +

      head("tc-background", "Lesson 2 · Starting Out", "Background Information", "Notes from the teacher’s book on the coming-of-age ceremonies and the poem, with a suggested use for each.") +
      '<div class="tc-bgs">' + background + "</div></section>" +

      head("tc-sentences", "Lesson 3 · Understanding Ideas", "Difficult Sentences", "Five sentences from <i>The Age of Majority</i>, each with a paraphrase and notes from the teacher’s book on structure and language points. Select a sentence to show or hide its notes.") +
      '<div class="tc-sents">' + sentences + "</div></section>" +

      head("tc-writing", "Lesson 4 · Writing", "Writing Guide", "Support for the 80-word essay <i>Me at Eighteen</i>, in the format of the gaokao applied writing task.") +
      writing + "</section>" +

      head("tc-keys", "Lessons 2–4", "Answer Keys") +
      '<h3 class="tc-h3">Lesson 2: Starting Out</h3><dl class="keys">' +
      "<dt>Activity 1, Comprehension Question</dt><dd><i>" + ui.esc(L2.q1.prompt) + "</i><br>" +
      L2.q1.rows.map(function (r, i) { var pl = r.place || L2.q1.rows[i - 1].place; return ui.esc(pl) + ": " + ui.esc(r.age) + ", " + ui.esc(r.how); }).join("; ") + ".</dd>" +
      "<dt>Activity 2, The Theme of the Poem</dt><dd><i>" + ui.esc(L2.pq1.prompt) + "</i><br>" + ui.esc(L2.pq1.reference) + "</dd>" +
      "<dt>Activity 2, The Qualities in the Poem</dt><dd>" + ui.esc(L2.pq2.reference) + " <i>Pride</i> is the distractor. Line numbers in the feedback refer to the full poem; the textbook prints stanzas 1 and 4 (lines 1–8 and 25–32).</dd>" +
      "<dt>Personal Responses</dt><dd>The warm-up and the two personal-response questions are open. Students post first and only then see their classmates’ answers, so that each student forms a view before the discussion begins.</dd>" +
      "</dl>" +
      '<h3 class="tc-h3">Lesson 3: Understanding Ideas</h3><dl class="keys">' +
      "<dt>Activity 1, Legal Ages for Adult Rights</dt><dd>" + GU.L3.rights.items.map(function (it) { return ui.esc(it.text) + ": " + it.answer.join(" (women) / ") + (it.answer.length > 1 ? " (men)" : ""); }).join("; ") + ".</dd>" +
      "<dt>Activity 1, Text Structure</dt><dd>" + ui.esc(GU.L3.typeQ.options[GU.L3.typeQ.answer].text) + ": an introduction followed by three personal opinions.</dd>" +
      "<dt>Activity 4, Title Selection</dt><dd>" + ui.esc(GU.L3.titleQ.options[GU.L3.titleQ.answer].text) + "</dd>" +
      "<dt>Activity 4, Fact and Opinion</dt><dd>" + GU.L3.factQ.items.map(function (it, i) { return (i + 1) + " " + it.answer; }).join("  ") + "</dd>" +
      "</dl>" +
      '<h3 class="tc-h3">Lesson 4: Writing</h3><dl class="keys">' +
      "<dt>Activity 1, Rights in Adulthood (sample answer)</dt><dd><i>" + ui.esc(GU.L4.right.prompt) + "</i><br>" + ui.esc(GU.L4.right.example) + "</dd>" +
      "<dt>Activity 1, Responsible Adulthood (sample answer)</dt><dd><i>" + ui.esc(GU.L4.adult.prompt) + "</i><br>" + ui.esc(GU.L4.adult.example) + "</dd>" +
      "<dt>Activity 2, Writing Task</dt><dd lang=\"zh-CN\">" + GU.L4.task.zh.concat(GU.L4.task.note).map(ui.esc).join("<br>") + "</dd>" +
      "<dt>Activity 2, Model Essay (" + GU.L4.task.model.split(/\s+/).length + " words)</dt><dd><b>" + GU.L4.task.title + "</b><br>" + ui.esc(GU.L4.task.model) + "</dd>" +
      "</dl></section>" +

      head("tc-class", "", "Class Management") +
      '<h3 class="tc-h3">Questions from Students</h3>' +
      '<p class="tc-p">Questions posted in Lesson 3 (Video Lecture) and Lesson 4 (Guided Writing). Students are told that the teacher replies within three days. Save the teacher key below, then answer on the activity page; your replies are marked as the teacher’s answer.</p>' +
      '<div class="tq-list"><p class="tkey-msg">Loading the questions…</p></div>' +
      '<div class="q-actions"><a class="btn btn-ghost btn-sm" href="#/lesson-3/l3-video">Open the Lesson 3 Questions</a><a class="btn btn-ghost btn-sm" href="#/lesson-4/l4-write">Open the Lesson 4 Questions</a></div>' +
      '<h3 class="tc-h3">Class Discussion and Q&amp;A Service</h3>' +
      '<p class="svc"><span class="svc-dot"></span><span class="svc-txt">Checking the connection…</span></p>' +
      '<ol class="svc-steps" hidden>' +
      "<li>Open the project in Vercel and select <b>Storage</b>, then <b>Create Database</b>, then <b>Upstash for Redis</b> (the free plan is enough).</li>" +
      "<li>Select <b>Connect Project</b> and choose this site. Vercel adds the connection settings automatically.</li>" +
      "<li>Under <b>Settings</b>, then <b>Environment Variables</b>, add <code>TEACHER_KEY</code> with a password of your choice.</li>" +
      "<li>Under <b>Deployments</b>, select <b>Redeploy</b> on the latest deployment. This page then shows “Connected”.</li></ol>" +
      '<h3 class="tc-h3">Discussion Moderation</h3>' +
      '<p class="tc-p">Posts in the class discussions appear immediately. Enter the teacher key (the <code>TEACHER_KEY</code> value set in Vercel) to show <b>Remove</b> buttons on posts and replies on this device, and to answer questions as the teacher.</p>' +
      '<form class="tkey" autocomplete="off"><label class="sr-only" for="tkey">Teacher key</label>' +
      '<input class="spell-in" id="tkey" type="password" placeholder="Teacher key" value="' + ui.esc(savedKey()) + '">' +
      '<button class="btn btn-primary btn-sm" type="submit">Save Key</button>' +
      '<button class="btn btn-ghost btn-sm" type="button" data-forget>Forget Key</button></form>' +
      '<p class="tkey-msg tkey-status" aria-live="polite">' + (savedKey() ? "A teacher key is saved on this device." : "") + "</p></section>";

    page.querySelectorAll("[data-go]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = page.querySelector("#" + b.dataset.go);
        t.scrollIntoView({ behavior: "smooth", block: "start" });
        var h = t.querySelector("h2"); h.setAttribute("tabindex", "-1"); setTimeout(function () { h.focus({ preventScroll: true }); }, 400);
      });
    });

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
    Promise.all(["l3-qa", "l4-qa"].map(function (b) {
      return fetch("api/discuss?board=" + b, { cache: "no-store" }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) { return (d.posts || []).map(function (p) { p.lesson = b === "l3-qa" ? "Lesson 3" : "Lesson 4"; return p; }); });
    })).then(function (lists) {
      var open = lists[0].concat(lists[1]).filter(function (p) { return !(p.replies || []).some(function (r) { return r.teacher; }); }).sort(function (a, b) { return a.at - b.at; });
      tq.innerHTML = open.length ? '<ul class="res-list tq">' + open.map(function (p) {
        var days = Math.floor((Date.now() - p.at) / 86400000);
        return "<li><span><b>" + ui.esc(p.name) + "</b> " + ui.esc(p.text) + '<small class="' + (days >= 3 ? "late" : "") + '">' + p.lesson + " · " + (days ? days + (days === 1 ? " day" : " days") + " ago" : "today") + "</small></span></li>";
      }).join("") + "</ul>" : '<p class="tkey-msg">All questions have been answered.</p>';
    }).catch(function () { tq.innerHTML = '<p class="tkey-msg">The question boards are not connected yet. Connect Upstash Redis in Vercel to collect questions.</p>'; });

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

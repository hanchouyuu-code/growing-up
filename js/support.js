/* Help and Support: common questions, a message to the course team, the student's own messages and replies,
   and the course team's inbox (#/support, opened with the teacher key). */
(function () {
  var ui = GU.ui, store = GU.store;
  var IDS = "gu-support-ids", SEEN = "gu-support-seen";
  var TOPICS = ["Technical problem", "Error in the content", "Progress or badges", "Suggestion", "Other"];

  function ls(k, v) {
    try {
      if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null");
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { return null; }
  }
  function myIds() { return ls(IDS) || []; }
  function teacherKey() { try { return localStorage.getItem("gu-teacher-key") || ""; } catch (e) { return ""; } }
  function setTeacherKey(k) { try { if (k) localStorage.setItem("gu-teacher-key", k); else localStorage.removeItem("gu-teacher-key"); } catch (e) {} }
  function when(t) { return new Date(t).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
  function post(body) {
    return fetch("api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) { var e = new Error(d.error || "http " + r.status); e.status = r.status; throw e; } return d; }); });
  }
  function fetchMine() {
    var ids = myIds();
    if (!ids.length) return Promise.resolve([]);
    return fetch("api/support?ids=" + ids.join(","), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (d) { return (d.messages || []).sort(function (a, b) { return b.at - a.at; }); });
  }
  function latestReply(list) {
    return list.reduce(function (t, m) { return (m.replies || []).reduce(function (u, r) { return Math.max(u, r.at); }, t); }, 0);
  }
  /* A dot on the Help and Support button when the course team has replied since the student last looked. */
  function markButton(on) { GU.support.replyDot = !!on; var b = document.getElementById("help-btn"); if (b) b.classList.toggle("has-reply", !!on); }
  function checkReplies() {
    fetchMine().then(function (list) { markButton(latestReply(list) > (ls(SEEN) || 0)); }).catch(function () {});
  }

  var FAQ = [
    ["Progress storage", "Progress is saved in this browser on this device. A different device or cleared browser data starts the course again."],
    ["No sound", "Turn off silent mode, raise the volume and select the speaker button again. The Slow button plays the word at a lower speed."],
    ["Recording problems", "Allow microphone access when the browser asks. If recording still fails, say the word aloud three times and select <b>I Said It</b>."],
    ["Class discussions show “This device only”", "The class service has not been connected yet, so only your own answers are shown. Your answers are kept and appear for the class once it is connected."],
    ["AI Tutor and AI feedback", "If the AI service is unavailable, the AI Tutor shows hints prepared by the teacher and the writing feedback shows an automatic estimate."],
    ["Other problems", "Send a message to the course team under <b>Contact Us</b>. Replies appear under <b>My Messages</b>."]
  ];

  function open(tab) {
    var p = store.player() || {};
    var html = '<h2 class="modal-title">Help and Support</h2>' +
      '<div class="seg hs-tabs" role="tablist">' +
      '<button role="tab" data-tab="faq">Common Questions</button><button role="tab" data-tab="contact">Contact Us</button><button role="tab" data-tab="mine">My Messages</button></div>' +
      '<section class="hs-pane" data-pane="faq"><dl class="help-list">' + FAQ.map(function (f) { return "<dt>" + f[0] + "</dt><dd>" + f[1] + "</dd>"; }).join("") + "</dl>" +
      '<div class="help-reset"><button class="btn btn-ghost btn-danger" id="reset-btn">Reset My Progress</button></div></section>' +
      '<section class="hs-pane" data-pane="contact"><p class="modal-sub">Write to the course team about a technical problem, an error in the content or a suggestion. The page you are on is attached to the message.</p>' +
      '<form class="hs-form" autocomplete="off">' +
      '<div class="hs-row"><label><span>Name or nickname</span><input class="spell-in" name="name" maxlength="24" value="' + ui.esc(p.name || "") + '"></label>' +
      '<label><span>Class <small>(optional)</small></span><input class="spell-in" name="cls" maxlength="24" placeholder="e.g. Senior 2, Class 3"></label></div>' +
      '<label><span>Topic</span><select class="spell-in" name="topic">' + TOPICS.map(function (t) { return "<option>" + t + "</option>"; }).join("") + "</select></label>" +
      '<label><span>Message</span><textarea class="spell-in" name="text" rows="5" maxlength="1000" placeholder="What happened, and on which page?"></textarea></label>' +
      '<div class="q-actions"><button class="btn btn-primary" type="submit">' + ui.icon("send") + 'Send Message</button></div>' +
      '<p class="hs-msg" aria-live="polite"></p></form></section>' +
      '<section class="hs-pane" data-pane="mine"><div class="hs-mine"><p class="hs-msg">Loading your messages…</p></div></section>' +
      '<p class="hs-staff"><a href="#/support">For course staff: Support Inbox</a></p>';

    ui.modal(html, { cls: "modal-help", label: "Help and support", onOpen: function (m, close) {
      function show(t) {
        m.querySelectorAll("[data-tab]").forEach(function (b) { var on = b.dataset.tab === t; b.setAttribute("aria-selected", on); b.setAttribute("aria-checked", on); });
        m.querySelectorAll("[data-pane]").forEach(function (s) { s.hidden = s.dataset.pane !== t; });
        if (t === "mine") loadMine();
      }
      m.querySelectorAll("[data-tab]").forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.tab); }); });
      m.querySelector(".hs-staff a").addEventListener("click", function () { close(); });

      var rb = m.querySelector("#reset-btn");
      rb.addEventListener("click", function () {
        if (rb.dataset.confirm) { store.reset(); close(); location.hash = "#/overview"; ui.toast("Your progress has been reset."); }
        else { rb.dataset.confirm = "1"; rb.textContent = "Select again to delete all progress"; }
      });

      var form = m.querySelector(".hs-form"), fmsg = form.querySelector(".hs-msg");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var F = form.elements, text = F.text.value.trim();
        if (text.length < 10) { fmsg.textContent = "Describe the problem in a sentence or two."; F.text.focus(); return; }
        var btn = form.querySelector("button[type=submit]"); btn.disabled = true; fmsg.textContent = "Sending…";
        post({ action: "send", name: F.name.value, cls: F.cls.value, topic: F.topic.value, text: text, page: location.hash || "#/overview" })
          .then(function (d) {
            var ids = myIds(); ids.unshift(d.id); ls(IDS, ids.slice(0, 20));
            F.text.value = "";
            fmsg.innerHTML = ui.icon("check") + "Your message has been sent. Replies from the course team appear under <b>My Messages</b>.";
          })
          .catch(function (err) {
            fmsg.textContent = err.status === 503 ? "The support service is not connected yet. Please take a screenshot and tell your teacher." : err.message;
          })
          .then(function () { btn.disabled = false; });
      });

      function loadMine() {
        var box = m.querySelector(".hs-mine");
        if (!myIds().length) { box.innerHTML = '<p class="hs-msg">You have not sent any messages from this device.</p>'; return; }
        fetchMine().then(function (list) {
          ls(SEEN, Math.max(latestReply(list), ls(SEEN) || 0)); markButton(false);
          box.innerHTML = list.length ? '<ul class="hs-list">' + list.map(function (x) {
            return '<li><p class="hs-meta"><span class="hs-topic">' + ui.esc(x.topic) + "</span>" + when(x.at) +
              '<span class="hs-st' + (x.status === "resolved" ? " is-done" : "") + '">' + (x.status === "resolved" ? "Answered" : "Awaiting a reply") + "</span></p>" +
              '<p class="hs-text">' + ui.esc(x.text) + "</p>" +
              (x.replies || []).map(function (r) { return '<div class="hs-reply"><b>Course team</b><span>' + when(r.at) + "</span><p>" + ui.esc(r.text) + "</p></div>"; }).join("") + "</li>";
          }).join("") + "</ul>" : '<p class="hs-msg">Your messages could not be found.</p>';
        }).catch(function () { box.innerHTML = '<p class="hs-msg">Your messages cannot be loaded right now.</p>'; });
      }
      show(tab || (GU.support.replyDot ? "mine" : "faq"));
    } });
  }

  /* The course team's inbox */
  GU.views.support = function (page) {
    var filter = "open", list = [];
    page.innerHTML = '<header class="lesson-head"><a class="crumb" href="#/overview">' + ui.icon("left") + "Course Overview</a>" +
      '<p class="lesson-kicker">For Course Staff</p><h1>Support Inbox</h1>' +
      '<p class="lede">Messages sent by students under Help and Support. A reply appears under <b>My Messages</b> on the student’s device and marks the message as answered.</p></header>' +
      '<section class="si-key"></section><section class="si-body"></section>';
    var keyBox = page.querySelector(".si-key"), body = page.querySelector(".si-body");

    function keyForm(msg) {
      keyBox.innerHTML = '<form class="tkey" autocomplete="off"><label class="sr-only" for="si-key">Teacher key</label>' +
        '<input class="spell-in" id="si-key" type="password" placeholder="Teacher key">' +
        '<button class="btn btn-primary btn-sm" type="submit">Open the Inbox</button></form><p class="tkey-msg">' + (msg || "Enter the <code>TEACHER_KEY</code> value set in Vercel.") + "</p>";
      keyBox.querySelector("form").addEventListener("submit", function (e) {
        e.preventDefault();
        var k = keyBox.querySelector("input").value.trim();
        if (!k) return;
        setTeacherKey(k); load();
      });
      body.innerHTML = "";
    }
    function load() {
      var k = teacherKey();
      if (!k) { keyForm(); return; }
      body.innerHTML = '<p class="tkey-msg">Loading the messages…</p>';
      post({ action: "list", key: k }).then(function (d) {
        list = d.messages || [];
        keyBox.innerHTML = '<p class="tkey-msg">' + ui.icon("check") + 'Signed in with the teacher key on this device. <button class="link-btn" type="button" data-forget>Sign Out</button></p>';
        keyBox.querySelector("[data-forget]").addEventListener("click", function () { setTeacherKey(""); keyForm("Signed out."); });
        draw();
      }).catch(function (err) {
        if (err.status === 403) { setTeacherKey(""); keyForm(err.message); }
        else { keyBox.innerHTML = ""; body.innerHTML = '<p class="tkey-msg">' + (err.status === 503 ? "The support service is not connected yet. Connect Upstash Redis in Vercel to receive messages." : ui.esc(err.message)) + "</p>"; }
      });
    }
    function draw() {
      var open = list.filter(function (x) { return x.status !== "resolved"; }).length;
      var shown = list.filter(function (x) { return filter === "all" || (filter === "open" ? x.status !== "resolved" : x.status === "resolved"); });
      body.innerHTML = '<div class="si-bar"><div class="seg" role="radiogroup" aria-label="Filter">' +
        [["open", "Awaiting a Reply (" + open + ")"], ["resolved", "Answered"], ["all", "All (" + list.length + ")"]].map(function (f) {
          return '<button role="radio" aria-checked="' + (filter === f[0]) + '" data-f="' + f[0] + '">' + f[1] + "</button>";
        }).join("") + '</div><button class="link-btn" type="button" data-reload>' + ui.icon("redo") + "Refresh</button></div>" +
        (shown.length ? '<ul class="si-list">' + shown.map(function (x) {
          return '<li class="si-item' + (x.status === "resolved" ? " is-done" : "") + '" data-id="' + x.id + '">' +
            '<p class="hs-meta"><span class="hs-topic">' + ui.esc(x.topic) + "</span><b>" + ui.esc(x.name) + "</b>" + (x.cls ? " · " + ui.esc(x.cls) : "") + " · " + when(x.at) +
            (x.page ? ' · <a href="' + ui.esc(x.page) + '">' + ui.esc(x.page.replace(/^#\//, "")) + "</a>" : "") + "</p>" +
            '<p class="hs-text">' + ui.esc(x.text) + "</p>" +
            (x.replies || []).map(function (r) { return '<div class="hs-reply"><b>Course team</b><span>' + when(r.at) + "</span><p>" + ui.esc(r.text) + "</p></div>"; }).join("") +
            '<form class="si-reply"><label class="sr-only" for="si-r-' + x.id + '">Reply</label><textarea class="spell-in" id="si-r-' + x.id + '" rows="2" maxlength="1000" placeholder="Write a reply to the student."></textarea>' +
            '<div class="q-actions"><button class="btn btn-primary btn-sm" type="submit">Send Reply</button>' +
            '<button class="btn btn-ghost btn-sm" type="button" data-status="' + (x.status === "resolved" ? "open" : "resolved") + '">' + (x.status === "resolved" ? "Reopen" : "Mark as Answered") + "</button>" +
            '<button class="link-btn bd-del" type="button" data-del>Delete</button></div></form></li>';
        }).join("") + "</ul>" : '<p class="tkey-msg">' + (list.length ? "No messages in this list." : "No messages yet.") + "</p>");
      body.querySelectorAll("[data-f]").forEach(function (b) { b.addEventListener("click", function () { filter = b.dataset.f; draw(); }); });
      body.querySelector("[data-reload]").addEventListener("click", load);
      body.querySelectorAll(".si-item").forEach(function (li) {
        var id = li.dataset.id, k = teacherKey();
        function act(b) { return post(Object.assign({ key: k, id: id }, b)).then(load).catch(function (err) { ui.toast(err.message); }); }
        li.querySelector(".si-reply").addEventListener("submit", function (e) {
          e.preventDefault();
          var t = li.querySelector("textarea").value.trim();
          if (t) act({ action: "reply", text: t });
        });
        li.querySelector("[data-status]").addEventListener("click", function (e) { act({ action: "status", status: e.currentTarget.dataset.status }); });
        var del = li.querySelector("[data-del]");
        del.addEventListener("click", function () {
          if (del.dataset.confirm) act({ action: "delete" });
          else { del.dataset.confirm = "1"; del.textContent = "Select again to delete"; }
        });
      });
    }
    load();
  };

  GU.support = { open: open, checkReplies: checkReplies, replyDot: false };
})();

/* Class discussion board: students post their own answer first, then see, like and reply to classmates' answers.
   Uses /api/discuss (Upstash). Without it, answers are kept on this device only. */
(function () {
  var ui = GU.ui, store = GU.store;

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "p-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  var hashCache = {};
  function hashId(id) {
    if (hashCache[id]) return Promise.resolve(hashCache[id]);
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(id)).then(function (buf) {
        return (hashCache[id] = Array.from(new Uint8Array(buf)).slice(0, 8).map(function (b) { return b.toString(16).padStart(2, "0"); }).join(""));
      });
    }
    return Promise.resolve("local");
  }
  function ago(t) {
    var s = Math.max(1, Math.round((Date.now() - t) / 1000));
    if (s < 60) return "just now";
    if (s < 3600) return Math.round(s / 60) + " min ago";
    if (s < 86400) return Math.round(s / 3600) + " h ago";
    return new Date(t).toLocaleDateString([], { month: "short", day: "numeric" });
  }
  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
  function teacherKey() { try { return localStorage.getItem("gu-teacher-key") || ""; } catch (e) { return ""; } }
  function setTeacherKey(k) { try { if (k) localStorage.setItem("gu-teacher-key", k); else localStorage.removeItem("gu-teacher-key"); } catch (e) {} }

  var api = {
    list: function (board, pid) {
      return fetch("api/discuss?board=" + encodeURIComponent(board) + "&pid=" + encodeURIComponent(pid || ""), { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
        .then(function (d) { if (!d || !d.configured) throw new Error("not configured"); return d.posts; });
    },
    send: function (body) {
      return fetch("api/discuss", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) { var e = new Error(d.error || ("http " + r.status)); e.status = r.status; throw e; } return d; }); });
    }
  };

  GU.discuss = {
    mount: function (el, o) {
      var board = o.board;
      var postedKey = "posted:" + board;
      var posts = [], live = false, myHash = null, sort = "new", timer = null, selected = [], justPosted = false;
      var tkOpen = false, tkMsg = "";
      var max = o.maxChoices || 1;

      function me() { return store.player(); }

      function render() {
        var qa = !!o.qa;
        var L = o.labels || {};
        var posted = qa || store.step(postedKey);
        var p = me() || {};
        /* With classify, the options are listed for reference only and each answer is counted from its text. */
        var choiceHtml = o.classify ? '<div class="bd-ref"><p class="bd-label">' + (o.reference.title || "For reference") + '</p><ul class="bd-ref-list">' +
          o.reference.items.map(function (c) { return "<li>" + ui.esc(c) + "</li>"; }).join("") + '</ul><p class="bd-ref-note">' + o.reference.note + "</p></div>" :
          o.choices ? '<fieldset class="bd-choices"><legend>' + (max > 1 ? "Your choices (up to " + max + ")" : "Your choice") + "</legend>" +
          o.choices.map(function (c, i) {
            return '<button type="button" class="bd-choice' + (selected.indexOf(c) >= 0 ? " is-on" : "") + '" data-choice="' + i + '" aria-pressed="' + (selected.indexOf(c) >= 0) + '">' + ui.esc(c) + "</button>";
          }).join("") + "</fieldset>" : "";
        var form = posted && !qa ? "" :
          '<form class="bd-form" autocomplete="off">' + choiceHtml +
          (p.name ? "" : '<label class="bd-label" for="bd-name-' + board + '">Nickname</label><input class="bd-input" id="bd-name-' + board + '" maxlength="16" placeholder="e.g. Sapling 7" required>') +
          (o.nameField ? '<label class="bd-label" for="bd-right-' + board + '">' + o.nameField.label + '</label><input class="bd-input bd-right" id="bd-right-' + board + '" maxlength="60" placeholder="' + ui.esc(o.nameField.placeholder) + '">' : "") +
          '<label class="bd-label" for="bd-text-' + board + '">' + (L.answer || (qa ? "Your question" : "Your answer")) + "</label>" +
          '<textarea class="bd-input bd-text" id="bd-text-' + board + '" rows="' + (L.rows || (qa ? 3 : 4)) + '" maxlength="' + (o.maxLen || 600) + '" placeholder="' + (L.placeholder || (qa ? "Ask about a word, a sentence or an idea in the passage." : "Write two or three sentences.")) + '"></textarea>' +
          (o.starters ? '<div class="bd-starters"><span>Sentence starters:</span>' + o.starters.map(function (s) { return '<button type="button" data-starter="' + ui.esc(s) + '">' + ui.esc(s) + "</button>"; }).join("") + "</div>" : "") +
          '<div class="bd-actions"><button class="btn btn-mint" type="submit">' + ui.icon("send") + (L.button || (qa ? "Post My Question" : "Post My Answer")) + "</button>" +
          '<span class="bd-fine">' + (p.name ? "Posting as <b>" + ui.esc(p.name) + "</b>. " : "") + "Use a nickname, not your full name.</span></div>" +
          '<p class="bd-msg" aria-live="polite"></p></form>';

        /* After posting, the options (or the rights listed for reference) and the student's own answer stay available. */
        var review = "";
        if (posted && !qa && o.choices) {
          var mine = store.answer("post:" + board) || {};
          var picked = mine.choices || [];
          var list = o.classify ? o.reference.items : o.choices;
          var wasOpen = !!(el.querySelector(".bd-review") || {}).open;
          review = '<details class="bd-review"' + (wasOpen ? " open" : "") + "><summary>" + ui.icon("eye") + "Review the Question</summary><div class=\"bd-review-b\">" +
            '<p class="bd-label">' + (o.classify ? (o.reference.title || "For reference") : max > 1 ? "Options (up to " + max + ")" : "Options") + "</p>" +
            '<ul class="bd-ref-list">' + list.map(function (c) {
              var on = picked.indexOf(c) >= 0;
              return "<li" + (on ? ' class="is-mine"' : "") + ">" + (on ? ui.icon("check") : "") + ui.esc(c) + "</li>";
            }).join("") + "</ul>" +
            (o.classify ? '<p class="bd-ref-note">' + o.reference.note + "</p>" +
              (picked[1] ? '<p class="bd-label">' + (o.nameField && o.nameField.reviewLabel || "Your right") + '</p><p class="bd-review-a">' + ui.esc(picked[1]) + "</p>" : "") +
              (picked[0] ? '<p class="bd-ref-note">Your answer is counted under <b>' + ui.esc(picked[0]) + "</b> in the class poll.</p>" : "") : "") +
            (mine.text ? '<p class="bd-label">Your answer</p><p class="bd-review-a">' + ui.esc(mine.text) + "</p>" : "") +
            "</div></details>";
        }
        var body;
        if (!posted) {
          body = '<p class="bd-gate">' + ui.icon("lock") + (L.gate || "Post your own answer first. Your classmates’ answers will then appear here, and you can reply to them or like them.") + "</p>";
        } else {
          body = (o.choices ? pollHtml() : "") +
            (qa ? '<p class="qa-note">' + ui.icon("clock") + "The teacher answers every question within three days. You are welcome to answer your classmates’ questions too.</p>" : "") +
            '<div class="bd-bar"><div class="seg seg-dark" role="radiogroup" aria-label="Sort"><button role="radio" aria-checked="' + (sort === "new") + '" data-sort="new">Newest</button>' +
            (qa ? '<button role="radio" aria-checked="' + (sort === "open") + '" data-sort="open">Awaiting Answers</button>' : '<button role="radio" aria-checked="' + (sort === "top") + '" data-sort="top">Most Liked</button>') + "</div>" +
            '<button class="link-btn bd-refresh" type="button">' + ui.icon("redo") + "Refresh</button></div>" +
            (live ? "" : '<p class="bd-note">' + (qa ? "The class Q&amp;A is not connected yet, so only your own questions, saved on this device, are shown. Classmates’ questions and the teacher’s answers appear once the teacher connects the class service." : "The class discussion is not connected yet, so only your own answer, saved on this device, is shown. Classmates’ answers, likes and replies appear once the teacher connects the class service.") + "</p>") +
            (qa && live && !posts.length ? '<p class="bd-gate">' + ui.icon("chat") + "No questions yet. Be the first to ask.</p>" : "") +
            (o.example ? '<article class="bd-post bd-teacher"><div class="bd-meta"><span class="bd-avatar t">T</span><b>' + (L.example || "Teacher’s Example") + "</b></div><p>" + ui.esc(o.example) + "</p></article>" : "") +
            '<ul class="bd-posts">' + sorted().map(postHtml).join("") + "</ul>";
        }
        var prevTa = el.querySelector(".bd-text"), keepText = prevTa ? prevTa.value : "";
        var prevRight = el.querySelector(".bd-right"), keepRight = prevRight ? prevRight.value : "";
        el.innerHTML = '<section class="disc" aria-label="Class discussion">' +
          '<div class="bd-head"><span class="zone-tag">' + ui.icon(qa ? "chat" : "users") + (L.tag || (qa ? "Questions and Answers" : "Class Discussion")) + "</span>" +
          '<span class="bd-live' + (live ? " is-live" : "") + '">' + (live ? "<i></i>Live" : "This device only") + "</span></div>" +
          (o.prompts ? '<ol class="bd-prompts">' + o.prompts.map(function (q) { return "<li>" + q + "</li>"; }).join("") + "</ol>" : "") +
          review + form + body + (qa ? teacherHtml() : "") + "</section>";
        var ri = el.querySelector(".bd-right"); if (ri && keepRight && !justPosted) ri.value = keepRight;
        var ta = el.querySelector(".bd-text"); if (ta && keepText && !justPosted) ta.value = keepText;
        else if (ta && !ta.value && o.prefill) ta.value = o.prefill() || "";
        justPosted = false;
        bind();
      }

      /* Classified boards: the poll option an answer is counted under, and the right named in the student's words. */
      function catOf(p) { var c = (p.choices || [])[0]; return o.choices.indexOf(c) >= 0 ? c : o.classify(p.text); }
      function nameOf(p) { return (p.choices || [])[1] || ""; }
      function isMine(p) { return p.pid === "local" || (myHash && p.pid === myHash); }

      function classPoll() {
        var groups = o.choices.map(function () { return []; });
        posts.forEach(function (p) { groups[o.choices.indexOf(catOf(p))].push(p); });
        var n = posts.length;
        var open = {}; el.querySelectorAll(".bd-polld[open]").forEach(function (d) { open[d.dataset.c] = 1; });
        return '<div class="bd-poll"><p class="bd-poll-h">Class Poll <span>' + n + " response" + (n === 1 ? "" : "s") + "</span></p>" +
          (o.pollNote ? '<p class="bd-poll-note">' + o.pollNote + "</p>" : "") +
          o.choices.map(function (c, i) {
            var g = groups[i], pct = n ? Math.round(g.length / n * 100) : 0;
            var row = '<span class="bd-poll-l">' + ui.esc(c) + (g.length ? ' <small>' + g.length + "</small>" + ui.icon("right") : "") + '</span><span class="bd-poll-bar"><i style="width:' + pct + '%"></i></span><b>' + pct + "%</b>";
            if (!g.length) return '<div class="bd-pollrow">' + row + "</div>";
            return '<details class="bd-polld" data-c="' + i + '"' + (open[i] ? " open" : "") + '><summary class="bd-pollrow">' + row + '</summary><ul class="bd-poll-who">' +
              g.map(function (p) {
                var nm = nameOf(p);
                return "<li" + (isMine(p) ? ' class="is-mine"' : "") + "><b>" + ui.esc(p.name) + (isMine(p) ? " (you)" : "") + "</b>" +
                  (nm ? ui.esc(nm) : "<em>" + ui.esc(p.text.split(/\s+/).slice(0, 10).join(" ")) + "…</em>") + "</li>";
              }).join("") + "</ul></details>";
          }).join("") + "</div>";
      }

      /* Question boards end with a quiet sign-in for the teacher: with the key saved, the teacher's answers are
         marked as the teacher's and Remove buttons appear on every board on this device. */
      function teacherHtml() {
        var tk = teacherKey();
        return '<details class="bd-tk"' + (tkOpen ? " open" : "") + "><summary>" + ui.icon("teacher") + (tk ? "Teacher key saved on this device" : "For teachers") + "</summary>" +
          '<form class="bd-tkf" autocomplete="off"><label class="sr-only" for="bd-tk-' + board + '">Teacher key</label>' +
          '<input class="bd-input" type="password" id="bd-tk-' + board + '" placeholder="Teacher key">' +
          '<button class="btn btn-mint btn-sm" type="submit">Save Key</button>' +
          (tk ? '<button class="link-btn" type="button" data-tkforget>Forget Key</button>' : "") + "</form>" +
          '<p class="bd-tkmsg" aria-live="polite">' + tkMsg + "</p>" +
          '<p class="bd-fine">Enter the <code>TEACHER_KEY</code> value set in Vercel to answer questions as the teacher and to remove posts on this device.</p></details>';
      }

      function pollHtml() {
        if (o.classify) return classPoll();
        var counts = o.choices.map(function () { return 0; });
        var n = 0;
        posts.forEach(function (p) {
          var hit = false;
          (p.choices || []).forEach(function (c) { var i = o.choices.indexOf(c); if (i >= 0) { counts[i]++; hit = true; } });
          if (!hit && o.classify) { counts[o.choices.indexOf(o.classify(p.text))]++; hit = true; }
          if (hit) n++;
        });
        return '<div class="bd-poll"><p class="bd-poll-h">Class Poll <span>' + n + " response" + (n === 1 ? "" : "s") + "</span></p>" +
          (o.pollNote ? '<p class="bd-poll-note">' + o.pollNote + "</p>" : "") +
          o.choices.map(function (c, i) {
            var pct = n ? Math.round(counts[i] / n * 100) : 0;
            return '<div class="bd-pollrow"><span class="bd-poll-l">' + ui.esc(c) + '</span><span class="bd-poll-bar"><i style="width:' + pct + '%"></i></span><b>' + pct + "%</b></div>";
          }).join("") + "</div>";
      }

      function sorted() {
        var a = posts.slice();
        if (sort === "top") a.sort(function (x, y) { return (y.likes || 0) - (x.likes || 0) || y.at - x.at; });
        else if (sort === "open") a.sort(function (x, y) { return answered(x) - answered(y) || y.at - x.at; });
        else a.sort(function (x, y) { return y.at - x.at; });
        return a;
      }

      /* Tags under a post: its chosen options, or for a classified board the option its text names. */
      function tagsOf(p) {
        if (o.classify) {
          var cat = catOf(p), nm = nameOf(p);
          return [cat === o.choices[o.choices.length - 1] && nm ? "Other: " + nm : cat];
        }
        var c = (p.choices || []).filter(function (x) { return !o.choices || o.choices.indexOf(x) >= 0; });
        if (!c.length && o.classify && p.text) c = [o.classify(p.text)];
        return c;
      }

      function answered(p) { return (p.replies || []).some(function (r) { return r.teacher; }) ? 1 : 0; }

      function postHtml(p) {
        var mine = myHash && p.pid === myHash;
        var tk = teacherKey();
        var qa = !!o.qa;
        return '<li class="bd-post' + (mine ? " is-mine" : "") + '" data-post="' + ui.esc(p.id) + '">' +
          '<div class="bd-meta"><span class="bd-avatar">' + ui.esc((p.name || "?").slice(0, 1).toUpperCase()) + "</span><b>" + ui.esc(p.name) + "</b>" +
          (mine ? '<em class="lb-you">You</em>' : "") + '<span class="bd-time">' + ago(p.at) + "</span>" +
          (tk && live ? '<button class="link-btn bd-del" data-del="' + ui.esc(p.id) + '">Remove</button>' : "") + "</div>" +
          (qa ? (answered(p) ? '<span class="qa-st is-done">' + ui.icon("check") + "Answered by the teacher</span>" : '<span class="qa-st">' + ui.icon("clock") + "Awaiting the teacher’s reply</span>") : "") +
          (tagsOf(p).length ? '<div class="bd-tags">' + tagsOf(p).map(function (c) { return "<span>" + ui.esc(c) + "</span>"; }).join("") + "</div>" : "") +
          "<p>" + ui.esc(p.text) + "</p>" +
          '<div class="bd-acts">' +
          (live ? (mine
            /* Students cannot like their own post; they see how many classmates did. */
            ? '<span class="bd-like is-own">' + HEART + "<span>" + (p.likes || 0) + (p.likes === 1 ? " like" : " likes") + "</span></span>"
            : '<button type="button" class="bd-like' + (p.liked ? " is-on" : "") + '" data-like="' + ui.esc(p.id) + '" aria-pressed="' + !!p.liked + '" aria-label="Like ' + ui.esc(p.name) + '’s post">' +
              HEART + '<span class="bd-like-l">' + (p.liked ? "Liked" : "Like") + '</span><span class="bd-like-n">' + (p.likes || 0) + "</span></button>") +
            '<button class="link-btn" data-reply="' + ui.esc(p.id) + '">' + ui.icon("chat") + (qa ? (tk ? "Answer as Teacher" : "Answer") : "Reply") + (p.replies.length ? " (" + p.replies.length + ")" : "") + "</button>" : "") +
          "</div>" +
          (p.replies.length ? '<ul class="bd-replies">' + p.replies.map(function (r, i) {
            return '<li' + (r.teacher ? ' class="is-teacher"' : "") + '>' + (r.teacher ? '<span class="bd-avatar t">T</span>' : "") + "<b>" + ui.esc(r.name) + "</b>" + (r.teacher ? '<em class="qa-badge">Teacher</em>' : "") + '<span class="bd-time">' + ago(r.at) + "</span>" +
              (tk ? '<button class="link-btn bd-del" data-delr="' + ui.esc(p.id) + ":" + i + '">Remove</button>' : "") + "<p>" + ui.esc(r.text) + "</p></li>";
          }).join("") + "</ul>" : "") +
          '<form class="bd-replyform" data-rform="' + ui.esc(p.id) + '" hidden><textarea class="bd-input" rows="2" maxlength="' + (tk ? 800 : 300) + '" placeholder="' + (qa ? (tk ? "Write the teacher’s answer." : "Answer this question, or add a follow-up question.") : "Reply with a question or a comment that builds on this idea.") + '"></textarea>' +
          '<button class="btn btn-mint btn-sm" type="submit">' + (qa ? "Send" : "Reply") + "</button></form></li>";
      }

      function msg(t) { var m = el.querySelector(".bd-msg"); if (m) m.textContent = t; }

      function bind() {
        el.querySelectorAll("[data-choice]").forEach(function (b) {
          b.addEventListener("click", function () {
            var c = o.choices[+b.dataset.choice];
            var i = selected.indexOf(c);
            if (i >= 0) selected.splice(i, 1);
            else { if (max === 1) selected = []; if (selected.length >= max) selected.shift(); selected.push(c); }
            el.querySelectorAll("[data-choice]").forEach(function (x) {
              var on = selected.indexOf(o.choices[+x.dataset.choice]) >= 0;
              x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on);
            });
          });
        });
        el.querySelectorAll("[data-starter]").forEach(function (b) {
          b.addEventListener("click", function () {
            GU.insertStarter(el.querySelector(".bd-text"), b.dataset.starter);
          });
        });
        var form = el.querySelector(".bd-form");
        if (form) form.addEventListener("submit", function (e) { e.preventDefault(); submit(); });
        el.querySelectorAll("[data-sort]").forEach(function (b) { b.addEventListener("click", function () { sort = b.dataset.sort; render(); }); });
        var rf = el.querySelector(".bd-refresh"); if (rf) rf.addEventListener("click", load);
        var tkd = el.querySelector(".bd-tk");
        if (tkd) {
          tkd.addEventListener("toggle", function () { tkOpen = tkd.open; });
          tkd.querySelector(".bd-tkf").addEventListener("submit", function (e) {
            e.preventDefault();
            var key = tkd.querySelector("input").value.trim();
            if (!key) { tkd.querySelector(".bd-tkmsg").textContent = "Enter the key first."; return; }
            tkd.querySelector(".bd-tkmsg").textContent = "Checking…";
            api.send({ action: "check-key", board: board, key: key }).then(function (d) {
              if (d.ok) { setTeacherKey(key); tkMsg = "Key confirmed. You can now answer as the teacher and remove posts on this device."; }
              else tkMsg = d.set ? "This key does not match the TEACHER_KEY value in Vercel." : "No TEACHER_KEY has been set in Vercel yet.";
              render();
            }).catch(function (err) {
              tkMsg = err.status === 503 ? "The discussion service is not connected yet." : (err.message || "The key could not be checked.");
              render();
            });
          });
          var fg = tkd.querySelector("[data-tkforget]");
          if (fg) fg.addEventListener("click", function () { setTeacherKey(""); tkMsg = "The key has been removed from this device."; render(); });
        }
        el.querySelectorAll("[data-like]").forEach(function (b) { b.addEventListener("click", function () { like(b.dataset.like); }); });
        el.querySelectorAll("[data-reply]").forEach(function (b) {
          b.addEventListener("click", function () {
            var f = el.querySelector('[data-rform="' + b.dataset.reply + '"]');
            f.hidden = !f.hidden; if (!f.hidden) f.querySelector("textarea").focus();
          });
        });
        el.querySelectorAll("[data-rform]").forEach(function (f) {
          f.addEventListener("submit", function (e) { e.preventDefault(); reply(f.dataset.rform, f.querySelector("textarea").value); });
        });
        el.querySelectorAll("[data-del]").forEach(function (b) { b.addEventListener("click", function () { moderate({ action: "delete", postId: b.dataset.del }); }); });
        el.querySelectorAll("[data-delr]").forEach(function (b) {
          b.addEventListener("click", function () { var pr = b.dataset.delr.split(":"); moderate({ action: "delete-reply", postId: pr[0], index: +pr[1] }); });
        });
      }

      function ensurePlayer() {
        var p = me();
        if (p && p.name) return p;
        var inp = el.querySelector("#bd-name-" + board);
        var name = inp ? inp.value.trim().replace(/\s+/g, " ").slice(0, 16) : "";
        if (!name) { msg("Enter a nickname first."); if (inp) inp.focus(); return null; }
        p = { id: (p && p.id) || uuid(), name: name, cls: (p && p.cls) || "" };
        store.player(p);
        return p;
      }

      function submit() {
        var text = el.querySelector(".bd-text").value.trim();
        if (o.choices && !o.classify && !selected.length) { msg("Choose an option first."); return; }
        if (text.length < (o.minLen || (o.qa ? 8 : 15))) { msg(o.qa ? "Write your question in a full sentence." : "Write at least one full sentence before posting."); return; }
        var named = "";
        if (o.nameField) {
          var ni = el.querySelector(".bd-right");
          named = ni ? ni.value.trim().replace(/\s+/g, " ").slice(0, 60) : "";
          if (!named) { msg("Name the right you write about first."); if (ni) ni.focus(); return; }
        }
        var p = ensurePlayer(); if (!p) return;
        /* A classified board stores [the poll option, the right in the student's own words]. */
        if (o.classify) selected = [o.classify(named || text)].concat(named ? [named] : []);
        var local = { id: "local-" + Date.now(), pid: "local", name: p.name, text: text, choices: selected.slice(), at: Date.now(), replies: [], likes: 0, liked: false };
        if (o.qa) { var mine = store.answer("posts:" + board) || []; mine.push(local); store.answer("posts:" + board, mine); }
        else store.answer("post:" + board, local);
        api.send({ action: "post", board: board, id: p.id, name: p.name, text: text, choices: selected.slice() }).then(function () {
          justPosted = true;
          store.setStep(postedKey);
          if (o.onPosted) o.onPosted();
          load();
        }).catch(function (e) {
          if (e.status === 429 || e.status === 400) { msg(e.message); return; }
          justPosted = true;
          store.setStep(postedKey);
          if (o.onPosted) o.onPosted();
          live = false; posts = o.qa ? (store.answer("posts:" + board) || []) : [local]; render();
        });
      }

      function like(id) {
        var p = posts.filter(function (x) { return x.id === id; })[0]; if (!p) return;
        var on = !p.liked;
        p.liked = on; p.likes = (p.likes || 0) + (on ? 1 : -1); render();
        var pl = ensurePlayer(); if (!pl) return;
        api.send({ action: "like", board: board, postId: id, id: pl.id, on: on }).then(function (d) { p.likes = d.likes; render(); }).catch(function () {});
      }

      function reply(id, text) {
        text = String(text || "").trim();
        if (text.length < 2) return;
        var pl = ensurePlayer(); if (!pl) return;
        var body = { action: "reply", board: board, postId: id, id: pl.id, name: pl.name, text: text };
        if (o.qa && teacherKey()) body.key = teacherKey();
        api.send(body).then(function () { if (o.onPosted) o.onPosted(); load(); })
          .catch(function (e) { ui.toast(e.message || "The reply could not be sent."); });
      }

      function moderate(body) {
        body.board = board; body.key = teacherKey();
        api.send(body).then(load).catch(function (e) { ui.toast(e.message || "Removal failed."); });
      }

      function load() {
        var p = me();
        (p ? hashId(p.id) : Promise.resolve(null)).then(function (h) {
          myHash = h;
          return api.list(board, h);
        }).then(function (list) {
          live = true; posts = list;
          if (!store.step(postedKey) && myHash && list.some(function (x) { return x.pid === myHash; })) { store.setStep(postedKey); if (o.onPosted) o.onPosted(); }
          render();
        }).catch(function () {
          live = false;
          var own = store.answer("post:" + board);
          posts = o.qa ? (store.answer("posts:" + board) || []) : own ? [own] : [];
          myHash = "local";
          render();
        });
      }

      render();
      load();
      timer = setInterval(function () {
        if (document.hidden || !live || !(o.qa || store.step(postedKey))) return;
        /* Do not refresh while someone is typing a reply. */
        if ([].some.call(el.querySelectorAll(".bd-replyform textarea, .bd-tkf input"), function (t) { return t.value.trim(); })) return;
        load();
      }, 25000);
      return function () { clearInterval(timer); };
    }
  };
})();

/* Small UI helpers: icons, medals, toast, modal. */
(function () {
  var uid = 0;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var I = {
    speaker: '<path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    slow: '<path d="M4.5 16.5c0-4 3.4-7 7.5-7s7.5 3 7.5 7z"/><path d="M8 16.5l-1 2.5M16 16.5l1 2.5"/><path d="M19.5 14.5c1 0 2-.6 2-1.8 0-1-.8-1.7-1.8-1.7"/><path d="M9 12.5l3 4 3-4"/>',
    mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0"/><path d="M12 18v2.5"/>',
    stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    left: '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    right: '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.7"/><path d="M12 17h.01"/>',
    download: '<path d="M12 4v11"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M5 19.5h14"/>',
    lock: '<rect x="5.5" y="10.5" width="13" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    redo: '<path d="M19 8.5A7.5 7.5 0 1 0 19.5 14"/><path d="M19.5 4v4.5H15"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    book: '<path d="M3 6c3-1 6-1 9 1 3-2 6-2 9-1v13c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 7v13"/>',
    teacher: '<path d="M2.5 9L12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v4.5c1.5 1.5 3.5 2 5.5 2s4-.5 5.5-2V11"/><path d="M21.5 9v5"/>',
    sparkle: '<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/>'
  };

  function icon(name, cls) {
    return '<svg class="ic ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (I[name] || "") + "</svg>";
  }

  var BADGE_ICONS = {
    steps: '<path d="M8.2 3.5c1.6 0 2.4 1.8 2.4 4s-.9 4-2.4 4-2.4-1.8-2.4-4 .8-4 2.4-4z"/><path d="M6.4 13.8h3.6v1.6a1.8 1.8 0 0 1-3.6 0z"/><path d="M15.8 7.5c1.6 0 2.4 1.8 2.4 4s-.9 4-2.4 4-2.4-1.8-2.4-4 .8-4 2.4-4z"/><path d="M14 17.8h3.6v1a1.8 1.8 0 0 1-3.6 0z"/>',
    seed: '<path d="M12 3.5c4 3 5.2 7 5.2 9.3a5.2 5.2 0 0 1-10.4 0C6.8 10.5 8 6.5 12 3.5z"/><path d="M12 9v8"/>',
    sprout: '<path d="M12 20.5v-8"/><path d="M12 12.5C12 9 9.5 6.5 5 6.5c0 3.5 2.5 6 7 6z"/><path d="M12 14.5c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z"/><path d="M7 20.5h10"/>',
    tree: '<circle cx="12" cy="9" r="6"/><path d="M12 21v-7.5"/><path d="M12 16l-2.5-2M12 14.5l2.5-2"/><path d="M8 21h8"/>',
    link: '<rect x="2.5" y="8.5" width="11" height="7" rx="3.5"/><rect x="10.5" y="8.5" width="11" height="7" rx="3.5"/>',
    ear: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6.5" rx="1.6"/><rect x="17" y="14" width="4" height="6.5" rx="1.6"/>',
    sun: '<path d="M3.5 17.5h17"/><path d="M7 17.5a5 5 0 0 1 10 0"/><path d="M12 6.5V9M5.6 10l1.8 1.8M18.4 10l-1.8 1.8M2.5 14.5h2M19.5 14.5h2"/>',
    book: '<path d="M3 6c3-1 6-1 9 1 3-2 6-2 9-1v13c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 7v13"/>',
    pen: '<path d="M15 4l5 5L9 20H4v-5z"/><path d="M13 6l5 5"/>'
  };

  function medal(b, earned) {
    var id = "mg" + (++uid);
    var r1 = earned ? "#FFD978" : "#ECEAF3", r2 = earned ? "#D99412" : "#C9C5D9";
    var inner = earned ? (b.bonus ? "#D9466B" : "#4B33C7") : "#B7B2CB";
    var rb1 = earned ? (b.bonus ? "#F38BA3" : "#8F7BF2") : "#DAD7E7";
    var rb2 = earned ? (b.bonus ? "#D9466B" : "#4B33C7") : "#C4C0D6";
    var star = b.bonus ? '<path d="M52 24l2 4.2 4.6.6-3.4 3.2.9 4.5-4.1-2.2-4.1 2.2.9-4.5-3.4-3.2 4.6-.6z" fill="' + (earned ? "#FFD978" : "#DAD7E7") + '" stroke="#fff" stroke-width="1.2"/>' : "";
    return '<svg class="medal' + (earned ? " is-earned" : "") + '" viewBox="0 0 64 80" aria-hidden="true">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + r1 + '"/><stop offset="1" stop-color="' + r2 + '"/></linearGradient></defs>' +
      '<path d="M15 0h13l9 30H24z" fill="' + rb1 + '"/><path d="M49 0H36l-9 30h13z" fill="' + rb2 + '"/>' +
      '<circle cx="32" cy="51" r="27" fill="url(#' + id + ')"/><circle cx="32" cy="51" r="20.5" fill="' + inner + '"/>' +
      '<g transform="translate(20 39)" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (BADGE_ICONS[b.icon] || "") + "</g>" +
      star + "</svg>";
  }

  function badgeById(id) { return GU.BADGES.filter(function (b) { return b.id === id; })[0]; }

  /* Toast */
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById("toast");
    el.innerHTML = msg;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-on"); }, 3600);
  }

  /* Modal */
  var lastFocus = null;
  function modal(html, opts) {
    opts = opts || {};
    var root = document.getElementById("modal-root");
    lastFocus = document.activeElement;
    root.innerHTML = '<div class="modal-scrim" data-close></div><div class="modal ' + (opts.cls || "") + '" role="dialog" aria-modal="true" aria-label="' + esc(opts.label || "Dialog") + '">' +
      '<button class="icon-btn modal-x" data-close aria-label="Close">' + icon("close") + "</button>" + html + "</div>";
    root.classList.add("is-open");
    document.body.classList.add("no-scroll");
    function close() {
      root.classList.remove("is-open");
      root.innerHTML = "";
      document.body.classList.remove("no-scroll");
      document.removeEventListener("keydown", onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      if (opts.onClose) opts.onClose();
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    root.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", close); });
    var first = root.querySelector(".modal [data-autofocus]") || root.querySelector(".modal-x");
    if (first) first.focus();
    if (opts.onOpen) opts.onOpen(root.querySelector(".modal"), close);
    return close;
  }

  /* Badge celebration: the one big moment of motion in the course. */
  function celebrate(badgeId, next) {
    var b = badgeById(badgeId);
    if (!b) return;
    var html = '<div class="celebrate">' +
      '<div class="celebrate-medal">' + rays() + medal(b, true) + "</div>" +
      '<p class="celebrate-kicker">' + (b.bonus ? "Bonus badge earned" : "Badge earned") + "</p>" +
      "<h2>" + esc(b.name) + "</h2>" +
      "<p>" + esc(b.desc) + ".</p>" +
      '<div class="celebrate-actions">' +
      (next ? '<a class="btn btn-primary" data-autofocus href="' + next.href + '">' + esc(next.label) + "</a>" : "") +
      '<button class="btn btn-ghost" data-close>' + (next ? "Stay here" : "Close") + "</button>" +
      "</div></div>";
    modal(html, { cls: "modal-celebrate", label: "Badge earned", onOpen: function (m, close) {
      m.querySelectorAll("a.btn").forEach(function (a) { a.addEventListener("click", function () { close(); }); });
    } });
  }

  function rays() {
    var s = '<svg class="rays" viewBox="0 0 200 200" aria-hidden="true">';
    for (var i = 0; i < 16; i++) {
      s += '<path d="M100 100 L' + (100 + 100 * Math.cos((i * 22.5 - 4) * Math.PI / 180)) + " " + (100 + 100 * Math.sin((i * 22.5 - 4) * Math.PI / 180)) +
        " L" + (100 + 100 * Math.cos((i * 22.5 + 4) * Math.PI / 180)) + " " + (100 + 100 * Math.sin((i * 22.5 + 4) * Math.PI / 180)) + 'Z"/>';
    }
    return s + "</svg>";
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function normalize(s) {
    return String(s || "").toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
  }

  /* Highlight the target word inside a sentence */
  function highlight(sentence, hl) {
    var s = esc(sentence);
    if (!hl) return s;
    var i = s.toLowerCase().indexOf(hl.toLowerCase());
    if (i < 0) return s;
    return s.slice(0, i) + '<mark class="hl">' + s.slice(i, i + hl.length) + "</mark>" + s.slice(i + hl.length);
  }

  GU.ui = {
    esc: esc, icon: icon, medal: medal, badgeById: badgeById, toast: toast, modal: modal,
    celebrate: celebrate, shuffle: shuffle, normalize: normalize, highlight: highlight
  };
})();

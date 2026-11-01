/* Progress is saved in this browser (localStorage). */
(function () {
  var KEY = "growing-up-u1-v2";
  var listeners = [];

  function blank() {
    return { overview: false, words: {}, activities: {}, badges: {}, scores: {}, ui: {} };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      var s = JSON.parse(raw);
      var b = blank();
      for (var k in b) if (!(k in s)) s[k] = b[k];
      return s;
    } catch (e) { return blank(); }
  }

  var state = load();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode: keep in memory */ }
    listeners.forEach(function (fn) { fn(state); });
  }

  GU.store = {
    get: function () { return state; },
    onChange: function (fn) { listeners.push(fn); },

    word: function (id) { return state.words[id] || { heard: false, said: false, spelled: false }; },
    setWord: function (id, patch) {
      var w = Object.assign({}, GU.store.word(id), patch);
      state.words[id] = w;
      save();
      return w;
    },
    wordDone: function (id) { var w = GU.store.word(id); return w.said && w.spelled; },

    groupCount: function (g) {
      return GU.groupWords(g).filter(function (w) { return GU.store.wordDone(w.id); }).length;
    },

    isDone: function (activityId) { return !!state.activities[activityId]; },
    complete: function (activityId) {
      if (state.activities[activityId]) return false;
      state.activities[activityId] = Date.now();
      save();
      return true;
    },

    hasBadge: function (id) { return !!state.badges[id]; },
    award: function (id) {
      if (state.badges[id]) return false;
      state.badges[id] = Date.now();
      save();
      return true;
    },

    setScore: function (key, value) {
      var prev = state.scores[key];
      if (prev == null || value > prev) state.scores[key] = value;
      save();
    },
    score: function (key) { return state.scores[key]; },

    setOverview: function () { if (!state.overview) { state.overview = true; save(); } },

    ui: function (key, value) {
      if (value === undefined) return state.ui[key];
      state.ui[key] = value; save();
    },

    reset: function () { state = blank(); save(); },

    /* Overall progress: overview + every activity of every lesson (unbuilt lessons count as one each). */
    progress: function () {
      var total = 1, done = state.overview ? 1 : 0;
      GU.LESSONS.forEach(function (l) {
        if (l.activities) {
          l.activities.forEach(function (a) { total++; if (state.activities[a.id]) done++; });
        } else {
          total++; if (state.activities[l.id]) done++;
        }
      });
      return { done: done, total: total, pct: Math.round(done / total * 100) };
    },

    lessonProgress: function (lesson) {
      if (!lesson.activities) return { done: state.activities[lesson.id] ? 1 : 0, total: 1 };
      var done = lesson.activities.filter(function (a) { return state.activities[a.id]; }).length;
      return { done: done, total: lesson.activities.length };
    }
  };
})();

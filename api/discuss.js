/* Class discussion boards (Lesson 2 and later).
   GET  /api/discuss?board=l2-warmup&pid=<player hash>  -> { configured, posts: [...] }
   POST /api/discuss { action: "post",   board, id, name, text, choices }
                     { action: "reply",  board, postId, id, name, text }
                     { action: "like",   board, postId, id, on: true|false }
                     { action: "delete", board, postId, key }            (teacher moderation; key = TEACHER_KEY)
                     { action: "delete-reply", board, postId, index, key }
                     { action: "check-key", board, key }                (Teacher's Corner: confirms the key)
   Needs Upstash Redis (same variables as the leaderboard). */
const crypto = require("crypto");
const { configured, pipeline } = require("./_redis");

const BOARDS = ["l2-warmup", "l2-impression", "l2-qualities", "l3-qa", "l4-right", "l4-adult", "l4-qa", "l4-showcase"];
/* Boards that take longer posts (whole essays) */
const LONG = { "l4-showcase": 1200 };
const MAX_POSTS = 80;

function pidOf(id) { return crypto.createHash("sha256").update(String(id)).digest("hex").slice(0, 16); }
function clean(s, max) { return String(s || "").replace(/[\u0000-\u0008\u000b-\u001f<>]/g, "").replace(/[ \t]+/g, " ").trim().slice(0, max); }
function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch (e) { return {}; }
}
const K = {
  posts: (b) => `gu:d:${b}:posts`,
  data: (b) => `gu:d:${b}:data`,
  replies: (p) => `gu:d:r:${p}`,
  likes: (p) => `gu:d:l:${p}`
};

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!configured()) return res.status(503).json({ configured: false, error: "Discussion storage is not connected." });

  try {
    if (req.method === "GET") {
      const board = String((req.query && req.query.board) || "");
      const pid = String((req.query && req.query.pid) || "").slice(0, 16);
      if (BOARDS.indexOf(board) < 0) return res.status(400).json({ error: "Unknown board." });
      const [ids] = await pipeline([["ZREVRANGE", K.posts(board), 0, MAX_POSTS - 1]]);
      if (!ids.length) return res.status(200).json({ configured: true, posts: [] });
      const cmds = [["HMGET", K.data(board), ...ids]];
      ids.forEach((id) => {
        cmds.push(["LRANGE", K.replies(id), 0, 49]);
        cmds.push(["SCARD", K.likes(id)]);
        cmds.push(["SISMEMBER", K.likes(id), pid || "-"]);
      });
      const out = await pipeline(cmds);
      const datas = out[0];
      const posts = [];
      ids.forEach((id, i) => {
        let d = null;
        try { d = JSON.parse(datas[i] || "null"); } catch (e) {}
        if (!d) return;
        const replies = (out[1 + i * 3] || []).map((r) => { try { return JSON.parse(r); } catch (e) { return null; } }).filter(Boolean);
        posts.push({ id, pid: d.pid, name: d.name, text: d.text, choices: d.choices || [], at: d.at, replies, likes: out[2 + i * 3] || 0, liked: out[3 + i * 3] === 1 });
      });
      return res.status(200).json({ configured: true, posts });
    }

    if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return res.status(405).json({ error: "Method not allowed." }); }

    const b = readBody(req);
    const board = String(b.board || "");
    if (BOARDS.indexOf(board) < 0) return res.status(400).json({ error: "Unknown board." });
    const action = String(b.action || "");

    if (action === "check-key") {
      const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
      const [ok] = await pipeline([["SET", "gu:d:rlk:" + ip, "1", "EX", 3, "NX"]]);
      if (ok === null) return res.status(429).json({ error: "Please wait a few seconds and try again." });
      const key = process.env.TEACHER_KEY;
      return res.status(200).json({ ok: !!key && String(b.key || "") === key, set: !!key });
    }

    if (action === "delete" || action === "delete-reply") {
      const key = process.env.TEACHER_KEY;
      if (!key || String(b.key || "") !== key) return res.status(403).json({ error: "Teacher key required." });
      const postId = String(b.postId || "").slice(0, 24);
      if (action === "delete") {
        await pipeline([["ZREM", K.posts(board), postId], ["HDEL", K.data(board), postId], ["DEL", K.replies(postId)], ["DEL", K.likes(postId)]]);
      } else {
        const [list] = await pipeline([["LRANGE", K.replies(postId), 0, 49]]);
        const idx = Number(b.index);
        if (Number.isInteger(idx) && idx >= 0 && idx < list.length) {
          await pipeline([["LSET", K.replies(postId), idx, "__deleted__"], ["LREM", K.replies(postId), 1, "__deleted__"]]);
        }
      }
      return res.status(200).json({ ok: true });
    }

    const id = clean(b.id, 64);
    if (!id || id.length < 8) return res.status(400).json({ error: "A player id is required." });
    const pid = pidOf(id);

    if (action === "post" || action === "reply") {
      /* A reply sent with the teacher key is marked as the teacher's answer. */
      const tkey = process.env.TEACHER_KEY;
      const isTeacher = action === "reply" && !!tkey && String(b.key || "") === tkey;
      const name = isTeacher ? "Teacher" : clean(b.name, 16);
      const text = clean(b.text, action === "post" ? (LONG[board] || 600) : isTeacher ? 800 : 300);
      if (!name) return res.status(400).json({ error: "A nickname is required." });
      if (text.length < 2) return res.status(400).json({ error: "Please write a little more." });
      if (!isTeacher) {
        const [ok] = await pipeline([["SET", "gu:d:rl:" + pid, "1", "EX", 5, "NX"]]);
        if (ok === null) return res.status(429).json({ error: "Please wait a few seconds before posting again." });
      }

      if (action === "post") {
        const choices = Array.isArray(b.choices) ? b.choices.slice(0, 3).map((c) => clean(c, 60)).filter(Boolean) : [];
        const postId = crypto.randomBytes(6).toString("hex");
        const rec = { pid, name, text, choices, at: Date.now() };
        await pipeline([["HSET", K.data(board), postId, JSON.stringify(rec)], ["ZADD", K.posts(board), rec.at, postId]]);
        return res.status(200).json({ ok: true, post: Object.assign({ id: postId, replies: [], likes: 0, liked: false }, rec) });
      }
      const postId = clean(b.postId, 24);
      const [exists] = await pipeline([["HEXISTS", K.data(board), postId]]);
      if (!exists) return res.status(404).json({ error: "This post no longer exists." });
      const rep = { pid, name, text, at: Date.now() };
      if (isTeacher) rep.teacher = true;
      await pipeline([["RPUSH", K.replies(postId), JSON.stringify(rep)], ["LTRIM", K.replies(postId), -50, -1]]);
      return res.status(200).json({ ok: true, reply: rep });
    }

    if (action === "like") {
      const postId = clean(b.postId, 24);
      const [exists] = await pipeline([["HEXISTS", K.data(board), postId]]);
      if (!exists) return res.status(404).json({ error: "This post no longer exists." });
      const on = b.on !== false;
      const [, count] = await pipeline([[on ? "SADD" : "SREM", K.likes(postId), pid], ["SCARD", K.likes(postId)]]);
      return res.status(200).json({ ok: true, likes: count, liked: on });
    }

    return res.status(400).json({ error: "Unknown action." });
  } catch (e) {
    return res.status(502).json({ error: "Discussion storage error." });
  }
};

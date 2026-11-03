/* Help and Support: messages from students to the course team, and the team's replies.
   POST { action: "send", name, cls, topic, text, page }         -> { id }
   GET  ?ids=a,b,c                                                 -> { messages }   (a sender's own messages, by id)
   POST { action: "list", key }                                    -> { messages }   (course staff, TEACHER_KEY)
   POST { action: "reply", key, id, text }                         -> the staff reply is added and the message resolved
   POST { action: "status", key, id, status: "open" | "resolved" }
   POST { action: "delete", key, id }
   Needs Upstash Redis (the same connection as the class discussions). */
const crypto = require("crypto");
const { configured, pipeline } = require("./_redis");

const TOPICS = ["Technical problem", "Error in the content", "Progress or badges", "Suggestion", "Other"];
const K = { ids: "gu:u1:support:ids", data: "gu:u1:support:data" };
const MAX = 400;

function clean(s, max) { return String(s || "").replace(/[\u0000-\u0008\u000b-\u001f<>]/g, "").replace(/[ \t]+/g, " ").trim().slice(0, max); }
function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch (e) { return {}; }
}
function ipOf(req) { return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon"; }
function isStaff(b) { const key = process.env.TEACHER_KEY; return !!key && String(b.key || "") === key; }
function parse(s) { try { return JSON.parse(s || "null"); } catch (e) { return null; } }
/* What a sender sees of their own message: no other sender's details. */
function own(id, m) { return { id, topic: m.topic, text: m.text, at: m.at, status: m.status, replies: m.replies || [] }; }

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!configured()) return res.status(503).json({ configured: false, error: "The support service is not connected." });

  try {
    if (req.method === "GET") {
      const ids = String((req.query && req.query.ids) || "").split(",").map((x) => x.trim()).filter((x) => /^[a-f0-9]{16}$/.test(x)).slice(0, 20);
      if (!ids.length) return res.status(200).json({ configured: true, messages: [] });
      const [rows] = await pipeline([["HMGET", K.data, ...ids]]);
      const messages = ids.map((id, i) => { const m = parse(rows[i]); return m ? own(id, m) : null; }).filter(Boolean);
      return res.status(200).json({ configured: true, messages });
    }
    if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return res.status(405).json({ error: "Method not allowed." }); }

    const b = readBody(req);
    const action = String(b.action || "");

    if (action === "send") {
      const text = clean(b.text, 1000);
      if (text.length < 10) return res.status(400).json({ error: "Describe the problem in a sentence or two." });
      const ip = ipOf(req);
      const hour = Math.floor(Date.now() / 3600000);
      const [gap, count] = await pipeline([
        ["SET", "gu:u1:support:rl:" + ip, "1", "EX", 20, "NX"],
        ["HINCRBY", "gu:u1:support:rlh:" + hour, ip, 1]
      ]);
      await pipeline([["EXPIRE", "gu:u1:support:rlh:" + hour, 3700]]);
      if (gap === null) return res.status(429).json({ error: "Please wait a few seconds before sending another message." });
      if (count > 8) return res.status(429).json({ error: "Too many messages this hour. Please try again later." });
      const id = crypto.randomBytes(8).toString("hex");
      const topic = TOPICS.indexOf(b.topic) >= 0 ? b.topic : "Other";
      const m = { name: clean(b.name, 24) || "Anonymous", cls: clean(b.cls, 24), topic, text, page: clean(b.page, 80), ua: clean(req.headers["user-agent"], 160), at: Date.now(), status: "open", replies: [] };
      await pipeline([["HSET", K.data, id, JSON.stringify(m)], ["ZADD", K.ids, m.at, id]]);
      /* Keep the inbox to the most recent messages. */
      const [n] = await pipeline([["ZCARD", K.ids]]);
      if (n > MAX) {
        const [old] = await pipeline([["ZRANGE", K.ids, 0, n - MAX - 1]]);
        if (old.length) await pipeline([["ZREM", K.ids, ...old], ["HDEL", K.data, ...old]]);
      }
      return res.status(200).json({ ok: true, id });
    }

    /* Everything below is for the course team. */
    if (!process.env.TEACHER_KEY) return res.status(403).json({ error: "No TEACHER_KEY has been set in Vercel yet." });
    if (!isStaff(b)) return res.status(403).json({ error: "This key does not match the TEACHER_KEY value in Vercel." });

    if (action === "list") {
      const [ids] = await pipeline([["ZREVRANGE", K.ids, 0, 199]]);
      if (!ids.length) return res.status(200).json({ configured: true, messages: [] });
      const [rows] = await pipeline([["HMGET", K.data, ...ids]]);
      const messages = ids.map((id, i) => { const m = parse(rows[i]); return m ? Object.assign({ id }, m) : null; }).filter(Boolean);
      return res.status(200).json({ configured: true, messages });
    }

    const id = String(b.id || "");
    if (!/^[a-f0-9]{16}$/.test(id)) return res.status(400).json({ error: "Unknown message." });
    if (action === "delete") {
      await pipeline([["ZREM", K.ids, id], ["HDEL", K.data, id]]);
      return res.status(200).json({ ok: true });
    }
    const [row] = await pipeline([["HMGET", K.data, id]]);
    const m = parse(row[0]);
    if (!m) return res.status(404).json({ error: "This message no longer exists." });
    if (action === "reply") {
      const text = clean(b.text, 1000);
      if (text.length < 2) return res.status(400).json({ error: "Write a reply first." });
      m.replies = (m.replies || []).concat([{ text, at: Date.now() }]).slice(-10);
      m.status = "resolved";
    } else if (action === "status") {
      m.status = b.status === "resolved" ? "resolved" : "open";
    } else {
      return res.status(400).json({ error: "Unknown action." });
    }
    await pipeline([["HSET", K.data, id, JSON.stringify(m)]]);
    return res.status(200).json({ ok: true, message: Object.assign({ id }, m) });
  } catch (e) {
    return res.status(500).json({ error: "The support service is unavailable. Please try again later." });
  }
};

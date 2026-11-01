/* Word Battle leaderboard.
   GET  /api/leaderboard?limit=20  -> { configured, total, entries: [{ rank, pid, name, cls, correct, total, ms, at }] }
   POST /api/leaderboard { id, name, cls, correct, total, ms } -> { rank, total, improved }
   Ranking: accuracy first, then time. Each player keeps only their best result.
   Needs Upstash Redis (KV_REST_API_URL + KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN). */
const crypto = require("crypto");
const { configured, pipeline } = require("./_redis");

const ZKEY = "gu:u1:battle:rank";
const HKEY = "gu:u1:battle:players";
const QUESTIONS = 15;

function pidOf(id) { return crypto.createHash("sha256").update(String(id)).digest("hex").slice(0, 16); }
function scoreOf(correct, ms) { return correct * 1e7 + (9999999 - Math.min(Math.floor(ms / 10), 9999999)); }
function cleanText(s, max) {
  return String(s || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch (e) { return {}; }
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!configured()) return res.status(503).json({ configured: false, error: "Leaderboard storage is not connected." });

  try {
    if (req.method === "GET") {
      const limit = Math.max(1, Math.min(50, parseInt((req.query && req.query.limit) || "20", 10) || 20));
      const [ids, total] = await pipeline([["ZREVRANGE", ZKEY, 0, limit - 1], ["ZCARD", ZKEY]]);
      let details = [];
      if (ids.length) [details] = await pipeline([["HMGET", HKEY, ...ids]]);
      const entries = ids.map((pid, i) => {
        let d = {};
        try { d = JSON.parse(details[i] || "{}"); } catch (e) {}
        return { rank: i + 1, pid, name: d.name || "Player", cls: d.cls || "", correct: d.correct || 0, total: d.total || QUESTIONS, ms: d.ms || 0, at: d.at || 0 };
      });
      return res.status(200).json({ configured: true, total, entries });
    }

    if (req.method === "POST") {
      const b = readBody(req);
      const id = cleanText(b.id, 64);
      const name = cleanText(b.name, 16);
      const cls = cleanText(b.cls, 12);
      const correct = Number(b.correct), total = Number(b.total), ms = Number(b.ms);
      if (!id || id.length < 8 || !name) return res.status(400).json({ error: "A player id and nickname are required." });
      if (total !== QUESTIONS || !Number.isInteger(correct) || correct < 0 || correct > QUESTIONS) return res.status(400).json({ error: "Invalid score." });
      if (!Number.isFinite(ms) || ms < 15000 || ms > 3600000) return res.status(400).json({ error: "Invalid time." });

      const pid = pidOf(id);
      const score = scoreOf(correct, ms);
      const [oldScore, oldRaw] = await pipeline([["ZSCORE", ZKEY, pid], ["HGET", HKEY, pid]]);
      const improved = oldScore === null || score > Number(oldScore);
      let rec = {};
      try { rec = JSON.parse(oldRaw || "{}"); } catch (e) {}
      if (improved) rec = { correct, total, ms, at: Date.now() };
      rec.name = name; rec.cls = cls;
      const cmds = [["HSET", HKEY, pid, JSON.stringify(rec)]];
      if (improved) cmds.push(["ZADD", ZKEY, score, pid]);
      await pipeline(cmds);
      const [rank, count] = await pipeline([["ZREVRANK", ZKEY, pid], ["ZCARD", ZKEY]]);
      return res.status(200).json({ rank: rank + 1, total: count, improved, pid });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed." });
  } catch (e) {
    return res.status(502).json({ error: "Leaderboard storage error." });
  }
};

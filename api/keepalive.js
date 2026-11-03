/* Daily keep-alive (Vercel Cron, see vercel.json): one small write a day keeps the free Upstash database
   from being archived for inactivity, so the class discussions, Q&A and leaderboard keep working
   for the life of the course link. */
const { configured, pipeline } = require("./_redis");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!configured()) return res.status(200).json({ ok: false, configured: false });
  try {
    await pipeline([["SET", "gu:keepalive", String(Date.now())]]);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false });
  }
};

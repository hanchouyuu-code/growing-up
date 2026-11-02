/* AI feedback on the Lesson 4 essay "Me at Eighteen", marked like the gaokao applied writing task (15 marks, five bands).
   POST /api/feedback { text } -> { score, band, summary, strengths, improvements, corrections, polished }
   Uses the same AI settings as the tutor (ANTHROPIC_API_KEY, or OPENAI_API_KEY + OPENAI_MODEL + OPENAI_BASE_URL). */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { configured: redisOn, pipeline } = require("./_redis");

let COURSE = null;
function course() {
  if (COURSE) return COURSE;
  const ctx = {};
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "js", "data.js"), "utf8"), ctx);
  COURSE = ctx.GU;
  return COURSE;
}

function systemPrompt() {
  const GU = course();
  const words = GU.WORDS.map((w) => w.word).join(", ");
  const expr = GU.L3 ? GU.L3.passage.expressions.map((x) => x.base || x.phrase).filter(Boolean).join("; ") : "";
  return [
    "You are an experienced English teacher in China marking a Senior 2 student's short essay, written as practice for the gaokao applied writing task (应用文写作).",
    "The task (in Chinese for the student): 你即将迎来自己的十八岁。你校英文报 “Growing Up” 栏目正在开展以“我的十八岁”（Me at Eighteen）为题的征文活动。请你畅想自己的十八岁，写一篇短文投稿，内容包括：1. 成年后你最希望拥有的一项权利；2. 你希望拥有这项权利的理由；3. 你对这项权利所对应责任的理解。写作词数应为 80 左右。",
    "Mark it out of 15 using the gaokao bands: Band 5 (13-15) covers all points, rich and accurate language, clear and coherent; Band 4 (10-12); Band 3 (7-9); Band 2 (4-6); Band 1 (1-3). Consider content coverage, range and accuracy of vocabulary and grammar, linking and coherence, and length (about 80 words).",
    "Unit words the student has learnt: " + words + ".",
    "Key expressions from the reading passage: " + expr + ".",
    "Reply with JSON only, no other text, in exactly this shape:",
    '{"score": <integer 0-15>, "band": "Band N", "summary": "<one or two sentences>", "strengths": ["..."], "improvements": [{"area": "Content|Language|Structure", "comment": "..."}], "corrections": [{"original": "<exact words from the essay>", "revised": "...", "reason": "..."}], "polished": "<an improved version>"}',
    "Rules: write comments in simple English (CEFR B1-B2), adding a short Chinese gloss in brackets where it helps. Give 2-3 strengths, 2-4 improvements and up to 6 corrections; each 'original' must be copied exactly from the essay.",
    "The polished version must keep the student's own ideas and the title, stay within 80-100 words, correct the errors, and use two or three of the unit words or key expressions naturally. Do not add new ideas the student did not have.",
    "If the text is not an attempt at the task, give score 0, explain politely in the summary, and leave the other lists empty and polished empty."
  ].join("\n");
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch (e) { return {}; }
}

async function rateLimited(req) {
  if (!redisOn()) return false;
  const ip = String(req.headers["x-forwarded-for"] || (req.socket && req.socket.remoteAddress) || "anon").split(",")[0].trim();
  const key = "gu:u1:feedback:rl:" + ip + ":" + Math.floor(Date.now() / 3600000);
  try {
    const [n] = await pipeline([["INCR", key], ["EXPIRE", key, 3700]]);
    return n > 12;
  } catch (e) { return false; }
}

function parseJson(text) {
  const m = String(text || "").match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch (e) { return null; }
}

function tidy(d, essay) {
  const arr = (x) => (Array.isArray(x) ? x : []);
  const str = (x, n) => String(x == null ? "" : x).slice(0, n);
  const score = Math.max(0, Math.min(15, Math.round(Number(d.score) || 0)));
  return {
    score,
    band: str(d.band, 20) || (score >= 13 ? "Band 5" : score >= 10 ? "Band 4" : score >= 7 ? "Band 3" : score >= 4 ? "Band 2" : "Band 1"),
    summary: str(d.summary, 600),
    strengths: arr(d.strengths).slice(0, 4).map((x) => str(x, 300)),
    improvements: arr(d.improvements).slice(0, 5).map((x) => ({ area: str(x && x.area, 30), comment: str(x && x.comment, 400) })),
    corrections: arr(d.corrections).slice(0, 8).map((x) => ({ original: str(x && x.original, 200), revised: str(x && x.revised, 200), reason: str(x && x.reason, 300) }))
      .filter((x) => x.original && essay.indexOf(x.original) >= 0),
    polished: str(d.polished, 1200)
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed." }); }
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiModel = process.env.OPENAI_MODEL;
  if (!anthropicKey && !(openaiKey && openaiModel)) return res.status(503).json({ error: "The AI service is not configured." });

  const body = readBody(req);
  const essay = String(body.text || "").replace(/[\u0000-\u0008\u000b-\u001f]/g, "").trim().slice(0, 1500);
  if (essay.split(/\s+/).length < 20) return res.status(400).json({ error: "Write at least 20 words before asking for feedback." });
  if (await rateLimited(req)) return res.status(429).json({ error: "The hourly feedback limit has been reached. Please try again later." });

  const system = systemPrompt();
  const user = "Title: Me at Eighteen\n\n" + essay;
  try {
    let text = "";
    if (anthropicKey) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5", max_tokens: 1400, system, messages: [{ role: "user", content: user }] })
      });
      if (!r.ok) throw new Error("Anthropic HTTP " + r.status);
      const d = await r.json();
      text = (d.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
    } else {
      const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
      const r = await fetch(base + "/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + openaiKey, "content-type": "application/json" },
        body: JSON.stringify({ model: openaiModel, max_tokens: 1400, messages: [{ role: "system", content: system }, { role: "user", content: user }] })
      });
      if (!r.ok) throw new Error("OpenAI-compatible HTTP " + r.status);
      const d = await r.json();
      text = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || "";
    }
    const parsed = parseJson(text);
    if (!parsed) throw new Error("Unreadable reply");
    return res.status(200).json(tidy(parsed, essay));
  } catch (e) {
    return res.status(502).json({ error: "The AI service did not respond." });
  }
};

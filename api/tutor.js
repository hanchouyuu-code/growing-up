/* AI Tutor.
   POST /api/tutor { messages: [{ role: "user"|"assistant", content }], word: "word-id" | null } -> { reply }
   Provider (set in Vercel > Settings > Environment Variables):
     ANTHROPIC_API_KEY (+ optional ANTHROPIC_MODEL, default claude-haiku-5-5), or
     OPENAI_API_KEY + OPENAI_MODEL (+ optional OPENAI_BASE_URL) for any OpenAI-compatible service.
   Optional rate limit (30 questions per hour per connection) when Upstash Redis is connected. */
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
  for (const f of ["data.js", "tutor-data.js"]) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "js", f), "utf8"), ctx);
  }
  COURSE = ctx.GU;
  return COURSE;
}

function plain(html) { return String(html || "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " "); }

function systemPrompt(wordId) {
  const GU = course();
  const lines = GU.WORDS.map((w, i) => {
    const h = GU.HINTS[w.id] || {};
    return `${i + 1}. ${w.word} (${w.pos}) ${w.zh}. Meaning: ${w.def}. Textbook: "${w.book}" [${w.src}]. ` +
      `Forms: ${(h.forms || []).map((f) => f[0] + " " + f[1]).join(", ")}. Collocations: ${(h.col || []).join("; ")}. ` +
      `Phrases: ${(h.phr || []).join("; ")}. Note: ${plain(h.note)}`;
  }).join("\n");
  const current = wordId && GU.wordById(wordId);
  return [
    "You are the AI Tutor in an online English course for Senior High School Year 2 students in China (aged 16-17).",
    "Course: FLTRP Senior High School English, Selective Compulsory Book 2, Unit 1 Growing up. The reading passage, The Age of Majority, has three speakers: Bethany (16, Australia), Lin Ning (19, Shanghai) and Morgan (20, Florida).",
    "Your job: help students learn the unit's 30 key words and the key expressions of the reading passage: meanings, word forms (word family), collocations, fixed phrases, usage, pronunciation and spelling tips, and how each word or expression is used in the textbook.",
    "Style rules:",
    "- Answer in clear, simple English (CEFR B1-B2). Add a short Chinese gloss in brackets only when it helps understanding.",
    "- Keep answers under 120 words. Use short bullet lists (lines starting with '- ') for forms, collocations and phrases. Use **bold** for the target word.",
    "- Prefer the textbook sentence as an example when relevant.",
    "- End most answers with one short practice task or question for the student, e.g. asking them to make a sentence. When the student replies with a sentence, give brief, encouraging feedback and one correction if needed.",
    "- Do not write homework, essays or full answers to graded tasks for the student. Guide them with questions and sentence starters instead, and ask them to find evidence in the passage.",
    "- Stay on topic: English learning and this unit. Politely decline unrelated or inappropriate requests and steer back to the vocabulary.",
    "- Never ask for personal information. If you are not sure about something, say so and suggest checking with the teacher.",
    current ? `The student is currently studying the word: ${current.word}.` : "",
    "Reference list of the 30 words:",
    lines,
    passageInfo(GU)
  ].filter(Boolean).join("\n");
}

/* The reading passage and its key expressions (Lesson 3), so the tutor can refer to them. */
function passageInfo(GU) {
  const L3 = GU.L3;
  if (!L3 || !L3.passage) return "";
  const who = { intro: "Introduction" };
  (L3.speakers || []).forEach((s) => { who[s.id] = `${s.name} (${s.age}, ${s.place})`; });
  const text = L3.passage.sections.map((sec) => `${who[sec.speaker] || sec.speaker}: ${sec.sentences.map((x) => x[0]).join(" ")}`).join("\n");
  const ex = L3.passage.expressions.map((x) => {
    const w = x.word ? GU.wordById(x.word) || {} : {};
    return `- ${x.base || w.word || x.phrase} (${x.zh || w.zh || ""}): ${x.def || w.def || ""}`;
  }).join("\n");
  return `The reading passage, ${L3.passage.title}:\n${text}\nKey expressions of the passage:\n${ex}`;
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch (e) { return {}; }
}

function cleanMessages(list) {
  if (!Array.isArray(list)) return null;
  const msgs = list.slice(-10).map((m) => ({
    role: m && m.role === "assistant" ? "assistant" : "user",
    content: String((m && m.content) || "").slice(0, 600).trim()
  })).filter((m) => m.content);
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  /* merge consecutive messages from the same role */
  const out = [];
  for (const m of msgs) {
    if (out.length && out[out.length - 1].role === m.role) out[out.length - 1].content += "\n" + m.content;
    else out.push(m);
  }
  if (!out.length || out[out.length - 1].role !== "user") return null;
  return out;
}

async function rateLimited(req) {
  if (!redisOn()) return false;
  const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "anon").split(",")[0].trim();
  const key = "gu:u1:tutor:rl:" + ip + ":" + Math.floor(Date.now() / 3600000);
  try {
    const [n] = await pipeline([["INCR", key], ["EXPIRE", key, 3700]]);
    return n > 30;
  } catch (e) { return false; }
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed." }); }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const openaiModel = process.env.OPENAI_MODEL;
  if (!anthropicKey && !(openaiKey && openaiModel)) return res.status(503).json({ error: "The AI service is not configured." });

  const body = readBody(req);
  const messages = cleanMessages(body.messages);
  if (!messages) return res.status(400).json({ error: "A question is required." });
  if (await rateLimited(req)) return res.status(429).json({ error: "Hourly question limit reached. Please try again later." });

  const system = systemPrompt(typeof body.word === "string" ? body.word : null) +
    (body.context === "lesson-3" ? "\nThe student is now working on Lesson 3, the reading passage The Age of Majority. Focus on the passage, its key expressions and the speakers' views, and quote the passage where it helps." : "");
  try {
    let reply = "";
    if (anthropicKey) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5", max_tokens: 500, system, messages })
      });
      if (!r.ok) throw new Error("Anthropic HTTP " + r.status);
      const d = await r.json();
      reply = (d.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n").trim();
    } else {
      const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
      const r = await fetch(base + "/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + openaiKey, "content-type": "application/json" },
        body: JSON.stringify({ model: openaiModel, max_tokens: 500, messages: [{ role: "system", content: system }].concat(messages) })
      });
      if (!r.ok) throw new Error("OpenAI-compatible HTTP " + r.status);
      const d = await r.json();
      reply = ((d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || "").trim();
    }
    if (!reply) throw new Error("Empty reply");
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(502).json({ error: "The AI service did not respond." });
  }
};

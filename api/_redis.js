/* Minimal Upstash Redis REST client (works with the Vercel Marketplace "Upstash for Redis" integration). */
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

function configured() { return Boolean(URL_ && TOKEN); }

async function pipeline(commands) {
  const r = await fetch(URL_.replace(/\/$/, "") + "/pipeline", {
    method: "POST",
    headers: { Authorization: "Bearer " + TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error("Redis HTTP " + r.status);
  const data = await r.json();
  return data.map((d) => { if (d.error) throw new Error(d.error); return d.result; });
}

module.exports = { configured, pipeline };

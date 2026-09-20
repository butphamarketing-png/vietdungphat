import { methodNotAllowed, readJson, send } from "../lib/api/http.js";
import { isSupabaseConfigured } from "../lib/api/supabase.js";
import { recordVisit } from "../lib/api/visits.js";

function isBot(ua) {
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse/i.test(ua || "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, "POST");
  if (isBot(req.headers["user-agent"] || "")) return send(res, 200, { ok: true, skipped: true });
  if (!isSupabaseConfigured()) return send(res, 200, { ok: true, skipped: true });
  try {
    const raw = await readJson(req);
    const path = String(raw.path || "").split("?")[0].replace(/\/+$/, "") || "/";
    if (path.startsWith("/adminbp") || path.startsWith("/api/")) {
      return send(res, 200, { ok: true, skipped: true });
    }
    await recordVisit({
      path,
      title: String(raw.title || "").slice(0, 180),
      referrer: String(raw.referrer || req.headers.referer || "").slice(0, 300),
      sessionId: String(raw.sessionId || "").slice(0, 80),
    });
    send(res, 200, { ok: true });
  } catch {
    send(res, 200, { ok: true });
  }
}

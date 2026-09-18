import { isAdmin } from "../../lib/api/auth.js";
import { methodNotAllowed, readJson, send } from "../../lib/api/http.js";
import { getOverlay, healthSupabase, isSupabaseConfigured, setOverlay } from "../../lib/api/supabase.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    if (!isAdmin(req)) return send(res, 401, { ok: false, error: "Unauthorized" });
    try {
      const data = (await getOverlay()) || {};
      return send(res, 200, { ok: true, data });
    } catch (error) {
      return send(res, 500, { ok: false, error: error.message });
    }
  }
  if (req.method === "POST") {
    if (!isAdmin(req)) return send(res, 401, { ok: false, error: "Unauthorized" });
    if (!isSupabaseConfigured()) return send(res, 503, { ok: false, error: "Supabase chưa cấu hình" });
    try {
      const body = await readJson(req);
      await setOverlay(body && typeof body === "object" ? body : {});
      return send(res, 200, { ok: true });
    } catch (error) {
      return send(res, 500, { ok: false, error: error.message });
    }
  }
  return methodNotAllowed(res, "GET, POST");
}

export { healthSupabase };

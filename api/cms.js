import { getOverlay } from "../lib/api/supabase.js";
import { methodNotAllowed, send } from "../lib/api/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  try {
    const data = (await getOverlay()) || {};
    send(res, 200, { ok: true, data });
  } catch (error) {
    send(res, 500, { ok: false, error: error.message });
  }
}

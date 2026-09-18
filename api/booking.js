import { getOverlay, isSupabaseConfigured, setOverlay } from "./_lib/supabase.js";
import { methodNotAllowed, readJson, send } from "./_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, "POST");
  if (!isSupabaseConfigured()) return send(res, 503, { ok: false, error: "Supabase chưa cấu hình" });
  try {
    const entry = await readJson(req);
    const overlay = (await getOverlay()) || {};
    const bookings = [
      { id: Date.now(), createdAt: new Date().toISOString(), ...entry },
      ...(overlay.bookings || []),
    ];
    await setOverlay({ ...overlay, bookings });
    send(res, 200, { ok: true });
  } catch (error) {
    send(res, 500, { ok: false, error: error.message });
  }
}

import { getOverlay, isSupabaseConfigured, setOverlay } from "../lib/api/supabase.js";
import { methodNotAllowed, readJson, send } from "../lib/api/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, "POST");
  if (!isSupabaseConfigured()) return send(res, 503, { ok: false, error: "Supabase chưa cấu hình" });
  try {
    const raw = await readJson(req);
    const entry = {
      name: String(raw.name || "").trim(),
      phone: String(raw.phone || "").trim(),
      email: String(raw.email || "").trim(),
      need: String(raw.need || "").trim(),
      date: String(raw.date || "").trim(),
      slot: String(raw.slot || "").trim(),
      note: String(raw.note || "").trim(),
    };
    if (!entry.name || !entry.phone) {
      return send(res, 400, { ok: false, error: "Thiếu họ tên hoặc số điện thoại" });
    }
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

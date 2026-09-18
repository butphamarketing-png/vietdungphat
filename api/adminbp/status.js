import { isAdmin } from "../_lib/auth.js";
import { healthStorage, healthSupabase } from "../_lib/supabase.js";
import { methodNotAllowed, send } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  if (!isAdmin(req)) return send(res, 401, { ok: false, error: "Unauthorized" });
  const [supabase, storage] = await Promise.all([healthSupabase(), healthStorage()]);
  send(res, 200, { ok: true, supabase, storage });
}

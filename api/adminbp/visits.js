import { isAdmin } from "../../lib/api/auth.js";
import { methodNotAllowed, send } from "../../lib/api/http.js";
import { getVisitStats } from "../../lib/api/visits.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  if (!isAdmin(req)) return send(res, 401, { ok: false, error: "Unauthorized" });
  try {
    const stats = await getVisitStats();
    send(res, 200, stats);
  } catch (error) {
    send(res, 500, { ok: false, error: error.message });
  }
}

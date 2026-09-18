import { isAdmin } from "../../lib/api/auth.js";
import { getAdminUser } from "../../lib/api/env.js";
import { methodNotAllowed, send } from "../../lib/api/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  if (!isAdmin(req)) return send(res, 401, { ok: false });
  send(res, 200, { ok: true, email: getAdminUser() });
}

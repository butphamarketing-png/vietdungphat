import { isAdmin } from "../_lib/auth.js";
import { getAdminUser } from "../_lib/env.js";
import { methodNotAllowed, send } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");
  if (!isAdmin(req)) return send(res, 401, { ok: false });
  send(res, 200, { ok: true, email: getAdminUser() });
}

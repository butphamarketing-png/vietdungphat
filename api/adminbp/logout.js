import { sessionCookie } from "../../lib/api/auth.js";
import { methodNotAllowed, send } from "../../lib/api/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, "POST");
  send(res, 200, { ok: true }, { "Set-Cookie": sessionCookie("", true) });
}

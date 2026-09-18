import { sessionCookie } from "../_lib/auth.js";
import { methodNotAllowed, send } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, "POST");
  send(res, 200, { ok: true }, { "Set-Cookie": sessionCookie("", true) });
}

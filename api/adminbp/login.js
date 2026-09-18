import { createSessionToken, isAdmin, sessionCookie, verifyCredentials } from "../_lib/auth.js";
import { methodNotAllowed, readJson, send } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, "POST");
  const body = await readJson(req);
  const email = String(body.email || body.username || "").trim();
  const password = String(body.password || "");
  if (!verifyCredentials(email, password)) {
    return send(res, 401, { ok: false, error: "Email hoặc mật khẩu không đúng." });
  }
  send(res, 200, { ok: true }, { "Set-Cookie": sessionCookie(createSessionToken()) });
}

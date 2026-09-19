import { createHash, timingSafeEqual } from "node:crypto";
import { getAdminPassword, getAdminSecret, getAdminUser } from "./env.js";

export const ADMIN_COOKIE = "adminbp_session";
const SESSION_DAYS = 7;

function sign(payload) {
  return createHash("sha256").update(`${payload}.${getAdminSecret()}`).digest("hex");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) {
    timingSafeEqual(createHash("sha256").update(String(left)).digest(), createHash("sha256").update(String(right)).digest());
    return false;
  }
  return timingSafeEqual(a, b);
}

export function createSessionToken() {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `adminbp:${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const parts = payload.split(":");
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return parts[0] === "adminbp";
}

export function verifyCredentials(email, password) {
  const user = email.trim().toLowerCase();
  const allowed = getAdminUser();
  const userOk = safeEqual(user, allowed) || safeEqual(user, "admin") || safeEqual(user, "admin@vietdungphat.com");
  return userOk && safeEqual(password, getAdminPassword());
}

export function parseCookies(req) {
  const header = req.headers?.cookie || "";
  const out = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

export function isAdmin(req) {
  return verifySessionToken(parseCookies(req)[ADMIN_COOKIE]);
}

export function sessionCookie(token, clear = false) {
  const maxAge = clear ? 0 : SESSION_DAYS * 24 * 60 * 60;
  const value = clear ? "" : token;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${value}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

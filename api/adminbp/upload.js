import Busboy from "busboy";
import { isAdmin } from "../../lib/api/auth.js";
import { methodNotAllowed, readJson, send } from "../../lib/api/http.js";
import {
  contentTypeFor,
  createSignedUpload,
  isSupabaseConfigured,
  upsertMedia,
  uploadMediaObject,
} from "../../lib/api/supabase.js";

const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif", ".pdf", ".mp4"]);

function extOf(name) {
  const original = name || "upload";
  return original.includes(".") ? `.${original.split(".").pop().toLowerCase()}` : "";
}

function mediaItem({ id, name, url, key, size, type }) {
  return {
    id,
    name,
    url,
    key,
    size: Number(size) || 0,
    type: type || "",
    storage: "supabase",
    uploadedAt: new Date().toISOString(),
  };
}

async function parseMultipart(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks);
  if (!raw.length && Buffer.isBuffer(req.body)) return parseFromBuffer(req, req.body);
  return parseFromBuffer(req, raw);
}

function parseFromBuffer(req, raw) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_BYTES, files: 1 } });
    let file = null;
    let truncated = false;
    bb.on("file", (_name, stream, info) => {
      const parts = [];
      stream.on("data", (d) => parts.push(d));
      stream.on("limit", () => {
        truncated = true;
      });
      stream.on("end", () => {
        file = { filename: info.filename, mimeType: info.mimeType, buffer: Buffer.concat(parts) };
      });
    });
    bb.on("error", reject);
    bb.on("finish", () => {
      if (truncated) reject(new Error("File quá lớn (tối đa 50MB)"));
      else resolve(file);
    });
    bb.end(raw);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, "POST");
  if (!isAdmin(req)) return send(res, 401, { ok: false, error: "Unauthorized" });
  if (!isSupabaseConfigured()) {
    return send(res, 503, { ok: false, error: "Supabase chưa cấu hình. Điền SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY." });
  }

  const ctype = String(req.headers["content-type"] || "");
  try {
    if (ctype.includes("application/json")) {
      const body = await readJson(req);
      if (body.action === "sign") {
        const original = String(body.filename || "upload");
        const ext = extOf(original);
        if (!ALLOWED.has(ext)) return send(res, 400, { ok: false, error: `Định dạng không hỗ trợ: ${ext || "không rõ"}` });
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const key = `uploads/vietdungphat/${id}${ext}`;
        const signed = await createSignedUpload({ key });
        return send(res, 200, { ok: true, data: { ...signed, id, name: original } });
      }
      if (body.action === "complete") {
        const item = mediaItem({
          id: String(body.id || body.key || Date.now()),
          name: String(body.name || "upload"),
          url: String(body.url || ""),
          key: String(body.key || ""),
          size: body.size,
          type: String(body.type || ""),
        });
        if (!item.url || !item.key) return send(res, 400, { ok: false, error: "Thiếu URL file" });
        await upsertMedia(item);
        return send(res, 200, { ok: true, data: item });
      }
      return send(res, 400, { ok: false, error: "Yêu cầu upload không hợp lệ" });
    }

    const file = await parseMultipart(req);
    if (!file?.buffer?.length) return send(res, 400, { ok: false, error: "Thiếu file" });
    const original = file.filename || "upload";
    const ext = extOf(original);
    if (!ALLOWED.has(ext)) return send(res, 400, { ok: false, error: `Định dạng không hỗ trợ: ${ext}` });
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const key = `uploads/vietdungphat/${id}${ext}`;
    const uploaded = await uploadMediaObject({
      key,
      body: file.buffer,
      contentType: file.mimeType || contentTypeFor(ext),
    });
    const item = mediaItem({
      id,
      name: original,
      url: uploaded.url,
      key: uploaded.key,
      size: file.buffer.length,
      type: file.mimeType || "",
    });
    await upsertMedia(item);
    send(res, 200, { ok: true, data: item });
  } catch (error) {
    send(res, 500, { ok: false, error: error.message || "Upload thất bại" });
  }
}

export const config = {
  api: { bodyParser: false },
};

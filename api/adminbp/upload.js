import Busboy from "busboy";
import { isAdmin } from "../../lib/api/auth.js";
import { methodNotAllowed, send } from "../../lib/api/http.js";
import { contentTypeFor, isSupabaseConfigured, uploadMediaObject, upsertMedia } from "../../lib/api/supabase.js";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif", ".pdf", ".mp4"]);

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_BYTES, files: 1 } });
    let file = null;
    bb.on("file", (_name, stream, info) => {
      const chunks = [];
      stream.on("data", (d) => chunks.push(d));
      stream.on("limit", () => reject(new Error("File quá lớn (tối đa 12MB)")));
      stream.on("end", () => {
        file = { filename: info.filename, mimeType: info.mimeType, buffer: Buffer.concat(chunks) };
      });
    });
    bb.on("error", reject);
    bb.on("finish", () => resolve(file));
    req.pipe(bb);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res, "POST");
  if (!isAdmin(req)) return send(res, 401, { ok: false, error: "Unauthorized" });
  if (!isSupabaseConfigured()) {
    return send(res, 503, { ok: false, error: "Supabase chưa cấu hình. Điền SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY." });
  }
  try {
    const file = await parseMultipart(req);
    if (!file?.buffer?.length) return send(res, 400, { ok: false, error: "Thiếu file" });
    const original = file.filename || "upload";
    const ext = original.includes(".") ? `.${original.split(".").pop().toLowerCase()}` : "";
    if (!ALLOWED.has(ext)) return send(res, 400, { ok: false, error: `Định dạng không hỗ trợ: ${ext}` });
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const key = `uploads/vietdungphat/${id}${ext}`;
    const uploaded = await uploadMediaObject({
      key,
      body: file.buffer,
      contentType: file.mimeType || contentTypeFor(ext),
    });
    const item = {
      id,
      name: original,
      url: uploaded.url,
      key: uploaded.key,
      size: file.buffer.length,
      type: file.mimeType || "",
      storage: "supabase",
      uploadedAt: new Date().toISOString(),
    };
    await upsertMedia(item);
    send(res, 200, { ok: true, data: item });
  } catch (error) {
    send(res, 500, { ok: false, error: error.message || "Upload thất bại" });
  }
}

export const config = {
  api: { bodyParser: false },
};

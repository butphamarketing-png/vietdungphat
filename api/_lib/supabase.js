import { createClient } from "@supabase/supabase-js";
import { env, required } from "./env.js";

let adminClient = null;

export function isSupabaseConfigured() {
  return required(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
}

export function getAdminClient() {
  if (!isSupabaseConfigured()) return null;
  if (adminClient) return adminClient;
  adminClient = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

const CMS_KEY = "vdp-overlay";

export async function getOverlay() {
  const client = getAdminClient();
  if (!client) return null;
  const { data, error } = await client.from("cms_docs").select("data").eq("key", CMS_KEY).maybeSingle();
  if (error) throw new Error(`cms_docs get: ${error.message}`);
  return data?.data ?? null;
}

export async function setOverlay(value) {
  const client = getAdminClient();
  if (!client) return { ok: false, skipped: true };
  const { error } = await client
    .from("cms_docs")
    .upsert({ key: CMS_KEY, data: value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(`cms_docs set: ${error.message}`);
  return { ok: true };
}

export async function listMedia() {
  const client = getAdminClient();
  if (!client) return [];
  const { data, error } = await client.from("media").select("*").order("uploaded_at", { ascending: false }).limit(200);
  if (error) throw new Error(`media list: ${error.message}`);
  return (data || []).map((m) => ({
    id: String(m.id),
    name: String(m.name || ""),
    url: String(m.url || ""),
    key: m.key ? String(m.key) : null,
    size: Number(m.size) || 0,
    type: String(m.alt || ""),
    storage: String(m.storage || "supabase"),
    uploadedAt: String(m.uploaded_at || ""),
  }));
}

export async function upsertMedia(item) {
  const client = getAdminClient();
  if (!client) return { ok: false, skipped: true };
  const { error } = await client.from("media").upsert(
    {
      id: item.id,
      name: item.name,
      url: item.url,
      key: item.key || null,
      size: item.size || 0,
      alt: item.type || item.alt || "",
      storage: item.storage || "supabase",
      uploaded_at: item.uploadedAt || new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteMediaRow(id) {
  const client = getAdminClient();
  if (!client || !id) return { ok: false, skipped: true };
  const { error } = await client.from("media").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export function getMediaBucket() {
  return env("SUPABASE_STORAGE_BUCKET", "media");
}

export function contentTypeFor(ext) {
  const map = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".avif": "image/avif",
    ".mp4": "video/mp4",
    ".pdf": "application/pdf",
  };
  return map[String(ext || "").toLowerCase()] || "application/octet-stream";
}

export async function ensureMediaBucket() {
  const client = getAdminClient();
  if (!client) throw new Error("Supabase chưa cấu hình");
  const name = getMediaBucket();
  const { data } = await client.storage.getBucket(name);
  if (data) return name;
  const { error } = await client.storage.createBucket(name, {
    public: true,
    fileSizeLimit: 12 * 1024 * 1024,
  });
  if (error && !/already exists|duplicate/i.test(error.message || "")) {
    throw new Error(`Tạo bucket ${name}: ${error.message}`);
  }
  return name;
}

export async function uploadMediaObject({ key, body, contentType }) {
  const client = getAdminClient();
  if (!client) throw new Error("Supabase chưa cấu hình (thiếu env)");
  const bucket = await ensureMediaBucket();
  const { error } = await client.storage.from(bucket).upload(key, body, {
    contentType,
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw new Error(`storage upload: ${error.message}`);
  const { data } = client.storage.from(bucket).getPublicUrl(key);
  const url = data?.publicUrl;
  if (!url) throw new Error("Không lấy được public URL");
  return { key, url, bucket };
}

export async function deleteMediaObject(key) {
  const client = getAdminClient();
  if (!client || !key) return { ok: false, skipped: true };
  const { error } = await client.storage.from(getMediaBucket()).remove([key]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getMediaRow(id) {
  const client = getAdminClient();
  if (!client || !id) return null;
  const { data, error } = await client.from("media").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`media get: ${error.message}`);
  return data || null;
}

export async function healthSupabase() {
  if (!isSupabaseConfigured()) {
    return { ok: false, configured: false, error: "Thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" };
  }
  const client = getAdminClient();
  const { error } = await client.from("cms_docs").select("key").limit(1);
  if (error) return { ok: false, configured: true, error: error.message };
  return { ok: true, configured: true };
}

export async function healthStorage() {
  if (!isSupabaseConfigured()) {
    return { ok: false, configured: false, error: "Thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" };
  }
  try {
    const bucket = await ensureMediaBucket();
    return { ok: true, configured: true, bucket };
  } catch (error) {
    return { ok: false, configured: true, error: error.message };
  }
}

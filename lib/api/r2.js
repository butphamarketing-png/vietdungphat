import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env, required } from "./env.js";

let client = null;

export function isR2Configured() {
  return required(["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_PUBLIC_URL"]);
}

function getEndpoint() {
  return env("R2_ENDPOINT") || `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`;
}

export function getPublicUrl(key) {
  const base = env("R2_PUBLIC_URL").replace(/\/$/, "");
  if (!base) return null;
  return `${base}/${String(key).replace(/^\//, "")}`;
}

function getClient() {
  if (!isR2Configured()) return null;
  if (client) return client;
  client = new S3Client({
    region: env("R2_REGION", "auto"),
    endpoint: getEndpoint(),
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  });
  return client;
}

export function contentTypeFor(ext) {
  const map = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".avif": "image/avif",
    ".mp4": "video/mp4",
    ".pdf": "application/pdf",
  };
  return map[String(ext || "").toLowerCase()] || "application/octet-stream";
}

export async function uploadObject({ key, body, contentType, cacheControl }) {
  if (!isR2Configured()) throw new Error("R2 chưa cấu hình (thiếu env)");
  const s3 = getClient();
  const result = await s3.send(
    new PutObjectCommand({
      Bucket: env("R2_BUCKET_NAME"),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: cacheControl || "public, max-age=31536000, immutable",
    }),
  );
  const url = getPublicUrl(key);
  if (!url) throw new Error("Thiếu R2_PUBLIC_URL");
  return { key, url, bucket: env("R2_BUCKET_NAME"), etag: result.ETag || null };
}

export async function deleteObject(key) {
  if (!key || !isR2Configured()) return { ok: false, skipped: true };
  const s3 = getClient();
  await s3.send(new DeleteObjectCommand({ Bucket: env("R2_BUCKET_NAME"), Key: key }));
  return { ok: true };
}

export async function healthR2() {
  if (!isR2Configured()) {
    return {
      ok: false,
      configured: false,
      error: "Thiếu R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME / R2_PUBLIC_URL",
    };
  }
  return { ok: true, configured: true, bucket: env("R2_BUCKET_NAME"), publicUrl: env("R2_PUBLIC_URL") };
}

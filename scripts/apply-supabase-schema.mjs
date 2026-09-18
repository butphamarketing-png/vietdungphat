import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ref = new URL(url).hostname.split(".")[0];
const sql = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");

async function run(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  let json = text;
  try {
    json = JSON.parse(text);
  } catch {
    /* keep text */
  }
  return { status: res.status, json };
}

const probe = await run("select 1 as ok");
console.log("probe", probe.status, JSON.stringify(probe.json).slice(0, 400));
if (probe.status >= 200 && probe.status < 300) {
  const applied = await run(sql);
  console.log("schema", applied.status, JSON.stringify(applied.json).slice(0, 800));
}

const client = createClient(url, key, { auth: { persistSession: false } });
const { error } = await client.from("cms_docs").select("key").limit(1);
console.log("cms_docs", error ? error.message : "ok");

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "media";
const existing = await client.storage.getBucket(bucket);
if (existing.error) {
  const created = await client.storage.createBucket(bucket, { public: true, fileSizeLimit: 12 * 1024 * 1024 });
  console.log("storage bucket", created.error ? created.error.message : `created ${bucket}`);
} else {
  console.log("storage bucket", bucket, "ok");
}

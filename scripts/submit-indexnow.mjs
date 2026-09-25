import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const host = "https://www.vietdungphat.com";
const keyPath = join(root, "public", "indexnow-key.txt");

let key = existsSync(keyPath) ? readFileSync(keyPath, "utf8").trim() : "";
if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
  key = randomBytes(16).toString("hex");
  writeFileSync(keyPath, key);
  writeFileSync(join(root, "public", `${key}.txt`), key);
}

const sitemap = readFileSync(join(root, "public", "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const batch = urls.slice(0, 10000);

const body = {
  host: "www.vietdungphat.com",
  key,
  keyLocation: `${host}/${key}.txt`,
  urlList: batch,
};

const endpoints = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];

const results = [];
for (const endpoint of endpoints) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    results.push({ endpoint, status: res.status, ok: res.ok || res.status === 202 });
  } catch (error) {
    results.push({ endpoint, error: error.message });
  }
}

console.log(
  JSON.stringify(
    {
      key,
      keyFile: `/${key}.txt`,
      submitted: batch.length,
      results,
    },
    null,
    2,
  ),
);

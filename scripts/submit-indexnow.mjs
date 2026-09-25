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
}
writeFileSync(join(root, "public", `${key}.txt`), key);

const sitemap = readFileSync(join(root, "public", "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const endpoints = ["https://api.indexnow.org/indexnow", "https://www.bing.com/indexnow"];
const chunkSize = 100;
const results = [];

for (let i = 0; i < urls.length; i += chunkSize) {
  const urlList = urls.slice(i, i + chunkSize);
  const body = {
    host: "www.vietdungphat.com",
    key,
    keyLocation: `${host}/${key}.txt`,
    urlList,
  };
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
      });
      results.push({ endpoint, chunk: i / chunkSize + 1, status: res.status, ok: res.ok || res.status === 202 });
    } catch (error) {
      results.push({ endpoint, chunk: i / chunkSize + 1, error: error.message });
    }
  }
}

console.log(JSON.stringify({ key, keyFile: `/${key}.txt`, submitted: urls.length, results }, null, 2));

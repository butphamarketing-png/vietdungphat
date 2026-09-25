import { writeFileSync } from "node:fs";
import data from "../src/data/content.json" with { type: "json" };
import keywordNews from "../src/data/keyword-news.json" with { type: "json" };
import { KEYWORDS, keywordNewsPath } from "../src/data/keywords.js";
import { HOUSE_STYLE_MEDIA } from "../src/lib/house-style-media.js";

const host = "https://www.vietdungphat.com";
const today = new Date().toISOString().slice(0, 10);

const urls = [
  "/",
  "/gioi-thieu",
  "/dich-vu",
  "/mau-nha",
  "/album",
  "/san-pham",
  "/bao-gia",
  "/thuoc-lo-ban",
  "/tin-tuc",
  "/lien-he",
  "/tu-khoa",
];

for (const style of HOUSE_STYLE_MEDIA) {
  if (style?.slug) urls.push(`/${style.slug}`);
}
for (const k of KEYWORDS) urls.push(keywordNewsPath(k));
for (const p of [...data.projects, ...data.products, ...data.services, ...data.news, ...data.extras, ...keywordNews]) {
  if (p?.slug) urls.push(`/${p.slug}`);
}

const uniq = [...new Set(urls)];

function entry(path, { priority = "0.7", freq = "weekly" } = {}) {
  const loc = `${host}${path.split("/").map((seg) => encodeURIComponent(seg)).join("/")}`;
  return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`;
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniq
  .map((u) => {
    if (u === "/") return entry(u, { priority: "1.0", freq: "daily" });
    if (["/mau-nha", "/san-pham", "/dich-vu", "/tin-tuc", "/bao-gia", "/album"].includes(u)) {
      return entry(u, { priority: "0.9", freq: "weekly" });
    }
    if (HOUSE_STYLE_MEDIA.some((s) => `/${s.slug}` === u)) {
      return entry(u, { priority: "0.85", freq: "weekly" });
    }
    return entry(u);
  })
  .join("\n")}
</urlset>
`;

writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log("sitemap urls", uniq.length, "lastmod", today);

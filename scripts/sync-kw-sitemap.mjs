import { readFileSync, writeFileSync } from "node:fs";
import { KEYWORDS, keywordNewsPath } from "../src/data/keywords.js";
import keywordNews from "../src/data/keyword-news.json" with { type: "json" };

const host = "https://www.vietdungphat.com";
const newsSlugs = new Set(keywordNews.map((p) => p.slug));
const xml = readFileSync(new URL("../public/sitemap.xml", import.meta.url), "utf8");
const kept = xml.split(/\r?\n/).filter((l) => {
  if (!l.includes("<loc>")) return false;
  if (l.includes("/tu-khoa")) return false;
  const m = l.match(/vietdungphat\.com\/([^<]+)/);
  if (m && newsSlugs.has(m[1])) return false;
  return true;
});
const extra = [
  `  <url><loc>${host}/tu-khoa</loc></url>`,
  ...KEYWORDS.map((k) => `  <url><loc>${host}${keywordNewsPath(k)}</loc></url>`),
  ...keywordNews.map((p) => `  <url><loc>${host}/${p.slug}</loc></url>`),
];
writeFileSync(
  new URL("../public/sitemap.xml", import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...kept, ...extra].join("\n")}
</urlset>
`,
);
console.log("kept", kept.length, "keyword hub", 1, "news paths", KEYWORDS.length, "news posts", keywordNews.length);

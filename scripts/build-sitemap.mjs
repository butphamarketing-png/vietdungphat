import { writeFileSync } from "node:fs";
import data from "../src/data/content.json" with { type: "json" };
import keywordNews from "../src/data/keyword-news.json" with { type: "json" };
import { KEYWORDS, keywordNewsPath } from "../src/data/keywords.js";

const host = "https://www.vietdungphat.com";
const urls = ["/", "/gioi-thieu", "/dich-vu", "/mau-nha", "/san-pham", "/bao-gia", "/thuoc-lo-ban", "/tin-tuc", "/lien-he", "/tu-khoa"];
for (const k of KEYWORDS) urls.push(`/tu-khoa/${k.slug}`, keywordNewsPath(k));
for (const p of [...data.projects, ...data.products, ...data.services, ...data.news, ...keywordNews]) {
  if (p.slug) urls.push(`/${p.slug}`);
}
const uniq = [...new Set(urls)];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniq.map((u) => `  <url><loc>${host}${u.split("/").map((seg) => encodeURIComponent(seg)).join("/")}</loc></url>`).join("\n")}
</urlset>
`;
writeFileSync(new URL("../public/sitemap.xml", import.meta.url), xml);
console.log("sitemap urls", uniq.length);

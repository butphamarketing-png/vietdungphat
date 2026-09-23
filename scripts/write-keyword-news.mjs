import { writeFileSync } from "node:fs";
import data from "../src/data/content.json" with { type: "json" };
import articles from "../src/data/keyword-articles.json" with { type: "json" };
import { KEYWORDS, keywordNewsSlug } from "../src/data/keywords.js";

const reserved = new Set([
  "gioi-thieu",
  "du-an",
  "mau-nha",
  "san-pham",
  "dich-vu",
  "bao-gia",
  "thuoc-lo-ban",
  "tin-tuc",
  "lien-he",
  "tu-khoa",
  "adminbp",
  "api",
  "assets",
  "files",
  "studio",
]);
for (const kind of ["projects", "products", "services", "news", "extras"]) {
  for (const p of data[kind] || []) if (p?.slug) reserved.add(p.slug);
}

function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function newsSlug(item) {
  const slug = keywordNewsSlug(item);
  return reserved.has(slug) ? `tin-${item.slug}` : slug;
}

function dateOf(i) {
  const d = new Date(Date.UTC(2026, 8, 20));
  d.setUTCDate(d.getUTCDate() - i);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

function seoTitleOf(kw) {
  const head = cap(kw);
  const options = [
    `${head}: nên chọn nhà uy tín 2026`,
    `${head}: nên làm, giá uy tín 2026`,
    `${head}: nên làm uy tín 2026`,
    `${head}: nên uy tín 2026`,
    `${head} — nên uy tín 2026`,
  ];
  const hasKw = (t) => t.toLowerCase().includes(kw.toLowerCase());
  const inHalf = (t) => t.slice(0, Math.ceil(t.length / 2)).toLowerCase().includes(kw.toLowerCase());
  const fit = options.filter((t) => t.length <= 60 && hasKw(t));
  return fit.find(inHalf) || fit[0] || head.slice(0, 60);
}

function seoDescOf(kw) {
  const head = cap(kw);
  return `${head} — khảo sát, thiết kế, báo giá minh bạch 2026 tại Việt Dũng Phát. Tham khảo phần thô 3.950.000đ/m², trọn gói 5.950.000đ/m².`.slice(0, 158);
}

const posts = KEYWORDS.map((item, index) => {
  const slug = newsSlug(item);
  const html = articles[item.slug];
  if (!html) throw new Error(`Missing article HTML for ${item.slug}`);
  const seoTitle = seoTitleOf(item.phrase);
  const title = seoTitle;
  const desc = seoDescOf(item.phrase);
  const related = KEYWORDS.filter((k) => k.group === item.group && k.slug !== item.slug)
    .slice(0, 2)
    .map((k) => k.phrase)
    .join(", ");
  return {
    slug,
    keywordSlug: item.slug,
    source: "keyword",
    group: item.group,
    title,
    image: item.image,
    imageAlt: item.phrase,
    date: dateOf(index),
    html,
    gallery: [],
    seoKeyword: item.phrase,
    seoKeywords: related,
    seoTitle,
    seoDesc: desc,
    desc,
    faqs: item.faqs,
  };
});

writeFileSync(new URL("../src/data/keyword-news.json", import.meta.url), JSON.stringify(posts));
const words = posts.map((p) => p.html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length);
const slugs = posts.map((p) => p.slug);
const dup = slugs.filter((s, i) => slugs.indexOf(s) !== i);
console.log({
  posts: posts.length,
  minWords: Math.min(...words),
  maxWords: Math.max(...words),
  prefixed: posts.filter((p) => p.slug !== p.keywordSlug).map((p) => p.slug),
  dup,
});

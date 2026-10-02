import { writeFileSync } from "node:fs";
import data from "../src/data/content.json" with { type: "json" };
import articles from "../src/data/keyword-articles.json" with { type: "json" };
import { KEYWORDS, keywordNewsSlug } from "../src/data/keywords.js";
import { exactKeywordTitle, locationMeta } from "./location-articles.mjs";

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

function seoDescOf(kw, html) {
  const head = cap(kw);
  const first = String(html || "")
    .replace(/<nav[\s\S]*?<\/nav>/i, " ")
    .match(/<p>([\s\S]*?)<\/p>/i);
  let text = first ? first[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";
  if (!text.toLowerCase().includes(kw.toLowerCase())) text = `${head} — ${text}`;
  if (text.length > 158) {
    const cut = text.slice(0, 158);
    const sp = cut.lastIndexOf(" ");
    text = (sp > 80 ? cut.slice(0, sp) : cut).trim();
  }
  if (!text.toLowerCase().includes(kw.toLowerCase())) text = head.slice(0, 158);
  return text;
}

const posts = KEYWORDS.map((item, index) => {
  const slug = newsSlug(item);
  const html = articles[item.slug];
  if (!html) throw new Error(`Missing article HTML for ${item.slug}`);
  const area = item.group === "dong-nam" ? locationMeta(item) : null;
  const seoTitle = area?.title || exactKeywordTitle(item.phrase);
  const title = seoTitle;
  const desc = area?.desc || seoDescOf(item.phrase, html);
  const related = area?.keywords || KEYWORDS.filter((k) => k.group === item.group && k.slug !== item.slug)
    .slice(0, 2)
    .map((k) => k.phrase)
    .join(", ");
  return {
    slug,
    keywordSlug: item.slug,
    source: "keyword",
    group: item.group,
    title,
    image: area?.image || item.image,
    imageAlt: item.phrase,
    date: dateOf(index),
    html,
    gallery: [],
    seoKeyword: item.phrase,
    seoKeywords: related,
    seoTitle,
    seoDesc: desc,
    desc,
    faqs: area?.faqs || item.faqs,
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

import articles from "../src/data/keyword-articles.json" with { type: "json" };
import { KEYWORDS } from "../src/data/keywords.js";

const keys = Object.keys(articles);
const missing = KEYWORDS.filter((k) => !articles[k.slug]).map((k) => k.slug);
const extra = keys.filter((s) => !KEYWORDS.some((k) => k.slug === s));
const stats = KEYWORDS.map((k) => {
  const html = articles[k.slug] || "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/).length;
  const re = new RegExp(k.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const hits = text.match(re)?.length || 0;
  const dens = ((hits * k.phrase.split(/\s+/).length) / words) * 100;
  const imgs = (html.match(/<img /g) || []).length;
  const h2 = (html.match(/<h2 /g) || []).length;
  return { slug: k.slug, words, hits, dens: dens.toFixed(2), imgs, h2 };
});
const dens = stats.map((s) => Number(s.dens));
console.log({
  articles: keys.length,
  keywords: KEYWORDS.length,
  missing,
  extra,
  minWords: Math.min(...stats.map((s) => s.words)),
  maxWords: Math.max(...stats.map((s) => s.words)),
  minHits: Math.min(...stats.map((s) => s.hits)),
  maxHits: Math.max(...stats.map((s) => s.hits)),
  minDens: Math.min(...dens),
  maxDens: Math.max(...dens),
  imgs: stats[0].imgs,
  h2: stats[0].h2,
});

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

const TITLE = [
  (kw) => `${cap(kw)}: kinh nghiệm gia chủ TP.HCM 2026`,
  (kw) => `${cap(kw)} — checklist trước khi chọn nhà thầu`,
  (kw) => `Cập nhật ${kw}: quy trình, chi phí và lưu ý`,
  (kw) => `${cap(kw)}: sai lầm hay gặp và cách xử lý`,
  (kw) => `Gia chủ hỏi gì khi tìm ${kw}?`,
];

const posts = KEYWORDS.map((item, index) => {
  const slug = newsSlug(item);
  const html = articles[item.slug];
  if (!html) throw new Error(`Missing article HTML for ${item.slug}`);
  const title = TITLE[index % TITLE.length](item.phrase);
  const seoTitle = /việt dũng phát/i.test(title) ? title : `${title} | Việt Dũng Phát`;
  const desc = `${cap(item.phrase)} — kinh nghiệm, quy trình và chi phí tham khảo 2026 tại Việt Dũng Phát (phần thô 3.950.000đ/m², trọn gói 5.950.000đ/m²).`.slice(0, 158);
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

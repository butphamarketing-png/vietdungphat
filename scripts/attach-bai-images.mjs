import { existsSync, writeFileSync } from "node:fs";
import articles from "../src/data/keyword-articles.json" with { type: "json" };
import posts from "../src/data/keyword-news.json" with { type: "json" };
import { KEYWORDS } from "../src/data/keywords.js";

const OUT = new URL("../public/bai/", import.meta.url);

const SLUGS = [
  "thiet-ke-nha-tan-co-dien",
  "xay-nha-tan-co-dien-tphcm",
  "biet-thu-tan-co-dien-tphcm",
  "nha-pho-tan-co-dien",
  "thi-cong-biet-thu-tan-co-dien",
  "mat-tien-nha-pho-tan-co-dien",
  "noi-that-tan-co-dien-tphcm",
  "mau-biet-thu-tan-co-dien-2026",
  "cai-tao-nha-tan-co-dien",
  "biet-thu-mai-mansard",
  "nha-pho-1-tret-2-lau-tan-co-dien",
  "biet-thu-tan-co-dien-mai-thai",
  "thiet-ke-biet-thu-tan-co-dien-2-tang",
  "biet-thu-tan-co-dien-san-vuon",
  "thiet-ke-nha-pho-tphcm",
  "thiet-ke-biet-thu-tphcm",
  "thiet-ke-nha-ong-hep",
  "thiet-ke-nha-5x20",
  "thiet-ke-nha-4x16",
  "thiet-ke-nha-2-mat-tien",
  "thiet-ke-mat-tien-nha-pho",
  "phoi-canh-3d-nha-pho",
  "thiet-ke-nha-1-tret-1-lau",
  "thiet-ke-nha-3-tang-tphcm",
  "xay-nha-tron-goi-tphcm",
  "thi-cong-nha-pho-tphcm",
  "thi-cong-biet-thu-tphcm",
  "xay-biet-thu-san-vuon",
  "noi-that-biet-thu-tan-co-dien",
  "thiet-ke-noi-that-biet-thu",
];

const phraseOf = Object.fromEntries(KEYWORDS.map((k) => [k.slug, k.phrase]));
const missingFiles = [];

function withImages(html, slug, phrase) {
  let out = String(html || "").replace(/<p><img\b[\s\S]*?<\/p>\s*/g, "");
  const alts = [
    phrase,
    `${phrase} — mặt tiền`,
    `${phrase} — không gian trong nhà`,
    `${phrase} — chi tiết công trình`,
    `${phrase} — hoàn thiện`,
  ];
  const ids = ["ky-thuat", "phu-hop", "quy-trinh", "chi-phi", "luu-y"];
  ids.forEach((id, i) => {
    const tag = `<p><img src="/bai/${slug}-${i + 1}.png" alt="${alts[i]}" /></p>\n`;
    const start = out.indexOf(`id="${id}"`);
    const hEnd = start === -1 ? -1 : out.indexOf("</h2>", start);
    if (hEnd === -1) out += tag;
    else out = `${out.slice(0, hEnd + 5)}\n${tag}${out.slice(hEnd + 5)}`;
  });
  return out;
}

for (const slug of SLUGS) {
  if (!phraseOf[slug]) throw new Error(`Unknown slug ${slug}`);
  for (let n = 1; n <= 5; n++) {
    const file = new URL(`${slug}-${n}.png`, OUT);
    if (!existsSync(file)) missingFiles.push(`${slug}-${n}.png`);
  }
  articles[slug] = withImages(articles[slug], slug, phraseOf[slug]);
}

const nextPosts = posts.map((post) => {
  if (!SLUGS.includes(post.keywordSlug)) return post;
  const phrase = phraseOf[post.keywordSlug];
  return {
    ...post,
    image: `/bai/${post.keywordSlug}-1.png`,
    imageAlt: phrase,
    html: withImages(post.html, post.keywordSlug, phrase),
  };
});

writeFileSync(new URL("../src/data/keyword-articles.json", import.meta.url), JSON.stringify(articles));
writeFileSync(new URL("../src/data/keyword-news.json", import.meta.url), JSON.stringify(nextPosts));

const counts = SLUGS.map((slug) => ({
  slug,
  imgs: (articles[slug].match(/<img\b/g) || []).length,
}));
console.log(JSON.stringify({
  missingFiles,
  bad: counts.filter((c) => c.imgs < 5),
  postsUpdated: nextPosts.filter((p) => SLUGS.includes(p.keywordSlug) && (p.html.match(/<img\b/g) || []).length >= 5).length,
}, null, 2));

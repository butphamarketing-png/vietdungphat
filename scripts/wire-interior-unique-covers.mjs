import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { isWorkshopProduct } from "../src/lib/studio.js";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assets = "C:\\Users\\Admin\\.cursor\\projects\\c-Users-Admin-Desktop-Vi-t-D-ng-Ph-t\\assets";
const interiorDir = join(root, "public", "interior");
const baiDir = join(root, "public", "bai");
mkdirSync(interiorDir, { recursive: true });
mkdirSync(baiDir, { recursive: true });

const contentPath = join(root, "src", "data", "content.json");
const newsPath = join(root, "src", "data", "keyword-news.json");
const content = JSON.parse(readFileSync(contentPath, "utf8"));
const news = JSON.parse(readFileSync(newsPath, "utf8"));

const productSlugs = content.products.filter(isWorkshopProduct).map((p) => p.slug);
let copiedProducts = 0;
let missingProducts = [];
for (const slug of productSlugs) {
  const src = join(assets, `${slug}.png`);
  if (!existsSync(src)) {
    missingProducts.push(slug);
    continue;
  }
  copyFileSync(src, join(interiorDir, `${slug}.png`));
  copiedProducts++;
}

for (const p of content.products) {
  if (!isWorkshopProduct(p)) continue;
  const local = `/interior/${p.slug}.png`;
  if (existsSync(join(interiorDir, `${p.slug}.png`))) {
    p.image = local;
    p.imageAlt = p.imageAlt || p.title;
  }
}
writeFileSync(contentPath, JSON.stringify(content));

const newsCovers = [
  "cai-tao-noi-that-nha-pho",
  "thiet-ke-noi-that-nha-pho",
  "thi-cong-noi-that-tron-goi-tphcm",
  "xuong-noi-that-thu-duc",
  "dong-do-go-theo-yeu-cau",
  "combo-noi-that-can-ho",
  "thi-cong-noi-that-nha-pho",
  "noi-that-phong-khach-tan-co-dien",
  "san-xuat-noi-that-theo-ban-ve",
];

let copiedNews = 0;
let missingNews = [];
for (const slug of newsCovers) {
  const src = join(assets, `${slug}-1.png`);
  if (!existsSync(src)) {
    missingNews.push(slug);
    continue;
  }
  copyFileSync(src, join(baiDir, `${slug}-1.png`));
  copiedNews++;
}

const nextNews = news.map((post) => {
  const slug = post.keywordSlug;
  if (!newsCovers.includes(slug)) return post;
  if (!existsSync(join(baiDir, `${slug}-1.png`))) return post;
  return {
    ...post,
    image: `/bai/${slug}-1.png`,
    imageAlt: post.imageAlt || post.title || slug,
  };
});
writeFileSync(newsPath, JSON.stringify(nextNews));

// uniqueness check
const imgs = {};
for (const p of content.products.filter(isWorkshopProduct)) {
  imgs[p.image] = (imgs[p.image] || 0) + 1;
}
const reused = Object.entries(imgs).filter(([, n]) => n > 1);

console.log(
  JSON.stringify(
    {
      copiedProducts,
      missingProducts,
      uniqueCovers: Object.keys(imgs).length,
      reused,
      copiedNews,
      missingNews,
      newsUpdated: nextNews.filter((p) => newsCovers.includes(p.keywordSlug) && String(p.image).startsWith("/bai/")).length,
    },
    null,
    2,
  ),
);

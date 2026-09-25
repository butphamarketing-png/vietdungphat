import { createRequire } from "node:module";
import { productCover, isWorkshopProduct } from "../src/lib/studio.js";

const require = createRequire(import.meta.url);
const data = require("../src/data/content.json");
const posts = require("../src/data/keyword-news.json");

const workshop = data.products.filter(isWorkshopProduct);
console.log("workshop products:", workshop.length);
const imgs = {};
for (const p of workshop) {
  const img = productCover(p);
  imgs[img] = (imgs[img] || 0) + 1;
  console.log(`${p.slug} -> ${img}`);
}
console.log("\nproduct cover reuse:");
for (const [k, v] of Object.entries(imgs).sort((a, b) => b[1] - a[1])) {
  console.log(`${v}x ${k}`);
}

const nt = posts.filter((p) =>
  /noi-that|nội thất|combo|tủ quần|kệ tivi|giường|interior/i.test(
    `${p.keywordSlug || ""} ${p.title || ""} ${p.image || ""}`,
  ),
);
console.log("\nkeyword news interior-ish:", nt.length);
const nImgs = {};
for (const p of nt) {
  nImgs[p.image] = (nImgs[p.image] || 0) + 1;
  console.log(`${p.keywordSlug || p.slug} | ${p.image}`);
}
console.log("\nnews cover reuse:");
for (const [k, v] of Object.entries(nImgs).sort((a, b) => b[1] - a[1])) {
  console.log(`${v}x ${k}`);
}

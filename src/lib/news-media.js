import nhatSamples from "../data/nha-mai-nhat-samples.json";
import tanSamples from "../data/nha-tan-co-dien-samples.json";

const SKIP_THUMB = new Set([
  "/mau-nha/nhat/06/01.jpg",
  "/mau-nha/nhat/08/01.jpg",
  "/mau-nha/tan/02/01.jpg",
  "/mau-nha/tan/04/01.jpg",
  "/mau-nha/tan/11/01.jpg",
]);

function samplePhotos(samples) {
  const covers = samples.map((item) => item.cover).filter((src) => !SKIP_THUMB.has(src));
  const rest = samples.flatMap((item) => item.images).filter((src) => !SKIP_THUMB.has(src) && !covers.includes(src));
  return [...covers, ...rest];
}

const NHAT = samplePhotos(nhatSamples);
const TAN = samplePhotos(tanSamples);
const HOUSE = [...TAN.slice(0, 13), ...NHAT.slice(0, 13), ...TAN.slice(13), ...NHAT.slice(13)];

const GROUP_POOLS = {
  "xay-dung": HOUSE,
  "tan-co-dien": TAN,
  "thiet-ke": HOUSE,
  "cai-tao": HOUSE,
  "noi-that": HOUSE,
  "bao-gia": HOUSE,
  "khu-vuc": HOUSE,
  "dong-nam": HOUSE,
  "phong-thuy": HOUSE,
  "thuong-hieu": HOUSE,
};

const HOME_NEWS = [
  "xay-nha-tron-goi-tphcm",
  "thiet-ke-nha-tan-co-dien",
  "thiet-ke-noi-that-nha-pho",
];

function keepNewsPhoto(src = "") {
  const url = String(src);
  if (url.startsWith("/mau-nha/nhat/") || url.startsWith("/mau-nha/tan/")) return true;
  return /supabase\.co|r2\.dev|cloudflarestorage/i.test(url);
}

function hashPick(pool, key) {
  const list = pool?.length ? pool : HOUSE;
  let h = 0;
  for (const ch of String(key)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}

function topicPool(item = {}) {
  const hay = `${item.slug || ""} ${item.title || ""} ${item.seoKeyword || ""} ${item.group || ""}`.toLowerCase();
  if (/tân cổ|cổ điển|mansard/.test(hay) || item.group === "tan-co-dien") return TAN;
  if (/mái nhật|mai nhat/.test(hay)) return NHAT;
  if (GROUP_POOLS[item.group]) return GROUP_POOLS[item.group];
  return HOUSE;
}

export function newsCover(item = {}) {
  if (keepNewsPhoto(item.image)) return item.image;
  return hashPick(topicPool(item), item.slug || item.title || "");
}

export function withNewsCovers(list = []) {
  return list.map((item) => ({ ...item, image: newsCover(item) }));
}

export function homeNewsCards(list = []) {
  const bySlug = new Map(list.map((p) => [p.slug, p]));
  const out = [];
  const usedImg = new Set();
  for (const slug of HOME_NEWS) {
    const p = bySlug.get(slug);
    if (!p || usedImg.has(p.image)) continue;
    usedImg.add(p.image);
    out.push(p);
  }
  for (const p of list) {
    if (out.length >= 3) break;
    if (out.some((x) => x.slug === p.slug)) continue;
    const image = newsCover(p);
    if (usedImg.has(image)) continue;
    usedImg.add(image);
    out.push({ ...p, image });
  }
  return out.slice(0, 3);
}

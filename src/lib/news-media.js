import { villaSrcs } from "./studio.js";

const IMG = {
  tronGoi: "/news/news-tron-goi.jpg",
  phanTho: "/news/news-phan-tho.jpg",
  thietKe: "/news/news-thiet-ke.jpg",
  caiTao: "/news/news-cai-tao.jpg",
  phongThuy: "/news/news-phong-thuy.jpg",
  baoGia: "/news/news-bao-gia.jpg",
  mansard: "/villas/villa-mansard-rong.jpg",
  thai: "/villas/villa-goc-lon.jpg",
  pho4: "/villas/villa-cong-lon.jpg",
  living: "/interior/noi-that-tan-co-dien.jpg",
  combo: "/interior/combo-can-ho.jpg",
  wardrobe: "/interior/tu-quan-ao.jpg",
};

const GROUP_POOLS = {
  "xay-dung": [IMG.tronGoi, IMG.phanTho, ...villaSrcs],
  "tan-co-dien": villaSrcs,
  "thiet-ke": [IMG.thietKe, ...villaSrcs],
  "cai-tao": [IMG.caiTao, IMG.phanTho, ...villaSrcs],
  "noi-that": [IMG.living, IMG.combo, IMG.wardrobe],
  "bao-gia": [IMG.baoGia, IMG.thietKe, ...villaSrcs.slice(0, 6)],
  "khu-vuc": [IMG.tronGoi, IMG.phanTho, ...villaSrcs],
  "phong-thuy": [IMG.phongThuy, IMG.thietKe, IMG.baoGia],
  "thuong-hieu": villaSrcs,
};

const HOME_NEWS = [
  { slug: "xay-nha-tron-goi-tphcm", image: IMG.tronGoi },
  { slug: "thiet-ke-nha-tan-co-dien", image: IMG.thietKe },
  { slug: "thiet-ke-noi-that-nha-pho", image: IMG.living },
];

function keepNewsPhoto(src = "") {
  const url = String(src);
  if (url.startsWith("/news/") || url.startsWith("/interior/") || url.startsWith("/villas/") || url.startsWith("/media/")) return true;
  return /supabase\.co|r2\.dev|cloudflarestorage/i.test(url);
}

function hashPick(pool, key) {
  const list = pool?.length ? pool : [IMG.tronGoi];
  let h = 0;
  for (const ch of String(key)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}

function topicPool(item = {}) {
  const hay = `${item.slug || ""} ${item.title || ""} ${item.seoKeyword || ""} ${item.group || ""}`.toLowerCase();
  if (/lỗ ban|lo-ban|phong thủy|xin phép|cấp phép|tuổi xây/.test(hay)) return GROUP_POOLS["phong-thuy"];
  if (/phần thô/.test(hay)) return [IMG.phanTho];
  if (/chìa khóa|trọn gói/.test(hay) && !/nội thất/.test(hay)) return [IMG.tronGoi];
  if (/nội thất|combo|tủ quần|kệ tivi/.test(hay)) return GROUP_POOLS["noi-that"];
  if (/cải tạo|sửa nhà|nâng tầng|chống thấm/.test(hay)) return GROUP_POOLS["cai-tao"];
  if (/báo giá|đơn giá|giá xây/.test(hay) || item.group === "bao-gia") return GROUP_POOLS["bao-gia"];
  if (/thiết kế|hồ sơ|phối cảnh|kiến trúc/.test(hay)) return GROUP_POOLS["thiet-ke"];
  if (/tân cổ|cổ điển|mansard/.test(hay)) return GROUP_POOLS["tan-co-dien"];
  if (GROUP_POOLS[item.group]) return GROUP_POOLS[item.group];
  return GROUP_POOLS["xay-dung"];
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
  for (const row of HOME_NEWS) {
    const p = bySlug.get(row.slug);
    if (!p) continue;
    usedImg.add(row.image);
    out.push({ ...p, image: row.image });
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

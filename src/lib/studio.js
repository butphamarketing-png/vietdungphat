export const studio = [
  { src: "/villas/villa-mansard-rong.jpg", title: "Biệt thự tân cổ điển mái mansard" },
  { src: "/villas/villa-goc-lon.jpg", title: "Biệt thự tân cổ điển góc sân vườn" },
  { src: "/villas/villa-cong-lon.jpg", title: "Biệt thự tân cổ điển mặt tiền rộng" },
];

function houseKey(src) {
  const file = String(src || "")
    .split("/")
    .pop()
    .replace(/\.\w+$/, "");
  const n = Number.parseInt(file, 10);
  if (n >= 1 && n <= 6) return "thai";
  if (n >= 7 && n <= 11) return "mansard";
  if (n >= 12 && n <= 14) return "pho4";
  return String(src || file);
}

export function uniqueHouses(list = studio) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const src = item.src || item.image;
    const key = houseKey(src);
    if (!src || seen.has(key)) continue;
    seen.add(key);
    out.push({
      src,
      title: item.title || "Mẫu nhà tân cổ điển",
      slug: item.slug || "/mau-nha",
    });
  }
  return out;
}

export function homeNeoCards() {
  return uniqueHouses(studio);
}

export function preferNeoClassic(list = []) {
  const neo = [];
  const rest = [];
  for (const item of list) {
    (/tân cổ|cổ điển|mansard/i.test(`${item.title || ""} ${item.image || ""}`) ? neo : rest).push(item);
  }
  return [...neo, ...rest];
}

const INTERIOR = {
  living: "/interior/noi-that-tan-co-dien.jpg",
  combo: "/interior/combo-can-ho.jpg",
  wardrobe: "/interior/tu-quan-ao.jpg",
  tv: "/interior/ke-tivi.jpg",
};

const HOME_WORKSHOP_SLUGS = [
  "noi-that-tan-co-dien",
  "combo-tron-goi-noi-that",
  "combo-noi-that-danh-cho-can-ho",
  "tu-quan-ao",
  "ke-tivi",
  "combo-2-phong-ngu-phong-khach",
  "giuong-doi-lon-18",
  "combo-noi-that-indochine",
];

function keepProductPhoto(src = "") {
  const url = String(src);
  if (url.startsWith("/interior/")) return true;
  if (url.startsWith("/media/")) return true;
  return /supabase\.co|r2\.dev|cloudflarestorage/i.test(url);
}

export function isWorkshopProduct(item = {}) {
  return /nội thất|combo|tủ quần|kệ tivi|giường|tab đầu|noi-that|tu-quan|ke-tivi|giuong|tab-dau/i.test(
    `${item.slug || ""} ${item.title || ""}`,
  );
}

export function productCover(item = {}) {
  if (keepProductPhoto(item.image)) return item.image;
  const hay = `${item.slug || ""} ${item.title || ""}`.toLowerCase();
  if (/tu-quan|tủ quần/.test(hay)) return INTERIOR.wardrobe;
  if (/ke-tivi|kệ tivi|tab-dau|tab đầu/.test(hay)) return INTERIOR.tv;
  if (/combo/.test(hay)) return INTERIOR.combo;
  if (/nội thất|noi-that|giường|giuong/.test(hay)) return INTERIOR.living;
  return INTERIOR.combo;
}

export function withProductCovers(list = []) {
  return list.map((item) => ({ ...item, image: productCover(item) }));
}

export function homeWorkshopProducts(list = []) {
  const bySlug = new Map(list.map((p) => [p.slug, p]));
  const out = [];
  const seen = new Set();
  for (const slug of HOME_WORKSHOP_SLUGS) {
    const p = bySlug.get(slug);
    if (!p) continue;
    seen.add(slug);
    out.push({ ...p, image: productCover(p) });
  }
  for (const p of list) {
    if (out.length >= 8) break;
    if (seen.has(p.slug) || !isWorkshopProduct(p)) continue;
    seen.add(p.slug);
    out.push({ ...p, image: productCover(p) });
  }
  return out.slice(0, 8);
}

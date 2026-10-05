import pho from "./nha-pho-samples.json";
import nhat from "./nha-mai-nhat-samples.json";
import tan from "./nha-tan-co-dien-samples.json";

function catalog(slug, title, noun, samples) {
  return {
    slug,
    title,
    noun,
    base: `/${slug}`,
    aliases: [`/mau-nha/${slug}`],
    samples,
    lead: `${samples.length} mẫu ${noun}. Bấm vào từng mẫu để xem toàn bộ ảnh phối cảnh.`,
    cardDesc: `${samples.length} mẫu. Bấm vào để xem từng mẫu và toàn bộ ảnh.`,
  };
}

export const HOUSE_CATALOGS = [
  catalog("nha-pho", "Nhà phố", "nhà phố", pho),
  catalog("nha-mai-nhat", "Nhà mái Nhật", "nhà mái Nhật", nhat),
  catalog("nha-tan-co-dien", "Nhà tân cổ điển", "nhà tân cổ điển", tan),
];

export const MAU_NHA_INTRO =
  "Nhà phố, nhà mái Nhật và nhà tân cổ điển. Bấm vào từng phong cách để xem mẫu và ảnh phối cảnh.";

export function catalogBySlug(slug) {
  return HOUSE_CATALOGS.find((item) => item.slug === slug) || null;
}

export function catalogFromPath(pathname) {
  const path = String(pathname || "").replace(/\/+$/, "") || "/";
  for (const item of HOUSE_CATALOGS) {
    const bases = [item.base, ...(item.aliases || [])];
    for (const base of bases) {
      if (path === base || path.startsWith(`${base}/`)) {
        return { catalog: item, id: path.slice(base.length).replace(/^\//, "") };
      }
    }
  }
  return null;
}

export function findCatalogSample(item, id) {
  return item.samples.find((sample) => sample.id === id) || null;
}

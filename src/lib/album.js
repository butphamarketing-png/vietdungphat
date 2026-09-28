import { uniqueImages } from "./media.js";
import { isHouseStyleSlug } from "./studio.js";

export function youtubeId(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  const m = raw.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|live\/|watch\?(?:.*&)?v=))([A-Za-z0-9_-]{11})/,
  );
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  return "";
}

export function youtubeThumb(id) {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

export const defaultAlbumVideos = [
  { id: "grKoNLjX6tw", title: "Biệt thự tân cổ điển mái Thái 1 trệt 1 lầu, 600m2, 6 phòng ngủ" },
  { id: "iF-EqFl9bjU", title: "Mẫu nhà mái Nhật 1 trệt 2 lầu 8x16m, 4 phòng ngủ" },
  { id: "w9Ei2-P6ZEM", title: "Nhà mái Thái 3 tầng" },
  { id: "tuVU22SpyMY", title: "Mẫu nhà tân cổ điển 1 trệt 1 lầu 5x20m, 3 phòng ngủ" },
  { id: "VmxRi0tVm54", title: "Thiết kế nhà cấp 4 7x12m, 3 phòng ngủ" },
  { id: "QBPXY_3NRjk", title: "Mẫu nhà hiện đại 1 trệt 2 lầu 5x19m, 4 phòng ngủ" },
  { id: "ZyFu2jaZrts", title: "Nhà 1 trệt 3 lầu 5x22m, 5 phòng ngủ" },
  { id: "1QEN1rPh7Ic", title: "Nhà cấp 4 5x30m, 3 phòng ngủ, sân trước rộng" },
  { id: "jsequBt9M8g", title: "Mẫu nhà 1 trệt 2 lầu 4x14m, 4 phòng ngủ" },
  { id: "md3n9_y3rJo", title: "Bố trí công năng nhà cấp 4 7x12m, 3 phòng ngủ" },
  { id: "e_ITM5pwxh8", title: "Mẫu nhà cấp 4 hiện đại" },
];

export function albumVideosFrom(list) {
  const seen = new Set();
  const out = [];
  for (const item of list || []) {
    const id = youtubeId(item.id || item.url || item.src);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, title: item.title || "Video Việt Dũng Phát" });
  }
  return out;
}

function cleanProjectTitle(title) {
  return String(title || "")
    .replace(/^dự\s*án\s*:?\s*/i, "")
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, " – ")
    .trim();
}

function photosFromPost(post) {
  const fromHtml = [...String(post?.html || "").matchAll(/src=(["'])([^"']+)\1/gi)].map((m) => m[2]);
  return uniqueImages([post?.image, ...(post?.gallery || []), ...fromHtml]);
}

function decodeText(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function articleParagraphs(html) {
  const skip = /công ty tnhh|chi nhánh|bài viết liên quan|kha vạn cân|showroom|vinhomes grandpark|nguyễn duy trinh/i;
  const seen = new Set();
  const out = [];
  for (const match of String(html || "").matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = decodeText(match[1]).replace(/\s+/g, " ").trim();
    if (text.length < 24 || skip.test(text)) continue;
    const key = text.slice(0, 90).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out.slice(0, 5);
}

const REGIONS = [
  ["Thủ Đức", /thủ đức/],
  ["Bình Dương", /bình dương|dĩ an/],
  ["Đồng Nai", /đồng nai|biên hòa|bien hoa/],
  ["Bình Thuận", /bình thuận/],
  ["Vũng Tàu", /vũng tàu/],
  ["Long An", /long an/],
  ["Hồ Chí Minh", /hồ chí minh|quận\s*\d|gò vấp|bình thạnh|tp\.?\s*hcm/],
];

export function projectRegion(title) {
  const text = String(title || "").toLowerCase();
  for (const [label, re] of REGIONS) if (re.test(text)) return label;
  return "";
}

export function projectKind(title) {
  const text = String(title || "").toLowerCase();
  if (/biệt thự/.test(text)) return "biet-thu";
  if (/nhà phố/.test(text)) return "nha-pho";
  return "nha-o";
}

function cardTitle(title) {
  const clean = cleanProjectTitle(title);
  const head = clean.split(/\s+[–—]\s+/)[0] || clean;
  const text = head.replace(/^dự\s*án\s*/i, "").trim();
  const letters = text.replace(/[^\p{L}]/gu, "");
  const upper = letters.replace(/[^\p{Lu}]/gu, "");
  if (letters && upper.length / letters.length > 0.55) {
    return text.toLowerCase().replace(/(^|\s)(\p{L})/gu, (_, space, ch) => space + ch.toUpperCase());
  }
  return text;
}

function articleFacts(title, paragraphs) {
  const blob = paragraphs.join(" ");
  const parts = String(title || "").split(/\s+[–—-]\s+/).map((part) => part.trim()).filter(Boolean);
  const area = (blob.match(/diện tích(?:\s+xây dựng)?\s*[:：]?\s*([0-9][0-9.,]*\s*m2)/i) || [])[1] || "";
  const style = (blob.match(/phong cách\s+(.+?)(?=\s+công năng|[.]|$)/i) || [])[1]?.trim() || "";
  return [
    ["Công trình", parts[0] || ""],
    ["Địa điểm", parts.slice(1).join(" – ")],
    ["Diện tích", area.replace(/\s+/g, "")],
    ["Phong cách", style],
  ].filter(([, value]) => String(value || "").trim().length > 1);
}

export function albumProjectsFrom(projects = []) {
  const skip = /phong\s*thủy|kiến\s*thức|động\s*thổ|plaster\s*fun/i;
  const out = [];
  for (const post of projects || []) {
    if (post.houseStyle || isHouseStyleSlug(post.slug)) continue;
    if (skip.test(post.title || "")) continue;
    const photos = photosFromPost(post);
    if (photos.length < 3) continue;
    const title = cleanProjectTitle(post.title) || "Công trình Việt Dũng Phát";
    const paragraphs = articleParagraphs(post.html);
    out.push({
      slug: post.slug,
      title,
      cardTitle: cardTitle(post.title),
      place: projectRegion(post.title),
      kind: projectKind(post.title),
      cover: photos[0],
      photos,
      count: photos.length,
      paragraphs,
      facts: articleFacts(title, paragraphs),
      excerpt: paragraphs[0] || "",
    });
  }
  return out;
}

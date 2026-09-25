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

export function albumProjectsFrom(projects = []) {
  const skip = /phong\s*thủy|kiến\s*thức|động\s*thổ|plaster\s*fun/i;
  const out = [];
  for (const post of projects || []) {
    if (post.houseStyle || isHouseStyleSlug(post.slug)) continue;
    if (skip.test(post.title || "")) continue;
    const photos = photosFromPost(post);
    if (photos.length < 3) continue;
    out.push({
      slug: post.slug,
      title: cleanProjectTitle(post.title) || "Công trình Việt Dũng Phát",
      cover: photos[0],
      photos,
      count: photos.length,
    });
  }
  return out;
}

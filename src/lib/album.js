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
  { id: "8DbWI_IjhqE", title: "Xây dựng Việt Dũng Phát" },
  { id: "PhedKVd8bCs", title: "Cập nhật tiến độ nhà CDT Phạm Hóa" },
  { id: "XST8zPuTlVw", title: "Mẫu biệt thự 1 trệt 1 lầu" },
  { id: "5XfS2AZdewc", title: "Mẫu mặt tiền nhà phố 1 trệt 2 lầu" },
  { id: "AXbRj2tWzMo", title: "Nhà phố 1 trệt 2 lầu, tum thang 5x20m" },
  { id: "8yOI3BC1YHk", title: "Xây tô tường lầu 2, tháo coppha tầng tum" },
  { id: "91iBrK3QcdU", title: "Xây tường trong nhà và đi đường ống điện" },
  { id: "K0hfMwu2zH0", title: "Đổ bê tông dầm sàn mái" },
  { id: "biWXpqykoNw", title: "Tô tường và đi điện công trình Thủ Đức" },
  { id: "16zKdNAVQ74", title: "Xây nhà phố Thủ Đức" },
  { id: "9UnviTDbBGI", title: "Đổ bê tông sàn" },
  { id: "2FwF8up2EYU", title: "Thiết kế thi công nhà phố, villa, biệt thự" },
  { id: "bfUZoH4t0Bg", title: "Nhà phố 1 trệt 1 lầu 5x17" },
  { id: "FHDI5mB2PMg", title: "Nội thất hiện đại Resort Phú Quốc" },
  { id: "3jF-WSWkT3A", title: "Nhà phố hiện đại Anh Hà, Thủ Đức" },
  { id: "oyVotKEDvSU", title: "Công trình 27/08/2023" },
  { id: "YMU7unBNbng", title: "Công trình 09/08/2023" },
  { id: "T4l4_b69PC0", title: "Công trình 21/06/2021" },
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

export const studio = [
  { src: "/studio/08.jpg", title: "Biệt thự tân cổ điển — mặt tiền" },
  { src: "/studio/11.jpg", title: "Biệt thự tân cổ điển — góc phố" },
  { src: "/studio/10.jpg", title: "Biệt thự tân cổ điển — sân thượng" },
  { src: "/studio/07.jpg", title: "Biệt thự tân cổ điển — flycam" },
  { src: "/studio/09.jpg", title: "Biệt thự tân cổ điển — ven kênh" },
  { src: "/studio/01.jpg", title: "Nhà phố tân cổ điển — mặt tiền" },
  { src: "/studio/05.jpg", title: "Nhà phố tân cổ điển — sân trước" },
  { src: "/studio/02.jpg", title: "Nhà phố tân cổ điển — ban công" },
  { src: "/studio/06.jpg", title: "Nhà phố tân cổ điển — mặt đứng" },
  { src: "/studio/03.jpg", title: "Nhà phố tân cổ điển — nhìn cao" },
  { src: "/studio/04.jpg", title: "Nhà phố tân cổ điển — khuôn viên" },
];

export const NEO_PROJECT_SLUGS = [
  "du-an-nha-chi-truong-thi-hong-anh-thi-tran-thuan-nam-huyen-ham-thuan-nam-tinh-binh-thuan",
  "du-an-nha-anh-ho-cong-trang-tp-vung-tau",
  "du-an-nha-anh-hoang-yen-tu-xa-hoa-khanh-huyen-cai-be-tinh-tien-giang",
  "du-an-nha-anh-nguyen-quang-quan-xa-hoa-thang-tp-buon-ma-thuot",
  "du-an-nha-chi-cao-thi-hong-anh-ninh-thua",
  "du-an-nha-chi-nguyen-thi-kim-hong-phu-cat-binh-d",
  "du-an-nha-anh-nguyen-cao-hung-phu-my-hung-quan-7",
  "du-an-nha-anh-doan-van-tu-kien-giang",
  "du-an-chi-tran-thi-thuy-tien-long-an",
  "du-an-nha-chu-nguyen-anh-duy-vung-tau",
  "du-an-nha-anh-tran-phong-hoc-mon-tp-ho-chi-minh",
  "du-an-nha-anh-hoang-son-an-bao-loc-lam-dong",
];

export function homeNeoCards(projects = []) {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const seen = new Set();
  const cards = [];
  function push(src, title, slug) {
    if (!src || seen.has(src)) return;
    seen.add(src);
    cards.push({ src, title, slug: slug || "/mau-nha" });
  }
  for (const item of studio) push(item.src, item.title, "/mau-nha");
  for (const slug of NEO_PROJECT_SLUGS) {
    const post = bySlug.get(slug);
    if (post) push(post.image, post.title, `/${post.slug}`);
  }
  return cards;
}

export function preferNeoClassic(list = []) {
  const neo = [];
  const rest = [];
  for (const item of list) {
    (/tân cổ|cổ điển/i.test(item.title || "") ? neo : rest).push(item);
  }
  return [...neo, ...rest];
}

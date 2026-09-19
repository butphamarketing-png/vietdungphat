export const studio = [
  { src: "/studio/08.jpg", title: "Biệt thự tân cổ điển mái mansard — mặt tiền" },
  { src: "/studio/11.jpg", title: "Biệt thự tân cổ điển — góc 2 mặt tiền" },
  { src: "/studio/10.jpg", title: "Biệt thự tân cổ điển mái mansard — sân thượng" },
  { src: "/studio/09.jpg", title: "Biệt thự tân cổ điển — ven kênh" },
  { src: "/studio/07.jpg", title: "Biệt thự tân cổ điển — flycam" },
  { src: "/studio/05.jpg", title: "Nhà phố tân cổ điển mái Thái — mặt tiền" },
  { src: "/studio/03.jpg", title: "Nhà phố tân cổ điển mái Thái — nhìn từ trên" },
  { src: "/studio/01.jpg", title: "Nhà phố tân cổ điển mái Thái — cổng" },
  { src: "/studio/12.jpg", title: "Nhà phố tân cổ điển 4 tầng — mặt tiền hẹp" },
  { src: "/studio/02.jpg", title: "Nhà phố tân cổ điển mái Thái — ban công" },
  { src: "/studio/06.jpg", title: "Nhà phố tân cổ điển mái Thái — cận mặt đứng" },
  { src: "/studio/04.jpg", title: "Nhà phố tân cổ điển mái Thái — khuôn viên" },
  { src: "/studio/13.jpg", title: "Nhà phố tân cổ điển 4 tầng — nhìn chính diện" },
  { src: "/studio/14.jpg", title: "Nhà phố tân cổ điển 4 tầng — góc đường" },
];

const HOME_NEO = [
  "/studio/08.jpg",
  "/studio/11.jpg",
  "/studio/05.jpg",
  "/studio/12.jpg",
  "/studio/10.jpg",
  "/studio/03.jpg",
  "/studio/09.jpg",
  "/studio/01.jpg",
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

export function homeNeoCards() {
  const bySrc = new Map(studio.map((item) => [item.src, item]));
  return HOME_NEO.map((src) => {
    const item = bySrc.get(src);
    return { src, title: item?.title || "Mẫu nhà tân cổ điển", slug: "/mau-nha" };
  });
}

export function preferNeoClassic(list = []) {
  const neo = [];
  const rest = [];
  for (const item of list) {
    (/tân cổ|cổ điển|mansard/i.test(`${item.title || ""} ${item.image || ""}`) ? neo : rest).push(item);
  }
  return [...neo, ...rest];
}

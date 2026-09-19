function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const GROUPS = [
  {
    id: "xay-dung",
    label: "Xây dựng nhà",
    to: "/xay-dung-nha-tron-goi-tai-ho-chi-minh",
    phrases: [
      "xây nhà trọn gói tphcm",
      "công ty xây dựng nhà ở tphcm",
      "xây nhà phần thô tphcm",
      "xây nhà chìa khóa trao tay",
      "thi công nhà phố tphcm",
      "thi công biệt thự tphcm",
      "xây nhà 1 trệt 1 lầu",
      "xây nhà 1 trệt 2 lầu",
      "xây nhà 3 tầng tphcm",
      "xây nhà 4 tầng tphcm",
      "xây nhà ống tphcm",
      "nhà thầu xây dựng uy tín tphcm",
      "xây nhà không phát sinh",
      "giám sát thi công nhà ở",
      "công ty xây nhà trọn gói tphcm",
      "xây nhà phố 5x20",
      "xây biệt thự sân vườn",
      "thi công nhà ở dân dụng tphcm",
    ],
  },
  {
    id: "tan-co-dien",
    label: "Tân cổ điển",
    to: "/mau-nha",
    phrases: [
      "xây nhà tân cổ điển tphcm",
      "thiết kế nhà tân cổ điển",
      "biệt thự tân cổ điển tphcm",
      "nhà phố tân cổ điển",
      "thi công biệt thự tân cổ điển",
      "mặt tiền nhà phố tân cổ điển",
      "nội thất tân cổ điển tphcm",
      "nhà bán cổ điển tphcm",
      "mẫu biệt thự tân cổ điển",
      "cải tạo nhà tân cổ điển",
      "biệt thự mái mansard",
      "nhà phố 1 trệt 2 lầu tân cổ điển",
    ],
  },
  {
    id: "thiet-ke",
    label: "Thiết kế",
    to: "/thiet-ke-kien-truc-ho-chi-minh",
    phrases: [
      "thiết kế nhà phố tphcm",
      "thiết kế biệt thự tphcm",
      "thiết kế kiến trúc hồ chí minh",
      "kiến trúc sư thiết kế nhà",
      "thiết kế nhà ống hẹp",
      "thiết kế nhà 5x20",
      "thiết kế nhà 4x16",
      "thiết kế nhà 2 mặt tiền",
      "thiết kế mặt tiền nhà phố",
      "hồ sơ thiết kế xin phép xây dựng",
      "công ty kiến trúc tphcm",
      "phối cảnh 3d nhà phố",
      "thiết kế nhà 1 trệt 1 lầu",
      "thiết kế nhà 3 tầng tphcm",
    ],
  },
  {
    id: "cai-tao",
    label: "Cải tạo sửa nhà",
    to: "/bao-gia-sua-chu-nha-tron-goi-2025",
    phrases: [
      "cải tạo nhà phố tphcm",
      "sửa nhà trọn gói tphcm",
      "sửa chữa nhà cũ tphcm",
      "cải tạo nhà cấp 4",
      "nâng tầng nhà phố tphcm",
      "sửa nhà không phá dỡ",
      "cải tạo nội thất nhà phố",
      "chống thấm nhà phố",
      "cải tạo nhà ống cũ",
      "sửa nhà quận gò vấp",
      "sửa nhà quận bình thạnh",
      "cải tạo nhà thủ đức",
      "sửa nhà nâng tầng tphcm",
      "cải tạo mặt tiền nhà phố",
    ],
  },
  {
    id: "noi-that",
    label: "Nội thất",
    to: "/thiet-ke-noi-that-nha-o",
    phrases: [
      "thiết kế nội thất nhà phố",
      "thiết kế nội thất biệt thự",
      "thi công nội thất trọn gói",
      "xưởng nội thất tphcm",
      "đóng đồ gỗ theo yêu cầu",
      "nội thất biệt thự tân cổ điển",
      "combo nội thất căn hộ",
      "thi công nội thất nhà phố",
      "nội thất phòng khách tân cổ điển",
      "sản xuất nội thất theo bản vẽ",
    ],
  },
  {
    id: "bao-gia",
    label: "Báo giá",
    to: "/bao-gia",
    phrases: [
      "báo giá xây nhà trọn gói 2026",
      "đơn giá xây dựng nhà phố tphcm",
      "giá xây nhà phần thô 3.950.000",
      "giá xây nhà trọn gói 5.950.000",
      "giá xây nhà hoàn thiện m2",
      "báo giá thiết kế nhà phố",
      "báo giá cải tạo nhà tphcm",
      "chi phí xây nhà 100m2",
      "chi phí xây nhà 5x20",
      "bảng giá xây dựng việt dũng phát",
    ],
  },
  {
    id: "khu-vuc",
    label: "Khu vực thi công",
    to: "/lien-he",
    phrases: [
      "xây nhà thủ đức",
      "xây nhà quận 7",
      "xây nhà gò vấp",
      "xây nhà bình thạnh",
      "xây nhà tân bình",
      "xây nhà tân phú",
      "xây nhà bình tân",
      "xây nhà nhà bè",
      "xây nhà bình chánh",
      "xây nhà dĩ an bình dương",
      "xây nhà thuận an",
      "xây nhà biên hòa đồng nai",
    ],
  },
  {
    id: "phong-thuy",
    label: "Phong thủy & xin phép",
    to: "/thuoc-lo-ban",
    phrases: [
      "thước lỗ ban online",
      "xem tuổi xây nhà 2026",
      "xin phép xây dựng nhà phố tphcm",
      "thủ tục cấp phép xây dựng",
      "quy định nâng tầng tphcm",
      "phong thủy nhà phố",
    ],
  },
  {
    id: "thuong-hieu",
    label: "Việt Dũng Phát",
    to: "/gioi-thieu",
    phrases: [
      "công ty việt dũng phát",
      "xây dựng việt dũng phát tphcm",
      "hồ sơ năng lực việt dũng phát",
      "nhà thầu không bán thầu tphcm",
    ],
  },
];

export const KEYWORD_GROUPS = GROUPS.map((group) => ({
  ...group,
  items: group.phrases.map((phrase, index) => {
    const slug = slugify(phrase);
    const covers = {
      "xay-dung": ["/news/news-tron-goi.jpg", "/news/news-phan-tho.jpg", "/villas/villa-cong-lon.jpg"],
      "tan-co-dien": ["/villas/villa-mansard-rong.jpg", "/villas/villa-goc-lon.jpg", "/villas/villa-cong-lon.jpg"],
      "thiet-ke": ["/news/news-thiet-ke.jpg", "/villas/villa-goc-lon.jpg", "/news/news-tron-goi.jpg"],
      "cai-tao": ["/news/news-cai-tao.jpg", "/news/news-phan-tho.jpg", "/villas/villa-cong-lon.jpg"],
      "noi-that": ["/interior/noi-that-tan-co-dien.jpg", "/interior/combo-can-ho.jpg", "/interior/tu-quan-ao.jpg"],
      "bao-gia": ["/news/news-bao-gia.jpg", "/news/news-thiet-ke.jpg", "/news/news-tron-goi.jpg"],
      "khu-vuc": ["/news/news-tron-goi.jpg", "/villas/villa-goc-lon.jpg", "/news/news-phan-tho.jpg"],
      "phong-thuy": ["/news/news-phong-thuy.jpg", "/news/news-thiet-ke.jpg", "/news/news-bao-gia.jpg"],
      "thuong-hieu": ["/villas/villa-mansard-rong.jpg", "/news/news-tron-goi.jpg", "/news/news-thiet-ke.jpg"],
    };
    const pool = covers[group.id] || covers["xay-dung"];
    return {
      phrase,
      slug,
      group: group.id,
      label: group.label,
      to: group.to,
      image: pool[index % pool.length],
      title: `${phrase[0].toUpperCase()}${phrase.slice(1)} | Việt Dũng Phát`,
      description: `${phrase} — khảo sát, thiết kế, báo giá và thi công tại TP.HCM cùng Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát.`.slice(0, 158),
      faqs: [
        {
          q: `${phrase} hết bao nhiêu tiền?`,
          a: "Chi phí phụ thuộc diện tích, số tầng và phạm vi hạng mục. Việt Dũng Phát báo giá sau khảo sát; đơn giá phần thô 3.950.000đ/m² và trọn gói 5.950.000đ/m² xem tại trang Báo giá.",
        },
        {
          q: `Khảo sát ${phrase} có mất phí không?`,
          a: "Khảo sát nhà tại TP.HCM được hỗ trợ theo lịch hẹn. Nên mang sổ hồng hoặc bản vẽ hiện trạng nếu có.",
        },
        {
          q: `Việt Dũng Phát có nhận ${phrase} ngoài thành phố không?`,
          a: "Có — TP.HCM và các tỉnh lân cận (Bình Dương, Đồng Nai, Long An…). Liên hệ hotline để xác nhận khu vực.",
        },
      ],
    };
  }),
}));

export const KEYWORDS = KEYWORD_GROUPS.flatMap((group) => group.items);

export function findKeyword(slug) {
  return KEYWORDS.find((item) => item.slug === slug);
}

const NEWS_SLUG_OVERRIDE = {
  "thiet-ke-kien-truc-ho-chi-minh": "tin-thiet-ke-kien-truc-ho-chi-minh",
};

export function keywordNewsSlug(item) {
  const slug = typeof item === "string" ? item : item?.slug;
  return NEWS_SLUG_OVERRIDE[slug] || slug;
}

export function keywordNewsPath(item) {
  return `/${keywordNewsSlug(item)}`;
}

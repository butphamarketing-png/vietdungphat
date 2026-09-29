import { villaSrcs } from "../lib/studio.js";

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
      "xây nhà 1 trệt 1 lầu tphcm",
      "xây nhà 1 trệt 2 lầu tphcm",
      "xây nhà 3 tầng tphcm",
      "xây nhà 4 tầng tphcm",
      "xây nhà ống tphcm",
      "nhà thầu xây dựng uy tín tphcm",
      "xây nhà không phát sinh chi phí",
      "công ty xây nhà trọn gói tphcm",
      "xây nhà phố 5x20",
      "xây biệt thự sân vườn",
      "thi công nhà ở dân dụng tphcm",
      "xây nhà hoàn thiện tphcm",
    ],
  },
  {
    id: "tan-co-dien",
    label: "Tân cổ điển",
    to: "/mau-nha",
    phrases: [
      "thiết kế nhà tân cổ điển",
      "xây nhà tân cổ điển tphcm",
      "biệt thự tân cổ điển tphcm",
      "nhà phố tân cổ điển",
      "thi công biệt thự tân cổ điển",
      "mặt tiền nhà phố tân cổ điển",
      "nội thất tân cổ điển tphcm",
      "mẫu biệt thự tân cổ điển 2026",
      "cải tạo nhà tân cổ điển",
      "biệt thự mái mansard",
      "nhà phố 1 trệt 2 lầu tân cổ điển",
      "biệt thự tân cổ điển mái thái",
      "thiết kế biệt thự tân cổ điển 2 tầng",
      "biệt thự tân cổ điển sân vườn",
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
      "kiến trúc sư thiết kế nhà tphcm",
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
      "cải tạo nội thất nhà phố",
      "cải tạo nhà ống cũ",
      "sửa nhà nâng tầng tphcm",
      "cải tạo mặt tiền nhà phố",
      "cải tạo nhà thủ đức",
      "chống thấm nhà phố tphcm",
      "sửa nhà không phá dỡ",
    ],
  },
  {
    id: "noi-that",
    label: "Nội thất",
    to: "/thiet-ke-noi-that-nha-o",
    phrases: [
      "thiết kế nội thất nhà phố",
      "thiết kế nội thất biệt thự",
      "thi công nội thất trọn gói tphcm",
      "xưởng nội thất thủ đức",
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
      "giá xây nhà phần thô 2026",
      "giá xây nhà trọn gói 2026",
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
      "xây nhà thành phố thủ đức",
      "xây nhà quận 9",
      "xây nhà quận 7",
      "xây nhà gò vấp",
      "xây nhà bình thạnh",
      "xây nhà tân bình",
      "xây nhà tân phú",
      "xây nhà bình tân",
      "xây nhà nhà bè",
      "xây nhà bình chánh",
      "xây nhà dĩ an bình dương",
      "xây nhà biên hòa đồng nai",
      "xây nhà long an",
    ],
  },
  {
    id: "dong-nam",
    label: "Dĩ An, Đồng Nai, Thủ Đức",
    to: "/lien-he",
    phrases: [
      "xây nhà trọn gói dĩ an",
      "xây nhà phần thô dĩ an",
      "thiết kế nhà phố dĩ an",
      "cải tạo nhà phố dĩ an",
      "xây nhà tân cổ điển dĩ an",
      "thi công biệt thự dĩ an",
      "báo giá xây nhà dĩ an",
      "nhà thầu xây dựng dĩ an",
      "xây nhà 1 trệt 1 lầu dĩ an",
      "xây nhà 1 trệt 2 lầu dĩ an",
      "xây nhà 3 tầng dĩ an",
      "xây nhà ống dĩ an",
      "thiết kế nội thất nhà phố dĩ an",
      "sửa nhà trọn gói dĩ an",
      "xây nhà chìa khóa trao tay dĩ an",
      "công ty xây nhà dĩ an",
      "xây nhà phố 5x20 dĩ an",
      "thi công nhà ở dân dụng dĩ an",
      "nâng tầng nhà phố dĩ an",
      "xây nhà hoàn thiện dĩ an",
      "thiết kế biệt thự dĩ an",
      "cải tạo nhà cấp 4 dĩ an",
      "xin phép xây dựng dĩ an",
      "giá xây nhà phần thô dĩ an",
      "giá xây nhà trọn gói dĩ an",
      "xây nhà mặt tiền dĩ an",
      "thi công nội thất dĩ an",
      "xây nhà 4 tầng dĩ an",
      "cải tạo mặt tiền nhà phố dĩ an",
      "xây biệt thự sân vườn dĩ an",
      "công ty kiến trúc dĩ an",
      "sửa chữa nhà cũ dĩ an",
      "thiết kế nhà 5x20 dĩ an",
      "nhà thầu uy tín dĩ an bình dương",
      "xây nhà đông hòa dĩ an",
      "xây nhà an bình dĩ an",
      "xây nhà tân đông hiệp dĩ an",
      "sửa nhà nâng tầng dĩ an",
      "thiết kế mặt tiền nhà phố dĩ an",
      "xây nhà trọn gói biên hòa",
      "xây nhà phần thô biên hòa",
      "thiết kế nhà phố biên hòa",
      "cải tạo nhà phố biên hòa",
      "thi công biệt thự biên hòa",
      "báo giá xây nhà biên hòa",
      "nhà thầu xây dựng biên hòa",
      "xây nhà tân cổ điển biên hòa",
      "xây nhà 3 tầng biên hòa",
      "xây nhà ống biên hòa",
      "thiết kế nội thất biên hòa",
      "sửa nhà trọn gói biên hòa",
      "xây nhà 1 trệt 2 lầu biên hòa",
      "công ty xây nhà biên hòa",
      "nâng tầng nhà phố biên hòa",
      "xây nhà hoàn thiện biên hòa",
      "xin phép xây dựng biên hòa",
      "xây nhà long bình tân",
      "xây nhà trọn gói đồng nai",
      "xây nhà phần thô đồng nai",
      "công ty xây dựng nhà ở đồng nai",
      "thiết kế nhà phố đồng nai",
      "cải tạo nhà đồng nai",
      "thi công biệt thự đồng nai",
      "báo giá xây nhà đồng nai",
      "nhà thầu xây dựng đồng nai",
      "xây nhà tân cổ điển đồng nai",
      "xây nhà long thành đồng nai",
      "xây nhà nhơn trạch",
      "xây nhà trảng bom",
      "thiết kế nội thất đồng nai",
      "sửa nhà trọn gói đồng nai",
      "xây nhà 1 trệt 1 lầu đồng nai",
      "xây nhà trọn gói quận 9",
      "xây nhà phần thô quận 9",
      "thiết kế nhà phố quận 9",
      "cải tạo nhà quận 9",
      "thi công biệt thự quận 9",
      "xây nhà vinhomes grand park",
      "xây nhà phước long",
      "xây nhà tăng nhơn phú",
      "xây nhà long trường",
      "báo giá xây nhà quận 9",
      "nhà thầu xây dựng quận 9",
      "thiết kế nội thất quận 9",
      "xây nhà tân cổ điển quận 9",
      "xây nhà trọn gói thủ đức",
      "xây nhà phần thô thủ đức",
      "thiết kế nhà phố thủ đức",
      "thi công biệt thự thủ đức",
      "báo giá xây nhà thủ đức",
      "nhà thầu xây dựng thủ đức",
      "xây nhà tân cổ điển thủ đức",
      "xây nhà linh xuân",
      "xây nhà trường thọ",
      "sửa nhà trọn gói thủ đức",
      "thiết kế nội thất thủ đức",
      "xây nhà 3 tầng thủ đức",
      "nâng tầng nhà phố thủ đức",
      "xây nhà hiệp phú thủ đức",
      "xây nhà long phước quận 9",
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
      "thủ tục cấp phép xây dựng tphcm",
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
      "kiến trúc xây dựng việt dũng phát",
    ],
  },
];

function areaName(phrase) {
  const p = phrase.toLowerCase();
  if (/dĩ an|đông hòa|an bình|tân đông hiệp/.test(p)) return "Dĩ An";
  if (/biên hòa|long bình tân/.test(p)) return "Biên Hòa";
  if (/đồng nai|long thành|nhơn trạch|trảng bom/.test(p)) return "Đồng Nai";
  if (/quận 9|grand park|phước long|tăng nhơn phú|long trường|long phước/.test(p)) return "Quận 9";
  return "Thủ Đức";
}

function areaFaqs(phrase) {
  const place = areaName(phrase);
  return [
    {
      q: `Có nhận ${phrase} không?`,
      a: `Có. Việt Dũng Phát khảo sát tại ${place} trước khi nhận, vì hẻm, nền đất và giấy phép khác nội thành.`,
    },
    {
      q: "Đơn giá có giống TP.HCM không?",
      a: "Mốc phần thô 3.950.000đ/m² và trọn gói 5.950.000đ/m² chỉ để tham khảo. Vận chuyển, móng và phép địa phương được chốt sau khảo sát.",
    },
    {
      q: "Khảo sát tính phí thế nào?",
      a: `Khảo sát tại ${place} theo lịch hẹn. Nên mang sổ hồng hoặc bản vẽ hiện trạng nếu có.`,
    },
  ];
}

export const KEYWORD_GROUPS = GROUPS.map((group) => ({
  ...group,
  items: group.phrases.map((phrase, index) => {
    const slug = slugify(phrase);
    const covers = {
      "xay-dung": ["/news/news-tron-goi.jpg", "/news/news-phan-tho.jpg", "/villas/neo-01.jpg", "/villas/neo-07.jpg", "/villas/villa-cong-lon.jpg"],
      "tan-co-dien": villaSrcs,
      "thiet-ke": ["/news/news-thiet-ke.jpg", "/villas/neo-02.jpg", "/villas/neo-08.jpg", "/villas/neo-10.jpg"],
      "cai-tao": ["/news/news-cai-tao.jpg", "/news/news-phan-tho.jpg", "/villas/neo-14.jpg"],
      "noi-that": [
        "/interior/noi-that-tan-co-dien.png",
        "/interior/combo-noi-that-danh-cho-can-ho.png",
        "/interior/tu-quan-ao.png",
        "/interior/giuong-doi-lon-18.png",
        "/interior/combo-noi-that-indochine.png",
        "/interior/noi-that-loft-industrial.png",
      ],
      "bao-gia": ["/news/news-bao-gia.jpg", "/news/news-thiet-ke.jpg", "/villas/neo-09.jpg"],
      "khu-vuc": ["/villas/neo-01.jpg", "/villas/neo-04.jpg", "/villas/neo-07.jpg", "/news/news-phan-tho.jpg"],
      "dong-nam": ["/villas/neo-01.jpg", "/villas/neo-04.jpg", "/villas/neo-07.jpg", "/news/news-tron-goi.jpg", "/news/news-phan-tho.jpg", "/villas/villa-cong-lon.jpg"],
      "phong-thuy": ["/news/news-phong-thuy.jpg", "/news/news-thiet-ke.jpg", "/news/news-bao-gia.jpg"],
      "thuong-hieu": ["/villas/villa-mansard-rong.jpg", "/villas/neo-02.jpg", "/villas/neo-11.jpg"],
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
      description: (group.id === "dong-nam"
        ? `${phrase} — khảo sát, thiết kế và thi công tại ${areaName(phrase)}. Việt Dũng Phát.`
        : `${phrase} — khảo sát, thiết kế, báo giá và thi công tại TP.HCM cùng Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát.`
      ).slice(0, 158),
      faqs: group.id === "dong-nam" ? areaFaqs(phrase) : [
        {
          q: "Chi phí hết bao nhiêu tiền?",
          a: "Chi phí phụ thuộc diện tích, số tầng và phạm vi hạng mục. Việt Dũng Phát báo giá sau khảo sát; đơn giá phần thô 3.950.000đ/m² và trọn gói 5.950.000đ/m² xem tại trang Báo giá.",
        },
        {
          q: "Khảo sát có mất phí không?",
          a: "Khảo sát nhà tại TP.HCM được hỗ trợ theo lịch hẹn. Nên mang sổ hồng hoặc bản vẽ hiện trạng nếu có.",
        },
        {
          q: "Có nhận thi công ngoài thành phố không?",
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

import data from "../data/content.json";
import { isHouseStyleSlug } from "./studio.js";

export const { site: cmsSite, projects, products, services, news, extras = [] } = data;

export const site = {
  ...cmsSite,
  facebook: "https://www.facebook.com/vietdungphatphat/",
  messenger: "https://m.me/vietdungphatphat",
  youtube: "https://www.youtube.com/@ConstructionVietdungphat",
  logo: "/logo.png",
  aboutImage: "/villas/neo-10.jpg",
  profilePdf: (() => {
    const raw = String(cmsSite.profilePdf || "").replace(/^http:\/\//i, "https://");
    if (!raw || /\/upload\/files\/ho-so-nang-luc/i.test(raw) || /\.docx$/i.test(raw) || raw === "/ho-so-nang-luc.pdf") return "/files/ho-so-nang-luc.pdf";
    return raw;
  })(),
};

const all = [...projects, ...products, ...services, ...news, ...extras];

export function findPost(slug) {
  return all.find((p) => p.slug === slug);
}

export function kindOf(slug) {
  if (projects.some((p) => p.slug === slug)) {
    return isHouseStyleSlug(slug)
      ? { kind: "projects", label: "Mẫu nhà", path: "/mau-nha" }
      : { kind: "projects", label: "Dự án", path: "/du-an" };
  }
  if (products.some((p) => p.slug === slug)) return { kind: "products", label: "Sản phẩm", path: "/san-pham" };
  if (services.some((p) => p.slug === slug)) return { kind: "services", label: "Dịch vụ", path: "/dich-vu" };
  if (news.some((p) => p.slug === slug)) return { kind: "news", label: "Tin tức", path: "/tin-tuc" };
  if (extras.some((p) => p.slug === slug)) return { kind: "extras", label: "Bài viết", path: "/" };
  return { kind: "projects", label: "Bài viết", path: "/mau-nha" };
}

export const lists = {
  projects: {
    title: "Mẫu nhà",
    kicker: "Mẫu nhà",
    items: projects,
    intro: "Chọn phong cách. Mục Nhà phố mở ra từng mẫu. Các phong cách khác mở album ảnh của phong cách đó.",
  },
  products: { title: "Sản phẩm", kicker: "Sản phẩm", items: products, intro: "Nội thất và combo từ xưởng sản xuất của Việt Dũng Phát." },
  services: { title: "Dịch vụ", kicker: "Dịch vụ", items: services, intro: "Thiết kế, xây dựng và cải tạo nhà ở — toàn bộ bài viết gốc được giữ lại." },
  news: {
    title: "Tin tức",
    kicker: "Tin tức",
    items: news,
    intro: "Bài xây nhà, thiết kế và cải tạo tại Dĩ An, Biên Hòa, Đồng Nai, Quận 9 và Thủ Đức, cùng các tin gốc của Việt Dũng Phát.",
  },
};

export const coreServices = [
  {
    title: "Thiết kế",
    slug: "thiet-ke",
    href: "/thiet-ke-kien-truc-ho-chi-minh",
    image: "/villas/khach-09.jpg",
    desc: "Thiết kế kiến trúc và nội thất nhà phố, biệt thự, căn hộ — hồ sơ đầy đủ để thi công.",
  },
  {
    title: "Xây dựng",
    slug: "xay-dung",
    href: "/xay-dung-nha-tron-goi-tai-ho-chi-minh",
    image: "/villas/khach-05.jpg",
    desc: "Thi công phần thô đến chìa khóa trao tay, giám sát tại công trình, không bán thầu.",
  },
  {
    title: "Cải tạo",
    slug: "cai-tao",
    href: "/bao-gia-sua-chu-nha-tron-goi-2025",
    image: "/villas/khach-08.jpg",
    desc: "Sửa chữa, cải tạo, nâng cấp nhà cũ: kết cấu, hoàn thiện và nội thất.",
  },
];

const SERVICE_PHOTOS = {
  "thiet-ke": "/villas/khach-09.jpg",
  "xay-dung": "/villas/khach-05.jpg",
  "cai-tao": "/villas/khach-08.jpg",
};

const SERVICE_ARTICLE_COVERS = {
  "bao-gia-sua-chu-nha-tron-goi-2025": "/news/news-cai-tao.jpg",
  "bang-bao-gia-sua-chua-nha-nam-2022": "/news/news-bao-gia.jpg",
  "don-gia-thiet-ke-xay-dung-nha-tai-binh-duong": "/news/news-thiet-ke.jpg",
  "don-gia-xay-dung-nha-tron-goi-tai-tp-hcm-nam-2022": "/news/news-tron-goi.jpg",
  "chung-ta-hieu-gi-ve-phong-cach-toi-gian": "/interior/noi-that-phong-cach-nhat.png",
  "thiet-ke-noi-that-nha-o": "/interior/noi-that-tan-co-dien.png",
  "thiet-ke-kien-truc-ho-chi-minh": "/bai/thiet-ke-kien-truc-ho-chi-minh-1.png",
  "xay-dung-nha-tron-goi-tai-ho-chi-minh": "/bai/xay-nha-tron-goi-tphcm-1.png",
};

export function withServiceArticleCovers(list = []) {
  return list.map((item) => {
    const src = String(item.image || "");
    if (/supabase\.co|r2\.dev|\/media\//i.test(src) || src.startsWith("/")) return item;
    const cover = SERVICE_ARTICLE_COVERS[item.slug];
    return cover ? { ...item, image: cover } : item;
  });
}

export function withServicePhotos(list = coreServices) {
  return list.map((item) => {
    const src = String(item.image || "");
    if (/supabase\.co|r2\.dev|\/media\//i.test(src)) return item;
    const slug = String(item.slug || "");
    if (SERVICE_PHOTOS[slug]) return { ...item, image: SERVICE_PHOTOS[slug] };
    const title = String(item.title || "");
    if (/thiết kế/i.test(title)) return { ...item, image: SERVICE_PHOTOS["thiet-ke"] };
    if (/xây dựng/i.test(title)) return { ...item, image: SERVICE_PHOTOS["xay-dung"] };
    if (/cải tạo/i.test(title)) return { ...item, image: SERVICE_PHOTOS["cai-tao"] };
    return item;
  });
}

export const reviews = [
  {
    name: "Anh Tân",
    place: "Nhà phố Thủ Đức",
    quote: "Gia đình hài lòng vì tiến độ rõ ràng, KTS tư vấn công năng rất thực tế. Ngôi nhà 230m² đúng như phối cảnh.",
  },
  {
    name: "Chị Trang",
    place: "Đồng Nai",
    quote: "Từ thiết kế đến thi công đều có người phụ trách. Vật tư minh bạch, không phát sinh lung tung.",
  },
  {
    name: "Anh Bình",
    place: "Dĩ An, Bình Dương",
    quote: "Chọn Việt Dũng Phát vì thấy nhiều công trình thực tế. Đội thợ đều, hoàn thiện sạch sẽ.",
  },
];

export const pricePacks = [
  {
    tag: "Phần thô",
    icon: "frame",
    title: "Xây dựng phần thô",
    price: "3.950.000đ/m²",
    lead: "Phù hợp với khách hàng muốn chủ động lựa chọn vật liệu hoàn thiện.",
    points: [
      "Kết cấu móng – khung – mái",
      "Hệ thống điện nước âm tường",
      "Vật tư theo tiêu chuẩn cam kết",
      "Hỗ trợ hồ sơ & giấy phép",
      "Giám sát quá trình thi công",
    ],
    href: "/don-gia-xay-dung-nha-tron-goi-tai-tp-hcm-nam-2022",
    image: "/villas/khach-06.jpg",
  },
  {
    tag: "Hoàn thiện",
    icon: "finish",
    title: "Thi công hoàn thiện",
    price: "Từ 1.300.000đ/m²",
    lead: "Phù hợp với khách hàng đã có phần thô và cần hoàn thiện công trình.",
    points: [
      "Vật tư hoàn thiện rõ ràng",
      "Điện nước hoàn thiện",
      "Sơn – lát – ốp",
      "Thiết bị theo lựa chọn",
      "Chính sách bảo hành",
    ],
    href: "/thiet-ke-noi-that-nha-o",
    image: "/villas/khach-07.jpg",
  },
  {
    tag: "Trọn gói",
    icon: "home",
    featured: true,
    badge: "Lựa chọn toàn diện",
    title: "Xây nhà trọn gói",
    price: "5.950.000đ/m²",
    lead: "Thiết kế → Xin phép → Thi công → Hoàn thiện → Bàn giao",
    points: [
      "Chìa khóa trao tay",
      "Không phát sinh ngoài thỏa thuận",
      "Vật tư minh bạch",
      "Đội ngũ thi công trực tiếp",
      "Bảo hành dài hạn",
    ],
    href: "/xay-dung-nha-tron-goi-tai-ho-chi-minh",
    image: "/villas/khach-04.jpg",
  },
];

const PRICE_PHOTOS = {
  "Phần thô": "/villas/khach-06.jpg",
  "Hoàn thiện": "/villas/khach-07.jpg",
  "Trọn gói": "/villas/khach-04.jpg",
};

export function withPricePhotos(list = pricePacks) {
  return list.map((item) => {
    const src = String(item.image || "");
    if (/supabase\.co|r2\.dev|\/media\//i.test(src)) return item;
    const tag = String(item.tag || "");
    if (PRICE_PHOTOS[tag]) return { ...item, image: PRICE_PHOTOS[tag] };
    return item;
  });
}

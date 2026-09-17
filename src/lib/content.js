import data from "../data/content.json";

export const { site, projects, products, services, news, extras = [] } = data;

const all = [...projects, ...products, ...services, ...news, ...extras];

export function findPost(slug) {
  return all.find((p) => p.slug === slug);
}

export function kindOf(slug) {
  if (projects.some((p) => p.slug === slug)) return { kind: "projects", label: "Mẫu nhà", path: "/mau-nha" };
  if (products.some((p) => p.slug === slug)) return { kind: "products", label: "Sản phẩm", path: "/san-pham" };
  if (services.some((p) => p.slug === slug)) return { kind: "services", label: "Dịch vụ", path: "/dich-vu" };
  if (news.some((p) => p.slug === slug)) return { kind: "news", label: "Tin tức", path: "/tin-tuc" };
  if (extras.some((p) => p.slug === slug)) return { kind: "extras", label: "Bài viết", path: "/" };
  return { kind: "projects", label: "Bài viết", path: "/mau-nha" };
}

export const lists = {
  projects: { title: "Mẫu nhà", kicker: "Mẫu nhà", items: projects, intro: "Những công trình đã thiết kế và thi công — giữ nguyên hình ảnh từ kho tư liệu gốc." },
  products: { title: "Sản phẩm", kicker: "Sản phẩm", items: products, intro: "Nội thất và combo từ xưởng sản xuất của Việt Dũng Phát." },
  services: { title: "Dịch vụ", kicker: "Dịch vụ", items: services, intro: "Thiết kế, xây dựng và cải tạo nhà ở — toàn bộ bài viết gốc được giữ lại." },
  news: { title: "Tin tức", kicker: "Tin tức", items: news, intro: "Bài viết và kinh nghiệm xây nhà — toàn bộ nội dung gốc được giữ lại." },
};

export const coreServices = [
  {
    title: "Thiết kế",
    slug: "thiet-ke",
    href: "/thiet-ke-kien-truc-ho-chi-minh",
    image: "/studio/06.jpg",
    desc: "Thiết kế kiến trúc và nội thất nhà phố, biệt thự, căn hộ — hồ sơ đầy đủ để thi công.",
  },
  {
    title: "Xây dựng",
    slug: "xay-dung",
    href: "/xay-dung-nha-tron-goi-tai-ho-chi-minh",
    image: "/studio/11.jpg",
    desc: "Thi công phần thô đến chìa khóa trao tay, giám sát tại công trình, không bán thầu.",
  },
  {
    title: "Cải tạo",
    slug: "cai-tao",
    href: "/bao-gia-sua-chu-nha-tron-goi-2025",
    image: "/studio/12.jpg",
    desc: "Sửa chữa, cải tạo, nâng cấp nhà cũ: kết cấu, hoàn thiện và nội thất.",
  },
];

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
    price: "3.500.000đ/m²",
    lead: "Phù hợp với khách hàng muốn chủ động lựa chọn vật liệu hoàn thiện.",
    points: [
      "Kết cấu móng – khung – mái",
      "Hệ thống điện nước âm tường",
      "Vật tư theo tiêu chuẩn cam kết",
      "Hỗ trợ hồ sơ & giấy phép",
      "Giám sát quá trình thi công",
    ],
    href: "/don-gia-xay-dung-nha-tron-goi-tai-tp-hcm-nam-2022",
    image: "/studio/04.jpg",
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
    image: "/studio/02.jpg",
  },
  {
    tag: "Trọn gói",
    icon: "home",
    featured: true,
    badge: "Lựa chọn toàn diện",
    title: "Xây nhà trọn gói",
    price: "Từ 5.050.000đ/m²",
    lead: "Thiết kế → Xin phép → Thi công → Hoàn thiện → Bàn giao",
    points: [
      "Chìa khóa trao tay",
      "Không phát sinh ngoài thỏa thuận",
      "Vật tư minh bạch",
      "Đội ngũ thi công trực tiếp",
      "Bảo hành dài hạn",
    ],
    href: "/xay-dung-nha-tron-goi-tai-ho-chi-minh",
    image: "/studio/08.jpg",
  },
];

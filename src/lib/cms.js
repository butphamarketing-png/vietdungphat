import { useSyncExternalStore } from "react";
import data from "../data/content.json";
import { studio as defaultStudio } from "./studio.js";
import {
  coreServices as defaultCoreServices,
  lists as defaultLists,
  pricePacks as defaultPricePacks,
  reviews as defaultReviews,
  site as defaultSite,
} from "./content.js";

const STORAGE = "vdp-cms-v1";
const AUTH = "vdp-adminbp-auth";
const ACCOUNT = "vdp-adminbp-account";

const KINDS = ["projects", "products", "services", "news", "extras"];

export const defaultAccount = { email: "admin@vietdungphat.com", password: "admin123" };

export const defaultHome = {
  kicker: "Thiết kế · Xây dựng · Cải tạo",
  title1: "Kiến tạo không gian",
  title2: "sống bền vững",
  cta1: "Đặt lịch khảo sát",
  cta2: "Xem mẫu nhà",
  video: "/hero.mp4?v=client",
  poster: "/studio/01.jpg",
  servicesKicker: "Dịch vụ",
  servicesTitle: "Thiết kế, xây dựng,\ncải tạo",
  servicesLead:
    "Việt Dũng Phát đồng hành từ ý tưởng đến chìa khóa trao tay: thiết kế kiến trúc — nội thất, xây dựng nhà phố biệt thự, và cải tạo nhà hiện hữu. 20 năm kinh nghiệm tại TP.HCM và các tỉnh lân cận.",
  servicesCta: "Xem toàn bộ dịch vụ",
  projectsKicker: "Mẫu nhà",
  projectsTitle: "Công trình tiêu biểu",
  productsKicker: "Sản phẩm",
  productsTitle: "Nội thất và combo từ xưởng",
  aboutKicker: "Về chúng tôi",
  aboutTitle: "20 năm kiến trúc\nvà xây dựng",
  aboutLead:
    "KIẾN TRÚC Việt Dũng Phát là thương hiệu kiến trúc – xây dựng của Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát, với 20 năm kinh nghiệm thiết kế và thi công tại Hồ Chí Minh và các tỉnh lân cận.",
  aboutImages: ["/studio/08.jpg", "/studio/10.jpg", "/studio/11.jpg"],
  newsKicker: "Tin tức",
  newsTitle: "Góc chia sẻ",
  reviewsKicker: "Đánh giá",
  reviewsTitle: "Khách hàng nói gì về chúng tôi",
  bookingImage: "/studio/05.jpg",
  bookingKicker: "Đặt lịch hẹn",
  bookingTitle: "Tư vấn giải pháp\nnhà ở lý tưởng",
  bookingLead:
    "Đội ngũ kiến trúc sư của Việt Dũng Phát sẵn sàng lắng nghe và đồng hành cùng bạn từ ý tưởng đến hiện thực.",
  bookingPoints: ["Tư vấn tận tâm", "Giải pháp tối ưu", "Đồng hành dài lâu"],
  footerBlurb: "20 năm thiết kế, xây dựng và cải tạo nhà ở tại TP.HCM và các tỉnh lân cận.",
};

export const defaultStats = [
  { value: "900+", label: "Công trình" },
  { value: "20+", label: "Năm kinh nghiệm" },
  { value: "200+", label: "Công nhân lành nghề" },
  { value: "6 năm", label: "Bảo hành" },
];

export const defaultPages = {
  about: {
    kicker: "Giới thiệu",
    title: "20 năm kiến trúc,\nxây dựng và cải tạo",
    lead: "Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát — thiết kế, xây dựng, cải tạo nhà ở tại TP.HCM và các tỉnh lân cận. Toàn bộ nội dung giới thiệu gốc được giữ nguyên bên dưới.",
    image: "/studio/09.jpg",
  },
  services: {
    kicker: "Dịch vụ",
    title: "Thiết kế, xây dựng, cải tạo",
    lead: "Ba nhóm dịch vụ cốt lõi — cùng toàn bộ bài viết dịch vụ gốc từ website Việt Dũng Phát.",
  },
  pricing: {
    kicker: "Báo giá",
    title: "Bảng báo giá và tính giá xây dựng",
    lead: "Đơn giá theo m² xây dựng, dùng để tham khảo nhanh. Để có báo giá chính xác, đội ngũ sẽ khảo sát hiện trạng và gửi bảng chi tiết.",
  },
  contact: {
    kicker: "Liên hệ",
    title: "Đặt lịch hẹn tư vấn",
    lead: "Gửi yêu cầu bên dưới hoặc gọi trực tiếp. Thông tin liên hệ giữ nguyên từ website Việt Dũng Phát.",
  },
  loban: {
    kicker: "Phong thủy",
    title: "Thước Lỗ Ban online",
    lead: "Tra kích thước tốt — xấu theo ba loại thước phổ biến: 52.2cm cho khoảng thông thủy, 42.9cm cho khối xây dựng và 38.8cm cho đồ nội thất, bàn thờ. Kết quả mang tính tham khảo phong thủy dân gian.",
  },
};

const emptyOverlay = () => ({
  site: {},
  home: {},
  stats: null,
  pages: {},
  listsMeta: {},
  coreServices: null,
  reviews: null,
  pricePacks: null,
  studio: null,
  posts: { overrides: {}, deleted: [], added: { projects: [], products: [], services: [], news: [], extras: [] } },
  bookings: [],
  media: [],
});

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

let overlay = typeof localStorage !== "undefined" ? { ...emptyOverlay(), ...readJson(STORAGE, {}) } : emptyOverlay();
const listeners = new Set();
let snapshot = null;

function emit() {
  snapshot = null;
  listeners.forEach((fn) => fn());
}

function persist() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(overlay));
  } catch (err) {
    console.warn("CMS lưu thất bại (có thể vượt dung lượng trình duyệt)", err);
  }
}

function mergePosts(kind) {
  const posts = overlay.posts || emptyOverlay().posts;
  const deleted = new Set(posts.deleted || []);
  const overrides = posts.overrides || {};
  const added = posts.added?.[kind] || [];
  const addedSlugs = new Set(added.map((p) => p.slug));
  const base = (data[kind] || [])
    .filter((p) => !deleted.has(p.slug) && !addedSlugs.has(p.slug))
    .map((p) => (overrides[p.slug] ? { ...p, ...overrides[p.slug] } : p));
  const extras = added
    .filter((p) => !deleted.has(p.slug))
    .map((p) => (overrides[p.slug] ? { ...p, ...overrides[p.slug] } : p));
  return [...extras, ...base];
}

export function getAccount() {
  return { ...defaultAccount, ...readJson(ACCOUNT, {}) };
}

export function setAccount(next) {
  localStorage.setItem(ACCOUNT, JSON.stringify({ ...getAccount(), ...next }));
}

export function isAuthed() {
  return sessionStorage.getItem(AUTH) === "1";
}

export function login(email, password) {
  const acc = getAccount();
  if (email.trim().toLowerCase() !== acc.email.toLowerCase() || password !== acc.password) return false;
  sessionStorage.setItem(AUTH, "1");
  return true;
}

export function logout() {
  sessionStorage.removeItem(AUTH);
}

export function getCms() {
  if (snapshot) return snapshot;
  const site = { ...defaultSite, ...(overlay.site || {}) };
  const projects = mergePosts("projects");
  const products = mergePosts("products");
  const services = mergePosts("services");
  const news = mergePosts("news");
  const extras = mergePosts("extras");
  const listsMeta = overlay.listsMeta || {};
  snapshot = {
    site,
    projects,
    products,
    services,
    news,
    extras,
    coreServices: overlay.coreServices || defaultCoreServices,
    reviews: overlay.reviews || defaultReviews,
    pricePacks: overlay.pricePacks || defaultPricePacks,
    studio: overlay.studio || defaultStudio,
    home: { ...defaultHome, ...(overlay.home || {}) },
    stats: overlay.stats || defaultStats,
    pages: {
      about: { ...defaultPages.about, ...(overlay.pages?.about || {}) },
      services: { ...defaultPages.services, ...(overlay.pages?.services || {}) },
      pricing: { ...defaultPages.pricing, ...(overlay.pages?.pricing || {}) },
      contact: { ...defaultPages.contact, ...(overlay.pages?.contact || {}) },
      loban: { ...defaultPages.loban, ...(overlay.pages?.loban || {}) },
    },
    lists: {
      projects: { ...defaultLists.projects, ...(listsMeta.projects || {}), items: projects },
      products: { ...defaultLists.products, ...(listsMeta.products || {}), items: products },
      services: { ...defaultLists.services, ...(listsMeta.services || {}), items: services },
      news: { ...defaultLists.news, ...(listsMeta.news || {}), items: news },
    },
    bookings: overlay.bookings || [],
    media: overlay.media || [],
    counts: {
      projects: projects.length,
      products: products.length,
      services: services.length,
      news: news.length,
      bookings: (overlay.bookings || []).length,
      media: (overlay.media || []).length,
    },
  };
  return snapshot;
}

export function patchCms(partial) {
  overlay = {
    ...overlay,
    ...partial,
    site: partial.site ? { ...(overlay.site || {}), ...partial.site } : overlay.site,
    home: partial.home ? { ...(overlay.home || {}), ...partial.home } : overlay.home,
    pages: partial.pages ? { ...(overlay.pages || {}), ...partial.pages } : overlay.pages,
    listsMeta: partial.listsMeta ? { ...(overlay.listsMeta || {}), ...partial.listsMeta } : overlay.listsMeta,
    posts: partial.posts ? { ...emptyOverlay().posts, ...(overlay.posts || {}), ...partial.posts } : overlay.posts,
  };
  persist();
  emit();
}

export function replaceCms(next) {
  overlay = { ...emptyOverlay(), ...next };
  persist();
  emit();
}

export function resetCms() {
  overlay = emptyOverlay();
  localStorage.removeItem(STORAGE);
  emit();
}

export function savePost(kind, post) {
  const posts = overlay.posts || emptyOverlay().posts;
  const added = { projects: [], products: [], services: [], news: [], extras: [], ...(posts.added || {}) };
  const inJson = (data[kind] || []).some((p) => p.slug === post.slug);
  const inAdded = (added[kind] || []).some((p) => p.slug === post.slug);
  if (!inJson && !inAdded) added[kind] = [{ ...post }, ...(added[kind] || [])];
  else if (inAdded) added[kind] = added[kind].map((p) => (p.slug === post.slug ? { ...p, ...post } : p));
  overlay = {
    ...overlay,
    posts: {
      ...posts,
      added,
      deleted: (posts.deleted || []).filter((s) => s !== post.slug),
      overrides: { ...(posts.overrides || {}), [post.slug]: post },
    },
  };
  persist();
  emit();
}

export function removePost(kind, slug) {
  const posts = overlay.posts || emptyOverlay().posts;
  const added = { ...(posts.added || {}) };
  const wasAdded = (added[kind] || []).some((p) => p.slug === slug);
  if (wasAdded) added[kind] = (added[kind] || []).filter((p) => p.slug !== slug);
  const overrides = { ...(posts.overrides || {}) };
  delete overrides[slug];
  overlay = {
    ...overlay,
    posts: {
      ...posts,
      added,
      overrides,
      deleted: wasAdded ? posts.deleted || [] : [...new Set([...(posts.deleted || []), slug])],
    },
  };
  persist();
  emit();
}

export function addBooking(entry) {
  overlay = { ...overlay, bookings: [{ id: Date.now(), createdAt: new Date().toISOString(), ...entry }, ...(overlay.bookings || [])] };
  persist();
  emit();
}

export function removeBooking(id) {
  overlay = { ...overlay, bookings: (overlay.bookings || []).filter((b) => b.id !== id) };
  persist();
  emit();
}

export function addMedia(item) {
  overlay = { ...overlay, media: [item, ...(overlay.media || [])] };
  persist();
  emit();
}

export function removeMedia(id) {
  overlay = { ...overlay, media: (overlay.media || []).filter((m) => m.id !== id) };
  persist();
  emit();
}

export function exportCms() {
  return JSON.stringify(overlay, null, 2);
}

export function importCms(json) {
  replaceCms(JSON.parse(json));
}

export function findPost(slug, cms = getCms()) {
  return [...cms.projects, ...cms.products, ...cms.services, ...cms.news, ...cms.extras].find((p) => p.slug === slug);
}

export function kindOf(slug, cms = getCms()) {
  if (cms.projects.some((p) => p.slug === slug)) return { kind: "projects", label: "Mẫu nhà", path: "/mau-nha" };
  if (cms.products.some((p) => p.slug === slug)) return { kind: "products", label: "Sản phẩm", path: "/san-pham" };
  if (cms.services.some((p) => p.slug === slug)) return { kind: "services", label: "Dịch vụ", path: "/dich-vu" };
  if (cms.news.some((p) => p.slug === slug)) return { kind: "news", label: "Tin tức", path: "/tin-tuc" };
  if (cms.extras.some((p) => p.slug === slug)) return { kind: "extras", label: "Bài viết", path: "/" };
  return { kind: "projects", label: "Bài viết", path: "/mau-nha" };
}

export function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useCms() {
  return useSyncExternalStore(subscribe, getCms, getCms);
}

export { KINDS };

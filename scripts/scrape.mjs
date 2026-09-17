import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ORIGIN = "http://vietdungphat.com";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "src", "data");

const SKIP = new Set([
  "",
  "/",
  "gioi-thieu",
  "san-pham",
  "du-an",
  "dich-vu",
  "tin-tuc",
  "lien-he",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function abs(url) {
  if (!url) return "";
  url = url.replace(/&amp;/g, "&").trim();
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return "http:" + url;
  if (url.startsWith("/")) return ORIGIN + url;
  return ORIGIN + "/" + url;
}

function decode(s = "") {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function slugFromHref(href) {
  const raw = decode(href).replace(ORIGIN, "").replace(/^\//, "").split("?")[0].split("&")[0];
  return raw.replace(/\/$/, "");
}

function isArticleSlug(slug) {
  if (!slug || SKIP.has(slug)) return false;
  if (slug.includes("page=") || slug.startsWith("cache") || slug.startsWith("upload")) return false;
  if (/^(https?:|javascript:|mailto:|tel:)/i.test(slug)) return false;
  if (slug.startsWith("//") || slug.startsWith("/www.") || slug.includes("google") || slug.includes("zalo.me")) return false;
  if (/\.(png|jpe?g|gif|webp|svg|pdf|css|js)$/i.test(slug)) return false;
  if (slug.length < 6) return false;
  return /^[a-z0-9][a-z0-9\-/%._]*$/i.test(slug.replace(/ /g, "-"));
}

async function fetchHtml(url) {
  const res = await fetch(encodeURI(url), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return await res.text();
}

function maxPage(html) {
  let max = 1;
  for (const m of html.matchAll(/[?&]page=(\d+)/g)) {
    max = Math.max(max, Number(m[1]));
  }
  for (const m of html.matchAll(/&page=(\d+)/g)) {
    max = Math.max(max, Number(m[1]));
  }
  return max;
}

function listingItems(html) {
  const items = [];
  const seen = new Set();
  const re = /<a([^>]+)href=(["'])([^"']+)\2([^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const inner = m[5];
    if (inner.length > 4000 || !/<img/i.test(inner)) continue;
    const slug = slugFromHref(m[3]);
    if (
      !slug ||
      slug.length < 6 ||
      SKIP.has(slug) ||
      slug.includes("page=") ||
      slug.startsWith("upload") ||
      /\.(png|jpe?g|gif|webp|svg|pdf|css|js)$/i.test(slug)
    ) {
      continue;
    }
    if (seen.has(slug)) continue;
    const img = inner.match(/<img[^>]*?\ssrc=(["'])([^"']+)\1/i);
    if (!img) continue;
    const src = abs(img[2]);
    if (!/upload\//i.test(src) && !/resize\//i.test(src)) continue;
    if (/logo|facebook|email|youtobe|zalo|face-|hinhanh\/log|no-image/i.test(src)) continue;
    const attrs = m[1] + m[4] + inner;
    const alt = decode((attrs.match(/alt=(["'])([^"']*)\1/) || attrs.match(/title=(["'])([^"']*)\1/) || [])[2] || "");
    seen.add(slug);
    items.push({ slug, title: alt, image: src });
  }

  const titleRe = /<a[^>]+href="([^"]+)"[^>]*>([^<]{8,220})<\/a>/gi;
  const titles = new Map();
  while ((m = titleRe.exec(html))) {
    const slug = slugFromHref(m[1]);
    const title = decode(m[2]).replace(/\s+/g, " ");
    if (!slug || SKIP.has(slug) || /^\d+$/.test(title) || title.length < 6) continue;
    if (!titles.has(slug)) titles.set(slug, title);
  }
  for (const item of items) {
    if (!item.title) item.title = titles.get(item.slug) || item.slug;
  }

  const dateRe =
    /<a[^>]+href="([^"]+)"[\s\S]{0,1200}?(\d{2}\/\d{2}\/\d{4})/gi;
  const dates = new Map();
  while ((m = dateRe.exec(html))) {
    const slug = slugFromHref(m[1]);
    if (slug && !dates.has(slug)) dates.set(slug, m[2]);
  }
  for (const item of items) {
    item.date = dates.get(item.slug) || "";
  }
  return items;
}

function rewriteHtml(html) {
  if (!html) return "";
  return html
    .replace(/\s(src|href)=(["'])(?!https?:|\/\/|#|mailto:|tel:)([^"']+)\2/gi, (_, attr, q, url) => {
      return ` ${attr}=${q}${abs(url)}${q}`;
    })
    .replace(/url\((['"]?)(?!https?:|\/\/)([^'")]+)\1\)/gi, (_, q, url) => `url(${q}${abs(url)}${q})`);
}

function pickBlock(html, classPart) {
  const idx = html.search(new RegExp(`class="[^"]*${classPart}[^"]*"`, "i"));
  if (idx < 0) return "";
  const start = html.lastIndexOf("<", idx);
  if (start < 0) return "";
  const tagMatch = html.slice(start).match(/^<([a-z0-9]+)/i);
  if (!tagMatch) return "";
  const tag = tagMatch[1];
  let i = start;
  let depth = 0;
  const open = new RegExp(`<${tag}\\b`, "gi");
  const close = new RegExp(`</${tag}>`, "gi");
  const selfClose = new RegExp(`<${tag}\\b[^>]*/>`, "gi");
  while (i < html.length) {
    open.lastIndex = i;
    close.lastIndex = i;
    const o = open.exec(html);
    const c = close.exec(html);
    const nextOpen = o ? o.index : Infinity;
    const nextClose = c ? c.index : Infinity;
    if (nextOpen === Infinity && nextClose === Infinity) break;
    if (nextOpen < nextClose) {
      const chunk = html.slice(nextOpen, nextOpen + 200);
      if (selfClose.test(chunk) && selfClose.lastIndex) {
        i = nextOpen + 1;
        selfClose.lastIndex = 0;
        continue;
      }
      depth += 1;
      i = nextOpen + tag.length + 1;
    } else {
      depth -= 1;
      i = nextClose + tag.length + 3;
      if (depth === 0) return html.slice(start, i);
    }
    if (i - start > 400000) break;
  }
  return "";
}

function extractDetail(html) {
  const carousel = rewriteHtml(pickBlock(html, "main-detail-carousel"));
  const desc = rewriteHtml(pickBlock(html, "box-desc-detail"));
  const body = rewriteHtml(pickBlock(html, "detail mt20") || pickBlock(html, "\\bdetail\\b"));
  const h1 = decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "").replace(/<[^>]+>/g, "");
  const images = [];
  const blob = carousel + body;
  for (const m of blob.matchAll(/<img[^>]+src="([^"]+)"/gi)) {
    images.push(abs(m[1]));
  }
  return { title: h1, html: [carousel, desc, body].filter(Boolean).join("\n"), images };
}

async function scrapeList(path, maxHint = 30) {
  const firstUrl = `${ORIGIN}/${path}`;
  const first = await fetchHtml(firstUrl);
  const pages = Math.min(maxPage(first), maxHint);
  const all = listingItems(first);
  const seen = new Set(all.map((x) => x.slug));
  for (let p = 2; p <= pages; p++) {
    try {
      const html = await fetchHtml(`${ORIGIN}/${path}&page=${p}`);
      const items = listingItems(html);
      for (const item of items) {
        if (!seen.has(item.slug)) {
          seen.add(item.slug);
          all.push(item);
        }
      }
      process.stdout.write(`  ${path} page ${p}/${pages} (+${items.length}) total ${all.length}\n`);
      await sleep(120);
    } catch (err) {
      console.warn("list fail", path, p, err.message);
    }
  }
  return all;
}

async function pool(items, limit, worker) {
  const out = [];
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return out;
}

async function scrapeDetails(items) {
  return pool(items, 4, async (item, idx) => {
    try {
      const html = await fetchHtml(`${ORIGIN}/${item.slug}`);
      const detail = extractDetail(html);
      if (idx % 8 === 0) process.stdout.write(`  detail ${idx + 1}/${items.length} ${item.slug}\n`);
      await sleep(80);
      return {
        ...item,
        title: item.title || detail.title,
        html: detail.html,
        gallery: detail.images,
      };
    } catch (err) {
      console.warn("detail fail", item.slug, err.message);
      return { ...item, html: "", gallery: [] };
    }
  });
}

function collectSlugs(html) {
  const out = [];
  for (const m of html.matchAll(/href=(["'])([^"']+)\1/gi)) {
    let href = decode(m[2]).trim();
    if (href.startsWith("//")) continue;
    const slug = slugFromHref(href);
    if (!isArticleSlug(slug)) continue;
    out.push(slug);
  }
  return [...new Set(out)];
}

function homeSlides(html) {
  const slides = [];
  const seen = new Set();
  for (const m of html.matchAll(/src="([^"]*resize\/1215x680[^"]+)"/gi)) {
    const src = abs(m[1]);
    if (!seen.has(src)) {
      seen.add(src);
      slides.push(src);
    }
  }
  return slides;
}

export { scrapeList, scrapeDetails, listingItems };

async function main() {
  await mkdir(DATA, { recursive: true });
  console.log("Fetching homepage / about / contact…");
  const [homeHtml, aboutHtml, contactHtml] = await Promise.all([
    fetchHtml(ORIGIN + "/"),
    fetchHtml(ORIGIN + "/gioi-thieu"),
    fetchHtml(ORIGIN + "/lien-he"),
  ]);

  const about = rewriteHtml(
    pickBlock(aboutHtml, "box-desc-detail") ||
      pickBlock(aboutHtml, "section-detail") ||
      pickBlock(aboutHtml, "detail")
  );

  console.log("Scraping listings…");
  const [projects, products, services, news] = await Promise.all([
    scrapeList("du-an", 30),
    scrapeList("san-pham", 20),
    scrapeList("dich-vu", 10),
    scrapeList("tin-tuc", 10),
  ]);

  console.log("Scraping article bodies…", {
    projects: projects.length,
    products: products.length,
    services: services.length,
    news: news.length,
  });

  const [p1, p2, p3, p4] = await Promise.all([
    scrapeDetails(projects),
    scrapeDetails(products),
    scrapeDetails(services),
    scrapeDetails(news),
  ]);

  const site = {
    name: "Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát",
    shortName: "Việt Dũng Phát",
    tagline: "Atelier kiến trúc & nội thất",
    hotline: "08 6857 7057",
    phone: "098.4444.504",
    email: "vietdungphatconstruction@gmail.com",
    address: "942/2/7 Kha Vạn Cân, KP 2, Phường Trường Thọ, Tp. Thủ Đức",
    showroom: "Căn S5.01-2508 chung cư Vinhomes Grandpark, Nguyễn Xiển, TP. Thủ Đức (Q9), TP. HCM",
    workshop: "1750 Nguyễn Duy Trinh, TP. Thủ Đức, TP.HCM",
    facebook: "https://www.facebook.com/N%E1%BB%99i-Th%E1%BA%A5t-Gi%C3%A1-S%E1%BB%89-Tp-HCM-110692747859454/",
    zalo: "https://zalo.me/0984444504",
    youtube: "https://www.youtube.com/@vietdungphat7073",
    profilePdf: "http://vietdungphat.com/upload/files/ho-so-nang-luc-9558.pdf",
    map: { lat: 10.84909006186408, lng: 106.75370160842338 },
    logo: "http://vietdungphat.com/upload/hinhanh/logo-3495.png",
    aboutImage: "http://vietdungphat.com/upload/hinhanh/about-8486.png",
    slides: homeSlides(homeHtml),
    aboutHtml: about,
    contactHtml: rewriteHtml(
      pickBlock(contactHtml, "box-desc-detail") ||
        pickBlock(contactHtml, "content-main") ||
        pickBlock(contactHtml, "detail")
    ),
    aboutIntro: [
      "KIẾN TRÚC Việt Dũng Phát là thương hiệu kiến trúc nội thất của Công ty TNHH kiến trúc xây dựng Việt Dũng Phát với 6+ năm kinh nghiệm. Là một trong những công ty thiết kế và thi công uy tín hàng đầu tại Hồ Chí Minh và các tỉnh lân cận, website chính thức vietdungphat.com",
    ],
    fields: [
      "Thiết kế kiến trúc, nội thất công trình nhà ở dân dụng (nhà chia lô, nhà phố, biệt thự…)",
      "Thiết kế nội thất căn hộ chung cư.",
      "Thiết kế nội thất các dự án bất động sản, các căn hộ mẫu.",
      "Thiết kế nội thất các công trình dịch vụ: nhà hàng, khách sạn, showroom, văn phòng,…",
      "Thầu thi công xây dựng tất cả các công trình nhà ở dân dụng.",
    ],
    servicesHome: [
      {
        title: "Thi công",
        href: "/dich-vu",
        image: "http://vietdungphat.com/resize/727x320/1/upload/hinhanh/dichvu-3999.png",
      },
      {
        title: "Thiết kế",
        href: "/thiet-ke-noi-that-nha-o",
        image: "http://vietdungphat.com/resize/355x340/1/upload/hinhanh/dichvu2-5429.png",
      },
      {
        title: "Nội thất",
        href: "/",
        image:
          "http://vietdungphat.com/resize/390x715/1/upload/hinhanh/1313416533476842100603447741849071937948944n-7798.jpg",
      },
    ],
  };

  const known = new Set([...p1, ...p2, ...p3, ...p4].map((x) => x.slug));
  const extraSlugs = collectSlugs([homeHtml, aboutHtml, contactHtml].join("\n")).filter((s) => !known.has(s));
  console.log("Extra slugs from nav/home", extraSlugs);
  const extras = extraSlugs.length
    ? (await scrapeDetails(extraSlugs.map((slug) => ({ slug, title: slug, image: "", date: "" })))).filter(
        (p) => p.html
      )
    : [];

  const payload = { site, projects: p1, products: p2, services: p3, news: p4, extras };
  await writeFile(join(DATA, "content.json"), JSON.stringify(payload));
  console.log("Wrote src/data/content.json", {
    projects: p1.length,
    products: p2.length,
    services: p3.length,
    news: p4.length,
    extras: extras.length,
  });
}

const isDirect =
  process.argv[1] &&
  fileURLToPath(import.meta.url).replaceAll("\\", "/") ===
    process.argv[1].replaceAll("\\", "/");

if (isDirect) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

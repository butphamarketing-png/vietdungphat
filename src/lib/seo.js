import { findKeyword, keywordNewsPath } from "../data/keywords.js";

export const SITE_URL = "https://www.vietdungphat.com";
export const DEFAULT_OG = `${SITE_URL}/villas/villa-mansard-rong.jpg`;

export const PAGE_SEO = {
  "/": {
    title: "Thiết kế xây nhà tân cổ điển TP.HCM | Việt Dũng Phát",
    description:
      "Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát — thiết kế, xây dựng phần thô, nhà trọn gói và cải tạo nhà ở tại TP.HCM. Thành lập năm 2014, báo giá minh bạch.",
    keywords:
      "thiết kế nhà tân cổ điển, xây nhà trọn gói tphcm, xây nhà phần thô, cải tạo nhà tphcm, việt dũng phát",
  },
  "/gioi-thieu": {
    title: "Giới thiệu Việt Dũng Phát | Hồ sơ năng lực 2026",
    description:
      "Tìm hiểu Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát — thương hiệu thiết kế, thi công nhà phố, biệt thự tân cổ điển tại Hồ Chí Minh và các tỉnh lân cận.",
  },
  "/dich-vu": {
    title: "Dịch vụ thiết kế, xây dựng, cải tạo nhà | Việt Dũng Phát",
    description:
      "Thiết kế kiến trúc — nội thất, xây nhà trọn gói và cải tạo nhà cũ tại TP.HCM. Hồ sơ thi công đầy đủ, giám sát tại công trình.",
  },
  "/mau-nha": {
    title: "Mẫu nhà theo phong cách | Việt Dũng Phát",
    description:
      "8 phong cách mẫu nhà: tân cổ điển, hiện đại, mái Thái, mái Nhật, nhà phố, cấp 4 — mỗi phong cách khoảng 20 mẫu của Việt Dũng Phát.",
  },
  "/album": {
    title: "Album công trình tiêu biểu | Việt Dũng Phát",
    description:
      "Album video thi công và ảnh công trình theo dự án của Việt Dũng Phát. Mẫu nhà theo phong cách xem tại /mau-nha.",
  },
  "/du-an": {
    title: "Dự án và mẫu nhà | Việt Dũng Phát",
    description: "Danh sách dự án thiết kế, xây dựng nhà ở của Việt Dũng Phát — biệt thự, nhà phố, cải tạo.",
  },
  "/san-pham": {
    title: "Nội thất và combo từ xưởng | Việt Dũng Phát",
    description: "Nội thất tân cổ điển, combo căn hộ và sản phẩm từ xưởng sản xuất của Việt Dũng Phát.",
  },
  "/bao-gia": {
    title: "Báo giá xây nhà phần thô và trọn gói | Việt Dũng Phát",
    description:
      "Đơn giá xây dựng phần thô 3.950.000đ/m² và xây nhà trọn gói 5.950.000đ/m². Bảng giá tham khảo, khảo sát miễn phí tại TP.HCM.",
  },
  "/thuoc-lo-ban": {
    title: "Thước lỗ ban online | Việt Dũng Phát",
    description: "Tra thước lỗ ban 52.2, 42.9 và 38.8 — kích thước tốt xấu cho cửa, bậc, bàn thờ. Công cụ tham khảo phong thủy.",
  },
  "/tin-tuc": {
    title: "Tin tức xây nhà, thiết kế, cải tạo | Việt Dũng Phát",
    description:
      "100 bài tin tức theo từ khóa: xây nhà trọn gói, tân cổ điển, phần thô 3.950.000đ/m², cải tạo và báo giá tại TP.HCM.",
  },
  "/lien-he": {
    title: "Liên hệ và đặt lịch khảo sát | Việt Dũng Phát",
    description: "Liên hệ Việt Dũng Phát: 098.4444.504 — 942/2/7 Kha Vạn Cân, Thủ Đức. Đặt lịch khảo sát nhà miễn phí.",
  },
  "/tu-khoa": {
    title: "100 từ khóa xây nhà tân cổ điển, trọn gói, cải tạo | Việt Dũng Phát",
    description:
      "100 từ khóa phù hợp năng lực Việt Dũng Phát: xây nhà tân cổ điển, phần thô 3.950.000đ/m², trọn gói 5.950.000đ/m², thiết kế và cải tạo tại TP.HCM.",
  },
};

export function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function pageUrl(path = "/") {
  if (!path || path === "/") return `${SITE_URL}/`;
  const encoded = String(path)
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${SITE_URL}${encoded.startsWith("/") ? encoded : `/${encoded}`}`;
}

export function toIsoDate(date) {
  const match = String(date || "").match(/(\d{1,2})[/.](\d{1,2})[/.](\d{4})/);
  if (!match) return undefined;
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

export function absolutize(url) {
  if (!url) return DEFAULT_OG;
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${SITE_URL}${path}`;
}

/** Keep SERP titles ≤60: append brand only when it still fits. */
export function seoDocumentTitle(rawTitle, brand = "Việt Dũng Phát") {
  const raw = String(rawTitle || "").trim();
  if (!raw) return brand;
  if (raw.toLowerCase().includes(brand.toLowerCase())) return raw;
  const withBrand = `${raw} | ${brand}`;
  return withBrand.length <= 60 ? withBrand : raw;
}

export function excerptFromHtml(html, max = 158) {
  const text = String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function upsertMeta(attr, key, value) {
  if (!value) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]:not([hreflang])`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertHreflang(lang, href) {
  let el = document.head.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "alternate");
    el.setAttribute("hreflang", lang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function localBusinessJson(site = {}, extras = {}) {
  const phone = String(site.phone || "0984444504").replace(/\D/g, "");
  const json = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: site.name || "Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát",
    alternateName: site.shortName || "Việt Dũng Phát",
    url: SITE_URL,
    logo: absolutize(site.logo || "/logo.png"),
    image: DEFAULT_OG,
    telephone: phone ? `+84${phone.replace(/^0/, "")}` : undefined,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      addressLocality: "Thủ Đức",
      addressRegion: "Hồ Chí Minh",
      addressCountry: "VN",
    },
    geo: site.map?.lat
      ? { "@type": "GeoCoordinates", latitude: site.map.lat, longitude: site.map.lng }
      : undefined,
    sameAs: [site.facebook, site.youtube, site.zalo].filter(Boolean),
    areaServed: ["TP. Hồ Chí Minh", "Bình Dương", "Đồng Nai"],
    priceRange: "$$",
    inLanguage: "vi-VN",
    knowsAbout: [
      "Thiết kế nhà tân cổ điển",
      "Xây nhà trọn gói",
      "Xây nhà phần thô",
      "Cải tạo nhà",
      "Nội thất tân cổ điển",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: phone ? `+84${phone.replace(/^0/, "")}` : "+84984444504",
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: "Vietnamese",
    },
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Thiết kế kiến trúc và nội thất" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Xây dựng nhà phố, biệt thự" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cải tạo nhà" } },
    ],
  };
  if (extras.reviews?.length) {
    json.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: "5",
      bestRating: "5",
      reviewCount: String(extras.reviews.length),
    };
    json.review = extras.reviews.slice(0, 3).map((row) => ({
      "@type": "Review",
      author: { "@type": "Person", name: row.name },
      reviewBody: row.quote,
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    }));
  }
  return json;
}

export function pageSeoFromCms(pathname, cms) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const staticPage = PAGE_SEO[path];
  if (staticPage) {
    const album = cms.album;
    const albumTitle = path === "/album" && album?.title ? `${album.title} | Việt Dũng Phát` : staticPage.title;
    const albumDesc = path === "/album" && album?.lead ? album.lead : staticPage.description;
    return {
      title: albumTitle,
      description: albumDesc,
      keywords: staticPage.keywords,
      path,
      image: path === "/" ? cms.home?.poster || DEFAULT_OG : DEFAULT_OG,
      type: "website",
      reviews: path === "/" ? cms.reviews : undefined,
      breadcrumbs:
        path === "/"
          ? []
          : [
              { name: "Trang chủ", path: "/" },
              { name: staticPage.title.split("|")[0].trim(), path },
            ],
    };
  }

  if (path.startsWith("/tu-khoa/")) {
    const item = findKeyword(path.slice("/tu-khoa/".length));
    if (!item) {
      return {
        title: "Không tìm thấy từ khóa | Việt Dũng Phát",
        description: PAGE_SEO["/tu-khoa"].description,
        path,
        noindex: true,
      };
    }
    const newsPath = keywordNewsPath(item);
    return {
      title: item.title,
      description: item.description,
      path: newsPath,
      image: item.image,
      type: "article",
      noindex: true,
      article: { title: item.phrase },
      faq: item.faqs,
      breadcrumbs: [
        { name: "Trang chủ", path: "/" },
        { name: "Tin tức", path: "/tin-tuc" },
        { name: item.phrase, path: newsPath },
      ],
    };
  }

  const slug = path.slice(1);
  if (!slug || slug.includes("/")) {
    return {
      title: "Không tìm thấy trang | Việt Dũng Phát",
      description: PAGE_SEO["/"].description,
      path,
      noindex: true,
    };
  }

  const post = typeof cms.findPost === "function" ? cms.findPost(slug) : null;
  if (!post || post.visible === false) {
    return {
      title: "Không tìm thấy bài viết | Việt Dũng Phát",
      description: "Nội dung không tồn tại hoặc đã được gỡ khỏi website Việt Dũng Phát.",
      path,
      noindex: true,
    };
  }

  const meta = typeof cms.kindOf === "function"
    ? cms.kindOf(slug)
    : { label: "Bài viết", path: "/mau-nha" };
  const rawTitle = (post.seoTitle || post.title || "").trim();
  const title = seoDocumentTitle(rawTitle);
  const description = (
    post.seoDesc ||
    post.desc ||
    excerptFromHtml(post.html) ||
    PAGE_SEO["/"].description
  ).slice(0, 160);
  const keywords = [post.seoKeyword, post.seoKeywords].filter(Boolean).join(", ") || undefined;

  return {
    title,
    description,
    keywords,
    path,
    image: post.image,
    imageAlt: post.imageAlt || post.seoKeyword || post.title,
    type: "article",
    noindex: !!post.noindex,
    article: { title: post.title, datePublished: toIsoDate(post.date) },
    faq: post.faqs,
    breadcrumbs: [
      { name: "Trang chủ", path: "/" },
      { name: meta.label, path: meta.path },
      { name: post.title, path },
    ],
  };
}

export function injectSeoIntoHtml(html, { title, description, path, image, imageAlt, type = "website", noindex = false, keywords }) {
  const url = path ? pageUrl(path) : "";
  const img = absolutize(image);
  const esc = escapeAttr;
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
  out = out.replace(
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${esc(description)}" />`,
  );
  const tags = [
    ["name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"],
    ["name", "twitter:card", "summary_large_image"],
    ["property", "og:type", type],
    ["property", "og:locale", "vi_VN"],
    ["property", "og:site_name", "Việt Dũng Phát"],
    ["property", "og:title", title],
    ["property", "og:description", description],
    ["property", "og:image", img],
    ["property", "og:image:alt", imageAlt || title],
    ["property", "og:image:width", "1200"],
    ["property", "og:image:height", "630"],
    ["name", "twitter:title", title],
    ["name", "twitter:description", description],
    ["name", "twitter:image", img],
  ];
  if (url) {
    tags.push(["property", "og:url", url]);
  }
  if (keywords) tags.push(["name", "keywords", keywords]);
  for (const [attr, key, value] of tags) {
    const re = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`, "i");
    const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
    out = re.test(out) ? out.replace(re, tag) : out.replace("</head>", `    ${tag}\n  </head>`);
  }
  if (url) {
    if (/<link\s+rel="canonical"/i.test(out)) {
      out = out.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${esc(url)}" />`);
    } else {
      out = out.replace("</head>", `    <link rel="canonical" href="${esc(url)}" />\n  </head>`);
    }
    out = out.replace(/<link\s+rel="alternate"\s+hreflang="vi"[^>]*>/i, `<link rel="alternate" hreflang="vi" href="${esc(url)}" />`);
    out = out.replace(
      /<link\s+rel="alternate"\s+hreflang="x-default"[^>]*>/i,
      `<link rel="alternate" hreflang="x-default" href="${esc(url)}" />`,
    );
  }
  if (!url) {
    out = out.replace(/<link\s+rel="canonical"[^>]*>/i, "");
    out = out.replace(/<link\s+rel="alternate"[^>]*>/gi, "");
  }
  if (!keywords) {
    out = out.replace(/<meta\s+name="keywords"[^>]*>/i, "");
  }
  return out;
}

export function seoArticleHtml({ title, keyword }) {
  const kw = String(keyword || title || "").trim();
  return `<p><strong>${kw}</strong> là nhu cầu nhiều gia chủ tại TP.HCM tìm đến Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát. Bài viết nêu khi nào nên làm, quy trình khảo sát — thiết kế — thi công, và cách nhận báo giá minh bạch.</p>
<nav class="toc"><strong>Mục lục</strong>
<ol>
<li><a href="#phu-hop">${kw} phù hợp khi nào?</a></li>
<li><a href="#quy-trinh">Quy trình làm việc</a></li>
<li><a href="#chi-phi">Chi phí tham khảo</a></li>
</ol>
</nav>
<h2 id="phu-hop">${kw} phù hợp khi nào?</h2>
<p>Gia chủ nên làm rõ hiện trạng đất/nhà, công năng từng tầng, ngân sách và tiến độ trước khi chốt phương án. Việt Dũng Phát khảo sát tại chỗ, tư vấn hướng nhà, kết cấu và vật tư — không bán thầu.</p>
<h2 id="quy-trinh">Quy trình làm việc</h2>
<p>1. Khảo sát và trao đổi nhu cầu. 2. Phác thảo mặt bằng / phối cảnh (nếu thuộc thiết kế). 3. Báo giá theo m² hoặc hạng mục. 4. Thi công, giám sát, bàn giao. Bạn có thể đặt lịch tại trang liên hệ.</p>
<h2 id="chi-phi">Chi phí tham khảo</h2>
<p>Đơn giá xây phần thô và nhà trọn gói được niêm yết tại trang báo giá. Mỗi công trình ${kw} vẫn cần đo đạc thực tế vì móng, số tầng và hoàn thiện làm thay đổi dự toán.</p>
<h2>Câu hỏi thường gặp về ${kw}</h2>
<h3>Khảo sát có mất phí không?</h3>
<p>Khảo sát nhà tại TP.HCM được Việt Dũng Phát hỗ trợ theo lịch hẹn. Mang theo sổ hồng / bản vẽ hiện trạng nếu có để tư vấn chính xác hơn.</p>
<h3>Thi công mất bao lâu?</h3>
<p>Tiến độ phụ thuộc diện tích, số tầng và phạm vi ${kw}. Sau khảo sát, bạn nhận mốc thời gian theo giai đoạn phần thô và hoàn thiện.</p>
<p>Xem thêm <a href="/bao-gia">bảng báo giá</a>, <a href="/mau-nha">mẫu nhà</a> và <a href="https://dichvucong.gov.vn">Cổng Dịch vụ công Quốc gia</a> nếu cần thủ tục pháp lý.</p>
<p><img src="/villas/neo-01.jpg" alt="${kw}" /></p>
<p><img src="/villas/neo-07.jpg" alt="${kw} — công trình Việt Dũng Phát" /></p>
<p><img src="/villas/neo-11.jpg" alt="Mẫu nhà liên quan ${kw}" /></p>
<p><img src="/services/xay-dung.jpg" alt="Thi công ${kw} tại TP.HCM" /></p>`;
}

export function applySeo({ title, description, path, image, imageAlt, type = "website", noindex = false, breadcrumbs, article, site, faq, reviews, keywords }) {
  const url = pageUrl(path);
  const img = absolutize(image);
  document.title = title;
  upsertMeta("name", "description", description);
  if (keywords) upsertMeta("name", "keywords", keywords);
  else document.head.querySelector('meta[name="keywords"]')?.remove();
  upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
  upsertMeta("property", "og:type", type);
  upsertMeta("property", "og:locale", "vi_VN");
  upsertMeta("property", "og:site_name", "Việt Dũng Phát");
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:image", img);
  upsertMeta("property", "og:image:alt", imageAlt || title);
  upsertMeta("property", "og:image:width", "1200");
  upsertMeta("property", "og:image:height", "630");
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  upsertMeta("name", "twitter:image", img);
  if (article?.datePublished) upsertMeta("property", "article:published_time", article.datePublished);
  else document.head.querySelector('meta[property="article:published_time"]')?.remove();
  upsertLink("canonical", url);
  upsertHreflang("vi", url);
  upsertHreflang("x-default", url);

  if (site) upsertJsonLd("ld-org", localBusinessJson(site, { reviews: path === "/" ? reviews : undefined }));
  upsertJsonLd("ld-website", {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Việt Dũng Phát",
    url: SITE_URL,
    inLanguage: "vi-VN",
    publisher: { "@type": "Organization", name: "Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát" },
  });

  if (breadcrumbs?.length > 1) {
    upsertJsonLd("ld-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: pageUrl(item.path),
      })),
    });
  } else {
    document.getElementById("ld-breadcrumb")?.remove();
  }

  if (article) {
    upsertJsonLd("ld-article", {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description,
      keywords: keywords || imageAlt || undefined,
      image: imageAlt
        ? { "@type": "ImageObject", url: img, caption: imageAlt, name: imageAlt }
        : img,
      inLanguage: "vi-VN",
      datePublished: article.datePublished,
      dateModified: article.datePublished,
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "Việt Dũng Phát" },
      publisher: {
        "@type": "Organization",
        name: "Việt Dũng Phát",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
      },
    });
  } else {
    document.getElementById("ld-article")?.remove();
  }

  if (faq?.length) {
    upsertJsonLd("ld-faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((row) => ({
        "@type": "Question",
        name: row.q,
        acceptedAnswer: { "@type": "Answer", text: row.a },
      })),
    });
  } else {
    document.getElementById("ld-faq")?.remove();
  }
}

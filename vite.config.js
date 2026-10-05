import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import {
  DEFAULT_OG,
  PAGE_SEO,
  excerptFromHtml,
  injectSeoIntoHtml,
  pageUrl,
  seoDocumentTitle,
} from "./src/lib/seo.js";

const SPA_ROUTES = [
  "adminbp",
  "adminbp/login",
  "adminbp/cai-dat",
  "adminbp/trang-chu",
  "adminbp/album",
  "adminbp/mau-nha",
  "adminbp/san-pham",
  "adminbp/dich-vu",
  "adminbp/tin-tuc",
  "adminbp/bao-gia",
  "adminbp/trang",
  "adminbp/thu-vien",
  "adminbp/danh-gia",
  "adminbp/dat-lich",
  "adminbp/truy-cap",
  "adminbp/kho-anh",
  "adminbp/tai-khoan",
  "gioi-thieu",
  "du-an",
  "mau-nha",
  "nha-pho",
  "nha-pho/01",
  "nha-pho/02",
  "nha-pho/03",
  "nha-pho/04",
  "nha-pho/05",
  "nha-pho/06",
  "nha-pho/07",
  "nha-pho/08",
  "nha-pho/09",
  "nha-pho/10",
  "nha-pho/11",
  "nha-pho/12",
  "nha-pho/13",
  "album",
  "san-pham",
  "dich-vu",
  "bao-gia",
  "thuoc-lo-ban",
  "tin-tuc",
  "lien-he",
  "tu-khoa",
];

function writeHtml(file, html) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, html);
}

function spaFallbackHtml() {
  return {
    name: "spa-fallback-html",
    async closeBundle() {
      const dist = path.join(process.cwd(), "dist");
      const index = path.join(dist, "index.html");
      if (!existsSync(index)) return;
      const original = readFileSync(index, "utf8");
      const today = new Date().toISOString().slice(0, 10);

      writeFileSync(
        path.join(dist, "404.html"),
        injectSeoIntoHtml(original, {
          title: "Không tìm thấy trang | Việt Dũng Phát",
          description: "Trang không tồn tại hoặc đã được gỡ khỏi website Việt Dũng Phát.",
          noindex: true,
          image: DEFAULT_OG,
        }),
      );
      for (const route of SPA_ROUTES) {
        writeHtml(path.join(dist, route, "index.html"), original);
      }

      const urls = Object.entries(PAGE_SEO).map(([loc, meta]) => ({
        loc,
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
        image: loc === "/" ? DEFAULT_OG : DEFAULT_OG,
        type: "website",
      }));

      let data = {};
      try {
        data = JSON.parse(readFileSync(path.join(process.cwd(), "src/data/content.json"), "utf8"));
      } catch {
        data = {};
      }

      const reserved = new Set(
        Object.keys(PAGE_SEO)
          .map((p) => p.replace(/^\//, ""))
          .concat(["adminbp", "api", "assets", "files", "studio"]),
      );

      let keywordNews = [];
      let editorialNews = [];
      try {
        keywordNews = JSON.parse(readFileSync(path.join(process.cwd(), "src/data/keyword-news.json"), "utf8"));
      } catch {
        keywordNews = [];
      }
      try {
        editorialNews = JSON.parse(readFileSync(path.join(process.cwd(), "src/data/editorial-news.json"), "utf8"));
      } catch {
        editorialNews = [];
      }

      let houseStyles = [];
      try {
        const mod = await import(pathToFileURL(path.join(process.cwd(), "src/lib/house-style-media.js")).href);
        houseStyles = mod.HOUSE_STYLE_MEDIA || [];
      } catch {
        houseStyles = [];
      }

      for (const style of houseStyles) {
        if (!style?.slug || reserved.has(style.slug) || style.slug === "nha-pho" || style.slug === "nha-mai-nhat") continue;
        urls.push({
          loc: `/${style.slug}`,
          title: seoDocumentTitle(style.title),
          description: (style.desc || style.lead || PAGE_SEO["/"].description).slice(0, 160),
          image: `/mau-nha/${style.folder}/01.png`,
          imageAlt: style.alts?.[0] || style.title,
          type: "article",
        });
      }

      const catalogs = [
        { file: "nha-pho-samples.json", slug: "nha-pho", title: "Nhà phố", noun: "nhà phố" },
        { file: "nha-mai-nhat-samples.json", slug: "nha-mai-nhat", title: "Nhà mái Nhật", noun: "nhà mái Nhật" },
        { file: "nha-tan-co-dien-samples.json", slug: "nha-tan-co-dien", title: "Nhà tân cổ điển", noun: "nhà tân cổ điển" },
      ];
      for (const catalog of catalogs) {
        let samples = [];
        try {
          samples = JSON.parse(
            readFileSync(path.join(process.cwd(), "src/data", catalog.file), "utf8").replace(/^\uFEFF/, ""),
          );
        } catch {
          samples = [];
        }
        if (!samples.length) continue;
        urls.push({
          loc: `/${catalog.slug}`,
          title: seoDocumentTitle(catalog.title),
          description: `${samples.length} mẫu ${catalog.noun}. Mỗi mẫu là một bộ ảnh phối cảnh riêng.`.slice(0, 160),
          image: samples[0].cover || DEFAULT_OG,
          imageAlt: catalog.title,
          type: "website",
        });
        for (const sample of samples) {
          urls.push({
            loc: `/${catalog.slug}/${sample.id}`,
            title: seoDocumentTitle(sample.title),
            description: `${sample.title}: ${sample.images?.length || 0} ảnh phối cảnh ${catalog.noun} của Việt Dũng Phát.`.slice(0, 160),
            image: sample.cover || DEFAULT_OG,
            imageAlt: sample.title,
            type: "article",
          });
        }
      }

      if (!reserved.has("album")) {
        urls.push({
          loc: "/album",
          title: seoDocumentTitle("Dự án công trình"),
          description: PAGE_SEO["/mau-nha"]?.description || PAGE_SEO["/"].description,
          image: DEFAULT_OG,
          type: "website",
        });
      }

      for (const kind of ["projects", "products", "services", "news", "extras"]) {
        const extraNews = kind === "news" ? [...editorialNews, ...keywordNews] : [];
        const seenPost = new Set();
        for (const post of [...extraNews, ...(data[kind] || [])]) {
          if (!post?.slug || reserved.has(post.slug) || seenPost.has(post.slug)) continue;
          seenPost.add(post.slug);
          urls.push({
            loc: `/${post.slug}`,
            title: seoDocumentTitle(post.seoTitle || post.title),
            description: (post.seoDesc || post.desc || excerptFromHtml(post.html) || PAGE_SEO["/"].description).slice(0, 160),
            image: post.image || DEFAULT_OG,
            imageAlt: post.imageAlt || post.seoKeyword || post.title,
            type: "article",
          });
        }
      }

      const seen = new Set();
      const unique = [];
      for (const item of urls) {
        if (seen.has(item.loc)) continue;
        seen.add(item.loc);
        unique.push(item);
      }

      for (const item of unique) {
        const html = injectSeoIntoHtml(original, { ...item, path: item.loc });
        if (item.loc === "/") {
          writeFileSync(index, html);
          continue;
        }
        const rel = item.loc.replace(/^\//, "");
        if (!/^[a-z0-9-]+$/i.test(rel.replace(/\//g, ""))) continue;
        writeHtml(path.join(dist, rel, "index.html"), html);
        writeHtml(path.join(dist, `${rel}.html`), html);
      }

      const adminHtml = injectSeoIntoHtml(original, {
        title: "Quản trị | Việt Dũng Phát",
        description: "Khu vực quản trị website Việt Dũng Phát.",
        path: "/adminbp",
        noindex: true,
        image: DEFAULT_OG,
      });
      for (const route of SPA_ROUTES.filter((r) => r.startsWith("adminbp"))) {
        writeHtml(path.join(dist, route, "index.html"), adminHtml);
      }

      const sitemap = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
        ...unique.map((item) => {
          const loc = pageUrl(item.loc);
          const priority = item.loc === "/" ? "1.0" : item.type === "article" ? "0.6" : "0.8";
          const freq = item.loc === "/" ? "daily" : item.type === "article" ? "weekly" : "weekly";
          return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`;
        }),
        `</urlset>`,
        "",
      ].join("\n");
      writeFileSync(path.join(dist, "sitemap.xml"), sitemap);
    },
  };
}

function localApi() {
  return {
    name: "local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] || "";
        if (!url.startsWith("/api/")) return next();
        const rel = url.replace(/^\/api\//, "").replace(/\/$/, "");
        const file = path.join(process.cwd(), "api", `${rel}.js`);
        try {
          const exists = await import("node:fs/promises").then((fs) =>
            fs.access(file).then(
              () => true,
              () => false,
            ),
          );
          if (!exists) return next();
          const mod = await import(`${pathToFileURL(file).href}?t=${Date.now()}`);
          await mod.default(req, res);
        } catch (error) {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: error.message || "API error" }));
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);
  return {
    plugins: [react(), localApi(), spaFallbackHtml()],
    server: { port: 5173, host: true },
  };
});

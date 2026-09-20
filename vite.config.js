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
} from "./src/lib/seo.js";

const SPA_ROUTES = [
  "adminbp",
  "adminbp/login",
  "adminbp/cai-dat",
  "adminbp/trang-chu",
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
    closeBundle() {
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
      try {
        keywordNews = JSON.parse(readFileSync(path.join(process.cwd(), "src/data/keyword-news.json"), "utf8"));
      } catch {
        keywordNews = [];
      }

      for (const kind of ["projects", "products", "services", "news", "extras"]) {
        const extraNews = kind === "news" ? keywordNews : [];
        const seenPost = new Set();
        for (const post of [...extraNews, ...(data[kind] || [])]) {
          if (!post?.slug || reserved.has(post.slug) || seenPost.has(post.slug)) continue;
          seenPost.add(post.slug);
          urls.push({
            loc: `/${post.slug}`,
            title: /việt dũng phát/i.test((post.seoTitle || post.title || "").trim())
              ? (post.seoTitle || post.title)
              : `${(post.seoTitle || post.title || "").trim()} | Việt Dũng Phát`,
            description: (post.seoDesc || post.desc || excerptFromHtml(post.html) || PAGE_SEO["/"].description).slice(0, 160),
            image: post.image || DEFAULT_OG,
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

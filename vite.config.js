import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

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
];

function spaFallbackHtml() {
  return {
    name: "spa-fallback-html",
    closeBundle() {
      const index = path.join(process.cwd(), "dist", "index.html");
      if (!existsSync(index)) return;
      copyFileSync(index, path.join(process.cwd(), "dist", "404.html"));
      for (const route of SPA_ROUTES) {
        const dir = path.join(process.cwd(), "dist", route);
        mkdirSync(dir, { recursive: true });
        copyFileSync(index, path.join(dir, "index.html"));
      }
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

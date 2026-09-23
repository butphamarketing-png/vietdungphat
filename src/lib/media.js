const CMS_HOST = /^(www\.)?vietdungphat\.com$/i;
const WESERV_HOST = /^(images\.)?weserv\.nl$/i;
export const FALLBACK_IMAGE = "/villas/villa-cong-lon.jpg";
const FALLBACK_REMOTE = "www.vietdungphat.com/villas/villa-cong-lon.jpg";

function wrapWeserv(remote) {
  return `https://images.weserv.nl/?url=${encodeURIComponent(remote)}&default=${encodeURIComponent(FALLBACK_REMOTE)}`;
}

export function fullImage(src = "") {
  if (!src) return "";
  let url = src.trim().replace(/&amp;/g, "&");
  if (url.startsWith("//")) url = "http:" + url;
  url = url.replace(/\/resize\/[^/]+\/\d+\//i, "/");

  try {
    if (/^https?:\/\//i.test(url)) {
      const parsed = new URL(url);
      if (WESERV_HOST.test(parsed.hostname)) {
        const inner = parsed.searchParams.get("url") || "";
        if (/vietdungphat\.com/i.test(inner) && !parsed.searchParams.get("default")) {
          parsed.searchParams.set("default", FALLBACK_REMOTE);
          return parsed.toString();
        }
        return url;
      }
      if (CMS_HOST.test(parsed.hostname)) {
        const remote = `${parsed.hostname}${parsed.pathname}${parsed.search}`;
        return wrapWeserv(remote);
      }
    }
  } catch {
    /* keep original */
  }
  return url;
}

export function uniqueImages(list = []) {
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const src = fullImage(raw);
    if (!src || seen.has(src)) continue;
    if (/logo|icon-|facebook|zalo|no-image/i.test(src)) continue;
    seen.add(src);
    out.push(src);
  }
  return out;
}

export function keywordAlt(post = {}) {
  return String(post.seoKeyword || post.imageAlt || "").trim() || String(post.title || "Công trình Việt Dũng Phát").trim();
}

export function applyKeywordAlts(html = "", keyword = "") {
  const kw = String(keyword || "").trim();
  if (!html || !kw) return html;
  const safe = kw.replace(/"/g, "&quot;");
  return html.replace(/<img\b([^>]*)>/gi, (full, attrs) => {
    const match = attrs.match(/alt\s*=\s*(["'])([\s\S]*?)\1/i);
    const current = match ? match[2] : "";
    if (current.toLowerCase().includes(kw.toLowerCase())) return full;
    if (match) return `<img${attrs.replace(/alt\s*=\s*(["'])[\s\S]*?\1/i, `alt="${safe}"`)}>`;
    return `<img alt="${safe}"${attrs}>`;
  });
}

export function cleanArticleHtml(html = "", keyword = "") {
  if (!html) return "";
  const cleaned = html
    .replace(/<div[^>]*class="[^"]*main-detail-carousel[^"]*"[\s\S]*?(?=<div class="box-desc-detail")/i, "")
    .replace(/href="[^"]*javascript:[^"]*"/gi, 'href="#"')
    .replace(/\ssrc=(["'])([^"']+)\1/gi, (_, q, src) => ` src=${q}${fullImage(src)}${q} referrerpolicy=${q}no-referrer${q} loading=${q}lazy${q}`)
    .replace(/6\+\s*năm kinh nghiệm/gi, "thành lập năm 2014")
    .replace(/20\s*năm kinh nghiệm/gi, "thành lập năm 2014")
    .replace(/<h1(\s[^>]*)?>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>")
    .replace(/<img([^>]*?)alt=["']\s*["']/gi, `<img$1alt="${String(keyword || "Công trình Việt Dũng Phát").replace(/"/g, "&quot;")}"`);
  return applyKeywordAlts(cleaned, keyword);
}

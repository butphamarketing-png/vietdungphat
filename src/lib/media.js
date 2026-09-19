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

export function cleanArticleHtml(html = "") {
  if (!html) return "";
  return html
    .replace(/<div[^>]*class="[^"]*main-detail-carousel[^"]*"[\s\S]*?(?=<div class="box-desc-detail")/i, "")
    .replace(/href="[^"]*javascript:[^"]*"/gi, 'href="#"')
    .replace(/\ssrc=(["'])([^"']+)\1/gi, (_, q, src) => ` src=${q}${fullImage(src)}${q} referrerpolicy=${q}no-referrer${q} loading=${q}lazy${q}`)
    .replace(/6\+\s*năm kinh nghiệm/gi, "20 năm kinh nghiệm")
    .replace(/<h1(\s[^>]*)?>/gi, "<h2$1>")
    .replace(/<\/h1>/gi, "</h2>")
    .replace(/<img([^>]*?)alt=["']\s*["']/gi, `<img$1alt="Công trình Việt Dũng Phát"`);
}

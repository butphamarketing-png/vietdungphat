const CMS_HOST = /^(www\.)?vietdungphat\.com$/i;

export function fullImage(src = "") {
  if (!src) return "";
  let url = src.trim().replace(/&amp;/g, "&");
  if (url.startsWith("//")) url = "http:" + url;
  url = url.replace(/\/resize\/[^/]+\/\d+\//i, "/");

  try {
    if (/^https?:\/\//i.test(url)) {
      const parsed = new URL(url);
      if (CMS_HOST.test(parsed.hostname)) {
        return `/cms${parsed.pathname}${parsed.search}`;
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
    .replace(/\ssrc=(["'])([^"']+)\1/gi, (_, q, src) => ` src=${q}${fullImage(src)}${q} referrerpolicy=${q}no-referrer${q} loading=${q}lazy${q}`);
}

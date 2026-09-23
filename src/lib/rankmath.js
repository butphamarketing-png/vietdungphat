const POWER = [
  "bí quyết", "dễ dàng", "miễn phí", "uy tín", "trọn gói", "minh bạch", "nhanh", "ngay",
  "tốt nhất", "chuyên nghiệp", "cam kết", "thực tế", "mới nhất", "hoàn hảo", "chính hãng",
  "đảm bảo", "hiệu quả", "tiết kiệm", "an toàn", "chuẩn",
];
const SENTIMENT = [
  "tốt", "đẹp", "hài lòng", "tin cậy", "tuyệt vời", "hoàn hảo", "tiết kiệm", "rủi ro",
  "sai", "tránh", "đừng", "nên", "lợi", "hại", "yên tâm", "đáng",
];

export function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html) {
  return stripHtml(html).split(" ").filter(Boolean).length;
}

function hasPhrase(hay, needle) {
  if (!needle) return false;
  return String(hay || "").toLowerCase().includes(String(needle).toLowerCase());
}

function countPhrase(hay, needle) {
  if (!needle) return 0;
  const h = String(hay || "").toLowerCase();
  const n = String(needle).toLowerCase();
  let c = 0;
  let i = 0;
  while (n && (i = h.indexOf(n, i)) !== -1) {
    c += 1;
    i += n.length;
  }
  return c;
}

function paragraphs(html) {
  return String(html || "")
    .split(/<\/p>/i)
    .map((p) => stripHtml(p))
    .filter(Boolean);
}

function headingText(html) {
  const out = [];
  const re = /<h[2-6][^>]*>([\s\S]*?)<\/h[2-6]>/gi;
  let m;
  while ((m = re.exec(html || ""))) out.push(stripHtml(m[1]));
  return out.join(" ");
}

function imgAlts(html, imageAlt) {
  const alts = [imageAlt || ""];
  const re = /<img[^>]*alt=["']([^"']*)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html || ""))) alts.push(m[1]);
  return alts.join(" ");
}

function mediaCount(html, hasCover) {
  const imgs = (String(html || "").match(/<img\b/gi) || []).length + (hasCover ? 1 : 0);
  const vids = (String(html || "").match(/<video\b|youtube|vimeo/gi) || []).length;
  return imgs + vids;
}

function hasToc(html) {
  return /mục lục|table of contents|class=["'][^"']*toc/i.test(html || "") || /<nav[^>]*>[\s\S]*<a\s[^>]*href=["']#/i.test(html || "");
}

function internalLinks(html) {
  return (String(html || "").match(/href=["'](\/|https?:\/\/(www\.)?vietdungphat\.com)/gi) || []).length;
}

function externalFollow(html) {
  const re = /<a\s[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(html || ""))) {
    const href = m[1];
    if (/vietdungphat\.com/i.test(href)) continue;
    if (/rel=["'][^"']*nofollow/i.test(m[0])) continue;
    return true;
  }
  return false;
}

function lengthScore(words) {
  if (words > 2500) return 1;
  if (words >= 2000) return 0.7;
  if (words >= 1500) return 0.6;
  if (words >= 1000) return 0.4;
  if (words >= 600) return 0.2;
  return 0;
}

function mediaScore(n) {
  if (n >= 4) return 1;
  if (n >= 1) return 0.5;
  return 0;
}

export function analyzeRankMath(draft) {
  const primary = (draft.seoKeyword || "").trim();
  const secondary = String(draft.seoKeywords || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s.toLowerCase() !== primary.toLowerCase());
  const title = (draft.seoTitle || draft.title || "").trim();
  const desc = (draft.seoDesc || draft.desc || stripHtml(draft.html).slice(0, 160)).trim();
  const slug = draft.slug || "";
  const html = draft.html || "";
  const text = stripHtml(html);
  const words = wordCount(html);
  const kw = primary.toLowerCase();
  const slugKw = kw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const firstChunk = words < 300 ? text : text.slice(0, Math.max(1, Math.floor(text.length * 0.1)));
  const density = words ? (countPhrase(text, primary) / words) * 100 : 0;
  const fullUrl = `https://www.vietdungphat.com/${slug}`;
  const media = mediaCount(html, Boolean(draft.image));
  const alts = imgAlts(html, draft.imageAlt);
  const heads = headingText(html);
  const titleHalf = title.slice(0, Math.ceil(title.length * 0.5));
  const longPara = paragraphs(html).some((p) => p.split(" ").filter(Boolean).length > 120);

  const basic = [
    { ok: Boolean(primary), text: primary ? "Đã đặt Focus Keyword." : "Đặt Focus Keyword cho bài viết này.", weight: 8 },
    { ok: hasPhrase(title, primary), text: hasPhrase(title, primary) ? "Focus Keyword có trong SEO Title." : "Focus Keyword không xuất hiện trong SEO Title.", weight: 10 },
    { ok: hasPhrase(desc, primary) && desc.length >= 1, text: hasPhrase(desc, primary) ? "Focus Keyword có trong Meta Description." : "Focus Keyword không có trong SEO Meta Description.", weight: 10 },
    { ok: Boolean(primary) && slug.toLowerCase().includes(slugKw), text: slug.toLowerCase().includes(slugKw) ? "Focus Keyword có trong URL." : "Focus Keyword không có trong URL.", weight: 8 },
    { ok: hasPhrase(firstChunk, primary), text: hasPhrase(firstChunk, primary) ? "Focus Keyword nằm trong 10% nội dung đầu." : "Focus Keyword không xuất hiện ở đầu nội dung.", weight: 10 },
    { ok: hasPhrase(text, primary) && secondary.every((s) => hasPhrase(text, s)), text: hasPhrase(text, primary) ? "Focus Keyword có trong nội dung." : "Focus Keyword thiếu trong nội dung.", weight: 10 },
    { ok: words >= 600, partial: lengthScore(words), text: `Độ dài nội dung: ${words} từ (Rank Math: 600+ đạt, 2500+ điểm tối đa).`, weight: 12 },
  ];

  const additional = [
    { ok: hasPhrase(heads, primary), text: hasPhrase(heads, primary) ? "Focus Keyword có trong H2–H6." : "Thêm Focus Keyword vào tiêu đề phụ (H2, H3…).", weight: 6 },
    { ok: hasPhrase(alts, primary), text: hasPhrase(alts, primary) ? "Focus Keyword có trong alt hình." : "Thêm Focus Keyword vào thuộc tính alt của hình.", weight: 6 },
    {
      ok: density >= 1 && density <= 1.5,
      warn: density > 2.5,
      text: `Mật độ từ khóa ${density.toFixed(1)}% (mục tiêu 1% – 1.5%, cảnh báo nếu > 2.5%).`,
      weight: 5,
    },
    { ok: fullUrl.length <= 75, text: fullUrl.length <= 75 ? "Độ dài URL phù hợp (≤ 75 ký tự cả domain)." : `URL ${fullUrl.length} ký tự — Rank Math khuyến nghị ≤ 75.`, weight: 4 },
    { ok: internalLinks(html) > 0, text: internalLinks(html) ? "Đã có liên kết nội bộ." : "Thêm liên kết nội bộ vào nội dung.", weight: 4 },
    { ok: externalFollow(html), text: externalFollow(html) ? "Đã có liên kết ngoài (follow)." : "Thêm liên kết ngoài dofollow tới nguồn uy tín.", weight: 4 },
  ];

  const titleR = [
    { ok: hasPhrase(titleHalf, primary), text: hasPhrase(titleHalf, primary) ? "Focus Keyword nằm trong 50% đầu SEO Title." : "Đưa Focus Keyword lên nửa đầu SEO Title.", weight: 5 },
    { ok: SENTIMENT.some((w) => hasPhrase(title, w)), text: "SEO Title có từ cảm xúc (tốt, đẹp, yên tâm…).", weight: 2 },
    { ok: POWER.some((w) => hasPhrase(title, w)), text: "SEO Title có power word (trọn gói, minh bạch, miễn phí…).", weight: 2 },
    { ok: /\d/.test(title), text: /\d/.test(title) ? "SEO Title có số." : "Thêm một con số vào SEO Title (ví dụ 2026, 5x20).", weight: 2 },
  ];

  const contentR = [
    { ok: hasToc(html), text: hasToc(html) ? "Đã có mục lục / TOC." : "Thêm mục lục (table of contents) cho bài dài.", weight: 3 },
    { ok: !longPara, text: longPara ? "Có đoạn văn > 120 từ. Chia nhỏ đoạn." : "Các đoạn văn ngắn, dễ đọc (≤ 120 từ).", weight: 3 },
    { ok: media >= 1, partial: mediaScore(media), text: `Media: ${media} ảnh/video (pass từ 1, điểm tối đa từ 4).`, weight: 6 },
  ];

  const groups = [
    { id: "basic", label: "Basic SEO", items: basic },
    { id: "additional", label: "Additional SEO", items: additional },
    { id: "title", label: "Title Readability", items: titleR },
    { id: "content", label: "Content Readability", items: contentR },
  ];

  let earned = 0;
  let total = 0;
  for (const g of groups) {
    for (const item of g.items) {
      total += item.weight;
      if (item.warn) earned += item.weight * 0.2;
      else if (item.partial != null) earned += item.weight * item.partial;
      else if (item.ok) earned += item.weight;
    }
  }
  const score = total ? Math.round((earned / total) * 100) : 0;
  return { score, words, density, titleLen: title.length, descLen: desc.length, groups, primary };
}

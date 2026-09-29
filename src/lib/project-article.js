import { fullImage, uniqueImages } from "./media.js";
import { isHouseStyleSlug } from "./studio.js";

const FOOTER = /công ty tnhh|kiến trúc xây dựng việt dũng phát|kha vạn cân|vinhomes grandpark|nguyễn duy trinh|bài viết liên quan|liên hệ với chúng tôi để nhận tư vấn|thương hiệu của sự an tâm|showroom:|chi nhánh\s*\d|địa chỉ\s*:|hotline\s*:|email\s*:|website\s*:/i;

function esc(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decode(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function mostlyCaps(value) {
  const letters = String(value || "").replace(/[^\p{L}]/gu, "");
  if (letters.length < 4) return false;
  const upper = letters.replace(/[^\p{Lu}]/gu, "");
  return upper.length / letters.length > 0.6;
}

function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/(^|[\s/])(\p{L})/gu, (_, gap, ch) => gap + ch.toUpperCase())
    .replace(/\bTp\b/g, "TP")
    .replace(/\bQ(\d)/g, "Q$1");
}

function tidy(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return mostlyCaps(text) ? titleCase(text) : text;
}

function readable(line) {
  if (!mostlyCaps(line)) return line;
  let text = line.toLowerCase().replace(/^(\p{L})/u, (ch) => ch.toUpperCase());
  return text.replace(/\bnhật\b/g, "Nhật").replace(/\bbtct\b/g, "BTCT").replace(/\(\s*tổng/g, "(Tổng");
}

function sourceLines(html) {
  const raw = String(html || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/P(?=Việt Dũng Phát)/g, "");
  const seen = new Set();
  const out = [];
  for (let line of raw.split(/\n+/)) {
    if (/bài viết liên quan/i.test(line)) break;
    line = line.replace(/[ \t]+/g, " ").trim();
    line = line.replace(/\s+,/g, ",").replace(/,(\S)/g, ", $1").replace(/(\p{L})\.(\d)/gu, "$1, $2");
    line = line.replace(/tháng\s*(\d+)\s*[_./]\s*(\d{4})\s*\)?/i, "tháng $1/$2");
    if (line.length < 8 || FOOTER.test(line)) continue;
    if (/^dự\s*án\b/i.test(line) && line.length < 100) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(readable(line));
  }
  let sawFloors = false;
  let closed = false;
  return out.filter((line) => {
    const floor = /tầng\s*\d+\s*:/i.test(line);
    const repeat = /^(công năng|diện tích xây dựng|thiết kế theo phong cách)\b/i.test(line);
    if (closed && (floor || repeat || /^mái\s+|tổng diện tích/i.test(line))) return false;
    if (floor) sawFloors = true;
    if (sawFloors && /^mái\s+|tổng diện tích/i.test(line)) closed = true;
    return true;
  });
}

function plainParagraphs(html) {
  return sourceLines(html);
}

function isFloorList(text) {
  return /tầng\s*\d+\s*:/i.test(text) || /^diện tích xây dựng/i.test(text) || /^[-–]?\s*mái\s+/i.test(text);
}

function areaOf(text, label) {
  const re = new RegExp(`${label}\\s*[:：]?\\s*([0-9][0-9.,]*)\\s*m2`, "i");
  const found = String(text || "").match(re);
  return found ? `${found[1].replace(/\s+/g, "")}m2` : "";
}

function parseFloors(text) {
  const floors = [];
  const re = /tầng\s*(\d+)\s*:\s*(.+?)(?=\s+-?\s*tầng\s*\d+\s*:|\s+mái\s+|\s+tổng diện|$)/gi;
  for (const match of String(text || "").matchAll(re)) {
    const rooms = match[2].replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").replace(/[.\s]+$/g, "").trim();
    if (rooms.length < 3) continue;
    floors.push({ n: match[1], rooms });
  }
  return floors;
}

function houseType(blob) {
  const text = String(blob || "").toLowerCase();
  if (/biệt thự/.test(text)) return "Biệt thự";
  if (/căn hộ|chung cư/.test(text)) return "Căn hộ";
  if (/nhà phố/.test(text)) return "Nhà phố";
  if (/cấp\s*4/.test(text)) return "Nhà cấp 4";
  if (/cải tạo/.test(text)) return "Cải tạo";
  return "Nhà";
}

function clientAndPlace(title) {
  const clean = String(title || "")
    .replace(/^dự\s*án\s*:?\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const parts = clean.split(/\s*[-–—]\s*/).map((part) => part.trim()).filter(Boolean);
  const clientMatch = tidy(clean).match(/(?:^|[^\p{L}])((?:anh|chị|cô|chú|bác|ông|bà)\s+\p{L}+(?:\s+\p{L}+){0,3})/iu);
  let client = clientMatch ? tidy(clientMatch[1]) : "";
  client = client.replace(/\s+(đường|phường|quận|tp|tại|khu).*$/i, "").trim();
  let place = tidyPlace(parts.slice(1).join(", "));
  if (client) place = tidyPlace(place.replace(new RegExp(client, "ig"), ""));
  if (!place) {
    const rest = tidy(parts[0] || clean).replace(/^(nhà phố|căn hộ|biệt thự|nhà)\s+/i, "");
    if (!client) place = tidyPlace(rest);
  }
  const quan = tidy(clean).match(/quận\s*\d+|thủ đức|đồng nai|bình dương|long an|bình thuận|vũng tàu|tiền giang|đắk nông|phú yên|bình định|đà nẵng|cà mau/i);
  if (/trệt|lầu/i.test(place)) {
    const city = place.match(/thủ đức|đồng nai|bình dương|long an|bình thuận|vũng tàu|tiền giang|hồ chí minh|đà nẵng|quận\s*\d+/i);
    place = city ? tidy(city[0]) : "";
  }
  if (quan && place && !place.toLowerCase().includes(quan[0].toLowerCase())) {
    place = tidyPlace([place, tidy(quan[0])].filter(Boolean).join(", "));
  }
  const district = place.match(/quận\s*\d+/i);
  if (district && /đường/i.test(place)) place = tidy(district[0]);
  return { client, place };
}

function tidyPlace(raw) {
  let text = tidy(raw).replace(/(^|[\s,])T\s+(?=\p{Lu})/gu, "$1").replace(/\s+/g, " ").trim();
  text = text.replace(/\bTp\b/g, "TP");
  const parts = text.split(/\s*[,–—]\s*/).map((part) => part.trim()).filter(Boolean);
  const seen = new Set();
  const out = [];
  for (const part of parts) {
    const short = part.replace(/^(phường|p\.|tp\.?|thành phố|tỉnh)\s+/i, "").trim();
    const key = short.toLowerCase();
    if (!key || key === "tp" || seen.has(key)) continue;
    seen.add(key);
    out.push(short);
  }
  return out.slice(-2).join(", ");
}

function firstSpecText(paragraphs) {
  const idx = paragraphs.findIndex((text) => /tầng\s*1\s*:/i.test(text));
  if (idx < 0) return paragraphs.filter(isFloorList).slice(0, 2).join(" ");
  const block = [];
  for (let i = idx - 1; i >= Math.max(0, idx - 3); i -= 1) {
    if (/diện tích|phong cách/i.test(paragraphs[i])) block.unshift(paragraphs[i]);
  }
  for (let i = idx; i < paragraphs.length; i += 1) {
    if (block.length && !/tầng\s*\d+\s*:|^công năng|^mái\s+/i.test(paragraphs[i])) break;
    block.push(paragraphs[i]);
  }
  return block.join(" ");
}

export function projectFacts(post = {}) {
  const paragraphs = plainParagraphs(post.html);
  const spec = firstSpecText(paragraphs);
  const blob = `${spec} ${paragraphs.slice(0, 2).join(" ")}`;
  const who = clientAndPlace(post.title);
  const styleMatch = spec.match(/phong cách\s+(.+?)(?=\s+công\b|[.]|$)/i) || blob.match(/phong cách\s+(.+?)(?=\s+công\b|[.]|$)/i);
  let style = styleMatch ? styleMatch[1].replace(/\s+/g, " ").trim() : "";
  style = style.replace(/\s+(pha|chút|hơi|với|và)$/i, "");
  if (style.length > 28) style = style.split(/\s+/).slice(0, 2).join(" ");
  const roofMatch = spec.match(/mái\s+(btct|thái|nhật|bằng|ngói|tôn)/i);
  const floors = parseFloors(spec);
  const floorNums = floors.map((floor) => Number(floor.n));
  const floorsClean = floorNums.length > 0 && floorNums.every((n, index) => n === index + 1);
  const level = blob.match(/(\d+)\s*trệt(?:\s*,\s*(\d+)\s*lầu)?(?:\s*,\s*(\d+)\s*sân thượng)?/i);
  const floorCount = floorsClean ? floorNums.length : level ? Number(level[1]) + Number(level[2] || 0) + Number(level[3] || 0) : 0;
  const span = blob.match(/(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*m\b/i);
  return {
    ...who,
    type: houseType(`${post.title || ""} ${blob}`),
    area: (String(spec).match(/(?<!tổng\s)diện tích(?!\s+trệt)(?:\s+xây dựng)?\s*[:：]?\s*([0-9][0-9.,]*)\s*m2/iu) || [])[1]
      ? `${(String(spec).match(/(?<!tổng\s)diện tích(?!\s+trệt)(?:\s+xây dựng)?\s*[:：]?\s*([0-9][0-9.,]*)\s*m2/iu) || [])[1]}m2`
      : "",
    total: areaOf(spec, "tổng diện tích xây dựng"),
    style: style ? style.toLowerCase() : "",
    roof: roofMatch ? (roofMatch[1].toUpperCase() === "BTCT" ? "BTCT" : roofMatch[1].toLowerCase()) : "",
    floors,
    floorCount,
    span: span ? `${span[1]}x${span[2]}m` : "",
    levelText: level ? level[0] : "",
    paragraphs,
  };
}

export function projectHeadline(post = {}) {
  if (!post || post.houseStyle || isHouseStyleSlug(post.slug)) return post.title || "";
  const facts = projectFacts(post);
  const title = tidy(String(post.title || "").replace(/^dự\s*án\s*:?\s*/i, ""));
  const placeOk = facts.place && !/trệt|lầu|tầng/i.test(facts.place);
  if (!facts.client || !placeOk) return title;
  const bits = [facts.type];
  if (facts.style && !facts.type.toLowerCase().includes(facts.style)) bits.push(facts.style);
  if (facts.floorCount && facts.type !== "Nhà cấp 4") bits.push(`${facts.floorCount} tầng`);
  if (facts.span) bits.push(facts.span);
  else if (facts.area) bits.push(facts.area);
  const right = [facts.client, facts.place].filter(Boolean).join(", ");
  const left = bits.join(" ");
  return right ? `${left} – ${right}` : left;
}

function galleryHtml(post, alt) {
  const fromHtml = [...String(post.html || "").matchAll(/src=(["'])([^"']+)\1/gi)].map((match) => match[2]);
  const photos = uniqueImages([post.image, ...(post.gallery || []), ...fromHtml].map((src) => fullImage(src))).slice(0, 12);
  if (!photos.length) return "";
  return `<div class="article-gallery">${photos
    .map((src, index) => `<figure><img src="${esc(src)}" alt="${esc(`${alt} – ảnh ${index + 1}`)}" /></figure>`)
    .join("")}</div>`;
}

export function expandProjectHtml(post = {}) {
  if (!post || post.houseStyle || isHouseStyleSlug(post.slug)) return "";
  const lines = sourceLines(post.html);
  const blocks = lines.map((line) => `<p>${esc(line)}</p>`);
  if (!blocks.length) return "";
  blocks.push(galleryHtml(post, projectHeadline(post)));
  return blocks.join("");
}

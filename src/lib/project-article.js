import { fullImage, uniqueImages } from "./media.js";
import { isHouseStyleSlug } from "./studio.js";

const FOOTER = /công ty tnhh|kiến trúc xây dựng việt dũng phát|kha vạn cân|vinhomes grandpark|nguyễn duy trinh|bài viết liên quan|liên hệ với chúng tôi để nhận tư vấn|thương hiệu của sự an tâm|showroom:/i;

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

function lowerFirst(value) {
  return String(value || "").replace(/^\p{Lu}/u, (ch) => ch.toLowerCase());
}

function plainParagraphs(html) {
  const seen = new Set();
  const out = [];
  for (const match of String(html || "").matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)) {
    let text = decode(match[1]).replace(/P(?=Việt Dũng Phát)/g, "");
    const cut = text.split(FOOTER)[0].trim();
    text = (cut || text).replace(/\s+,/g, ",").replace(/,(\S)/g, ", $1");
    if (text.length < 36 || FOOTER.test(text)) continue;
    if (/^dự\s*án\b/i.test(text) && text.length < 90) continue;
    const key = text.slice(0, 110).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
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
  const chunks = String(text || "").split(/\s+-\s*tầng\s*/i).slice(1);
  for (const chunk of chunks) {
    const match = chunk.match(/^(\d+)\s*:\s*(.+)/i);
    if (!match) continue;
    let rooms = match[2]
      .replace(/\s*mái\s+[\s\S]*$/i, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/\s+/g, " ")
      .replace(/[.\s]+$/g, "")
      .trim();
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
  if (quan && !place.toLowerCase().includes(quan[0].toLowerCase())) {
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
  if (idx < 0) return paragraphs.filter(isFloorList).slice(0, 1).join(" ");
  const block = [];
  if (idx > 0 && /^diện tích|^thiết kế theo phong cách/i.test(paragraphs[idx - 1])) block.push(paragraphs[idx - 1]);
  block.push(paragraphs[idx]);
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
  const level = blob.match(/(\d+)\s*trệt(?:\s*,\s*(\d+)\s*lầu)?(?:\s*,\s*(\d+)\s*sân thượng)?/i);
  const namedFloors = blob.match(/(\d+)\s*tầng/i);
  const floorCount = floors.length || (level ? Number(level[1]) + Number(level[2] || 0) + Number(level[3] || 0) : namedFloors ? Number(namedFloors[1]) : 0);
  const span = blob.match(/(\d+(?:[.,]\d+)?)\s*x\s*(\d+(?:[.,]\d+)?)\s*m\b/i);
  return {
    ...who,
    type: houseType(`${post.title || ""} ${blob}`),
    area: areaOf(spec, "diện tích(?:\\s+xây dựng)?") || ((blob.match(/(\d+)\s*m2/i) || [])[1] ? `${(blob.match(/(\d+)\s*m2/i) || [])[1]}m2` : ""),
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
  if (!facts.client && !facts.area && !facts.floorCount && !facts.style && !facts.place && !facts.span) {
    return tidy(String(post.title || "").replace(/^dự\s*án\s*:?\s*/i, ""));
  }
  const bits = [facts.type];
  if (facts.style && !facts.type.toLowerCase().includes(facts.style)) bits.push(facts.style);
  if (facts.floorCount && facts.type !== "Nhà cấp 4") bits.push(`${facts.floorCount} tầng`);
  if (facts.span) bits.push(facts.span);
  else if (facts.area) bits.push(facts.area);
  const right = [facts.client, facts.place].filter(Boolean).join(", ");
  const left = bits.join(" ");
  return right ? `${left} – ${right}` : left;
}

function introParagraph(facts) {
  const who = facts.client ? ` của ${lowerFirst(facts.client)}` : "";
  const where = facts.place ? ` tại ${facts.place}` : "";
  const bits = [];
  if (facts.span) bits.push(`mặt bằng ${facts.span}`);
  else if (facts.area) bits.push(`diện tích xây dựng ${facts.area}`);
  if (facts.style) bits.push(`phong cách ${facts.style}`);
  if (facts.floorCount && !facts.levelText) bits.push(`${facts.floorCount} tầng`);
  if (facts.levelText && !facts.floors.length) bits.push(facts.levelText.toLowerCase());
  if (facts.roof) bits.push(`mái ${facts.roof}`);
  const detail = bits.length ? ` ${bits[0].replace(/^./, (ch) => ch.toUpperCase())}${bits.slice(1).length ? `, ${bits.slice(1).join(", ")}` : ""}.` : "";
  return `Công trình${who}${where} do Việt Dũng Phát thiết kế và thi công.${detail}`;
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
  const facts = projectFacts(post);
  const narrative = facts.paragraphs.filter((text) => !isFloorList(text)).slice(0, 3);
  const blocks = [];
  if (facts.client || facts.area || facts.floors.length || facts.place) {
    blocks.push(`<p>${esc(introParagraph(facts))}</p>`);
  }
  for (const text of narrative) blocks.push(`<p>${esc(text)}</p>`);
  if (facts.floors.length) {
    blocks.push("<h3>Công năng từng tầng</h3>");
    for (const floor of facts.floors) {
      blocks.push(`<p><strong>Tầng ${esc(floor.n)}.</strong> ${esc(floor.rooms)}.</p>`);
    }
  }
  if (facts.total && facts.total !== facts.area) {
    blocks.push(`<p>Tổng diện tích xây dựng ghi trong hồ sơ là ${esc(facts.total)}.</p>`);
  }
  if (!blocks.length) return "";
  blocks.push(
    "<p>Hạng mục thi công theo bản vẽ đã duyệt. Nghiệm thu cùng chủ nhà rồi bàn giao, và bảo hành sau khi nhà được đưa vào sử dụng.</p>",
  );
  blocks.push(galleryHtml(post, projectHeadline(post)));
  return blocks.join("");
}

import { fullImage, uniqueImages } from "./media.js";
import { isHouseStyleSlug } from "./studio.js";

const FOOTER = /công ty tnhh|kiến trúc xây dựng việt dũng phát|kha vạn cân|vinhomes grandpark|nguyễn duy trinh|bài viết liên quan|liên hệ với chúng tôi để nhận tư vấn|thương hiệu của sự an tâm|showroom:|chi nhánh\s*\d|hotline\s*:|email\s*:|website\s*:/i;

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
    line = line.replace(/(\d)\s*,\s*(\d)(?=\s*[*x×])/g, "$1,$2");
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
  client = client.replace(/\s+(đường|phường|quận|tp|tại|khu|diện tích|m2).*$/i, "").trim();
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
  return { client, place };
}

function tidyPlace(raw) {
  let text = tidy(raw).replace(/(^|[\s,])T\s+(?=\p{Lu})/gu, "$1").replace(/\s+/g, " ").trim();
  text = text.replace(/\bTp\b/g, "TP");
  const parts = text.split(/\s*[,–—]\s*/).map((part) => part.trim()).filter(Boolean);
  const seen = new Set();
  const out = [];
  for (const part of parts) {
    const short = part.replace(/^(phường|p\.|tp\.?|thành phố|tỉnh|đường)\s+/i, "").trim();
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
  const styleStop = String.raw`(?=\s+công\b|\s+-\s*tầng|[.]|$)`;
  const styleMatch = spec.match(new RegExp(`phong cách\\s+(.+?)${styleStop}`, "i")) || blob.match(new RegExp(`phong cách\\s+(.+?)${styleStop}`, "i"));
  let style = styleMatch ? styleMatch[1].replace(/\s+/g, " ").trim() : "";
  style = style.split(/\s+(?:pha|hơi|chút|hướng)\b/i)[0].trim();
  style = style.replace(/\s+(với|và)$/i, "");
  if (style.length > 40) style = style.split(/\s+/).slice(0, 4).join(" ");
  const roofMatch = spec.match(/mái\s+(btct|thái|nhật|bằng|ngói|tôn)/i);
  const floors = parseFloors(spec);
  const floorNums = floors.map((floor) => Number(floor.n));
  const floorsClean = floorNums.length > 0 && floorNums.every((n, index) => n === index + 1);
  const level = blob.match(/(\d+|một|hai|ba|bốn)\s*trệt(?:\s*,?\s*(\d+|một|hai|ba|bốn)\s*lầu)?(?:\s*,?\s*(\d+|một)\s*sân\s*thượng)?/i);
  const levelNum = (token) => (/^\d+$/.test(token || "") ? Number(token) : { một: 1, hai: 2, ba: 3, bốn: 4 }[(token || "").toLowerCase()] || 0);
  const floorCount = floorsClean ? floorNums.length : level ? levelNum(level[1]) + levelNum(level[2]) + levelNum(level[3]) : 0;
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

function prettyArea(value) {
  return String(value || "").replace(/(\d)\s*m2/i, "$1 m2");
}

function footprintOf(text) {
  const found = String(text || "").match(/(\d+)\s*,\s*(\d+)\s*[*x×]\s*(\d+(?:[.,]\d+)?)\s*m\b/i)
    || String(text || "").match(/(\d+(?:[.,]\d+)?)\s*[*x×]\s*(\d+(?:[.,]\d+)?)\s*m\b/i);
  if (!found) return "";
  return found[3] ? `${found[1]},${found[2]}x${found[3]}m` : `${found[1]}x${found[2]}m`;
}

function jobWhen(text) {
  const month = String(text || "").match(/tháng\s*(\d{1,2})\s*\/\s*(\d{4})/i);
  if (month) return `Tháng ${Number(month[1])}/${month[2]}`;
  const year = String(text || "").match(/năm xây dựng\s*(\d{4})/i);
  return year ? year[1] : "";
}

function jobMonths(text) {
  const found = String(text || "").match(/(?:thời gian(?:\s+xây dựng)?|thi công trong)\s*[:：]?\s*(\d+)\s*tháng/i);
  return found ? `${found[1]} tháng` : "";
}

function jobService(text) {
  const blob = String(text || "");
  if (/xây dựng nhà trọn gói|thi công trọn gói/i.test(blob)) return "Xây dựng nhà trọn gói";
  if (/thiết kế và thi công/i.test(blob)) return "Thiết kế và thi công";
  return "";
}

function jobUse(paragraphs) {
  const idx = paragraphs.findIndex((line) => /^[·•*\s]*công năng\b/i.test(line));
  if (idx >= 0) {
    let text = paragraphs[idx].replace(/^[·•*\s]*công năng\s*:?\s*/i, "").replace(/^sử dụng\s+/i, "").replace(/^[-–]\s*/, "").trim();
    const next = paragraphs[idx + 1] || "";
    if (text && !/phòng/i.test(text) && /phòng/i.test(next)) text = `${text} ${next}`.trim();
    if (text.length > 6) return text;
  }
  const floors = paragraphs
    .filter((line) => /tầng\s*\d+\s*:/i.test(line))
    .map((line) => line.replace(/^[-–]\s*/, "").trim());
  if (floors.length) return floors.join("; ");
  const rooms = paragraphs.find((line) => /phòng ngủ|nhà vệ sinh/i.test(line) && !/^diện tích/i.test(line) && line.length < 240);
  return rooms ? rooms.replace(/^[-–]\s*/, "").trim() : "";
}

function normalizeLevel(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .replace(/một|hai|ba|bốn/g, (word) => ({ một: "1", hai: "2", ba: "3", bốn: "4" }[word]));
}

function scaleOf(facts, title, paragraphs) {
  const list = Array.isArray(paragraphs) ? paragraphs : [];
  const blob = list.join(" ");
  const stated = labeled(list, "quy mô");
  if (stated) return stated;
  const levelRe = /(\d+|một|hai|ba|bốn)\s*trệt(?:\s*,?\s*(\d+|một|hai|ba|bốn)\s*lầu)?(?:\s*,?\s*(\d+|một)\s*sân\s*thượng)?/i;
  const fromBody = blob.match(levelRe);
  const fromTitle = String(title || "").match(levelRe);
  if (fromBody) return normalizeLevel(fromBody[0]);
  if (facts.levelText) return normalizeLevel(facts.levelText);
  if (fromTitle) return normalizeLevel(fromTitle[0]);
  const floors = `${title || ""} ${blob}`.match(/(?:nhà phố|biệt thự|căn hộ|nhà|project)\s+(\d+)\s*tầng/i);
  if (floors) return `${floors[1]} tầng`;
  if (facts.floorCount && facts.type !== "Nhà cấp 4") return `${facts.floorCount} tầng`;
  if (facts.type && facts.type !== "Nhà") return facts.type;
  return "";
}

function labeled(paragraphs, name) {
  const list = Array.isArray(paragraphs) ? paragraphs : String(paragraphs || "").split(/\n/);
  const re = new RegExp(`^[·•*\\s]*${name}\\s*:\\s*(.+)$`, "i");
  const line = list.find((item) => re.test(item));
  return line ? line.match(re)[1].replace(/\s+/g, " ").trim() : "";
}

function niceName(value) {
  const text = String(value || "").replace(/^[·•*]\s*/, "").trim();
  if (!text) return "";
  if (mostlyCaps(text) || text === text.toLowerCase()) return titleCase(text);
  return text;
}

function knownPlace(text) {
  const re = /hiệp bình chánh|quận\s*\d+|thủ đức|biên hòa|vũng tàu|đồng nai|bình dương|long an|bình thạnh|gò vấp|tân bình|bình chánh|dĩ an|trảng dài|trảng bom|phú nhuận|tây ninh|long khánh|nhà bè|cần giờ|hồ chí minh|đà nẵng|bình thuận|tiền giang|quảng ngãi|lâm đồng|kiên giang|ninh thuận|buôn ma thuột|phú yên|bình định|cà mau/gi;
  const seen = new Set();
  const out = [];
  for (const match of String(text || "").matchAll(re)) {
    const key = match[0].toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(tidy(match[0]));
  }
  return out.slice(0, 2).join(", ");
}

export function projectBrief(post = {}) {
  if (!post || post.houseStyle || isHouseStyleSlug(post.slug)) return null;
  const facts = projectFacts(post);
  const paragraphs = facts.paragraphs || [];
  const blob = paragraphs.join(" ");
  const thin = /nội dung đang cập nhật/i.test(blob) && !facts.area && !facts.span && !facts.floorCount && !facts.levelText;
  if (thin) return null;
  const scale = scaleOf(facts, post.title, paragraphs);
  const scaleShown = scale && !/^(nhà phố|căn hộ|biệt thự|cải tạo|nhà cấp 4)$/i.test(scale) ? scale : "";
  const statedArea = labeled(paragraphs, "diện tích").replace(/(\d)\s*,\s*(\d)/g, "$1,$2");
  const loose = (paragraphs.find((line) => /^nhà\s+[0-9]/i.test(line) && /m2/i.test(line)) || "").match(/([0-9][0-9.,]*)\s*m2/i);
  const foot = statedArea || facts.span || footprintOf(blob);
  const built = foot || facts.area || (loose ? `${loose[1]}m2` : "");
  const tret = (blob.match(/diện tích trệt\s*[:：]?\s*([0-9][0-9.,]*)\s*m2/i) || [])[1];
  const when = jobWhen(blob);
  const months = jobMonths(blob);
  const use = jobUse(paragraphs);
  const service = jobService(blob);
  if (!built && !when && !use && !scaleShown) return null;
  const areaChip = built ? prettyArea(built) : tret ? `Trệt ${prettyArea(`${tret}m2`)}` : "";
  const chips = [
    scaleShown ? { key: "scale", label: "Quy mô", value: scaleShown } : null,
    areaChip ? { key: "area", label: "Diện tích", value: areaChip } : null,
    when ? { key: "date", label: "Ngày khởi công", value: when } : null,
  ].filter(Boolean);
  const sizeRow = built ? prettyArea(built) : tret ? `Trệt ${prettyArea(`${tret}m2`)}` : "";
  const scope = scaleShown && facts.type && facts.type !== "Nhà" && !scaleShown.toLowerCase().includes(facts.type.toLowerCase())
    ? `${facts.type} ${scaleShown}`
    : scaleShown;
  const client = niceName(labeled(paragraphs, "chủ đầu tư") || facts.client);
  const statedPlace = labeled(paragraphs, "địa chỉ");
  let place = statedPlace || facts.place;
  if (!statedPlace && (!place || /trệt|lầu|\d+\s*tầng/i.test(place) || place.split(/\s+/).length > 5)) {
    place = knownPlace(`${post.title} ${blob}`);
  }
  const rows = [
    client ? ["Chủ đầu tư", client] : null,
    place ? ["Địa chỉ", place] : null,
    sizeRow ? ["Diện tích", sizeRow] : null,
    tret && (facts.area || built) && !/x/i.test(String(built)) ? ["Diện tích trệt", prettyArea(`${tret}m2`)] : null,
    scope ? ["Quy mô", scope] : null,
    use ? ["Công năng", use] : null,
    months ? ["Thời gian xây dựng", months] : null,
    service ? ["Dịch vụ", service] : null,
  ].filter(Boolean).map(([label, value]) => ({ label, value }));
  if (!chips.length && rows.length < 2) return null;
  return { chips, rows, caption: projectHeadline(post) };
}

export function projectHeadline(post = {}) {
  if (!post || post.houseStyle || isHouseStyleSlug(post.slug)) return post.title || "";
  const facts = projectFacts(post);
  const title = tidy(String(post.title || "").replace(/^dự\s*án\s*:?\s*/i, ""));
  const placeOk = facts.place && !/trệt|lầu|tầng/i.test(facts.place);
  if (!facts.client || !placeOk) return title;
  const bits = [facts.type];
  if (facts.style && !facts.type.toLowerCase().includes(facts.style)) bits.push(facts.style);
  const scale = scaleOf(facts, post.title, facts.paragraphs);
  const scaleBit = scale && !new RegExp(`^${facts.type}$`, "i").test(scale)
    ? scale.replace(new RegExp(`^${facts.type}\\s+`, "i"), "")
    : "";
  if (scaleBit && !facts.type.toLowerCase().includes(scaleBit.toLowerCase())) bits.push(scaleBit);
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

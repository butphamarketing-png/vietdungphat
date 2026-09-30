import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { analyzeRankMath } from "../src/lib/rankmath.js";
import keywordNews from "../src/data/keyword-news.json" with { type: "json" };
import content from "../src/data/content.json" with { type: "json" };
import { COPY } from "./editorial-copy.mjs";

const POOL = [
  "/bai/xay-nha-tron-goi-tphcm-1.png",
  "/bai/xay-nha-tron-goi-tphcm-4.png",
  "/bai/xay-nha-pho-5x20-3.png",
  "/bai/xay-nha-pho-5x20-5.png",
  "/bai/thi-cong-nha-o-dan-dung-tphcm-1.png",
  "/bai/thiet-ke-nha-pho-tphcm-1.png",
  "/bai/xay-nha-1-tret-2-lau-tphcm-4.png",
  "/bai/cai-tao-noi-that-nha-pho-1.png",
  "/bai/nha-thau-xay-dung-uy-tin-tphcm-2.png",
  "/bai/cong-ty-xay-dung-nha-o-tphcm-1.png",
  "/bai/thiet-ke-mat-tien-nha-pho-4.png",
  "/bai/xay-nha-hoan-thien-tphcm-5.png",
  "/mau-nha/nha-pho/01.png",
  "/mau-nha/nha-pho/06.png",
  "/mau-nha/tan-co-dien/01.png",
  "/mau-nha/mai-thai/05.png",
  "/mau-nha/1-tret-1-lau/03.png",
  "/interior/noi-that-tan-co-dien.png",
];

const TAILS = [
  "nên chọn uy tín 2026",
  "nên làm minh bạch 2026",
  "nên hỏi chuẩn 2026",
  "nên chốt an toàn 2026",
  "nên giữ cam kết 2026",
];

const taken = new Set([
  ...keywordNews.map((p) => p.slug),
  ...(content.news || []).map((p) => p.slug),
  ...(content.projects || []).map((p) => p.slug),
  ...(content.products || []).map((p) => p.slug),
  ...(content.services || []).map((p) => p.slug),
  ...(content.extras || []).map((p) => p.slug),
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
  "adminbp",
  "album",
]);

function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wordsOf(html) {
  return String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

function countPhrase(text, needle) {
  const h = String(text).toLowerCase();
  const n = String(needle).toLowerCase();
  let c = 0;
  let i = 0;
  while (n && (i = h.indexOf(n, i)) !== -1) {
    c += 1;
    i += n.length;
  }
  return c;
}

function splitLong(text) {
  const bits = String(text)
    .split(/(?<=\.)\s+/)
    .flatMap((sentence) => {
      const words = sentence.trim().split(/\s+/).filter(Boolean);
      if (words.length <= 90) return [sentence.trim()];
      const parts = sentence.split(/,\s+/);
      const out = [];
      let buf = [];
      for (const part of parts) {
        const next = [...buf, part];
        if (next.join(", ").split(/\s+/).filter(Boolean).length > 80 && buf.length) {
          out.push(buf.join(", "));
          buf = [part];
        } else buf = next;
      }
      if (buf.length) out.push(buf.join(", "));
      return out.map((s) => s.trim()).filter(Boolean);
    })
    .filter(Boolean);
  const out = [];
  let buf = [];
  const count = (arr) => arr.join(" ").split(/\s+/).filter(Boolean).length;
  for (const bit of bits) {
    if (count([...buf, bit]) > 90 && buf.length) {
      out.push(buf.join(" "));
      buf = [bit];
    } else buf.push(bit);
  }
  if (buf.length) out.push(buf.join(" "));
  return out;
}

function makeTitle(kw, i) {
  const cap = kw.charAt(0).toUpperCase() + kw.slice(1);
  let title = `${cap} ${TAILS[i % TAILS.length]}`;
  const extras = [" cho nhà phố", " trước khi xây", " với gia chủ", " khi làm nhà", " tại công trình"];
  let e = 0;
  const ok = () => title.slice(0, Math.ceil(title.length / 2)).toLowerCase().includes(kw);
  while (!ok() && e < extras.length) title += extras[e++];
  while (!ok()) title += " nay";
  return title;
}

function makeDesc(kw, blurb) {
  const cap = kw.charAt(0).toUpperCase() + kw.slice(1);
  let d = `${cap} — ${blurb}`.replace(/\s+/g, " ").trim();
  if (d.length > 158) d = d.slice(0, 158).trim();
  if (d.length < 120) d = `${d} Khảo sát trước khi chốt dự toán.`;
  if (d.length > 158) d = d.slice(0, 158).trim();
  return d;
}

function dateOf(i) {
  const d = new Date(Date.UTC(2026, 8, 29));
  d.setUTCDate(d.getUTCDate() - i);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

function imgsFor(i) {
  const cover = POOL[i % POOL.length];
  const body = [1, 2, 3].map((n) => POOL[(i + n * 5) % POOL.length]).filter((src, idx, arr) => src !== cover && arr.indexOf(src) === idx);
  while (body.length < 3) body.push(POOL[(i + body.length + 7) % POOL.length]);
  return { cover, body: body.slice(0, 3) };
}

function tune(html, kw) {
  const pads = [
    `Đơn giá mét vuông chỉ là mốc; hồ sơ ${kw} vẫn đo lại móng, hẻm và số tầng.`,
    `Hợp đồng nên ghi phạm vi ${kw}, vật tư và cách tính mét vuông trước khi tạm ứng.`,
    `Gia chủ nên xem một công trình đang làm trước khi chốt ${kw}.`,
    `Khảo sát ${kw} theo lịch hẹn; nên mang sổ hồng hoặc ảnh hiện trạng.`,
    `Dự toán và tiến độ của ${kw} gửi sau khi đo đất, không gửi khi mới nghe diện tích.`,
    `Nhật ký hiện trường giúp đối chiếu ${kw} lúc nghiệm thu phần khuất.`,
    `Gọi 098.4444.504 khi cần trao đổi tiến độ ${kw}.`,
    `Đá, mái và thang máy không gộp vào gói ${kw} nếu phụ lục chưa ký.`,
  ];
  let out = html;
  for (let n = 0; n < 24; n++) {
    const text = wordsOf(out).join(" ");
    const words = text ? text.split(" ").length : 0;
    const hits = countPhrase(text, kw);
    const density = words ? (hits / words) * 100 : 0;
    if (density >= 1.08 && density <= 1.42) break;
    if (density > 1.42) {
      const lower = out.toLowerCase();
      const needle = kw.toLowerCase();
      let last = -1;
      let search = 0;
      const guard = out.indexOf('id="can-lam"');
      while (needle) {
        const at = lower.indexOf(needle, search);
        if (at === -1) break;
        const before = out.lastIndexOf("<", at);
        const after = out.lastIndexOf(">", at);
        if (!(before > after) && at > guard) last = at;
        search = at + needle.length;
      }
      if (last === -1) break;
      out = `${out.slice(0, last)}hạng mục này${out.slice(last + kw.length)}`;
      continue;
    }
    const pad = pads[n % pads.length];
    const mark = 'id="can-lam"';
    const start = out.indexOf(mark);
    const close = start === -1 ? -1 : out.indexOf("</p>", start);
    if (close === -1) out += `<p>${esc(pad)}</p>`;
    else out = `${out.slice(0, close + 4)}<p>${esc(pad)}</p>${out.slice(close + 4)}`;
  }
  return out;
}

function buildHtml(item, i) {
  const kw = item.kw;
  const { body } = imgsFor(i);
  const sections = item.sections;
  const toc = sections
    .map((s) => `<li><a href="#${s.id}">${esc(s.h.replace(/<[^>]+>/g, ""))}</a></li>`)
    .join("");
  const first = sections[0];
  const blocks = [
    `<nav class="toc" aria-label="Mục lục"><p>Mục lục</p><ol>${toc}</ol></nav>`,
  ];
  sections.forEach((s, si) => {
    blocks.push(`<h2 id="${s.id}">${esc(s.h)}</h2>`);
    const paras = s.ps.flatMap(splitLong);
    paras.forEach((p, pi) => {
      blocks.push(`<p>${esc(p)}</p>`);
      if (si === 1 && pi === 0) {
        blocks.push(`<img src="${body[0]}" alt="${esc(kw)} — phối cảnh minh họa, không phải ảnh chụp hiện trường">`);
      }
      if (si === 2 && pi === 0) {
        blocks.push(`<img src="${body[1]}" alt="Phối cảnh minh họa cho ${esc(kw)}">`);
      }
    });
    if (si === sections.length - 2) {
      blocks.push(`<img src="${body[2]}" alt="${esc(kw)} trên bản vẽ minh họa của Việt Dũng Phát">`);
    }
  });
  blocks.push(
    `<p>Với ${esc(kw)}, xem <a href="/bao-gia">báo giá xây nhà</a>, <a href="/mau-nha">mẫu nhà</a> và <a href="/gioi-thieu">giới thiệu công ty</a>. Đặt khảo sát tại <a href="/lien-he">trang liên hệ</a>. Thủ tục hành chính tham chiếu <a href="https://dichvucong.gov.vn/">Cổng dịch vụ công quốc gia</a>. Văn phòng 942/2/7 Kha Vạn Cân, Trường Thọ, Thủ Đức. Hotline 098.4444.504.</p>`,
  );
  if (!first.h.toLowerCase().includes(kw)) throw new Error(`H2 thiếu từ khóa: ${kw}`);
  const joined = first.ps.join(" ");
  if (!joined.toLowerCase().includes(kw)) throw new Error(`Mở bài thiếu từ khóa: ${kw}`);
  for (const sec of item.sec) {
    const all = sections.map((s) => s.ps.join(" ")).join(" ");
    if (!all.toLowerCase().includes(sec.toLowerCase())) throw new Error(`Thiếu từ phụ "${sec}" trong ${kw}`);
  }
  return tune(thicken(blocks.join(""), item), kw);
}

function thicken(html, item) {
  const hint = item.blurb.replace(/\.$/, "");
  const bits = [
    `Trước khi tạm ứng, đối chiếu bảng giá với mô tả này: ${hint}. Dòng nào không có trong bảng thì chưa được xem là đã bao gồm.`,
    `Việc liên quan tới ${item.sec[0]} nên có ngày nghiệm thu riêng, ảnh và người ký. Không gộp vào một dòng hoàn thiện chung khi đang làm ${hint}.`,
    `Việc liên quan tới ${item.sec[1]} cần nói ai cung cấp, ai kiểm tra, ai chịu nếu làm sai. Bỏ trống ba ý này thì dễ cãi sau khi thi công phần ${hint}.`,
    `Nhật ký của hồ sơ “${hint}” nên ghi thời tiết, số người và việc đang dở. Một câu làm bình thường không giúp đối chiếu.`,
    `Với hiện trạng “${hint}”, ảnh móng, thép, ống nước và lớp chống thấm phải chụp trước khi che khuất, rồi lưu cùng hợp đồng.`,
    `Nếu phát sinh so với phạm vi “${hint}”, cần khối lượng và chữ ký trước khi làm. Làm xong mới gửi giá là thứ tự dễ thiệt.`,
    `Mẫu vật tư cho phần “${hint}” duyệt một lần, có mã hoặc tên hãng. Đổi sau khi đã đặt thì lập phụ lục chênh lệch.`,
    `Biên bản bàn giao việc “${hint}” nên kèm danh mục còn lại và số người phụ trách bảo hành, không chỉ giữ bản vẽ phối cảnh.`,
    `Khi đường vào hoặc giấy phép khác buổi khảo sát “${hint}”, dừng để tính lại biện pháp. Không thi công theo trí nhớ.`,
    `Nội thất gắn với việc “${hint}” phải đo sau khi tường tô xong. Cắt gỗ theo kích thước lúc nhà còn thô thường bị lệch.`,
  ];
  let out = html;
  let i = 0;
  while (wordsOf(out).length < 1080 && i < bits.length) {
    const para = `<p>${esc(bits[i])}</p>`;
    const mark = 'id="faq"';
    const start = out.indexOf(mark);
    const close = start === -1 ? -1 : out.indexOf("</p>", start);
    if (close === -1) out += para;
    else out = `${out.slice(0, close + 4)}${para}${out.slice(close + 4)}`;
    i += 1;
  }
  return out;
}

if (COPY.length !== 50) throw new Error(`Cần đúng 50 bài, đang có ${COPY.length}`);

const seenSlug = new Set();
const seenPara = new Map();
const posts = COPY.map((item, i) => {
  const slug = slugify(item.kw);
  if (taken.has(slug) || seenSlug.has(slug)) throw new Error(`Trùng slug ${slug}`);
  seenSlug.add(slug);
  for (const src of [imgsFor(i).cover, ...imgsFor(i).body]) {
    if (!existsSync(new URL(`../public${src}`, import.meta.url))) throw new Error(`Thiếu ảnh ${src}`);
  }
  const full = `https://www.vietdungphat.com/${slug}`;
  if (full.length > 75) throw new Error(`URL dài ${full.length}: ${full}`);
  if (!slug.includes(slugify(item.kw))) throw new Error(`Slug không chứa từ khóa ${slug}`);
  for (const s of item.sections) {
    for (const p of s.ps) {
      const key = p.replace(/\s+/g, " ").trim();
      if (key.split(" ").length < 25) continue;
      if (seenPara.has(key)) throw new Error(`Đoạn lặp giữa "${seenPara.get(key)}" và "${item.kw}"`);
      seenPara.set(key, item.kw);
    }
  }
  const title = makeTitle(item.kw, i);
  const desc = makeDesc(item.kw, item.blurb);
  const html = buildHtml(item, i);
  const { cover } = imgsFor(i);
  const post = {
    slug,
    source: "editorial",
    group: "dong-nam",
    title,
    image: cover,
    imageAlt: item.kw,
    date: dateOf(i),
    html,
    gallery: [],
    seoKeyword: item.kw,
    seoKeywords: item.sec.join(", "),
    seoTitle: title,
    seoDesc: desc,
    desc,
    faqs: item.faqs.map(([q, a]) => ({ q, a })),
  };
  const report = analyzeRankMath(post);
  const failed = [];
  for (const g of report.groups) {
    for (const check of g.items) {
      if (check.warn) failed.push(check.text);
      else if (!check.ok) failed.push(check.text);
    }
  }
  if (report.words < 1000) failed.push(`bài ngắn ${report.words} từ`);
  if (desc.length < 110 || desc.length > 160) failed.push(`desc ${desc.length}`);
  if (!desc.toLowerCase().includes(item.kw)) failed.push("desc thiếu từ khóa");
  if (failed.length) {
    throw new Error(`${slug} (${report.words} từ, ${report.density.toFixed(2)}%, điểm ${report.score}): ${failed.join(" | ")}`);
  }
  return { post, report };
});

writeFileSync(new URL("../src/data/editorial-news.json", import.meta.url), JSON.stringify(posts.map((x) => x.post)));
const words = posts.map((x) => x.report.words);
console.log(
  JSON.stringify({
    posts: posts.length,
    minWords: Math.min(...words),
    maxWords: Math.max(...words),
    minScore: Math.min(...posts.map((x) => x.report.score)),
    slugs: posts.map((x) => x.post.slug),
  }),
);

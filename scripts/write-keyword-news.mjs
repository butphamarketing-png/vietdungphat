import { writeFileSync } from "node:fs";
import data from "../src/data/content.json" with { type: "json" };
import { KEYWORDS } from "../src/data/keywords.js";

const IMGS = ["/studio/08.jpg", "/studio/11.jpg", "/studio/10.jpg", "/studio/07.jpg", "/studio/09.jpg", "/studio/01.jpg", "/studio/05.jpg", "/studio/02.jpg"];

const reserved = new Set([
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
  "api",
  "assets",
  "files",
  "studio",
]);
for (const kind of ["projects", "products", "services", "news", "extras"]) {
  for (const p of data[kind] || []) if (p?.slug) reserved.add(p.slug);
}

function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function newsSlug(item) {
  return reserved.has(item.slug) ? `tin-${item.slug}` : item.slug;
}

function dateOf(i) {
  const d = new Date(Date.UTC(2026, 8, 19));
  d.setUTCDate(d.getUTCDate() - i);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

const GROUP = {
  "xay-dung": {
    angle: "nhà mới từ móng đến bàn giao",
    risk: "chốt thầu chỉ theo đơn giá m² rồi phát sinh móng, mái và điện nước",
    do: "khảo sát đất, chốt mặt bằng từng tầng, làm hồ sơ xin phép, thi công móng — khung — mái rồi hoàn thiện",
    cost: "phần thô khoảng 3.950.000đ/m², trọn gói khoảng 5.950.000đ/m² (tham khảo 2026, chưa gồm móng đặc biệt và nội thất rời)",
  },
  "tan-co-dien": {
    angle: "nhà phố và biệt thự mái mansard, phào chỉ, sảnh cột",
    risk: "làm mặt đứng tân cổ điển trên kết cấu nhà hộp nên tỷ lệ mái — cột — ban công bị lệch",
    do: "chốt tỷ lệ mặt đứng 3D, chi tiết phào — con tiện — mái, rồi thi công thô và hoàn thiện đồng bộ",
    cost: "đơn giá thô / trọn gói theo m² vẫn dùng; phào, mái mansard và đá ốp mặt tiền tính phụ lục",
  },
  "thiet-ke": {
    angle: "hồ sơ kiến trúc đủ để xin phép và thi công",
    risk: "mua phối cảnh đẹp nhưng thiếu bản kết cấu — điện nước nên đội thợ tự ý khi làm",
    do: "đo hiện trạng, 2–3 phương án công năng, chốt phong cách, xuất hồ sơ xin phép và bản vẽ thi công",
    cost: "thiết kế báo theo diện tích và hạng mục kiến trúc — kết cấu — MEP — nội thất, không gộp chung giá xây thô",
  },
  "cai-tao": {
    angle: "nhà cũ nâng cấp mà không nhất thiết phá dỡ hết",
    risk: "đục tường chịu lực hoặc nâng tầng khi chưa khảo sát móng",
    do: "khảo sát kết cấu, liệt kê hạng mục, báo giá từng phần, thi công cuốn chiếu",
    cost: "cải tạo tính theo hạng mục, không áp một đơn giá m² cho mọi nhà",
  },
  "noi-that": {
    angle: "đóng nội thất theo bản vẽ tại xưởng",
    risk: "mua rời nhiều nơi rồi lệch màu, lệch kích thước khi lắp",
    do: "đo hiện trạng, chốt concept, sản xuất tại xưởng, lắp đặt và bàn giao",
    cost: "nội thất tính theo thiết kế chi tiết, tách khỏi đơn giá xây thô 3.950.000đ/m²",
  },
  "bao-gia": {
    angle: "đọc đúng phạm vi trong đơn giá",
    risk: "so sánh hai báo giá khác phạm vi (tim tường / thông thủy, có mái, có móng)",
    do: "xem bảng niêm yết, gửi diện tích, khảo sát, nhận dự toán tách thô — hoàn thiện — phát sinh",
    cost: "3.950.000đ/m² phần thô và 5.950.000đ/m² trọn gói là mốc 2026 tại Việt Dũng Phát",
  },
  "khu-vuc": {
    angle: "thi công đúng địa bàn, giấy phép phường/xã và giờ đổ bê tông khu dân cư",
    risk: "chọn thầu xa, không hiểu hẻm, lộ giới và trạm trộn gần công trình",
    do: "hẹn khảo sát tại nhà, xem hướng và lộ giới, tư vấn giấy phép, thi công theo giờ được phép",
    cost: "đơn giá gốc theo m² toàn thành; vận chuyển vật tư làm lệch nhẹ từng khu",
  },
  "phong-thuy": {
    angle: "hướng nhà, thước lỗ ban và giấy phép trước khi động thổ",
    risk: "chọn ngày đẹp nhưng bỏ PCCC, lộ giới và kết cấu",
    do: "đối chiếu thước lỗ ban, chốt hướng cổng, lập hồ sơ xin phép, chọn ngày động thổ mang tính tham khảo",
    cost: "công cụ thước lỗ ban trên web miễn phí; phí thiết kế / xin phép báo sau khảo sát",
  },
  "thuong-hieu": {
    angle: "chọn nhà thầu có hồ sơ năng lực và không bán thầu",
    risk: "ký với môi giới rồi không biết ai giám sát công trường",
    do: "xem mẫu nhà thật, tải hồ sơ năng lực, khảo sát, nhận phương án rồi mới ký",
    cost: "bảng giá công khai; khảo sát tư vấn theo lịch hẹn tại TP.HCM",
  },
};

const MISTAKES = [
  "ký hợp đồng khi chưa thống nhất cách tính diện tích (tim tường hay thông thủy)",
  "đổi gạch, sơn, thiết bị vệ sinh sau khi đã đổ sàn hoặc đóng trần",
  "bỏ chống thấm sàn vệ sinh và mái để tiết kiệm vài triệu đầu vào",
  "không ghi thương hiệu thép — xi măng — gạch trong phụ lục",
  "giao một mình đội thợ tự mua vật tư mà không có nhật ký khối lượng",
  "quên chỗ để xe máy và lối vào bếp khi chốt mặt bằng",
  "nâng tầng trên móng cũ mà chưa khoan kiểm tra",
  "làm mặt tiền đắt tiền trong khi điện nước âm còn thiếu ống chờ",
  "so giá biệt thự mái mansard với nhà phố trơn bằng cùng một mức m²",
  "động thổ khi giấy phép còn thiếu hoặc lộ giới chưa chốt với phường",
];

const ASK = [
  "sổ hồng hoặc giấy tờ đất, ảnh hiện trạng bốn mặt và số người ở thường xuyên",
  "số phòng ngủ, có phòng thờ hay không, xe hơi hay xe máy, có cần thang máy hay không",
  "ngân sách khung (thô / trọn gói / nội thất) để KTS không thiết kế vượt khả năng",
  "hướng nhà hiện tại, hẻm bao nhiêu mét, xe bê tông vào được không",
  "muốn ở tạm trong lúc sửa hay bàn giao trống nhà",
];

const LOCAL = [
  "Thủ Đức và khu đông TP.HCM hay gặp nhà phố sâu, hẹp mặt tiền — mặt bằng phải tính giếng trời sớm",
  "Gò Vấp, Bình Thạnh nhiều hẻm: giờ đổ bê tông và chỗ tập kết gạch quyết định tiến độ hơn cả nhân công",
  "Quận 7, Nhà Bè nền đất yếu hơn khu gò — móng phải khảo sát, không copy nhà bên cạnh",
  "Bình Tân, Tân Phú nhà ống 4×16 / 5×20 chiếm đa số, công năng tầng trệt để xe là điểm nghẽn",
  "Dĩ An, Thuận An, Biên Hòa: vận chuyển vật tư và giấy phép huyện khác TP.HCM một nhịp",
  "Bình Chánh, hẻm xa quốc lộ: nên chốt trạm trộn và ca đổ trước khi ký tiến độ",
];

const MATERIALS = [
  "thép, xi măng PCB40, gạch ống, chống thấm mái và keo chà mạch sàn vệ sinh",
  "cửa, lan can, mái tôn hoặc mái ngói, sơn nước ngoại thất chịu mưa",
  "phào, con tiện, đá ốp mặt tiền nếu làm tân cổ điển",
  "hệ điện âm, ống nước PPR, hộp kỹ thuật chờ máy lạnh",
];

const TITLE = [
  (kw) => `${cap(kw)}: kinh nghiệm gia chủ TP.HCM 2026`,
  (kw) => `${cap(kw)} — checklist trước khi chọn nhà thầu`,
  (kw) => `Cập nhật ${kw}: quy trình, chi phí và lưu ý`,
  (kw) => `${cap(kw)}: sai lầm hay gặp và cách xử lý`,
  (kw) => `Gia chủ hỏi gì khi tìm ${kw}?`,
];

function html(item, index) {
  const kw = item.phrase;
  const g = GROUP[item.group];
  const img = (k) => IMGS[(index + k) % IMGS.length];
  const m1 = pick(MISTAKES, index);
  const m2 = pick(MISTAKES, index + 3);
  const m3 = pick(MISTAKES, index + 6);
  const loc = pick(LOCAL, index);
  const ask = pick(ASK, index);
  const mat = pick(MATERIALS, index);
  const year = 2026;
  const rooms = 3 + (index % 3);
  const span = pick(["4×16", "4×20", "5×16", "5×20", "6×20"], index);
  const weeks = 12 + (index % 10);
  const dist = item.group === "khu-vuc" ? kw.replace(/^xây nhà /i, "") : pick(["Thủ Đức", "Gò Vấp", "Bình Thạnh", "Tân Bình", "Dĩ An"], index);

  return `<p>Năm ${year}, nhiều gia chủ tại ${dist} tìm <strong>${kw}</strong> khi đã có đất hoặc nhà cũ nhưng chưa biết bắt đầu từ hồ sơ, ngân sách hay chọn thầu. Bài viết ghi lại cách Việt Dũng Phát tiếp cận ${g.angle} — không phải bài chào giá chung.</p>
<p>${loc}. Với ${kw}, khảo sát hiện trạng quan trọng hơn con số trên mạng.</p>
<p><img src="${img(0)}" alt="${kw} — khảo sát hiện trạng tại TP.HCM" /></p>
<h2>Gia chủ thường hỏi gì về ${kw}?</h2>
<p>Câu hỏi lặp lại: hết bao nhiêu, bao lâu, có ở được trong lúc làm không, và ai chịu trách nhiệm nếu thấm. Câu trả lời đúng cho ${kw} luôn đi kèm hiện trạng: diện tích, số tầng, hẻm và giấy phép.</p>
<p>Khi đặt lịch, nên mang ${ask}. Thiếu những thứ này, báo giá ${kw} chỉ là ước lượng.</p>
<p>Nhà ${span}, khoảng ${rooms} phòng ngủ là cấu hình hay gặp. Không dùng một mặt bằng cho mọi lô đất — đó là lý do Việt Dũng Phát không chốt ${kw} qua tin nhắn diện tích.</p>
<h2>Ba sai lầm khi chọn ${kw}</h2>
<ul>
<li>${cap(m1)}.</li>
<li>${cap(m2)}.</li>
<li>${cap(m3)}.</li>
</ul>
<p>Rủi ro riêng của nhóm ${item.label.toLowerCase()}: ${g.risk}. Checklist trên giúp lọc nhà thầu trước khi nói về ${kw}.</p>
<h2>Việt Dũng Phát làm ${kw} thế nào?</h2>
<p>Quy trình gồm: ${g.do}. Mỗi bước có biên bản để gia chủ đối chiếu, phù hợp gia chủ muốn một đầu mối cho ${kw}.</p>
<p>Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát không bán thầu. Giám sát tại công trình ghi nhật ký ${mat}. Ảnh tiến độ gửi nếu gia chủ không có mặt hàng ngày.</p>
<p>Tiến độ tham khảo phần thô nhà phố thường ${weeks} tuần, chưa kể giấy phép và thời tiết. ${kw} cải tạo hoặc nội thất có thể ngắn hơn nếu phạm vi hẹp.</p>
<p><img src="${img(1)}" alt="Thi công ${kw} — Việt Dũng Phát" /></p>
<h2>Chi phí ${kw} năm ${year}</h2>
<p>${cap(g.cost)}. Con số chỉ đúng khi hợp đồng ghi cách tính m² và hạng mục loại trừ.</p>
<p>Xem <a href="/bao-gia">bảng giá xây dựng Việt Dũng Phát</a> rồi đối chiếu khảo sát. Đừng so ${kw} biệt thự sân vườn với nhà phố ${span} bằng cùng một mức.</p>
<p>Nội thất rời, đá hoa, thang máy, mái kính tính phụ lục. Muốn combo từ xưởng, xem thêm <a href="/san-pham">sản phẩm nội thất</a>.</p>
<p><img src="${img(2)}" alt="Báo giá ${kw} minh bạch" /></p>
<h2>Gợi ý theo hiện trạng</h2>
<p>Đất trống: ưu tiên chốt công năng và hồ sơ xin phép trước khi đàm phán ${kw}. Nhà cũ: chụp dầm, cột, vết nứt và hệ nước trước khi đục.</p>
<p>Phong cách tân cổ điển (mái mansard, phào) tốn hoàn thiện hơn nhà phố trơn — nên tách phụ lục, không nhét vào đơn giá thô. Nếu đang xem <a href="/mau-nha">mẫu nhà</a>, đối chiếu tỷ lệ mặt đứng với lô đất thật.</p>
<p>${pick(
    [
      "Giấy phép, PCCC và an toàn lao động không được đổi lấy ngày đẹp.",
      "Một người đại diện gia đình ký khối lượng hàng tuần tránh tranh cãi cuối công trình.",
      "Chốt cửa, gạch, sơn trước khi đóng trần — đổi giữa chừng luôn đội tiến độ.",
    ],
    index,
  )}</p>
<h2>Kết luận</h2>
<p><strong>${cap(kw)}</strong> chỉ bền khi móng, chống thấm và công năng được tính từ đầu. Việt Dũng Phát nhận TP.HCM, Thủ Đức, Bình Dương, Đồng Nai — xác nhận khu vực khi <a href="/lien-he#dat-lich">đặt lịch khảo sát</a>.</p>
<p>Đọc thêm nhóm <a href="/tu-khoa/${item.slug}">${item.label.toLowerCase()}</a> hoặc <a href="/gioi-thieu">hồ sơ năng lực</a>. Hotline trên website.</p>
<h2>Câu hỏi nhanh</h2>
<h3>${cap(kw)} hết bao nhiêu?</h3>
<p>${cap(g.cost)}. Chỉ chốt sau khi đo hiện trạng.</p>
<h3>Khảo sát ${kw} có mất phí?</h3>
<p>Khảo sát nhà tại TP.HCM theo lịch hẹn được hỗ trợ. Mang sổ hồng hoặc bản vẽ nếu có.</p>
<h3>Bao lâu thì xong?</h3>
<p>Phụ thuộc diện tích, giấy phép và phạm vi. Sau khảo sát bạn nhận tiến độ theo giai đoạn cho ${kw}.</p>`;
}

const posts = KEYWORDS.map((item, index) => {
  const slug = newsSlug(item);
  const title = TITLE[index % TITLE.length](item.phrase);
  const seoTitle = /việt dũng phát/i.test(title) ? title : `${title} | Việt Dũng Phát`;
  const desc = `${cap(item.phrase)} — kinh nghiệm, quy trình và chi phí tham khảo 2026 tại Việt Dũng Phát (phần thô 3.950.000đ/m², trọn gói 5.950.000đ/m²).`.slice(0, 158);
  return {
    slug,
    keywordSlug: item.slug,
    source: "keyword",
    title,
    image: item.image,
    imageAlt: item.phrase,
    date: dateOf(index),
    html: html(item, index),
    gallery: [],
    seoKeyword: item.phrase,
    seoTitle,
    seoDesc: desc,
    desc,
    faqs: item.faqs,
  };
});

writeFileSync(new URL("../src/data/keyword-news.json", import.meta.url), JSON.stringify(posts));
const words = posts.map((p) => p.html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length);
const slugs = posts.map((p) => p.slug);
const dup = slugs.filter((s, i) => slugs.indexOf(s) !== i);
console.log({
  posts: posts.length,
  minWords: Math.min(...words),
  maxWords: Math.max(...words),
  prefixed: posts.filter((p) => p.slug !== p.keywordSlug).map((p) => p.slug),
  dup,
});

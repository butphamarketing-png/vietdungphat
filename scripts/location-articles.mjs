import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { KEYWORDS, keywordNewsPath } from "../src/data/keywords.js";

const PUBLIC = join(fileURLToPath(new URL("..", import.meta.url)), "public");

function walkPhotos(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) walkPhotos(abs, out);
    else if (/\.(jpe?g|png|webp)$/i.test(name)) out.push(`/${relative(PUBLIC, abs).replace(/\\/g, "/")}`);
  }
  return out;
}

let PHOTO_POOL;
function photoPool() {
  if (!PHOTO_POOL) PHOTO_POOL = walkPhotos(join(PUBLIC, "mau-nha", "pho")).sort();
  return PHOTO_POOL;
}

export function hash(s) {
  let h = 2166136261;
  for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

function pickN(arr, seed, n) {
  return arr
    .map((item, idx) => ({ item, rank: hash(`${seed}:${idx}`) }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, Math.min(n, arr.length))
    .map((row) => row.item);
}

export function mediaPack(slug) {
  const pool = photoPool();
  const start = hash(slug) % pool.length;
  const picked = [];
  const used = new Set();
  let i = 0;
  while (picked.length < 6 && i < pool.length) {
    const src = pool[(start + i * 17) % pool.length];
    if (!used.has(src)) {
      used.add(src);
      picked.push(src);
    }
    i += 1;
  }
  return { cover: picked[0], body: picked.slice(1, 6) };
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function words(s) {
  return String(s).split(/\s+/).filter(Boolean);
}

function paras(text) {
  const list = words(text);
  if (list.length <= 110) return [text.trim()];
  const mid = Math.ceil(list.length / 2);
  return [list.slice(0, mid).join(" "), list.slice(mid).join(" ")];
}

function p(text) {
  return paras(text).map((part) => `<p>${esc(part)}</p>`).join("\n");
}

const CAPS = [
  ["vinhomes grand park", "Vinhomes Grand Park"],
  ["grand park", "Grand Park"],
  ["tân đông hiệp", "Tân Đông Hiệp"],
  ["tăng nhơn phú", "Tăng Nhơn Phú"],
  ["long bình tân", "Long Bình Tân"],
  ["đông hòa", "Đông Hòa"],
  ["phước long", "Phước Long"],
  ["long trường", "Long Trường"],
  ["long phước", "Long Phước"],
  ["long thành", "Long Thành"],
  ["nhơn trạch", "Nhơn Trạch"],
  ["trảng bom", "Trảng Bom"],
  ["linh xuân", "Linh Xuân"],
  ["trường thọ", "Trường Thọ"],
  ["hiệp phú", "Hiệp Phú"],
  ["an bình", "An Bình"],
  ["biên hòa", "Biên Hòa"],
  ["đồng nai", "Đồng Nai"],
  ["bình dương", "Bình Dương"],
  ["quận 9", "Quận 9"],
  ["thủ đức", "Thủ Đức"],
  ["dĩ an", "Dĩ An"],
];

const TAILS = [
  "nên chốt minh bạch theo mét vuông năm 2026",
  "để gia chủ yên tâm với hợp đồng chuẩn năm 2026",
  "đáng đối chiếu dự toán minh bạch năm 2026",
  "tránh rủi ro nhờ bảng khối lượng chuẩn năm 2026",
  "nên xem hiện trường trước báo giá chuẩn năm 2026",
  "cho mặt tiền đẹp hơn khi thi công chuẩn năm 2026",
  "giúp gia chủ yên tâm nhờ cam kết nhật ký năm 2026",
  "tiết kiệm phát sinh khi phạm vi được chốt năm 2026",
];

const TITLE_EXTRA = [" theo hiện trạng từng thửa", " sau khi đo hẻm và nền", " với phụ lục vật tư rõ", " và bàn giao có biên bản"];

const CITY_CAPS = [
  ["hồ chí minh", "Hồ Chí Minh"],
  ["gò vấp", "Gò Vấp"],
  ["bình thạnh", "Bình Thạnh"],
  ["tân bình", "Tân Bình"],
  ["tân phú", "Tân Phú"],
  ["bình tân", "Bình Tân"],
  ["nhà bè", "Nhà Bè"],
  ["bình chánh", "Bình Chánh"],
  ["quận 12", "Quận 12"],
  ["quận 7", "Quận 7"],
  ["quận 2", "Quận 2"],
  ["long an", "Long An"],
  ["tphcm", "TPHCM"],
];

function finishTitle(head, kw, hook) {
  const tail = TAILS[hash(kw) % TAILS.length];
  let title = hook ? `${head} — ${hook}, ${tail}` : `${head} — ${tail}`;
  let i = 0;
  const halfHas = () => title.slice(0, Math.ceil(title.length / 2)).toLowerCase().includes(kw);
  while (!halfHas() && i < TITLE_EXTRA.length) {
    title += TITLE_EXTRA[i];
    i += 1;
  }
  while (!halfHas() && title.length < 190) title += " trước khi đào móng";
  return title;
}

export function locationTitle(phrase) {
  let head = phrase.toLowerCase();
  for (const [from, to] of CAPS) head = head.replaceAll(from, to);
  head = head.charAt(0).toUpperCase() + head.slice(1);
  return finishTitle(head, phrase.toLowerCase(), placeOf(phrase).h2);
}

export function exactKeywordTitle(phrase) {
  let head = phrase.toLowerCase();
  for (const [from, to] of [...CAPS, ...CITY_CAPS]) head = head.replaceAll(from, to);
  head = head.charAt(0).toUpperCase() + head.slice(1);
  const kw = phrase.toLowerCase();
  const place = PLACES.find((item) => item.test.test(kw));
  return finishTitle(head, kw, place ? place.h2 : "");
}

const PLACES = [
  {
    test: /đông hòa/,
    name: "phường Đông Hòa, Dĩ An",
    h2: "ranh Thủ Đức và hẻm sau nhà",
    techH2: "Nền san lấp và xe ben tại Đông Hòa",
    blurb: "Đông Hòa sát ranh Thủ Đức, trục chính vào được xe ben nhưng hẻm sau phải bơm bê tông.",
    costNote: "Hẻm sau Đông Hòa thường đội khoản bơm và bốc xếp so với lô mặt đường nội bộ.",
    risk: "Nhà Đông Hòa hay giáp công trình đã ở. Đào móng mà không lập biên bản tường chung thì vết nứt cũ thành việc của mình.",
    facts: [
      "Đông Hòa nằm sát ranh Thủ Đức, nhiều nhà nhìn sang Bình Chiểu và Linh Xuân. Giấy phép vẫn nộp ở Dĩ An, Bình Dương, không mượn bộ hồ sơ phường Thành phố Thủ Đức.",
      "Trục chính Đông Hòa xe ben vào được. Hẻm sau nhà thường chỉ đủ xe máy, nên bê tông phải bơm và gạch phải chia chuyến. Khoản này đo miệng hẻm rồi mới ghi dự toán.",
      "Nền Đông Hòa phần lớn là ruộng san lấp. Móng băng nhà phố nội thành không mang sang. Cần đào hố kiểm tra hoặc khoan trước khi chốt cọc hay móng băng.",
      "Mùa mưa một số tuyến nội bộ Đông Hòa rút chậm. Cốt sàn trệt hoàn thiện nên cao hơn mặt đường đang chạy, không lấy cao độ trên bản vẽ cũ.",
      "Tường liền kề Đông Hòa xây lệch thời điểm. Trước ngày đào, chụp ảnh và ký hiện trạng hai nhà bên.",
    ],
  },
  {
    test: /an bình/,
    name: "phường An Bình, Dĩ An",
    h2: "nhà ống cũ và hẻm hẹp",
    techH2: "Tường chung, điện cũ và lối vào An Bình",
    blurb: "An Bình nhiều nhà ống cũ, hẻm dưới 3 m phải chuyển vật tư bằng ba gác.",
    costNote: "Dự toán An Bình tách bốc xếp hẻm hẹp khỏi đơn giá mét vuông sàn.",
    risk: "Đục tường nhà đang ở tại An Bình mà không chừa bếp và vệ sinh tạm thì gia đình phải dọn đi giữa chừng.",
    facts: [
      "An Bình còn nhiều nhà ống cũ xen lô tách thửa. Mặt tiền hẹp, chiều sâu dài, giếng trời là chỗ lấy sáng chứ không phải chi tiết để trang trí.",
      "Hẻm An Bình có đoạn dưới 3 m. Xe ben không vào. Vật tư đi ba gác, bê tông dùng bơm, và hai khoản này phải thành dòng riêng.",
      "Tường chung mỏng, có nhà đã nứt sẵn. Trước khi đục, chụp ảnh và lập biên bản với hai bên, nếu không vết cũ bị tính vào ca thi công mới.",
      "Điện nhà cấp 4 An Bình thường đi nổi. Làm lại thì đi âm, phải cắt điện theo giờ và báo hàng xóm trước.",
      "Nền các lô trong cùng một hẻm An Bình không đều. Nhà này cứng, nhà kia xốp. Không copy kết cấu từ căn cách ba nhà.",
    ],
  },
  {
    test: /tân đông hiệp/,
    name: "phường Tân Đông Hiệp, Dĩ An",
    h2: "khu công nghiệp và giờ xe",
    techH2: "Ca đổ bê tông tránh giờ tan ca",
    blurb: "Tân Đông Hiệp gần khu công nghiệp, lịch đổ bê tông phải tránh giờ tan ca.",
    costNote: "Mất thép để qua đêm và ca đổ lệch giờ là hai khoản Tân Đông Hiệp hay phát sinh nếu không ghi trước.",
    risk: "Đường nội bộ một số khu mới hẹp hơn mặt bằng trên giấy. Hứa ngày đổ sàn khi chưa đo miệng hẻm bằng thước là rủi ro tiến độ.",
    facts: [
      "Tân Đông Hiệp gần khu công nghiệp Sóng Thần. Xe tải và xe công nhân dày vào giờ tan ca. Lịch đổ bê tông tránh đúng khung giờ đó.",
      "Nhiều lô xen nhà ở và xưởng nhỏ. Bụi và tiếng máy từ hai phía. Lưới che và bạt là hạng mục bắt buộc, không phải việc thợ làm nếu nhớ.",
      "Nền quanh khu công nghiệp hay đầm không đều. Ít nhất phải đào hố kiểm tra trước khi nhận móng băng cho cả dãy.",
      "Nhà vừa ở vừa cho thuê cần thêm phòng trệt. Cầu thang đặt lệch là mất một phòng, nên chốt trên mặt bằng chứ không chốt trên phối cảnh.",
      "Vật tư để qua đêm cần khóa và người trông. Khu đông người qua lại, mất thép cây là phát sinh thật, không phải chuyện hiếm.",
    ],
  },
  {
    test: /dĩ an/,
    name: "Dĩ An, Bình Dương",
    h2: "nền san lấp và phép Bình Dương",
    techH2: "Hẻm, móng và chỉ giới tại Dĩ An",
    blurb: "Dĩ An giáp Thủ Đức nhưng nộp phép ở Bình Dương, nền ruộng san lấp phải xử lý riêng.",
    costNote: "Đơn giá niêm yết chưa gồm bơm bê tông, móng cọc và đấu nối điện nước tại Dĩ An.",
    risk: "Tum và ban công vẽ vượt chỉ giới là lý do hồ sơ Dĩ An bị trả. Phối cảnh đẹp không thay được giấy phép.",
    facts: [
      "Dĩ An giáp TP Thủ Đức nhưng là đất Bình Dương. Hai nhà cách một con đường có thể khác nơi nộp phép, khác lệ phí và khác cách ghi số tầng.",
      "Nhiều khu san từ ruộng. Sau mưa, nước ngầm lên chân tường. Chống thấm sàn trệt và cổ móng phải có sẵn trong bảng khối lượng.",
      "Mặt tiền phố biến thường 4–5 m, sâu 14–20 m. Cầu thang và giếng trời quyết định phòng giữa nhà có ở được hay chỉ để chứa đồ.",
      "Xe ben đi được một số trục rồi dừng ở miệng hẻm. Từ đó vào thửa là bơm hoặc ba gác. Đo miệng hẻm bằng thước, không đo trên ảnh.",
      "Nhà vừa ở vừa cho thuê rất phổ biến. Tầng trệt để xe hay ngăn phòng phải chốt trước khi đổ cột, vì dầm không dịch được.",
      "Tường chung với nhà cũ cần ảnh hiện trạng trước ngày đào. Nứt có sẵn mà không chụp sẽ thành tranh chấp khi công trình đã lên tầng.",
      "Thợ tính mét vuông theo tim tường hoặc thông thủy sẽ lệch hàng chục triệu trên nhà ba tầng. Hợp đồng kèm sơ đồ cách đo.",
      "Điện và nước vào nhà mới đôi khi chờ nhánh. Khoản đấu nối ghi riêng, không giấu vào đơn giá xây.",
      "Khu công nghiệp làm đường bụi. Sơn mặt tiền chọn loại rửa được, và chỉ sơn khi hết bụi mài, nếu không màu loang sau một mùa.",
      "Cốt sàn trệt nên cao hơn mặt đường đang chạy ở những tuyến nội bộ rút nước chậm. Bản vẽ cũ không thay được cao độ đo tại chỗ.",
      "Ban công và tum hay bị vẽ vượt chỉ giới cho đủ vẻ. Đối chiếu quy hoạch Dĩ An trước khi duyệt mặt đứng.",
      "Văn phòng Việt Dũng Phát ở Kha Vạn Cân, Trường Thọ, cách Dĩ An ngắn hơn các huyện sâu của Đồng Nai. Khảo sát xếp trong ngày làm việc.",
    ],
  },
  {
    test: /long bình tân/,
    name: "Long Bình Tân, Biên Hòa",
    h2: "đất nền mới và lộ giới",
    techH2: "Chỉ giới và thoát nước Long Bình Tân",
    blurb: "Long Bình Tân là đất nền mới của Biên Hòa, lộ giới phải đối chiếu sổ trước khi vẽ mặt đứng.",
    costNote: "Nhà mới Long Bình Tân vẫn phát sinh móng và thoát nước mưa dù đường vào xe ben được.",
    risk: "Xây sát chỉ giới theo thói quen nội thành dễ phải đục lại ban công khi hồ sơ Đồng Nai yêu cầu chỉnh.",
    facts: [
      "Long Bình Tân là khu đất nền và nhà phố mới của Biên Hòa. Lô trống xen nhà vừa đổ mái, nên tiếng thi công và bụi ảnh hưởng dãy đang vào ở.",
      "Lộ giới và chỉ giới xây dựng phải đọc trên sổ và quy hoạch, không ước bằng mắt theo nhà hàng xóm đã xây trước.",
      "Đường khu mới xe ben vào được nhiều hơn hẻm Biên Hòa cũ, nhưng đoạn cuối vào thửa vẫn có thể hẹp. Đo trước khi hứa đổ sàn bằng xe bồn.",
      "Nền đắp chưa ổn định vài năm. Nhà xây sớm cần xem độ lún và hướng thoát nước mưa, kẻo sân thấp hơn đường.",
      "Phép xây dựng theo tỉnh Đồng Nai. Bộ hồ sơ phường TP.HCM không dùng được dù gia chủ vừa chuyển từ Thủ Đức sang.",
    ],
  },
  {
    test: /biên hòa/,
    name: "Biên Hòa, Đồng Nai",
    h2: "hẻm trung tâm và đất ven sông",
    techH2: "Phép tỉnh và cự ly bê tông tại Biên Hòa",
    blurb: "Biên Hòa có hẻm trung tâm hẹp và nền ven sông, phép nộp theo tỉnh Đồng Nai.",
    costNote: "Cự ly bê tông tươi và móng đất yếu ven sông làm giá Biên Hòa lệch mốc mét vuông.",
    risk: "Dùng bộ hồ sơ TP.HCM để nộp ở Biên Hòa là mất tuần chỉnh bản vẽ. Phép tỉnh không đọc cùng một biểu mẫu.",
    facts: [
      "Biên Hòa có hai kiểu đất hay gặp: nhà phố hẻm trong trung tâm và lô rộng hơn phía ven. Không lấy kết cấu nhà ống 4 m áp cho biệt thự sân.",
      "Xin phép theo tỉnh Đồng Nai. Số tầng, mật độ và khoảng lùi không copy từ phường Thủ Đức hay Dĩ An.",
      "Một số tuyến gần sông Đồng Nai nền yếu và ẩm. Chống thấm chân tường và cao độ sàn trệt phải xem tại đất vào mùa mưa.",
      "Hẻm trung tâm nhiều đoạn không vào xe ben. Bơm bê tông, giờ đổ ban ngày và che chắn nhà liền kề là điều kiện thi công, không phải phát sinh bất ngờ.",
      "Vật tư từ xưởng Thủ Đức sang Biên Hòa tính cự ly. Chuyến bê tông trễ giờ nắng làm mạch ngừng xấu. Tiến độ phải trừ quãng đường.",
      "Nhà cũ trong hẻm Biên Hòa thường điện đi nổi và mái tôn dột. Cải tạo phải mở mái và tủ điện trước khi bàn sơn mặt tiền.",
      "Chỉ giới ban công ở các tuyến cải tạo đường hay bị siết. Mặt đứng đẹp mà đua quá sẽ bị yêu cầu cắt.",
      "Gia chủ Biên Hòa hay so giá với nhà thầu trong tỉnh. So được khi cùng cách đo mét vuông, cùng năm và cùng danh mục thô hoặc hoàn thiện.",
      "Tường chung nhà phố cổ cần biên bản. Nhiều căn xây trước năm hai nghìn, vết nứt đã có từ lâu.",
      "Văn phòng Kha Vạn Cân đi Biên Hòa trong buổi sáng làm việc. Khảo sát vẫn phải mang thước đo hẻm, không báo giá trên ảnh chụp mặt tiền.",
    ],
  },
  {
    test: /long thành/,
    name: "Long Thành, Đồng Nai",
    h2: "quy hoạch đang đổi",
    techH2: "Chỉ giới và đường công vụ Long Thành",
    blurb: "Long Thành đang đổi quy hoạch quanh hạ tầng mới, phải hỏi lại chỉ giới trước khi chốt số tầng.",
    costNote: "Cự ly vật tư Long Thành dài hơn Biên Hòa, móng và vận chuyển không nằm trong mốc TP.HCM.",
    risk: "Chốt mặt đứng rồi mới biết lộ giới dịch là đục ô văng. Hỏi quy hoạch trước khi đào.",
    facts: [
      "Long Thành đang đổi quy hoạch quanh sân bay và các tuyến mới. Chỉ giới tháng trước chưa chắc còn đúng tháng này. Hỏi lại trước khi chốt số tầng.",
      "Nhiều lô là đất nền giao sớm, đường công vụ chưa thành đường nhà. Xe bồn có vào được hay không phải chạy thử, không nhìn trên bản đồ.",
      "Nền đắp theo dự án không đều giữa các lô cùng một dãy. Khoan hoặc đào hố ở đúng thửa sẽ xây, không dùng phiếu địa chất của lô cách hai căn.",
      "Phép xây dựng thuộc Đồng Nai. Hồ sơ cần khớp quy hoạch mới, kể cả khoảng lùi so với đường sẽ mở.",
      "Ở xa xưởng hơn Thủ Đức. Chuyến bê tông và chuyến thép tính giờ đường. Đổ trưa nắng mà xe kẹt là mạch ngừng.",
    ],
  },
  {
    test: /nhơn trạch/,
    name: "Nhơn Trạch, Đồng Nai",
    h2: "nền yếu và cự ly vật tư",
    techH2: "Móng cọc và logistics Nhơn Trạch",
    blurb: "Nhơn Trạch xa xưởng, nền yếu, móng cọc và cự ly bê tông phải tách khỏi đơn giá nhà phố.",
    costNote: "Móng cọc Nhơn Trạch không gói vào 3.950.000đ/m². Cự ly xe bồn tính riêng.",
    risk: "Nhận móng băng theo giá nhà phố Thủ Đức rồi gặp đất yếu là đội tiền ngay hố móng đầu tiên.",
    facts: [
      "Nhơn Trạch có nền yếu ở nhiều khu dân cư và khu gần công nghiệp. Móng cọc không phải nâng cấp tùy chọn. Phương án móng chốt sau khi xem đất.",
      "Quãng đường vật tư dài hơn Biên Hòa và Thủ Đức. Bê tông tươi phải canh giờ ra công trường, nếu không nắng làm mất độ sụt.",
      "Đường vào một số xã nhỏ hẹp hơn quốc lộ. Xe ben dừng ngoài, phần còn lại trung chuyển. Dự toán ghi rõ khúc nào xe vào được.",
      "Phép xây dựng theo Đồng Nai. Nhà ở dân dụng không dùng hồ sơ nhà xưởng dù lô nằm gần khu công nghiệp.",
      "Công nhân địa phương và đội từ thành phố cần một người phụ trách có tên. Giao khoán miệng từng hạng mục rồi mất dấu khi thấm.",
    ],
  },
  {
    test: /trảng bom/,
    name: "Trảng Bom, Đồng Nai",
    h2: "nhà vườn và đường huyện",
    techH2: "Lối vào công trình Trảng Bom",
    blurb: "Trảng Bom là nhà vườn và nhà phố huyện, đường vào quyết định xe ben hay phải trung chuyển.",
    costNote: "Nhà vườn Trảng Bom tính thêm mái, sân và chuyến vật tư, không nhân đơn giá nhà ống.",
    risk: "Hứa đổ sàn bằng xe bồn khi đường huyện vừa mưa là kẹt xe và hỏng mặt đường dân.",
    facts: [
      "Trảng Bom nhiều nhà vườn và nhà phố huyện, nhịp cột và mái khác nhà 5×20 trong hẻm. Không so một đơn giá cho hai loại nhà.",
      "Đường vào công trình quyết định logistics. Mưa lớn là lầy. Lịch đổ bê tông trừ những ngày đường không chịu xe tải.",
      "Sân và hàng rào làm sau phần thô để máy còn vào được. Đổ sân trước rồi mới xây là tự chặn lối mình.",
      "Nền vườn đào lên mới biết đất đắp hay đất thịt. Ảnh chụp cổng không đủ để chốt móng.",
      "Phép huyện theo quy định Đồng Nai. Khoảng lùi vườn và mật độ xây dựng phải đọc trên sổ trước khi vẽ mái.",
    ],
  },
  {
    test: /đồng nai/,
    name: "Đồng Nai",
    h2: "phép tỉnh và quãng đường vật tư",
    techH2: "Biên Hòa và các huyện không dùng chung một móng",
    blurb: "Thi công Đồng Nai tách phép tỉnh, cự ly vật tư và móng khỏi đơn giá niêm yết tại TP.HCM.",
    costNote: "Giá Đồng Nai cộng hoặc trừ vận chuyển và móng sau khảo sát, không áp cứng bảng TP.HCM.",
    risk: "Gom Biên Hòa, Long Thành, Nhơn Trạch, Trảng Bom thành một đơn giá là sai ngay từ trang dự toán đầu.",
    facts: [
      "Đồng Nai trong nhóm bài này gồm Biên Hòa và các huyện vệ tinh. Mỗi nơi một kiểu đường, một kiểu nền, một nơi nộp hồ sơ.",
      "Giấy phép là thủ tục tỉnh, không phải thủ tục phường TP.HCM. Biểu mẫu, mật độ và khoảng lùi phải đọc bản địa phương.",
      "Cự ly từ xưởng Thủ Đức làm chuyến bê tông và thép lâu hơn nội thành. Tiến độ trừ quãng đường, không lấy lịch nhà phố Trường Thọ.",
      "Nền yếu gặp ở Nhơn Trạch và một phần ven sông Biên Hòa. Long Thành thì nền đắp mới. Không có một kiểu móng cho cả tỉnh.",
      "Nhà vườn Trảng Bom và nhà hẻm Biên Hòa khác nhau ở mái, sân và cách đưa máy vào. Báo giá phải nói rõ đang tính loại nào.",
      "Hàng xóm tỉnh thường gần đất vườn, tranh chấp ranh mốc hay hơn tranh chấp hẻm. Đo ranh trước khi đào, không đào theo hàng rào tạm.",
      "Mùa mưa Đồng Nai làm trễ đổ sàn và trễ sơn. Hợp đồng nên có cách xử lý ngày mưa, không hứa một ngày bàn giao cố định từ lúc chưa đo.",
      "Việt Dũng Phát khảo sát rồi mới nhận. Không khoán trắng xã xa chỉ với một tin nhắn gửi kích thước.",
    ],
  },
  {
    test: /grand park|vinhomes/,
    name: "Vinhomes Grand Park, Quận 9 cũ",
    h2: "nội quy ban quản lý",
    techH2: "Giờ thi công, cổng và thang máy",
    blurb: "Grand Park làm theo nội quy ban quản lý: giờ thi công, cổng và lối vận chuyển không giống nhà phố hẻm.",
    costNote: "Phí vận chuyển trong khu và ngày chờ cổng không có trong đơn giá nhà phố tự do.",
    risk: "Thi công ngoài giờ nội quy hoặc không đăng ký cổng là bị dừng, dù hợp đồng với gia chủ đã ký.",
    facts: [
      "Vinhomes Grand Park có ban quản lý. Giờ khoan, giờ cắt và đường vào cổng phải đăng ký. Không làm như nhà phố hẻm tự phát.",
      "Vật tư đi thang máy hoặc lối phụ theo phiếu. Tủ dài và kính mặt tiền cần lịch riêng, không ôm vào giờ dân cư đi làm.",
      "Nhà phố trong khu vẫn có chỉ giới và khoảng lùi của dự án, cộng thêm quy định mặt ngoài. Sơn màu và biển hiệu không chọn tùy ý.",
      "Cải tạo nhà đã bàn giao phải bảo vệ thang máy và sảnh. Hư phần chung là việc của đội thi công, không đổ cho tòa.",
      "Tiếng ồn bị kiểm tra. Cắt bê tông và đục tường xếp buổi được phép, không làm tối muộn cho kịp tiến độ.",
    ],
  },
  {
    test: /phước long/,
    name: "Phước Long, Quận 9 cũ",
    h2: "nhà phố xen đất nền Thủ Đức",
    techH2: "Sổ, quy hoạch và hẻm Phước Long",
    blurb: "Phước Long nay thuộc TP Thủ Đức, nhà phố và đất nền xen nhau, sổ phải đối chiếu quy hoạch.",
    costNote: "Hẻm Phước Long quyết định có bơm bê tông hay không, khoản đó tách khỏi mét vuông sàn.",
    risk: "Xây theo nhà hàng xóm đã lấn chỉ giới thì hồ sơ Thủ Đức trả về đúng lúc móng đã đào.",
    facts: [
      "Phước Long thuộc TP Thủ Đức, người vẫn gọi Quận 9. Hồ sơ nộp theo Thủ Đức, không theo quận cũ.",
      "Nhà phố và đất nền xen kẽ. Lô mặt tiền đường lớn khác hẻm cụt về xe ben, về số tầng và về cách lấy sáng.",
      "Quy hoạch một số tuyến đang chỉnh. Ban công và tum đối chiếu chỉ giới mới, không copy nhà xây năm năm trước.",
      "Mùa mưa nước mặt chảy theo độ dốc đường. Sân thấp hơn mặt đường là nước vào trệt. Cao độ đo tại chỗ.",
      "Tường chung với nhà đã ở cần che chắn và biên bản. Hẻm hẹp, bụi đục tường bay sang nhà bên rất nhanh.",
    ],
  },
  {
    test: /tăng nhơn phú/,
    name: "Tăng Nhơn Phú, Quận 9 cũ",
    h2: "nhà ống mặt tiền và hẻm",
    techH2: "Đổ sàn và che chắn liền kề",
    blurb: "Tăng Nhơn Phú là nhà ống mặt tiền và hẻm, giờ đổ bê tông phải thống nhất với nhà liền kề.",
    costNote: "Che chắn và bơm bê tông trong hẻm Tăng Nhơn Phú là dòng riêng trên dự toán.",
    risk: "Đổ sàn ngày nghỉ mà không báo tổ dân phố dễ bị dừng giữa chừng, bê tông thì không chờ.",
    facts: [
      "Tăng Nhơn Phú đông nhà ống. Mặt tiền 4–5 m, sâu dài, giếng trời và cầu thang là hai việc phải vẽ trước khi nói phong cách.",
      "Hẻm xe hơi và hẻm xe máy khác nhau một khoản vận chuyển lớn. Khảo sát phải đi đến miệng hẻm, không dừng ở đường lớn.",
      "Nhà liền kề xây sát. Khi đổ sàn, che chắn mái tôn nhà bên và thống nhất giờ ồn.",
      "Điện nước đô thị Thủ Đức. Đấu nối nhà mới vẫn cần thời gian nhánh, không giả định có sẵn trong tuần khởi công.",
      "Một số căn cải tạo giữ móng cũ. Muốn nâng tầng thì kiểm tra tải, phép xây và độ lệch sàn — ba việc độc lập.",
    ],
  },
  {
    test: /long trường/,
    name: "Long Trường, Quận 9 cũ",
    h2: "đất nền và thoát nước mưa",
    techH2: "Cốt nền mùa mưa tại Long Trường",
    blurb: "Long Trường nhiều đất nền mới, cốt sân và thoát nước mặt phải xem vào mùa mưa.",
    costNote: "Xử lý nền và nâng cốt sân Long Trường không nằm sẵn trong đơn giá phần thô.",
    risk: "Làm sàn trệt thấp hơn đường nội bộ là mưa đầu mùa nước vào nhà, phải đục nền.",
    facts: [
      "Long Trường có nhiều đất nền và nhà mới thuộc TP Thủ Đức. Cốt nền đắp chưa lâu, cần xem lún cục bộ trước khi chốt móng băng.",
      "Thoát nước mặt trong mùa mưa là việc của sân và hố ga, không phải việc sơn tường sau cùng.",
      "Đường khu mới xe vào được nhưng đoạn giao nhau hẹp. Lịch xe bồn tránh giờ tan tầm các cổng khu dân cư.",
      "Hồ sơ xây dựng theo TP Thủ Đức. Người tìm bằng tên Quận 9 vẫn phải nộp đúng biểu mẫu hiện hành.",
      "Nhà xây sớm trong dãy trống chịu gió và nắng mưa trước khi có nhà bên. Chống thấm tường hồi làm ngay, không đợi hàng xóm xây.",
    ],
  },
  {
    test: /long phước/,
    name: "Long Phước, Quận 9 cũ",
    h2: "đất nền và nhà vườn",
    techH2: "Đường vào và thoát nước Long Phước",
    blurb: "Long Phước thuộc TP Thủ Đức, đất nền và nhà vườn cần xem đường vào trước khi chốt móng.",
    costNote: "Nhà vườn Long Phước cộng mái, sân và chuyến vật tư, không tính như nhà ống hẻm.",
    risk: "Đường đất mưa lầy làm lỡ mẻ bê tông. Không xếp lịch đổ rồi mới xem trời.",
    facts: [
      "Long Phước còn quỹ đất nền và nhà vườn trong Thủ Đức. Nhịp nhà và sân rộng hơn nhà phố Tăng Nhơn Phú.",
      "Đường vào một số thửa là đường dân sinh. Xe tải có chịu được hay không phải xem sau mưa, không xem ngày nắng.",
      "Thoát nước mưa từ vườn đổ về sân. Hướng dốc và hố ga vẽ trên hồ sơ, không để thợ canh mắt.",
      "Móng phụ thuộc đất đắp hay đất thịt. Ảnh cổng gửi qua điện thoại không đủ để báo giá móng.",
      "Phép xây dựng theo TP Thủ Đức dù người vẫn nói Quận 9. Khoảng lùi vườn đọc trên sổ.",
    ],
  },
  {
    test: /hiệp phú/,
    name: "Hiệp Phú, Thủ Đức",
    h2: "nhà phố trong hẻm",
    techH2: "Che chắn liền kề và giờ xe ben",
    blurb: "Hiệp Phú là nhà phố hẻm Thủ Đức, phải thống nhất che chắn và giờ xe ben trước ngày đổ sàn.",
    costNote: "Hẻm Hiệp Phú đội chi phí bơm bê tông và bốc xếp so với lô mặt đường.",
    risk: "Khởi công không biên bản nhà bên là dừng việc khi tường nứt, dù nứt đã có từ trước.",
    facts: [
      "Hiệp Phú đông nhà phố trong hẻm Thủ Đức. Bề ngang hẹp, chiều sâu dài, lấy sáng bằng giếng trời và cửa sau.",
      "Xe ben dừng ngoài đường lớn ở nhiều con hẻm. Bê tông bơm, gạch chuyển chuyến. Đo chiều rộng thực, kể cả chỗ đặt máy bơm.",
      "Nhà liền kề sát nhau. Đục và đổ sàn cần bạt che và giờ thống nhất, tránh làm cuối tuần khi cả hẻm ở nhà.",
      "Cải tạo nhà cũ hay gặp mái tôn dột và điện đi nổi. Xử lý mái và tủ điện trước khi ốp mặt tiền.",
      "Khảo sát từ văn phòng Kha Vạn Cân sang Hiệp Phú ngắn. Vẫn phải đến đất, không báo giá trên ảnh.",
    ],
  },
  {
    test: /quận 9/,
    name: "Quận 9 (nay thuộc TP Thủ Đức)",
    h2: "địa bàn cũ, hồ sơ Thủ Đức",
    techH2: "Phước Long, Tăng Nhơn Phú, Long Trường không giống nhau",
    blurb: "Quận 9 không còn là đơn vị hành chính. Hồ sơ nộp theo TP Thủ Đức, từng phường một kiểu hẻm.",
    costNote: "Báo giá Quận 9 phải nói rõ phường và chiều rộng hẻm, nếu không số mét vuông không so được.",
    risk: "Tìm nhà thầu bằng tên Quận 9 rồi nhận quy trình phép cũ là nộp sai nơi.",
    facts: [
      "Quận 9 đã vào TP Thủ Đức. Giấy phép, quy hoạch và nơi tiếp nhận hồ sơ đi theo Thủ Đức, dù khách vẫn gõ Quận 9.",
      "Phước Long, Tăng Nhơn Phú, Long Trường, Long Phước và Grand Park không dùng chung một cách thi công. Nội quy khu đô thị khác hẻm nhà phố.",
      "Nhà ống 4–5 m vẫn là dạng phổ biến. Cầu thang giữa nhà nếu đặt xấu sẽ mất phòng và mất sáng.",
      "Đất nền các phường mới cần xem cốt và thoát nước. Đất hẻm cũ cần xem tường chung và điện cũ. Hai bài toán khác nhau.",
      "Xe ben vào đường lớn rồi dừng. Hẻm quyết định bơm bê tông. Ảnh mặt tiền chụp từ đường cái không cho biết miệng hẻm.",
      "Ban công và tum đối chiếu chỉ giới Thủ Đức hiện hành, không đối chiếu nhà xây thời còn quận.",
      "Văn phòng Trường Thọ và xưởng Nguyễn Duy Trinh đều trong Thủ Đức. Khảo sát Quận 9 cũ xếp được trong ngày, nhưng vẫn đo tại đất.",
      "So giá với nhà thầu trong khu chỉ đúng khi cùng năm 2026, cùng cách đo sàn và cùng danh mục đã gồm hay chưa gồm móng.",
    ],
  },
  {
    test: /linh xuân/,
    name: "Linh Xuân, Thủ Đức",
    h2: "đất tách thửa và hẻm xe",
    techH2: "Hẻm xe hơi hay xe máy tại Linh Xuân",
    blurb: "Linh Xuân có nhà phố và đất tách thửa, phải khảo sát hẻm xe hơi hay chỉ xe máy trước khi hứa ngày đổ sàn.",
    costNote: "Hẻm xe máy tại Linh Xuân làm tăng bốc xếp và bơm bê tông so với lô xe hơi vào được.",
    risk: "Tách thửa xong nhưng lộ giới chưa cập nhật trên sổ thì mặt đứng phải vẽ lại.",
    facts: [
      "Linh Xuân có nhà phố cũ và đất tách thửa mới. Hai loại lô khác nhau về hẻm, về tường chung và về giấy tờ.",
      "Hẻm xe hơi vào được thì xe ben có thể đứng gần. Hẻm xe máy thì mọi thứ đội giá vận chuyển. Phải đi bộ vào đến đất.",
      "Nhà tách thửa hay nở hậu hoặc thóp hậu. Đo đủ bốn cạnh, không đo mỗi mặt tiền rồi vẽ hình chữ nhật.",
      "Giấy phép theo TP Thủ Đức. Chỉ giới đọc bản mới, không đọc theo nhà cha mẹ xây mười năm trước trên cùng thửa gốc.",
      "Mùa mưa kiểm tra nước từ đường dồn vào sân. Cốt trệt thấp là phải nâng trước khi đổ nền, không lát gạch rồi mới thấy.",
    ],
  },
  {
    test: /trường thọ/,
    name: "Trường Thọ, Thủ Đức",
    h2: "gần văn phòng Kha Vạn Cân",
    techH2: "Nhà phố cũ xen dãy mới",
    blurb: "Trường Thọ gần văn phòng Kha Vạn Cân, khảo sát nhanh hơn huyện xa nhưng hẻm vẫn phải đo.",
    costNote: "Gần xưởng không có nghĩa Trường Thọ hết khoản bơm bê tông. Hẻm nhỏ vẫn tính riêng.",
    risk: "Chủ nhà thấy gần văn phòng nên bỏ qua khảo sát. Ảnh hẻm không thay được thước.",
    facts: [
      "Trường Thọ là nơi đặt văn phòng Việt Dũng Phát, 942/2/7 Kha Vạn Cân. Khảo sát xếp nhanh, nhưng vẫn đến thửa đất.",
      "Nhà phố cũ và dãy mới xen nhau. Nhà cũ điện đi nổi, mái thấp. Nhà mới thì chỉ giới và tum phải đúng hồ sơ Thủ Đức.",
      "Hẻm quanh Kha Vạn Cân đông xe máy giờ tan tầm. Đổ bê tông xếp buổi, có người hướng dẫn xe bơm, không chặn cả hẻm.",
      "Cải tạo căn đang ở nên cuốn chiếu từng tầng. Văn phòng gần không có nghĩa gia chủ dọn đi được ngay.",
      "Tường chung với quán và nhà ở hỗn hợp. Che bụi và giờ ồn cần nói trước, vì người làm việc tại nhà cả ngày.",
    ],
  },
  {
    test: /thủ đức/,
    name: "TP Thủ Đức",
    h2: "Quận 9 cũ và các phường phía đông",
    techH2: "Hẻm, BQL và phép Thủ Đức",
    blurb: "Thủ Đức gồm cả Quận 9 cũ. Văn phòng ở Kha Vạn Cân, nhưng từng phường vẫn phải đo hẻm và móng tại đất.",
    costNote: "Mốc 2026 dùng để lập dự toán Thủ Đức, rồi cộng hẻm, móng và nội quy khu đô thị nếu có.",
    risk: "Coi mọi phường Thủ Đức như một kiểu nhà phố Kha Vạn Cân sẽ sai với Grand Park và sai với hẻm Long Trường.",
    facts: [
      "TP Thủ Đức gồm địa bàn Quận 9 cũ và các phường như Linh Xuân, Trường Thọ, Hiệp Phú. Hồ sơ xây dựng nộp theo thành phố, không theo quận đã giải thể.",
      "Văn phòng Việt Dũng Phát ở Kha Vạn Cân, Trường Thọ. Xưởng nội thất ở Nguyễn Duy Trinh. Khảo sát nội thành thuận hơn đi Nhơn Trạch hay Trảng Bom.",
      "Grand Park có ban quản lý. Hẻm Hiệp Phú thì không. Cùng một hợp đồng khung không áp được cả hai cách đưa vật tư.",
      "Nhà ống hẹp vẫn cần giếng trời. Biệt thự trong khu thì cần nhịp cột và sân. Không báo một giá mét vuông cho cả hai.",
      "Chỉ giới, tum, ban công đối chiếu quy hoạch hiện hành. Nhà hàng xóm xây vượt không phải căn cứ để vẽ theo.",
      "Hẻm quyết định bê tông bơm hay xe bồn. Ảnh mặt tiền không thể hiện chiều rộng chỗ đặt máy bơm.",
      "Nhà cũ nâng tầng phải đủ hai điều: phép cho phép thêm tầng, và móng chịu được. Có một trong hai thì chưa làm.",
      "Mùa mưa Thủ Đức làm trễ sơn ngoài và chống thấm mái. Tiến độ ghi cách xử lý ngày mưa, không ghi một ngày cố định cho có.",
    ],
  },
];

const JOBS = [
  {
    id: "bao-gia",
    test: /báo giá|giá xây/,
    blurb: "Chỉ so được khi cùng cách đo mét vuông, cùng năm 2026 và cùng danh mục đã gồm hay chưa gồm móng.",
    opener: "Một bảng giá chỉ đáng đọc khi ghi rõ cách đo sàn, năm áp dụng và những khoản không nằm trong đơn giá.",
    when: "Nên xin số sau khi có kích thước đất, số tầng và ảnh miệng hẻm. Thiếu ba thứ này, mọi con số chỉ là ước lượng.",
    tech: "Mốc tham khảo năm 2026 của Việt Dũng Phát: phần thô 3.950.000đ/m² sàn, trọn gói 5.950.000đ/m² sàn. Móng cọc, tầng hầm, mái đặc biệt, thang máy và nội thất xưởng nằm ở phụ lục.",
    fit: "Hợp đồng nên kèm bảng khối lượng, mác bê tông, thương hiệu thép và sơ đồ tim tường hay thông thủy. Đổi một trong các mục này là đổi giá.",
    steps: ["Gửi kích thước và ảnh hẻm", "Khảo sát nền và liền kề", "Lập bảng khối lượng", "Tách phụ lục móng và vận chuyển", "Ký theo đợt, giữ đối chứng"],
    cost: "Số trên website là mốc để hình dung. Giá ký là bảng sau khảo sát. Nhà 5×20 ba tầng khoảng 300 m² sàn, không phải 100 m² đất.",
    mistake: "Chọn báo giá thấp hơn 20–30% mà hợp đồng một trang, không có khối lượng. Khoản bị cắt thường là móng, chống thấm và vận chuyển hẻm — đúng những chỗ đội tiền sau này.",
    faqQ: "Vì sao hai báo giá cùng mét vuông lại lệch?",
    faqA: "Vì một bên đo tim tường, một bên đo thông thủy, và một bên chưa cộng bơm bê tông hay móng cọc.",
  },
  {
    id: "xin-phep",
    test: /xin phép/,
    blurb: "Hồ sơ phải đúng quy hoạch địa phương. Phối cảnh không thay giấy phép.",
    opener: "Xin phép là lập hồ sơ đúng quy hoạch và đúng nơi nộp, không phải vẽ một mặt đứng đẹp để đăng.",
    when: "Làm trước khi đào móng. Nhà đã đổ cột rồi mới xin là xử lý vi phạm, không phải thủ tục thông thường.",
    tech: "Bản vẽ xin phép ghi số tầng, chỉ giới, mật độ, khoảng lùi. Bản vẽ thi công ghi mặt cắt, thép, điện nước. Thiếu bản sau thì có phép vẫn xây lệch.",
    fit: "Dĩ An nộp theo Bình Dương. Biên Hòa và các huyện Đồng Nai nộp theo tỉnh. Quận 9 cũ và Thủ Đức nộp theo TP Thủ Đức. Không trộn biểu mẫu.",
    steps: ["Đối chiếu sổ với quy hoạch", "Đo hiện trạng và ranh", "Lập hồ sơ kiến trúc", "Nộp và sửa nếu bị yêu cầu", "Thi công đúng giấy đã cấp"],
    cost: "Phí hồ sơ và lệ phí tách khỏi đơn giá thi công mét vuông. Không gộp vào 3.950.000đ hay 5.950.000đ.",
    mistake: "Duyệt phối cảnh vượt tum và ban công rồi mới nộp. Cơ quan trả hồ sơ, mặt đứng phải vẽ lại, cọc thiết kế coi như mất.",
    faqQ: "Có được khởi công khi hồ sơ mới nộp?",
    faqA: "Không nên. Đào móng khi chưa có phép là rủi ro đình chỉ, không phải cách tranh thủ tiến độ.",
  },
  {
    id: "noi-that",
    test: /nội thất/,
    blurb: "Tủ và trần đóng theo tường thật, sau khi phần ướt đã nghiệm thu.",
    opener: "Nội thất nhà phố đóng theo kích thước tường thật, không mua tủ sẵn rồi che khe vài phân.",
    when: "Bắt đầu đo sau khi sàn, tường, cửa và điện nước hoàn thiện đã xong. Đo trên bản vẽ lúc nhà còn thô thì tủ sẽ hụt.",
    tech: "Trình tự: phần ướt xong, trần, sàn, rồi tủ và đá bếp. Điều hòa âm trần phải chốt trước khi đóng trần, nếu không phải cắt lại.",
    fit: "Xưởng Việt Dũng Phát đọc shop drawing, làm phào, tủ, sơn. Căn trong khu đô thị cần thêm lịch ban quản lý để đưa ván và đá.",
    steps: ["Đo tường sau hoàn thiện", "Duyệt bản vẽ và vật liệu", "Sản xuất tại xưởng", "Lắp theo từng tầng", "Bảo hành ray, bản lề, sơn"],
    cost: "Nội thất tính theo hạng mục hoặc combo, không cộng vào đơn giá xây mét vuông. Báo giá xây không bao gồm tủ bếp nếu phụ lục không ghi.",
    mistake: "Chốt màu trên ảnh điện thoại dưới ánh sáng cửa hàng, rồi bắt xưởng sơn lại cả tầng vì lệch tông với ánh sáng giếng trời.",
    faqQ: "Tủ bếp có nằm trong đơn giá xây không?",
    faqA: "Không, trừ khi phụ lục ghi rõ. Đơn giá xây và hạng mục xưởng là hai hợp đồng hoặc hai phụ lục.",
  },
  {
    id: "nang-tang",
    test: /nâng tầng/,
    blurb: "Chỉ nâng khi vừa đủ phép vừa đủ tải móng. Hai điều này không thay cho nhau.",
    opener: "Nâng tầng nhà phố là thêm tải lên móng và lên cột đang có, đồng thời phải được phép xây cho phép thêm tầng.",
    when: "Cần hồ sơ kết cấu cũ hoặc phải khảo sát lại móng, cột, đà. Không có hồ sơ thì không nhận nâng chỉ vì chủ nhà muốn thêm phòng.",
    tech: "Phép cho thêm tầng mà móng không chịu là không được đổ. Móng chịu mà phép không cho cũng không được đổ. Phải đủ cả hai.",
    fit: "Nhà trong hẻm phải tính đường đưa thép và bê tông lên tầng mới. Che chắn mái nhà bên trong suốt thời gian đục sàn mái.",
    steps: ["Đọc phép và quy hoạch", "Kiểm tra móng và cột", "Chốt phương án gia cố nếu cần", "Thi công tầng mới", "Chống thấm mái và nghiệm thu"],
    cost: "Không có đơn giá mét vuông nâng tầng dùng chung. Gia cố móng, đục sàn mái và kết cấu mới báo sau khảo sát.",
    mistake: "Đập mái tôn rồi đổ tầng mới trong tuần, không hỏi chỉ giới tum. Khi bị yêu cầu cắt, tiền bê tông đã mất.",
    faqQ: "Nhà cấp 4 nâng lên hai tầng được không?",
    faqA: "Chỉ khi phép cho phép và móng, tường chịu được tải mới. Nhiều nhà cấp 4 phải gia cố hoặc làm móng lại.",
  },
  {
    id: "cap-4",
    test: /cấp 4/,
    blurb: "Cải tạo nhà cấp 4 bắt đầu từ móng, mái và điện cũ, không bắt đầu từ sơn ngoài.",
    opener: "Nhà cấp 4 muốn ở lâu hơn hoặc lên tầng thì phải biết móng đang chịu gì và mái đang dột từ đâu.",
    when: "Nên làm khi tường còn thẳng và móng không lún lệch. Nếu nền đã nứt chạy qua sàn, phương án có thể là xây lại chứ không phải ốp lại.",
    tech: "Mái tôn cũ, trần thấp và điện đi nổi là ba hạng mục hay gặp. Nâng trần và đi điện âm phải tính lại cửa và cầu thang nếu có gác xép.",
    fit: "Ở vừa sửa thì chừa một khu nấu và một vệ sinh. Đập hết mái trong mùa mưa mà chưa có mái tạm là hỏng đồ.",
    steps: ["Khảo sát móng, mái, điện", "Chốt giữ hay phá", "Xử lý thấm và kết cấu", "Thi công phần mới", "Nghiệm thu từng hạng mục"],
    cost: "Không áp 3.950.000đ/m² cho cải tạo cấp 4. Mỗi nhà một khối lượng sau khi mở mái và xem móng.",
    mistake: "Sơn mặt tiền và lát gạch mới trong khi mái vẫn dột. Một mùa mưa là hỏng lớp vừa làm.",
    faqQ: "Có nên cải tạo cấp 4 hay xây mới?",
    faqA: "Xây mới khi móng yếu, trần quá thấp hoặc muốn thêm tầng mà kết cấu cũ không chịu. Cải tạo khi kết cấu còn tốt và phép không đòi xây lại.",
  },
  {
    id: "mat-tien",
    test: /mặt tiền/,
    blurb: "Mặt đứng phải đúng chỉ giới, đúng tỷ lệ cửa và đúng khả năng thi công phào, không chỉ đúng ảnh mẫu.",
    opener: "Mặt tiền nhà phố là phần lộ giới, ban công, cửa và vật liệu ngoài trời — làm sai là đục, không phải sơn lại.",
    when: "Chốt mặt đứng sau khi biết khoảng lùi và bề ngang thật. Nhà nở hậu vẫn có mặt tiền hẹp thì không vẽ ban công như nhà 8 m.",
    tech: "Phào, đá và lam che nắng phải có chi tiết và cách thoát nước. Đắp tay theo ảnh mạng sẽ bong sau một mùa nắng mưa.",
    fit: "Cải tạo mặt tiền nhà đang ở cần che bụi vào phòng và giữ cửa tạm. Nhà xây mới thì mặt đứng đi cùng kết cấu ô văng, không gắn sau.",
    steps: ["Đo mặt tiền và chỉ giới", "Phác tỷ lệ cửa và ban công", "Duyệt vật liệu ngoài trời", "Thi công ô văng và ốp", "Sơn và thoát nước mặt"],
    cost: "Đá, kính, lam và phào là phụ lục. Không giả định chúng đã nằm trong đơn giá xây thô.",
    mistake: "Chọn ảnh mặt tiền nhà 6 m rồi ép lên nhà 4 m. Cửa nhỏ lại, tỷ lệ hỏng, và ban công có thể vượt chỉ giới.",
    faqQ: "Mặt tiền có làm khác bản vẽ xin phép không?",
    faqA: "Phần vượt ra ngoài chỉ giới và tum thì không. Đổi vật liệu trong phạm vi đã cấp cần đối chiếu, không tự ý đua thêm.",
  },
  {
    id: "cai-tao",
    test: /cải tạo|sửa nhà|sửa chữa/,
    blurb: "Sửa nhà xử lý thấm, điện và kết cấu trước khi sơn. Nâng tầng là một việc riêng, phải đủ phép và đủ móng.",
    opener: "Sửa nhà phố bắt đầu bằng những gì đang hỏng bên trong, không bắt đầu bằng lớp sơn mặt tiền.",
    when: "Nên làm khi đã ở được một phần và muốn giữ khung. Nếu móng lún và tường nứt xuyên sàn, cần nói thẳng phương án xây lại.",
    tech: "Chống thấm vệ sinh, sân thượng và chân tường là gốc. Điện cũ đi nổi phải thay tuyến trước khi đóng trần mới.",
    fit: "Ở trong nhà khi sửa thì cuốn chiếu: xong khu nào bàn giao khu đó, chừa bếp và vệ sinh tạm. Hẻm hẹp cần giờ đưa phế thải.",
    steps: ["Khảo sát kết cấu và thấm", "Lập danh mục giữ hoặc đập", "Gia cố những chỗ yếu", "Thi công cuốn chiếu", "Nghiệm thu chống thấm"],
    cost: "Cải tạo không có một đơn giá mét vuông cho mọi căn. Báo sau khi mở trần, xem mái và xem móng.",
    mistake: "Thuê sơn và ốp trước, để thấm sang năm. Tiền hoàn thiện mất hai lần, trong khi gốc hỏng vẫn nằm sau gạch.",
    faqQ: "Sửa trọn gói gồm những gì?",
    faqA: "Gồm những hạng mục ghi trong bảng khối lượng sau khảo sát. Không có gói sửa vô hạn với một số tiền tròn.",
  },
  {
    id: "tan-co",
    test: /tân cổ điển/,
    blurb: "Tỷ lệ cột, phào và mái phải theo hồ sơ. Đắp tay theo ảnh sẽ thành nhà hộp dán hoa.",
    opener: "Nhà tân cổ điển đứng được nhờ tỷ lệ đế, thân, cột và phào, không nhờ gắn thêm hoa văn cho kín mặt tiền.",
    when: "Hợp với nhà có mặt tiền đủ rộng hoặc biệt thự có sân. Nhà ống 4 m nên giảm mật độ hoa, giữ nhịp cửa, nếu không nhìn rối.",
    tech: "Duyệt một đoạn phào mẫu trên công trình rồi mới làm đại trà. Sơn kem, trắng và đá sẫm cần ánh đèn ấm, không thử màu dưới nắng trưa.",
    fit: "Mái mansard hoặc tum phải có lớp chống thấm và cách nhiệt. Phào ngoài trời cần thoát nước, không đọng trên gờ ngang.",
    steps: ["Chốt tỷ lệ mặt đứng", "Làm đoạn phào mẫu", "Thi công kết cấu và ô văng", "Ốp đá và phào đại trà", "Sơn và lắp đèn"],
    cost: "Đơn giá xây cộng phụ lục phào, chỉ, đá mặt tiền và mái. Các khoản này không nằm im trong giá phần thô.",
    mistake: "Giao thợ đắp theo một tấm ảnh, không có mặt cắt phào. Mỗi tầng một tay nghề, nhà nhìn lệch nhịp.",
    faqQ: "Nhà hẹp có làm tân cổ điển được không?",
    faqA: "Được nếu giảm hoa văn, giữ cột và tỷ lệ cửa. Nhồi phào kín mặt tiền 4 m sẽ làm nhà thấp và rối.",
  },
  {
    id: "san-vuon",
    test: /sân vườn/,
    blurb: "Biệt thự sân vườn khác nhà phố ở nhịp cột, mái, sân và đường cho máy vào.",
    opener: "Biệt thự sân vườn phải chừa lối cho máy trong suốt phần thô. Sân và hàng rào làm sau, không làm trước.",
    when: "Chọn khi đất đủ rộng để có khoảng lùi và sân. Lô phố 5×20 không thành biệt thự sân chỉ vì vẽ thêm cỏ.",
    tech: "Móng theo đất vườn, không theo nhà ống. Mái, sảnh và đá ốp chốt sớm vì thời gian nhập và vì chúng đội giá nếu để phụ lục phút chót.",
    fit: "Thoát nước sân và cao độ so với đường là việc của hồ sơ, không phải việc của người làm vườn sau khi đã lát.",
    steps: ["Đo đất và khoảng lùi", "Chốt nhà và sân", "Thi công móng và thân", "Làm mái và đá", "Hoàn thiện sân sau cùng"],
    cost: "Mét vuông sàn cộng phụ lục mái, đá, hàng rào và sân. Không nhân đơn giá nhà phố 5 m cho cả khu vườn.",
    mistake: "Đổ sân bê tông và trồng cổng trước khi xây nhà. Xe bê tông không vào, phát sinh bơm và hỏng sân mới.",
    faqQ: "Sân vườn có tính trong mét vuông xây không?",
    faqA: "Không. Mét vuông xây là sàn nhà. Sân, tường rào và cây là hạng mục khác.",
  },
  {
    id: "biet-thu",
    test: /biệt thự/,
    blurb: "Biệt thự tính theo nhịp cột, sảnh và mái. Không so giá với nhà phố 5×20.",
    opener: "Thi công biệt thự là làm kết cấu nhịp lớn, mái và sảnh, rồi mới đến đá và cửa. Không rút gọn thành nhà phố phóng to.",
    when: "Nên có mặt bằng đất và hướng sân trước khi vẽ. Thiết kế biệt thự trên đất không đủ khoảng lùi sẽ vướng phép.",
    tech: "Cột, dầm và mái cần hồ sơ kết cấu riêng. Đá ốp ngoài trời và kính sảnh chốt chủng loại sớm vì thời gian đặt hàng.",
    fit: "Nếu đất chỉ là nhà phố mặt tiền, có thể làm ngôn ngữ mặt đứng biệt thự nhưng kết cấu vẫn là nhà ống. Phải nói thẳng điều đó.",
    steps: ["Khảo sát đất và khoảng lùi", "Phối cảnh và kết cấu", "Phần thô", "Mái, đá, cửa", "Sân và bàn giao"],
    cost: "Đơn giá mét vuông sàn cộng phụ lục mái, đá, thang máy nếu có. Không lấy 5.950.000đ nhân diện tích đất.",
    mistake: "So một mét vuông biệt thự với một mét vuông nhà ống trong hẻm rồi kết luận bên kia đắt. Hai nhà không cùng kết cấu.",
    faqQ: "Thiết kế biệt thự có gồm thi công không?",
    faqA: "Không mặc định. Hồ sơ thiết kế và hợp đồng thi công tách nhau để khối lượng đá, mái và sân được thấy trước khi ký.",
  },
  {
    id: "phan-tho",
    test: /phần thô/,
    blurb: "Phần thô là móng, khung, tường, mái và điện nước âm. Ốp, sơn và thiết bị nằm ngoài gói.",
    opener: "Xây phần thô dừng ở kết cấu, tường, mái và hệ điện nước đi âm. Chưa gồm ốp lát, sơn màu và thiết bị vệ sinh.",
    when: "Hợp khi gia chủ muốn tự hoàn thiện sau, hoặc tách ngân sách làm hai đợt. Không hợp nếu cần vào ở ngay khi nhận chìa khóa.",
    tech: "Trong gói: bê tông cốt thép, xây tường, cầu thang xây, chống thấm sàn ướt, ống điện nước chờ. Ngoài gói: phào đá mặt tiền, cửa gỗ, bếp.",
    fit: "Nghiệm thu phần thô bằng ảnh thép trước khi đổ, kích thước phòng và độ dốc sàn vệ sinh. Không nghiệm thu bằng cảm giác nhìn tường.",
    steps: ["Đo đất và chốt kết cấu", "Làm móng", "Dựng thân và mái", "Đi điện nước âm", "Nghiệm thu bàn giao thô"],
    cost: "Mốc năm 2026 khoảng 3.950.000đ/m² sàn. Móng cọc, tầng hầm và vận chuyển hẻm tính thêm.",
    mistake: "Tưởng phần thô đã gồm cửa, sơn và bếp vì nghe chữ xây nhà. Đến lúc ở mới phát hiện còn một đợt hoàn thiện nữa.",
    faqQ: "Phần thô đã ở được chưa?",
    faqA: "Chưa. Cần thêm hoàn thiện: ốp, sơn, cửa, thiết bị và điện đèn. Hai đợt nên có hai phạm vi viết rõ.",
  },
  {
    id: "hoan-thien",
    test: /hoàn thiện/,
    blurb: "Hoàn thiện là ốp, sơn, cửa, thiết bị và trần sau khi phần thô đã đúng kích thước.",
    opener: "Hoàn thiện biến nhà thô thành chỗ ở được: gạch, sơn, cửa, trần, thiết bị vệ sinh và đèn.",
    when: "Làm khi kết cấu đã nghiệm thu, tường đã khô và điện nước âm đã thử. Ốp lên tường còn ẩm là bong.",
    tech: "Chống thấm khu ướt phải xong và ngâm nước trước khi lát. Trần thạch cao đóng sau khi đường ống điều hòa đã treo.",
    fit: "Màu sơn và gạch duyệt bằng mẫu thật dưới ánh sáng của căn, không duyệt bằng ảnh. Cửa gỗ đo kích thước ô chờ, không đo trên bản vẽ cũ.",
    steps: ["Nghiệm thu tường và ống", "Chống thấm và lát", "Trần và sơn", "Lắp cửa và thiết bị", "Vệ sinh bàn giao"],
    cost: "Gói hoàn thiện báo theo chủng loại gạch, sơn, cửa. Đổi gạch rẻ sang đá là phụ lục, không phải cùng một đơn giá.",
    mistake: "Mua gạch và thiết bị lẻ từng tuần, thợ chờ vật tư. Tiền công đội vì tiến độ gãy, chứ không phải vì đơn giá ban đầu sai.",
    faqQ: "Hoàn thiện có gồm tủ bếp không?",
    faqA: "Không, nếu hợp đồng không ghi. Tủ bếp thuộc xưởng nội thất, đo sau khi tường bếp đã ốp.",
  },
  {
    id: "chia-khoa",
    test: /chìa khóa/,
    blurb: "Chìa khóa trao tay là một đầu mối đến lúc vào ở, kèm danh mục vật tư chứ không phải một câu hứa.",
    opener: "Chìa khóa trao tay nghĩa là gia chủ nhận nhà ở được từ một pháp nhân, với danh mục việc và vật tư đã viết.",
    when: "Hợp khi không muốn tự điều phối thợ xây, thợ sơn, thợ điện. Không hợp nếu muốn tự chọn từng viên gạch mà không ký phụ lục đổi giá.",
    tech: "Phạm vi cần một bảng: kết cấu, hoàn thiện cơ bản, cửa, thiết bị, những gì chưa gồm như tủ bếp và điều hòa.",
    fit: "Bàn giao kèm biên bản thiếu sót và thời hạn sửa. Giữ một phần giá trị đến khi hết lỗi nhỏ, thường 5–10%.",
    steps: ["Khảo sát và chốt công năng", "Dự toán đủ hạng mục vào ở", "Thi công thô và hoàn thiện", "Lắp thiết bị đã ghi", "Bàn giao và bảo hành"],
    cost: "Mốc trọn gói năm 2026 khoảng 5.950.000đ/m² là điểm xuất phát. Tủ, máy lạnh, mái kính và móng đặc biệt vẫn có thể nằm ngoài.",
    mistake: "Ký một câu chìa khóa trao tay không có danh mục. Đến lúc nhận nhà thiếu bếp, thiếu đèn, thiếu máy bơm.",
    faqQ: "Chìa khóa trao tay khác trọn gói thế nào?",
    faqA: "Cùng hướng một đầu mối, nhưng phải đọc danh mục. Nhiều gói gọi là trao tay nhưng dừng ở sơn nước, chưa có thiết bị.",
  },
  {
    id: "tron-goi",
    test: /trọn gói/,
    blurb: "Một hợp đồng từ móng đến sơn và điện nước, phụ lục tách những gì chưa gồm.",
    opener: "Xây trọn gói là giao một pháp nhân làm từ móng, khung, mái đến sơn, gạch và điện nước, thay vì tự ghép nhiều đội.",
    when: "Nên chọn khi chưa có đội thợ quen và muốn một chỗ bảo hành. Nếu chỉ cần khung rồi tự làm nội thất cao cấp, phần thô rõ ràng hơn.",
    tech: "Trong đơn giá mét vuông là những việc ghi trong bảng. Móng cọc, mái kính, thang máy, tủ bếp xưởng không được nuốt im vào chữ trọn gói.",
    fit: "Nhật ký ảnh thép trước khi đổ, biên bản chống thấm, tên người giám sát. Không có các mốc này thì khó đối chiếu khi tường thấm.",
    steps: ["Khảo sát đất và hẻm", "Chốt mặt bằng và mặt tiền", "Dự toán tách phụ lục", "Thi công móng, thân, mái", "Hoàn thiện và bàn giao"],
    cost: "Mốc năm 2026 khoảng 5.950.000đ/m² sàn. Cách đo tim tường hay thông thủy ghi trong hợp đồng trước khi tạm ứng.",
    mistake: "Thấy giá trọn gói thấp hơn thị trường nhiều mà không đọc phạm vi. Phần bị đẩy ra ngoài thường là móng, vận chuyển và cửa.",
    faqQ: "Trọn gói đã gồm nội thất chưa?",
    faqA: "Tủ bếp, giường và phào trang trí thường là phụ lục xưởng. Gói xây gồm hoàn thiện cơ bản nếu bảng khối lượng ghi vậy.",
  },
  {
    id: "thiet-ke",
    test: /thiết kế/,
    blurb: "Hồ sơ gồm bản xin phép và bản thi công. Thiếu bản thi công thì thợ làm lệch tầng.",
    opener: "Thiết kế nhà ở là đo đất thật, xếp người ở thật, rồi xuất bản vẽ xin phép và bản vẽ để thợ làm.",
    when: "Nên làm trước khi xin giá thi công. Giá mét vuông không có nghĩa khi chưa biết số tầng, móng và mặt đứng.",
    tech: "Đo nở hậu, hẻm, hướng và cao độ đường. Phối cảnh 3D chỉ để duyệt tỷ lệ, không thay mặt cắt cầu thang và chi tiết chống thấm.",
    fit: "KTS nói việc đất không làm được: vượt chỉ giới, thiếu sáng, cầu thang chiếm phòng. Không vẽ phối cảnh cho đẹp rồi để hồ sơ phép lệch.",
    steps: ["Đo hiện trạng", "Chốt công năng", "Mặt đứng và xin phép", "Bản vẽ kỹ thuật", "Bàn giao hồ sơ"],
    cost: "Thiết kế tính theo gói hoặc theo mét vuông sàn, tách khỏi giá xây. Đổi phương án sau khi đã có phép là phát sinh hồ sơ.",
    mistake: "Duyệt một ảnh 3D rồi đưa cho đội thợ không có mặt cắt. Cầu thang, dầm và giếng trời sẽ lệch so với ảnh.",
    faqQ: "Chỉ cần phối cảnh có đủ để xây không?",
    faqA: "Không. Cần bản vẽ kỹ thuật: mặt bằng, mặt cắt, kết cấu và điện nước. Ảnh đẹp không phải hồ sơ thi công.",
  },
  {
    id: "nha-thau",
    test: /nhà thầu|công ty xây|công ty kiến trúc/,
    blurb: "Chọn pháp nhân đứng bảo hành, xem công trình đã làm, đối chiếu mã số thuế trên hợp đồng.",
    opener: "Chọn nhà thầu là chọn người chịu trách nhiệm khi tường thấm, không phải chọn dòng giá thấp nhất trên mạng.",
    when: "Nên chọn trước khi đặt cọc lớn. Nhà từ hai tầng trở lên cần giám sát và nhật ký, không giao khoán miệng.",
    tech: "Hỏi đội nào tự làm, hạng mục nào thuê ngoài nhưng vẫn do công ty quản. Khoán trắng từng phần rồi mất dấu là kiểu hay hỏng.",
    fit: "Xem một công trình đang làm, không chỉ xem ảnh. Đối chiếu tên pháp nhân, mã số thuế và địa chỉ với hợp đồng.",
    steps: ["Xem hồ sơ và công trình", "Khảo sát đất", "Báo giá theo phạm vi", "Ký tiến độ và tạm ứng theo đợt", "Thi công có giám sát"],
    cost: "Giá theo mét vuông hoặc theo hạng mục, chốt sau khảo sát. Mốc phần thô 3.950.000đ/m² và trọn gói 5.950.000đ/m² chỉ để đối chiếu.",
    mistake: "Giao cọc vì báo giá rẻ và hẹn khởi công ngay, không có bảng khối lượng. Đội đổi người giữa chừng, không ai nhận phần thấm.",
    faqQ: "Công ty có tự thi công hay chỉ bán thầu?",
    faqA: "Việt Dũng Phát nhận thiết kế và thi công nhà ở, quản hạng mục thuê ngoài. Không nhận kiểu giao thầu rồi mất dấu đội.",
  },
  {
    id: "nam-tang",
    test: /5x20|5×20/,
    blurb: "Nhà 5×20 là bài toán giếng trời, cầu thang và ba đến bốn sàn, không phải 100 m² đất.",
    opener: "Nhà phố 5×20 mét đủ để ở nhưng rất dễ tối giữa nhà nếu cầu thang và giếng trời đặt sai.",
    when: "Chốt số tầng sau khi biết chỉ giới và nhu cầu phòng. Ba tầng và bốn tầng khác nhau cả phép, cả móng, cả tổng sàn.",
    tech: "Bề ngang 5 m cho phép một cầu thang và một dãy phòng. Đẩy vệ sinh ra giữa nhà mà không có giếng là phòng tối và ẩm.",
    fit: "Diện tích sàn minh họa: một trệt hai lầu khoảng ba sàn, gần 300 m² nếu xây kín, trừ sân và giếng. Nhân mét vuông trên số sàn, không nhân trên 100 m² đất.",
    steps: ["Đo đúng 5 m và chiều sâu", "Xếp cầu thang và giếng", "Chốt số tầng theo phép", "Dự toán theo sàn", "Thi công và lấy sáng thực tế"],
    cost: "Lấy mốc 3.950.000đ hoặc 5.950.000đ nhân diện tích sàn, rồi cộng móng và hẻm. Không nhân đơn giá với diện tích đất.",
    mistake: "Tính tiền trên 5×20 = 100 m² rồi nhân một tầng. Nhà ba sàn đội gấp ba lần con số đó, chưa kể móng.",
    faqQ: "Nhà 5×20 nên mấy tầng?",
    faqA: "Theo số người ở và theo phép. Thêm tầng khi cả chỉ giới lẫn móng cho phép, không thêm chỉ vì mẫu nhà trên mạng có bốn tầng.",
  },
  {
    id: "tret-1",
    test: /1 trệt 1 lầu/,
    blurb: "Một trệt một lầu là hai sàn cộng móng và mái. Công năng phải đủ phòng trước khi nghĩ tới tầng ba.",
    opener: "Nhà một trệt một lầu phù hợp quỹ đất nhỏ và gia đình ít người, với điều kiện mặt bằng đã đủ bếp, vệ sinh và phòng ngủ.",
    when: "Chọn khi phép hoặc ngân sách chưa nên lên ba tầng, và khi hai sàn đã xếp được người ở. Đừng xây hai tầng rồi năm sau đập mái.",
    tech: "Mái và sân thượng phải chống thấm ngay từ đầu nếu sau này muốn thêm tầng. Móng cũng nên xét tải tương lai, nếu phép cho phép nâng.",
    fit: "Cầu thang một vế chiếm chỗ trên mặt bằng hẹp. Vị trí thang chốt trước khi đổ cột, không chừa đại một lỗ.",
    steps: ["Chốt hai sàn đủ người ở", "Xem có để chờ nâng tầng", "Thi công móng và khung", "Lợp mái hoặc tum", "Hoàn thiện và bàn giao"],
    cost: "Tính trên hai sàn, cộng móng và mái. Mái bằng có sân thượng khác mái tôn về giá và về chống thấm.",
    mistake: "Làm móng và cột chỉ đủ hai tầng cho rẻ, trong khi chủ nhà đã tính thêm tầng. Lúc nâng phải gia cố, đắt hơn làm đủ từ đầu.",
    faqQ: "Một trệt một lầu có sân thượng được không?",
    faqA: "Được nếu phép và kết cấu mái cho phép, và chống thấm sân thượng nằm trong hợp đồng chứ không làm tạm.",
  },
  {
    id: "tret-2",
    test: /1 trệt 2 lầu/,
    blurb: "Một trệt hai lầu là ba sàn. Cầu thang và giếng trời phải thông suốt, không phải thêm một cái lầu cho đủ.",
    opener: "Nhà một trệt hai lầu là dạng phố biến phổ biến: ba sàn, một cầu thang, và nhu cầu lấy sáng cho tầng giữa.",
    when: "Hợp gia đình ba thế hệ nếu mỗi tầng có vệ sinh hoặc có cách đi không cắt phòng. Chốt việc này trên mặt bằng.",
    tech: "Tầng giữa thường tối nếu giếng trời dừng ở tầng hai. Mặt cắt phải thể hiện giếng đi đến đâu.",
    fit: "Ba sàn nhân đơn giá mới ra tiền xây. Cộng móng, mái, ban công. Đừng lấy giá một sàn rồi nhân cảm tính.",
    steps: ["Xếp ba tầng theo người ở", "Chốt giếng trời và thang", "Xin phép đủ số tầng", "Thi công liên tục đến mái", "Hoàn thiện từ trên xuống hoặc ngược lại theo hợp đồng"],
    cost: "Mốc mét vuông nhân tổng sàn ba tầng. Phụ lục móng và vận chuyển hẻm vẫn tách.",
    mistake: "Xin phép hai tầng rồi đổ thêm tum ở được. Tum sử dụng như tầng là lệch hồ sơ.",
    faqQ: "Một trệt hai lầu khác nhà ba tầng thế nào?",
    faqA: "Về số sàn ở, chúng gần nhau. Khác ở chỗ tum, mái và cách hồ sơ gọi tên. Đọc giấy phép để khỏi xây một tầng không có trong phép.",
  },
  {
    id: "bon-tang",
    test: /4 tầng/,
    blurb: "Bốn tầng đội tải móng, đội chiều cao và đội yêu cầu phép. Không phải bản ba tầng cộng thêm một sàn.",
    opener: "Nhà bốn tầng cần móng, cột và giấy phép tương ứng chiều cao, không phải lấy hồ sơ ba tầng rồi đúc thêm.",
    when: "Chỉ nên làm khi chỉ giới cho phép và đất chịu được. Hẻm quá hẹp còn phải tính đường đưa bê tông lên cao.",
    tech: "Chiều cao bốn tầng ảnh hưởng tum, thang và áp lực gió lên mặt tiền. Kết cấu không copy từ nhà hai tầng cùng bề ngang.",
    fit: "Tiến độ dài hơn, vốn lớn hơn. Tạm ứng theo đợt móng, thân, mái, hoàn thiện. Không ứng một cục cả bốn tầng.",
    steps: ["Đối chiếu số tầng với phép", "Chốt móng theo tải", "Dựng thân đến mái", "Chống thấm mái và vệ sinh từng tầng", "Hoàn thiện và nghiệm thu"],
    cost: "Tổng sàn bốn tầng nhân đơn giá, cộng móng. Đây là khoản lớn, phụ lục phải thấy trước khi đào.",
    mistake: "Xây đủ bốn tầng trên móng thiết kế cho ba tầng vì muốn tiết kiệm hồi đầu. Vết nứt xuất hiện sau khi vào ở.",
    faqQ: "Hẻm nhỏ có xây bốn tầng được không?",
    faqA: "Được về kết cấu nếu móng đúng, nhưng logistics khó hơn: bơm bê tông, giờ thi công và che chắn. Phép vẫn là điều kiện trước.",
  },
  {
    id: "ba-tang",
    test: /3 tầng/,
    blurb: "Nhà ba tầng là ba sàn cộng mái. Móng và phép phải đúng ba tầng từ đầu.",
    opener: "Xây nhà ba tầng là quy mô phố biến hay gặp: đủ phòng cho gia đình, vẫn phải tính giếng trời và móng cho đủ tải.",
    when: "Chọn khi hai tầng không đủ phòng và phép cho ba tầng. Nếu định thêm tầng nữa trong vài năm, nói trước để móng và cột không làm thiếu.",
    tech: "Sàn nào cũng cần vệ sinh hoặc đường đi hợp lý. Đẩy tất cả vệ sinh về một tầng cho rẻ đường ống sẽ làm nhà khó ở.",
    fit: "Ảnh thép trước mỗi lần đổ sàn. Ba lần đổ là ba lần kiểm tra, không chỉ kiểm tra sàn trệt.",
    steps: ["Chốt ba sàn và mái", "Thiết kế móng đủ tải", "Thi công từng sàn có nhật ký", "Chống thấm mái", "Hoàn thiện"],
    cost: "Nhân đơn giá với tổng ba sàn, không với diện tích đất. Móng cọc nếu có là phụ lục.",
    mistake: "Lấy giá nhà một trệt một lầu nhân đôi cho ba tầng. Mái, cầu thang và móng không tăng theo phép nhân đó.",
    faqQ: "Ba tầng có bắt buộc móng cọc không?",
    faqA: "Không bắt buộc với mọi đất. Đất yếu thì có. Kết luận sau khi xem nền tại thửa, không kết luận theo số tầng trên mạng.",
  },
  {
    id: "ong",
    test: /nhà ống/,
    blurb: "Nhà ống hẹp và sâu. Giếng trời, cầu thang và thông gió quan trọng hơn trang trí mặt tiền.",
    opener: "Nhà ống lấy sáng và gió bằng giếng trời, cửa sau và cầu thang. Trang trí mặt tiền không cứu được phòng giữa nếu mặt bằng tối.",
    when: "Đúng dạng khi bề ngang nhỏ hơn nhiều so với chiều sâu. Nhà rộng và nông không phải nhà ống, đừng dùng mặt bằng ống cho đất đó.",
    tech: "Bề ngang 3–5 m thường chỉ một dãy phòng. Vệ sinh và cầu thang phải chia sẻ chiều ngang mà không chặn giường.",
    fit: "Hẻm phía trước nhà ống hay hẹp. Vật tư và bê tông tính theo miệng hẻm, không theo vẻ đẹp mặt tiền.",
    steps: ["Đo ngang và sâu", "Xếp thang và giếng", "Chốt số phòng thật sự ở được", "Thi công khung", "Kiểm tra sáng thực tế trước khi ốp"],
    cost: "Mét vuông sàn nhà ống vẫn theo mốc thô hoặc trọn gói, cộng hẻm. Phòng tối phải đập giếng sau này đắt hơn làm giếng từ đầu.",
    mistake: "Cắt giếng trời để có thêm một phòng. Phòng đó không ở được, nhà phải thắp đèn cả ngày.",
    faqQ: "Nhà ống 4 m có giếng trời được không?",
    faqA: "Nên có. Mất khoảng một mét chiều sâu còn hơn mất ánh sáng cả ba tầng. Vị trí giếng vẽ trên mặt cắt.",
  },
  {
    id: "dan-dung",
    test: /dân dụng/,
    blurb: "Nhà ở dân dụng là nhà để ở, có phép nhà ở, không phải xưởng hay cửa hàng kiêm nhà không hồ sơ.",
    opener: "Thi công nhà ở dân dụng là làm nhà để ở: móng, khung, mái, điện nước và hoàn thiện theo hồ sơ nhà ở.",
    when: "Nhận khi đất ở và nhu cầu là nhà ở. Công trình xưởng, kho, nhà hàng cần hồ sơ khác, không gói vào hợp đồng nhà phố.",
    tech: "Tải sàn nhà ở, hành lang và tum khác tải sàn xưởng. Không dùng một kết cấu cho cả hai chỉ vì cùng một chủ.",
    fit: "Giám sát ghi nhật ký đổ bê tông, thép và chống thấm. Gia chủ nhận ảnh từng mốc, không chờ đến lúc sơn mới xem lại.",
    steps: ["Xác nhận đất ở và nhu cầu", "Thiết kế nhà ở", "Báo giá phạm vi", "Thi công có nhật ký", "Bàn giao bảo hành"],
    cost: "Áp mốc nhà ở: phần thô 3.950.000đ/m² hoặc trọn gói 5.950.000đ/m², chốt sau khảo sát. Không áp đơn giá nhà xưởng.",
    mistake: "Xây nhà ở nhưng ngăn trệt thành xưởng không có trong phép. Lúc thanh tra, phần sai phép không phải việc sơn lại cho xong.",
    faqQ: "Nhà ở dân dụng có gồm nội thất không?",
    faqA: "Gói xây và gói nội thất tách nhau. Dân dụng nói phạm vi xây nhà ở, không mặc định có tủ.",
  },
  {
    id: "xay-nha",
    test: /./,
    blurb: "Đo đất, chốt số tầng, làm móng đúng nền và thi công có nhật ký.",
    opener: "Xây nhà bắt đầu bằng đo thửa, đọc phép và chọn móng, không bắt đầu bằng một ảnh phối cảnh.",
    when: "Bắt đầu khi đã có giấy đất và biết nhà để ở, để cho thuê hay cả hai. Đổi mục đích sau khi đổ cột sẽ vỡ mặt bằng.",
    tech: "Nhà phố, nhà ống và nhà vườn không dùng chung kết cấu. Hẻm quyết định cách đổ bê tông. Nền quyết định móng.",
    fit: "Việt Dũng Phát khảo sát rồi mới nhận. Hợp đồng ghi phạm vi, cách tính mét vuông và người giám sát có tên.",
    steps: ["Khảo sát đất", "Thiết kế và phép", "Báo giá sau đo", "Thi công có nhật ký", "Nghiệm thu bàn giao"],
    cost: "Tham khảo phần thô 3.950.000đ/m² hoặc trọn gói 5.950.000đ/m² năm 2026. Số ký là số sau khảo sát.",
    mistake: "Chọn thầu vì rẻ và vì hẹn làm ngay tuần sau, khi chưa đo hẻm và chưa có bảng khối lượng.",
    faqQ: "Cần chuẩn bị gì trước khi gọi thầu?",
    faqA: "Sổ hoặc ảnh hiện trạng, kích thước mặt tiền và bề ngang hẻm. Chưa có số liệu thì chưa có dự toán đáng ký.",
  },
];

const NOTES = [
  "Ảnh thép trước khi đổ là bằng chứng duy nhất khi sàn nứt. Chụp đủ ô sàn, ghi ngày, gửi trong tuần — không để trong máy của đội trưởng.",
  "Mác bê tông và loại thép ghi bằng chữ trong hợp đồng. Nói miệng “thép tốt” không đối chiếu được khi nghiệm thu.",
  "Chống thấm vệ sinh ngâm nước 48 giờ trước khi lát. Bỏ bước này thì gạch đẹp vẫn thấm sau một năm.",
  "Giếng trời cần nắp hoặc mái kính có thoát nước. Mở trống cho sáng mà không che mưa là hỏng đồ tầng dưới.",
  "Cửa sổ hẻm nên tính hướng nhà bên, không phải chỉ tính hướng nắng trên bản đồ. Mở cửa nhìn thẳng vào phòng khách hàng xóm là phải sửa.",
  "Ống nước thải và ống cấp đi đúng cao độ đã vẽ. Đục nền vì dốc ngược là khoản phát sinh đáng trách nhất của phần âm tường.",
  "Sơn ngoài trời chỉ làm khi tường khô và hết bụi mài. Sơn vào buổi mưa hoặc lên tường ẩm là bong lớp.",
  "Ban công cần độ dốc ra ngoài và lỗ thoát không bị bịt bởi gạch hoàn thiện. Ngược dốc là nước vào phòng.",
  "Cầu thang nhà hẹp đo chiều đầu người đi. Bậc quá dốc, chiếu nghỉ quá hẹp, ở vài tháng là muốn đập.",
  "Tủ điện nên có nhánh riêng cho bếp, điều hòa và ổ cắm phòng. Một aptomat cho cả nhà là khó sửa khi sự cố.",
  "Mái tôn và mái bê tông khác nhau về ồn mưa, về nóng và về cách chống thấm. Chọn một kiểu rồi tính đủ phụ kiện, đừng đổi giữa chừng.",
  "Hàng rào và cổng làm sau khi xe đã vào xong phần thô. Làm trước là tự khóa đường mình.",
  "Vật tư để công trình cần người trông và chỗ khô. Mất xi măng vì mưa hoặc mất thép vì không khóa là tiền thật.",
  "Biên bản nhà liền kề ký trước ngày đào, kèm ảnh vết nứt cũ. Không có biên bản thì mọi vết nứt sau này bị đẩy cho đội mới.",
  "Giờ đổ bê tông thống nhất với hẻm. Xe bơm chắn đường mà không báo là bị dừng giữa mẻ.",
  "Tum và ô văng đối chiếu chỉ giới trước khi đổ. Cắt bê tông sau khi bị yêu cầu chỉnh đắt hơn sửa bản vẽ.",
  "Gạch lát chọn theo khu ướt và khu khô. Một mã gạch cho cả nhà thường trơn ở vệ sinh.",
  "Trần thạch cao đóng sau khi máy lạnh đã treo ống. Đóng trần rồi mới cắt lỗ là vừa xấu vừa thủng hơi.",
  "Bảo hành nên ghi từng việc: chống thấm, nứt kết cấu, cửa, thiết bị. Một câu “bảo hành 12 tháng” không nói được việc nào được sửa.",
  "Tạm ứng theo đợt móng, thân, mái, hoàn thiện. Ứng một khoản lớn trước khi có móng thì mất đòn bẩy khi cần sửa sai.",
  "Nhật ký thi công ghi số người, thời tiết và việc dở. Cuối tuần không có nhật ký thì không nhớ sàn nào đã đổ.",
  "Mẫu vật tư duyệt một lần, có tên hãng. Đổi sau khi hàng đã về thì làm phụ lục chênh lệch, không trừ miệng.",
  "Điện nước máy bơm và bể ngầm chốt vị trí trước khi đổ nền trệt. Khoan nền sau là đục bê tông mới.",
  "Lưới an toàn và che bạt là việc của đội, nhất là nhà sát nhà. Gạch rơi sang mái tôn bên cạnh là tranh chấp, không phải rủi ro chung chung.",
];

const VARIANTS = [
  {
    test: /công ty kiến trúc/,
    opener: "Chọn công ty kiến trúc là chọn nơi đo đất và xuất hồ sơ, rồi mới nói chuyện đơn giá thi công.",
    when: "Nên gặp khi đất đã có sổ nhưng mặt bằng chưa đứng với số người ở. Ký thi công khi mới có một ảnh 3D là ngược thứ tự.",
    tech: "Hồ sơ cần mặt bằng từng tầng, mặt cắt cầu thang, ghi chú chỉ giới và danh mục cửa. Phối cảnh để duyệt tỷ lệ cột và ô văng, không để thay bản vẽ kết cấu.",
    fit: "Công ty kiến trúc nói được việc nào đất không làm được: tum vượt, giếng trời ăn mất phòng, ban công đụng chỉ giới. Im những việc đó để vẽ cho đẹp là thiếu trách nhiệm.",
    cost: "Phí thiết kế tách khỏi mét vuông xây. Đổi công năng sau khi hồ sơ phép đã nộp thì tính thêm đợt chỉnh, không bảo hành miễn phí cho việc chủ nhà đổi ý.",
    mistake: "Thu một ảnh mặt tiền rồi đưa cho đội thợ không có mặt cắt. Cầu thang và dầm sẽ lệch so với ảnh, phòng bị cột chèn.",
  },
  {
    test: /công ty xây/,
    opener: "Chọn công ty xây là chọn pháp nhân đứng trên hợp đồng và trên hóa đơn, không phải chọn một tổ thợ quen.",
    when: "Nên chốt công ty trước khi đặt cọc vượt đợt móng. Nhà từ hai tầng trở lên cần giám sát có tên, không giao miệng cho đội trưởng.",
    tech: "Hỏi hạng mục nào công ty tự làm, hạng mục nào thuê nhưng vẫn do công ty nghiệm thu. Khoán trắng điện nước rồi mất dấu khi thấm là kiểu hay gặp.",
    fit: "Xem một nhà đang dựng, không chỉ album. Đối chiếu mã số thuế, địa chỉ và người ký với giấy phép kinh doanh.",
    cost: "Giá mét vuông chỉ có nghĩa khi kèm bảng khối lượng. Mốc phần thô 3.950.000đ và trọn gói 5.950.000đ dùng để đối chiếu, không phải giá ký.",
    mistake: "Chuyển khoản cho cá nhân trong khi hợp đồng mang tên công ty. Lúc sự cố không biết đòi pháp nhân nào.",
  },
  {
    test: /nhà thầu uy tín/,
    opener: "Nhà thầu uy tín được kiểm bằng công trình đang làm và bằng cách xử lý lỗi, không bằng lời tự nhận trên bài viết.",
    when: "Đặt lịch ra công trường trước khi tạm ứng. Nếu nhà thầu chỉ gửi ảnh và giục cọc, chưa đủ căn cứ để giao nhà.",
    tech: "Buổi xem nhà hỏi ba việc: ai giám sát, ảnh thép gửi lúc nào, chống thấm ngâm nước ra sao. Trả lời không được thì chưa nên ký.",
    fit: "Uy tín còn là giữ 5–10% đến hết lỗi nhỏ và có số điện thoại còn nghe sau bàn giao. Biến mất sau khi nhận đủ tiền là dấu hiệu ngược lại.",
    cost: "Giá thấp hơn mặt bằng quá xa mà không có bảng cắt giảm thì thường cắt móng, thép hoặc vận chuyển. Những khoản đó đội lại sau.",
    mistake: "Tin nhãn uy tín vì nhiều người giới thiệu miệng, không xem nhà và không đọc phạm vi. Giới thiệu không thay biên bản.",
  },
  {
    test: /sửa chữa nhà cũ/,
    opener: "Sửa nhà cũ là xử lý những gì đã hỏng: mái dột, điện nổi, tường ẩm, nền nứt. Không phải sơn một lớp cho mới.",
    when: "Bắt đầu khi đã ở trong nhà và muốn giữ khung. Nếu móng lún và nứt chạy qua sàn, phải nói phương án xây lại trước khi mua gạch.",
    tech: "Mở mái, mở trần vệ sinh, xem tủ điện. Ba chỗ này quyết định danh mục. Ảnh mặt tiền không cho biết mái có dột không.",
    fit: "Ở vừa sửa thì chừa bếp và một vệ sinh. Phế thải nhà cũ trong hẻm cần chuyến ba gác, tính vào dự toán.",
    cost: "Không có đơn giá mét vuông cho nhà cũ. Mỗi căn một khối lượng sau khi mở mái và gõ tường.",
    mistake: "Ốp gạch mới lên tường đang ẩm. Một mùa mưa là bong, tiền hoàn thiện mất.",
  },
  {
    test: /sửa nhà trọn gói/,
    opener: "Sửa trọn gói là một đầu mối làm hết danh mục đã khảo sát, từ thấm, điện đến sơn. Không có nghĩa là sửa mọi thứ phát sinh ngoài danh mục.",
    when: "Hợp khi chủ nhà không muốn tự gọi từng tổ thợ sơn, điện, chống thấm. Danh mục phải khóa trước khi gọi là trọn.",
    tech: "Bảng ghi việc giữ, việc đập, việc làm mới. Chống thấm khu ướt ngâm nước trước khi lát. Điện đi lại có sơ đồ aptomat.",
    fit: "Cuốn chiếu từng khu để còn chỗ ở. Khóa cửa và che đồ. Hạng mục thêm giữa chừng phải có phụ lục trước khi làm.",
    cost: "Tiền theo bảng khối lượng, tạm ứng theo khu vừa xong. Một số tròn “sửa hết nhà” mà không bảng là số không kiểm được.",
    mistake: "Thêm phòng, đổi cầu thang, nâng mái trong lúc sửa mà không đổi phép và không đổi giá. Ba việc đó không nằm trong chữ trọn gói.",
  },
  {
    test: /thi công nội thất/,
    opener: "Thi công nội thất là sản xuất và lắp theo tường đã hoàn thiện, đúng lịch xưởng và lịch công trình.",
    when: "Vào lắp khi sàn đã lát, sơn lót đã xong và công trình hết thợ xây. Lắp song song với đổ sàn là hỏng gỗ và chậm cả hai.",
    tech: "Xưởng cắt theo số đo tại nhà. Ray, bản lề, đá bếp và kính có lịch nhập. Trần đóng sau ống máy lạnh.",
    fit: "Trong khu có ban quản lý thì đăng ký ngày đưa ván và đá. Nhà hẻm thì tính chuyến ba gác cho tấm dài.",
    cost: "Tính theo hạng mục tủ, giường, trần, đá. Không cộng vào đơn giá xây mét vuông.",
    mistake: "Cắt gỗ theo bản vẽ lúc nhà còn thô. Tường tô xong lệch vài phân là tủ hụt hoặc kênh.",
  },
  {
    test: /thiết kế nội thất/,
    opener: "Thiết kế nội thất là xếp công năng, ánh sáng và đồ gỗ trên kích thước phòng, trước khi xưởng cắt.",
    when: "Làm song song cuối giai đoạn xây, nhưng số đo chốt lại sau khi tường tô. Bản vẽ sớm để duyệt hướng bếp và hướng giường.",
    tech: "Bản vẽ gồm mặt bằng đồ, mặt đứng tủ, vị trí ổ điện và điều hòa. Thiếu mặt đứng tủ thì thợ lắp theo cảm tính.",
    fit: "Màu và vật liệu duyệt bằng mẫu thật. Ảnh catalogue dưới đèn cửa hàng khác ánh sáng giếng trời trong nhà ống.",
    cost: "Phí thiết kế nội thất tách khỏi tiền sản xuất. Đổi mẫu sau khi đã đặt ván là phát sinh, ghi phụ lục.",
    mistake: "Duyệt một góc phối cảnh rồi bỏ qua mặt bằng điện. Lúc lắp, ổ cắm nằm sau bản lề.",
  },
  {
    test: /thiết kế mặt tiền/,
    opener: "Thiết kế mặt tiền là cân cửa, ban công, lam và vật liệu trên đúng bề ngang và đúng chỉ giới.",
    when: "Làm sau khi đo mặt tiền và đọc khoảng lùi. Không phóng một mẫu nhà 7 m lên nhà 4 m.",
    tech: "Mặt đứng cần ghi cao độ từng tầng, vị trí ô văng và cách thoát nước ban công. Phào chỉ có chi tiết, không chỉ có màu.",
    fit: "Nhà hẹp giảm chi tiết, giữ nhịp cửa. Nhà mặt đường chịu bụi thì chọn vật liệu rửa được.",
    cost: "Hồ sơ mặt tiền là gói thiết kế. Đá, lam, kính khi thi công là phụ lục vật tư, chưa nằm trong phí vẽ.",
    mistake: "Chốt màu trên màn hình rồi mới biết ban công vượt chỉ giới. Phải vẽ lại, mẫu đá đã đặt thì lỗ.",
  },
  {
    test: /xây nhà mặt tiền|nhà mặt tiền/,
    opener: "Xây nhà mặt tiền là thi công ô văng, cửa và lớp hoàn thiện ngoài trời đúng hồ sơ, đúng chỉ giới.",
    when: "Khởi công phần mặt ngoài khi kết cấu ô văng đã có trong bản vẽ, không gắn đá lên đà làm tạm.",
    tech: "Độ dốc ban công, lỗ thoát, chống thấm chân cửa và khe co giãn là bốn việc hay bị bỏ khi chỉ nhìn phối cảnh.",
    fit: "Mặt đường cần lưới che và giờ cắt đá. Bụi sơn bay sang nhà bên nếu không bạt.",
    cost: "Đá, cửa nhôm kính và lam tính riêng mét vuông xây. Đổi đá giữa chừng đổi luôn phụ kiện.",
    mistake: "Làm mặt tiền theo nhà bên đang xây vượt chỉ giới. Khi bị yêu cầu cắt, tiền ốp không lấy lại.",
  },
  {
    test: /giá xây nhà phần thô/,
    opener: "Giá phần thô chỉ so được khi cùng một danh mục: móng, khung, tường, mái, điện nước âm — và cùng cách đo sàn.",
    when: "Xin bảng này khi đã biết số tầng và loại móng dự kiến. Chưa khảo sát thì mọi số phần thô là số minh họa.",
    tech: "Mốc 3.950.000đ/m² năm 2026 là giá sàn tham khảo, chưa gồm cọc, tầng hầm, bơm bê tông hẻm. Những dòng đó phải hiện trên bảng.",
    fit: "Hợp đồng ghi mác bê tông, loại thép và sơ đồ tim tường hoặc thông thủy. Đổi một trong ba là đổi giá.",
    cost: "Nhà ba sàn không được tính bằng diện tích đất. Lấy tổng sàn nhân đơn giá, rồi cộng móng và vận chuyển.",
    mistake: "Nhận một câu “phần thô bao nhiêu một mét” qua điện thoại rồi chuyển cọc. Không bảng thì không biết cửa sổ đã gồm chưa.",
  },
  {
    test: /giá xây nhà trọn gói/,
    opener: "Giá trọn gói phải kèm chủng loại gạch, sơn, cửa và thiết bị. Thiếu chủng loại thì hai bảng không so được.",
    when: "Lập bảng sau khi có mặt bằng và mặt đứng. Trọn gói trên một cái ảnh mặt tiền là số trang trí.",
    tech: "Mốc 5.950.000đ/m² năm 2026 gồm hoàn thiện cơ bản nếu đúng bảng của công ty. Tủ bếp, máy lạnh, mái kính, thang máy vẫn có thể ở ngoài.",
    fit: "Đọc cột “không gồm”. Khoản bị đẩy ra ngoài thường là móng cọc và vận chuyển hẻm — đúng chỗ đội tiền.",
    cost: "Tạm ứng theo đợt, mỗi đợt khớp khối lượng. Giá trọn không có nghĩa là ứng 70% trước móng.",
    mistake: "Chọn bảng rẻ hơn vì không thấy dòng cửa và dòng chống thấm. Đến lúc lắp cửa mới biết đó là phát sinh.",
  },
  {
    test: /sửa nhà nâng tầng/,
    opener: "Sửa để nâng tầng là đục mái cũ, kiểm tra cột đang chịu, rồi mới đổ tầng mới. Không phải lợp thêm một cái sàn lên mái tôn.",
    when: "Chỉ làm khi phép cho thêm tầng và móng cột còn đủ tải. Một trong hai chưa đủ thì dừng ở bước khảo sát.",
    tech: "Nhà cũ thường không còn hồ sơ thép. Phải khoan kiểm tra hoặc bóc lớp vữa ở cột. Không nhìn tường thẳng mà kết luận móng khỏe.",
    fit: "Che mưa cho các tầng đang ở trong suốt thời gian mở mái. Hẻm phải có đường đưa bê tông lên cao.",
    cost: "Không nhân đơn giá xây mới cho phần nâng. Gia cố móng, đục sàn mái và kết cấu mới là các dòng riêng.",
    mistake: "Đập mái tuần này, đổ sàn tuần sau, hồ sơ phép nộp sau nữa. Bị đình chỉ là mất cả mẻ bê tông.",
  },
  {
    test: /thiết kế nhà 5x20/,
    opener: "Thiết kế nhà khoảng 5×20 m là giữ giếng trời và một dãy phòng, rồi mới tính mặt tiền trên đúng 5 m.",
    when: "Đo đủ bốn cạnh vì nhà phố hay nở hậu. Vẽ hình chữ nhật trên đất méo là phòng trên lệch phòng dưới.",
    tech: "Mặt cắt phải thấy giếng trời đi đến tầng nào và cầu thang chiếm bao nhiêu mét. Ảnh 3D không hiện được dầm chắn đầu.",
    fit: "Với nhà khoảng 5 m ngang, một dãy phòng là hợp lý. Nhét hai dãy là giường không kê được.",
    cost: "Phí hồ sơ tính theo sàn hoặc theo gói. Xin phép và bản thi công là hai lớp, thiếu lớp sau thì thợ không làm đúng.",
    mistake: "Duyệt mặt tiền đẹp trong khi cầu thang chiếm mất phòng ngủ tầng hai. Phát hiện lúc đã xin phép thì sửa hồ sơ mất tuần.",
  },
];

function variantOf(phrase) {
  const p = phrase.toLowerCase();
  return VARIANTS.find((row) => row.test.test(p)) || null;
}

function scopeNote(phrase) {
  const p = phrase.toLowerCase();
  if (/giá xây nhà phần thô|báo giá xây nhà/.test(p) && /phần thô/.test(p)) {
    return "Với giá phần thô, bảng phải liệt kê móng, cột, đà, sàn, tường, mái và điện nước âm. Cửa, sơn, gạch và thiết bị mà xuất hiện trong tổng tiền thì ghi rõ, kẻo hai bên hiểu hai kiểu phần thô.";
  }
  if (/giá xây nhà trọn gói/.test(p)) {
    return "Với giá trọn gói, hỏi từng dòng: gạch loại nào, sơn trong và ngoài, cửa đi, cửa sổ, thiết bị vệ sinh, bơm nước. Dòng không có tên thì chưa được xem là đã gồm.";
  }
  if (/báo giá/.test(p)) {
    return "Báo giá đáng ký là một bảng khối lượng, không phải một số mét vuông gửi qua tin nhắn. Mỗi dòng có đơn vị, số lượng và việc không gồm.";
  }
  if (/xin phép/.test(p)) {
    return "Hồ sơ phép cần khớp sổ và quy hoạch đang dùng tại nơi nộp. Bản vẽ đẹp nhưng sai chỉ giới sẽ bị trả, và móng không được đào để “tranh thủ”.";
  }
  if (/nội thất/.test(p)) {
    return "Nội thất đo sau khi tường tô và lát xong. Bản vẽ lúc nhà còn thô chỉ để định hướng, không phải số cắt gỗ.";
  }
  if (/nâng tầng/.test(p)) {
    return "Nâng tầng cần hai giấy: giấy phép cho thêm tầng, và kết luận móng cột chịu được tải mới. Có một trong hai thì chưa đổ sàn.";
  }
  if (/cấp 4/.test(p)) {
    return "Nhà cấp 4 cải tạo phải mở mái và xem móng trước khi chốt sơn. Nếu kết cấu không chịu thêm tầng, phương án sửa khác phương án xây lại.";
  }
  if (/cải tạo mặt tiền|thiết kế mặt tiền|nhà mặt tiền/.test(p)) {
    return "Mặt tiền chốt theo bề ngang đo được và theo khoảng lùi. Ảnh mẫu nhà rộng hơn không phóng lên mặt tiền hẹp.";
  }
  if (/sửa chữa nhà cũ|sửa nhà|cải tạo/.test(p)) {
    return "Sửa nhà cũ lập danh mục giữ và đập. Hạng mục không có trong danh mục thì chưa được thi công, dù thợ thấy “làm luôn cho tiện”.";
  }
  if (/tân cổ điển/.test(p)) {
    return "Tân cổ điển cần một đoạn phào mẫu trên nhà thật trước khi làm cả mặt đứng. Không đắp đại trà theo một tấm ảnh.";
  }
  if (/sân vườn/.test(p)) {
    return "Sân vườn để lối xe đến hết phần thô. Hàng rào, cổng và sân hoàn thiện làm sau cùng.";
  }
  if (/thiết kế biệt thự|thiết kế nhà/.test(p)) {
    return "Hồ sơ thiết kế giao đủ bản xin phép và bản thi công. Phối cảnh 3D chỉ để duyệt tỷ lệ, thợ không xây theo ảnh.";
  }
  if (/biệt thự/.test(p)) {
    return "Biệt thự có nhịp cột, sảnh và mái riêng. Không lấy biện pháp nhà ống rồi phóng kích thước.";
  }
  if (/phần thô/.test(p)) {
    return "Bàn giao phần thô kèm kích thước phòng, độ dốc khu ướt và ảnh thép. Thiếu ba mục này thì chưa gọi là xong thô.";
  }
  if (/hoàn thiện/.test(p)) {
    return "Hoàn thiện bắt đầu khi tường khô và ống đã thử. Lát lên tường ẩm hoặc sơn lên bụi là làm lại.";
  }
  if (/chìa khóa/.test(p)) {
    return "Chìa khóa trao tay cần danh mục đồ sẽ có trong nhà lúc nhận: cửa, đèn, thiết bị, bơm. Câu hứa chung không thay danh mục.";
  }
  if (/trọn gói/.test(p)) {
    return "Trọn gói một đầu mối vẫn phải có phụ lục những việc chưa gồm: móng đặc biệt, mái kính, tủ bếp, máy lạnh.";
  }
  if (/công ty kiến trúc|thiết kế/.test(p)) {
    return "Công ty kiến trúc bàn giao mặt bằng, mặt cắt và chi tiết, không chỉ một ảnh phối cảnh. Đổi công năng sau phép là hồ sơ mới.";
  }
  if (/nhà thầu uy tín/.test(p)) {
    return "Uy tín kiểm bằng công trình đang làm, tên giám sát và mã số thuế trên hợp đồng. Ảnh trên mạng không thay được buổi ra công trường.";
  }
  if (/công ty xây/.test(p)) {
    return "Công ty xây đứng tên trên hợp đồng phải là bên gọi điện khi sự cố. Khoán trắng từng tổ mà không người phụ trách là mất dấu bảo hành.";
  }
  if (/nhà thầu/.test(p)) {
    return "Nhà thầu nên chỉ một đầu mối nghiệm thu. Nhiều tổ không có nhật ký chung thì không biết sàn nào đã được kiểm tra.";
  }
  if (/5x20|5×20/.test(p)) {
    return "Nhà 5×20 tính tiền trên diện tích sàn các tầng, không trên 100 m² đất. Giếng trời và cầu thang phải có mặt trong mặt bằng trước khi duyệt mặt tiền.";
  }
  if (/1 trệt 1 lầu/.test(p)) {
    return "Một trệt một lầu chốt mái ngay từ đầu: mái tôn, mái bằng hay sân thượng. Đổi mái sau khi đổ giằng là phát sinh.";
  }
  if (/1 trệt 2 lầu/.test(p)) {
    return "Một trệt hai lầu cần giếng trời xuyên được các tầng ở. Giếng dừng giữa chừng thì tầng dưới phải bật đèn ban ngày.";
  }
  if (/4 tầng/.test(p)) {
    return "Bốn tầng cần móng và cột thiết kế đúng chiều cao đó. Không dùng hồ sơ ba tầng rồi đúc thêm một sàn.";
  }
  if (/3 tầng/.test(p)) {
    return "Ba tầng là ba lần đổ sàn, ba lần chụp thép. Chỉ kiểm tra sàn trệt rồi bỏ qua hai sàn trên là thiếu nhật ký.";
  }
  if (/nhà ống/.test(p)) {
    return "Nhà ống không cắt giếng trời để thêm một phòng tối. Phòng không ở được thì mét vuông đó là tiền bỏ.";
  }
  if (/dân dụng/.test(p)) {
    return "Nhà ở dân dụng làm theo phép nhà ở. Ngăn trệt thành xưởng hoặc quán khi hồ sơ không ghi là lệch công năng.";
  }
  if (/mặt tiền/.test(p)) {
    return "Nhà mặt tiền đo khoảng lùi thực tế, gồm cả vỉa hè và chỉ giới đường. Ban công đua theo nhà bên có thể là nhà bên đang sai.";
  }
  return "Khảo sát từng thửa trước khi tạm ứng. Kích thước mặt tiền, miệng hẻm và hướng thoát nước là ba số liệu tối thiểu để lập dự toán.";
}

function placeOf(phrase) {
  const p = phrase.toLowerCase();
  return PLACES.find((place) => place.test.test(p)) || PLACES[PLACES.length - 1];
}

function jobOf(phrase) {
  const p = phrase.toLowerCase();
  if (/thiết kế/.test(p) && !/nội thất|mặt tiền/.test(p)) return JOBS.find((job) => job.id === "thiet-ke");
  return JOBS.find((job) => job.test.test(p)) || JOBS[JOBS.length - 1];
}

function relatedItems(item) {
  const group = KEYWORDS.filter((k) => k.group === item.group);
  const index = group.findIndex((k) => k.slug === item.slug);
  return [1, 2].map((step) => group[(index + step) % group.length]);
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function clipDesc(text) {
  let desc = String(text).replace(/\s+/g, " ").trim();
  if (desc.length <= 158) return desc;
  const cut = desc.slice(0, 158);
  const sp = cut.lastIndexOf(" ");
  desc = (sp > 90 ? cut.slice(0, sp) : cut).trim().replace(/[,:;–—-]+$/, "").trim();
  return desc;
}

export function locationDesc(item) {
  const place = placeOf(item.phrase);
  const job = jobOf(item.phrase);
  const head = cap(item.phrase);
  const patterns = [
    `${head}. ${place.blurb}`,
    `${head} — ${job.blurb} ${place.costNote}`,
    `${head}: ${place.costNote}`,
    `${head}. ${place.risk}`,
    `${head} — ${job.opener}`,
    `${head}. ${job.fit}`,
  ];
  const start = hash(item.slug) % patterns.length;
  const ordered = patterns.map((_, i) => patterns[(start + i) % patterns.length]);
  for (const raw of ordered) {
    const desc = raw.replace(/\s+/g, " ").trim();
    if (desc.length <= 158 && desc.length >= 80 && desc.toLowerCase().includes(item.phrase)) return desc;
  }
  const fallback = `${head}. ${place.blurb}`.replace(/\s+/g, " ").trim();
  return fallback.length <= 158 ? fallback : clipDesc(fallback);
}

export function locationFaqs(item) {
  const place = placeOf(item.phrase);
  const job = jobOf(item.phrase);
  const kw = item.phrase;
  return [
    { q: job.faqQ, a: job.faqA },
    {
      q: `Khảo sát ${kw} cần mang gì?`,
      a: `Mang sổ hoặc ảnh hiện trạng, kích thước mặt tiền và bề ngang miệng hẻm tại ${place.name}. Chưa đủ số liệu thì chưa có dự toán đáng ký.`,
    },
    {
      q: `${cap(kw)} chốt giá lúc nào?`,
      a: `Sau buổi đo đất. Mốc mét vuông năm 2026 chỉ để đối chiếu; móng, hẻm và phép được ghi thành dòng riêng.`,
    },
  ];
}

export function locationMeta(item) {
  const pack = mediaPack(item.slug);
  const related = relatedItems(item);
  return {
    title: locationTitle(item.phrase),
    desc: locationDesc(item),
    image: pack.cover,
    faqs: locationFaqs(item),
    keywords: related.map((k) => k.phrase).join(", "),
  };
}

const ALT = [
  "mặt tiền nhà phố",
  "phòng khách sau hoàn thiện",
  "cầu thang và giếng trời",
  "bếp và bàn ăn",
  "sân và lối vào",
];

export function locationHtml(item) {
  const kw = item.phrase;
  const place = placeOf(item.phrase);
  const job = { ...jobOf(item.phrase), ...(variantOf(item.phrase) || {}) };
  const facts = pickN(place.facts, item.slug, Math.min(5, place.facts.length));
  while (facts.length < 5) facts.push(place.facts[facts.length % place.facts.length]);
  const notes = pickN(NOTES, `${item.slug}:note`, 3);
  const pack = mediaPack(item.slug);
  const related = relatedItems(item);
  const faqs = locationFaqs(item);
  const steps = job.steps.map((step, i) => `${i + 1}. ${step}`).join(" ");
  const img = (n) => `<p><img src="${pack.body[n]}" alt="${esc(kw)} — ${ALT[n]}" /></p>`;
  const leadWords = words(`${job.opener} ${facts[0]}`);
  const leadCut = leadWords.length > 100 ? Math.ceil(leadWords.length / 2) : leadWords.length;
  const lead = `<p><strong>${esc(kw)}</strong> — ${esc(leadWords.slice(0, leadCut).join(" "))}</p>${
    leadCut < leadWords.length ? `\n<p>${esc(leadWords.slice(leadCut).join(" "))}</p>` : ""
  }`;

  return `${lead}
<nav class="toc"><strong>Mục lục</strong>
<ol>
<li><a href="#tong-quan">${esc(kw)}: ${esc(place.h2)}</a></li>
<li><a href="#ky-thuat">${esc(place.techH2)}</a></li>
<li><a href="#phu-hop">Khi nào nên làm</a></li>
<li><a href="#quy-trinh">Quy trình tại Việt Dũng Phát</a></li>
<li><a href="#chi-phi">Chi phí và hợp đồng</a></li>
<li><a href="#sai-lam">Sai lầm hay gặp</a></li>
<li><a href="#luu-y">Rủi ro tại hiện trường</a></li>
<li><a href="#faq">Câu hỏi thường gặp</a></li>
</ol>
</nav>
<h2 id="tong-quan">${esc(kw)}: ${esc(place.h2)}</h2>
${p(facts[1])}
${p(job.when)}
${img(0)}
<h2 id="ky-thuat">${esc(place.techH2)}</h2>
${p(facts[2])}
${p(job.tech)}
${p(scopeNote(kw))}
${p(notes[0])}
${img(1)}
<h2 id="phu-hop">Khi nào nên làm</h2>
${p(job.fit)}
${img(2)}
<h2 id="quy-trinh">Quy trình làm việc</h2>
${p(steps)}
<p>Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát thành lập năm 2014, nhận khảo sát, thiết kế và thi công nhà ở. Đặt lịch tại <a href="/lien-he">trang liên hệ</a>, xem <a href="/mau-nha">mẫu nhà</a>, <a href="/bao-gia">bảng giá</a> và <a href="/gioi-thieu">giới thiệu công ty</a>. Bài liên quan: <a href="${keywordNewsPath(related[0])}">${esc(related[0].phrase)}</a>, <a href="${keywordNewsPath(related[1])}">${esc(related[1].phrase)}</a>.</p>
${img(3)}
<h2 id="chi-phi">${esc(kw)} và cách tính tiền</h2>
${p(`${job.cost} ${place.costNote}`)}
${p(facts[4])}
${img(4)}
<h2 id="sai-lam">Sai lầm hay gặp</h2>
${p(job.mistake)}
${p(notes[1])}
<h2 id="luu-y">Rủi ro cần chốt trước</h2>
${p(place.risk)}
${p(notes[2])}
${p(facts[3])}
<p>Đối chiếu thủ tục tại <a href="https://dichvucong.gov.vn/">Cổng Dịch vụ công quốc gia</a>. Văn phòng 942/2/7 Kha Vạn Cân, Trường Thọ, Thủ Đức. Hotline 098.4444.504. Giữ 5–10% giá trị đến khi hết lỗi nhỏ.</p>
<h2 id="faq">Câu hỏi thường gặp</h2>
${faqs.map((f) => `<h3>${esc(f.q)}</h3>\n${p(f.a)}`).join("\n")}`;
}

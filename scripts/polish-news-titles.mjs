import { readFileSync, writeFileSync } from "node:fs";

const MAP = [
  ["đông hòa dĩ an", "Đông Hòa, Dĩ An"],
  ["an bình dĩ an", "An Bình, Dĩ An"],
  ["tân đông hiệp dĩ an", "Tân Đông Hiệp, Dĩ An"],
  ["dĩ an bình dương", "Dĩ An, Bình Dương"],
  ["biên hòa đồng nai", "Biên Hòa, Đồng Nai"],
  ["long thành đồng nai", "Long Thành, Đồng Nai"],
  ["hiệp phú thủ đức", "Hiệp Phú, Thủ Đức"],
  ["long phước quận 9", "Long Phước, Quận 9"],
  ["thành phố thủ đức", "Thành phố Thủ Đức"],
  ["vinhomes grand park", "Vinhomes Grand Park"],
  ["grand park", "Grand Park"],
  ["hồ chí minh", "Hồ Chí Minh"],
  ["tphcm", "TP.HCM"],
  ["thủ đức", "Thủ Đức"],
  ["dĩ an", "Dĩ An"],
  ["biên hòa", "Biên Hòa"],
  ["đồng nai", "Đồng Nai"],
  ["long thành", "Long Thành"],
  ["nhơn trạch", "Nhơn Trạch"],
  ["trảng bom", "Trảng Bom"],
  ["long bình tân", "Long Bình Tân"],
  ["quận 9", "Quận 9"],
  ["quận 7", "Quận 7"],
  ["gò vấp", "Gò Vấp"],
  ["bình thạnh", "Bình Thạnh"],
  ["tân bình", "Tân Bình"],
  ["tân phú", "Tân Phú"],
  ["bình tân", "Bình Tân"],
  ["nhà bè", "Nhà Bè"],
  ["bình chánh", "Bình Chánh"],
  ["long an", "Long An"],
  ["bình dương", "Bình Dương"],
  ["phước long b", "Phước Long B"],
  ["phước long", "Phước Long"],
  ["tăng nhơn phú a", "Tăng Nhơn Phú A"],
  ["tăng nhơn phú", "Tăng Nhơn Phú"],
  ["long trường", "Long Trường"],
  ["long phước", "Long Phước"],
  ["linh xuân", "Linh Xuân"],
  ["trường thọ", "Trường Thọ"],
  ["hiệp phú", "Hiệp Phú"],
  ["kha vạn cân", "Kha Vạn Cân"],
  ["đông hòa", "Đông Hòa"],
  ["an bình", "An Bình"],
  ["việt dũng phát", "Việt Dũng Phát"],
  ["mansard", "Mansard"],
  ["lỗ ban", "Lỗ Ban"],
];

const SKIP_PLACE = new Set(["Việt Dũng Phát", "Mansard", "Lỗ Ban"]);
const places = [...new Set(MAP.map(([, to]) => to))]
  .filter((name) => !SKIP_PLACE.has(name))
  .sort((a, b) => b.length - a.length);
const PLACE_END = new RegExp(
  `(?:${places.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?: 20\\d\\d)?$`,
);

export function polishNewsTitle(raw) {
  let s = String(raw || "").trim().toLowerCase();
  s = s.replace(/^chi phí xây (?!nhà)/, "chi phí xây nhà ");
  s = s.replace(/(\d)m2\b/g, "$1 m²").replace(/\bm2\b/g, "m²");
  if (/\sm²$/.test(s) && !/\d m²$/.test(s)) s = s.replace(/\sm²$/, " theo m²");
  s = s.replace(/\b3d\b/g, "3D");
  for (const [from, to] of MAP) {
    s = s.replaceAll(from, to);
  }
  s = s.replace(PLACE_END, (match, offset, str) => {
    const year = match.match(/ 20\d\d$/)?.[0] || "";
    const place = year ? match.slice(0, -year.length) : match;
    const before = str.slice(0, offset).trim();
    if (/(?:^|\s)(?:tại|đường)$/i.test(before)) return match;
    if (/(?:^|\s)ở$/i.test(before) && !/(công ty|xây dựng).+nhà ở$/i.test(before)) return match;
    return `tại ${place}${year}`;
  });
  s = s.replace(/\s+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const isDirectRun = process.argv[1]?.endsWith("polish-news-titles.mjs");
if (isDirectRun) {
const files = process.argv.slice(2);
if (!files.length) {
  const samples = [
    "xây nhà trọn gói tphcm",
    "chi phí xây nhà dĩ an",
    "sửa nhà cũ đông hòa",
    "chi phí xây long bình tân",
    "xây nhà ở long thành",
    "xây nhà đường kha vạn cân",
    "thi công nhà grand park",
    "giá xây nhà hoàn thiện m2",
    "bảng giá xây dựng việt dũng phát",
    "xây nhà long thành đồng nai",
    "thước lỗ ban online",
    "phối cảnh 3d nhà phố",
  ];
  for (const s of samples) console.log(polishNewsTitle(s));
} else {
  for (const file of files) {
    const posts = JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
    for (const post of posts) {
      const title = polishNewsTitle(post.seoKeyword || post.title);
      post.title = title;
      if (post.seoTitle) post.seoTitle = title;
    }
    writeFileSync(file, JSON.stringify(posts));
    console.log(`\n== ${file} ==`);
    for (const post of posts) console.log(post.title);
  }
}
}


import { existsSync, readFileSync, writeFileSync } from "node:fs";

const shot = (id) => `/mau-nha/pho/${id}.jpg`;
const shots = (ids) => ids.map(shot);

const facade = shots([
  "01/08", "01/14", "01/18", "01/21",
  "02/01", "02/05", "02/06", "02/07", "02/08", "02/09",
  "03/01", "03/07", "03/13",
  "04/02", "04/04", "04/10", "04/11",
  "06/12", "06/20",
  "07/01", "07/07",
  "08/01", "08/08", "08/09",
  "10/01", "10/10", "10/11", "10/12", "10/13",
  "11/19", "11/20",
  "12/01", "12/03", "12/04",
  "13/04", "13/05", "13/08", "13/11",
]);
const villa = shots(["05/11", "05/13", "10/12", "10/13", "12/03", "12/04", "12/06", "12/07", "09/13"]);
const classic = shots(["02/01", "02/06", "02/08", "05/13", "05/11", "12/01", "12/03", "10/12", "10/01", "13/05"]);
const living = shots([
  "01/10", "01/12", "01/16", "02/02",
  "03/02", "03/09", "03/10", "04/06",
  "05/03", "05/05", "05/09", "05/12",
  "06/16", "06/22", "06/23", "06/25",
  "07/08", "07/09", "08/11", "08/12", "08/13",
  "09/03", "09/08", "09/11", "09/15",
  "10/03", "10/14", "10/15", "10/16",
  "11/02", "11/03", "11/12", "12/08",
  "13/09", "13/12",
]);
const kitchen = shots([
  "01/07", "03/05", "04/03",
  "06/02", "06/04", "06/27",
  "08/03", "08/04", "08/15",
  "09/06", "09/14", "10/17",
  "11/16", "12/09", "13/07",
]);
const bedroom = shots([
  "01/09", "01/11", "01/13", "01/20", "02/03",
  "03/12", "03/14", "03/16",
  "04/01", "04/05", "04/07",
  "05/01", "05/04", "05/06", "05/07", "05/08",
  "06/11", "06/13", "07/02", "07/03", "07/13", "07/14",
  "08/07", "09/02", "09/04", "09/05", "09/10",
  "10/02", "10/04", "10/05", "10/06",
  "11/04", "11/07", "11/10", "11/11", "11/17", "11/18",
  "12/02", "13/02",
]);
const bath = shots(["04/08", "06/18", "06/19", "07/04", "10/09", "11/14", "13/03"]);
const altar = shots(["06/10", "11/05"]);
const study = shots(["04/09", "06/09", "06/15", "11/09"]);
const yard = shots(["01/19", "07/06", "09/01", "09/09", "09/13", "12/06", "12/07", "13/06"]);

function interleave(...lists) {
  const out = [];
  const n = Math.max(...lists.map((list) => list.length));
  for (let i = 0; i < n; i += 1) {
    for (const list of lists) if (list[i]) out.push(list[i]);
  }
  return [...new Set(out)];
}

const interior = interleave(living, kitchen, bedroom);
const design = interleave(facade, living);
const renovate = facade;
const permit = interleave(facade, altar);
const utility = bath;

function poolFor(post) {
  const t = `${post.title || ""} ${post.seoKeyword || ""} ${post.group || ""}`.toLowerCase();
  if (/phòng khách/.test(t)) return living;
  if (/bếp|tủ bếp/.test(t)) return kitchen;
  if (/phòng ngủ|giường/.test(t)) return bedroom;
  if (/nội thất|combo nội thất/.test(t)) return interior;
  if (/điện nước|vệ sinh|chống thấm/.test(t)) return utility;
  if (/mặt tiền|cải tạo|sửa nhà|nâng tầng|sơn chống/.test(t)) return facade;
  if (/sân thượng|giếng trời/.test(t)) return yard;
  if (/biệt thự|sân vườn|nhà vườn/.test(t)) return villa;
  if (/tân cổ|mansard|mái thái/.test(t)) return classic;
  if (/báo giá|chi phí|giá xây|đơn giá|bảng giá|hợp đồng/.test(t)) return facade;
  if (/thiết kế|phối cảnh|kiến trúc|hồ sơ/.test(t)) return design;
  if (/phong thủy|lỗ ban|tuổi xây|xin phép|cấp phép|thủ tục/.test(t)) return permit;
  if (/bàn làm việc|văn phòng/.test(t)) return study;
  if (post.group === "noi-that") return interior;
  if (post.group === "thiet-ke") return design;
  if (post.group === "cai-tao") return renovate;
  if (post.group === "tan-co-dien") return classic;
  if (post.group === "phong-thuy") return permit;
  return facade;
}

const cursor = new Map();
function take(pool, prev) {
  const key = pool;
  let i = cursor.get(key) || 0;
  let img = pool[i % pool.length];
  i += 1;
  if (img === prev) {
    img = pool[i % pool.length];
    i += 1;
  }
  cursor.set(key, i);
  return img;
}

const files = ["src/data/editorial-news.json", "src/data/keyword-news.json"];
const groups = files.map((file) => JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, "")));
const posts = groups.flat();
let prev = "";
for (const post of posts) {
  const image = take(poolFor(post), prev);
  if (!existsSync(new URL(`../public${image}`, import.meta.url))) {
    throw new Error(`Thiếu ảnh ${image}`);
  }
  post.image = image;
  prev = image;
}

const pin = {
  "xay-nha-tron-goi-tphcm": shot("01/08"),
  "thiet-ke-nha-tan-co-dien": shot("02/01"),
  "thiet-ke-noi-that-nha-pho": shot("01/10"),
};
for (const post of posts) {
  if (pin[post.slug]) post.image = pin[post.slug];
}
for (let i = 0; i < posts.length; i += 1) {
  const prevImg = posts[i - 1]?.image;
  const nextImg = posts[i + 1]?.image;
  if (posts[i].image !== prevImg && posts[i].image !== nextImg) continue;
  const pool = poolFor(posts[i]);
  const alt = pool.find((img) => img !== prevImg && img !== nextImg && img !== posts[i].image);
  if (alt) posts[i].image = alt;
}

for (let i = 0; i < files.length; i += 1) writeFileSync(files[i], JSON.stringify(groups[i]));

const counts = new Map();
for (const post of posts) counts.set(post.image, (counts.get(post.image) || 0) + 1);
let adjacent = 0;
for (let i = 1; i < posts.length; i += 1) if (posts[i].image === posts[i - 1].image) adjacent += 1;
console.log({ posts: posts.length, unique: counts.size, adjacent, maxRepeat: Math.max(...counts.values()) });
for (const post of posts.slice(0, 12)) console.log(post.image, "—", post.title);
console.log("---");
for (const slug of Object.keys(pin)) {
  const post = posts.find((item) => item.slug === slug);
  console.log(post.image, "—", post.title);
}

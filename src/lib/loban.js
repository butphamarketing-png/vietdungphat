const cung522 = [
  { name: "Quý nhân", good: true, note: "Gặp khoảng này gia cảnh được khá quan, làm ăn phát đạt, bề tôi trung thành, con cái thông minh hiếu thảo." },
  { name: "Hiểm họa", good: false, note: "Gặp khoảng hiểm họa gia chủ sẽ bị tán tài lộc, trôi dạt tha phương, cuộc sống túng thiếu, gia đạo có người đau ốm, con cái dâm ô hư thân mất nết, bất trung bất hiếu." },
  { name: "Thiên tai", good: false, note: "Gặp khoảng này coi chừng ốm đau nặng, chết chóc, mất của, vợ chồng sống bất hòa, con cái gặp nạn." },
  { name: "Thiên tài", good: true, note: "Gặp khoảng Thiên tài chủ nhà luôn may mắn về tài lộc, nông tài được lợi, con cái được nhờ vả, hiếu thảo, gia đạo ấm êm, an vui." },
  { name: "Nhân lộc", good: true, note: "Tới khoảng này chủ nhà luôn gặp sung túc, phúc lộc, nghề nghiệp luôn phát triển, nông tài được lợi, con cái thông minh, hiếu thảo." },
  { name: "Cô độc", good: false, note: "Khoảng này gia chủ hao người, hao của, biệt ly, con cái ngỗ nghịch, tửu sắc và đồ đến chết." },
  { name: "Thiên tặc", good: false, note: "Gặp khoảng Thiên tặc phải coi chừng bệnh đến bất ngờ, hay bị tai bay vạ gió, kiện tụng, tù ngục, chết chóc." },
  { name: "Tể tướng", good: true, note: "Khoảng Tể tướng tạo cho gia chủ hanh thông mọi mặt, con cái tấn tài danh, sinh con quý tử, chủ nhà luôn may mắn bất ngờ." },
];

const khoang522 = [
  "Quyền lộc", "Trung tín", "Tác quan", "Phát đạt", "Thông minh", "Án thành", "Hỗn nhân", "Thất hiếu",
  "Tai họa", "Thường bệnh", "Hoàn tử", "Quan tài", "Thân tàn", "Thất tài", "Hệ quả", "Thi thơ",
  "Văn học", "Thanh quý", "Tác lộc", "Thiên lộc", "Trí tồn", "Phú quý", "Tiến bửu", "Thập thiện",
  "Văn chương", "Bạc nghịch", "Vô vọng", "Ly tán", "Tửu thục", "Dâm dục", "Phong bệnh", "Chiêu ôn",
  "Ôn tài", "Ngục tù", "Quang tài", "Đại tài", "Thi thơ", "Hoạch tài", "Hiếu tử", "Quý nhân",
];

const cung429 = [
  { name: "Tài", good: true, note: "Khoảng Tài ứng nghiệm tốt nhất với cổng lớn, nơi đón nhận của cải từ ngoài vào." },
  { name: "Bệnh", good: false, note: "Khoảng Bệnh ứng đặc biệt vào nhà vệ sinh. Nơi này thường là góc hung (xấu) của nhà. Cửa lọt vào chữ Bệnh sẽ thuận lợi cho bệnh tật sinh ra." },
  { name: "Ly", good: false, note: "Khoảng Ly rất kỵ cho cửa trong nhà. Cửa lọt vào chữ Ly, chồng thì làm ăn xa nhà, vợ gặp điều quyền rũ, con cái hoang đàng phá phách." },
  { name: "Nghĩa", good: true, note: "Khoảng Nghĩa rất tốt cho cổng lớn và cửa nhà bếp, cửa các phòng thông nhau thì càng nên." },
  { name: "Quan", good: true, note: "Khoảng Quan tốt ở cửa phòng riêng vợ chồng và sẽ sinh con quý tử nhưng rất kỵ ở cổng lớn và tránh chuyện kiện tụng ra chính quyền." },
  { name: "Kiếp", good: false, note: "Khoảng Kiếp tượng trưng cho tai họa khách quan đến từ bên ngoài khiến hao tổn tiền của. Tránh ở cổng lớn, nhất là các cửa hàng, tiệm buôn càng nên lưu ý." },
  { name: "Hại", good: false, note: "Khoảng Hại tượng trưng cho mầm xấu nhen nhóm từ bên trong, kỵ ở các cửa phòng trong nhà." },
  { name: "Bản", good: true, note: "Khoảng Bản thích hợp cho cổng lớn." },
];

const khoang429 = [
  { name: "Tài đức", meaning: "Có tiền của và có đức" },
  { name: "Bảo khố", meaning: "Kho vàng, của cải sung túc" },
  { name: "Lục hợp", meaning: "Hòa hợp gia đạo gồm cha mẹ, vợ chồng, con cháu" },
  { name: "Nghênh phúc", meaning: "Đón nhận phúc đến: gặp nhiều hạnh phúc, may mắn" },
  { name: "Thoái tài", meaning: "Hao tổn tiền của, làm ăn thua lỗ" },
  { name: "Công sự", meaning: "Tranh chấp, thưa kiện ra chính quyền" },
  { name: "Lao chấp", meaning: "Vướng vào vòng lao lý, tù tội" },
  { name: "Cô quả", meaning: "Chịu phận cô đơn" },
  { name: "Thường bệnh", meaning: "Dây dưa nhiều chuyện" },
  { name: "Kiếp tài", meaning: "Bị cướp của" },
  { name: "Quan quỷ", meaning: "Chuyện xấu với chính quyền" },
  { name: "Thất thoát", meaning: "Mất mát" },
  { name: "Tham đinh", meaning: "Tham con trai" },
  { name: "Ích lợi", meaning: "Gặp nhiều lợi ích, thuận lợi" },
  { name: "Quý tử", meaning: "Con giỏi, ngoan" },
  { name: "Đại cát", meaning: "Rất tốt, trăm sự đều hay, may mắn thuận lợi" },
  { name: "Thuận khoa", meaning: "Thi cử thuận lợi" },
  { name: "Hoạch tài", meaning: "Được tiền của bất ngờ, không nằm trong dự tính" },
  { name: "Tấn đức", meaning: "Làm ăn phát đạt, được nhiều người yêu mến, kính trọng" },
  { name: "Phú quý", meaning: "Giàu có, danh vọng" },
  { name: "Tử biệt", meaning: "Chia lìa chết chóc" },
  { name: "Khoái khẩu", meaning: "Gia đạo ngày càng ít người, tử nhiều hơn sinh" },
  { name: "Ly hương", meaning: "Xa cách quê nhà" },
  { name: "Thất tài", meaning: "Làm ăn thất bại, của cải tiêu tan" },
  { name: "Tai chí", meaning: "Tai họa đến" },
  { name: "Tử tuyệt", meaning: "Rất xấu, người chết, công việc thất bại, phá sản" },
  { name: "Lâm bệnh", meaning: "Mắc bệnh hiểm nghèo" },
  { name: "Khẩu thiệt", meaning: "Mang họa vì lời nói" },
  { name: "Tài chí", meaning: "Tiền của đến, công việc làm ăn thuận lợi" },
  { name: "Đăng khoa", meaning: "Thi cử đỗ đạt, công thành danh toại" },
  { name: "Tiến bảo", meaning: "Của cải gia tăng không ngừng" },
  { name: "Hưng vượng", meaning: "Làm ăn thịnh vượng" },
];

const cung388 = [
  { name: "Đinh", good: true, note: "Gia tăng phúc đức, luôn gặp may mắn." },
  { name: "Hại", good: false, note: "Khoảng hung, dễ gặp họa và bệnh tật." },
  { name: "Vượng", good: true, note: "Tài lộc và công việc hanh thông." },
  { name: "Khổ", good: false, note: "Khó khăn, hao tổn, bất lợi." },
  { name: "Nghĩa", good: true, note: "Hòa hợp, làm ăn thuận lợi." },
  { name: "Quan", good: true, note: "Công danh, quý nhân phù trợ." },
  { name: "Tử", good: false, note: "Hung họa, chia lìa." },
  { name: "Hưng", good: true, note: "Hưng vượng, phát đạt." },
  { name: "Thất", good: false, note: "Thất thoát, ly tán." },
  { name: "Tài", good: true, note: "Có tiền của và có đức." },
];

const khoang388 = [
  { name: "Phúc tinh", meaning: "Gia tăng phúc đức, luôn gặp may mắn, khi có tai họa có người cứu giúp" },
  { name: "Cấp đệ", meaning: "Thi cử đỗ đạt" },
  { name: "Tài vượng", meaning: "Được nhiều tiền của" },
  { name: "Đăng khoa", meaning: "Thi cử đỗ đạt, học hành tốt" },
  { name: "Khẩu thiệt", meaning: "Mang họa vì lời nói" },
  { name: "Lâm bệnh", meaning: "Dễ mắc bệnh tật hiểm nghèo" },
  { name: "Tử tuyệt", meaning: "Rất xấu, người chết, tan thất chia lìa đến nhanh chóng" },
  { name: "Tai chí", meaning: "Tai họa đến liên miên, không dứt" },
  { name: "Thiên đức", meaning: "Hưởng lộc từ trời" },
  { name: "Hỉ sự", meaning: "Gặp nhiều chuyện vui" },
  { name: "Tiến bảo", meaning: "Được của quý" },
  { name: "Nạp phúc", meaning: "Đón nhận phúc, gia tăng phúc lộc" },
  { name: "Thất thoát", meaning: "Mất mát, vật phẩm đồ đạc bị thất lạc, người ly biệt" },
  { name: "Quan quỷ", meaning: "Chuyện xấu với chính quyền" },
  { name: "Kiếp tài", meaning: "Bị cướp của" },
  { name: "Vô tự", meaning: "Không có con nối dõi" },
  { name: "Đại cát", meaning: "Cát tường, cát lợi, may mắn" },
  { name: "Tài vượng", meaning: "Tài lộc tăng, kinh doanh buôn bán phát đạt" },
  { name: "Ích lợi", meaning: "Gặp nhiều lợi ích, thuận lợi" },
  { name: "Thiên khố", meaning: "Kho trời, hưởng phúc lộc, tiền tài" },
  { name: "Phú quý", meaning: "Giàu có, danh vọng" },
  { name: "Tiến bảo", meaning: "Của cải gia tăng không ngừng" },
  { name: "Hoạch tài", meaning: "Được của cải bất ngờ, không nằm trong dự tính" },
  { name: "Thuận khoa", meaning: "Thi cử thuận lợi" },
  { name: "Ly hương", meaning: "Xa cách quê nhà" },
  { name: "Tử biệt", meaning: "Chia lìa chết chóc" },
  { name: "Thoái đinh", meaning: "Con trai gặp nhiều bất lợi, đi xa hoặc tử biệt" },
  { name: "Thất tài", meaning: "Mất tiền của, kinh doanh sa sút" },
  { name: "Đăng khoa", meaning: "Thi cử đỗ đạt, học hành tốt" },
  { name: "Quý tử", meaning: "Con hiền ngoan, có tài đức" },
  { name: "Tham đinh", meaning: "Có tham con trai" },
  { name: "Hưng vượng", meaning: "Làm ăn thịnh vượng" },
  { name: "Cô quả", meaning: "Chịu phận cô đơn" },
  { name: "Lao chấp", meaning: "Chớ nên thương vong, vướng vào vòng lao lý, tù tội" },
  { name: "Công sự", meaning: "Tranh chấp, thưa kiện ra chính quyền" },
  { name: "Thoái tài", meaning: "Hao tổn tiền của, làm ăn thua lỗ" },
  { name: "Nghênh phúc", meaning: "Đón nhận phúc đức" },
  { name: "Lục hợp", meaning: "Hòa hợp gia đạo, mọi việc thuận lợi" },
  { name: "Tiến bảo", meaning: "Của cải gia tăng không ngừng" },
  { name: "Tài đức", meaning: "Có tiền của và có đức" },
];

export const RULERS = [
  {
    id: 522,
    lengthCm: "52.2",
    title: "Thước Lỗ Ban 52.2cm",
    use: "Khoảng thông thủy (cửa, cửa sổ, cổng, giếng trời…)",
    cycle: 522,
    cung: cung522,
    khoang: khoang522.map((name) => ({ name })),
  },
  {
    id: 429,
    lengthCm: "42.9",
    title: "Thước Lỗ Ban 42.9cm (Dương trạch)",
    use: "Khối xây dựng (bếp, bệ, bậc, tường, móng…)",
    cycle: 429,
    cung: cung429,
    khoang: khoang429,
  },
  {
    id: 388,
    lengthCm: "38.8",
    title: "Thước Lỗ Ban 38.8cm (Âm phần)",
    use: "Đồ nội thất (bàn thờ, tủ thờ, giường, bàn…)",
    cycle: 388,
    cung: cung388,
    khoang: khoang388,
  },
];

export function readRuler(mm, ruler) {
  const cycle = ruler.cycle;
  let gt = Number(mm) % cycle;
  if (gt < 0) gt += cycle;
  gt = Math.round(gt * 1000) / 1000;
  let cungIndex = 0;
  let khoangIndex = 0;
  if (gt !== 0) {
    cungIndex = Math.ceil(gt / (cycle / ruler.cung.length)) - 1;
    khoangIndex = Math.ceil(gt / (cycle / ruler.khoang.length)) - 1;
  }
  cungIndex = Math.max(0, Math.min(cungIndex, ruler.cung.length - 1));
  khoangIndex = Math.max(0, Math.min(khoangIndex, ruler.khoang.length - 1));
  const cung = ruler.cung[cungIndex];
  const khoang = ruler.khoang[khoangIndex];
  return { cung, khoang, good: cung.good };
}

import { useCms } from "../lib/cms.js";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";
import LoBanRuler from "../components/LoBanRuler.jsx";

export default function LoBan() {
  const { pages } = useCms();
  const page = pages.loban;
  return (
    <article className="page loban-page">
      <PageHero kicker={page.kicker} title={page.title}>
        <p>{page.lead}</p>
      </PageHero>
      <div className="page-body">
        <LoBanRuler />
        <div className="loban-guide">
          <p className="kicker lined">Hướng dẫn xem</p>
          <h2>Cách dùng thước Lỗ Ban</h2>
          <p>
            Thước Lỗ Ban là cây thước do Lỗ Ban — tổ nghề mộc — đặt ra, dùng để chọn kích thước rơi vào cung cát khi làm
            cửa, bệ, bậc và nội thất. Trên thị trường Việt Nam, ba bản thông dụng nhất là 52.2cm, 42.9cm và 38.8cm.
          </p>
          <ul>
            <li>
              <strong>52.2cm — thông thủy:</strong> đo khoảng rỗng như cửa đi, cửa sổ, cổng, giếng trời.
            </li>
            <li>
              <strong>42.9cm — dương trạch:</strong> đo khối đặc như bếp, bệ, bậc thềm, tường, móng.
            </li>
            <li>
              <strong>38.8cm — âm phần:</strong> đo đồ nội thất thờ cúng như bàn thờ, tủ thờ, khuôn khổ bài vị.
            </li>
          </ul>
          <p>
            Mỗi chu kỳ chia thành các cung tốt (cát) và xấu (hung), lặp lại liên tục theo chiều dài thước. Nên ưu tiên
            cửa chính, bệ bếp và bàn thờ; sai lệch thực tế khoảng vài milimet vẫn thường được chấp nhận.
          </p>
        </div>
      </div>
      <BookingCta />
    </article>
  );
}

import { useState } from "react";
import { site } from "../lib/content.js";

const needs = ["Thiết kế", "Xây dựng", "Cải tạo", "Báo giá", "Khác"];
const slots = ["08:00", "09:00", "10:00", "11:00", "13:30", "14:30", "15:30", "16:30"];

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function BookingForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="booking-form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const body = [
          `Họ tên: ${data.get("name") || ""}`,
          `Điện thoại: ${data.get("phone") || ""}`,
          `Email: ${data.get("email") || ""}`,
          `Nhu cầu: ${data.get("need") || ""}`,
          `Ngày: ${data.get("date") || ""}`,
          `Giờ: ${data.get("slot") || ""}`,
          `Ghi chú: ${data.get("note") || ""}`,
        ].join("\n");
        const href = `mailto:${site.email}?subject=${encodeURIComponent(`Đặt lịch tư vấn — ${data.get("name") || ""}`)}&body=${encodeURIComponent(body)}`;
        window.location.href = href;
        setSent(true);
      }}
    >
      <h3 id="booking-form-title">Đặt lịch hẹn tư vấn</h3>
      <p>Vui lòng điền thông tin, chúng tôi sẽ liên hệ xác nhận lịch hẹn trong thời gian sớm nhất.</p>
      <div className="booking-row">
        <label>
          <Icon d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM4 20a8 8 0 0 1 16 0" />
          <input name="name" placeholder="Họ và tên *" required />
        </label>
        <label>
          <Icon d="M7 3.8h3.2l1 3.2-2 1.2a11 11 0 0 0 5.6 5.6l1.2-2 3.2 1V17A13 13 0 0 1 7 3.8z" />
          <input name="phone" placeholder="Số điện thoại *" required />
        </label>
      </div>
      <label>
        <Icon d="M4 6h16v12H4zM4 9h16" />
        <input type="email" name="email" placeholder="Email (nếu có)" />
      </label>
      <label>
        <Icon d="M4 10h16v10H4zM8 10V7a4 4 0 0 1 8 0v3" />
        <select name="need" required defaultValue="">
          <option value="" disabled>
            Nhu cầu tư vấn *
          </option>
          {needs.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <div className="booking-row">
        <label>
          <Icon d="M5 6h14v14H5zM5 10h14M9 6V4M15 6V4" />
          <input type="date" name="date" required />
        </label>
        <label>
          <Icon d="M12 21a9 9 0 1 1 9-9 9 9 0 0 1-9 9zM12 7v5l3 2" />
          <select name="slot" required defaultValue="">
            <option value="" disabled>
              Chọn khung giờ *
            </option>
            {slots.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <Icon d="M6 4h9l5 5v11H6z" />
        <textarea name="note" rows="2" placeholder="Thông tin thêm (nếu có)" />
      </label>
      <button className="btn with-arrow" type="submit">
        Gửi yêu cầu đặt lịch
      </button>
      {sent ? (
        <p className="ok">
          Cảm ơn quý khách. Email đặt lịch đã mở — vui lòng bấm Gửi trong hộp thư. Hoặc gọi{" "}
          <a href={`tel:${site.phone.replace(/\./g, "")}`}>{site.phone}</a> /{" "}
          <a href={site.zalo} target="_blank" rel="noreferrer">
            Zalo
          </a>
          .
        </p>
      ) : null}
      <small>Thông tin của bạn được bảo mật và chỉ sử dụng cho mục đích tư vấn.</small>
    </form>
  );
}

export default function BookingCta() {
  return (
    <section className="booking-cta" id="dat-lich">
      <div className="booking-visual">
        <img src="/studio/05.jpg" alt="" />
        <div className="booking-copy">
          <p className="kicker lined">Đặt lịch hẹn</p>
          <h2>
            Tư vấn giải pháp
            <br />
            <em>nhà ở lý tưởng</em>
          </h2>
          <p>
            Đội ngũ kiến trúc sư của Việt Dũng Phát sẵn sàng lắng nghe và đồng hành cùng bạn từ ý tưởng đến hiện thực.
          </p>
          <ul className="booking-points">
            <li>Tư vấn tận tâm</li>
            <li>Giải pháp tối ưu</li>
            <li>Đồng hành dài lâu</li>
          </ul>
          <p className="booking-script">Kiến tạo không gian sống bền vững</p>
        </div>
      </div>
      <BookingForm />
    </section>
  );
}

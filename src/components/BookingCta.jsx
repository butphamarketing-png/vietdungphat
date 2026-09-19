import { useState } from "react";
import { addBooking, useCms } from "../lib/cms.js";

const needs = ["Thiết kế", "Xây dựng", "Cải tạo", "Báo giá", "Khác"];
const slots = ["08:00", "09:00", "10:00", "11:00", "13:30", "14:30", "15:30", "16:30"];

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function BrText({ text }) {
  return String(text || "")
    .split("\n")
    .map((line, i) => (
      <span key={i}>
        {i ? <br /> : null}
        {line}
      </span>
    ));
}

export function BookingForm({ titleId }) {
  const { site } = useCms();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const headingId = titleId || "booking-form-title";

  return (
    <form
      className="booking-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (sending) return;
        const form = e.currentTarget;
        const data = new FormData(form);
        const entry = {
          name: String(data.get("name") || "").trim(),
          phone: String(data.get("phone") || "").trim(),
          email: String(data.get("email") || "").trim(),
          need: String(data.get("need") || "").trim(),
          date: String(data.get("date") || "").trim(),
          slot: String(data.get("slot") || "").trim(),
          note: String(data.get("note") || "").trim(),
        };
        setSending(true);
        try {
          await addBooking(entry);
          setSent(true);
          form.reset();
        } catch (err) {
          alert(err.message || "Không gửi được đặt lịch. Vui lòng gọi hotline.");
        } finally {
          setSending(false);
        }
      }}
    >
      <h3 id={headingId}>Đặt lịch hẹn tư vấn</h3>
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
          <input type="date" name="date" required aria-label="Ngày hẹn" lang="vi" />
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
      <button className="btn with-arrow" type="submit" disabled={sending}>
        {sending ? "Đang gửi…" : "Gửi yêu cầu đặt lịch"}
      </button>
      {sent ? (
        <p className="ok">
          Cảm ơn quý khách. Yêu cầu đã được ghi nhận. Chúng tôi sẽ gọi xác nhận sớm, hoặc liên hệ ngay{" "}
          <a href={`tel:${String(site.phone || "").replace(/\./g, "")}`}>{site.phone}</a>
          {site.zalo ? (
            <>
              {" "}
              /{" "}
              <a href={site.zalo} target="_blank" rel="noreferrer">
                Zalo
              </a>
            </>
          ) : null}
          .
        </p>
      ) : null}
      <small>Thông tin của bạn được bảo mật và chỉ sử dụng cho mục đích tư vấn.</small>
    </form>
  );
}

export default function BookingCta() {
  const { home } = useCms();
  return (
    <section className="booking-cta" id="dat-lich">
      <div className="booking-visual">
        <img src={home.bookingImage || "/villas/neo-05.jpg"} alt="" />
        <div className="booking-copy">
          <p className="kicker lined">{home.bookingKicker}</p>
          <h2>
            <BrText text={home.bookingTitle} />
          </h2>
          <p>{home.bookingLead}</p>
          <ul className="booking-points">
            {(home.bookingPoints || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="booking-script">Kiến tạo không gian sống bền vững</p>
        </div>
      </div>
      <BookingForm />
    </section>
  );
}

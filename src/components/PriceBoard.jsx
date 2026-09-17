import { Link } from "react-router-dom";
import { pricePacks } from "../lib/content.js";
import SmartImg from "./SmartImg.jsx";

function Icon({ name }) {
  if (name === "finish") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 21h10M9 17l8.5-8.5a2.1 2.1 0 0 0-3-3L6 14v3h3z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11.5 12 4l8 7.5V20H4z" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M10 20v-6h4v6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20V9l8-5 8 5v11H4z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 20v-6h6v6" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export default function PriceBoard() {
  return (
    <section className="pad price-board" id="bao-gia">
      <svg className="price-sketch left" viewBox="0 0 280 220" aria-hidden="true">
        <g fill="none" stroke="#cbb894" strokeWidth="1.2">
          <path d="M20 180h70v-58H20zM90 180h95V70l-48-32-47 32v110zM185 180h70v-44h-70z" />
          <path d="M108 180v-48h58v48M40 148h30M40 136h18" />
          <circle cx="52" cy="92" r="10" />
          <path d="M8 188c40-18 90-8 140 4 38 9 78 6 124-10" />
        </g>
      </svg>
      <p className="price-script">Kiến tạo không gian sống bền vững</p>

      <div className="price-head">
        <p className="kicker">Báo giá xây dựng</p>
        <h2>
          Bảng báo giá – <em>Việt Dũng Phát</em>
        </h2>
        <p className="price-lead">Chi phí minh bạch – Giải pháp phù hợp cho mọi công trình</p>
        <p className="muted">
          Đơn giá mang tính tham khảo. Chi phí thực tế được xác định dựa trên diện tích, hiện trạng, phong cách thiết kế
          và vật tư lựa chọn.
        </p>
      </div>

      <div className="price-cards">
        {pricePacks.map((p) => (
          <Link key={p.title} className={`price-card${p.featured ? " featured" : ""}`} to={p.href}>
            {p.badge ? <span className="price-badge">{p.badge}</span> : null}
            <div className="price-photo">
              <SmartImg src={p.image} alt={p.title} />
              <span className="price-tag">
                <Icon name={p.icon} />
                {p.tag}
              </span>
            </div>
            <div className="price-body">
              <h3>{p.title}</h3>
              <p className="price-num">{p.price}</p>
              <p className="price-desc">{p.lead}</p>
              <ul>
                {p.points.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

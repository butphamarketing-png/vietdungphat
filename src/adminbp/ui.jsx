import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../lib/cms.js";

const NAV = [
  { to: "/adminbp", end: true, label: "Tổng quan" },
  { to: "/adminbp/cai-dat", label: "Cài đặt website" },
  { to: "/adminbp/trang-chu", label: "Trang chủ" },
  { to: "/adminbp/mau-nha", label: "Mẫu nhà / công trình" },
  { to: "/adminbp/san-pham", label: "Sản phẩm" },
  { to: "/adminbp/dich-vu", label: "Dịch vụ" },
  { to: "/adminbp/bao-gia", label: "Bảng báo giá" },
  { to: "/adminbp/tin-tuc", label: "Tin tức / SEO" },
  { to: "/adminbp/trang", label: "Trang nội dung" },
  { to: "/adminbp/thu-vien", label: "Thư viện ảnh" },
  { to: "/adminbp/danh-gia", label: "Đánh giá" },
  { to: "/adminbp/dat-lich", label: "Đặt lịch" },
  { to: "/adminbp/kho-anh", label: "Kho ảnh" },
  { to: "/adminbp/tai-khoan", label: "Tài khoản" },
];

export function AdminShell() {
  const navigate = useNavigate();
  return (
    <div className="adminbp-shell">
      <aside className="adminbp-sidebar">
        <div className="adminbp-brand">
          <span className="adminbp-brand-mark">BP</span>
          <div>
            <strong>Admin Việt Dũng Phát</strong>
            <small>/adminbp</small>
          </div>
        </div>
        <nav className="adminbp-nav">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "active" : undefined)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="adminbp-sidebar-foot">
          <a href="/" target="_blank" rel="noreferrer">
            Xem website
          </a>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/adminbp/login", { replace: true });
            }}
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="adminbp-main">
        <Outlet />
      </main>
    </div>
  );
}

export function Field({ label, value, onChange, type = "text", multiline, rows = 4, span2 }) {
  return (
    <label className={`adminbp-field${span2 ? " span-2" : ""}`}>
      <span>{label}</span>
      {multiline ? (
        <textarea rows={rows} value={value || ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

export function ImageField({ label, value, onChange }) {
  function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsDataURL(file);
  }
  return (
    <label className="adminbp-field">
      <span>{label}</span>
      <div className="adminbp-image-field">
        {value ? <img src={value} alt="" /> : <div className="adminbp-image-empty">Chưa có ảnh</div>}
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="URL ảnh" />
        <input type="file" accept="image/*,video/mp4" onChange={onFile} />
      </div>
    </label>
  );
}

export function SaveBar({ saving, message, onSave, label = "Lưu thay đổi" }) {
  return (
    <div className="adminbp-savebar">
      <button type="button" className="adminbp-save" disabled={saving} onClick={onSave}>
        {saving ? "Đang lưu…" : label}
      </button>
      {message ? <span>{message}</span> : null}
    </div>
  );
}

export function CardList({ title, onAdd, children }) {
  return (
    <section className="adminbp-cardlist">
      <header>
        <h2>{title}</h2>
        {onAdd ? (
          <button type="button" onClick={onAdd}>
            + Thêm
          </button>
        ) : null}
      </header>
      <div className="adminbp-cards">{children}</div>
    </section>
  );
}

export function ItemActions({ onUp, onDown, onRemove, onEdit }) {
  return (
    <div className="adminbp-item-actions">
      {onEdit ? (
        <button type="button" onClick={onEdit}>
          Sửa
        </button>
      ) : null}
      {onUp ? (
        <button type="button" onClick={onUp}>
          Lên
        </button>
      ) : null}
      {onDown ? (
        <button type="button" onClick={onDown}>
          Xuống
        </button>
      ) : null}
      {onRemove ? (
        <button type="button" className="danger" onClick={onRemove}>
          Xóa
        </button>
      ) : null}
    </div>
  );
}

export function moveItem(list, index, dir) {
  const next = [...list];
  const to = index + dir;
  if (to < 0 || to >= next.length) return list;
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

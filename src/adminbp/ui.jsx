import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { flushCms, logoutRemote } from "../lib/cms.js";
import { uploadAdminFile } from "../lib/upload.js";
import { BpMark, IconMail, IconPhone } from "./icons.jsx";

function NavIco({ d }) {
  return (
    <svg className="adminbp-nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const NAV_GROUPS = [
  {
    items: [{ to: "/adminbp", end: true, label: "Bảng điều khiển", icon: "M3 10.5 12 3l9 7.5V21H3z" }],
  },
  {
    id: "posts",
    label: "Quản lý bài viết",
    items: [
      { to: "/adminbp/mau-nha", label: "Công trình", icon: "M3 21V9l9-6 9 6v12H3zM9 21v-7h6v7" },
      { to: "/adminbp/tin-tuc", label: "Tin tức", icon: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" },
      { to: "/adminbp/dich-vu", label: "Dịch vụ", icon: "M8 7V4h8v3M6 7h12v13H6zM10 12h4" },
    ],
  },
  {
    id: "pages",
    label: "Quản lý trang tĩnh",
    items: [
      { to: "/adminbp/trang-chu", label: "Trang chủ", icon: "M4 11.5 12 5l8 6.5V20H4zM10 20v-6h4v6" },
      { to: "/adminbp/trang", label: "Giới thiệu / Liên hệ", icon: "M7 3h7l5 5v13H7zM14 3v5h5" },
      { to: "/adminbp/bao-gia", label: "Bảng báo giá", icon: "M7 4h10v16H7zM10 8h4M10 12h4M10 16h3" },
      { to: "/adminbp/san-pham", label: "Sản phẩm", icon: "M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM12 12v9M3.5 8 12 12l8.5-4" },
    ],
  },
  {
    id: "media",
    label: "Quản lý hình ảnh",
    items: [
      { to: "/adminbp/thu-vien", label: "Thư viện ảnh", icon: "M4 5h16v14H4zM4 16l4.5-4 3 3 2.5-2.5L20 16M9 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" },
      { to: "/adminbp/kho-anh", label: "Kho ảnh", icon: "M3 7h7l2 2h9v10H3z" },
    ],
  },
  {
    id: "contact",
    label: "Liên hệ",
    items: [
      { to: "/adminbp/dat-lich", label: "Đặt lịch", icon: "M5 5h14v15H5zM5 10h14M9 3v4M15 3v4" },
      { to: "/adminbp/danh-gia", label: "Đánh giá", icon: "M12 3l2.2 5.6L20 9.7l-4 3.8L17.2 20 12 16.8 6.8 20 8 13.5 4 9.7l5.8-1.1z" },
    ],
  },
  {
    id: "system",
    label: "Thiết lập thông tin",
    items: [
      { to: "/adminbp/cai-dat", label: "Cài đặt website", icon: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM4 12h2M18 12h2M12 4v2M12 18v2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" },
      { to: "/adminbp/tai-khoan", label: "Tài khoản", icon: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zM5 20a7 7 0 0 1 14 0" },
    ],
  },
];

function groupHasPath(group, pathname) {
  return (group.items || []).some((item) => (item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)));
}

export function AdminShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    for (const group of NAV_GROUPS) {
      if (group.id && groupHasPath(group, pathname)) initial[group.id] = true;
    }
    return initial;
  });

  return (
    <div className="adminbp-shell">
      <aside className="adminbp-sidebar">
        <div className="adminbp-brand">
          <BpMark className="adminbp-brand-logo" />
          <div>
            <strong>Việt Dũng Phát</strong>
            <small>Administrator</small>
          </div>
        </div>
        <p className="adminbp-nav-title">Slidebar</p>
        <nav className="adminbp-nav">
          {NAV_GROUPS.map((group, gi) => {
            if (!group.id) {
              return group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => (isActive ? "active" : undefined)}>
                  <NavIco d={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              ));
            }
            const open = openGroups[group.id] || groupHasPath(group, pathname);
            return (
              <div key={group.id || gi} className={`adminbp-nav-group${open ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="adminbp-nav-group-btn"
                  onClick={() => setOpenGroups((s) => ({ ...s, [group.id]: !open }))}
                >
                  <NavIco d="M4 7h16M4 12h16M4 17h10" />
                  <span>{group.label}</span>
                  <i className="adminbp-caret" aria-hidden />
                </button>
                {open
                  ? group.items.map((item) => (
                      <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "active" : undefined)}>
                        <NavIco d={item.icon} />
                        <span>{item.label}</span>
                      </NavLink>
                    ))
                  : null}
              </div>
            );
          })}
        </nav>
      </aside>
      <div className="adminbp-body">
        <header className="adminbp-topbar">
          <p className="adminbp-hello">
            Xin chào, <strong>admin</strong> !
          </p>
          <div className="adminbp-topbar-actions">
            <a className="adminbp-ico-btn" href="mailto:admin@vietdungphat.com" title="Hộp thư">
              <IconMail />
              <span>0</span>
            </a>
            <a className="adminbp-ico-btn" href="tel:0909123456" title="Cấu hình điện thoại">
              <IconPhone />
            </a>
            <a href="/" target="_blank" rel="noreferrer">
              Truy cập website
            </a>
            <button
              type="button"
              onClick={() => {
                logoutRemote().then(() => navigate("/adminbp/login", { replace: true }));
              }}
            >
              Đăng xuất
            </button>
          </div>
        </header>
        <main className="adminbp-main">
          <Outlet />
        </main>
        <footer className="adminbp-footer">
          <strong>CÔNG TY TNHH KIẾN TRÚC XÂY DỰNG VIỆT DŨNG PHÁT</strong>
          <p>Administrator · vietdungphat.com</p>
        </footer>
      </div>
    </div>
  );
}

export function Crumbs({ items }) {
  return (
    <nav className="adminbp-crumbs" aria-label="breadcrumb">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {i ? <i>/</i> : null}
          {item.to ? <Link to={item.to}>{item.label}</Link> : <em>{item.label}</em>}
        </span>
      ))}
    </nav>
  );
}

export function EditToolbar({ title, crumbs, onSave, onSaveStay, onExit, saving, message }) {
  return (
    <div className="adminbp-edit-toolbar">
      <div className="adminbp-edit-toolbar-row">
        <h1>{title}</h1>
        <div className="adminbp-edit-tools">
          <button type="button" className="adminbp-btn is-success" disabled={saving} onClick={onSave}>
            {saving ? "Đang lưu…" : "Lưu"}
          </button>
          {onSaveStay ? (
            <button type="button" className="adminbp-btn is-warning" disabled={saving} onClick={onSaveStay}>
              Lưu không thoát
            </button>
          ) : null}
          <button type="button" className="adminbp-btn is-danger" disabled={saving} onClick={onExit}>
            Thoát
          </button>
        </div>
      </div>
      {crumbs ? <Crumbs items={crumbs} /> : null}
      {message ? <p className="adminbp-edit-msg">{message}</p> : null}
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="adminbp-tabs" role="tablist">
      {tabs.map((tab) => (
        <button key={tab.id} type="button" role="tab" aria-selected={value === tab.id} className={value === tab.id ? "active" : undefined} onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function PhotoBox({ label, hint, value, onChange }) {
  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const item = await uploadAdminFile(file);
      onChange(item.url);
    } catch (err) {
      alert(err.message || "Upload thất bại. Kiểm tra đăng nhập và Supabase.");
    }
  }
  return (
    <div className="adminbp-photobox">
      <header>
        <strong>{label}</strong>
        {hint ? <small>{hint}</small> : null}
      </header>
      <div className="adminbp-photobox-preview">
        {value ? <img src={value} alt="" /> : <span>Chưa có hình</span>}
      </div>
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="URL hình ảnh" />
      <div className="adminbp-photobox-actions">
        <label className="adminbp-btn is-muted">
          Chọn file
          <input type="file" accept="image/*" hidden onChange={onFile} />
        </label>
        {value ? (
          <button type="button" className="adminbp-btn is-danger" onClick={() => onChange("")}>
            Xóa
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function SwitchField({ label, checked, onChange }) {
  return (
    <label className="adminbp-switch">
      <span>{label}</span>
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <i />
    </label>
  );
}

export function HtmlEditor({ label, value, onChange }) {
  const ref = useRef(null);
  function wrap(before, after = "") {
    const el = ref.current;
    if (!el) return onChange(`${value || ""}${before}${after}`);
    const start = el.selectionStart ?? (value || "").length;
    const end = el.selectionEnd ?? start;
    const text = value || "";
    const next = text.slice(0, start) + before + text.slice(start, end) + after + text.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + (end - start);
      el.setSelectionRange(pos, pos);
    });
  }
  return (
    <label className="adminbp-field span-2">
      <span>{label}</span>
      <div className="adminbp-htmlbar">
        <button type="button" onClick={() => wrap("<strong>", "</strong>")}>
          B
        </button>
        <button type="button" onClick={() => wrap("<em>", "</em>")}>
          I
        </button>
        <button type="button" onClick={() => wrap("<h2>", "</h2>")}>
          H2
        </button>
        <button type="button" onClick={() => wrap("<p>", "</p>")}>
          P
        </button>
        <button type="button" onClick={() => wrap("<ul><li>", "</li></ul>")}>
          List
        </button>
        <button
          type="button"
          onClick={() => {
            const href = window.prompt("URL liên kết");
            if (href) wrap(`<a href="${href}">`, "</a>");
          }}
        >
          Link
        </button>
      </div>
      <textarea ref={ref} rows={18} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </label>
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
  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const item = await uploadAdminFile(file);
      onChange(item.url);
    } catch (err) {
      alert(err.message || "Upload thất bại. Kiểm tra đăng nhập và Supabase.");
    }
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

export function SaveBar({ message, onSave, label = "Lưu thay đổi" }) {
  const [saving, setSaving] = useState(false);
  return (
    <div className="adminbp-savebar">
      <button
        type="button"
        className="adminbp-save"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            await onSave();
            await flushCms();
          } catch (err) {
            alert(err.message || "Lưu thất bại. Kiểm tra đăng nhập và Supabase.");
          } finally {
            setSaving(false);
          }
        }}
      >
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

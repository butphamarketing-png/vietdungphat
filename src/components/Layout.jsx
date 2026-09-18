import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import FloatDock from "./FloatDock.jsx";
import BookingPopup from "./BookingPopup.jsx";
import { useCms } from "../lib/cms.js";
import { useScrollReveal } from "../lib/useScrollReveal.js";
import { useEffect, useState } from "react";

const links = [
  { to: "/", label: "Trang chủ" },
  { to: "/gioi-thieu", label: "Giới thiệu" },
  { to: "/dich-vu", label: "Dịch vụ" },
  { to: "/mau-nha", label: "Mẫu nhà" },
  { to: "/san-pham", label: "Sản phẩm" },
  { to: "/bao-gia", label: "Báo giá" },
  { to: "/thuoc-lo-ban", label: "Thước lỗ ban" },
  { to: "/tin-tuc", label: "Tin tức" },
  { to: "/lien-he", label: "Liên hệ" },
];

export default function Layout() {
  const { site, home: cmsHome } = useCms();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const home = location.pathname === "/";
  useScrollReveal(location.pathname);

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setOpen(false);
        return;
      }
    }
    window.scrollTo(0, 0);
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-menu-open", open);
    return () => document.body.classList.remove("is-menu-open");
  }, [open]);

  return (
    <>
      <header className={`header ${scrolled || !home ? "is-solid" : ""} ${home ? "on-hero" : ""}`}>
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt={site.shortName || "Việt Dũng Phát"} />
          <strong>{site.shortName || "VIỆT DŨNG PHÁT"}</strong>
        </Link>
        <button className={`menu-btn${open ? " is-open" : ""}`} aria-label="Menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          <span />
          <span />
        </button>
        <nav className={open ? "open" : ""}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <Link className="header-cta" to="/lien-he#dat-lich" onClick={() => setOpen(false)}>
          Đặt lịch
        </Link>
      </header>
      {open ? <button className="nav-mask" aria-label="Đóng menu" onClick={() => setOpen(false)} /> : null}
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <h2>{site.shortName}</h2>
            <p className="muted">{cmsHome.footerBlurb}</p>
            <a className="text-link light" href={site.profilePdf} target="_blank" rel="noreferrer">
              Tải hồ sơ năng lực
            </a>
          </div>
          <div>
            <p className="kicker light">Liên hệ</p>
            <p>{site.address}</p>
            <p>Showroom: {site.showroom}</p>
            <p>Xưởng: {site.workshop}</p>
            <p>
              <a href={`tel:${String(site.phone || "").replace(/\./g, "")}`}>{site.phone}</a>
              <br />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </div>
          <div>
            <p className="kicker light">Menu</p>
            <div className="footer-links">
              {links.map((l) => (
                <Link key={l.to} to={l.to}>
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="socials">
              {site.facebook ? (
                <a href={site.facebook} target="_blank" rel="noreferrer">
                  Facebook
                </a>
              ) : null}
              {site.zalo ? (
                <a href={site.zalo} target="_blank" rel="noreferrer">
                  Zalo
                </a>
              ) : null}
              {site.youtube ? (
                <a href={site.youtube} target="_blank" rel="noreferrer">
                  YouTube
                </a>
              ) : null}
            </div>
          </div>
        </div>
        <p className="copy">© {new Date().getFullYear()} {site.name}</p>
      </footer>
      <FloatDock />
      <BookingPopup />
    </>
  );
}

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../lib/cms.js";
import { BP_LOGIN } from "./bp-login.js";
import {
  BpMark,
  IconArrow,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconShield,
  IconSpark,
  IconStar,
  promoIcons,
} from "./icons.jsx";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [email, setEmail] = useState(BP_LOGIN.emailPlaceholder);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const ok = await login(email, password);
    if (!ok) {
      setError("Email hoặc mật khẩu không đúng");
      return;
    }
    navigate(search.get("next") || "/adminbp", { replace: true });
  }

  return (
    <div className="login-screen">
      <div className="login-layout">
        <section className="login-panel">
          <div className="login-panel-main">
            <div className="login-panel-head">
              <div className="login-logo-row">
                <BpMark />
                <div>
                  <strong className="login-bp-name">BỨT PHÁ MARKETING</strong>
                  <small>CMS KHÁCH HÀNG</small>
                </div>
              </div>
              <p className="login-kicker">
                <IconStar />
                KHU VỰC QUẢN TRỊ HỆ THỐNG
              </p>
              <h1>Đăng nhập CMS</h1>
              <p className="login-desc">
                {BP_LOGIN.formDescriptionBefore} <strong>{BP_LOGIN.clientName}</strong> {BP_LOGIN.formDescriptionAfter}
              </p>
            </div>
            <form className="login-form" onSubmit={onSubmit}>
              <label className="field-label" htmlFor="loginEmail">
                Email quản trị
              </label>
              <div className="field-wrap">
                <span className="field-icon" aria-hidden>
                  <IconMail />
                </span>
                <input
                  id="loginEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <label className="field-label" htmlFor="loginPassword">
                Mật khẩu
              </label>
              <div className="field-wrap">
                <span className="field-icon" aria-hidden>
                  <IconLock />
                </span>
                <input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="field-toggle"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {error ? (
                <p className="login-error" role="alert">
                  {error}
                </p>
              ) : (
                <p className="login-desc" style={{ margin: 0 }}>
                  Email: {BP_LOGIN.emailPlaceholder}
                </p>
              )}
              <button type="submit" className="btn-login">
                <span>Đăng nhập CMS</span>
                <span className="btn-login-arrow" aria-hidden>
                  <IconArrow />
                </span>
              </button>
            </form>
          </div>
          <p className="login-copy">
            <IconShield />
            <span>
              © Bứt Phá Marketing · {BP_LOGIN.clientName}
            </span>
          </p>
        </section>
        <aside className="login-promo">
          <div className="login-promo-blobs" aria-hidden>
            <span className="login-blob login-blob--violet" />
            <span className="login-blob login-blob--indigo" />
          </div>
          <div className="login-promo-inner">
            <div className="promo-brand">
              <BpMark />
              <div>
                <strong>BỨT PHÁ MARKETING</strong>
                <small>DÀNH CHO KHÁCH HÀNG</small>
              </div>
            </div>
            <h2>
              {BP_LOGIN.heroLines[0]}
              <br />
              {BP_LOGIN.heroLines[1]}
            </h2>
            <p className="promo-lead">{BP_LOGIN.heroLead}</p>
            <div className="promo-contacts">
              {BP_LOGIN.contacts.map((c) => {
                const Icon = promoIcons[c.icon];
                return (
                  <a key={c.key} className="promo-chip" href={c.href} target="_blank" rel="noreferrer">
                    <span className="promo-chip-ico" aria-hidden>
                      <Icon />
                    </span>
                    <span>
                      <small>{c.label}</small>
                      <strong>{c.value}</strong>
                    </span>
                  </a>
                );
              })}
            </div>
            <p className="promo-section-title">DỊCH VỤ CỦA CHÚNG TÔI</p>
            <div className="promo-services">
              {BP_LOGIN.services.map((s) => {
                const Icon = promoIcons[s.icon];
                return (
                  <a key={s.title} className="promo-service" href={s.href} target="_blank" rel="noreferrer">
                    <span className="promo-service-ico" aria-hidden>
                      <Icon />
                    </span>
                    <span>
                      <strong>{s.title}</strong>
                      <small>{s.desc}</small>
                    </span>
                  </a>
                );
              })}
            </div>
            <footer className="promo-footer">
              <span className="promo-powered">
                <IconSpark />
                Powered by Bứt Phá Marketing
              </span>
              <span className="promo-version">{BP_LOGIN.version}</span>
            </footer>
          </div>
        </aside>
      </div>
    </div>
  );
}

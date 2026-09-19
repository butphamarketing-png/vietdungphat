import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../lib/cms.js";
import { BP_LOGIN } from "./bp-login.js";
import { BpMark, IconEye, IconEyeOff } from "./icons.jsx";

const SLIDES = [
  {
    title: "Giải pháp",
    accent: "QUẢN LÝ WEBSITE",
    points: ["Cập nhật nội dung trang chủ", "Thư viện ảnh và bài viết", "Đặt lịch khách hàng"],
  },
  {
    title: "Dịch vụ",
    accent: "BỨT PHÁ MARKETING",
    points: BP_LOGIN.services.map((s) => s.title),
  },
  {
    title: "Hỗ trợ",
    accent: "KỸ THUẬT & HOTLINE",
    points: ["Hotline 093.741.7982", "butphamarketing.com", "butphamarketing@gmail.com"],
  },
];

export default function AdminLogin() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => window.clearInterval(id);
  }, []);

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

  const current = SLIDES[slide];

  return (
    <div className="vns-login">
      <div className="vns-login-flex">
        <section className="vns-login-box">
          <span />
          <span />
          <span />
          <span />
          <form className="vns-login-form" onSubmit={onSubmit}>
            <div className="vns-login-logo">
              <BpMark className="login-bp-logo" />
              <strong>BỨT PHÁ MARKETING</strong>
              <small>CMS khách hàng · {BP_LOGIN.clientName}</small>
            </div>
            <h1>Đăng nhập</h1>
            <div className="vns-field is-user">
              <input
                type="text"
                name="username"
                placeholder="Tài khoản"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="vns-field is-pass">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="vns-eye"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {error ? <p className="vns-error">{error}</p> : null}
            <button type="submit">Đăng nhập</button>
            <div className="vns-web">
              <a href="/" target="_blank" rel="noreferrer">
                Truy cập trang web
              </a>
            </div>
            <p className="vns-note">
              Trong trường hợp có vấn đề vui lòng liên hệ hotline: <strong>093.741.7982</strong> để được hỗ trợ
            </p>
          </form>
        </section>
        <aside className="vns-login-slide">
          <div className="vns-login-slide-inner">
            <button type="button" className="vns-nav prev" aria-label="Trước" onClick={() => setSlide((s) => (s + SLIDES.length - 1) % SLIDES.length)} />
            <article className="vns-card">
              <div>
                <BpMark className="login-bp-logo" />
                <p>{current.title}</p>
                <h2>{current.accent}</h2>
                <ul>
                  {current.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </article>
            <button type="button" className="vns-nav next" aria-label="Sau" onClick={() => setSlide((s) => (s + 1) % SLIDES.length)} />
          </div>
        </aside>
      </div>
    </div>
  );
}

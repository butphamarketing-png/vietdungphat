import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function SiteLoader() {
  const { pathname } = useLocation();

  useEffect(() => {
    const el = document.getElementById("boot-loader");
    if (!el) {
      document.body.classList.remove("is-booting");
      return;
    }

    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      el.classList.add("is-done");
      document.body.classList.remove("is-booting");
      window.setTimeout(() => el.remove(), 800);
    };

    window.addEventListener("vdp-hero-ready", hide);
    const delay = pathname.startsWith("/adminbp") ? 0 : pathname === "/" ? 3200 : 900;
    const fallback = window.setTimeout(hide, delay);
    return () => {
      window.removeEventListener("vdp-hero-ready", hide);
      window.clearTimeout(fallback);
    };
  }, [pathname]);

  return null;
}


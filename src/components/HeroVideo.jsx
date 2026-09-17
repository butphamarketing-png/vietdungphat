import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function HeroVideo() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    el.defaultMuted = true;
    const play = () => el.play().catch(() => {});
    play();
    el.addEventListener("loadeddata", play);
    el.addEventListener("canplay", play);
    return () => {
      el.removeEventListener("loadeddata", play);
      el.removeEventListener("canplay", play);
    };
  }, []);

  return (
    <section className="hero">
      <video
        ref={ref}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/studio/01.jpg"
        src="/hero.mp4?v=client"
      />
      <div className="hero-copy">
        <p className="kicker light">Thiết kế · Xây dựng · Cải tạo</p>
        <h1>
          Kiến tạo không gian
          <br />
          sống bền vững
        </h1>
        <div className="cta-row">
          <Link className="btn" to="/lien-he">
            Đặt lịch khảo sát
          </Link>
          <Link className="btn ghost" to="/mau-nha">
            Xem mẫu nhà
          </Link>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../lib/cms.js";

export default function HeroVideo() {
  const { home } = useCms();
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
        poster={home.poster}
        src={home.video}
      />
      <div className="hero-copy">
        <p className="kicker light">{home.kicker}</p>
        <h1>
          {home.title1}
          <br />
          {home.title2}
        </h1>
        <div className="cta-row">
          <Link className="btn" to="/lien-he">
            {home.cta1}
          </Link>
          <Link className="btn ghost" to="/mau-nha">
            {home.cta2}
          </Link>
        </div>
      </div>
    </section>
  );
}

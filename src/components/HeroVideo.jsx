import { useEffect, useRef } from "react";

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
        poster="/hero-poster.jpg"
        src="/hero.mp4"
      />
    </section>
  );
}

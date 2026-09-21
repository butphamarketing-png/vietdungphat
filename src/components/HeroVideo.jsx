import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../lib/cms.js";

function youtubeId(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  const m = raw.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|live\/|watch\?(?:.*&)?v=))([A-Za-z0-9_-]{11})/,
  );
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  return "";
}

function youtubeEmbedSrc(id) {
  const q = new URLSearchParams({
    autoplay: "1",
    mute: "0",
    loop: "1",
    playlist: id,
    controls: "0",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
    disablekb: "1",
    fs: "0",
    cc_load_policy: "0",
    enablejsapi: "1",
  });
  if (typeof window !== "undefined") q.set("origin", window.location.origin);
  return `https://www.youtube.com/embed/${id}?${q.toString()}`;
}

function ensureYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  return new Promise((resolve) => {
    const ready = () => {
      if (window.YT?.Player) resolve(window.YT);
    };
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      ready();
    };
    if (!document.querySelector("script[src='https://www.youtube.com/iframe_api']")) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
    const tick = window.setInterval(() => {
      if (!window.YT?.Player) return;
      window.clearInterval(tick);
      ready();
    }, 50);
  });
}

function playLoud(player) {
  if (!player) return;
  try {
    player.unMute();
    player.setVolume(100);
    player.playVideo();
  } catch {
    /* ignore */
  }
}

export default function HeroVideo() {
  const { home } = useCms();
  const iframeRef = useRef(null);
  const yt = youtubeId(home.video) || "8DbWI_IjhqE";
  const label = `${home.title1 || ""} ${home.title2 || ""}`.trim() || "Video giới thiệu Việt Dũng Phát";

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let player;
    let cancelled = false;

    ensureYouTubeApi().then((YT) => {
      if (cancelled || !iframeRef.current) return;
      player = new YT.Player(iframeRef.current, {
        events: {
          onReady: (event) => playLoud(event.target),
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) playLoud(event.target);
          },
        },
      });
      playLoud(player);
    });

    const command = (func, args = []) => {
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
    };
    const fallbackLoud = () => {
      command("unMute");
      command("setVolume", [100]);
      command("playVideo");
      playLoud(player);
    };
    iframe.addEventListener("load", fallbackLoud);
    window.addEventListener("pointerdown", fallbackLoud);
    window.addEventListener("keydown", fallbackLoud);

    return () => {
      cancelled = true;
      iframe.removeEventListener("load", fallbackLoud);
      window.removeEventListener("pointerdown", fallbackLoud);
      window.removeEventListener("keydown", fallbackLoud);
      try {
        player?.destroy?.();
      } catch {
        /* ignore */
      }
    };
  }, [yt]);

  return (
    <section className="hero">
      <div className="hero-embed" aria-hidden="true">
        <iframe
          ref={iframeRef}
          key={yt}
          id="hero-yt"
          className="hero-video"
          title={label}
          src={youtubeEmbedSrc(yt)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
        />
      </div>
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

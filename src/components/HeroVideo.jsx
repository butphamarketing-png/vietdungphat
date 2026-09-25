import { useEffect, useRef, useState } from "react";
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
    mute: "1",
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
    vq: "hd1080",
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

function isPhoneHero() {
  return window.matchMedia("(max-width: 980px)").matches;
}

function fitHeroIframe(el) {
  if (!el) return;
  if (isPhoneHero()) {
    el.width = "1920";
    el.height = "1080";
    el.style.width = "140%";
    el.style.height = "140%";
    el.style.top = "50%";
    el.style.bottom = "auto";
    el.style.left = "50%";
    el.style.transformOrigin = "center center";
    el.style.transform = "translate(-50%, -50%)";
    return;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const coverW = Math.max(vw, (vh * 16) / 9);
  const w = Math.max(1920, Math.round(coverW * dpr));
  const h = Math.round((w * 9) / 16);
  el.width = String(w);
  el.height = String(h);
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
  const scale = Math.max(vw / w, vh / h);
  el.style.transformOrigin = "center bottom";
  el.style.top = "auto";
  el.style.bottom = "0px";
  el.style.left = "50%";
  el.style.transform = `translateX(-50%) scale(${scale})`;
}

function forceHd(player) {
  if (!player) return;
  try {
    const levels = player.getAvailableQualityLevels?.() || [];
    const best = ["highres", "hd2160", "hd1440", "hd1080", "hd720"].find((q) => levels.includes(q)) || "hd1080";
    player.setPlaybackQuality(best);
    player.setPlaybackQualityRange?.(best, "highres");
  } catch {
    /* ignore */
  }
}

function startPlay(player) {
  if (!player) return;
  try {
    player.mute();
    player.playVideo();
    forceHd(player);
  } catch {
    /* ignore */
  }
}

function tryUnmute(player) {
  if (!player) return;
  try {
    player.unMute();
    player.setVolume(100);
    if (player.getPlayerState?.() !== 1) player.playVideo();
  } catch {
    /* ignore */
  }
}

function markHeroReady() {
  window.dispatchEvent(new Event("vdp-hero-ready"));
}

export default function HeroVideo() {
  const { home } = useCms();
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const yt = youtubeId(home.video) || "8DbWI_IjhqE";
  const label = `${home.title1 || ""} ${home.title2 || ""}`.trim() || "Video giới thiệu Việt Dũng Phát";

  const sendCommand = (func, args = []) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
  };

  const togglePlayback = () => {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    const player = playerRef.current;
    try {
      if (next) {
        player?.pauseVideo?.();
        sendCommand("pauseVideo");
      } else {
        player?.playVideo?.();
        sendCommand("playVideo");
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    fitHeroIframe(iframe);
    const onResize = () => fitHeroIframe(iframe);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [yt]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let player;
    let cancelled = false;
    let readySent = false;
    const readyOnce = () => {
      if (readySent) return;
      readySent = true;
      markHeroReady();
    };

    ensureYouTubeApi().then((YT) => {
      if (cancelled || !iframeRef.current) return;
      playerRef.current = player = new YT.Player(iframeRef.current, {
        playerVars: { autoplay: 1, mute: 1, vq: "hd1080" },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            if (!pausedRef.current) startPlay(event.target);
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.BUFFERING) {
              forceHd(event.target);
              readyOnce();
            }
            if (
              !pausedRef.current &&
              (event.data === YT.PlayerState.UNSTARTED || event.data === YT.PlayerState.CUED)
            ) {
              startPlay(event.target);
            }
          },
          onPlaybackQualityChange: (event) => {
            const q = event.data;
            if (q && !/hd|highres/.test(String(q))) forceHd(event.target);
          },
        },
      });
      startPlay(player);
    });

    const command = (func, args = []) => {
      iframe.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
    };
    const kick = () => {
      if (pausedRef.current) return;
      command("mute");
      command("playVideo");
      command("setPlaybackQuality", ["hd1080"]);
      startPlay(player);
    };
    const unmute = (event) => {
      if (pausedRef.current || event?.target?.closest?.(".hero-video-toggle")) return;
      command("unMute");
      command("setVolume", [100]);
      command("playVideo");
      tryUnmute(player);
    };
    iframe.addEventListener("load", kick);
    window.addEventListener("pointerdown", unmute);
    window.addEventListener("keydown", unmute);

    const fallbackReady = window.setTimeout(readyOnce, 2800);

    return () => {
      cancelled = true;
      window.clearTimeout(fallbackReady);
      iframe.removeEventListener("load", kick);
      window.removeEventListener("pointerdown", unmute);
      window.removeEventListener("keydown", unmute);
      playerRef.current = null;
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
          width="1920"
          height="1080"
          src={youtubeEmbedSrc(yt)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
        />
        <button
          type="button"
          className={`hero-video-toggle${paused ? " is-paused" : ""}`}
          aria-label={paused ? "Phát video" : "Tạm dừng video"}
          onClick={togglePlayback}
        >
          <span className="hero-video-toggle-icon" aria-hidden="true">
            {paused ? (
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </section>
  );
}

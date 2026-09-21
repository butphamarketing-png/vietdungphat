import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../lib/cms.js";
import { uniqueHouses } from "../lib/studio.js";
import { youtubeThumb } from "../lib/album.js";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";

export default function Album() {
  const { studio, album } = useCms();
  const videos = useMemo(() => album?.videos || [], [album]);
  const photos = useMemo(() => uniqueHouses(studio), [studio]);
  const [active, setActive] = useState(videos[0]?.id || "");
  const [lightbox, setLightbox] = useState(-1);

  useEffect(() => {
    if (!videos.some((v) => v.id === active) && videos[0]) setActive(videos[0].id);
  }, [videos, active]);

  useEffect(() => {
    if (lightbox < 0) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(-1);
      if (e.key === "ArrowRight") setLightbox((i) => (i + 1) % photos.length);
      if (e.key === "ArrowLeft") setLightbox((i) => (i - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("is-popup-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("is-popup-open");
    };
  }, [lightbox, photos.length]);

  const current = videos.find((v) => v.id === active) || videos[0];
  const lightPhoto = lightbox >= 0 ? photos[lightbox] : null;

  return (
    <article className="page">
      <PageHero
        kicker={
          <>
            <Link to="/">Trang chủ</Link> / {album?.kicker || "Album"}
          </>
        }
        title={album?.title || "Album công trình"}
      >
        <p>{album?.lead || "Video thi công và hình ảnh mẫu nhà tân cổ điển của Việt Dũng Phát."}</p>
      </PageHero>

      <div className="page-body album-split">
        <section className="album-col album-videos" aria-label="Video">
          <p className="kicker lined">Video</p>
          {current ? (
            <div className="album-player">
              <iframe
                key={current.id}
                title={current.title}
                src={`https://www.youtube.com/embed/${current.id}?rel=0&modestbranding=1&playsinline=1&vq=hd1080`}
                width="1280"
                height="720"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : null}
          <h2 className="album-now">{current?.title}</h2>
          <div className="album-video-list">
            {videos.map((video) => (
              <button
                key={video.id}
                type="button"
                className={`album-video-item${video.id === current?.id ? " is-on" : ""}`}
                onClick={() => setActive(video.id)}
              >
                <img
                  src={youtubeThumb(video.id)}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                  }}
                />
                <span>{video.title}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="album-col album-photos" aria-label="Ảnh">
          <p className="kicker lined">Ảnh</p>
          <div className="album-photo-grid">
            {photos.map((photo, idx) => (
              <button
                key={photo.src + idx}
                type="button"
                className="album-photo"
                onClick={() => setLightbox(idx)}
              >
                <SmartImg src={photo.src} alt={photo.title} />
                <span>{photo.title}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {lightPhoto ? (
        <div className="album-lightbox" role="dialog" aria-modal="true" aria-label={lightPhoto.title}>
          <button type="button" className="album-lightbox-bg" aria-label="Đóng" onClick={() => setLightbox(-1)} />
          <button type="button" className="album-lightbox-nav prev" aria-label="Ảnh trước" onClick={() => setLightbox((i) => (i - 1 + photos.length) % photos.length)}>
            ‹
          </button>
          <figure>
            <SmartImg src={lightPhoto.src} alt={lightPhoto.title} />
            <figcaption>{lightPhoto.title}</figcaption>
          </figure>
          <button type="button" className="album-lightbox-nav next" aria-label="Ảnh sau" onClick={() => setLightbox((i) => (i + 1) % photos.length)}>
            ›
          </button>
          <button type="button" className="album-lightbox-close" aria-label="Đóng" onClick={() => setLightbox(-1)}>
            ×
          </button>
        </div>
      ) : null}

      <BookingCta />
    </article>
  );
}

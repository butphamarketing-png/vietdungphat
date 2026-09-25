import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../lib/cms.js";
import { albumProjectsFrom, youtubeThumb } from "../lib/album.js";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";

export default function Album() {
  const { album, projects } = useCms();
  const videos = useMemo(() => album?.videos || [], [album]);
  const albums = useMemo(() => albumProjectsFrom(projects), [projects]);
  const [active, setActive] = useState(videos[0]?.id || "");
  const [projectSlug, setProjectSlug] = useState("");
  const [lightbox, setLightbox] = useState(-1);

  const project = albums.find((item) => item.slug === projectSlug) || null;
  const projectPhotos = project?.photos || [];

  useEffect(() => {
    if (!videos.some((v) => v.id === active) && videos[0]) setActive(videos[0].id);
  }, [videos, active]);

  useEffect(() => {
    if (lightbox < 0 || !projectPhotos.length) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(-1);
      if (e.key === "ArrowRight") setLightbox((i) => (i + 1) % projectPhotos.length);
      if (e.key === "ArrowLeft") setLightbox((i) => (i - 1 + projectPhotos.length) % projectPhotos.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("is-popup-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("is-popup-open");
    };
  }, [lightbox, projectPhotos.length]);

  const current = videos.find((v) => v.id === active) || videos[0];
  const lightPhoto = lightbox >= 0 ? projectPhotos[lightbox] : null;

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
        <p>{album?.lead || "Video YouTube và album ảnh theo từng dự án đã thi công của Việt Dũng Phát."}</p>
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

        <section className="album-col album-photos" aria-label="Album ảnh">
          <p className="kicker lined">Album ảnh</p>
          {project ? (
            <div className="album-project-view">
              <div className="album-project-head">
                <button type="button" className="text-link" onClick={() => { setProjectSlug(""); setLightbox(-1); }}>
                  ← Tất cả dự án
                </button>
                <h2>{project.title}</h2>
                <p>{project.count} ảnh</p>
              </div>
              <div className="album-photo-grid">
                {projectPhotos.map((src, idx) => (
                  <button
                    key={src + idx}
                    type="button"
                    className="album-photo"
                    onClick={() => setLightbox(idx)}
                  >
                    <SmartImg src={src} alt={`${project.title} – ảnh ${idx + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="album-project-grid">
              {albums.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  className="album-project-card"
                  onClick={() => setProjectSlug(item.slug)}
                >
                  <SmartImg src={item.cover} alt={item.title} />
                  <span className="album-project-count">{item.count} ảnh</span>
                  <span className="album-project-name">{item.title}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {lightPhoto && project ? (
        <div className="album-lightbox" role="dialog" aria-modal="true" aria-label={project.title}>
          <button type="button" className="album-lightbox-bg" aria-label="Đóng" onClick={() => setLightbox(-1)} />
          <button
            type="button"
            className="album-lightbox-nav prev"
            aria-label="Ảnh trước"
            onClick={() => setLightbox((i) => (i - 1 + projectPhotos.length) % projectPhotos.length)}
          >
            ‹
          </button>
          <figure>
            <SmartImg src={lightPhoto} alt={`${project.title} – ảnh ${lightbox + 1}`} />
            <figcaption>
              {project.title} · {lightbox + 1}/{projectPhotos.length}
            </figcaption>
          </figure>
          <button
            type="button"
            className="album-lightbox-nav next"
            aria-label="Ảnh sau"
            onClick={() => setLightbox((i) => (i + 1) % projectPhotos.length)}
          >
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

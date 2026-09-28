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
            <Link to="/">Trang chủ</Link> / {album?.kicker || "Dự án"}
          </>
        }
        title={album?.title || "Công trình tiêu biểu"}
      >
        <p>{album?.lead || "Video YouTube và ảnh theo từng dự án đã thi công. Mẫu theo phong cách xem tại Mẫu nhà."}</p>
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

        <section className="album-col album-photos" aria-label="Bài viết công trình">
          <p className="kicker lined">Bài viết công trình</p>
          {project ? (
            <article className="album-article">
              <button type="button" className="text-link" onClick={() => { setProjectSlug(""); setLightbox(-1); }}>
                ← Tất cả dự án
              </button>
              <h2>{project.title}</h2>
              {project.facts?.length ? (
                <table className="album-specs">
                  <tbody>
                    {project.facts.map(([label, value]) => (
                      <tr key={label}>
                        <th scope="row">{label}</th>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
              {project.paragraphs?.length ? (
                <div className="album-article-copy">
                  {project.paragraphs.map((text) => (
                    <p key={text.slice(0, 48)}>{text}</p>
                  ))}
                </div>
              ) : null}
              <div className="album-article-photos">
                {projectPhotos.map((src, idx) => (
                  <button
                    key={src + idx}
                    type="button"
                    className="album-article-photo"
                    onClick={() => setLightbox(idx)}
                  >
                    <SmartImg src={src} alt={`${project.title} – ảnh ${idx + 1}`} />
                  </button>
                ))}
              </div>
            </article>
          ) : (
            <div className="album-article-list">
              {albums.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  className="album-article-card"
                  onClick={() => setProjectSlug(item.slug)}
                >
                  <SmartImg src={item.cover} alt={item.title} />
                  <span className="album-article-card-body">
                    <strong>{item.title}</strong>
                    {item.excerpt ? <span>{item.excerpt}</span> : <span>{item.count} ảnh công trình</span>}
                    <em>Xem bài viết</em>
                  </span>
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

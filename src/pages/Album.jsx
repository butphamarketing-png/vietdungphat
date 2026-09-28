import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../lib/cms.js";
import { albumProjectsFrom, youtubeThumb } from "../lib/album.js";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";

export default function Album() {
  const { album, projects } = useCms();
  const videos = useMemo(() => album?.videos || [], [album]);
  const albums = useMemo(() => albumProjectsFrom(projects), [projects]);
  const [active, setActive] = useState(videos[0]?.id || "");
  const [projectSlug, setProjectSlug] = useState("");
  const [lightbox, setLightbox] = useState(-1);
  const [kind, setKind] = useState("");
  const [place, setPlace] = useState("");
  const [page, setPage] = useState(1);

  const project = albums.find((item) => item.slug === projectSlug) || null;
  const projectPhotos = project?.photos || [];
  const places = useMemo(() => [...new Set(albums.map((item) => item.place).filter(Boolean))], [albums]);
  const visible = useMemo(
    () => albums.filter((item) => (!kind || item.kind === kind) && (!place || item.place === place)),
    [albums, kind, place],
  );
  const pageSize = 18;
  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  const pageItems = visible.slice((page - 1) * pageSize, page * pageSize);

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
      <header className="catalog-banner" style={{ backgroundImage: "url(/villas/villa-cong-lon.jpg)" }}>
        <p className="kicker">
          <Link to="/">Trang chủ</Link> · {album?.kicker || "Dự án"}
        </p>
        <h1>{album?.title || "Công trình tiêu biểu"}</h1>
      </header>

      <div className="page-body">
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
          <>
            <div className="catalog-filters">
              <select
                aria-label="Loại nhà"
                value={kind}
                onChange={(e) => {
                  setKind(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Xây nhà</option>
                <option value="biet-thu">Biệt thự</option>
                <option value="nha-pho">Nhà phố</option>
                <option value="nha-o">Nhà ở</option>
              </select>
              <select
                aria-label="Khu vực"
                value={place}
                onChange={(e) => {
                  setPlace(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Khu vực</option>
                {places.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="catalog-grid">
              {pageItems.map((item) => (
                <button
                  key={item.slug}
                  type="button"
                  className="catalog-card"
                  onClick={() => {
                    setProjectSlug(item.slug);
                    window.scrollTo(0, 0);
                  }}
                >
                  <SmartImg src={item.cover} alt={item.cardTitle || item.title} />
                  <span className="catalog-card-copy">
                    {item.place ? (
                      <em>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
                        {item.place}
                      </em>
                    ) : null}
                    <strong>{item.cardTitle || item.title}</strong>
                  </span>
                </button>
              ))}
            </div>
            {pages > 1 ? (
              <nav className="catalog-pages" aria-label="Trang dự án">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button key={n} type="button" className={n === page ? "is-on" : ""} onClick={() => { setPage(n); window.scrollTo(0, 0); }}>
                    {n}
                  </button>
                ))}
              </nav>
            ) : null}
          </>
        )}

        {project ? null : <section className="album-videos catalog-videos" aria-label="Video">
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
        </section>}
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

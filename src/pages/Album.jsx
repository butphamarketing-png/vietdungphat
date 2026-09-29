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
  const [kind, setKind] = useState("");
  const [place, setPlace] = useState("");
  const [page, setPage] = useState(1);

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

  const current = videos.find((v) => v.id === active) || videos[0];

  return (
    <article className="page">
      <header className="catalog-banner" style={{ backgroundImage: "url(/villas/villa-cong-lon.jpg)" }}>
        <p className="kicker">
          <Link to="/">Trang chủ</Link> · {album?.kicker || "Dự án"}
        </p>
        <h1>{album?.title || "Công trình tiêu biểu"}</h1>
        {album?.lead ? <p className="catalog-lead">{album.lead}</p> : null}
      </header>

      <div className="page-body">
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
            <Link key={item.slug} to={`/${item.slug}`} className="catalog-card">
              <SmartImg src={item.cover} alt={item.headline || item.cardTitle || item.title} />
              <span className="catalog-card-copy">
                {item.place ? (
                  <em>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
                    {item.place}
                  </em>
                ) : null}
                <strong>{item.headline || item.cardTitle || item.title}</strong>
              </span>
            </Link>
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

        <section className="album-videos catalog-videos" aria-label="Video">
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
      </div>
      <BookingCta />
    </article>
  );
}

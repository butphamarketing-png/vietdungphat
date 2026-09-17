import { Link } from "react-router-dom";
import { lists } from "../lib/content.js";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";

export default function ListPage({ kind }) {
  const data = lists[kind];
  const projects = kind === "projects";
  return (
    <article className="page">
      <PageHero kicker={data.kicker || data.title} title={data.title}>
        <p>{data.intro}</p>
      </PageHero>
      <div className="page-body">
        <div className={kind === "news" ? "news-grid list" : projects ? "project-grid" : "grid-3"}>
          {data.items.map((p, idx) =>
            kind === "news" ? (
              <Link key={p.slug} to={`/${p.slug}`} className="news-card">
                <img src={p.image} alt={p.title} />
                <div>
                  {p.date ? <time>{p.date}</time> : null}
                  <h3>{p.title}</h3>
                </div>
              </Link>
            ) : projects ? (
              <Link key={p.slug} to={`/${p.slug}`} className="project-card">
                <img src={p.image} alt={p.title} />
                <span className="num">{String(idx + 1).padStart(2, "0")}</span>
                <span className="name">{p.title}</span>
              </Link>
            ) : (
              <Link key={p.slug} to={`/${p.slug}`} className="card">
                <img src={p.image} alt={p.title} />
                <span>{p.title}</span>
              </Link>
            )
          )}
        </div>
      </div>
      <BookingCta />
    </article>
  );
}

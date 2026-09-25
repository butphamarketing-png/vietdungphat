import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCms } from "../lib/cms.js";
import { isWorkshopProduct } from "../lib/studio.js";
import { KEYWORD_GROUPS } from "../data/keywords.js";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";
import { FALLBACK_IMAGE, keywordAlt } from "../lib/media.js";

export default function ListPage({ kind }) {
  const cms = useCms();
  const data = cms.lists[kind];
  const projects = kind === "projects";
  const [group, setGroup] = useState("all");
  const newsItems = data.items || [];
  const productItems = kind === "products" ? (data.items || []).filter(isWorkshopProduct) : data.items;
  const filtered = useMemo(() => {
    if (kind !== "news" || group === "all") return newsItems;
    if (group === "goc") return newsItems.filter((p) => p.source !== "keyword");
    return newsItems.filter((p) => p.group === group);
  }, [kind, group, newsItems]);

  return (
    <article className="page">
      <PageHero
        kicker={
          <>
            <Link to="/">Trang chủ</Link> / {data.title}
          </>
        }
        title={data.title}
      >
        <p>{data.intro}</p>
      </PageHero>
      <div className="page-body">
        {kind === "news" ? (
          <div className="news-filters" role="tablist" aria-label="Lọc tin tức">
            <button type="button" className={group === "all" ? "is-on" : ""} onClick={() => setGroup("all")}>
              Tất cả
            </button>
            {KEYWORD_GROUPS.map((g) => (
              <button key={g.id} type="button" className={group === g.id ? "is-on" : ""} onClick={() => setGroup(g.id)}>
                {g.label}
              </button>
            ))}
            <button type="button" className={group === "goc" ? "is-on" : ""} onClick={() => setGroup("goc")}>
              Tin gốc
            </button>
          </div>
        ) : null}
        <div className={kind === "news" || projects || kind === "products" ? "news-grid list" : "grid-3"}>
          {(kind === "news" ? filtered : productItems).map((p) =>
            kind === "news" || projects || kind === "products" ? (
              <Link key={p.slug} to={`/${p.slug}`} className="news-card">
                <SmartImg src={p.image || FALLBACK_IMAGE} alt={keywordAlt(p)} />
                <div>
                  {p.date ? <time>{p.date}</time> : null}
                  <h3>{p.title}</h3>
                  {p.desc ? <p>{p.desc}</p> : null}
                </div>
              </Link>
            ) : (
              <Link key={p.slug} to={`/${p.slug}`} className="card">
                <SmartImg src={p.image} alt={p.title} />
                <span>{p.title}</span>
              </Link>
            ),
          )}
        </div>
      </div>
      <BookingCta />
    </article>
  );
}

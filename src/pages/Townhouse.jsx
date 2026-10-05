import { Link, useParams } from "react-router-dom";
import { catalogBySlug, findCatalogSample } from "../data/house-catalogs.js";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";

function CatalogList({ slug }) {
  const catalog = catalogBySlug(slug);
  return (
    <article className="page">
      <PageHero
        kicker={
          <>
            <Link to="/">Trang chủ</Link> / <Link to="/mau-nha">Mẫu nhà</Link>
          </>
        }
        title={catalog.title}
      >
        <p>{catalog.lead}</p>
      </PageHero>
      <div className="page-body">
        <div className="style-grid">
          {catalog.samples.map((item) => (
            <Link key={item.id} to={`${catalog.base}/${item.id}`} className="style-card">
              <SmartImg src={item.cover} alt={item.title} />
              <div className="style-card-copy">
                <h3>{item.title}</h3>
                <p>{item.images.length} ảnh</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <BookingCta />
    </article>
  );
}

function CatalogSample({ slug }) {
  const catalog = catalogBySlug(slug);
  const { id } = useParams();
  const sample = findCatalogSample(catalog, id);
  if (!sample) {
    return (
      <article className="page">
        <PageHero title="Không tìm thấy mẫu nhà">
          <p>
            Mẫu này không có trong danh mục. Quay lại <Link to={catalog.base}>{catalog.title}</Link>.
          </p>
        </PageHero>
      </article>
    );
  }
  const rest = sample.images.slice(1);
  return (
    <article className="page article">
      <PageHero
        kicker={
          <>
            <Link to="/">Trang chủ</Link> / <Link to="/mau-nha">Mẫu nhà</Link> / <Link to={catalog.base}>{catalog.title}</Link>
          </>
        }
        title={sample.title}
      >
        <p>{sample.images.length} ảnh phối cảnh.</p>
      </PageHero>
      <div className="page-body article-wrap">
        <figure className="article-cover townhouse-cover">
          <SmartImg src={sample.cover} alt={sample.title} loading="eager" />
        </figure>
        {rest.length ? (
          <div className="article-gallery" aria-label={sample.title}>
            {rest.map((src, index) => (
              <SmartImg key={src} src={src} alt={`${sample.title} — ảnh ${index + 2}`} />
            ))}
          </div>
        ) : null}
      </div>
      <BookingCta />
    </article>
  );
}

export function findTownhouse(id) {
  return findCatalogSample(catalogBySlug("nha-pho"), id);
}

export function TownhouseList() {
  return <CatalogList slug="nha-pho" />;
}

export function TownhouseSample() {
  return <CatalogSample slug="nha-pho" />;
}

export function MaiNhatList() {
  return <CatalogList slug="nha-mai-nhat" />;
}

export function MaiNhatSample() {
  return <CatalogSample slug="nha-mai-nhat" />;
}

export function TanCoList() {
  return <CatalogList slug="nha-tan-co-dien" />;
}

export function TanCoSample() {
  return <CatalogSample slug="nha-tan-co-dien" />;
}

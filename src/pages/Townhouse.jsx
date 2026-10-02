import { Link, useParams } from "react-router-dom";
import samples from "../data/nha-pho-samples.json";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";

export function findTownhouse(id) {
  return samples.find((item) => item.id === id) || null;
}

export function TownhouseList() {
  return (
    <article className="page">
      <PageHero
        kicker={
          <>
            <Link to="/">Trang chủ</Link> / <Link to="/mau-nha">Mẫu nhà</Link>
          </>
        }
        title="Nhà phố"
      >
        <p>{samples.length} mẫu nhà phố. Bấm vào từng mẫu để xem toàn bộ ảnh phối cảnh.</p>
      </PageHero>
      <div className="page-body">
        <div className="style-grid">
          {samples.map((item) => (
            <Link key={item.id} to={`/nha-pho/${item.id}`} className="style-card">
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

export function TownhouseSample() {
  const { id } = useParams();
  const sample = findTownhouse(id);
  if (!sample) {
    return (
      <article className="page">
        <PageHero title="Không tìm thấy mẫu nhà">
          <p>
            Mẫu này không có trong danh mục. Quay lại <Link to="/nha-pho">Nhà phố</Link>.
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
            <Link to="/">Trang chủ</Link> / <Link to="/mau-nha">Mẫu nhà</Link> / <Link to="/nha-pho">Nhà phố</Link>
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

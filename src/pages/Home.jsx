import { Link } from "react-router-dom";
import { useCms } from "../lib/cms.js";
import { homeNeoCards, homeWorkshopProducts } from "../lib/studio.js";
import { homeNewsCards } from "../lib/news-media.js";
import PriceBoard from "../components/PriceBoard.jsx";
import BuildCalc from "../components/BuildCalc.jsx";
import BookingCta from "../components/BookingCta.jsx";
import StatsBar from "../components/StatsBar.jsx";
import SmartImg from "../components/SmartImg.jsx";
import HeroVideo from "../components/HeroVideo.jsx";

function BrText({ text }) {
  return String(text || "")
    .split("\n")
    .map((line, i) => (
      <span key={i}>
        {i ? <br /> : null}
        {line}
      </span>
    ));
}

export default function Home() {
  const cms = useCms();
  const { coreServices, news, products, reviews, home } = cms;
  const neoHomes = homeNeoCards();
  const workshopProducts = homeWorkshopProducts(products);
  const shareNews = homeNewsCards(news);
  return (
    <>
      <HeroVideo />

      <section className="pad services-block">
        <div className="services-intro">
          <p className="kicker">{home.servicesKicker}</p>
          <h2>
            <BrText text={home.servicesTitle} />
          </h2>
          <p>{home.servicesLead}</p>
          <Link className="btn with-arrow" to="/dich-vu">
            {home.servicesCta}
          </Link>
        </div>
        <div className="service-cards">
          {coreServices.map((s, idx) => (
            <Link key={s.title} className="service-card" to={s.href}>
              <SmartImg src={s.image} alt={s.title} loading={idx < 3 ? "eager" : "lazy"} fetchPriority={idx === 0 ? "high" : undefined} />
              <strong>{s.title}</strong>
            </Link>
          ))}
        </div>
      </section>

      <PriceBoard />
      <BuildCalc />

      <section className="pad">
        <div className="section-head row">
          <div>
            <p className="kicker">{home.projectsKicker}</p>
            <h2>{home.projectsTitle}</h2>
          </div>
          <Link className="text-link" to="/mau-nha">
            Xem thêm mẫu nhà
          </Link>
        </div>
        <div className="grid-3 homes">
          {neoHomes.map((p) => (
            <Link key={p.src} to={p.slug} className="card">
              <SmartImg src={p.src} alt={p.title} />
              <span>{p.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="pad journal">
        <div className="section-head row">
          <div>
            <p className="kicker">{home.productsKicker}</p>
            <h2>{home.productsTitle}</h2>
          </div>
          <Link className="text-link" to="/san-pham">
            Xem tất cả sản phẩm
          </Link>
        </div>
        <div className="grid-4">
          {workshopProducts.map((p) => (
            <Link key={p.slug} to={`/${p.slug}`} className="card">
              <SmartImg src={p.image} alt={p.title} />
              <span>{p.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="pad about-block">
        <div className="about-collage">
          <SmartImg className="shot a" src={home.aboutImages?.[0] || "/villas/villa-mansard-rong.jpg"} alt="Biệt thự tân cổ điển mái mansard" />
          <SmartImg className="shot b" src={home.aboutImages?.[1] || "/villas/villa-goc-lon.jpg"} alt="Biệt thự tân cổ điển góc sân vườn" />
          <SmartImg className="shot c" src={home.aboutImages?.[2] || "/villas/villa-cong-lon.jpg"} alt="Biệt thự tân cổ điển mặt tiền rộng" />
          <p className="about-script">Kiến tạo không gian sống bền vững</p>
        </div>
        <div className="about-copy">
          <p className="kicker lined">{home.aboutKicker}</p>
          <h2>
            <BrText text={home.aboutTitle} />
          </h2>
          <p>{home.aboutLead}</p>
          <ul className="field-list">
            {coreServices.map((s) => (
              <li key={s.title}>
                <strong>{s.title}:</strong> {s.desc}
              </li>
            ))}
          </ul>
          <Link className="text-link with-arrow" to="/gioi-thieu">
            Đọc toàn bộ giới thiệu
          </Link>
        </div>
      </section>

      <StatsBar />

      <section className="pad reviews">
        <div className="section-head">
          <p className="kicker">{home.reviewsKicker}</p>
          <h2>{home.reviewsTitle}</h2>
        </div>
        <div className="review-grid">
          {reviews.map((r) => (
            <article key={r.name} className="review-card">
              <p className="stars">★★★★★</p>
              <blockquote>“{r.quote}”</blockquote>
              <strong>{r.name}</strong>
              <span>{r.place}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="pad journal">
        <div className="section-head row">
          <div>
            <p className="kicker">{home.newsKicker}</p>
            <h2>{home.newsTitle}</h2>
          </div>
          <Link className="text-link" to="/tin-tuc">
            Tất cả bài viết
          </Link>
        </div>
        <div className="news-cols">
          {shareNews.map((p) => (
            <Link key={p.slug} to={`/${p.slug}`} className="news-col">
              <SmartImg src={p.image} alt={p.title} />
              {p.date ? <time>{p.date}</time> : null}
              <h3>{p.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      <BookingCta />
    </>
  );
}

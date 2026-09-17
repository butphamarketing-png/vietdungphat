import { Link } from "react-router-dom";
import { coreServices, news, products, projects, reviews } from "../lib/content.js";
import PriceBoard from "../components/PriceBoard.jsx";
import BuildCalc from "../components/BuildCalc.jsx";
import BookingCta from "../components/BookingCta.jsx";
import StatsBar from "../components/StatsBar.jsx";
import SmartImg from "../components/SmartImg.jsx";
import HeroVideo from "../components/HeroVideo.jsx";

export default function Home() {
  return (
    <>
      <HeroVideo />

      <section className="pad services-block">
        <svg className="service-sketch" viewBox="0 0 420 180" aria-hidden="true">
          <g fill="none" stroke="#c9a84c" strokeWidth="1.15">
            <path d="M20 160h70V108H20zM90 160h120V72l-60-40-60 40v88zM210 160h80v-36h-80z" />
            <path d="M118 160v-44h64v44M40 132h28" />
            <path d="M8 168c70-16 140 4 220 6 70 2 140-18 190-8" />
          </g>
        </svg>
        <div className="services-intro">
          <p className="kicker">Dịch vụ</p>
          <h2>
            Thiết kế, xây dựng,
            <br />
            cải tạo
          </h2>
          <p>
            Việt Dũng Phát đồng hành từ ý tưởng đến chìa khóa trao tay: thiết kế kiến trúc — nội thất, xây dựng nhà phố
            biệt thự, và cải tạo nhà hiện hữu. 20 năm kinh nghiệm tại TP.HCM và các tỉnh lân cận.
          </p>
          <Link className="btn with-arrow" to="/dich-vu">
            Xem toàn bộ dịch vụ
          </Link>
        </div>
        <div className="service-cards">
          {coreServices.map((s) => (
            <Link key={s.title} className="service-card" to={s.href}>
              <SmartImg src={s.image} alt={s.title} />
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
            <p className="kicker">Mẫu nhà</p>
            <h2>Công trình tiêu biểu</h2>
          </div>
          <Link className="text-link" to="/mau-nha">
            Xem thêm mẫu nhà
          </Link>
        </div>
        <div className="grid-4">
          {projects.slice(0, 8).map((p) => (
            <Link key={p.slug} to={`/${p.slug}`} className="card">
              <SmartImg src={p.image} alt={p.title} />
              <span>{p.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="pad journal">
        <div className="section-head row">
          <div>
            <p className="kicker">Sản phẩm</p>
            <h2>Nội thất và combo từ xưởng</h2>
          </div>
          <Link className="text-link" to="/san-pham">
            Xem tất cả sản phẩm
          </Link>
        </div>
        <div className="grid-4">
          {products.slice(0, 8).map((p) => (
            <Link key={p.slug} to={`/${p.slug}`} className="card">
              <SmartImg src={p.image} alt={p.title} />
              <span>{p.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="pad about-block">
        <div className="about-collage">
          <SmartImg className="shot a" src={products[2]?.image} alt="Nội thất phòng khách" />
          <SmartImg className="shot b" src={products[4]?.image} alt="Nội thất phòng ăn" />
          <SmartImg className="shot c" src={projects[1]?.image} alt="Công trình Việt Dũng Phát" />
          <p className="about-script">Kiến tạo không gian sống bền vững</p>
        </div>
        <div className="about-copy">
          <p className="kicker lined">Về chúng tôi</p>
          <h2>
            20 năm kiến trúc
            <br />
            và xây dựng
          </h2>
          <p>
            KIẾN TRÚC Việt Dũng Phát là thương hiệu kiến trúc – xây dựng của Công ty TNHH Kiến trúc Xây dựng Việt Dũng
            Phát, với 20 năm kinh nghiệm thiết kế và thi công tại Hồ Chí Minh và các tỉnh lân cận.
          </p>
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
          <p className="kicker">Đánh giá</p>
          <h2>Khách hàng nói gì về chúng tôi</h2>
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

      <section className="pad">
        <div className="section-head row">
          <div>
            <p className="kicker">Mẫu nhà</p>
            <h2>Thêm công trình đã thi công</h2>
          </div>
          <Link className="text-link" to="/mau-nha">
            Xem thêm mẫu nhà
          </Link>
        </div>
        <div className="grid-4">
          {projects.slice(8, 16).map((p) => (
            <Link key={p.slug} to={`/${p.slug}`} className="card">
              <SmartImg src={p.image} alt={p.title} />
              <span>{p.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="pad journal">
        <div className="section-head row">
          <div>
            <p className="kicker">Tin tức</p>
            <h2>Góc chia sẻ</h2>
          </div>
          <Link className="text-link" to="/tin-tuc">
            Tất cả bài viết
          </Link>
        </div>
        <div className="news-cols">
          {news.slice(0, 3).map((p) => (
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

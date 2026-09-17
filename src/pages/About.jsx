import { Link } from "react-router-dom";
import { coreServices, site } from "../lib/content.js";
import { cleanArticleHtml } from "../lib/media.js";
import PageHero from "../components/PageHero.jsx";
import StatsBar from "../components/StatsBar.jsx";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";

export default function About() {
  return (
    <article className="page">
      <PageHero kicker="Giới thiệu" title="20 năm kiến trúc, xây dựng và cải tạo">
        <p>
          Công ty TNHH Kiến trúc Xây dựng Việt Dũng Phát — thiết kế, xây dựng, cải tạo nhà ở tại TP.HCM và các tỉnh lân
          cận. Toàn bộ nội dung giới thiệu gốc được giữ nguyên bên dưới.
        </p>
      </PageHero>
      <div className="page-body">
        <div className="service-cards about-services">
          {coreServices.map((s) => (
            <Link key={s.title} className="service-card" to={s.href}>
              <SmartImg src={s.image} alt={s.title} />
              <strong>{s.title}</strong>
            </Link>
          ))}
        </div>
        <div className="about-layout">
          <SmartImg src={site.aboutImage} alt={site.shortName} />
          <div className="prose">
            {site.aboutHtml ? (
              <div dangerouslySetInnerHTML={{ __html: cleanArticleHtml(site.aboutHtml) }} />
            ) : (
              site.aboutIntro.map((p) => <p key={p}>{p}</p>)
            )}
          </div>
        </div>
      </div>
      <StatsBar />
      <BookingCta />
    </article>
  );
}

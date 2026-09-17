import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { coreServices, lists } from "../lib/content.js";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";

export default function Services() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <article className="page">
      <PageHero kicker="Dịch vụ" title="Thiết kế, xây dựng, cải tạo">
        <p>Ba nhóm dịch vụ cốt lõi — cùng toàn bộ bài viết dịch vụ gốc từ website Việt Dũng Phát.</p>
      </PageHero>
      <div className="page-body">
        <div className="service-cards">
          {coreServices.map((s) => (
            <Link key={s.title} id={s.slug} className="service-card" to={s.href}>
              <SmartImg src={s.image} alt={s.title} />
              <strong>{s.title}</strong>
            </Link>
          ))}
        </div>
        <div className="section-head" style={{ marginTop: "3rem" }}>
          <p className="kicker lined">Danh mục đầy đủ</p>
          <h2>Tất cả dịch vụ trên website</h2>
        </div>
        <div className="grid-3">
          {lists.services.items.map((p) => (
            <Link key={p.slug} to={`/${p.slug}`} className="card">
              <SmartImg src={p.image} alt={p.title} />
              <span>{p.title}</span>
            </Link>
          ))}
        </div>
      </div>
      <BookingCta />
    </article>
  );
}

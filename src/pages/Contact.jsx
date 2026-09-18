import { useCms } from "../lib/cms.js";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";

export default function Contact() {
  const { site, pages } = useCms();
  const page = pages.contact;
  const tel = String(site.phone || "").replace(/\./g, "");
  return (
    <article className="page contact-page">
      <PageHero kicker={page.kicker} title={page.title}>
        <p>{page.lead}</p>
      </PageHero>
      <BookingCta />
      <div className="page-body">
        <div className="contact-grid">
          <div className="contact-card">
            <p className="kicker">Văn phòng</p>
            <h2>Địa chỉ</h2>
            <p>{site.address}</p>
            <p>
              <strong>Showroom:</strong> {site.showroom}
            </p>
            <p>
              <strong>Xưởng:</strong> {site.workshop}
            </p>
          </div>
          <div className="contact-card">
            <p className="kicker">Hotline</p>
            <h2>Liên hệ nhanh</h2>
            <p>
              <a href={`tel:${tel}`}>{site.phone}</a>
            </p>
            <p>{site.hotline}</p>
            <p>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
          </div>
          <div className="contact-card">
            <p className="kicker">Bản đồ</p>
            <h2>Tìm chúng tôi</h2>
            <iframe
              title="Bản đồ Việt Dũng Phát"
              src={`https://maps.google.com/maps?q=${site.map?.lat},${site.map?.lng}&z=16&output=embed`}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

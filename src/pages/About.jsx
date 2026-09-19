import { Link } from "react-router-dom";
import { useCms } from "../lib/cms.js";
import { cleanArticleHtml } from "../lib/media.js";
import PageHero from "../components/PageHero.jsx";
import StatsBar from "../components/StatsBar.jsx";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";

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

export default function About() {
  const { coreServices, site, pages } = useCms();
  const page = pages.about;
  return (
    <article className="page">
      <PageHero kicker={page.kicker} title={<BrText text={page.title} />}>
        <p>{page.lead}</p>
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
          <SmartImg src={page.image || "/villas/neo-10.jpg"} alt={site.shortName} />
          <div className="prose">
            {site.aboutHtml ? (
              <div dangerouslySetInnerHTML={{ __html: cleanArticleHtml(site.aboutHtml) }} />
            ) : (
              (site.aboutIntro || []).map((p) => <p key={p}>{p}</p>)
            )}
          </div>
        </div>
      </div>
      <StatsBar />
      <BookingCta />
    </article>
  );
}

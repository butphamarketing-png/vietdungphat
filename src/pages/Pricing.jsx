import { useCms } from "../lib/cms.js";
import PriceBoard from "../components/PriceBoard.jsx";
import BuildCalc from "../components/BuildCalc.jsx";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";

export default function Pricing() {
  const { pages } = useCms();
  const page = pages.pricing;
  return (
    <article className="page pricing-page">
      <PageHero kicker={page.kicker} title={page.title}>
        <p>{page.lead}</p>
      </PageHero>
      <PriceBoard />
      <BuildCalc />
      <BookingCta />
    </article>
  );
}

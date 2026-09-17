import PriceBoard from "../components/PriceBoard.jsx";
import BuildCalc from "../components/BuildCalc.jsx";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";

export default function Pricing() {
  return (
    <article className="page pricing-page">
      <PageHero kicker="Báo giá" title="Bảng báo giá và tính giá xây dựng">
        <p>
          Đơn giá theo m² xây dựng, dùng để tham khảo nhanh. Để có báo giá chính xác, đội ngũ sẽ khảo sát hiện trạng và
          gửi bảng chi tiết.
        </p>
      </PageHero>
      <PriceBoard />
      <BuildCalc />
      <BookingCta />
    </article>
  );
}

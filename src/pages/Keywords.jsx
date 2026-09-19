import { Link, Navigate, useParams } from "react-router-dom";
import { findKeyword, KEYWORD_GROUPS, keywordNewsPath } from "../data/keywords.js";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";

export function KeywordHub() {
  return (
    <article className="page">
      <PageHero kicker="100 từ khóa" title="Xây nhà, thiết kế, cải tạo — đúng việc Việt Dũng Phát làm">
        <p>
          100 bài tin tức theo cụm gia chủ thường tìm: nhà tân cổ điển, xây phần thô, nhà trọn gói, cải tạo và báo giá tại TP.HCM — Thủ Đức, Bình Dương, Đồng Nai.
        </p>
      </PageHero>
      <div className="page-body">
        {KEYWORD_GROUPS.map((group) => (
          <section key={group.id} className="kw-group">
            <h2>{group.label}</h2>
            <ul className="kw-list">
              {group.items.map((item) => (
                <li key={item.slug}>
                  <Link to={keywordNewsPath(item)}>{item.phrase}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <BookingCta />
    </article>
  );
}

export function KeywordPage() {
  const { slug } = useParams();
  const item = findKeyword(slug);

  if (!item) {
    return (
      <article className="page">
        <PageHero title="Không tìm thấy từ khóa">
          <p>
            Quay lại <Link to="/tin-tuc">tin tức</Link> hoặc <Link to="/tu-khoa">danh mục 100 từ khóa</Link>.
          </p>
        </PageHero>
      </article>
    );
  }

  return <Navigate to={keywordNewsPath(item)} replace />;
}

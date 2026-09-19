import { Link, useParams } from "react-router-dom";
import { findKeyword, KEYWORD_GROUPS, KEYWORDS, keywordNewsSlug } from "../data/keywords.js";
import articles from "../data/keyword-articles.json";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";

export function KeywordHub() {
  return (
    <article className="page">
      <PageHero kicker="100 từ khóa" title="Xây nhà, thiết kế, cải tạo — đúng việc Việt Dũng Phát làm">
        <p>
          100 cụm gia chủ thường tìm: nhà tân cổ điển, xây phần thô, nhà trọn gói, cải tạo và báo giá tại TP.HCM — Thủ Đức, Bình Dương, Đồng Nai.
        </p>
      </PageHero>
      <div className="page-body">
        {KEYWORD_GROUPS.map((group) => (
          <section key={group.id} className="kw-group">
            <h2>{group.label}</h2>
            <ul className="kw-list">
              {group.items.map((item) => (
                <li key={item.slug}>
                  <Link to={`/tu-khoa/${item.slug}`}>{item.phrase}</Link>
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
  const related = KEYWORDS.filter((k) => k.group === item?.group && k.slug !== slug).slice(0, 8);

  if (!item) {
    return (
      <article className="page">
        <PageHero title="Không tìm thấy từ khóa">
          <p>
            Quay lại <Link to="/tu-khoa">danh mục 100 từ khóa</Link>.
          </p>
        </PageHero>
      </article>
    );
  }

  const kw = item.phrase;

  return (
    <article className="page article">
      <PageHero
        kicker={
          <>
            <Link to="/">Trang chủ</Link> / <Link to="/tu-khoa">Từ khóa</Link> / {item.label}
          </>
        }
        title={kw}
      >
        <p>{item.description}</p>
        <p>
          <Link to={`/${keywordNewsSlug(item)}`}>Đọc bài tin tức về {item.phrase}</Link>
        </p>
      </PageHero>
      <div className="page-body article-wrap">
        <figure className="article-cover">
          <SmartImg src={item.image} alt={kw} loading="eager" fetchPriority="high" />
        </figure>
        <div
          className="prose article-body"
          dangerouslySetInnerHTML={{ __html: articles[item.slug] || `<p><strong>${kw}</strong></p>` }}
        />
        {related.length ? (
          <div className="related">
            <p className="kicker lined">Từ khóa cùng nhóm</p>
            <h2>Bài viết liên quan</h2>
            <ul className="kw-list">
              {related.map((k) => (
                <li key={k.slug}>
                  <Link to={`/tu-khoa/${k.slug}`}>{k.phrase}</Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <BookingCta />
    </article>
  );
}

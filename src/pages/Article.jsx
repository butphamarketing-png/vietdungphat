import { Link, useParams } from "react-router-dom";
import { findPost, kindOf, projects, news, products, services } from "../lib/content.js";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";

export default function Article() {
  const { slug } = useParams();
  const post = findPost(slug);
  const meta = kindOf(slug);
  const pool =
    meta.kind === "news" ? news : meta.kind === "products" ? products : meta.kind === "services" ? services : projects;
  const related = pool.filter((p) => p.slug !== slug).slice(0, 3);

  if (!post) {
    return (
      <article className="page">
        <PageHero title="Không tìm thấy bài viết">
          <p>
            Nội dung có thể chưa được đồng bộ. Quay lại <Link to={meta.path}>{meta.label}</Link>.
          </p>
        </PageHero>
      </article>
    );
  }

  return (
    <article className="page article">
      <PageHero
        kicker={
          <>
            <Link to="/">Trang chủ</Link> / <Link to={meta.path}>{meta.label}</Link>
          </>
        }
        title={post.title}
      >
        {post.date ? <time>{post.date}</time> : null}
      </PageHero>
      <div className="page-body article-wrap">
        {post.image ? (
          <figure className="article-cover">
            <img src={post.image} alt={post.title} />
          </figure>
        ) : null}
        {post.html ? (
          <div className="prose article-body" dangerouslySetInnerHTML={{ __html: post.html }} />
        ) : (
          <p className="muted">Đang tải nội dung gốc từ kho dữ liệu Việt Dũng Phát.</p>
        )}
        {related.length ? (
          <div className="related">
            <p className="kicker lined">Xem thêm</p>
            <h2>Bài viết liên quan</h2>
            <div className="grid-3">
              {related.map((p) => (
                <Link key={p.slug} to={`/${p.slug}`} className="card">
                  <img src={p.image} alt={p.title} />
                  <span>{p.title}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <BookingCta />
    </article>
  );
}

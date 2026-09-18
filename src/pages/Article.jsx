import { Link, useParams } from "react-router-dom";
import { findPost, kindOf, useCms } from "../lib/cms.js";
import { cleanArticleHtml, fullImage, uniqueImages } from "../lib/media.js";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";

export default function Article() {
  const { slug } = useParams();
  const cms = useCms();
  const post = findPost(slug, cms);
  const meta = kindOf(slug, cms);
  const pool =
    meta.kind === "news" ? cms.news : meta.kind === "products" ? cms.products : meta.kind === "services" ? cms.services : cms.projects;
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

  const cover = fullImage(post.image);
  const body = cleanArticleHtml(post.html);
  const gallery = /<img/i.test(body)
    ? []
    : uniqueImages(post.gallery || []).filter((src) => src !== cover);

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
        {cover ? (
          <figure className="article-cover">
            <SmartImg src={cover} alt={post.title} />
          </figure>
        ) : null}
        {gallery.length ? (
          <div className="article-gallery">
            {gallery.map((src) => (
              <SmartImg key={src} src={src} alt={post.title} />
            ))}
          </div>
        ) : null}
        {body ? (
          <div className="prose article-body" dangerouslySetInnerHTML={{ __html: body }} />
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
                  <SmartImg src={p.image} alt={p.title} />
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

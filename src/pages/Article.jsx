import { Link, useParams } from "react-router-dom";
import { findPost, kindOf, useCms } from "../lib/cms.js";
import { FALLBACK_IMAGE, articleContent, cleanArticleHtml, fullImage, keywordAlt, uniqueImages } from "../lib/media.js";
import { expandProjectHtml, projectBrief, projectHeadline } from "../lib/project-article.js";
import { isHouseStyleSlug } from "../lib/studio.js";
import PageHero from "../components/PageHero.jsx";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";

function SpecIcon({ kind }) {
  const paths = {
    scale: "M12 3 3 7.5 12 12l9-4.5L12 3Zm-9 9L12 16.5 21 12M3 16.5 12 21l9-4.5",
    area: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
    date: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
    budget: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16M8 9.5h8M8 14.5h8",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[kind] || paths.scale} />
    </svg>
  );
}

function toDateTime(date) {
  const match = String(date || "").match(/(\d{1,2})[/.](\d{1,2})[/.](\d{4})/);
  if (!match) return undefined;
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

export default function Article() {
  const { slug } = useParams();
  const cms = useCms();
  if (/^ho-so-nang-luc(\.pdf)?$/i.test(String(slug || ""))) {
    if (typeof window !== "undefined") window.location.replace("/files/ho-so-nang-luc.pdf");
    return null;
  }
  const post = findPost(slug, cms);
  const meta = kindOf(slug, cms);
  const pool =
    meta.kind === "news" ? cms.news : meta.kind === "products" ? cms.products : meta.kind === "services" ? cms.services : cms.projects;
  const projectArticle = Boolean(post) && meta.kind === "projects" && !post.houseStyle && !isHouseStyleSlug(post.slug);
  const related = pool
    .filter((p) => p.slug !== slug && p.visible !== false)
    .filter((p) => (post?.source === "keyword") === (p.source === "keyword"))
    .filter((p) => !projectArticle || (!p.houseStyle && !isHouseStyleSlug(p.slug)))
    .slice(0, 3);

  if (!post || post.visible === false) {
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

  const shopLike = /product-briefing|product-detail-gallery|MagicZoom|box-product-detail|Mô tả sản phẩm/i.test(post.html || "");
  const written = projectArticle ? expandProjectHtml(post) : "";
  const parsed = shopLike || meta.kind === "products" ? articleContent(post) : null;
  const kw = parsed?.kw || keywordAlt(post);
  const cover = parsed?.cover || fullImage(post.image) || FALLBACK_IMAGE;
  const body = written
    ? written
    : parsed
      ? parsed.body
      : cleanArticleHtml(post.html, post.houseStyle ? "" : kw);
  const headline = projectArticle ? projectHeadline(post) : "";
  const brief = projectArticle ? projectBrief(post) : null;
  const gallery = parsed
    ? parsed.gallery
    : /<img/i.test(body)
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
        title={headline || post.title}
      >
        {post.date ? <time dateTime={toDateTime(post.date)}>{post.date}</time> : null}
        {post.desc && meta.kind === "products" ? <p>{post.desc}</p> : null}
      </PageHero>
      <div className="page-body article-wrap">
        {brief?.chips?.length ? (
          <dl className="project-specs">
            {brief.chips.map((chip) => (
              <div key={chip.label}>
                <SpecIcon kind={chip.key} />
                <div>
                  <dt>{chip.label}</dt>
                  <dd>{chip.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        ) : null}
        <figure className="article-cover">
          <SmartImg src={cover} alt={kw || post.title} loading="eager" fetchPriority="high" />
        </figure>
        {brief?.rows?.length ? (
          <table className="project-sheet">
            <caption>{brief.caption}</caption>
            <tbody>
              {brief.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        {body ? (
          <div className="prose article-body" dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <p className="muted">Đang tải nội dung gốc từ kho dữ liệu Việt Dũng Phát.</p>
        )}
        {gallery.length ? (
          <div className="article-gallery" aria-label="Hình ảnh sản phẩm">
            {gallery.map((src, idx) => (
              <SmartImg key={src + idx} src={src} alt={`${kw || post.title} – ảnh ${idx + 1}`} />
            ))}
          </div>
        ) : null}
        {related.length ? (
          <div className="related">
            <p className="kicker lined">Xem thêm</p>
            <h2>Bài viết liên quan</h2>
            <div className="grid-3">
              {related.map((p) => (
                <Link key={p.slug} to={`/${p.slug}`} className="card">
                  <SmartImg src={p.image || cover} alt={keywordAlt(p)} />
                  <span>{projectArticle ? projectHeadline(p) : p.title}</span>
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

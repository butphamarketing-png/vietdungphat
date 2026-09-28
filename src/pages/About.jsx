import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCms } from "../lib/cms.js";
import { profile } from "../lib/profile.js";
import PageHero from "../components/PageHero.jsx";
import StatsBar from "../components/StatsBar.jsx";
import BookingCta from "../components/BookingCta.jsx";
import SmartImg from "../components/SmartImg.jsx";

const articles = [
  {
    id: "chung-toi",
    kicker: "Chúng tôi là ai",
    title: "Từ năm 2014, đồng hành thiết kế và thi công",
    excerpt: profile.intro[0],
    image: "/hsnl/gioi-thieu.jpg",
  },
  {
    id: "thu-ngo",
    kicker: "Thư ngỏ",
    title: "Lời của Ban Giám đốc",
    excerpt: profile.letter[1],
    image: "/villas/neo-10.jpg",
  },
  {
    id: "chinh-sach",
    kicker: "Chính sách hoạt động",
    title: "Sáu cam kết trong từng công trình",
    excerpt: "Sáng tạo, chuyên nghiệp, nỗ lực, chất lượng, tiến độ và bảo hành — sáu cam kết Việt Dũng Phát giữ trong từng công trình.",
    image: "/villas/neo-02.jpg",
  },
  {
    id: "linh-vuc",
    kicker: "Lĩnh vực hoạt động",
    title: "Tám nhóm dịch vụ",
    excerpt: "Thiết kế kiến trúc, nội thất, thi công trọn gói, nhà phố, văn phòng, cải tạo, xin phép xây dựng và giám sát.",
    image: "/villas/neo-06.jpg",
  },
  {
    id: "quy-trinh",
    kicker: "Quy trình làm việc",
    title: "Năm bước chuyên nghiệp",
    excerpt: "Từ khảo sát, báo giá, thiết kế bản vẽ, thi công đến nghiệm thu và bàn giao.",
    image: "/villas/neo-11.jpg",
  },
  {
    id: "to-chuc",
    kicker: "Sơ đồ tổ chức",
    title: "Bộ máy từ thiết kế đến thi công",
    excerpt: "Giám đốc, các phòng chuyên môn và đội thi công xây dựng, kết cấu, hoàn thiện.",
    image: "/hsnl/so-do-to-chuc.jpg",
  },
  {
    id: "chi-nhanh",
    kicker: "Chi nhánh",
    title: "Mạng lưới văn phòng",
    excerpt: profile.offices[0].address,
    image: "/villas/neo-05.jpg",
  },
  {
    id: "cong-trinh",
    kicker: "Dự án đã thực hiện",
    title: "Công trình trong hồ sơ 2026",
    excerpt: "Một số công trình tiêu biểu trong hồ sơ năng lực: Long An, Đồng Nai, Thủ Đức, Bình Thuận.",
    image: profile.works[0].image,
  },
];

export default function About() {
  const { coreServices, site } = useCms();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const current = articles.find((item) => item.id === hash.slice(1)) || null;

  function openArticle(id) {
    navigate(`/gioi-thieu#${id}`);
  }

  return (
    <article className="page">
      <PageHero kicker="Hồ sơ năng lực 2026" title={current?.title || "Kiến trúc Xây dựng Việt Dũng Phát"}>
        {current ? (
          <p>
            <button type="button" className="text-link" onClick={() => navigate("/gioi-thieu")}>
              ← Tất cả bài giới thiệu
            </button>
          </p>
        ) : (
          <p>
            Thành lập năm {profile.founded}. {profile.slogan}. Phương châm “{profile.motto}”.
          </p>
        )}
        <div className="cta-row">
          <a className="btn with-arrow" href={profile.pdf} target="_blank" rel="noreferrer">
            Tải hồ sơ năng lực PDF
          </a>
          <Link className="text-link" to="/lien-he">
            Liên hệ tư vấn
          </Link>
        </div>
      </PageHero>

      <div className="page-body about-profile">
        {current ? <ArticleBody id={current.id} coreServices={coreServices} site={site} /> : (
          <div className="about-articles">
            {articles.map((item) => (
              <button key={item.id} type="button" className="about-article-card" onClick={() => openArticle(item.id)}>
                <SmartImg src={item.image} alt={item.title} />
                <span>
                  <small>{item.kicker}</small>
                  <strong>{item.title}</strong>
                  <em>{item.excerpt}</em>
                  <b>Xem bài viết</b>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <StatsBar />
      <BookingCta />
    </article>
  );
}

function ArticleBody({ id, coreServices, site }) {
  if (id === "chung-toi") {
    return (
      <section className="about-layout">
        <SmartImg src="/hsnl/gioi-thieu.jpg" alt="Giới thiệu Việt Dũng Phát" />
        <div className="prose">
          <p className="kicker lined">Chúng tôi là ai</p>
          <h2>Từ năm {profile.founded}, đồng hành thiết kế và thi công</h2>
          {profile.intro.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </section>
    );
  }

  if (id === "thu-ngo") {
    return (
      <section className="letter-block">
        <p className="kicker lined">Thư ngỏ</p>
        <h2>Lời của Ban Giám đốc</h2>
        {profile.letter.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="letter-sign">
          Trân trọng,
          <br />
          <strong>{site.name}</strong>
          <br />
          {profile.director}
        </p>
      </section>
    );
  }

  if (id === "chinh-sach") {
    return (
      <section>
        <div className="section-head">
          <p className="kicker lined">Chính sách hoạt động</p>
          <h2>Sáu cam kết trong từng công trình</h2>
        </div>
        <div className="policy-grid">
          {profile.policies.map((item) => (
            <article key={item.title} className="policy-card">
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (id === "linh-vuc") {
    return (
      <section>
        <div className="service-cards about-services">
          {coreServices.map((s) => (
            <Link key={s.title} className="service-card" to={s.href}>
              <SmartImg src={s.image} alt={s.title} />
              <strong>{s.title}</strong>
            </Link>
          ))}
        </div>
        <div className="section-head">
          <p className="kicker lined">Lĩnh vực hoạt động</p>
          <h2>Tám nhóm dịch vụ</h2>
        </div>
        <div className="field-grid">
          {profile.fields.map((item) => (
            <article key={item.n} className="field-card">
              <span>{item.n}</span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (id === "quy-trinh") {
    return (
      <section>
        <div className="section-head">
          <p className="kicker lined">Quy trình làm việc</p>
          <h2>Năm bước chuyên nghiệp</h2>
        </div>
        <ol className="process-list">
          {profile.process.map((item) => (
            <li key={item.n}>
              <span>{item.n}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (id === "to-chuc") {
    return (
      <section className="org-block">
        <div>
          <p className="kicker lined">Sơ đồ tổ chức</p>
          <h2>Bộ máy từ thiết kế đến thi công</h2>
          <p>
            Giám đốc — Phó Giám đốc, các phòng kế toán, hành chính nhân sự, kinh doanh, kiến trúc, nội thất, kỹ thuật,
            kỹ sư, giám sát, điện – nước (MEP), pháp chế, vật tư và các đội thi công xây dựng, kết cấu, hoàn thiện.
          </p>
        </div>
        <SmartImg src="/hsnl/so-do-to-chuc.jpg" alt="Sơ đồ tổ chức Việt Dũng Phát" />
      </section>
    );
  }

  if (id === "chi-nhanh") {
    return (
      <section>
        <div className="section-head">
          <p className="kicker lined">Chi nhánh</p>
          <h2>Mạng lưới văn phòng</h2>
        </div>
        <div className="office-grid">
          {profile.offices.map((o) => (
            <article key={o.label} className="office-card">
              <p className="kicker">{o.label}</p>
              <p>{o.address}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-head row">
        <div>
          <p className="kicker lined">Dự án đã thực hiện</p>
          <h2>Công trình trong hồ sơ 2026</h2>
        </div>
        <Link className="text-link" to="/album">
          Xem thêm dự án
        </Link>
      </div>
      <div className="hsnl-works">
        {profile.works.map((w) => {
          const inner = (
            <>
              <SmartImg src={w.image} alt={`${w.title} — ${w.place}`} />
              <span>
                {w.title}
                <em>{w.place}</em>
              </span>
            </>
          );
          return w.href ? (
            <Link key={w.title} to={w.href} className="hsnl-work">
              {inner}
            </Link>
          ) : (
            <article key={w.title} className="hsnl-work">
              {inner}
            </article>
          );
        })}
      </div>
    </section>
  );
}

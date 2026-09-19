import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  exportCms,
  flushCms,
  importCms,
  patchCms,
  removeBooking,
  removePost,
  resetCms,
  savePost,
  slugify,
  useCms,
} from "../lib/cms.js";
import { uploadAdminFile } from "../lib/upload.js";
import { seoArticleHtml } from "../lib/seo.js";
import { analyzeRankMath } from "../lib/rankmath.js";
import { CardList, CazoDropzone, Crumbs, EditToolbar, Field, HtmlEditor, ImageField, ItemActions, SaveBar, SwitchField, Tabs, moveItem } from "./ui.jsx";
import SmartImg from "../components/SmartImg.jsx";

const QUICK = [
  { href: "/adminbp/cai-dat", label: "Cấu hình Website", desc: "Xem chi tiết", tone: "gold" },
  { href: "/adminbp/tai-khoan", label: "Tài khoản", desc: "Xem chi tiết", tone: "green" },
  { href: "/adminbp/tai-khoan", label: "Đổi mật khẩu", desc: "Xem chi tiết", tone: "blue" },
  { href: "/adminbp/dat-lich", label: "Thư liên hệ", desc: "Xem chi tiết", tone: "violet" },
];

const LINKS = [
  { href: "/adminbp/trang-chu", label: "Trang chủ", desc: "Hero, intro, thống kê" },
  { href: "/adminbp/mau-nha", label: "Mẫu nhà", desc: "Công trình / bài viết" },
  { href: "/adminbp/san-pham", label: "Sản phẩm", desc: "Nội thất xưởng" },
  { href: "/adminbp/bao-gia", label: "Báo giá", desc: "Gói thi công" },
  { href: "/adminbp/dich-vu", label: "Dịch vụ", desc: "Nhóm dịch vụ + bài viết" },
  { href: "/adminbp/tin-tuc", label: "Tin tức", desc: "Bài viết SEO" },
  { href: "/adminbp/trang", label: "Trang nội dung", desc: "Giới thiệu, liên hệ" },
  { href: "/adminbp/thu-vien", label: "Thư viện", desc: "Album studio" },
  { href: "/adminbp/kho-anh", label: "Kho ảnh", desc: "Supabase Storage" },
];

export function Dashboard() {
  const cms = useCms();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    fetch("/api/adminbp/status", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setStatus(d);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="adminbp-dash">
      <h1>Bảng điều khiển</h1>
      <nav className="adminbp-quick">
        {QUICK.map((item) => (
            <Link key={`${item.href}-${item.label}`} className={`adminbp-quick-card is-${item.tone}`} to={item.href}>
              <span className="adminbp-quick-ico" aria-hidden />
              <strong>{item.label}</strong>
              <small>{item.desc}</small>
            </Link>
        ))}
      </nav>
      <div className="adminbp-status-grid">
        <article className={`adminbp-status-card ${status?.supabase?.ok ? "is-ok" : ""}`}>
          <small>Supabase</small>
          <strong>
            {status?.supabase?.ok ? "Đã kết nối" : status?.supabase?.configured ? "Lỗi schema" : "Chưa cấu hình"}
          </strong>
          <span>{status?.supabase?.error || "CMS JSON lưu bảng cms_docs"}</span>
        </article>
        <article className={`adminbp-status-card ${status?.storage?.ok ? "is-ok" : ""}`}>
          <small>Supabase Storage</small>
          <strong>{status?.storage?.ok ? "Đã kết nối" : "Chưa cấu hình"}</strong>
          <span>{status?.storage?.bucket || status?.storage?.error || "Kho ảnh / video"}</span>
        </article>
        <article className="adminbp-status-card is-ok">
          <small>Nội dung</small>
          <strong>
            {cms.counts.projects} mẫu · {cms.counts.news} tin
          </strong>
          <span>{cms.counts.bookings} yêu cầu đặt lịch</span>
        </article>
      </div>
      <h2 className="adminbp-dash-sub">Quản lý nội dung</h2>
      <nav className="adminbp-shortcuts">
        {LINKS.map((item) => (
          <Link key={item.href} to={item.href}>
            <strong>{item.label}</strong>
            <small>{item.desc}</small>
          </Link>
        ))}
      </nav>
      <div className="adminbp-item-actions" style={{ marginTop: 20 }}>
        <button
          type="button"
          onClick={() => {
            const blob = new Blob([exportCms()], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "vietdungphat-cms.json";
            a.click();
          }}
        >
          Xuất JSON
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}>
          Nhập JSON
        </button>
        <button
          type="button"
          className="danger"
          onClick={() => {
            if (confirm("Xóa toàn bộ chỉnh sửa CMS trên Supabase và khôi phục nội dung gốc?")) {
              resetCms();
              flushCms()
                .then(() => setMessage("Đã khôi phục nội dung gốc"))
                .catch((err) => setMessage(err.message || "Khôi phục local, chưa ghi được Supabase"));
            }
          }}
        >
          Khôi phục gốc
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            file.text().then(async (t) => {
              importCms(t);
              try {
                await flushCms();
                setMessage("Đã nhập dữ liệu CMS");
              } catch (err) {
                setMessage(err.message || "Đã nhập local, chưa ghi được Supabase");
              }
            });
          }}
        />
      </div>
      {message ? <p className="adminbp-dash-msg">{message}</p> : null}
    </div>
  );
}

export function SettingsEditor() {
  const cms = useCms();
  const [site, setSite] = useState(cms.site);
  const [message, setMessage] = useState("");
  const map = site.map || { lat: "", lng: "" };

  useEffect(() => {
    setSite(cms.site);
  }, [cms.site]);

  function set(key, value) {
    setSite((s) => ({ ...s, [key]: value }));
  }

  return (
    <>
      <div className="adminbp-page-head">
        <h1>Cài đặt website</h1>
        <p>Hotline, địa chỉ, hồ sơ năng lực và mạng xã hội — hiện trên header, footer và liên hệ.</p>
      </div>
      <div className="adminbp-form">
        <div className="adminbp-grid">
          <Field label="Tên công ty" value={site.name} onChange={(v) => set("name", v)} />
          <Field label="Tên ngắn" value={site.shortName} onChange={(v) => set("shortName", v)} />
          <Field label="Tagline" value={site.tagline} onChange={(v) => set("tagline", v)} span2 />
          <Field label="Hotline" value={site.hotline} onChange={(v) => set("hotline", v)} />
          <Field label="Điện thoại" value={site.phone} onChange={(v) => set("phone", v)} />
          <Field label="Email" value={site.email} onChange={(v) => set("email", v)} />
          <Field label="Zalo" value={site.zalo} onChange={(v) => set("zalo", v)} />
          <Field label="Facebook" value={site.facebook} onChange={(v) => set("facebook", v)} />
          <Field label="Messenger" value={site.messenger} onChange={(v) => set("messenger", v)} />
          <Field label="YouTube" value={site.youtube} onChange={(v) => set("youtube", v)} />
          <Field label="Hồ sơ PDF" value={site.profilePdf} onChange={(v) => set("profilePdf", v)} />
          <Field label="Địa chỉ" value={site.address} onChange={(v) => set("address", v)} span2 />
          <Field label="Showroom" value={site.showroom} onChange={(v) => set("showroom", v)} span2 />
          <Field label="Xưởng" value={site.workshop} onChange={(v) => set("workshop", v)} span2 />
          <Field label="Map lat" value={String(map.lat || "")} onChange={(v) => set("map", { ...map, lat: Number(v) || v })} />
          <Field label="Map lng" value={String(map.lng || "")} onChange={(v) => set("map", { ...map, lng: Number(v) || v })} />
          <ImageField label="Logo" value={site.logo} onChange={(v) => set("logo", v)} />
          <ImageField label="Ảnh giới thiệu" value={site.aboutImage} onChange={(v) => set("aboutImage", v)} />
          <Field label="HTML giới thiệu gốc" value={site.aboutHtml} onChange={(v) => set("aboutHtml", v)} multiline rows={10} span2 />
        </div>
        <SaveBar
          message={message}
          onSave={() => {
            patchCms({ site });
            setMessage("Đã lưu cài đặt");
          }}
        />
      </div>
    </>
  );
}

export function HomeEditor() {
  const cms = useCms();
  const [home, setHome] = useState(cms.home);
  const [stats, setStats] = useState(cms.stats);
  const [core, setCore] = useState(cms.coreServices);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setHome(cms.home);
    setStats(cms.stats);
    setCore(cms.coreServices);
  }, [cms.home, cms.stats, cms.coreServices]);

  function set(key, value) {
    setHome((h) => ({ ...h, [key]: value }));
  }

  return (
    <>
      <div className="adminbp-page-head">
        <h1>Trang chủ</h1>
        <p>Video hero, khối dịch vụ, giới thiệu và thống kê.</p>
      </div>
      <div className="adminbp-form">
        <div className="adminbp-grid">
          <Field label="Kicker hero" value={home.kicker} onChange={(v) => set("kicker", v)} />
          <Field label="Video hero (URL)" value={home.video} onChange={(v) => set("video", v)} />
          <Field label="Dòng tiêu đề 1" value={home.title1} onChange={(v) => set("title1", v)} />
          <Field label="Dòng tiêu đề 2" value={home.title2} onChange={(v) => set("title2", v)} />
          <ImageField label="Poster video" value={home.poster} onChange={(v) => set("poster", v)} />
          <Field label="Nút CTA 1" value={home.cta1} onChange={(v) => set("cta1", v)} />
          <Field label="Nút CTA 2" value={home.cta2} onChange={(v) => set("cta2", v)} />
          <Field label="Tiêu đề dịch vụ" value={home.servicesTitle} onChange={(v) => set("servicesTitle", v)} multiline rows={2} />
          <Field label="Mô tả dịch vụ" value={home.servicesLead} onChange={(v) => set("servicesLead", v)} multiline rows={4} span2 />
          <Field label="Tiêu đề về chúng tôi" value={home.aboutTitle} onChange={(v) => set("aboutTitle", v)} multiline rows={2} />
          <Field label="Đoạn giới thiệu" value={home.aboutLead} onChange={(v) => set("aboutLead", v)} multiline rows={5} span2 />
          <Field label="Ảnh collage (mỗi dòng 1 URL)" value={(home.aboutImages || []).join("\n")} onChange={(v) => set("aboutImages", v.split("\n").map((s) => s.trim()).filter(Boolean))} multiline span2 />
          <ImageField label="Ảnh đặt lịch" value={home.bookingImage} onChange={(v) => set("bookingImage", v)} />
          <Field label="Tiêu đề đặt lịch" value={home.bookingTitle} onChange={(v) => set("bookingTitle", v)} multiline rows={2} />
          <Field label="Mô tả đặt lịch" value={home.bookingLead} onChange={(v) => set("bookingLead", v)} multiline rows={3} span2 />
          <Field label="Footer" value={home.footerBlurb} onChange={(v) => set("footerBlurb", v)} multiline span2 />
        </div>
        <CardList
          title="3 dịch vụ cốt lõi"
          onAdd={() => setCore((list) => [...list, { title: "Dịch vụ mới", slug: "dich-vu-moi", href: "/dich-vu", image: "/studio/01.jpg", desc: "" }])}
        >
          {core.map((item, i) => (
            <article key={i} className="adminbp-item">
              <div className="adminbp-grid">
                <Field label="Tên" value={item.title} onChange={(v) => setCore(core.map((x, n) => (n === i ? { ...x, title: v } : x)))} />
                <Field label="Link" value={item.href} onChange={(v) => setCore(core.map((x, n) => (n === i ? { ...x, href: v } : x)))} />
                <ImageField label="Ảnh" value={item.image} onChange={(v) => setCore(core.map((x, n) => (n === i ? { ...x, image: v } : x)))} />
                <Field label="Mô tả" value={item.desc} onChange={(v) => setCore(core.map((x, n) => (n === i ? { ...x, desc: v } : x)))} multiline />
              </div>
              <ItemActions
                onUp={() => setCore(moveItem(core, i, -1))}
                onDown={() => setCore(moveItem(core, i, 1))}
                onRemove={() => setCore(core.filter((_, n) => n !== i))}
              />
            </article>
          ))}
        </CardList>
        <CardList title="Thống kê">
          {stats.map((item, i) => (
            <article key={i} className="adminbp-item">
              <div className="adminbp-grid">
                <Field label="Số" value={item.value} onChange={(v) => setStats(stats.map((x, n) => (n === i ? { ...x, value: v } : x)))} />
                <Field label="Nhãn" value={item.label} onChange={(v) => setStats(stats.map((x, n) => (n === i ? { ...x, label: v } : x)))} />
              </div>
            </article>
          ))}
        </CardList>
        <SaveBar
          message={message}
          onSave={() => {
            patchCms({ home, stats, coreServices: core });
            setMessage("Đã lưu trang chủ");
          }}
        />
      </div>
    </>
  );
}

const KIND_META = {
  news: { list: "Danh sách Tin tức", edit: "Chỉnh sửa Tin tức", group: "Quản lý bài viết", cat: "Tin tức" },
  projects: { list: "Danh sách Công trình", edit: "Chỉnh sửa Công trình", group: "Quản lý bài viết", cat: "Công trình" },
  products: { list: "Danh sách Sản phẩm", edit: "Chỉnh sửa Sản phẩm", group: "Quản lý trang tĩnh", cat: "Sản phẩm" },
  services: { list: "Danh sách Dịch vụ", edit: "Chỉnh sửa Dịch vụ", group: "Quản lý bài viết", cat: "Dịch vụ" },
};

function emptyDraft() {
  return {
    slug: "",
    title: "",
    image: "",
    date: new Date().toLocaleDateString("vi-VN"),
    html: "",
    desc: "",
    seoTitle: "",
    seoKeywords: "",
    seoKeyword: "",
    seoDesc: "",
    imageAlt: "",
    sortOrder: 1,
    lockSlug: false,
    visible: true,
    featured: false,
    noindex: false,
    gallery: [],
    galleryText: "",
  };
}

function postToDraft(item) {
  if (!item) return emptyDraft();
  return {
    ...emptyDraft(),
    ...item,
    desc: item.desc || "",
    seoTitle: item.seoTitle || "",
    seoKeywords: item.seoKeywords || "",
    seoKeyword: item.seoKeyword || "",
    imageAlt: item.imageAlt || item.seoKeyword || item.title || "",
    sortOrder: item.sortOrder ?? 1,
    lockSlug: true,
    visible: item.visible !== false,
    featured: !!item.featured,
    noindex: !!item.noindex,
    galleryText: (item.gallery || []).join("\n"),
  };
}

function draftToPost(draft) {
  const slug = draft.slug || slugify(draft.title);
  const { galleryText, ...rest } = draft;
  return {
    ...rest,
    slug,
    gallery: (galleryText || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
  };
}

export function PostsEditor({ kind, title, hint }) {
  const cms = useCms();
  const items = cms[kind] || [];
  const meta = KIND_META[kind] || { list: title, edit: `Cập nhật ${title}`, group: "Quản lý bài viết", cat: title };
  const listPath = { news: "/adminbp/tin-tuc", projects: "/adminbp/mau-nha", products: "/adminbp/san-pham", services: "/adminbp/dich-vu" }[kind];
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [tab, setTab] = useState("vi");
  const [seoTab, setSeoTab] = useState("vi");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const filtered = useMemo(
    () => items.filter((p) => !q || `${p.title} ${p.slug}`.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );
  const perPage = 10;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const rows = filtered.slice((page - 1) * perPage, page * perPage);

  function open(item) {
    const next = postToDraft(item);
    setDraft(next);
    setOrigin(next);
    setTab("vi");
    setSeoTab("vi");
    setMessage("");
  }

  function setTitle(v) {
    setDraft((d) => ({
      ...d,
      title: v,
      slug: d.lockSlug ? d.slug : slugify(v),
      seoKeyword: d.seoKeyword || v,
      seoTitle: d.seoTitle || v,
      imageAlt: d.imageAlt || v,
    }));
  }

  async function persistDraft(stay) {
    if (!draft?.title?.trim()) {
      setMessage("Nhập tiêu đề");
      setTab("vi");
      return;
    }
    setSaving(true);
    try {
      savePost(kind, draftToPost(draft));
      await flushCms();
      setMessage("Đã lưu bài viết");
      if (!stay) setDraft(null);
    } catch (err) {
      setMessage(err.message || "Lưu thất bại. Kiểm tra đăng nhập và Supabase.");
    } finally {
      setSaving(false);
    }
  }

  if (draft) {
    const seoTitle = draft.seoTitle || draft.title;
    const seoDesc = draft.seoDesc || draft.desc;
    const rm = analyzeRankMath(draft);
    return (
      <div className="adminbp-cazo">
        <EditToolbar
          crumbs={[
            { to: "/adminbp", label: "Bảng điều khiển" },
            { label: meta.edit },
          ]}
          saving={saving}
          message={message}
          onSave={() => persistDraft(false)}
          onSaveStay={() => persistDraft(true)}
          onReset={() => {
            setDraft(origin || emptyDraft());
            setMessage("");
          }}
          onExit={() => setDraft(null)}
        />

        <section className="adminbp-vcard">
          <h2>Đường dẫn</h2>
          <SwitchField
            label="Thay đổi đường dẫn theo tiêu đề mới:"
            checked={!draft.lockSlug}
            onChange={(v) => setDraft({ ...draft, lockSlug: !v, slug: !v ? draft.slug : slugify(draft.title) })}
          />
          <p className="adminbp-slug-sample">
            Đường dẫn mẫu (vi): https://www.vietdungphat.com/{draft.slug || slugify(draft.title)}
          </p>
          <Field label="Link đường dẫn (vi)" value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: v, lockSlug: true })} />
        </section>

        <section className="adminbp-vcard">
          <h2>Nội dung {meta.cat}</h2>
          <Tabs value={tab} onChange={setTab} tabs={[{ id: "vi", label: "Tiếng Việt" }]} />
          <Field label="Tiêu đề (vi):" value={draft.title} onChange={setTitle} />
          <Field label="Mô tả (vi):" value={draft.desc} onChange={(v) => setDraft({ ...draft, desc: v, seoDesc: draft.seoDesc || v })} multiline rows={5} />
          <button
            type="button"
            className="adminbp-pill is-ghost"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                html: seoArticleHtml({ title: d.title, keyword: d.seoKeyword || d.title }),
                seoKeyword: d.seoKeyword || d.title,
                seoTitle: d.seoTitle || d.title,
                seoDesc: d.seoDesc || d.desc,
              }))
            }
          >
            Chèn form bài SEO
          </button>
          <HtmlEditor label="Nội dung (vi):" value={draft.html} onChange={(v) => setDraft({ ...draft, html: v })} />
        </section>

        <section className="adminbp-vcard">
          <h2>Hình ảnh {meta.cat}</h2>
          <CazoDropzone value={draft.image} onChange={(v) => setDraft({ ...draft, image: v })} />
          <Field label="Alt hình (vi):" value={draft.imageAlt} onChange={(v) => setDraft({ ...draft, imageAlt: v })} />
          <Field
            label="Album (mỗi dòng 1 URL)"
            value={draft.galleryText}
            onChange={(v) => setDraft({ ...draft, galleryText: v })}
            multiline
            rows={4}
          />
        </section>

        <section className="adminbp-vcard">
          <h2>Thông tin {meta.cat}</h2>
          <div className="adminbp-info-row">
            <Field label="Số thứ tự" type="number" value={String(draft.sortOrder ?? 1)} onChange={(v) => setDraft({ ...draft, sortOrder: Number(v) || 0 })} />
            <Field label="Ngày đăng" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v })} />
          </div>
          <div className="adminbp-flags">
            <SwitchField label="Hiển thị" checked={draft.visible} onChange={(v) => setDraft({ ...draft, visible: v })} />
            <SwitchField label="Nổi bật" checked={draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} />
          </div>
        </section>

        <section className="adminbp-vcard">
          <h2>Nội dung SEO</h2>
          <Tabs
            value={seoTab}
            onChange={setSeoTab}
            tabs={[
              { id: "vi", label: "Tiếng Việt" },
              { id: "robots", label: "Robots meta tag" },
            ]}
          />
          {seoTab === "vi" ? (
            <>
              <Field label="SEO Title (vi):" value={draft.seoTitle} onChange={(v) => setDraft({ ...draft, seoTitle: v })} />
              <small className={`adminbp-seo-count${rm.titleLen > 60 ? " is-over" : ""}`}>{rm.titleLen}/60 ký tự SERP</small>
              <Field label="Secondary keywords (vi):" value={draft.seoKeywords} onChange={(v) => setDraft({ ...draft, seoKeywords: v })} />
              <Field label="SEO Description (vi):" value={draft.seoDesc} onChange={(v) => setDraft({ ...draft, seoDesc: v })} multiline rows={4} />
              <small className={`adminbp-seo-count${rm.descLen > 160 ? " is-over" : ""}`}>{rm.descLen}/160 ký tự SERP</small>
              <Field label="Focus Keyword (vi):" value={draft.seoKeyword} onChange={(v) => setDraft({ ...draft, seoKeyword: v })} />
              <div className={`adminbp-rm-score is-${rm.score >= 80 ? "good" : rm.score >= 50 ? "ok" : "bad"}`}>
                <strong>{rm.score}</strong>
                <span>/100 Rank Math</span>
              </div>
              {rm.groups.map((group) => (
                <section key={group.id} className="adminbp-rm-group">
                  <h3>{group.label}</h3>
                  <ul className="adminbp-seo-checks">
                    {group.items.map((c) => (
                      <li key={c.text} className={c.warn ? "is-warn" : c.ok || (c.partial || 0) > 0 ? "is-ok" : "is-bad"}>
                        {c.text}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              <article className="adminbp-seo-preview">
                <small>Khi lên top, page này sẽ hiển thị theo dạng mẫu như sau:</small>
                <a href={`/${draft.slug || ""}`} target="_blank" rel="noreferrer">
                  {seoTitle || "Tiêu đề bài viết"}
                </a>
                <em>https://www.vietdungphat.com/{draft.slug || ""}</em>
                <p>{seoDesc || "Mô tả hiển thị trên Google khi bài được index."}</p>
              </article>
            </>
          ) : (
            <div className="adminbp-flags">
              <SwitchField label="Index" checked={!draft.noindex} onChange={(v) => setDraft({ ...draft, noindex: !v })} />
              <SwitchField label="No Index" checked={draft.noindex} onChange={(v) => setDraft({ ...draft, noindex: v })} />
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="adminbp-edit">
      <div className="adminbp-edit-toolbar">
        <div className="adminbp-edit-toolbar-row">
          <h1>{meta.list}</h1>
          <div className="adminbp-edit-tools">
            <button type="button" className="adminbp-pill is-gold" onClick={() => open(null)}>
              Thêm mới
            </button>
          </div>
        </div>
        <Crumbs
          items={[
            { to: "/adminbp", label: "Bảng điều khiển" },
            { label: meta.group },
            { label: meta.list },
          ]}
        />
        <p className="adminbp-edit-hint">{hint}</p>
      </div>
      <section className="adminbp-edit-card">
        <form
          className="adminbp-list-search"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
          }}
        >
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Tìm kiếm nhanh" />
          <button type="submit" className="adminbp-btn is-muted">
            Tìm
          </button>
        </form>
        <div className="adminbp-table-wrap">
          <table className="adminbp-table">
            <thead>
              <tr>
                <th className="is-check">#</th>
                <th className="is-thumb">Hình</th>
                <th>Tiêu đề</th>
                <th>Hiển thị</th>
                <th>Nổi bật</th>
                <th className="is-act">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((item, i) => (
                  <tr key={item.slug}>
                    <td className="is-check">{(page - 1) * perPage + i + 1}</td>
                    <td className="is-thumb">
                      {item.image ? <SmartImg src={item.image} alt="" /> : <div className="adminbp-image-empty" />}
                    </td>
                    <td>
                      <button type="button" className="adminbp-table-title" onClick={() => open(item)}>
                        {item.title}
                      </button>
                      <small>/{item.slug}</small>
                    </td>
                    <td>{item.visible === false ? "Ẩn" : "Hiện"}</td>
                    <td>{item.featured ? "Có" : "—"}</td>
                    <td className="is-act">
                      <ItemActions
                        onView={item.slug ? `/${item.slug}` : undefined}
                        onEdit={() => open(item)}
                        onRemove={() => removePost(kind, item.slug)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>Không có bài viết.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pages > 1 ? (
          <nav className="adminbp-pager">
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} type="button" className={page === i + 1 ? "active" : undefined} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
          </nav>
        ) : null}
      </section>
    </div>
  );
}

export function PricingEditor() {
  const cms = useCms();
  const [packs, setPacks] = useState(cms.pricePacks);
  const [page, setPage] = useState(cms.pages.pricing);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setPacks(cms.pricePacks);
    setPage(cms.pages.pricing);
  }, [cms.pricePacks, cms.pages.pricing]);
  return (
    <>
      <div className="adminbp-page-head">
        <h1>Bảng báo giá</h1>
        <p>Ba gói phần thô / hoàn thiện / trọn gói trên trang Báo giá.</p>
      </div>
      <div className="adminbp-form">
        <div className="adminbp-grid">
          <Field label="Tiêu đề trang" value={page.title} onChange={(v) => setPage({ ...page, title: v })} />
          <Field label="Mô tả" value={page.lead} onChange={(v) => setPage({ ...page, lead: v })} multiline span2 />
        </div>
        <CardList title="Gói giá" onAdd={() => setPacks([...packs, { tag: "Gói mới", icon: "home", title: "Gói mới", price: "", lead: "", points: [], href: "/bao-gia", image: "/studio/01.jpg" }])}>
          {packs.map((item, i) => (
            <article key={i} className="adminbp-item">
              <div className="adminbp-grid">
                <Field label="Tên gói" value={item.title} onChange={(v) => setPacks(packs.map((x, n) => (n === i ? { ...x, title: v } : x)))} />
                <Field label="Giá" value={item.price} onChange={(v) => setPacks(packs.map((x, n) => (n === i ? { ...x, price: v } : x)))} />
                <Field label="Nhãn" value={item.tag} onChange={(v) => setPacks(packs.map((x, n) => (n === i ? { ...x, tag: v } : x)))} />
                <Field label="Link" value={item.href} onChange={(v) => setPacks(packs.map((x, n) => (n === i ? { ...x, href: v } : x)))} />
                <ImageField label="Ảnh" value={item.image} onChange={(v) => setPacks(packs.map((x, n) => (n === i ? { ...x, image: v } : x)))} />
                <Field label="Mô tả" value={item.lead} onChange={(v) => setPacks(packs.map((x, n) => (n === i ? { ...x, lead: v } : x)))} multiline />
                <Field
                  label="Điểm (mỗi dòng 1 ý)"
                  value={(item.points || []).join("\n")}
                  onChange={(v) => setPacks(packs.map((x, n) => (n === i ? { ...x, points: v.split("\n").map((s) => s.trim()).filter(Boolean) } : x)))}
                  multiline
                  span2
                />
              </div>
              <ItemActions onUp={() => setPacks(moveItem(packs, i, -1))} onDown={() => setPacks(moveItem(packs, i, 1))} onRemove={() => setPacks(packs.filter((_, n) => n !== i))} />
            </article>
          ))}
        </CardList>
        <SaveBar
          message={message}
          onSave={() => {
            patchCms({ pricePacks: packs, pages: { ...cms.pages, pricing: page } });
            setMessage("Đã lưu báo giá");
          }}
        />
      </div>
    </>
  );
}

export function PagesEditor() {
  const cms = useCms();
  const [pages, setPages] = useState(cms.pages);
  const [listsMeta, setListsMeta] = useState({
    projects: { title: cms.lists.projects.title, intro: cms.lists.projects.intro },
    products: { title: cms.lists.products.title, intro: cms.lists.products.intro },
    services: { title: cms.lists.services.title, intro: cms.lists.services.intro },
    news: { title: cms.lists.news.title, intro: cms.lists.news.intro },
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    setPages(cms.pages);
    setListsMeta({
      projects: { title: cms.lists.projects.title, intro: cms.lists.projects.intro },
      products: { title: cms.lists.products.title, intro: cms.lists.products.intro },
      services: { title: cms.lists.services.title, intro: cms.lists.services.intro },
      news: { title: cms.lists.news.title, intro: cms.lists.news.intro },
    });
  }, [cms.pages, cms.lists]);
  const keys = [
    ["about", "Giới thiệu"],
    ["services", "Dịch vụ"],
    ["contact", "Liên hệ"],
    ["loban", "Thước lỗ ban"],
  ];
  return (
    <>
      <div className="adminbp-page-head">
        <h1>Trang nội dung</h1>
        <p>Hero và mô tả các trang tĩnh.</p>
      </div>
      <div className="adminbp-form">
        {keys.map(([key, label]) => (
          <article key={key} className="adminbp-item">
            <h2>{label}</h2>
            <div className="adminbp-grid">
              <Field label="Kicker" value={pages[key].kicker} onChange={(v) => setPages({ ...pages, [key]: { ...pages[key], kicker: v } })} />
              <Field label="Tiêu đề" value={pages[key].title} onChange={(v) => setPages({ ...pages, [key]: { ...pages[key], title: v } })} />
              <Field label="Mô tả" value={pages[key].lead} onChange={(v) => setPages({ ...pages, [key]: { ...pages[key], lead: v } })} multiline span2 />
              {key === "about" ? (
                <ImageField label="Ảnh" value={pages.about.image} onChange={(v) => setPages({ ...pages, about: { ...pages.about, image: v } })} />
              ) : null}
            </div>
          </article>
        ))}
        <CardList title="Tiêu đề danh mục">
          {Object.entries(listsMeta).map(([key, val]) => (
            <article key={key} className="adminbp-item">
              <div className="adminbp-grid">
                <Field label={key} value={val.title} onChange={(v) => setListsMeta({ ...listsMeta, [key]: { ...val, title: v } })} />
                <Field label="Intro" value={val.intro} onChange={(v) => setListsMeta({ ...listsMeta, [key]: { ...val, intro: v } })} multiline />
              </div>
            </article>
          ))}
        </CardList>
        <SaveBar
          message={message}
          onSave={() => {
            patchCms({ pages, listsMeta });
            setMessage("Đã lưu trang");
          }}
        />
      </div>
    </>
  );
}

export function StudioEditor() {
  const cms = useCms();
  const [studio, setStudio] = useState(cms.studio);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStudio(cms.studio);
  }, [cms.studio]);
  return (
    <>
      <div className="adminbp-page-head">
        <h1>Thư viện ảnh</h1>
        <p>Album studio trên trang chủ và Mẫu nhà.</p>
      </div>
      <div className="adminbp-form">
        <CardList title="Album" onAdd={() => setStudio([...studio, { src: "/studio/01.jpg", title: "Công trình mới" }])}>
          {studio.map((item, i) => (
            <article key={i} className="adminbp-item">
              <div className="adminbp-grid">
                <ImageField label="Ảnh" value={item.src} onChange={(v) => setStudio(studio.map((x, n) => (n === i ? { ...x, src: v } : x)))} />
                <Field label="Tiêu đề" value={item.title} onChange={(v) => setStudio(studio.map((x, n) => (n === i ? { ...x, title: v } : x)))} />
              </div>
              <ItemActions onUp={() => setStudio(moveItem(studio, i, -1))} onDown={() => setStudio(moveItem(studio, i, 1))} onRemove={() => setStudio(studio.filter((_, n) => n !== i))} />
            </article>
          ))}
        </CardList>
        <SaveBar
          message={message}
          onSave={() => {
            patchCms({ studio });
            setMessage("Đã lưu thư viện");
          }}
        />
      </div>
    </>
  );
}

export function ReviewsEditor() {
  const cms = useCms();
  const [reviews, setReviews] = useState(cms.reviews);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setReviews(cms.reviews);
  }, [cms.reviews]);
  return (
    <>
      <div className="adminbp-page-head">
        <h1>Đánh giá khách hàng</h1>
        <p>Khối nhận xét trên trang chủ.</p>
      </div>
      <div className="adminbp-form">
        <CardList title="Đánh giá" onAdd={() => setReviews([...reviews, { name: "", place: "", quote: "" }])}>
          {reviews.map((item, i) => (
            <article key={i} className="adminbp-item">
              <div className="adminbp-grid">
                <Field label="Tên" value={item.name} onChange={(v) => setReviews(reviews.map((x, n) => (n === i ? { ...x, name: v } : x)))} />
                <Field label="Nơi" value={item.place} onChange={(v) => setReviews(reviews.map((x, n) => (n === i ? { ...x, place: v } : x)))} />
                <Field label="Nội dung" value={item.quote} onChange={(v) => setReviews(reviews.map((x, n) => (n === i ? { ...x, quote: v } : x)))} multiline span2 />
              </div>
              <ItemActions onRemove={() => setReviews(reviews.filter((_, n) => n !== i))} />
            </article>
          ))}
        </CardList>
        <SaveBar
          message={message}
          onSave={() => {
            patchCms({ reviews });
            setMessage("Đã lưu đánh giá");
          }}
        />
      </div>
    </>
  );
}

export function BookingsEditor() {
  const cms = useCms();
  const bookings = cms.bookings.filter((b) => b.name || b.phone);
  return (
    <>
      <div className="adminbp-page-head">
        <h1>Đặt lịch</h1>
        <p>Yêu cầu khách gửi từ form website, lưu trên Supabase.</p>
      </div>
      <div className="adminbp-form">
        <CardList title={`${bookings.length} yêu cầu`}>
          {bookings.length ? (
            bookings.map((b) => (
              <article key={b.id} className="adminbp-item">
                <strong>
                  {b.name} — {b.phone}
                </strong>
                <small>
                  {b.need} · {b.date} {b.slot} · {b.email}
                </small>
                <p>{b.note}</p>
                <ItemActions onRemove={() => removeBooking(b.id)} />
              </article>
            ))
          ) : (
            <p>Chưa có yêu cầu đặt lịch.</p>
          )}
        </CardList>
      </div>
    </>
  );
}

export function MediaEditor() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/adminbp/media", { credentials: "include" });
    const data = await res.json();
    if (res.ok && data.ok) setItems(data.data || []);
    else setMessage(data.error || "Không tải được kho ảnh");
  }

  useEffect(() => {
    load().catch(() => setMessage("Không kết nối được máy chủ"));
  }, []);

  async function onUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await uploadAdminFile(file);
      setMessage("Đã tải lên Supabase Storage");
      await load();
    } catch (err) {
      setMessage(err.message || "Upload thất bại");
    }
  }

  return (
    <>
      <div className="adminbp-page-head">
        <h1>Kho ảnh</h1>
        <p>File lưu Supabase Storage, URL dùng trong bài viết và các khối website.</p>
      </div>
      <div className="adminbp-upload">
        <div>
          <h2>Tải ảnh / video</h2>
          <p>JPG, PNG, WebP, MP4, PDF — ảnh poster được nén tự động; video tối đa 50MB.</p>
        </div>
        <label className="adminbp-upload-btn">
          Chọn file
          <input type="file" accept="image/*,video/mp4,application/pdf" onChange={onUpload} />
        </label>
      </div>
      {message ? <p className="adminbp-dash-msg">{message}</p> : null}
      <ul className="adminbp-media-grid">
        {items.map((m) => (
          <li key={m.id}>
            {String(m.type || "").startsWith("video") ? <video src={m.url} muted /> : <img src={m.url} alt={m.name} />}
            <small>{m.name}</small>
            <ItemActions
              onEdit={() => navigator.clipboard.writeText(m.url)}
              onRemove={async () => {
                const qs = new URLSearchParams({ id: m.id });
                if (m.key) qs.set("key", m.key);
                await fetch(`/api/adminbp/media?${qs}`, { method: "DELETE", credentials: "include" });
                await load();
              }}
            />
          </li>
        ))}
      </ul>
    </>
  );
}

export function AccountEditor() {
  return (
    <>
      <div className="adminbp-page-head">
        <h1>Tài khoản</h1>
        <p>Đăng nhập /adminbp dùng biến môi trường trên Vercel.</p>
      </div>
      <div className="adminbp-form">
        <article className="adminbp-item">
          <div className="adminbp-grid">
            <Field label="Tài khoản" value="admin" onChange={() => {}} />
            <Field label="Mật khẩu" value="" onChange={() => {}} type="password" />
          </div>
          <p>Tài khoản đăng nhập: admin. Đổi mật khẩu bằng biến ADMINBP_PASSWORD trên máy local / Vercel.</p>
        </article>
      </div>
    </>
  );
}

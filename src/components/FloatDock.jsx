import { useCms } from "../lib/cms.js";

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      />
    </svg>
  );
}

function IconMessenger() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.22V22l3.32-1.82c1.12.31 2.32.48 3.54.48 5.64 0 10-4.13 10-9.96C22 6.13 17.64 2 12 2zm1.01 12.41L10.5 11.8 6.5 14.2l4.43-4.7 2.55 2.61 3.96-2.61-4.43 4.91z"
      />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z"
      />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.2C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.2c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.2A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.8 15.5v-7l6.3 3.5-6.3 3.5z"
      />
    </svg>
  );
}

function DockBtn({ className, href, title, children, external }) {
  return (
    <a
      className={`dock-btn ${className}`}
      href={href}
      title={title}
      aria-label={title}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <span className="alo-circle" aria-hidden="true" />
      <span className="alo-fill" aria-hidden="true" />
      <i className="shake-anim">{children}</i>
    </a>
  );
}

export default function FloatDock() {
  const { site } = useCms();
  const tel = String(site.phone || "").replace(/\./g, "");
  const facebook = site.facebook || "https://www.facebook.com/vietdungphatphat/";
  const youtube = site.youtube || "https://www.youtube.com/@ConstructionVietdungphat";
  return (
    <>
      <div className="float-dock" aria-label="Liên hệ nhanh">
        <DockBtn className="dock-phone" href={`tel:${tel}`} title="Gọi điện">
          <IconPhone />
        </DockBtn>
        <DockBtn className="dock-zalo" href={site.zalo || `https://zalo.me/${tel}`} title="Chat Zalo" external>
          <img src="/zalo.png" alt="" />
        </DockBtn>
        <DockBtn className="dock-msg" href={site.messenger || facebook} title="Messenger" external>
          <IconMessenger />
        </DockBtn>
        <DockBtn className="dock-fb" href={facebook} title="Fanpage Facebook" external>
          <IconFacebook />
        </DockBtn>
        <DockBtn className="dock-yt" href={youtube} title="YouTube" external>
          <IconYouTube />
        </DockBtn>
      </div>
      <a className="float-consult" href={`tel:${tel}`} aria-label={`Gọi ${site.phone}`}>
        {site.phone}
      </a>
    </>
  );
}

import { useCms } from "../lib/cms.js";

export default function FloatDock() {
  const { site } = useCms();
  const tel = String(site.phone || "").replace(/\./g, "");
  return (
    <>
      <div className="float-dock" aria-label="Liên hệ nhanh">
        <a className="dock-btn dock-phone" href={`tel:${tel}`} title="Gọi điện">
          <span className="alo-circle" aria-hidden="true" />
          <span className="alo-fill" aria-hidden="true" />
          <i className="shake-anim">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              />
            </svg>
          </i>
        </a>
        <a className="dock-btn dock-zalo" href={site.zalo} target="_blank" rel="noreferrer" title="Chat Zalo">
          <span className="alo-circle" aria-hidden="true" />
          <span className="alo-fill" aria-hidden="true" />
          <i className="shake-anim">
            <img src="/zalo.png" alt="" />
          </i>
        </a>
        <a className="dock-btn dock-msg" href={site.messenger || site.facebook} target="_blank" rel="noreferrer" title="Messenger">
          <span className="alo-circle" aria-hidden="true" />
          <span className="alo-fill" aria-hidden="true" />
          <i className="shake-anim">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.22V22l3.32-1.82c1.12.31 2.32.48 3.54.48 5.64 0 10-4.13 10-9.96C22 6.13 17.64 2 12 2zm1.01 12.41L10.5 11.8 6.5 14.2l4.43-4.7 2.55 2.61 3.96-2.61-4.43 4.91z"
              />
            </svg>
          </i>
        </a>
      </div>
      <a className="float-consult" href={`tel:${tel}`} aria-label={`Gọi ${site.phone}`}>
        {site.phone}
      </a>
    </>
  );
}

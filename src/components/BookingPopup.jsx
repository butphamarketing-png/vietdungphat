import { useEffect, useId, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCms } from "../lib/cms.js";
import { BookingForm } from "./BookingCta.jsx";

const KEY = "vdp-booking-popup";
const SKIP = ["/lien-he", "/bao-gia", "/thuoc-lo-ban"];

export default function BookingPopup() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { home } = useCms();

  useEffect(() => {
    if (sessionStorage.getItem(KEY) === "1") return;
    if (SKIP.includes(pathname)) return;
    const t = window.setTimeout(() => setOpen(true), 4800);
    return () => window.clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.body.classList.add("is-popup-open");
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("is-popup-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    sessionStorage.setItem(KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="booking-popup-layer">
      <button className="booking-popup-mask" aria-label="Đóng popup" onClick={close} />
      <div className="booking-popup" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" className="booking-popup-close" onClick={close} aria-label="Đóng">
          ×
        </button>
        <img className="booking-popup-photo" src={home.bookingImage || "/villas/neo-05.jpg"} alt="Biệt thự tân cổ điển Việt Dũng Phát" />
        <BookingForm titleId={titleId} />
      </div>
    </div>
  );
}

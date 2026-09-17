import { useEffect, useState } from "react";
import { BookingForm } from "./BookingCta.jsx";

const KEY = "vdp-booking-popup";

export default function BookingPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(KEY) === "1") return;
    const t = window.setTimeout(() => setOpen(true), 1400);
    return () => window.clearTimeout(t);
  }, []);

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
      <div className="booking-popup" role="dialog" aria-modal="true" aria-labelledby="booking-form-title">
        <button type="button" className="booking-popup-close" onClick={close} aria-label="Đóng">
          ×
        </button>
        <img className="booking-popup-photo" src="/booking-house.jpg" alt="" />
        <BookingForm />
      </div>
    </div>
  );
}

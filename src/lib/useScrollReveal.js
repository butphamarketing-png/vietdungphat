import { useEffect } from "react";
import { useCms } from "./cms.js";

/** Từng khối ảnh/chữ, không fade cả section lớn — hiện đúng chỗ đang lướt tới. */
const ITEMS = [
  "main .services-intro",
  "main .service-card",
  "main .section-head",
  "main .price-head",
  "main .price-script",
  "main .price-card",
  "main .card",
  "main .news-col",
  "main .review-card",
  "main .about-collage .shot",
  "main .about-copy",
  "main .about-script",
  "main .stats > div",
  "main .booking-visual",
  "main .booking-form",
  "main .calc-block .section-head",
  "main .calc-note",
  "main .calc-form",
  "main .calc-result",
  "main .page-hero",
  "main .page-body",
  "main .album-player",
  "main .album-video-item",
  "main .album-photo",
  "main .article-cover",
  "main .article-body",
  "main .related",
  "main .contact-grid > *",
  "main .loban-tool",
  "main .loban-guide",
  ".footer",
].join(", ");

function inView(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  return rect.top < vh * 0.88 && rect.bottom > 48;
}

export function useScrollReveal(pathname) {
  const cms = useCms();

  useEffect(() => {
    let io;
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return;
      const items = [...document.querySelectorAll(ITEMS)].filter((el) => !el.closest(".adminbp-root"));
      items.forEach((el) => el.classList.add("reveal"));

      const reveal = (el) => {
        if (el.classList.contains("is-in")) return;
        el.classList.add("is-in");
        io?.unobserve(el);
      };

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && inView(entry.target)) reveal(entry.target);
          });
        },
        { threshold: [0.08, 0.18, 0.32], rootMargin: "0px 0px -12% 0px" },
      );

      items.forEach((el) => {
        if (inView(el)) reveal(el);
        else io.observe(el);
      });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      io?.disconnect();
    };
  }, [pathname, cms]);
}

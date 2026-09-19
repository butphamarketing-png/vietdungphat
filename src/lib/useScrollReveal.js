import { useEffect } from "react";
import { useCms } from "./cms.js";

const BLOCKS = [
  "main section:not(.hero)",
  "main .page-hero",
  "main .page-body",
  "main .about-layout",
  "main .loban-tool",
  "main .loban-guide",
  "main .related",
  "main .article-cover",
  "main .article-body",
  ".footer",
].join(", ");

const KIDS = [
  ".service-cards",
  ".project-grid",
  ".review-grid",
  ".grid-4",
  ".news-cols",
  ".stats",
  ".price-cards",
  ".grid-3",
  ".news-grid",
  ".calc-form",
  ".article-gallery",
  ".contact-grid",
].join(", ");

function visibleEnough(el) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  return rect.top < vh * 0.82 && rect.bottom > 72;
}

export function useScrollReveal(pathname) {
  const cms = useCms();

  useEffect(() => {
    let io;
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return;
      const blocks = [...document.querySelectorAll(BLOCKS)].filter((el) => !el.closest(".adminbp-root"));
      blocks.forEach((el) => el.classList.add("reveal"));
      document.querySelectorAll(KIDS).forEach((el) => el.classList.add("reveal-kids"));

      const reveal = (el) => {
        if (el.classList.contains("is-in")) return;
        el.classList.add("is-in");
        io?.unobserve(el);
      };

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && visibleEnough(entry.target)) reveal(entry.target);
          });
        },
        { threshold: [0.12, 0.2], rootMargin: "0px 0px -10% 0px" },
      );

      blocks.forEach((el) => {
        if (visibleEnough(el)) reveal(el);
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

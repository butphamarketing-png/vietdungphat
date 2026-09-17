import { useEffect } from "react";

const BLOCKS =
  "main section:not(.hero), main .page-hero, main .about-layout, main .service-detail-row, main .contact-card, main .contact-form, main .booking-form, main .article-cover, main .article-body, main .related, main article.page > .news-grid, main article.page > .grid-3, main article.page > .section-head, .footer";

const KIDS =
  ".service-cards, .project-grid, .review-grid, .grid-4, .news-cols, .stats, .price-cards, .grid-3, .news-grid, .calc-form";

export function useScrollReveal(pathname) {
  useEffect(() => {
    const blocks = [...document.querySelectorAll(BLOCKS)];
    blocks.forEach((el) => el.classList.add("reveal"));
    document.querySelectorAll(KIDS).forEach((el) => el.classList.add("reveal-kids"));

    const reveal = (el) => {
      if (el.classList.contains("is-in")) return;
      el.classList.add("is-in");
      io.unobserve(el);
    };

    const catchUp = () => {
      const line = window.innerHeight - 64;
      blocks.forEach((el) => {
        if (el.getBoundingClientRect().top < line) reveal(el);
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight - 64) {
            reveal(entry.target);
          }
        });
        catchUp();
      },
      { threshold: 0, rootMargin: "0px 0px -64px 0px" }
    );

    blocks.forEach((el) => io.observe(el));
    catchUp();
    return () => io.disconnect();
  }, [pathname]);
}

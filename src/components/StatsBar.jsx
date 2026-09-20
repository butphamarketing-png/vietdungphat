import { useEffect, useRef, useState } from "react";
import { useCms } from "../lib/cms.js";

function parseStat(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return { target: 0, suffix: raw };
  return { target: Number(match[1].replace(",", ".")), suffix: match[2] };
}

function formatShown(n, target) {
  if (!Number.isFinite(n)) return "0";
  const decimals = String(target).includes(".") ? 1 : 0;
  return decimals ? n.toFixed(1) : String(Math.round(n));
}

function StatValue({ value, active }) {
  const { target, suffix } = parseStat(value);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!active) {
      setShown(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(target);
      return;
    }
    const duration = Math.min(2200, 900 + target * 1.1);
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setShown(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setShown(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);

  return (
    <>
      {formatShown(shown, target)}
      {suffix}
    </>
  );
}

export default function StatsBar() {
  const { stats } = useCms();
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="stats" ref={ref}>
      {stats.map((item) => (
        <div key={item.label}>
          <strong>
            <StatValue value={item.value} active={active} />
          </strong>
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  );
}

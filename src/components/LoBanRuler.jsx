import { useEffect, useMemo, useRef, useState } from "react";
import { RULERS, readRuler } from "../lib/loban.js";

const PX_PER_MM = 1.35;
const MAX_MM = 4500;
const PAD_MM = 80;

function formatCm(mm) {
  return (Math.round(mm) / 10).toFixed(1).replace(/\.0$/, ".0");
}

function Strip({ ruler, maxMm }) {
  const blocks = [];
  const w = (ruler.cycle / ruler.cung.length) * PX_PER_MM;
  let x = 0;
  while (x < maxMm * PX_PER_MM) {
    ruler.cung.forEach((c) => {
      blocks.push(
        <span key={`${ruler.id}-${x}-${c.name}`} className={c.good ? "is-good" : "is-bad"} style={{ width: w }}>
          {c.name}
        </span>
      );
      x += w;
    });
  }
  return (
    <div className="loban-strip">
      <p>{ruler.title}</p>
      <div className="loban-cells">{blocks}</div>
    </div>
  );
}

export default function LoBanRuler() {
  const [mm, setMm] = useState(900);
  const [draft, setDraft] = useState("900");
  const scroller = useRef(null);
  const syncing = useRef(false);

  const results = useMemo(() => RULERS.map((r) => ({ ruler: r, ...readRuler(mm, r) })), [mm]);

  function applyMm(next) {
    const n = Math.max(0, Math.min(MAX_MM, Math.round(Number(next) || 0)));
    setMm(n);
    setDraft(String(n));
  }

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const needle = el.clientWidth / 2;
    syncing.current = true;
    el.scrollLeft = mm * PX_PER_MM + PAD_MM * PX_PER_MM - needle;
    requestAnimationFrame(() => {
      syncing.current = false;
    });
  }, [mm]);

  function onScroll() {
    if (syncing.current) return;
    const el = scroller.current;
    const needle = el.clientWidth / 2;
    const next = Math.round((el.scrollLeft + needle) / PX_PER_MM - PAD_MM);
    const n = Math.max(0, Math.min(MAX_MM, next));
    setMm(n);
    setDraft(String(n));
  }

  return (
    <section className="loban-tool">
      <div className="loban-input">
        <div>
          <strong>{formatCm(mm)}</strong>
          <span>cm</span>
        </div>
        <label>
          mm (nhập số)
          <input
            type="number"
            min="0"
            max={MAX_MM}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n >= 0) applyMm(n);
            }}
          />
        </label>
      </div>
      <p className="loban-hint">Hãy kéo thước hoặc nhập số đo theo milimet.</p>

      <div className="loban-stage">
        <div className="loban-needle" aria-hidden="true" />
        <div className="loban-scroller" ref={scroller} onScroll={onScroll}>
          <div className="loban-track" style={{ width: (MAX_MM + PAD_MM * 2) * PX_PER_MM, paddingLeft: PAD_MM * PX_PER_MM }}>
            {RULERS.map((r) => (
              <Strip key={r.id} ruler={r} maxMm={MAX_MM} />
            ))}
          </div>
        </div>
      </div>
      <p className="loban-unit">Đơn vị tính: mm · Kéo qua trái / phải trên thước</p>

      <div className="loban-results">
        {results.map(({ ruler, cung, khoang, good }) => (
          <article key={ruler.id} className={good ? "is-good" : "is-bad"}>
            <p className="kicker">{ruler.title}</p>
            <h3>
              Cung {khoang.name} · {cung.name} — {good ? "Tốt" : "Xấu"}
            </h3>
            <p>
              Độ dài {formatCm(mm)} cm thuộc cung <strong>{khoang.name}</strong>
              {khoang.meaning ? ` (${khoang.meaning})` : ""} nằm trong khoảng <strong>{cung.name}</strong>.
            </p>
            <p>{cung.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

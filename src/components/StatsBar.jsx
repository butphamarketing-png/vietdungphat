import { useCms } from "../lib/cms.js";

export default function StatsBar() {
  const { stats } = useCms();
  return (
    <section className="stats">
      {stats.map((item) => (
        <div key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  );
}

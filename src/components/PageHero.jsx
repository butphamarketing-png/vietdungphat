export default function PageHero({ kicker, title, children }) {
  return (
    <header className="page-hero">
      {kicker ? <p className="kicker lined">{kicker}</p> : null}
      <h1>{title}</h1>
      {children}
    </header>
  );
}

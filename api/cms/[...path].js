export default async function handler(req, res) {
  const path = String(req.url || "")
    .replace(/^\/api\/cms/, "")
    .split("?")[0];

  if (!path.startsWith("/upload/") || path.includes("..")) {
    res.status(400).end();
    return;
  }

  try {
    const upstream = await fetch(`http://vietdungphat.com${path}`);
    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }
    const type = upstream.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", type);
    res.setHeader("Cache-Control", "public, s-maxage=604800, stale-while-revalidate=86400");
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.status(200).send(buf);
  } catch {
    res.status(502).end();
  }
}

function sessionId() {
  try {
    let id = sessionStorage.getItem("vdp-sid");
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `s${Date.now()}${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem("vdp-sid", id);
    }
    return id;
  } catch {
    return "";
  }
}

export function trackPageView(path) {
  const clean = String(path || "").split("?")[0].replace(/\/+$/, "") || "/";
  if (clean.startsWith("/adminbp") || clean.startsWith("/api/")) return;
  try {
    const stampKey = `vdp-hit:${clean}`;
    const last = Number(sessionStorage.getItem(stampKey) || 0);
    if (Date.now() - last < 12000) return;
    sessionStorage.setItem(stampKey, String(Date.now()));
  } catch {
    /* ignore quota */
  }
  const body = JSON.stringify({
    path: clean,
    title: typeof document !== "undefined" ? document.title : "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
    sessionId: sessionId(),
  });
  try {
    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

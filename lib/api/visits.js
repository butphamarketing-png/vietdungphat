import { getAdminClient, isSupabaseConfigured } from "./supabase.js";

const FALLBACK_KEY = "vdp-visits";
export const PAGE_VIEWS_SQL = `-- Chạy trong Supabase → SQL Editor
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  title text not null default '',
  referrer text not null default '',
  session_id text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);
create index if not exists page_views_session_idx on public.page_views (session_id);
alter table public.page_views enable row level security;`;

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function addDays(isoDay, delta) {
  const d = new Date(`${isoDay}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function emptyStats() {
  return {
    today: { views: 0, visitors: 0 },
    yesterday: { views: 0, visitors: 0 },
    week: { views: 0, visitors: 0 },
    month: { views: 0, visitors: 0 },
    total: { views: 0, visitors: 0 },
    pages: [],
    recent: [],
    days: [],
  };
}

function tableMissing(error) {
  const msg = String(error?.message || error || "");
  return /page_views|schema cache|does not exist|could not find the table/i.test(msg);
}

async function getFallbackDoc(client) {
  const { data, error } = await client.from("cms_docs").select("data").eq("key", FALLBACK_KEY).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.data && typeof data.data === "object" ? data.data : { total: 0, days: {}, pages: {}, recent: [] };
}

async function setFallbackDoc(client, value) {
  const { error } = await client
    .from("cms_docs")
    .upsert({ key: FALLBACK_KEY, data: value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

export async function recordVisit({ path, title, referrer, sessionId }) {
  if (!isSupabaseConfigured()) return { ok: false, skipped: true };
  const client = getAdminClient();
  const row = {
    path: String(path || "/").slice(0, 180) || "/",
    title: String(title || "").slice(0, 180),
    referrer: String(referrer || "").slice(0, 300),
    session_id: String(sessionId || "").slice(0, 80),
  };
  const { error } = await client.from("page_views").insert(row);
  if (!error) return { ok: true, store: "table" };
  if (!tableMissing(error)) throw new Error(error.message);

  const doc = await getFallbackDoc(client);
  const today = dayKey();
  const days = { ...(doc.days || {}) };
  const day = days[today] || { views: 0, sessions: [] };
  day.views += 1;
  if (row.session_id && !day.sessions.includes(row.session_id)) {
    day.sessions = [...day.sessions, row.session_id].slice(-400);
  }
  days[today] = day;
  const keepFrom = addDays(today, -90);
  for (const key of Object.keys(days)) {
    if (key < keepFrom) delete days[key];
  }
  const pages = { ...(doc.pages || {}) };
  const prev = pages[row.path] || { views: 0, title: row.title };
  pages[row.path] = { views: prev.views + 1, title: row.title || prev.title };
  const recent = [
    { path: row.path, title: row.title, at: new Date().toISOString(), session: row.session_id },
    ...(doc.recent || []),
  ].slice(0, 40);
  await setFallbackDoc(client, {
    total: Number(doc.total || 0) + 1,
    days,
    pages,
    recent,
  });
  return { ok: true, store: "fallback" };
}

function summarizeRows(rows, totalViews, totalVisitors) {
  const today = dayKey();
  const yesterday = addDays(today, -1);
  const weekFrom = addDays(today, -6);
  const monthFrom = addDays(today, -29);
  const stats = emptyStats();
  stats.total.views = totalViews;
  stats.total.visitors = totalVisitors;

  const pageMap = new Map();
  const dayMap = new Map();
  const uniq = { today: new Set(), yesterday: new Set(), week: new Set(), month: new Set() };

  for (const row of rows) {
    const at = String(row.created_at || "");
    const day = at.slice(0, 10);
    const path = row.path || "/";
    const sid = row.session_id || "";
    stats.month.views += 1;
    if (sid) uniq.month.add(sid);
    const bucket = dayMap.get(day) || { views: 0, visitors: new Set() };
    bucket.views += 1;
    if (sid) bucket.visitors.add(sid);
    dayMap.set(day, bucket);
    const page = pageMap.get(path) || { path, title: row.title || path, views: 0 };
    page.views += 1;
    if (row.title) page.title = row.title;
    pageMap.set(path, page);
    if (day >= weekFrom) {
      stats.week.views += 1;
      if (sid) uniq.week.add(sid);
    }
    if (day === today) {
      stats.today.views += 1;
      if (sid) uniq.today.add(sid);
    }
    if (day === yesterday) {
      stats.yesterday.views += 1;
      if (sid) uniq.yesterday.add(sid);
    }
  }

  stats.today.visitors = uniq.today.size;
  stats.yesterday.visitors = uniq.yesterday.size;
  stats.week.visitors = uniq.week.size;
  stats.month.visitors = uniq.month.size;
  stats.pages = [...pageMap.values()].sort((a, b) => b.views - a.views).slice(0, 12);
  stats.recent = rows.slice(0, 20).map((row) => ({
    path: row.path,
    title: row.title,
    at: row.created_at,
  }));
  stats.days = [];
  for (let i = 13; i >= 0; i -= 1) {
    const key = addDays(today, -i);
    const bucket = dayMap.get(key);
    stats.days.push({ day: key, views: bucket?.views || 0, visitors: bucket?.visitors.size || 0 });
  }
  return stats;
}

function summarizeFallback(doc) {
  const stats = emptyStats();
  const today = dayKey();
  const yesterday = addDays(today, -1);
  const weekFrom = addDays(today, -6);
  const monthFrom = addDays(today, -29);
  const days = doc.days || {};
  const weekS = new Set();
  const monthS = new Set();
  stats.total.views = Number(doc.total || 0);
  for (const [day, bucket] of Object.entries(days)) {
    const views = Number(bucket.views || 0);
    const sessions = bucket.sessions || [];
    if (day === today) {
      stats.today.views = views;
      stats.today.visitors = sessions.length;
    }
    if (day === yesterday) {
      stats.yesterday.views = views;
      stats.yesterday.visitors = sessions.length;
    }
    if (day >= weekFrom) {
      stats.week.views += views;
      sessions.forEach((id) => weekS.add(id));
    }
    if (day >= monthFrom) {
      stats.month.views += views;
      sessions.forEach((id) => monthS.add(id));
    }
  }
  stats.week.visitors = weekS.size;
  stats.month.visitors = monthS.size;
  const allSessions = new Set();
  Object.values(days).forEach((bucket) => (bucket.sessions || []).forEach((id) => allSessions.add(id)));
  stats.total.visitors = allSessions.size;
  stats.pages = Object.entries(doc.pages || {})
    .map(([path, info]) => ({ path, title: info.title || path, views: Number(info.views || 0) }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 12);
  stats.recent = (doc.recent || []).slice(0, 20);
  stats.days = [];
  for (let i = 13; i >= 0; i -= 1) {
    const key = addDays(today, -i);
    const bucket = days[key] || { views: 0, sessions: [] };
    stats.days.push({ day: key, views: Number(bucket.views || 0), visitors: (bucket.sessions || []).length });
  }
  return stats;
}

export async function getVisitStats() {
  if (!isSupabaseConfigured()) {
    return { ok: false, configured: false, ...emptyStats(), error: "Supabase chưa cấu hình" };
  }
  const client = getAdminClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await client.from("page_views").select("path, title, session_id, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(5000);
  if (!error) {
    const { count } = await client.from("page_views").select("id", { count: "exact", head: true });
    const unique = new Set((data || []).map((row) => row.session_id).filter(Boolean));
    return {
      ok: true,
      configured: true,
      store: "table",
      ...summarizeRows(data || [], Number(count || 0), unique.size),
    };
  }
  if (!tableMissing(error)) {
    return { ok: false, configured: true, ...emptyStats(), error: error.message };
  }
  const doc = await getFallbackDoc(client);
  return { ok: true, configured: true, store: "fallback", needsSql: true, sql: PAGE_VIEWS_SQL, ...summarizeFallback(doc) };
}

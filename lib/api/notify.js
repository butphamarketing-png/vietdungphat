import { env } from "./env.js";

const DEFAULT_TO = "constructionvietdungphat@gmail.com";

function clip(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

export function bookingNotifyTo() {
  return env("BOOKING_NOTIFY_EMAIL", DEFAULT_TO);
}

export async function notifyBooking(entry) {
  const to = bookingNotifyTo();
  const customerEmail = clip(entry.email, 160);
  const payload = {
    name: clip(entry.name, 120),
    phone: clip(entry.phone, 40),
    email: customerEmail,
    need: clip(entry.need, 80) || "(không có)",
    date: clip(entry.date, 40) || "(không có)",
    slot: clip(entry.slot, 40) || "(không có)",
    message: clip(entry.note, 2000) || "(không có)",
    _subject: `Đặt lịch mới — ${clip(entry.name, 80)} — ${clip(entry.phone, 40)}`,
    _template: "table",
    _captcha: "false",
  };
  if (customerEmail) payload._replyto = customerEmail;

  const res = await fetch(`https://formsubmit.co/ajax/${to}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: "https://www.vietdungphat.com",
      Referer: "https://www.vietdungphat.com/lien-he",
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  const ok = res.ok && data.success !== false && String(data.success) !== "false";
  return { ok, message: String(data.message || "") };
}

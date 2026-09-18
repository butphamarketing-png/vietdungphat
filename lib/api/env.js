function has(name) {
  return Boolean(process.env[name]?.trim());
}

export function required(names) {
  return names.every((name) => has(name));
}

export function env(name, fallback = "") {
  return process.env[name]?.trim() || fallback;
}

export function getAdminUser() {
  return env("ADMINBP_USER", "admin@vietdungphat.com").toLowerCase();
}

export function getAdminPassword() {
  return env("ADMINBP_PASSWORD", "vietdungphat.com");
}

export function getAdminSecret() {
  return env("ADMINBP_SECRET", getAdminPassword() || "vietdungphat-adminbp-secret");
}

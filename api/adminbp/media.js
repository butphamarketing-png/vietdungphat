import { isAdmin } from "../_lib/auth.js";
import { deleteObject as deleteR2Object } from "../_lib/r2.js";
import { deleteMediaObject, deleteMediaRow, getMediaRow, listMedia } from "../_lib/supabase.js";
import { methodNotAllowed, send } from "../_lib/http.js";

export default async function handler(req, res) {
  if (!isAdmin(req)) return send(res, 401, { ok: false, error: "Unauthorized" });
  if (req.method === "GET") {
    try {
      return send(res, 200, { ok: true, data: await listMedia() });
    } catch (error) {
      return send(res, 500, { ok: false, error: error.message });
    }
  }
  if (req.method === "DELETE") {
    const url = new URL(req.url, "http://localhost");
    const id = url.searchParams.get("id");
    const keyHint = url.searchParams.get("key");
    if (!id) return send(res, 400, { ok: false, error: "Thiếu id" });
    try {
      const row = await getMediaRow(id);
      const key = row?.key || keyHint;
      const storage = row?.storage || "supabase";
      if (key) {
        if (storage === "r2") await deleteR2Object(key);
        else await deleteMediaObject(key);
      }
      await deleteMediaRow(id);
      return send(res, 200, { ok: true });
    } catch (error) {
      return send(res, 500, { ok: false, error: error.message });
    }
  }
  return methodNotAllowed(res, "GET, DELETE");
}

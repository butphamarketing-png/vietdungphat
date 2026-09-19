const MAX_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1920;

async function readApi(res) {
  const text = await res.text();
  try {
    return { res, data: JSON.parse(text) };
  } catch {
    if (res.status === 413) {
      throw new Error("File quá lớn so với máy chủ. Ảnh poster nên dưới 4MB, hoặc dùng JPG đã nén.");
    }
    throw new Error(`Máy chủ trả lỗi ${res.status}. Đăng nhập lại /adminbp rồi thử lại.`);
  }
}

function canvasToJpeg(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Không nén được ảnh"));
        else resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

async function compressImage(file) {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  let blob = await canvasToJpeg(canvas, 0.84);
  if (blob.size > 3.5 * 1024 * 1024) blob = await canvasToJpeg(canvas, 0.72);
  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

export async function uploadAdminFile(file) {
  if (!file) throw new Error("Thiếu file");
  if (file.size > MAX_BYTES) throw new Error("File quá lớn (tối đa 50MB)");
  const prepared = file.type.startsWith("image/") ? await compressImage(file) : file;

  const signRes = await fetch("/api/adminbp/upload", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "sign",
      filename: prepared.name,
      contentType: prepared.type,
      size: prepared.size,
    }),
  });
  const signed = await readApi(signRes);
  if (!signed.data.ok) throw new Error(signed.data.error || "Không tạo được chỗ lưu file");
  const ticket = signed.data.data;

  const put = await fetch(ticket.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": prepared.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: prepared,
  });
  if (!put.ok) {
    const detail = await put.text().catch(() => "");
    throw new Error(`Không gửi được file lên Storage (${put.status})${detail ? `: ${detail.slice(0, 140)}` : ""}`);
  }

  const doneRes = await fetch("/api/adminbp/upload", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "complete",
      id: ticket.id,
      key: ticket.key,
      url: ticket.url,
      name: prepared.name,
      size: prepared.size,
      type: prepared.type,
    }),
  });
  const done = await readApi(doneRes);
  if (!done.data.ok) throw new Error(done.data.error || "Upload xong nhưng chưa ghi được kho ảnh");
  return done.data.data;
}

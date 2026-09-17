import { useState } from "react";
import { fullImage } from "../lib/media.js";

export default function SmartImg({ src, alt = "", className, ...rest }) {
  const original = src || "";
  const preferred = fullImage(original) || original;
  const [current, setCurrent] = useState(preferred);
  const [dead, setDead] = useState(!original);

  if (dead || !current) return null;

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => {
        const fallback = original && original !== current ? original : "";
        const isHttpCms = /^https?:\/\/(www\.)?vietdungphat\.com/i.test(fallback);
        if (fallback && !isHttpCms) setCurrent(fallback);
        else setDead(true);
      }}
      {...rest}
    />
  );
}

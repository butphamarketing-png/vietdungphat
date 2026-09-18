import { useEffect, useState } from "react";
import { FALLBACK_IMAGE, fullImage } from "../lib/media.js";

function resolveSrc(src) {
  const original = src || "";
  return fullImage(original) || original || FALLBACK_IMAGE;
}

export default function SmartImg({ src, alt = "", className, ...rest }) {
  const original = src || "";
  const [current, setCurrent] = useState(() => resolveSrc(original));

  useEffect(() => {
    setCurrent(resolveSrc(src));
  }, [src]);

  if (!current) return null;

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => {
        if (current !== original && original && current !== FALLBACK_IMAGE) {
          setCurrent(original);
          return;
        }
        if (current !== FALLBACK_IMAGE) setCurrent(FALLBACK_IMAGE);
      }}
      {...rest}
    />
  );
}

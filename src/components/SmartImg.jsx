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
        if (current !== original && original) setCurrent(original);
        else setDead(true);
      }}
      {...rest}
    />
  );
}

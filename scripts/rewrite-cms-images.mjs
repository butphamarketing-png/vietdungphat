import fs from "node:fs";
import data from "../src/data/content.json" with { type: "json" };

function rewrite(value) {
  if (typeof value === "string") {
    return value.replace(
      /https?:\/\/(?:www\.)?vietdungphat\.com\/(?:resize\/[^/"']+\/\d+\/)?upload\/[^"'<\s]+?\.(?:jpe?g|png|gif|webp)/gi,
      (match) => {
        let path = match.replace(/^https?:\/\/(?:www\.)?vietdungphat\.com/i, "");
        path = path.replace(/\/resize\/[^/]+\/\d+\//i, "/");
        return `https://images.weserv.nl/?url=${encodeURIComponent("vietdungphat.com" + path)}`;
      }
    );
  }
  if (Array.isArray(value)) return value.map(rewrite);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value)) out[key] = rewrite(value[key]);
    return out;
  }
  return value;
}

fs.writeFileSync("src/data/content.json", JSON.stringify(rewrite(data)));
console.log("rewrote CMS image urls");

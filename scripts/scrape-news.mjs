import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { scrapeList, scrapeDetails } from "./scrape.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = join(ROOT, "src", "data", "content.json");

const data = JSON.parse(await readFile(file, "utf8"));
data.projects = data.projects.filter((p) => p.slug.length > 4);
data.products = data.products.filter((p) => p.slug.length > 4);
data.services = data.services.filter((p) => p.slug.length > 4);

console.log("Scraping news…");
const news = await scrapeList("tin-tuc", 5);
console.log("news items", news.length, news.slice(0, 3));
data.news = await scrapeDetails(news);

await writeFile(file, JSON.stringify(data));
console.log("updated news", data.news.length);

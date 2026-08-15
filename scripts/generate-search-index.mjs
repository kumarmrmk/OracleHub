// Generates public/search-index.json from the content pages under src/app.
// Runs automatically via the "prebuild" / "predev" npm scripts.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

const APP_DIR = join(process.cwd(), "src", "app");
const OUT_DIR = join(process.cwd(), "public");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.name === "page.tsx") out.push(p);
  }
  return out;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—");
}

function stripTags(s) {
  return decodeEntities(s).replace(/<[^>]*>/g, " ");
}

function clean(s) {
  return stripTags(s)
    .replace(/\{[^{}]*\}/g, " ") // drop JSX expressions / prop structures
    .replace(/[{}\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractStringsFromTags(src, tagName) {
  // For self-closing tags (e.g. DataTable, DiagramNode, Arrow) grab all quoted values.
  const out = [];
  const tagRe = new RegExp(`<${tagName}[\\s\\S]*?\\/>`, "g");
  let m;
  while ((m = tagRe.exec(src))) {
    const block = m[0];
    for (const q of block.matchAll(/"([^"]*)"/g)) out.push(q[1]);
    for (const q of block.matchAll(/'([^']*)'/g)) out.push(q[1]);
  }
  return out;
}

function extractCodeBlocks(src) {
  return [...src.matchAll(/\{`([\s\S]*?)`\}/g)].map((m) => m[1]);
}

function extractElements(src, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
  const out = [];
  let m;
  while ((m = re.exec(src))) out.push(stripTags(m[1]).replace(/\s+/g, " ").trim());
  return out.filter(Boolean);
}

function headingText(src) {
  const out = [];
  out.push(...extractElements(src, "H2"));
  out.push(...extractElements(src, "H3"));
  return out;
}

function parsePage(filePath) {
  const src = readFileSync(filePath, "utf8");
  const rel = relative(APP_DIR, filePath).split(sep);
  rel.pop(); // drop page.tsx
  const href = "/" + rel.join("/").replace(/\//g, "/");
  const cleanHref = href === "/" ? "/" : href.replace(/\/$/, "");

  const codes = extractCodeBlocks(src);
  const pageTitle = /title="([^"]*)"/.exec(src)?.[1] ?? "";
  const description = /description="([^"]*)"/.exec(src)?.[1] ?? "";
  const eyebrow = /eyebrow="([^"]*)"/.exec(src)?.[1] ?? "";

  const headings = headingText(src);
  const paragraphs = extractElements(src, "P");
  const listItems = extractElements(src, "li");
  const callouts = extractElements(src, "Callout");
  const tableStrings = extractStringsFromTags(src, "DataTable");
  const nodeStrings = extractStringsFromTags(src, "DiagramNode");
  const arrowLabels = extractStringsFromTags(src, "Arrow");

  // h1 fallback (e.g. home page has no PageHeader)
  let title = pageTitle;
  if (!title) {
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(src);
    title = h1 ? stripTags(h1[1]).replace(/\s+/g, " ").trim() : cleanHref;
  }

  const notable = [
    ...headings,
    ...paragraphs,
    ...listItems,
    ...callouts,
    ...tableStrings,
    ...nodeStrings,
    ...arrowLabels,
    ...codes.map((c) => c.replace(/\s+/g, " ").trim()),
  ]
    .map(clean)
    .filter((t) => t.length > 0);

  // De-duplicate while keeping first occurrence order.
  const seen = new Set();
  const uniq = notable.filter((t) => {
    const k = t.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const content = uniq.join(" ");

  return {
    href: cleanHref,
    title: decodeEntities(title.replace(/\s+/g, " ").trim()),
    eyebrow: decodeEntities(eyebrow),
    description: decodeEntities(description),
    headings: headings.map((h) => decodeEntities(h)),
    content,
  };
}

const files = walk(APP_DIR);
const pages = files
  .map(parsePage)
  .filter((p) => p.content.length > 0 || p.title.length > 0);

const index = {
  generatedAt: new Date().toISOString(),
  version: 1,
  pages,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "search-index.json"), JSON.stringify(index));
console.log(
  `search-index: ${pages.length} pages, ${(JSON.stringify(index).length / 1024).toFixed(1)} KB written to public/search-index.json`
);
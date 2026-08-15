export type SearchDoc = {
  href: string;
  title: string;
  eyebrow: string;
  description: string;
  headings: string[];
  content: string;
};

export type SearchResult = {
  doc: SearchDoc;
  score: number;
  snippet: string;
  matched: string[];
};

type TokenMap = Map<string, Map<string, number>>;

// Plain character class (no \p{...}) so the tokenizer runs on older mobile
// browsers that reject Unicode property escapes (which would kill the whole
// client bundle at parse time).
const TOKEN_RE = /[a-z0-9\u00C0-\u024F]+/gi;
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "for", "on", "is", "are",
  "it", "this", "that", "with", "as", "at", "by", "from", "how", "what",
  "why", "when", "does", "do", "you", "your", "not", "be", "but", "so",
  "up", "out", "then", "than", "which", "will", "into", "about", "use", "using",
]);

let docs: SearchDoc[] | null = null;
let tokenMap: TokenMap | null = null;
let loading: Promise<void> | null = null;

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(TOKEN_RE) || []).filter(
    (t) => t.length > 1 && !STOP_WORDS.has(t)
  );
}

function indexField(map: TokenMap, doc: SearchDoc, field: keyof SearchDoc, weight: number) {
  const value = String(doc[field] || "");
  for (const token of tokenize(value)) {
    let byDoc = map.get(token);
    if (!byDoc) {
      byDoc = new Map();
      map.set(token, byDoc);
    }
    byDoc.set(doc.href, (byDoc.get(doc.href) || 0) + weight);
  }
}

function buildTokenMap(docsList: SearchDoc[]): TokenMap {
  const map: TokenMap = new Map();
  for (const doc of docsList) {
    indexField(map, doc, "title", 14);
    indexField(map, doc, "eyebrow", 8);
    indexField(map, doc, "headings", 6);
    indexField(map, doc, "description", 4);
    indexField(map, doc, "content", 1);
  }
  return map;
}

export function ensureIndex(): Promise<void> {
  if (docs) return Promise.resolve();
  if (loading) return loading;
  loading = fetch("/search-index.json")
    .then((r) => r.json())
    .then((data: { pages: SearchDoc[] }) => {
      docs = data.pages;
      tokenMap = buildTokenMap(docs);
    })
    .catch(() => {
      docs = [];
      tokenMap = new Map();
    });
  return loading;
}

function makeSnippet(content: string, tokens: string[]): string {
  const lower = content.toLowerCase();
  const first = tokens
    .map((t) => lower.indexOf(t))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];
  if (first === undefined) return content.slice(0, 160);
  const start = Math.max(0, first - 60);
  const end = Math.min(content.length, first + 140);
  const prefix = start > 0 ? "\u2026" : "";
  const suffix = end < content.length ? "\u2026" : "";
  return prefix + content.slice(start, end).trim() + suffix;
}

export function searchPages(query: string, limit = 15): SearchResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0 || !tokenMap || !docs) return [];

  const scores = new Map<string, number>();
  const matchedByDoc = new Map<string, string[]>();

  for (const token of tokens) {
    const exact = tokenMap.get(token);
    if (exact) {
      for (const [href, weight] of exact) {
        scores.set(href, (scores.get(href) || 0) + weight);
        const list = matchedByDoc.get(href) || [];
        if (!list.includes(token)) list.push(token);
        matchedByDoc.set(href, list);
      }
    } else {
      // prefix match across the whole token space
      for (const [key, byDoc] of tokenMap) {
        if (key.startsWith(token)) {
          for (const [href, weight] of byDoc) {
            scores.set(href, (scores.get(href) || 0) + weight * 0.6);
            const list = matchedByDoc.get(href) || [];
            if (!list.includes(token)) list.push(token);
            matchedByDoc.set(href, list);
          }
        }
      }
    }
  }

  return [...scores.entries()]
    .map(([href, raw]) => {
      const doc = docs!.find((d) => d.href === href)!;
      const matched = matchedByDoc.get(href) || [];
      const normalized = raw / (1 + doc.content.length / 4000);
      return { doc, score: normalized, matched };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ doc, score, matched }) => ({
      doc,
      score,
      matched,
      snippet: makeSnippet(doc.content, matched),
    }));
}

export function getDocCount(): number {
  return docs ? docs.length : 0;
}

export function isIndexLoaded(): boolean {
  return docs !== null;
}
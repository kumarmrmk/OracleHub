"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureIndex, isIndexLoaded, searchPages, type SearchResult } from "@/lib/search";

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;
  const re = new RegExp(`(${terms.map(escapeRe).join("|")})`, "gi");
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        terms.some((t) => part.toLowerCase().includes(t)) ? (
          <mark key={i} className="rounded-sm bg-accent/25 text-accent">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [ready, setReady] = useState(isIndexLoaded);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    ensureIndex().then(() => setReady(true));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter" && results[active]) {
        e.preventDefault();
        go(results[active].doc.href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, results, active]);

  function onQueryChange(value: string) {
    setQuery(value);
    setActive(0);
    const q = value.trim();
    setResults(q ? searchPages(q) : []);
  }

  function go(href: string) {
    onClose();
    router.push(href);
  }

  const trimmed = query.trim();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--edge-strong)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[var(--edge)] px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search the whole reference…"
                className="w-full bg-transparent text-[15px] text-ink placeholder:text-muted focus:outline-none"
              />
              <kbd className="shrink-0 rounded-md border border-[var(--edge-strong)] bg-[var(--surface-2)] px-2 py-0.5 font-mono text-[10px] text-muted">
                esc
              </kbd>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {!ready ? (
                <p className="px-4 py-8 text-center text-sm text-muted">Building index…</p>
              ) : !trimmed ? (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  Type to search across all pages. Try “flexfield”, “fbdi”, or “OAuth”.
                </p>
              ) : results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  No results for “{trimmed}”.
                </p>
              ) : (
                <ul>
                  {results.map((r, i) => (
                    <li key={r.doc.href}>
                      <button
                        type="button"
                        onClick={() => go(r.doc.href)}
                        onMouseEnter={() => setActive(i)}
                        className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                          i === active ? "bg-white/[0.06]" : ""
                        }`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-strong">
                            {r.doc.eyebrow || "Reference"}
                          </span>
                          <span className="truncate text-sm font-semibold text-ink">
                            <Highlight text={r.doc.title} terms={r.matched} />
                          </span>
                        </div>
                        <p className="line-clamp-2 text-[13px] leading-6 text-muted">
                          <Highlight text={r.snippet} terms={r.matched} />
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
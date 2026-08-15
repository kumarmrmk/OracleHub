"use client";

import { useEffect, useRef, useState } from "react";

type TocItem = { id: string; text: string; level: 1 | 2 };

export default function Toc() {
  const [open, setOpen] = useState(true);
  const [items, setItems] = useState<TocItem[]>([]);
  const [active, setActive] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      const headings = Array.from(
        document.querySelectorAll<HTMLElement>("main h2, main h3")
      );
      const collected: TocItem[] = headings.map((el, i) => {
        if (!el.id) el.id = "toc-" + i;
        return {
          id: el.id,
          text: (el.textContent || "").replace(/\s+/g, " ").trim(),
          level: el.tagName === "H2" ? 1 : 2,
        };
      });
      setItems(collected);

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActive(entry.target.id);
          }
        },
        { rootMargin: "-80px 0px -70% 0px" }
      );
      observerRef.current = observer;
      for (const it of collected) {
        const el = document.getElementById(it.id);
        if (el) observer.observe(el);
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      observerRef.current?.disconnect();
    };
  }, []);

  if (items.length < 3) return null;

  return (
    <nav
      aria-label="On this page"
      className="mb-8 overflow-hidden rounded-xl border border-[var(--edge)] bg-[var(--surface)]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
          On this page
        </span>
        <span className="flex items-center gap-2 text-[10px] text-muted">
          {items.length}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`transition-transform duration-200 ${open ? "" : "rotate-180"}`}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <ol className="space-y-1 border-t border-[var(--edge)] px-3 py-3">
          {items.map((it) => (
            <li key={it.id}>
              <a
                href={"#" + it.id}
                className={`block rounded-md px-2 py-1 text-[13px] leading-snug transition-colors hover:bg-white/[0.04] ${
                  it.level === 2 ? "pl-5" : ""
                } ${active === it.id ? "bg-[var(--accent-soft)]" : "text-muted-strong"}`}
                style={active === it.id ? { color: "var(--accent)" } : undefined}
              >
                {it.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}
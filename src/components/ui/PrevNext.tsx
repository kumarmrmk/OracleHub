"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { allPages } from "@/lib/nav";

export default function PrevNext() {
  const pathname = usePathname();
  const idx = allPages.findIndex((p) => p.href === pathname);
  if (idx < 0) return null;

  const prev = idx > 0 ? allPages[idx - 1] : null;
  const next = idx < allPages.length - 1 ? allPages[idx + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav aria-label="Page navigation" className="mt-12 border-t border-[var(--edge)] pt-6">
      <div className="grid grid-cols-2 gap-3">
        {prev ? (
          <Link
            href={prev.href}
            aria-label={`Previous: ${prev.title}`}
            className={`group flex min-w-0 items-center gap-3 rounded-xl border border-[var(--edge)] bg-[var(--surface-2)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/50 hover:shadow-lg hover:shadow-black/25 ${
              next ? "" : "col-span-2"
            }`}
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--accent)] bg-[var(--accent-soft)] transition-transform duration-200 group-hover:-translate-x-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5m0 0l6 6m-6-6l6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="min-w-0">
              <span className="block text-[9px] font-bold uppercase tracking-widest text-muted">
                Previous
              </span>
              <span className="block truncate text-[13px] font-semibold text-ink transition-colors group-hover:text-[var(--accent)]">
                {prev.title}
              </span>
            </span>
          </Link>
        ) : (
          <span aria-hidden />
        )}

        {next ? (
          <Link
            href={next.href}
            aria-label={`Next: ${next.title}`}
            className={`group flex min-w-0 items-center justify-end gap-3 rounded-xl border border-[var(--edge)] bg-[var(--surface-2)] p-3 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/50 hover:shadow-lg hover:shadow-black/25 ${
              prev ? "" : "col-span-2"
            }`}
          >
            <span className="min-w-0">
              <span className="block text-[9px] font-bold uppercase tracking-widest text-muted">
                Next
              </span>
              <span className="block truncate text-[13px] font-semibold text-ink transition-colors group-hover:text-[var(--accent)]">
                {next.title}
              </span>
            </span>
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[var(--accent)] bg-[var(--accent-soft)] transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        ) : (
          <span aria-hidden />
        )}
      </div>
    </nav>
  );
}
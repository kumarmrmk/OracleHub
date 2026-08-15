"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SearchDialog from "@/components/SearchDialog";
import { findPage } from "@/lib/nav";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchMarker = useRef(false);
  const pathname = usePathname();
  const current = pathname === "/" ? null : findPage(pathname);

  function openSearch() {
    if (!searchMarker.current) {
      window.history.pushState({ ocSearch: true }, "");
      searchMarker.current = true;
    }
    setSearchOpen(true);
  }

  function closeSearch() {
    if (searchMarker.current) {
      searchMarker.current = false;
      window.history.back();
    }
    setSearchOpen(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (searchOpen) closeSearch();
        else openSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    function onPopState() {
      searchMarker.current = false;
      setSearchOpen(false);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [searchOpen]);

  return (
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:min-h-0 lg:overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--edge)] bg-[var(--bg)]/90 px-4 backdrop-blur md:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted hover:bg-white/5 hover:text-ink lg:hidden"
            aria-label="Open navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>
          <p className="truncate text-sm text-muted">
            {current ? (
              <>
                <span className="text-zinc-600">/</span> {current.title}
              </>
            ) : (
              <span className="font-semibold text-ink">Oracle Cloud Hub</span>
            )}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              className="flex items-center gap-2 rounded-lg border border-[var(--edge)] bg-[var(--surface-2)] px-2.5 py-1.5 text-sm text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)]/50 hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
              <span className="hidden md:inline">Search…</span>
              <kbd className="hidden rounded border border-[var(--edge-strong)] px-1.5 py-0.5 font-mono text-[10px] text-muted md:inline">
                Ctrl K
              </kbd>
            </button>
            <a
              href="https://docs.oracle.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-xs text-muted transition-colors hover:text-ink sm:block"
            >
              docs.oracle.com ↗
            </a>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 md:px-10 md:py-12">
          {children}
        </main>

        <footer className="border-t border-[var(--edge)] px-8 py-8 text-center">
          <p className="mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-muted">
            <span>Built as a study reference — Oracle Fusion Cloud, Oracle Integration Cloud &amp;
              Oracle Visual Builder Cloud Service.</span>
          </p>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
            <span className="flex h-6 w-9 items-center justify-center rounded-full bg-accent text-[9px] font-black tracking-tighter text-white">
              MRMK
            </span>
            <span>
              Curated with care by{" "}
              <span className="font-semibold text-accent">Raja Mani Kumar Molleti</span>
              <span className="text-zinc-600"> · </span>
              <span className="italic">learn · build · share</span>
            </span>
          </p>
          <p className="mt-4 text-[11px] leading-relaxed text-muted/70">
            An independent study guide — not affiliated with, endorsed by, or sponsored by Oracle
            Corporation. Oracle, Fusion Cloud, OIC, and VBCS are trademarks of their respective owners.
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted/60">
            All SQL/PL-SQL examples are illustrative and version-dependent. Never run them against
            a production, shared, or business-critical database — test in a disposable learning
            environment first. Use the guide at your own risk.
          </p>
        </footer>
      </div>

      <SearchDialog key={String(searchOpen)} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
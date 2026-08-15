"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/lib/nav";

const SECTION_ACCENT: Record<string, string> = {
  fusion: "var(--accent-fusion)",
  oic: "var(--accent-oic)",
  vbcs: "var(--accent-vbcs)",
  sql: "var(--accent-sql)",
  arch: "var(--accent-tools)",
  troubleshooting: "var(--amber)",
};

function accentFor(id: string): string {
  return SECTION_ACCENT[id] ?? "var(--accent)";
}

function soft(accent: string): string {
  return `color-mix(in srgb, ${accent} 12%, transparent)`;
}

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const activeSection = useMemo(() => {
    for (const section of navSections) {
      const isActive =
        section.pages.some((p) => p.href === pathname) ||
        (section.groups ?? []).some((g) => {
          const inOwn = g.href === pathname || g.pages.some((p) => p.href === pathname);
          const inSubs = (g.subgroups ?? []).some(
            (s) => s.href === pathname || s.pages.some((p) => p.href === pathname)
          );
          return inOwn || inSubs;
        });
      if (isActive) return section.id;
    }
    return null;
  }, [pathname]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const matches = (p: { title: string; description: string }) =>
      p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return navSections
      .map((s) => ({
        ...s,
        pages: s.pages.filter(matches),
        groups: (s.groups ?? [])
          .map((g) => ({
            ...g,
            pages: g.pages.filter(matches),
            subgroups: (g.subgroups ?? [])
              .map((sub) => ({ ...sub, pages: sub.pages.filter(matches) }))
              .filter((sub) => sub.pages.length > 0),
          }))
          .filter((g) => g.pages.length > 0 || (g.subgroups ?? []).length > 0),
      }))
      .filter((s) => s.pages.length > 0 || (s.groups ?? []).length > 0);
  }, [query]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleGroup(id: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[var(--edge)] bg-[var(--surface)] transition-transform duration-200 lg:h-full lg:static lg:translate-x-0 lg:overflow-hidden ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="relative flex items-center justify-between border-b border-[var(--edge)] px-4 py-4">
        <Link href="/" onClick={onClose} className="group flex items-center gap-2.5">
          <span
            className="flex size-8 items-center justify-center rounded-lg bg-clip-text text-sm font-black text-transparent"
            style={{ backgroundImage: "var(--grad-accent)" }}
          >
            O
          </span>
          <div className="leading-none">
            <p className="text-sm font-bold text-ink">Oracle Cloud Hub</p>
            <p className="mt-0.5 bg-clip-text text-[10px] uppercase tracking-widest text-transparent"
              style={{ backgroundImage: "var(--grad-accent)" }}
            >
              Fusion · OIC · VBCS · SQL
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted transition-colors hover:bg-white/5 hover:text-ink lg:hidden"
          aria-label="Close navigation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--edge)] bg-[var(--surface-2)] px-3 py-2 transition-colors focus-within:border-[var(--edge-strong)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter pages…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6 pt-2">
        {(filtered ?? navSections).map((section) => {
          const inFilterMode = filtered !== null;
          const isExpanded = !inFilterMode && expanded.has(section.id);
          const isActive = activeSection === section.id && !inFilterMode;
          const accent = accentFor(section.id);

          return (
            <div key={section.id} className="mb-1">
              <button
                type="button"
                onClick={() => {
                  if (inFilterMode) return;
                  toggle(section.id);
                }}
                aria-expanded={isExpanded}
                className={`group/section flex w-full items-center gap-2 rounded-lg border-l-2 px-2 py-2.5 text-left transition-colors ${
                  isActive
                    ? "border-[var(--accent)]"
                    : "border-transparent hover:bg-white/[0.04]"
                }`}
                style={isActive ? { backgroundColor: soft(accent) } : undefined}
              >
                <span
                  className="size-1.5 shrink-0 rounded-full transition-all"
                  style={{
                    backgroundColor: isActive ? accent : "currentColor",
                    opacity: isActive ? 1 : 0.35,
                    boxShadow: isActive ? `0 0 8px ${accent}` : "none",
                  }}
                />
                <span
                  className="truncate text-[11px] font-bold uppercase tracking-widest transition-colors"
                  style={{ color: isActive ? accent : "var(--muted-strong)" }}
                >
                  {section.title}
                </span>
                {!inFilterMode && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className={`ml-auto shrink-0 text-muted transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                    style={isActive ? { color: accent } : undefined}
                  >
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {(isExpanded || inFilterMode) && (
                <ul className="mt-1 space-y-0.5 border-l border-[var(--edge)] pb-1 pl-3 ml-2">
                  {section.pages.map((page) => (
                    <SidebarLink key={page.href} href={page.href} title={page.title} pathname={pathname} onClose={onClose} indent={false} accent={accent} />
                  ))}
                  {(section.groups ?? []).map((group) => {
                    const subHrefs = (group.subgroups ?? []).flatMap((s) => [
                      s.href,
                      ...s.pages.map((p) => p.href),
                    ]);
                    const groupExpanded =
                      inFilterMode ||
                      expandedGroups.has(group.id) ||
                      group.pages.some((p) => p.href === pathname) ||
                      subHrefs.includes(pathname);
                    const groupActive =
                      !inFilterMode &&
                      (pathname === group.href ||
                        group.pages.some((p) => p.href === pathname) ||
                        subHrefs.includes(pathname));
                    return (
                      <li key={group.id} className="mt-1.5">
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.id)}
                          aria-expanded={groupExpanded}
                          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
                          style={groupActive ? { backgroundColor: soft(accent) } : undefined}
                        >
                          <span
                            className="h-3 w-0.5 shrink-0 rounded-full"
                            style={{ backgroundColor: groupActive ? accent : "transparent" }}
                          />
                          <span
                            className="truncate text-[12px] font-bold uppercase tracking-wider transition-colors"
                            style={{ color: groupActive ? accent : "var(--muted-strong)" }}
                          >
                            {group.title}
                          </span>
                          {!inFilterMode && (
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              className={`ml-auto shrink-0 text-muted transition-transform duration-200 ${
                                groupExpanded ? "rotate-90" : ""
                              }`}
                              style={groupActive ? { color: accent } : undefined}
                            >
                              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        {groupExpanded && (
                          <ul className="mt-0.5 space-y-0.5">
                            {group.pages.map((page) => (
                              <SidebarLink key={page.href} href={page.href} title={page.title} pathname={pathname} onClose={onClose} indent accent={accent} />
                            ))}
                            {(group.subgroups ?? []).map((sub) => {
                              const subKey = `${group.id}:${sub.id}`;
                              const subExpanded =
                                inFilterMode ||
                                expandedGroups.has(subKey) ||
                                sub.pages.some((p) => p.href === pathname);
                              const subActive =
                                !inFilterMode &&
                                (pathname === sub.href || sub.pages.some((p) => p.href === pathname));
                              return (
                                <li key={sub.id} className="mt-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleGroup(subKey)}
                                    aria-expanded={subExpanded}
                                    className="flex w-full items-center gap-2 rounded-lg py-1 pl-4 pr-2 text-left transition-colors hover:bg-white/[0.04]"
                                    style={subActive ? { backgroundColor: soft(accent) } : undefined}
                                  >
                                    <span
                                      className="truncate text-[12px] font-semibold transition-colors"
                                      style={{ color: subActive ? accent : "var(--muted-strong)" }}
                                    >
                                      {sub.title}
                                    </span>
                                    {!inFilterMode && (
                                      <svg
                                        width="11"
                                        height="11"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        className={`ml-auto shrink-0 text-muted transition-transform duration-200 ${
                                          subExpanded ? "rotate-90" : ""
                                        }`}
                                      >
                                        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </button>
                                  {subExpanded && (
                                    <ul className="mt-0.5 space-y-0.5 pl-2">
                                      {sub.pages.map((page) => (
                                        <SidebarLink key={page.href} href={page.href} title={page.title} pathname={pathname} onClose={onClose} indent accent={accent} />
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[var(--edge)] px-4 py-3 text-[11px] leading-relaxed text-muted">
        <p>A reference hub for Oracle Fusion Cloud, Integration Cloud, VBCS &amp; Oracle SQL.</p>
        <div className="mt-3 flex items-center gap-2">
          <span
              className="text-[10px] font-black tracking-tighter text-white"
              style={{ textShadow: "0 0 8px var(--accent), 0 0 18px rgba(255,80,55,.55)" }}
            >
              MRMK
            </span>
          <div className="leading-tight">
            <p
              className="bg-clip-text text-[12px] font-semibold text-transparent"
              style={{ backgroundImage: "var(--grad-accent)" }}
            >
              Raja Mani Kumar Molleti
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted">Creator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  title,
  pathname,
  onClose,
  indent,
  accent,
}: {
  href: string;
  title: string;
  pathname: string;
  onClose: () => void;
  indent: boolean;
  accent: string;
}) {
  const active = pathname === href;
  return (
    <li>
      <Link
        href={href}
        onClick={onClose}
        className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm leading-snug transition-colors ${
          indent ? "pl-5" : ""
        } ${active ? "font-semibold" : "text-muted-strong hover:bg-white/[0.04] hover:text-ink"}`}
        style={active ? { backgroundColor: soft(accent), color: accent } : undefined}
      >
        {active && (
          <span className="size-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
        )}
        <span className={`truncate ${active ? "" : ""}`}>{title}</span>
      </Link>
    </li>
  );
}
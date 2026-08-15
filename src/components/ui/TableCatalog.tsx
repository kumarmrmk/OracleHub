"use client";

import { useMemo, useState } from "react";
import { fusionTables, fusionTableModules, FusionTable } from "@/lib/tables";

const moduleAccent: Record<string, string> = {
  Party: "border-sky-500/40 text-sky-300",
  Suppliers: "border-emerald-500/40 text-emerald-300",
  Payables: "border-emerald-500/40 text-emerald-300",
  Payments: "border-cyan-500/40 text-cyan-300",
  Receivables: "border-amber-500/40 text-amber-300",
  GL: "border-sky-500/40 text-sky-300",
  Flexfields: "border-fuchsia-500/40 text-fuchsia-300",
  SLA: "border-violet-500/40 text-violet-300",
  "Cash Mgmt": "border-fuchsia-500/40 text-fuchsia-300",
  "Fixed Assets": "border-cyan-500/40 text-cyan-300",
  Expenses: "border-rose-500/40 text-rose-300",
  Intercompany: "border-zinc-500/40 text-zinc-300",
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

export default function TableCatalog() {
  const [query, setQuery] = useState("");
  const [module, setModule] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = normalize(query).trim();
    const qParts = q.length ? q.split(/\s+/) : [];
    const list = fusionTables.filter((t) => {
      if (module !== "all" && t.module !== module) return false;
      if (!qParts.length) return true;
      const hay = normalize(`${t.table} ${t.module} ${t.purpose} ${t.pk} ${t.fk}`);
      return qParts.every((p) => hay.includes(p));
    });
    return [...list].sort((a, b) => a.table.localeCompare(b.table));
  }, [query, module]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--edge)] bg-[var(--surface-2)] px-3 py-2 focus-within:border-[var(--edge-strong)] sm:flex-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tables, PK, FK…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
        <select
          value={module}
          onChange={(e) => setModule(e.target.value)}
          className="rounded-lg border border-[var(--edge)] bg-[var(--surface-2)] px-3 py-2 text-sm text-ink focus:outline-none focus:border-[var(--edge-strong)]"
        >
          <option value="all">All modules</option>
          {fusionTableModules.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="my-2 text-xs text-muted">
        {filtered.length} of {fusionTables.length} tables
      </div>

      <div className="my-5 overflow-x-auto rounded-xl border border-[var(--edge)] bg-[var(--surface)]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--edge)] bg-[var(--surface-2)]">
              {["Table", "Module", "Purpose", "Primary key", "Foreign keys"].map((h) => (
                <th key={h} className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted sm:px-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t: FusionTable) => {
              const accent = moduleAccent[t.module] ?? "border-zinc-500/40 text-zinc-300";
              return (
                <tr key={t.table} className="border-b border-[var(--edge)] transition-colors last:border-0 hover:bg-white/[0.02]">
                  <td className="px-3 py-3 align-top sm:px-4">
                    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-100">
                      {t.table}
                    </code>
                  </td>
                  <td className="px-3 py-3 align-top sm:px-4">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${accent}`}>
                      {t.module}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top leading-6 text-muted-strong sm:px-4">{t.purpose}</td>
                  <td className="px-3 py-3 align-top leading-6 text-muted-strong sm:px-4">
                    <code className="font-mono text-[0.85em] text-zinc-200">{t.pk}</code>
                  </td>
                  <td className="px-3 py-3 align-top leading-6 text-muted-strong sm:px-4">
                    <code className="font-mono text-[0.8em] leading-6 text-zinc-300">{t.fk}</code>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                  No tables match that filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

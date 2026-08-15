"use client";

import { useMemo, useState } from "react";

export type ToolRow = {
  task: string;
  area: string;
  tool: string;
  kind: "REST" | "FBDI" | "Job" | "FBDI → Job";
  table: string;
};

const CHIP: Record<ToolRow["kind"], string> = {
  REST: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  FBDI: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "FBDI → Job": "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Job: "border-amber-500/40 bg-amber-500/10 text-amber-300",
};

export default function ToolMatrix({
  rows,
  initialArea,
}: {
  rows: ToolRow[];
  initialArea?: string;
}) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState(initialArea ?? "All");

  const areas = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.area)))],
    [rows]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesArea = area === "All" || r.area === area;
      if (!matchesArea) return false;
      if (!q) return true;
      return (
        r.task.toLowerCase().includes(q) ||
        r.tool.toLowerCase().includes(q) ||
        r.table.toLowerCase().includes(q)
      );
    });
  }, [rows, query, area]);

  return (
    <div className="my-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--edge)] bg-[var(--surface-2)] px-3 py-2 focus-within:border-[var(--edge-strong)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: task, resource, or table…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {areas.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setArea(a)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                area === a
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-[var(--edge)] text-muted hover:text-ink"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--edge)] bg-[var(--surface)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--edge)] bg-[var(--surface-2)]">
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted sm:px-4">I need to…</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted sm:px-4">Area</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted sm:px-4">Use this</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted sm:px-4">Lands in</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted">
                  No rows match — try a different task, resource, or table name.
                </td>
              </tr>
            )}
            {filtered.map((r, i) => (
              <tr key={i} className="border-b border-[var(--edge)] last:border-0 hover:bg-white/[0.02]">
                <td className="px-3 py-3 align-top leading-6 text-muted-strong sm:px-4">{r.task}</td>
                <td className="px-3 py-3 align-top leading-6 text-muted sm:px-4">{r.area}</td>
                <td className="px-3 py-3 align-top leading-6 sm:px-4">
                  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.82em] text-zinc-100">
                    {r.tool}
                  </code>
                  <span
                    className={`ml-2 inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CHIP[r.kind]}`}
                  >
                    {r.kind}
                  </span>
                </td>
                <td className="px-3 py-3 align-top leading-6 sm:px-4">
                  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.82em] text-zinc-100">
                    {r.table}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted">
        {filtered.length} of {rows.length} rows · confirm resource/job names against your instance
        (REST base: <code className="font-mono text-muted-strong">fscmRestApi</code> Financials ·{" "}
        <code className="font-mono text-muted-strong">scmRestApi</code> SCM).
      </p>
    </div>
  );
}
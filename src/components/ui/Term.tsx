import { ReactNode } from "react";
import { TERMS, type TermKey } from "@/lib/terms";

export default function Term({ k, children }: { k: TermKey; children?: ReactNode }) {
  const def = TERMS[k];
  return (
    <span
      tabIndex={0}
      aria-label={`${def.term}: ${def.def}`}
      className="group relative inline-block cursor-help border-b border-dotted border-accent/50 text-accent"
    >
      {children ?? def.term}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-64 -translate-x-1/2 rounded-lg border border-[var(--edge-strong)] bg-[var(--surface-2)] p-3 text-left shadow-2xl group-hover:block group-focus:block"
      >
        <span className="mb-1 block text-xs font-bold tracking-wide text-accent">{def.term}</span>
        <span className="block text-xs leading-5 text-muted-strong">{def.def}</span>
      </span>
    </span>
  );
}

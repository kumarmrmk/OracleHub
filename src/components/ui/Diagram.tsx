import { ReactNode } from "react";

export type NodeTone = "fusion" | "oic" | "vbcs" | "neutral" | "accent" | "success" | "warning";

const toneStyles: Record<NodeTone, { box: string; title: string }> = {
  fusion: {
    box: "border-accent/40 bg-[var(--accent-soft)]",
    title: "text-[var(--accent)]",
  },
  oic: {
    box: "border-sky-500/40 bg-sky-500/[0.08]",
    title: "text-sky-300",
  },
  vbcs: {
    box: "border-emerald-500/40 bg-emerald-500/[0.08]",
    title: "text-emerald-300",
  },
  neutral: {
    box: "border-[var(--edge-strong)] bg-[var(--surface-2)]",
    title: "text-ink",
  },
  accent: {
    box: "border-fuchsia-500/40 bg-fuchsia-500/[0.08]",
    title: "text-fuchsia-300",
  },
  success: {
    box: "border-emerald-500/40 bg-emerald-500/[0.08]",
    title: "text-emerald-300",
  },
  warning: {
    box: "border-amber-500/40 bg-amber-500/[0.1]",
    title: "text-amber-300",
  },
};

export function DiagramNode({
  title,
  subtitle,
  tone = "neutral",
  icon,
}: {
  title: string;
  subtitle?: string;
  tone?: NodeTone;
  icon?: string;
}) {
  const t = toneStyles[tone];
  return (
    <div
      className={`flex min-w-[130px] max-w-[220px] flex-1 flex-col items-center justify-center rounded-xl border ${t.box} px-4 py-3 text-center`}
    >
      {icon && <span className="mb-1 text-lg leading-none">{icon}</span>}
      <span className={`text-sm font-semibold leading-tight ${t.title}`}>{title}</span>
      {subtitle && <span className="mt-1 text-[11px] leading-snug text-muted">{subtitle}</span>}
    </div>
  );
}

export function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center justify-center self-center px-1 text-muted">
      <span aria-hidden className="text-lg leading-none">
        →
      </span>
      {label && <span className="mt-1 whitespace-nowrap text-[10px] text-muted">{label}</span>}
    </div>
  );
}

export default function Diagram({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`my-6 rounded-xl border border-[var(--edge)] bg-[var(--surface)] p-5 ${className}`}
    >
      {title && (
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted">{title}</p>
      )}
      <div className="flex flex-wrap items-stretch gap-y-3">{children}</div>
    </div>
  );
}
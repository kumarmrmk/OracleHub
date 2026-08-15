import { ReactNode } from "react";

const styles = {
  info: {
    label: "Info",
    border: "border-sky-500/30",
    bg: "bg-sky-500/[0.07]",
    badge: "bg-sky-500/15 text-sky-300",
    icon: "ℹ",
    iconBg: "bg-sky-500/15 text-sky-300",
  },
  tip: {
    label: "Tip",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/[0.07]",
    badge: "bg-emerald-500/15 text-emerald-300",
    icon: "✓",
    iconBg: "bg-emerald-500/15 text-emerald-300",
  },
  warning: {
    label: "Warning",
    border: "border-amber-500/40",
    bg: "bg-amber-500/[0.07]",
    badge: "bg-amber-500/15 text-amber-300",
    icon: "!",
    iconBg: "bg-amber-500/15 text-amber-300",
  },
  danger: {
    label: "Danger",
    border: "border-red-500/40",
    bg: "bg-red-500/[0.07]",
    badge: "bg-red-500/15 text-red-300",
    icon: "✕",
    iconBg: "bg-red-500/15 text-red-300",
  },
  example: {
    label: "Example",
    border: "border-[var(--accent)]/40",
    bg: "bg-[var(--accent-soft)]",
    badge: "bg-[var(--accent)]/15 text-[var(--accent)]",
    icon: "⟶",
    iconBg: "bg-[var(--accent)]/15 text-[var(--accent)]",
  },
  note: {
    label: "Note",
    border: "border-zinc-500/30",
    bg: "bg-zinc-500/[0.06]",
    badge: "bg-zinc-500/15 text-zinc-300",
    icon: "⋯",
    iconBg: "bg-zinc-500/15 text-zinc-300",
  },
} as const;

export type CalloutType = keyof typeof styles;

export default function Callout({
  type = "info",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}) {
  const s = styles[type];
  return (
    <div className={`my-5 rounded-xl border ${s.border} ${s.bg} p-4`}>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`inline-flex size-5 items-center justify-center rounded-full text-xs font-bold ${s.iconBg}`}
        >
          {s.icon}
        </span>
        <span className={`text-xs font-semibold uppercase tracking-wider ${s.badge.split(" ")[1]}`}>
          {title || s.label}
        </span>
      </div>
      <div className="text-[15px] leading-relaxed text-muted-strong sm:text-sm">{children}</div>
    </div>
  );
}

export function K({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-100">
      {children}
    </code>
  );
}
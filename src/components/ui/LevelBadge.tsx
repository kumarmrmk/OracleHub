export type PathLevel = "Foundation" | "Module" | "Advanced";

const levelStyles: Record<PathLevel, string> = {
  Foundation: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  Module: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Advanced: "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300",
};

export default function LevelBadge({ level }: { level: PathLevel }) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${levelStyles[level]}`}
    >
      {level}
    </span>
  );
}

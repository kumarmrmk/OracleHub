import Link from "next/link";
import LevelBadge, { type PathLevel } from "@/components/ui/LevelBadge";

export type PathStep = {
  href: string;
  title: string;
  level: PathLevel;
  outcome: string;
};

export default function LearningPath({
  title = "Learning path — read in this order",
  steps,
}: {
  title?: string;
  steps: PathStep[];
}) {
  return (
    <div className="my-6 rounded-xl border border-[var(--edge)] bg-[var(--surface)] p-5">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted">{title}</p>
      <ol className="space-y-0">
        {steps.map((step, i) => (
          <li key={step.href} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                {i + 1}
              </span>
              {i < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-[var(--edge)]" />}
            </div>
            <div className="pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={step.href}
                  className="font-semibold text-ink transition-colors hover:text-accent"
                >
                  {step.title}
                </Link>
                <LevelBadge level={step.level} />
              </div>
              <p className="mt-0.5 text-sm leading-6 text-muted">{step.outcome}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

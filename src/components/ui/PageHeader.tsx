import { ReactNode } from "react";
import Link from "next/link";
import LevelBadge, { type PathLevel } from "@/components/ui/LevelBadge";

export default function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  updated,
  level,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  breadcrumbs: { label: string; href?: string }[];
  updated?: string;
  level?: PathLevel;
}) {
  return (
    <header className="mb-10 border-b border-[var(--edge)] pb-8">
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-zinc-600">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="transition-colors hover:text-ink">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-muted-strong">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
      <p className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent">
        {eyebrow}
        {level && <LevelBadge level={level} />}
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-muted sm:text-[15px]">{description}</p>
      {updated && (
        <p className="mt-4 text-xs text-muted">
          <span className="font-mono">Last updated:</span> {updated}
        </p>
      )}
    </header>
  );
}

export function H2({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-4 mt-12 scroll-mt-24 text-2xl font-bold tracking-tight text-ink"
    >
      {children}
    </h2>
  );
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h3 id={id} className="mb-3 mt-8 scroll-mt-24 text-lg font-semibold tracking-tight text-ink">
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-base leading-7 text-muted-strong sm:text-[15px]">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="mb-5 list-disc space-y-2 pl-6 text-base leading-7 text-muted-strong sm:text-[15px]">
      {children}
    </ul>
  );
}
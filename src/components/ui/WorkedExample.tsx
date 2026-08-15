import { ReactNode } from "react";
import Callout from "@/components/ui/Callout";

export type WorkedStep = {
  label: string;
  body: ReactNode;
};

export type JournalRow = {
  account: ReactNode;
  debit?: ReactNode;
  credit?: ReactNode;
};

function cell(v?: ReactNode) {
  return v === undefined || v === null ? "" : v;
}

export function JournalLines({ rows }: { rows: JournalRow[] }) {
  return (
    <div className="my-4 overflow-hidden rounded-lg border border-[var(--edge)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--edge)] bg-black/25">
            <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
              Account
            </th>
            <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted">
              Debit
            </th>
            <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-muted">
              Credit
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[var(--edge)] last:border-0">
              <td className="px-3 py-2 text-[13px] leading-6 text-muted-strong">{r.account}</td>
              <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-[13px] text-emerald-300">
                {cell(r.debit)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right font-mono text-[13px] text-amber-300">
                {cell(r.credit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WorkedExample({
  title,
  intro,
  steps,
  journal,
  outcome,
  children,
}: {
  title: string;
  intro?: ReactNode;
  steps?: WorkedStep[];
  journal?: JournalRow[];
  outcome?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Callout type="example" title={title}>
      {intro && <div className="mb-4 text-[15px] leading-7 text-muted-strong">{intro}</div>}
      {steps?.map((s) => (
        <div key={s.label} className="mb-4 last:mb-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
            {s.label}
          </p>
          <div className="text-[15px] leading-7 text-muted-strong">{s.body}</div>
        </div>
      ))}
      {journal && <JournalLines rows={journal} />}
      {outcome && <div className="mt-4 text-[15px] leading-7 text-muted-strong">{outcome}</div>}
      {children}
    </Callout>
  );
}

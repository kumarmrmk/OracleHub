import { ReactNode } from "react";

export default function DataTable({
  headers,
  rows,
  className = "",
}: {
  headers: string[];
  rows: (string | ReactNode)[][];
  className?: string;
}) {
  return (
    <div
      className={`my-5 overflow-x-auto rounded-xl border border-[var(--edge)] bg-[var(--surface)] ${className}`}
    >
      <table className="w-full min-w-[500px] text-left text-sm sm:min-w-[560px]">
        <thead>
          <tr className="border-b border-[var(--edge)] bg-[var(--surface-2)]">
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted sm:px-4"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-[var(--edge)] transition-colors last:border-0 hover:bg-white/[0.02]`}
            >
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-3 align-top leading-6 text-muted-strong sm:px-4">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
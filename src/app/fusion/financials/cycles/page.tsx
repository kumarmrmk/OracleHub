import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "Business Cycles",
};

const cycles = [
  {
    href: "/fusion/financials/cycles/r2r",
    title: "Record-to-Report (R2R)",
    desc: "The month-end journey: sub-ledgers post to the GL, periods close, balances consolidate, and financial statements come out. The cycle every accountant owns.",
    tone: "border-t-sky-500/60",
    icon: "📊",
  },
  {
    href: "/fusion/financials/cycles/p2p",
    title: "Procure-to-Pay (P2P)",
    desc: "You buy: requisition → PO → goods → supplier invoice → payment → bank reconciliation. The classic integration target and the most common way money leaves the company.",
    tone: "border-t-emerald-500/60",
    icon: "🛒",
  },
  {
    href: "/fusion/financials/cycles/o2c",
    title: "Order-to-Cash (O2C)",
    desc: "You sell: order → shipment → AR invoice → AutoInvoice → receipt → lockbox → collections. The cycle that turns sales into cash in the bank.",
    tone: "border-t-amber-500/60",
    icon: "💰",
  },
];

export default function BusinessCyclesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Business Cycles"
        description="Modules are tools; business cycles are the work. These three end-to-end walks trace a real transaction through every module it touches — the system of record, the tables it lands in, the REST/FBDI surface at each hop, and the failures worth planning for."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Business Cycles" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Why learn cycles, not just modules">
        Consultants are hired to fix <em>processes</em>, not single screens. Inventory, receivables,
        payables, and the close all look different when you see them as one transaction flowing
        through the whole business. Each cycle page assumes the module pages — read the relevant
        module first if a term is unfamiliar.
      </Callout>

      <H2>The three cycles</H2>
      <P>
        Together these three cover the financial heart of any business: money you spend (P2P), money
        you earn (O2C), and the reporting that wraps both (R2R).
      </P>
      <div className="grid gap-4 md:grid-cols-3">
        {cycles.map((c) => (
          <a
            key={c.href}
            href={c.href}
            className={`group flex flex-col rounded-2xl border border-[var(--edge)] border-t-2 ${c.tone} bg-[var(--surface)] p-5 transition-colors hover:bg-[var(--surface-2)]`}
          >
            <span className="mb-2 text-2xl">{c.icon}</span>
            <h3 className="mb-1 font-bold text-ink group-hover:text-accent">{c.title}</h3>
            <p className="text-sm leading-6 text-muted">{c.desc}</p>
          </a>
        ))}
      </div>

      <H2>How the cycles connect</H2>
      <Diagram title="One business, three cycles" className="mb-8">
        <DiagramNode tone="warning" icon="🛒" title="Procure-to-Pay" subtitle="spend · AP · payments" />
        <Arrow />
        <DiagramNode tone="fusion" icon="📊" title="Record-to-Report" subtitle="sub-ledgers · GL · close · reports" />
        <Arrow />
        <DiagramNode tone="warning" icon="💰" title="Order-to-Cash" subtitle="sales · AR · receipts" />
      </Diagram>
      <P>
        Every sub-ledger transaction (from P2P and O2C) ends in the <strong>GL</strong> through
        subledger accounting, and every bank movement (payments and receipts) is confirmed by{" "}
        <strong>Cash Management</strong>. R2R is the reporting layer on top of all of it —
        that is why it is the cycle that finishes last, at month-end.
      </P>

      <H2>Which modules each cycle touches</H2>
      <DataTable
        headers={["Business cycle", "Modules in the flow", "Message for the learner"]}
        rows={[
          ["Record-to-Report", "GL · Subledger Accounting · Financial Close · Reporting · (all sub-ledgers)", "Understand SLA and close before anything else — this cycle is where reporting lives"],
          ["Procure-to-Pay", "Procurement → Payables → Cash Management → GL", "Suppliers before invoices, invoice before payment — the load-order rules apply here"],
          ["Order-to-Cash", "Order Management → Receivables → Cash Management → GL · (Sales/CPQ feeds AutoInvoice)", "Customer master before invoicing, AutoInvoice runs before receipts — and the order ships before either"],
        ]}
      />

      <H2>Next steps</H2>
      <UL>
        <li>Start with the cycle that matches your work: <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/p2p">P2P</a>, <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/o2c">O2C</a>, or <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/r2r">R2R</a>.</li>
        <li>Return to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">ERP Financials hub</a> for the module-by-module detail.</li>
      </UL>
    </>
  );
}
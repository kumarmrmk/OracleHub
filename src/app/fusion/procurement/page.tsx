import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import LearningPath from "@/components/ui/LearningPath";
import Term from "@/components/ui/Term";
import Link from "next/link";

export const metadata = {
  title: "Procurement",
};

const workflows = [
  {
    key: "sup",
    title: "Suppliers & Agreements",
    desc: "The supplier master (party, sites, bank) and the blanket/contract agreements POs draw on.",
    tone: "border-t-accent/60",
  },
  {
    key: "src",
    title: "Sourcing & Auctions",
    desc: "RFQs, sourcing projects, reverse auctions, and awards that become agreements or POs.",
    tone: "border-t-indigo-500/60",
  },
  {
    key: "pr",
    title: "Requisitions",
    desc: "Request what the business needs, route it for approval, and turn it into a purchase order.",
    tone: "border-t-sky-500/60",
  },
  {
    key: "po",
    title: "Purchase Orders",
    desc: "The contract to buy: document types, lines, distributions, approvals, change orders.",
    tone: "border-t-emerald-500/60",
  },
  {
    key: "rcv",
    title: "Receiving",
    desc: "What actually arrives: receipts, returns, inspection, and the interfaces that post them.",
    tone: "border-t-amber-500/60",
  },
];

const workflowsHref: Record<string, string> = {
  sup: "/fusion/procurement/suppliers",
  src: "/fusion/procurement/sourcing",
  pr: "/fusion/procurement/requisitions",
  po: "/fusion/procurement/purchase-orders",
  rcv: "/fusion/procurement/receiving",
};

export default function ProcurementPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Procurement"
        description="The buying side of the business: how a need becomes a supplier payment. Procurement covers requisitions, purchase orders, suppliers, sourcing, and receiving — and it hands the result to Payables for the invoice and payment steps you already learned in P2P. This hub is the starting point; the deep dives below cover each area in functional and technical detail."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement" }, { label: "Procurement" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Prerequisites">
        Read{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a>{" "}
        (business units, legal entity),{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a>{" "}
        (the invoice/payment side of the same flow), and it helps to have seen the{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/p2p">Procure-to-Pay cycle</a> first.
      </Callout>

      <H2>The business story</H2>
      <P>
        Someone needs something — a laptop, a service, raw material. <strong>Procurement</strong>{" "}
        is the discipline that turns that need into a paid invoice, in controlled steps: someone{" "}
        <em>requests</em> it (requisition), a buyer <em>orders</em> it (purchase order), the
        warehouse <em>receives</em> it (receipt), and Payables <em>pays</em> the supplier's{" "}
        <em>invoice</em>. Procurement owns everything up to the receipt; Payables owns the
        invoice and payment.
      </P>
      <Diagram title="The procurement lifecycle" className="mb-8">
        <DiagramNode tone="neutral" icon="📝" title="Requisition" subtitle="the need · approved by manager" />
        <Arrow />
        <DiagramNode tone="neutral" icon="📄" title="Purchase Order" subtitle="the contract · supplier + lines" />
        <Arrow />
        <DiagramNode tone="neutral" icon="📦" title="Receipt" subtitle="what actually arrived" />
        <Arrow />
        <DiagramNode tone="fusion" icon="🧾" title="Invoice (AP)" subtitle="validated · matched · paid in Payables" />
      </Diagram>
      <Callout type="info">
        The three documents tie together through <strong>matching</strong>: Payables compares the
        invoice to the PO (2-way) and the receipt (3-way) before paying. So what Procurement creates
        — approved POs and accurate receipts — is what makes cleaner payments downstream.
      </Callout>

      <H2>Learning path — read in this order</H2>
      <LearningPath
        steps={[
          {
            href: "/fusion/procurement/suppliers",
            title: "Suppliers & Agreements",
            level: "Foundation",
            outcome: "The supplier master (party, sites, bank) plus blanket/contract agreements every PO builds on.",
          },
          {
            href: "/fusion/procurement/requisitions",
            title: "Requisitions",
            level: "Module",
            outcome: "How a request for goods/services is created, approved, and passed to a buyer.",
          },
          {
            href: "/fusion/procurement/purchase-orders",
            title: "Purchase Orders",
            level: "Module",
            outcome: "The PO document, its types, lines, distributions, and approval — the contract to buy.",
          },
          {
            href: "/fusion/procurement/receiving",
            title: "Receiving",
            level: "Module",
            outcome: "How goods arrive, are inspected, and post as receipts that enable 3-way match.",
          },
          {
            href: "/fusion/procurement/sourcing",
            title: "Sourcing & Auctions",
            level: "Advanced",
            outcome: "RFQs, sourcing projects, reverse auctions, and awards that become agreements or POs.",
          },
        ]}
      />

      <H2>The processes</H2>
      <div className="grid gap-4 md:grid-cols-3">
        {workflows.map((w) => (
          <a
            key={w.key}
            href={workflowsHref[w.key]}
            className={`group rounded-2xl border border-[var(--edge)] border-t-2 ${w.tone} bg-[var(--surface)] p-5 transition-colors hover:bg-[var(--surface-2)]`}
          >
            <h3 className="mb-1 font-bold text-ink group-hover:text-accent">{w.title}</h3>
            <p className="text-sm leading-6 text-muted">{w.desc}</p>
          </a>
        ))}
      </div>

      <H2>Functional ↔ technical reference</H2>
      <DataTable
        headers={["Business object", "Module", "REST resource", "FBDI template"]}
        rows={[
          ["Requisition (header + lines)", "Procurement", <K key="r1">requisitionLines</K>, "— (requisitions are usually created via REST or self-service)"],
          ["Purchase order", "Procurement", <K key="r2">purchaseOrders</K>, "Import Purchase Orders"],
          ["Purchase order lines / distribution", "Procurement", <K key="r3">purchaseOrderLines / purchaseOrderDistributions</K>, "Same load (Import Purchase Orders)"],
          ["Supplier", "Procurement (shared)", "— (party data is Common Features)", <K key="f1">Supplier FBDI</K>],
          ["Supplier site", "Procurement (shared)", "— (site data is Common Features)", <K key="f2">Supplier Sites FBDI</K>],
          ["Receipt", "Procurement", <K key="r4">receipts / receivingTransactions</K>, "Import Receipts"],
        ]}
      />
      <Callout type="warning">
        The Procurement REST resources live under the <K>scmRestApi</K> base (e.g.{" "}
        <K>purchaseOrders</K>), not the Financials <K>fscmRestApi</K>. Confirm resource names
        against your instance's REST service catalog before building.
      </Callout>

      <H2>Configuration</H2>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Procurement business unit", "Owns the requisition/PO document numbering and rules", "Enterprise Structures → Business Units"],
          ["Document types & numbering", "Controls PO vs REQ numbering and sequencing", "Procurement → Purchasing → Document Types"],
          ["Approval rules", "Who approves requisitions and POs and in what order", "Procurement → Approval Rules (BPM)"],
          ["Buyer assignments", "Which buyer owns which category", "Procurement → Buyers"],
          ["Receiving parameters", "Over-receipt tolerance, inspection rules", "Procurement → Receiving Options"],
          ["Supplier & site setup", "The supplier must exist before a PO or receipt", "Supplier Registration (shared with Payables)"],
        ]}
      />

      <H2>Data flow — step by step</H2>
      <P>
        Where the procurement chain lands in the underlying tables. These are the purchase-side
        tables that feed directly into the Payables invoice tables you already know.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "A requisition is created and approved", <span key="t1c"><K key="t1">POR_REQ_HEADERS_ALL</K>, <K key="t2">POR_REQ_LINES_ALL</K></span>],
          ["2", "The requisition is converted into a purchase order", <K key="t3">PO_HEADERS_ALL</K>],
          ["3", "PO lines carry the items and quantities", <K key="t4">PO_LINES_ALL</K>],
          ["4", "PO distributions hold the accounts the charge will post to", <K key="t5">PO_DISTRIBUTIONS_ALL</K>],
          ["5", "Goods are received against the PO line", <K key="t6">RCV_TRANSACTIONS</K>],
          ["6", "Receiving flows into Payables for accrual/matching", <K key="t7">AP matching / accrual entries</K>],
          ["7", "The invoice arrives and is matched to PO + receipt (3-way)", <span key="t8c"><K key="t8">AP_INVOICES_ALL</K>, <K key="t9">AP_INVOICE_MATCHES_ALL</K></span>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Load order matters:</strong> supplier → supplier site → PO → receipt. Each step validates the one before it.</li>
        <li><strong>Requisitions are two-path:</strong> self-service entry for users, or <K>requisitionLines</K> REST for external systems — then approval runs.</li>
        <li><strong>POs can be created or updated via REST</strong> (<K>purchaseOrders</K>); bulk moves use the Purchase Order Import FBDI.</li>
        <li><strong>Receiving closes the loop:</strong> without a receipt, 3-way match fails and the invoice is held.</li>
        <li><strong>Different base URL:</strong> Procurement REST uses <K>scmRestApi</K>; Financials uses <K>fscmRestApi</K>.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/payables">Payables troubleshooting</a>{" "}
        for invoice/match issues, and watch this space for a dedicated Procurement troubleshooting page.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Start with <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/requisitions">Requisitions</a>, then <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/purchase-orders">Purchase Orders</a>, then <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/receiving">Receiving</a>.</li>
        <li>See the whole money-out cycle in <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/p2p">Procure-to-Pay</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a> or the <Link className="font-semibold text-accent hover:underline" href="/">home learning path</Link>.</li>
      </UL>
    </>
  );
}
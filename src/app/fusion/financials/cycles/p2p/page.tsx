import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Procure-to-Pay (P2P)",
};

export default function P2pPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud · Business Cycles"
        title="Procure-to-Pay (P2P)"
        description={<>The cycle that turns a need into a payment: requisition → purchase order → goods receipt → supplier invoice → payment → <Term k="reconciliation">bank reconciliation</Term>. It spans Procurement, Payables, Cash Management, and the GL — and it is the most common end-to-end flow consultants are asked to integrate.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Business Cycles", href: "/fusion/financials/cycles" }, { label: "Procure-to-Pay" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/invoices">Invoice Entry &amp; Validation</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/payments">Payments &amp; PPR</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/reconciliation">Reconciliation</a> first.
      </Callout>

      <H2>The business story</H2>
      <P>
        Someone needs goods or services. The company buys them, receives them, gets billed, and pays
        the supplier. Each step moves through a different module, and each module has its own rules —
        an invoice cannot be paid until the PO exists, the goods are received, and the invoice is
        validated and approved.
      </P>

      <H2>The cycle at a glance</H2>
      <Diagram title="Procure-to-Pay flow" className="mb-8">
        <DiagramNode tone="neutral" icon="📝" title="Requisition" subtitle="the need · approved by manager" />
        <Arrow />
        <DiagramNode tone="neutral" icon="📄" title="Purchase Order" subtitle="the contract · supplier + lines" />
        <Arrow />
        <DiagramNode tone="neutral" icon="📦" title="Goods Receipt" subtitle="what actually arrived" />
        <Arrow />
        <DiagramNode tone="fusion" icon="🧾" title="Supplier Invoice" subtitle="AP · validated & approved" />
        <Arrow />
        <DiagramNode tone="fusion" icon="💸" title="Payment (PPR)" subtitle="EFT / ACH / SEPA / check" />
        <Arrow />
        <DiagramNode tone="warning" icon="🏦" title="Bank Reconciliation" subtitle="statement matches the payment" />
      </Diagram>

      <H2>Step by step — where the data lands</H2>
      <P>
        Every hop below shows the module, the table it lands in, and the integration surface you would
        use. Table names follow the Fusion data dictionary — confirm against your release.
      </P>
      <DataTable
        headers={["Step", "What happens", "Module", "Table / surface"]}
        rows={[
          ["1", "Employee requests goods — requisition created and approved", "Procurement", "POR_REQ_HEADERS_ALL / requisition REST (Procurement APIs)"],
          ["2", "Requisition becomes a purchase order with a supplier and lines", "Procurement", "PO_HEADERS_ALL, PO_LINES_ALL / <K>purchaseOrders</K> REST"],
          ["3", "Goods or services are received against the PO", "Procurement", "RCV_HEADERS_INTERFACE / RCV_TRANSACTIONS (receiving)"],
          ["4", "Supplier sends the invoice — created via REST, FBDI, or IDR capture", "Payables", "AP_INVOICES_INTERFACE → <K>invoices</K> / Payables Standard Invoice Import"],
          ["5", "Invoice is validated (2/3-way match, tax, accounts) and approved", "Payables", "AP_INVOICES_ALL, AP_INVOICE_LINES_ALL / <K>invoices</K> action <K>validateInvoice</K>"],
          ["6", "Accounting is created for the invoice", <Term key="sla" k="sla">SLA</Term>, "XLA_AE_HEADERS / XLA_AE_LINES (Create Accounting job)"],
          ["7", <><Term k="ppr">Payment Process Request</Term> builds and transmits the payment</>, "Payables", "IBY_PAYMENTS_ALL, AP_INVOICE_PAYMENTS_ALL / Submit PPR via erpProcesses"],
          ["8", "The bank statement confirms the payment left the bank", "Cash Management", "CE_STATEMENT_LINES → automatic reconciliation"],
        ]}
      />

      <H2>The matching rule that holds P2P together</H2>
      <P>
        P2P breaks unless the invoice "agrees" with the PO and the receipt. Payables matches three
        documents:
      </P>
      <DataTable
        headers={["Match", "What it compares", "Why it matters"]}
        rows={[
          ["2-way (invoice ↔ PO)", "Price, quantity, and account between invoice line and PO line", "Catches price/quantity drift and prevents overpayment"],
          ["3-way (invoice ↔ PO ↔ receipt)", "Adds the received quantity to the match", "You only pay for what actually arrived"],
          ["Tolerances", "Allowed % variance on price/amount/quantity before a hold", "Small differences are approved automatically instead of stopping the flow"],
        ]}
      />
      <Callout type="info">
        If matching fails, Payables places a <strong>hold</strong> on the invoice and it stops in{" "}
        <em>Requires Re-approval</em>. See{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/holds-matching">Holds &amp; PO Matching</a>.
      </Callout>

      <H2>Worked example — one invoice through P2P</H2>
      <Callout type="example" title="Worked example: buy a $1,200 laptop on PO">
        <p className="mb-2"><strong>The PO:</strong> 2 × laptop at $600 each, tax 10%, supplier "Acme IT".</p>
        <p className="mb-2"><strong>The receipt:</strong> 2 units received → 3-way match possible.</p>
        <p className="mb-2"><strong>The invoice:</strong> $1,200 goods + $120 tax = $1,320 total. Validation passes (within tolerance, PO and receipt match).</p>
        <p className="mb-2"><strong>Accounting (SLA):</strong> Dr Equipment 1,200 · Dr Input tax 120 · Cr AP liability 1,320.</p>
        <p className="mb-0"><strong>The payment:</strong> PPR selects the invoice, builds an ACH file for $1,320, the bank statement clears it, and reconciliation marks it matched.</p>
      </Callout>

      <H2>Common failure points</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["Invoice rejects — supplier not found", "Supplier/site loaded after the invoice", "Load suppliers before invoices (load order)"],
          ["3-way match hold", "Receipt quantity ≠ invoice quantity", "Receive the goods or adjust the invoice line"],
          ["Tax error on the line", "Tax code missing or not set up for the territory", "Set the correct tax code/regime first"],
          ["Invoice won't post — period closed", "The AP period is closed", "Open the period or use the open one"],
          ["Payment not in the bank", "PPR not submitted or file not transmitted", "Submit the PPR and check the transmission status"],
          ["Statement line unmatched", "Reference/amount differs from the payment", "Adjust the matching rule or reconcile manually"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Order matters:</strong> supplier → PO → receipt → invoice. Each step validates the one before it.</li>
        <li><strong>Two paths for invoices:</strong> a handful via <K>invoices</K> REST; thousands via the Payables Standard Invoice Import into <K>AP_INVOICES_INTERFACE</K>.</li>
        <li><strong>Payments are a job, not a REST call:</strong> build the PPR and submit it via <K>erpProcesses</K>.</li>
        <li><strong>Reconciliation is semi-automatic:</strong> plan for unmatched lines and define matching rules before go-live.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>See the money-out side in <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a>.</li>
        <li>Follow the cash into the bank in <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/reconciliation">Reconciliation &amp; Forecasting</a>.</li>
        <li>See the counterpart cycle that brings money in: <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/o2c">Order-to-Cash</a>.</li>
      </UL>
    </>
  );
}
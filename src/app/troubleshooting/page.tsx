import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "Troubleshooting & Errors",
};

export default function TroubleshootingHubPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="Everything fails in one of three layers"
        description="In Fusion there are only three ways data gets in or out: real-time REST, bulk FBDI, and scheduled ESS jobs. Every error you will ever see comes from one of them. Diagnose the layer first, then read the message — this section has a page for each layer and each Financials module."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }]}
        updated="February 2025"
      />

      <H2>The diagnosis method</H2>
      <P>
        Follow the same five steps for every failure — they resolve most issues before you ever open
        a log.
      </P>
      <Diagram title="Diagnose in order" className="mb-8">
        <DiagramNode tone="neutral" title="1 · Reproduce" subtitle="what exactly was sent, when, by whom" />
        <Arrow />
        <DiagramNode tone="neutral" title="2 · Identify the layer" subtitle="REST · FBDI · ESS?" />
        <Arrow />
        <DiagramNode tone="fusion" title="3 · Check the status" subtitle="HTTP code · import status · job status" />
        <Arrow />
        <DiagramNode tone="neutral" title="4 · Read the output" subtitle="error body · output.txt · log" />
        <Arrow />
        <DiagramNode tone="success" title="5 · Fix & verify" subtitle="correct the data/setup, resubmit, confirm" />
      </Diagram>

      <H2>The three layers</H2>
      <DataTable
        headers={["Layer", "When you hit it", "Where the error lives", "Page"]}
        rows={[
          ["REST (real-time)", "API calls, custom code, OIC integrations", "HTTP status + error body (title/detail/o:errorDetails)", <a key="l1" className="font-semibold text-accent hover:underline" href="/troubleshooting/rest-api">REST API errors</a>],
          ["FBDI (bulk)", "File imports: upload, validate, run", "Import status + output.txt per row", <a key="l2" className="font-semibold text-accent hover:underline" href="/troubleshooting/fbdi">FBDI import errors</a>],
          ["ESS (jobs/reports)", "Any scheduled process or report", "Job status + output + log", <a key="l3" className="font-semibold text-accent hover:underline" href="/troubleshooting/ess">ESS job errors</a>],
        ]}
      />

      <H2>The same causes, over and over</H2>
      <P>
        Across all modules, most errors trace back to a handful of root causes. Check these before
        anything else:
      </P>
      <DataTable
        headers={["Root cause", "Typical symptom", "Fix"]}
        rows={[
          ["Period is closed", "Import or post fails for a date in the past", "Open the period or use the open one"],
          ["Missing reference data", "Supplier/customer/item/account not found", "Create it first — load order matters"],
          ["Invalid account combination", "Distribution/journal rejected", "Fix the COA segment values"],
          ["Tax code missing or wrong", "Invoice line fails validation", "Set the correct tax code per territory/entity"],
          ["Security / BU context", "User can't see or act on a record", "Add BU (MOAC) or data access set to the duty"],
          ["Approval not complete", "Record can't be paid/posted/finalized", "Approve the pending task"],
          ["Wrong setup value", "Validation rejects a status/category/type", "Map the legacy value to the Fusion value"],
        ]}
      />

      <H2>Module-specific troubleshooting</H2>
      <P>
        Each module has its own page of common failures:
      </P>
      <UL>
        <li><a className="font-semibold text-accent hover:underline" href="/troubleshooting/gl">General Ledger</a> — posting, periods, accounts, balances</li>
        <li><a className="font-semibold text-accent hover:underline" href="/troubleshooting/payables">Payables</a> — invoice validation, holds, suppliers, payments</li>
        <li><a className="font-semibold text-accent hover:underline" href="/troubleshooting/receivables">Receivables</a> — AutoInvoice, receipts, customers</li>
        <li><a className="font-semibold text-accent hover:underline" href="/troubleshooting/cash-management">Cash Management</a> — statements, reconciliation, bank accounts</li>
        <li><a className="font-semibold text-accent hover:underline" href="/troubleshooting/fixed-assets">Fixed Assets</a> — depreciation runs, additions, retirements</li>
        <li><a className="font-semibold text-accent hover:underline" href="/troubleshooting/expenses">Expenses</a> — approvals, card transactions, accounting</li>
        <li><a className="font-semibold text-accent hover:underline" href="/troubleshooting/procurement">Procurement</a> — requisitions, purchase orders, receiving, suppliers</li>
        <li><a className="font-semibold text-accent hover:underline" href="/troubleshooting/inventory">Inventory</a> — items, on-hand, transfers, counting</li>
        <li><a className="font-semibold text-accent hover:underline" href="/troubleshooting/order-management">Order Management</a> — sales orders, fulfillment, shipping</li>
      </UL>

      <Callout type="tip">
        Before debugging a technical error, rule out the <strong>setup and data</strong> causes on
        this page. In Fusion, "it's a bug" is almost always "the period is closed" or "the reference
        data doesn't exist".
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Start with the layer: <a className="font-semibold text-accent hover:underline" href="/troubleshooting/rest-api">REST</a>, <a className="font-semibold text-accent hover:underline" href="/troubleshooting/fbdi">FBDI</a>, or <a className="font-semibold text-accent hover:underline" href="/troubleshooting/ess">ESS</a>.</li>
        <li>Learn the processes that fail: <a className="font-semibold text-accent hover:underline" href="/fusion/scheduled-processes">ESS</a>, <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">FBDI</a>, <a className="font-semibold text-accent hover:underline" href="/fusion/rest-api">REST</a>.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Holds & PO Matching",
};

export default function HoldsMatchingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Holds & PO Matching"
        description={<>How Payables blocks invoices with <Term k="holds">holds</Term> and how invoice <Term k="matching">matching</Term> to purchase orders enforces price, quantity, and amount tolerances before an invoice can be paid.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Payables (AP)", href: "/fusion/financials/payables" }, { label: "Holds & PO Matching" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables hub</a> and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/invoices">Invoice Entry &amp; Validation</a> first. Matching assumes the purchase order, supplier site, and invoice already exist.
      </Callout>

      <H2>Functional view</H2>
      <P>
        A <strong>hold</strong> blocks an invoice from being paid until it is resolved. Holds are
        placed automatically by validation or matching, or manually by a user, and are released
        either automatically or after approval. <strong>PO matching</strong> compares invoice lines
        against the purchase order (and optionally its receipts) to catch price, quantity, and
        amount variances before payment.
      </P>
      <DataTable
        headers={["Hold type", "What it is", "How it is placed"]}
        rows={[
          ["Matching hold", "Invoice line differs from the PO beyond tolerance", "Automatic during validation/matching"],
          ["Tax hold", "Tax could not be determined or is missing", "Automatic during validation"],
          ["User-defined hold", "Custom hold configured for your business rules", "Automatic or manual"],
          ["System hold", "General error on the invoice (e.g. invalid account)", "Automatic during validation"],
        ]}
      />
      <Diagram title="Hold lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Invoice entered" subtitle="validated against PO" />
        <Arrow label="mismatch" />
        <DiagramNode tone="warning" title="Hold placed" subtitle="matching / tax / user-defined / system" />
        <Arrow label="release" />
        <DiagramNode tone="warning" title="Review & approve" subtitle="manual, routed to approver, or REST" />
        <Arrow label="resolved" />
        <DiagramNode tone="success" title="Approved" subtitle="ready for payment" />
      </Diagram>
      <P>Hold workflow options:</P>
      <UL>
        <li><strong>Automatic hold:</strong> placed by validation or matching when a rule fails.</li>
        <li><strong>Manual hold:</strong> placed by a user on a specific invoice.</li>
        <li><strong>Release:</strong> a hold can be released manually, by routing to approvers, or as part of a consolidated hold notification workflow.</li>
      </UL>
      <H3>PO matching levels</H3>
      <DataTable
        headers={["Match level", "What is compared", "Variance sources"]}
        rows={[
          ["2-way match", "Invoice lines vs purchase order lines", "Price and amount per line"],
          ["3-way match (receipt)", "Invoice lines vs PO lines vs receipts", "Adds received quantity checks"],
          ["Match in full", "Invoice total vs the full PO/PO distribution amount", "Overall amount variance"],
        ]}
      />
      <Callout type="info">
        Tolerance is a percentage: rate, price, amount, and quantity tolerances can each be
        configured. Exceeding tolerance places a matching hold; within tolerance the line passes.
        Variances that pass tolerance can post to a configurable variance account.
      </Callout>

      <H2>Configuration</H2>
      <P>Set up tolerances and hold definitions before loading invoices that will be matched.</P>
      <DataTable
        headers={["Setup", "What it controls", "Where it lives"]}
        rows={[
          ["Hold control options", "Global defaults for when and how holds are placed", "Payables → Invoices → Hold control options"],
          ["User-defined hold definitions", "Custom holds with names, messages, and release rules", "Payables → Invoices → Hold definitions"],
          ["Invoice tolerances", "Rate/price/amount/quantity tolerance percentages for matching", "Payables → Invoices → Matching & tolerances"],
          ["Matching rules", "Which match levels apply and how variances are treated", "Payables setup"],
        ]}
      />

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="inv">invoices</K>, <span key="c0">Child resource <K key="invh">invoiceHolds</K> with create/update — add or release holds on an invoice via REST</span>],
          [<K key="tol">payablesInvoiceTolerances</K>, "Read/lookup tolerance definitions (READ/LOV)"],
          [<K key="holds">payablesInvoiceHolds</K>, "Read/lookup invoice hold definitions (READ/LOV)"],
          [<K key="proc">erpProcesses</K>, "Submit ESS jobs (e.g. Validate Payables Invoices) to place or refresh holds"],
        ]}
      />
      <Callout type="info">
        There is no dedicated holds FBDI in the Financials FBDI guide — holds are managed through the
        invoices REST resource, the work area, or ESS validation jobs, not through an interface
        template.
      </Callout>
      <H3>Working example — release a hold via REST</H3>
      <CodeBlock
        language="bash"
        filename="PATCH /invoices/{id}/child/invoiceHolds"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/invoices/300100123456789/child/invoiceHolds/300100123456790" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X PATCH \\
  -d '{
    "ReleaseReason": "Price variance corrected by supplier credit",
    "HoldStatus": "RELEASED"
  }'`}
      />

      <H2>Data flow — step by step</H2>
      <P>Where the hold and matching lifecycle lands in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Invoice is entered and validated (matching runs against the PO)", <K key="t1">AP_INVOICES_ALL</K>, <K key="t2">AP_INVOICE_LINES_ALL</K>],
          ["2", "Matching or validation places a hold on the invoice", <span key="c0"><K key="t3">AP_HOLDS_ALL</K> (or <K key="t4">AP_INVOICE_HOLDS</K>, per release)</span>],
          ["3", "Hold is released (manual, routed to approvers, or via REST invoiceHolds)", <span key="c1"><K key="t5">AP_HOLDS_ALL</K> (hold status)</span>],
          ["4", "Invoice becomes approved and ready for payment", <span key="c2"><K key="t6">AP_INVOICES_ALL</K> (approval status)</span>],
        ]}
      />
      <Callout type="info">
        The hold table name varies by release — query your instance&apos;s data dictionary for{" "}
        <K>AP_HOLDS_ALL</K> or <K>AP_INVOICE_HOLDS</K> before relying on it. Column names follow
        the Fusion data dictionary naming; confirm against your release.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect holds and matching status.</P>
      <CodeBlock
        language="sql"
        filename="ap_holds.sql"
        code={`-- Open holds on an invoice
SELECT h.hold_name, h.hold_lookup_code, h.hold_reason,
       h.creation_date, h.release_lookup_code, h.release_reason
FROM   ap_holds_all h
WHERE  h.invoice_id = :invoice_id
AND    NVL(h.release_lookup_code, 'OPEN') != 'RELEASED'
ORDER BY h.creation_date;`}
      />
      <CodeBlock
        language="sql"
        filename="ap_matching_status.sql"
        code={`-- Matching tolerance status on invoices
SELECT i.invoice_id, i.invoice_num, i.invoice_date, i.invoice_amount,
       i.po_match_flag, i.tolerance_status
FROM   ap_invoices_all i
WHERE  i.po_match_flag = 'Y'
AND    i.invoice_date >= SYSDATE - 30
ORDER BY i.invoice_date DESC;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Matching variances within tolerance can be recorded through variance accounts; holds
        themselves create no accounting entries. When a hold is released and the invoice posts, the
        entries are the standard invoice event — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Invoice on Hold / Holds report", "Payables work area (delivered BIP reports)"],
          ["Invoices Held for Approval", "Payables work area"],
          ["Payables Invoices Real Time (with hold status)", "OTBI subject area"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Hold blocks payment:</strong> an invoice with an open hold cannot be selected by a payment process request — check hold status before paying.</li>
        <li><strong>Release via REST:</strong> use the <K>invoiceHolds</K> child resource (create/update) to add or release holds programmatically.</li>
        <li><strong>Tolerances before loading:</strong> if you know lines will exceed tolerance, either pre-release the hold or fix the source data — otherwise the invoice stalls.</li>
        <li><strong>No holds FBDI:</strong> you cannot bulk-load holds through an interface template; holds are placed by validation/matching or via REST.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/payables">Payables troubleshooting</a>{" "}
        for the most common hold and matching failures.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables (AP)</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Invoices that pass holds move on to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/payments">Payments &amp; PPR</a>.</li>
      </UL>
    </>
  );
}

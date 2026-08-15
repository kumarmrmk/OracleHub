import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Invoice Entry & Validation",
};

export default function InvoiceEntryValidationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Invoice Entry & Validation"
        description="How supplier invoices enter Fusion Payables, what validation does to them, and how to load and correct them with REST and FBDI. This is the page to read before building any AP invoice import."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Payables (AP)", href: "/fusion/financials/payables" }, { label: "Invoice Entry & Validation" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables hub</a> first, plus{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a> (business unit, legal entity) and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/flexfields">Flexfields &amp; Value Sets</a> (account flexfield). Invoices fail validation when suppliers, tax codes, or periods are missing.
      </Callout>

      <H2>Functional view</H2>
      <P>
        An AP invoice is a bill to be paid. It has a <strong>header</strong> (supplier, number, date,
        currency, terms), one or more <strong>lines</strong> (what was bought), and{" "}
        <strong>distributions</strong> (the accounts the charge posts to). Every invoice enters in
        status <em>Entered</em>, passes validation to <em>Validated</em>, and only becomes payable
        when <em>Approved</em> and <em>Posted</em>.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Invoice header", "Supplier, number, date, currency, payment terms, and overall status"],
          ["Invoice line", "The charge lines with amounts, descriptions, and tax"],
          ["Distribution", "The account combination (code combination) each line posts to"],
          ["Prepayment", "Money paid up front; can be temporary or permanent and applied to a PO"],
          ["Credit / debit memo", "Negative or corrective invoices that reduce or increase what you owe"],
          ["Recurring invoice", "A template-based invoice that repeats on a schedule without re-entry"],
        ]}
      />
      <P>Invoices come from several sources — most integrations use the first three:</P>
      <DataTable
        headers={["Source", "Notes for integrators"]}
        rows={[
          ["Manual entry", "Keyed directly in the Invoices work area; no integration needed"],
          ["Spreadsheet", "Loads from Excel via the web spreadsheet interface"],
          ["FBDI standard invoice import", "The main bulk path: stage to the interface tables, then run the import ESS job"],
          ["Payment request import", "Loads payment requests (AP_PAYMENT_REQUESTS_INT) that become invoices for payment"],
          ["IDR document capture / scanning", "Optical capture of supplier PDFs/images; produces a draft invoice to review"],
          ["Electronic invoices", "Inbound e-invoices (e.g. PEPPOL-style) mapped into AP"],
          ["Supplier portal self-service", "Suppliers enter their own invoices via the supplier portal"],
          ["Recurring invoices", "Scheduled re-creation of a saved invoice template"],
        ]}
      />
      <Diagram title="Invoice status chain" className="mb-8">
        <DiagramNode tone="neutral" title="Entered" subtitle="created via REST or FBDI" />
        <Arrow label="validate" />
        <DiagramNode tone="warning" title="Validation" subtitle="accounts, terms, tax, period" />
        <Arrow label="fail" />
        <DiagramNode tone="warning" title="Requires Re-approval" subtitle="fix the error, re-run validation" />
        <Arrow label="pass" />
        <DiagramNode tone="success" title="Approved → Posted" subtitle="ready for payment" />
      </Diagram>
      <DataTable
        headers={["Validation rule", "What it checks", "Typical failure"]}
        rows={[
          ["Account flexfield", "Each distribution resolves to a valid account combination", "Invalid or incomplete segment values"],
          ["Supplier / site", "Supplier and supplier site exist and are active", "Supplier not found — load suppliers first"],
          ["Tax", "Tax code is valid for the legal entity and date", "Missing tax code / closed tax rate"],
          ["Payment terms", "Terms exist and produce a due date", "Unknown payment term name"],
          ["Period open", "The invoice date falls in an open AP period", "Period closed or not open for AP"],
        ]}
      />
      <Callout type="tip">
        A created invoice can sit in <em>Requires Re-approval</em> if a line fails validation.
        Integrations should poll invoice status and handle the rejection path explicitly rather than
        assuming the invoice is ready for payment.
      </Callout>

      <H2>Configuration</H2>
      <P>
        Validation behavior is driven by configuration, not code. Set these up before loading invoices.
      </P>
      <DataTable
        headers={["Setup", "What it controls", "Where it lives"]}
        rows={[
          ["Invoice options", "Defaults for invoice entry, validation, and payment behavior", "Payables → Invoices → Invoice options"],
          ["Invoice types", "Categories (e.g. Standard, Credit Memo, Prepayment) with validation rules", "Payables setup"],
          ["Payment terms", "Due date calculation for the invoice", "Payables setup"],
          ["Duplicate invoice tolerance", "Blocks near-identical invoices from the same supplier", "Payables → Invoices → Matching & tolerances"],
          ["Approval workflow rules", "Which invoices need approval and who approves them", "Payables → Invoices → Approval rules"],
        ]}
      />
      <Callout type="info">
        Most invoice import failures trace back to configuration: a supplier that was never loaded, a
        closed period, a missing tax code, or a duplicate invoice number. Finish configuration and
        pre-validate a few test invoices before bulk loading.
      </Callout>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<span key="c0"><K key="inv">invoices</K> — full CRUD on supplier invoices; children <K key="invh">invoiceHolds</K> (create/update) and <K key="invl">sourceDocumentLines</K> (GET/PATCH); actions <K key="a1">validateInvoice</K>, <K key="a2">calculateTax</K>, <K key="a3">applyPrepayments</K>, <K key="a4">unapplyPrepayments</K>, <K key="a5">cancelInvoice</K>, <K key="a6">generateDistributions</K></span>],
          [<K key="pii">payablesInterfaceInvoices</K>, <span key="c2">Stage invoice rows into the interface tables (populates <K key="api">AP_INVOICES_INTERFACE</K>) for the import job to pick up</span>],
        ]}
      />
      <Callout type="warning" title="Resource names">
        Oracle 26C uses <K>invoices</K> and <K>payablesInterfaceInvoices</K>. Legacy names like{" "}
        <K>apInvoices</K> / <K>apInvoiceLines</K> are no longer valid in 26C — verify the resource
        names against your instance&apos;s REST service catalog before building.
      </Callout>
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Interface tables", "Must exist first"]}
        rows={[
          [<K key="f1">Payables Standard Invoice Import</K>, "Bulk-create supplier invoices from an external system", <K key="it1">AP_INVOICES_INTERFACE</K>, <K key="it2">AP_INVOICE_LINES_INTERFACE</K>, "Supplier, supplier site, open period, valid account flexfield"],
          [<K key="f2">Payables Payment Request Import</K>, "Load payment requests that become payable invoices", <K key="it3">AP_PAYMENT_REQUESTS_INT</K>, "Supplier, bank account for the payment"],
        ]}
      />
      <Callout type="info">
        Supplier, Supplier Sites, Supplier Contacts, and Supplier Addresses FBDIs are in the{" "}
        <strong>Procurement</strong> FBDI guide, not the Financials FBDI guide — load supplier
        master from there before importing invoices.
      </Callout>
      <H3>Working example — create an invoice via REST</H3>
      <CodeBlock
        language="bash"
        filename="POST /invoices"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/invoices" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "SupplierId": 123456,
    "InvoiceNumber": "INV-2025-001",
    "InvoiceDate": "2025-01-15",
    "InvoiceCurrencyCode": "EUR",
    "PaymentTermsName": "NET30",
    "InvoiceAmount": 1000,
    "InvoiceLines": [
      { "LineNumber": 1, "Amount": 1000, "Description": "Consulting services" }
    ]
  }'`}
      />
      <H3>Working example — run the validateInvoice action</H3>
      <CodeBlock
        language="bash"
        filename="PATCH /invoices/{id}/child/actions/validateInvoice"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/invoices/300100123456789/child/actions/validateInvoice" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "DocumentIds": [ { "DocumentId": 300100123456789 } ]
  }'`}
      />

      <H2>Data flow — step by step</H2>
      <P>Where each step of an invoice import lands in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Invoice rows are staged via FBDI or REST (payablesInterfaceInvoices)", <K key="t1">AP_INVOICES_INTERFACE</K>, <K key="t2">AP_INVOICE_LINES_INTERFACE</K>],
          ["2", "The Import Payables Invoices ESS job reads the interface rows", <span key="c3">ESS job: <K key="ess1">Import Payables Invoices</K></span>],
          ["3", "Valid rows are written as invoice headers, lines, and distributions", <K key="t3">AP_INVOICES_ALL</K>, <K key="t4">AP_INVOICE_LINES_ALL</K>, <K key="t5">AP_INVOICE_DISTRIBUTIONS_ALL</K>],
          ["4", "The Validate Payables Invoices job runs validation rules", <span key="c4">ESS job: <K key="ess2">Validate Payables Invoices</K></span>],
          ["5", "Invoice moves through the status chain (Entered → Validated → Approved → Posted)", <span key="c1"><K key="t6">AP_INVOICES_ALL</K> (status fields)</span>],
          ["6", "Create Accounting generates subledger entries", <K key="t7">XLA_AE_HEADERS</K>, <K key="t8">XLA_AE_LINES</K>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data dictionary.
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect what the import produced.</P>
      <CodeBlock
        language="sql"
        filename="ap_invoices_interface_rejections.sql"
        code={`-- Rejected interface rows for an import batch
SELECT i.invoice_num, i.vendor_id, i.invoice_date, i.invoice_amount,
       i.invoice_currency_code, i.validation_status,
       l.line_number, l.description, l.amount, l.error_flag, l.error_message
FROM   ap_invoices_interface i
JOIN   ap_invoice_lines_interface l
  ON   l.parent_id = i.invoice_id
WHERE  i.request_id = :request_id
AND    i.validation_status IN ('REJECTED', 'ERROR')
ORDER BY i.invoice_num, l.line_number;`}
      />
      <CodeBlock
        language="sql"
        filename="ap_invoices_by_status.sql"
        code={`-- Invoice headers by status for a supplier and period
SELECT i.invoice_id, i.invoice_num, i.invoice_date, i.invoice_amount,
       i.invoice_currency_code, i.payment_status_flag, i.approval_status,
       i.source
FROM   ap_invoices_all i
WHERE  i.vendor_id = :vendor_id
AND    i.invoice_date BETWEEN :start_date AND :end_date
ORDER BY i.invoice_date DESC;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Invoice creation", "Expense / asset account", "AP liability"],
          ["Input tax", "Input tax receivable", "Tax liability"],
          ["Payment", "AP liability", "Cash / bank"],
        ]}
      />
      <P>
        Entries come from the subledger accounting engine; trace them via <K>XLA_AE_HEADERS</K> /{" "}
        <K>XLA_AE_LINES</K> — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Invoices Ready to Validate / Validation report", "Payables work area, run after the Validate job"],
          ["Payables Invoices Real Time", "OTBI subject area"],
          ["AP Distributions and Trial Balance", "GL / Financial Reporting (post-close)"],
        ]}
      />

      <H2>Worked example — one invoice with tax</H2>
      <WorkedExample
        title="Worked example: $1,000 goods + 10% input tax"
        intro={
          <>
            Supplier invoice INV-2026-0101: <strong>goods $1,000</strong> + <strong>input tax 10% =
            $100</strong> = <strong>$1,100 total</strong>. Supplier, tax code, and open AP period all
            exist, so Import + Validate approve it.
          </>
        }
        steps={[
          {
            label: "1 · The distributions (the accounts each line posts to)",
            body: (
              <>
                The invoice line carries a <Term k="distribution"><strong>distribution</strong></Term> — the <Term k="accountCombination">account combination</Term>
                for the $1,000 charge. The tax line carries its own distribution for the $100 input
                tax.
              </>
            ),
          },
          {
            label: "2 · The SLA entries (from Create Accounting)",
            body: (
              <>
                <Term k="sla"><strong>Subledger accounting</strong></Term> turns the validated invoice into one balanced journal: the
                expense and the input tax are debits, the AP liability is the credit.
              </>
            ),
          },
        ]}
        journal={[
          { account: "01-6100-000 — Expense (goods)", debit: "$1,000" },
          { account: "01-1500-000 — Input tax receivable", debit: "$100" },
          { account: "01-2200-000 — AP liability", credit: "$1,100" },
        ]}
        outcome={
          <>
            <strong>Where each piece landed:</strong> the header in <K>AP_INVOICES_ALL</K>, the lines
            in <K>AP_INVOICE_LINES_ALL</K>, the distributions (the account combinations above) in{" "}
            <K>AP_INVOICE_DISTRIBUTIONS_ALL</K>, and the journal in <K>XLA_AE_HEADERS</K> /{" "}
            <K>XLA_AE_LINES</K>. Break a segment value, remove the tax code, or close the period and
            the same invoice stops at <em>Requires Re-approval</em> instead of posting.
          </>
        }
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Supplier before invoice:</strong> load Supplier FBDIs (from the Procurement guide) before invoice imports, or rows reject with "supplier not found".</li>
        <li><strong>Stage → import → validate:</strong> FBDI only stages data; you must run Import Payables Invoices and Validate Payables Invoices to create and approve the invoices.</li>
        <li><strong>Interface errors:</strong> rejected rows stay in the interface tables with an error message — query and fix them, then re-run the import.</li>
        <li><strong>Idempotency:</strong> use a stable invoice number so retries do not create duplicates; the duplicate invoice tolerance also guards this.</li>
        <li><strong>Prepayments:</strong> apply prepayments to PO invoices via the <K>applyPrepayments</K> action, or reverse with <K>unapplyPrepayments</K>.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/payables">Payables troubleshooting</a>{" "}
        for the most common import failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables (AP)</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Holds and PO matching constrain which invoices can be validated and paid — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/holds-matching">Holds &amp; PO Matching</a>.</li>
      </UL>
    </>
  );
}

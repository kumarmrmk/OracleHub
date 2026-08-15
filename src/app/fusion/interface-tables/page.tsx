import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Interface Tables",
};

export default function InterfaceTablesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Interface Tables"
        description="Every bulk load in Fusion works the same way: data is first staged into an interface table, then an import program validates and moves it into the real (base) tables. Learn the pipeline, the interface tables each module uses, and how to diagnose a load by looking at the right table."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Interface Tables" }]}
        updated="August 2026"
      />

      <P>
        Consultants often think a file or REST call writes straight to the business table — it does
        not. Fusion inserts into an <strong>interface table</strong> first. A scheduled program then
        reads those staged rows, validates them, and either moves them into the base tables or writes
        rejection reasons back. Until that program runs, nothing the user can see has happened.
      </P>

      <H2>The import pipeline</H2>
      <Diagram title="One pipeline for every bulk load" className="mb-8">
        <DiagramNode tone="oic" title="Source" subtitle="REST, FBDI file, spreadsheet, SOAP" />
        <Arrow label="insert" />
        <DiagramNode tone="neutral" title="Interface tables" subtitle="AP_INVOICES_INTERFACE · RA_INTERFACE_LINES_ALL · GL_INTERFACE …" />
        <Arrow label="import ESS job validates" />
        <DiagramNode tone="fusion" title="Base tables" subtitle="AP_INVOICES_ALL · RA_CUSTOMER_TRX_ALL · GL_JE_HEADERS …" />
        <Arrow label="then" />
        <DiagramNode tone="warning" title="Accounting (SLA)" subtitle="XLA_AE_HEADERS / XLA_AE_LINES" />
      </Diagram>
      <P>
        The key mental model: <strong>interface table = staging area, import job = the gatekeeper,
        base table = the real record</strong>. If a row is rejected you fix it <em>in the interface
        table</em> (or the source file) and re-run the import — you never edit base data directly.
      </P>
      <Callout type="info">
        Interface tables are why FBDI can validate thousands of rows asynchronously and still tell
        you exactly which ones failed: rejection rows stay in the interface with a status and error
        column, and the error CSV is written from them.
      </Callout>

      <H2>The common interface tables</H2>
      <P>
        These are the staging tables behind the most common Financials loads. Exact names can vary
        slightly by release — confirm against your instance's data dictionary before writing code.
      </P>
      <DataTable
        headers={["Interface table", "Feeds", "Import job", "Typical status column"]}
        rows={[
          [<K key="a1">AP_INVOICES_INTERFACE</K>, "Payables invoices (header)", "Import Payables Invoices", <K key="s1">APPROVED_FLAG / REJECT_REASON</K>],
          [<K key="a2">AP_INVOICE_LINES_INTERFACE</K>, "Payables invoice lines & distributions", "Import Payables Invoices", <K key="s2">REJECT_REASON</K>],
          [<K key="a3">AP_PAYMENT_REQUESTS_INT</K>, "Payment requests", "Import Payables Payment Request", <K key="s3">status fields</K>],
          [<K key="a4">RA_INTERFACE_LINES_ALL</K>, "AutoInvoice transactions (header + lines)", "Import AutoInvoice", <K key="s4">STATUS (N/I/E/P/D) + REJECT_REASON</K>],
          [<K key="a5">RA_INTERFACE_DISTRIBUTIONS_ALL</K>, "AutoInvoice distributions", "Import AutoInvoice", <K key="s5">REJECT_REASON</K>],
          [<K key="a6">RA_INTERFACE_SALESCREDITS_ALL</K>, "AutoInvoice sales credits", "Import AutoInvoice", <K key="s6">REJECT_REASON</K>],
          [<K key="a7">AR_INTERFACE_CONTS_ALL</K>, "AutoInvoice transaction flexfield contexts", "Import AutoInvoice", "—"],
          [<K key="a8">AR_PAYMENTS_INTERFACE_ALL</K>, "Receipts (lockbox & standard receipt import)", "Process Receipts Through Lockbox", <K key="s8">STATUS + REJECT_REASON</K>],
          [<K key="a9">GL_INTERFACE</K>, "Journal entries (imported)", "Import Journals", <K key="s9">STATUS (NEW/POSTED) + ERROR_CODE</K>],
          [<K key="a10">GL_DAILY_RATES_INTERFACE</K>, "Daily conversion rates", "Import and Calculate Daily Rates", <K key="s10">status + error columns</K>],
          [<K key="a11">GL_BUDGET_INTERFACE</K>, "Budget balances", "Validate and Upload Budgets", <K key="s11">status + error columns</K>],
          [<K key="a12">CE_STATEMENT_HEADERS_INT</K>, "Bank statement headers", "Import Bank Statement from a Spreadsheet", <K key="s12">status fields</K>],
          [<K key="a13">CE_STATEMENT_LINES_INT</K>, "Bank statement lines", "Import Bank Statement from a Spreadsheet", <K key="s13">status fields</K>],
          [<K key="a14">FA_MASS_ADDITIONS</K>, "Fixed asset additions (from AP/receiving/legacy)", "Post Mass Additions", <K key="s14">status / group status</K>],
          [<K key="a15">HZ_IMP_*</K>, "Parties / customers (Customer Import)", "Import Trading Community Data in Bulk", "—"],
        ]}
      />
      <Callout type="warning">
        Do not treat these table names as guaranteed across releases. Oracle changes interface
        layouts between updates, and the safest source of truth is the data dictionary on your own
        instance (SQL Developer on a read replica, or OTBI) — not the docs page from last year.
      </Callout>

      <H2>How a load flows through the tables</H2>
      <P>
        Take a supplier invoice as the example — it is the pattern you will see in every module.
      </P>
      <DataTable
        headers={["Step", "What happens", "Table you are touching"]}
        rows={[
          ["1", "Rows staged by REST (<K>invoices</K>) or the AP Invoices FBDI file", <K key="t1">AP_INVOICES_INTERFACE / AP_INVOICE_LINES_INTERFACE</K>],
          ["2", "Import job runs, validates supplier, site, tax, account flexfield, period", <span key="t2x">interface tables (status updated)</span>],
          ["3", "Valid rows create the invoice header, lines, distributions", <K key="t3">AP_INVOICES_ALL, AP_INVOICE_LINES_ALL, AP_INVOICE_DISTRIBUTIONS_ALL</K>],
          ["4", "Rejected rows stay behind with a reason", <span key="t4x"><K key="t4">AP_INVOICE_LINES_INTERFACE</K> (REJECT_REASON)</span>],
          ["5", "Validation / approval moves the invoice forward", <K key="t5">AP_INVOICES_ALL</K>],
          ["6", "Accounting created when the invoice accounts (SLA)", <K key="t6">XLA_AE_HEADERS / XLA_AE_LINES</K>],
        ]}
      />

      <H2>Reading rejection status</H2>
      <P>
        Rejected rows carry a status and a reason in the interface table. The classic diagnostic
        query reads the interface table, not the base table:
      </P>
      <CodeBlock
        language="sql"
        filename="ap_interface_rejects.sql"
        code={`-- Rows that failed the AP invoice import, with the reason
SELECT i.invoice_num, i.invoice_line_number,
       i.reject_reason, i.approved_flag, i.status
FROM   ap_invoice_lines_interface i
WHERE  i.status IS NULL
   OR  i.approved_flag = 'N';`}
      />
      <CodeBlock
        language="sql"
        filename="gl_interface_rejects.sql"
        code={`-- Journal lines that did not post, with the error
SELECT g.group_id, g.je_line_num, g.segment1, g.segment2, g.segment3,
       g.status, g.error_code, g.error_message
FROM   gl_interface g
WHERE  g.status NOT IN ('POSTED','NEW')
ORDER BY g.group_id, g.je_line_num;`}
      />
      <Callout type="tip">
        The most common rejection causes are the same across every interface table: invalid account
        combination, closed period, missing supplier/customer master, wrong date format, or a
        required column left empty. Fix the <em>source</em>, re-submit, and the same rows flow
        through cleanly.
      </Callout>

      <H2>REST vs FBDI: both land in interfaces</H2>
      <P>
        Some REST resources write directly to base tables (create-a-record resources like{" "}
        <K>invoices</K>), while others populate the same interface tables a file would use:
      </P>
      <DataTable
        headers={["Resource", "Writes to", "Use case"]}
        rows={[
          [<K key="r1">payablesInterfaceInvoices</K>, <K key="i1">AP_INVOICES_INTERFACE</K>, "Create interface rows via REST, then run Import Payables Invoices"],
          [<K key="r2">autoInvoiceInterfaceLines</K>, <K key="i2">RA_INTERFACE_LINES_ALL</K>, "Inspect/fix AutoInvoice interface lines before the import job runs"],
          [<K key="r3">invoices</K>, <span key="c0"><K key="i3">AP_INVOICES_ALL</K> (direct)</span>, "Create a fully-formed invoice synchronously (small volumes)"],
        ]}
      />
      <P>
        This is why a consultant must know both the resource <em>and</em> the job: a REST call may
        only stage data, and nothing reaches the business until the matching scheduled process
        executes. See{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/erp-processes">
          Driving ESS via REST
        </a>{" "}
        to submit those jobs programmatically.
      </P>

      <H2>When to look at the interface table</H2>
      <UL>
        <li><strong>A load "succeeded" but nothing appeared</strong> — check the interface table; rows may still be pending import.</li>
        <li><strong>Some rows failed</strong> — the error CSV is derived from the interface table; querying it directly gives you the same detail in a form you can join against source data.</li>
        <li><strong>You want to know why AutoInvoice rejected a transaction</strong> — <K>RA_INTERFACE_LINES_ALL</K> holds the reason.</li>
        <li><strong>Re-submitting after a fix</strong> — reset status columns per the import program's rules, or re-stage from the source.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>See how FBDI drives these tables in <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">FBDI &amp; ADFdi</a>.</li>
        <li>Submit the import jobs from code in <a className="font-semibold text-accent hover:underline" href="/fusion/erp-processes">Driving ESS via REST (erpProcesses)</a>.</li>
        <li>Each Financials module page now has its own data-flow section pointing at its interface tables.</li>
      </UL>
    </>
  );
}

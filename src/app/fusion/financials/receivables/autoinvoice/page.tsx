import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "AutoInvoice",
};

export default function AutoInvoicePage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="AutoInvoice"
        description={<>The bulk billing engine in Receivables. <Term k="autoinvoice">AutoInvoice</Term> takes pre-staged billing lines from Oracle Applications or external systems, groups them by your business rules, validates every line, and creates AR transactions (invoices, memos) automatically.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Receivables (AR)", href: "/fusion/financials/receivables" }, { label: "AutoInvoice" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables hub</a> and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a> first. AutoInvoice assumes the customer (party + account), transaction type, and remit-to address already exist.
      </Callout>

      <H2>Functional view</H2>
      <P>
        AutoInvoice is the interface-based billing engine: data is staged into interface tables,
        then the <strong>Import AutoInvoice</strong> process validates and converts each line into a
        real AR transaction. It exists because most billing volumes come from order capture, CPQ,
        or external systems — not from manual entry.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Transaction source", "Identifies where billing lines come from (e.g. Orders, CPQ, OCI) and drives numbering, grouping, and defaults"],
          ["Transaction type", "Defines the transaction (invoice, credit memo, debit memo), its class, and its number source"],
          ["Grouping rule", "Determines how inserted lines are assembled into transactions and memos (e.g. by sale, shipment, day)"],
          ["Line ordering rule", "Controls the order of lines within a transaction so memo lines and totals land correctly"],
          ["AutoAccounting", "Derives the accounting distributions from customer and line attributes instead of explicit accounts"],
          ["Interface line", "A single billable line staged in the interface tables waiting for the import run"],
          ["Execution report", "Summary and line-level detail of what the import run created and rejected"],
        ]}
      />
      <Diagram title="AutoInvoice run" className="mb-8">
        <DiagramNode tone="neutral" title="Prepare data" subtitle="orders / CPQ / FBDI into interface tables" />
        <Arrow label="stage" />
        <DiagramNode tone="warning" title="Import AutoInvoice" subtitle="validation & grouping" />
        <Arrow />
        <DiagramNode tone="success" title="Transactions" subtitle="AR invoice / memo created" />
        <Arrow label="rejected" />
        <DiagramNode tone="warning" title="Interface error" subtitle="fix line, re-run import" />
      </Diagram>
      <P>
        <strong>Memo lines</strong> — extra descriptive or informational lines attached to a
        transaction (for example a printed message) — are also staged via the interface and get a
        line ordering so they print where you want them. <strong>Credit and debit memos</strong>{" "}
        flow through the same AutoInvoice engine: you set the transaction source and a transaction
        type whose class is credit or debit memo, and the import creates the memo instead of an
        invoice.
      </P>

      <H2>Configuration</H2>
      <P>Configure in this order so the import can find everything it validates against.</P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Transaction sources", "Defines available sources, default transaction types, and where lines get grouped", "Receivables → AutoInvoice → Transaction sources"],
          ["Transaction types", "Class (invoice/memo), numbering, default terms and accounts", "Receivables → Transaction Types"],
          ["Line ordering rules", "Order of lines so memo lines and descriptions print correctly", "Receivables → AutoInvoice → Line ordering rules"],
          ["Grouping rules", "How inserted lines roll up into transactions and memos", "Receivables → AutoInvoice → Grouping rules"],
          ["AutoAccounting", "Mapping of customer/line attributes to revenue, receivables, tax, and memo accounts", "Receivables → AutoAccounting"],
          ["Remit-to addresses", "Required on the transaction; map address assignments per customer/account", "Receivables setup → Remit-to addresses"],
        ]}
      />
      <Callout type="info">
        AutoInvoice rejects lines when the customer, transaction type, or account is missing — finish
        these setups and pre-validate before any bulk load.
      </Callout>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">receivablesInvoices</K>, "Create/update/delete AR transactions directly, without the interface"],
          [<K key="r2">autoInvoiceInterfaceLines</K>, "Read (GET) and fix (PATCH) AutoInvoice interface lines. No create — data is staged via the AutoInvoice Import FBDI template"],
          [<K key="r3">receivablesCreditMemos</K>, "Create/update credit or debit memos directly (create/update only, no delete)"],
          [<K key="r4">erpProcesses</K>, "Submit the Import AutoInvoice ESS job to validate the interface and create transactions"],
        ]}
      />
      <Callout type="info">
        In the Oracle 26C Financials REST guide the resource is{" "}
        <K>autoInvoiceInterfaceLines</K> (GET/PATCH only) — there is no POST create. Stage lines
        through the AutoInvoice Import FBDI template, then run the import via{" "}
        <K>erpProcesses</K> or the Scheduled Processes work area. Confirm resource availability
        against your instance.
      </Callout>
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">AutoInvoice Import</K>, "Bulk-stage billing lines. Loads RA_INTERFACE_LINES_ALL, RA_INTERFACE_DISTRIBUTIONS_ALL, RA_INTERFACE_SALESCREDITS_ALL, and AR_INTERFACE_CONTS_ALL", "Customer, transaction type, remit-to address, open AR period"],
          [<K key="f2">Customer Import</K>, "Create/update customers (party + account) that interface lines reference (HZ_IMP_* tables, ESS job 'Import Trading Community Data in Bulk')", "None"],
          [<K key="f3">Upload Customers</K>, "Spreadsheet-based customer load for smaller, ad-hoc enrichment", "Customer master setup"],
        ]}
      />
      <H3>Working example — read rejected interface lines</H3>
      <CodeBlock
        language="bash"
        filename="GET /autoInvoiceInterfaceLines"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/autoInvoiceInterfaceLines?q=Status%3D%27ERROR%27&fields=TransactionNumber,LineNumber,Status,RejectReason,OriginalSystemReference&limit=50" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />
      <H3>Working example — fix a rejected interface line</H3>
      <CodeBlock
        language="bash"
        filename="PATCH /autoInvoiceInterfaceLines/{id}"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/autoInvoiceInterfaceLines/300100123456789" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X PATCH \\
  -d '{
    "PaymentTerms": "NET30",
    "PaymentTermsDate": "2026-08-31",
    "LastUpdateLogin": "integration.user"
  }'`}
      />
      <H3>Working example — run the import via erpProcesses</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "ProcessName": "Import AutoInvoice",
    "ProcessParameters": {
      "Transaction Source Name": "OCI AutoInvoice",
      "Run Type": "Open Interface"
    }
  }'`}
      />
      <Callout type="info">
        The <K>erpProcesses</K> payload parameters must match the Import AutoInvoice scheduled
        process definition in your instance — confirm the parameter names before automating.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>Where each step of the billing chain lands in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Source system (orders, CPQ, external) prepares billing lines", "Source system data"],
          ["2", "AutoInvoice Import FBDI loads lines, distributions, sales credits, and contacts", <K key="t1">RA_INTERFACE_LINES_ALL</K>, <K key="t2">RA_INTERFACE_DISTRIBUTIONS_ALL</K>, <K key="t3">RA_INTERFACE_SALESCREDITS_ALL</K>, <K key="t4">AR_INTERFACE_CONTS_ALL</K>],
          ["3", "Import AutoInvoice ESS job runs validation and grouping", <span key="t5cell"><span key="c0"><K key="t5">RA_INTERFACE_LINES_ALL</K> (status fields)</span></span>],
          ["4", "Valid lines create AR transactions (headers and lines)", <K key="t6">RA_CUSTOMER_TRX_ALL</K>, <K key="t7">RA_CUSTOMER_TRX_LINES_ALL</K>],
          ["5", "Rejected lines stay in the interface with STATUS and REJECT_REASON", <span key="c1"><K key="t8">RA_INTERFACE_LINES_ALL</K> (STATUS, REJECT_REASON)</span>],
          ["6", "Fix the rejected lines (REST PATCH or re-load) and re-run the import", <K key="t9">RA_INTERFACE_LINES_ALL</K>],
          ["7", "Create Accounting posts the transaction entries", <K key="t10">XLA_AE_HEADERS</K>, <K key="t11">XLA_AE_LINES</K>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data
        dictionary. Exact names can vary slightly by release — confirm against your instance&apos;s data
        dictionary before relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect the import outcome.</P>
      <CodeBlock
        language="sql"
        filename="ra_interface_lines.sql"
        code={`-- AutoInvoice lines that were rejected by the import run
SELECT il.interface_line_id, il.batch_source_name, il.original_system_reference,
       il.line_number, il.trx_number, il.status, il.reject_reason,
       il.creation_date
FROM   ra_interface_lines_all il
WHERE  il.status = 'ERROR'
AND    il.request_id = :request_id
ORDER BY il.creation_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="ra_customer_trx.sql"
        code={`-- Transactions created by AutoInvoice for a customer
SELECT t.customer_trx_id, t.trx_number, t.trx_date, t.trx_class, t.trx_type,
       t.invoice_currency_code, t.status_trx, t.bill_to_customer_id,
       c.account_name
FROM   ra_customer_trx_all t
JOIN   hz_cust_accounts c ON c.cust_account_id = t.bill_to_customer_id
WHERE  t.bill_to_customer_id = :bill_to_customer_id
AND    t.trx_date >= SYSDATE - 30
ORDER BY t.trx_date DESC;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>Successful transactions create entries through the sub-ledger accounting engine:</P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Invoice created by AutoInvoice", "AR trade receivable", "Revenue (+ output tax)"],
          ["Memo line", "AR trade receivable (or memo account)", "Revenue / adjustment per AutoAccounting"],
          ["Credit / debit memo", "Revenue / adjustment", "AR trade receivable (credit) or reverse"],
        ]}
      />
      <P>
        Accounts come from <K>AutoAccounting</K> unless overridden on the line. Trace entries via{" "}
        <K>XLA_AE_HEADERS</K> / <K>XLA_AE_LINES</K> — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["AutoInvoice Execution Report", "Generated per import run — line summary and reject detail (Reports &amp; Analytics)"],
          ["Receivables Transactions Real Time", "OTBI subject area (query successful transactions)"],
          ["AR Trial Balance", "GL / Financial Reporting after posting"],
        ]}
      />

      <H2>Worked example — one billing line through AutoInvoice</H2>
      <WorkedExample
        title="Worked example: invoice $5,000 + 5% output tax"
        intro={
          <>
            A sales order ships; the billing line is staged as <strong>$5,000</strong> with a{" "}
            <strong>5%</strong> output-tax code. AutoInvoice turns it into an AR transaction.
          </>
        }
        steps={[
          {
            label: "1 · Stage and import",
            body: (
              <>
                The line lands in <K>RA_INTERFACE_LINES_ALL</K>; Import <Term k="autoinvoice">AutoInvoice</Term> validates the
                customer, transaction type, and remit-to address, then creates the transaction.
              </>
            ),
          },
          {
            label: "2 · What the customer owes",
            body: (
              <>
                $5,000 + $250 output tax = <strong>$5,250</strong> receivable. Accounts come from{" "}
                <K>AutoAccounting</K> unless the line overrides them.
              </>
            ),
          },
        ]}
        journal={[
          { account: "01-1200-000 — AR trade receivable", debit: "$5,250" },
          { account: "01-4100-000 — Revenue", credit: "$5,000" },
          { account: "01-2300-000 — Output tax payable", credit: "$250" },
        ]}
        outcome={
          <>
            The transaction lands in <K>RA_CUSTOMER_TRX_ALL</K> / <K>RA_CUSTOMER_TRX_LINES_ALL</K> at
            status <em>Valid</em>, and Create Accounting writes the entry above. Rejected lines stay
            in the interface with a reason — read the execution report, fix, and re-run.
          </>
        }
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Stage, do not create:</strong> <K>autoInvoiceInterfaceLines</K> supports GET/PATCH only — bulk lines must come in through the AutoInvoice Import FBDI template.</li>
        <li><strong>Rejects are the path:</strong> failed lines stay in RA_INTERFACE_LINES_ALL with STATUS and REJECT_REASON; read them, PATCH the fix, re-run the import.</li>
        <li><strong>Pre-validate:</strong> customer, transaction type, and remit-to address must exist or the line rejects with "customer not found" style errors.</li>
        <li><strong>Grouping and ordering:</strong> set grouping and line ordering rules before loading or your transactions assemble differently than the business expects.</li>
        <li><strong>Post after import:</strong> run Create Accounting (via <K>erpProcesses</K> or scheduled process) after transactions are created.</li>
        <li><strong>CPQ / orders:</strong> Oracle Applications billing feeds AutoInvoice automatically; external systems use the same interface tables.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/receivables">Receivables troubleshooting</a>{" "}
        for the most common AutoInvoice failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables (AR)</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Once billed, the money comes in through <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/receipts">Receipts &amp; Lockbox</a>.</li>
        <li>Deferred revenue on invoices is covered in <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/revenue">Revenue &amp; Credit Memos</a>.</li>
      </UL>
    </>
  );
}
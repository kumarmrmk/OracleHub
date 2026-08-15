import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Bank Statements & BAI2",
};

export default function StatementsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Bank Statements & BAI2"
        description={<>Turns bank data into <Term k="reconciliation">reconciliation</Term> input. Statements are imported from a spreadsheet or electronic file (<Term k="bai2">BAI2</Term> and similar), parsed by rules, mapped to transaction types, and validated with tolerance rules before reconciliation.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Cash Management", href: "/fusion/financials/cash-management" }, { label: "Bank Statements & BAI2" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management">Cash Management</a> and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/bank-setup">Banks, Branches &amp; Accounts</a> (the account must exist before a statement can import).
      </Callout>

      <H2>Functional view</H2>
      <P>
        A bank statement is processed in stages: <em>import → parse → validate → reconcile</em>.
        The <strong>statement header</strong> carries the account and date range;{" "}
        <strong>statement lines</strong> carry each movement (deposit, withdrawal, charge);{" "}
        <strong>balances</strong> are carried alongside (opening, closing, and per-line available
        balances).
      </P>
      <Diagram title="Statement processing pipeline" className="mb-8">
        <DiagramNode tone="oic" title="Import" subtitle="spreadsheet FBDI or electronic file" />
        <Arrow />
        <DiagramNode tone="neutral" title="Parse" subtitle="parse rule sets read the file" />
        <Arrow />
        <DiagramNode tone="warning" title="Validate" subtitle="tolerance rules, codes, balances" />
        <Arrow />
        <DiagramNode tone="success" title="Reconcile" subtitle="match to cash transactions" />
      </Diagram>
      <DataTable
        headers={["Concept", "What it is (functional)"]}
        rows={[
          ["Statement header / line / balance", "The account-level and movement-level statement model"],
          ["Parse rule sets", "Rules that tell the importer how to read a file format into statement lines"],
          ["Transaction type mapping", "Maps statement transaction codes to Cash Management transaction types"],
          ["Tolerance rules", "Amount/date tolerances that decide whether a line is in balance"],
          ["Statement transaction codes", "The codes the bank uses to describe each movement"],
          ["Creation rules", "Rules that create internal cash transactions from statement lines when needed"],
          ["BAI2 format", "A common electronic bank statement format the importer supports"],
        ]}
      />
      <Callout type="info">
        Statements can come from a <strong>spreadsheet</strong> (loaded through FBDI) or from{" "}
        <strong>electronic files</strong> such as BAI2. Electronic files use parse rule sets;
        spreadsheet loads use the Cash Management Bank Statement Data Import template.
      </Callout>

      <H2>Configuration</H2>
      <P>Configure the mapping and validation layer before importing real statements.</P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Parse rule sets", "How an electronic file (e.g. BAI2) is read into statement lines", "Bank Statement setup → Parse Rule Sets"],
          ["Statement transaction codes", "The bank's codes that appear on statement lines", "Bank Statement setup → Transaction Codes"],
          ["Transaction type mapping", "Maps statement codes to cash transaction types", "Bank Statement setup → Transaction Type Mapping"],
          ["Tolerance rules", "Amount/date tolerances for line validation", "Bank Statement setup → Tolerance Rules"],
          ["Statement transaction creation rules", "Which lines create internal cash transactions automatically", "Bank Account setup → Creation Rules"],
        ]}
      />
      <Callout type="tip">
        A statement line with an unmapped transaction code is not reconciled automatically — finish
        the transaction type mapping for every code the bank sends.
      </Callout>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">erpProcesses</K>, "Submit an ESS job such as Import Bank Statement from a Spreadsheet (POST)"],
          [<K key="r2">cashBankAccounts/bankAccountTransactionCreationRules</K>, "Manage statement transaction creation rules for an account (C/U)"],
        ]}
      />
      <Callout type="warning">
        In release 26C there is <strong>no <K>bankStatements</K> REST create resource</strong>.
        Statements are loaded through the Cash Management Bank Statement Data Import (FBDI)
        template and the Import Bank Statement from a Spreadsheet ESS job — not via REST.
      </Callout>
      <H3>FBDI — Cash Management Bank Statement Data Import</H3>
      <DataTable
        headers={["Interface table", "Holds"]}
        rows={[
          [<K key="f1">CE_STATEMENT_HEADERS_INT</K>, "Statement headers to be imported"],
          [<K key="f2">CE_STATEMENT_LINES_INT</K>, "Statement lines to be imported"],
          [<K key="f3">CE_STMT_BALANCES_INT</K>, "Opening/closing balances per statement"],
          [<K key="f4">CE_STMT_BAL_AVALBTY_INT</K>, "Balance availability information"],
          [<K key="f5">CE_STMT_LINE_AVALBTY_INT</K>, "Per-line availability details"],
          [<K key="f6">CE_STMT_LINE_CHARGES_INT</K>, "Charges associated with statement lines"],
        ]}
      />
      <H3>ESS jobs</H3>
      <DataTable
        headers={["ESS job", "What it does"]}
        rows={[
          [<K key="e1">Import Bank Statement from a Spreadsheet</K>, "Loads FBDI interface rows into statement headers and lines"],
          [<K key="e2">Create Bank Statement</K>, "Creates an empty bank statement for a given account and date"],
          [<K key="e3">Automatic Reconciliation</K>, "Matches statement lines to system transactions"],
          [<K key="e4">Generate Cash Position</K>, "Refreshes the cash position for an account"],
          [<K key="e5">Create External Transactions</K>, "Creates external cash transactions from imported data"],
        ]}
      />
      <H3>Working example — run the import job</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "ProcessName": "Import Bank Statement from a Spreadsheet",
    "ProcessParameters": [
      { "Name": "Run", "Value": "RunNow" }
    ]
  }'`}
      />
      <Callout type="tip">
        FBDI template, interface table, and ESS job names are from the official 26C integration
        documentation. Verify the exact job parameter names against your instance before coding.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>Where a statement travels from the file to the reconciliation queue.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Spreadsheet or electronic file is staged for import", <span key="t1cell">External file or BAI2 feed</span>],
          ["2", "FBDI rows are loaded (headers, lines, balances, charges)", <K key="t2">CE_STATEMENT_HEADERS_INT</K>, <K key="t3">CE_STATEMENT_LINES_INT</K>],
          ["3", "Import Bank Statement from a Spreadsheet ESS job runs", <K key="t4">CE_STATEMENT_HEADERS</K>, <K key="t5">CE_STATEMENT_LINES</K>],
          ["4", "Parse rule sets and transaction type mapping interpret the lines", <span key="t6cell">Parsed/mapped status on statement lines</span>],
          ["5", "Tolerance rules and balances are validated", <span key="t7cell">Validation status on statement lines</span>],
          ["6", "Valid lines are queued for reconciliation", <span key="c0"><K key="t8">CE_STATEMENT_LINES</K> (reconciliation status)</span>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data
        dictionary. Exact names can vary slightly by release — confirm against your instance's data
        dictionary before relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect imports and statement data.</P>
      <CodeBlock
        language="sql"
        filename="ce_statement_lines_int.sql"
        code={`-- FBDI import errors for a given run
SELECT sli.statement_line_id, sli.bank_account_num, sli.trx_date,
       sli.amount, sli.status, sli.error_message, sli.request_id
FROM   ce_statement_lines_int sli
WHERE  sli.status = 'ERROR'
  AND  sli.request_id = :request_id
ORDER BY sli.statement_line_id;`}
      />
      <CodeBlock
        language="sql"
        filename="ce_statement_lines.sql"
        code={`-- Imported statement lines with their mapped transaction type
SELECT l.statement_line_id, l.trx_date, l.trx_type, l.amount,
       l.statement_trx_code, l.transaction_type, l.status,
       l.reconciliation_status
FROM   ce_statement_lines l
JOIN   ce_statement_headers h
  ON   h.statement_header_id = l.statement_header_id
WHERE  h.statement_date >= SYSDATE - 30
ORDER BY h.statement_date DESC, l.trx_date;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Importing and parsing a statement creates <strong>no accounting entries</strong> — a
        statement is a confirmation of what the bank moved. Reconciliation of matched lines and
        any entries that result are covered on the reconciliation page.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Bank Statement, Statement Balances", "Cash Management work area / delivered BIP reports"],
          ["Statement Import validation report", "Cash Management work area (import results)"],
          ["Cash Management Real Time subject areas", "OTBI"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>No REST create:</strong> statements load via the Cash Management Bank Statement Data Import (FBDI) template and the Import Bank Statement from a Spreadsheet ESS job.</li>
        <li><strong>Account must exist:</strong> imports match on bank + branch + account number — a missing account rejects the import.</li>
        <li><strong>Map the codes first:</strong> unmapped statement transaction codes stay unmatched and block automatic reconciliation.</li>
        <li><strong>Run via erpProcesses:</strong> submit the import job (and the reconciliation job) through <K>erpProcesses</K> and poll the result.</li>
        <li><strong>Electronic files:</strong> BAI2 and similar formats need parse rule sets configured per file format.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/cash-management">Cash Management troubleshooting</a>{" "}
        for the most common failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management">Cash Management hub</a>.</li>
        <li>Bank accounts and branches these statements hit — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/bank-setup">Banks, Branches &amp; Accounts</a>.</li>
        <li>Matching those lines to payments and receipts — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/reconciliation">Reconciliation &amp; Forecasting</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
      </UL>
    </>
  );
}

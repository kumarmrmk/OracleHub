import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Reconciliation & Forecasting",
};

export default function ReconciliationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Reconciliation & Forecasting"
        description="Matches bank statement lines to internal cash transactions, settles exceptions, moves cash between accounts, and turns reconciled balances into cash positions and forecasts."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Cash Management", href: "/fusion/financials/cash-management" }, { label: "Reconciliation & Forecasting" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management">Cash Management</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/bank-setup">Banks, Branches &amp; Accounts</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/statements">Bank Statements &amp; BAI2</a> (a statement must be imported before it can reconcile).
      </Callout>

      <H2>Functional view</H2>
      <P>
        Reconciliation matches <strong>unreconciled statement lines</strong> to{" "}
        <strong>open cash transactions</strong> — the payments issued by Payables, the receipts
        collected by Receivables, and external cash transactions entered directly. Matching can run
        <strong>automatically</strong> (via matching rules) or <strong>manually</strong>; lines that
        don't match become <strong>exceptions</strong>, often cleared in <strong>mass
        reconciliation</strong>.
      </P>
      <Diagram title="Reconciliation flow" className="mb-8">
        <DiagramNode tone="neutral" title="Imported statement" subtitle="headers + lines" />
        <Arrow />
        <DiagramNode tone="fusion" title="Automatic reconciliation" subtitle="matching rules vs open transactions" />
        <Arrow label="matched" />
        <DiagramNode tone="success" title="Reconciled" subtitle="cleared, ready for GL" />
        <Arrow label="unmatched" />
        <DiagramNode tone="warning" title="Exceptions" subtitle="manual / mass reconciliation" />
      </Diagram>
      <DataTable
        headers={["Concept", "What it is (functional)"]}
        rows={[
          ["Matching rules & rule sets", "The criteria that decide whether a statement line matches a transaction"],
          ["Reconciliation exceptions", "Lines that don't match — handled manually or in mass reconciliation"],
          ["External cash transactions", "Cash movements with no AP/AR source, entered or imported directly"],
          ["Cash positioning", "A view of expected cash across accounts for a period"],
          ["Cash forecasting", "A predictive (ML-based) view of future cash balances"],
          ["Fund transfers & ad hoc payments", "Moving cash between own accounts or paying without a payable"],
          ["Cash-to-GL reconciliation", "Confirming bank-account cash matches the cash account in the ledger"],
          ["Notional vs physical pools", "Balance offsetting vs actual fund concentration between accounts"],
        ]}
      />

      <H2>Configuration</H2>
      <P>Matching rules come first; positioning and forecasting sit on top of reconciled data.</P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Reconciliation matching rules", "What makes a line match (amount, date, reference)", "Cash Management → Reconciliation Rules"],
          ["Rule sets", "Ordered groups of matching rules run together", "Reconciliation Rules setup"],
          ["Cash positioning setup", "Accounts, intervals, and forecast horizons", "Cash Management → Cash Positioning"],
          ["Forecast setups", "Forecast sources and how predictive cash forecasting feeds in", "Cash Management → Cash Forecasting"],
        ]}
      />
      <Callout type="info">
        A rule that is too loose over-matches; one that is too tight floods the exception list.
        Start with amount + date tolerances and add reference matching as the data allows.
      </Callout>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">cashExternalTransactions</K>, "Create/update/delete external cash transactions (C/U/D)"],
          [<K key="r2">cashBankAccountTransfers</K>, "Create/update bank account fund transfers (C/U)"],
          [<K key="r3">erpProcesses</K>, "Submit jobs such as Automatic Reconciliation or Generate Cash Position (POST)"],
        ]}
      />
      <Callout type="warning">
        There is <strong>no REST create resource for reconciliation</strong>. Reconciliation is run
        by the Automatic Reconciliation job (via <K>erpProcesses</K>); external transactions and
        transfers are created through their own REST resources or FBDI.
      </Callout>
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Bank Statement Reconciliation Data Import</K>, "Load reconciliation data for statement lines", "Imported statement"],
          [<K key="f2">Cash Position Data Import</K>, "Load cash position data for an account", "Bank account"],
          [<K key="f3">External Transactions Import</K>, "Bulk-create external cash transactions", "Bank account"],
        ]}
      />
      <H3>ESS jobs</H3>
      <DataTable
        headers={["ESS job", "What it does"]}
        rows={[
          [<K key="e1">Automatic Reconciliation</K>, "Matches statement lines to open system transactions"],
          [<K key="e2">Generate Cash Position</K>, "Refreshes the cash position for accounts"],
          [<K key="e3">Create External Transactions</K>, "Creates external cash transactions from imported data"],
          [<K key="e4">Import Bank Statement from a Spreadsheet</K>, "Loads statement lines that reconciliation then processes"],
        ]}
      />
      <H3>Working example — run automatic reconciliation</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "ProcessName": "Automatic Reconciliation",
    "ProcessParameters": [
      { "Name": "Run", "Value": "RunNow" }
    ]
  }'`}
      />
      <Callout type="tip">
        REST resource, FBDI, and ESS job names are from the official 26C integration documentation.
        Verify job parameter names against your instance before coding.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>Where a statement goes from imported to reconciled and into the cash position.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Statement lines are imported (FBDI)", <span key="c0"><K key="t1">CE_STATEMENT_LINES</K> (unreconciled)</span>],
          ["2", "Automatic Reconciliation runs matching rules against open transactions", <span key="c1"><K key="t2">CE_STATEMENT_LINES</K> (reconciliation status)</span>],
          ["3", "Matched lines are marked reconciled", <span key="c2"><K key="t3">CE_STATEMENT_LINES</K> (matched/cleared status)</span>],
          ["4", "Unmatched lines become exceptions handled manually or via mass reconciliation", <span key="t4cell">Exception/working-list records on statement lines</span>],
          ["5", "Fund transfers and external cash transactions update balances", <span key="c3"><K key="t5">CE_BANK_ACCOUNT_TRANSFERS_ALL</K> (transfers)</span>],
          ["6", "Generate Cash Position refreshes cash position and forecast", <span key="c4"><K key="t6">CE_CASH_POOLS_ALL</K>, cash position cube</span>],
          ["7", "Cleared cash confirms the GL cash account", <K key="t7">XLA_AE_HEADERS</K>, <K key="t8">XLA_AE_LINES</K>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data
        dictionary. Exact names can vary slightly by release — confirm against your instance's data
        dictionary before relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect reconciliation state.</P>
      <CodeBlock
        language="sql"
        filename="ce_statement_lines_recon.sql"
        code={`-- Reconciliation status of statement lines
SELECT l.statement_line_id, l.trx_date, l.trx_type, l.amount,
       l.statement_trx_code, l.reconciliation_status,
       l.matched_trx_id, l.reconciled_date
FROM   ce_statement_lines l
JOIN   ce_statement_headers h
  ON   h.statement_header_id = l.statement_header_id
WHERE  h.statement_date >= SYSDATE - 30
  AND  l.reconciliation_status <> 'RECONCILED'
ORDER BY l.statement_line_id;`}
      />
      <CodeBlock
        language="sql"
        filename="ce_external_cash_transactions.sql"
        code={`-- External cash transactions entered or imported
SELECT t.external_cash_transaction_id, t.trx_date, t.amount,
       t.currency_code, t.bank_account_id, t.status, t.description
FROM   ce_external_cash_transactions_all t
WHERE  t.creation_date >= SYSDATE - 30
ORDER BY t.trx_date DESC;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Matching a statement line confirms an existing transaction — it doesn't re-post it.{" "}
        <strong>External transactions</strong> and <strong>fund transfers</strong>, however, do
        create GL entries.
      </P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Statement line matched", "No additional entry (confirms existing transaction)"],
          ["External cash transaction", "Cash / bank", "Clearing account"],
          ["Fund transfer between own accounts", "Cash in target account", "Cash in source account"],
        ]}
      />
      <P>
        Trace the entries via <K>XLA_AE_HEADERS</K> / <K>XLA_AE_LINES</K> — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Reconciliation, Bank Statement", "Cash Management work areas / delivered BIP reports"],
          ["Cash Position, Liquidity Forecast", "Cash Management work areas (forecast uses predictive ML)"],
          ["Cash Position Cube", "OLAP cube for cash position analysis"],
          ["Cash Management Real Time subject areas", "OTBI"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>No reconciliation REST:</strong> run matching through the Automatic Reconciliation job via <K>erpProcesses</K>.</li>
        <li><strong>Expect exceptions:</strong> no rule set matches everything; design monitoring for the unmatched pool.</li>
        <li><strong>External transactions:</strong> use <K>cashExternalTransactions</K> or the External Transactions Import FBDI for cash movements with no AP/AR source.</li>
        <li><strong>Transfers:</strong> <K>cashBankAccountTransfers</K> moves cash between own accounts; physical pools actually transfer, notional pools only offset.</li>
        <li><strong>Forecast freshness:</strong> run Generate Cash Position after imports so positions and forecasts reflect reconciled data.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/cash-management">Cash Management troubleshooting</a>{" "}
        for the most common failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management">Cash Management hub</a>.</li>
        <li>Statements that feed reconciliation — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/statements">Bank Statements &amp; BAI2</a>.</li>
        <li>Reconciled cash posts to accounts from <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a> and <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
      </UL>
    </>
  );
}
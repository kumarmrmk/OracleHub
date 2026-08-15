import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "GL Period Close & Period Status",
};

export default function GlPeriodClosePage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="GL Period Close & Period Status"
        description={<>The GL mechanics that end a period: period status (Open / Future-entry / Closed), the close sequence inside GL, <Term k="consolidation">consolidation</Term> into reporting currencies or a group ledger, <Term k="clearingAccount">clearing accounts</Term>, and year-end close. For the cross-module close sequence, see the Financial Close hub.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "GL", href: "/fusion/financials/gl" }, { label: "GL Period Close & Period Status" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/journals">Journals &amp; Posting</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/multi-currency">Multi-Currency &amp; Rates</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/secondary-ledgers">Secondary Ledgers</a> before this page.
      </Callout>

      <H2>Functional view</H2>
      <P>
        Closing a GL period is a sequence, not a single action. The standard cycle runs{" "}
        <em>daily rates → revaluation → translation → allocations → consolidation → closing
        journals → open/close periods</em>. <strong>Period status</strong> controls everything:
        only open periods accept transactions, future-entry periods allow dates in the next period,
        and closed periods reject all posting. <strong>Year-end close</strong> transfers balances to
        retained earnings and opens the next year. <strong>Consolidation</strong> combines multiple
        ledgers (reporting-only view, or balance transfer into a consolidation ledger).
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Accounting period", "A calendar window with a status: Open, Future-entry, or Closed"],
          ["Close sequence", "The ordered steps run at period end (revalue, translate, allocate, ...)"],
          ["Consolidation", "Combining balances from multiple ledgers into one view or ledger"],
          ["Elimination entry", "Journal that removes intercompany or inter-entity profit"],
          ["Clearing account", "A suspense/interim account reconciled to zero before close"],
          ["Close Manager", "A checklist that orchestrates and tracks the close tasks"],
          ["Year-end close", "Transfers the year's balances to retained earnings"],
        ]}
      />
      <Diagram title="GL close sequence" className="mb-8">
        <DiagramNode tone="neutral" title="Rates" subtitle="daily + historical" />
        <Arrow />
        <DiagramNode tone="warning" title="Revalue" subtitle="open foreign-currency balances" />
        <Arrow />
        <DiagramNode tone="warning" title="Translate" subtitle="reporting currencies" />
        <Arrow />
        <DiagramNode tone="warning" title="Allocate" subtitle="cost distributions" />
        <Arrow />
        <DiagramNode tone="fusion" title="Consolidate" subtitle="group ledger / reporting-only" />
        <Arrow />
        <DiagramNode tone="success" title="Close period" subtitle="status → Closed" />
      </Diagram>
      <Callout type="info">
        The cross-module close sequence (sub-ledgers → GL → reporting) is documented on{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financial-close">Financial Close</a>.
        This page covers the GL-specific period status mechanics and consolidation inside GL.
      </Callout>

      <H2>Configuration</H2>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Accounting calendar & periods", "Which periods exist, in what order", "Manage Accounting Periods"],
          ["Period statuses", "Open / Future-entry / Closed per ledger", "Manage Accounting Periods"],
          ["Close sequence", "The order of close steps and who runs them", "Close Manager"],
          ["Consolidation maps", "How one ledger's segments map into the consolidation ledger", "Consolidation setup"],
          ["Clearing accounts", "Interim accounts reconciled to zero before close", "GL setup → Accounts"],
          ["Budget close", "Validate and upload budgets, then close the budget period", "Budgets work area"],
        ]}
      />
      <Callout type="warning">
        Never close a period while sub-ledgers or GL processes are still posting to it — re-open
        requires an administrator and leaves the close audit trail inconsistent.
      </Callout>

      <H2>Technical view</H2>
      <P>
        Period management is exposed through LOV resources for discovery and{" "}
        <K>erpProcesses</K> for the open/close jobs. Consolidation within GL uses maps configured in
        the UI plus balance transfer jobs.
      </P>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="per">accountingPeriodsLOV</K>, "GET — list accounting periods for a ledger/calendar"],
          [<K key="stat">accountingPeriodStatusLOV</K>, "GET — check a period's status (Open/Future-entry/Closed)"],
          [<K key="bal">ledgerBalances</K>, "GET — verify balances after the close sequence"],
          [<K key="proc">erpProcesses</K>, "POST — run Close Accounting Period / Open Accounting Period jobs"],
          [<K key="bdg">budgetaryControlBudgetTransactions</K>, "GET — view budget transactions for budget close"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Import General Ledger Budget Balances</K>, "Load budget balances before the budget close", "Open budget period"],
          [<K key="f2">Validate and Upload Budgets</K>, "ESS job validating and uploading budget data", "Budget setup"],
        ]}
      />
      <H3>Working example — close an accounting period</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "jobName": "Close Accounting Period",
    "parameters": [
      { "name": "LedgerId", "value": "1234" },
      { "name": "PeriodName", "value": "JAN-2026" }
    ]
  }'`}
      />
      <H3>Working example — check a period status</H3>
      <CodeBlock
        language="bash"
        filename="GET /accountingPeriodStatusLOV"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/accountingPeriodStatusLOV?q=PeriodName='JAN-2026'" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />

      <H2>Data flow — step by step</H2>
      <P>
        Where period state and close activity land in the underlying Oracle Database tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Period is opened for transactions", <K key="t1">GL_PERIOD_STATUSES</K>],
          ["2", "Transactions and journals post to the open period", <K key="t2">GL_BALANCES</K>],
          ["3", "Close sequence runs (revalue, translate, allocate, consolidate)", <span key="t3x"><K key="t3">GL_JE_HEADERS</K> / <K key="t4">GL_BALANCES</K></span>],
          ["4", "Closing and elimination journals post", <K key="t5">GL_JE_HEADERS</K>],
          ["5", "Clearing accounts are reconciled to zero", "GL reconciliation work area"],
          ["6", "Close Accounting Period marks the period Closed", <K key="t6">GL_PERIOD_STATUSES</K>],
          ["7", "Year-end close transfers balances to retained earnings", <span key="c0"><K key="t7">GL_BALANCES</K> (retained earnings)</span>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>
        Run these against the Fusion database to see period statuses and close activity.
      </P>
      <CodeBlock
        language="sql"
        filename="gl_period_statuses.sql"
        code={`-- Period status for a ledger across the year
SELECT p.period_name, p.period_year, p.period_num, p.period_status,
       p.quarter_num, p.quarter_status
FROM   gl_period_statuses p
WHERE  p.ledger_id = :ledger_id
  AND  p.period_year = 2026
ORDER BY p.period_num;`}
      />
      <CodeBlock
        language="sql"
        filename="gl_close_journals.sql"
        code={`-- Closing and elimination journals posted during close
SELECT h.je_batch_id, h.je_header_id, h.name, h.status,
       h.je_source, h.je_category, h.period_name
FROM   gl_je_headers h
WHERE  h.je_source IN ('CLOSING', 'ELIMINATION')
  AND  h.period_name = 'JAN-2026'
  AND  h.ledger_id = :ledger_id
ORDER BY h.creation_date DESC;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        The GL close creates journals that are not SLA-driven: revaluation, translation, allocation,
        closing, and elimination entries are all GL journals written to{" "}
        <K>GL_JE_HEADERS</K>/<K>GL_JE_LINES</K>. Consolidation can be <em>reporting-only</em> (a
        combined view, no journal) or a <em>balance transfer</em> (journals bring balances into a
        consolidation ledger).
      </P>
      <DataTable
        headers={["Close entry", "Debit", "Credit"]}
        rows={[
          ["Year-end close", "Retained earnings (opening balance)", "Expense / revenue accounts"],
          ["Elimination", "Parent's investment / group equity", "Subsidiary equity / intercompany balances"],
          ["Translation adjustment", "Cumulative translation adjustment", "Reporting-currency balance accounts"],
        ]}
      />

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Consolidated Trial Balance", "Financial Reporting Center (consolidation ledger)"],
          ["Period Close Status", "Close Manager / delivered BIP reports"],
          ["GL Balances Real Time", "OTBI subject area"],
          ["Budget versus Actual", "Financial Reporting Center (budget close)"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li>
          <strong>Status check before load:</strong> query <K>accountingPeriodStatusLOV</K> — never
          submit journals to a period that is not Open.
        </li>
        <li>
          <strong>Close via jobs:</strong> run Close / Open Accounting Period through{" "}
          <K>erpProcesses</K>; re-opening a closed period requires administrator approval.
        </li>
        <li>
          <strong>Order matters:</strong> revalue before translate, translate before consolidate —
          follow the ledger's defined close sequence.
        </li>
        <li>
          <strong>Clearing accounts:</strong> a non-zero clearing account blocks a clean close —
          reconcile them before running Close Accounting Period.
        </li>
        <li>
          <strong>Budget close:</strong> validate and upload budgets, then close the budget period
          separately from the GL close.
        </li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/gl">GL troubleshooting</a>{" "}
        for period close failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL hub</a> or the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>The full cross-module close sequence lives on <a className="font-semibold text-accent hover:underline" href="/fusion/financial-close">Financial Close</a>.</li>
        <li>Revaluation and translation steps are detailed on <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/multi-currency">Multi-Currency &amp; Rates</a>.</li>
      </UL>
    </>
  );
}

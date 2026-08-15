import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Budgets & Budgetary Control",
};

export default function GlBudgetsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Budgets & Budgetary Control"
        description={<>How Fusion sets spend limits and enforces them at transaction time. <Term k="ledger">Ledger</Term> budgets hold the planned amounts per account combination and period; <strong>budgetary control</strong> checks every document line against the remaining budget before it is approved — the accounting layer that makes a <em>budget</em> a hard limit instead of a report.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "GL", href: "/fusion/financials/gl" }, { label: "Budgets & Budgetary Control" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL hub</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/period-close">GL Period Close</a> (the budget close step), and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a> before this page.
      </Callout>

      <H2>Functional view</H2>
      <P>
        A <strong>budget</strong> is a plan: how much a department may spend on an account in a
        period. Fusion stores it as <strong>budget balances</strong> — a second set of balances
        beside the actuals in <K>GL_BALANCES</K>. <strong>Budgetary control</strong> makes that plan
        enforceable: when a document (PO, expense report, AP invoice) posts, the engine reserves the
        amount against the remaining budget and blocks the document if the reservation would exceed
        it.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Budget", "A plan of income/expense amounts per account combination and period, stored as budget balances per ledger"],
          ["Budget version", "A named copy of a budget (Original, Revised, Locked) — only the active version is controlled against"],
          ["Budget pool", "A shared limit covering a group of accounts (e.g. all marketing expense accounts) instead of one account at a time"],
          ["Encumbrance", "Budget reserved by an open document (PO, requisition) before the actual invoice arrives"],
          ["Budgetary control", "The enforcement engine: checks reservations and balances before a document is approved and posts"],
          ["Budget entry", "The journal-like entry used to load or adjust budget balances"],
          ["Budget period", "The period a budget amount belongs to — validated and uploaded before the budget close"],
        ]}
      />
      <Diagram title="Budgetary control at a glance" className="mb-8">
        <DiagramNode tone="neutral" icon="📊" title="Budget loaded" subtitle="planned $ per account-period (GL_BALANCES, budget balance type)" />
        <Arrow label="document line" />
        <DiagramNode tone="warning" icon="🛡️" title="Budget reservation" subtitle="check remaining vs amount" />
        <Arrow label="over budget?" />
        <DiagramNode tone="warning" icon="🚫" title="Block / warning" subtitle="document held until adjusted" />
        <Arrow label="available" />
        <DiagramNode tone="success" icon="✅" title="Reserve + post" subtitle="encumbrance / actual consumes budget" />
      </Diagram>
      <Callout type="info">
        Budgetary control is <strong>optional per ledger</strong> and <strong>per document type</strong>.
        Many implementations run budgets for reporting only (no control); control is switched on when
        the business wants hard enforcement at approval time.
      </Callout>

      <H2>Configuration</H2>
      <P>
        Budget control needs the ledger, a calendar, and a budget structure set up before the first
        document can be checked.
      </P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Budget structure & calendar", "Defines where budget balances live and their periods", "Ledger options → Budgetary Control"],
          ["Control level", "Check at document, account, or pool level — per ledger and document type", "Budgetary Control → Control Levels"],
          ["Budget entry method", "How budget balances are entered (period, project, or balance based)", "Budgetary Control setup"],
          ["Reservation rules", "Which documents reserve budget (POs only, or also requisitions/expenses)", "Budgetary Control → Reservations"],
          ["Over-budget behavior", "Block, warn, or allow — per document type", "Budgetary Control → Rules"],
          ["Budget periods", "Open the budget period before uploading balances", "Manage Budget Periods"],
        ]}
      />

      <H2>Technical view</H2>
      <H3>Import and load surfaces</H3>
      <DataTable
        headers={["Surface", "What you can do with it"]}
        rows={[
          [<K key="f1">Import General Ledger Budget Balances</K>, "FBDI → load budget balances into GL_BUDGET_INTERFACE, then Validate and Upload Budgets"],
          [<K key="f2">Budgetary Control Budget Import</K>, "FBDI → load budget/encumbrance balances for budgetary control"],
          [<K key="b1">GL_BUDGET_INTERFACE</K>, "Interface table the FBDI stages budget rows into"],
          [<K key="b2">GL_BUDGETS</K>, "Base table holding the budget versions per ledger"],
          [<K key="b3">GL_BALANCES</K>, "Budget balances live here as a separate balance type from actuals"],
          [<K key="r1">budgetaryControlBudgetTransactions</K>, "REST (GET) — view budget/encumbrance transactions, e.g. for budget close"],
          [<K key="proc">erpProcesses</K>, "REST (POST) — submit Validate and Upload Budgets"],
        ]}
      />
      <Callout type="warning">
        The REST surface for budgetary control is read-oriented in the 26C Financials guide — the
        create path for budget balances is the FBDI import followed by the Validate and Upload
        Budgets ESS job. Confirm resource names against your instance.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>Where a budget and its control events land in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Budget balances are staged from the FBDI file", <K key="t1">GL_BUDGET_INTERFACE</K>],
          ["2", "Validate and Upload Budgets creates the budget version", <K key="t2">GL_BUDGETS</K>],
          ["3", "The per-account-period amounts become budget balances", <span key="t3c"><K key="t3">GL_BALANCES</K> (budget balance type)</span>],
          ["4", "A purchasing/expense document line triggers a control check", "Document tables (PO_, AP_, EXM_)"],
          ["5", "The budget check reserves (encumbers) the amount against remaining budget", <K key="t4">GL_BUDGET_ENTRIES / budget transactions</K>],
          ["6", "When the actual is posted, the reservation converts to an actual consumption", <span key="t5c"><K key="t5">GL_BALANCES</K> (budget + actual types)</span>],
          ["7", "Budget close validates and locks the budget period", <span key="t6c"><K key="t6">GL_PERIOD_STATUSES</K> / budget periods</span>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data dictionary.
        Budgetary control also writes reservation detail to internal engine tables — confirm exact
        names against your instance before relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="gl_budget_balances.sql"
        code={`-- Budget vs actual for an account combination in a period
SELECT b.segment1, b.segment2, b.segment3,
       b.period_name,
       SUM(b.budget_net)   AS budget,
       SUM(b.period_net_dr - b.period_net_cr) AS actual
FROM   gl_balances b
WHERE  b.ledger_id = :ledger_id
  AND  b.period_name = :period_name
GROUP BY b.segment1, b.segment2, b.segment3, b.period_name;`}
      />
      <CodeBlock
        language="sql"
        filename="gl_budgets.sql"
        code={`-- Budget versions for a ledger
SELECT bg.budget_id, bg.name, bg.budget_version_flag,
       bg.status, bg.ledger_id
FROM   gl_budgets bg
WHERE  bg.ledger_id = :ledger_id
ORDER BY bg.creation_date DESC;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Worked example — a department budget enforced</H2>
      <WorkedExample
        title="Worked example: $10,000 marketing budget, $1,200 purchase"
        intro={
          <>
            Marketing has a <strong>$10,000</strong> budget for account 01-7300-000 in March. A PO for{" "}
            <strong>$1,200</strong> is submitted.
          </>
        }
        steps={[
          {
            label: "1 · Load the budget",
            body: (
              <>
                Budget balance loaded: 01-7300-000 · Mar · <strong>$10,000</strong>. Budgetary control
                is enabled for POs at document level.
              </>
            ),
          },
          {
            label: "2 · The PO is checked",
            body: (
              <>
                The $1,200 PO passes as an <strong>encumbrance</strong> (reservation) — remaining
                budget drops to $8,800. It does not reduce the actual spend yet, but is no longer
                available.
              </>
            ),
          },
          {
            label: "3 · The over-budget case",
            body: (
              <>
                A second PO for <strong>$9,000</strong> is rejected: $8,800 remaining &lt; $9,000. The
                document is held until the budget is revised or the first PO is cancelled.
              </>
            ),
          },
        ]}
        outcome={
          <>
            Budget balances and actuals both live in <K>GL_BALANCES</K> but as separate balance
            types, which is why "Budget vs Actual" reporting is a single query. The reservation →
            actual conversion is the encumbrance lifecycle at the heart of budgetary control.
          </>
        }
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Load order:</strong> open the budget period, load balances via FBDI, run Validate and Upload Budgets, then confirm the budget before documents are created.</li>
        <li><strong>Reservations are the tricky part:</strong> with encumbrance on, POs/reservations consume budget before the invoice — integrations must treat a reject here as a budget error, not a data error.</li>
        <li><strong>Reports monitor:</strong> Budget versus Actual runs in the Financial Reporting Center; OTBI exposes budget balances as a subject area.</li>
        <li><strong>Rest is read-mostly:</strong> budget close queries <K>budgetaryControlBudgetTransactions</K>; creation is FBDI + ESS, not REST create.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/gl">GL troubleshooting</a>{" "}
        (budget journal and budget close failures).
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Budgets close as part of <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/period-close">GL Period Close</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL hub</a> or the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
      </UL>
    </>
  );
}
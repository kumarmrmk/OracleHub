import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import LearningPath from "@/components/ui/LearningPath";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "General Ledger (GL)",
};

const topics = [
  {
    href: "/fusion/financials/gl/journals",
    title: "Journals & Posting",
    desc: "Journal types, GL_INTERFACE import, validation, approval, AutoPost, reversal.",
    tone: "border-t-sky-500/60",
  },
  {
    href: "/fusion/financials/gl/multi-currency",
    title: "Multi-Currency & Rates",
    desc: "Currencies, rate types, daily rates, revaluation, translation, FX revaluation.",
    tone: "border-t-emerald-500/60",
  },
  {
    href: "/fusion/financials/gl/secondary-ledgers",
    title: "Secondary Ledgers & Reporting Currencies",
    desc: "Ledger sets, controlled replication, reporting currencies, balance initialization.",
    tone: "border-t-amber-500/60",
  },
  {
    href: "/fusion/financials/gl/allocations",
    title: "Allocations & Recurring Entries",
    desc: "Recurring journals, Calculation Manager, allocation rules, rule sets, generation.",
    tone: "border-t-fuchsia-500/60",
  },
  {
    href: "/fusion/financials/gl/intercompany",
    title: "Intercompany Accounting",
    desc: "Intercompany transactions, balancing rules, agreements, cross-ledger allocations.",
    tone: "border-t-cyan-500/60",
  },
  {
    href: "/fusion/financials/gl/period-close",
    title: "GL Period Close & Period Status",
    desc: "GL period status, the close sequence, clearing accounts, year-end close.",
    tone: "border-t-rose-500/60",
  },
  {
    href: "/fusion/financials/gl/budgets",
    title: "Budgets & Budgetary Control",
    desc: "Budgets, budget pools, encumbrances, and enforcing spend limits.",
    tone: "border-t-orange-500/60",
  },
  {
    href: "/fusion/financials/gl/accounting-hub",
    title: "Financial Accounting Hub (FAH)",
    desc: "External transactions in, GL entries out — powered by SLA.",
    tone: "border-t-indigo-500/60",
  },
];

export default function GlPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="General Ledger (GL)"
        description={<>The system of record for financial balances. GL owns the <Term k="chartOfAccounts">chart of accounts</Term> (account flexfield), the <Term k="ledger">ledgers</Term> that define structure and currency, and the <Term k="period">periods</Term> that control when <Term k="posting">posting</Term> is allowed. This hub is your starting point; the deep dives below cover each area in functional and technical detail.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "GL" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a> (ledgers, BUs, data access sets),{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/flexfields">Flexfields &amp; Value Sets</a> (the chart of accounts), and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a> before this page.
      </Callout>

      <H2>The business story</H2>
      <P>
        At the end of every month, someone in the business has to answer a simple question:{" "}
        <em>"how are we doing?"</em> The General Ledger is where that answer is written down. Every
        sale, purchase, payment, and receipt across the company eventually becomes a{" "}
        <strong>journal entry</strong> in the GL, posted to the right <strong>accounts</strong> for
        the right <strong>period</strong> — and those posted balances are what the financial
        statements are made from.
      </P>
      <Diagram title="The GL in the business" className="mb-8">
        <DiagramNode tone="neutral" title="Business events" subtitle="invoices · payments · receipts · expenses" />
        <Arrow label="sub-ledgers post" />
        <DiagramNode tone="fusion" title="General Ledger" subtitle="journals · balances · periods" />
        <Arrow label="close" />
        <DiagramNode tone="success" title="Financial statements" subtitle="trial balance · P&L · balance sheet" />
      </Diagram>
      <Callout type="info">
        Think of the GL as the company's <strong>scoreboard</strong>: every other module does the
        playing, the GL keeps the score.
      </Callout>

      <Callout type="note" title="In simple words">
        The GL is the company's <strong>scorebook</strong>. Every sale and purchase gets written
        down here, and the totals become your financial reports.
      </Callout>

      <H2>Functional view</H2>
      <P>
        The GL stores the <strong>finished numbers</strong>. It keeps the chart of accounts (the
        list of account names), the journals that move money between them, and the periods that say
        when posting is allowed.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Chart of Accounts (COA)", "The account flexfield structure — the segment layout used to build every account combination"],
          ["Ledger", "A set of accounts + a calendar + a currency; the unit that holds balances and runs the close"],
          ["Accounting period", "A defined window (e.g. Jan-2025) that can be Open, Future-entry, or Closed"],
          ["Journal", "A batch of journal entry lines that post to accounts (manual, recurring, allocation, or imported)"],
          ["Account combination", "A specific value across COA segments, e.g. 01-6400-000 (Company-Natural-Cost Center)"],
          ["Balance", "Period-to-date / year-to-date totals for an account combination in a ledger"],
        ]}
      />
      <Callout type="info">
        Every GL integration must know the <strong>account flexfield structure</strong> — how many
        segments and which are required — because journal lines are written <em>per segment</em>, not
        as a single "account string".
      </Callout>

      <H2>Deep dives — read in this order</H2>
      <P>
        Start with <strong>Journals &amp; Posting</strong> if you are loading data, then
        multi-currency, then the ledger architecture topics. Period close pulls everything together.
      </P>
      <LearningPath
        steps={[
          {
            href: "/fusion/financials/gl/journals",
            title: "Journals & Posting",
            level: "Module",
            outcome: "How journals enter, validate, approve, and post — the load path for every GL feed.",
          },
          {
            href: "/fusion/financials/gl/multi-currency",
            title: "Multi-Currency & Rates",
            level: "Module",
            outcome: "Rates, revaluation, and translation — the currency mechanics behind open positions.",
          },
          {
            href: "/fusion/financials/gl/secondary-ledgers",
            title: "Secondary Ledgers & Reporting Currencies",
            level: "Advanced",
            outcome: "How a second view of the books is kept for local GAAP or group reporting.",
          },
          {
            href: "/fusion/financials/gl/allocations",
            title: "Allocations & Recurring Entries",
            level: "Advanced",
            outcome: "Automated recurring and allocation journals for monthly distribution work.",
          },
          {
            href: "/fusion/financials/gl/intercompany",
            title: "Intercompany Accounting",
            level: "Advanced",
            outcome: "Balancing and transfer between legal entities in one ledger.",
          },
          {
            href: "/fusion/financials/gl/period-close",
            title: "GL Period Close & Period Status",
            level: "Advanced",
            outcome: "The close sequence, consolidation methods, and year-end — the end of the R2R cycle.",
          },
          {
            href: "/fusion/financials/gl/budgets",
            title: "Budgets & Budgetary Control",
            level: "Module",
            outcome: "How budget balances are loaded, reserved, and enforced at approval time.",
          },
          {
            href: "/fusion/financials/gl/accounting-hub",
            title: "Financial Accounting Hub (FAH)",
            level: "Advanced",
            outcome: "How external transactions become GL entries through the SLA engine.",
          },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className={`group rounded-2xl border border-[var(--edge)] border-t-2 ${t.tone} bg-[var(--surface)] p-5 transition-colors hover:bg-[var(--surface-2)]`}
          >
            <h3 className="mb-1 font-bold text-ink group-hover:text-accent">{t.title}</h3>
            <p className="text-sm leading-6 text-muted">{t.desc}</p>
          </a>
        ))}
      </div>

      <H2>Technical view — the GL integration surfaces</H2>
      <P>
        The biggest misconception in GL integration is that you create journals over REST. In
        current Fusion releases <strong>journals are loaded via the Journal Import FBDI</strong>{" "}
        (into <K>GL_INTERFACE</K>), and the REST layer is mostly read/query plus LOV resources. The
        full catalog is on{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">FBDI &amp; ADFdi</a>.
      </P>
      <DataTable
        headers={["Surface", "Resource / job", "What you can do with it"]}
        rows={[
          [<K key="gl">Journal Import</K>, "FBDI → Import Journals job", "Bulk-load journal batches and lines into GL_INTERFACE; the primary create path"],
          [<K key="je">journalBatches</K>, "REST (GET/PATCH — no create)", "Read/query journal batches; patch limited completion/reversal attributes"],
          [<K key="ap">accountingPeriodsLOV / accountingPeriodStatusLOV</K>, "REST (GET)", "Check which periods are open before posting"],
          [<K key="led">ledgersLOV</K>, "REST (GET)", "List ledgers, calendars, currencies to pick the right ledger"],
          [<K key="bal">ledgerBalances</K>, "REST (GET)", "Query account balances by ledger/period"],
          [<K key="cur">currencyRates</K>, "REST (GET)", "Retrieve conversion rates for a currency pair/date"],
          [<K key="proc">erpProcesses</K>, "REST (POST)", "Submit Import Journals / Post Journals / Revalue / Translate / Allocate jobs"],
        ]}
      />
      <Callout type="warning">
        Older training material shows <K>journalEntries</K>, <K>generalLedgers</K>, or{" "}
        <K>accountingPeriods</K> as REST create resources. Those are not in the official 26C
        Financials REST guide — confirm against your instance's resource explorer before building an
        integration on them.
      </Callout>

      <H2>Configuration</H2>
      <P>
        The GL foundation is built top-down before any journal can post.
      </P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Chart of accounts (segments + value sets)", "Every account combination comes from here", "Fusion Setup → Chart of Accounts"],
          ["Calendar & periods", "Which periods exist and whether they're open", "Manage Accounting Periods"],
          ["Ledger & secondary ledgers", "Where balances live (and reporting currencies)", "Enterprise Structures setup"],
          ["Currencies & daily rates", "Needed for revaluation and translation", "Daily Rates setup"],
          ["Accounting method (SLA)", "How sub-ledger entries are shaped", "Subledger Accounting"],
          ["Data access sets", "Which ledgers a GL duty can see", "Access Sets Administration"],
          ["Account combinations", "Pre-build combinations the business uses", "Account Combinations Manager"],
        ]}
      />
      <Callout type="info">
        The three GL failures that dominate real projects — closed periods, invalid account
        combinations, and missing rates — all originate in these setups.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>
        Where a journal's life actually lands in the underlying Oracle Database tables. Full
        interface-table detail on{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/interface-tables">Interface Tables</a>.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Rows are staged from the FBDI file", <K key="t1">GL_INTERFACE</K>],
          ["2", "Import Journals runs, validates and creates the journal batch", <K key="t2">GL_JE_BATCHES</K>],
          ["3", "The journal header is created with source/category/date (status Unposted)", <K key="t3">GL_JE_HEADERS</K>],
          ["4", "Journal lines carry the per-segment accounts and debit/credit amounts", <K key="t4">GL_JE_LINES</K>],
          ["5", "Validation checks the account combinations and period", <span key="t5x"><span key="c0"><K key="t5">GL_JE_LINES</K> (status)</span> + COA tables</span>],
          ["6", "Posting runs — lines flip to Posted and balances are updated", <K key="t6">GL_BALANCES</K>],
          ["7", "Period close marks the period Closed/Future-entry", <K key="t7">GL_PERIOD_STATUSES</K>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data
        dictionary. Exact names can vary slightly by release — confirm against your instance's data
        dictionary before relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>
        Run these against the Fusion database (SQL Developer, DB access, or a read replica) to pull
        back whatever was created.
      </P>
      <CodeBlock
        language="sql"
        filename="gl_journals.sql"
        code={`-- All posted journals in a ledger for a period
SELECT h.je_batch_id, h.je_header_id, h.name, h.status,
       h.period_name, h.currency_code, h.je_source, h.je_category
FROM   gl_je_headers h
WHERE  h.ledger_id = :ledger_id
  AND  h.period_name = 'JAN-2026'
ORDER BY h.creation_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="gl_journal_lines.sql"
        code={`-- Journal lines (per-segment accounts) for one header
SELECT l.je_line_num, l.segment1, l.segment2, l.segment3,
       l.entered_dr, l.entered_cr, l.accounted_dr, l.accounted_cr
FROM   gl_je_lines l
WHERE  l.je_header_id = :je_header_id
ORDER BY l.je_line_num;`}
      />
      <CodeBlock
        language="sql"
        filename="gl_balances.sql"
        code={`-- Balances for an account combination in a period
SELECT b.segment1, b.segment2, b.segment3,
       b.period_name, b.period_net_dr, b.period_net_cr
FROM   gl_balances b
WHERE  b.ledger_id = :ledger_id
  AND  b.period_name = 'JAN-2026';`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        The GL receives two kinds of entries: journals created <em>in</em> the GL (manual,
        recurring, allocations, revaluation, translation) and journals created <em>by</em> sub-ledgers
        through <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">SLA</a>.
        Both land in <K>GL_JE_HEADERS</K>/<K>GL_JE_LINES</K> before posting updates{" "}
        <K>GL_BALANCES</K>.
      </P>
      <DataTable
        headers={["Journal type", "Who creates it", "Common use"]}
        rows={[
          ["Manual", "GL user / integration", "Adjustments, corrections"],
          ["Recurring", "GL setup", "Monthly accruals"],
          ["Allocation", "GL setup", "Distribute costs across departments"],
          ["Revaluation / Translation", "Period close", "Foreign currency re-measurement"],
          ["Sub-ledger (XLA)", "AP, AR, Cash, FA, Expenses", "Their transactions' accounting"],
        ]}
      />

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Trial Balance, Financial Statements", "Financial Reporting Center (FR Studio)"],
          ["General Ledger Balances Real Time", "OTBI subject area"],
          ["Account Monitor, Journals reports", "Delivered BIP reports"],
          ["Ad-hoc balance analysis", "Smart View (Excel)"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li>
          <strong>Period status is everything:</strong> posting to a closed period fails. Query{" "}
          <K>accountingPeriodsLOV</K> before running a journal load and choose the current open period.
        </li>
        <li>
          <strong>Segments must be real:</strong> each segment value must exist and combine into a
          valid, non-flagged account combination.
        </li>
        <li>
          <strong>Currencies:</strong> cross-currency journals need a valid exchange rate configured
          for the rate type and date.
        </li>
        <li>
          <strong>Create path is FBDI:</strong> bulk journal loads go through Journal Import into{" "}
          <K>GL_INTERFACE</K>; use <K>erpProcesses</K> to drive Import Journals and Post Journals.
        </li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/gl">GL troubleshooting</a>{" "}
        for the most common failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Journal imports are a core part of the <a className="font-semibold text-accent hover:underline" href="/oic/fbdi-integration">FBDI integration pattern</a>.</li>
        <li>Understand the flexfields that define segments on the <a className="font-semibold text-accent hover:underline" href="/fusion/concepts">core concepts</a> page.</li>
      </UL>
    </>
  );
}

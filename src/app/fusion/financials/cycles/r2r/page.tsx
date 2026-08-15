import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Record-to-Report (R2R)",
};

export default function R2rPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud · Business Cycles"
        title="Record-to-Report (R2R)"
        description={<>The cycle that turns transactions into financial statements: every <Term k="subledger">sub-ledger</Term> event posts to the GL, the <Term k="period">period</Term> closes in sequence, balances <Term k="consolidation">consolidate</Term>, and reports come out. It is the reporting layer on top of all other Financials activity and the cycle an accountant owns end to end.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Business Cycles", href: "/fusion/financials/cycles" }, { label: "Record-to-Report" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/period-close">Period Close</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/journals">Journals &amp; Posting</a> first.
      </Callout>

      <H2>The business story</H2>
      <P>
        Everything that happens in the business — buying, selling, paying, receiving, depreciating —
        must end up in the <Term k="ledger">ledger</Term> and then on a financial statement. Record-to-Report is the monthly
        loop that guarantees it: <Term k="subledger">sub-ledgers</Term> post to the GL, the close sequence runs in the right
        order, and reporting finally produces the trial balance, income statement, and balance sheet.
      </P>

      <H2>The cycle at a glance</H2>
      <Diagram title="Record-to-Report flow" className="mb-8">
        <DiagramNode tone="warning" icon="🧾" title="Sub-ledger events" subtitle="invoices · payments · receipts · assets" />
        <Arrow label="Create Accounting (SLA)" />
        <DiagramNode tone="fusion" icon="📗" title="GL journals" subtitle="posted to GL_JE_*" />
        <Arrow label="close sequence" />
        <DiagramNode tone="fusion" icon="📘" title="Balances & adjustment" subtitle="revalue · allocate · close" />
        <Arrow />
        <DiagramNode tone="fusion" icon="🏛️" title="Consolidation" subtitle="legal entities · reporting currencies" />
        <Arrow />
        <DiagramNode tone="success" icon="📊" title="Financial statements" subtitle="trial balance · P&L · balance sheet" />
      </Diagram>

      <H2>Step by step — where the data lands</H2>
      <P>
        The heart of R2R is the <strong>close sequence</strong>: a specific order you follow every
        period, because each step depends on the one before it.
      </P>
      <DataTable
        headers={["Step", "What happens", "Module / layer", "Table / surface"]}
        rows={[
          ["0", "Sub-ledgers create postable events (invoices, receipts, depreciation, etc.)", "All sub-ledgers", "Transaction tables (AP_, AR_, FA_, EXM_)"],
          ["1", "Create Accounting turns each event into journal entries", "SLA", "XLA_AE_HEADERS / XLA_AE_LINES (Create Accounting job)"],
          ["2", "Sub-ledger journals are imported and posted to the GL", "GL", "GL_JE_BATCHES / GL_JE_HEADERS / GL_JE_LINES"],
          ["3", "Daily rates are loaded for the period", "GL", "GL_DAILY_RATES (Daily Rates FBDI)"],
          ["4", "Revaluation re-measures open foreign-currency balances", "GL", "Revalue Balances job → revaluation journals"],
          ["5", "Allocations distribute costs across departments", "GL", "Allocate Balances job → allocation journals"],
          ["6", "Translation converts balances into the reporting currency", "GL", "Translate Balances job"],
          ["7", "Closing journals bring the period to a close and open the next", "GL", "Open/Close Accounting Period job"],
          ["8", <><Term k="consolidation">Consolidation</Term> rolls legal-entity results up for reporting</>, "GL", "Consolidation (reporting-only or balance transfer)"],
          ["9", "Reports run from the closed balances", "Reporting", "Financial Reporting Center / OTBI / BIP"],
        ]}
      />

      <H2>Why the order matters</H2>
      <P>
        The ordering collapses into the one sentence every accountant lives by:{" "}
        <em>you cannot close a period with open transactions, and you cannot report before you
        close.</em> More concretely:
      </P>
      <UL>
        <li><strong>Accounting before close</strong> — Create Accounting must run for every sub-ledger event or the GL is missing entries.</li>
        <li><strong>Posting before revaluation</strong> — revaluation only sees posted balances.</li>
        <li><strong>Rates before translation</strong> — Translate Balances needs the period's rates.</li>
        <li><strong>All done before consolidation</strong> — consolidating before the close finishes reports stale data.</li>
      </UL>
      <Callout type="info">
        The <a className="font-semibold text-accent hover:underline" href="/fusion/financial-close">Financial Close</a> page
        covers the full close sequence and Close Manager; this cycle page shows how every sub-ledger
        plugs into it.
      </Callout>

      <H2>Worked example — one month for a small company</H2>
      <Callout type="example" title="Worked example: the month-end loop">
        <p className="mb-2"><strong>1. Sub-ledger posts:</strong> an AP invoice for $1,320 (from P2P) and an AR invoice for $5,250 (from O2C) create accounting entries and post to the GL.</p>
        <p className="mb-2"><strong>2. New balances:</strong> GL_BALANCES now shows the accounts with period activity (equipment +1,200, revenue +5,000, AP liability +1,320, AR receivable +5,250…).</p>
        <p className="mb-2"><strong>3. Revalue:</strong> a €10,000 receivable at a 1.10 rate revalues — a $500 gain is journaled at 1.05.</p>
        <p className="mb-2"><strong>4. Allocate:</strong> rent of $3,000 is spread across three departments at $1,000 each via an allocation journal.</p>
        <p className="mb-2"><strong>5. Close:</strong> the period is closed; the trial balance ties (debits = credits), and the P&amp;L and balance sheet run.</p>
        <p className="mb-0"><strong>6. Report:</strong> statements are produced in the Financial Reporting Center and reviewed before the ledger is locked.</p>
      </Callout>

      <H2>Common failure points</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["GL is missing entries", "Create Accounting never ran for a sub-ledger", "Run Create Accounting before the GL transfer"],
          ["Journal won't post", "Period is closed or account invalid", "Open the period / fix the account combination"],
          ["Trial balance out of balance", "Unposted journals or a partial close", "Post everything, then re-run the close steps"],
          ["Revaluation/translation fails", "No daily rate for the pair/date", "Load daily rates, then re-run"],
          ["Consolidated report looks wrong", "Consolidated before the close finished", "Complete every close step first"],
          ["Foreign balances wrong", "Translation used the old rate", "Re-load the correct period rates and translate again"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Drive the jobs, don't click them:</strong> Create Accounting, Post Journals, Revalue, Translate, and Open/Close are all <K>erpProcesses</K> submissions.</li>
        <li><strong>Period status is the gate:</strong> query <K>accountingPeriodsLOV</K> before submitting anything that posts.</li>
        <li><strong>Balances, not transactions, for reporting:</strong> reporting reads <K>GL_BALANCES</K>; journal lines are the audit trail behind them.</li>
        <li><strong>Interface tables first:</strong> journal feeds go into <K>GL_INTERFACE</K> and post via Import Journals — never insert into GL_JE_* directly.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Master the close sequence on <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/period-close">GL Period Close</a>.</li>
        <li>Understand how any transaction becomes GL entries in <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.</li>
        <li>See the whole loop around R2R: <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles">Business Cycles</a>.</li>
      </UL>
    </>
  );
}
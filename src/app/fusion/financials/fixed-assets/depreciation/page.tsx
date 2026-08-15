import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Depreciation & Revaluation",
};

export default function DepreciationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Depreciation & Revaluation"
        description={<>How asset value is written off over time: the Calculate <Term k="depreciation">Depreciation</Term> run against each book's calendar, the <Term k="depreciation">depreciation</Term> methods and rules behind it, group depreciation, what-if projection, and <Term k="revaluation">revaluation</Term> with rules, value types, and price indexes.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Fixed Assets", href: "/fusion/financials/fixed-assets" }, { label: "Depreciation & Revaluation" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/books-setup">Asset Books &amp; Setup</a> (the calendar and conventions a run posts against),{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/additions">Additions &amp; Mass Additions</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/erp-processes">Driving ESS via REST (erpProcesses)</a> (how the depreciation jobs are submitted).
      </Callout>

      <H2>Functional view</H2>
      <P>
        Depreciation is calculated <strong>per book, per period</strong>: the <K>Calculate
        Depreciation</K> run takes every asset in the book with an open depreciation period and
        writes the period's charge. The results aggregate per asset, and{" "}
        <K>Create Accounting for Assets</K> turns the run into journal entries that post to the GL.
      </P>
      <Diagram title="The depreciation cycle" className="mb-8">
        <DiagramNode tone="warning" title="Open period" subtitle="book calendar check" />
        <Arrow label="run" />
        <DiagramNode tone="fusion" title="Calculate Depreciation" subtitle="per asset, per period" />
        <Arrow label="schedule" />
        <DiagramNode tone="neutral" title="FA_DEPRN_SUMMARY" subtitle="period · YTD · reserve" />
        <Arrow label="accounting" />
        <DiagramNode tone="success" title="Create Accounting" subtitle="entries → GL via XLA" />
      </Diagram>
      <DataTable
        headers={["Depreciation method", "How it writes off value"]}
        rows={[
          ["Straight-line", "Equal annual expense spread over the asset's life (most common default)"],
          ["Declining balance", "Accelerated: a fixed rate applied to the remaining book value each period"],
          ["Units of production", "Expense proportional to actual usage/units versus the total expected units — fed by unit-of-production imports"],
          ["Life in Periods", "Specifies the depreciable life directly as a number of periods instead of years/months"],
          ["Annuity", "Level periodic amount that treats the asset as earning/lending a rate of return"],
        ]}
      />
      <P>
        The result for any asset is driven by the <strong>depreciation rules</strong> and the book's{" "}
        <strong>default subcomponent rules</strong>: for assets made of subcomponents (for example a
        machine with a rebuildable engine), the rule set describes how each subcomponent is treated
        and which method/life each gets.
      </P>
      <DataTable
        headers={["Capability", "What it does"]}
        rows={[
          ["Deferred depreciation", "Postpones depreciation for assets not yet placed fully in service; released to expense on a later date"],
          ["Depreciation override", "Lets a user replace the calculated amount for a specific asset/period"],
          ["Unplanned depreciation", "Records an extra one-off charge (for example a write-down of remaining value)"],
          ["Group assets & group depreciation", "Depreciates a pool of similar assets together and computes a group rate; assets add into or retire from the group"],
          ["What-if depreciation analysis", "The Depreciation Projection job previews future charges without posting them"],
        ]}
      />
      <P>
        <strong>Revaluation</strong> restates an asset's cost (and its accumulated depreciation) so
        the books reflect current market or index values. It is governed by{" "}
        <strong>revaluation rules</strong> that define the <strong>value types</strong> (book value,
        cost, accumulated depreciation, or gross value) to revalue, the{" "}
        <strong>price indexes</strong> used, and how the revaluation gain or loss is accounted for.
      </P>

      <H2>Configuration</H2>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Depreciation methods & rules", "Straight-line, declining balance, units, Life in Periods, annuity; per-method parameters", "Fixed Assets → Depreciation Rules"],
          ["Default subcomponent rules", "Defaults for assets built from multiple subcomponents", "Fixed Assets → Depreciation Rules"],
          ["Calendar & conventions", "Open periods per book; prorate conventions set first and last charges", "Fixed Assets → Fiscal Years"],
          ["Revaluation rules", "Value types, price indexes, and the accounts for revaluation gain/loss", "Fixed Assets → Revaluation"],
          ["Deferred / override / unplanned setups", "Rule flags and account defaults for special charges", "Fixed Assets setup"],
        ]}
      />

      <H2>Technical view</H2>
      <Callout type="info">
        The Financials REST guide does not publish an <K>assets</K> resource — asset-level CRUD is
        under the <strong>SCM / Asset Management</strong> REST guide (<K>fscmRestApi</K>). The
        depreciation cycle itself is driven by ESS jobs submitted through <K>erpProcesses</K>.
      </Callout>
      <H3>ESS jobs</H3>
      <DataTable
        headers={["ESS job", "What it does"]}
        rows={[
          [<K key="j1">Calculate Depreciation</K>, "Runs the period depreciation calculation for a book — writes the per-period schedules and summary"],
          [<K key="j2">Depreciation Projection</K>, "What-if analysis: projects future depreciation charges without posting them"],
          [<K key="j3">Create Accounting for Assets</K>, "Generates the SLA journal entries for the approved depreciation run"],
          [<K key="j4">Run Depreciation</K>, "Broader depreciation run used for reporting/set scenarios depending on release"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose"]}
        rows={[
          [<K key="f1">Import Units of Production</K>, "Loads actual units produced so units-of-production assets can be depreciated correctly"],
          [<K key="f2">Fixed Asset Mass Revaluations Import</K>, "Bulk-applies revaluations to assets using your revaluation rules"],
        ]}
      />
      <H3>Working example — run Calculate Depreciation</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "processName": "Calculate Depreciation",
    "processType": "ESS",
    "parameters": [
      { "name": "RequestId", "value": "12345" },
      { "name": "BookCode", "value": "CORP" }
    ]
  }'`}
      />
      <P>
        The parameter list and names vary by job and release — read them from the job's submission UI
        or the REST resource explorer and verify against your instance. After a successful run, submit{" "}
        <K>Create Accounting for Assets</K> to post the entries.
      </P>

      <H2>Data flow — step by step</H2>
      <P>
        Where the depreciation cycle lands in the underlying tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "An open depreciation period is confirmed for the book's calendar", <span key="d1c"><K key="d1">FA_DEPRECIATION</K> / <K key="d2">FA_DEPRN_PERIODS</K></span>],
          ["2", "Calculate Depreciation runs and computes each asset's charge for the period", <span key="c0"><K key="d3">FA_DEPRN_SUMMARY</K> (and per-period schedule)</span>],
          ["3", "Running totals are updated: period amount, YTD, and the accumulated reserve", <K key="d4">FA_DEPRN_SUMMARY</K>],
          ["4", "The book's reserve and cost balances reflect the run", <K key="d5">FA_BOOKS</K>],
          ["5", "Create Accounting for Assets converts the run into journal entries", <K key="d6">XLA_AE_HEADERS</K>, <K key="d7">XLA_AE_LINES</K>],
          ["6", "Entries post to the GL", "GL journal tables (via SLA)"],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data dictionary.
        Which calendar table a release uses and the exact summary column names can vary — confirm
        against your instance's data dictionary before relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="fa_deprn_summary.sql"
        code={`-- Accumulated depreciation for assets in a book
SELECT a.asset_number, s.book_type_code, p.period_name,
       s.depreciation_amount, s.ytd_depreciation, s.deprn_reserve
FROM   fa_deprn_summary s
JOIN   fa_additions_b a ON a.asset_id = s.asset_id
JOIN   fa_deprn_periods p
  ON   p.book_type_code = s.book_type_code
  AND  p.period_counter  = s.period_counter
WHERE  s.book_type_code = :book_type_code
  AND  s.period_counter = :period_counter
ORDER BY a.asset_number;`}
      />
      <CodeBlock
        language="sql"
        filename="fa_deprn_projection.sql"
        code={`-- Depreciation projection (what-if) basis from the book and summary
SELECT a.asset_number, b.book_type_code, b.cost, b.depreciation_method,
       b.life_in_months, s.deprn_reserve,
       b.cost - NVL(s.deprn_reserve, 0) AS remaining_value
FROM   fa_books b
JOIN   fa_additions_b a ON a.asset_id = b.asset_id
LEFT JOIN fa_deprn_summary s
  ON   s.asset_id = b.asset_id
  AND  s.book_type_code = b.book_type_code
WHERE  b.book_type_code = :book_type_code
  AND  b.depreciate_flag = 'Y'
ORDER BY a.asset_number;`}
      />
      <Callout type="tip">
        Projections are produced by the <K>Depreciation Projection</K> job, not stored as book-of-
        record data — these queries give the basis to check them. Verify column names (for example
        whether a release uses <K>life_in_months</K>) against your instance, and never query the
        Fusion database directly for production reporting — use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Depreciation posts through <K>Create Accounting for Assets</K>:
      </P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Depreciation run", "Depreciation expense", "Accumulated depreciation"],
          ["Unplanned depreciation / override increase", "Depreciation expense", "Accumulated depreciation"],
          ["Revaluation (increase)", "Asset / accumulated depreciation", "Revaluation reserve"],
          ["Revaluation (decrease)", "Revaluation expense / reserve", "Asset account"],
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
          ["Depreciation schedules & projection output", "Delivered BIP reports under Fixed Assets"],
          ["Fixed Assets Real Time subject areas (depreciation/reserve)", "OTBI"],
          ["Depreciation expense in the GL", "Financial Reporting / GL reports"],
        ]}
      />

      <H2>Worked example — straight-line depreciation</H2>
      <WorkedExample
        title="Worked example: $12,000 machine, 60-month life, half-year convention"
        intro={
          <>
            Cost <strong>$12,000</strong>, straight-line life <strong>60 months</strong>, placed in
            service mid-year under a <strong>half-year convention</strong> (year one gets half a
            year's charge).
          </>
        }
        steps={[
          {
            label: "1 · Work the arithmetic",
            body: (
              <>
                Annual charge = $12,000 ÷ 60 months × 12 = <strong>$2,400/year</strong>. Period charge
                = $2,400 ÷ 12 = <strong>$200/period</strong>. With the convention, year 1 is{" "}
                <strong>$1,200</strong> — the full-year charge, halved.
              </>
            ),
          },
          {
            label: "2 · What the run writes each period",
            body: (
              <>
                <K>Calculate Depreciation</K> writes the <strong>$200</strong> charge to the per-period
                schedule and updates the running reserve in <K>FA_DEPRN_SUMMARY</K>;{" "}
                <K>Create Accounting for Assets</K> posts the entry below.
              </>
            ),
          },
        ]}
        journal={[
          { account: "01-6900-000 — Depreciation expense", debit: "$200" },
          { account: "01-1700-000 — Accumulated depreciation", credit: "$200" },
        ]}
        outcome={
          <>
            After 60 periods the reserve reaches <strong>$12,000</strong> and net book value hits{" "}
            <strong>$0</strong>. Shorten the life, switch to a full-year convention, or use
            units-of-production and the charge changes exactly as the math predicts — run the{" "}
            <K>Depreciation Projection</K> job to preview it without posting.
          </>
        }
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Open period is everything:</strong> Calculate Depreciation only posts to an open period in the book's calendar — check it before every run.</li>
        <li><strong>Run order:</strong> Calculate Depreciation → review the schedule → Create Accounting for Assets. Posting only happens at the accounting step.</li>
        <li><strong>Projections are safe:</strong> the Depreciation Projection job is what-if and never posts — great for validating a rate or method change before committing.</li>
        <li><strong>Units of production need data:</strong> units-based assets must have their actual units loaded (Import Units of Production FBDI) or the run undercharges.</li>
        <li><strong>Revaluation impacts GL:</strong> revaluation entries hit asset, reserve, and expense accounts — verify the revaluation rules' accounts and value types first.</li>
        <li><strong>Asset CRUD lives in SCM:</strong> direct asset maintenance goes through the SCM / Asset Management guide (<K>fscmRestApi</K>); verify resource and column names against your instance.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/fixed-assets">Fixed Assets troubleshooting</a>{" "}
        for the most common failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets">Fixed Assets overview</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Continue to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/transactions">Transfers, Retirements &amp; Impairment</a>.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import LearningPath from "@/components/ui/LearningPath";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Fixed Assets",
};

const topics = [
  {
    href: "/fusion/financials/fixed-assets/books-setup",
    title: "Asset Books & Setup",
    desc: "Corporate vs tax books, calendars, conventions, capitalization thresholds, categories.",
    tone: "border-t-sky-500/60",
  },
  {
    href: "/fusion/financials/fixed-assets/additions",
    title: "Additions & Mass Additions",
    desc: "Additions, mass additions from AP/receiving/projects, CIP lifecycle, leases.",
    tone: "border-t-emerald-500/60",
  },
  {
    href: "/fusion/financials/fixed-assets/depreciation",
    title: "Depreciation & Revaluation",
    desc: "Depreciation methods, running depreciation, group assets, revaluation.",
    tone: "border-t-amber-500/60",
  },
  {
    href: "/fusion/financials/fixed-assets/transactions",
    title: "Transfers, Retirements & Impairment",
    desc: "Transfers & reclassification, retirements, impairment, physical inventory.",
    tone: "border-t-fuchsia-500/60",
  },
];

export default function FixedAssetsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Fixed Assets"
        description={<>Tracks capital assets and their <Term k="depreciation">depreciation</Term>. Assets live in asset books, get added through the asset addition flow, and <Term k="depreciation">depreciate</Term> on a calendar held in the depreciation periods table. This hub is your starting point; the deep dives below cover each area in functional and technical detail.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Fixed Assets" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a> (ledger, asset books),{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/flexfields">Flexfields &amp; Value Sets</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financial-close">Financial Close</a> (how depreciation posts) before this page.
      </Callout>

      <H2>The business story</H2>
      <P>
        Not everything the company buys gets used up in a month. A machine, a building, a vehicle{" "}
        <em>lasts for years</em> — and accounting has to recognize that it slowly loses value over
        that time. <strong>Fixed Assets</strong> tracks those big-ticket items: what was bought
        (additions), and how its cost is written off each period (depreciation).
      </P>
      <Diagram title="The asset lifecycle" className="mb-8">
        <DiagramNode tone="neutral" icon="🏭" title="Addition" subtitle="buy it · put it in service" />
        <Arrow />
        <DiagramNode tone="warning" icon="🕰️" title="Depreciate" subtitle="write off value each period" />
        <Arrow />
        <DiagramNode tone="neutral" icon="🔄" title="Transfer / adjust" subtitle="move · revalue · impair" />
        <Arrow />
        <DiagramNode tone="success" icon="🏁" title="Retire" subtitle="sell · dispose · remove from books" />
      </Diagram>
      <Callout type="info">
        It's <em>not</em> inventory and it's <em>not</em> an expense: an asset is capitalized on
        arrival and its cost is released gradually as depreciation expense. That distinction is what
        Fixed Assets is all about.
      </Callout>

      <Callout type="note" title="In simple words">
        Fixed Assets tracks the <strong>big things</strong> a company owns that last for years —
        machines, vehicles, buildings — and slowly writes off their cost over time (depreciation).
      </Callout>

      <H2>Functional view</H2>
      <P>
        A company owns long-lived items. Each one is an <strong>asset</strong> that enters an{" "}
        <strong>asset book</strong> (the rules holder) via an <em>asset addition</em>, loses value per
        period through <em>depreciation</em>, and can later be transferred, adjusted, or retired.
        Every event is recorded in the asset history.
      </P>
      <Diagram title="Asset lifecycle" className="mb-8">
        <DiagramNode tone="fusion" title="Addition" subtitle="create asset + book + distribution" />
        <Arrow label="run depreciation" />
        <DiagramNode tone="fusion" title="Depreciation" subtitle="per period, per book calendar" />
        <Arrow />
        <DiagramNode tone="neutral" title="Transfer / Adjustment" subtitle="category · location · cost" />
        <Arrow />
        <DiagramNode tone="neutral" title="Retirement" subtitle="dispose, sell, or retire" />
      </Diagram>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Asset", "A capitalized item (machine, vehicle, building) with a cost and depreciation life"],
          ["Asset category", "Groups assets (e.g. Machinery, Furniture) and drives capitalization + depreciation defaults"],
          ["Asset book", "A set of depreciation rules (method, life, convention) applied to assets"],
          ["Depreciation method / life / convention", "How the value is written off: straight-line vs units, life in months, prorate rule for the first period"],
          ["Depreciation period", "A calendar window per book (from FA_DEPRN_PERIODS) that the run posts against"],
          ["Asset addition", "The transaction that brings a new asset into a book at a cost"],
          ["Distribution", "The account + location each asset unit is assigned to"],
          ["Depreciation run", "The periodic process that calculates and posts depreciation to the GL"],
          ["Transfer / Adjustment / Retirement", "Events that change category, location, cost, or dispose the asset — each recorded in history"],
        ]}
      />

      <H2>Deep dives — read in this order</H2>
      <P>
        Set up books and categories first, then additions/mass additions, then depreciation. The
        transactions page covers the back half of the asset lifecycle.
      </P>
      <LearningPath
        steps={[
          {
            href: "/fusion/financials/fixed-assets/books-setup",
            title: "Asset Books & Setup",
            level: "Module",
            outcome: "Books, calendars, conventions, and thresholds — the rules every asset runs under.",
          },
          {
            href: "/fusion/financials/fixed-assets/additions",
            title: "Additions & Mass Additions",
            level: "Module",
            outcome: "How assets enter: additions and the mass-additions/CIP pipeline with their load rules.",
          },
          {
            href: "/fusion/financials/fixed-assets/depreciation",
            title: "Depreciation & Revaluation",
            level: "Advanced",
            outcome: "Methods, running depreciation, group assets, and revaluation each period.",
          },
          {
            href: "/fusion/financials/fixed-assets/transactions",
            title: "Transfers, Retirements & Impairment",
            level: "Advanced",
            outcome: "The back half of the lifecycle: transfers, disposals, impairment, physical inventory.",
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

      <H2>Technical view — the FA integration surfaces</H2>
      <P>
        One fact that surprises most consultants: the <strong>Financials REST guide ships only two
        Fixed Assets resources</strong> (<K>fixedAssetBooksLOV</K> and <K>fixedAssetCategoriesLOV</K>,
        both read-only). Real asset create/update lives in the <strong>SCM / Asset Management</strong>{" "}
        REST guide, and the practical create path is the{" "}
        <strong>Fixed Asset Mass Additions Import</strong> FBDI.
      </P>
      <DataTable
        headers={["Surface", "Resource / job", "What you can do with it"]}
        rows={[
          [<K key="l1">fixedAssetBooksLOV</K>, "REST (GET)", "List asset books and their depreciation rules"],
          [<K key="l2">fixedAssetCategoriesLOV</K>, "REST (GET)", "List asset categories"],
          [<K key="f1">Fixed Asset Mass Additions Import</K>, "FBDI → Post Mass Additions", "Bulk-load additions into FA_MASS_ADDITIONS"],
          [<K key="f2">Mass Adjustments / Retirements / Revaluations / Transfers</K>, "FBDI", "Bulk asset lifecycle transactions"],
          [<K key="f3">Physical Inventory Interface</K>, "FBDI", "Import physical inventory counts"],
          [<K key="proc">erpProcesses</K>, "REST (POST)", "Submit Post Mass Additions / Calculate Depreciation / Create Accounting for Assets"],
          [<K key="scm">Asset CRUD</K>, "SCM Asset Management REST guide", "Create/read assets — not in the Financials REST book"],
        ]}
      />

      <H2>Configuration</H2>
      <P>
        Fixed Assets is configured before any asset can be added or depreciated.
      </P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Asset books (FA_BOOK_CONTROLS)", "Depreciation rules, method, life, convention", "Fixed Assets → Asset Books"],
          ["Categories & category books", "Default capitalization/depreciation per asset type", "Asset Categories"],
          ["Depreciation calendar (FA_DEPRN_PERIODS)", "The periods a run can post to", "Fiscal Years & Periods"],
          ["Account mappings", "Where asset, depreciation, and retirement post in the GL", "Asset Account Combinations"],
          ["Mass addition template", "Bulk-load mapping for additions", "Mass Additions"],
        ]}
      />
      <Callout type="info">
        The single most common FA failure — "no open period" — comes from the depreciation calendar.
        Check <K>FA_DEPRN_PERIODS</K> before every run.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>
        Where each step of the asset → book → depreciation chain lands — including the calendar
        table <K>FA_DEPRN_PERIODS</K> that drives every depreciation run.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Setup: the asset book and its depreciation rules are defined", <K key="d1">FA_BOOK_CONTROLS</K>],
          ["2", "Setup: the depreciation calendar (fiscal years + open periods) is built for the book", <K key="d2">FA_DEPRN_PERIODS</K>],
          ["3", "Mass additions are staged (from AP/receiving/projects/legacy)", <K key="d3">FA_MASS_ADDITIONS</K>],
          ["4", "Post Mass Additions creates the asset master", <span key="d4c"><K key="d4">FA_ADDITIONS_B</K> / <K key="d5">FA_ADDITIONS_TL</K></span>],
          ["5", "The asset is assigned to a book at cost", <K key="d6">FA_BOOKS</K>],
          ["6", "The asset is distributed to accounts and locations", <K key="d7">FA_DISTRIBUTION_HISTORY</K>],
          ["7", "Depreciation run: for the current open period, each asset is calculated", <K key="d8">FA_DEPRECIATION_CALC</K>],
          ["8", "The run writes the per-period schedule", <K key="d9">FA_DEPRN_DETAIL</K>],
          ["9", "The run updates running totals (period, YTD, reserve)", <K key="d10">FA_DEPRN_SUMMARY</K>],
          ["10", "Depreciation posts to the GL", <span key="d11c"><K key="d11">XLA_AE_HEADERS</K>, <K key="d12">XLA_AE_LINES</K></span>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data
        dictionary. Exact names can vary slightly by release — confirm against your instance's data
        dictionary before relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>
        Run these against the Fusion database to pull back whatever was created. Note the join
        through <K>FA_DEPRN_PERIODS</K> — it is the key to every depreciation query.
      </P>
      <CodeBlock
        language="sql"
        filename="fa_deprn_periods.sql"
        code={`-- The depreciation calendar for a book (which periods are open)
SELECT p.book_type_code, p.fiscal_year, p.period_name, p.period_counter,
       p.deprn_start_date, p.deprn_end_date,
       p.open_period_flag, p.adjustment_period_flag
FROM   fa_deprn_periods p
WHERE  p.book_type_code = :book_type_code
ORDER BY p.period_counter;`}
      />
      <CodeBlock
        language="sql"
        filename="fa_mass_additions.sql"
        code={`-- Staged mass additions and their status
SELECT m.mass_additions_id, m.asset_number, m.description,
       m.cost, m.status, m.source, m.book_type_code
FROM   fa_mass_additions m
WHERE  m.creation_date >= SYSDATE - 30
ORDER BY m.creation_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="fa_assets.sql"
        code={`-- Assets assigned to a book
SELECT a.asset_number, a.asset_description,
       b.book_type_code, b.date_placed_in_service, b.cost, b.deprn_reserve
FROM   fa_additions_b a
JOIN   fa_books b ON b.asset_id = a.asset_id
WHERE  b.book_type_code = :book_type_code
ORDER BY a.asset_number;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        The main FA events and their entries:
      </P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Asset addition", "Asset account", "Clearing / AP (or cash)"],
          ["Depreciation run", "Depreciation expense", "Accumulated depreciation"],
          ["Retirement (disposal)", "Accumulated depreciation + receivable", "Asset account (+ gain/loss)"],
        ]}
      />
      <P>
        Posting goes through the GL interface and XLA — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Asset Register, Depreciation schedules", "Delivered BIP reports (Fixed Assets)"],
          ["Fixed Assets Real Time subject areas", "OTBI"],
          ["Asset activity in the GL", "Financial Reporting / GL reports"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Book-per-approach:</strong> assets belong to books; an integration typically writes to the corporate book used for GL posting.</li>
        <li><strong>The calendar governs the run:</strong> depreciation can only post to an <em>open</em> period in <K>FA_DEPRN_PERIODS</K> — check <K>open_period_flag</K> before posting.</li>
        <li><strong>Create path:</strong> additions are bulk-loaded via the Mass Additions FBDI and posted with the Post Mass Additions job — there is no Financials REST create for assets.</li>
        <li><strong>Key fields:</strong> asset category drives capitalization rules — confirm available categories first.</li>
        <li><strong>Depreciation start dates:</strong> the prorate/start date determines the first depreciation period.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/fixed-assets">Fixed Assets troubleshooting</a>{" "}
        for the most common failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Depreciation posts flow into the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL journal</a> world.</li>
      </UL>
    </>
  );
}

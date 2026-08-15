import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Secondary Ledgers & Reporting Currencies",
};

export default function GlSecondaryLedgersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Secondary Ledgers & Reporting Currencies"
        description={<>How one set of transactions can produce books for local GAAP, group GAAP, tax, and reporting in another currency. Secondary ledgers replicate accounting; reporting currencies add a converted balance view without a full <Term k="ledger">ledger</Term>.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "GL", href: "/fusion/financials/gl" }, { label: "Secondary Ledgers & Reporting Currencies" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a> (ledger, legal entity, chart of accounts) and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/multi-currency">Multi-Currency &amp; Rates</a> before this page.
      </Callout>

      <H2>Functional view</H2>
      <P>
        A <strong>primary ledger</strong> is the legal set of books. A <strong>secondary
        ledger</strong> keeps a parallel set of books that is derived from the primary by{" "}
        <em>controlled replication</em> (same source accounting, adjusted at the journal level for
        the second GAAP). A <strong>reporting currency</strong> is not a full ledger — it holds
        converted balances only. Use secondary ledgers when you need journal-level differences (tax
        vs book, local GAAP vs group GAAP); use reporting currencies when you only need the same
        balances in another currency.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Primary ledger", "The ledger that owns the source transactions and balances"],
          ["Secondary ledger", "A parallel ledger via controlled replication of the primary's journals"],
          ["Reporting currency", "A converted balance-only view, not a full ledger"],
          ["Ledger set", "A group of ledgers closed and reported together"],
          ["Balancing segment", "The segment (e.g. company) each ledger replicates or balances by"],
          ["Balance initialization", "Loading opening balances when a new ledger or currency goes live"],
        ]}
      />
      <Diagram title="Ledger architecture" className="mb-8">
        <DiagramNode tone="fusion" title="Primary ledger" subtitle="EUR, group GAAP, source of truth" />
        <Arrow label="controlled replication" />
        <DiagramNode tone="neutral" title="Secondary ledger" subtitle="USD, local GAAP, journal-level adjustments" />
        <Arrow label="translate" />
        <DiagramNode tone="success" title="Reporting currency" subtitle="converted balances only" />
      </Diagram>
      <Callout type="info">
        When to use which: <strong>reporting currency</strong> when the second GAAP is identical
        and only the currency differs; <strong>secondary ledger</strong> when you also need
        different chart of accounts, calendar, or period-level processing. Ledger sets group
        ledgers so a single close and single report covers several books.
      </Callout>

      <H2>Configuration</H2>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Secondary ledgers & reporting currencies", "Declared against a primary ledger in the ledger definition", "Enterprise Structures setup → Manage Ledgers"],
          ["Replication method", "Same source accounting vs adjusted accounting per journal", "Ledger definition → Secondary Ledger options"],
          ["Balancing segment replication", "Which balancing segment values replicate into the second ledger", "Ledger definition → Balancing Segment"],
          ["Data access sets", "Grants GL duties visibility into the additional ledgers", "Access Sets Administration"],
          ["Balance initialization", "Load opening balances for a new ledger or reporting currency", "GL → Balance Initialization process"],
          ["Retained earnings", "The account used for the year-end transfer in each ledger", "GL setup → Ledger options"],
        ]}
      />
      <Callout type="tip">
        EMU (European Monetary Union) conversion is configured against the reporting currency as a
        fixed conversion rate so the transition to the euro restates balances without re-entering
        transactions.
      </Callout>

      <H2>Technical view</H2>
      <P>
        There is no dedicated create REST resource for ledgers — setup is UI-based via Enterprise
        Structures. The REST layer lets you discover ledgers and read balances.
      </P>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="led">ledgersLOV</K>, "GET — list ledgers (primary, secondary) with calendar and currency"],
          [<K key="bal">ledgerBalances</K>, "GET — query balances per ledger, including secondary/reporting"],
          [<K key="proc">erpProcesses</K>, "POST — submit close/consolidation and balance processes for the ledger set"],
        ]}
      />
      <Callout type="warning">
        Ledger creation, secondary-ledger assignment, and balance initialization are UI processes
        under Enterprise Structures, not REST creates. Verify your integration's assumptions about
        secondary-ledger balances after go-live — a reporting currency that was not initialized will
        read as zero.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>
        Where transactions and balances land for each ledger type.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "A journal posts in the primary ledger", <span key="c0"><K key="t1">GL_JE_BATCHES</K> / <K key="t2">GL_JE_HEADERS</K> / <K key="t3">GL_JE_LINES</K></span>],
          ["2", "Controlled replication copies it into secondary ledgers", <span key="t4x"><span key="c1"><K key="t4">GL_JE_HEADERS</K> (per secondary ledger)</span></span>],
          ["3", "Balances update in the primary and secondary ledgers", <K key="t5">GL_BALANCES</K>],
          ["4", "Balances are summarized and converted into the reporting currency", <span key="t6x"><span key="c2"><K key="t6">GL_BALANCES</K> (reporting currency)</span></span>],
          ["5", "Ledger-set close runs across all member ledgers", <K key="t7">GL_PERIOD_STATUSES</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>
        Run these against the Fusion database to see ledgers and ledger-set assignments.
      </P>
      <CodeBlock
        language="sql"
        filename="gl_ledgers.sql"
        code={`-- Ledgers with their currencies and calendars
SELECT l.ledger_id, l.ledger_name, l.currency_code, l.period_set_name,
       l.ledger_category_code, l.secondary_set_name
FROM   gl_ledgers l
ORDER BY l.ledger_name;`}
      />
      <CodeBlock
        language="sql"
        filename="gl_ledger_set_assignments.sql"
        code={`-- Which ledgers belong to which ledger set
SELECT ls.ledger_set_name, l.ledger_id, l.ledger_name, l.currency_code
FROM   gl_ledger_set_norm_assign a
JOIN   gl_ledger_sets ls ON ls.ledger_set_id = a.ledger_set_id
JOIN   gl_ledgers l      ON l.ledger_id = a.ledger_id
ORDER BY ls.ledger_set_name, l.ledger_name;`}
      />
      <Callout type="tip">
        The ledger-set assignment tables (such as <K>GL_LEDGER_SET_NORM_ASSIGN</K>) vary by release
        and configuration — confirm exact names against your instance's data dictionary before
        relying on them.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Secondary ledgers share the sub-ledger accounting of the primary unless you choose adjusted
        accounting, in which case SLA rules run again for the second ledger and adjustments post as
        journals. Retained earnings and EMU conversion adjustments are generated by the ledger
        setup, not by source transactions.
      </P>
      <DataTable
        headers={["Ledger type", "Accounting source", "Adjustments"]}
        rows={[
          ["Secondary (same source)", "Primary's SLA entries replicated", "Only balancing/currency adjustments"],
          ["Secondary (adjusted)", "SLA rules re-run for the second ledger", "Journal-level GAAP adjustments"],
          ["Reporting currency", "Primary balances converted", "Translation adjustment entries"],
        ]}
      />

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Trial Balance per ledger", "Financial Reporting Center (pick the ledger)"],
          ["Ledger balances in reporting currency", "OTBI subject area"],
          ["Ledger Sets reports", "Delivered BIP reports (run once for the set)"],
          ["Balance initialization report", "Balance Initialization process output (ESS)"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li>
          <strong>Discovery first:</strong> use <K>ledgersLOV</K> to find the ledger IDs your
          journals and balance queries should target — never hard-code them.
        </li>
        <li>
          <strong>Balance queries:</strong> <K>ledgerBalances</K> returns balances per ledger; filter
          on the secondary ledger or reporting currency explicitly.
        </li>
        <li>
          <strong>Go-live:</strong> verify reporting-currency balances right after go-live — a
          missing balance initialization shows up as zeros, not errors.
        </li>
        <li>
          <strong>Data access sets:</strong> a GL duty can only see ledgers its data access set
          grants, so REST users need access to each ledger they read.
        </li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/gl">GL troubleshooting</a>{" "}
        for ledger and balance failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL hub</a> or the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Reporting currencies depend on rates — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/multi-currency">Multi-Currency &amp; Rates</a>.</li>
        <li>Ledger sets close together — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/period-close">GL Period Close</a>.</li>
      </UL>
    </>
  );
}

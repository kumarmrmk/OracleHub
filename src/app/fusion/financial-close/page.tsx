import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Financial Close & Consolidation",
};

export default function FinancialClosePage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Financial Close & Consolidation"
        description="The periodic close turns a messy month of transactions into audited financial statements. Sub-ledgers close first, transfer to the GL, the GL is revalued/translated/consolidated, and periods are finally closed."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Financial Close & Consolidation" }]}
        updated="February 2025"
      />

      <H2>The close cycle</H2>
      <P>
        Close runs bottom-up: sub-ledgers first, then the GL, then reporting. Everything downstream
        depends on everything upstream being finalized.
      </P>
      <Diagram title="Month-end close sequence" className="mb-8">
        <DiagramNode tone="neutral" title="1 · Sub-ledgers close" subtitle="AP, AR, Cash, Assets, Expenses" />
        <Arrow label="transfer" />
        <DiagramNode tone="fusion" title="2 · GL interface" subtitle="post all sub-ledger accounting" />
        <Arrow />
        <DiagramNode tone="fusion" title="3 · GL close steps" subtitle="revaluation · translation · consolidation" />
        <Arrow />
        <DiagramNode tone="neutral" title="4 · Close periods & report" subtitle="trial balance, statements, sign-off" />
      </Diagram>

      <H2>Close steps in detail</H2>
      <DataTable
        headers={["Step", "What happens", "Where it shows up"]}
        rows={[
          ["Sub-ledger period close", "Each sub-ledger validates its transfers and closes its periods", "AP/AR/FA/Expenses period status"],
          ["GL interface transfer", "Sub-ledger accounting moves to the GL", "GL_JE_HEADERS (source = sub-ledger)"],
          ["Post journals", "All transferred journals are posted", "GL_BALANCES"],
          ["Revaluation", "Foreign currency balances are re-measured at period-end rates", "GL_JE_HEADERS (revaluation journals)"],
          ["Translation", "Balances are converted to reporting currencies", "Reporting currency balances"],
          ["Intercompany", "Intercompany balances are matched and settled/eliminated", "GL_JE_HEADERS (intercompany journals)"],
          ["Consolidation", "Multiple ledgers roll up into a consolidation ledger", "Consolidation ledger balances"],
          ["Close periods", "GL periods are closed; the next period opens", "GL_PERIOD_STATUSES"],
          ["Reporting", "Trial balance and financial statements are produced", "Financial Reporting Center"],
        ]}
      />

      <H2>Why close status breaks integrations</H2>
      <P>
        Almost every "why did my import fail" question traces back to close state:
      </P>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["AP/AR import fails", "The sub-ledger period for that date is closed", "Reopen the period or post to the open one"],
          ["Journal post fails", "The GL period is closed or future-entry", "Use the current open GL period"],
          ["Depreciation fails", "No open period in <K>FA_DEPRN_PERIODS</K>", "Open the next FA period for the book"],
          ["Balances look wrong", "Sub-ledger posting hadn't finished before close", "Re-run the GL interface and re-post"],
        ]}
      />

      <H2>Close Manager</H2>
      <P>
        Fusion ships <strong>Close Manager</strong> and <strong>Close Monitor</strong> to orchestrate
        this: a checklist of close tasks per ledger/BU, owners, statuses, and the ability to track the
        whole close. Many implementations run their close as a <strong>job set</strong> so the
        sequence executes automatically.
      </P>

      <H2>Underlying tables & SQL</H2>
      <DataTable
        headers={["Table", "Holds", "Key columns"]}
        rows={[
          [<K key="t1">GL_PERIOD_STATUSES</K>, "Open/close state of every GL period", "LEDGER_ID, PERIOD_NAME, PERIOD_STATUS, OPENED_BY, CLOSED_BY"],
          [<K key="t2">GL_JE_HEADERS</K>, "Close-generated journals (reval, translation, consolidation)", "JE_HEADER_ID, JE_SOURCE, JE_CATEGORY, STATUS, PERIOD_NAME"],
          [<K key="t3">GL_BALANCES</K>, "Post-close balances", "LEDGER_ID, PERIOD_NAME, SEGMENT1..N, PERIOD_NET_DR/CR"],
          [<K key="t4">GL_INTERCOMPANY</K>, "Intercompany transaction log", "INTERCOMPANY_ID, FROM_LEGAL_ENTITY, TO_LEGAL_ENTITY, AMOUNT, STATUS"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="period_status.sql"
        code={`-- Open/close status of every period in a ledger
SELECT ps.period_name, ps.period_status,
       ps.opened_by, ps.closed_by, ps.period_year
FROM   gl_period_statuses ps
WHERE  ps.ledger_id = :ledger_id
ORDER BY ps.period_name;`}
      />
      <CodeBlock
        language="sql"
        filename="close_journals.sql"
        code={`-- Journals created by the close (revaluation, translation)
SELECT h.name, h.je_source, h.je_category, h.period_name, h.status
FROM   gl_je_headers h
WHERE  h.je_source IN ('Revaluation', 'Translation', 'Consolidation')
  AND  h.period_name = :period_name
ORDER BY h.creation_date;`}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming — confirm against your release.
      </Callout>

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Order matters:</strong> never post to a period mid-close; you'll corrupt the
        reconciliation and break sign-off.</li>
        <li>Check <K>gl_period_statuses</K> before any bulk load, not after a failure.</li>
        <li>Consolidation and secondary ledgers multiply where a number lands — know your ledger
        structure (see <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a>).</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>The GL mechanics behind all of this: <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">General Ledger</a>.</li>
        <li>Reporting on the closed period: <a className="font-semibold text-accent hover:underline" href="/fusion/reporting">Reporting &amp; Analytics</a>.</li>
      </UL>
    </>
  );
}
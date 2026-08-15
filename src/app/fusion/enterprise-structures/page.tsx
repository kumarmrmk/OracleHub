import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Enterprise Structures",
};

export default function EnterpriseStructuresPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Enterprise Structures"
        description={<>The organizational model that underpins every Fusion ERP transaction: <Term k="ledger">ledgers</Term>, <Term k="legalEntity">legal entities</Term>, <Term k="businessUnit">business units</Term>, and the security that controls what each user can see (<Term k="moac">MOAC</Term>). No integration is correct without knowing which business unit and ledger a document belongs to.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Enterprise Structures" }]}
        updated="February 2025"
      />

      <H2>Why this matters before anything else</H2>
      <P>
        Fusion is an <strong>organization-centric</strong> system. Every transaction — an AP invoice,
        a PO, an expense report — is owned by a <Term k="businessUnit"><strong>business unit</strong></Term>, reported through a{" "}
        <Term k="legalEntity"><strong>legal entity</strong></Term>, and accounted in a <Term k="ledger"><strong>ledger</strong></Term>. If you don't know
        the enterprise structure, you don't know which BU to send a document to, which ledger it
        posts to, or why a user can't see a record.
      </P>
      <Diagram title="How the org model fits together" className="mb-8">
        <DiagramNode tone="fusion" title="Legal Entity" subtitle="the legal/reporting unit (owns the balance sheet)" />
        <Arrow label="owns" />
        <DiagramNode tone="fusion" title="Business Units" subtitle="process transactions · own business rules" />
        <Arrow label="report" />
        <DiagramNode tone="neutral" title="Ledger" subtitle="chart of accounts + calendar + currency" />
      </Diagram>

      <H2>The concepts</H2>
      <DataTable
        headers={["Concept", "What it is", "Example"]}
        rows={[
          ["Ledger", "The accounting structure: a chart of accounts + a calendar + a currency + an accounting method. Holds balances.", "US Primary Ledger (USD, Jan-Dec calendar)"],
          ["Legal entity", "A legally registered unit (company) that owns the balance sheet and reports to tax/statutory authorities.", "Acme Inc. (Germany)"],
          ["Business unit", "The unit that processes transactions and owns business rules. Requires a legal entity and a ledger.", "Acme DE Operations BU"],
          ["Operating unit (legacy)", "In EBS, the unit that secured transactions by OU. In Fusion it is replaced by the business unit + MOAC.", "— (retired concept)"],
          ["Inventory organization", "An SCM org that owns inventory. Belongs to a business unit.", "Acme DE Central Warehouse"],
          ["Asset book", "FA's org structure — books define depreciation rules and are linked to ledgers.", "CORP book"],
          ["Data access set", "GL security: which ledgers, balances, and accounts a duty can access.", "Set with access to US + DE ledgers"],
          ["Reference data set", "Shared setup data (payment terms, tax codes) that can be shared across BUs or made BU-specific.", "Shared 'Payment Terms' set"],
          ["MOAC (Multiple Organizations Access Control)", "The security model that restricts a duty's data to a set of business units.", "Payables specialist sees only DE BU"],
        ]}
      />

      <H2>The relationships</H2>
      <P>
        The rules that make the model work:
      </P>
      <UL>
        <li>A <strong>business unit</strong> belongs to exactly one legal entity and reports to one
        ledger (primary ledger).</li>
        <li>A <strong>legal entity</strong> can have many business units, but a business unit can be
        assigned to only one legal entity.</li>
        <li>The <strong>ledger</strong> owns the chart of accounts — all legal entities and BUs
        attached to it share that COA.</li>
        <li><strong>Data access sets</strong> give GL users access to ledger balances;{" "}
        <strong>MOAC</strong> gives sub-ledger users access to a list of BUs.</li>
      </UL>

      <H2>Why integrations must care</H2>
      <DataTable
        headers={["Situation", "What breaks", "What to do"]}
        rows={[
          ["Creating an AP invoice", "Missing or wrong business unit", "Send the correct BusinessUnit on the REST call or FBDI row"],
          ["Posting to the GL", "Wrong ledger or closed periods", "Resolve the ledger from the BU, check <K>accountingPeriods</K> first"],
          ["Reporting balances", "No data access set grants the ledger", "Add the ledger to a data access set for the report duty"],
          ["Data security", "A user can't see a record", "Their duty lacks the BU (MOAC) or data access set — not a bug"],
          ["Tax", "Wrong tax behavior", "Tax is configured per legal entity + BU + tax regime"],
        ]}
      />

      <H2>Implementation order</H2>
      <P>A new implementation builds the structure top-down, in this order:</P>
      <Diagram title="Enterprise structure setup order" className="mb-8">
        <DiagramNode tone="neutral" title="1 · Chart of Accounts" subtitle="COA segments, value sets" />
        <Arrow />
        <DiagramNode tone="neutral" title="2 · Calendar & Ledgers" subtitle="GL calendar, primary + secondary ledgers" />
        <Arrow />
        <DiagramNode tone="neutral" title="3 · Legal Entities" subtitle="registrations, tax profiles" />
        <Arrow />
        <DiagramNode tone="fusion" title="4 · Business Units" subtitle="assign legal entity + ledger" />
        <Arrow />
        <DiagramNode tone="fusion" title="5 · Reference Data Sets" subtitle="share or localize setup data" />
        <Arrow />
        <DiagramNode tone="fusion" title="6 · Data Access Sets" subtitle="GL security for duties" />
      </Diagram>

      <H2>Underlying tables & SQL</H2>
      <P>
        The structure lives in a small set of tables. Query them to answer "which BU/ledger/legal
        entity is this?":
      </P>
      <DataTable
        headers={["Table", "Holds", "Key columns"]}
        rows={[
          [<K key="t1">GL_LEDGERS</K>, "Ledgers", "LEDGER_ID, NAME, CURRENCY_CODE, CHART_OF_ACCOUNTS_ID, CALENDAR_PERIOD_SET_ID"],
          [<K key="t2">XLE_ENTITY_PROFILES</K>, "Legal entities", "LEGAL_ENTITY_ID, NAME, REGISTRATION_NUMBER"],
          [<K key="t3">FUN_ALL_BUSINESS_UNITS_V</K>, "Business units (view)", "BU_ID, BU_NAME, LEGAL_ENTITY_ID, PRIMARY_LEDGER_ID, ORG_ID"],
          [<K key="t4">HR_ALL_ORGANIZATION_UNITS</K>, "All org units (BUs, inventory orgs, etc.)", "ORGANIZATION_ID, NAME, TYPE"],
          [<K key="t5">GL_ACCESS_SETS</K>, "Data access sets", "ACCESS_SET_ID, NAME, LEDGER_ID"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="bu_ledger.sql"
        code={`-- Business units with their legal entity and ledger
SELECT v.bu_id, v.bu_name, v.legal_entity_id, v.primary_ledger_id,
       l.name AS ledger_name
FROM   fun_all_business_units_v v
JOIN   gl_ledgers l ON l.ledger_id = v.primary_ledger_id
ORDER BY v.bu_name;`}
      />
      <CodeBlock
        language="sql"
        filename="legal_entities.sql"
        code={`-- Legal entities
SELECT le.legal_entity_id, le.name, le.registration_number
FROM   xle_entity_profiles le
ORDER BY le.name;`}
      />
      <CodeBlock
        language="sql"
        filename="ledgers.sql"
        code={`-- Ledgers and their chart of accounts
SELECT l.ledger_id, l.name, l.currency_code, l.chart_of_accounts_id
FROM   gl_ledgers l
ORDER BY l.name;`}
      />
      <Callout type="tip">
        <K>FUN_ALL_BUSINESS_UNITS_V</K> is a view — the authoritative source for the
        BU → legal entity → ledger mapping. Column names follow the Fusion data dictionary; confirm
        against your release.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Every module page now makes more sense — see how documents need a BU in <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a>.</li>
        <li>The chart of accounts behind ledgers is a <a className="font-semibold text-accent hover:underline" href="/fusion/concepts">core concept</a>.</li>
        <li>Reporting reads these ledgers — see the reporting stack on the upcoming Reporting &amp; Analytics page.</li>
      </UL>
    </>
  );
}
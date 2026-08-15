import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Allocations & Recurring Entries",
};

export default function GlAllocationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Allocations & Recurring Entries"
        description="Automated, formula-driven journals. Recurring journals repeat a fixed entry every period; allocations distribute costs and balances across segments using rules built in Calculation Manager."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "GL", href: "/fusion/financials/gl" }, { label: "Allocations & Recurring Entries" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/journals">Journals &amp; Posting</a> and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/flexfields">Flexfields &amp; Value Sets</a> before this page.
      </Callout>

      <H2>Functional view</H2>
      <P>
        <strong>Recurring journals</strong> post the same entry each period (monthly accruals,
        fixed formulas) with little or no formula logic. <strong>Allocations</strong> distribute
        cost or balances across segments — for example spreading one department's rent over several
        cost centers on a defined basis. Allocation rules are built in <strong>Calculation
        Manager</strong>, grouped into <strong>rule sets</strong>, and each rule is assembled from{" "}
        <strong>components</strong> (POV, allocation, and formula components) that reference{" "}
        <strong>variables</strong>.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Recurring journal", "A template that repeats a fixed entry each period"],
          ["Calculation Manager", "The rule builder for allocations (and many close processes)"],
          ["Allocation rule", "Defines the source, basis, and target of a distribution"],
          ["Rule set", "A group of rules deployed and generated together"],
          ["Component", "POV, allocation, or formula piece of a rule"],
          ["Variable", "A parameter (e.g. period, amount) bound when the rule runs"],
          ["Generate allocations", "Runs the rule set and creates the journal batch"],
        ]}
      />
      <Diagram title="Allocation generation flow" className="mb-8">
        <DiagramNode tone="neutral" title="Rule set + components" subtitle="defined in Calculation Manager" />
        <Arrow label="deploy" />
        <DiagramNode tone="fusion" title="Generate allocations" subtitle="ESS job creates journals" />
        <Arrow label="create" />
        <DiagramNode tone="warning" title="Journal batch" subtitle="in GL_JE_BATCHES, Unposted" />
        <Arrow label="post" />
        <DiagramNode tone="success" title="GL_BALANCES" subtitle="balances updated" />
      </Diagram>

      <H2>Configuration</H2>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Recurring journal templates", "Defines the fixed lines repeated each period", "GL setup → Recurring Journal Formulas"],
          ["Allocation rule sets", "Groups rules that run together", "Calculation Manager → Rule Sets"],
          ["Allocation components", "POV, allocation, and formula components per rule", "Calculation Manager → Components"],
          ["Variable sets", "Reusable sets of parameters bound at generation time", "Calculation Manager → Variables"],
          ["Journal source/category", "Labels generated journals so they post and report correctly", "GL setup → Journals"],
        ]}
      />
      <Callout type="info">
        Allocations and recurring entries both create ordinary journals — they post through the same
        validation and posting path as any other journal.
      </Callout>

      <H2>Technical view</H2>
      <P>
        There is no dedicated create REST resource for allocation rules — rules are built in the UI
        (Calculation Manager). Generation is an ESS job, and the recurring-like journals can also
        be loaded through the Journal Import FBDI.
      </P>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="jb">journalBatches</K>, "GET — read the batches the Allocate Balances job created"],
          [<K key="bal">ledgerBalances</K>, "GET — confirm the allocation posted to balances"],
          [<K key="proc">erpProcesses</K>, "POST — submit the Allocate Balances ESS job to generate journals"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Journal Import</K>, "Load recurring-like journals (fixed entries) without rule setup", "Open period, valid account combinations"],
        ]}
      />
      <H3>Working example — submit Allocate Balances</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "jobName": "Allocate Balances",
    "parameters": [
      { "name": "RuleSetName", "value": "COST_CENTER_ALLOC" }
    ]
  }'`}
      />
      <Callout type="warning">
        Allocation rules are managed in the Calculation Manager UI — there is no create REST
        resource for rule sets in the 26C Financials guide. Generation, not setup, is what runs
        through <K>erpProcesses</K>.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>
        Where the generated allocation journals land in the underlying Oracle Database tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Rule set and components are defined in Calculation Manager", "Allocation setup tables (UI-managed)"],
          ["2", "Generate allocations deploys and runs the rule set", "Allocate Balances ESS job"],
          ["3", "The job creates the allocation journal batch", <K key="t1">GL_JE_BATCHES</K>],
          ["4", "Journal headers and lines carry the computed entries", <span key="c0"><K key="t2">GL_JE_HEADERS</K> / <K key="t3">GL_JE_LINES</K></span>],
          ["5", "Posting updates the destination account balances", <K key="t4">GL_BALANCES</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>
        Run this against the Fusion database to find the journals an allocation run generated.
      </P>
      <CodeBlock
        language="sql"
        filename="gl_allocation_journals.sql"
        code={`-- Allocation journals created by the Generate process
SELECT h.je_batch_id, h.je_header_id, h.name, h.status,
       h.period_name, h.currency_code, h.je_source, h.je_category,
       h.actual_flag, h.description
FROM   gl_je_headers h
WHERE  h.je_source LIKE 'ALLOCATION%'
  AND  h.period_name = 'JAN-2026'
  AND  h.ledger_id = :ledger_id
ORDER BY h.creation_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="gl_allocation_lines.sql"
        code={`-- Allocation lines for one generated header (per-segment accounts)
SELECT l.je_line_num, l.segment1, l.segment2, l.segment3,
       l.entered_dr, l.entered_cr, l.accounted_dr, l.accounted_cr
FROM   gl_je_lines l
WHERE  l.je_header_id = :je_header_id
ORDER BY l.je_line_num;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Allocations produce ordinary GL journals — a debit to the target account and a credit from
        the source basis. They do not pass through the sub-ledger accounting engine; they are GL
        journals from start to finish. Audit trails live in the allocation process output and the
        <K>GL_JE_HEADERS</K> description that identifies the rule that created them.
      </P>
      <DataTable
        headers={["Entry", "Debit", "Credit"]}
        rows={[
          ["Allocate expense across cost centers", "Target cost-center expense accounts", "Source expense account (or clearing)"],
          ["Recurring accrual", "Expense account", "Accrual liability account"],
        ]}
      />

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Allocation process reports", "Generate Allocations process output (ESS)"],
          ["GL Journal Entry Real Time", "OTBI subject area (filter je_source = ALLOCATION)"],
          ["Account Monitor / Journals reports", "Delivered BIP reports"],
          ["Impact on trial balance", "Financial Reporting Center"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li>
          <strong>Rules are UI, generation is API:</strong> build rule sets in Calculation Manager,
          then drive the Allocate Balances job from <K>erpProcesses</K>.
        </li>
        <li>
          <strong>Source/category:</strong> give allocation journals a dedicated journal source so
          they are easy to isolate in <K>journalBatches</K>, reports, and SQL.
        </li>
        <li>
          <strong>Audit:</strong> generated journals carry a description referencing the rule —
          preserve it when troubleshooting or reconciling.
        </li>
        <li>
          <strong>Fixed entries:</strong> if the entry is truly fixed (same lines every period),
          the Journal Import FBDI is simpler than a rule — load it like any recurring journal.
        </li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/gl">GL troubleshooting</a>{" "}
        for allocation and generation failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL hub</a> or the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Allocation journals post like any other journal — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/journals">Journals &amp; Posting</a>.</li>
        <li>Allocations are part of the standard close sequence — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/period-close">GL Period Close</a>.</li>
      </UL>
    </>
  );
}

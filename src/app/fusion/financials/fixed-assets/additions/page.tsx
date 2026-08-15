import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Additions & Mass Additions",
};

export default function AdditionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Additions & Mass Additions"
        description={<>How assets get into the books: single manual additions, bulk <Term k="massAdditions">mass additions</Term> fed from AP invoices, receiving, projects, or legacy systems, and construction-in-process that converts into a capitalized asset once complete — with capitalization thresholds gating every transfer.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Fixed Assets", href: "/fusion/financials/fixed-assets" }, { label: "Additions & Mass Additions" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/books-setup">Asset Books &amp; Setup</a> (books, categories, thresholds that an addition must pass),{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/erp-processes">Driving ESS via REST (erpProcesses)</a> (how the Post Mass Additions job is submitted), and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a> if your mass additions come from AP invoices.
      </Callout>

      <H2>Functional view</H2>
      <P>
        An <strong>addition</strong> brings a new asset into an asset book at a cost. It can be
        entered one at a time in the Asset Workbench, or in bulk as a{" "}
        <strong>mass addition</strong>. Mass additions are the integration-facing path: source
        systems — AP invoices, receiving, projects, or a legacy asset register — supply the candidate
        lines, they are staged, and the <strong>Post Mass Additions</strong> process converts the
        valid lines into real assets.
      </P>
      <Diagram title="Mass addition lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Source lines" subtitle="AP · receiving · projects · legacy" />
        <Arrow label="selected" />
        <DiagramNode tone="warning" title="Staged" subtitle="FA_MASS_ADDITIONS rows" />
        <Arrow label="post" />
        <DiagramNode tone="fusion" title="Asset created" subtitle="FA_ADDITIONS_B + FA_BOOKS" />
        <Arrow label="accounting" />
        <DiagramNode tone="success" title="Create Accounting" subtitle="journal entries for assets" />
      </Diagram>
      <DataTable
        headers={["Path", "How an asset gets added"]}
        rows={[
          ["Manual addition", "Keyed directly in the Asset Workbench; creates the asset in the book immediately"],
          ["Mass addition from AP", "Candidate lines come from Payables invoices; supplier costs roll into Fixed Assets"],
          ["Mass addition from receiving", "Purchased items are 'added upon receipt' from inventory receiving into FA"],
          ["Mass addition from projects", "Project costs are transferred to Fixed Assets once the project work is done"],
          ["Legacy conversion", "Historical asset register imported in bulk, usually via the Fixed Asset Mass Additions Import FBDI"],
          ["CIP → capitalization", "Construction-in-process (CIP) units hold project costs until complete, then convert to a capitalized asset"],
        ]}
      />
      <P>
        <strong>Source lines and source-line transfers.</strong> Each candidate line keeps a pointer
        to where it came from — the AP invoice, the receiving transaction, the project. That link
        ("source line") is retained on the mass addition so the asset history can show the origin.
        Before posting, you can transfer source lines between mass additions or delete unwanted ones;
        only lines that survive to the post become assets.
      </P>
      <Callout type="info">
        <strong>Assets added upon receipt</strong> is a special mode: an item received in inventory
        is simultaneously offered to Fixed Assets, so the receiving transaction and the asset
        addition are one continuous flow instead of a separate load.
      </Callout>
      <P>
        <strong>Capitalization thresholds gate the transfer.</strong> A line whose cost sits below the
        book's capitalization threshold — and is not forced to capitalize — is expensed instead, so
        it never becomes an asset. Low-value thresholds work the same way but route the value into a
        designated low-value category. For CIP, the threshold decides whether the completed project's
        cost capitalizes when it converts.
      </P>
      <UL>
        <li><strong>Converting legacy assets:</strong> when migrating from an old register, map your legacy category/method pairs to Fusion categories so the imported assets inherit the right books.</li>
        <li><strong>Capitalizing CIP when complete:</strong> once all project costs are in and the unit is placed in service, run the CIP conversion — threshold check happens again at this point.</li>
      </UL>

      <H2>Configuration</H2>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Mass addition source setups", "Define which AP, receiving, and project sources feed mass additions", "Fixed Assets → Mass Additions"],
          ["CIP categories", "Category defaults for construction-in-process units (cost, capitalization method)", "Fixed Assets → Asset Categories"],
          ["Capitalization rules & thresholds", "Which costs capitalize and which are expensed or marked low-value", "Fixed Assets → Capitalization Thresholds"],
          ["Mass addition templates", "Map staged lines to books, categories, and distributions for the post", "Fixed Assets → Mass Additions"],
        ]}
      />

      <H2>Technical view</H2>
      <Callout type="info">
        The Financials REST guide does not publish an <K>assets</K> resource — asset CRUD is under the{" "}
        <strong>SCM / Asset Management</strong> REST guide (<K>fscmRestApi</K>). Most volume addition
        loads go through the <strong>Fixed Asset Mass Additions Import FBDI</strong> plus the{" "}
        <strong>Post Mass Additions</strong> ESS job instead.
      </Callout>
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Sheet / object", "Job that converts the rows"]}
        rows={[
          [<span key="c0"><K key="f1">Fixed Asset Mass Additions Import</K>, <span key="f1c"><K key="f1a">FA_MASS_ADDITIONS</K> (header + lines)</span>, <span key="c1"><K key="f1b">FA_MASSADD_DISTRIBUTIONS</K> (accounts/locations)</span>, <span key="c2"><K key="f1c2">FA_MC_MASS_RATES</K> (reporting-currency)</span></span>, <K key="f1d">Post Mass Additions</K>],
        ]}
      />
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">erpProcesses</K>, "POST-only: submit the Post Mass Additions job (and other FA jobs) from a REST call — see Driving ESS via REST"],
          [<K key="r2">assets</K>, "Not in the Financials guide — create/read asset records under the SCM Asset Management guide (fscmRestApi)"],
        ]}
      />
      <H3>Working example — submit Post Mass Additions</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "processName": "Post Mass Additions",
    "processType": "ESS",
    "parameters": [
      { "name": "RequestId", "value": "12345" },
      { "name": "BookCode", "value": "CORP" }
    ]
  }'`}
      />
      <P>
        The job turns valid <K>FA_MASS_ADDITIONS</K> rows into assets. Parameter names vary by job
        and release — read them from the job's submission UI or the REST resource explorer, and
        verify the exact names against your instance.
      </P>

      <H2>Data flow — step by step</H2>
      <P>
        Where each step of a mass addition lands in the underlying tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Source lines originate in AP invoices, receiving, projects, or the legacy register", "AP / INV / projects source tables"],
          ["2", "Lines are selected and staged for posting; each keeps its source-line reference", <K key="t1">FA_MASS_ADDITIONS</K>],
          ["3", "Distribution lines define the account + location per staged addition", <K key="t2">FA_MASSADD_DISTRIBUTIONS</K>],
          ["4", "Post Mass Additions runs (via erpProcesses) and validates each row against the book, category, and threshold", <span key="c3"><K key="t3">FA_MASS_ADDITIONS</K> (status fields)</span>],
          ["5", "Valid rows become asset master records assigned to their book at cost", <span key="t4c"><K key="t4">FA_ADDITIONS_B</K>, <K key="t5">FA_BOOKS</K></span>],
          ["6", "The addition event is recorded in the asset history", <K key="t6">FA_TRANSACTIONS</K>],
          ["7", "Create Accounting for Assets generates the addition journal entries", <K key="t7">XLA_AE_HEADERS</K>, <K key="t8">XLA_AE_LINES</K>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data dictionary.
        Exact names and status columns can vary slightly by release — confirm against your instance's
        data dictionary before relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="fa_mass_additions.sql"
        code={`-- Staged mass addition rows and their status
SELECT m.mass_addition_id, m.asset_number, m.asset_category_id,
       m.book_type_code, m.cost, m.status,
       m.source_transaction_type, m.creation_date
FROM   fa_mass_additions m
WHERE  m.status <> 'POSTED'
ORDER BY m.creation_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="fa_additions_created.sql"
        code={`-- Assets created from a mass addition post
SELECT a.asset_number, a.asset_description, a.asset_category_id,
       a.tag_number, a.creation_date
FROM   fa_additions_b a
WHERE  a.creation_date >= TRUNC(SYSDATE) - 30
ORDER BY a.creation_date DESC;`}
      />
      <Callout type="tip">
        Verify the column names in <K>FA_MASS_ADDITIONS</K> and <K>FA_ADDITIONS_B</K> (especially the
        status field) against your instance, and never query the Fusion database directly for
        production reporting — use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        An addition posts through <K>Create Accounting for Assets</K>:
      </P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Asset addition (capitalized)", "Asset account", "AP / clearing (or cash)"],
          ["Addition below threshold (expensed)", "Expense account", "AP / clearing (or cash)"],
          ["CIP conversion to capital asset", "Asset account", "CIP asset account"],
        ]}
      />
      <P>
        Events: <em>asset addition</em> and <em>CIP conversion</em>. Trace the entries via{" "}
        <K>XLA_AE_HEADERS</K> / <K>XLA_AE_LINES</K> — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Mass Additions report / Post Mass Additions output", "Delivered BIP report under Fixed Assets"],
          ["Assets Real Time subject areas (additions)", "OTBI"],
          ["Asset additions in the GL", "Financial Reporting / GL reports"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Thresholds first:</strong> a line under the capitalization threshold is expensed, not capitalized — stage only what should become assets, or force the capitalize flag where intended.</li>
        <li><strong>Post Mass Additions is the finish line:</strong> importing the FBDI only stages rows; nothing is an asset until the job runs and posts valid lines.</li>
        <li><strong>Rejected rows stay in the line:</strong> rows that fail validation remain in <K>FA_MASS_ADDITIONS</K> with an error state — inspect, fix, and repost rather than reloading.</li>
        <li><strong>Asset CRUD lives in SCM:</strong> for direct asset create/read, use the SCM / Asset Management REST guide (<K>fscmRestApi</K>), not the Financials guide.</li>
        <li><strong>Verify against your instance:</strong> sheet headers, ESS job parameters, and table columns all vary by release — confirm before building on them.</li>
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
        <li>Once assets exist, continue to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/depreciation">Depreciation &amp; Revaluation</a>.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Journals & Posting",
};

export default function GlJournalsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Journals & Posting"
        description={<>How money moves into and around the general ledger. <Term k="journal">Journals</Term> are the batches of journal entry lines that <Term k="posting">post</Term> to accounts — and most GL integrations live or die on the journal import path, validation, and <Term k="period">period</Term> status.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "GL", href: "/fusion/financials/gl" }, { label: "Journals & Posting" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/flexfields">Flexfields &amp; Value Sets</a> (how the chart of accounts becomes per-segment accounts) and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/interface-tables">Interface Tables</a> before this page.
      </Callout>

      <H2>Functional view</H2>
      <P>
        A journal is a batch of journal entry lines that post to account combinations. Journals can
        be manual, recurring, allocation, revaluation/translation, or imported from a sub-ledger or
        an external system. Each batch has headers (who/what/when) and lines (the per-segment
        debits and credits), and every line moves through a status chain before it touches balances.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Journal batch", "A grouping of one or more journal entries, usually created together"],
          ["Journal header", "One journal entry — carries source, category, period, currency, date"],
          ["Journal line", "One debit or credit against an account combination (per segment)"],
          ["Journal source", "Where the journal came from (Manual, Allocation, Payables, ...)"],
          ["Journal category", "What the journal is for (Adjustment, Accrual, ...) — drives approval rules"],
          ["Status", "Entered → Unposted → Approved → Posted; failures sit in an error state"],
        ]}
      />
      <Diagram title="Journal status flow" className="mb-8">
        <DiagramNode tone="neutral" title="Entered" subtitle="created in GL or imported" />
        <Arrow />
        <DiagramNode tone="warning" title="Unposted" subtitle="not yet approved/posted" />
        <Arrow label="approve" />
        <DiagramNode tone="neutral" title="Approved" subtitle="workflow/approval rule passed" />
        <Arrow label="post" />
        <DiagramNode tone="success" title="Posted" subtitle="balances updated in GL_BALANCES" />
      </Diagram>
      <Callout type="info">
        Three behaviors matter most to integrations: <strong>reversal</strong> (auto-reverse the
        next period, or a manual reversing entry), <strong>AutoPost</strong> (post immediately when
        import succeeds instead of waiting for a user), and <strong>suspense posting</strong> (post
        to a suspense account when an account combination is invalid, rather than reject the line).
      </Callout>

      <H2>Configuration</H2>
      <P>
        Journal-related setup is light but a missing piece silently changes where a journal posts.
      </P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Journal sources", "Identifies where a journal came from; sources like Manual and Allocation are seeded", "GL setup → Journals → Sources"],
          ["Journal categories", "Classifies the entry (Adjustment, Accrual, ...) and hooks approval rules", "GL setup → Journals → Categories"],
          ["Approval rules", "Routes journals for spreadsheet or BPM workflow approval before posting", "GL setup → Journal Approval Rules"],
          ["AutoPost setup", "Post import journals automatically when validation passes", "GL setup → AutoPost Criteria Sets"],
          ["Period status", "Only open periods accept posting — closed periods reject lines", "Manage Accounting Periods"],
          ["Balancing", "Balancing segment validation and suspense accounts for out-of-balance batches", "GL setup → Ledger options"],
        ]}
      />
      <Callout type="warning">
        AutoPost only fires for criteria sets that match the imported journal (source/category/date
        range). If nothing matches, journals stay <em>Unposted</em> and a scheduled Post Journals
        job — or a user — must post them.
      </Callout>

      <H2>Technical view</H2>
      <P>
        The create path for bulk journals is the <strong>Journal Import FBDI</strong> into{" "}
        <K>GL_INTERFACE</K>, driven by the <K>Import Journals</K> ESS job. The REST layer reads
        batches and patches limited attributes — there is no create journal over REST in the 26C
        Financials guide.
      </P>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="jb">journalBatches</K>, "GET/PATCH only — read batches, patch limited reversal/completion attributes; no create"],
          [<K key="bal">ledgerBalances</K>, "GET — query account balances after posting"],
          [<K key="led">ledgersLOV</K>, "GET — pick the target ledger before submitting a job"],
          [<K key="per">accountingPeriodsLOV / accountingPeriodStatusLOV</K>, "GET — confirm the period is open before loading"],
          [<K key="proc">erpProcesses</K>, "POST — submit Import Journals / Post Journals ESS jobs"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Journal Import</K>, "Bulk-load journal batches and lines into GL_INTERFACE", "Open period, valid account combinations, configured sources/categories"],
          [<K key="f2">Import and Calculate Daily Rates</K>, "Load conversion rates used by cross-currency journals", "Currency + rate type setup"],
          [<K key="f3">Import Historical Rates</K>, "Load rates for a specific past date", "Currency + rate type setup"],
        ]}
      />
      <H3>Working example — submit Import Journals</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "jobName": "Import Journals",
    "parameters": [
      { "name": "GroupId", "value": "JRN_2026_001" }
    ]
  }'`}
      />
      <H3>Working example — read a journal batch</H3>
      <CodeBlock
        language="bash"
        filename="GET /journalBatches"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/journalBatches?q=PeriodName='JAN-2026'&fields=Name,Status,PostingStatus" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />
      <Callout type="warning">
        <K>journalBatches</K> is read/patch only. Do not build a create integration against it — the
        supported create path is Journal Import FBDI → Import Journals → Post Journals.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>
        Where a journal's life lands in the underlying Oracle Database tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Rows are staged from the FBDI file", <K key="t1">GL_INTERFACE</K>],
          ["2", "Import Journals validates each row (account, period, balance)", <span key="t2x"><span key="c0"><K key="t2">GL_INTERFACE</K> (status)</span></span>],
          ["3", "Valid rows create the journal batch", <K key="t3">GL_JE_BATCHES</K>],
          ["4", "Journal headers are created with source/category/period", <K key="t4">GL_JE_HEADERS</K>],
          ["5", "Journal lines carry the per-segment accounts and amounts", <K key="t5">GL_JE_LINES</K>],
          ["6", "Posting runs (AutoPost or Post Journals) and lines flip to Posted", <K key="t6">GL_BALANCES</K>],
          ["7", "Reversals create the offsetting entry in the next period", <span key="t7x"><K key="t7">GL_JE_HEADERS</K> / <K key="t8">GL_JE_LINES</K></span>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>
        Run these against the Fusion database to find failed imports and posted journals.
      </P>
      <CodeBlock
        language="sql"
        filename="gl_interface_errors.sql"
        code={`-- Failed journal import lines with the validation message
SELECT g.group_id, g.je_source, g.je_category, g.status,
       g.error_explanation, g.period_name, g.currency_code,
       g.segment1, g.segment2, g.segment3, g.entered_dr, g.entered_cr
FROM   gl_interface g
WHERE  g.status = 'ERROR'
  AND  g.creation_date >= SYSDATE - 7
ORDER BY g.creation_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="gl_je_headers_posted.sql"
        code={`-- Posted journals in a ledger for a period
SELECT h.je_batch_id, h.je_header_id, h.name, h.status,
       h.je_source, h.je_category, h.period_name, h.currency_code
FROM   gl_je_headers h
WHERE  h.status = 'P'
  AND  h.ledger_id = :ledger_id
  AND  h.period_name = 'JAN-2026'
ORDER BY h.creation_date DESC;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Journals created inside the GL (manual, recurring, allocation, revaluation) are written
        directly to <K>GL_JE_HEADERS</K>/<K>GL_JE_LINES</K> and are not SLA artifacts. Sub-ledger
        journals (AP, AR, Expenses) are first built by{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>{" "}
        and then transferred into the same GL journal tables. Both paths update <K>GL_BALANCES</K> on post.
      </P>
      <DataTable
        headers={["Journal type", "Who creates it", "Common use"]}
        rows={[
          ["Standard manual", "GL user", "Adjustments, corrections"],
          ["Recurring", "GL setup", "Monthly accruals on a fixed formula"],
          ["Allocation", "GL setup", "Distribute cost across segments"],
          ["Revaluation / Translation", "Period close", "Foreign currency re-measurement"],
          ["Imported (sub-ledger)", "AP, AR, Expenses, external systems", "Their transactions' accounting"],
        ]}
      />

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Journal Entries, Journals by Account", "Delivered BIP reports (Reports & Analytics)"],
          ["GL Journal Entry Real Time", "OTBI subject area"],
          ["Journal validation errors", "Journal Import process reports (ESS output)"],
          ["Trial Balance after posting", "Financial Reporting Center"],
        ]}
      />

      <H2>Worked example — one journal through post</H2>
      <WorkedExample
        title="Worked example: accrue $3,000 rent for January"
        intro={
          <>
            A recurring journal accrues January rent of <strong>$3,000</strong>, spread equally
            across three departments and credited to accrued liabilities. It is entered in an open
            period with valid account combinations.
          </>
        }
        steps={[
          {
            label: "1 · The journal lines (per segment)",
            body: (
              <>
                Each line carries the <strong>full account combination</strong> — one column per COA
                segment, not a single "account string". The batch balance is Dr $3,000 = Cr $3,000.
              </>
            ),
          },
          {
            label: "2 · Validate, approve, post",
            body: (
              <>
                Validation confirms the lines balance, the segments combine into valid accounts, and
                the period is open. AutoPost (or the Post Journals job) flips the lines to{" "}
                <strong>Posted</strong>.
              </>
            ),
          },
        ]}
        journal={[
          { account: "01-6900-100 — Rent — Dept A", debit: "$1,000" },
          { account: "01-6900-200 — Rent — Dept B", debit: "$1,000" },
          { account: "01-6900-300 — Rent — Dept C", debit: "$1,000" },
          { account: "01-2100-000 — Accrued liabilities", credit: "$3,000" },
        ]}
        outcome={
          <>
            <strong>What changed in the tables:</strong> <K>GL_JE_BATCHES</K> / <K>GL_JE_HEADERS</K> /{" "}
            <K>GL_JE_LINES</K> hold the batch at status <em>Posted</em>, and <K>GL_BALANCES</K> gains
            the January period activity: Dr $1,000 on each of 01-6900-100/200/300 and Cr $3,000 on
            01-2100-000. The reversing entry next period creates the mirror lines so the accrual nets
            to zero.
          </>
        }
      />

      <H2>Integration notes</H2>
      <UL>
        <li>
          <strong>Create path is FBDI:</strong> bulk journal loads go through Journal Import into{" "}
          <K>GL_INTERFACE</K>; submit the job with <K>erpProcesses</K>.
        </li>
        <li>
          <strong>Period status:</strong> query <K>accountingPeriodStatusLOV</K> first — posting to
          a closed period rejects the batch.
        </li>
        <li>
          <strong>Balancing validation:</strong> by default a batch must balance; use suspense
          posting only when the business accepts it.
        </li>
        <li>
          <strong>Approval:</strong> if approval rules apply, journals stop at <em>Approval
          Pending</em> until a user or BPM workflow releases them.
        </li>
        <li>
          <strong>Reversals:</strong> set the auto-reverse flag on the imported journal to create
          the offsetting entry next period automatically.
        </li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/gl">GL troubleshooting</a>{" "}
        for the most common journal import failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL hub</a> or the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Cross-currency journals need rates — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/multi-currency">Multi-Currency &amp; Rates</a>.</li>
        <li>The <a className="font-semibold text-accent hover:underline" href="/fusion/interface-tables">Interface Tables</a> page details the GL_INTERFACE columns.</li>
      </UL>
    </>
  );
}

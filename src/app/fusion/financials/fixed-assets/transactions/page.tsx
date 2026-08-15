import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Transfers, Retirements & Impairment",
};

export default function TransactionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Transfers, Retirements & Impairment"
        description="What happens to an asset after it is added and depreciated: transfers and reclassification, retirement (partial or full) with reinstatement, impairments on cash-generating units, physical inventory cycles, and the transaction approvals that control it all."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Fixed Assets", href: "/fusion/financials/fixed-assets" }, { label: "Transfers, Retirements & Impairment" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/books-setup">Asset Books &amp; Setup</a> (conventions that affect retirement proration),{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/additions">Additions &amp; Mass Additions</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/depreciation">Depreciation &amp; Revaluation</a>.
      </Callout>

      <H2>Functional view</H2>
      <P>
        Once an asset exists it rarely sits still. Every change — a transfer to a new location or
        cost center, a category change, a partial or full retirement, a reclassification after an
        impairment review — is recorded as an <strong>asset transaction</strong>. Depending on your
        setups, these transactions require <strong>approval</strong> before they take effect.
      </P>
      <Diagram title="Transaction lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Transfer / reclassify" subtitle="location · cost center · category" />
        <Arrow label="depreciation recalc" />
        <DiagramNode tone="warning" title="Retire (partial/full)" subtitle="disposal · sale · reinstatement" />
        <Arrow label="accounting" />
        <DiagramNode tone="success" title="Create Accounting" subtitle="retirement / impairment entries" />
      </Diagram>
      <DataTable
        headers={["Transaction", "What it does"]}
        rows={[
          ["Asset transfer", "Moves an asset's distribution to a new location, cost center, or account (single or mass)"],
          ["Reclassification", "Changes the asset's category, usually after an impairment review or a change in use"],
          ["Transfer between books", "Moves an asset from one book to another — same ledger (simple) or a different ledger (needs current depreciation first)"],
          ["Category change", "Switches the asset to a new category; the new category's defaults apply going forward"],
          ["Retirement (full / partial)", "Removes the asset (or a unit/percentage of it) from service — disposal, sale, or write-off"],
          ["Reinstatement", "Brings a retired asset back into service with its remaining value and depreciation life"],
          ["Mass retirement", "Retires many assets at once, typically at a period end or on a disposal batch"],
          ["Impairment", "Recognizes a permanent drop in recoverable value, measured per cash-generating unit (CGU)"],
          ["Physical inventory", "Counts assets, compares counts to the register, and corrects discrepancies"],
        ]}
      />
      <P>
        <strong>Retirements</strong> can be full or partial and trigger{" "}
        <strong>retirement depreciation</strong>: the asset is depreciated up to the retirement date
        using the book's retirement convention, then the net book value is written off.{" "}
        <strong>Reinstatement</strong> reverses that — the asset comes back with the remaining cost,
        reserve, and life it had before, so subsequent runs continue from where they left off.
      </P>
      <UL>
        <li><strong>Impairment:</strong> recorded on <strong>cash-generating units</strong> (CGUs) — a group of assets whose cash flows are independent. The impairment loss is allocated across the CGU's assets, and if the reason reverses, the loss can be reversed up to the recoverable amount.</li>
        <li><strong>Physical inventory:</strong> counts are imported through the physical inventory interface, compared to the asset register, and corrective adjustments (additions, retirements, or tag fixes) are posted for the differences.</li>
        <li><strong>Approvals:</strong> transaction approval rules can require a manager's sign-off on transfers, retirements, and reclassifications before the transaction is booked.</li>
      </UL>

      <H2>Configuration</H2>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Transfer rules", "What a transfer may change (location, cost center, account) and when books re-open", "Fixed Assets → Transfers"],
          ["Retirement conventions", "How the final depreciation period of a retired asset is prorated", "Fixed Assets → Conventions"],
          ["Impairment setups", "Cash-generating units, impairment rules, and the accounts for loss/reversal", "Fixed Assets → Impairment"],
          ["Physical inventory setups", "Count tags, counting periods, and comparison rules for the inventory cycle", "Fixed Assets → Physical Inventory"],
          ["Transaction approvals", "Which transactions require approval before they take effect", "Fixed Assets → Transaction Approvals"],
        ]}
      />

      <H2>Technical view</H2>
      <Callout type="info">
        As with additions and depreciation, the Financials REST guide does not publish an{" "}
        <K>assets</K> resource — asset-level CRUD is under the <strong>SCM / Asset Management</strong>{" "}
        REST guide (<K>fscmRestApi</K>). Bulk transaction loads go through the Fixed Asset FBDI
        imports below, and accounting is generated with <K>Create Accounting for Assets</K>.
      </Callout>
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose"]}
        rows={[
          [<K key="f1">Fixed Asset Mass Transfers Import</K>, "Bulk-transfer assets: new location, cost center, account, or book"],
          [<K key="f2">Fixed Asset Mass Retirements Import</K>, "Bulk-retire assets (full or partial) with proceeds and retirement dates"],
          [<K key="f3">Fixed Asset Mass Adjustments Import</K>, "Bulk cost/account adjustments on existing assets"],
          [<K key="f4">Physical Inventory Interface</K>, "Loads counted quantities/tags for the physical inventory comparison"],
        ]}
      />
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">erpProcesses</K>, "POST-only: submit the import/accounting jobs (for example Create Accounting for Assets) — see Driving ESS via REST"],
          [<K key="r2">assets</K>, "Not in the Financials guide — asset CRUD under the SCM Asset Management guide (fscmRestApi)"],
        ]}
      />
      <H3>Working example — create accounting after a transaction</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "processName": "Create Accounting for Assets",
    "processType": "ESS",
    "parameters": [
      { "name": "RequestId", "value": "12345" },
      { "name": "BookCode", "value": "CORP" }
    ]
  }'`}
      />
      <P>
        Each FBDI template above has a matching import process you submit through{" "}
        <K>erpProcesses</K> to turn interface rows into transactions. Process names and parameters
        vary by release — verify them against your instance's job submission UI and REST resource
        explorer.
      </P>

      <H2>Data flow — step by step</H2>
      <P>
        Where each step of a transfer/retirement/impairment lands in the underlying tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "A transfer or reclassification changes the asset's location/cost center/category", <K key="t1">FA_TRANSACTIONS</K>],
          ["2", "A category change applies the new category's defaults to the asset", <K key="t2">FA_CATEGORIES_B</K>, <K key="t3">FA_ADDITIONS_B</K>],
          ["3", "Depreciation is recalculated (or run) so the book reflects the change", <K key="t4">FA_DEPRN_SUMMARY</K>],
          ["4", "A retirement removes the asset (or units of it) from service", <span key="t5c"><span key="c0"><K key="t5">FA_ADDITIONS_B</K> (status = retired)</span>, <K key="t6">FA_TRANSACTIONS</K></span>],
          ["5", "An impairment loss is recorded against the CGU and allocated to assets", <K key="t7">FA_TRANSACTIONS</K>, <K key="t8">FA_BOOKS</K>],
          ["6", "Create Accounting for Assets turns the transactions into journal entries", <K key="t9">XLA_AE_HEADERS</K>, <K key="t10">XLA_AE_LINES</K>],
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
        filename="fa_transactions.sql"
        code={`-- Asset transactions for a book (transfers, retirements, impairments)
SELECT a.asset_number, t.transaction_type, t.date_effective,
       t.source_transaction_id, t.status
FROM   fa_transactions t
JOIN   fa_additions_b a ON a.asset_id = t.asset_id
WHERE  t.date_effective >= :from_date
ORDER BY t.date_effective;`}
      />
      <CodeBlock
        language="sql"
        filename="fa_retired_assets.sql"
        code={`-- Assets retired (status) with their book state
SELECT a.asset_number, a.asset_description, a.asset_category_id,
       b.book_type_code, b.cost, b.deprn_reserve, b.status
FROM   fa_additions_b a
JOIN   fa_books b ON b.asset_id = a.asset_id
WHERE  b.status = 'RETIRED'
ORDER BY a.asset_number;`}
      />
      <Callout type="tip">
        Verify the column names — especially the retirement status value in <K>FA_BOOKS</K> or{" "}
        <K>FA_ADDITIONS_B</K>, which can differ by release — against your instance, and never query
        the Fusion database directly for production reporting — use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Transactions post through <K>Create Accounting for Assets</K>:
      </P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Full retirement (disposal)", "Accumulated depreciation + receivable/proceeds", "Asset account (+ gain/loss on disposal)"],
          ["Partial retirement", "Accumulated depreciation (proportion)", "Asset account (proportion)"],
          ["Impairment loss", "Impairment expense", "Asset account / accumulated depreciation"],
          ["Impairment loss reversal", "Asset account / accumulated depreciation", "Impairment recovery / reserve"],
          ["Reclassification", "Asset account (new category)", "Asset account (old category)"],
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
          ["Asset transfers & retirements reports", "Delivered BIP reports under Fixed Assets"],
          ["Physical inventory comparison output", "Delivered BIP report under Fixed Assets"],
          ["Fixed Assets Real Time subject areas (retired assets)", "OTBI"],
          ["Retirement / impairment in the GL", "Financial Reporting / GL reports"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Depreciation before the move:</strong> cross-ledger book transfers require the source book to be fully depreciated up to date — run Calculate Depreciation first.</li>
        <li><strong>Retired status is book-level:</strong> an asset retires in one book and stays active in another — match on <K>asset_id</K> plus <K>book_type_code</K>, not on the asset alone.</li>
        <li><strong>Reinstatement reverses the retirement:</strong> it restores cost, reserve, and life so the next run continues correctly — do not manually re-add a reinstated asset.</li>
        <li><strong>Impairment is CGU-driven:</strong> allocate losses across the cash-generating unit, and respect the reversal cap (recoverable amount) when recording reversals.</li>
        <li><strong>Interface imports need the import job:</strong> FBDI uploads only stage rows — the matching import process (via <K>erpProcesses</K>) converts them, then <K>Create Accounting for Assets</K> posts.</li>
        <li><strong>Asset CRUD lives in SCM:</strong> direct asset transactions go through the SCM / Asset Management guide (<K>fscmRestApi</K>); verify resource, job, and column names against your instance.</li>
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
        <li>Retirement and impairment entries flow into the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL journal</a> world.</li>
      </UL>
    </>
  );
}
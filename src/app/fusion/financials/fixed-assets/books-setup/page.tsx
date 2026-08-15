import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Asset Books & Setup",
};

export default function AssetBooksSetupPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Asset Books & Setup"
        description="Everything that must exist before a single asset can be added: the asset books (corporate and tax), the depreciation calendars and fiscal years behind them, the conventions and capitalization thresholds that gate an addition, and the flexfields that name and locate every asset."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Fixed Assets", href: "/fusion/financials/fixed-assets" }, { label: "Asset Books & Setup" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a> (the ledger that asset books report to),{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/flexfields">Flexfields &amp; Value Sets</a> (the asset, category, and location key flexfields), and the{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets">Fixed Assets overview</a> before this page.
      </Callout>

      <H2>Functional view</H2>
      <P>
        An <strong>asset book</strong> is the rules holder for a set of assets: it carries the
        depreciation method, life, and conventions, and it answers to one General Ledger. A given
        asset is almost always tracked in <strong>more than one book</strong> at once — typically a
        <strong> corporate book</strong> that posts to the GL and one or more statutory or{" "}
        <strong>tax books</strong> that only report.
      </P>
      <DataTable
        headers={["Book perspective", "What it does"]}
        rows={[
          ["Corporate book", "Primary book for an asset; drives GL postings and managerial reporting"],
          ["Tax book", "Tracks the same asset under tax depreciation rules; usually reporting-only, not posted to the GL"],
          ["Multiple books", "One asset can live in several books simultaneously, each with its own cost, method, life, and convention"],
          ["Transfer between books", "Assets can move between books (same ledger or different ledger), each move recorded as a transaction"],
        ]}
      />
      <P>
        Combining and transferring between books is routine, but transfers across ledgers carry
        additional accounting — the source book must be current on depreciation before the transfer
        runs. See <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/transactions">Transfers, Retirements &amp; Impairment</a>.
      </P>
      <DataTable
        headers={["Setup concept", "What it controls"]}
        rows={[
          ["Fiscal years", "The annual window a book recognizes; defined in a range before periods exist"],
          ["Asset calendar (depreciation periods)", "The periods a depreciation run can post to; opens/closes per book"],
          ["Prorate convention", "How much depreciation the first partial period takes (mid-month, mid-quarter, next month, and so on)"],
          ["Retirement convention", "How the period of a retirement/retired asset is handled for depreciation"],
          ["Capitalization threshold", "The cost below which an item is expensed instead of capitalized; low-value thresholds then place small assets in low-value categories"],
          ["Category and Category Key Flexfield", "Groups assets (Machinery, Furniture…) and drives the defaults each asset inherits"],
          ["Asset Key Flexfield", "The structured asset identifier (tag, serial, description segments) used to find and name assets"],
          ["Location flexfield", "Where an asset physically sits; flows onto asset distributions"],
        ]}
      />
      <Diagram title="Book definition layers" className="mb-8">
        <DiagramNode tone="fusion" title="Asset book" subtitle="method · life · conventions" />
        <Arrow />
        <DiagramNode tone="neutral" title="Fiscal years & calendar" subtitle="open periods per book" />
        <Arrow />
        <DiagramNode tone="neutral" title="Categories" subtitle="Category KFF defaults" />
        <Arrow />
        <DiagramNode tone="success" title="Ready for additions" subtitle="thresholds gate the cost" />
      </Diagram>
      <P>
        New assets get a <strong>default asset status</strong> from the category they are created
        under. If the category defaults are wrong (for example a missing depreciation rule), every
        asset added under it inherits the same problem — fix categories before loading assets.
      </P>

      <H2>Configuration</H2>
      <P>
        Books and their supporting setups are configured in the Fixed Assets work area, before any
        mass addition is posted.
      </P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Manage Asset Books", "Method, life, prorate/retirement conventions, GL linkage", "Fixed Assets → Asset Books"],
          ["Fiscal years & depreciation calendar", "The periods a run can post to; check open flags first", "Fixed Assets → Fiscal Years"],
          ["Conventions", "First-year proration, retirement proration, averaging conventions", "Fixed Assets → Conventions"],
          ["Capitalization thresholds", "Capitalize vs expense the cost of an addition", "Fixed Assets → Capitalization Thresholds"],
          ["Asset categories (Category KFF)", "Defaults for capitalization, depreciation, and status per asset type", "Fixed Assets → Asset Categories"],
          ["Flexfields", "Asset Key Flexfield, Category Key Flexfield, and Location flexfield structures", "Work area → Flexfields"],
        ]}
      />
      <Callout type="info">
        Because these setups are UI-driven (there is no REST resource in the Financials REST guide
        that creates them), an integration typically <em>reads</em> the book and category setup to
        validate its uploads rather than writing to it.
      </Callout>

      <H2>Technical view</H2>
      <Callout type="info">
        There is an important split to keep straight. The Financials REST guide (<K>farfa</K>)
        publishes only two read-only reference resources for Fixed Assets:{" "}
        <K>fixedAssetBooksLOV</K> and <K>fixedAssetCategoriesLOV</K> — both <K>GET</K>. There is{" "}
        <strong>no</strong> <K>assets</K> resource in the Financials book. Real asset CRUD (creating,
        updating, reading asset records) lives in the <strong>SCM / Asset Management</strong> REST
        guide (<K>fscmRestApi</K>) instead. Document those two sources as separate integrations.
      </Callout>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="b1">fixedAssetBooksLOV</K>, "GET-only list of asset books — used to validate book names/rates in an upload"],
          [<K key="b2">fixedAssetCategoriesLOV</K>, "GET-only list of asset categories — used to validate category names before an addition"],
          [<K key="b3">assets</K>, "Not in the Financials guide — asset CRUD is under the SCM Asset Management guide (fscmRestApi)"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Relationship to books", "Must exist first"]}
        rows={[
          [<K key="f1">Fixed Asset Mass Additions Import</K>, "Every staged mass addition is assigned to a book; the book's method/life drive the depreciation defaults", "Book, depreciation calendar, categories, capitalization thresholds"],
        ]}
      />
      <H3>Working example — look up books for an upload</H3>
      <CodeBlock
        language="bash"
        filename="GET /fixedAssetBooksLOV"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/fixedAssetBooksLOV?onlyData=true&fields=BookTypeCode,BookName" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />
      <P>
        The root service listing order is <K>farfa → Fixed Asset</K> in the REST resource explorer.
        Resource and field names vary slightly by release — verify them against your instance's REST
        resource explorer.
      </P>

      <H2>Data flow — step by step</H2>
      <P>
        Where each layer of the book setup lands in the underlying tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Setup: the asset book is defined with its GL linkage and depreciation rules", <K key="d1">FA_BOOKS</K>],
          ["2", "Setup: fiscal years and the depreciation calendar are built for the book", <span key="d2c"><K key="d2">FA_DEPRECIATION</K> / <K key="d3">FA_DEPRN_PERIODS</K></span>],
          ["3", "Setup: categories are defined under the Category Key Flexfield", <K key="d4">FA_CATEGORIES_B</K>],
          ["4", "Setup: physical locations are defined under the location flexfield", <K key="d5">FA_LOCATIONS_B</K>],
          ["5", "Thresholds are set so only qualifying costs are capitalized when additions arrive", <span key="d6c"><span key="c0"><K key="d6">FA_CATEGORIES_B</K> (threshold/defaults)</span></span>],
          ["6", "The setup is complete — additions can now be staged and posted against the book", <span key="d7c"><K key="d7">FA_ADDITIONS_B</K>, <K key="d8">FA_MASS_ADDITIONS</K></span>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data dictionary.
        Column names like <K>BOOK_TYPE_CODE</K> are plausible dictionary names — exact names and even
        which calendar table a release uses can vary, so confirm against your instance's data
        dictionary before relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="fa_books.sql"
        code={`-- Assets and their book assignment with depreciation state
SELECT a.asset_number, b.book_type_code, b.date_placed_in_service,
       b.cost, b.salvage_value, b.depreciation_method,
       b.deprn_reserve, b.ytd_depreciation
FROM   fa_books b
JOIN   fa_additions_b a ON a.asset_id = b.asset_id
WHERE  b.book_type_code = :book_type_code
ORDER BY a.asset_number;`}
      />
      <CodeBlock
        language="sql"
        filename="fa_categories.sql"
        code={`-- Asset categories and their book defaults
SELECT c.category_id, c.segment1, c.category_type_code,
       c.capitalize_flag, c.depreciate_flag, c.asset_id
FROM   fa_categories_b c
ORDER BY c.segment1;`}
      />
      <Callout type="tip">
        Verify the column names in <K>FA_BOOKS</K> and <K>FA_CATEGORIES_B</K> against your instance,
        and never query the Fusion database directly for production reporting — use OTBI or the REST
        API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Book setup itself creates no accounting entries. It only determines <em>how</em> later
        events post: the book's accounting method and the category's account defaults decide which
        GL accounts an addition, a depreciation run, or a retirement hit. The entries themselves are
        generated by <K>Create Accounting for Assets</K> and land in <K>XLA_AE_HEADERS</K> /{" "}
        <K>XLA_AE_LINES</K> — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Asset Books report (book rules, methods, conventions)", "Delivered BIP report under Fixed Assets"],
          ["Asset Categories report (defaults, thresholds)", "Delivered BIP report under Fixed Assets"],
          ["Fixed Assets Real Time subject areas (book fields)", "OTBI"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Setup first, load second:</strong> a mass addition against a book with no open calendar period or no category defaults will fail — finish books, calendars, categories, thresholds first.</li>
        <li><strong>Books are UI-created:</strong> the Financials REST guide has no create endpoint for books — setup goes through Manage Asset Books. Only <K>fixedAssetBooksLOV</K> and <K>fixedAssetCategoriesLOV</K> (GET) exist there.</li>
        <li><strong>Asset CRUD is elsewhere:</strong> creating asset records is done through the SCM / Asset Management REST guide (<K>fscmRestApi</K>), not the Financials guide.</li>
        <li><strong>Validate with the LOVs:</strong> before a bulk load, fetch <K>fixedAssetBooksLOV</K> and <K>fixedAssetCategoriesLOV</K> so the file only references books and categories that exist.</li>
        <li><strong>Verify against your instance:</strong> resource names, book codes, and dictionary columns all vary by release — confirm before building integrations on them.</li>
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
        <li>Continue to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/additions">Additions &amp; Mass Additions</a> — this is where the books you configured start getting used.</li>
      </UL>
    </>
  );
}
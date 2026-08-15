import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import TableCatalog from "@/components/ui/TableCatalog";
import { fusionTables, fusionTableModules } from "@/lib/tables";

export const metadata = {
  title: "Fusion Tables",
};

export default function FusionTablesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Fusion Tables"
        description="The Financials and integration data model, sorted alphabetically: every table your integration touches, its purpose, its primary key, and the foreign keys that connect it to the rest of the model. Filter by module or search for a table name."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Fusion Tables" }]}
        updated="August 2026"
      />

      <Callout type="warning" title="How to read this page">
        <strong>Primary key</strong> is the column (or composite) that uniquely identifies a row.{" "}
        <strong>Foreign keys</strong> are the columns that reference a parent table — shown here as{" "}
        <K>CHILD_COLUMN → PARENT_TABLE</K>. A table with a composite PK is marked{" "}
        <em>"(composite)"</em>. Names follow the Fusion data dictionary; exact columns can vary by
        release, so confirm against your instance before writing SQL.
      </Callout>

      <H2>The catalog</H2>
      <P>
        {fusionTables.length} tables across {fusionTableModules.length} areas: Party (HZ), Suppliers
        (POZ), Payables (AP), Payments (IBY), Receivables (RA/AR), General Ledger (GL), Flexfields
        (FND), Subledger Accounting (XLA), Cash Management (CE), Fixed Assets (FA), Expenses (EXM),
        and Intercompany (FUN). Type in the box to filter, or pick one module.
      </P>

      <TableCatalog />

      <H2>The joins that matter</H2>
      <P>
        These are the foreign-key paths you will write over and over when tracing data across the
        model. Each join uses the keys shown in the catalog above.
      </P>
      <DataTable
        headers={["What you are tracing", "Join path"]}
        rows={[
          ["Invoice → supplier", <span key="j1"><K>AP_INVOICES_ALL</K>.VENDOR_ID → <K>POZ_SUPPLIERS</K>.SUPPLIER_ID</span>],
          ["Invoice → party (who you pay)", <span key="j2"><K>POZ_SUPPLIERS</K>.PARTY_ID → <K>HZ_PARTIES</K>.PARTY_ID</span>],
          ["Invoice distribution → account", <span key="j3"><K>AP_INVOICE_DISTRIBUTIONS_ALL</K>.CODE_COMBINATION_ID → <K>GL_CODE_COMBINATIONS</K>.CODE_COMBINATION_ID</span>],
          ["Journal line → account", <span key="j4"><K>GL_JE_LINES</K>.CODE_COMBINATION_ID → <K>GL_CODE_COMBINATIONS</K>.CODE_COMBINATION_ID</span>],
          ["Journal line → journal header", <span key="j5"><K>GL_JE_LINES</K>.JE_HEADER_ID → <K>GL_JE_HEADERS</K>.JE_HEADER_ID</span>],
          ["Accounting entry → event → transaction", <span key="j6"><K>XLA_AE_HEADERS</K>.EVENT_ID → <K>XLA_EVENTS</K>.EVENT_ID → <K>XLA_TRANSACTION_ENTITIES</K>.ENTITY_ID</span>],
          ["AR invoice → customer account", <span key="j7"><K>RA_CUSTOMER_TRX_ALL</K>.BILL_TO_CUSTOMER_ID → <K>HZ_CUST_ACCOUNTS</K>.CUST_ACCOUNT_ID</span>],
          ["Receipt application → receipt + invoice", <span key="j8"><K>AR_RECEIVABLE_APPLICATIONS_ALL</K>.CASH_RECEIPT_ID → <K>AR_CASH_RECEIPTS_ALL</K>.CASH_RECEIPT_ID and .CUSTOMER_TRX_ID → <K>RA_CUSTOMER_TRX_ALL</K>.CUSTOMER_TRX_ID</span>],
          ["Statement line → bank account", <span key="j9"><K>CE_STATEMENT_HEADERS</K>.BANK_ACCOUNT_ID → <K>CE_BANK_ACCOUNTS</K>.BANK_ACCOUNT_ID via <K>CE_STATEMENT_LINES</K>.STATEMENT_HEADER_ID</span>],
          ["Asset → book → depreciation", <span key="j10"><K>FA_BOOKS</K>.ASSET_ID → <K>FA_ADDITIONS_B</K>.ASSET_ID and <K>FA_DEPRN_DETAIL</K> joins via ASSET_ID + BOOK_TYPE_CODE</span>],
          ["Bank payment → invoice", <span key="j11"><K>AP_INVOICE_PAYMENTS_ALL</K>.CHECK_ID → <K>IBY_PAYMENTS_ALL</K>.PAYMENT_ID and .INVOICE_ID → <K>AP_INVOICES_ALL</K>.INVOICE_ID</span>],
        ]}
      />

      <H2>Interface vs base tables</H2>
      <P>
        A table ending in <K>_INTERFACE</K>, <K>_INT</K>, or named like <K>RA_INTERFACE_*</K> is a{" "}
        <strong>staging table</strong>: bulk loads write there first, and an ESS import job validates
        and moves rows into the base tables. You will see rejected rows sitting in interface tables
        with a status and reason column. Full explanation on{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/interface-tables">
          Interface Tables
        </a>
        .
      </P>
      <UL>
        <li><K>AP_INVOICES_INTERFACE</K> / <K>AP_INVOICE_LINES_INTERFACE</K> → <K>AP_INVOICES_ALL</K> / <K>AP_INVOICE_LINES_ALL</K></li>
        <li><K>GL_INTERFACE</K> → <K>GL_JE_BATCHES</K> / <K>GL_JE_HEADERS</K> / <K>GL_JE_LINES</K></li>
        <li><K>RA_INTERFACE_LINES_ALL</K> → <K>RA_CUSTOMER_TRX_ALL</K> / <K>RA_CUSTOMER_TRX_LINES_ALL</K></li>
        <li><K>AR_PAYMENTS_INTERFACE_ALL</K> → <K>AR_CASH_RECEIPTS_ALL</K></li>
        <li><K>CE_STATEMENT_HEADERS_INT</K> / <K>CE_STATEMENT_LINES_INT</K> → <K>CE_STATEMENT_HEADERS</K> / <K>CE_STATEMENT_LINES</K></li>
        <li><K>FA_MASS_ADDITIONS</K> → <K>FA_ADDITIONS_B</K> / <K>FA_BOOKS</K></li>
      </UL>

      <H2>Where each module keeps its data</H2>
      <DataTable
        headers={["Module", "Table prefix", "Key tables"]}
        rows={[
          ["Party / TCA", "HZ_", <K key="m1">HZ_PARTIES, HZ_PARTY_SITES, HZ_CUST_ACCOUNTS</K>],
          ["Suppliers", "POZ_", <K key="m2">POZ_SUPPLIERS, POZ_SUPPLIER_SITES_ALL</K>],
          ["Payables", "AP_", <K key="m3">AP_INVOICES_ALL, AP_INVOICE_LINES_ALL, AP_INVOICE_DISTRIBUTIONS_ALL</K>],
          ["Payments", "IBY_", <K key="m4">IBY_PAYMENTS_ALL</K>],
          ["Receivables", "RA_ / AR_", <K key="m5">RA_CUSTOMER_TRX_ALL, RA_CUSTOMER_TRX_LINES_ALL, AR_CASH_RECEIPTS_ALL</K>],
          ["General Ledger", "GL_", <K key="m6">GL_JE_HEADERS, GL_JE_LINES, GL_BALANCES, GL_CODE_COMBINATIONS</K>],
          ["Flexfields", "FND_", <K key="m7">FND_FLEX_VALUE_SETS, FND_FLEX_VALUES, FND_ID_FLEX_STRUCTURES</K>],
          ["Subledger Accounting", "XLA_", <K key="m8">XLA_AE_HEADERS, XLA_AE_LINES, XLA_EVENTS</K>],
          ["Cash Management", "CE_", <K key="m9">CE_BANK_ACCOUNTS, CE_STATEMENT_HEADERS, CE_STATEMENT_LINES</K>],
          ["Fixed Assets", "FA_", <K key="m10">FA_ADDITIONS_B, FA_BOOKS, FA_DEPRN_DETAIL, FA_DEPRN_SUMMARY</K>],
          ["Expenses", "EXM_", <K key="m11">EXM_EXPENSE_REPORTS, EXM_EXPENSE_REPORT_LINES</K>],
        ]}
      />

      <H2>Notes on reliability</H2>
      <UL>
        <li>
          <strong>Releases move columns.</strong> A column that exists in your release may not exist
          in the docs you read, and vice-versa. Query your instance's data dictionary (SQL Developer
          against a read replica) to confirm.
        </li>
        <li>
          <strong>Composite keys are the norm</strong> for balances and period statuses — a single
          column cannot identify them.
        </li>
        <li>
          <strong>Foreign keys are enforced in the application, not always as DB constraints.</strong>{" "}
          Fusion uses the keys to join in SQL; orphan protection lives in the service layer.
        </li>
        <li>
          <strong>Never query the Fusion database for production reporting.</strong> Use OTBI, the
          REST API, or BI Publisher. SQL is for debugging and read-replica analysis only.
        </li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Understand the import pipeline in <a className="font-semibold text-accent hover:underline" href="/fusion/interface-tables">Interface Tables</a>.</li>
        <li>See the tables in context on the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">ERP Financials hub</a> and its module pages.</li>
        <li>Trace the accounting model in <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.</li>
      </UL>
    </>
  );
}

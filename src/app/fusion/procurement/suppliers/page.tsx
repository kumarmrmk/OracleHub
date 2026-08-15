import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";

export const metadata = {
  title: "Suppliers & Agreements",
};

export default function SuppliersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Suppliers & Agreements"
        description="The master data every buy starts from. A supplier (with its sites, contacts, and bank accounts) must exist before a requisition, purchase order, or invoice references it. Agreements (blanket and contract POs) set the standing terms that normal POs draw on."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Procurement", href: "/fusion/procurement" }, { label: "Suppliers & Agreements" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/procurement">Procurement hub</a> first. Supplier master is shared with{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a> — the same party record pays invoices.
      </Callout>

      <H2>Functional view</H2>
      <P>
        A <strong>supplier</strong> is a party you buy from, with one or more{" "}
        <strong>supplier sites</strong> (address/legal locations), <strong>contacts</strong>, and{" "}
        <strong>bank accounts</strong> for payment. The supplier master (shared with Payables) lives
        in the party model — <K>HZ_PARTIES</K> → <K>POZ_SUPPLIERS</K> → <K>POZ_SUPPLIER_SITES_ALL</K>.
        An <strong>agreement</strong> (blanket/contract PO) sets standing terms that normal POs
        reference.
      </P>
      <Diagram title="Supplier hierarchy" className="mb-8">
        <DiagramNode tone="neutral" title="Party (HZ_PARTIES)" subtitle="person or organization" />
        <Arrow />
        <DiagramNode tone="fusion" title="Supplier (POZ_SUPPLIERS)" subtitle="customer-facing record" />
        <Arrow />
        <DiagramNode tone="neutral" title="Supplier sites" subtitle="addresses · legal locations · contacts" />
        <Arrow />
        <DiagramNode tone="warning" title="Document types" subtitle="standard PO · blanket PO · contract PO" />
      </Diagram>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">supplierRegistrationRequests</K>, "Create/read the supplier registration request (the create path for new suppliers)"],
          [<K key="r2">suppliers / supplierSites</K>, "Read/update supplier and site data (check availability and names on your instance)"],
          [<K key="r3">bankAccounts</K>, "Read supplier bank accounts for payment"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Supplier Import</K>, "Bulk-create suppliers (ships in the Procurement FBDI guide)", "Party data, tax reg details, and bank info"],
          [<K key="f2">Supplier Sites Import</K>, "Bulk-create supplier sites", "Supplier already exists"],
        ]}
      />
      <Callout type="warning">
        Supplier master is created through the <strong>Procurement FBDI guide</strong> (not the
        Financials one) and party data is Common Features. Confirm resource names against your
        instance's REST service catalog.
      </Callout>

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "A party is created (Common Features)", <K key="t1">HZ_PARTIES</K>],
          ["2", "The supplier record is created", <K key="t2">POZ_SUPPLIERS</K>],
          ["3", "Supplier sites (addresses) are added", <K key="t3">POZ_SUPPLIER_SITES_ALL</K>],
          ["4", "Contacts and bank accounts are added", <K key="t4">POZ_SUPPLIER_CONTACTS / POZ_SUPPLIER_BANK_ACCOUNTS</K>],
          ["5", "Agreements (blanket/contract POs) set standing terms", <K key="t5">PO_HEADERS_ALL (document type)</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="poz_suppliers.sql"
        code={`-- Suppliers with sites, filtered to a name fragment
SELECT s.supplier_id, s.supplier_name, ss.vendor_site_id,
       ss.address1, ss.city
FROM   poz_suppliers s
JOIN   poz_supplier_sites_all ss ON ss.supplier_id = s.supplier_id
WHERE  UPPER(s.supplier_name) LIKE '%' || UPPER(:p_name) || '%'
ORDER  BY s.supplier_name;`}
      />

      <H2>Worked example — onboarding a supplier</H2>
      <WorkedExample
        title="Worked example: Acme IT"
        intro={<>A new supplier needs a party, supplier record, site, and bank account before any PO.</>}
        steps={[
          {
            label: "1 · Party & supplier",
            body: <><K>HZ_PARTIES</K> row + <K>POZ_SUPPLIERS</K> row for "Acme IT".</>,
          },
          {
            label: "2 · Site",
            body: <>Acme IT's shipping/pay-to site added.</>,
          },
          {
            label: "3 · Ready to buy",
            body: <>The supplier can now be referenced by POs and invoices — load order boundary reached.</>,
          },
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Load order is everything:</strong> supplier → sites → PO/invoice. Load the master before transactions reference it.</li>
        <li><strong>Shared with Payables:</strong> one supplier record serves both Procurement and AP — fix it once, it's used everywhere.</li>
        <li><strong>Bank account before payment:</strong> suppliers need bank data before payments can be generated.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Agreements feed <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/purchase-orders">Purchase Orders</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/procurement">Procurement hub</a>.</li>
      </UL>
    </>
  );
}
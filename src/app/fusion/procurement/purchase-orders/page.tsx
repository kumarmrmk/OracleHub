import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";

export const metadata = {
  title: "Purchase Orders",
};

export default function PurchaseOrdersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Purchase Orders"
        description="The contract to buy. A purchase order (PO) names the supplier, the lines, the quantities and prices, and the charge accounts — and once approved it is the commitment Payables matches invoices against. Understand document types, lines, distributions, approvals, and change orders and you understand most procurement integrations."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Purchase Orders" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/requisitions">Requisitions</a> and the{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/procurement">Procurement hub</a> first. The{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/holds-matching">matching</a> page in Payables explains how the PO is used to approve payment.
      </Callout>

      <H2>Functional view</H2>
      <P>
        The PO is the <strong>commitment</strong>: a legal promise to buy specific goods/services at
        agreed prices. It has a <strong>header</strong> (supplier, site, terms, currency),{" "}
        <strong>lines</strong> (item, quantity, price), and <strong>distributions</strong> (the
        charge accounts). A PO can be created directly or converted from an approved requisition.
      </P>
      <Diagram title="PO lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="From requisition" subtitle="approved PR → PO" />
        <Arrow label="or direct entry / import" />
        <DiagramNode tone="warning" title="Approval" subtitle="document-level workflow" />
        <Arrow />
        <DiagramNode tone="success" title="Approved → open" subtitle="ready to receive against" />
        <Arrow label="changes" />
        <DiagramNode tone="warning" title="Change orders" subtitle="amend lines / amounts" />
      </Diagram>
      <DataTable
        headers={["Document type", "What it is"]}
        rows={[
          ["Standard PO", "One-time purchase with defined lines — the common case"],
          ["Blanket PO", "Standing agreement; releases' draw down later (no line commitment)"],
          ["Contract PO", "Terms-only agreement; calls/expenses reference it"],
          ["Purchase requisition", "The request; becomes a standard PO on conversion"],
        ]}
      />
      <H3>Approval &amp; status</H3>
      <P>
        Approving a PO requires <strong>funds/approval rules</strong> and — if budget control is on — a{" "}
        <strong>budget reservation</strong>. Status moves <em>Incomplete → In Approval →
        Approved → Open / Closed</em>. A PO cannot be received against until it is approved and open.
      </P>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">purchaseOrders</K>, "Create/read/update PO headers and children — the REST create path"],
          [<K key="r2">purchaseOrderLines</K>, "Create/read/update PO lines"],
          [<K key="r3">purchaseOrderDistributions</K>, "Create/read PO distributions (charge accounts)"],
          [<K key="proc">erpProcesses</K>, "POST — submit approval / AutoClose related ESS jobs if needed"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Import Purchase Orders</K>, "Bulk-create POs with headers, lines, and distributions", "Supplier + site, buyer, approved item/category, unit of measure"],
        ]}
      />
      <H3>Working example — create a PO via REST</H3>
      <CodeBlock
        language="bash"
        filename="POST /purchaseOrders"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/scmRestApi/resources/latest/purchaseOrders" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version" \\
  -X POST \\
  -d '{
    "SupplierId": 123456,
    "SupplierSiteId": 789123,
    "CurrencyCode": "USD",
    "BuyerId": 900001,
    "DocumentTypeCode": "STANDARD",
    "PaymentTermsName": "NET30",
    "Lines": [
      {
        "ItemDescription": "Ergonomic chair",
        "Quantity": 10,
        "UnitPrice": 150,
        "ChargeAccountId": 300100000000123
      }
    ]
  }'`}
      />

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "The PO is created (converted from PR, entered, imported, or REST)", <K key="t1">PO_HEADERS_ALL</K>],
          ["2", "PO lines carry item, quantity, price", <K key="t2">PO_LINES_ALL</K>],
          ["3", "PO distributions hold the charge accounts", <K key="t3">PO_DISTRIBUTIONS_ALL</K>],
          ["4", "Approval runs — status → Approved/Open", <span key="t4c"><K key="t4">PO_HEADERS_ALL</K> (status)</span>],
          ["5", "Goods are received against open lines", <span key="t5c"><K key="t5">RCV_TRANSACTIONS</K> (receipts)</span>],
          ["6", "Payables matches the invoice to PO + receipt", <span key="t6c"><K key="t6">AP_INVOICE_MATCHES_ALL</K></span>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="po_headers.sql"
        code={`SELECT h.po_header_id, h.segment1 AS po_number, h.document_status,
       h.document_type_code, h.currency_code, h.creation_date,
       s.supplier_name
FROM   po_headers_all h
JOIN   poz_suppliers s ON s.supplier_id = h.vendor_id
WHERE  h.creation_date >= SYSDATE - 30
  AND  h.document_type_code = 'STANDARD'
ORDER BY h.creation_date DESC;`}
      />

      <H2>Worked example — a PO with budget check</H2>
      <WorkedExample
        title="Worked example: 10 chairs at $150"
        intro={
          <>
            A buyer creates a standard PO for <strong>10 chairs × $150 = $1,500</strong>, charged to
            the facilities account.
          </>
        }
        steps={[
          {
            label: "1 · The lines & distributions",
            body: <>Header (Acme Furniture) + 1 line × 10 qty + 1 distribution to the facilities account.</>,
          },
          {
            label: "2 · Approval & status",
            body: <>The PO goes through document approval; if budget control is on, it reserves $1,500. Status → <em>Approved / Open</em>.</>,
          },
          {
            label: "3 · The downstream link",
            body: <>Payables later matches the $1,500 supplier invoice against PO line + receipt — 2-way/3-way.</>,
          },
        ]}
        journal={[{ account: "Facilities expense (01-6900-300)", debit: "$1,500" }]}
      />
      <Callout type="tip">
        A PO "posts" to the GL only through <em>accrual</em> or the downstream invoice; the PO itself is a
        commitment (encumbrance), not actual spend.
      </Callout>

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Create path is REST or FBDI:</strong> <K>purchaseOrders</K> REST for small volumes; Import Purchase Orders FBDI for bulk.</li>
        <li><strong>Supplier must exist first:</strong> PO creation rejects on a missing/inactive supplier site.</li>
        <li><strong>Approved/open before receive:</strong> receiving against an unapproved PO fails.</li>
        <li><strong>Accrual and budget:</strong> with accrual/budgetary control, a PO can reserve funds — plan the document type accordingly.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/payables">Payables troubleshooting</a>{" "}
        (invoice/match issues referencing the PO).
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Approved POs get received in <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/receiving">Receiving</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/procurement">Procurement hub</a>.</li>
      </UL>
    </>
  );
}
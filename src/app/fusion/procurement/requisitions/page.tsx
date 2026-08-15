import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";

export const metadata = {
  title: "Requisitions",
};

export default function RequisitionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Requisitions"
        description="How a need becomes a request: employees raise requisitions through self-service or an external system, they are approved by a manager, and a buyer converts them into purchase orders. This is the first document in Procurement and the starting point of every buy."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Requisitions" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/procurement">Procurement hub</a> first. Requisitions assume the{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/approvals">approval</a> model and the supplier/PO background from{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/purchase-orders">Purchase Orders</a>.
      </Callout>

      <H2>Functional view</H2>
      <P>
        A <strong>requisition (PR)</strong> is a request to buy: what, how many, when, and for which{" "}
        <strong>chart of accounts</strong> (the distributions). It is <em>not</em> a commitment to
        buy — it becomes one only when a buyer converts it into a <strong>purchase order</strong>.
        Requisitions can be entered two ways:
      </P>
      <DataTable
        headers={["Entry path", "Who uses it", "Notes for integrators"]}
        rows={[
          ["Self-Service Procurement", "Employees in the portal", "No integration needed; approvals and shopping-cart UX included"],
          ["REST (requisitionLines / requisitions)", "External systems", "Create/update requisition lines; approval runs afterwards"],
          ["FBDI import", "Bulk loads", "Requisition import template (check availability on your release)"],
        ]}
      />
      <Diagram title="Requisition lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Create" subtitle="self-service or REST" />
        <Arrow label="submit" />
        <DiagramNode tone="warning" title="Approval" subtitle="manager / BPM workflow" />
        <Arrow label="approved" />
        <DiagramNode tone="neutral" title="Requisition approved" subtitle="available to a buyer" />
        <Arrow label="convert" />
        <DiagramNode tone="fusion" title="Purchase Order" subtitle="the real commitment to buy" />
      </Diagram>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">requisitionLines</K>, "Create/read/update requisition lines (the REST create path for a PR)"],
          [<K key="r2">requisitions</K>, "Read the requisition header and children (check exact resource name on your instance)"],
          [<K key="proc">erpProcesses</K>, "POST — submit the approval / requisition-related ESS jobs if required"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Requisition Import</K>, "Bulk-load requisition lines from an external system", "Employee/requester, expense/charge account, inventory item or category"],
        ]}
      />
      <H3>Working example — create a requisition line via REST</H3>
      <CodeBlock
        language="bash"
        filename="POST /requisitionLines"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/scmRestApi/resources/latest/requisitionLines" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version" \\
  -X POST \\
  -d '{
    "RequisitionNumber": "REQ-2026-001",
    "NeedByDate": "2026-09-15",
    "DeliverToLocationId": 300100000000001,
    "ItemDescription": "Ergonomic chair",
    "Quantity": 2,
    "UnitPrice": 275,
    "ChargeAccountId": 300100000000123,
    "RequisitionLineTypeCode": "GOODS"
  }'`}
      />

      <H2>Data flow — step by step</H2>
      <P>Where a requisition's life lands in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "The requisition is created (self-service or REST)", <K key="t1">POR_REQ_HEADERS_ALL</K>],
          ["2", "Requisition lines carry item, quantity, need-by date", <K key="t2">POR_REQ_LINES_ALL</K>],
          ["3", "Distributions hold the charge accounts", <K key="t3">POR_REQ_DISTRIBUTIONS_ALL</K>],
          ["4", "Approval runs — status moves toward APPROVED", <span key="t4c"><K key="t4">POR_REQ_HEADERS_ALL</K> (status)</span>],
          ["5", "A buyer converts the approved PR into a PO", <span key="t5c"><K key="t5">PO_HEADERS_ALL</K>, <K key="t6">PO_LINES_ALL</K></span>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="por_req_headers.sql"
        code={`SELECT h.requisition_header_id, h.requisition_number, h.requisition_status,
       h.requisition_type_code, h.creation_date,
       p.person_number AS requester
FROM   por_req_headers_all h
LEFT JOIN per_all_people_f p ON p.person_id = h.created_by
WHERE  h.creation_date >= SYSDATE - 30
ORDER BY h.creation_date DESC;`}
      />

      <H2>Worked example — a requisition for two laptops</H2>
      <WorkedExample
        title="Worked example: $1,400 requisition"
        intro={
          <>
            An employee requests <strong>2 laptops at $700 each</strong> = <strong>$1,400</strong>{" "}
            charged to the IT expense account for Department 100.
          </>
        }
        steps={[
          {
            label: "1 · The lines",
            body: <>2 lines × $700, one distribution each to the IT account combination.</>,
          },
          {
            label: "2 · Approval",
            body: <>The manager approves; the PR moves to <em>Approved</em> and becomes available to the buyer.</>,
          },
          {
            label: "3 · Conversion",
            body: <>A buyer converts it to a PO of $1,400 — the actual commitment (next page).</>,
          },
        ]}
        journal={[{ account: "IT expense (01-6400-100)", debit: "$1,400" }]}
      />
      <Callout type="tip">
        Requisitions hold the <em>requested</em> account but do not post to the GL. The accounting
        appears when the PO is accrued or the invoice is paid.
      </Callout>

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Approval is asynchronous:</strong> a created PR may sit in <em>Incomplete</em> or <em>In Approval</em> — poll status before assuming it can be converted.</li>
        <li><strong>Distributions matter:</strong> each line needs a valid charge account (or the item/category default) or approval stalls.</li>
        <li><strong>Convert, don't re-create:</strong> the PO is usually generated <em>from</em> the PR so the request stays traceable.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/approvals">Approvals &amp; Workflow</a>{" "}
        for stuck <em>In Approval</em> requisitions.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Approved requisitions become <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/purchase-orders">Purchase Orders</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/procurement">Procurement hub</a>.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";

export const metadata = {
  title: "Sales Orders & Fulfillment",
};

export default function SalesOrdersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Sales Orders & Fulfillment"
        description="Order capture is the front of the Order-to-Cash cycle. A sales order records what a customer wants, scheduling turns that into a promise date, and fulfillment reserves inventory and moves the order to ship-ready. Understand this page and you understand how a sale becomes a shipment."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Order Management", href: "/fusion/order-management" }, { label: "Sales Orders & Fulfillment" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/order-management">Order Management hub</a> and the{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/inventory/onhand">Inventory on-hand</a> page.
      </Callout>

      <H2>Functional view</H2>
      <P>
        A <strong>sales order</strong> has a header (customer, request date, destination) and{" "}
        <strong>lines</strong> (item, quantity, price). <strong>Scheduling</strong> checks
        availability and sets a <em>promise date</em>. <strong>Fulfillment</strong> reserves the
        item and prepares it for shipping. Status flows from <em>Booked</em> through{" "}
        <em>Fulfilled</em> to <em>Shipped</em> (in Shipping).
      </P>
      <Diagram title="Order status journey" className="mb-8">
        <DiagramNode tone="neutral" title="Booked" subtitle="order captured & validated" />
        <Arrow label="schedule" />
        <DiagramNode tone="warning" title="In Fulfillment" subtitle="reserved · picked · packed" />
        <Arrow label="ship" />
        <DiagramNode tone="success" title="Shipped" subtitle="delivery leaves · billing triggered" />
      </Diagram>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">salesOrders / orderHeaders</K>, "Create/read sales orders (header and lines)"],
          [<K key="r2">salesOrderLines</K>, "Create/read order lines with quantities and prices"],
          [<K key="r3">onHandQuantities / reservations</K>, "Check availability and reserve during fulfillment"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Sales Order Import</K>, "Bulk-load sales orders from external/CRM systems", "Customer, item, inventory org, order type"],
        ]}
      />
      <H3>Working example — create a sales order via REST</H3>
      <CodeBlock
        language="bash"
        filename="POST /salesOrders"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/scmRestApi/resources/latest/salesOrders" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version" \\
  -X POST \\
  -d '{
    "OrderNumber": "SO-2026-001",
    "SoldToCustomerId": 987654,
    "OrderDate": "2026-09-01",
    "Lines": [
      {
        "ItemId": 300100000000555,
        "RequestedQuantity": 5,
        "SoldToContactId": null
      }
    ]
  }'`}
      />

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Order is created (UI, REST, or import)", <span key="t1c"><K key="t1">OE_ORDER_HEADERS</K>, <K key="t2">OE_ORDER_LINES</K></span>],
          ["2", "Scheduling sets the promise date from availability", <K key="t3">OE scheduling tables</K>],
          ["3", "Availability is checked on-hand", <K key="t4">MTL_ON_HAND_QUANTITIES_OIF</K>],
          ["4", "Fulfillment reserves the quantity", <K key="t5">reservations</K>],
          ["5", "Lines move to ship-ready for Shipping", <K key="t6">OE order line status</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="oe_orders.sql"
        code={`SELECT o.order_number, o.order_status, o.order_date,
       l.line_number, l.ordered_qty, l.shipped_qty,
       i.item_number
FROM   oe_order_headers_all o
JOIN   oe_order_lines_all l ON l.header_id = o.header_id
JOIN   egp_system_items_b  i ON i.inventory_item_id = l.inventory_item_id
WHERE  o.order_date >= SYSDATE - 30
ORDER  BY o.order_date DESC;`}
      />

      <H2>Worked example — a 5-unit order</H2>
      <WorkedExample
        title="Worked example: 5 ergonomic chairs"
        intro={<>A customer orders <strong>5 chairs</strong>; availability supports it.</>}
        steps={[
          {
            label: "1 · Order",
            body: <>SO booked with 1 line, qty 5, at the list price.</>,
          },
          {
            label: "2 · Schedule",
            body: <>Available stock (on-hand − reserved) ≥ 5 → promise date set.</>,
          },
          {
            label: "3 · Fulfill",
            body: <>Reservation of 5 created; order moves to ship-ready.</>,
          },
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Validate up front:</strong> order lines reject on unknown customer/item or closed org.</li>
        <li><strong>Poll, don't assume:</strong> a booked order isn't shipped until fulfillment finishes.</li>
        <li><strong>Availability drives promise:</strong> watch on-hand minus reservations when promising dates.</li>
        <li><strong>Ship = bill:</strong> the AR invoice follows ship confirmation, in Receivables.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Ship-ready orders move to <a className="font-semibold text-accent hover:underline" href="/fusion/order-management/shipping">Shipping &amp; Logistics</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/order-management">Order Management hub</a>.</li>
      </UL>
    </>
  );
}
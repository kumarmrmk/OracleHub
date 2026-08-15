import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";

export const metadata = {
  title: "Shipping & Logistics (WSH)",
};

export default function ShippingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Shipping & Logistics (WSH)"
        description="The delivery engine that turns a ship-ready order into a shipped one. Shipping (WSH) groups fulfilled lines into deliveries, plans them into trips, packs and ships them — and the ship confirmation consumes inventory and triggers the AR invoice."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Order Management", href: "/fusion/order-management" }, { label: "Shipping & Logistics (WSH)" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/order-management/sales-orders">Sales Orders &amp; Fulfillment</a> — shipping starts from ship-ready lines.
      </Callout>

      <H2>Functional view</H2>
      <P>
        Shipping takes <strong>fulfilled order lines</strong> and ships them. Key objects: a{" "}
        <strong>delivery</strong> groups lines going to the same destination, a <strong>trip</strong>{" "}
        plans routes, <strong>packing</strong> handles containers, and <strong>ship
        confirmation</strong> records that goods have left. On confirmation, inventory on-hand
        decreases and billing is triggered.
      </P>
      <Diagram title="Shipping flow" className="mb-8">
        <DiagramNode tone="neutral" title="Fulfilled lines" subtitle="ship-ready from OM" />
        <Arrow />
        <DiagramNode tone="warning" title="Delivery & trip" subtitle="group · plan carrier/route" />
        <Arrow />
        <DiagramNode tone="warning" title="Pack & ship" subtitle="containers · confirm" />
        <Arrow />
        <DiagramNode tone="success" title="Shipped" subtitle="on-hand drops · AR invoice" />
      </Diagram>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">shipments / deliveries</K>, "Create/read deliveries from fulfilled lines"],
          [<K key="r2">onHandQuantities</K>, "Confirm availability of what's being shipped"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Shipment Import</K>, "Bulk-load delivery/shipment data from external TMS", "Fulfilled order lines, carriers"],
        ]}
      />

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Fulfilled lines are grouped into a delivery", <K key="t1">WSH_DELIVERY_*</K>],
          ["2", "A trip plans carriers and routes", <K key="t2">trip / route tables</K>],
          ["3", "Lines are packed", <K key="t3">packing / container tables</K>],
          ["4", "Ship confirmation records the movement", <K key="t4">MTL_TRANSACTIONS (ship issue)</K>],
          ["5", "On-hand decreases and billing triggers", <span key="t5c"><K key="t5">on-hand</K> + <K key="t6">RA_CUSTOMER_TRX_ALL</K></span>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="wsh_deliveries.sql"
        code={`SELECT d.delivery_id, d.name AS delivery_name,
       d.status_date, d.shipment_priority_code,
       dl.quantity, i.item_number
FROM   wsh_delivery_details d
JOIN   wsh_deliveries dl ON dl.delivery_id = d.delivery_id
JOIN   egp_system_items_b i ON i.inventory_item_id = d.inventory_item_id
WHERE  d.status_date >= SYSDATE - 30
ORDER  BY d.status_date DESC;`}
      />

      <H2>Worked example — shipping 5 chairs</H2>
      <WorkedExample
        title="Worked example: 5 chairs depart"
        intro={<>The 5 ship-ready chairs are picked and packed into a delivery.</>}
        steps={[
          {
            label: "1 · Delivery",
            body: <>The line joins delivery DL-101, carrier FedEx.</>,
          },
          {
            label: "2 · Pack & ship",
            body: <>The delivery is packed and ship-confirmed.</>,
          },
          {
            label: "3 · Impact",
            body: <>On-hand drops by 5; the AR invoice is triggered for billing (O2C).</>,
          },
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Ship = consume:</strong> ship confirmation creates the inventory transaction that reduces on-hand.</li>
        <li><strong>Billing waits on ship:</strong> the AR invoice arrives after ship confirmation, not order booking.</li>
        <li><strong>Carriers matter:</strong> trip/carrier setup drives cost and tracking visibility.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Shipped orders become <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/autoinvoice">AR invoices</a> via Order-to-Cash.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/order-management">Order Management hub</a>.</li>
      </UL>
    </>
  );
}
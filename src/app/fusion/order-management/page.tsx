import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import LearningPath from "@/components/ui/LearningPath";

export const metadata = {
  title: "Order Management",
};

const topics = [
  {
    href: "/fusion/order-management/sales-orders",
    title: "Sales Orders & Fulfillment",
    desc: "Order capture, lines, scheduling, fulfillment, and the status journey to ship.",
    tone: "border-t-sky-500/60",
  },
  {
    href: "/fusion/order-management/shipping",
    title: "Shipping & Logistics (WSH)",
    desc: "Deliveries, packing, carrier management, and how shipped goods leave inventory.",
    tone: "border-t-emerald-500/60",
  },
];

export default function OrderManagementPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Order Management"
        description="How a customer order becomes a shipment. Order Management captures sales orders, schedules and fulfills them against available inventory, and hands the fulfilled lines to Shipping — the operational front half of the Order-to-Cash cycle that ends with an AR invoice."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Order Management" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Prerequisites">
        Read the{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/inventory">Inventory hub</a>{" "}
        (on-hand is what gets shipped) and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/o2c">Order-to-Cash</a>{" "}
        (where OM hands off to Receivables).
      </Callout>

      <H2>The business story</H2>
      <P>
        A customer orders — Order Management (OM) records it, checks inventory, schedules a
        fulfillment date, and the order flows toward shipping. Inventory is consumed, and the ship
        confirmation triggers the AR invoice that ends the Order-to-Cash cycle in Receivables.
      </P>
      <Diagram title="The order-to-ship flow" className="mb-8">
        <DiagramNode tone="neutral" icon="🛒" title="Sales Order" subtitle="captured & validated" />
        <Arrow />
        <DiagramNode tone="warning" icon="📊" title="Scheduling" subtitle="promise date · availability" />
        <Arrow />
        <DiagramNode tone="fusion" icon="📦" title="Fulfillment" subtitle="reserve · pick · pack" />
        <Arrow />
        <DiagramNode tone="success" icon="🚚" title="Ship" subtitle="delivery leaves · on-hand drops" />
      </Diagram>
      <Callout type="info">
        The thing consultants remember: OM is where <strong>inventory quantity</strong> becomes{" "}
        <strong>customer service</strong>. A good order-prompting setup keeps bookings flowing;
        a good fulfillment setup ships them fast.
      </Callout>

      <H2>Learning path — read in this order</H2>
      <LearningPath
        steps={[
          {
            href: "/fusion/order-management/sales-orders",
            title: "Sales Orders & Fulfillment",
            level: "Module",
            outcome: "Order capture, validity, scheduling, and the path from booked to ship ready.",
          },
          {
            href: "/fusion/order-management/shipping",
            title: "Shipping & Logistics (WSH)",
            level: "Advanced",
            outcome: "Deliveries, packing, carriers, and how shipping consumes inventory.",
          },
        ]}
      />

      <H2>The processes</H2>
      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className={`group rounded-2xl border border-[var(--edge)] border-t-2 ${t.tone} bg-[var(--surface)] p-5 transition-colors hover:bg-[var(--surface-2)]`}
          >
            <h3 className="mb-1 font-bold text-ink group-hover:text-accent">{t.title}</h3>
            <p className="text-sm leading-6 text-muted">{t.desc}</p>
          </a>
        ))}
      </div>

      <H2>Functional ↔ technical reference</H2>
      <DataTable
        headers={["Business object", "Module", "REST resource", "FBDI template"]}
        rows={[
          ["Sales order", "Order Management", <K key="r1">salesOrders / orderHeaders</K>, "Sales Order Import"],
          ["Order line", "Order Management", <K key="r2">salesOrderLines</K>, "Same import"],
          ["Delivery", "Shipping", <K key="r3">shipments / deliveries</K>, "Shipment Import"],
        ]}
      />
      <Callout type="warning">
        OM/Shipping REST resources live under the <K>scmRestApi</K> base and names vary by release —
        confirm against your instance's REST service catalog.
      </Callout>

      <H2>Configuration</H2>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Order types", "Define order behavior (return, back-to-back, etc.)", "Order Management → Order Types"],
          ["Ordering rules / scheduling", "How lines get promise dates and availability", "Order Orchestration setup"],
          ["Inventory organization", "Which org ships and which inventory is checked", "Enterprise Structures → Organizations"],
          ["Carriers & shipping networks", "How freight is priced and moved", "Shipping & Logistics setup"],
        ]}
      />

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "A sales order is created with lines", <span key="t1c"><K key="t1">OE_ORDER_HEADERS</K>, <K key="t2">OE_ORDER_LINES</K></span>],
          ["2", "Scheduling checks availability and sets promise dates", <K key="t3">OE order scheduling tables</K>],
          ["3", "Fulfillment reserves inventory and picks/packs", <K key="t4">reservations / pick lines</K>],
          ["4", "Shipping creates a delivery and ships it", <span key="t5c"><K key="t5">WSH_DELIVERY_*</K>, <K key="t6">MTL_TRANSACTIONS</K></span>],
          ["5", "Ship confirmation triggers the AR invoice (O2C)", <K key="t7">RA_CUSTOMER_TRX_ALL</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Customer & item first:</strong> order creation validates against customer and item master.</li>
        <li><strong>Scheduling vs shipping:</strong> a booked order isn't shipped until fulfillment completes — poll status.</li>
        <li><strong>Inventory is the constraint:</strong> availability (on-hand − reserved) decides promise dates.</li>
        <li><strong>Ship triggers billing:</strong> the AR invoice comes after ship confirmation, not order entry.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Start with <a className="font-semibold text-accent hover:underline" href="/fusion/order-management/sales-orders">Sales Orders &amp; Fulfillment</a>, then{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/order-management/shipping">Shipping &amp; Logistics</a>.</li>
        <li>See the billing aftermath in <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/o2c">Order-to-Cash</a>.</li>
      </UL>
    </>
  );
}
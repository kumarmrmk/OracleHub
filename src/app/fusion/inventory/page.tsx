import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import LearningPath from "@/components/ui/LearningPath";

export const metadata = {
  title: "Inventory",
};

const topics = [
  {
    href: "/fusion/inventory/items",
    title: "Items & Item Master",
    desc: "The item master (EGP_SYSTEM_ITEMS_B), attributes, templates, and item organizations.",
    tone: "border-t-sky-500/60",
  },
  {
    href: "/fusion/inventory/onhand",
    title: "On-hand, Transfers & Reservations",
    desc: "Where stock lives (on-hand), how it moves (transfers), and how it's set aside (reservations).",
    tone: "border-t-emerald-500/60",
  },
  {
    href: "/fusion/inventory/counting",
    title: "Cycle Counting & Adjustments",
    desc: "Reconciling the book stock to what's physically there and posting the difference.",
    tone: "border-t-amber-500/60",
  },
];

export default function InventoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Inventory"
        description="How the goods a company buys and makes are stored, tracked, and moved. Inventory holds the on-hand picture behind every purchase, sale, and transfer — the quantifiable bridge between the money you spend (Procurement/Payables) and the revenue you earn (Order-to-Cash)."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Inventory" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Prerequisites">
        Read the{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/procurement">Procurement hub</a>{" "}
        (receiving puts goods <em>into</em> inventory) and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/o2c">Order-to-Cash</a>{" "}
        (shipping pulls goods <em>out</em> of it). Inventory sits between the two.
      </Callout>

      <H2>The business story</H2>
      <P>
        Buying is only half the story — the goods have to <strong>live somewhere</strong> until
        they're sold. Inventory answers four questions about every item:{" "}
        <em>what is it</em> (item master), <em>how much do we have</em> (on-hand), <em>where is it
        going</em> (transfers), and <em>is the count right</em> (counting and adjustments).
      </P>
      <Diagram title="Inventory lifecycle" className="mb-8">
        <DiagramNode tone="neutral" icon="📦" title="Receive" subtitle="goods in from Procurement" />
        <Arrow />
        <DiagramNode tone="fusion" icon="🏭" title="Store" subtitle="on-hand by org / subinventory" />
        <Arrow />
        <DiagramNode tone="neutral" icon="🚚" title="Move" subtitle="transfers · reservations" />
        <Arrow />
        <DiagramNode tone="success" icon="🧾" title="Ship / consume" subtitle="goods out to customers / production" />
      </Diagram>
      <Callout type="info">
        Everything in inventory feeds <strong>cost</strong>: the on-hand quantity × the item cost is a
        balance-sheet value that eventually flows into the GL. That's why inventory transactions
        aren't just operational — they create accounting entries.
      </Callout>

      <H2>Learning path — read in this order</H2>
      <LearningPath
        steps={[
          {
            href: "/fusion/inventory/items",
            title: "Items & Item Master",
            level: "Foundation",
            outcome: "What an item is, what attributes it carries, and where it can be stored.",
          },
          {
            href: "/fusion/inventory/onhand",
            title: "On-hand, Transfers & Reservations",
            level: "Module",
            outcome: "How quantity lives, moves, and gets set aside across the organization.",
          },
          {
            href: "/fusion/inventory/counting",
            title: "Cycle Counting & Adjustments",
            level: "Advanced",
            outcome: "How physical counts reconcile to on-hand and how variances post.",
          },
        ]}
      />

      <H2>The processes</H2>
      <div className="grid gap-4 md:grid-cols-3">
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
          ["Item", "Inventory / PIM", <K key="r1">items</K>, "Item Import (Load Items)"],
          ["On-hand quantity", "Inventory", <K key="r2">onHandQuantities</K>, "On-Hand Quantity Import"],
          ["Inventory transfer", "Inventory", <K key="r3">inventoryTransfers</K>, "—"],
          ["Reservation", "Inventory", <K key="r4">reservations</K>, "—"],
          ["Cycle count / adjustment", "Inventory", <K key="r5">cycleCountHeaders / inventoryAdjustments</K>, "Approved Adjustments Import"],
        ]}
      />
      <Callout type="warning">
        Inventory REST resources live under the <K>scmRestApi</K> base and names vary by release —
        confirm against your instance's REST service catalog.
      </Callout>

      <H2>Configuration</H2>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Inventory organization", "The org that owns stock (item org + subinventories)", "Enterprise Structures → Organizations"],
          ["Item master / templates", "Default attributes for new items", "Product Information Management"],
          ["Subinventories & locators", "Where within an org items are stored", "Inventory → Subinventories"],
          ["Cost organization & method", "Which cost you value on-hand with", "Cost Management setup"],
          ["Transact types & reasons", "What each movement means and why", "Inventory → Transactions"],
        ]}
      />

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Item is defined with attributes", <span key="t1c"><K key="t1">EGP_SYSTEM_ITEMS_B</K></span>],
          ["2", "Receiving adds quantity (on-hand)", <K key="t2">MTL_TRANSACTIONS / on-hand</K>],
          ["3", "Transfers move quantity between orgs/subinventories", <K key="t3">MTL_TRANSACTIONS</K>],
          ["4", "Reservations set aside available quantity", <K key="t4">reservation tables</K>],
          ["5", "Shipping/receiving and adjustments change on-hand", <K key="t5">MTL_TRANSACTIONS + history</K>],
          ["6", "Period cost/accounting values the movements", <K key="t6">CST_* / SLA entries</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Item before quantity:</strong> you can't post an on-hand or transfer for an item that doesn't exist yet — load items first.</li>
        <li><strong>Org matters:</strong> every quantity and transaction belongs to an inventory organization; pass the right one.</li>
        <li><strong>Transactions are audited:</strong> inventory movements use reason codes and create cost/GL entries — treat them as accounting data.</li>
        <li><strong>Counting is a reconciliation:</strong> cycle counting exists to keep on-hand true; expect adjustments after a count.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management">Cash Management</a>{" "}
        for related cash flows, and watch this space for a dedicated Inventory troubleshooting page.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Start with <a className="font-semibold text-accent hover:underline" href="/fusion/inventory/items">Items</a>, then{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/inventory/onhand">On-hand &amp; Transfers</a>, then{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/inventory/counting">Cycle Counting</a>.</li>
        <li>Inventory connects to <a className="font-semibold text-accent hover:underline" href="/fusion/order-management">Order Management</a> (ship out) and{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/procurement">Procurement</a> (receive in).</li>
      </UL>
    </>
  );
}
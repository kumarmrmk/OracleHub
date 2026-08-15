import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";

export const metadata = {
  title: "On-hand, Transfers & Reservations",
};

export default function InventoryOnHandPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="On-hand, Transfers & Reservations"
        description="Where stock lives, how it moves, and how it gets set aside. On-hand is the running quantity per item per organization; transfers move it between orgs and subinventories; reservations commit available quantity to a sales order or project. This is the heart of inventory operations."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Inventory", href: "/fusion/inventory" }, { label: "On-hand & Transfers" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/inventory/items">Items &amp; Item Master</a> — on-hand only exists for defined, active items.
      </Callout>

      <H2>Functional view</H2>
      <P>
        <strong>On-hand</strong> is the current quantity an item has in an organization (split by
        subinventory and locator). <strong>Available</strong> subtracts reservations — committed
        quantity — so availability is what a sale can actually promise. <strong>Transfers</strong>{" "}
        move quantity between orgs/subinventories; <strong>reservations</strong> set aside available
        stock for an order or project.
      </P>
      <Diagram title="On-hand to available" className="mb-8">
        <DiagramNode tone="fusion" title="On-hand" subtitle="what physically exists" />
        <Arrow label="− reservations" />
        <DiagramNode tone="warning" title="Reserved" subtitle="committed to orders/projects" />
        <Arrow label="=" />
        <DiagramNode tone="success" title="Available" subtitle="what you can promise" />
      </Diagram>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">onHandQuantities</K>, "GET — read on-hand by item/organization"],
          [<K key="r2">inventoryTransfers</K>, "Create transfers between orgs/subinventories"],
          [<K key="r3">reservations</K>, "Create/read reservations against on-hand"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">On-Hand Quantity Import</K>, "Bulk-load opening on-hand balances", "Items and inventory organizations"],
        ]}
      />

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "An on-hand transaction moves quantity (receipt, transfer, adjustment)", <K key="t1">MTL_TRANSACTIONS</K>],
          ["2", "On-hand is maintained per item/org/subinventory", <span key="t2c"><K key="t2">MTL_ON_HAND_QUANTITIES_OIF</K></span>],
          ["3", "A reservation commits available quantity to an order", <K key="t3">reservation tables</K>],
          ["4", "Shipping consumes quantity — on-hand decreases", <K key="t4">MTL_TRANSACTIONS</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="mtl_on_hand.sql"
        code={`SELECT i.item_number, o.inventory_org_id, o.subinventory_code,
       o.quantity_on_hand, o.quantity_reserved,
       o.quantity_on_hand - o.quantity_reserved AS available_qty
FROM   mtl_on_hand_quantities_oif o
JOIN   egp_system_items_b i ON i.inventory_item_id = o.inventory_item_id
WHERE  i.item_number = :item_number;`}
      />

      <H2>Worked example — 100 chairs, 30 reserved</H2>
      <WorkedExample
        title="Worked example: on-hand vs available"
        intro={<>The warehouse has <strong>100</strong> ergonomic chairs on hand.</>}
        steps={[
          {
            label: "1 · On-hand",
            body: <>100 in the US inventory org, subinventory STOCK.</>,
          },
          {
            label: "2 · Reservations",
            body: <>A sales order reserves 30 → available = <strong>70</strong>.</>,
          },
          {
            label: "3 · The transfer",
            body: <>A transfer of 10 to another subinventory moves on-hand but not the total org quantity.</>,
          },
        ]}
        journal={[{ account: "Inventory asset (01-1310-100)", debit: "$10,000" }]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Availability = on-hand − reserved:</strong> base order promising on this, not raw on-hand.</li>
        <li><strong>Organization scopes everything:</strong> quantity is per inventory org and subinventory.</li>
        <li><strong>Transfers are audited:</strong> they're inventory transactions with cost/GL impact — use reason codes.</li>
        <li><strong>Reservation types matter:</strong> hard (firm) vs soft (soft-reserved) reservations behave differently.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Reconcile the count in <a className="font-semibold text-accent hover:underline" href="/fusion/inventory/counting">Cycle Counting &amp; Adjustments</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/inventory">Inventory hub</a>.</li>
      </UL>
    </>
  );
}
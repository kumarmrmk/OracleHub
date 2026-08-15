import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";

export const metadata = {
  title: "Items & Item Master",
};

export default function InventoryItemsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Items & Item Master"
        description="What an item is before it has any quantity. The item master defines every buyable and sellable thing — its attributes, how it's stocked or accounted for, and which organizations it's valid in. No on-hand, transfer, order, or receipt can exist without the item record first."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Inventory", href: "/fusion/inventory" }, { label: "Items & Item Master" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/inventory">Inventory hub</a> first. Items are the master data everything else references.
      </Callout>

      <H2>Functional view</H2>
      <P>
        An <strong>item</strong> is a distinct good or service. The <strong>item master</strong> is
        the shared catalog — <K>EGP_SYSTEM_ITEMS_B</K> in the data model — holding attributes like
        name, unit of measure, and whether it is stocked, purchased, or manufactured. Items are
        organized by <strong>item organizations</strong> (where they're usable) and inherit defaults
        from <strong>item templates</strong> based on <strong>item classes</strong>.
      </P>
      <DataTable
        headers={["Concept", "What it is (functional)"]}
        rows={[
          ["Item", "A distinct good/service with identifier, description, and unit of measure"],
          ["Item organization", "An organization (or set) where the item is defined/usable"],
          ["Item class", "Categories that group items and drive templates (e.g. 'Purchased Item', 'Finished Good')"],
          ["Item template", "Default attribute values applied at creation"],
          ["Item attributes", "Flags controlling behavior: stocked, purchasable, sellable, serialized, lot-controlled"],
          ["Item status", "Draft, Active, or Inactive — only Active items are usable in transactions"],
        ]}
      />

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">items</K>, "Create/read items (PIM REST resource) — the primary create path"],
          [<K key="r2">itemOrganizations / itemClasses</K>, "GET — read inherited defaults for validation"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Item Import</K>, "Bulk-load item master from a legacy/ERP system", "Item class, template, and organization"],
        ]}
      />

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Item is created (UI, REST, or Item Import FBDI)", <K key="t1">EGP_SYSTEM_ITEMS_B</K>],
          ["2", "Item is assigned to an organization", <K key="t2">item org assignment tables</K>],
          ["3", "Status is set to Active", <K key="t3">EGP_SYSTEM_ITEMS_B (status)</K>],
          ["4", "The item is now usable in transactions", <K key="t4">on-hand / order / receipt references</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="egp_system_items.sql"
        code={`-- Items in an organization, filtered to stocked purchasing items
SELECT i.inventory_item_id, i.item_number, i.item_description,
       i.inventory_item_status_code,
       NVL(org.stock_on_hand_qty, 0) AS on_hand_qty
FROM   egp_system_items_b i
LEFT JOIN (
  SELECT inventory_item_id, SUM(quantity) AS stock_on_hand_qty
  FROM   mtl_on_hand_quantities_oif
  GROUP BY inventory_item_id
) org ON org.inventory_item_id = i.inventory_item_id
WHERE  i.inventory_item_status_code = 'Active'
ORDER  BY i.item_number;`}
      />

      <H2>Worked example — creating a new stock item</H2>
      <WorkedExample
        title="Worked example: item 'CHAIR-ERG'"
        intro={<>A new ergonomic chair is defined before any quantity can exist for it.</>}
        steps={[
          {
            label: "1 · Define",
            body: <><K>CHAIR-ERG</K>, description, UOM = EA, class = <em>Purchased Item</em>.</>,
          },
          {
            label: "2 · Assign",
            body: <>Valid in the US inventory organization; attributes: stocked, purchasable, sellable.</>,
          },
          {
            label: "3 · Activate",
            body: <>Status → Active. On-hand starts at zero until receipts post.</>,
          },
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Load items first, always:</strong> receipts, transfers, orders all validate against the item master.</li>
        <li><strong>Organization is required:</strong> an item must be assigned to the org you transact in.</li>
        <li><strong>Status gates transactions:</strong> Draft/Inactive items reject receipt and on-hand transactions.</li>
        <li><strong>Attributes control behavior:</strong> a non-stocked item won't track on-hand; a lot-controlled one demands lot detail.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>With items defined, quantity can move — <a className="font-semibold text-accent hover:underline" href="/fusion/inventory/onhand">On-hand, Transfers &amp; Reservations</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/inventory">Inventory hub</a>.</li>
      </UL>
    </>
  );
}
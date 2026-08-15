import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";

export const metadata = {
  title: "Cycle Counting & Adjustments",
};

export default function InventoryCountingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Cycle Counting & Adjustments"
        description="Keeping the book quantity true to the physical quantity. Cycle counting schedules small, frequent counts of a subset of items; adjustments post the difference between counted and on-hand. This is the reconciliation that keeps inventory (and its GL value) accurate."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Inventory", href: "/fusion/inventory" }, { label: "Cycle Counting & Adjustments" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/inventory/onhand">On-hand &amp; Transfers</a> — a count corrects on-hand.
      </Callout>

      <H2>Functional view</H2>
      <P>
        <strong>Cycle counting</strong> counts a rotating sample of items rather than a full
        physical inventory. Each <strong>count</strong> compares the counted quantity with on-hand;
        if they differ, an <strong>adjustment</strong> (approved) brings on-hand to the counted
        value. Adjustments are also used directly to correct stock — for example after a return or
        a write-off.
      </P>
      <Diagram title="Count to adjustment" className="mb-8">
        <DiagramNode tone="neutral" title="Schedule count" subtitle="rotate by class / location" />
        <Arrow />
        <DiagramNode tone="warning" title="Enter counted qty" subtitle="compare to on-hand" />
        <Arrow label="variance" />
        <DiagramNode tone="warning" title="Approve adjustment" subtitle="reasons + accounts" />
        <Arrow />
        <DiagramNode tone="success" title="On-hand updated" subtitle="+ cost / GL entry" />
      </Diagram>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">cycleCountHeaders / cycleCountEntries</K>, "Create/read cycle counts and their entered quantities"],
          [<K key="r2">inventoryAdjustments</K>, "Create approved adjustments that change on-hand"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Approved Adjustments Import</K>, "Bulk-post adjustments built elsewhere", "Items, inventory orgs, adjustment reasons"],
        ]}
      />

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "A cycle count is created for an item/location", <K key="t1">cycle count tables</K>],
          ["2", "Counted quantity is entered", <K key="t2">cycle count entry tables</K>],
          ["3", "Variance vs on-hand is computed", <K key="t3">MTL_ON_HAND_QUANTITIES_OIF (compare)</K>],
          ["4", "Approved adjustment posts the difference", <K key="t4">MTL_TRANSACTIONS + adjustment</K>],
          ["5", "Cost/GL entries value the adjustment", <K key="t5">CST_* / SLA</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="adjustments.sql"
        code={`SELECT t.transaction_id, t.transaction_type, t.transaction_quantity,
       t.transaction_date, t.reason_name, i.item_number
FROM   mtl_material_transactions t
JOIN   egp_system_items_b i ON i.inventory_item_id = t.inventory_item_id
WHERE  t.transaction_type IN ('Cycle Count Adjustment', 'Adjustment')
  AND  t.transaction_date >= SYSDATE - 30
ORDER  BY t.transaction_date DESC;`}
      />

      <H2>Worked example — a count variance</H2>
      <WorkedExample
        title="Worked example: book 100, counted 97"
        intro={<>Cycle count shows <strong>97</strong> chairs but on-hand says <strong>100</strong>.</>}
        steps={[
          {
            label: "1 · Count",
            body: <>Counted quantities entered for the item/location.</>,
          },
          {
            label: "2 · Variance",
            body: <>Variance = 100 − 97 = <strong>−3</strong> (shortage).</>,
          },
          {
            label: "3 · Adjust",
            body: <>Approved adjustment −3 updates on-hand to 97 and values the loss (cost + GL).</>,
          },
        ]}
        journal={[{ account: "Inventory adjustment loss (01-6900-500)", debit: "$450" }]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Approval gates the change:</strong> only approved adjustments alter on-hand.</li>
        <li><strong>Reasons & accounts:</strong> adjustments need a reason that maps accounts for the GL entry.</li>
        <li><strong>Rotate counts:</strong> cycle counting is designed to run continuously, not once a year.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Inventory value flows into <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">General Ledger</a> via cost.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/inventory">Inventory hub</a>.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";

export const metadata = {
  title: "Landed Cost",
};

export default function LandedCostPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Landed Cost"
        description="Adding everything it costs to get goods onto your dock: freight, insurance, duties, and handling. Landed cost turns a supplier's invoice price into the item's true delivered cost — the number you revalue inventory and mark up from."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Cost Management", href: "/fusion/cost-management" }, { label: "Landed Cost" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/cost-management/costing-methods">Costing Methods</a> — landed cost is an addition on top of the base cost.
      </Callout>

      <H2>Functional view</H2>
      <P>
        A PO says $150 per chair, but the <em>real</em> cost includes freight, insurance, and duty.
        <strong>Landed cost</strong> attaches those charges to receipts, distributes them across the
        received lines, and rolls them into the item's cost. The result: inventory is valued at the
        delivered cost, not the invoice price.
      </P>
      <Diagram title="Invoice price → landed cost" className="mb-8">
        <DiagramNode tone="neutral" title="Base price" subtitle="supplier invoice amount" />
        <Arrow label="+ freight / insurance / duty" />
        <DiagramNode tone="warning" title="Landed cost charges" subtitle="assigned to receipt lines" />
        <Arrow label="distribute across lines" />
        <DiagramNode tone="success" title="True cost" subtitle="revalues on-hand · posts variance" />
      </Diagram>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">landedCostCharges</K>, "Create/read landed cost charges on receipts"],
          [<K key="r2">receipts / receivingTransactions</K>, "Associate charges to receipt lines"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Landed Cost Import</K>, "Bulk-load freight/invoice charges", "Receipts and / or supplier invoices to attach to"],
        ]}
      />

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Goods are received at the base price", <K key="t1">RCV_TRANSACTIONS</K>],
          ["2", "Landed cost charges (freight, duty, insurance) are added", <K key="t2">landed cost charge tables</K>],
          ["3", "Charges are distributed across the received lines", <K key="t3">distributed charge tables</K>],
          ["4", "Cost is updated to the landed value", <K key="t4">CST_ITEM_COSTS</K>],
          ["5", "On-hand revalues and GL posts", <K key="t5">SLA / GL</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="landed_cost.sql"
        code={`SELECT chg.charge_id, chg.charge_type, chg.charge_amount,
       chg.currency_code, chg.status,
       i.item_number
FROM   landed_cost_charges chg
LEFT JOIN landed_cost_distributions d ON d.charge_id = chg.charge_id
LEFT JOIN egp_system_items_b i        ON i.inventory_item_id = d.item_id
WHERE  chg.status = 'ACTIVE'
ORDER  BY chg.charge_type;`}
      />

      <H2>Worked example — freight on 10 chairs</H2>
      <WorkedExample
        title="Worked example: $150 each, $200 freight"
        intro={<>10 chairs at <strong>$150</strong> each, plus <strong>$200 freight</strong>.</>}
        steps={[
          {
            label: "1 · Base value",
            body: <>10 × $150 = <strong>$1,500</strong>.</>,
          },
          {
            label: "2 · Landed charges",
            body: <>+ $200 freight distributed over the 10 units = <strong>$20</strong> each.</>,
          },
          {
            label: "3 · True cost",
            body: <>Item cost revalues to <strong>$170</strong>; on-hand value and GL update to $1,700.</>,
          },
        ]}
        journal={[
          { account: "Inventory (01-1310-100)", debit: "$1,700" },
          { account: "Accrued liability (01-2200-100)", credit: "$1,500" },
          { account: "Freight-in (01-6900-610)", credit: "$200" },
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Changes arrive late:</strong> freight bills come after receipts — expect cost adjustments post-receipt.</li>
        <li><strong>Distribute correctly:</strong> charges must be spread across their receipt lines for the unit cost to be right.</li>
        <li><strong>Import is the tool:</strong> bulk charges come via the Landed Cost Import FBDI.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/cost-management">Cost Management hub</a>.</li>
        <li>Cost value flows into <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials</a>.</li>
      </UL>
    </>
  );
}
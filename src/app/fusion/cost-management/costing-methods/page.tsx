import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";

export const metadata = {
  title: "Costing Methods",
};

export default function CostingMethodsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Costing Methods"
        description="How an item's cost is determined in each organization: standard cost (a fixed planned amount) or actual cost (calculated from the transactions that happened). The choice defines every valuation, variance, and GL posting."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Cost Management", href: "/fusion/cost-management" }, { label: "Costing Methods" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/cost-management">Cost Management hub</a> first.
      </Callout>

      <H2>Functional view</H2>
      <P>
        <strong>Standard cost</strong> fixes an item at a planned amount; variances between standard
        and actual are recorded separately. <strong>Actual cost</strong> (FIFO, average, or
        specific) values each movement from the transactions themselves. Cost Management applies{" "}
        <strong>one method per cost organization</strong>, and costs are maintained via{" "}
        <strong>cost updates / rollover</strong>.
      </P>
      <Diagram title="Standard vs actual" className="mb-8">
        <DiagramNode tone="neutral" title="Standard cost" subtitle="planned amount · variance accounts" />
        <Arrow />
        <DiagramNode tone="fusion" title="Cost rollover" subtitle="recompute · revalue on-hand" />
        <Arrow />
        <DiagramNode tone="success" title="GL postings" subtitle="inventory · COGS · variance" />
      </Diagram>
      <DataTable
        headers={["Method", "How cost is derived", "When to use"]}
        rows={[
          ["Standard", "Fixed planned cost; variances tracked", "Stable catalog, periodic price updates"],
          ["Average (actual)", "Weighted actual cost from receipts", "Volatile prices, frequent purchases"],
          ["FIFO (actual)", "Issue at the oldest receipt cost", "Perishable/rotating stock"],
          ["Specific", "Item tracked at actual amounts", "Unique or high-value items"],
        ]}
      />

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">itemCosts</K>, "Read/update item costs"],
          [<K key="r2">costProfiles</K>, "Read the costing profile (method) per organization"],
          [<K key="r3">costRollover</K>, "Create/read cost rollover runs"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Item Costs Import</K>, "Bulk-load standard costs", "Item, cost organization, cost profile"],
        ]}
      />

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "A cost method (profile) is set for the organization", <K key="t1">cost profile tables</K>],
          ["2", "Item costs are created/updated", <K key="t2">CST_ITEM_COSTS</K>],
          ["3", "Inventory transactions are valued at the item cost", <K key="t3">cost transaction tables</K>],
          ["4", "Variances arise (standard vs actual)", <K key="t4">variance tables</K>],
          ["5", "Period cost finalization posts to the GL", <K key="t5">SLA / GL</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="cst_item_costs.sql"
        code={`SELECT c.organization_id, c.item_id, i.item_number,
       c.cost_type, c.item_cost, c.burden_cost, c.creation_date
FROM   cst_item_costs c
JOIN   egp_system_items_b i ON i.inventory_item_id = c.item_id
WHERE  c.organization_id = :organization_id
  AND  c.cost_type = 'Standard'
ORDER  BY i.item_number;`}
      />

      <H2>Worked example — standard cost variance</H2>
      <WorkedExample
        title="Worked example: a chair at standard cost"
        intro={<>An ergonomic chair has <strong>standard cost $150</strong>.</>}
        steps={[
          {
            label: "1 · Standard set",
            body: <>Item cost = <strong>$150</strong>, cost type Standard.</>,
          },
          {
            label: "2 · Receipt at actual price",
            body: <>The PO is received at <strong>$160</strong> — a <strong>$10</strong> purchase-price variance per unit.</>,
          },
          {
            label: "3 · Revalue on-hand",
            body: <>If cost rolls up, on-hand value recomputes; variances post to the variance account.</>,
          },
        ]}
        journal={[
          { account: "Inventory (01-1310-100)", debit: "$150" },
          { account: "Purchase price variance (01-6900-600)", credit: "$10" },
          { account: "Accrued liability (01-2200-100)", credit: "$160" },
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Method is the foundation:</strong> pick standard or actual per org before transactions run.</li>
        <li><strong>Standard needs maintenance:</strong> run cost updates/rollover when prices change.</li>
        <li><strong>Variances are important:</strong> purchase-price variance is how standard costing surfaces cost drift.</li>
        <li><strong>Value before post:</strong> costs must exist before movements can create GL entries.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Landed charges complicate cost — see <a className="font-semibold text-accent hover:underline" href="/fusion/cost-management/landed-cost">Landed Cost</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/cost-management">Cost Management hub</a>.</li>
      </UL>
    </>
  );
}
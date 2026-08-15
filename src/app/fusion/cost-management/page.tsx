import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import LearningPath from "@/components/ui/LearningPath";

export const metadata = {
  title: "Cost Management",
};

const topics = [
  {
    href: "/fusion/cost-management/costing-methods",
    title: "Costing Methods",
    desc: "Standard vs actual cost, per-organization, and how item costs are maintained.",
    tone: "border-t-sky-500/60",
  },
  {
    href: "/fusion/cost-management/landed-cost",
    title: "Landed Cost",
    desc: "Adding freight, insurance, and duties into the item's true inventory value.",
    tone: "border-t-emerald-500/60",
  },
];

export default function CostManagementPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Cost Management"
        description="How inventory gets a monetary value. At period close (or at each transaction), Cost Management turns on-hand quantities into a balance-sheet value and expense — and posts that value into the GL. Understand cost and you understand where inventory, purchasing, and the ledger meet."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Cost Management" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/inventory">Inventory hub</a>{" "}
        (cost values on-hand) and the{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>{" "}
        page (how inventory cost posts to the GL).
      </Callout>

      <H2>The business story</H2>
      <P>
        Pick any item with 100 units on hand — what is it worth? <strong>Cost Management</strong>{" "}
        answers that: it defines how an item's cost is computed (<em>costing method</em>), maintains
        those costs over time, adds <strong>landed cost</strong> (freight, insurance, duty), and
        posts the movements to the GL so inventory appears on the balance sheet.
      </P>
      <Diagram title="From quantity to value" className="mb-8">
        <DiagramNode tone="neutral" icon="📦" title="On-hand quantity" subtitle="units by item / org" />
        <Arrow label="× item cost" />
        <DiagramNode tone="fusion" icon="💰" title="Inventory value" subtitle="on-hand × cost" />
        <Arrow label="post" />
        <DiagramNode tone="success" icon="🏛️" title="GL accounts" subtitle="inventory · cost of sales · variance" />
      </Diagram>
      <Callout type="info">
        The sentence to memorize: <strong>inventory value = on-hand quantity × item cost</strong>,
        and every change to either side creates a GL entry. That's why cost and inventory are taught
        together.
      </Callout>

      <H2>Learning path — read in this order</H2>
      <LearningPath
        steps={[
          {
            href: "/fusion/cost-management/costing-methods",
            title: "Costing Methods",
            level: "Module",
            outcome: "Standard vs actual cost, how item costs are set and maintained, and the variance accounts.",
          },
          {
            href: "/fusion/cost-management/landed-cost",
            title: "Landed Cost",
            level: "Advanced",
            outcome: "How freight, insurance, and duties flow into the true cost of purchased items.",
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
          ["Item cost", "Cost Management", <K key="r1">itemCosts</K>, "Item Costs Import"],
          ["Cost profile / method", "Cost Management", <K key="r2">costProfiles</K>, "—"],
          ["Landed cost charge", "Cost Management", <K key="r3">landedCostCharges</K>, "Landed Cost Import"],
          ["Cost update / rollover", "Cost Management", <K key="r4">costRollover</K>, "—"],
        ]}
      />
      <Callout type="warning">
        Cost Management REST resources live under the <K>scmRestApi</K> base and names vary by
        release — confirm against your instance's REST service catalog.
      </Callout>

      <H2>Configuration</H2>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Cost organization", "The org whose inventory you value", "Cost Management → Organizations"],
          ["Cost profiles", "Define standard vs actual behavior", "Costing setup"],
          ["Cost book & accounts", "The GL accounts cost posts to (inventory, COGS, variance)", "Costing → Account Mapping"],
          ["Landed cost rules", "Which charges roll into item cost", "Costing → Landed Cost"],
        ]}
      />

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "An item cost is set/updated (standard) or computed (actual)", <K key="t1">CST_ITEM_COSTS</K>],
          ["2", "Transactions value inventory movements at the item cost", <K key="t2">CST_TRANSACTIONS / cost journal</K>],
          ["3", "Landed charges are added to the purchased cost", <K key="t3">landed cost tables</K>],
          ["4", "Variances (standard vs actual) are flagged", <K key="t4">variance tables</K>],
          ["5", "Period close posts cost to the GL", <K key="t5">SLA / GL journals</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Costing is a method first:</strong> pick standard vs actual per organization before transactions exist.</li>
        <li><strong>Cost before value:</strong> you need an item cost before movements can be valued.</li>
        <li><strong>Landed cost waits on invoices:</strong> freight/duties often arrive after the receipt — expect adjustments.</li>
        <li><strong>All roads lead to GL:</strong> cost posts inventory, COGS, and variance accounts to the ledger.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Start with <a className="font-semibold text-accent hover:underline" href="/fusion/cost-management/costing-methods">Costing Methods</a>, then{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/cost-management/landed-cost">Landed Cost</a>.</li>
        <li>Cost feeds the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials</a> ledgers.</li>
      </UL>
    </>
  );
}
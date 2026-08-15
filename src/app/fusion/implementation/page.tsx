import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "Implementation & Data Migration",
};

export default function ImplementationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Implementation & Data Migration"
        description="How a Fusion ERP project actually happens: the implementation lifecycle, Functional Setup Manager (FAS), configuration packages, and the data migration playbook — the load order that makes a go-live clean."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Implementation & Data Migration" }]}
        updated="February 2025"
      />

      <H2>The implementation lifecycle</H2>
      <Diagram title="Fusion implementation phases" className="mb-8">
        <DiagramNode tone="neutral" title="Plan" subtitle="scope, offerings, workstreams" />
        <Arrow />
        <DiagramNode tone="neutral" title="Configure" subtitle="FAS setup tasks per offering" />
        <Arrow />
        <DiagramNode tone="fusion" title="Extend" subtitle="flexfields, reports, integrations" />
        <Arrow />
        <DiagramNode tone="fusion" title="Load" subtitle="data migration (FBDI/REST)" />
        <Arrow />
        <DiagramNode tone="neutral" title="Test" subtitle="SIT + UAT, parallel run" />
        <Arrow />
        <DiagramNode tone="success" title="Go Live" subtitle="cutover, support" />
      </Diagram>

      <H2>Functional Setup Manager (FAS)</H2>
      <P>
        FAS is the implementation cockpit. It organizes the work into:
      </P>
      <DataTable
        headers={["Concept", "What it is"]}
        rows={[
          ["Offering", "A licensed product group (ERP, SCM, HCM, Financials…)"],
          ["Functional area", "A workstream within an offering (e.g. Payables, General Ledger)"],
          ["Setup task", "A single configuration step (define ledger, create BU, set up tax)"],
          ["Setup group", "Configuration packaged for one ledger/BU (assigned per org unit)"],
          ["Implementation project", "Your project: which tasks, who owns them, status tracking"],
          ["Configuration package", "Export/import a setup between instances (dev → test → prod)"],
          ["Checklist/status", "Assigned, In Progress, Completed per task owner"],
        ]}
      />

      <H2>Data migration — the playbook</H2>
      <P>
        Migration has five phases, and <strong>order</strong> is what separates a clean go-live from a
        mess.
      </P>
      <UL>
        <li><strong>Extract:</strong> pull legacy data (suppliers, customers, open invoices, balances, assets).</li>
        <li><strong>Map:</strong> map legacy codes to Fusion values (segments, BU, ledger, category).</li>
        <li><strong>Transform:</strong> reshape to the FBDI template / REST payload; build lookups for BU/ledger/tax.</li>
        <li><strong>Validate:</strong> run your mapping rules on a sample before the full load.</li>
        <li><strong>Load & reconcile:</strong> run FBDI, fix rejections, compare counts and totals to legacy sign-off numbers.</li>
      </UL>

      <H3>The load order</H3>
      <P>
        Never load transactions before the reference and master data they depend on:
      </P>
      <Diagram title="Data migration load order" className="mb-8">
        <DiagramNode tone="neutral" title="1 · Reference data" subtitle="flexfield values, calendar, tax codes" />
        <Arrow />
        <DiagramNode tone="neutral" title="2 · Enterprise structures" subtitle="ledgers, legal entities, BUs, data access sets" />
        <Arrow />
        <DiagramNode tone="neutral" title="3 · Accounting" subtitle="COA accounts, account combinations" />
        <Arrow />
        <DiagramNode tone="fusion" title="4 · Master data" subtitle="suppliers, customers, items, employees, assets" />
        <Arrow />
        <DiagramNode tone="fusion" title="5 · Open transactions" subtitle="AP invoices, AR invoices, POs, open expense reports" />
        <Arrow />
        <DiagramNode tone="fusion" title="6 · Balances" subtitle="GL opening balances per period" />
      </Diagram>
      <Callout type="warning">
        The three most common go-live disasters are all order problems: invoices loaded before
        suppliers, journals before the COA/accounts existed, and balances before periods were opened.
      </Callout>

      <H2>Choosing the load method</H2>
      <DataTable
        headers={["Method", "When to use it", "Examples"]}
        rows={[
          ["FBDI", "Bulk, scheduled, needs an audit trail + error file", "Suppliers, invoices, journals, customers"],
          ["REST API", "Real-time or small volume, when the caller needs the ID back", "Create supplier, create invoice, check status"],
          ["ADFdi", "Ad-hoc spreadsheet loads by a power user", "Flexfield values, small master data fixes"],
          ["Application UI", "One-off manual entry during testing", "Setup tasks, test transactions"],
        ]}
      />

      <H2>Testing & go-live</H2>
      <UL>
        <li><strong>SIT:</strong> integration flows against test data (order: FBDI → validate → status → reconcile).</li>
        <li><strong>UAT:</strong> business users validate functional setups with real scenarios.</li>
        <li><strong>Parallel run:</strong> run both systems for one period and reconcile the difference.</li>
        <li><strong>Cutover plan:</strong> freeze legacy → final extraction → load → reconcile → open periods → go live.</li>
        <li><strong>Post go-live:</strong> track rejected rows, watch period close, confirm approvals behave.</li>
      </UL>

      <H2>Integration notes</H2>
      <UL>
        <li>Reuse the same loader logic for <em>migration</em> and <em>ongoing integrations</em> — one
        code path, one set of fixes.</li>
        <li>Every FBDI load needs a <strong>reconciliation query</strong> (count + totals) — build it
        before go-live, not after.</li>
        <li>Keep a <strong>data dictionary</strong> of the Fusion tables/columns you load (the module
        pages here are that dictionary).</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>FBDI and ADFdi are the load engines — <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">FBDI &amp; ADFdi</a>.</li>
        <li>Jobs behind every load — <a className="font-semibold text-accent hover:underline" href="/fusion/scheduled-processes">Scheduled Processes (ESS)</a>.</li>
        <li>The structure you load into — <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a>.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";

export const metadata = {
  title: "Sourcing & Auctions",
};

export default function SourcingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Sourcing & Auctions"
        description="The competitive step before buying: RFQs and sourcing projects let you compare supplier bids, run reverse auctions, and award business — producing the approved supplier/terms that an agreement or purchase order then uses."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Procurement", href: "/fusion/procurement" }, { label: "Sourcing & Auctions" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/suppliers">Suppliers &amp; Agreements</a> — sourcing awards go to existing (or newly onboarded) suppliers.
      </Callout>

      <H2>Functional view</H2>
      <P>
        For major or recurring spend, buying happens competitively. <strong>Sourcing</strong> runs a{" "}
        <strong>sourcing project</strong>: define requirements, invite suppliers (RFQ / reverse
        auction), collect and compare bids, and <strong>award</strong> the business. The award can
        generate an agreement or purchase order directly, so what was negotiated becomes what is
        bought.
      </P>
      <Diagram title="Sourcing lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Requirements" subtitle="RFI / RFP / RFQ scope" />
        <Arrow />
        <DiagramNode tone="warning" title="Invite & bid" subtitle="suppliers respond · reverse auction" />
        <Arrow />
        <DiagramNode tone="warning" title="Evaluate & award" subtitle="compare · select winner" />
        <Arrow />
        <DiagramNode tone="success" title="Agreement / PO" subtitle="negotiated terms become the buy" />
      </Diagram>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">sourcingProjects</K>, "Create/read sourcing projects (RFQ etc.)"],
          [<K key="r2">negotiations / supplierResponses</K>, "Create/read negotiation lines and supplier bids"],
        ]}
      />
      <H3>FBDI / ESS</H3>
      <DataTable
        headers={["Template / job", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Sourcing FBDI / import</K>, "Bulk-load sourcing projects or RFQs", "Suppliers, sourcing settings"],
          [<K key="proc">erpProcesses</K>, "Submit sourcing-related jobs such as finalize/close negotiations (confirm on instance)"],
        ]}
      />
      <Callout type="warning">
        Sourcing REST resources and the exact import/job names vary by release — confirm against
        your instance's REST service catalog before building.
      </Callout>

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "A sourcing project is created with lines", <K key="t1">sourcing / negotiation tables</K>],
          ["2", "Suppliers are invited (RFQ) and respond", <K key="t2">supplier response tables</K>],
          ["3", "Auctions collect bids (reverse auction)", <K key="t3">auction bid tables</K>],
          ["4", "An award is made to the winner", <K key="t4">award tables</K>],
          ["5", "The award creates a PO/agreement", <K key="t5">PO_HEADERS_ALL</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="sourcing_projects.sql"
        code={`-- Sourcing projects (RFQs) and their status
SELECT p.project_id, p.project_name, p.project_number,
       p.project_type, p.status_code, p.creation_date
FROM   sourcing_negotiation_headers_all p
WHERE  p.creation_date >= SYSDATE - 60
ORDER  BY p.creation_date DESC;`}
      />

      <H2>Worked example — a reverse auction</H2>
      <WorkedExample
        title="Worked example: chairs, three bidders"
        intro={<>Three suppliers bid on <strong>10 chairs</strong>; a reverse auction drives the price down.</>}
        steps={[
          {
            label: "1 · Requirements",
            body: <>RFQ for 10 ergonomic chairs with delivery date.</>,
          },
          {
            label: "2 · Bids",
            body: <>Bids: $165, $155, $150. Winning (lowest): <strong>$150</strong>.</>,
          },
          {
            label: "3 · Award",
            body: <>Award → creates the purchase order at the winning price.</>,
          },
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Sourcing feeds buying:</strong> an award can directly generate the PO — wire the integration to carry the winning bid forward.</li>
        <li><strong>Supplier before award:</strong> invited suppliers must exist (or be onboarded) before bidding.</li>
        <li><strong>Auctions are timed:</strong> reverse auctions have open/close windows; handle bid timing in integrations.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Awards become <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/purchase-orders">Purchase Orders</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/procurement">Procurement hub</a>.</li>
      </UL>
    </>
  );
}
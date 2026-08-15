import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Oracle Analytics Cloud (OAC)",
};

export default function FusionOacPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud · Analytics"
        title="Oracle Analytics Cloud (OAC)"
        description="The modern cloud analytics service on OCI: data visualization, semantic models and classic dashboards, data flows, machine learning — and how OAC connects to Fusion Cloud via OAuth."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Analytics" }, { label: "OAC" }]}
        updated="2026"
      />

      <P>
        <strong>Oracle Analytics Cloud (OAC)</strong> is the standalone, cloud-native analytics
        platform on OCI. Where OTBI is locked to one Fusion instance, OAC is a real platform: it
        connects to Fusion, databases, files, and SaaS APIs; preps and blends data; builds governed
        semantic models; and adds data-visualization and machine-learning. Think of it as{" "}
        <em>the analytics layer for the whole enterprise</em>, Fusion being one of many sources.
      </P>

      <H2>The two consoles — know both</H2>
      <P>
        OAC actually hosts <strong>two</strong> authoring paradigms, and teams rarely mix them up
        because they served different generations:
      </P>
      <DataTable
        headers={["Paradigm", "Home", "Style", "When to use"]
        }
        rows={[
          ["Data Visualization (DV)", "The modern OAC home", "Drag-and-drop projects, canvases, auto insights, ML", "New analytics, storytelling, self-service"],
          ["Classic BI (Answers/Dashboards)", "The 'classic' home", "Analyses + dashboards, the OBIEE/OTBI style", "Bringing existing OTBI/OBIEE content forward"],
        ]}
      />
      <UL>
        <li>DV is where OAC's future is being built — it is the default for anything new.</li>
        <li>The classic console exists so OBIEE/OTBI-style content (analyses, dashboards, .rpd semantic models) still runs on the cloud platform.</li>
      </UL>

      <H2>Core OAC capabilities</H2>
      <DataTable
        headers={["Capability", "What it does", "Analogy from other tools"]
        }
        rows={[
          ["Data Visualization", "Canvas with charts/maps/tables, drag-to-analyze, narrative", "Like a governed Tableau/Power BI"],
          ["Data flows", "ETL-lite pipelines: connect → map → join → transform → refresh on schedule", "Like ODI/BIP data-model steps, visual"],
          ["Semantic models (.rpd upload)", "Load a governed business model from OBIEE/OTBI land", "OTBI subject areas, rehosted"],
          ["Machine learning", "Auto-Insights, trend/forecast, clustering, explain — built in", "'What drives this KPI?' analysis"],
          ["Smart View / Excel", "Excel bridge to OAC datasets", "Excel access to governed data"],
          ["Embed &amp; publish", "Public/URL, iFrame and API embedding", "Dashboards inside other apps"],
        ]}
      />

      <H2>Connecting OAC to Fusion</H2>
      <P>
        There is a direct, supported path from OAC to Fusion Cloud data using{" "}
        <strong>OAuth</strong> — the same confidential-client pattern seen in the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/rest">REST/OAuth</a>{" "}
        material:
      </P>
      <CodeBlock
        language="text"
        filename="The OAC ⇄ Fusion connection recipe"
        code={`1. In Fusion: create an OAuth client (Fusion Applications) with
     client_id + client_secret, granted access to the REST resources you want.
2. In OAC: add a "Fusion Cloud Applications" data source,
     choose OAuth as the connection type, paste the client credentials.
3. OAC pulls data updates on its refresh / data-flow schedule
     (credentials live in the OAC vault / wallet).
4. Publish to a dataset or project, then visualize or blend.`}
      />
      <UL>
        <li>This is a pull from OAC's side — OAC calls Fusion REST on your (schedule) — the inverse of Fusion pushing anywhere.</li>
        <li>Use it for cross-source blending (Fusion + warehouse + file) and for analytics that need OAC-specific capacity or ML.</li>
        <li>Vault the credentials; OAC stores the password in its secure wallet, not in scripts.</li>
      </UL>
      <Callout type="warning">
        You can also take Fusion data out via a <strong>data warehouse</strong> (copy to ADW/object
        storage through an OIC or ODI pipeline) and connect OAC to <em>that</em>. The choice is
        about volume and governance: REST pulls are easy but chatty; a warehouse copy is heavier to
        build and freshest-by-design. OTBI still remains the fastest route for in-instance questions.
      </Callout>

      <H2>OTBI → OAC migration</H2>
      <P>
        Because both speak the same BI dialect, existing OTBI content can move to OAC rather than
        being rebuilt:
      </P>
      <UL>
        <li>OTBI subject areas can be connected from OAC via the Fusion OAuth connection above, so the same logical model is queryable in the cloud console.</li>
        <li>Dashboards/analyses can be recreated in OAC classic or rebuilt in DV — plan the move as a governed re-platform, not a copy.</li>
        <li>OBIEE on-prem .rpd files can be uploaded to OAC as semantic models (see the{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/fusion/analytics/obiee">OBIEE page</a>{" "}
          for the migration path).</li>
      </UL>

      <H2>Security &amp; administration</H2>
      <DataTable
        headers={["Layer", "What governs it"]
        }
        rows={[
          ["OCI IAM", "Who can sign in to the OAC instance (federation via IDCS/OCI IAM)"],
          ["Roles", "BI content roles: BI Consumer ↔ BI Author/DV Content Author, service administrators"],
          ["Datasets & semantic model", "Row-level/column data security inside selections of the model"],
          ["Data-source credentials", "The OAC vault that stores Fusion/database passwords"],
        ]}
      />

      <H3>Where OAC sits next to Fusion</H3>
      <Diagram title="OAC as the enterprise analytics layer" className="mb-8">
        <DiagramNode tone="fusion" icon="📊" title="Fusion Cloud" subtitle="OTBI · REST (OAuth)" />
        <Arrow label="OAuth REST" />
        <DiagramNode tone="oic" icon="☁️" title="OAC on OCI" subtitle="DV · semantic models · data flows · ML" />
        <Arrow label="sources" />
        <DiagramNode tone="neutral" icon="🗄️" title="ADW · files · other SaaS" subtitle="warehouses, spreadsheets, APIs" />
      </Diagram>
    </>
  );
}
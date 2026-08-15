import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "OBIEE — On-Prem BI Enterprise Edition",
};

export default function FusionObieePage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud · Analytics"
        title="OBIEE — On-Prem BI Enterprise Edition"
        description="The on-prem classic: the .rpd repository and its three layers, BI Presentation Services and Answers, dashboards and the catalog, BI Apps, and the migration path from OBIEE to OAC."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Analytics" }, { label: "OBIEE" }]}
        updated="2026"
      />

      <P>
        <strong>OBIEE</strong> (Oracle Business Intelligence Enterprise Edition) is the on-prem BI
        platform that OTBI and OAC both descend from. Fusion OTBI is effectively OBIEE-style
        analytics embedded in the cloud, and OAC is its cloud re-birth — so reading OBIEE content
        teaches you the grandparents of everything else in this section. If you only work on modern
        Fusion, you still need to recognize its artifacts, because they keep turning up.
      </P>

      <H2>The architecture — where each piece lives</H2>
      <Diagram title="OBIEE 12c components" className="mb-8">
        <DiagramNode tone="neutral" icon="🗄️" title="Data sources" subtitle="Oracle/multi-DB · Essbase · files" />
        <Arrow label="BDI / BI Apps ETL" />
        <DiagramNode tone="accent" icon="🧩" title="Repository (.rpd)" subtitle="BI Server's governed business model" />
        <Arrow label="serves" />
        <DiagramNode tone="accent" icon="🖥️" title="BI Server" subtitle="query engine — SQL to sources" />
        <Arrow label="UI" />
        <DiagramNode tone="accent" icon="🖼️" title="Presentation Services" subtitle="Answers · Dashboards · Catalog" />
      </Diagram>
      <DataTable
        headers={["Component", "Role"]
        }
        rows={[
          ["Repository (.rpd)", "The governed model: physical connections, business model, presentation layer"],
          ["BI Server", "The query engine that turns requests into database SQL"],
          ["BI Presentation Services", "The web application users touch: Answers, dashboards, catalog"],
          ["Catalog (RPD-side)", "Where analyses, dashboards and reports are stored"],
          ["BI Publisher server", "Pixel-perfect layouts on top of the same data"],
          ["Scheduler / Agent (iBot)", "Delivers/emails content on a schedule"],
        ]}
      />

      <H2>The .rpd and its three layers</H2>
      <P>
        The <strong>repository</strong> is an offline-editable model (the offline <K>Admin Tool</K>)
        built of exactly three layers. Understand these and you understand the philosophy behind
        OTBI subject areas:
      </P>
      <DataTable
        headers={["Layer", "Content", "Analogy"]
        }
        rows={[
          ["Physical", "Actual database tables/columns and how to connect", "The 'real' schema"],
          ["Business Model &amp; Mapping", "The logical model: dimensions and measures, with mappings to physical tables", "Subject-area mechanics"],
          ["Presentation", "The folders users actually pick from in Answers", "The subject area you see in OTBI"],
        ]}
      />
      <UL>
        <li>Changes to the model happen offline, then a <strong>consistency check</strong> validates the model before load.</li>
        <li>That offline check-and-load ceremony is exactly why schema changes feel heavyweight in OBIEE-land.</li>
      </UL>
      <Callout type="tip">
        When someone says "add a column to the report" in an OBIEE/OAC-classic world, the real work
        is often <em>model changes</em> — physical → business model → presentation — not the report
        itself. OTBI hides that plumbing because Oracle built the subject areas for you.
      </Callout>

      <H2>Answers, dashboards &amp; the catalog</H2>
      <P>
        The user experience is the ancestor of what you already know from OTBI:
      </P>
      <UL>
        <li><strong>Answers</strong> — the ad-hoc analysis builder over presentation folders: columns, filters, groupings, pivots and charts.</li>
        <li><strong>Dashboards</strong> — pages that arrange analyses and prompts for a role or workflow.</li>
        <li><strong>Catalog</strong> — <K>/Shared Folders</K> (governed) and <K>/My Folders</K> (personal), each folder access-controlled.</li>
        <li><strong>BI Publisher</strong> — a companion server for pixel-perfect outputs driven by the same data.</li>
      </UL>

      <H2>BI Applications (BI Apps) — the ERP/analytics pack</H2>
      <P>
        On-prem Oracle BI deployments are rarely naked OBIEE. Most ship as{" "}
        <strong>Oracle BI Applications</strong>: preconfigured subject areas (Financial Analytics,
        Procurement and Spend Analytics, HR Analytics, Supply Chain Analytics) fed by{" "}
        <strong>ODI</strong> ETL from EBS/JDE/PeopleSoft/Siebel. They are the direct ancestors of
        Fusion's delivered analytics:
      </P>
      <DataTable
        headers={["BI Apps layer", "Contains"]
        }
        rows={[
          ["Data warehouse", "Star-schema tables (fact + dimension) that BI Apps populates"],
          ["ODI mappings", "The ETL that turns source-application tables into warehouse facts"],
          ["RPD (functional)", "The analytics subject areas on top of that warehouse"],
          ["Prebuilt dashboards", "Delivered 'out-of-the-box' report sets per domain"],
        ]}
      />

      <H2>OBIEE and Fusion</H2>
      <P>
        Two real-life pairings you will meet:
      </P>
      <UL>
        <li>
          <strong>OTBI is OBIEE technology</strong> — the Fusion "Reports and Analytics" center is a
          curated, cloud-hosted OBIEE-like service. OBIEE experience transfers 1:1 to OTBI comfort.
        </li>
        <li>
          <strong>Fusion → on-prem OBIEE/OBI Apps</strong> — some estates still run enterprise OBIEE
          against Fusion data via BI connectors or by loading the Fusion warehouse into a
          BI-Apps-shaped on-prem model.
        </li>
      </UL>

      <H2>Migrating from OBIEE to OAC</H2>
      <P>
        Oracle's direction of travel is OBIEE → OAC, and the path is largely governed:
      </P>
      <DataTable
        headers={["OBIEE asset", "In OAC"]
        }
        rows={[
          [".rpd repository", "Uploaded as a semantic model (12c .rpd is supported; 11g needs the migration validator first)"],
          ["Answers analyses", "Recreated in classic dashboards or rebuilt in DV"],
          ["Dashboards", "Classic dashboards run in OAC; new work moves to DV"],
          ["BI Publisher reports", "Re-hosted or re-targeted at Fusion/BIP in the cloud"],
          ["BI Apps warehouse", "Leave on-prem, or re-point at Fusion/OAC-native models"],
        ]}
      />
      <Callout type="warning">
        The migration is a <em>re-platform, not a lift</em>. 'RPD uploads fine' does not mean the
        underlying data connections do — source credentials, refresh schedules, and report catalog
        permissions must all be re-established on OCI before users even sign in. Treat it as a
        project with its own test cycle, exactly like the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/fusion/modify-report">report-modification walkthrough</a>{" "}
        preaches.
      </Callout>

      <H3>Where OBIEE fits today</H3>
      <Diagram title="The family in one picture" className="mb-8">
        <DiagramNode tone="warning" icon="🏢" title="OBIEE on-prem" subtitle="legacy estates · BI Apps · .rpd" />
        <Arrow label="modernize" />
        <DiagramNode tone="oic" icon="☁️" title="OAC" subtitle="cloud DV · semantic models" />
        <Arrow label="embedded" />
        <DiagramNode tone="fusion" icon="📊" title="OTBI in Fusion" subtitle="the same BI, curated for Fusion" />
      </Diagram>
    </>
  );
}
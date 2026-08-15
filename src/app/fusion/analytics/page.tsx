import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import LearningPath from "@/components/ui/LearningPath";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "Analytics — OTBI · OAC · OBIEE",
};

export default function FusionAnalyticsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud · Reporting Layer"
        title="Analytics — OTBI, OAC & OBIEE"
        description="Oracle's BI family, one family tree: OTBI is the analytics engine embedded in Fusion, OAC is Oracle Analytics Cloud on OCI, and OBIEE is the on-prem classic they both descend from. This hub shows how they relate and which one answers which question."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Reporting Layer" }, { label: "Analytics" }]}
        updated="2026"
      />

      <P>
        The "Reporting &amp; Analytics" page chose the <em>day-to-day</em> tool per question (OTBI,
        BI Publisher, Financial Reporting, Smart View). This pages covers the{" "}
        <strong>analytic engines</strong> behind those tools — OTBI, OAC, and OBIEE — how they are
        related, and how analytics work at enterprise scale. One sentence to remember:
      </P>
      <Callout type="info">
        <strong>OBIEE</strong> is the on-prem BI platform. <strong>OTBI</strong> is OBIEE-style
        analytics <em>embedded inside Fusion</em>. <strong>OAC</strong> is the modern cloud
        analytics service that can consume Fusion data alongside everything else. They share the
        same family DNA and the same vocabulary (subject areas, analyses, dashboards, catalog).
      </Callout>

      <H2>The family tree</H2>
      <Diagram title="Where each product lives" className="mb-8">
        <DiagramNode tone="accent" icon="🏢" title="OBIEE" subtitle="On-prem BI EE 11g/12c — the platform everything grew from" />
        <Arrow label="embed" />
        <DiagramNode tone="fusion" icon="📊" title="OTBI" subtitle="Inside Fusion — subject areas + analyses + dashboards" />
        <Arrow label="modernize / move" />
        <DiagramNode tone="oic" icon="☁️" title="OAC" subtitle="Oracle Analytics Cloud on OCI — DV, semantic models, ML" />
      </Diagram>
      <DataTable
        headers={["Engine", "Where it runs", "Signature strength", "Read the deep-dive"]
        }
        rows={[
          ["OTBI", "Inside the Fusion Cloud instance", "Immediate questions on Fusion transactional data, no extra service", "OTBI"],
          ["OAC", "OCI — a separate cloud service", "Multi-source analytics, data prep, visualization, ML", "OAC"],
          ["OBIEE", "Your own data center", "The on-prem classic with the RPD semantic layer; pairs with BI Apps", "OBIEE"],
        ]}
      />

      <H2>Decision guide — which engine when</H2>
      <P>
        The honest rule: <strong>start in OTBI</strong>. It is already there, already secured by
        Fusion duties, and answers 80% of business questions in minutes. Graduate to{" "}
        <strong>OAC</strong> when you need data from outside Fusion, heavier preparation, or one
        analytics store for the whole company. Touch <strong>OBIEE</strong> when you meet a
        pre-OAC on-prem estate — and plan its migration.
      </P>
      <DataTable
        headers={["Situation", "Use", "Why"]
        }
        rows={[
          ["Ad-hoc question about Fusion data, answered today", "OTBI", "Built-in, duty-secured, near-real-time subject areas"],
          ["Combine Fusion with a data warehouse, Salesforce, files", "OAC", "One service, many sources, data flows and prep"],
          ["Data-visualization storytelling, auto-insights, ML predictions", "OAC (DV)", "Drag-and-drop projects + machine-learning built in"],
          ["Fusion plus the wider enterprise in one governed model", "OAC + semantic model (.rpd)", "A single business model over many sources"],
          ["Reading or maintaining a legacy on-prem BI estate", "OBIEE", "It is live in thousands of data centers; you must know the RPD ceremony"],
          ["Pixel-perfect invoices, statements, bank formats", "BI Publisher (not these)", "These engines analyze; BIP formats"],
          ["GL statements over ledgers", "Financial Reporting (not these)", "Account-structure statements, not analytics"],
        ]}
      />

      <H2>The shared vocabulary</H2>
      <P>
        Once you know any one engine's words you know most of the others' — this is why OTBI, OAC's
        classic console, and OBIEE all feel familiar:
      </P>
      <DataTable
        headers={["Term", "Meaning in every engine"]
        }
        rows={[
          ["Subject area", "A logical queryable model (e.g. 'AP Invoices Real Time') with folders of measures and dimensions"],
          ["Analysis (Answers)", "The ad-hoc query builder: columns, filters, grouping, aggregates, pivots, charts"],
          ["Dashboard", "A page of analyses and prompts, arranged for a role or process"],
          ["Prompt / filter", "A runtime parameter that narrows the query ('what period? which BU?')"],
          ["Catalog", "The folders where analyses, dashboards and reports are saved and secured"],
          ["Measures", "The numbers (amounts, counts) — aggregated with SUM/AVG/COUNT per the model"],
          ["Dimensions / hierarchy", "The way you slice (Time, Business Unit, Supplier, Natural Account)"],
        ]}
      />

      <H2>Learning path</H2>
      <LearningPath
        title="Read in this order"
        steps={[
          {
            href: "/fusion/analytics/otbi",
            title: "OTBI — Transactional Business Intelligence",
            level: "Module",
            outcome: "Subject areas and real-time vs warehouse facts, analyses, dashboards, drill-to-detail, catalog and security.",
          },
          {
            href: "/fusion/analytics/oac",
            title: "Oracle Analytics Cloud (OAC)",
            level: "Module",
            outcome: "The cloud service: data visualization, semantic models and classic dashboards, data flows, and connecting to Fusion via OAuth.",
          },
          {
            href: "/fusion/analytics/obiee",
            title: "OBIEE — On-Prem BI Enterprise Edition",
            level: "Advanced",
            outcome: "The RPD repository's three layers, Presentation Services and Answers, BI Apps, and the migration path from OBIEE to OAC.",
          },
        ]}
      />

      <H2>How Fusion data actually reaches these engines</H2>
      <P>
        It helps to picture the data flow once, because each engine sits at a different point in it:
      </P>
      <UL>
        <li>
          <strong>OTBI</strong> queries Fusion's transactional schema through prebuilt subject areas
          — either <K>Real Time</K> subject areas over live transaction tables or warehouse-backed
          subject areas over the Fusion analytics warehouse that refresh on schedule.
        </li>
        <li>
          <strong>OAC</strong> pulls Fusion data through a{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/fusion/rest-api">REST/OAuth</a>{" "}
          connection or from the same warehouse and other sources.
        </li>
        <li>
          <strong>OBIEE</strong> on-prem usually reads a replicated copy of transactional data or the
          BI Apps warehouse that an ETL process (e.g. ODI) fills.
        </li>
      </UL>
      <Callout type="warning">
        None of these engines read the <em>source of truth</em> blindly at all times — they read
        subject areas, warehouses, or replicated copies, and that is a <strong>refreshed</strong>{" "}
        view of the data. "Balance is off by one invoice" is usually a refresh-timing question, not
        a bug in the report.
      </Callout>
    </>
  );
}
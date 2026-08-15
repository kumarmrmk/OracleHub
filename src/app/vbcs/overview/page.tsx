import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "VBCS Overview",
};

export default function VbcsOverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="VBCS"
        title="What is Oracle Visual Builder?"
        description="Oracle Visual Builder (VBCS, Visual Builder Cloud Service) is Oracle's low-code platform for building web and mobile applications. It gives business-friendly developers a drag-and-drop design canvas, while still allowing custom logic and direct connectivity to Fusion and OIC."
        breadcrumbs={[{ label: "VBCS" }, { label: "Overview" }]}
        updated="February 2025"
      />

      <P>
        VBCS is the <strong>front end</strong> of the Oracle stack. Where Fusion stores the data and
        OIC moves it around, VBCS is where people actually <em>see and interact</em> with that data —
        dashboards, extranet portals, self-service screens, and mobile apps.
      </P>

      <Callout type="info">
        VBCS rests on two big ideas: a <strong>visual page model</strong> (you design the page, set
        variables and actions, and the framework generates the code) and{" "}
        <strong>REST-first connectivity</strong> (any REST API — Fusion's, OIC's, yours — can power a
        page with a few clicks).
      </Callout>

      <H2>What you can build with VBCS</H2>
      <UL>
        <li>
          <strong>Extranet portals</strong> — supplier or customer self-service that Fusion's own screens
          don't cover, or that must live outside the corporate firewall.
        </li>
        <li>
          <strong>Dashboards & reports</strong> — visual summaries of Fusion data (open POs, expense
          status) fetched through OIC or Fusion REST.
        </li>
        <li>
          <strong>Approval & task UIs</strong> — letting employees approve OIC process tasks from a
          friendly custom interface.
        </li>
        <li>
          <strong>Mobile apps</strong> — VBCS applications can be published as hybrid mobile apps
          (Apache Cordova / OJET-based) for iOS and Android.
        </li>
        <li>
          <strong>Extending Fusion itself</strong> — VBCS apps can appear inside the Fusion UI as
          "extensions," giving custom screens a single sign-on experience.
        </li>
      </UL>

      <H2>Two flavours in Oracle's world</H2>
      <P>
        Oracle offers VBCS in two related forms. They share the same engine, so knowledge transfers
        directly between them:
      </P>
      <DataTable
        headers={["Flavour", "Where it lives", "Use it when"]}
        rows={[
          ["VBCS (standalone)", "A dedicated OIC/Building&Connecting environment", "You want a normal cloud app, maybe integrated via OIC"],
          ["ADV (Application Development scope inside Fusion)", "Embedded in the Fusion cloud, uses Fusion identity/vanity URL", "You build 'extensions' that appear inside Fusion itself"],
        ]}
      />
      <Callout type="note">
        Oracle is converging these names — you will see "Oracle Visual Builder," "VBCS," and "Visual
        Builder Studio (VB Studio) for lifecycle management." For this guide, <strong>VBCS</strong>{" "}
        means the visual builder platform, and <strong>ADV</strong> means the copy embedded in Fusion.
      </Callout>

      <Callout type="info">
        Under the hood, VBCS is built on <strong>Oracle JET</strong> — the same component library
        (tables, forms, buttons, dialogs, charts, lists) drives its design canvas. JET knowledge
        transfers directly: what you learn about a Table or Form in VBCS maps to the underlying
        <K>oj-*</K> component, which matters when you drop in custom HTML or read OJET docs.
      </Callout>

      <H2>How a VBCS application is structured</H2>
      <P>
        A VBCS app bundles several pieces that work together. You'll configure each in the design
        time (the browser-based studio):
      </P>
      <Diagram title="VBCS application anatomy" className="mb-8">
        <DiagramNode tone="vbcs" title="Apps & Web Apps" subtitle="containers with pages, flows, styles" />
        <Arrow />
        <DiagramNode tone="vbcs" title="Pages" subtitle="page model: variables, actions, components" />
        <Arrow />
        <DiagramNode tone="vbcs" title="Business Objects / REST" subtitle="data sources behind the pages" />
        <Arrow />
        <DiagramNode tone="neutral" title="Service Connections" subtitle="OAuth settings for Fusion & OIC" />
      </Diagram>
      <DataTable
        headers={["Layer", "Role"]}
        rows={[
          ["Business Objects", "You define objects (e.g. 'Supplier'), VBCS creates a REST API + DB tables to store them"],
          ["REST Data Sources", "JSON-shaped data from external services (Fusion, OIC, 3rd-party)"],
          ["Service Connections", "Named endpoints with security — how a page actually talks to OIC/Fusion"],
          ["Page Model", "Variables (data), action chains (logic), and the component tree (UI)"],
          ["Fragments", "Reusable chunks of UI used across pages"],
        ]}
      />

      <H2>The page model in one paragraph</H2>
      <P>
        In VBCS, every page has three linked parts. <strong>Variables</strong> hold page state (e.g.
        the list of POs as a typed array). <strong>Action chains</strong> contain the logic —
        "when the button is clicked, call the service connection, store the result, then reload the
        table." <strong>Components</strong> are the visible OJET widgets (tables, forms, charts)
        whose properties are bound to those variables. You wire this together visually; VBCS writes
        the Knockout/OJET code underneath.
      </P>

      <Callout type="tip">
        "All UI is data." The single most important VBCS habit is binding component displays to page
        variables rather than writing imperative DOM code. When a variable changes, everything bound
        to it updates automatically.
      </Callout>

      <H2>How VBCS, OIC, and Fusion connect</H2>
      <Diagram title="VBCS connectivity options" className="mb-8">
        <DiagramNode tone="vbcs" title="VBCS App" subtitle="your pages & business objects" />
        <Arrow label="REST via service connection" />
        <DiagramNode tone="oic" title="OIC Integration" subtitle="orchestration + process tasks" />
        <Arrow label="FBDI / REST" />
        <DiagramNode tone="fusion" title="Fusion Cloud" subtitle="system of record" />
      </Diagram>
      <UL>
        <li>
          <strong>Direct to Fusion:</strong> a service connection pointing at{" "}
          <K>fscmRestApi / hcmRestApi</K> with basic or OAuth credentials. Fast for simple reads.
        </li>
        <li>
          <strong>Via OIC:</strong> a service connection pointing at OIC's{" "}
          <K>/ic/api/integration/v1/integrations/…/invoke</K> endpoints. Use this when the flow needs
          orchestration, scheduling, or a human approval.
        </li>
        <li>
          <strong>Business Objects:</strong> VBCS's own REST-with-storage layer, handy for local,
          lightweight data (drafts, session state) or when you don't have a backend yet.
        </li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Walk the <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/concepts">application & page model</a> in detail.</li>
        <li>Understand data with <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/business-objects">business objects & REST</a>.</li>
        <li>Wire everything together in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/connecting">connecting to Fusion & OIC</a>.</li>
      </UL>
    </>
  );
}
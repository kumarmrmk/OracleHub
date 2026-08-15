import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "VBCS Deployment & Lifecycle",
};

export default function VbcsDeployPage() {
  return (
    <>
      <PageHeader
        eyebrow="VBCS"
        title="Deployment & Lifecycle"
        description="How a VBCS app moves from a developer's browser to a live production system: development environments, export/import archives, and the optional VB Studio pipeline for team-scale delivery."
        breadcrumbs={[{ label: "VBCS" }, { label: "Deploy" }]}
        updated="February 2025"
      />

      <P>
        VBCS apps are <strong>packaged</strong>, not compiled and shipped like traditional code. The
        lifecycle is a sequence of <strong>export, transfer, import, and configure</strong> — and,
        when you grow up to team development, a <strong>CI/CD pipeline</strong> in VB Studio that
        automates the whole thing.
      </P>

      <Callout type="info">
        The mental model: <strong>one app archive, many environments.</strong> You move the same{" "}
        <K>.zip</K> through dev → stage → prod, and each environment brings its own endpoints,
        credentials, and security settings along the way.
      </Callout>

      <H2>Development environments</H2>
      <P>
        A typical OIC/VBCS setup provisions several environments, each a full instance of the
        platform:
      </P>
      <Diagram title="Promotion path across environments" className="mb-8">
        <DiagramNode tone="neutral" title="Development" subtitle="build pages, objects, connections" />
        <Arrow label="export archive" />
        <DiagramNode tone="warning" title="Stage" subtitle="test with prod-like data & config" />
        <Arrow label="approval gate" />
        <DiagramNode tone="success" title="Production" subtitle="live users, secured connections" />
      </Diagram>
      <UL>
        <li>
          <strong>Development (source)</strong> — where the app is built and iterated; safe to
          break things.
        </li>
        <li>
          <strong>Stage</strong> — a near-production mirror for UAT: real Fusion/OIC endpoints,
          realistic data, role checks.
        </li>
        <li>
          <strong>Production</strong> — the live instance. Changes arrive only through the
          promotion path, gated by review/approval.
        </li>
      </UL>

      <H2>From source to production</H2>
      <P>
        Every promotion repeats the same four steps:
      </P>
      <UL>
        <li>
          <strong>Export</strong> the app from the source environment as an application archive
          (<K>.zip</K> containing the app definition, pages, business objects, and connections).
        </li>
        <li>
          <strong>Transfer</strong> the archive (download/upload, or push through VB Studio if a
          pipeline is wired).
        </li>
        <li>
          <strong>Import</strong> into the target environment — VBCS validates the archive against
          what already exists.
        </li>
        <li>
          <strong>Configure</strong>: re-point service connections to the target's endpoints, set
          environment variables, and assign roles before publishing.
        </li>
      </UL>
      <Callout type="warning">
        The most common production failure is <strong>importing without reconfiguring.</strong> An
        archive that points at the dev Fusion host will happily run in prod — against the dev
        system. Add environment variables and a re-point checklist to your import routine.
      </Callout>

      <H2>Export/import archives</H2>
      <P>
        The archive is a zip of the whole application. What it carries — and what it doesn't —
        shapes your rollout plan:
      </P>
      <DataTable
        headers={["Artifact", "In the archive?", "Notes"]}
        rows={[
          ["Pages, flows, action chains, fragments", "Yes", "Definitions only; no runtime state"],
          ["Business object definitions", "Yes", "Schema recreated on import; data not included by default"],
          ["Business object data", "No (unless exported)", "Use the data export/import feature to move rows separately"],
          ["Service connections", "Yes (with values)", "Credentials may need re-entering; URLs should use environment variables"],
          ["Styles / themes", "Yes", "Imported as-is"],
          ["Roles & access settings", "Yes", "Re-assign users/groups to roles in the target environment"],
        ]}
      />
      <CodeBlock
        language="bash"
        filename="Typical VBCS app archive contents"
        code={`MyApp.zip
├── metadata.json          # app id, version, description
├── apps/                  # web apps & flows
│   └── web/flow/…         # pages, fragments, action chains
├── resources/             # business objects, connections
│   ├── businessObjects/
│   └── serviceConnections/
└── theme/                 # styles & skins`}
      />

      <H2>Working with VB Studio (VBSt)</H2>
      <P>
        For solo builds, export/import in the browser is enough. As soon as{" "}
        <strong>multiple developers</strong>, <strong>version control</strong>, or{" "}
        <strong>release gates</strong> come into play, Oracle Visual Builder Studio (VB Studio, VBSt)
        is the companion service that brings engineering discipline to VBCS:
      </P>
      <UL>
        <li>
          <strong>Git hosting</strong> — VBSt stores your VBCS metadata in a Git repository, so
          every change is a commit you can review, branch, and roll back.
        </li>
        <li>
          <strong>Build automation</strong> — a build job packages the app automatically on commit
          or on demand.
        </li>
        <li>
          <strong>Pipelines</strong> — CI/CD stages deploy the built archive to stage and then to
          production, optionally pausing for approval between stages.
        </li>
        <li>
          <strong>Integration with OIC</strong> — the same environment model that hosts VBCS also
          hosts OIC, so your integrations and app front ends can share a release pipeline.
        </li>
      </UL>
      <Callout type="tip">
        Adopt VB Studio <strong>before</strong> you need it. Retro-fitting version control to an app
        that was built ad-hoc is painful; starting a new app inside a VBSt project costs minutes and
        buys you history, reviewability, and automated deploys.
      </Callout>

      <H2>Going live checklist</H2>
      <P>
        Before you flip the production switch, walk this list — every item below has bitten someone:
      </P>
      <Callout type="danger">
        <UL>
          <li>
            <strong>Validate endpoints</strong> — every service connection re-pointed to the
            production Fusion/OIC host; a test call run against each one.
          </li>
          <li>
            <strong>Configure environment variables</strong> — hosts, versions, and feature flags
            resolved per environment, none left pointing at dev.
          </li>
          <li>
            <strong>Point security roles</strong> — production users/groups assigned to the app
            roles; no test users carrying admin access.
          </li>
          <li>
            <strong>Test SSO</strong> — a full login through your corporate identity provider into
            the live app (and, if ADV, through Fusion itself).
          </li>
          <li>
            <strong>Check performance</strong> — page sizes, lazy-loading behavior, and Fusion/OIC
            call latency under a realistic load, not a single user.
          </li>
          <li>
            <strong>Confirm business object data</strong> — reference/draft data seeded in
            production, since archives don't carry data.
          </li>
        </UL>
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Make sure the production app is locked down — see <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/security">security & roles</a>.</li>
        <li>Re-check the connections you'll configure at deploy time in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/connecting">connecting to Fusion & OIC</a>.</li>
        <li>Position VBCS in the wider landscape on the <a className="font-semibold text-emerald-300 hover:underline" href="/architecture">architecture page</a>.</li>
      </UL>
    </>
  );
}
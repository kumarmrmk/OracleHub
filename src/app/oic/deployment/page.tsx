import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "OIC Deployment & Lifecycle",
};

export default function OicDeploymentPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Deployment & the environment lifecycle"
        description="The lifecycle that takes a designed integration to production safely: export a package, import into the target environment, remap its connections and config variables, activate the right version, and roll back when needed. The discipline that makes 'go live' boring."
        breadcrumbs={[{ label: "OIC" }, { label: "Deployment & Lifecycle" }]}
        updated="February 2025"
        level="Advanced"
      />

      <P>
        Nothing about OIC deployment is hard; the failure mode is <em>forgetting a remap</em>. A
        package moves cleanly, but every environment has its own endpoints, credentials, and
        schedules. Deployment is where you pay attention to those differences deliberately.
      </P>

      <H2>The promotion loop</H2>
      <Diagram title="Promote an integration across environments" className="mb-8">
        <DiagramNode tone="neutral" title="Dev" subtitle="design, map, test" />
        <Arrow label="export package" />
        <DiagramNode tone="oic" title="Test / UAT" subtitle="import + remap + validate" />
        <Arrow label="promote" />
        <DiagramNode tone="success" title="Production" subtitle="import + remap + activate" />
      </Diagram>
      <Callout type="info">
        The integration artifact is identical in every environment. The <strong>connections</strong>{" "}
        and <strong>config values</strong> behind it are what differ — and what you must remap on
        import.
      </Callout>

      <H2>Packages: the unit of transfer</H2>
      <P>
        A <strong>package</strong> bundles everything an integration (or a whole project) needs to
        travel: the flow XML, its lookups, dependencies, and the references that must be re-pointed
        on import.
      </P>
      <DataTable
        headers={["What's in a package", "What's not (fix on import)"]}
        rows={[
          ["Integration definitions & versions", "Environment-specific connection details"],
          ["Lookup data", "Endpoint URLs and host names"],
          ["Map libraries and common schemas", "Usernames, passwords, OAuth secrets"],
          ["Tracking field definitions", "Schedules you re-assert per environment"],
        ]}
      />

      <H2>Config variables & connection overrides</H2>
      <P>
        OIC separates the <em>design value</em> from the <em>runtime value</em>. Anything that
        differs between environments should be a <strong>config variable</strong> rather than a
        literal in the flow:
      </P>
      <UL>
        <li>
          <strong>Config variables</strong> — e.g. <K>"ftp.inbound.dir"</K> or{" "}
          <K>"fusion.base.url"</K> — are declared in the design and set per environment. Same package,
          different values.
        </li>
        <li>
          <strong>Connection overrides</strong> — on import you choose the version of each reference
          and the connections it should bind to.
        </li>
      </UL>
      <Callout type="warning">
        A literal URL or credential left inside a map is a landmine: the package imports in
        production, works in dev, and fails only at the first real call. If a value varies by
        environment, make it a config variable <em>at design time</em>.
      </Callout>

      <H2>Versions, activation, and rollback</H2>
      <P>
        An integration can hold several versions, and each activation switches which one serves
        traffic:
      </P>
      <UL>
        <li>
          Editing a live integration creates a <strong>new draft version</strong>; the draft does not
          affect runtime until you activate it.
        </li>
        <li>
          <strong>Activate</strong> publishes the chosen version. <strong>Deactivate</strong> makes the
          endpoint return a hard 404 — callers fail loudly instead of silently.
        </li>
        <li>
          On a bad release, reactivate the <strong>previous version</strong> — an instant rollback
          without a redeploy.
        </li>
      </UL>

      <H2>Moving to production safely</H2>
      <DataTable
        headers={["Step", "What you verify", "Pitfall to avoid"]}
        rows={[
          ["Import the package", "Structure and dependencies arrive intact", "Importing into the wrong environment"],
          ["Remap connections", "Every adapter points to the production target", "Leaving dev credentials live"],
          ["Set config variables", "URLs, directories, schedules match prod", "Default values from the package"],
          ["Validate with a test payload", "One real call succeeds end to end", "Skipping validation 'to save time'"],
          ["Activate", "Traffic switches to the new version", "Activating before validation"],
          ["Verify in Monitoring", "Instances appear with the expected tracking keys", "No tracking configured → invisible"],
        ]}
      />
      <Callout type="tip">
        Keep a printed checklist of the remap step. In a retrospective, most production incidents
        trace back to a skipped remap — connection, config variable, or schedule. See{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/monitoring">monitoring</a> to
        watch it land.
      </Callout>

      <H2>Segregation of duties (an aside)</H2>
      <P>
        Who may touch production matters as much as what is deployed. Production OIC tend to be
        guarded by roles that let operations deploy and monitor, but not redesign (see{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/security">security & auth</a>). If
        development and production share a tenant, use projects and environment filtering to keep
        unconsumed designs out of the production workspace.
      </P>

      <H2>Next steps</H2>
      <UL>
        <li>Protect what you promote in <a className="font-semibold text-sky-300 hover:underline" href="/oic/security">security</a>.</li>
        <li>Confirm what landed in <a className="font-semibold text-sky-300 hover:underline" href="/oic/monitoring">monitoring</a>.</li>
        <li>For the file-centric promotion story, see <a className="font-semibold text-sky-300 hover:underline" href="/oic/mft">MFT</a>.</li>
      </UL>
    </>
  );
}
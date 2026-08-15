import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "OIC Gen 3 Orientation",
};

export default function OicGen3Page() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="OIC Gen 3 orientation"
        description="Oracle Integration is now a generation-3 service: a new console, environment-based tenant, deeper OCI identity, and a different mental model from the classic gen 2 screens. This page orients you so tutorials and your own hands-on don't fight over which console is in front of you."
        breadcrumbs={[{ label: "OIC" }, { label: "OIC Gen 3 Orientation" }]}
        updated="February 2025"
        level="Foundation"
      />

      <P>
        Much of the OIC documentation and every third-party video shows the <strong>gen 2</strong>{" "}
        console. If your tenant is <strong>gen 3</strong>, the names are the same but the screens,
        navigation, and some provisioning steps differ. Learn to spot which generation you are on —
        that alone prevents hours of following the wrong tutorial.
      </P>

      <H2>How to tell which generation you are facing</H2>
      <DataTable
        headers={["Clue", "Gen 2", "Gen 3 (current Oracle Integration)"]}
        rows={[
          ["Entry point", "OIC instance in the classic console; a distinct integration URL", "Integration in the OCI console; home region + environment-based"],
          ["Left navigation", "Integrations / Process / Monitoring / Catalog-style groups", "A unified modern console with insights-centric start page"],
          ["Environments", "Instance = an entire OIC (one big tenant)", "One tenant, multiple environments per region"],
          ["Provisioning", "You provision the stack in the old UI", "Environments are managed through OCI + IAM"],
          ["Identity model", "Identity Cloud Service (IDCS) users/groups", "OCI IAM domains, roles, and policies"],
        ]}
      />
      <Callout type="info">
        The <em>integration concepts</em> — connections, mappings, orchestration, packages —
        are identical across generations. What changes is <strong>the shell</strong>: how you reach
        the console, manage environments, and handle identity. Everything else in this OIC section
        still applies.
      </Callout>

      <H2>What genuinely changed in gen 3</H2>
      <UL>
        <li>
          <strong>Environment-based tenancy</strong> — you run multiple OIC <em>environments</em>{" "}
          (dev, test, prod) under one region instead of separate instances. Your promotion story
          becomes "move a package between environments".
        </li>
        <li>
          <strong>OCI IAM</strong> — users, groups, and roles live in OCI IAM domains; fine-grained
          policies decide who can create connections, import packages, and activate integrations.
        </li>
        <li>
          <strong>OCI-wide connectivity</strong> — Object Storage, Functions, Streaming, Autonomous
          Database and the rest are first-class targets from the same console.
        </li>
        <li>
          <strong>Modern console</strong> — design, monitor, and insights sit in one refreshed UI.
        </li>
      </UL>

      <H2>What pleasantly stayed the same</H2>
      <P>
        The core craft of integration work did not move:
      </P>
      <DataTable
        headers={["Still the same in gen 3", "Still taught where"]}
        rows={[
          ["Connections, lookups, libraries, packages", <a key="c" className="font-semibold text-sky-300 hover:underline" href="/oic/concepts">Key Concepts</a>],
          ["The three integration styles", <a key="s" className="font-semibold text-sky-300 hover:underline" href="/oic/styles">Integration Styles</a>],
          ["Maps and XSLT transforms", <a key="m" className="font-semibold text-sky-300 hover:underline" href="/oic/mapping">Mapping</a>],
          ["Orchestration stages and scopes", <a key="o" className="font-semibold text-sky-300 hover:underline" href="/oic/orchestration">Orchestration</a>],
          ["Fault handling and retries", <a key="e" className="font-semibold text-sky-300 hover:underline" href="/oic/errors">Error Handling</a>],
          ["Tracking, dashboards, resubmission", <a key="mo" className="font-semibold text-sky-300 hover:underline" href="/oic/monitoring">Monitoring</a>],
        ]}
      />

      <H2>Practical advice for learners</H2>
      <UL>
        <li>
          When a tutorial shows a navigation step that does not exist on your screen, check whether
          it is a gen 2 walk-through before concluding the tool moved.
        </li>
        <li>
          A <strong>connection</strong> in gen 3 still holds the endpoint and credentials — the
          concept is unchanged even though the "create connection" page looks different.
        </li>
        <li>
          Deployment moved from "spreadsheet of endpoints" to <strong>environment variables+config
          variables</strong> officially: see{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/deployment">deployment</a>.
        </li>
      </UL>
      <Callout type="tip">
        The fastest self-orientation: create a scratch <strong>Oracle Database (Autonomous)</strong>{" "}
        connection that pings <K>/health</K>, then a REST <strong>echo</strong> integration. If those
        two tasks feel comfortable in your console, gen 3's layout no longer slows you down.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>See how identity secures your console in <a className="font-semibold text-sky-300 hover:underline" href="/oic/security">security & auth</a>.</li>
        <li>Keep the integration portfolio honest in <a className="font-semibold text-sky-300 hover:underline" href="/oic/deployment">deployment</a>.</li>
        <li>Zoom out to the whole stack in <a className="font-semibold text-sky-300 hover:underline" href="/architecture">architecture</a>.</li>
      </UL>
    </>
  );
}
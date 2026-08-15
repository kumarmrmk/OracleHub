import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "OIC Walkthrough: Modify an Integration & Migrate to Prod",
};

export default function OicModifyExistingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Walkthrough — modify an integration and promote it to production"
        description="The complete sequence for changing an existing OIC integration: understand the current flow, modify its mappings and actions, handle connections and config variables, test, deploy across environments, activate, and roll back — the OIC mirror of the VBCS edit walkthrough."
        breadcrumbs={[{ label: "OIC" }, { label: "Walkthrough: Modify + Migrate" }]}
        updated="February 2025"
        level="Advanced"
      />

      <P>
        You have a live integration — say an invoicing flow built on the FBDI or REST pattern — and
        you must change how it works (a new branch, an extra lookup, a different invoke). OIC's
        lifecycle has its own rhythm: <strong>drafts, versions, activation, packages, config
        variables, and environment promotion</strong>. Follow these phases in order; each ends in a
        checkpoint you can verify before moving on.
      </P>

      <H2>The journey at a glance</H2>
      <Diagram title="Modify → test → promote" className="mb-8">
        <DiagramNode tone="neutral" title="1 · Understand" subtitle="read the flow & its dependencies" />
        <Arrow />
        <DiagramNode tone="oic" title="2 · Edit the design" subtitle="draft: map / action changes" />
        <Arrow />
        <DiagramNode tone="oic" title="3 · Handle connections & config" subtitle="remap + variables per env" />
        <Arrow />
        <DiagramNode tone="vbcs" title="4 · Test before activating" subtitle="validated in the source env" />
        <Arrow />
        <DiagramNode tone="neutral" title="5 · Deploy (package → import)" subtitle="dev → test → prod" />
        <Arrow />
        <DiagramNode tone="success" title="6 · Activate & verify" subtitle="production, with rollback ready" />
      </Diagram>

      <H2>Phase 1 — Understand the existing integration (do not skip)</H2>
      <P>
        The same rule as the VBCS walkthrough applies: read the flow you are about to change. In the
        integration designer:
      </P>
      <UL>
        <li>
          Open the integration and read the <strong>flow trace view</strong> (outline) end to end:
          trigger → maps → invokes → logic → end/error actions.
        </li>
        <li>
          Note the <strong>connections</strong> it uses (adapter + credentials) and any{" "}
          <K>config variables</K> it references — these are the pieces that differ per environment.
        </li>
        <li>
          Note the <strong>tracking fields</strong> and any <strong>global fault handler</strong>{" "}
          already in place, so your change composes with them.
        </li>
        <li>
          Check which <strong>versions</strong> exist and which one is <strong>active</strong> in
          each environment (see{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/deployment">
            deployment
          </a>
          ).
        </li>
      </UL>
      <Callout type="info">
        Recording "current flow: trigger → validate map → invoke Fusion REST → log → return, using
        connection <K>Fusion-Prod</K> and variable <K>fusion.base.url</K>" is your safety net and
        your rollback reference.
      </Callout>

      <H2>Phase 2 — Edit the design (create a draft, don't touch production)</H2>
      <P>
        Editing a live integration creates a <strong>new draft version</strong> — production traffic
        keeps using the active version until you activate the draft. Make your change there:
      </P>
      <UL>
        <li>
          Add a <strong>map</strong> to reshape data for the new option, a <strong>switch</strong>{" "}
          for the new branch, a <strong>lookup</strong> reference, or a new <strong>invoke</strong> to
          a connection — the full palette is documented on{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/orchestration">
            orchestration &amp; the flow toolbox
          </a>
          .
        </li>
        <li>
          Prefer <strong>config variables</strong> (URLs, directories, schedules) over hard-coded
          literals, so the same package works in every environment.
        </li>
        <li>
          Wrap risky steps in a <strong>scope</strong> with a fault handler; keep the{" "}
          <strong>global fault</strong> path intact so failures still reach the error hospital.
        </li>
      </UL>
      <Callout type="warning">
        While you edit, the <strong>active version keeps serving</strong> — that is the safety
        guarantee. Never deactivate the production version "to make edits"; the draft model already
        isolates your work.
      </Callout>

      <H2>Phase 3 — Connections, config variables &amp; secrets</H2>
      <P>
        The design moves cleanly between environments; the <em>connections</em> do not. Handle them
        explicitly:
      </P>
      <DataTable
        headers={["Item", "Why it matters", "Action"]}
        rows={[
          ["Connections", "Each env has its own endpoints/credentials", "Confirm the draft references a connection that exists in the target env (or use an override on import)"],
          ["Config variables", "URLs, directories, schedules vary per env", "Declare them in the design; set values per environment on import — never hard-code a per-env value in a map"],
          ["Secrets", "Passwords, client secrets belong in the connection", "Keep credentials in the connection / OCI secrets, not in the flow body (see security)"],
          ["Tracking fields", "Observability depends on them", "Add/keep business identifiers so monitoring stays searchable"],
        ]}
      />
      <Callout type="danger">
        A literal URL or credential baked into a mapping is the classic landmine: the package imports
        cleanly into production, works in dev, and fails on the first real call. If a value varies by
        environment, make it a <strong>config variable at design time</strong>.
      </Callout>

      <H2>Phase 4 — Test before activating</H2>
      <DataTable
        headers={["Check", "How", "Pass ="]}
        rows={[
          ["The flow runs", "Use the built-in test for REST/scheduled integrations, or invoke the draft endpoint", "The new branch/action executes end to end"],
          ["Mappings correct", "Inspect request/response payloads at each stage", "Shapes match; lookups returned the right values"],
          ["Faults handled", "Force a failure in the new path", "Fault handler and/or global fault catch it; error surfaces properly"],
          ["Tracking visible", "Check the instance in Monitoring", "Business identifiers present; instance searchable"],
        ]}
      />
      <Callout type="tip">
        See{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/monitoring">
          monitoring &amp; tracking
        </a>{" "}
        for flow traces and message inspection — they are your debugger during this phase.
      </Callout>

      <H2>Phase 5 — Deploy across environments (export → import)</H2>
      <P>
        OIC promotes integrations as <strong>packages</strong> (or project/integration export/import).
        The disciplined sequence:
      </P>
      <UL>
        <li>
          <strong>Export</strong> the updated integration (with its dependencies) from the source
          environment.
        </li>
        <li>
          <strong>Import</strong> into the next environment (dev → test, then test → prod). On
          import, OIC prompts you to <strong>remap connections</strong> and resolve{" "}
          <strong>config variables</strong>.
        </li>
        <li>
          Perform the remap deliberately — connection-to-target, variable values, and schedule — and
          run the Phase-4 checks again in the new environment.
        </li>
        <li>
          Do <strong>not activate to production traffic</strong> until the promoted build has passed
          in test.
        </li>
      </UL>
      <Callout type="info">
        Full mechanics — packages, connection overrides, config variables, and the promotion
        checklist — are on{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/deployment">
          deployment &amp; lifecycle
        </a>
        .
      </Callout>

      <H2>Phase 6 — Activate in production &amp; verify</H2>
      <DataTable
        headers={["Step", "Action", "Checkpoint"]}
        rows={[
          ["1", "Import into production and remap connections/config", "All references point at prod; no dev credentials remain"],
          ["2", "Validate one real call (or run once for scheduled flows)", "New behavior verified against prod data"],
          ["3", "Activate the new version", "Traffic switches to the new version (same-version rule applies)"],
          ["4", "Smoke-test a live instance in Monitoring", "Tracking fields visible; no spike of errors"],
          ["5", "Confirm parity", "Old happy path still works; new option behaves as accepted"],
        ]}
      />
      <Callout type="warning">
        Remember the version mechanics from the docs: activating a version with the same identifier
        and <strong>same major version</strong> deactivates the previously active one. That is how
        rollback works — keep the prior version available to reactivate.
      </Callout>

      <H2>Rollback plan</H2>
      <P>
        If production regresses, roll back by <strong>activating the previous version</strong> of the
        integration:
      </P>
      <UL>
        <li>
          Keep the prior version addressable — do not delete it on activation.
        </li>
        <li>
          If the change added a <strong>config variable</strong> or a <strong>connection</strong>,
          confirm the target environment still has the old value/setup for rollback; do not remove
          them in the same change.
        </li>
        <li>
          After rollback, verify the error hospital shows no residual failures from the interim
          version, and the instance tracking still resolves.
        </li>
      </UL>
      <Callout type="danger">
        Rollback reactivates the old flow, but any <em>side effects</em> it already produced (created
        records, sent payments) are not undone. Plan compensation if the new option wrote downstream
        data — the scopes/fault handlers guide has the pattern (see{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/orchestration">
          orchestration
        </a>
        ).
      </Callout>

      <H2>The full checklist (copy for your change)</H2>
      <DataTable
        headers={["#", "Checkpoint", "Done?"]}
        rows={[
          ["1", "Read the existing flow, connections, config variables, tracking, and global fault handler — noted what they do", "☐"],
          ["2", "Draft version edited (map/action/lookup/branch) without touching the active version", "☐"],
          ["3", "Per-env values in config variables, secrets in connections — no hard-coded literals", "☐"],
          ["4", "Tested the draft end to end with payload inspection and a forced failure", "☐"],
          ["5", "Exported and imported to test; connections remapped; config resolved; re-tested", "☐"],
          ["6", "Change note written (flow + connection + variable delta) for rollback", "☐"],
          ["7", "Imported to production, remapped and validated with one real call", "☐"],
          ["8", "Activated; production smoke-test passed in Monitoring", "☐"],
          ["9", "Rollback plan recorded (reactivate prior version; stateful side effects considered)", "☐"],
        ]}
      />

      <H2>Next steps</H2>
      <UL>
        <li>The actions you used while editing are explained in <a className="font-semibold text-sky-300 hover:underline" href="/oic/orchestration">Orchestration &amp; the Flow Toolbox</a>.</li>
        <li>Deployment mechanics in <a className="font-semibold text-sky-300 hover:underline" href="/oic/deployment">Deployment &amp; Lifecycle</a>.</li>
        <li>Verify what landed in <a className="font-semibold text-sky-300 hover:underline" href="/oic/monitoring">Monitoring &amp; Tracking</a>.</li>
      </UL>
    </>
  );
}
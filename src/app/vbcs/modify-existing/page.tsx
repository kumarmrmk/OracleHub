import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "VBCS Walkthrough: Modify an Edit Button & Migrate to Prod",
};

export default function VbcsModifyExistingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Visual Builder Cloud Service"
        title="Walkthrough — enhance an Edit button and ship it to production"
        description="The complete sequence for changing an existing VBCS app: understand the current flow, modify the business object, add a new option to the Edit button's action chain, harden security, test, stage, and publish to production — with a rollback plan at every step."
        breadcrumbs={[{ label: "VBCS" }, { label: "Walkthrough: Edit + Migrate" }]}
        updated="February 2025"
        level="Advanced"
      />

      <P>
        This is the full workflow for the scenario we discussed: an existing VBCS app whose Edit
        button needs a new option, with the data living in a business object. Follow the phases in
        order — each one depends on the one before it, and each ends in a checkpoint you can verify
        before moving on.
      </P>

      <H2>The journey at a glance</H2>
      <Diagram title="Modify → test → migrate" className="mb-8">
        <DiagramNode tone="neutral" title="1 · Understand" subtitle="read the chain & the object" />
        <Arrow />
        <DiagramNode tone="vbcs" title="2 · Modify the object" subtitle="fields, rules, security" />
        <Arrow />
        <DiagramNode tone="vbcs" title="3 · Add the option" subtitle="action chain + function" />
        <Arrow />
        <DiagramNode tone="vbcs" title="4 · Test in Development" subtitle="Live view, Preview" />
        <Arrow />
        <DiagramNode tone="neutral" title="5 · Stage" subtitle="shared test URL" />
        <Arrow />
        <DiagramNode tone="success" title="6 · Publish" subtitle="production, with rollback ready" />
      </Diagram>

      <H2>Phase 1 — Understand the existing flow (do not skip)</H2>
      <P>
        Every migration problem I have seen came from someone editing a chain they guessed at instead
        of read. Spend ten minutes here:
      </P>
      <UL>
        <li>
          Open the app in the <strong>Navigator</strong>, find the page with the Edit button, select
          it, and open <strong>Events → onClick</strong>. Read the action chain step by step —
          usually: open edit page → prefill from the selected row → on save, PATCH the business
          object.
        </li>
        <li>
          Note the <strong>variables, types, and service connections</strong> the chain uses. If an
          Edit page exists, open it and see what it writes back and which endpoint it calls.
        </li>
        <li>
          In the <strong>Business Objects</strong> tab, open the object behind the data: its fields,
          any <em>rules/triggers</em>, and whether <em>role-based security</em> is enabled.
        </li>
      </UL>
      <Callout type="info">
        Record what you found before changing anything — a small note of "current chain: navigate →
        prefill → PATCH Supplier" is your safety net and your rollback reference.
      </Callout>

      <H2>Phase 2 — Modify the business object</H2>
      <P>
        Since the data lives in a business object, changes that the new option needs happen here
        first. In the Business Objects tab, select the object:
      </P>
      <DataTable
        headers={["Change you need", "What to do", "Remember"]}
        rows={[
          ["A new field (e.g. 'Status')", "Add the field and set its type", "Pages using the object must be re-bound to see it; types may need Edit From Endpoint"],
          ["Default or derived value", "Set a default or add a formula field", "Formula fields are read-only, computed server-side"],
          ["Validation on the new data", "Add an object/field validator or trigger", "Rules run on the server for every write path (REST, page, script)"],
          ["Logic shared with the option", "Add an object function (Groovy)", "Keep business logic on the object, not in page JavaScript"],
        ]}
      />
      <Callout type="warning">
        Object <strong>structure and rule changes typically do not touch existing rows</strong>, but a
        new <em>required</em> field with no default can break existing saves. Prefer an optional
        field or a default until you have migrated the data.
      </Callout>

      <H2>Phase 3 — Add the new option to the Edit button</H2>
      <P>With the object ready, modify the page. Decide the shape of the option first:</P>
      <UL>
        <li>
          <strong>Menu on the button</strong> — replace Edit with an OJET menu/overflow; each item
          gets its own action chain.
        </li>
        <li>
          <strong>Extra step in Edit</strong> — insert steps into the existing onClick chain (e.g. a
          confirmation <K>Fire Notification Event</K>, an extra <K>Call Rest Endpoint</K>, or an{" "}
          <K>if</K> branch on a page variable).
        </li>
        <li>
          <strong>Second button</strong> — add a new button bound to the same row with its own chain.
        </li>
      </UL>
      <Callout type="tip">
        If the option and Edit share logic, <strong>extract it into a page/flow JavaScript
        function</strong> and call it from both chains — see{" "}
        <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/advanced">
          Advanced: JavaScript &amp; Quick Starts
        </a>
        . Never inject credentials or secrets into chain expressions or functions.
      </Callout>

      <H2>Phase 4 — Harden security</H2>
      <P>
        The new option usually needs a permission decision, and since security only takes effect on
        stage/publish, do this <em>before</em> you leave Development:
      </P>
      <UL>
        <li>
          If the page should be restricted, set the page's <K>Access</K> in its properties (public /
          logged-in / role).
        </li>
        <li>
          If the option writes or reads more of the object, enable <strong>role-based security</strong>{" "}
          on the business object and grant the right roles the exact operations (view/create/update/
          delete) — including row-level restrictions like "own rows only" if relevant.
        </li>
        <li>
          If anything must be public, review the <strong>anonymous access</strong> rules carefully
          (see{" "}
          <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/security">
            Security &amp; Roles
          </a>
          ).
        </li>
      </UL>

      <H2>Phase 5 — Test in Development before touching prod</H2>
      <DataTable
        headers={["Check", "How", "Pass ="]}
        rows={[
          ["The chain fires correctly", "Live view; click the modified button", "The new option runs end to end, old Edit still works"],
          ["The object write succeeds", "Create/update a record via the page", "Data persists; no validation surprise"],
          ["Access behaves", "Sign in as a low-privilege user", "Unauthorized users are blocked, authorized users pass"],
          ["Errors are visible", "Open the app's errors/logs in design time", "No unhandled exceptions in the chain"],
        ]}
      />

      <H2>Phase 6 — Stage to a shared test URL</H2>
      <P>
        Staging produces a <strong>staged version</strong> others can reach without your developer
        session:
      </P>
      <UL>
        <li>
          <strong>Create a new version</strong> of the app first if the app is already published —
          never overwrite the live version.
        </li>
        <li>
          <strong>Stage</strong> the Development version (top right, Stage button). You get a staged
          URL to hand to testers/business users.
        </li>
        <li>
          Have the business test the actual scenario: edit a record, use the new option, confirm the
          old behavior still passes.
        </li>
      </UL>
      <Callout type="info">
        Details on versions, archive export/import, and VB Studio integration are on{" "}
        <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/deploy">
          Deployment &amp; Lifecycle
        </a>
        . If you use <strong>VB Studio</strong>, the promotion is CI/CD-driven; the business-object
        and chain changes still follow these same phases.
      </Callout>

      <H2>Phase 7 — Publish to production</H2>
      <DataTable
        headers={["Step", "Action", "Checkpoint"]}
        rows={[
          ["1", "Confirm the staged build passed user acceptance", "Sign-off captured; edge cases tested (permissions, offline, empty list)"],
          ["2", "Record what changed (object fields, chain, security)", "A change note exists for rollback"],
          ["3", "Publish the staged version", "Production URL serves the new build"],
          ["4", "Smoke-test on production", "Edit works; new option works; no data corruption"],
          ["5", "Hand back to users / announce", "Business confirms the option is live"],
        ]}
      />

      <H2>Rollback plan — the part everyone forgets</H2>
      <P>
        If production regresses, roll back by <strong>re-publishing the previous version</strong>:
      </P>
      <UL>
        <li>Keep the prior version available in the environment — do not delete it on publish.</li>
        <li>
          If the change added an <em>object field</em>, the rollback must also decide the fate of
          that field: a rolled-back app that still reads a new field can fail — plan to make the
          field optional or handle it in the older version.
        </li>
        <li>
          Business object <strong>security changes take effect on publish too</strong>; a rollback to
          the prior version restores the prior security matrix.
        </li>
      </UL>
      <Callout type="danger">
        A rolled-back app version cannot "unsee" a business-object field your new version created. If
        the field is not strictly needed to keep the old app running, keep it optional and unused
        during the rollback window rather than removing it in the same move.
      </Callout>

      <H2>The full checklist (copy for your sprint)</H2>
      <DataTable
        headers={["#", "Checkpoint", "Done?"]}
        rows={[
          ["1", "Read the existing onClick chain and the business object — noted what they do", "☐"],
          ["2", "Business object updated (field/rule/security) without breaking existing rows", "☐"],
          ["3", "New option implemented in the chain (menu / extra step / second button)", "☐"],
          ["4", "Shared logic extracted to a function (no duplication, no secrets)", "☐"],
          ["5", "Security hardened: page access, object role matrix, anonymous rules if any", "☐"],
          ["6", "Tested in Development (Live view) end to end", "☐"],
          ["7", "Staged; business user-accepted the staged URL", "☐"],
          ["8", "Change note written (object + chain + security delta) for rollback", "☐"],
          ["9", "Published; production smoke test passed", "☐"],
          ["10", "Rollback plan recorded (re-publish prior version; old field handling)", "☐"],
        ]}
      />

      <H2>Next steps</H2>
      <UL>
        <li>The object rules you may add are covered in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/business-objects">Business Objects &amp; REST</a>.</li>
        <li>Chain steps and functions in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/advanced">Advanced: JavaScript &amp; Quick Starts</a>.</li>
        <li>Versions, staging and publishing in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/deploy">Deployment &amp; Lifecycle</a>.</li>
      </UL>
    </>
  );
}
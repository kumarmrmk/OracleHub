import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "Fusion Walkthrough: Modify a Report (BIP/OTBI) & Migrate to Prod",
};

export default function FusionModifyReportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Walkthrough — change a BI Publisher or OTBI report and promote it to production"
        description="The complete sequence for changing an existing Fusion report: understand what you're changing (BIP report or OTBI analysis), edit the definition, secure it, test, move it across environments, and publish to production with a rollback plan — the Fusion mirror of the OIC and VBCS walkthroughs."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Walkthrough: Modify Report + Migrate" }]}
        updated="February 2025"
        level="Advanced"
      />

      <P>
        Your change is to <strong>reporting</strong>: a BI Publisher (BIP) report (pixel-perfect
        output, bursting, schedule) or an OTBI analysis/dashboard (ad-hoc queries on subject areas).
        Fusion promotes report artifacts differently from setup or data — the pieces travel as{" "}
        <strong>catalog objects</strong> (report definitions, data models, layouts, analyses) with
        their <strong>roles and folder permissions</strong>, and every scheduled run is really an{" "}
        <strong>ESS job</strong>. Follow these phases in order.
      </P>

      <H2>The journey at a glance</H2>
      <Diagram title="Modify → test → promote (reports)" className="mb-8">
        <DiagramNode tone="neutral" title="1 · Understand" subtitle="BIP or OTBI · catalog path · who runs it" />
        <Arrow />
        <DiagramNode tone="fusion" title="2 · Edit the artifact" subtitle="data model / layout / analysis" />
        <Arrow />
        <DiagramNode tone="fusion" title="3 · Secure it" subtitle="duties · catalog folder · subject area" />
        <Arrow />
        <DiagramNode tone="vbcs" title="4 · Test in dev/test" subtitle="run the report, check output" />
        <Arrow />
        <DiagramNode tone="neutral" title="5 · Migrate artifacts" subtitle="export → import across environments" />
        <Arrow />
        <DiagramNode tone="success" title="6 · Go live & monitor" subtitle="schedule, delivery, rollback ready" />
      </Diagram>

      <H2>Phase 1 — Understand the report you are changing</H2>
      <P>
        Reporting splits into two artifact families — identify which one you have before editing:
      </P>
      <DataTable
        headers={["You're changing", "The artifact", "Where it lives"]}
        rows={[
          ["BI Publisher report (pixel-perfect / regulatory / bursted)", "Report definition + data model + layout (RTF/eText) + delivery rules", "BIP catalog folder, e.g. /Custom/Financials/AP/Invoices"],
          ["OTBI analysis / dashboard (ad-hoc queries)", "Analysis on a subject area, laid out in a dashboard", "OTBI catalog folder"],
          ["Financial Reporting statement (GL)", "Row/column definition over a reporting tree", "Financial Reporting Center"],
        ]}
      />
      <P>Open the artifact and record before touching it:</P>
      <UL>
        <li>
          <strong>Catalog path</strong> — BIP addresses reports by path, not just name (e.g.{" "}
          <K>/Custom/Financials/AP/Invoices</K>).
        </li>
        <li>
          <strong>Data source</strong> — the data model's SQL or Fusion data source; for OTBI, the{" "}
          <strong>subject area</strong> (e.g. "Payables Invoices Real Time").
        </li>
        <li>
          <strong>Schedule</strong> — is it scheduled? Then the run is an <strong>ESS job</strong> you
          must re-schedule in the target environment.
        </li>
        <li>
          <strong>Security context</strong> — which duties/roles and catalog folder grants let users
          see it (see{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/reporting">
            Reporting &amp; Analytics
          </a>
          ).
        </li>
      </UL>
      <Callout type="info">
        "Current artifact: BIP report <K>/Custom/Financials/AP/Invoices</K>, data model
        <K>Payables Invoices</K>, RTF layout, scheduled nightly via ESS, duty
        <K>Payables Manager</K>" is your safety net and rollback reference.
      </Callout>

      <H2>Phase 2 — Edit the report definition</H2>
      <P>
        Edit the artifact where development happens — usually the non-production instance:
      </P>
      <UL>
        <li>
          <strong>BIP:</strong> edit the <strong>data model</strong> (add filters/columns), the{" "}
          <strong>layout</strong> (RTF template in Word / eText for files), or the{" "}
          <strong>delivery</strong> (email/bursting/FTP) — then save the report definition.
        </li>
        <li>
          <strong>OTBI:</strong> edit the <strong>analysis</strong> (add filters, columns,
          calculations) or the <strong>dashboard</strong> layout, and save to the catalog.
        </li>
        <li>
          Keep the catalog path <strong>stable</strong> if other things reference it (dashboards,
          scheduled jobs, integrations submitting the report via REST).
        </li>
      </UL>
      <Callout type="warning">
        Changing the catalog path breaks every reference to the report — integrations, scheduled
        jobs, and portal links. Prefer editing <em>in place</em>; only move paths when the folder
        structure demands it, and update the references in the same change.
      </Callout>

      <H2>Phase 3 — Secure the changed artifact</H2>
      <P>
        A changed report inherits its security the same way it did before — but verify it, because
        edits can recreate artifacts or add new catalog folders:
      </P>
      <UL>
        <li>
          <strong>Catalog folder access</strong> — confirm the report lives in a folder your intended
          users can open, and no unintended users gained access.
        </li>
        <li>
          <strong>Duties/roles</strong> — which duties can open BIP vs OTBI, and which subject areas
          they can query.
        </li>
        <li>
          <strong>Data security</strong> — the same ledger/BU/row filters apply (see the reporting
          security model on the{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/reporting">
            Reporting &amp; Analytics
          </a>{" "}
          page).
        </li>
      </UL>

      <H2>Phase 4 — Test before promoting</H2>
      <DataTable
        headers={["Check", "How", "Pass ="]}
        rows={[
          ["The report runs", "Run it (or run a scheduled ESS job) in the test instance", "Output generated without error"],
          ["Output is correct", "Open the PDF/Excel/eText; compare to expected layout and data", "Data and layout match the requirement"],
          ["Parameters work", "Run with the prompts/hard-coded values used in production", "Parameter values resolve"],
          ["Delivery works", "Check email/FTP/bursting if configured", "Recipients got the right output"],
          ["Security holds", "Sign in as the report's actual audience", "Authorized users see it; others are denied"],
        ]}
      />
      <Callout type="tip">
        Everything a report needs to run — the ESS job lifecycle, output vs log, retries — is on the
        troubleshooting pages ({" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/ess">
          ESS job errors
        </a>
        ) if the run fails.
      </Callout>

      <H2>Phase 5 — Migrate the report artifacts across environments</H2>
      <P>
        Reports move as <strong>catalog objects</strong> (report definitions, data models, layouts,
        analyses), not as database rows. The disciplined sequence:
      </P>
      <UL>
        <li>
          <strong>Export</strong> the report definition (and its data model/layout) from the source
          environment, using the report catalog's upload/download in Reports &amp; Analytics.
        </li>
        <li>
          <strong>Import</strong> into the target environment. Importing recreates the catalog entry;
          confirm the catalog folder and permissions survive the import (re-apply catalog folder
          grants if the import landed in a different folder).
        </li>
        <li>
          <strong>OTBI:</strong> save and export the analysis/dashboard, import to the target
          catalog, and re-check its subject area references exist there.
        </li>
        <li>
          <strong>Re-create the schedule</strong> in the target environment — a schedule is part of
          the target instance's configuration, not the artifact itself; and if a data model or
          subject area differs between environments, re-validate the query.
        </li>
        <li>
          Run the Phase-4 checks <strong>again</strong> in the new environment before handing to
          production traffic.
        </li>
      </UL>
      <Callout type="info">
        The same advice as setup migration: reuse one path for <em>publish</em> and <em>promote</em>,
        and keep a document of the catalog paths + roles you moved so the next change is a replay,
        not a rediscovery.
      </Callout>

      <H2>Phase 6 — Go live &amp; monitor</H2>
      <DataTable
        headers={["Step", "Action", "Checkpoint"]}
        rows={[
          ["1", "Import into production and verify the catalog path matches what references it", "References (dashboards, jobs, integrations) still resolve"],
          ["2", "Re-create the schedule and delivery (email/FTP/bursting)", "Schedule saved; delivery confirmed"],
          ["3", "Run one production request", "Output verified against prod data; parameters correct"],
          ["4", "Confirm security in production", "Correct duties/folders/data filters apply"],
          ["5", "Hand to business + monitor the report history", "Users see the new output; no regressions"],
        ]}
      />

      <H2>Rollback plan</H2>
      <P>
        Reports are lower-risk than data or setup because they are <strong>read-only artifacts</strong>{" "}
        — but plan the way back anyway:
      </P>
      <UL>
        <li>
          Keep the previous export/definition available; re-import it to restore the prior layout or
          analysis if the new output is wrong.
        </li>
        <li>
          If the change altered a <strong>catalog path</strong>, rollback must undo the path change
          and restore references — keep a note of old vs new path.
        </li>
        <li>
          A rolled-back schedule is just a re-scheduled job; confirm the old schedule parameters are
          restored, not duplicated.
        </li>
      </UL>
      <Callout type="danger">
        Reports never change the underlying <strong>data</strong> — so rollback is safe by nature. The
        real risk is a <em>dangling reference</em>: a path you moved or a subject area that no longer
        exists after rollback, which silently breaks scheduled jobs. Test the schedule after any
        rollback, not just the manual run.
      </Callout>

      <H2>The full checklist (copy for your change)</H2>
      <DataTable
        headers={["#", "Checkpoint", "Done?"]}
        rows={[
          ["1", "Identified the artifact (BIP / OTBI / Financial Reporting) and recorded its catalog path, data source, schedule, and roles", "☐"],
          ["2", "Edited the definition (data model/layout/analysis) without changing the catalog path", "☐"],
          ["3", "Verified security: folder access, duties, subject areas, data filters", "☐"],
          ["4", "Tested in non-prod: runs, correct output, parameters, delivery, security", "☐"],
          ["5", "Exported artifacts and imported to the target environment; folder/references verified", "☐"],
          ["6", "Schedule re-created in target; re-validated the query against that instance's data/setup", "☐"],
          ["7", "Published in production; production run verified; report history checked", "☐"],
          ["8", "Rollback artifacts and schedule restored; references confirmed", "☐"],
        ]}
      />

      <H2>Next steps</H2>
      <UL>
        <li>Know the engines you may touch — see <a className="font-semibold text-accent hover:underline" href="/fusion/reporting">Reporting &amp; Analytics</a>.</li>
        <li>Deliver report output through the integration layer — <a className="font-semibold text-accent hover:underline" href="/oic/overview">Oracle Integration Cloud</a>.</li>
        <li>Support the schedule in <a className="font-semibold text-accent hover:underline" href="/troubleshooting/ess">ESS job errors</a>.</li>
      </UL>
    </>
  );
}
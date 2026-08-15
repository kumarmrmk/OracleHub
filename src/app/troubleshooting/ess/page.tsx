import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "ESS Job Errors",
};

export default function EssErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="ESS job errors"
        description="Scheduled processes fail in three flavors: never ran, ran with business errors, or crashed. Learn the statuses, what output vs log tells you, and the retry rules that keep loads safe."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }, { label: "ESS Job Errors" }]}
        updated="February 2025"
      />

      <H2>Job statuses</H2>
      <DataTable
        headers={["Status", "What it means", "Your next move"]}
        rows={[
          ["Scheduled", "Waiting for its slot", "Wait — or check the schedule/frequency"],
          ["Running", "In progress", "Watch, don't touch"],
          ["Succeeded", "Completed cleanly", "Verify output counts, then proceed"],
          ["Warning", "Completed with rejected rows", "Read output.txt and fix the rejected rows"],
          ["Error", "The process crashed or failed validation", "Read the log, fix the cause, resubmit"],
          ["Held / Failed", "Blocked or stopped", "Check dependencies, retry, or cancel and resubmit"],
        ]}
      />

      <H2>Output vs log</H2>
      <P>
        Two files tell the story — and they answer different questions.
      </P>
      <Diagram title="Where to look" className="mb-8">
        <DiagramNode tone="success" title="output.txt" subtitle="business result: rows loaded, rows rejected, totals" />
        <Arrow label="if business fail" />
        <DiagramNode tone="warning" title="log" subtitle="technical trace: ORA errors, stack, parameters" />
      </Diagram>

      <H2>Common failures</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["Job stays in Scheduled", "Overloaded scheduler or wrong schedule window", "Reschedule, check job set dependencies"],
          ["Error with ORA-xxxx", "Database-level failure in the process", "Find the ORA code, fix the underlying data, resubmit"],
          ["Warning with rejected rows", "Valid rows applied, some failed validation", "Fix the rows in the source and load the delta"],
          ["Job completed but no data", "Parameters excluded everything", "Verify parameter values (period, BU, book type)"],
          ["Report/import ran twice", "Duplicate submission", "Make the loader idempotent — retries must not duplicate data"],
          ["Process dependency missing", "Needed reference data/process didn't run first", "Run prerequisites (load order) or the earlier job set step"],
        ]}
      />

      <H2>Retry rules</H2>
      <UL>
        <li>Retry a failed <strong>import</strong> only after fixing the cause — an unfixed retry fails again.</li>
        <li>Resubmit only the <strong>failed batch</strong>, never the whole dataset.</li>
        <li>Design for <strong>idempotency</strong>: re-running a load must not create duplicates.</li>
        <li>Use <strong>job sets</strong> to encode dependency order (import → validate → post).</li>
      </UL>

      <Callout type="info">
        The full job model is on the <a className="font-semibold text-accent hover:underline" href="/fusion/scheduled-processes">Scheduled Processes</a> page.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">Troubleshooting hub</a>.</li>
        <li>Report jobs: <a className="font-semibold text-accent hover:underline" href="/fusion/reporting">Reporting &amp; Analytics</a>.</li>
      </UL>
    </>
  );
}
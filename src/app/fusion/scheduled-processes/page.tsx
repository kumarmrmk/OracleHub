import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Scheduled Processes (ESS)",
};

export default function ScheduledProcessesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Scheduled Processes (ESS)"
        description="Enterprise Scheduler Service (ESS) runs every background job in Fusion — FBDI imports, reports, depreciation, period close, and interface processes. If it isn't real-time, it's an ESS job. Learn the lifecycle, statuses, and how to drive it from code."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Scheduled Processes (ESS)" }]}
        updated="February 2025"
      />

      <H2>What runs as an ESS job</H2>
      <DataTable
        headers={["Job", "Example", "Why it's a job"]}
        rows={[
          ["FBDI import", "AP Invoices load", "File-based, asynchronous, big volume"],
          ["Reports", "Scheduled invoice report", "BIP engine runs as an ESS job"],
          ["Interface/PLSQL", "GL interface transfer", "Calls application APIs in a batch"],
          ["Period close", "Run depreciation, close periods", "Heavy, sequential, must be scheduled"],
          ["Web service job", "Publish-to-interface jobs", "Orchestrated by ESS"],
        ]}
      />

      <H2>The job lifecycle</H2>
      <P>
        Every job moves through the same states:
      </P>
      <Diagram title="ESS job lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Submit" subtitle="UI, ESS REST, or FBDI" />
        <Arrow />
        <DiagramNode tone="warning" title="Scheduled" subtitle="waiting for its slot" />
        <Arrow />
        <DiagramNode tone="fusion" title="Running" subtitle="In Progress" />
        <Arrow label="finish" />
        <DiagramNode tone="success" title="Succeeded / Warning / Error" subtitle="check output + log" />
      </Diagram>

      <H2>Core concepts</H2>
      <DataTable
        headers={["Concept", "What it is"]}
        rows={[
          ["Job definition", "The process itself (a job type + job parameters), e.g. 'AP Invoice Import'"],
          ["Job type", "How the job executes: FBDI, Report, PL/SQL, SOA/BPM, Web service"],
          ["Job set", "Several jobs run in order with dependencies (e.g. Import → Validate → Post)"],
          ["Parameters", "Values the job needs: file name, period, BU, book type code"],
          ["Schedule", "Frequency: now, once, daily, on a calendar (e.g. every night at 2am)"],
          ["Output & log", "<K>output.txt</K> (the result) and the log file (technical trace) for every run"],
          ["Job status", "Succeeded / Warning / Error — plus detailed run status while running"],
          ["Retry & reschedule", "Re-run failed jobs without resubmitting data (idempotent imports)"],
        ]}
      />

      <H2>Driving jobs from code</H2>
      <P>
        ESS exposes REST so an integration can submit a job and poll its status. The supported
        resource is <K>erpProcesses</K> (POST to submit a job by name, then poll its job status).
        Full walkthrough on{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/erp-processes">
          Driving ESS via REST (erpProcesses)
        </a>
        .
      </P>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "processName": "Import Payables Invoices",
    "processType": "ESS",
    "parameters": [
      { "name": "RequestId", "value": "12345" },
      { "name": "BatchName", "value": "BATCH-2026-001" }
    ]
  }'`}
      />
      <Callout type="info">
        Poll the returned job via the <K>erpintegrationservice/scheduling/jobsStatus/{'{'}processId{'}'}</K>{" "}
        resource — and for FBDI imports, use the import's <K>jobStatus</K> field from the upload
        response (see the <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">FBDI page</a>).
      </Callout>

      <H2>Troubleshooting a failed job</H2>
      <UL>
        <li>Read the <strong>output</strong> first — it lists business errors (rejected rows, invalid accounts).</li>
        <li>The <strong>log</strong> holds the technical trace; enable more logging to diagnose stack issues.</li>
        <li>Compare the <strong>parameter values</strong> from the failed run against the expected setup.</li>
        <li>Check dependencies: the supplier/period/account must exist before the job runs.</li>
        <li>Resubmit only the failed batch, not the whole load (your loader should be resumable).</li>
      </UL>

      <H2>Integration notes</H2>
      <UL>
        <li>ESS is <strong>asynchronous</strong> — never assume a submitted job has finished. Poll
        status, read output, then proceed.</li>
        <li>Idempotent loads matter: a retried import must not duplicate documents.</li>
        <li>Job sets encode your process order (import → validate → post) — reuse them instead of
        chaining individual jobs ad hoc.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>FBDI imports are the most common ESS jobs — see <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">FBDI &amp; ADFdi</a>.</li>
        <li>Reports also run as jobs — see <a className="font-semibold text-accent hover:underline" href="/fusion/reporting">Reporting &amp; Analytics</a>.</li>
        <li>The close sequence is a job set — see <a className="font-semibold text-accent hover:underline" href="/fusion/financial-close">Financial Close</a>.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Driving ESS via REST (erpProcesses)",
};

export default function ErpProcessesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Driving ESS via REST (erpProcesses)"
        description="Many integration flows end with a scheduled process: import the file, validate the invoices, create the accounting, post the journals. The erpProcesses REST resource is how you submit those jobs from OIC or custom code — and how you make a load 'finish' without a human clicking Run."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Driving ESS via REST (erpProcesses)" }]}
        updated="August 2026"
      />

      <P>
        A data load is rarely finished when the file uploads. In Fusion the sequence is usually:{" "}
        <em>stage the data → run the import job → run the validation/accounting job → post</em>. The{" "}
        <K>erpProcesses</K> REST resource lets you submit these Enterprise Scheduler Service (ESS)
        jobs programmatically, exactly as if a user had clicked "Submit" in the Scheduled Processes
        work area.
      </P>

      <H2>Why this matters</H2>
      <UL>
        <li>
          <strong>End-to-end automation</strong> — OIC can upload an FBDI file, poll its status,
          then submit the import job, then Create Accounting, all without a human.
        </li>
        <li>
          <strong>Load-order control</strong> — you decide when each step runs instead of hoping the
          UI job finishes first.
        </li>
        <li>
          <strong>Error containment</strong> — you can stop after import, inspect the interface
          table, fix rows, and only then run accounting.
        </li>
      </UL>

      <H2>The resource</H2>
      <P>
        The resource is <K>erpProcesses</K> under the FSCM REST API. It is a{" "}
        <strong>POST-only</strong> endpoint: you send a job name plus its parameters, and it returns
        the submitted job with an ID you can poll.
      </P>
      <CodeBlock
        language="bash"
        filename="Submit a scheduled process (Import Payables Invoices)"
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
      <P>
        The exact parameter names depend on the job. The reliable way to find them is the{" "}
        <strong>REST resource explorer</strong> in your instance (see the Metadata Explorer tip on
        the{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/rest-api">
          REST API fundamentals
        </a>{" "}
        page) or the job's submission UI.
      </P>

      <H2>Which jobs integrations drive most</H2>
      <DataTable
        headers={["Module", "Scheduled process (ESS job)", "Why you drive it"]}
        rows={[
          ["GL", "Import Journals", "Post the GL_INTERFACE rows from a journal FBDI load"],
          ["GL", "Post Journals", "Post approved journal batches automatically"],
          ["GL", "Revalue Balances / Translate Balances", "Period-close currency steps"],
          ["GL", "Allocate Balances", "Run allocation rule sets"],
          ["GL", "Update General Ledger Balances", "Refresh balances after imports"],
          ["Payables", "Import Payables Invoices", "Turn AP_INVOICES_INTERFACE rows into invoices"],
          ["Payables", "Validate Payables Invoices", "Run invoice validation after import"],
          ["Payables", "Create Accounting", "Generate the SLA accounting entries for invoices"],
          ["Payables", "Submit Payment Process Request", "Build the payment file for approved invoices"],
          ["Receivables", "Import AutoInvoice", "Turn RA_INTERFACE_LINES_ALL rows into transactions"],
          ["Receivables", "Process Receipts Through Lockbox", "Import receipts from the interface"],
          ["Receivables", "Recognize Revenue", "Generate revenue distributions for deferred revenue"],
          ["Receivables", "Create Accounting", "Generate accounting for AR transactions"],
          ["Cash Management", "Import Bank Statement from a Spreadsheet", "Load CE_STATEMENT_* rows from the statement FBDI"],
          ["Cash Management", "Automatic Reconciliation", "Match statement lines against transactions"],
          ["Fixed Assets", "Post Mass Additions", "Turn FA_MASS_ADDITIONS rows into asset records"],
          ["Fixed Assets", "Calculate Depreciation", "Run the period depreciation calculation"],
          ["Fixed Assets", "Create Accounting for Assets", "Generate asset journal entries"],
        ]}
      />
      <Callout type="info">
        <K>Create Accounting</K> (subledger accounting, module-agnostic) is the single most common
        job a Financials integration drives. It turns the transaction data into accounting entries in{" "}
        <K>XLA_AE_HEADERS</K> / <K>XLA_AE_LINES</K>. See{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">
          Subledger Accounting
        </a>
        .
      </Callout>

      <H2>Submitting vs. polling</H2>
      <Diagram title="The submit → poll loop" className="mb-8">
        <DiagramNode tone="oic" title="Submit" subtitle="POST erpProcesses with job name" />
        <Arrow label="job id" />
        <DiagramNode tone="neutral" title="ESS runs the job" subtitle="queued → running → succeeded/failed" />
        <Arrow label="poll" />
        <DiagramNode tone="warning" title="Check status" subtitle="fetch /scheduling/jobsStatus/{id} or the job output" />
        <Arrow label="retry / next step" />
        <DiagramNode tone="fusion" title="Next process" subtitle="e.g. Create Accounting after Import" />
      </Diagram>
      <P>
        Polling status works like the FBDI flow: the{" "}
        <K>erpintegrationservice/scheduling/jobsStatus/{'{'}processId{'}'}</K> resource returns whether the
        job is queued, running, <K>SUCCEEDED</K>, or <K>FAILED</K>. Poll with a sensible interval and
        treat "partial success" (imported some rows, rejected others) as a state to handle
        explicitly.
      </P>

      <H2>Comparison with FBDI's automatic submission</H2>
      <P>
        When you submit an FBDI ZIP via the{" "}
        <K>erpintegrationservice/upload</K> endpoint, the control file already names the import job —
        so one upload starts the import. But the <em>downstream</em> jobs (validation, accounting,
        posting) are still yours to drive. The two patterns work together:
      </P>
      <DataTable
        headers={["Step", "How it happens with FBDI", "How it happens with erpProcesses"]}
        rows={[
          ["Stage data", "ZIP upload triggers the import job via the control file", "A REST write to an interface resource (e.g. payablesInterfaceInvoices)"],
          ["Run import", "Automatic (control file)", "POST erpProcesses with the import job name"],
          ["Run downstream jobs", "You submit them separately", "POST erpProcesses for validation / Create Accounting / post"],
          ["Monitor", "Poll erpintegrationservice status", "Poll the same jobsStatus endpoint"],
        ]}
      />

      <H2>Security &amp; privileges</H2>
      <P>
        The integration user needs the job-role privileges that grant submitting these processes —
        for example <strong>Submit Scheduled Process</strong>, <strong>Import Payables
        Invoices</strong>, <strong>Load Interface File for Import</strong>, or the module-specific
        submit duties. An integration user that can read data but not submit processes will get an
        authorization error on the POST even though GET calls succeed.
      </P>

      <H2>Integration notes</H2>
      <UL>
        <li>
          <strong>Chain, don't guess.</strong> Wait for the import job to finish before submitting
          Create Accounting — accounting over rows that are still importing creates wrong entries or
          errors.
        </li>
        <li>
          <strong>Parameters must match the job.</strong> A wrong or missing parameter fails the
          submission; validate parameter names against the job's submission UI or the resource
          explorer.
        </li>
        <li>
          <strong>Idempotent design.</strong> If you retry a submission, track the job ID so you do
          not run the same import twice.
        </li>
        <li>
          <strong>Period awareness.</strong> Many jobs fail when the period is closed — check{" "}
          <K>accountingPeriodsLOV</K> before submitting import/accounting jobs for a specific period.
        </li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Learn the job lifecycle and failure modes on <a className="font-semibold text-accent hover:underline" href="/fusion/scheduled-processes">Scheduled Processes (ESS)</a>.</li>
        <li>Understand what the interface tables stage in <a className="font-semibold text-accent hover:underline" href="/fusion/interface-tables">Interface Tables</a>.</li>
        <li>See the pattern applied end to end in <a className="font-semibold text-accent hover:underline" href="/oic/fbdi-integration">FBDI Integration with Fusion</a>.</li>
        <li>Look up which job to submit for a task in the <a className="font-semibold text-accent hover:underline" href="/fusion/tool-matrix">Tool Matrix</a>.</li>
      </UL>
    </>
  );
}

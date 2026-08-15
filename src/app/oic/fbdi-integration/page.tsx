import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "FBDI Integration",
};

export default function OicFbdiIntegrationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="FBDI integration with Fusion"
        description="The File-Based Data Import (FBDI) pattern from OIC: stage data, build a CSV and control XML, upload to Fusion UCM, poll the ESS job, and surface the result — best for bulk, asynchronous loads."
        breadcrumbs={[{ label: "OIC" }, { label: "FBDI Integration" }]}
        updated="February 2025"
      />

      <P>
        FBDI (File-Based Data Import) is how Fusion ingests <strong>big, batch, async</strong>{" "}
        loads. From OIC the pattern is the same as from anywhere else — CSV + control XML in a ZIP,
        uploaded to UCM, processed by an ESS job — except OIC also <em>orchestrates</em> the whole
        journey and reports the outcome.
      </P>

      <H2>Why FBDI from OIC</H2>
      <P>
        Every REST create of an invoice or a worker is a <strong>round trip with overhead</strong>:
        connect, authenticate, validate one record, commit, respond. Past a few dozen rows, that is
        wasteful and slow. FBDI imports <strong>thousands of rows in a single file load</strong>,
        processed by Fusion's scheduler in one pass.
      </P>
      <UL>
        <li>
          <strong>Throughput:</strong> one upload moves 10,000 supplier invoices where 10,000 REST
          calls would take hours and hammer rate limits.
        </li>
        <li>
          <strong>Fidelity to Fusion templates:</strong> every load maps onto a published Fusion
          template (e.g., <K>invoicesImport.zip</K>), so validation is Fusion's own.
        </li>
        <li>
          <strong>Async by design:</strong> nothing blocks; you submit, poll, and report.
        </li>
      </UL>
      <Callout type="tip">
        The rule of thumb: <strong>a handful of records → REST; hundreds or thousands → FBDI.</strong>{" "}
        Staying under the row count where REST is viable keeps your request/response integrations
        fast and your bulk flows efficient.
      </Callout>

      <H2>Approach overview</H2>
      <P>
        The pattern is a loop: OIC collects data, packages it for Fusion, submits, and then waits for
        the scheduler to report back:
      </P>
      <Diagram title="FBDI journey" className="mb-8">
        <DiagramNode tone="oic" title="OIC Integration" subtitle="stage · build ZIP (CSV + XML) · poll" />
        <Arrow label="upload ZIP" />
        <DiagramNode tone="fusion" title="Fusion UCM" subtitle="file repository; returns process ID" />
        <Arrow label="ESS job runs" />
        <DiagramNode tone="neutral" title="ESS" subtitle="validates & imports each row" />
        <Arrow label="jobsStatus" />
        <DiagramNode tone="oic" title="Status back to OIC" subtitle="SUCCEEDED · FAILED · business errors" />
      </Diagram>
      <UL>
        <li>
          <strong>Staging:</strong> the source data (from a portal, SFTP, a query) is normalized
          into the columns Fusion's template expects.
        </li>
        <li>
          <strong>Packaging:</strong> OIC writes the CSV and the control XML, zips them into{" "}
          <K>something.zip</K>, and uploads via the Fusion "load file" REST service.
        </li>
        <li>
          <strong>Polling:</strong> the response carries the ESS process ID; OIC polls{" "}
          <K>jobsStatus</K> until it reaches <K>SUCCEEDED</K> or <K>FAILED</K>.
        </li>
      </UL>

      <H2>Step-by-step flow in OIC</H2>
      <P>
        Broken down into concrete designer steps, a typical FBDI integration looks like this:
      </P>
      <UL>
        <li>
          <strong>1 · Create the integration</strong> with a <strong>Fusion Applications (file)</strong>{" "}
          adapter connection so OIC can talk to Fusion's UCM and ESS services.
        </li>
        <li>
          <strong>2 · Stage the source:</strong> pull rows from your portal/DB/SFTP. If it is
          app-driven, the request payload <em>is</em> the staging area; if scheduled, run a query to
          gather changed rows.
        </li>
        <li>
          <strong>3 · Build the payload:</strong> map your staged rows into a Fusion path that emits
          the <strong>CSV plus the control XML</strong>, then ZIP both.
        </li>
        <li>
          <strong>4 · Upload:</strong> invoke Fusion's file load endpoint (
          <K>erpintegrations/upload</K>) with the ZIP and the record count.
        </li>
        <li>
          <strong>5 · Parse the response:</strong> the upload returns an ESS <strong>process
          ID</strong>; store it in a variable, instance tracking, or a log.
        </li>
        <li>
          <strong>6 · Poll:</strong> loop on <K>jobsStatus/{`{processId}`}</K> with a delay until
          the status is terminal, then branch on the outcome.
        </li>
      </UL>

      <H2>The ZIP &amp; control file</H2>
      <P>
        The ZIP must contain the data CSV and a small XML control file declaring the operation. The
        control file tells Fusion which action to take and which key identifies a row — critical for
        <strong>update</strong> vs <strong>insert</strong> semantics:
      </P>
      <CodeBlock
        language="xml"
        filename="control.xml (InvoiceImport)"
        code={`<?xml version="1.0" encoding="UTF-8"?>
<importObjects xmlns="http://xmlns.oracle.com/apps/spec/import/objectimport">
  <importObject action="INSERT" objectType="invoices">
    <key>InvoiceNumber</key>
    <assignment>
      <control>
        <valuesetName>importInvoices</valuesetName>
      </control>
    </assignment>
  </importObject>
</importObjects>`}
      />
      <UL>
        <li>
          <strong>action</strong> can be <K>INSERT</K>, <K>UPDATE</K>, <K>MERGE</K>, or{" "}
          <K>DELETE</K>. <K>MERGE</K> is the safe default when rows may exist already.
        </li>
        <li>
          The <strong>CSV must match the template columns exactly</strong> — including column order,
          if the template order is fixed. Download the current template rather than trusting an old
          copy.
        </li>
        <li>
          Date and number <strong>formats matter</strong>; an invalid format silently becomes a row
          error, not a fail.
        </li>
      </UL>

      <H2>Error handling in this pattern</H2>
      <P>
        FBDI rarely fails the whole load; it fails <em>rows</em>. Your integration must handle both
        levels:
      </P>
      <UL>
        <li>
          <strong>Poll with delay and a max:</strong> loop on jobsStatus with, say, a 30-second
          delay and a sane upper bound (large loads run long). Treat hitting the bound as a failure
          and raise an alert.
        </li>
        <li>
          <strong>FAILED status:</strong> the job object tells you the generic reason. Optionally{" "}
          <strong>resubmit once</strong> if the failure looks transient; then report.
        </li>
        <li>
          <strong>Business errors:</strong> Fusion records per-row rejections. Download the{" "}
          <K>businessErrors</K> file and attach it to the monitoring incident so a human can fix the
          offending rows and re-import just those.
        </li>
        <li>
          <strong>Alerts:</strong> raise an integration error on terminal failure so OIC Monitoring
          and event subscribers (email, Slack) see it immediately.
        </li>
      </UL>

      <H2>Performance &amp; best practices</H2>
      <P>
        FBDI favors <strong>fewer, larger files</strong>. A late-afternoon window that collects
        everything and loads it once will beat ten small uploads:
      </P>
      <DataTable
        headers={["Do", "Don't"]}
        rows={[
          ["Load in large batches (thousands of rows)", "Micro-files of 5 rows each"],
          ["Use the current Fusion template columns", "Reuse last year's template blindly"],
          ["Poll with a backoff-aware delay", "Poll every second and hammer jobsStatus"],
          ["Also upload the control file and validate formats", "Ship only the CSV and hope"],
          ["Track the ESS process ID per instance", "Lose the process ID and be unable to poll"],
        ]}
      />
      <CodeBlock
        language="bash"
        filename="Upload a staged ZIP to Fusion"
        code={`curl -X POST "https://<fusion-host>/fscmRestApi/resources/latest/erpintegrations/upload" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -H "Authorization: Basic <base64(user:pass)>" \\
  -F "processName=invoicesImport" \\
  -F "fileName=invoices.zip" \\
  -F "fileContent=@invoices.zip"
# → 200 with { "processId": "8634321", "jobStatus": "NEW" }`}
      />
      <Callout type="info">
        Keep the same template version consistent between your staging map and Fusion. Oracle can
        add columns to templates over time; when they do, an older CSV can start failing validation
        with cryptic messages — update the formatter and re-test.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>
          Understand where FBDI sits among the styles in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/styles">
            integration styles
          </a>
          .
        </li>
        <li>
          Learn the quick-path REST alternative in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/rest">
            REST &amp; RESTful APIs
          </a>
          .
        </li>
        <li>
          Report failures cleanly with{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/errors">
            error handling and monitoring
          </a>
          .
        </li>
      </UL>
    </>
  );
}
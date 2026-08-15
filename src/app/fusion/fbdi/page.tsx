import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "FBDI & ADFdi",
};

export default function FusionFbdiPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="FBDI & ADFdi"
        description="File-Based Data Import (FBDI) is Fusion's bulk, asynchronous loading path: a ZIP of CSV files plus an XML control file, uploaded to UCM and processed by Enterprise Scheduler Service. ADFdi is its end-user spreadsheet cousin. Learn the flow, the ZIP structure, and the gotchas."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "FBDI & ADFdi" }]}
        updated="February 2025"
      />

      <P>
        REST is perfect for a handful of records, but it falls over for <strong>bulk loads</strong> —
        importing 10,000 supplier invoices would take hours and hammer the service. That is exactly
        the job FBDI exists for: <strong>asynchronous, resume-friendly, batch import</strong> driven
        by a file Oracle can validate and process in the background.
      </P>

      <H2>Why FBDI?</H2>
      <P>
        FBDI is the second pillar of Fusion integration and it exists for three concrete reasons:
      </P>
      <UL>
        <li>
          <strong>Bulk throughput</strong> — files move thousands of rows in one job where REST would
          need thousands of round-trips.
        </li>
        <li>
          <strong>Asynchronicity</strong> — the caller submits the file and walks away; ESS processes
          it, and you poll for the result. Nobody blocks on a long HTTP call.
        </li>
        <li>
          <strong>Built-in validation</strong> — Oracle ships a generic import pipeline (HZ, 
          AP, GL, HCM interfaces) that catches bad rows and writes them to an error file instead of
          silently corrupting data.
        </li>
      </UL>
      <Diagram title="FBDI end-to-end flow" className="mb-8">
        <DiagramNode tone="oic" title="Prepare & ZIP" subtitle="CSV data files + control .xml" />
        <Arrow label="multipart POST" />
        <DiagramNode tone="neutral" title="UCM (dataloader)" subtitle="document upload; job name" />
        <Arrow label="schedules job" />
        <DiagramNode tone="fusion" title="ESS import job" subtitle="runs <importObject>, validates" />
        <Arrow label="poll status" />
        <DiagramNode tone="warning" title="ucmImportStatus" subtitle="SUCCEEDED / FAILED + error CSV" />
      </Diagram>
      <P>
        The same pipeline powers the interactive UI imports: the "Import and Export" jobs in the
        Navigator are FBDI templates underneath. If you learn one FBDI workflow you effectively know
        them all — only the template columns change.
      </P>

      <H2>The ZIP structure</H2>
      <P>
        An FBDI submission is a single .zip with two kinds of files:
      </P>
      <UL>
        <li>
          <strong>Data files</strong> — CSV/Excel sheets whose columns match the template exactly,
          including <strong>header row</strong> and <strong>required header codes</strong> like{" "}
          <K>Segment1</K>, <K>Segment2</K> for account segments.
        </li>
        <li>
          <strong>Control file</strong> — a .xml named to match (e.g.{" "}
          <K>loadInterfaceFile.xml</K>) that tells ESS which import job to run and which files feed
          it.
        </li>
      </UL>
      <CodeBlock
        language="xml"
        filename="Control file (ELAO/*.xml)"
        code={`<?xml version="1.0" encoding="UTF-8"?>
<importObject name="Accounting Entry">
  <importInterfaceFileDtl
    importInterfaceFileId="0"
    inputFileName="AccountingEntry_Data.csv"
    importObjectName="Accounting Entry"
    importObjectKey="ACCOUNTING_ENTRY_IFACE"
    importObjectPkgName="Import Accounting Entry"
    importServiceName="ImportAccountingEntryService"
  >
    <file
      fileName="AccountingEntry_Data.csv"
      mode="REPLACEMENT"
      name="AccountingEntryData"
    >
      <formula name="Formula1" formattedHeader="JournalHeader" />
      <formula name="Formula2" formattedHeader="JournalLine" />
    </file>
  </importInterfaceFileDtl>
</importObject>`}
      />
      <P>
        The critical parts to read out of the control file are the <strong>importObjectName</strong>{" "}
        and <strong>importServiceName</strong> — that string is the <strong>job name</strong> you
        will reuse when uploading and when checking status.
      </P>
      <Callout type="warning">
        Column names in the CSV <strong>must match the template</strong>, including distinct CSV
        header codes for flexfields. Reordering or renaming a column silently shifts data into the
        wrong attribute — a classic reason a "successful" import loads garbage.
      </Callout>

      <H2>How to get templates</H2>
      <P>
        You rarely hand-craft an FBDI file. Oracle publishes the official templates (with columns,
        dependencies, and notes) as downloadable .xlsx files, so your pipeline should start by
        fetching the correct template and mapping your source columns onto it.
      </P>
      <P>
        The common download points are the <strong>ERP Integration Service</strong> REST template
        resources (such as <K>procurementCommonResources</K> or the module-specific{" "}
        <K>exportImportTemplates</K>) and the docs portal. As a rule of thumb:
      </P>
      <CodeBlock
        language="bash"
        filename="Download an FBDI template (xlsx)"
        code={`curl -u "username:password" -O \\
  "https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/procurementCommonResources" \\
  -c cookies.txt >/dev/null

curl -u "username:password" \\
  "https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/exportImportTemplates?q=TemplateCode='SUPPLIER'" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  --output supplier-template.xlsx`}
      />
      <P>
        In practice most implementations <strong>one-time</strong>-download the template, verify it
        against their test instance, freeze it, and generate matching CSVs from that frozen layout.
      </P>

      <H2>Uploading and submitting</H2>
      <P>
        Once the ZIP is built you submit it with a <strong>multipart POST</strong> to the UCM
        dataloader endpoint. The essential parts are the file itself and the{" "}
        <K>importConfigAttributes</K> that name the job.
      </P>
      <CodeBlock
        language="bash"
        filename="Submit an FBDI load"
        code={`curl -u "username:password" \\
  -X POST \\
  "https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpintegrationservice/upload" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -F "file=@supplier_load.zip" \\
  -F "importConfigAttributes=processCode=DATALOADER, jobName=Import Suppliers, importObjectName=Import Suppliers"`}
      />
      <P>
        A successful POST returns the <strong>ProcessId</strong> and the documents created in UCM.
        Keep that ProcessId — it is your handle for polling, and it will pinpoint the job in the
        Navigator's Scheduled Processes list.
      </P>

      <H2>Polling for status</H2>
      <P>
        FBDI is asynchronous, so after submitting you poll ESS. The status resource lives under{" "}
        <K>erpintegrationservice</K> and takes the ProcessId from the upload response:
      </P>
      <CodeBlock
        language="bash"
        filename="Poll ESS for job status"
        code={`curl -u "username:password" \\
  "https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpintegrationservice/scheduling/jobsStatus/{processId}" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />
      <P>
        The response tells you whether the job is queued, running, <K>SUCCEEDED</K>, or{" "}
        <K>FAILED</K>. On failure, Fusion writes an <strong>error CSV</strong> back to UCM with a row
        per failed record and a message you can diff against your source data. The{" "}
        <strong>completion message</strong> in the status response tells you how many records loaded
        versus failed — your integration should treat anything less than "all rows OK" as a
        partial success and handle it explicitly.
      </P>
      <Callout type="info">
        Poll with a sensible cadence (for example every 30–60 s) and a maximum retry count. If the
        pod performing the job is busy, status may legitimately stay <K>RUNNING</K> for minutes on a
        large load.
      </Callout>

      <H2>The FBDI catalog per module</H2>
      <P>
        These are the file-based imports Oracle documents for Financials (guide{" "}
        <em>File-Based Data Import (FBDI) for Financials</em>). Every module page on this hub links
        back to the relevant rows. Names are release-stable, but always confirm the template exists
        in your instance's <K>File Based Data Import</K> folder before building a pipeline.
      </P>
      <DataTable
        headers={["Module", "FBDI imports (template names)"]}
        rows={[
          ["General Ledger", "Journal Import · Import and Calculate Daily Rates · Import Historical Rates · Import General Ledger Budget Balances · Budgetary Control Budget Import · Import Account Combinations · Import Segment Values and Hierarchies · Cross-Validation Rules Import · Chart of Accounts Mapping Rules Import"],
          ["Payables", "Payables Standard Invoice Import · Payables Payment Request Import · Supplier Bank Account Import (note: Suppliers / Sites / Contacts / Addresses FBDIs live in the Procurement FBDI guide)"],
          ["Receivables", "AutoInvoice Import · Receivables Standard Receipt Import · Customer Import (parties, accounts, sites, bank accounts) · Upload Customers · Credit Management Data Points Import"],
          ["Cash Management", "Cash Management Bank Statement Data Import · Bank Statement Reconciliation Data Import · Cash Position Data Import · External Transactions Import"],
          ["Fixed Assets", "Fixed Asset Mass Additions Import · Mass Adjustments · Mass Retirements · Mass Revaluations · Mass Transfers · Fixed Asset Lease Import · Import Units of Production · Physical Inventory Interface"],
          ["Expenses", "Third-party expense data (XML export/import and UCM upload) — verify in your instance; legacy Expense Report import templates are not in the current public FBDI guide"],
          ["Cross-module", "Intercompany Transaction Import · Subledger Accounting Mapping Set Values Import · Tax Entry Repository Data Upload · Budgetary Control Budget Import"],
        ]}
      />
      <Callout type="info">
        Two things consultants get wrong: <strong>Suppliers FBDI now ships with Procurement</strong>{" "}
        (not the Financials guide), and <strong>GL journals load via Journal Import into{" "}
        <K>GL_INTERFACE</K></strong> — there is no "journal" create REST resource. Both are covered
        on the module pages.
      </Callout>

      <H2>Fusion Data Loader vs FBDI vs ADFdi</H2>
      <P>
        The three terms are easy to blur. The distinction is <em>who builds the file</em> and{" "}
        <em>who submits it</em>:
      </P>
      <DataTable
        headers={["Tool", "Who uses it", "What it is", "Submission / API support"]}
        rows={[
          ["FBDI", "Integrators & administrators", "Batch file import (CSV + control file) driven by ESS", "REST upload (erpintegrationservice) or UI Scheduled Processes; API-friendly"],
          ["ADFdi (ADF Desktop Integrator)", "End users in Excel", "A spreadsheet add-in that bulk-edits Fusion data from an unlocked Excel template", "Interactive, user-driven; no public REST — for humans, not automation"],
          ["Web services / REST", "Integrators", "Synchronous CRUD on individual records", "fscmRestApi / hcmRestApi / SOAP"],
        ]}
      />
      <P>
        Practically: <strong>FBDI</strong> = you generate a file in OIC/ETL and submit it by REST.{" "}
        <strong>ADFdi</strong> = an accountant opens an Excel template in the UI and mass-edits
        expenses. Same validation pipeline underneath, different front doors.
      </P>

      <H2>FBDI gotchas</H2>
      <UL>
        <li>
          <strong>Account flexfield format</strong> — the segment concatenation must match the
          template (e.g. <K>01-120-00000</K> in exact order). Wrong segment order or stray hyphens
          fail validation with '"Segment1" is not valid'.
        </li>
        <li>
          <strong>Date formats</strong> — FBDI templates are picky (<K>YYYY-MM-DD</K> or as the
          template specifies). Locale formats slip through intl and break the job.
        </li>
        <li>
          <strong>Required header codes</strong> — each template has mandatory columns like{" "}
          <K>Source</K>, <K>Ledger</K>, <K>Date</K>; missing one fails the whole batch, not one row.
        </li>
        <li>
          <strong>Load order between objects</strong> — depend objects first. Suppliers and supplier
          sites must exist <em>before</em> you import invoices that reference them, and GL journals
          may depend on ledger setup. Plan the sequence in your orchestration.
        </li>
        <li>
          <strong>template version skew</strong> — a template from a different release (URL version)
          than your instance produces fields the pipeline ignores. Always re-validate after
          maintenance.
        </li>
      </UL>
      <Callout type="warning">
        FBDI offers no "undo." A loaded batch is a committed transaction in Fusion. Build a small
        test on your stage environment, verify counts and the error CSV, <em>then</em> promote the
        same file to production with the correct load order.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>
          See how OIC typically orchestrates the upload-and-poll pattern in{" "}
          <a className="font-semibold text-accent hover:underline" href="/oic/overview">
            OIC overview
          </a>
          .
        </li>
        <li>
          Prep your data correctly with the{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/concepts">
            core concepts
          </a>{" "}
          — flexfields and value sets.
        </li>
        <li>
          Choose REST vs FBDI per call in{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/rest-api">
            REST API fundamentals
          </a>
          .
        </li>
        <li>
          Look up which FBDI template to use for a task in the{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/tool-matrix">
            Tool Matrix
          </a>
          .
        </li>
      </UL>
    </>
  );
}
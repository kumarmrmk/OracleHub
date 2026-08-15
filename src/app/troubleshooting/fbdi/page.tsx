import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "FBDI Import Errors",
};

export default function FbdiErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="FBDI import errors"
        description="FBDI imports fail in predictable stages: upload, import job, and per-row validation. Learn each stage, how to read output.txt, and the handful of rejection patterns behind almost every failed row."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }, { label: "FBDI Import Errors" }]}
        updated="February 2025"
      />

      <H2>The import stages</H2>
      <P>
        Know which stage you're in before blaming the data. A failed upload is not the same as a
        rejected row.
      </P>
      <DataTable
        headers={["Stage", "What happens", "Where to look"]}
        rows={[
          ["Upload", "The .zip or .csv is sent to the UCM/upload service", "HTTP response, upload status"],
          ["Import job", "ESS runs the FBDI import process", "ESS job status (Succeeded / Warning / Error)"],
          ["Validation", "Each row is validated against setup and reference data", "output.txt / error messages per row"],
          ["Apply", "Valid rows are processed into the application", "Counts in output, records in the app"],
        ]}
      />

      <H2>How to read output.txt</H2>
      <P>
        The FBDI job's <K>output.txt</K> lists every row with its status. The classic pattern:
      </P>
      <CodeBlock
        language="text"
        filename="output.txt (excerpt)"
        code={`Total number of rows inserted successfully:  8
Total number of rows errored out:                3

ERR: Row 9 - Supplier not found for VENDOR_NUM=SUP-900
ERR: Row 14 - Invoice currency does not match supplier currency
ERR: Row 21 - Account combination is invalid: 01.1000.0000.0000`}
      />
      <Callout type="info">
        Fix the rows, not the process. Correct the data in the template, re-zip, and resubmit only
        the failed batch — a well-built loader is resumable.
      </Callout>

      <H2>Rejection patterns</H2>
      <DataTable
        headers={["Rejection", "Meaning", "Fix"]}
        rows={[
          ["Reference data not found", "Supplier/customer/item/account/period doesn't exist yet", "Load reference data first, or fix the code in the file"],
          ["Invalid lookup or status value", "A value isn't in the allowed list for this field", "Use the exact value the field's lookup allows"],
          ["Invalid account combination", "COA segments don't form a valid combination", "Fix segments or enable the combination in the COA"],
          ["Date or period issues", "Date maps to a closed or future period", "Use a date in the open period"],
          ["Tax code missing / invalid", "Line needs a tax code that isn't configured", "Add the tax code or correct it on the line"],
          ["Data type or length error", "Field holds text where a number is expected (or too long)", "Format the column exactly as the template expects"],
          ["Duplicate key", "The record already exists (or a duplicate was submitted)", "Use the update path, or check for prior loads"],
          ["Template mismatch", "Columns renamed/moved vs the released template", "Re-download the current template and re-map"],
        ]}
      />

      <H2>Prevention checklist</H2>
      <UL>
        <li>Use the <strong>latest template</strong> and keep the column headers exact.</li>
        <li>Load in dependency order: reference data → master data → transactions (see <a className="font-semibold text-accent hover:underline" href="/fusion/implementation">Implementation</a>).</li>
        <li>Validate with a small sample file before the full batch.</li>
        <li>Capture the import <K>jobStatus</K> from the upload response and poll it.</li>
        <li>Keep a reconciliation query (counts + totals) for every load.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">Troubleshooting hub</a>.</li>
        <li>The mechanics: <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">FBDI &amp; ADFdi</a>.</li>
        <li>Running a load from OIC: <a className="font-semibold text-accent hover:underline" href="/oic/fbdi-integration">FBDI integration</a>.</li>
      </UL>
    </>
  );
}
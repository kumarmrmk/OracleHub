import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import ToolMatrix from "@/components/ui/ToolMatrix";
import { toolMatrixRows } from "@/lib/tool-matrix";

export const metadata = {
  title: "Tool Matrix",
};

export default function ToolMatrixPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Tool Matrix"
        description="The implementer's lookup: 'I need to do X → which resource, template, or job do I use → where does the data land.' One searchable table covering Financials and Supply Chain, so you never juggle the REST guide, FBDI guide, and ESS list separately."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Technical Layer" }, { label: "Tool Matrix" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="How to use this page">
        Type in the box to filter by task, resource, or table — or click an area chip to see one
        module at a time. Every row gives you the <strong>tool</strong> and the{" "}
        <strong>target table</strong> together, so you can go from "what do I call?" straight to
        "where does it land?".
      </Callout>

      <ToolMatrix rows={toolMatrixRows} />

      <H2>Choosing the right tool</H2>
      <P>
        When the same business need has several rows, the default rule of thumb:
      </P>
      <DataTable
        headers={["Tool kind", "When to pick it"]}
        rows={[
          ["REST (real-time)", "One record, someone is waiting on the result, low volume"],
          ["FBDI (file)", "Thousands of records, no one is waiting, night batch"],
          ["FBDI → Job", "Bulk data that must go through the interface + import job (invoices, journals, receipts, POs)"],
          ["Job / erpProcesses", "Close, depreciation, revaluation, consolidation — background processes you trigger"],
        ]}
      />

      <H2>The tool families</H2>
      <UL>
        <li>
          <strong>REST payloads</strong> live under two bases: <K>fscmRestApi</K> (Financials:
          invoices, receipts, ledger) and <K>scmRestApi</K> (SCM: items, purchase orders,
          inventory). HCM uses <K>hcmRestApi</K>.
        </li>
        <li>
          <strong>FBDI templates</strong> are the bulk channel — a ZIP of CSV + an XML control file,
          uploaded to UCM, then processed by an ESS job.
        </li>
        <li>
          <strong>erpProcesses</strong> is the one REST resource that submits any ESS job
          programmatically — the glue behind close, depreciation, and mass imports.
        </li>
      </UL>
      <Callout type="warning">
        Resource names and FBDI template names drift between releases (e.g. legacy{" "}
        <K>apInvoices</K> / <K>arInvoices</K> no longer exist in 26C). Always confirm the exact name
        against your instance's REST service catalog and FBDI template list before building.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Ground the REST rows in <a className="font-semibold text-accent hover:underline" href="/fusion/rest-api">REST API Fundamentals</a>.</li>
        <li>See how the FBDI load order works in <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">FBDI &amp; ADFdi</a>.</li>
        <li>Driving any job programmatically is <a className="font-semibold text-accent hover:underline" href="/fusion/erp-processes">erpProcesses</a>.</li>
        <li>Browse the full data model on <a className="font-semibold text-accent hover:underline" href="/fusion/tables">Fusion Tables</a>.</li>
      </UL>
    </>
  );
}
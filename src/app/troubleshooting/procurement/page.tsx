import PageHeader, { H2, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "Procurement Errors",
};

export default function ProcurementErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="Procurement errors"
        description="Procurement failures are dominated by three things: supplier master, document status, and receiving/matching. Here is the symptom-to-fix map used on real implementations."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }, { label: "Procurement" }]}
        updated="August 2026"
      />

      <H2>Symptom → cause → fix</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["'Supplier not found' on a PO", "Supplier/site loaded after the document", "Load supplier → site before the PO (load order)"],
          ["Requisition stuck in In Approval", "Approval rule or approval group not set", "Set up the approval group and routing (BPM), then resubmit"],
          ["PO stays Incomplete", "Required fields missing or item inactive", "Complete required attributes / activate the item"],
          ["PO won't receive", "PO not approved/open, or item non-receivable", "Approve the PO and set the line as receivable"],
          ["3-way match hold", "Invoice qty ≠ receipt qty", "Receive the goods or adjust the invoice line"],
          ["Receipt fails on over-receipt", "Quantity exceeds tolerance", "Adjust the receipt or increase over-receipt tolerance"],
          ["PO import row rejected", "Supplier, item, or account invalid in the file", "Fix the file reference data and re-run the import"],
          ["Sourcing award won't generate PO", "Award/supplier/terms incomplete", "Finish supplier onboarding and award terms first"],
        ]}
      />

      <H2>Prevention checklist</H2>
      <UL>
        <li>Load suppliers and sites before any PO or requisition.</li>
        <li>Verify the item is active before the PO can be received.</li>
        <li>Confirm approval rules exist for the document type.</li>
        <li>Keep over-receipt tolerance aligned with the warehouse reality.</li>
      </UL>

      <Callout type="info">
        Deep dive: <a className="font-semibold text-accent hover:underline" href="/fusion/procurement">Procurement hub</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/requisitions">Requisitions</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/purchase-orders">Purchase Orders</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/receiving">Receiving</a>.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Receiving problems also show up as <a className="font-semibold text-accent hover:underline" href="/troubleshooting/payables">Payables matching errors</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">Troubleshooting hub</a>.</li>
      </UL>
    </>
  );
}
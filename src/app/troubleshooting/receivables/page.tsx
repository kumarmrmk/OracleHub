import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "Receivables Errors",
};

export default function ReceivablesErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="Receivables errors"
        description="AR failures concentrate in AutoInvoice, customer data, and receipt application. The fixes below cover the daily reality of an AR integration."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }, { label: "Receivables" }]}
        updated="February 2025"
      />

      <H2>Symptom → cause → fix</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["AutoInvoice rejects lines", "Lines have errors (bad trx type, customer, item, account)", "Fix the interface lines (RA_INTERFACE_LINES) and rerun"],
          ["'Customer not found'", "Customer/site isn't in the HZ party model", "Create the customer and bill-to site first"],
          ["Invoice not in aging/statements", "Status isn't Open (not posted/approved)", "Complete approval and post the transaction"],
          ["Transaction type error", "Transaction type not defined for the BU", "Set up the transaction type for the BU"],
          ["Credit memo can't apply", "Currency or amount mismatch", "Verify currency and that amounts are within the original"],
          ["Receipt reversal fails", "Receipt is already settled or applied", "Unapply/unreconcile before reversing"],
          ["Customer can't be saved", "HZ party required fields missing", "Fill the party name/number and required site fields"],
          ["Receipt can't be created", "Receipt method/remittance bank not set", "Set up the receipt method and remittance bank account"],
        ]}
      />

      <H2>Prevention checklist</H2>
      <UL>
        <li>Load customers (party + accounts + sites) before invoices.</li>
        <li>Validate the transaction type exists for the business unit.</li>
        <li>Run AutoInvoice with a small sample and read the interface error messages.</li>
        <li>Keep the AR period open for the transaction dates you load.</li>
      </UL>

      <Callout type="info">
        Deep dive: <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/autoinvoice">AutoInvoice</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/receipts">Receipts &amp; Lockbox</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/revenue">Revenue &amp; Credit Memos</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Customer/BU model</a>.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">Troubleshooting hub</a>.</li>
      </UL>
    </>
  );
}
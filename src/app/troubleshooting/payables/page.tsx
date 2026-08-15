import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "Payables Errors",
};

export default function PayablesErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="Payables errors"
        description="AP failures are dominated by three things: supplier setup, tax codes, and period state. Here is the symptom-to-fix map used on real implementations."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }, { label: "Payables" }]}
        updated="February 2025"
      />

      <H2>Symptom → cause → fix</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["Invoice validation fails — tax code", "Line lacks a valid tax code", "Set the correct tax code for the territory/entity"],
          ["'Supplier not found' or inactive", "Supplier doesn't exist or is inactive", "Create/activate the supplier first"],
          ["Invoice date period is closed", "The AP period for the date is closed", "Open the period or use the open one"],
          ["'Account combination is invalid'", "Distribution account isn't valid", "Fix the COA segment values on the distribution"],
          ["Duplicate invoice warning", "Duplicate check rules flagged it", "Review the duplicate and release/accept the hold"],
          ["Invoice stuck on hold", "Amount/tax/approval hold", "Find the hold in Invoice Actions, resolve, release"],
          ["Invoice not paid", "Approval not complete or payment group not run", "Approve the task, then run the payment process"],
          ["Payment failed to settle", "Bank account inactive / payment method not set up", "Verify bank account status and payment method"],
          ["Intercompany invoice errors", "Intercompany setup incomplete", "Configure intercompany org relationships"],
        ]}
      />

      <H2>Prevention checklist</H2>
      <UL>
        <li>Load suppliers (and their sites) before invoices — load order matters.</li>
        <li>Verify the tax code and its rate before submitting invoice lines.</li>
        <li>Check the AP period is open for the invoice date.</li>
        <li>Run a small sample through validation before a bulk load.</li>
      </UL>

      <Callout type="info">
        Deep dive: <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/invoices">Invoice Entry &amp; Validation</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/holds-matching">Holds &amp; PO Matching</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/payments">Payments &amp; PPR</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/tax">Tax</a>.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">Troubleshooting hub</a>.</li>
      </UL>
    </>
  );
}
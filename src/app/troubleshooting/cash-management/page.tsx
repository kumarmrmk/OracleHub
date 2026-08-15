import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "Cash Management Errors",
};

export default function CashManagementErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="Cash Management errors"
        description="Cash failures are usually about statement imports, reconciliation matching, and bank account setup."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }, { label: "Cash Management" }]}
        updated="February 2025"
      />

      <H2>Symptom → cause → fix</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["Statement import fails", "Wrong file format, encoding, or layout", "Check the format requirement (e.g. CAMT/BAI) and the ESS log"],
          ["No matches found in reconciliation", "Reconciliation rules don't cover the line", "Build matching rules (by date, amount, reference)"],
          ["Bank account not visible", "BU/data access doesn't include the account", "Grant the business unit/data access set"],
          ["Cash position is wrong", "Lines aren't reconciled", "Reconcile or exclude the pending lines"],
          ["Payment/transfer error", "Bank account status is inactive", "Activate the bank account or use the right one"],
          ["Duplicate bank lines", "Same statement imported twice", "Check the statement ID and reconcile/void the duplicate"],
        ]}
      />

      <H2>Prevention checklist</H2>
      <UL>
        <li>Confirm the statement file format and encoding before import.</li>
        <li>Define reconciliation rules that match your payment references.</li>
        <li>Keep bank accounts active and linked to the right BU/ledger.</li>
      </UL>

      <Callout type="info">
        Deep dive: <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/statements">Bank Statements &amp; BAI2</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/reconciliation">Reconciliation &amp; Forecasting</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/bank-setup">Banks &amp; Accounts</a>.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">Troubleshooting hub</a>.</li>
      </UL>
    </>
  );
}
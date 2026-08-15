import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "Expenses Errors",
};

export default function ExpensesErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="Expenses errors"
        description="Expense failures sit in approvals, card transaction imports, and accounting creation. Most are setup or workflow issues."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }, { label: "Expenses" }]}
        updated="February 2025"
      />

      <H2>Symptom → cause → fix</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["Report stuck in approval", "Approver/route missing or group misconfigured", "Fix the approval group/routing and resubmit"],
          ["Line rejected by policy", "Expense policy violation (limit, receipt, type)", "Adjust the line or get an exception approved"],
          ["Corporate card transaction missing", "Card import hasn't run", "Run the credit card transaction import"],
          ["No accounting created", "Create Accounting / posting not run", "Run Create Accounting and post to the GL"],
          ["Tax code invalid on line", "Tax setup doesn't cover the expense category", "Fix the tax code or the expense type mapping"],
          ["Currency/rate error", "Rate missing for the expense date", "Enter the daily rate and resubmit"],
        ]}
      />

      <H2>Prevention checklist</H2>
      <UL>
        <li>Map expense types to valid accounts and tax codes before first use.</li>
        <li>Check the approval group for each department before reports arrive.</li>
        <li>Run card transaction import before month-end reporting.</li>
      </UL>

      <Callout type="info">
        Deep dive: <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses/approval-audit">Approval, Audit &amp; Reimbursement</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses/card-programs">Corporate Card Programs</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses/templates-policies">Templates &amp; Policies</a>.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">Troubleshooting hub</a>.</li>
      </UL>
    </>
  );
}
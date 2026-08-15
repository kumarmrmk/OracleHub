import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "General Ledger Errors",
};

export default function GlErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="General Ledger errors"
        description="GL failures cluster around periods, accounts, balancing, and posting. Most are setup or period-state problems, not bugs."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }, { label: "General Ledger" }]}
        updated="February 2025"
      />

      <H2>Symptom → cause → fix</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["Journal won't post", "GL period is closed or future-entry", "Post to the open period, or reopen the period"],
          ["'Invalid account combination'", "COA segments form no valid combination", "Correct the segments or enable the combination"],
          ["'Segment value disabled/inactive'", "A segment value is disabled in its value set", "Re-enable the value or use a valid one"],
          ["Journal out of balance", "Debits don't equal credits", "Balance the entry before posting"],
          ["Sub-ledger entries missing from GL", "Create Accounting / GL interface didn't run or post", "Re-run the GL interface transfer and post journals"],
          ["Revaluation or translation fails", "No daily rate for the period", "Enter the rate, then re-run"],
          ["Balances look wrong", "Not all journals posted", "Confirm every journal is posted; check the period close"],
          ["User can't see an account", "Segment value security or data access set", "Grant segment access / add the ledger to a data access set"],
          ["Budget journal fails", "Budget entry setup incomplete", "Set up budget types/entries for the ledger"],
        ]}
      />

      <H2>Prevention checklist</H2>
      <UL>
        <li>Check <K>GL_PERIOD_STATUSES</K> before any bulk load, not after the failure.</li>
        <li>Post sub-ledger accounting first, then GL close steps, then close periods.</li>
        <li>Enter daily rates for all foreign currency accounts before revaluation.</li>
        <li>Keep segment value security aligned with the duties that need access.</li>
      </UL>

      <Callout type="info">
        Deep dive: <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/journals">Journals &amp; Posting</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/period-close">Period Close</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/multi-currency">Multi-Currency</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financial-close">Financial Close</a>.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">Troubleshooting hub</a>.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "Fixed Assets Errors",
};

export default function FixedAssetsErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="Fixed Assets errors"
        description="Fixed Assets failures revolve around the depreciation calendar, book setup, and GL accounts. The period table is the first thing to check."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }, { label: "Fixed Assets" }]}
        updated="February 2025"
      />

      <H2>Symptom → cause → fix</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["Depreciation run fails", "No open period for the book in FA_DEPRN_PERIODS", "Open the next depreciation period for the book"],
          ["Asset not depreciating", "No date placed in service, or book mismatch", "Set the date in FA_BOOKS and confirm the book/method"],
          ["GL post of depreciation fails", "Asset account combination invalid", "Fix the asset account mapping and re-post"],
          ["Asset addition rejected", "Category/book setup incomplete", "Check the category's book and capitalization rules"],
          ["Retirement errors", "Proceeds or disposal account invalid", "Verify the distribution account and proceeds account"],
          ["Mass addition problems", "Template mapping mismatches", "Correct the mass addition template mapping"],
          ["Depreciation amounts look wrong", "Wrong method, life, or prorate convention", "Review the book controls and asset's book values"],
        ]}
      />

      <H2>Prevention checklist</H2>
      <UL>
        <li>Always check <K>FA_DEPRN_PERIODS</K> for the open period before running depreciation.</li>
        <li>Confirm the asset book, method, life, and date placed in service for every addition.</li>
        <li>Map asset accounts in the GL before posting depreciation.</li>
      </UL>

      <Callout type="info">
        Deep dive: <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/depreciation">Depreciation &amp; Revaluation</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/additions">Additions &amp; Mass Additions</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/fixed-assets/books-setup">Asset Books &amp; Setup</a>.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">Troubleshooting hub</a>.</li>
      </UL>
    </>
  );
}
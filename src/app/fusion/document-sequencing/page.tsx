import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "Document Sequencing",
};

export default function DocumentSequencingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Document Sequencing"
        description="The numbering engine behind legally significant documents: AR invoices, receipt numbers, and payment numbers. Sequences control gaps, ranges, and which documents get a number at all."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Document Sequencing" }]}
        updated="February 2025"
      />

      <H2>What document sequencing does</H2>
      <P>
        Many documents must be numbered without gaps for tax and audit reasons. Fusion assigns a{" "}
        <strong>sequence</strong> to <strong>document types</strong> — like invoice, credit memo, or
        payment — so each gets the next number in a controlled range.
      </P>

      <H2>Core concepts</H2>
      <DataTable
        headers={["Concept", "What it is"]}
        rows={[
          ["Document type", "A category of documents that needs numbers (Invoice, Credit Memo, Payment)"],
          ["Document category", "Groups document types (Accounts Receivable, Payments, Purchasing)"],
          ["Sequence", "A numbered range (e.g. AR-2025-0001 to AR-2025-9999) with effective dates"],
          ["Entry type", "Automatic (system assigns) / Manual (user enters) / None"],
          ["Gapless control", "Ensures numbers are used in order with no gaps (strong audit requirement)"],
          ["Range control", "Defines the numeric window the sequence may assign"],
        ]}
      />

      <H2>Where numbering is applied</H2>
      <DataTable
        headers={["Module", "Documents that get sequences"]}
        rows={[
          ["Receivables", "AR invoices, credit/debit memos, chargebacks, receipts"],
          ["Payables", "Payment numbers (checks, EFT) and invoice numbers if required"],
          ["Cash Management", "Bank transfers and other cash documents"],
          ["Purchasing", "Purchase orders where legal numbering is needed"],
        ]}
      />

      <H2>Setup essentials</H2>
      <UL>
        <li>Define document types for the business units that need them.</li>
        <li>Attach a sequence with a realistic range and effective dates.</li>
        <li>Use <strong>automatic entry</strong> for audit-sensitive docs; manual entry only for exceptions.</li>
        <li>Turn on gapless control only where law requires it — it slows processing.</li>
      </UL>

      <H2>Integration notes</H2>
      <UL>
        <li>An import creating AR invoices must let Fusion assign the number — don't force your own.</li>
        <li>If you send a document number, the sequence may reject or ignore it — check the document type's entry type.</li>
        <li>Range exhaustion is a classic end-of-year failure: open a new sequence for the next period.</li>
      </UL>

      <Callout type="info">
        Seen in practice on the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables</a> and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a> pages.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to <a className="font-semibold text-accent hover:underline" href="/fusion/concepts">Core Concepts</a>.</li>
        <li>Numbering failures in imports: <a className="font-semibold text-accent hover:underline" href="/troubleshooting/fbdi">FBDI errors</a>.</li>
      </UL>
    </>
  );
}
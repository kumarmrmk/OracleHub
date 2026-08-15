import PageHeader, { H2, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "Inventory Errors",
};

export default function InventoryErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="Inventory errors"
        description="Inventory failures are dominated by three things: item master definition, organization context, and on-hand/reconciliation. Here is the symptom-to-fix map used on real implementations."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }, { label: "Inventory" }]}
        updated="August 2026"
      />

      <H2>Symptom → cause → fix</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["Item not found on a receipt/transfer", "Item not defined in that organization", "Assign the item to the correct inventory org"],
          ["Item rejects on-hand transaction", "Item status inactive/draft", "Set the item to Active"],
          ["On-hand looks wrong", "Subinventory/organization context of the query", "Filter by the correct org + subinventory"],
          ["Transfer fails", "Missing subinventory or transfer type", "Define the subinventories and transfer reason/type"],
          ["Reservation not visible", "Wrong demand source or reservation type", "Match the reservation to the order/project source"],
          ["Cycle count variance big", "Count errors or movement not posted", "Recount; verify all transactions are posted"],
          ["Cost/adjustment not in GL", "Cost or account mapping not set up", "Set up the item cost and the cost/GL account mapping"],
        ]}
      />

      <H2>Prevention checklist</H2>
      <UL>
        <li>Define the item in the organization before any quantity moves.</li>
        <li>Keep items Active before transacting.</li>
        <li>Verify org/subinventory context in every query and integration.</li>
        <li>Set up the item cost and GL accounts before the first movement.</li>
      </UL>

      <Callout type="info">
        Deep dive: <a className="font-semibold text-accent hover:underline" href="/fusion/inventory">Inventory hub</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/inventory/items">Items &amp; Item Master</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/inventory/onhand">On-hand &amp; Transfers</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/inventory/counting">Cycle Counting</a>.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Inventory value issues surface in <a className="font-semibold text-accent hover:underline" href="/troubleshooting/gl">General Ledger</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">Troubleshooting hub</a>.</li>
      </UL>
    </>
  );
}
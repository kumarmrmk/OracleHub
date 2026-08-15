import PageHeader, { H2, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "Order Management Errors",
};

export default function OrderManagementErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="Order Management errors"
        description="Order failures are dominated by three things: order validity, availability, and fulfillment-to-shipping. Here is the symptom-to-fix map used on real implementations."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }, { label: "Order Management" }]}
        updated="August 2026"
      />

      <H2>Symptom → cause → fix</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["Order line rejects — customer not found", "Customer master (HZ) missing", "Load customer/account/site before the order"],
          ["Item not orderable", "Item not sellable or not in the org", "Make the item sellable in the sales org"],
          ["Order stuck in Incomplete/Booked", "Validation or approval not finished", "Complete required fields / clear holds"],
          ["Promise date far out", "Availability (on-hand − reserved) too low", "Check on-hand; reduce quantity or replenish"],
          ["Can't reserve", "No on-hand in the reservable org", "Confirm the reservation org matches demand"],
          ["Order doesn't reach Shipping", "Fulfillment not completing (pick/pack)", "Check fulfillment lines and release to shipping"],
          ["Ship confirmation fails", "Inventory transaction / carrier setup", "Verify the shipping org and carrier setup"],
          ["No AR invoice after ship", "Billing integration/rule not triggered", "Check ship-confirm → AR interface hand-off"],
        ]}
      />

      <H2>Prevention checklist</H2>
      <UL>
        <li>Create the customer master and sellable items before the order.</li>
        <li>Check availability (on-hand − reserved) before promising a date.</li>
        <li>Make sure fulfillment/order orchestration is configured for your order type.</li>
        <li>Verify ship-confirm drives the AR invoice in Receivables.</li>
      </UL>

      <Callout type="info">
        Deep dive: <a className="font-semibold text-accent hover:underline" href="/fusion/order-management">Order Management hub</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/order-management/sales-orders">Sales Orders &amp; Fulfillment</a> ·{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/order-management/shipping">Shipping &amp; Logistics</a>.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Billing issues continue in <a className="font-semibold text-accent hover:underline" href="/troubleshooting/receivables">Receivables</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">Troubleshooting hub</a>.</li>
      </UL>
    </>
  );
}
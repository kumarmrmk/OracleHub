import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Order-to-Cash (O2C)",
};

export default function O2cPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud · Business Cycles"
        title="Order-to-Cash (O2C)"
        description={<>The cycle that turns sales into cash: order → shipment → AR invoice → <Term k="autoinvoice">AutoInvoice</Term> → receipt → <Term k="lockbox">lockbox</Term> → collections. It spans Receivables, Cash Management, and the GL, and it is where billing automation (AutoInvoice) and receipt automation (<Term k="autocash">AutoCash</Term>, lockbox) live.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Business Cycles", href: "/fusion/financials/cycles" }, { label: "Order-to-Cash" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/autoinvoice">AutoInvoice</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/receipts">Receipts &amp; Lockbox</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/credit-collections">Collections</a> first.
      </Callout>

      <H2>The business story</H2>
      <P>
        A customer orders, you ship, you bill, they pay, and you reconcile the cash. Order-to-Cash is
        the mirror image of Procure-to-Pay — where P2P spends money, O2C earns it. The two automation
        engines are <Term k="autoinvoice"><strong>AutoInvoice</strong></Term> (turns billing lines into AR invoices in bulk) and{" "}
        <Term k="autocash"><strong>AutoCash</strong></Term> / <Term k="lockbox"><strong>lockbox</strong></Term> (turns bank payment files into applied receipts).
      </P>

      <H2>The cycle at a glance</H2>
      <Diagram title="Order-to-Cash flow" className="mb-8">
        <DiagramNode tone="neutral" icon="🛒" title="Order" subtitle="sales order · from CRM/CPQ" />
        <Arrow />
        <DiagramNode tone="neutral" icon="🚚" title="Shipment" subtitle="goods leave the warehouse" />
        <Arrow />
        <DiagramNode tone="fusion" icon="🧾" title="AR Invoice" subtitle="AutoInvoice · bill the customer" />
        <Arrow />
        <DiagramNode tone="warning" icon="🏦" title="Receipt" subtitle="lockbox / AutoCash / manual" />
        <Arrow />
        <DiagramNode tone="warning" icon="💼" title="Collections" subtitle="follow up what's late" />
        <Arrow />
        <DiagramNode tone="success" icon="✅" title="Cash in bank" subtitle="reconciled to the GL" />
      </Diagram>

      <H2>Step by step — where the data lands</H2>
      <DataTable
        headers={["Step", "What happens", "Module", "Table / surface"]}
        rows={[
          ["1", "Customer places an order (from CPQ, CRM, or an external system)", "Order Management / Sales", "OE_ORDER_HEADERS / order APIs (or CPQ/CRM)"],
          ["2", "Order is shipped — fulfillment updates inventory", "Inventory / Shipping", "INV / RCV tables"],
          ["3", <>Billing lines are staged for <Term k="autoinvoice">AutoInvoice</Term></>, "Receivables", "RA_INTERFACE_LINES_ALL / AutoInvoice Import FBDI"],
          ["4", "Import AutoInvoice validates and creates the AR invoice", "Receivables", "RA_CUSTOMER_TRX_ALL, RA_CUSTOMER_TRX_LINES_ALL"],
          ["5", "Accounting is created for the invoice", "SLA", "XLA_AE_HEADERS / XLA_AE_LINES (Create Accounting)"],
          ["6", <>Customer pays — the bank file comes in via <Term k="lockbox">lockbox</Term></>, "Receivables", "AR_PAYMENTS_INTERFACE_ALL → Process Receipts Through Lockbox"],
          ["7", <>Receipts are applied to invoices (<Term k="autocash">AutoCash</Term>/<Term k="automatch">AutoMatch</Term>/manual)</>, "Receivables", "AR_CASH_RECEIPTS_ALL, AR_RECEIVABLE_APPLICATIONS_ALL"],
          ["8", "Late balances go to collections with dunning and follow-up", "Receivables", "Collections work areas / collectionPromises REST"],
        ]}
      />

      <H2>The two automation engines</H2>
      <H3>AutoInvoice</H3>
      <P>
        AutoInvoice reads <K>RA_INTERFACE_LINES_ALL</K>, applies <strong>grouping rules</strong> (what
        becomes one invoice) and <strong>line ordering rules</strong> (the order lines print), runs{" "}
        <strong>AutoAccounting</strong> (derives accounts from customer and line), and creates the AR
        transactions. Rejected lines stay in the interface with a reason — the execution report tells
        you exactly what failed.
      </P>
      <H3>AutoCash &amp; lockbox</H3>
      <P>
        Lockbox imports the bank's payment file into <K>AR_PAYMENTS_INTERFACE_ALL</K>. The{" "}
        <K>Process Receipts Through Lockbox</K> job creates receipts, then{" "}
        <Term k="autocash"><strong>AutoCash</strong></Term> applies them to open invoices using <Term k="automatch"><strong>AutoMatch</strong></Term> (a
        weighted score on amount, reference, and date) and your <strong>application rule sets</strong>.
      </P>

      <H2>Worked example — one customer payment through O2C</H2>
      <Callout type="example" title="Worked example: invoice $5,000, customer pays">
        <p className="mb-2"><strong>The invoice:</strong> AutoInvoice creates AR invoice INV-1001 for $5,000 + $250 output tax = $5,250 due.</p>
        <p className="mb-2"><strong>Accounting:</strong> Dr AR trade receivable 5,250 · Cr Revenue 5,000 · Cr Output tax 250.</p>
        <p className="mb-2"><strong>The payment:</strong> the bank file shows $5,250 from "Customer Co" — AutoMatch scores it against INV-1001 (amount matches) and applies it in full.</p>
        <p className="mb-2"><strong>Accounting:</strong> Dr Cash/bank 5,250 · Cr AR trade receivable 5,250.</p>
        <p className="mb-0"><strong>The reconciliation:</strong> the bank statement line matches the receipt in Cash Management, and the receivable is cleared.</p>
      </Callout>

      <H2>Common failure points</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["AutoInvoice rejects lines", "Bad transaction type, customer, item, or account", "Read the execution report, fix RA_INTERFACE_LINES_ALL, rerun"],
          ["Customer not found", "Customer master (HZ) loaded after the billing lines", "Load customers before billing"],
          ["Receipt not applied", "AutoCash rules can't find the invoice", "Check reference/amount and the AutoCash rule set"],
          ["Invoice in Draft", "Transaction not completed/posted", "Complete and post the transaction"],
          ["Lockbox import fails", "Wrong file format or unmapped bank account", "Check the lockbox transmission format and bank setup"],
          ["Late payments not chased", "No collections strategy or aging bucket", "Assign a strategy and define aging buckets"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Customers first:</strong> party → account → site must exist before AutoInvoice runs.</li>
        <li><strong>AutoInvoice is interface-driven:</strong> stage lines, run the import job, read the execution report — there is no "create invoice" REST for bulk.</li>
        <li><strong>Receipts come from the bank:</strong> lockbox files are the reliable path; <K>standardReceipts</K> REST covers the small manual cases.</li>
        <li><strong>Deferred revenue:</strong> if the sale spans periods, invoice with revenue rules and let the Recognize Revenue job release it.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>See the money-in side in <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables</a>.</li>
        <li>Follow the cash into the bank in <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/reconciliation">Reconciliation &amp; Forecasting</a>.</li>
        <li>See the counterpart cycle that spends money: <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/p2p">Procure-to-Pay</a>.</li>
      </UL>
    </>
  );
}
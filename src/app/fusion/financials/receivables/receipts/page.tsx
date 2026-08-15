import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Receipts & Lockbox",
};

export default function ReceiptsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Receipts & Lockbox"
        description={<>How Receivables collects money against AR invoices. Receipts come in from banks via <Term k="lockbox">lockbox</Term>, from customers directly, or through automatic direct debit — then get applied to open transactions with <Term k="autocash">AutoCash</Term>, <Term k="automatch">AutoMatch</Term>, or manual rules.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Receivables (AR)", href: "/fusion/financials/receivables" }, { label: "Receipts & Lockbox" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables hub</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/autoinvoice">AutoInvoice</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management">Cash Management</a> first. Applying receipts assumes the invoices already exist.
      </Callout>

      <H2>Functional view</H2>
      <P>
        A <strong>receipt class</strong> (Customer, Misc, Short-term Debt) and a{" "}
        <strong>receipt method</strong> define how money is received, remitted, and cleared. A
        receipt can be entered manually, created from a lockbox file, or generated automatically
        (SEPA / ISO direct debit). Every receipt then needs to be <strong>applied</strong> to open
        transactions.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Receipt class", "Categorizes how money arrives (customer payment, miscellaneous, short-term debt)"],
          ["Receipt method", "Defines creation, remittance, and clearance behavior (check, wire, credit card, direct debit)"],
          ["Application rule set", "Rules that control how a receipt is applied to transactions (order, proration)"],
          ["AutoCash rule set", "Automatic matching of unapplied receipts to open items using customer number, invoice number, amounts"],
          ["AutoMatch rule set", "Weighted-threshold matching of receipts to invoices when the reference is ambiguous"],
          ["Lockbox", "Bank files of received payments loaded into the receipt interface and processed into receipts"],
          ["Unapplied / unidentified receipt", "Money received that could not be matched to an invoice — must be resolved by a collector"],
          ["Adjustment", "Write-offs, chargebacks, and refunds that change what is owed"],
        ]}
      />
      <Diagram title="Receipt lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Receipt created" subtitle="manual / lockbox / direct debit" />
        <Arrow label="cleared" />
        <DiagramNode tone="warning" title="Remit & clear" subtitle="receipt method and bank account" />
        <Arrow label="apply" />
        <DiagramNode tone="success" title="Applied" subtitle="AutoCash / AutoMatch / manual" />
        <Arrow label="unmatched" />
        <DiagramNode tone="warning" title="Unapplied / unidentified" subtitle="collector resolves, adjusts, or refunds" />
      </Diagram>
      <P>
        <strong>Application exception rule sets</strong> catch borderline matches for review instead
        of auto-applying them. <strong>Cross-currency receipts</strong> convert to the invoice
        currency using the configured conversion rate type. <strong>Receipt-to-receipt
        applications</strong> move value between receipts (for example reclassifying a misc receipt),
        and <strong>write-offs</strong>, <strong>chargebacks</strong>, and <strong>refunds</strong>{" "}
        are handled through adjustments. <strong>Reversing or unapplying</strong> a receipt returns
        its applications to the open transactions.
      </P>

      <H2>Configuration</H2>
      <P>Set up the money-in plumbing before receiving any payments.</P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Receipt classes & receipt methods", "Defines creation, remittance, and clearance for each payment type", "Receivables setup → Receipt classes & receipt methods"],
          ["Application rule sets", "Controls how receipts are applied to transactions", "Receivables setup → Application rule sets"],
          ["AutoCash rule sets", "Automatic matching of receipts to open items", "Receivables setup → AutoCash rule sets"],
          ["AutoMatch rule sets", "Weighted-threshold matching with exception rules", "Receivables setup → AutoMatch rule sets"],
          ["Lockbox setup", "Bank transmission formats and mapping into the receipt interface", "Receivables setup → Lockbox"],
          ["Bank accounts & remittance banks", "Where receipts clear and are remitted", "Cash Management bank setup"],
        ]}
      />
      <Callout type="info">
        Receipt methods and bank accounts must line up — a receipt method with the wrong bank or
        clearance behavior produces remittance or reconciliation errors downstream in Cash
        Management.
      </Callout>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">standardReceipts</K>, "Create/update/delete standard receipts directly (with or without applications)"],
          [<K key="r2">receivablesAdjustments</K>, "Read adjustments (write-offs, chargebacks, refunds) against receipts and transactions"],
          [<K key="r3">receiptMethods</K>, "Read receipt method definitions"],
          [<K key="r4">receiptMethodAssignments</K>, "Create/update assignments of receipt methods to business units / remittance banks"],
          [<K key="r5">erpProcesses</K>, "Submit the Process Receipts Through Lockbox ESS job to build receipts from AR_PAYMENTS_INTERFACE_ALL"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Receivables Standard Receipt Import</K>, "Bulk-load receipts from a bank or clearing house into AR_PAYMENTS_INTERFACE_ALL, then run Process Receipts Through Lockbox", "Customer account, receipt method, remittance bank, open GL/AR period"],
        ]}
      />
      <Callout type="info">
        The Receivables Standard Receipt Import FBDI loads into <K>AR_PAYMENTS_INTERFACE_ALL</K>;
        the receipts are only created when the <K>Process Receipts Through Lockbox</K> ESS job runs
        (via <K>erpProcesses</K> or the Scheduled Processes work area). Confirm the template columns
        against your instance before building the interface file.
      </Callout>
      <H3>Working example — create a receipt via REST</H3>
      <CodeBlock
        language="bash"
        filename="POST /standardReceipts"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/standardReceipts" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "CustomerId": 987654,
    "ReceiptNumber": "RC-2026-0001",
    "ReceiptDate": "2026-08-14",
    "ReceiptCurrencyCode": "USD",
    "ReceiptMethod": "WIRETRANSFER",
    "ReceiptAmount": 5000
  }'`}
      />
      <H3>Working example — run lockbox processing via erpProcesses</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "ProcessName": "Process Receipts Through Lockbox",
    "ProcessParameters": {
      "Receipt Source": "OCI Bank Lockbox"
    }
  }'`}
      />
      <Callout type="info">
        The <K>erpProcesses</K> payload parameters must match the Process Receipts Through Lockbox
        scheduled process definition in your instance — confirm the parameter names before
        automating.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>Where each step of the receipt chain lands in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Bank lockbox file is received from the bank", "External bank file"],
          ["2", "Receivables Standard Receipt Import FBDI loads the payments", <K key="t1">AR_PAYMENTS_INTERFACE_ALL</K>],
          ["3", "Process Receipts Through Lockbox ESS job creates the receipts", <K key="t2">AR_CASH_RECEIPTS_ALL</K>],
          ["4", "Receipts are applied with AutoCash, AutoMatch, or manually", <K key="t3">AR_RECEIVABLE_APPLICATIONS_ALL</K>],
          ["5", "Unapplied / unidentified receipts are resolved by collectors; adjustments (write-offs, chargebacks) are recorded", <span key="t4cell"><span key="c0"><K key="t4">AR_RECEIVABLE_APPLICATIONS_ALL</K> (status)</span>, adjustment records</span>],
          ["6", "Create Accounting posts the receipt and application entries", <K key="t5">XLA_AE_HEADERS</K>, <K key="t6">XLA_AE_LINES</K>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data
        dictionary. Exact names can vary slightly by release — confirm against your instance&apos;s data
        dictionary before relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect receipts and their applications.</P>
      <CodeBlock
        language="sql"
        filename="ar_cash_receipts.sql"
        code={`-- Receipts for a status in a date range
SELECT r.cash_receipt_id, r.receipt_number, r.receipt_date,
       r.receipt_amount, r.receipt_currency_code, r.type, r.status,
       r.receipt_method_id, r.remittance_bank_account_id
FROM   ar_cash_receipts_all r
WHERE  r.receipt_date >= :p_from_date
AND    r.status = :p_status
ORDER BY r.receipt_date, r.receipt_number;`}
      />
      <CodeBlock
        language="sql"
        filename="ar_receivable_applications.sql"
        code={`-- Applications of a receipt against customer transactions
SELECT a.cash_receipt_id, r.receipt_number, a.customer_trx_id, t.trx_number,
       a.amount_applied, a.apply_date, a.status
FROM   ar_receivable_applications_all a
JOIN   ar_cash_receipts_all r  ON r.cash_receipt_id = a.cash_receipt_id
JOIN   ra_customer_trx_all t   ON t.customer_trx_id = a.customer_trx_id
WHERE  a.cash_receipt_id = :cash_receipt_id
ORDER BY a.apply_date;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>Receipts create entries through the sub-ledger accounting engine:</P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Receipt created (unapplied)", "Cash / remittance bank (or unapplied)", "Suspense / unapplied receipts"],
          ["Receipt applied to invoice", "Unapplied receipts", "AR trade receivable"],
          ["Payment cleared", "Remittance bank", "Settlement cash / bank"],
        ]}
      />
      <P>
        Trace entries via <K>XLA_AE_HEADERS</K> / <K>XLA_AE_LINES</K> — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Receipt Register, Remittance Register", "Delivered BIP reports (Reports &amp; Analytics)"],
          ["Receivables Receipts Real Time", "OTBI subject area"],
          ["Lockbox process summary", "Process output from the lockbox run"],
          ["Bank reconciliation", "Cash Management (after clearance)"],
        ]}
      />

      <H2>Worked example — one receipt applied</H2>
      <WorkedExample
        title="Worked example: customer pays $5,250 against INV-1001"
        intro={
          <>
            The open receivable INV-1001 is <strong>$5,250</strong>. The customer's payment of the
            full amount arrives in the bank file.
          </>
        }
        steps={[
          {
            label: "1 · From bank file to receipt",
            body: (
              <>
                The lockbox file stages the payment in <K>AR_PAYMENTS_INTERFACE_ALL</K>; Process
                Receipts Through Lockbox creates the receipt in <K>AR_CASH_RECEIPTS_ALL</K>.
              </>
            ),
          },
          {
            label: "2 · Apply and account",
            body: (
              <>
                <Term k="autocash">AutoCash</Term>/<Term k="automatch">AutoMatch</Term> matches by amount and reference and applies it in full in{" "}
                <K>AR_RECEIVABLE_APPLICATIONS_ALL</K>. Create Accounting posts:
              </>
            ),
          },
        ]}
        journal={[
          { account: "01-1000-000 — Cash / remittance bank", debit: "$5,250" },
          { account: "01-1200-000 — AR trade receivable", credit: "$5,250" },
        ]}
        outcome={
          <>
            The receivable is cleared. <strong>Partial-payment test:</strong> pay only{" "}
            <strong>$5,000</strong> and AutoMatch applies $5,000, leaving <strong>$250</strong> open —
            exactly what collections chases.
          </>
        }
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Lockbox first:</strong> bulk receipts stage into AR_PAYMENTS_INTERFACE_ALL and are only created when Process Receipts Through Lockbox runs.</li>
        <li><strong>Interface rows fail loudly:</strong> rejected rows stay in the interface with reasons — read them, fix the mapping or data, and re-run.</li>
        <li><strong>Direct creation:</strong> <K>standardReceipts</K> (C/U/D) creates receipts directly; you still apply them (via REST, rules, or the work area).</li>
        <li><strong>Unapplied needs owners:</strong> AutoCash / AutoMatch won&apos;t resolve everything — plan exception handling with application exception rule sets.</li>
        <li><strong>Cross-currency and SEPA/ISO direct debit</strong> need the right receipt method, conversion type, and bank account setup before go-live.</li>
        <li><strong>Adjustments:</strong> write-offs, chargebacks, and refunds are adjustments — read them via <K>receivablesAdjustments</K> (GET).</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/receivables">Receivables troubleshooting</a>{" "}
        for the most common receipt and lockbox failures.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables (AR)</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Billing that feeds these receipts starts in <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/autoinvoice">AutoInvoice</a>.</li>
        <li>Cleared receipts flow into <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management">Cash Management</a>.</li>
        <li>Chasing the money you haven&apos;t collected yet is <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/credit-collections">Credit Management &amp; Collections</a>.</li>
      </UL>
    </>
  );
}
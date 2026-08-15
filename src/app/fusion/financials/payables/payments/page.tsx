import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Payments & PPR",
};

export default function PaymentsPprPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Payments & PPR"
        description={<>How approved invoices become payments through the <Term k="ppr">Payment Process Request (PPR)</Term>, and how to create, format, and transmit payment files to your bank.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Payables (AP)", href: "/fusion/financials/payables" }, { label: "Payments & PPR" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables hub</a> and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/invoices">Invoice Entry &amp; Validation</a> first. Only invoices that are validated, approved, posted, and free of holds are payable.
      </Callout>

      <H2>Functional view</H2>
      <P>
        The <strong>Payment Process Request (PPR)</strong> is the engine that turns approved invoices
        into payments. You build a PPR, select the invoices to pay, validate the selection, generate
        a payment file in a defined format, transmit it to the bank, and confirm it. The lifecycle is
        driven by payment process profiles, payment methods, and payment formats.
      </P>
      <Diagram title="Payment Process Request lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Create PPR" subtitle="select invoices to pay" />
        <Arrow label="validate" />
        <DiagramNode tone="warning" title="Validate" subtitle="check funds, holds, approval" />
        <Arrow label="build" />
        <DiagramNode tone="warning" title="Build payment file" subtitle="format per payment method" />
        <Arrow label="transmit" />
        <DiagramNode tone="warning" title="Format & transmit" subtitle="EFT / ACH / SEPA / check / wire" />
        <Arrow label="confirm" />
        <DiagramNode tone="success" title="Confirm" subtitle="payments recorded" />
      </Diagram>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Payment process profile", "Defaults that control who to pay, how, and with which rules"],
          ["Payment method", "How money is delivered (EFT, ACH, SEPA, ISO 20022/CGI credit transfer, check, wire)"],
          ["Payment format", "The file layout the bank expects for the payment method"],
          ["Payment document / checkbook", "The bank account and document set a payment is drawn from"],
          ["Transmission configuration", "Delivery to the bank via PGP-encrypted FTP or bank connectivity"],
          ["Remittance advice", "The payment detail notice sent to the supplier"],
        ]}
      />
      <DataTable
        headers={["Payment method", "Typical use", "Notes for integrators"]}
        rows={[
          ["EFT", "Domestic electronic funds transfer", "Bank-specific format in the payment format"],
          ["ACH", "US domestic electronic payments", "Requires positive pay file for some banks"],
          ["SEPA", "Eurozone credit transfers", "Uses ISO 20022 pain.001 messages"],
          ["ISO 20022 / CGI credit transfer", "Standardized bank messages", "Increasingly the default for new banks"],
          ["Check", "Paper or printed checks", "Checkbook with document sequences required"],
          ["Wire", "Immediate high-value transfers", "Usually manual release with approvals"],
        ]}
      />
      <P>Payment file statuses and follow-up actions:</P>
      <UL>
        <li><strong>Payment file statuses:</strong> the file moves through stages as it is built, formatted, transmitted, and confirmed.</li>
        <li><strong>Positive pay:</strong> a file sent to the bank listing issued checks so the bank can match presented items.</li>
        <li><strong>Remittance advice:</strong> the supplier-facing notification generated with the payment file.</li>
        <li><strong>Void / stop payments:</strong> reversing a payment or instructing the bank to stop one.</li>
        <li><strong>Bank returns:</strong> unpaid or returned payments processed back from the bank.</li>
      </UL>
      <Callout type="tip">
        Payments can be <strong>cross-currency</strong> (pay in one currency with funds in another)
        and <strong>centralized</strong> across business units (one treasury pays on behalf of many
        BUs). Both are configured through payment process profiles and payment documents.
      </Callout>

      <H2>Configuration</H2>
      <P>Payment configuration lives under Payables payments setup and Cash Management bank accounts.</P>
      <DataTable
        headers={["Setup", "What it controls", "Where it lives"]}
        rows={[
          ["Payment methods", "The delivery channel (EFT, ACH, SEPA, ISO 20022/CGI, check, wire)", "Payables → Payments → Payment methods"],
          ["Payment process profiles", "Selection, formatting, and approval behavior per PPR", "Payables → Payments → Payment process profiles"],
          ["Payment formats", "File layouts for each bank/payment method", "Payables → Payments → Payment formats"],
          ["Bank account payment documents", "Bank accounts, checkbooks, and document sequences", "Cash Management / Payments setup"],
          ["Transmission configuration", "PGP keys, FTP/SFTP endpoints, bank connectivity", "Payables → Payments → Transmission"],
        ]}
      />

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="ppr">paymentProcessRequests</K>, "GET/PATCH only — submit and query a payment process request. There is no create/delete: build the PPR in the work area or via the Submit Payment Process Request ESS job"],
          [<K key="pay">payablesPayments</K>, "Create/update payments — record payments and link them to invoices"],
          [<K key="proc">erpProcesses</K>, "Submit ESS jobs, e.g. Submit Payment Process Request and Create Payments"],
        ]}
      />
      <Callout type="warning" title="No PPR create">
        The <K>paymentProcessRequests</K> resource is GET/PATCH only — you cannot POST a new payment
        process request through REST. Submitting a PPR runs through the{" "}
        <K>Submit Payment Process Request</K> ESS job (via <K>erpProcesses</K>) or the work area.
      </Callout>
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Interface table", "Must exist first"]}
        rows={[
          [<K key="f1">Payables Payment Request Import</K>, "Load payment requests from external systems that become payable invoices", <K key="it1">AP_PAYMENT_REQUESTS_INT</K>, "Supplier, bank account, open period"],
        ]}
      />
      <H3>Working example — submit a payment process request via ESS</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "ProcessName": "Submit Payment Process Request",
    "ProcessParameters": [
      { "name": "PAYMENT_PROCESS_PROFILE", "value": "ACME_EFT_PROFILE" }
    ]
  }'`}
      />

      <H2>Data flow — step by step</H2>
      <P>Where the PPR lifecycle lands in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Approved invoices are selected by the PPR (no holds, in period)", <span key="c0"><K key="t1">AP_INVOICES_ALL</K> (payment status)</span>],
          ["2", "Payment process request is built and validated", <span key="c1"><K key="t2">IBY_PAYMENTS_ALL</K> (payment creation)</span>],
          ["3", "Create Payments job generates the payments and links them to invoices", <K key="t3">IBY_PAYMENTS_ALL</K>, <K key="t4">AP_INVOICE_PAYMENTS_ALL</K>],
          ["4", "Payment file is formatted and transmitted to the bank (PGP/FTP/bank connectivity)", "Payment file / transmission logs"],
          ["5", "PPR is confirmed; bank statement is reconciled in Cash Management", <K key="t5">IBY_PAYMENTS_ALL</K>, <K key="t6">AP_INVOICE_PAYMENTS_ALL</K>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data dictionary.
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect payments and PPR status.</P>
      <CodeBlock
        language="sql"
        filename="ap_payments_status.sql"
        code={`-- Payments by status
SELECT p.payment_id, p.payment_number, p.payment_date, p.amount,
       p.payment_status, p.transaction_type, p.instruction_count
FROM   iby_payments_all p
WHERE  p.payment_date >= SYSDATE - 30
AND    p.payment_status IN ('ISSUED', 'CONFIRMED', 'VOID')
ORDER BY p.payment_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="ap_payments_applied.sql"
        code={`-- Payments applied against an invoice
SELECT p.payment_id, p.payment_number, p.payment_date, p.amount,
       p.payment_status, p.invoice_id
FROM   ap_invoice_payments_all p
WHERE  p.invoice_id = :invoice_id
ORDER BY p.payment_date;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Payment creation", "AP liability", "Cash / bank clearing"],
          ["Bank statement match", "Cash / bank clearing", "Cash / bank"],
          ["Discount taken", "AP liability", "Discount account"],
        ]}
      />
      <P>
        Trace entries via <K>XLA_AE_HEADERS</K> / <K>XLA_AE_LINES</K> — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>. Reconciled payments also feed{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management">Cash Management</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Payment Process Request report", "Payables work area after a PPR run"],
          ["Payments Real Time / Payables Payments", "OTBI subject area"],
          ["Cash forecast & bank statement reports", "Cash Management"],
        ]}
      />

      <H2>Worked example — pay an invoice with a discount</H2>
      <WorkedExample
        title="Worked example: pay $1,100 with a 2% early-payment discount"
        intro={
          <>
            Invoice INV-2026-0101 is <strong>$1,100</strong> on terms 2/10 net 30 — pay within 10 days
            and take <strong>2% off</strong>. The PPR selects the invoice and builds the payment.
          </>
        }
        steps={[
          {
            label: "1 · The discount arithmetic",
            body: (
              <>
                Discount = $1,100 × 2% = <strong>$22</strong>. The payment issued is $1,100 − $22 ={" "}
                <strong>$1,078</strong>.
              </>
            ),
          },
          {
            label: "2 · The payment journal",
            body: <>Payment creation clears the AP liability and books the discount taken:</>,
          },
        ]}
        journal={[
          { account: "01-2200-000 — AP liability", debit: "$1,100" },
          { account: "01-5400-000 — Cash discount taken", credit: "$22" },
          { account: "01-1000-000 — Cash / bank", credit: "$1,078" },
        ]}
        outcome={
          <>
            <K>IBY_PAYMENTS_ALL</K> holds the <strong>$1,078</strong> payment,{" "}
            <K>AP_INVOICE_PAYMENTS_ALL</K> links it to the invoice, and the bank statement later
            clears $1,078 in Cash Management. Without the discount the payment is the full $1,100 —
            the PPR applies the terms you set up.
          </>
        }
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>PPR is not created via REST:</strong> use the Submit Payment Process Request ESS job (erpProcesses) or the work area; <K>paymentProcessRequests</K> only supports GET/PATCH.</li>
        <li><strong>Only clean invoices pay:</strong> the PPR excludes invoices on hold or not approved — verify status before expecting a payment.</li>
        <li><strong>Formats are bank-specific:</strong> confirm the payment format and transmission profile (PGP/FTP/bank connectivity) match your bank before going live.</li>
        <li><strong>Payment requests:</strong> external systems can feed the Payables Payment Request Import FBDI (<K>AP_PAYMENT_REQUESTS_INT</K>) to create invoices that the PPR can then pay.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/payables">Payables troubleshooting</a>{" "}
        for the most common payment and PPR failures.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables (AP)</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Payments and bank statements reconcile in <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management">Cash Management</a>.</li>
        <li>Withholding affects net payment amounts — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/withholding-tax">Withholding Tax &amp; 1099</a>.</li>
      </UL>
    </>
  );
}

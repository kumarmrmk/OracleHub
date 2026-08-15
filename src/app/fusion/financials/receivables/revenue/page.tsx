import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Revenue & Credit Memos",
};

export default function RevenuePage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Revenue & Credit Memos"
        description="How Receivables defers and recognizes revenue on AR transactions, and how credit and debit memos adjust what a customer owes. Revenue policies, contingencies, scheduling rules, and the Recognize Revenue process drive when revenue is earned."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Receivables (AR)", href: "/fusion/financials/receivables" }, { label: "Revenue & Credit Memos" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables hub</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/autoinvoice">AutoInvoice</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a> first. Revenue rules apply to invoices that already exist.
      </Callout>

      <H2>Functional view</H2>
      <P>
        <strong>Revenue policies</strong> decide when revenue is earned on a transaction. A{" "}
        <strong>revenue contingency</strong> makes recognition conditional on a future event — in
        Receivables the common case is <strong>payment-based</strong> recognition, where the
        contingency is removed as the customer pays. <strong>Event-based recognition</strong> ties
        recognition to a specific business event (for example a delivered milestone).{" "}
        <strong>Revenue scheduling rules</strong> spread a transaction&apos;s value across periods.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Revenue policy", "Sets how and when revenue is recognized for a transaction type"],
          ["Revenue contingency", "A condition (e.g. payment received) that must be satisfied before revenue is recognized"],
          ["Contingency removal event", "The event that satisfies the contingency, driven by assignment rules"],
          ["Revenue scheduling rule", "Spreads recognized revenue across periods (e.g. straight-line)"],
          ["Sales credit", "Shares revenue recognition across multiple revenue accounts or people on a line"],
          ["Credit memo / debit memo", "Adjusts the amount owed; type and adjustment reason explain why"],
          ["Adjustment reason", "Code that explains a memo or adjustment (pricing, returns, goodwill)"],
        ]}
      />
      <Diagram title="Deferred revenue flow" className="mb-8">
        <DiagramNode tone="neutral" title="Invoice with contingency" subtitle="revenue deferred at invoice time" />
        <Arrow label="assign" />
        <DiagramNode tone="warning" title="Revenue schedule" subtitle="Generate Revenue Schedules" />
        <Arrow label="event" />
        <DiagramNode tone="success" title="Recognize Revenue" subtitle="contingency removed / event occurs" />
        <Arrow label="post" />
        <DiagramNode tone="fusion" title="Revenue distributions" subtitle="accounted by Create Accounting" />
      </Diagram>
      <P>
        <strong>Credit and debit memos</strong> are AR transactions whose type class is a memo:
        they can reverse revenue or reduce the receivable. When a credit memo touches a line that
        was deferred, the <strong>deferred revenue on the credit memo</strong> is handled so the
        recognition books stay consistent. <strong>Sales credits</strong> and{" "}
        <strong>AutoAccounting</strong> derive the revenue accounts from customer and line
        attributes. Revenue Management (RevMgmt) sits on top for advanced contract accounting —
        Receivables hands it the transactions to analyze.
      </P>

      <H2>Configuration</H2>
      <P>Set up recognition behavior before invoices are created with contingencies.</P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Revenue policies", "Sets recognition behavior per transaction type (recognize now, defer, contingent)", "Receivables setup → Revenue Management"],
          ["Revenue scheduling rules", "How deferred or recognized amounts spread across periods", "Receivables setup → Revenue scheduling rules"],
          ["Contingency assignment rules", "Which contingency applies to which transaction types / customers", "Receivables setup → Contingencies"],
          ["Transaction types for memos", "Credit/debit memo types with class and adjustment reason defaults", "Receivables → Transaction Types"],
        ]}
      />
      <Callout type="info">
        Contingency removal events must be assigned before the process can clear a contingency —
        without an assignment rule, deferred revenue sits on the schedule until someone intervenes.
      </Callout>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">receivablesInvoices</K>, "Create/update AR invoices whose lines carry revenue contingencies and sales credits"],
          [<K key="r2">receivablesCreditMemos</K>, "Create/update credit and debit memos (create/update only — there is no delete)"],
          [<K key="r3">erpProcesses</K>, "Submit ESS jobs: Generate Revenue Schedules, Recognize Revenue, and Create Accounting"],
        ]}
      />
      <Callout type="info">
        In the Oracle 26C Financials REST guide the memo resource is{" "}
        <K>receivablesCreditMemos</K> with create and update only — there is no delete on credit
        memos. Confirm resource availability against your instance.
      </Callout>
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">AutoInvoice Import</K>, "Bulk-create credit and debit memos through the same interface used for invoices", "Customer, memo transaction type, open AR period"],
        ]}
      />
      <Callout type="info">
        There is no dedicated revenue FBDI template in the Financials FBDI guide. Revenue basis data
        import is a separate module — verify the availability of any revenue-related interface
        template against your instance before relying on it.
      </Callout>
      <H3>Working example — create a credit memo via REST</H3>
      <CodeBlock
        language="bash"
        filename="POST /receivablesCreditMemos"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/receivablesCreditMemos" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "CustomerId": 987654,
    "TrxNumber": "CM-2026-0001",
    "TrxDate": "2026-08-14",
    "InvoiceCurrencyCode": "USD",
    "TransactionType": "CM",
    "AdjustmentReason": "RETURN"
  }'`}
      />
      <H3>Working example — run recognition via erpProcesses</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "ProcessName": "Recognize Revenue"
  }'`}
      />
      <Callout type="info">
        Run <K>Generate Revenue Schedules</K> before <K>Recognize Revenue</K> on newly created
        transactions, and <K>Create Accounting</K> afterward. The <K>erpProcesses</K> payload must
        match the scheduled process definitions in your instance.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>Where the revenue and memo chain lands in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Invoice is created with a revenue contingency / deferred revenue (REST or AutoInvoice)", <K key="t1">RA_CUSTOMER_TRX_ALL</K>, <K key="t2">RA_CUSTOMER_TRX_LINES_ALL</K>],
          ["2", "Generate Revenue Schedules builds the recognition schedule", "Revenue schedule tables (verify in your instance)"],
          ["3", "Contingency is removed or the recognition event occurs", "Contingency / schedule status fields (verify)"],
          ["4", "Recognize Revenue ESS job creates the revenue distributions", "Revenue distribution rows (see SQL — verify columns)"],
          ["5", "Credit memo is created (REST receivablesCreditMemos or AutoInvoice)", <span key="c0"><K key="t3">RA_CUSTOMER_TRX_ALL</K> (memo class)</span>],
          ["6", "Create Accounting posts deferred / recognized revenue and memo entries", <K key="t4">XLA_AE_HEADERS</K>, <K key="t5">XLA_AE_LINES</K>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data
        dictionary. Exact names can vary slightly by release — confirm against your instance&apos;s data
        dictionary before relying on them. Revenue schedule and distribution table names and columns
        vary by release — always verify.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect memos and revenue recognition.</P>
      <CodeBlock
        language="sql"
        filename="credit_memos.sql"
        code={`-- Credit and debit memos for a customer
SELECT t.customer_trx_id, t.trx_number, t.trx_date, t.trx_class, t.trx_type,
       t.invoice_currency_code, t.status_trx, t.bill_to_customer_id,
       c.account_name
FROM   ra_customer_trx_all t
JOIN   hz_cust_accounts c ON c.cust_account_id = t.bill_to_customer_id
WHERE  t.trx_class IN ('CM', 'DM')
AND    t.bill_to_customer_id = :bill_to_customer_id
ORDER BY t.trx_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="revenue_distributions.sql"
        code={`-- Revenue distributions for a transaction
-- (distribution table and columns vary by release -- verify before use)
SELECT g.customer_trx_line_id, g.class, g.amount, g.account_class,
       g.creation_date
FROM   ra_cust_trx_line_gl_dist_all g
WHERE  g.customer_trx_id = :customer_trx_id
ORDER BY g.customer_trx_line_id;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming — and for revenue distributions they
        can vary noticeably by release. Confirm against your release before relying on them, and
        never query the Fusion database directly for production reporting — use OTBI or the REST API
        instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>Deferred and recognized revenue create entries through the sub-ledger accounting engine:</P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Invoice with deferred revenue", "AR trade receivable", "Deferred (unearned) revenue"],
          ["Contingency removed / recognition event", "Deferred revenue", "Revenue"],
          ["Credit memo against deferred line", "Revenue / adjustment", "AR trade receivable"],
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
          ["Revenue Recognition report", "Delivered BIP report (Receivables revenue work area)"],
          ["Deferred revenue balance", "GL / Financial Reporting (post-close)"],
          ["Receivables Transactions Real Time (memos)", "OTBI subject area"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>No delete on memos:</strong> <K>receivablesCreditMemos</K> is create/update only — correct mistakes with another memo or an adjustment, not a delete.</li>
        <li><strong>Defer first, recognize later:</strong> create invoices with the contingency, run Generate Revenue Schedules, then Recognize Revenue when the event occurs.</li>
        <li><strong>Memos can carry deferred revenue:</strong> a credit memo touching a deferred line adjusts the schedule so recognition stays consistent.</li>
        <li><strong>No revenue FBDI here:</strong> bulk memos go through AutoInvoice Import; revenue basis import is a separate module — verify in your instance.</li>
        <li><strong>Accounts from AutoAccounting:</strong> revenue accounts are derived from customer/line attributes and sales credits unless overridden.</li>
        <li><strong>Run in order:</strong> Generate Revenue Schedules → Recognize Revenue → Create Accounting via <K>erpProcesses</K> or scheduled processes.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/receivables">Receivables troubleshooting</a>{" "}
        for the most common revenue and memo failures.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables (AR)</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Collecting the invoices revenue was recognized on is <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/receipts">Receipts &amp; Lockbox</a>.</li>
        <li>Revenue contingencies are payment-based — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/credit-collections">Credit Management &amp; Collections</a> for the credit side.</li>
      </UL>
    </>
  );
}
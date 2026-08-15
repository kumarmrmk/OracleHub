import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import LearningPath from "@/components/ui/LearningPath";

export const metadata = {
  title: "Receivables (AR)",
};

const topics = [
  {
    href: "/fusion/financials/receivables/autoinvoice",
    title: "AutoInvoice",
    desc: "The bulk billing engine: transaction sources, grouping rules, interface tables, execution report.",
    tone: "border-t-sky-500/60",
  },
  {
    href: "/fusion/financials/receivables/receipts",
    title: "Receipts & Lockbox",
    desc: "Receipts, AutoCash/AutoMatch, lockbox import, direct debit, application rules, reversals.",
    tone: "border-t-emerald-500/60",
  },
  {
    href: "/fusion/financials/receivables/revenue",
    title: "Revenue & Credit Memos",
    desc: "Revenue policies, contingencies, event-based recognition, credit/debit memos, deferred.",
    tone: "border-t-amber-500/60",
  },
  {
    href: "/fusion/financials/receivables/credit-collections",
    title: "Credit Management & Collections",
    desc: "Credit profiles, scoring, collections strategies, dunning, case folders, promises.",
    tone: "border-t-fuchsia-500/60",
  },
];

export default function ReceivablesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Receivables (AR)"
        description="Tracks money owed to you. Receivables manages customers, customer accounts, AR invoices, and receipts — the mirror image of Payables. This hub is your starting point; the deep dives below cover each area in functional and technical detail."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Receivables (AR)" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a> (business units),{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/tax">Tax</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a> before this page.
      </Callout>

      <H2>The business story</H2>
      <P>
        What keeps the lights on is <em>money coming in</em>. When a customer buys, Receivables
        issues an <strong>AR invoice</strong> (the bill), tracks what they owe, and collects the{" "}
        <strong>receipt</strong> — whether from a lockbox, an electronic payment, or a check. It is
        the "money in" engine that completes the sale: no receipt, no cash.
      </P>
      <Diagram title="Money in with Receivables" className="mb-8">
        <DiagramNode tone="neutral" icon="🧾" title="AR invoice" subtitle="AutoInvoice · bill the customer" />
        <Arrow />
        <DiagramNode tone="warning" icon="🏦" title="Receipt" subtitle="lockbox · online · manual" />
        <Arrow label="apply" />
        <DiagramNode tone="warning" icon="🔍" title="Application" subtitle="AutoCash · match the invoice" />
        <Arrow />
        <DiagramNode tone="success" icon="✅" title="Cash in bank" subtitle="receivable cleared" />
      </Diagram>
      <Callout type="info">
        AR is the mirror image of AP: AP pays supplier invoices, AR collects customer invoices. Learn
        one and you already know the shape of the other.
      </Callout>

      <Callout type="note" title="In simple words">
        Receivables is how a company <strong>gets paid</strong>. You send the customer a bill, and
        when they pay, you record the money coming in.
      </Callout>

      <H2>Functional view</H2>
      <P>
        When a customer buys something, Receivables sends them a bill, called an{" "}
        <strong>AR invoice</strong>. When the customer pays, you record the money as a{" "}
        <strong>receipt</strong> and apply it to (mark it against) the invoice. The customer's
        details — party, account, site — must exist before anything can be invoiced.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Customer", "A party you sell to; holds profile, tax, and payment data"],
          ["Customer account", "The bill-to/collect-from relationship a customer has with your business"],
          ["Customer account site", "A specific site under a customer account used on transactions"],
          ["AR invoice", "A bill you issue; has lines, tax, distributions, and a status (Draft, Valid, Closed…)"],
          ["Receipt", "Money collected against AR invoices; can be automatic or manual"],
          ["Business unit", "The organizational unit that owns AR transactions (required on invoices)"],
        ]}
      />
      <Callout type="info">
        The customer hierarchy is <strong>party → account → site</strong>. Integrations must create
        or reference the right level: invoice at account level, address at site level.
      </Callout>

      <H2>Deep dives — read in this order</H2>
      <P>
        If you are integrating, start with <strong>AutoInvoice</strong> (billing) then{" "}
        <strong>Receipts &amp; Lockbox</strong> (cash in). Revenue and credit/collections are the
        advanced topics on top.
      </P>
      <LearningPath
        steps={[
          {
            href: "/fusion/financials/receivables/autoinvoice",
            title: "AutoInvoice",
            level: "Module",
            outcome: "How billing lines become AR invoices in bulk — the billing engine.",
          },
          {
            href: "/fusion/financials/receivables/receipts",
            title: "Receipts & Lockbox",
            level: "Module",
            outcome: "How customer money comes in and gets applied to invoices (AutoCash, lockbox).",
          },
          {
            href: "/fusion/financials/receivables/revenue",
            title: "Revenue & Credit Memos",
            level: "Advanced",
            outcome: "Deferred revenue, contingencies, and credit/debit memos.",
          },
          {
            href: "/fusion/financials/receivables/credit-collections",
            title: "Credit Management & Collections",
            level: "Advanced",
            outcome: "Credit limits, scoring, and chasing late balances with dunning.",
          },
        ]}
      />
      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className={`group rounded-2xl border border-[var(--edge)] border-t-2 ${t.tone} bg-[var(--surface)] p-5 transition-colors hover:bg-[var(--surface-2)]`}
          >
            <h3 className="mb-1 font-bold text-ink group-hover:text-accent">{t.title}</h3>
            <p className="text-sm leading-6 text-muted">{t.desc}</p>
          </a>
        ))}
      </div>

      <H2>Technical view — the AR integration surfaces</H2>
      <P>
        Note that the REST names changed between releases: current Fusion docs use{" "}
        <K>receivablesInvoices</K> / <K>standardReceipts</K>, not the legacy{" "}
        <K>arInvoices</K> / <K>arReceipts</K> from older training. And AutoInvoice is driven through{" "}
        <strong>interface tables</strong>, not a REST create.
      </P>
      <DataTable
        headers={["Surface", "Resource / job", "What you can do with it"]}
        rows={[
          [<K key="ri">receivablesInvoices</K>, "REST (C/U/D)", "Create/read/update AR invoices (and credit memos via receivablesCreditMemos)"],
          [<K key="rc">receivablesCreditMemos</K>, "REST (C/U — no delete)", "Create/read credit memos, deferred revenue handling"],
          [<K key="sr">standardReceipts</K>, "REST (C/U/D)", "Create/read receipts applied to AR invoices"],
          [<K key="ai">autoInvoiceInterfaceLines</K>, "REST (GET/PATCH)", "Inspect/fix AutoInvoice interface lines — data is staged via the AutoInvoice Import FBDI"],
          [<K key="fbd">AutoInvoice Import</K>, "FBDI → Import AutoInvoice job", "Bulk-load transactions into RA_INTERFACE_LINES_ALL"],
          [<K key="fr">Receivables Standard Receipt Import</K>, "FBDI → Process Receipts Through Lockbox", "Bulk-import receipts into AR_PAYMENTS_INTERFACE_ALL"],
          [<K key="cust">Customer Import</K>, "FBDI → Import Trading Community Data in Bulk", "Bulk-create customers (HZ party + account + sites)"],
          [<K key="proc">erpProcesses</K>, "REST (POST)", "Submit Import AutoInvoice / Process Receipts Through Lockbox / Create Accounting / Recognize Revenue"],
        ]}
      />

      <H2>Configuration</H2>
      <P>
        Set up the billing and collection basics before creating customers or invoices.
      </P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Transaction types & document sequences", "Defines invoice/credit memo numbering", "Receivables → Transaction Types"],
          ["Customer master (HZ)", "Party + account + sites before any invoice", "Manage Customers"],
          ["Receipt methods & remittance banks", "How receipts come in and get settled", "Receivables setup"],
          ["AutoAccounting", "Derives accounts on transactions", "Receivables setup"],
          ["Billing / aging setups", "Statement and collection behavior", "Receivables setup"],
          ["AR periods", "Open the period for transactions", "Manage Accounting Periods"],
        ]}
      />
      <Callout type="info">
        AutoInvoice rejects lines when the customer, transaction type, or account is missing — finish
        these setups and pre-validate before bulk loads.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>
        Where each step of the customer → invoice → receipt chain lands in the underlying tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Customer is created — the party record", <K key="t1">HZ_PARTIES</K>],
          ["2", "The customer account (bill-to/collect-from relationship)", <K key="t2">HZ_CUST_ACCOUNTS</K>],
          ["3", "Account site and site uses", <span key="t3x"><K key="t3">HZ_CUST_ACCT_SITES_ALL</K>, <K key="t4">HZ_CUST_SITE_USES_ALL</K></span>],
          ["4", "AutoInvoice stages the transaction", <K key="t5">RA_INTERFACE_LINES_ALL</K>],
          ["5", "Import AutoInvoice validates and creates the invoice header", <K key="t6">RA_CUSTOMER_TRX_ALL</K>],
          ["6", "Invoice lines with amounts and tax", <K key="t7">RA_CUSTOMER_TRX_LINES_ALL</K>],
          ["7", "Distributions hold the account combinations", <K key="t8">RA_CUST_TRX_LINE_GL_DIST_ALL</K>],
          ["8", "Receipt is created", <K key="t9">AR_CASH_RECEIPTS_ALL</K>],
          ["9", "Receipt is applied to the invoice", <K key="t10">AR_RECEIVABLE_APPLICATIONS_ALL</K>],
          ["10", "Posting creates accounting entries", <span key="t11x"><K key="t11">XLA_AE_HEADERS</K>, <K key="t12">XLA_AE_LINES</K></span>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data
        dictionary. Exact names can vary slightly by release — confirm against your instance's data
        dictionary before relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>
        Run these against the Fusion database to pull back whatever was created.
      </P>
      <CodeBlock
        language="sql"
        filename="ar_invoices.sql"
        code={`-- AR invoices created recently with the customer account
SELECT t.customer_trx_id, t.trx_number, t.trx_date, t.trx_class, t.trx_type,
       t.status_trx, t.invoice_currency_code, t.bill_to_customer_id,
       c.account_name
FROM   ra_customer_trx_all t
JOIN   hz_cust_accounts c ON c.cust_account_id = t.bill_to_customer_id
WHERE  t.trx_date >= SYSDATE - 30
ORDER BY t.trx_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="ar_interface_rejects.sql"
        code={`-- AutoInvoice lines that failed, with the reason
SELECT i.line_number, i.trx_number, i.status, i.reject_reason
FROM   ra_interface_lines_all i
WHERE  i.status = 'I' -- 'I' = incomplete / in error
ORDER BY i.request_id;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        AR transactions create entries through the sub-ledger accounting engine:
      </P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Invoice / Credit memo", "AR trade receivable", "Revenue (+ output tax)"],
          ["Receipt applied", "Cash / bank", "AR trade receivable"],
          ["Adjustment", "AR adjustments", "Revenue / receivable"],
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
          ["Customer Aging, Dunning letters", "Delivered BIP reports / Receivables work areas"],
          ["Receivables Transactions Real Time, Receivables Receipts Real Time", "OTBI subject areas"],
          ["AR Trial Balance", "GL / Financial Reporting"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Business unit is required</strong> on AR transactions — include it or it defaults and may not be what you expect.</li>
        <li><strong>Customer must exist first</strong>: bulk invoices reject when the customer account isn't found.</li>
        <li><strong>AutoInvoice is interface-driven</strong>: stage into <K>RA_INTERFACE_LINES_ALL</K>, run Import AutoInvoice, then read the execution report for rejections.</li>
        <li><strong>Invoice statuses matter</strong>: an invoice in Draft isn't valid for billing; check status after creation.</li>
        <li><strong>Tax</strong>: if tax is enabled, lines may need tax codes/regimes, or validation fails.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/receivables">Receivables troubleshooting</a>{" "}
        for the most common failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Receipts connect to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management">Cash Management</a>.</li>
        <li>AutoInvoice data staging is covered in <a className="font-semibold text-accent hover:underline" href="/fusion/interface-tables">Interface Tables</a>.</li>
      </UL>
    </>
  );
}

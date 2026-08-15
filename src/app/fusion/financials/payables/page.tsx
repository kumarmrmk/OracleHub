import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import LearningPath from "@/components/ui/LearningPath";

export const metadata = {
  title: "Payables (AP)",
};

const topics = [
  {
    href: "/fusion/financials/payables/invoices",
    title: "Invoice Entry & Validation",
    desc: "Invoice paths, the status chain, prepayments, recurring invoices, corrections, IDR capture.",
    tone: "border-t-sky-500/60",
  },
  {
    href: "/fusion/financials/payables/holds-matching",
    title: "Holds & PO Matching",
    desc: "Hold types, 2-way/3-way PO matching, tolerances, variance accounts, releasing holds.",
    tone: "border-t-emerald-500/60",
  },
  {
    href: "/fusion/financials/payables/payments",
    title: "Payments & PPR",
    desc: "Payment Process Request, formats (EFT/ACH/SEPA/check), transmission, bank returns.",
    tone: "border-t-amber-500/60",
  },
  {
    href: "/fusion/financials/payables/withholding-tax",
    title: "Withholding Tax & 1099",
    desc: "WHT setup, certificates & exceptions, US 1099 reporting.",
    tone: "border-t-fuchsia-500/60",
  },
];

export default function PayablesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Payables (AP)"
        description="Tracks money you owe. Payables manages suppliers, supplier sites, supplier invoices, and payments — and it is the most common Financials integration target because almost every company loads invoices from somewhere external. This hub is your starting point; the deep dives below cover each area in functional and technical detail."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Payables (AP)" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a> (business units, legal entity, ledger),{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/tax">Tax</a> (tax codes), and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/flexfields">Flexfields &amp; Value Sets</a> before this page.
      </Callout>

      <H2>The business story</H2>
      <P>
        Everything the company <em>buys</em> — a supplier's goods, a consultant's services, a
        utility bill — arrives as a <strong>supplier invoice</strong> that eventually has to be{" "}
        <strong>paid</strong>. Payables is the module that manages that: it validates the invoice,
        matches it to what was ordered and received, and turns it into a payment out of the bank. It
        is the "money out" engine of the business.
      </P>
      <Diagram title="Money out with Payables" className="mb-8">
        <DiagramNode tone="warning" icon="🧾" title="Supplier invoice" subtitle="validate · match · hold" />
        <Arrow label="approve" />
        <DiagramNode tone="warning" icon="📋" title="Post & approve" subtitle="ready to pay" />
        <Arrow label="PPR" />
        <DiagramNode tone="fusion" icon="🏦" title="Payment" subtitle="EFT / ACH / SEPA / check" />
        <Arrow />
        <DiagramNode tone="success" icon="✅" title="Reconciled in Cash" subtitle="cash leaves the bank" />
      </Diagram>
      <Callout type="info">
        The one fact that rules AP integrations: <strong>you only ever pay an invoice that
        validated and got approved</strong>. Anything that fails validation — supplier, tax, period,
        account — stops in the workflow until fixed.
      </Callout>

      <Callout type="note" title="In simple words">
        Payables is how a company <strong>pays its bills</strong>. A supplier sends an invoice, you
        check that it's right, and the system pays it from the bank.
      </Callout>

      <H2>Functional view</H2>
      <P>
        A supplier's bill, called an <strong>invoice</strong>, passes through a series of checkpoints
        before it can be paid: <em>Entered → Validated → Requires Re-approval → Approved → Posted</em>.
        Invoices that fail validation (e.g. an invalid account flexfield) get stuck and must be fixed
        or rejected — integration should handle that path explicitly.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Supplier", "A party you buy from; has a name, number, tax details, and one or more sites"],
          ["Supplier site", "A specific address/legal location of the supplier used on transactions"],
          ["Supplier invoice", "A bill to be paid; has lines, distributions, a currency, and an approval status"],
          ["Invoice line & distribution", "The charge lines and the accounts they post to (distributions)"],
          ["Payment / Payment batch", "Money issued to settle invoices; can be automated or manual"],
          ["Payment term & invoice type", "Setups that control due dates and validation rules per invoice"],
        ]}
      />
      <Diagram title="Invoice status flow" className="mb-8">
        <DiagramNode tone="neutral" title="Entered" subtitle="loaded from REST/FBDI" />
        <Arrow />
        <DiagramNode tone="warning" title="Validation" subtitle="accounts, terms, tax" />
        <Arrow label="reject" />
        <DiagramNode tone="warning" title="Error / Re-approval" subtitle="fix and resubmit" />
        <Arrow label="pass" />
        <DiagramNode tone="success" title="Approved → Posted" subtitle="ready for payment" />
      </Diagram>

      <H2>Deep dives — read in this order</H2>
      <P>
        If you are integrating, start with <strong>Invoice Entry &amp; Validation</strong>, then{" "}
        <strong>Holds &amp; PO Matching</strong>, then <strong>Payments &amp; PPR</strong>.
        Withholding tax applies when you pay suppliers in WHT countries.
      </P>
      <LearningPath
        steps={[
          {
            href: "/fusion/financials/payables/invoices",
            title: "Invoice Entry & Validation",
            level: "Module",
            outcome: "The invoice paths, status chain, and validation — the gateway for every AP feed.",
          },
          {
            href: "/fusion/financials/payables/holds-matching",
            title: "Holds & PO Matching",
            level: "Module",
            outcome: "Why invoices stop (holds) and how PO matching controls what you pay.",
          },
          {
            href: "/fusion/financials/payables/payments",
            title: "Payments & PPR",
            level: "Advanced",
            outcome: "From approved invoice to bank file: the Payment Process Request lifecycle.",
          },
          {
            href: "/fusion/financials/payables/withholding-tax",
            title: "Withholding Tax & 1099",
            level: "Advanced",
            outcome: "WHT deductions and US 1099 reporting for suppliers you withhold from.",
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

      <H2>Technical view — the AP integration surfaces</H2>
      <P>
        Note that the REST names changed between releases: current Fusion docs use{" "}
        <K>invoices</K> / <K>payablesPayments</K>, not the legacy <K>apInvoices</K> /{" "}
        <K>apPayments</K> from older training. Suppliers and their sites are created via the{" "}
        <strong>Supplier</strong> FBDI (which ships in the Procurement FBDI guide).
      </P>
      <DataTable
        headers={["Surface", "Resource / job", "What you can do with it"]}
        rows={[
          [<K key="inv">invoices</K>, "REST (C/U/D + actions)", "Create/read invoices; actions include validateInvoice, calculateTax, applyPrepayments, unapplyPrepayments, cancelInvoice"],
          [<K key="pii">payablesInterfaceInvoices</K>, "REST (C/U/D)", "Stage rows into AP_INVOICES_INTERFACE, then run the import job"],
          [<K key="pay">payablesPayments</K>, "REST (C/U)", "Record payments against invoices"],
          [<K key="ppr">paymentProcessRequests</K>, "REST (GET/PATCH)", "Query/submit the payment process request (no create/delete)"],
          [<K key="pep">paymentsExternalPayees</K>, "REST (C/U)", "Manage external payee bank data"],
          [<K key="f1">Payables Standard Invoice Import</K>, "FBDI → Import Payables Invoices", "Bulk-load invoices into AP_INVOICES_INTERFACE"],
          [<K key="f2">Payables Payment Request Import</K>, "FBDI → Import Payables Payment Request", "Bulk-load payment requests into AP_PAYMENT_REQUESTS_INT"],
          [<K key="f3">Supplier / Supplier Sites</K>, "FBDI (Procurement guide)", "Bulk-create supplier master before invoices"],
          [<K key="proc">erpProcesses</K>, "REST (POST)", "Submit Import / Validate Payables Invoices, Create Accounting, Submit Payment Process Request"],
        ]}
      />

      <H2>Configuration</H2>
      <P>
        Set up in this order — skipping a step shows up later as a validation error.
      </P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Ledger, legal entity, business unit", "Determines where invoices post and which security applies", "Enterprise Structures setup"],
          ["Payables options", "Defaults for invoice, payment, tax, and aging behavior", "Payables → Payment options"],
          ["Payment terms & invoice types", "Due dates and validation rules per invoice", "Payables setup"],
          ["Tax codes & rates", "Required before an invoice line validates", "Tax setup (see Tax)"],
          ["Invoice tolerances & hold options", "Controls matching variance and holds", "Payables setup"],
          ["Accounting method (SLA)", "What entries an invoice creates", "Subledger Accounting"],
          ["AP periods", "Open the period the invoices will post to", "Manage Accounting Periods"],
        ]}
      />
      <Callout type="info">
        Most AP integration failures trace back to missing suppliers, missing tax codes, or closed
        periods — finish these setups before loading anything.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>
        Where each step of the supplier → invoice → payment chain lands in the underlying tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Supplier is created (REST or FBDI) — the party record", <K key="t1">HZ_PARTIES</K>],
          ["2", "The supplier record and supplier site", <span key="t2x"><K key="t2">POZ_SUPPLIERS</K>, <K key="t3">POZ_SUPPLIER_SITES_ALL</K></span>],
          ["3", "Invoice rows are staged", <K key="t4">AP_INVOICES_INTERFACE / AP_INVOICE_LINES_INTERFACE</K>],
          ["4", "Import Payables Invoices creates the invoice header (status Entered)", <K key="t5">AP_INVOICES_ALL</K>],
          ["5", "Invoice lines with amounts and descriptions", <K key="t6">AP_INVOICE_LINES_ALL</K>],
          ["6", "Invoice distributions hold the account combinations", <K key="t7">AP_INVOICE_DISTRIBUTIONS_ALL</K>],
          ["7", "Validation passes/fails — status moves to Validated or Requires Re-approval", <span key="t8x"><span key="c0"><K key="t8">AP_INVOICES_ALL</K> (status fields)</span></span>],
          ["8", "Posting creates accounting entries", <span key="t9x"><K key="t9">XLA_AE_HEADERS</K>, <K key="t10">XLA_AE_LINES</K></span>],
          ["9", "Payment settles the invoice", <span key="t11x"><K key="t11">AP_INVOICE_PAYMENTS_ALL</K>, <K key="t12">IBY_PAYMENTS_ALL</K></span>],
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
        filename="ap_invoices.sql"
        code={`-- Recently created invoices with supplier name
SELECT i.invoice_id, i.invoice_num, i.invoice_date, i.invoice_amount,
       i.invoice_currency_code, i.payment_status_flag, i.approval_status,
       s.supplier_name
FROM   ap_invoices_all i
JOIN   poz_suppliers s ON s.supplier_id = i.vendor_id
WHERE  i.creation_date >= SYSDATE - 30
ORDER BY i.creation_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="ap_interface_rejects.sql"
        code={`-- Rows that failed the AP invoice import, with the reason
SELECT i.invoice_num, i.invoice_line_number,
       i.reject_reason, i.approved_flag, i.status
FROM   ap_invoice_lines_interface i
WHERE  i.status IS NULL
   OR  i.approved_flag = 'N';`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Every AP invoice produces accounting entries through the sub-ledger accounting engine. A
        standard invoice creates:
      </P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Invoice amount", "Expense / asset account", "AP liability"],
          ["Input tax", "Input tax receivable", "Tax liability"],
          ["Payment", "AP liability", "Cash / bank"],
        ]}
      />
      <P>
        Events: <em>invoice creation</em> and <em>payment</em>. Trace the entries via{" "}
        <K>XLA_AE_HEADERS</K> / <K>XLA_AE_LINES</K> — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Invoice Aging, Supplier Aging", "Delivered BIP reports (Reports & Analytics)"],
          ["Payables Invoices Real Time, Payables Payments Real Time", "OTBI subject areas"],
          ["Payables distributions & trial balance", "GL / Financial Reporting (post-close)"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li>
          <strong>Supplier before invoice:</strong> bulk loads must run Supplier → Sites → AP
          Invoices in order, or invoices reject with "supplier not found".
        </li>
        <li>
          <strong>Validation state:</strong> a created invoice may sit in <em>Requires
          Re-approval</em> if lines fail validation — poll its status and handle the error file.
        </li>
        <li>
          <strong>Accounts:</strong> distributions need a valid account combination; supply each
          segment or a distribution combination ID.
        </li>
        <li>
          <strong>Interface-driven imports:</strong> bulk loads stage into{" "}
          <K>AP_INVOICES_INTERFACE</K> and need the Import Payables Invoices job to complete.
        </li>
        <li>
          <strong>Idempotency:</strong> use a stable invoice number so retries don't duplicate.
        </li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/payables">Payables troubleshooting</a>{" "}
        for the most common failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>The AP invoice import is the flagship example in <a className="font-semibold text-accent hover:underline" href="/oic/fbdi-integration">FBDI integration with Fusion</a>.</li>
        <li>Supplier master data feeds into the <a className="font-semibold text-accent hover:underline" href="/scenarios/po-approval">PO approval scenario</a>.</li>
      </UL>
    </>
  );
}

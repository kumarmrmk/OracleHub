import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import LearningPath from "@/components/ui/LearningPath";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "ERP Financials",
};

const modules = [
  {
    href: "/fusion/financials/gl",
    title: "General Ledger (GL)",
    desc: "Chart of accounts, ledgers, periods, journal entries.",
    tone: "border-t-sky-500/60",
  },
  {
    href: "/fusion/financials/payables",
    title: "Payables (AP)",
    desc: "Suppliers, supplier invoices, payments.",
    tone: "border-t-emerald-500/60",
  },
  {
    href: "/fusion/financials/receivables",
    title: "Receivables (AR)",
    desc: "Customers, AR invoices, receipts.",
    tone: "border-t-amber-500/60",
  },
  {
    href: "/fusion/financials/cash-management",
    title: "Cash Management",
    desc: "Bank accounts, bank statements, reconciliation.",
    tone: "border-t-fuchsia-500/60",
  },
  {
    href: "/fusion/financials/fixed-assets",
    title: "Fixed Assets",
    desc: "Assets, asset books, additions, depreciation.",
    tone: "border-t-cyan-500/60",
  },
  {
    href: "/fusion/financials/expenses",
    title: "Expenses",
    desc: "Expense reports, lines, templates, approvals.",
    tone: "border-t-rose-500/60",
  },
];

export default function FinancialsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="ERP Financials — hub"
        description="The Financials suite covers everything that records money: General Ledger, Payables, Receivables, Cash Management, Fixed Assets, and Expenses. Each module has its own page covering the functional (business) and technical (REST + FBDI) view. This page ties the suite together."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials" }]}
        updated="February 2025"
        level="Foundation"
      />

      <H2>The business story</H2>
      <P>
        Every company runs on <strong>money in and money out</strong>, and every activity that
        touches money must be written down somewhere. That record-keeping is what Financials does:
        you <em>buy</em> (Payables), you <em>sell</em> (Receivables), you <em>hold cash</em>{" "}
        (Cash Management), you <em>own things that wear out</em> (Fixed Assets), your people{" "}
        <em>spend on the company's behalf</em> (Expenses) — and at the end of the month, all of it
        must roll up into one true picture: the <strong>General Ledger</strong> and its reports.
      </P>
      <Diagram title="Money through the business" className="mb-8">
        <DiagramNode tone="neutral" icon="💸" title="Money out" subtitle="Payables · Expenses · supplier payments" />
        <Arrow />
        <DiagramNode tone="fusion" icon="📗" title="General Ledger" subtitle="every sub-ledger posts here" />
        <Arrow />
        <DiagramNode tone="neutral" icon="💰" title="Money in" subtitle="Receivables · receipts · bank" />
        <Arrow />
        <DiagramNode tone="success" icon="📊" title="Close & report" subtitle="statements · P&L · balance sheet" />
      </Diagram>
      <Callout type="info">
        The trick to learning Financials: every module is a <em>sub-ledger</em> feeding one{" "}
        <em>general ledger</em>. Learn one transaction end to end (buy → pay, sell → collect) and you
        understand how all six modules fit together — the{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles">Business Cycles</a>{" "}
        do exactly that.
      </Callout>

      <Callout type="note" title="In simple words">
        Financials is the app where a company <strong>writes down what it earns and spends</strong>.
        Each module does one job — buying, selling, cash, assets, expenses — and at month-end it all
        comes together into the reports that say how the business did.
      </Callout>

      <H2>How the suite hangs together</H2>
      <P>
        Financials is a chain of <Term k="subledger"><strong>sub-ledgers</strong></Term> feeding a <Term k="ledger"><strong>General Ledger</strong></Term>.
        Every transaction starts in a sub-ledger and eventually posts to the GL, where the period is
        closed and reporting happens.
      </P>
      <Diagram title="The financial data chain" className="mb-8">
        <DiagramNode tone="neutral" title="Transactions" subtitle="invoices · payments · receipts · expenses · assets" />
        <Arrow label="post" />
        <DiagramNode tone="fusion" title="Sub-ledgers" subtitle="Payables · Receivables · Cash · Fixed Assets · Expenses" />
        <Arrow label="GL interface" />
        <DiagramNode tone="fusion" title="General Ledger" subtitle="journals · balances · periods · close" />
        <Arrow label="report" />
        <DiagramNode tone="neutral" title="Reporting & Close" subtitle="trial balance · FSG · consolidation" />
      </Diagram>
      <Callout type="info">
        You rarely write straight to the GL. Bulk supplier invoices feed <em>Payables</em>, customer
        money feeds <em>Receivables</em>, and only journals feed the GL directly. Each sub-ledger has
        its own acceptance rules (approvals, open periods, <Term k="businessUnit">business unit</Term>) that will reject bad data.
      </Callout>

<H2>Learning path — read in this order</H2>
      <P>
        The same order as the home page guide. Start at step 1 and follow down — later steps assume
        the earlier ones. Where a step links several pages, read them in the order listed.
      </P>
      <LearningPath
        steps={[
          {
            href: "/fusion/overview",
            title: "What Fusion is",
            level: "Foundation",
            outcome: "The module map and where Financials sits — Overview, Application Modules.",
          },
          {
            href: "/fusion/enterprise-structures",
            title: "Foundations — the model",
            level: "Foundation",
            outcome: "Enterprise Structures, Flexfields & Value Sets, Subledger Accounting (SLA), Tax.",
          },
          {
            href: "/fusion/financials",
            title: "The whole picture",
            level: "Foundation",
            outcome: "How the modules connect, with the Business Cycles (R2R · P2P · O2C) that tie them together.",
          },
          {
            href: "/fusion/financials/gl",
            title: "General Ledger",
            level: "Module",
            outcome: "Accounts, journals, balances, budgets and close — GL, Journals & Posting, Period Close, Budgets.",
          },
          {
            href: "/fusion/financials/payables",
            title: "Payables & Receivables",
            level: "Module",
            outcome: "Money out and in — invoices → payments (AP), AutoInvoice → receipts (AR).",
          },
          {
            href: "/fusion/financials/cash-management",
            title: "Cash, Fixed Assets & Expenses",
            level: "Module",
            outcome: "Bank statements, reconciliation, depreciation, and expense reimbursement.",
          },
          {
            href: "/fusion/financial-close",
            title: "Close, report, then technical",
            level: "Advanced",
            outcome: "Month-end close and reporting, then the implementer's tools: REST, FBDI, ESS, Fusion Tables.",
          },
          {
            href: "/fusion/procurement",
            title: "Procurement & SCM (next module)",
            level: "Advanced",
            outcome: "The buying side of the business — requisitions, purchase orders, receiving.",
          },
        ]}
      />
      <Callout type="info">
        Foundations first, modules second, technical last. Skip a foundation page and the module
        pages will feel out of order. The sidebar and the Home page follow the same sequence.
      </Callout>

      <H2>The modules</H2>
      <P>Each module page covers the <strong>functional</strong> view (business objects, flows,
        setups), the <strong>technical</strong> view (REST resources, FBDI templates, examples), a
        <strong>step-by-step data flow</strong> showing which Fusion table the data lands on at every
        step, and <strong>SQL queries</strong> to retrieve whatever was created.</P>
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((m) => (
          <a
            key={m.href}
            href={m.href}
            className={`group rounded-2xl border border-[var(--edge)] border-t-2 ${m.tone} bg-[var(--surface)] p-5 transition-colors hover:bg-[var(--surface-2)]`}
          >
            <h3 className="mb-1 font-bold text-ink group-hover:text-accent">{m.title}</h3>
            <p className="text-sm leading-6 text-muted">{m.desc}</p>
          </a>
        ))}
      </div>

      <H2>Functional ↔ technical reference table</H2>
      <P>
        The fastest lookup for an integration developer: the business object, its module, the REST
        resource, and the FBDI template.
      </P>
      <DataTable
        headers={["Business object", "Module", "REST resource", "FBDI template"]}
        rows={[
          ["Supplier", "Payables", "— (party data is Common Features)", <span key="c0"><K key="f1">Supplier</K> (Procurement guide)</span>],
          ["Supplier site", "Payables", "—", <span key="c1"><K key="f2">Supplier Sites</K> (Procurement guide)</span>],
          ["AP invoice", "Payables", <K key="r3">invoices</K>, <K key="f3">Payables Standard Invoice Import</K>],
          ["AP payment / PPR", "Payables", <K key="r4">payablesPayments / paymentProcessRequests</K>, <K key="f4">Payables Payment Request Import</K>],
          ["Customer", "Receivables", "— (party data is Common Features)", <K key="f5">Customer Import</K>],
          ["Customer account / site", "Receivables", "—", <K key="f6">Customer Import</K>],
          ["AR invoice", "Receivables", <K key="r7">receivablesInvoices</K>, <K key="f7">AutoInvoice Import</K>],
          ["AR credit memo", "Receivables", <K key="r8">receivablesCreditMemos</K>, <K key="f7b">AutoInvoice Import</K>],
          ["Receipt", "Receivables", <K key="r9">standardReceipts</K>, <K key="f8">Receivables Standard Receipt Import</K>],
          ["GL journal", "GL", "— (journal create is FBDI)", <K key="f9">Journal Import</K>],
          ["Ledger", "GL", <K key="r10">ledgersLOV</K>, "—"],
          ["Accounting period", "GL", <K key="r11">accountingPeriodsLOV</K>, "—"],
          ["Bank account", "Cash", <K key="r12">cashBankAccounts</K>, "—"],
          ["Bank statement", "Cash", "— (statements load via FBDI)", <K key="f10">Cash Management Bank Statement Data Import</K>],
          ["Asset", "Fixed Assets", "— (asset CRUD is in the SCM REST guide)", <K key="f11">Fixed Asset Mass Additions Import</K>],
          ["Asset book", "Fixed Assets", <K key="r15">fixedAssetBooksLOV</K>, "—"],
          ["Expense report", "Expenses", <K key="r16">expenseReports</K>, "— (no public FBDI in 26C)"],
        ]}
      />
      <Callout type="warning">
        A few of these names changed between the EBS-era docs and current Fusion: legacy{" "}
        <K>apInvoices</K>, <K>arInvoices</K>, <K>arReceipts</K> and <K>journalEntries</K> REST
        resources no longer exist in the 26C Financials REST guide. The table above reflects the
        current official names — confirm against your instance's resource explorer before coding.
      </Callout>

      <H2>Integration patterns</H2>
      <H3>1 · Supplier onboarding (Payables)</H3>
      <P>
        External portal submits a supplier → OIC validates → creates the supplier via REST{" "}
        <K>suppliers</K> or bulk-loads the Supplier FBDI. The supplier must exist before the first
        invoice arrives.
      </P>
      <H3>2 · AP invoice import (Payables)</H3>
      <P>
        ERP/file/portal sends invoices → OIC stages them → AP Invoices FBDI load at night → OIC polls
        job status → processes the error file → re-submits rejected rows. For small volumes use{" "}
        <K>apInvoices</K> REST directly.
      </P>
      <H3>3 · GL journal import (GL)</H3>
      <P>
        Source system posts balances → OIC maps each row to GL segments → Journal Entries FBDI (or{" "}
        <K>journalEntries</K> REST) → verify the period is open before posting.
      </P>
      <H3>4 · Expense sync (Expenses + Payables)</H3>
      <P>
        Corporate card feeds create expense lines → OIC enriches employee/category → Expense Reports
        import → approved reports flow to Payables for payment.
      </P>

      <H2>Integration-critical details</H2>
      <DataTable
        headers={["Detail", "Why it breaks integrations", "What to do"]}
        rows={[
          ["Account flexfield segments", "Journal/invoice rows reject if segments don't form a valid combination", "Supply each segment column; validate against a COA query first"],
          ["Accounting period status", "Posts to a closed period fail", "Check <K>accountingPeriods</K> before bulk GL/AP/AR loads"],
          ["Ledger & business unit", "Documents need the right ledger/BU to inherit accounts and rules", "Pass the correct LedgerId/BusinessUnit on create calls"],
          ["Currency", "Sub-ledger and GL require valid currency + exchange rates for cross-currency", "Set the currency code; provide/validate exchange rates"],
          ["Invoice status & validation", "Invoices stuck in 'Requires Re-approval' or error don't post", "Design an error-handling path: pull status, fix, resubmit"],
          ["FBDI load order", "Invoices fail when the referenced supplier doesn't exist yet", "Run supplier → sites → invoices in order, with polling between"],
        ]}
      />

      <H2>Next steps</H2>
      <UL>
        <li>See how the same "functional vs technical" lens applies to <a className="font-semibold text-accent hover:underline" href="/fusion/concepts">core concepts</a> (flexfields, value sets, ESS).</li>
        <li>Combine these modules with the classic OIC pattern in <a className="font-semibold text-accent hover:underline" href="/oic/fbdi-integration">FBDI integration with Fusion</a>.</li>
        <li>Ground the REST examples with the <a className="font-semibold text-accent hover:underline" href="/fusion/rest-api">REST API fundamentals</a> page.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import LearningPath from "@/components/ui/LearningPath";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Expenses",
};

const topics = [
  {
    href: "/fusion/financials/expenses/templates-policies",
    title: "Templates, Expense Types & Policies",
    desc: "Templates vs types vs categories, mileage/meals/airfare policies, policy enforcement.",
    tone: "border-t-sky-500/60",
  },
  {
    href: "/fusion/financials/expenses/card-programs",
    title: "Corporate Card Programs",
    desc: "Card programs, card file processing, tokenization, company-pay vs employee-pay.",
    tone: "border-t-emerald-500/60",
  },
  {
    href: "/fusion/financials/expenses/approval-audit",
    title: "Approval, Audit & Reimbursement",
    desc: "Approval rules, audit & receipt rules, reimbursement to Payables, cash advances.",
    tone: "border-t-amber-500/60",
  },
];

export default function ExpensesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Expenses"
        description={<>Manages employee spend: <Term k="expenseReport">expense reports</Term>, expense templates, policies, and approvals. An employee submits a report; it is approved; it feeds Payables for payment or a <Term k="clearingAccount">clearing account</Term>. This hub is your starting point; the deep dives below cover each area in functional and technical detail.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Expenses" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/approvals">Approvals &amp; Workflow</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/tax">Tax</a> before this page.
      </Callout>

      <H2>The business story</H2>
      <P>
        From a business trip to a team lunch to a foreign client dinner — people spend money on the
        company's behalf, and someone has to record, approve, and reimburse it. <strong>Expenses</strong>{" "}
        is that workflow: an employee submits an <strong>expense report</strong>, it's{" "}
        <strong>approved</strong>, and the money is paid back through Payables.
      </P>
      <Diagram title="The expense loop" className="mb-8">
        <DiagramNode tone="neutral" icon="🧾" title="Report" subtitle="lines · categories · receipts" />
        <Arrow />
        <DiagramNode tone="warning" icon="👥" title="Approve" subtitle="manager · audit rules" />
        <Arrow />
        <DiagramNode tone="warning" icon="💳" title="Card / advance" subtitle="company-pay · employee-pay" />
        <Arrow />
        <DiagramNode tone="success" icon="💸" title="Reimburse" subtitle="Payables pays the employee" />
      </Diagram>
      <Callout type="info">
        Expenses is a <em>workflow</em> module first: the money is small per line, but the approval
        and policy rules (per diem, limits, receipt requirements) are where the real complexity lives.
      </Callout>

      <Callout type="note" title="In simple words">
        Expenses handles the <strong>day-to-day spending</strong> of employees — travel, meals,
        supplies — from the report they file to the reimbursement they get back.
      </Callout>

      <H2>Functional view</H2>
      <P>
        Expense management is a workflow problem first: submit → approve → pay. The data model is
        built around the <strong>expense report</strong> (one claim) and its{" "}
        <strong>lines</strong> (each spend), governed by <strong>templates</strong> and{" "}
        <strong>categories</strong>.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Expense report", "A submitted claim with multiple expense lines and an approval workflow"],
          ["Expense line", "A single spend: date, category, amount, project, account"],
          ["Expense template & category", "The configured structure and spend categories that govern entry"],
          ["Expense approval", "The workflow (manager, finance) that a report must pass before payment"],
        ]}
      />
      <Callout type="info">
        Approved expense reports post to the GL and are settled through <strong>Payables</strong> —
        which is why an expenses integration usually also touches the AP payment process.
      </Callout>

      <H2>Deep dives — read in this order</H2>
      <P>
        Understand templates and policies first (what can be claimed), then card programs (where
        lines come from), then approval/audit/reimbursement (what happens after submit).
      </P>
      <LearningPath
        steps={[
          {
            href: "/fusion/financials/expenses/templates-policies",
            title: "Templates, Expense Types & Policies",
            level: "Module",
            outcome: "What can be claimed and which rules apply — the entry-side setup.",
          },
          {
            href: "/fusion/financials/expenses/card-programs",
            title: "Corporate Card Programs",
            level: "Module",
            outcome: "Where card lines come from: programs, card files, tokens, and who-pays.",
          },
          {
            href: "/fusion/financials/expenses/approval-audit",
            title: "Approval, Audit & Reimbursement",
            level: "Advanced",
            outcome: "Approval, audit, cash advances, and reimbursement to Payables — the payout side.",
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

      <H2>Technical view — the Expenses integration surfaces</H2>
      <P>
        Expense data is served by REST resources under the <K>expense*</K> family. Note there is{" "}
        <strong>no "Import Expense Reports" FBDI</strong> in the current Financials FBDI guide —
        third-party expense data flows via XML export/import and a UCM upload under{" "}
        <K>fin/expenses/import</K>.
      </P>
      <DataTable
        headers={["Surface", "Resource / job", "What you can do with it"]}
        rows={[
          [<K key="er">expenseReports</K>, "REST (C/U)", "Create/read expense reports (header)"],
          [<K key="el">expenses</K>, "REST (C/U/D)", "Create/read/update expense lines"],
          [<K key="ed">expenseDistributions</K>, "REST (C/U)", "Read/update expense distributions (accounts)"],
          [<K key="ca">expenseCashAdvances</K>, "REST (C/U/D)", "Create/read employee cash advances"],
          [<K key="cc">expenseCreditCardTransactions</K>, "REST (GET)", "Read imported corporate card transactions"],
          [<K key="et">expenseTemplates / expenseTypes</K>, "REST (GET)", "List templates and expense types for validation"],
          [<K key="pol">expense*Policies</K>, "REST (GET)", "Read mileage/meals/airfare/accommodation policy rules"],
          [<K key="ap">expenseAuditPredictions</K>, "REST (POST)", "Ask for an audit risk recommendation"],
          [<K key="3p">Third-party import</K>, "XML export/import + UCM fin/expenses/import", "Bulk expense data from external systems (verify in instance)"],
          [<K key="proc">erpProcesses</K>, "REST (POST)", "Submit Create Accounting / reimbursement jobs (verify job names)"],
        ]}
      />

      <H2>Configuration</H2>
      <P>
        Expense setups determine what a user can claim and where it posts.
      </P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Expense templates & policies", "Which expense types are allowed, with limits", "Expenses → Templates & Policies"],
          ["Expense type → account mapping", "Where each expense type posts", "Expense Types setup"],
          ["Approval groups & routing", "Who approves a report", "Approval Management (see Approvals)"],
          ["Corporate card setup", "Enables card transaction import", "Expenses → Card setup"],
          ["Cash advance / per diem", "Advanced payment and daily allowance rules", "Expenses setup"],
        ]}
      />
      <Callout type="info">
        A report that won't submit, or a line that posts to the wrong account, is usually a missing
        setup in one of these areas.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>
        Where each step of the expense report → approval → payment chain lands in the underlying
        tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Expense report is created (REST or third-party import)", <K key="t1">EXM_EXPENSE_REPORTS</K>],
          ["2", "Expense lines carry date, category, amount", <K key="t2">EXM_EXPENSE_REPORT_LINES</K>],
          ["3", "Distributions hold the expense accounts", <K key="t3">EXM_EXPENSE_REPORT_DISTRIBUTIONS</K>],
          ["4", "Approval workflow runs — status moves toward Approved", <span key="t4c"><span key="c0"><K key="t4">EXM_EXPENSE_REPORTS</K> (status fields)</span></span>],
          ["5", "Approved reports generate a Payables payment request", <K key="t5">AP payment request / AP_INVOICES_ALL</K>],
          ["6", "Payment settles the expense", <span key="t6c"><K key="t6">AP_INVOICE_PAYMENTS_ALL</K>, <K key="t7">IBY_PAYMENTS_ALL</K></span>],
          ["7", "Posting creates accounting entries", <span key="t8c"><K key="t8">XLA_AE_HEADERS</K>, <K key="t9">XLA_AE_LINES</K></span>],
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
        filename="exm_reports.sql"
        code={`-- Expense reports created recently
SELECT r.expense_report_id, r.report_number, r.report_status,
       r.report_currency, r.total_report_amount, r.submitted_date
FROM   exm_expense_reports r
WHERE  r.creation_date >= SYSDATE - 30
ORDER BY r.creation_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="exm_lines.sql"
        code={`-- Expense report lines
SELECT l.line_number, l.expense_date, l.expense_category_name,
       l.amount, l.description
FROM   exm_expense_report_lines l
WHERE  l.expense_report_id = :expense_report_id
ORDER BY l.line_number;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        An approved expense report creates entries through the sub-ledger accounting engine:
      </P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Expense report approved", "Expense account (per expense type)", "Employee / payable liability"],
          ["Payment to employee", "Employee / payable liability", "Cash / bank"],
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
          ["Expense Report Real Time", "OTBI subject area"],
          ["Employee expense statements", "Delivered BIP reports"],
          ["Expense spend by category", "OTBI dashboards"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Employee + category must exist</strong>: lines reject when the employee, category, or template is unknown.</li>
        <li><strong>Approval is asynchronous</strong>: imported reports may enter "Needs Action" — poll status before paying.</li>
        <li><strong>Period open:</strong> expense lines post to a period; closed periods block the import.</li>
        <li><strong>Corporate cards:</strong> card feed integrations create lines from transaction files, then enrich them.</li>
        <li><strong>No public expense FBDI:</strong> bulk data from third-party systems goes through the XML import / UCM upload path — verify the exact mechanism on your instance.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/expenses">Expenses troubleshooting</a>{" "}
        for the most common failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Approved reports settle through <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a>.</li>
        <li>Employee master data comes from <a className="font-semibold text-accent hover:underline" href="/fusion/modules">HCM</a> (covered in a later module).</li>
      </UL>
    </>
  );
}

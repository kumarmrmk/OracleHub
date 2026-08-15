import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Approval, Audit & Reimbursement",
};

export default function ApprovalAuditPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Approval, Audit & Reimbursement"
        description="What happens after an employee submits an expense report: the approval workflow, the audit rules that flag risk, cash advances and spend authorizations, and the reimbursement that settles everything through Payables."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Expenses", href: "/fusion/financials/expenses" }, { label: "Approval, Audit & Reimbursement" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses">Expenses hub</a> and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/approvals">Approvals &amp; Workflow</a>{" "}
        first. Workflow, audit, and job names are shown as documented in Oracle&apos;s Using Expenses
        guide — verify against your instance.
      </Callout>

      <H2>Functional view</H2>
      <P>
        After submission an expense report moves through <em>approval</em> (who must sign off),
        <em> audit</em> (which reports get extra review), and finally <em>reimbursement</em> (payment
        to the employee or card issuer through Payables). Cash advances and spend authorizations
        front-money the employee in parallel.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Approval workflow", "The routing (manager, finance) a submitted report must pass"],
          ["Delegated approval", "An approver who acts on behalf of another when they are unavailable"],
          ["Audit selection", "Rules that select reports and lines for audit review"],
          ["Receipt rules", "Which lines require receipts and what happens when they are missing"],
          ["Payment hold", "A rule that blocks an approved report from being paid"],
          ["Cash advance", "Money advanced to an employee, applied to and settled against expense reports"],
          ["Spend authorization", "Pre-approved spend limit (optionally under budgetary control)"],
          ["Reimbursement", "The payment request to Payables and the resulting payment"],
        ]}
      />
      <Diagram title="Report lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Submitted" subtitle="employee submits report" />
        <Arrow label="approve" />
        <DiagramNode tone="warning" title="Approval / Audit" subtitle="rules, receipts, holds" />
        <Arrow label="approved" />
        <DiagramNode tone="fusion" title="Create Accounting" subtitle="subledger entries" />
        <Arrow label="payment" />
        <DiagramNode tone="success" title="Reimbursed" subtitle="Payables payment issued" />
      </Diagram>
      <Callout type="info">
        An approved report is <strong>not</strong> automatically paid — audit and payment hold rules
        sit between approval and the payment request, and the request must survive Payables payment
        processing.
      </Callout>

      <H2>Configuration</H2>
      <P>
        Approval, audit, and reimbursement behavior is configuration, not code. Each setup gates a
        distinct part of the report lifecycle.
      </P>
      <DataTable
        headers={["Setup", "What it controls", "Where it lives"]}
        rows={[
          ["Approval rules", "Which reports need approval and who approves them", "Approval Management (see Approvals)"],
          ["Audit selection rules", "How reports/lines are selected for audit (including keyword audit)", "Expenses → Audit Rules"],
          ["Receipt rules", "Receipt requirements per expense type/category", "Expenses → Receipt Management"],
          ["Payment hold rules", "Conditions that prevent an approved report from paying", "Expenses → Payment Options"],
          ["Cash advance setups", "Advance limits, types, and settlement rules", "Expenses → Cash Advances"],
          ["Spend authorization", "Pre-approved limits, optionally with budgetary control", "Expenses → Spend Authorization / Budgetary Control"],
          ["Employee bank accounts & pay groups", "Where reimbursement payments are sent", "Payables / Payment setup"],
        ]}
      />
      <Callout type="info">
        A report that is approved but never reimbursed is usually a payment hold, a missing employee
        bank account, or a closed AP period — not a workflow failure.
      </Callout>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="er">expenseReports</K>, "Create/read expense reports (headers; no DELETE)"],
          [<K key="el">expenses</K>, "Create/read/update/delete expense report lines"],
          [<K key="ed">expenseDistributions</K>, "Create/update expense line distributions (accounts)"],
          [<K key="ca">expenseCashAdvances</K>, "Create/read/update/delete cash advances"],
          [<K key="ap">expenseAuditPredictions</K>, "Run audit prediction for risk scoring (POST)"],
          [<K key="dg">expenseDelegations</K>, "Create/update approval delegations"],
          [<K key="pr">erpProcesses</K>, "Trigger Create Accounting and reimbursement processing jobs (POST)"],
        ]}
      />
      <Callout type="warning" title="No public Expense Reports FBDI">
        Oracle&apos;s 26C Financials FBDI guide has <strong>no public "Import Expense Reports"
        template</strong>. Expense data entry from third-party applications uses the{" "}
        <strong>XML export/import</strong> path documented in the Using Expenses guide ("Expense
        Report Data Flow Using a Third-Party Application"), and third-party reimbursement uses a{" "}
        <strong>UCM upload</strong> (the <K>fin/expenses/import</K> area). Verify both against your
        instance before building.
      </Callout>
      <H3>Working example — create a cash advance</H3>
      <CodeBlock
        language="bash"
        filename="POST /expenseCashAdvances"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/expenseCashAdvances" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "PersonId": 12345,
    "AdvanceAmount": 500,
    "CurrencyCode": "EUR",
    "AdvanceTypeName": "Travel Advance",
    "AdvanceDate": "2025-03-10"
  }'`}
      />
      <H3>Working example — read expense reports by status</H3>
      <CodeBlock
        language="bash"
        filename="GET /expenseReports"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/expenseReports?q=ReportStatusCode%3D%27Submitted%27&fields=ReportNumber,ReportStatus,TotalReportAmount,ReportCurrency,PersonName&limit=50" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />

      <H2>Data flow — step by step</H2>
      <P>Where each step of the submit → approve → pay chain lands in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Report is submitted; approval workflow starts (or delegated approval applies)", <span key="c0"><K key="t1">EXM_EXPENSE_REPORTS</K> (status fields)</span>],
          ["2", "Audit selection rules, keyword audit, and audit predictions flag the report", <K key="t2">EXM_AUDIT_RESULTS</K>, <K key="t3">risk indicators on EXM_EXPENSE_REPORTS</K>],
          ["3", "Cash advances are applied to and settled against report lines", <K key="t4">EXM_CASH_ADVANCES</K>],
          ["4", "Approval completes; Create Accounting generates subledger entries", <K key="t5">XLA_AE_HEADERS</K>, <K key="t6">XLA_AE_LINES</K>],
          ["5", "A payment request is created in Payables for the approved amount", <K key="t7">AP payment request tables / AP_INVOICES_ALL</K>],
          ["6", "Reimbursement runs and pays the employee (or card issuer)", <K key="t8">IBY_PAYMENTS_ALL</K>, <K key="t9">AP_INVOICE_PAYMENTS_ALL</K>],
          ["7", "Bank statement reconciliation matches the outgoing payment", "Cash Management / bank statement tables"],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data dictionary.
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect report status and cash advances.</P>
      <CodeBlock
        language="sql"
        filename="exm_expense_reports_by_status.sql"
        code={`-- Expense reports by status for a person and period
SELECT r.expense_report_id, r.report_number, r.report_status,
       r.total_report_amount, r.report_currency, r.submitted_date,
       r.approval_date, r.risk_indicator
FROM   exm_expense_reports r
WHERE  r.report_status = :report_status
AND    r.submitted_date BETWEEN :start_date AND :end_date
ORDER BY r.submitted_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="exm_cash_advances.sql"
        code={`-- Cash advances and their settlement state
SELECT a.advance_number, a.advance_date, a.advance_amount,
       a.currency_code, a.advance_type_name, a.advance_status,
       a.person_name, a.settled_amount
FROM   exm_cash_advances a
WHERE  a.person_name = :person_name
AND    a.advance_status IN ('UNPAID', 'APPLIED', 'SETTLED')
ORDER BY a.advance_date;`}
      />
      <CodeBlock
        language="sql"
        filename="expense_payment_request.sql"
        code={`-- Expense report to Payables payment linkage
SELECT er.report_number, er.total_report_amount,
       pi.invoice_id, pi.payment_status_flag, pi.payment_created_date
FROM   exm_expense_reports er
JOIN   ap_invoices_all pi ON pi.exception_invoice_id = er.expense_report_id
WHERE  er.expense_report_id = :expense_report_id;`}
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
          ["Expense report approved", "Expense account (per expense type)", "Employee / payable liability"],
          ["Cash advance issued", "Cash advance receivable (employee)", "Cash / bank"],
          ["Advance applied to report", "Employee / payable liability", "Cash advance receivable (employee)"],
          ["Reimbursement payment", "Employee / payable liability", "Cash / bank"],
        ]}
      />
      <P>
        Entries come from the subledger accounting engine; trace them via <K>XLA_AE_HEADERS</K> /{" "}
        <K>XLA_AE_LINES</K> — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Expense Report Real Time", "OTBI subject area"],
          ["Audit selection list", "Expenses work area, for the audit team"],
          ["Expense reimbursement status", "Payables / Expenses work areas"],
          ["Cash advance balances", "Expenses work area"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Approval is asynchronous:</strong> submitted reports move through workflow and may need action — poll status before assuming the report is approved.</li>
        <li><strong>Audit and holds gate payment:</strong> audit selection, payment hold rules, and risk indicators can block an otherwise approved report.</li>
        <li><strong>Cash advances settle:</strong> advances are applied to lines and settled — an unsettled advance can block final reimbursement.</li>
        <li><strong>Reimbursement is a Payables step:</strong> the report creates a payment request (exposed via <K>erpProcesses</K> for Create Accounting and reimbursement jobs — verify names in instance) that Payables then pays.</li>
        <li><strong>No public FBDI:</strong> use the third-party XML import and UCM upload (<K>fin/expenses/import</K>) paths documented in Using Expenses; verify against your instance.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/expenses">Expenses troubleshooting</a>{" "}
        for the most common approval, audit, and payment failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses">Expenses</a>.</li>
        <li>Reimbursement settles through <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a>.</li>
        <li>Entry and policy rules feed the approval stage — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses/templates-policies">Templates, Expense Types &amp; Policies</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
      </UL>
    </>
  );
}
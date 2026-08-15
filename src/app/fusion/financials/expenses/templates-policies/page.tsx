import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Templates, Expense Types & Policies",
};

export default function TemplatesPoliciesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Templates, Expense Types & Policies"
        description="The configuration layer that governs what employees can claim. Expense templates define the structure of a report, expense types and categories define what can be entered, and per-category policies enforce limits, mileage rates, per diem, and audit rules."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Expenses", href: "/fusion/financials/expenses" }, { label: "Templates, Expense Types & Policies" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses">Expenses hub</a> first, plus{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a> (business unit, legal entity). Template and policy names are shown as documented in Oracle's Using Expenses guide — verify against your instance.
      </Callout>

      <H2>Functional view</H2>
      <P>
        Three concepts are easy to confuse, so it helps to separate them. An{" "}
        <strong>expense template</strong> is the form an employee fills in; an{" "}
        <strong>expense type</strong> is the specific spend category (e.g. Hotel, Airfare, Meal);
        an <strong>expense category</strong> is the higher-level grouping that policies and accounts
        attach to. A template lists the expense types available on that report, and each type maps to
        a category that carries its accounting and policy defaults.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Expense template", "The report form: which expense types an employee can use on that report"],
          ["Expense type", "A specific spend type (Hotel, Airfare, Meal, Mileage) selectable on a line"],
          ["Expense category", "The grouping that carries policy limits, per diem, and account mapping"],
          ["Per-category policy", "Limits, mileage rates, per diem, and supporting-document rules per category"],
          ["Audit / anomaly rule", "Risk-based checks that flag a line or report for review"],
        ]}
      />
      <Diagram title="Template → type → category chain" className="mb-8">
        <DiagramNode tone="fusion" title="Expense template" subtitle="selectable expense types" />
        <Arrow label="offers" />
        <DiagramNode tone="neutral" title="Expense type" subtitle="Hotel, Airfare, Meal, Mileage" />
        <Arrow label="maps to" />
        <DiagramNode tone="warning" title="Expense category" subtitle="policy limits + account + per diem" />
      </Diagram>
      <Callout type="info">
        A line posts to the account derived from its <strong>expense type → category</strong> mapping.
        Matching the template a report is created under is essential — lines that use types not on the
        template are rejected or removed.
      </Callout>

      <H2>Configuration</H2>
      <P>
        Policy behavior is configuration, not code. Mileage and per-diem rules apply automatically
        when a matching line is entered, and audit rules fire on submit.
      </P>
      <DataTable
        headers={["Setup", "What it controls", "Where it lives"]}
        rows={[
          ["Expense types", "The individual spend types and their categories", "Expenses → Expense Types"],
          ["Expense templates", "Which types appear on a given report form", "Expenses → Expense Templates"],
          ["Categories", "Grouping that carries policy limits and accounting", "Expenses → Expense Policies"],
          ["Per-category policies", "Limits, mileage, per diem, supporting documents", "Expenses → Per Category Policies"],
          ["Audit rules", "Anomaly and duplicate-check rules applied on submit", "Expenses → Audit Rules"],
          ["Mileage rates & maps", "Rate determinants and distance maps used to calculate mileage", "Expenses → Mileage / Travel setup"],
        ]}
      />
      <Callout type="info">
        Most "why did this line reject" questions trace back to a missing per-category policy, an
        absent mileage rate for the date, or a type not on the template. Finish these setups before
        testing entry.
      </Callout>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="tmpl">expenseTemplates</K>, "Read the configured expense templates"],
          [<K key="tps">expenseTypes</K>, "Read the configured expense types and categories"],
          [<K key="mp">expenseMileagePolicies</K>, "Read mileage policy rules (GET)"],
          [<K key="ml">expenseMealsPolicies</K>, "Read meals itemization and meal policy rules (GET)"],
          [<K key="af">expenseAirfarePolicies</K>, "Read airfare policy rules (GET)"],
          [<K key="ac">expenseAccommodationsPolicies</K>, "Read accommodations/hotel policy rules (GET)"],
          [<K key="ent">expenseEntertainmentPolicies</K>, "Read entertainment policy rules (GET)"],
          [<K key="mis">expenseMiscPolicies</K>, "Read miscellaneous expense policy rules (GET)"],
          [<K key="pd">expensePerDiemPolicies</K>, "Read per-diem allowance rules (GET)"],
          [<K key="pdcalc">expensePerDiemCalculations</K>, "Calculate per-diem amounts from a request (POST) and retrieve results (GET)"],
          [<K key="scan">expenseScanImages</K>, "Upload and retrieve scanned receipt images (POST/GET)"],
        ]}
      />
      <Callout type="warning" title="Policy resources are read-only">
        These policy resources expose the configured rules for verification and integration
        awareness. They are <K>GET</K> only — create or update policies in the Expenses user
        interface. Verify the exact resource names against your instance&apos;s REST service
        catalog before building.
      </Callout>
      <H3>Working example — list expense types</H3>
      <CodeBlock
        language="bash"
        filename="GET /expenseTypes"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/expenseTypes?fields=ExpenseTypeName,ExpenseCategoryName,ActiveFlag&limit=50" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />
      <H3>Working example — calculate per diem</H3>
      <CodeBlock
        language="bash"
        filename="POST /expensePerDiemCalculations"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/expensePerDiemCalculations" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "PersonId": 12345,
    "PerDiemRateName": "EU Standard",
    "StartDate": "2025-03-10",
    "EndDate": "2025-03-12"
  }'`}
      />

      <H2>Data flow — step by step</H2>
      <P>Where each step of expense entry and policy enforcement lands in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Employee selects a template and enters lines via any channel (mobile, spreadsheet, Expense Assistant)", <K key="t1">EXM_EXPENSE_REPORT_LINES</K>],
          ["2", "Line heads reference the expense type and category", <K key="t2">EXM_EXPENSE_ASSIGNMENTS</K>, <K key="t3">EXM_EXPENSE_TYPES</K>],
          ["3", "Per-category and mileage/per-diem policies are evaluated against the line", <span key="t4s"><span key="c0"><K key="t4">EXM_EXPENSE_REPORT_LINES</K> (policy result fields)</span></span>],
          ["4", "Receipt scan images are associated with the line", <K key="t5">EXM_SCAN_IMAGES</K>],
          ["5", "Anomaly and audit rules flag lines for review", <K key="t6">EXM_AUDIT_RULES</K>, <K key="t7">EXM_AUDIT_RESULTS</K>],
          ["6", "The report is submitted for approval with all policy results attached", <span key="c1"><K key="t8">EXM_EXPENSE_REPORTS</K> (status fields)</span>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data dictionary.
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect expense lines and their category/type context.</P>
      <CodeBlock
        language="sql"
        filename="exm_expense_report_lines.sql"
        code={`-- Expense report lines with type and category
SELECT r.report_number, l.line_number, l.expense_date,
       l.expense_type_name, l.expense_category_name,
       l.amount, l.currency_code, l.description
FROM   exm_expense_report_lines l
JOIN   exm_expense_reports r ON r.expense_report_id = l.expense_report_id
WHERE  l.expense_report_id = :expense_report_id
ORDER BY l.line_number;`}
      />
      <CodeBlock
        language="sql"
        filename="exm_expense_lines_by_category.sql"
        code={`-- Lines for one category in a date range
SELECT l.expense_date, l.expense_category_name, l.expense_type_name,
       l.amount, l.policy_status
FROM   exm_expense_report_lines l
WHERE  l.expense_category_name = :category_name
AND    l.expense_date BETWEEN :start_date AND :end_date
ORDER BY l.expense_date;`}
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
          ["Expense line entered (approved report)", "Expense account (per expense type/category)", "Employee / payable liability"],
          ["Per-diem / mileage calculated", "Per-diem or mileage expense account", "Employee / payable liability"],
        ]}
      />
      <P>
        Lines post to the account mapped from their <strong>expense type → category</strong>. Entries
        come from the subledger accounting engine; trace them via <K>XLA_AE_HEADERS</K> /{" "}
        <K>XLA_AE_LINES</K> — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Expense Report Real Time", "OTBI subject area"],
          ["Expense spend by category / type", "OTBI dashboards"],
          ["Policy and audit exceptions", "Expenses work area, after submit"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Expense data entry is XML, not FBDI:</strong> Oracle&apos;s Using Expenses guide documents "Expense Report Data Flow Using a Third-Party Application," which uses <strong>XML export/import</strong>. There is no public 26C "Import Expense Reports" FBDI — confirm against your instance&apos;s FBDI guide before assuming one.</li>
        <li><strong>Type must be on the template:</strong> lines reference an expense type that must exist and appear on the report&apos;s template, or the line is rejected.</li>
        <li><strong>Policy evaluation is automatic:</strong> mileage, per-diem, and category limits apply on entry/submit — integration should expect policy result fields on the line.</li>
        <li><strong>Read-only policy resources:</strong> policies are configured in the UI and exposed for <K>GET</K> only; do not try to create policy rules via REST.</li>
        <li><strong>Per-diem is computed:</strong> request <K>expensePerDiemCalculations</K> before building lines so the correct allowance is carried onto the report.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/expenses">Expenses troubleshooting</a>{" "}
        for the most common entry and policy failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses">Expenses</a>.</li>
        <li>Card transactions become expense lines — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses/card-programs">Corporate Card Programs</a>.</li>
        <li>Submission and settlement workflows — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses/approval-audit">Approval, Audit &amp; Reimbursement</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
      </UL>
    </>
  );
}
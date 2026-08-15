import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Corporate Card Programs",
};

export default function CardProgramsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Corporate Card Programs"
        description="How company-issued corporate cards feed expense reporting. Card issuers deliver transaction files, Fusion maps them to employees and expense types, and the company-pay versus employee-pay model decides whether the issuer or the employee gets reimbursed."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Expenses", href: "/fusion/financials/expenses" }, { label: "Corporate Card Programs" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses">Expenses hub</a> and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses/templates-policies">Templates, Expense Types &amp; Policies</a>{" "}
        first. Card program and job names are shown as documented in Oracle&apos;s Using Expenses guide — verify against your instance.
      </Callout>

      <H2>Functional view</H2>
      <P>
        Corporate card programs model a <strong>card issuer</strong> (VISA, MasterCard, American
        Express, Diners Club) and the <strong>cards</strong> issued to employees. Card transactions
        arrive as files from the issuer, are imported and mapped to employees, and become{" "}
        <strong>card transactions</strong> that an employee either attaches to an expense report or
        reimburses directly.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Card program", "The corporate card arrangement with an issuer, with card transaction import settings"],
          ["Card", "An individual corporate card assigned to an employee"],
          ["Card transaction", "A single spend from the issuer's file, mapped to an employee and expense category"],
          ["Who-pays model", "Company pay (issuer is paid by the company) vs employee pay (employee settles)"],
          ["Mapping rule", "How transactions from an issuer file are assigned to employees and expense types"],
          ["Dispute", "A contested card transaction flagged for the issuer to correct"],
        ]}
      />
      <Diagram title="Card file to expense line" className="mb-8">
        <DiagramNode tone="neutral" title="Issuer file" subtitle="VISA / MC / Amex / Diners" />
        <Arrow label="import" />
        <DiagramNode tone="warning" title="Mapping rules" subtitle="employee + expense type" />
        <Arrow label="create" />
        <DiagramNode tone="fusion" title="Card transactions" subtitle="EXM_CARD_TRANSACTIONS" />
        <Arrow label="enrich" />
        <DiagramNode tone="success" title="Expense lines" subtitle="on an expense report" />
      </Diagram>
      <Callout type="info">
        In the <strong>company pay</strong> model the company pays the issuer directly and the
        employee only submits receipts. In the <strong>employee pay</strong> model the employee
        settles the card bill and is reimbursed through the expense report — this changes who ends up
        in the payment flow.
      </Callout>

      <H2>Configuration</H2>
      <P>
        Card integration is configured in the Expenses card setup area: the program, the who-pays
        assignment, and the rules that interpret issuer files.
      </P>
      <DataTable
        headers={["Setup", "What it controls", "Where it lives"]}
        rows={[
          ["Card programs", "Issuer relationship, file format, and processing defaults", "Expenses → Corporate Card setup"],
          ["Card issuer mapping rules", "How incoming transactions are matched to employees and expense types", "Expenses → Card mapping rules"],
          ["Who-pays assignment", "Whether each program is company pay or employee pay", "Expenses → Card setup"],
          ["Wait days", "How long a card transaction waits before it is available on reports", "Expenses → Card processing options"],
          ["Tokenization", "Masking of card numbers in stored and processed data", "Expenses → Card security setup"],
          ["PGP for card files", "Encryption/signing of inbound and outbound card files", "Expenses → File security setup"],
        ]}
      />
      <Callout type="info">
        A transaction that never maps to an employee is usually a missing <strong>mapping rule</strong>,
        an expired card record, or an employee record Fusion cannot resolve. Check these before
        escalating a card feed failure.
      </Callout>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="cct">expenseCreditCardTransactions</K>, "Read card transactions that arrived from issuers (GET only)"],
          [<K key="erp">erpProcesses</K>, "Trigger and monitor card file processing jobs (POST)"],
        ]}
      />
      <Callout type="warning" title="Card files are not FBDI">
        There is <strong>no public FBDI template for corporate card transaction files</strong> in the
        26C Financials FBDI guide. Card files are delivered by the issuer and processed through the{" "}
        <strong>card program interfaces</strong> configured in Expenses. Verify the exact resource
        names and the processing job names against your instance before building.
      </Callout>
      <H3>Working example — read card transactions</H3>
      <CodeBlock
        language="bash"
        filename="GET /expenseCreditCardTransactions"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/expenseCreditCardTransactions?fields=CardTransactionNumber,TransactionDate,TransactionAmount,CardNumber,CardProgramName,TransactionStatus&limit=100" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />
      <H3>Working example — submit a processing job</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "ProcessName": "Import Card Transactions",
    "ProcessType": "ESS"
  }'`}
      />
      <Callout type="info">
        The job name above is illustrative. Confirm the exact <K>erpProcesses</K> payload and the
        card-processing ESS job names against your instance&apos;s service catalog and job
        definitions.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>Where each step of card file processing lands in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "The card issuer delivers a transaction file (optionally PGP-signed/encrypted)", "Inbound file staging (card program interface)"],
          ["2", "A card file processing job imports and validates the file", "ESS job — name to verify in instance"],
          ["3", "Mapping rules assign each transaction to an employee, card, and expense type", <K key="t1">EXM_CARD_TRANSACTIONS</K>],
          ["4", "Transactions become available on expense reports after the configured wait days", <span key="c0"><K key="t2">EXM_EXPENSE_REPORT_LINES</K> (card-derived lines)</span>],
          ["5", "Card data is tokenized where required and dual-currency amounts are stored", <span key="c1"><K key="t3">EXM_CARD_TRANSACTIONS</K> (amount fields)</span>],
          ["6", "Approved reports reconcile and pay — the issuer (company pay) or employee (employee pay)", <K key="t4">AP_INVOICES_ALL</K>, <K key="t5">IBY_PAYMENTS_ALL</K>],
          ["7", "Accounting entries are created for company-pay vs employee-pay", <K key="t6">XLA_AE_HEADERS</K>, <K key="t7">XLA_AE_LINES</K>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data dictionary.
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect imported card transactions.</P>
      <CodeBlock
        language="sql"
        filename="exm_card_transactions.sql"
        code={`-- Card transactions for a card program in a date range
SELECT c.card_number, c.transaction_date, c.transaction_amount,
       c.currency_code, c.card_program_name, c.transaction_status,
       c.employee_name, c.expense_type_name
FROM   exm_card_transactions c
WHERE  c.card_program_name = :card_program_name
AND    c.transaction_date BETWEEN :start_date AND :end_date
ORDER BY c.transaction_date;`}
      />
      <CodeBlock
        language="sql"
        filename="exm_card_transactions_unmapped.sql"
        code={`-- Card transactions not yet mapped to an employee
SELECT c.card_number, c.transaction_date, c.transaction_amount,
       c.transaction_status, c.rejection_reason
FROM   exm_card_transactions c
WHERE  c.employee_name IS NULL
AND    c.transaction_status = 'UNMAPPED'
ORDER BY c.transaction_date;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <DataTable
        headers={["Model", "Debit", "Credit"]}
        rows={[
          ["Company pay", "Expense account (per expense type)", "Corporate card liability / payable to issuer"],
          ["Employee pay", "Expense account (per expense type)", "Employee / payable liability (then cash on reimbursement)"],
          ["Dispute adjustment", "Corporate card liability", "Expense account (reversal)"],
        ]}
      />
      <P>
        The <strong>who-pays model</strong> decides the credit side of the entry. Trace entries via{" "}
        <K>XLA_AE_HEADERS</K> / <K>XLA_AE_LINES</K> — see{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Card transaction import status", "Expenses work area, after each file"],
          ["Corporate card spend", "OTBI dashboards"],
          ["Unmatched card transactions", "Expenses work area / exception reports"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>No public card FBDI:</strong> card files flow through the card program interfaces, not an FBDI template. Verify file-format requirements and job names against your instance.</li>
        <li><strong>Mapping rules first:</strong> without issuer mapping rules, transactions land unmapped and never reach a report.</li>
        <li><strong>Wait days:</strong> transactions are withheld for the configured wait days — do not expect them on reports immediately after import.</li>
        <li><strong>Who-pays changes payment:</strong> company-pay reports pay the issuer; employee-pay reports reimburse the employee through Payables. Confirm the assignment per program.</li>
        <li><strong>Tokenization &amp; PGP:</strong> card data is tokenized per security setup, and card files are typically PGP-signed/encrypted — include key exchange in the project plan.</li>
        <li><strong>Dual-currency transactions:</strong> transactions in a currency other than the reporting currency carry both amounts — be careful which amount feeds accounting.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/expenses">Expenses troubleshooting</a>{" "}
        for the most common card feed and mapping failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses">Expenses</a>.</li>
        <li>Card lines must pass policy checks — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses/templates-policies">Templates, Expense Types &amp; Policies</a>.</li>
        <li>Approved card reports flow into payment — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/expenses/approval-audit">Approval, Audit &amp; Reimbursement</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
      </UL>
    </>
  );
}
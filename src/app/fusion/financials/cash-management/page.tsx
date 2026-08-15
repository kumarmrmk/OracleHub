import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import LearningPath from "@/components/ui/LearningPath";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Cash Management",
};

const topics = [
  {
    href: "/fusion/financials/cash-management/bank-setup",
    title: "Banks, Branches & Accounts",
    desc: "The bank → branch → account hierarchy, internal vs external accounts, payment documents.",
    tone: "border-t-sky-500/60",
  },
  {
    href: "/fusion/financials/cash-management/statements",
    title: "Bank Statements & BAI2",
    desc: "Statement import, parse rule sets, transaction type mapping, BAI2, tolerance rules.",
    tone: "border-t-emerald-500/60",
  },
  {
    href: "/fusion/financials/cash-management/reconciliation",
    title: "Reconciliation & Forecasting",
    desc: "Matching rules, automatic/manual reconciliation, cash positioning & pools.",
    tone: "border-t-amber-500/60",
  },
];

export default function CashManagementPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Cash Management"
        description={<>Manages bank accounts and <Term k="reconciliation">reconciles</Term> them. Cash Management ingests bank statements, matches them against internal cash transactions (payments, receipts), and lets you <Term k="reconciliation">reconcile</Term> balances. This hub is your starting point; the deep dives below cover each area in functional and technical detail.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Cash Management" }]}
        updated="August 2026"
        level="Foundation"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a> (ledger, business units),{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a> (payments), and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables</a> (receipts) before this page.
      </Callout>

      <H2>The business story</H2>
      <P>
        Ask the CEO "how much cash do we have?" and the honest answer needs Cash Management. Every
        payment made and every receipt collected lands in a <strong>bank account</strong>; the bank
        sends a <strong>statement</strong>; Cash Management <strong>reconciles</strong> the two. It
        is the module that proves the money you think you have is actually in the bank.
      </P>
      <Diagram title="Cash into perspective" className="mb-8">
        <DiagramNode tone="neutral" icon="🏦" title="Bank account" subtitle="payments · receipts · transfers" />
        <Arrow />
        <DiagramNode tone="warning" icon="📜" title="Bank statement" subtitle="BAI2 · imported" />
        <Arrow />
        <DiagramNode tone="warning" icon="🔗" title="Reconcile" subtitle="match bank line ↔ transaction" />
        <Arrow />
        <DiagramNode tone="success" icon="📊" title="Cash position" subtitle="true balance · forecast" />
      </Diagram>
      <Callout type="info">
        Reconciliation creates no new accounting — it <em>confirms</em> transactions already posted.
        The goal is simple: the GL cash balance and the bank statement should eventually agree.
      </Callout>

      <Callout type="note" title="In simple words">
        Cash Management checks that what the company thinks is in the bank <strong>is actually in
        the bank</strong>. It matches the company's records against the bank statement.
      </Callout>

      <H2>Functional view</H2>
      <P>
        Cash Management sits between <strong>Payables</strong> (money out) and{" "}
        <strong>Receivables</strong> (money in): the payments it issues and the receipts it collects
        are the same cash transactions a bank statement eventually lists — and the system matches the
        two sides together.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Bank account", "A bank, branch, and account number combination you control"],
          ["Bank transaction", "A movement of money on the account (deposit, withdrawal, bank charge)"],
          ["Bank statement", "A period's statement of transactions from the bank — the input to reconciliation"],
          ["Reconciliation", "The process of matching statement lines to system transactions"],
        ]}
      />

      <H2>Deep dives — read in this order</H2>
      <P>
        Set up banks/accounts first, then statements, then reconciliation. If you integrate payments
        or receipts, the bank account is the anchor for everything else.
      </P>
      <LearningPath
        steps={[
          {
            href: "/fusion/financials/cash-management/bank-setup",
            title: "Banks, Branches & Accounts",
            level: "Module",
            outcome: "The bank-house setup every account, statement, payment, and receipt anchors to.",
          },
          {
            href: "/fusion/financials/cash-management/statements",
            title: "Bank Statements & BAI2",
            level: "Module",
            outcome: "How statements are imported, parsed, and mapped before they can reconcile.",
          },
          {
            href: "/fusion/financials/cash-management/reconciliation",
            title: "Reconciliation & Forecasting",
            level: "Advanced",
            outcome: "Matching, exceptions, cash positioning, and pools — the end of the cash cycle.",
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

      <H2>Technical view — the Cash integration surfaces</H2>
      <P>
        Two facts that differ from older training material: there is no <K>bankStatements</K> REST
        create in current Fusion docs (statements load via the Cash Management Bank Statement FBDI),
        and the correct REST names are <K>cashBanks</K> / <K>cashBankBranches</K> /{" "}
        <K>cashBankAccounts</K>.
      </P>
      <DataTable
        headers={["Surface", "Resource / job", "What you can do with it"]}
        rows={[
          [<K key="cb">cashBanks</K>, "REST (C/U/D)", "Create/read/update banks"],
          [<K key="cbb">cashBankBranches</K>, "REST (C/U/D)", "Create/read/update bank branches"],
          [<K key="cba">cashBankAccounts</K>, "REST (C/U)", "Create/read/update bank accounts (no delete)"],
          [<K key="ct">cashBankAccountTransfers</K>, "REST (C/U)", "Create/read bank account transfers"],
          [<K key="cp">cashPools</K>, "REST (C/U/D)", "Create/read notional & physical cash pools (with cashPoolMembers)"],
          [<K key="cet">cashExternalTransactions</K>, "REST (C/U/D)", "Create/read external cash transactions"],
          [<K key="fbd">Bank Statement Data Import</K>, "FBDI → Import Bank Statement from a Spreadsheet", "Load CE_STATEMENT_* interface rows — the statement create path"],
          [<K key="proc">erpProcesses</K>, "REST (POST)", "Submit Import Bank Statement / Automatic Reconciliation / Generate Cash Position"],
        ]}
      />

      <H2>Configuration</H2>
      <P>
        Bank accounts and their GL mapping come first; statements and reconciliation follow.
      </P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Bank + branch + bank account", "The account that owns the cash (external or internal)", "Cash Management → Bank Accounts"],
          ["Cash account mapping", "Which GL account the bank account posts to", "Bank Account setup"],
          ["Statement formats", "How bank statements are imported (BAI/CAMT/etc.)", "Bank Statement setup"],
          ["Reconciliation rules", "What makes a bank line match a payment/receipt", "Reconciliation rules"],
          ["Cash positioning", "Forecast view setup", "Cash Management setup"],
        ]}
      />
      <Callout type="info">
        A bank account invisible to a user, or a statement that won't import, is almost always a
        setup/security issue rather than a data bug.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>
        Where each step of the bank account → statement → reconciliation chain lands in the
        underlying tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Bank account is set up", <K key="t1">CE_BANK_ACCOUNTS</K>],
          ["2", "Cash transactions (payments/receipts) hit the account", <K key="t2">CE_CASH_TRANSACTIONS</K>],
          ["3", "Statement is staged from the FBDI file", <span key="t3x"><K key="t3">CE_STATEMENT_HEADERS_INT</K>, <K key="t4">CE_STATEMENT_LINES_INT</K></span>],
          ["4", "Import Bank Statement creates the statement", <K key="t5">CE_STATEMENT_HEADERS</K>],
          ["5", "Statement lines carry each bank movement", <K key="t6">CE_STATEMENT_LINES</K>],
          ["6", "Reconciliation matches statement lines to system transactions", <span key="t7x"><span key="c0"><K key="t7">CE_STATEMENT_LINES</K> (status)</span> + <span key="c1"><K key="t8">CE_CASH_TRANSACTIONS</K> (matched)</span></span>],
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
        filename="ce_bank_accounts.sql"
        code={`-- Bank accounts
SELECT b.bank_account_id, b.bank_account_name, b.bank_account_num,
       b.bank_name, b.bank_branch_name, b.currency_code, b.status
FROM   ce_bank_accounts b
ORDER BY b.bank_account_name;`}
      />
      <CodeBlock
        language="sql"
        filename="ce_statements.sql"
        code={`-- Statement header + lines (the reconciliation input)
SELECT s.statement_name, s.statement_date, s.status AS statement_status,
       l.statement_line_id, l.trx_date, l.trx_type, l.amount,
       l.reconciliation_status
FROM   ce_statement_headers s
JOIN   ce_statement_lines l
  ON   l.statement_header_id = s.statement_header_id
WHERE  s.statement_date >= SYSDATE - 30
ORDER BY s.statement_date DESC, l.trx_date;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Cash is the clearing point between payments/receipts and the GL bank account:
      </P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Supplier payment", "AP liability", "Cash / bank (via the bank account's GL mapping)"],
          ["Customer receipt", "Cash / bank", "AR receivable"],
          ["Bank transfer", "Cash in target account", "Cash in source account"],
        ]}
      />
      <P>
        Reconciliation marks a bank line <em>matched</em> or <em>cleared</em> — it doesn't create
        additional accounting, it confirms the transaction exists in the bank statement.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Cash Position, Liquidity Forecast", "Cash Management work areas"],
          ["Bank Statement, Reconciliation reports", "Delivered BIP reports"],
          ["Cash Management Real Time subject areas", "OTBI"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Statements come from FBDI, not REST:</strong> the create path for statements is the Cash Management Bank Statement Data Import (interface tables + ESS job).</li>
        <li><strong>Bank account must exist</strong> before a statement import; match on bank + branch + account number.</li>
        <li><strong>Reconciliation:</strong> after import, transaction matching is semi-automatic — plan for unmatched lines.</li>
        <li><strong>Format matters:</strong> bank statement files (custom/ISO 20022/BAI2) must map to the parse rule sets and transaction type mapping exactly.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/cash-management">Cash Management troubleshooting</a>{" "}
        for the most common failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Payments and receipts come from <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a> and <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables</a>.</li>
        <li>Statement staging is covered in <a className="font-semibold text-accent hover:underline" href="/fusion/interface-tables">Interface Tables</a>.</li>
      </UL>
    </>
  );
}

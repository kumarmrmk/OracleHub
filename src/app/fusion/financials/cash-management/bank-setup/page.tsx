import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Banks, Branches & Accounts",
};

export default function BankSetupPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Banks, Branches & Accounts"
        description="Sets up the bank master data that every cash transaction touches. A bank account is the anchor: payments and receipts post to it, bank statements reconcile against it, and cash pools consolidate it."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Cash Management", href: "/fusion/financials/cash-management" }, { label: "Banks, Branches & Accounts" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management">Cash Management</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a> (business units), and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/flexfields">Flexfields &amp; Value Sets</a> (account combinations) before this page.
      </Callout>

      <H2>Functional view</H2>
      <P>
        Bank master data is a strict hierarchy: a <strong>bank</strong> has one or more{" "}
        <strong>branches</strong>, and a <strong>bank account</strong> lives on one branch. The
        account is what Cash Management, Payables, and Receivables actually transact on.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Bank", "A financial institution you hold cash with or reference (party record)"],
          ["Bank branch", "A specific branch of the bank; the account's home"],
          ["Bank account", "The account on a branch — internal (yours) or external (counterparty's)"],
          ["Account owner & user rules", "Who can transact on or query the account"],
          ["Bank account use", "One business unit + cash account combination that posts to GL"],
          ["Payment document / checkbook", "A payment instrument format assigned to the account"],
          ["Cash pool", "A group of accounts whose balances are consolidated (notional or physical)"],
        ]}
      />
      <P>
        <strong>Internal</strong> bank accounts are your own and get the full treatment: uses per
        business unit, payment documents, and GL mapping. <strong>External</strong> accounts belong
        to third parties (for example a supplier's account) and are only referenced. A{" "}
        <strong>bank account validation service</strong> can check account numbers (IBAN/BIC style
        validation) when the account is created or edited.
      </P>
      <Diagram title="Bank master data hierarchy" className="mb-8">
        <DiagramNode tone="neutral" title="Bank" subtitle="party record, e.g. HZ_PARTIES" />
        <Arrow />
        <DiagramNode tone="neutral" title="Bank branch" subtitle="one or more per bank" />
        <Arrow />
        <DiagramNode tone="fusion" title="Bank account" subtitle="internal or external, owns the cash" />
        <Arrow />
        <DiagramNode tone="success" title="Uses + payment docs" subtitle="BU + cash account per use" />
        <Arrow label="optional" />
        <DiagramNode tone="oic" title="Cash pool" subtitle="notional or physical" />
      </Diagram>

      <H2>Configuration</H2>
      <P>Set up in this order — each level references the one above it.</P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Bank", "The party that issues statements and holds the cash", "Cash Management → Banks"],
          ["Bank branch", "The account's home branch; used to match statements", "Cash Management → Branches"],
          ["Bank account", "The transactable account (internal vs external)", "Cash Management → Bank Accounts"],
          ["Account owner assignment", "Owners and user rules control who can act on the account", "Bank Account setup → Owners"],
          ["Bank account uses per business unit", "Links the account to a BU and its cash account combination", "Bank Account setup → Uses"],
          ["Payment document setup", "Payment instruments (checks, formats) the account can issue", "Payables/CM → Payment Documents"],
        ]}
      />
      <Callout type="info">
        A bank account with no use for a business unit cannot post cash transactions for that unit —
        finish the uses before loading payments or receipts.
      </Callout>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">cashBanks</K>, "Create/update/delete bank master records (C/U/D)"],
          [<K key="r2">cashBankBranches</K>, "Create/update/delete branches under a bank (C/U/D)"],
          [<K key="r3">cashBankAccounts</K>, "Create/update bank accounts (C/U — no DELETE; deactivate instead)"],
          [<K key="r4">cashBankAccounts/bankAccountGrants</K>, "Manage account grants as a child of a bank account (C/U)"],
          [<K key="r5">cashBankAccounts/bankAccountUses</K>, "Manage business unit uses and cash account mapping (C/U)"],
          [<K key="r6">cashBankAccounts/bankAccountPaymentDocuments</K>, "Manage payment documents on the account (C/U)"],
          [<K key="r7">cashBankAccounts/bankAccountCheckbooks</K>, "Manage checkbooks on the account (C/U)"],
          [<K key="r8">cashBankAccounts/bankAccountTransactionCreationRules</K>, "Manage statement transaction creation rules (C/U)"],
          [<K key="r9">cashPools</K>, "Create/update/delete cash pools (C/U/D) with cashPoolMembers child"],
          [<K key="r10">bankAccountUserRules</K>, "Manage bank account owner/user rules (C/U)"],
        ]}
      />
      <H3>Working example — create a bank account</H3>
      <CodeBlock
        language="bash"
        filename="POST /cashBankAccounts"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/cashBankAccounts" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "BankAccountName": "Acme EUR Operations",
    "BankAccountNum": "DE89 3704 0044 0532 0130 00",
    "BankName": "Deutsche Bank",
    "BankBranchName": "Deutsche Bank Berlin",
    "CurrencyCode": "EUR",
    "InternalExternalFlag": "INTERNAL",
    "bankAccountUses": [
      {
        "BusinessUnit": "US1 Business Unit",
        "CurrencyCode": "EUR",
        "CashAccount": "01.02.003.0000.0000.000000000.000"
      }
    ]
  }'`}
      />
      <Callout type="tip">
        Resource and child names are from the official Financials REST guide for release 26C.
        Verify the resource version and attribute names against your instance before coding.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>Where each step of the bank → branch → account → uses → documents chain lands.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Bank is created (REST or manually)", <span key="c0"><K key="t1">HZ_PARTIES</K> (bank party)</span>],
          ["2", "Bank branch is created under the bank", <span key="c1"><K key="t2">HZ_PARTIES</K> (branch party)</span>],
          ["3", "Bank account is created on the branch (internal/external)", <K key="t3">CE_BANK_ACCOUNTS</K>],
          ["4", "Owner and user rules are assigned", <span key="t4cell">Bank account owner/user rule records</span>],
          ["5", "Bank account use maps a business unit to its cash account", <span key="t5cell">Bank account use assignment (business unit + cash account)</span>],
          ["6", "Payment documents / checkbooks are set up for issuing payments", <span key="t6cell">Payment document records under the account</span>],
          ["7", "(Optional) the account joins a cash pool", <span key="c2"><K key="t7">CE_CASH_POOLS_ALL</K> (pool membership)</span>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data
        dictionary. Exact names can vary slightly by release — confirm against your instance's data
        dictionary before relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to pull back the bank master setup.</P>
      <CodeBlock
        language="sql"
        filename="ce_bank_accounts.sql"
        code={`-- Bank accounts with their bank and branch
SELECT b.bank_account_id, b.bank_account_name, b.bank_account_num,
       b.bank_name, b.bank_branch_name, b.currency_code,
       b.internal_external_flag, b.status
FROM   ce_bank_accounts b
WHERE  b.status = 'OPEN'
ORDER BY b.bank_name, b.bank_account_name;`}
      />
      <CodeBlock
        language="sql"
        filename="hz_parties_banks.sql"
        code={`-- Bank and branch party records
SELECT p.party_id, p.party_name, p.party_number, p.party_type,
       p.status, p.created_by, p.creation_date
FROM   hz_parties p
WHERE  p.party_type IN ('BANK', 'BANK_BRANCH')
ORDER BY p.party_type, p.party_name;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Setting up a bank account is master data — it creates no accounting entries. The{" "}
        <strong>cash account</strong> on each bank account use decides where cash postings land in
        the GL.
      </P>
      <DataTable
        headers={["Event", "What happens in GL"]}
        rows={[
          ["Bank/branch/account creation", "No accounting — master data only"],
          ["Bank account use (cash account)", "Defines the destination account for cash postings"],
          ["Payment or receipt on the account", "Cash posts via the use's cash account (see Reconciliation)"],
          ["Bank transfer between accounts", "Cash in target vs cash in source (see Reconciliation)"],
        ]}
      />

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Bank Account, Bank Account Uses reports", "Cash Management work areas / delivered BIP reports"],
          ["Cash Pool balances", "Cash Management work area"],
          ["Cash Management Real Time subject areas", "OTBI"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Order matters:</strong> bank → branch → bank account → uses → payment documents; each step references the previous one.</li>
        <li><strong>No DELETE on the account:</strong> <K>cashBankAccounts</K> has no delete operation — deactivate rather than delete.</li>
        <li><strong>Uses before transactions:</strong> a bank account use (with a valid cash account combination) must exist before payments or receipts can post for a business unit.</li>
        <li><strong>Statement matching:</strong> bank statement imports match on bank + branch + account number, so keep these stable.</li>
        <li><strong>Validation service:</strong> the bank account validation service checks account numbers on create/update — validate before you import.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/cash-management">Cash Management troubleshooting</a>{" "}
        for the most common failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management">Cash Management hub</a>.</li>
        <li>Statements for these accounts are imported via FBDI — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/statements">Bank Statements &amp; BAI2</a>.</li>
        <li>Matched lines and cash positions build on this setup — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cash-management/reconciliation">Reconciliation &amp; Forecasting</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
      </UL>
    </>
  );
}

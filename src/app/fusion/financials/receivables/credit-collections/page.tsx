import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Credit Management & Collections",
};

export default function CreditCollectionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Credit Management & Collections"
        description="How Receivables decides who gets credit and how it chases what&apos;s overdue. Credit profiles, scoring models, and data points control the credit check; Advanced Collections runs aging, dunning, strategies, and collector worklists to recover the balance."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Receivables (AR)", href: "/fusion/financials/receivables" }, { label: "Credit Management & Collections" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables hub</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/receipts">Receipts &amp; Lockbox</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a> first. Credit checks assume customers exist with credit profiles.
      </Callout>

      <H2>Functional view</H2>
      <P>
        <strong>Credit Management</strong> decides whether a customer can get credit and whether an
        order or transaction is allowed to proceed. <strong>Advanced Collections</strong> takes over
        once a balance becomes delinquent: it ages the balance, duns the customer, assigns work to
        collectors through strategies, and tracks promises and disputes.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Credit profile", "Customer&apos;s credit limit, rating, and currency for credit decisions"],
          ["Credit scoring model", "Scores a customer from data points to set limits and ratings"],
          ["Credit case folder", "A working folder that holds credit decisions, documents, and the review trail"],
          ["Data point", "A unit of credit data (financial ratios, bureau data) that scoring uses"],
          ["Periodic credit review", "Scheduled re-evaluation of a customer&apos;s credit worthiness"],
          ["Aging method / dunning", "Buckets overdue balances and drives aged or staged dunning letters"],
          ["Collections strategy", "Assigns tasks and scoring to collectors based on delinquency segments"],
          ["Collector", "The person or team assigned the overdue accounts via the worklist"],
          ["Promise to pay", "A customer commitment to pay by a date — tracked for fulfillment"],
          ["Dispute", "A customer disagreement with the balance, resolved with adjustments"],
        ]}
      />
      <Diagram title="Collections journey" className="mb-8">
        <DiagramNode tone="neutral" title="Credit check" subtitle="order / transaction vs profile & score" />
        <Arrow label="over limit" />
        <DiagramNode tone="warning" title="Credit case folder" subtitle="review and decision" />
        <Arrow label="delinquent" />
        <DiagramNode tone="warning" title="Aging & dunning" subtitle="aged / staged buckets" />
        <Arrow label="strategy" />
        <DiagramNode tone="oic" title="Collections strategy" subtitle="tasks and scoring for the collector" />
        <Arrow label="resolve" />
        <DiagramNode tone="success" title="Promise / payment" subtitle="or dispute with adjustment" />
      </Diagram>
      <P>
        A failed <strong>credit check</strong> (over limit, or a scoring model decision) can hold the
        order or open a <strong>credit case folder</strong> for review. In Advanced Collections,{" "}
        <strong>aging methods</strong> bucket overdue balances, <strong>dunning</strong> produces aged
        or staged letters, and <strong>collections strategies</strong> use scoring formulas and
        segments to decide what the collector does next. The <strong>collections dashboard</strong>{" "}
        reports CEI (collection effectiveness index) and DSO (days sales outstanding) alongside
        collector workload. <strong>Disputes</strong> are opened by the collector and resolved with
        adjustments.
      </P>

      <H2>Configuration</H2>
      <P>Set up credit and collections rules before the checks and dunning run.</P>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Credit profiles", "Credit limits, ratings, and currency per customer", "Credit Management setup → Credit profiles"],
          ["Credit scoring models", "Score formulas and segments used to compute limits and ratings", "Credit Management setup → Scoring models"],
          ["Collections strategies", "Scoring formulas/segments that assign work to collectors", "Advanced Collections setup → Strategies"],
          ["Aging buckets", "The overdue periods (0-30, 31-60, …) used in aging and dunning", "Receivables / Advanced Collections aging setup"],
          ["Dunning rules", "When and how aged or staged dunning letters are produced", "Advanced Collections setup → Dunning rules"],
        ]}
      />

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">collectionPromises</K>, "Record a promise to pay from a customer (POST)"],
          [<K key="r2">collectionsDelinquencies</K>, "Read delinquency data used by collections"],
          [<K key="r3">collectionStrategies</K>, "Read collections strategy definitions"],
          [<K key="r4">creditAndCollectionsDataPoints</K>, "Read credit data points across Credit &amp; Collections"],
          [<K key="r5">dataPointValues</K>, "Create/update data point values (C/U) that scoring uses"],
          [<K key="r6">receivablesDisputes</K>, "Open a dispute on a balance (POST)"],
          [<K key="r7">receivablesAdjustments</K>, "Read adjustments used to resolve disputes (write-offs, corrections)"],
          [<K key="r8">erpProcesses</K>, "Submit ESS jobs such as Create Accounting to post adjustments"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Credit Management Data Points Import</K>, "Bulk-load credit data points that feed scoring models", "Customer credit profile, data source setup"],
          [<K key="f2">Customer Import</K>, "Create/update customers including credit profile fields (HZ_IMP_* tables, ESS job 'Import Trading Community Data in Bulk')", "None"],
        ]}
      />
      <Callout type="info">
        There is no dedicated dunning FBDI in the Financials FBDI guide — dunning and aging letters
        are generated from receivables data by the Advanced Collections processes. Verify the
        availability of any collections-related interface template against your instance.
      </Callout>
      <H3>Working example — record a promise to pay</H3>
      <CodeBlock
        language="bash"
        filename="POST /collectionPromises"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/collectionPromises" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "CustomerId": 987654,
    "PromiseToPayAmount": 2500,
    "PromiseToPayDate": "2026-09-01",
    "PromiseToPayType": "FULL"
  }'`}
      />
      <H3>Working example — post adjustments via erpProcesses</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "ProcessName": "Create Accounting"
  }'`}
      />
      <Callout type="info">
        The <K>erpProcesses</K> payload must match the scheduled process definition in your
        instance, and the REST resource names above follow the Oracle 26C Financials REST guide —
        confirm availability against your instance.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>Where the credit and collections chain lands in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Customer is created with a credit profile (limit, rating, currency)", <K key="t1">HZ_PARTIES</K>, <K key="t2">HZ_CUST_ACCOUNTS</K>, "credit profile data"],
          ["2", "Order / transaction credit check runs against the profile and score", "Credit check result (case folder / credit hold records)"],
          ["3", "Failed check opens a credit case folder for review", "Credit case folder tables (verify in your instance)"],
          ["4", "Delinquency is detected through aging / dunning", "AR collections delinquency data (views vary by release)"],
          ["5", "A collections strategy assigns tasks to the collector", "Strategy / worklist tables (verify)"],
          ["6", "Collector records a promise to pay (collectionPromises) or opens a dispute (receivablesDisputes)", "Collection activity records (verify)"],
          ["7", "Customer pays; the receipt is created and applied", <K key="t3">AR_CASH_RECEIPTS_ALL</K>, <K key="t4">AR_RECEIVABLE_APPLICATIONS_ALL</K>],
          ["8", "Dispute adjustments post through Create Accounting", <K key="t5">XLA_AE_HEADERS</K>, <K key="t6">XLA_AE_LINES</K>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data
        dictionary. Exact names can vary slightly by release — confirm against your instance&apos;s data
        dictionary before relying on them. Credit case folder, strategy, and delinquency tables and
        views vary by release — always verify before querying.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect delinquent balances and credit data.</P>
      <CodeBlock
        language="sql"
        filename="delinquent_customers.sql"
        code={`-- Outstanding balances per customer account
-- (Advanced Collections also ships aging/delinquency views whose names vary by release)
SELECT ca.cust_account_id, ca.account_name, t.invoice_currency_code,
       SUM(t.acctd_amount_due_remaining) AS outstanding_amount
FROM   ra_customer_trx_all t
JOIN   hz_cust_accounts ca ON ca.cust_account_id = t.bill_to_customer_id
WHERE  t.trx_class IN ('INV', 'CM', 'DM')
AND    t.status_trx = 'OP'
GROUP BY ca.cust_account_id, ca.account_name, t.invoice_currency_code
HAVING SUM(t.acctd_amount_due_remaining) > 0
ORDER BY outstanding_amount DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="credit_data_points.sql"
        code={`-- Customer master records that underpin the credit profile
SELECT ca.cust_account_id, ca.account_name,
       p.party_number, p.party_name
FROM   hz_cust_accounts ca
JOIN   hz_parties p ON p.party_id = ca.party_id
WHERE  ca.cust_account_id = :cust_account_id;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead. Individual credit data point values are best read through
        the <K>creditAndCollectionsDataPoints</K> resource or OTBI subject areas.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Credit checks and dunning create no entries; the accounting appears when money moves or an
        adjustment posts through the sub-ledger accounting engine:
      </P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Write-off / chargeback adjustment", "AR adjustments account", "AR trade receivable"],
          ["Dispute resolved with an adjustment", "AR adjustments account", "AR trade receivable"],
          ["Payment received from the customer", "Cash / bank", "AR trade receivable"],
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
          ["Collections dashboard (CEI, DSO, collector workload)", "Advanced Collections work area / dashboards"],
          ["Aging & dunning letters", "Delivered BIP reports / Advanced Collections"],
          ["Credit & Collections subject areas", "OTBI"],
          ["Delinquent customers report", "Advanced Collections work area"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Profile before credit check:</strong> establish credit profiles and scoring before orders run credit checks, or every order is held.</li>
        <li><strong>Data points drive scoring:</strong> feed scoring inputs via the Credit Management Data Points Import FBDI or <K>dataPointValues</K> (C/U).</li>
        <li><strong>Promises via POST:</strong> record promises to pay with <K>collectionPromises</K> and track fulfillment.</li>
        <li><strong>Disputes:</strong> open with <K>receivablesDisputes</K> (POST) and resolve with adjustments read through <K>receivablesAdjustments</K> (GET).</li>
        <li><strong>No dunning FBDI:</strong> verify any collections interface template against your instance before relying on it.</li>
        <li><strong>Post adjustments:</strong> run Create Accounting via <K>erpProcesses</K> or scheduled processes after write-offs and dispute adjustments.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/receivables">Receivables troubleshooting</a>{" "}
        for the most common credit and collections failures.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables (AR)</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Collected money is applied in <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/receipts">Receipts &amp; Lockbox</a>.</li>
        <li>Dispute adjustments affect revenue — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables/revenue">Revenue &amp; Credit Memos</a>.</li>
      </UL>
    </>
  );
}
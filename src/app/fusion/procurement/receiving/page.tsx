import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";

export const metadata = {
  title: "Receiving",
};

export default function ReceivingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Receiving"
        description="How goods actually arriving turn into receipts. Receiving records what was received against a purchase order line, routes items to inventory or a destination, and produces the receipt the 3-way match (PO ↔ receipt ↔ invoice) depends on. It is the last Procurement step before Payables takes over."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "SCM & Procurement", href: "/fusion/procurement" }, { label: "Receiving" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/procurement/purchase-orders">Purchase Orders</a> first — receipts are always recorded against an open, approved PO line.
      </Callout>

      <H2>Functional view</H2>
      <P>
        When goods arrive, the warehouse records a <strong>receipt</strong>: which PO line, how many,
        and where they go. Receiving can route items to <em>inventory</em> (stocked items), to a{" "}
        <em>destination</em> (expense/asset), or to <em>inspection</em>. A receipt can be created
        directly, via the receiving mobile/UI, or through the{" "}
        <strong>receiving interface</strong> tables that bulk loads use.
      </P>
      <Diagram title="Receiving flow" className="mb-8">
        <DiagramNode tone="neutral" title="Goods arrive" subtitle="against an open PO line" />
        <Arrow />
        <DiagramNode tone="warning" title="Receiving transaction" subtitle="route · quantity · originate" />
        <Arrow />
        <DiagramNode tone="success" title="Receipt created" subtitle="RCV_TRANSACTIONS" />
        <Arrow label="accrual / match" />
        <DiagramNode tone="fusion" title="Payables" subtitle="3-way match · accrual · invoice" />
      </Diagram>

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="r1">receipts / receivingTransactions</K>, "Create/read receiving transactions (the REST create path)"],
          [<K key="r2">purchaseOrders</K>, "Read PO lines you are receiving against (for validation)"],
          [<K key="proc">erpProcesses</K>, "POST — submit the receiving / transfer to General Ledger ESS job as needed"],
        ]}
      />
      <H3>FBDI / interface tables</H3>
      <DataTable
        headers={["Template / interface", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Import Receipts</K>, "Bulk-load receiving transactions", "Open, approved PO lines; valid receiving options"],
          [<K key="i1">RCV_HEADERS_INTERFACE</K>, "Staged receipt headers for the import", "—"],
          [<K key="i2">RCV_TRANSACTIONS_INTERFACE</K>, "Staged receiving lines / transactions", "—"],
        ]}
      />
      <H3>Working example — create a receipt via REST</H3>
      <CodeBlock
        language="bash"
        filename="POST /receipts"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/scmRestApi/resources/latest/receipts" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version" \\
  -X POST \\
  -d '{
    "ReceiptSourceType": "PURCHASE_ORDER",
    "TransactionDate": "2026-09-10",
    "ReceiptLines": [
      {
        "OriginType": "PO",
        "PoHeaderId": 1000001,
        "PoLineId": 1000011,
        "Quantity": 10,
        "UnitOfMeasure": "EA"
      }
    ]
  }'`}
      />

      <H2>Data flow — step by step</H2>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Receiving data is staged (UI, REST, or FBDI import)", <span key="t1c"><K key="t1">RCV_HEADERS_INTERFACE</K> / <K key="t2">RCV_TRANSACTIONS_INTERFACE</K></span>],
          ["2", "The receiving transaction is created against the PO line", <K key="t3">RCV_TRANSACTIONS</K>],
          ["3", "Items route to inventory or a destination", <K key="t4">MTL / destination tables</K>],
          ["4", "The receipt is available for 3-way match in Payables", <K key="t5">AP matching tables</K>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your instance before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="rcv_transactions.sql"
        code={`SELECT r.transaction_id, r.receipt_num, r.transaction_date, r.quantity,
       r.transaction_type, r.primary_quantity, r.unit_of_measure
FROM   rcv_transactions r
WHERE  r.transaction_date >= SYSDATE - 15
ORDER BY r.transaction_date DESC;`}
      />

      <H2>Worked example — receiving 10 chairs</H2>
      <WorkedExample
        title="Worked example: 10 of 10 chairs received"
        intro={
          <>
            The PO ordered <strong>10 chairs</strong>. The warehouse receives all <strong>10</strong>{" "}
            against the open PO line.
          </>
        }
        steps={[
          {
            label: "1 · The receipt",
            body: <>A receiving transaction creates the receipt in <K>RCV_TRANSACTIONS</K> — quantity 10, unit EA, PO line reference.</>,
          },
          {
            label: "2 · Route",
            body: <>Stocked items go into inventory; here the chairs route to the facilities destination.</>,
          },
          {
            label: "3 · Enable matching",
            body: <>The receipt now exists, so the later invoice can 3-way match (PO + receipt + invoice).</>,
          },
        ]}
        journal={[{ account: "Accrued liability (01-2200-100)", credit: "$1,500" }]}
      />
      <Callout type="tip">
        A partial or over-receipt (tolerance permitting) records a <em>different quantity</em> than
        the PO line — which is exactly what makes 3-way match fail and the invoice get held.
      </Callout>

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Interface-driven for bulk:</strong> stage into <K>RCV_HEADERS_INTERFACE</K>/<K>RCV_TRANSACTIONS_INTERFACE</K>, then run the import.</li>
        <li><strong>Over-receipt tolerance:</strong> configure receiving options so small variances don't fail the transaction.</li>
        <li><strong>Returns &amp; corrections:</strong> receiving also handles returns by creating negative transactions.</li>
        <li><strong>Accrual:</strong> at period-end, un-invoiced receipts can accrue to the GL — expect accrual entries in period close.</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/payables">Payables troubleshooting</a>{" "}
        (3-way match failures caused by missing receipts).
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Receipts feed the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/p2p">Procure-to-Pay</a> cycle's invoice step.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/procurement">Procurement hub</a>.</li>
      </UL>
    </>
  );
}
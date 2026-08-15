import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Intercompany Accounting",
};

export default function GlIntercompanyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Intercompany Accounting"
        description={<>Transactions where one <Term k="legalEntity">legal entity</Term> buys from or sells to another. <Term k="intercompany">Intercompany</Term> accounting keeps each entity's books balanced via the <Term k="balancingSegment">balancing segment</Term> and carries the receivable/payable between them.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "GL", href: "/fusion/financials/gl" }, { label: "Intercompany Accounting" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a> (legal entity and balancing segment) and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/journals">Journals &amp; Posting</a> before this page.
      </Callout>

      <H2>Functional view</H2>
      <P>
        An <strong>intercompany transaction</strong> moves value from one legal entity to another.
        The <strong>balancing segment</strong> guarantees each company's books balance: every
        journal line carries a balancing segment value, and the intercompany engine offsets the
        due-to / due-from entry so no company is out of balance. Transactions flow{" "}
        <strong>outbound</strong> from the transferring entity and are received as{" "}
        <strong>inbound</strong> by the recipient, then <strong>transferred</strong> and{" "}
        <strong>settled</strong>. <strong>Agreements</strong> define the terms under which entities
        transact.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Intercompany transaction", "One legal entity transacting with another (goods, services, funds)"],
          ["Balancing segment", "The chart-of-accounts segment that keeps each company in balance"],
          ["Transaction type", "Classifies the transaction and its debit/credit sign and options"],
          ["Outbound / inbound", "Outbound = sent by the transferring entity; inbound = received by the counterparty"],
          ["Transfer & settlement", "The intercompany transfer clears the due-to/due-from; settlement is the cash move"],
          ["Agreement", "Defines allowed counterparties, currency, and approval for a company"],
          ["Multitier", "Agreements + transfer authorizations + settlement currency across several entities"],
        ]}
      />
      <Diagram title="Intercompany transaction lifecycle" className="mb-8">
        <DiagramNode tone="warning" title="Create outbound" subtitle="transferring entity" />
        <Arrow label="transfer" />
        <DiagramNode tone="neutral" title="Receive inbound" subtitle="counterparty" />
        <Arrow label="reconcile" />
        <DiagramNode tone="fusion" title="Authorize & settle" subtitle="multitier: settlement currency" />
        <Arrow />
        <DiagramNode tone="success" title="Balanced books" subtitle="per balancing segment" />
      </Diagram>

      <H2>Configuration</H2>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Intercompany system options", "Default balancing segment, source/category, and numbering", "Intercompany setup → System Options"],
          ["Transaction types", "Defines how each transaction debits/credits and flows", "Intercompany setup → Transaction Types"],
          ["Balancing rules", "Which balancing segment values are valid and how offsets post", "Intercompany setup → Balancing Rules"],
          ["Intercompany agreements", "Which entities may transact, in which currency, with what approval", "Intercompany setup → Agreements"],
          ["Settlement", "Banks and payment methods used to settle due-to/due-from", "Intercompany setup → Settlement"],
        ]}
      />
      <Callout type="info">
        Intercompany entries post to <K>GL_BALANCES</K> per balancing segment, so each company's
        trial balance stays balanced even though one entity pays another. The reconciliation view is
        the due-to / due-from balance per counterparty.
      </Callout>

      <H2>Technical view</H2>
      <P>
        Intercompany exposes REST resources for agreements and transaction sources, an FBDI import,
        and ESS jobs driven through <K>erpProcesses</K>.
      </P>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="ag">intercompanyAgreements</K>, "C/U/D — create, update, delete intercompany agreements"],
          [<K key="src">intercompanyTransactionSourceDocuments</K>, "GET — read source documents behind intercompany transactions"],
          [<K key="proc">erpProcesses</K>, "POST — submit intercompany-related ESS jobs"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Intercompany Transaction Import</K>, "Bulk-load intercompany transactions (outbound and inbound)", "System options, transaction types, valid balancing segments"],
        ]}
      />
      <H3>Working example — create an agreement</H3>
      <CodeBlock
        language="bash"
        filename="POST /intercompanyAgreements"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/intercompanyAgreements" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "AgreementName": "HOLDING_TO_SUBSIDIARY",
    "FromLegalEntity": "Holding Co",
    "ToLegalEntity": "Subsidiary GmbH",
    "CurrencyCode": "EUR"
  }'`}
      />
      <Callout type="warning">
        Agreements are the REST-create surface; transaction creation itself is typically FBDI
        (Intercompany Transaction Import) or the UI. Confirm the exact resources in your instance's
        resource explorer before building on them.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>
        Where intercompany balances land in the underlying Oracle Database tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "An outbound intercompany transaction is created", "Intercompany interface / transaction tables"],
          ["2", "The transaction is transferred to the recipient entity", "Intercompany transaction tables (status update)"],
          ["3", "The counterparty receives the inbound transaction", "Intercompany transaction tables"],
          ["4", "Entries post and update each entity's balances", <span key="t4x"><span key="c0"><K key="t4">GL_BALANCES</K> (per balancing segment)</span></span>],
          ["5", "Multitier authorizes the transfer and settlement happens", <span key="t5x"><span key="c1"><K key="t5">GL_BALANCES</K> (settlement entries)</span></span>],
          ["6", "Reconciliation clears the due-to / due-from", "Intercompany reconciliation views"],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>
        Run these against the Fusion database to find intercompany balances and interface rows.
      </P>
      <CodeBlock
        language="sql"
        filename="gl_intercompany_balances.sql"
        code={`-- Due-to / due-from balances for one balancing segment (company)
SELECT b.segment1, b.segment2, b.segment3,
       b.period_name, b.period_net_dr, b.period_net_cr
FROM   gl_balances b
WHERE  b.ledger_id = :ledger_id
  AND  b.period_name = 'JAN-2026'
  AND  b.segment1 = :company_value
ORDER BY b.segment2, b.segment3;`}
      />
      <CodeBlock
        language="sql"
        filename="intercompany_interface.sql"
        code={`-- Intercompany interface batches awaiting or errored import
SELECT f.batch_name, f.status, f.error_explanation, f.source, f.creation_date
FROM   fun_interface_batches f
WHERE  f.status IN ('NEW', 'ERROR')
ORDER BY f.creation_date DESC;`}
      />
      <Callout type="tip">
        Intercompany interface tables (such as <K>FUN_INTERFACE_BATCHES</K>) and exact GL column
        names vary by release and configuration — confirm against your instance's data dictionary
        before relying on them.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Intercompany creates the offsetting due-to / due-from entries automatically so each legal
        entity balances. A purchase by one entity from another posts:
      </P>
      <DataTable
        headers={["Entity", "Debit", "Credit"]}
        rows={[
          ["Buying entity", "Expense / asset", "Intercompany payable (due to seller)"],
          ["Selling entity", "Intercompany receivable (due from buyer)", "Revenue"],
        ]}
      />
      <P>
        Cross-ledger allocations and automated intercompany cross-charge (for example, an AP invoice
        charged to another entity) use the same balancing mechanism — entries land in{" "}
        <K>GL_BALANCES</K> per balancing segment.
      </P>

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["Intercompany Transactions report", "Delivered BIP report (Reports & Analytics)"],
          ["Intercompany balances / due-to due-from", "OTBI subject area"],
          ["Trial balance per company", "Financial Reporting Center"],
          ["Intercompany reconciliation", "Intercompany Accounting work area"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li>
          <strong>Balancing first:</strong> intercompany transactions require a valid balancing
          segment on every line — confirm the segment values before loading.
        </li>
        <li>
          <strong>Agreements via REST:</strong> create agreements with{" "}
          <K>intercompanyAgreements</K> before generating transactions under them.
        </li>
        <li>
          <strong>Bulk transactions:</strong> use the Intercompany Transaction Import FBDI and
          process the interface batches, then reconcile the interface.
        </li>
        <li>
          <strong>Multitier:</strong> transfer authorizations and settlement currency are set per
          agreement — model the chain before go-live, not during close.
        </li>
        <li>
          <strong>Reconcile:</strong> due-to and due-from must match per counterparty; differences
          surface as un-reconciled intercompany balances in GL.
        </li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/gl">GL troubleshooting</a>{" "}
        for intercompany failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL hub</a> or the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Intercompany cross-charge of AP invoices ties into <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a>.</li>
        <li>Intercompany settlement runs as part of the close — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/period-close">GL Period Close</a>.</li>
      </UL>
    </>
  );
}

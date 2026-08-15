import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Financial Accounting Hub (FAH)",
};

export default function GlFahPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Financial Accounting Hub (FAH)"
        description="The module that lets transactions from other applications — or no application at all — become GL entries. FAH takes external/custom sub-ledger data, runs it through the subledger accounting engine, and posts into Fusion General Ledger: the integration-friendly door into the books."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "GL", href: "/fusion/financials/gl" }, { label: "Accounting Hub (FAH)" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>{" "}
        (FAH *is* SLA applied to external data), the{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL hub</a>, and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/interface-tables">Interface Tables</a> before this page.
      </Callout>

      <H2>Functional view</H2>
      <P>
        Fusion's own modules (Payables, Receivables…) create their own <K>XLA_</K> accounting
        automatically. FAH exists for the <strong>rest</strong>: a custom system, a legacy ledger, a
        third-party app, or an internally built sub-ledger that still needs proper accounting.
        Instead of building interface logic yourself, you feed FAH transactions and it runs the same{" "}
        <Term k="sla">subledger accounting</Term> engine — events, accounting methods, journal line
        rules — to produce validated entries that transfer to the GL.
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Accounting Hub", "The service that imports external transactions and accounts them via SLA"],
          ["Source system", "Any external app or file whose transactions you want in the GL"],
          ["Accounting entry", "The JE produced by FAH for an external transaction, before GL transfer"],
          ["Transfer to GL", "The step that posts FAH accounting entries into the GL ledger as journals"],
        ]}
      />
      <Diagram title="FAH in the accounting flow" className="mb-8">
        <DiagramNode tone="neutral" icon="🔌" title="External data" subtitle="legacy · third-party · custom system" />
        <Arrow label="map to events" />
        <DiagramNode tone="fusion" icon="⚙️" title="Accounting Hub" subtitle="SLA accounting methods + rules" />
        <Arrow label="create entries" />
        <DiagramNode tone="fusion" icon="📗" title="Accounting entries" subtitle="XLA / GL-ready JEs" />
        <Arrow label="transfer" />
        <DiagramNode tone="success" icon="🏛️" title="General Ledger" subtitle="posted journals → GL_BALANCES" />
      </Diagram>
      <Callout type="info">
        The short version consultants memorize: <strong>FAH = bring external transactions into the
        Fusion accounting engine.</strong> It reuses all of SLA — events, methods, rules, XLA
        tables — so what you learn about subledger accounting applies directly.
      </Callout>

      <H2>How FAH differs from a normal sub-ledger</H2>
      <DataTable
        headers={["Aspect", "Native sub-ledger (AP/AR...)", "Financial Accounting Hub"]}
        rows={[
          ["Source", "Its own transactions are captured in Fusion", "External transactions you import"],
          ["Accounting", "SLA runs automatically on transactions", "SLA runs on imported events via the hub"],
          ["Setup weight", "Deep module setup (invoices, terms, tax)", "Light — focus is events + accounting rules"],
          ["Typical use", "Day-to-day operations", "Legacy migration, custom systems, corporate data feeds"],
        ]}
      />

      <H2>Technical view</H2>
      <H3>Key surfaces</H3>
      <DataTable
        headers={["Surface", "What you can do with it"]}
        rows={[
          [<K key="e1">AccountingHubTransactions</K>, "REST (POST) — create external transactions for the hub to account (verify on your instance)"],
          [<K key="e2">AccountingEntries</K>, "REST (GET) — read entries the hub produced"],
          [<K key="f1">Accounting Hub / subledger accounting mapping FBDI</K>, "Bulk-load external transactions or mapping-set values"],
          [<K key="r1">erpProcesses</K>, "REST (POST) — submit the accounting/transfer processes that create and post entries"],
        ]}
      />
      <Callout type="warning">
        Accounting Hub resource names and the exact import/transfer process names vary by release
        (the Financials REST guide documents the hub as <K>accountingHub*</K> resources). Confirm
        availability and names against your instance's resource explorer before building.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>Where an external transaction and its entries land in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "External transaction is created via REST or FBDI", "Accounting Hub transaction tables (hub-specific)"],
          ["2", "SLA runs on the transaction — creates the accounting entry", <span key="t2c"><span key="c0"><K key="t2">XLA_AE_HEADERS</K>, <K key="t3">XLA_AE_LINES</K></span></span>],
          ["3", "The entry is approved/validated in the hub", <span key="t4c"><span key="c1"><K key="t4">XLA_AE_HEADERS</K> (status)</span></span>],
          ["4", "Entries are transferred to the GL ledger", <K key="t5">GL_JE_HEADERS</K>, <K key="t6">GL_JE_LINES</K>],
          ["5", "Posting updates the balances", <K key="t7">GL_BALANCES</K>],
        ]}
      />
      <Callout type="info">
        These are the underlying Oracle Database tables as documented in the Fusion data dictionary.
        The hub's own transaction staging tables are release-specific — confirm against your
        instance.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <CodeBlock
        language="sql"
        filename="fah_entries.sql"
        code={`-- Accounting entries created by the hub, before and after transfer
SELECT ae.ae_header_id, ae.event_id, ae.source_id_int_1, ae.ledger_id,
       ae.accounting_date, ae.status, ae.gl_transfer_status
FROM   xla_ae_headers ae
WHERE  ae.ledger_id = :ledger_id
  AND  ae.accounting_date BETWEEN :p_from_date AND :p_to_date
ORDER BY ae.creation_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="fah_lines.sql"
        code={`-- Lines of an accounting entry produced by the hub
SELECT al.ae_header_id, al.ae_line_num, al.code_combination_id,
       al.accounted_dr, al.accounted_cr
FROM   xla_ae_lines al
WHERE  al.ae_header_id = :ae_header_id
ORDER BY al.ae_line_num;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Worked example — one external transaction to GL</H2>
      <Callout type="example" title="Worked example: a loan disbursement from a custom system">
        <p className="mb-2"><strong>The event:</strong> an external lending app sends "loan #8821 disbursed, $5,000".</p>
        <p className="mb-2"><strong>Mapping:</strong> the event type is mapped to an SLA accounting method; the rule derives Dr Cash-in-bank $5,000 · Cr Loan liability $5,000.</p>
        <p className="mb-2"><strong>Hub processing:</strong> SLA creates the entry in <K>XLA_AE_HEADERS</K>/<K>XLA_AE_LINES</K>.</p>
        <p className="mb-2"><strong>Transfer:</strong> the approved entry transfers to the GL and posts as a standard journal.</p>
        <p className="mb-0"><strong>Why FAH:</strong> the lending app never touches Fusion sub-ledgers — its only job is emitting the transaction; Fusion handles all accounting.</p>
      </Callout>

      <H2>Integration notes</H2>
      <UL>
        <li><strong>Events, not invoices:</strong> FAH is fed account-ready events; setup effort lives in the SLA mapping (methods, rules, accounts), not in Fusion module screens.</li>
        <li><strong>Reuse SLA knowledge:</strong> whatever you learned on <K>XLA_</K> tables and accounting methods applies unchanged.</li>
        <li><strong>Transfer is a job:</strong> creating entries is one step; transferring and posting them to the GL is driven as an ESS/erpProcesses job.</li>
        <li><strong>Verify names:</strong> hub resources and transfer processes are version-specific — check the resource explorer on your instance.</li>
      </UL>

      <Callout type="warning">
        Having trouble? Start with{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/gl">GL troubleshooting</a>{" "}
        (posting, periods, accounts) — the same rules govern FAH-created entries.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>FAH runs on the engine explained in <a className="font-semibold text-accent hover:underline" href="/fusion/subledger-accounting">Subledger Accounting</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL hub</a> or the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Subledger Accounting",
};

export default function SubledgerAccountingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Subledger Accounting (SLA)"
        description="The engine that turns every transaction — an AP invoice, an AR receipt, a depreciation run — into GL journal entries. If you want to know why a number landed in a particular account, you read SLA."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Subledger Accounting (SLA)" }]}
        updated="February 2025"
      />

      <H2>What SLA is</H2>
      <P>
        Fusion doesn't hardcode accounting. Each sub-ledger fires an <strong>event</strong> (invoice
        created, invoice paid, receipt applied) and <strong>SLA</strong> decides the entries using a
        configurable <strong>accounting method</strong>. That's why the same invoice can post
        differently across ledgers or legal entities — the method differs, not the event.
      </P>
      <Diagram title="Transaction → accounting entry" className="mb-8">
        <DiagramNode tone="neutral" title="Transaction event" subtitle="e.g. AP invoice created" />
        <Arrow />
        <DiagramNode tone="fusion" title="Event classification" subtitle="event class + event type" />
        <Arrow />
        <DiagramNode tone="fusion" title="Journal entry rules" subtitle="dr/cr lines with accounts" />
        <Arrow />
        <DiagramNode tone="neutral" title="Accounting entry" subtitle="XLA_AE_HEADERS / XLA_AE_LINES" />
        <Arrow />
        <DiagramNode tone="neutral" title="Journal & posting" subtitle="GL_JE_HEADERS → GL_BALANCES" />
      </Diagram>

      <H2>Core concepts</H2>
      <DataTable
        headers={["Concept", "What it is"]}
        rows={[
          ["Accounting method", "The rule book (e.g. Standard Accrual) assigned to a ledger/legal entity"],
          ["Event class", "A group of similar events in a module (AP invoice creation, AP payment)"],
          ["Event type", "A specific event within the class (standard invoice, credit memo)"],
          ["Journal entry rule set", "Which accounting entries a class produces (single vs multi-entry)"],
          ["Journal line rules", "The dr/cr lines: account source, amount source, condition"],
          ["Account source", "Where the account comes from (event, distribution, constant, derivation)"],
          ["Accounting entry (AE)", "The XLA records created for one event"],
          ["Posting", "Transferring AEs into the GL as journal batches"],
        ]}
      />

      <H2>How a module flows through SLA</H2>
      <DataTable
        headers={["Module event", "Typical entries produced"]}
        rows={[
          ["AP invoice created", ["Dr expense / asset", "Cr AP liability", "Dr input tax", "Cr tax liability"]],
          ["AP invoice paid", ["Dr AP liability", "Cr cash / bank"]],
          ["AR invoice created", ["Dr AR trade receivable", "Cr revenue", "Dr tax receivable", "Cr output tax"]],
          ["AR receipt applied", ["Dr cash / bank", "Cr AR trade receivable"]],
          ["FA depreciation", ["Dr depreciation expense", "Cr accumulated depreciation"]],
        ]}
      />

      <H2>Where the entries live — SQL</H2>
      <P>
        Every accounting entry is an XLA record. To trace a transaction to its GL impact:
      </P>
      <CodeBlock
        language="sql"
        filename="xla_trace.sql"
        code={`-- Accounting entries for one source document (e.g. an AP invoice)
SELECT ah.ledger_id, ah.ae_header_id, ah.je_category, ah.period_name,
       ah.status, al.accounted_dr, al.accounted_cr, al.entered_dr,
       al.entered_cr, al.code_combination_id
FROM   xla_ae_headers ah
JOIN   xla_ae_lines al
  ON   al.ae_header_id = ah.ae_header_id
WHERE  ah.source_id_int_1 = :source_id
  AND  ah.event_class_code = :event_class_code
ORDER BY al.ae_header_id, al.ae_line_num;`}
      />
      <Callout type="info">
        The source document is linked to its AE via <K>source_id_int_1</K> (document id) and the{" "}
        <K>event_class_code</K>. Exact column names follow the data dictionary — confirm per release.
      </Callout>

      <H2>Configuration overview</H2>
      <UL>
        <li><strong>Define the accounting method</strong> and its journal entry rule sets per event class.</li>
        <li><strong>Assign the method</strong> to a ledger or legal entity (per ledger in most implementations).</li>
        <li><strong>Set account sources</strong>: natural accounts from distributions, constants, or derivation rules.</li>
        <li><strong>Run Create Accounting</strong> (an ESS job) to generate AEs, then post.</li>
      </UL>

      <H2>Integration notes</H2>
      <UL>
        <li>To "drill to detail" from a GL balance, trace: <K>GL_JE_HEADERS</K> → <K>XLA_AE_HEADERS</K> → source document.</li>
        <li>Accounting differences between ledgers are almost always the accounting method — compare methods first.</li>
        <li>AE status matters: incomplete entries explain missing balances before you suspect posting.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>See it in action per module: <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a> and <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL</a>.</li>
        <li>The entries land in journals — <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">General Ledger</a>.</li>
        <li>If an entry is missing or wrong, start with the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">troubleshooting</a> causes.</li>
      </UL>
    </>
  );
}
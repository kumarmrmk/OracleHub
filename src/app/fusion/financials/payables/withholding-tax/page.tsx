import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Withholding Tax & 1099",
};

export default function WithholdingTaxPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Withholding Tax & 1099"
        description="How Payables withholds tax from supplier payments, manages certificates and exceptions, and produces income tax and US 1099 reporting."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "Payables (AP)", href: "/fusion/financials/payables" }, { label: "Withholding Tax & 1099" }]}
        updated="August 2026"
        level="Advanced"
      />

      <Callout type="info" title="Prerequisites">
        Read the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables hub</a> and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/invoices">Invoice Entry &amp; Validation</a> first. Withholding is separate from VAT/GST input tax — it is tax deducted from a payment and remitted to the tax authority.
      </Callout>

      <H2>Functional view</H2>
      <P>
        <strong>Withholding tax (WHT)</strong> is deducted from supplier payments rather than charged
        on invoices. Payables calculates the WHT amount at invoice or payment time, creates a WHT tax
        line, pays the supplier net of withholding, and reports the withheld amounts for the tax
        period.
      </P>
      <Diagram title="Withholding on a payment" className="mb-8">
        <DiagramNode tone="neutral" title="Invoice entered" subtitle="gross amount" />
        <Arrow label="calculate" />
        <DiagramNode tone="warning" title="WHT calculated" subtitle="at invoice or payment point" />
        <Arrow label="pay" />
        <DiagramNode tone="success" title="Payment net of WHT" subtitle="WHT line recorded for reporting" />
      </Diagram>
      <DataTable
        headers={["WHT option", "What it controls"]}
        rows={[
          ["Calculation point", "Whether WHT is calculated at invoice entry or at payment time"],
          ["Tax invoice creation point", "When the tax invoice is created for the withheld amount"],
          ["Include discount", "Whether WHT is calculated before or after early-payment discounts"],
          ["WHT on payments vs on invoices", "Where the deduction is recognized in the lifecycle"],
        ]}
      />
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["WHT code", "The withholding rule — basis, rate, and conditions"],
          ["Rate type", "The rate structure (e.g. percentage) a code uses"],
          ["Classification", "The supplier or transaction classification the code applies to"],
          ["Certificate & exception", "Evidence that reduces or waives withholding for a supplier/site"],
          ["Withholding group", "A set of WHT codes applied together to a supplier or invoice"],
          ["Income tax report", "The periodic filing of withheld amounts to the tax authority"],
        ]}
      />
      <H3>US 1099 reporting suite</H3>
      <DataTable
        headers={["Form", "Purpose"]}
        rows={[
          ["1096", "Annual summary transmitted with paper 1099 forms"],
          ["1099-MISC", "Miscellaneous income (old format)"],
          ["1099-NEC", "Nonemployee compensation (replaces 1099-MISC for this income)"],
          ["Electronic media", "1099 files submitted electronically to the IRS"],
          ["1099-G", "Government payments and other income"],
        ]}
      />
      <Callout type="tip">
        US 1099 processing requires correct supplier tax reporting setup (TIN, classification, and
        certificate data) so the right form and amount are generated for each supplier.
      </Callout>

      <H2>Configuration</H2>
      <P>WHT is configured once and applied automatically from then on.</P>
      <DataTable
        headers={["Setup", "What it controls", "Where it lives"]}
        rows={[
          ["WHT codes", "Rules that compute the withholding amount", "Tax → Withholding tax codes"],
          ["Rate types", "The rate basis applied by a WHT code", "Tax → Withholding rate types"],
          ["Classifications", "Which supplier/transaction types a code applies to", "Tax → Withholding classifications"],
          ["Withholding group", "Multiple codes applied together per supplier or invoice", "Tax → Withholding groups"],
          ["Certificates setup", "Certificate and exception handling for suppliers", "Supplier / Tax registration"],
        ]}
      />

      <H2>Technical view</H2>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="it">payablesIncomeTax*</K>, <span key="c0">Read/lookup income tax setups (READ/LOV) — the <K key="it2">payablesIncomeTax</K> family of resources</span>],
          [<K key="te">payablesTaxReportingEntities</K>, "Read/lookup tax reporting entities (READ/LOV)"],
          [<K key="proc">erpProcesses</K>, "Submit the withholding/tax reporting ESS jobs (referenced generically — verify job names in your instance)"],
        ]}
      />
      <Callout type="info">
        There is no dedicated withholding tax FBDI in the Financials FBDI guide — verify against your
        instance&apos;s FBDI catalog. Withholding data is set up through the work area and supplier
        master rather than a bulk interface template.
      </Callout>
      <H3>Working example — submit a tax reporting job via ESS</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "ProcessName": "Income Tax Report",
    "ProcessParameters": [
      { "name": "TAX_REPORTING_ENTITY_NAME", "value": "ACME US LEGAL ENTITY" },
      { "name": "PERIOD", "value": "2025-12" }
    ]
  }'`}
      />
      <Callout type="warning">
        Job names such as <K>Income Tax Report</K> are referenced generically here — confirm the exact
        ESS job name, parameter set, and schedule for withholding/tax reporting against your instance
        before building a job submission.
      </Callout>

      <H2>Data flow — step by step</H2>
      <P>Where withholding calculation lands in the underlying tables.</P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Invoice is entered with a supplier subject to withholding", <K key="t1">AP_INVOICES_ALL</K>],
          ["2", "WHT is calculated at invoice or payment point per the WHT options", "WHT tax line on the invoice"],
          ["3", "Payment is created net of the withheld amount", <K key="t2">IBY_PAYMENTS_ALL</K>, <K key="t3">AP_INVOICE_PAYMENTS_ALL</K>],
          ["4", "Withheld balances accumulate for the reporting period", "Withholding tax lines / tax reporting data"],
          ["5", "Tax reporting ESS job runs the income tax / 1099 report for the period", "Report output + tax authority file"],
        ]}
      />
      <Callout type="info">
        Withholding tax line columns are part of the AP withholding tax lines data dictionary — query
        the exact table and column names against your instance. Column names follow the Fusion data
        dictionary naming; confirm against your release.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>Run these against the Fusion database to inspect withholding balances.</P>
      <CodeBlock
        language="sql"
        filename="ap_withholding_tax_lines.sql"
        code={`-- Withholding tax lines by reporting period
SELECT w.invoice_id, w.invoice_num, w.tax_name, w.tax_rate, w.amount,
       w.base_amount, w.creation_date
FROM   ap_wthd_tax_lines_all w
WHERE  w.creation_date BETWEEN :start_date AND :end_date
ORDER BY w.creation_date DESC;`}
      />
      <CodeBlock
        language="sql"
        filename="ap_withholding_tax_by_period.sql"
        code={`-- Withheld amounts per tax code and period
SELECT w.tax_name, TO_CHAR(w.creation_date, 'YYYY-MM') AS period,
       COUNT(*) AS line_count, SUM(w.amount) AS total_withheld
FROM   ap_wthd_tax_lines_all w
WHERE  w.creation_date BETWEEN :start_date AND :end_date
GROUP BY w.tax_name, TO_CHAR(w.creation_date, 'YYYY-MM')
ORDER BY w.tax_name, period;`}
      />
      <Callout type="tip">
        The table and column names shown are generic AP withholding tax lines — verify the exact names
        in your instance&apos;s data dictionary before relying on them, and never query the Fusion
        database directly for production reporting — use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Withholding creates a payable to the tax authority rather than to the supplier:
      </P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Payment net of WHT", "AP liability (gross)", "Cash / bank (net) + WHT payable"],
          ["WHT remittance", "WHT payable", "Cash / bank"],
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
          ["Income tax report (withheld amounts by period)", "ESS tax reporting job (verify job name in instance)"],
          ["US 1099 forms (1096, 1099-MISC/NEC, 1099-G, electronic media)", "Payables → Tax reporting work area / BIP"],
          ["Withholding tax register", "Payables work area"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li><strong>WHT affects payment amount:</strong> the net payment is the gross invoice minus withholding — reconciling bank files against gross invoice amounts will not match.</li>
        <li><strong>Certificates before paying:</strong> a valid certificate or exception can reduce or waive WHT; confirm supplier certificate data before payment runs.</li>
        <li><strong>Reporting jobs:</strong> income tax and 1099 outputs come from ESS jobs whose names vary — verify against your instance and schedule them per period.</li>
        <li><strong>No dedicated WHT FBDI:</strong> withhold tax is set up via the work area and supplier master, not a Financials FBDI template (verify in your instance).</li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/payables">Payables troubleshooting</a>{" "}
        for the most common withholding and 1099 failures.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables (AP)</a>.</li>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Withheld amounts are paid net — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables/payments">Payments &amp; PPR</a>.</li>
      </UL>
    </>
  );
}

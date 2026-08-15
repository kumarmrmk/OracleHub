import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Tax",
};

export default function TaxPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Tax"
        description="Fusion Tax (built on the Oracle E-Business Tax engine) manages indirect tax — VAT, GST, sales/use tax — on every transaction. Tax is configured as a regime hierarchy, determined by rules, and calculated by the tax engine at invoice time."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Tax" }]}
        updated="February 2025"
      />

      <H2>How tax gets calculated</H2>
      <P>
        Tax doesn't just sit on the invoice — it is <strong>determined</strong> by rules. The engine
        takes the transaction (party, product, territory, dates) and classifies it to find the right
        tax, status, rate, and accounts.
      </P>
      <Diagram title="Tax determination" className="mb-8">
        <DiagramNode tone="neutral" title="Classify" subtitle="party + product + territory + dates" />
        <Arrow label="rule" />
        <DiagramNode tone="fusion" title="Tax determination" subtitle="tax + status + rate matched" />
        <Arrow />
        <DiagramNode tone="fusion" title="Calculate" subtitle="tax lines, rates, exempt/recoverable amounts" />
        <Arrow />
        <DiagramNode tone="neutral" title="Accounts" subtitle="tax distributions post to the GL" />
      </Diagram>

      <H2>The configuration hierarchy</H2>
      <DataTable
        headers={["Level", "What it is", "Example"]}
        rows={[
          ["Tax regime", "The top level, usually one per country/tax area (VAT, GST, Sales Tax)", "Germany VAT"],
          ["Tax", "A type of tax within the regime (output / input)", "Output VAT (sales), Input VAT (purchases)"],
          ["Tax status", "A legal category (taxable, zero-rated, exempt)", "Exempt supplies"],
          ["Tax rate", "The percentage, with effective dates", "19% standard VAT, 7% reduced"],
          ["Tax rules", "Conditions that pick the tax/status/rate for a transaction", "If product = books then reduced rate"],
          ["Tax configuration owner", "The BU/legal entity profile that chooses which tax codes to use", "Acme DE BU uses Germany VAT"],
          ["Tax code (configuration)", "The visible code a user sees on the transaction", "VAT_DE_19_OUT"],
          ["Tax profile", "Per legal entity: default tax codes, calculation options, tax accounting", "Acme GmbH tax profile"],
        ]}
      />

      <H2>Where tax attaches in a transaction</H2>
      <UL>
        <li><strong>AP invoices:</strong> supplier + invoice tax code → tax engine calculates input VAT on each line/distribution.</li>
        <li><strong>AR invoices:</strong> customer + item/product → output VAT / GST determined and calculated.</li>
        <li><strong>POs & expenses:</strong> purchases carry tax too; expense lines may require a tax code.</li>
        <li>Tax lines flow to the GL through the same posting process (XLA) as the rest of the document.</li>
      </UL>

      <H2>Underlying tables & SQL</H2>
      <P>
        Tax configuration lives in the <K>ZX_*</K> tables. Query them to trace what tax a transaction
        should carry:
      </P>
      <DataTable
        headers={["Table", "Holds", "Key columns"]}
        rows={[
          [<K key="t1">ZX_REGIMES_B</K>, "Tax regimes", "REGIME_CODE, REGIME_NAME, COUNTRY_CODE"],
          [<K key="t2">ZX_TAXES_B</K>, "Taxes within a regime", "TAX, TAX_NAME, REGIME_CODE, TAX_TYPE_CODE"],
          [<K key="t3">ZX_TAX_STATUS_B</K>, "Tax statuses", "TAX_STATUS_CODE, TAX_STATUS_NAME, TAX"],
          [<K key="t4">ZX_RATES_B</K>, "Tax rates with effective dates", "TAX_RATE_CODE, TAX_RATE, EFFECTIVE_FROM, EFFECTIVE_TO"],
          [<K key="t5">ZX_TAX_RULES</K>, "Determination rules", "RULE_NAME, TRX_CLASS, CONDITION..., RESULT_TAX, RESULT_RATE"],
          [<K key="t6">ZX_LINES</K>, "Calculated tax lines on transactions", "ZX_LINE_ID, DOCUMENT_ID, TAX_LINE_AMOUNT, TAX_RATE, TAX_CODE"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="tax_rates.sql"
        code={`-- Rates for a tax, ordered by effective date
SELECT r.tax_rate_code, r.tax_rate, r.effective_from, r.effective_to
FROM   zx_rates_b r
WHERE  r.tax = :tax_code
ORDER BY r.effective_from;`}
      />
      <CodeBlock
        language="sql"
        filename="tax_lines.sql"
        code={`-- Calculated tax lines for a document
SELECT l.document_id, l.tax_code, l.tax_rate, l.tax_line_amount,
       l.tax_currency_code, l.status_code
FROM   zx_lines l
WHERE  l.document_id = :document_id
ORDER BY l.tax_line_id;`}
      />
      <Callout type="info">
        <K>ZX_*</K> is the EBS-era tax schema Fusion inherited. Column names follow the data
        dictionary naming — confirm against your release.
      </Callout>

      <H2>Integration notes</H2>
      <UL>
        <li>Invoice lines with a missing or invalid <strong>tax code</strong> fail validation — send
        the correct tax code per territory/entity.</li>
        <li><strong>Rate selection</strong> is rule-driven, not hardcoded — two invoices can get
        different rates based on product/territory classification.</li>
        <li>Exempt/recoverable amounts depend on tax statuses and party fiscal classifications.</li>
        <li>Tax setups are <strong>per legal entity/BU</strong> — the same product can be taxed
        differently across your enterprise structure.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Tax sits on the invoices covered in <a className="font-semibold text-accent hover:underline" href="/fusion/financials/payables">Payables</a> and <a className="font-semibold text-accent hover:underline" href="/fusion/financials/receivables">Receivables</a>.</li>
        <li>Tax configuration is owned per legal entity — see <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a>.</li>
      </UL>
    </>
  );
}
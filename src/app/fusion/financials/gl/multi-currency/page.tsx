import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";
import WorkedExample from "@/components/ui/WorkedExample";
import Term from "@/components/ui/Term";

export const metadata = {
  title: "Multi-Currency & Rates",
};

export default function GlMultiCurrencyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Multi-Currency & Rates"
        description={<>How Fusion records transactions in multiple currencies, converts them, and re-measures them at period close. Rates are the pivot: every cross-currency journal and every <Term k="revaluation">revaluation</Term> depends on a rate existing for the right date and rate type.</>}
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "ERP Financials", href: "/fusion/financials" }, { label: "GL", href: "/fusion/financials/gl" }, { label: "Multi-Currency & Rates" }]}
        updated="August 2026"
        level="Module"
      />

      <Callout type="info" title="Prerequisites">
        Read <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a> (ledger currency selection) and{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/journals">Journals &amp; Posting</a> before this page.
      </Callout>

      <H2>Functional view</H2>
      <P>
        Every ledger has a <strong>functional currency</strong>. Transactions can be entered in a
        different (entered) currency and, if the ledger uses reporting currencies, converted to a
        third (reported) currency. Precision rules the decimals each currency carries. The key
        concepts:
      </P>
      <DataTable
        headers={["Business object", "What it is (functional)"]}
        rows={[
          ["Functional currency", "The currency the ledger keeps its books in and reports balances in"],
          ["Entered currency", "The currency a transaction is entered in, if different from functional"],
          ["Reported currency", "A reporting-currency balance view converted for reporting"],
          ["Conversion rate type", "Spot, Corporate, User, Fixed — a named set of rates"],
          ["Daily rate", "A rate for a currency pair on a specific date"],
          ["Historical rate", "A rate locked to a past date, used for translation"],
          ["Revaluation", "Re-measuring open foreign-currency balances at a period's rates"],
          ["Translation", "Converting a ledger's balances into a reporting currency"],
        ]}
      />
      <Diagram title="Currency conversion chain" className="mb-8">
        <DiagramNode tone="neutral" title="Entered currency" subtitle="transaction currency" />
        <Arrow label="daily rate" />
        <DiagramNode tone="fusion" title="Functional currency" subtitle="ledger books" />
        <Arrow label="translate" />
        <DiagramNode tone="success" title="Reporting currency" subtitle="reported balances" />
      </Diagram>

      <H2>Configuration</H2>
      <DataTable
        headers={["Setup", "Why it matters", "Where it lives"]}
        rows={[
          ["Currencies", "The currency list and each currency's precision", "GL setup → Currencies"],
          ["Daily rates", "The rates available for conversion by date and rate type", "Daily Rates page"],
          ["Rate types", "Spot, Corporate, User, Fixed — which rate each process uses", "GL setup → Rate Types"],
          ["Revaluation definition", "Which accounts revalue and where gains/losses post", "GL setup → Revaluation"],
          ["Translation method", "Which rates translate each balance (current, historical, average)", "GL setup → Translation"],
          ["FX revaluation (financial services)", "Scheduled revaluation for financial-services ledgers", "GL setup → FX Revaluation"],
        ]}
      />
      <Callout type="info">
        Rate types and dates are the first thing to check when a foreign-currency journal fails:
        the accounting engine converts at the rate for the journal date under the chosen rate type,
        and if none exists the journal rejects.
      </Callout>

      <H2>Technical view</H2>
      <P>
        Rates are loaded through FBDI into <K>GL_DAILY_RATES_INTERFACE</K> and imported into{" "}
        <K>GL_DAILY_RATES</K>. Revaluation and translation run as ESS jobs driven by{" "}
        <K>erpProcesses</K>. The REST layer is read-only for rates.
      </P>
      <H3>REST resources</H3>
      <DataTable
        headers={["Resource", "What you can do with it"]}
        rows={[
          [<K key="cr">currencyRates</K>, "GET — retrieve conversion rates for a currency pair/date"],
          [<K key="fx">fxRevaluationSetups / fxTransferSetups</K>, "C/U/D — configure FX revaluation and transfer setups"],
          [<K key="proc">erpProcesses</K>, "POST — run Revalue Balances and Translate Balances ESS jobs"],
        ]}
      />
      <H3>FBDI templates</H3>
      <DataTable
        headers={["Template", "Purpose", "Must exist first"]}
        rows={[
          [<K key="f1">Import and Calculate Daily Rates</K>, "Load and optionally calculate daily rates into GL_DAILY_RATES_INTERFACE", "Currency + rate type setup"],
          [<K key="f2">Import Historical Rates</K>, "Load rates for a specific past date", "Currency + rate type setup"],
        ]}
      />
      <H3>Working example — submit Revalue Balances</H3>
      <CodeBlock
        language="bash"
        filename="POST /erpProcesses"
        code={`curl -u "integration.user:password" \\
  "https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpProcesses" \\
  -H "Content-Type: application/json" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -X POST \\
  -d '{
    "jobName": "Revalue Balances",
    "parameters": [
      { "name": "LedgerId", "value": "1234" }
    ]
  }'`}
      />

      <H2>Data flow — step by step</H2>
      <P>
        Where rates and converted balances land in the underlying Oracle Database tables.
      </P>
      <DataTable
        headers={["Step", "What happens", "Where the data lands (table)"]}
        rows={[
          ["1", "Rates are uploaded (UI, FBDI, or ADFdi)", <K key="t1">GL_DAILY_RATES_INTERFACE</K>],
          ["2", "Import and Calculate Daily Rates / Import Historical Rates runs", <K key="t2">GL_DAILY_RATES</K>],
          ["3", "A foreign-currency journal is entered in the GL", <span key="c0"><K key="t3">GL_JE_HEADERS</K> / <K key="t4">GL_JE_LINES</K></span>],
          ["4", "Accounting converts at the rate for the journal date and rate type", <span key="t5x"><span key="c1"><K key="t5">GL_JE_LINES</K> (accounted amounts)</span></span>],
          ["5", "Revalue Balances re-measures open foreign-currency balances at close", <span key="t6x"><span key="c2"><K key="t6">GL_JE_HEADERS</K> (revaluation journals)</span> → <K key="t7">GL_BALANCES</K></span>],
          ["6", "Translate Balances converts balances into the reporting currency", <span key="t8x"><span key="c3"><K key="t8">GL_BALANCES</K> (translated balances)</span></span>],
        ]}
      />
      <Callout type="info">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them.
      </Callout>

      <H2>Retrieve the data — SQL</H2>
      <P>
        Run these against the Fusion database to check rates and revaluation/translation journals.
      </P>
      <CodeBlock
        language="sql"
        filename="gl_daily_rates.sql"
        code={`-- Rates for a currency pair on a date
SELECT r.currency_code, r.to_currency_code, r.conversion_type,
       r.conversion_date, r.conversion_rate
FROM   gl_daily_rates r
WHERE  r.currency_code = 'EUR'
  AND  r.to_currency_code = 'USD'
  AND  r.conversion_date BETWEEN '01-JAN-2026' AND '31-JAN-2026'
ORDER BY r.conversion_date;`}
      />
      <CodeBlock
        language="sql"
        filename="gl_revalue_translate.sql"
        code={`-- Revaluation and translation journals created at close
SELECT h.je_batch_id, h.je_header_id, h.name, h.status,
       h.period_name, h.currency_code, h.je_source, h.je_category
FROM   gl_je_headers h
WHERE  h.je_source IN ('REVALUATION', 'TRANSLATION')
  AND  h.period_name = 'JAN-2026'
  AND  h.ledger_id = :ledger_id
ORDER BY h.creation_date DESC;`}
      />
      <Callout type="tip">
        Column names follow the Fusion data dictionary naming. Confirm against your release before
        relying on them, and never query the Fusion database directly for production reporting —
        use OTBI or the REST API instead.
      </Callout>

      <H2>Accounting (SLA)</H2>
      <P>
        Revaluation creates accounting entries to recognize unrealized exchange gains and losses.
        A typical revaluation posts:
      </P>
      <DataTable
        headers={["Event", "Debit", "Credit"]}
        rows={[
          ["Revalue gain", "Revaluation loss account", "Revaluation gain account (or the re-valued balance account)"],
          ["Revalue loss", "Revaluation loss account", "Re-valued balance account"],
        ]}
      />
      <P>
        Translation produces <em>translation adjustment</em> entries (including the cumulative
        translation adjustment for the reporting currency) rather than cash gains and losses — it
        restates balances, it does not re-measure open items.
      </P>

      <H2>Worked example — revalue a foreign receivable</H2>
      <WorkedExample
        title="Worked example: €10,000 receivable, USD ledger"
        intro={
          <>
            The ledger keeps its books in <strong>USD</strong>. At booking, EUR→USD was{" "}
            <strong>1.10</strong>, so the €10,000 receivable was recorded as <strong>$11,000</strong>.
          </>
        }
        steps={[
          {
            label: "1 · Book the receivable",
            body: <>The original journal at rate 1.10: Dr Accounts receivable $11,000 · Cr Revenue $11,000.</>,
          },
          {
            label: "2 · Re-measure at the close rate",
            body: (
              <>
                The period-end daily rate is <strong>1.05</strong>, so the open €10,000 is now worth{" "}
                <strong>$10,500</strong> — a <strong>$500</strong> unrealized loss. Revalue Balances
                posts a journal for the difference only.
              </>
            ),
          },
        ]}
        journal={[
          { account: "01-7300-000 — Revaluation loss", debit: "$500" },
          { account: "01-1200-000 — Accounts receivable", credit: "$500" },
        ]}
        outcome={
          <>
            The receivable now sits at $10,500 and the loss hits the P&amp;L. Revaluation only
            re-measures <em>open</em> foreign-currency balances, and it needs the daily rate for the
            right date and rate type — the two setup facts behind most revaluation failures.
          </>
        }
      />

      <H2>Reporting</H2>
      <DataTable
        headers={["Report / area", "Where it runs"]}
        rows={[
          ["General Ledger Balances Real Time", "OTBI subject area (functional and reported currency)"],
          ["Daily Rates report", "Delivered BIP report (Reports & Analytics)"],
          ["Revaluation report", "Revalue Balances process output (ESS)"],
          ["Financial statements in reporting currency", "Financial Reporting Center"],
        ]}
      />

      <H2>Integration notes</H2>
      <UL>
        <li>
          <strong>Load rates before journals:</strong> cross-currency journals fail when no rate
          exists for the journal date under the rate type — load daily rates first.
        </li>
        <li>
          <strong>Rate type matters:</strong> confirm which rate type (Spot, Corporate, User, Fixed)
          the journal load or revaluation should use.
        </li>
        <li>
          <strong>Sub-ledgers feed GL:</strong> AP/AR convert in their own currency then post the
          converted journal to GL; supply the same rates to keep them consistent.
        </li>
        <li>
          <strong>Revalue at close:</strong> run Revalue Balances before translation and before
          closing the period, in the order your close sequence defines.
        </li>
      </UL>

      <Callout type="warning">
        Having trouble? See{" "}
        <a className="font-semibold text-accent hover:underline" href="/troubleshooting/gl">GL troubleshooting</a>{" "}
        for rate and revaluation failures and fixes.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl">GL hub</a> or the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">Financials hub</a>.</li>
        <li>Reporting currencies that hold converted balances — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/secondary-ledgers">Secondary Ledgers &amp; Reporting Currencies</a>.</li>
        <li>Where revaluation sits in the close cycle — see <a className="font-semibold text-accent hover:underline" href="/fusion/financials/gl/period-close">GL Period Close</a>.</li>
      </UL>
    </>
  );
}

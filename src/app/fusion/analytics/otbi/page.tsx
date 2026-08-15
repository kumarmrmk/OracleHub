import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "OTBI — Transactional Business Intelligence",
};

export default function FusionOtbiPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud · Analytics"
        title="OTBI — Transactional Business Intelligence"
        description="The analytics engine embedded in Fusion Cloud: subject areas, real-time vs warehouse facts, analyses and dashboards, drill-to-detail, the catalog, and the duties and data security that govern it."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Analytics" }, { label: "OTBI" }]}
        updated="2026"
      />

      <P>
        <strong>OTBI</strong> (Oracle Transactional Business Intelligence) is Fusion's built-in
        ad-hoc analytics on transactional data. It is free, pre-secured, and always available in the
        same instance as your data — which is why the moment someone asks "how many invoices did we
        validate this week?" the answer is OTBI. Technically it runs Oracle BI web-technology
        embedded in Fusion, which is why it uses the OBIEE-family vocabulary.
      </P>

      <H2>Subject areas — the model you query</H2>
      <P>
        You never write SQL in OTBI. Instead you pick a <strong>subject area</strong>, the
        Oracle-delivered logical model for a domain, and drag its folders into the analysis:
      </P>
      <DataTable
        headers={["Family", "Example subject areas"]
        }
        rows={[
          ["Financials", "GL Balances, Payables Invoices Real Time, Receivables Transactions Real Time, Cash Management Banking Transactions"],
          ["Procurement & SCM", "Procurement Spend, Purchase Orders, Inventory Valuation, Supplier"],
          ["HCM", "Workforce Core, Employee Costing, Talent Management"],
          ["CX/CRM", "Opportunities, Leads, Service Requests, Sales Pipeline"],
        ]}
      />
      <P>
        Subject areas come in two flavors, and knowing which one you are on explains refresh
        behavior:
      </P>
      <DataTable
        headers={["Flavor", "Backed by", "Freshness", "Gotcha"]
        }
        rows={[
          ["Real Time", "Fusion transactional tables", "Near real-time", "Queries the OLTP system — heavy analyses can talk to the OLTP"],
          ["Warehouse (fact)", "Fusion analytics warehouse tables assembled by scheduled jobs", "As of last refresh", "Richer snowflake models, but only as fresh as the refresh job that built them"],
        ]}
      />
      <Callout type="tip">
        The <em>“Real Time”</em> suffix in a subject area name is the tell. When a manager says
        “that balance is wrong”, check the subject area type first — a warehouse-backed answer that
        was refreshed last night will never match today's transactional reality.
      </Callout>

      <H2>Building an analysis</H2>
      <P>
        The analysis editor mirrors the OBIEE "Answers" experience you will meet again in OAC and
        on-prem OBIEE:
      </P>
      <CodeBlock
        language="text"
        filename="Mental model of an OTBI analysis (no SQL here)"
        code={`Columns   → the measure (Total Amount) and the dimensions (Invoice Date, Business Unit)
Filters    → keep only period = this period, invoice status = Validated
Grouping   → re-aggregate: SUM per natural account
Sorting    → highest first
Prompts    → ask the user for BU / date at runtime
Layout     → table, pivot, or graph
Run  → save to the catalog  →  put on a dashboard`}
      />
      <UL>
        <li><strong>Columns criteria</strong> — measures aggregate (SUM/AVG/COUNT) according to the model; dimensions slice them.</li>
        <li><strong>Filters</strong> — like SQL <K>WHERE</K>, including SQL filters for expressions the editor cannot build.</li>
        <li><strong>Prompts</strong> — runtime parameters; dashboard prompts drive several analyses at once.</li>
        <li><strong>Pivot &amp; graph views</strong> and <strong>conditional formatting</strong> (highlight over-limit invoices) live in the same analysis.</li>
        <li>The system automatically applies its palette of <strong>functions</strong> (date, string, conversion) for calculated columns.</li>
      </UL>

      <H2>Dashboards, catalog &amp; delivered analytics</H2>
      <P>
        Analyses get saved into the <strong>catalog</strong> and composed onto{" "}
        <strong>dashboards</strong>. Fusion ships a large collection of{" "}
        <strong>delivered analytics</strong> per module — clone, edit, and save to your own folder
        rather than rebuilding from scratch:
      </P>
      <UL>
        <li>
          Two top-level areas: <K>Shared Folders</K> (delivered + team reports) and{" "}
          <K>Users</K>/My Folders (personal scratch space).
        </li>
        <li>
          Best practice: never edit delivered reports in place — copy to{" "}
          <K>/Custom/…</K> and keep a migration path to non-prod (the{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/fusion/modify-report">Modify a Report walkthrough</a>{" "}
          shows the whole drill).
        </li>
        <li>
          Dashboards can embed analyses, prompts, and web content, and can be scheduled/emailed.
        </li>
      </UL>

      <H2>Drill-to-detail</H2>
      <P>
        OTBI's killer interaction: an aggregate can <strong>drill to the transaction</strong> — from
        "AP total" to the actual supplier invoice page in Fusion. This works because subject-area
        measures carry a <strong>drill-to-detail</strong> mapping to the transactional object, and
        the user's duty governs what they may then open.
      </P>
      <Callout type="info">
        Drill-to-detail is what separates "list of numbers" from "actionable intelligence" in Fusion.
        When designing a dashboard, always keep the deepest level one drill away so users can
        resolve, not just observe.
      </Callout>

      <H2>KPI watchlist &amp; monitoring</H2>
      <P>
        For "always-on" process metrics, Fusion's <strong>KPI</strong> module watches metric
        definitions and raises watchlist items when a KPI crosses a threshold — an operational layer
        on top of the same subject areas, not a separate tool.
      </P>

      <H2>Security model</H2>
      <DataTable
        headers={["Layer", "Controls", "Example privilege"]
        }
        rows={[
          ["Duties & roles", "Which components of OTBI and which flow/report area a user can open", "Payables Manager duty grants Payables dashboards"],
          ["Subject area access", "Which business areas a role may query", "Access to 'AP Invoices Real Time' but not HCM workforce"],
          ["Row-level data security", "Which BUs, ledgers, or field values a user's rows are filtered to", "Finance user sees only ledger set assigned in data access set"],
          ["Catalog permissions", "Read/edit/delete on folders and reports", "Only /Custom/Finance/AP for the AP team"],
        ]}
      />
      <P>
        The practical consequence for implementers: giving someone "OTBI access" is really about the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/fusion/security">duty/role grants</a>{" "}
        plus <strong>data security policies</strong> that scope the rows — a report can be perfectly
        built and show nothing to a user whose data access set excludes the ledger.
      </P>

      <H2>Limits &amp; the hand-off to other tools</H2>
      <UL>
        <li>
          <strong>Not pixel-perfect</strong> — no RTF layouts, bursting, or exact page formats; that
          is{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/fusion/reporting">BI Publisher</a>.
        </li>
        <li>
          <strong>Fusion data only</strong> — OTBI cannot query outside the instance; mixing sources
          is the{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/fusion/analytics/oac">OAC</a>{" "}
          job.
        </li>
        <li>
          <strong>Performance ceiling</strong> — heavy queries go to the warehouse-backed subject
          areas; treat real-time subject areas like OLTP queries.
        </li>
        <li>
          Analyses can feed <K>BIP</K> data models for formatted output, and dashboards can be
          delivered on a schedule.
        </li>
      </UL>

      <H3>Where OTBI sits in the stack</H3>
      <Diagram title="From transaction to insight" className="mb-8">
        <DiagramNode tone="fusion" icon="🗄️" title="Fusion transactional data" subtitle="GL_・AP_・AR_ tables" />
        <Arrow label="subject areas" />
        <DiagramNode tone="accent" icon="📊" title="OTBI engine" subtitle="inside Fusion · analyses · dashboards" />
        <Arrow label="drill" />
        <DiagramNode tone="neutral" icon="🧾" title="Transactional pages" subtitle="invoice, order, expense screens" />
      </Diagram>
    </>
  );
}
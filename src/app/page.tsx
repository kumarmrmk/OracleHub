import Link from "next/link";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

type PathStage = {
  num: string;
  title: string;
  badge: string;
  know: string;
  pages: { href: string; title: string }[];
};

const financialsPath: PathStage[] = [
  {
    num: "1",
    title: "What Fusion is",
    badge: "bg-accent",
    know: "The module map and where Financials sits in it.",
    pages: [
      { href: "/fusion/overview", title: "Fusion Cloud overview" },
      { href: "/fusion/modules", title: "Application Modules" },
    ],
  },
  {
    num: "2",
    title: "Foundations — the model behind every transaction",
    badge: "bg-sky-500",
    know: "Ledgers, legal entities, business units and MOAC; the chart of accounts; how any transaction becomes a GL entry; and the tax that sits on every module.",
    pages: [
      { href: "/fusion/enterprise-structures", title: "Enterprise Structures" },
      { href: "/fusion/flexfields", title: "Flexfields & Value Sets" },
      { href: "/fusion/subledger-accounting", title: "Subledger Accounting (SLA)" },
      { href: "/fusion/tax", title: "Tax" },
    ],
  },
  {
    num: "3",
    title: "See the whole picture before the parts",
    badge: "bg-fuchsia-500",
    know: "How the Financials modules hang together, and the three business cycles (R2R, P2P, O2C) that tie them together.",
    pages: [
      { href: "/fusion/financials", title: "ERP Financials hub" },
      { href: "/fusion/financials/cycles", title: "Business Cycles (R2R · P2P · O2C)" },
    ],
  },
  {
    num: "4",
    title: "General Ledger — the system of record",
    badge: "bg-emerald-500",
    know: "Accounts, journals, balances, budgets and the close — the destination every other module posts to.",
    pages: [
      { href: "/fusion/financials/gl", title: "GL overview" },
      { href: "/fusion/financials/gl/journals", title: "Journals & Posting" },
      { href: "/fusion/financials/gl/period-close", title: "GL Period Close" },
      { href: "/fusion/financials/gl/budgets", title: "Budgets & Budgetary Control" },
    ],
  },
  {
    num: "5",
    title: "Payables & Receivables — money out and money in",
    badge: "bg-amber-500",
    know: "Supplier invoices → payments, and customer invoices → receipts, plus the holds, matching and lockbox automation around them.",
    pages: [
      { href: "/fusion/financials/payables", title: "Payables (AP)" },
      { href: "/fusion/financials/payables/invoices", title: "Invoices & Validation" },
      { href: "/fusion/financials/payables/payments", title: "Payments & PPR" },
      { href: "/fusion/financials/receivables", title: "Receivables (AR)" },
      { href: "/fusion/financials/receivables/autoinvoice", title: "AutoInvoice" },
      { href: "/fusion/financials/receivables/receipts", title: "Receipts & Lockbox" },
    ],
  },
  {
    num: "6",
    title: "Cash, Fixed Assets & Expenses",
    badge: "bg-cyan-500",
    know: "Bank statements and reconciliation, depreciation, and expense reimbursement.",
    pages: [
      { href: "/fusion/financials/cash-management", title: "Cash Management" },
      { href: "/fusion/financials/cash-management/statements", title: "Bank Statements & BAI2" },
      { href: "/fusion/financials/cash-management/reconciliation", title: "Reconciliation" },
      { href: "/fusion/financials/fixed-assets", title: "Fixed Assets" },
      { href: "/fusion/financials/fixed-assets/depreciation", title: "Depreciation" },
      { href: "/fusion/financials/expenses", title: "Expenses" },
    ],
  },
  {
    num: "7",
    title: "Procurement & SCM — the operational engine",
    badge: "bg-slate-500",
    know: "How the business buys, receives, stores, values, and ships goods: requisitions, purchase orders, receiving, inventory, cost, and order management.",
    pages: [
      { href: "/fusion/procurement", title: "Procurement hub" },
      { href: "/fusion/procurement/requisitions", title: "Requisitions" },
      { href: "/fusion/procurement/purchase-orders", title: "Purchase Orders" },
      { href: "/fusion/procurement/receiving", title: "Receiving" },
      { href: "/fusion/inventory", title: "Inventory" },
      { href: "/fusion/cost-management", title: "Cost Management" },
      { href: "/fusion/order-management", title: "Order Management" },
    ],
  },
  {
    num: "8",
    title: "Close, report, then go technical",
    badge: "bg-rose-500",
    know: "The month-end close and reporting stack — then the implementer's toolbox: REST, FBDI, ESS and the tables.",
    pages: [
      { href: "/fusion/financial-close", title: "Financial Close" },
      { href: "/fusion/reporting", title: "Reporting & Analytics" },
      { href: "/fusion/analytics", title: "Analytics · OTBI · OAC · OBIEE" },
      { href: "/fusion/rest-api", title: "REST resources" },
      { href: "/fusion/fbdi", title: "FBDI & loader" },
      { href: "/fusion/scheduled-processes", title: "Scheduled Processes (ESS)" },
      { href: "/fusion/tables", title: "Fusion Tables" },
      { href: "/fusion/tool-matrix", title: "Tool Matrix" },
    ],
  },
];

type TechStep = {
  num: string;
  title: string;
  note: string;
  pages: { href: string; title: string }[];
};

const technicalFlow: TechStep[] = [
  {
    num: "1",
    title: "Fusion data — the tables",
    note: "Every transaction lands in a table. Know where your data lives before you try to move it.",
    pages: [
      { href: "/fusion/tables", title: "Fusion Tables" },
      { href: "/fusion/financials", title: "Financials modules" },
    ],
  },
  {
    num: "2",
    title: "REST resources",
    note: "Read and write Fusion data over REST — the primary technical interface.",
    pages: [{ href: "/fusion/rest-api", title: "REST resources" }],
  },
  {
    num: "3",
    title: "FBDI file loads",
    note: "Bulk loads push CSV plus an XML control file into the interface tables.",
    pages: [{ href: "/fusion/fbdi", title: "FBDI & loader" }],
  },
  {
    num: "4",
    title: "ESS scheduled processes",
    note: "Every load, report, and batch runs as an Enterprise Scheduler Service job.",
    pages: [{ href: "/fusion/scheduled-processes", title: "Scheduled Processes (ESS)" }],
  },
  {
    num: "5",
    title: "erpProcesses",
    note: "The REST service that submits those jobs and tracks their status.",
    pages: [{ href: "/fusion/erp-processes", title: "erpProcesses" }],
  },
  {
    num: "6",
    title: "OIC orchestration",
    note: "Integration Cloud calls REST, submits FBDI loads, and drives the end-to-end flow.",
    pages: [
      { href: "/oic/concepts", title: "Integration concepts" },
      { href: "/oic/fbdi-integration", title: "FBDI end-to-end" },
    ],
  },
  {
    num: "7",
    title: "VBCS front-end",
    note: "Pages and dashboards that consume the integrations and put the data on screen.",
    pages: [
      { href: "/vbcs/concepts", title: "VBCS concepts" },
      { href: "/vbcs/connecting", title: "Connecting to services" },
    ],
  },
];

type PlatformStep = {
  num: string;
  title: string;
  know: string;
  pages: { href: string; title: string }[];
};

const platformPath: PlatformStep[] = [
  {
    num: "1",
    title: "Where OIC sits in the stack",
    know: "OIC as the middle layer that moves data between Fusion and everything else, and the 'OIC does, Fusion stores' rule.",
    pages: [
      { href: "/architecture", title: "End-to-End Architecture" },
      { href: "/oic/overview", title: "OIC overview" },
    ],
  },
  {
    num: "2",
    title: "Integration foundations",
    know: "Connections vs adapters, lookups, agents, libraries, and the runtime: the vocabulary every flow uses.",
    pages: [{ href: "/oic/concepts", title: "Key Concepts" }],
  },
  {
    num: "3",
    title: "Mapping — reshaping the data",
    know: "The map editor, functions, flatten/unflatten, and envelope formats, because no two systems agree on shape.",
    pages: [
      { href: "/oic/mapping", title: "Mapping & Transformation" },
      { href: "/oic/adapters", title: "Adapters & Connectivity" },
    ],
  },
  {
    num: "4",
    title: "Orchestrating a flow",
    know: "The flow toolbox: assign, map, invoke, switch, for-each, scopes, and fault handlers put together in one integration.",
    pages: [{ href: "/oic/orchestration", title: "Orchestration & Flow" }],
  },
  {
    num: "5",
    title: "The two Fusion patterns",
    know: "REST for real-time calls and FBDI for bulk imports — the pair you will use against Fusion constantly.",
    pages: [
      { href: "/oic/rest", title: "REST & RESTful APIs" },
      { href: "/oic/fbdi-integration", title: "FBDI Integration with Fusion" },
    ],
  },
  {
    num: "6",
    title: "People + security + observability",
    know: "Process automation for approvals, and the security, error handling, and monitoring that keep flows trustworthy.",
    pages: [
      { href: "/oic/process", title: "Process Automation" },
      { href: "/oic/security", title: "Security & Authentication" },
      { href: "/oic/errors", title: "Error Handling" },
      { href: "/oic/monitoring", title: "Monitoring & Tracking" },
    ],
  },
  {
    num: "7",
    title: "Ship it — and recognize the edition",
    know: "Deployment packages and promotion across environments, plus the current-generation (Gen 3) console orientation.",
    pages: [
      { href: "/oic/deployment", title: "Deployment & Lifecycle" },
      { href: "/oic/mft", title: "Managed File Transfer (MFT)" },
      { href: "/oic/gen3", title: "OIC Gen 3 Orientation" },
    ],
  },
  {
    num: "8",
    title: "VBCS — build the front-end",
    know: "The low-code UI layer: application/page model, business objects, service connections to Fusion and OIC, UI components, security, and deployment.",
    pages: [
      { href: "/vbcs/overview", title: "VBCS overview" },
      { href: "/vbcs/concepts", title: "Application & Page Model" },
      { href: "/vbcs/business-objects", title: "Business Objects & REST" },
      { href: "/vbcs/connecting", title: "Connecting to Fusion & OIC" },
      { href: "/vbcs/ui", title: "UI Components & Patterns" },
      { href: "/vbcs/security", title: "Security & Roles" },
      { href: "/vbcs/deploy", title: "Deployment & Lifecycle" },
    ],
  },
];

type SqlTrack = {
  num: string;
  title: string;
  know: string;
  pages: { href: string; title: string }[];
};

const sqlPath: SqlTrack[] = [
  {
    num: "1",
    title: "Foundations",
    know: "What a schema, table, and key are, Oracle's data types, and the tools you write SQL in.",
    pages: [
      { href: "/sql/overview", title: "Overview & Learning Path" },
      { href: "/sql/database-foundations", title: "Database Foundations" },
      { href: "/sql/data-types", title: "Data Types" },
    ],
  },
  {
    num: "2",
    title: "Querying",
    know: "SELECT, filters, single-row functions, and grouping — the questions every business asks.",
    pages: [
      { href: "/sql/basic-querying", title: "Basic Querying" },
      { href: "/sql/filtering", title: "Filtering" },
      { href: "/sql/single-row-functions", title: "Single-Row Functions" },
      { href: "/sql/grouping-aggregates", title: "Grouping & Aggregates" },
    ],
  },
  {
    num: "3",
    title: "Combining & comparing",
    know: "Putting tables together with joins, going deeper with subqueries, and comparing result sets.",
    pages: [
      { href: "/sql/joins", title: "Joins" },
      { href: "/sql/subqueries", title: "Subqueries" },
      { href: "/sql/set-operators", title: "Set Operators" },
    ],
  },
  {
    num: "4",
    title: "Changing data safely",
    know: "DML and the transaction discipline (COMMIT/ROLLBACK) that makes a change trustworthy.",
    pages: [
      { href: "/sql/dml", title: "DML — Changing Data" },
      { href: "/sql/transactions", title: "Transactions" },
    ],
  },
  {
    num: "5",
    title: "Database objects",
    know: "Table design you own: DDL, constraints, views, and sequences for clean, protected schemas.",
    pages: [
      { href: "/sql/ddl", title: "DDL — Database Objects" },
      { href: "/sql/constraints", title: "Constraints & Integrity" },
      { href: "/sql/views", title: "Views" },
      { href: "/sql/sequences-identity", title: "Sequences & Identity" },
    ],
  },
  {
    num: "6",
    title: "Advanced SQL",
    know: "Hierarchies, pivots, text patterns, analytic windows — the queries that impress in interviews and reports.",
    pages: [
      { href: "/sql/advanced-querying", title: "Advanced Querying" },
      { href: "/sql/analytic-functions", title: "Analytic / Window Functions" },
      { href: "/sql/oracle-specific", title: "Oracle-Specific SQL" },
    ],
  },
  {
    num: "7",
    title: "Performance & scale",
    know: "Indexes, explain plans, and partitioning — making Oracle answer quickly as data grows.",
    pages: [
      { href: "/sql/indexes-performance", title: "Indexes & Performance" },
      { href: "/sql/partitioning", title: "Partitioning & Large Data" },
    ],
  },
  {
    num: "8",
    title: "Security, modern data & PL/SQL",
    know: "Controlling access, working with JSON/XML, and stepping into stored-procedure development.",
    pages: [
      { href: "/sql/security", title: "Security" },
      { href: "/sql/json-xml", title: "JSON, XML & Modern SQL" },
      { href: "/sql/plsql", title: "PL/SQL — Overview" },
    ],
  },
];

export default function Home() {
  return (
    <div>
      <section className="mb-12">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">
          Reference Hub
        </p>
        <h1 className="mb-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-ink md:text-5xl">
          Oracle Fusion, Integration Cloud &amp; VBCS — explained end to end
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-strong">
          One place to learn how modern Oracle enterprise solutions work together: the
          applications you run on, the integration layer that connects them, and the low-code
          interfaces your users touch.
        </p>
        <p className="mt-5 flex items-center gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--edge-strong)] bg-[var(--surface-2)] px-2.5 py-1">
            <span className="text-amber-300">✦</span>
            <span>
              Handcrafted for learners by{" "}
              <span className="font-semibold text-ink">Raja Mani Kumar Molleti</span>
            </span>
          </span>
        </p>
      </section>

      <Diagram title="How the three technologies relate" className="mb-16">
        <DiagramNode tone="fusion" icon="📦" title="Fusion Cloud" subtitle="ERP · SCM · HCM · CX — system of record" />
        <Arrow label="REST / FBDI" />
        <DiagramNode tone="oic" icon="🔌" title="Integration Cloud" subtitle="Orchestration, adapters, process automation" />
        <Arrow label="REST endpoints" />
        <DiagramNode tone="vbcs" icon="🎨" title="VBCS" subtitle="Low-code UIs, pages, dashboards, workflows" />
      </Diagram>

      <section>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
          Learning path
        </p>
        <h2 className="mb-3 text-2xl font-bold tracking-tight text-ink">
          Learn ERP Financials &amp; Procurement — end to end
        </h2>
        <p className="mb-8 max-w-2xl text-base leading-7 text-muted-strong">
          One path, no branching. Start at stage 1 and follow the stages in order — each builds on
          the one before. Where a stage links several pages, read them in the order listed; the
          sidebar is ordered the same way, so you can keep your place.
        </p>

        <ol className="space-y-0">
          {financialsPath.map((stage, i) => (
            <li key={stage.num} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${stage.badge}`}
                >
                  {stage.num}
                </span>
                {i < financialsPath.length - 1 && <span className="mt-2 w-px flex-1 bg-[var(--edge)]" />}
              </div>
              <div className="pb-9">
                <h3 className="text-lg font-bold text-ink">{stage.title}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                  <span className="font-semibold text-muted-strong">You'll know:</span> {stage.know}
                </p>
                <div className="mt-3 flex max-w-2xl flex-wrap gap-2">
                  {stage.pages.map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      className="rounded-lg border border-[var(--edge)] bg-[var(--surface-2)] px-3 py-1.5 text-[13px] font-medium text-muted-strong transition-colors hover:border-[var(--edge-strong)] hover:text-ink"
                    >
                      {page.title}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 rounded-xl border border-[var(--edge)] bg-[var(--surface)] p-5">
          <p className="text-sm leading-7 text-muted-strong">
            <span className="font-semibold text-accent">Stage 7 complete →</span> you've walked
            ERP Financials from first concepts to the implementer's toolbox. To go deeper on the
            integration and UI layers that sit on top, use the technical flow below or jump straight
            into the <Link className="font-semibold text-accent hover:underline" href="/oic/overview">OIC</Link> and{" "}
            <Link className="font-semibold text-accent hover:underline" href="/vbcs/overview">VBCS</Link> sections.
          </p>
        </div>

        <div className="mt-12">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-sky-300">
            For developers
          </p>
          <h3 className="mb-3 text-xl font-bold tracking-tight text-ink">
            Technical flow — follow the data through the stack
          </h3>
          <p className="mb-8 max-w-2xl text-base leading-7 text-muted-strong">
            The same stack from a developer's seat. Every integration moves data through the same
            pipeline — each hop below links the page that explains it.
          </p>

          <ol>
            {technicalFlow.map((step, i) => (
              <li key={step.num}>
                <div className="flex gap-4">
                  <div className="flex shrink-0 flex-col items-center self-stretch">
                    <span className="flex size-8 items-center justify-center rounded-lg border border-sky-500/40 bg-sky-500/10 font-mono text-xs font-bold text-sky-300">
                      {step.num}
                    </span>
                    {i < technicalFlow.length - 1 && (
                      <span className="mt-2 flex flex-1 flex-col items-center text-muted/60" aria-hidden>
                        <span className="text-lg leading-none">↓</span>
                        <span className="w-px flex-1 bg-[var(--edge)]" />
                      </span>
                    )}
                  </div>
                  <div className="pb-6">
                    <h4 className="text-base font-bold text-ink">{step.title}</h4>
                    <p className="mt-0.5 max-w-2xl text-sm leading-6 text-muted">{step.note}</p>
                    <div className="mt-2 flex max-w-2xl flex-wrap gap-2">
                      {step.pages.map((page) => (
                        <Link
                          key={page.href}
                          href={page.href}
                          className="rounded-lg border border-[var(--edge)] bg-[var(--surface-2)] px-3 py-1.5 text-[13px] font-medium text-muted-strong transition-colors hover:border-[var(--edge-strong)] hover:text-ink"
                        >
                          {page.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-300">
            For the integration &amp; UI layer
          </p>
          <h3 className="mb-3 text-xl font-bold tracking-tight text-ink">
            OIC &amp; VBCS learning path — integration first, then the front-end
          </h3>
          <p className="mb-8 max-w-2xl text-base leading-7 text-muted-strong">
            The same stack from an integrator's or UI developer's seat. Learn OIC as the middle
            layer, then VBCS as the presentation layer on top of it.
          </p>

          <ol className="space-y-0">
            {platformPath.map((stage, i) => (
              <li key={stage.num} className="flex gap-4">
                <div className="flex shrink-0 flex-col items-center self-stretch">
                  <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500/90 text-sm font-bold text-white">
                    {stage.num}
                  </span>
                  {i < platformPath.length - 1 && (
                    <span className="mt-2 w-px flex-1 bg-[var(--edge)]" />
                  )}
                </div>
                <div className="pb-9">
                  <h4 className="text-lg font-bold text-ink">{stage.title}</h4>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                    <span className="font-semibold text-muted-strong">You'll know:</span>{" "}
                    {stage.know}
                  </p>
                  <div className="mt-3 flex max-w-2xl flex-wrap gap-2">
                    {stage.pages.map((page) => (
                      <Link
                        key={page.href}
                        href={page.href}
                        className="rounded-lg border border-[var(--edge)] bg-[var(--surface-2)] px-3 py-1.5 text-[13px] font-medium text-muted-strong transition-colors hover:border-[var(--edge-strong)] hover:text-ink"
                      >
                        {page.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-12">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-300">
            For every database
          </p>
          <h3 className="mb-3 text-xl font-bold tracking-tight text-ink">
            Oracle SQL — from foundations to PL/SQL
          </h3>
          <p className="mb-8 max-w-2xl text-base leading-7 text-muted-strong">
            The data layer under everything in this hub. Whether you read Fusion tables, write
            integration queries, or build reports, this is the language you will use every day —
            learn it end to end in one path.
          </p>

          <ol className="space-y-0">
            {sqlPath.map((stage, i) => (
              <li key={stage.num} className="flex gap-4">
                <div className="flex shrink-0 flex-col items-center self-stretch">
                  <span className="flex size-9 items-center justify-center rounded-full bg-amber-500/90 text-sm font-bold text-white">
                    {stage.num}
                  </span>
                  {i < sqlPath.length - 1 && <span className="mt-2 w-px flex-1 bg-[var(--edge)]" />}
                </div>
                <div className="pb-9">
                  <h4 className="text-lg font-bold text-ink">{stage.title}</h4>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                    <span className="font-semibold text-muted-strong">You'll know:</span>{" "}
                    {stage.know}
                  </p>
                  <div className="mt-3 flex max-w-2xl flex-wrap gap-2">
                    {stage.pages.map((page) => (
                      <Link
                        key={page.href}
                        href={page.href}
                        className="rounded-lg border border-[var(--edge)] bg-[var(--surface-2)] px-3 py-1.5 text-[13px] font-medium text-muted-strong transition-colors hover:border-[var(--edge-strong)] hover:text-ink"
                      >
                        {page.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
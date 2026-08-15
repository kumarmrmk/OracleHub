import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Reporting & Analytics",
};

export default function ReportingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Reporting & Analytics"
        description="Fusion has four reporting engines and knowing when to use each is a core skill: OTBI for ad-hoc, BI Publisher for pixel-perfect delivered reports, Financial Reporting for GL statements, and Smart View for Excel. Plus how every scheduled report actually runs as a job."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Reporting & Analytics" }]}
        updated="February 2025"
      />

      <H2>Which tool do I use?</H2>
      <P>
        Pick the engine by the question you're answering, not by habit.
      </P>
      <DataTable
        headers={["Question", "Tool", "Why"]}
        rows={[
          ["Who's overdue? How many invoices this week? — ad-hoc", <K key="a1">OTBI</K>, "Interactive answers with filters, prompts, drill-to-detail"],
          ["Print invoice PDF with my logo / regulatory format", <K key="a2">BI Publisher (BIP)</K>, "Pixel-perfect layouts (RTF/PDF), bursting, delivery"],
          ["Send the same report to 100 managers automatically", <K key="a3">BI Publisher</K>, "Scheduled + bursted by BU/manager email"],
          ["Trial balance, income statement, balance sheet", <K key="a4">Financial Reporting</K>, "GL account-based statements over ledgers"],
          ["Poke GL balances in Excel", <K key="a5">Smart View</K>, "Excel integration with live query"],
          ["Government-standard file (e.g. tax file)", <K key="a6">BI Publisher</K>, "XML/CSV templates + ESS delivery"],
        ]}
      />

      <H2>OTBI — Oracle Transactional Business Intelligence</H2>
      <P>
        OTBI answers questions against the <strong>transactional</strong> data (invoices, POs,
        expenses). You build <strong>analyses</strong> on <strong>subject areas</strong> (logical
        models like "Payables Invoices Real Time") and lay them out in <strong>dashboards</strong>.
      </P>
      <UL>
        <li><strong>Subject areas</strong> define what you can query — one per area (AP, AR, GL, Procurement, Expenses…).</li>
        <li><strong>Drill-to-detail</strong> jumps from a metric to the underlying transaction page in the application.</li>
        <li><strong>Security</strong> is via duties — a duty grants the subject areas and rows a user can see.</li>
        <li><strong>Delivered analytics</strong> ship with dashboards; you clone, edit, and save to a catalog folder.</li>
        <li>OTBI results can feed BIP reports and be delivered on a schedule.</li>
      </UL>
      <Callout type="info">
        OTBI is <strong>not</strong> for pixel-perfect or multi-company statutory outputs — that is
        BIP's job. And OTBI reads a data warehouse (subject areas), not the live transactional
        tables directly.
      </Callout>

      <H2>BI Publisher (BIP)</H2>
      <P>
        BIP is the formatting engine behind all <strong>delivered Fusion reports</strong> (invoice,
        statement, check, PO prints). You supply a <strong>data model</strong> (SQL or a Fusion data
        source) and a <strong>layout</strong> (RTF, eText, XSL-FO, PDF, Excel), then schedule or run
        it as a report job.
      </P>
      <UL>
        <li><strong>Layout templates</strong> are built in Word (RTF) with fields and loops; eText for bank/regulatory files.</li>
        <li><strong>Bursting</strong> splits one run into many outputs (per BU, per manager, per email).</li>
        <li><strong>Delivery</strong> to printer, email, FTP, WebDAV, UCM, or the report history.</li>
        <li><strong>Invoked via ESS</strong> — every scheduled report is really a scheduled process job.</li>
        <li>BIP also exposes REST endpoints to submit/check report jobs from an integration.</li>
      </UL>
      <H3>Running a report job (REST-style)</H3>
      <CodeBlock
        language="bash"
        filename="submit report job"
        code={`curl -u "report.user:password" \\
  "https://<instance>.oraclecloud.com/xmlpserver/report/<catalog-path>" \\
  -H "Content-Type: application/json" \\
  -X POST \\
  -d '{
    "parameterNameValues": [
      { "name": "PeriodName", "value": "JAN-2025" }
    ],
    "outputFormat": "PDF",
    "reportRequestedBy": "integration.user"
  }'`}
      />
      <Callout type="tip">
        The catalog path matters more than the report name — BIP addresses everything by its
        catalog path, e.g. <K>/Custom/Financials/AP/Invoices</K>.
      </Callout>

      <H2>Financial Reporting & Smart View</H2>
      <P>
        <strong>Financial Reporting Center</strong> is the GL reporting home: financial statements
        built with <strong>Financial Reporting Studio</strong> (row/column layouts over ledger
        balances), opened in the web or Excel. <strong>Smart View</strong> is the Excel bridge for
        live ad-hoc against those structures.
      </P>
      <UL>
        <li>Financial statements are built from <strong>account structures and reporting trees</strong>, not SQL.</li>
        <li>Smart View connects Excel to the reporting structure for "what-if" and period-over-period analysis.</li>
      </UL>

      <H2>How a scheduled report actually runs</H2>
      <P>
        All of this rides on the same job engine:
      </P>
      <Diagram title="Report job lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Schedule" subtitle="Reports & Analytics → schedule" />
        <Arrow label="ESS job" />
        <DiagramNode tone="fusion" title="ESS Scheduled Process" subtitle="run BIP data model + layout" />
        <Arrow />
        <DiagramNode tone="neutral" title="Delivery" subtitle="PDF to printer / email / FTP / history" />
        <Arrow label="view" />
        <DiagramNode tone="neutral" title="Report history" subtitle="download from Reports & Analytics" />
      </Diagram>

      <H2>Security model</H2>
      <DataTable
        headers={["Layer", "Controls", "Example"]}
        rows={[
          ["Duties/roles", "Which report tools and catalog folders a user can open", "Payables Manager duty"],
          ["Catalog", "Folder-level access to reports and analyses", "Only /Custom/Finance/AP"],
          ["Subject areas", "Which OTBI data a role can query", "AP Invoices Real Time vs full Financials"],
          ["Data security", "Which BUs/ledgers the data rows are filtered to", "Only DE business unit"],
        ]}
      />

      <H2>Next steps</H2>
      <UL>
        <li>Go deep on the engines behind OTBI in <a className="font-semibold text-accent hover:underline" href="/fusion/analytics/otbi">OTBI — Transactional BI</a>, <a className="font-semibold text-accent hover:underline" href="/fusion/analytics/oac">Oracle Analytics Cloud</a>, and <a className="font-semibold text-accent hover:underline" href="/fusion/analytics/obiee">OBIEE</a>.</li>
        <li>Reports are jobs — see how jobs work in <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">FBDI &amp; ADFdi</a>.</li>
        <li>Data comes from the ledgers and tables covered in <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a>.</li>
        <li>Delivering report output is a classic OIC use case — see <a className="font-semibold text-accent hover:underline" href="/oic/overview">Oracle Integration Cloud</a>.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Fusion Cloud Overview",
};

export default function FusionOverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="What is Oracle Fusion Cloud?"
        description="Oracle Fusion Cloud is Oracle's suite of SaaS applications — ERP, SCM, HCM, and CX — built on a common technology platform. It is the 'system of record': the place where your master data, transactions, and approvals ultimately live."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Overview" }]}
        updated="February 2025"
      />

      <P>
        Fusion Cloud (often just called <strong>Fusion</strong> or{" "}
        <strong>Oracle Fusion Applications</strong>) is a set of cloud applications delivered as a
        service. Oracle runs, patches, and secures the infrastructure; your organisation gets fully
        managed modules for finance, procurement, supply chain, HR, and customer experience.
      </P>

      <Callout type="info">
        The important mental model for an integration/UI developer: <strong>Fusion owns the data</strong>.
        Everything else in your ecosystem — an OIC integration, a VBCS page, an external web app —
        is either <em>reading from</em> Fusion or <em>writing to</em> Fusion. You rarely build
        "inside" Fusion; you build <em>around</em> it using its APIs and import/export files.
      </Callout>

      <H2>How Fusion is different from traditional E-Business Suite</H2>
      <P>
        Fusion Applications replaced the older <strong>Oracle E-Business Suite (EBS)</strong> as the
        flagship product line. The differences matter because they change how you integrate:
      </P>
      <DataTable
        headers={["Aspect", "E-Business Suite (EBS)", "Fusion Cloud"]}
        rows={[
          ["Deployment", "On-premises, self-managed", "SaaS — Oracle runs the infrastructure"],
          ["Database access", "Direct (connect with SQL via apps schema)", "Forbidden — you never touch the DB directly"],
          ["Customization", "Modify forms and tables, heavy configuration", "Configure, extend with apps, or integrate via APIs"],
          ["Integration", "Open interfaces, database triggers, XML Gateway", "REST APIs, SOAP web services, FBDI file uploads, BIP reports"],
          ["Custom UI", "Customized Oracle Forms", "VBCS, Redwood UX, custom app extensions"],
        ]}
      />
      <Callout type="warning">
        Because you cannot run SQL against the Fusion database, <em>every</em> read and write must go
        through a supported channel: REST or SOAP services, FBDI file loads, or Business Intelligence
        Publisher reports.
      </Callout>

      <H2>The Fusion technology stack</H2>
      <P>
        Under the hood, Fusion is built on Oracle's own middleware. Knowing this stack explains a lot
        of the terminology you will see in the documentation:
      </P>
      <Diagram title="Fusion platform stack" className="mb-8">
        <DiagramNode tone="neutral" title="Fusion Applications" subtitle="ERP · SCM · HCM · CX modules & roles" />
        <Arrow />
        <DiagramNode tone="neutral" title="ADF / Redwood UX" subtitle="Java-based web layer that renders pages & REST" />
        <Arrow />
        <DiagramNode tone="neutral" title="Fusion Middleware" subtitle="WebLogic, UCM (content), SOA, ESS, BIP" />
        <Arrow />
        <DiagramNode tone="neutral" title="Oracle Database" subtitle="Cloud-managed, isolated from customers" />
      </Diagram>
      <UL>
        <li>
          <strong>ADF (Application Development Framework)</strong> — the Java MVC framework that
          generates most Fusion pages. ADF also exposes the REST and SOAP services you consume.
        </li>
        <li>
          <strong>UCM (Universal Content Manager)</strong> — Fusion's document repository. Attachments
          you upload (invoices, CVs) are stored here.
        </li>
        <li>
          <strong>ESS (Enterprise Scheduler Service)</strong> — the job scheduler that runs FBDI loads,
          report generation, and other background processes.
        </li>
        <li>
          <strong>BIP (Business Intelligence Publisher)</strong> — the reporting engine that produces
          formatted documents (PDF, Excel) from data.
        </li>
        <li>
          <strong>Redwood</strong> — Oracle's new design system gradually replacing the older ADF
          look-and-feel in the user interface.
        </li>
      </UL>

      <H2>Where Fusion sits in the enterprise</H2>
      <P>
        In a typical Oracle-centric landscape, Fusion is the hub, and OIC is the "nervous system"
        that moves data between Fusion and everything else:
      </P>
      <Diagram title="Fusion as system of record" className="mb-8">
        <DiagramNode tone="neutral" title="Legacy / SaaS apps" subtitle="NetSuite, Salesforce, banks, e-commerce" />
        <Arrow />
        <DiagramNode tone="oic" title="Oracle Integration Cloud" subtitle="orchestrates, transforms, schedules" />
        <Arrow />
        <DiagramNode tone="fusion" title="Fusion Cloud" subtitle="master data + transactions" />
        <Arrow />
        <DiagramNode tone="vbcs" title="VBCS apps" subtitle="extranet portals, dashboards, self-service" />
      </Diagram>
      <P>
        An integration developer works at the boundary between Fusion and OIC:{" "}
        <strong>connecting to</strong> Fusion services, <strong>transforming</strong> payloads, and{" "}
        <strong>orchestrating</strong> multi-step flows. A front-end developer builds VBCS pages that
        consume either Fusion services directly or OIC endpoints that hide the complexity.
      </P>

      <H2>The two integration pillars</H2>
      <P>
        Every Fusion integration boils down to one of two patterns. Master both and you can handle
        almost any requirement.
      </P>
      <H3>1. Service-based (REST / SOAP)</H3>
      <P>
        For small, synchronous, request-response calls — reading an invoice, creating a customer, or
        querying open POs. Each Fusion module exposes REST resources under a versioned URL space.
      </P>
      <CodeBlock
        language="bash"
        filename="Read an invoice header via Fusion REST"
        code={`curl -u "username:password" \\
  "https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/invoices?limit=5" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />
      <H3>2. File-based (FBDI)</H3>
      <P>
        For bulk, asynchronous, "no one is waiting on the result" loads — importing 10,000 supplier
        invoices. You upload a ZIP of CSV data plus an XML control file to UCM, and ESS runs an import
        job in the background.
      </P>
      <P>
        You will usually combine the two: <strong>OIC orchestrates</strong> and calls REST for the
        small stuff, but switches to <strong>FBDI for bulk</strong>.
      </P>

      <Callout type="example">
        <strong>Real-world mix:</strong> an inbound invoice from a supplier portal lands in OIC. OIC
        validates it, calls Fusion REST to check the PO exists, then triggers an FBDI load to import
        the invoice in bulk at night. A VBCS page then shows the status.
      </Callout>

      <H2>Business cycles at a glance — where every module plugs in</H2>
      <P>
        Modules are the tools; business cycles are the work. Everything on this site belongs to one
        of three end-to-end journeys: money you <strong>spend</strong> (Procure-to-Pay), money you{" "}
        <strong>earn</strong> (Order-to-Cash), and the reporting that wraps both around each month
        (Record-to-Report). If you are ever unsure which module owns a task, the answer is "the part
        of the cycle doing the work right now."
      </P>
      <Diagram title="One business, three cycles" className="mb-8">
        <DiagramNode tone="warning" icon="🛒" title="Procure-to-Pay" subtitle="need → PO → receive → AP invoice → pay → reconcile" />
        <Arrow />
        <DiagramNode tone="fusion" icon="📊" title="Record-to-Report" subtitle="sub-ledgers → GL → close → statements" />
        <Arrow />
        <DiagramNode tone="warning" icon="💰" title="Order-to-Cash" subtitle="order → ship → AR invoice → receipt → collections" />
      </Diagram>

      <H3>The Financials / Supply Chain split in one table</H3>
      <P>
        This is the map that answers the most-asked question — <em>"is procurement part of supply
        chain?"</em> Yes: <strong>procurement is the supply chain's buying stage</strong>. It meets
        Financials at the invoice, which is exactly where the P2P cycle crosses from SCM into
        Payables.
      </P>
      <DataTable
        headers={["Module", "Suite group", "Job in one line", "Cycle(s) you will see it in"]}
        rows={[
          ["Procurement", "Supply Chain", "Source and buy from suppliers (requisition → PO → receipt)", "P2P"],
          ["Payables (AP)", "Financials", "Validate and pay supplier invoices", "P2P"],
          ["Inventory", "Supply Chain", "Store, move, and count what you own", "P2P (receiving) · O2C (shipping)"],
          ["Order Management", "Supply Chain", "Turn customer orders into shipments", "O2C"],
          ["Cost Management", "Supply Chain", "Put a value on the stock", "R2R (valuation)"],
          ["Receivables (AR)", "Financials", "Bill customers and collect the cash", "O2C"],
          ["Cash Management", "Financials", "Bank setup, statements, and reconciliation", "P2P · O2C"],
          ["General Ledger", "Financials", "The scorebook — every entry ends here", "R2R (all)"],
          ["Fixed Assets", "Financials", "Long-lived assets and depreciation", "R2R"],
          ["Expenses", "Financials", "Employee spend, from report to reimbursement", "R2R"],
        ]}
      />
      <Callout type="tip" title="The one-line memory hook">
        <strong>Procurement sources</strong>, <strong>Inventory stores</strong>,{" "}
        <strong>Order Management ships</strong>, <strong>Cost values</strong> — that is Supply Chain.{" "}
        <strong>Payables pays</strong>, <strong>Receivables collects</strong>,{" "}
        <strong>Cash confirms</strong>, <strong>GL scores</strong>,{" "}
        <strong>Assets depreciates</strong>, <strong>Expenses reimburses</strong> — that is
        Financials. They meet in the cycles: buy and pay (P2P), sell and collect (O2C), then report
        it all (R2R).
      </Callout>
      <P>
        Each cycle has a full step-by-step — table by table, REST/FBDI hop by hop — if you want the
        deep dive:{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/p2p">Procure-to-Pay</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/o2c">Order-to-Cash</a>,{" "}
        <a className="font-semibold text-accent hover:underline" href="/fusion/financials/cycles/r2r">Record-to-Report</a>.
      </P>

      <H2>Key URLs and consoles you will use</H2>
      <DataTable
        headers={["Purpose", "URL pattern"]}
        rows={[
          ["User interface", <K key="ui">https://yourinstance.oraclecloud.com</K>],
          ["REST API base (Financials)", <K key="rest">https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/…</K>],
          ["HCM REST base", <K key="hcm">https://yourinstance.oraclecloud.com/hcmRestApi/resources/11.13.18.05/…</K>],
          ["SOAP services (WSDL)", <K key="soap">https://yourinstance.oraclecloud.com/soa-infra/services/default/…</K>],
          ["REST API metadata browser", <K key="meta">https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/</K>],
        ]}
      />
      <Callout type="tip">
        Open the REST base URL in a browser while logged in to Fusion — Oracle renders an interactive
        explorer showing every resource, its fields, and sample payloads. It is the fastest way to
        learn an endpoint.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>
          Explore the <a className="font-semibold text-accent hover:underline" href="/fusion/modules">application modules</a> and what each one exposes.
        </li>
        <li>
          Learn the <a className="font-semibold text-accent hover:underline" href="/fusion/concepts">core concepts</a> — flexfields, value sets, and attachment handling.
        </li>
        <li>
          Go deep on <a className="font-semibold text-accent hover:underline" href="/fusion/rest-api">REST APIs</a> and{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">FBDI</a> — the two pillars.
        </li>
      </UL>
    </>
  );
}
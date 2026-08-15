import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Application Modules",
};

export default function FusionModulesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Application Modules"
        description="Fusion Cloud is not one application — it is four families of applications (ERP, SCM, HCM, CX) sharing one platform. Each family exposes its own REST services, files, and business objects. This page maps the modules and the objects you are most likely to integrate with."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Application Modules" }]}
        updated="February 2025"
      />

      <P>
        When Oracle says "Fusion," it means a single cloud suite that happens to be sold and
        implemented in pieces. The <strong>technology is shared</strong> — one login, one REST
        framework, one file-loading engine — but the <strong>business objects are grouped into
        modules</strong>, and the module decides which REST base URL you call and which FBDI
        templates you use.
      </P>

      <Callout type="info">
        The single most useful habit: <strong>identify the module first</strong>. Almost everything
        else — the REST base URL, the templates, the security roles, the correct value sets —
        follows from knowing whether you are dealing with Financials, Procurement, SCM, HCM, or CX.
      </Callout>

      <H2>The main application suites</H2>
      <P>
        Fusion ships as four suites. The first three are sold as <strong>Fusion ERP</strong> (which
        groups Finance, Procurement, and Project Financials) and <strong>Fusion SCM</strong>{" "}
        (Supply Chain &amp; Manufacturing). <strong>Fusion HCM</strong> and{" "}
        <strong>Fusion CX</strong> are separate product lines. As an integrator you will mostly care
        about which <strong>objects</strong> you touch, not the commercial packaging.
      </P>
      <DataTable
        headers={["Suite", "Business purpose", "Typical objects you integrate with"]}
        rows={[
          ["ERP — Financials", "Account for money: general ledger, payables, receivables, fixed assets, expenses", "Journals, supplier invoices, payments, expense reports, budgets"],
          ["ERP — Procurement", "Buy things: requisitions, purchase orders, contracts, sourcing", "Requisitions, purchase orders (POs), suppliers, supplier sites"],
          ["SCM", "Plan and move inventory and goods: inventory, orders, manufacturing, logistics", "Inventory items, order management (OM) orders, shipments, on-hand balances"],
          ["HCM", "Manage people: workforce structure, talent, payroll, benefits", "Workers, assignments, positions, HR actions, resumes, competencies"],
          ["CX", "Win and serve customers: sales, marketing, service, commerce", "Opportunities, leads, accounts/contacts, service requests"],
        ]}
      />
      <P>
        Notice that modules share concepts: a <strong>customer</strong> appears in Receivables as a{" "}
        <strong>customer account</strong>, in OC (Order Capture) as a <strong>customer</strong>, and
        in CX as an <strong>account</strong>. One of the first things you do on any project is agree
        which module's copy is the source of truth.
      </P>

      <H2>Financials in practice</H2>
      <P>
        Financials is the most-integrated module in practice because <em>everything money-related</em>{" "}
        lands here. The objects you will see most often:
      </P>
      <UL>
        <li>
          <strong>General Ledger (GL)</strong> — the chart of accounts, account balances, and{" "}
          <strong>journal entries</strong>. Journal batches are posted in{" "}
          <strong>accounting periods</strong>; an integration must find the open period before
          posting.
        </li>
        <li>
          <strong>Payables</strong> — <strong>supplier invoices</strong> and payments. The classic
          inbound integration is "import supplier invoices" from an external system.
        </li>
        <li>
          <strong>Receivables</strong> — customer invoices, credit memos, and receipts.
        </li>
        <li>
          <strong>Fixed Assets</strong> — asset books, additions, transfers, and depreciation runs.
        </li>
        <li>
          <strong>Expenses</strong> — expense report headers and lines, plus approval workflow.
        </li>
      </UL>
      <H3>A common integration: import supplier invoices</H3>
      <Diagram title="Supplier invoice import" className="mb-8">
        <DiagramNode tone="neutral" title="Source system" subtitle="ERP, portal, bank statements" />
        <Arrow label="REST or file" />
        <DiagramNode tone="fusion" title="Fusion Payables" subtitle="invoices · AP Invoice Import" />
        <Arrow label="validate + post" />
        <DiagramNode tone="neutral" title="General Ledger" subtitle="journal entries in open period" />
      </Diagram>
      <P>
        For a handful of invoices you POST to the <K>invoices</K> REST resource. For thousands, you
        use the <strong>Payables Standard Invoice Import (via FBDI)</strong> template so ESS can
        process the batch asynchronously. Both paths end at the same place: an invoice in Payables
        that references a supplier, a site, and a set of distribution lines that carry the account
        segments.
      </P>
      <CodeBlock
        language="bash"
        filename="Create one invoice via Fusion REST"
        code={`curl -u "username:password" \\
  -X POST \\
  "https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/invoices" \\
  -H "Content-Type: application/vnd.oracle.resource+json; type=singular" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -d '{
    "InvoiceNumber": "INV-1001",
    "InvoiceDate": "2025-02-01",
    "VendorId": 300100220012345,
    "InvoiceCurrencyCode": "USD",
    "LineAmount": 1250.00
  }'`}
      />

      <H2>Procurement &amp; Supply Chain</H2>
      <P>
        Procurement lives inside ERP and covers <strong>requisitions</strong>,{" "}
        <strong>purchase orders</strong>, and <strong>suppliers</strong>. SCM extends outward to
        inventory, order management, sourcing, and logistics. The object nearly every integration
        touches first is the <strong>supplier</strong> — it is master data you create before any
        buying can happen.
      </P>
      <H3>The PR → PO → Receipt → Invoice flow</H3>
      <Diagram title="Procure-to-pay lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Requisition (PR)" subtitle="someone requests goods" />
        <Arrow label="approve" />
        <DiagramNode tone="fusion" title="Purchase Order" subtitle="buyer turns PR into PO" />
        <Arrow label="ship" />
        <DiagramNode tone="neutral" title="Receipt" subtitle="goods received against PO line" />
        <Arrow label="bill" />
        <DiagramNode tone="success" title="Invoice" subtitle="three-way match: PO + receipt + invoice" />
      </Diagram>
      <P>
        A <strong>requisition</strong> is a request; once approved it is converted to a{" "}
        <strong>purchase order</strong>. When goods arrive, the warehouse records a{" "}
        <strong>receipt</strong>. When the vendor bills you, Payables matches the{" "}
        <strong>invoice</strong> against the PO and receipt — the famous{" "}
        <strong>three-way match</strong>. As an integrator you hook in at any of these points:
        creating POs, adding receipts, or importing supplier invoices.
      </P>
      <CodeBlock
        language="bash"
        filename="Look up open POs"
        code={`curl -u "username:password" \\
  "https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/purchaseOrders?q=Status='OPEN'&limit=25" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />

      <H2>HCM highlights</H2>
      <P>
        Fusion HCM manages people through several layers of structure. GitHub-style terminology
        aside, the objects map to real HR concepts:
      </P>
      <UL>
        <li>
          <strong>Workers</strong> — a person with one or more active assignments. In REST these are{" "}
          <K>person</K> and <K>personProfile</K> resources.
        </li>
        <li>
          <strong>Positions</strong> — an org-chart slot ("Finance Manager, UK") that a worker
          occupies; you usually integrate positions, not just people.
        </li>
        <li>
          <strong>HR actions</strong> — the audited events (hire, transfer, terminate) that change
          a worker. <K>hrActions</K> is where status changes enter the system.
        </li>
        <li>
          <strong>Assignments</strong> — the specific job/org/location a worker fills on a date.
        </li>
        <li>
          <strong>Benefits &amp; expenrollment</strong> — eligibility and enrollment records,
          including the fact that HCM also runs <strong>expense reports</strong> for employee travel.
        </li>
      </UL>
      <P>
        HCM has its own REST base URL. Note the difference from Financials:
      </P>
      <CodeBlock
        language="bash"
        filename="HCM REST base URL"
        code={`https://yourinstance.oraclecloud.com/hcmRestApi/resources/11.13.18.05/persons?q=PersonNumber='00000001'`}
      />
      <Callout type="tip">
        The same versioned pattern (<K>11.13.18.05</K>) applies, but the resource family is{" "}
        <strong>hcmRestApi</strong>, not <K>fscmRestApi</K>. HCM also exposes SOAP services (for
        example <K>HCMWorkerService</K>) that some legacy integrations still use.
      </Callout>

      <H2>CX (Customer Experience)</H2>
      <P>
        Fusion CX covers sales, marketing, and service. From an integration standpoint the key
        objects are on the <strong>sales side</strong>:
      </P>
      <UL>
        <li>
          <strong>Leads</strong> — unqualified interest that can be routed and converted.
        </li>
        <li>
          <strong>Opportunities</strong> — a qualified pipeline deal with amount and close date.
        </li>
        <li>
          <strong>Customer accounts / contacts</strong> — the CRM representation of a party, shared
          with Receivables through the <strong>Customer Data Management (CDM)</strong> foundation.
        </li>
      </UL>
      <P>
        CX uses the same REST framework but a different base: <K>crmRestApi</K>. In practice, many
        CX integrations are read-only extracts to a sales dashboard or a two-way sync of{" "}
        <K>opportunities</K> with a proposal tool.
      </P>

      <H2>Which module am I integrating with?</H2>
      <Callout type="tip">
        When you are handed a requirement, the fastest way to decide the module is to look at the{" "}
        <strong>REST base URL</strong> in the service description or the delivered integration:{" "}
        <K>fscmRestApi</K> means ERP/SCM (Finance, Procurement, Order Management);{" "}
        <K>hcmRestApi</K> means HCM; <K>crmRestApi</K> means CX. The resource after the version —
        <K>invoices</K>, <K>purchaseOrders</K>, <K>persons</K>, <K>opportunities</K> — then tells
        you the exact module.
      </Callout>
      <P>
        If you are still unsure, open the metadata explorer at the base URL while logged in: it lists
        every resource, and the resource name alone ("…Payables…", "…HCM…", "…Sales…") usually gives
        the module away.
      </P>

      <H2>Next steps</H2>
      <UL>
        <li>
          Learn the shared foundations in{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/concepts">
            core concepts
          </a>{" "}
          — flexfields, value sets, attachments, and Jobs.
        </li>
        <li>
          Master the mechanics of calling any of these modules in{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/rest-api">
            REST API fundamentals
          </a>
          .
        </li>
        <li>
          Load bulk data into a module with{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">
            FBDI &amp; ADFdi
          </a>
          .
        </li>
      </UL>
    </>
  );
}
import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "OIC Use Cases",
};

export default function OicUseCasesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Official use cases"
        description="The ten use cases Oracle documents for Oracle Integration — from AI-guided invoice creation to B2B order-to-cash — summarized faithfully so you can see what a finished integration looks like before you build your own."
        breadcrumbs={[{ label: "OIC" }, { label: "Use Cases" }]}
        updated="February 2025"
        level="Module"
      />

      <P>
        Oracle's getting-started guide walks through ten realistic automations. Together they show
        the full range of what Oracle Integration can orchestrate: <strong>AI services</strong> for
        extraction and analysis, <strong>human-in-the-loop</strong> approvals, <strong>robotic
        process automation</strong> for systems without APIs, <strong>B2B / EDI</strong> document
        exchange, <strong>decisions</strong> for routing, and a <strong>knowledge base</strong> for
        policy. This page preserves each one's steps so you can recognize the patterns when you meet
        them in your own work.
      </P>

      <H2>At a glance</H2>
      <DataTable
        headers={["Use case", "What it automates", "Capabilities used"]}
        rows={[
          ["Create Invoices", "Vendors' invoices → reviewed, approved, and created in ERP", "Integration · Human in the loop · Decision · Robot"],
          ["Update Invoices", "Existing invoices verified and updated in bulk", "Integration · Robot"],
          ["Procure to Pay", "EDI orders, shipments, invoices, and payment exchanged B2B", "Integration · B2B"],
          ["Order to Cash", "Retailer order to manufacturer, shipped, billed, and paid", "Integration · B2B"],
          ["Extract Data Using OCI AI Services", "Invoice PDF → AI extraction → auto-approve/reject in ERP", "Integration · Agentic AI · Human in the loop"],
          ["Employee Recruitment", "Resumes scored, interviews scheduled, references checked", "Agentic AI · Integration · Decision"],
          ["Respond to Messages", "Customer messages analyzed and answered (or routed to staff)", "Integration · Decision · Human in the loop"],
          ["Stage Reports from Fusion", "Fusion reports copied to File Server for use elsewhere", "Integration"],
          ["Sync Versus Async", "When to run a flow waiting-for-response vs fire-and-forget", "Integration"],
          ["Disaster Recovery Simulation", "Periodic failover/failback testing of your DR plan", "Integration"],
        ]}
      />

      <H2>The capability cards</H2>
      <P>
        Each use case bundles a few building blocks. Recognize these before reading the steps:
      </P>
      <DataTable
        headers={["Capability", "What it is", "Where documented here"]}
        rows={[
          ["Integration", "A standard OIC flow: trigger → map → invoke", <a key="i" className="font-semibold text-sky-300 hover:underline" href="/oic/orchestration">Orchestration</a>],
          ["Human in the loop", "A task routed to a person for review/approval", <a key="h" className="font-semibold text-sky-300 hover:underline" href="/oic/process">Process Automation</a>],
          ["Robot", "RPA acting on systems that have no APIs", "OIC RPA component"],
          ["Decision", "Business rules that route a flow", <a key="d" className="font-semibold text-sky-300 hover:underline" href="/oic/process">Process Automation</a>],
          ["B2B / EDI", "Document exchange over AS4 (EDIFACT/ANSI X12)", <span key="b"><a className="font-semibold text-sky-300 hover:underline" href="/oic/mft">MFT</a> &amp; B2B</span>],
          ["Agentic AI", "AI agents that plan and call integrations", <span key="a"><a className="font-semibold text-sky-300 hover:underline" href="/oic/gen3">Gen 3</a> &amp; OCI AI</span>],
          ["Knowledge base", "Company policy documents consulted at runtime", "OCI Generative AI Agents RAG"],
        ]}
      />
      <Callout type="info">
        The B2B/EDI documents in this page run over the <strong>AS4 protocol</strong> and use
        standard EDI document types: <K>850</K> Purchase Order, <K>855</K> PO Acknowledgment,{" "}
        <K>856</K> Advance Ship Notice, <K>810</K> Invoice, <K>997</K> Functional Acknowledgment,
        and <K>MDN</K> Message Disposition Notification.
      </Callout>

      <H2>1 · Create Invoices</H2>
      <P>
        Vendors send invoices (as email PDFs or SFTP uploads); OIC turns them into ERP invoices
        with as little manual effort as possible.
      </P>
      <Diagram title="Create Invoices flow" className="mb-8">
        <DiagramNode tone="oic" title="Find invoice" subtitle="email poll or File Server event" />
        <Arrow label="AI extract" />
        <DiagramNode tone="oic" title="OCI Document Understanding" subtitle="PO number + amount" />
        <Arrow label="confidence < 1" />
        <DiagramNode tone="warning" title="Human reviews" subtitle="approve or correct the data" />
        <Arrow label="amount check" />
        <DiagramNode tone="warning" title="Robot matches PO" subtitle="legacy system, no APIs" />
        <Arrow label="decision" />
        <DiagramNode tone="accent" title="Approve" subtitle="auto below limit · human above" />
        <Arrow label="create" />
        <DiagramNode tone="success" title="ERP invoice" subtitle="Oracle ERP Cloud Adapter" />
      </Diagram>
      <H3>Steps (from the Oracle use case)</H3>
      <UL>
        <li><strong>Find new invoices</strong> — on a schedule (email) or on a File Server system event (SFTP upload).</li>
        <li><strong>Extract invoice data</strong> — the integration calls <K>OCI Document Understanding</K> to pull the PO number and PO amount.</li>
        <li><strong>Review extracted data</strong> — if the confidence score is below 1, a human-in-the-loop task asks an employee to compare the extract against the invoice and approve or correct it.</li>
        <li><strong>Confirm the PO amount</strong> — a robot opens the legacy procurement system (no APIs), finds the original PO, and reports whether the authorized amount matches the billed amount.</li>
        <li><strong>Approve the purchase</strong> — a decision checks the amount against the auto-approval limit; above the limit, a human task approves, and can approve or reject any item in natural language (e.g. "new desk chairs yes, espresso machine no").</li>
        <li><strong>Create the invoice</strong> — the integration creates the invoice in Oracle Cloud ERP using the ERP Cloud Adapter.</li>
      </UL>

      <H2>2 · Update Invoices</H2>
      <P>
        The counterpart automation: bulk-correct existing invoices so nothing is updated by hand.
      </P>
      <UL>
        <li><strong>Find an invoice</strong> — an integration passes a set of invoice numbers, amounts, and supplier names to a robot (data often comes from a staged Fusion report — see use case 8).</li>
        <li><strong>Verify the invoice</strong> — the robot checks that number, amount, and supplier match the passed values.</li>
        <li><strong>Update and repeat</strong> — on a match the robot updates the invoice, then moves to the next one.</li>
      </UL>

      <H2>3 · Procure to Pay</H2>
      <P>
        Your company (a product manufacturer) orders parts from a supplier through EDI over AS4,
        and every message is tracked by OIC's B2B component.
      </P>
      <UL>
        <li><strong>Place an order</strong> — you upload an EDI file to File Server; integrations send <K>850 Purchase Order</K> and receive an <K>MDN</K> confirmation.</li>
        <li><strong>Receive updates</strong> — a receive integration validates the order, sends <K>997 Functional Acknowledgment</K>, translates the file with the B2B schema, and writes the PO to Oracle Cloud ERP via the ERP Cloud Adapter; the supplier accepts with <K>855 PO Acknowledgment</K>.</li>
        <li><strong>Shipment and invoice</strong> — the sequence of <K>856 Advance Ship Notice</K> and <K>810 Invoice</K> messages, each acknowledged.</li>
        <li><strong>Send payment</strong> — the order is paid on receipt of the goods.</li>
      </UL>
      <Callout type="tip">
        This is the same P2P business cycle the Financials site covers — but here it is executed as
        <strong>B2B message exchange</strong> instead of API calls. See{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/fusion/financials/cycles/p2p">
          Procure-to-Pay
        </a>{" "}
        for the finance side of the same story.
      </Callout>

      <H2>4 · Order to Cash</H2>
      <P>
        A retailer orders from you (the manufacturer); you fulfill, bill, and collect — also over
        EDI/AS4.
      </P>
      <UL>
        <li><strong>Receive an order</strong> — the retailer uploads an EDI <K>850 Purchase Order</K> to File Server; you confirm receipt with <K>MDN</K>.</li>
        <li><strong>Process the order</strong> — a receive integration validates it, sends <K>997</K>, translates to ERP XML, and writes the PO to Oracle Cloud ERP with the ERP Cloud Adapter; you accept with <K>855</K>.</li>
        <li><strong>Shipment and invoice</strong> — <K>856 Advance Ship Notice</K> and <K>810 Invoice</K>, each acknowledged by the retailer.</li>
        <li><strong>Receive payment</strong> — you collect for the order.</li>
      </UL>
      <Callout type="info">
        The mirror image of Procure-to-Pay from the supplier's seat. See{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/fusion/financials/cycles/o2c">
          Order-to-Cash
        </a>{" "}
        for the finance-side cycle.
      </Callout>

      <H2>5 · Extract Data Using OCI AI Services</H2>
      <P>
        A single upload becomes an ERP decision — fully or partially automated by AI and policy.
      </P>
      <UL>
        <li><strong>Upload an invoice</strong> — an employee uploads a PDF to File Server; a <K>File created</K> system event fires.</li>
        <li><strong>Extract data</strong> — an event-triggered integration calls <K>OCI Document Understanding</K> for items and amounts, then <K>OCI Generative AI</K> builds a prompt like "Approval needed for a keyboard that costs $22 and a mouse that costs $19."</li>
        <li><strong>Decide and update ERP</strong> — <K>OCI Generative AI Agents RAG</K> compares the prompt against the uploaded company expense policy: <em>auto-approve</em> within limits, <em>auto-reject</em> disallowed purchases, or route a human-in-the-loop task to a manager with the extracted data.</li>
      </UL>
      <Callout type="info">
        Note the difference from use case 1: here the policy lives in a <strong>knowledge base</strong>{" "}
        (RAG) that OIC consults at runtime; in use case 1 the approval limit is evaluated by a{" "}
        <strong>decision</strong> rule.
      </Callout>

      <H2>6 · Employee Recruitment</H2>
      <P>
        An <strong>agentic AI</strong> assistant runs an end-to-end recruiting workflow from the
        uploaded resumes to references.
      </P>
      <UL>
        <li><strong>Receive scores</strong> — a hiring manager uploads resumes to a chat interface. The agent uses integrations for <K>OCI Document Understanding</K> (classify + extract resumes), job-description analysis, and knowledge-base policy retrieval; a decision scores candidates; <K>OCI Language AI</K> checks for bias. Scores and bias analysis return to the chat.</li>
        <li><strong>Schedule interviews</strong> — the manager picks candidates; the agent calls integrations to create profiles in <strong>Oracle Cloud HCM</strong> and to email candidates a calendar link for choosing an interview time.</li>
        <li><strong>Check references</strong> — the agent calls an integration that starts background-check/reference verification for the top candidate(s).</li>
      </UL>

      <H2>7 · Respond to Messages</H2>
      <P>
        Customer communications are analyzed, then answered automatically or routed to a human.
      </P>
      <UL>
        <li><strong>Analyze a message</strong> — an integration detects the communication (email, social post, review) and calls AI services for sentiment and the product/feature mentioned.</li>
        <li><strong>Send a response</strong> — a decision picks the best next step: send an automated reply, route to the right employee via human-in-the-loop for a custom response, create a help-desk ticket, or even compute a value like churn risk.</li>
        <li><strong>Update enterprise applications</strong> — an integration writes the engagement to the CRM using application-specific adapters.</li>
      </UL>

      <H2>8 · Stage Reports from Fusion Applications</H2>
      <P>
        Fusion reports are copied to File Server so other systems (or people) can use them without
        opening Fusion.
      </P>
      <UL>
        <li><strong>Generate a report</strong> — e.g. a pay-period report of invoices that still need manual updates in Fusion.</li>
        <li><strong>Copy to File Server</strong> — an integration runs on a Fusion report event or on a schedule and stages the report.</li>
        <li><strong>Use it downstream</strong> — archive it, access it without Fusion, distribute it to stakeholders, send it to an on-premises app, or feed it to the Update Invoices robot (use case 2).</li>
      </UL>

      <H2>9 · Sync Versus Async Integrations</H2>
      <P>
        The decision that shapes nearly every integration you design — and Oracle's official stance
        mirrors the one this site teaches:
      </P>
      <DataTable
        headers={["Type", "Choose when", "Examples in the use case", "Runtime"]
        }
        rows={[
          ["Synchronous", "Someone is waiting, or an SLA applies", "Order number back in the browser · call-center agent needs Salesforce data · employee updates HR address", "Must finish in minutes"],
          ["Asynchronous", "Fire-and-forget, resource-friendly", "Sales closed → generate the new customer's invoice", "Has hours to run"],
        ]}
      />
      <Callout type="info">
        This is the same sync/async trade-off covered in detail on the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/orchestration">
          orchestration
        </a>{" "}
        page — the official use case confirms the guidance in exactly these terms.
      </Callout>

      <H2>10 · Disaster Recovery Simulation</H2>
      <P>
        Not a business flow but an operational discipline: regularly prove that your OIC DR plan
        works before it is needed.
      </P>
      <UL>
        <li><strong>Create a business continuance strategy</strong> — define roles and responsibilities, document the failover plan, and build in reviews and audit.</li>
        <li><strong>Perform a DR simulation</strong> — periodically fail over to the other instance and fail back, implementing the documented process.</li>
        <li><strong>Conduct an operational site rotation (optional)</strong> — switch to a different center of operations (e.g. every ~6 months) so failover is a muscle you use, not a rumor.</li>
      </UL>
      <Callout type="warning">
        This use case assumes <strong>Oracle-managed disaster recovery</strong>. Customer-managed DR
        is also available but has its own supported/unsupported list — confirm which model your
        tenancy uses before you plan around it.
      </Callout>

      <H2>Patterns to take away</H2>
      <UL>
        <li><strong>Files are often the trigger</strong> — File Server + system events start most of these flows.</li>
        <li><strong>AI extracts, a decision routes</strong> — Document Understanding or Generative AI reads unstructured input; a decisions component picks the branch.</li>
        <li><strong>Humans only where the rules are</strong> — human-in-the-loop tasks sit at low-confidence extractions and above-limit approvals, not on every step.</li>
        <li><strong>No APIs → a robot</strong> — the legacy procurement system appears only because it has no API; expect RPA where integration can't reach.</li>
        <li><strong>ERP Cloud Adapter is the endpoint</strong> — Oracle Cloud ERP is written to via the application-specific adapter at the end of most financial flows.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Build the pieces these flows use in <a className="font-semibold text-sky-300 hover:underline" href="/oic/orchestration">orchestration</a> and <a className="font-semibold text-sky-300 hover:underline" href="/oic/mapping">mapping</a>.</li>
        <li>See the pattern behind use cases 3 and 4 in <a className="font-semibold text-sky-300 hover:underline" href="/oic/fbdi-integration">FBDI integration</a>.</li>
        <li>Keep a portfolio of flows like these healthy in <a className="font-semibold text-sky-300 hover:underline" href="/oic/monitoring">monitoring</a>.</li>
      </UL>
    </>
  );
}
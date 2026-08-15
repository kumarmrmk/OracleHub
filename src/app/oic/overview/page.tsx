import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "OIC Overview",
};

export default function OicOverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="What is Oracle Integration Cloud?"
        description="Oracle Integration Cloud (OIC) is Oracle's integration-platform-as-a-service (iPaaS). It connects Fusion and hundreds of other systems using pre-built adapters, orchestrated flows, and process automation — all configured in a visual designer rather than handwritten code."
        breadcrumbs={[{ label: "OIC" }, { label: "Overview" }]}
        updated="February 2025"
      />

      <P>
        OIC is the <strong>middle layer</strong> of the Oracle stack. If Fusion is the system of
        record and VBCS is the front end, OIC is the plumbing that makes them talk. It handles
        connectivity, transformation, routing, scheduling, error handling, and even human approval
        flows.
      </P>

      <Callout type="info">
        Think of OIC as <strong>"integration as configuration."</strong> You draw the integration,
        map the fields visually, choose the adapter, and OIC generates the underlying runtime for
        you. You still <em>can</em> drop in custom code (JavaScript / XSLT mappings, Groovy in
        processes), but the default path is low-code.
      </Callout>

      <H2>The OIC console and its building blocks</H2>
      <P>
        OIC is accessed through a set of related consoles in the same cloud subnet. Each one targets a
        different kind of developer:
      </P>
      <DataTable
        headers={["Console", "What you build", "Used for"]}
        rows={[
          ["Integrations", "Point-to-point and orchestrations", "Moving data between two systems"],
          ["Process Builder", "Human workflows with approvals", "Expense approvals, onboarding steps"],
          ["Connections", "Reusable endpoints & credentials", "Sharing adapters across integrations"],
          ["Monitoring", "Dashboards, tracking, resubmission", "Seeing where your data is and fixing failures"],
        ]}
      />

      <Diagram
        title="Core building blocks of an integration"
        className="mb-8"
      >
        <DiagramNode tone="neutral" title="Connection" subtitle="System + credentials (adapter instance)" />
        <Arrow />
        <DiagramNode tone="oic" title="Trigger → Model → Invoke" subtitle="Facts, lookups, maps, switches (the flow)" />
        <Arrow />
        <DiagramNode tone="neutral" title="Connection" subtitle="Target system + response handling" />
      </Diagram>

      <H2>What OIC actually runs for you</H2>
      <P>
        When you activate an integration, OIC deploys it to a runtime engine and exposes it as an
        endpoint you can call from anywhere. That means your integration instantly becomes an API —
        which is exactly how VBCS talks to it.
      </P>
      <UL>
        <li>
          <strong>Activate</strong> an integration to publish it. An app-driven integration gets a
          REST endpoint URL; a scheduled one gets an enterprise scheduler entry.
        </li>
        <li>
          <strong>Packages</strong> let Oracle ship full solutions (e.g. "Fusion to NetSuite GL") that
          you import and configure instead of building from scratch.
        </li>
        <li>
          <strong>Agents</strong> extend OIC into your own data center to reach on-premises systems
          (Oracle databases, SAP, files on your network) through a secure outbound-only tunnel.
        </li>
        <li>
          <strong>Lookups</strong> act as runtime lookup tables (e.g. map "01" → "Active") so you
          never hard-code translations in your mappings.
        </li>
      </UL>

      <H2>The three integration styles</H2>
      <P>
        Every integration you build is one of three "styles." They differ in <em>what triggers</em>{" "}
        the flow.
      </P>
      <DataTable
        headers={["Style", "Trigger", "Example", "Latency"]}
        rows={[
          ["App-Driven / Orchestration", "An incoming request (REST, SOAP, file, DB event)", "A PO comes in from an extranet portal; OIC import it into Fusion", "Seconds"],
          ["Data-Driven / Scheduled", "A time-based schedule (ESS job)", "Every night, GET changed suppliers from Fusion REST and sync downstream", "Batch"],
          ["Event-Driven", "A change notification pushed from a system", "Fusion fires a business event when a PO is approved", "Real-time"],
        ]}
      />

      <Callout type="tip">
        You don't strictly need OIC for simple Fusion reads — VBCS can call Fusion REST directly. But
        the moment you need <strong>transformation, orchestration, scheduled sync, or error
        tolerance</strong>, OIC earns its place: it keeps that complexity out of your front-end code.
      </Callout>

      <H2>A typical OIC flow, end to end</H2>
      <P>
        Consider a supplier submitting an invoice on your external portal. Here is the OIC journey:
      </P>
      <Diagram title="OIC invoice integration" className="mb-8">
        <DiagramNode tone="vbcs" title="VBCS Portal" subtitle="supplier enters invoice" />
        <Arrow label="POST /invocations" />
        <DiagramNode tone="oic" title="OIC Integration" subtitle="validate · lookup · transform" />
        <Arrow label="FBDI or REST" />
        <DiagramNode tone="fusion" title="Fusion" subtitle="invoice created & submitted" />
        <Arrow label="async callback" />
        <DiagramNode tone="vbcs" title="Status to portal" subtitle="dashboard refresh" />
      </Diagram>
      <P>
        OIC receives the request, calls a Fusion REST endpoint to verify the PO and supplier, uses a
        lookup to map payment terms, stages the data to an FBDI file, and submits it to Fusion's ESS.
        On completion, it notifies the portal. You watch the whole thing in OIC Monitoring.
      </P>

      <H2>When to choose OIC vs. a plain API call</H2>
      <DataTable
        headers={["Use OIC when…", "Call Fusion REST directly when…"]}
        rows={[
          ["More than one system involved, or a sequence of calls", "Single, simple lookup from your front end"],
          ["You need transformation between formats", "Payloads already match"],
          ["You need retries, fault handling, or audit trail", "A fast, low-risk read"],
          ["Bulk loads via FBDI or scheduled syncs", "You want minimal moving parts"],
          ["Human approvals are involved", "You only need a CRUD operation"],
        ]}
      />

      <H2>Next steps</H2>
      <UL>
        <li>Dig into <a className="font-semibold text-sky-300 hover:underline" href="/oic/concepts">key concepts</a> — connections, agents, lookups, libraries.</li>
        <li>Understand the three styles in depth in <a className="font-semibold text-sky-300 hover:underline" href="/oic/styles">integration styles</a>.</li>
        <li>See the classic Fusion pattern in <a className="font-semibold text-sky-300 hover:underline" href="/oic/fbdi-integration">FBDI integration</a>.</li>
      </UL>
    </>
  );
}
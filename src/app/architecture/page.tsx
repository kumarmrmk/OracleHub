import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "End-to-End Architecture",
};

export default function ArchitecturePage() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture & Scenarios"
        title="The full Oracle stack, end to end"
        description="How Fusion Cloud, Oracle Integration Cloud, and VBCS fit into one enterprise landscape — who talks to whom, through which protocols, and what each layer is responsible for."
        breadcrumbs={[{ label: "Architecture & Scenarios" }, { label: "End-to-End Architecture" }]}
        updated="February 2025"
      />

      <H2>The big picture</H2>
      <P>
        Here is the whole landscape in one picture. The pattern holds for almost every Oracle
        deployment — the only things that change are the modules in play and which side originates
        the data.
      </P>
      <Diagram title="Logical architecture" className="mb-8">
        <DiagramNode tone="neutral" icon="🌐" title="External World" subtitle="suppliers · customers · banks · SaaS apps · ERP" />
        <Arrow />
        <DiagramNode tone="oic" icon="🔌" title="Oracle Integration Cloud" subtitle="adapters · orchestrations · schedules · processes" />
        <Arrow />
        <DiagramNode tone="fusion" icon="📦" title="Oracle Fusion Cloud" subtitle="ERP · SCM · HCM · CX (system of record)" />
        <Arrow />
        <DiagramNode tone="vbcs" icon="🎨" title="VBCS Apps" subtitle="portals · dashboards · self-service · extensions" />
      </Diagram>

      <P>
        Read it in layers:
      </P>
      <UL>
        <li>
          <strong>Bottom layer — Fusion:</strong> owns master data and transactions. Its only doors
          for data are REST/SOAP services, FBDI file loads, and BIP reports.
        </li>
        <li>
          <strong>Middle layer — OIC:</strong> owns the moving of data. It talks to Fusion using REST
          and FBDI, talks to the world using ~100+ adapters, and exposes clean REST endpoints to
          anything internal.
        </li>
        <li>
          <strong>Top layer — VBCS:</strong> owns the experience. It consumes OIC endpoints (and
          occasionally Fusion REST directly) and renders pages for humans.
        </li>
      </UL>

      <Callout type="info">
        The rule that keeps this architecture clean: <strong>VBCS asks, OIC does, Fusion stores.</strong>{" "}
        If the flow involves anything beyond a simple read, the logic belongs in OIC — not in your
        page's action chains.
      </Callout>

      <H2>Protocols between the layers</H2>
      <DataTable
        headers={["Leg", "Protocol", "Auth", "Notes"]}
        rows={[
          ["VBCS → OIC", "HTTPS REST (/ic/api/…invoke)", "OAuth 2.0 client credentials (or basic)", "OIC auto-generates the endpoint when you activate"],
          ["OIC → Fusion", "REST (fscmRestApi/hcmRestApi) or FBDI upload", "Basic / OAuth / message-protection", "FBDI is the bulk path; REST for quick calls"],
          ["OIC → External", "Adapter-specific (SFTP, SQL, SOAP, webhooks…)", "Per-adapter", "Uses agents when targets are on-premises"],
          ["VBCS → Fusion", "REST (fscmRestApi/hcmRestApi)", "Basic / OAuth / SSO", "Only for simple, read-mostly, low-latency calls"],
          ["VBCS → Business Objects", "Generated REST + DB tables", "App-level security", "Storage owned by VBCS, not Fusion"],
          ["VBCS → Process tasks", "OIC process REST / task API", "User session", "Human approvals surfaced in VBCS pages"],
        ]}
      />

      <H2>Anatomy of one end-to-end request</H2>
      <P>
        Follow a single action — "a supplier saves an expense request on the extranet portal" — all
        the way through the stack:
      </P>
      <Diagram title="Request trace: expense submission" className="mb-8">
        <DiagramNode tone="vbcs" title="1 · Supplier portal" subtitle="VBCS page; form bound to a page variable" />
        <Arrow label="POST JSON" />
        <DiagramNode tone="oic" title="2 · OIC integration" subtitle="validates supplier ID via Fusion REST" />
        <Arrow label="lookup + enrich" />
        <DiagramNode tone="fusion" title="3 · Fusion" subtitle="creates expense in draft status, schedules FBDI if bulk" />
        <Arrow label="task assigned" />
        <DiagramNode tone="oic" title="4 · Approval process" subtitle="manager approves in OIC Process Builder" />
        <Arrow label="status callback" />
        <DiagramNode tone="vbcs" title="5 · Portal update" subtitle="page refresh shows 'Approved'" />
      </Diagram>
      <P>
        Notice two important things: <strong>1)</strong> OIC absorbed all the branching and error
        handling so the portal stays simple, and <strong>2)</strong> the approval step is a
        <em>process</em> — OIC's Process Builder — not a hard-coded if/then in the page.
      </P>

      <H2>Identity and security across the stack</H2>
      <P>
        Each layer has its own notion of "who is calling," and they connect through federated
        identity:
      </P>
      <DataTable
        headers={["Layer", "Identity", "How authentication enters the layer"]}
        rows={[
          ["User (browser)", "Identity Cloud Service (IDCS) / OCI IAM", "SSO via SAML or OAuth authorization code"],
          ["VBCS app", "App role / user's IDCS groups", "Service connections carry OAuth tokens"],
          ["OIC", "OIC user / OAuth clients", "Inbound: OAuth client assertions; outbound: stored credentials"],
          ["Fusion", "Fusion user + job roles", "Basic auth, OAuth 2.0 (client credentials), or SSO session"],
        ]}
      />
      <Callout type="warning">
        Never store shared Fusion passwords in your VBCS page or in browser code. Credentials belong
        in OIC <a className="text-accent hover:underline" href="/oic/concepts">connections</a> or in
        OCI Secrets — the front end should only hold <em>tokens</em>.
      </Callout>

      <H2>Stateless vs. orchestrated: two sample topologies</H2>
      <H3>A. Simple & synchronous (VBCS → Fusion)</H3>
      <CodeBlock
        language="bash"
        filename="VBCS service connection -> Fusion REST"
        code={`GET https://<fusion>/fscmRestApi/resources/11.13.18.05/suppliers/{SupplierId}
Authorization: Basic <base64(user:pass)>
REST-Framework-Version: 11.13.18.05
→ 200 JSON (single supplier record)`}
      />
      <P>
        Use for lookups and light reads. No durable state, no orchestration, lowest latency.
      </P>
      <H3>B. Orchestrated & asynchronous (VBCS → OIC → Fusion)</H3>
      <CodeBlock
        language="bash"
        filename="VBCS service connection -> OIC endpoint"
        code={`POST https://<oic>/ic/api/integration/v1/integrations/ImportSupplier/activate/Invoke
Content-Type: application/vnd.oracle.resource+json
Authorization: Bearer <oauth-token>

{
  "request": {
    "supplierNumber": "SUP-10023",
    "payload": { "name": "Acme GmbH" }
  }
}
→ 202 Accepted (OIC processes asynchronously)`}
      />
      <P>
        Use for writes that need validation, enrichment, or a human approval before Fusion commits.
        The call returns quickly; the status round-trips afterward.
      </P>

      <H2>Anti-patterns that break this architecture</H2>
      <DataTable
        headers={["Anti-pattern", "Why it hurts", "Better approach"]}
        rows={[
          ["VBCS writing straight to Fusion for complex flows", "Business logic leaks into the UI; hard to fix and retest", "Put the flow in OIC; let the page call the endpoint"],
          ["OIC doing UI tasks like formatting dates in payloads", "Mix of concerns; brittle when UI changes", "Let VBCS format; OIC deals in canonical data"],
          ["Business objects storing the 'real' system-of-record data", "Two sources of truth drift apart", "Business objects = scratch/draft; real data lives in Fusion"],
          ["Hard-coding Fusion URLs and credentials in pages", "Breaks on refreshes; security hazard", "Service connections + environment settings"],
          ["Synchronous calls to slow bulk operations", "Users stare at spinners; timeouts", "Fire-and-forget, then poll a status endpoint"],
        ]}
      />

      <H2>Where to go next</H2>
      <UL>
        <li>
          See the pattern applied in the{" "}
          <a className="font-semibold text-fuchsia-300 hover:underline" href="/scenarios/po-approval">
            PO approval scenario
          </a>
          .
        </li>
        <li>
          Refresh any term in the{" "}
          <a className="font-semibold text-fuchsia-300 hover:underline" href="/glossary">glossary</a>.
        </li>
        <li>
          Drill into a layer:{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/rest-api">Fusion REST</a>,{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/styles">OIC styles</a>, or{" "}
          <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/connecting">VBCS connections</a>.
        </li>
      </UL>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "OIC Service Limits & Considerations",
};

export default function OicLimitationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Service limits & considerations"
        description="The enforced limits Oracle Integration puts on payloads, concurrency, flow duration, and data — from the official service-limits documentation — plus the design considerations that turn those limits from footnotes into architecture decisions."
        breadcrumbs={[{ label: "OIC" }, { label: "Service Limits & Considerations" }]}
        updated="February 2025"
        level="Advanced"
      />

      <P>
        Some numbers here are hard <strong>service limits</strong> enforced by the platform — you
        cannot raise them. Others are <strong>design limits</strong> (timeouts, loop bounds,
        character caps) you must architect around. The official reference is Oracle's{" "}
        <em>Service Limits</em> documentation; this page distills the numbers a designer actually
        hits, sorted by what breaks first.
      </P>

      <H2>Payload and file sizes — the fastest way to break a flow</H2>
      <P>
        Payload size is the limit people hit first, and the numbers vary a lot by adapter and by
        whether an endpoint is cloud-based, private, or behind the connectivity agent:
      </P>
      <DataTable
        headers={["Surface", "Limit", "Design note"]}
        rows={[
          ["REST trigger, structured payload (JSON/XML/HTML/YAML)", "100 MB", "Cap at ~100 MB; JSON fields over 20 MB can trigger a translation failure"],
          ["REST trigger, raw bytes (application/octet-stream)", "1 GB", "Use attachments / binary paths for big content"],
          ["REST trigger, multipart with attachments", "1 GB", "Multipart/form-data is the binary path"],
          ["SOAP trigger/invoke, structured XML", "100 MB", "Similar ceiling as REST"],
          ["Cloud endpoints (not agent)", "100 MB structured", "The standard modern API ceiling"],
          ["Connectivity-agent-based adapters", "50 MB request / 50 MB response (10 MB with compression)", "Agent tunnels cap far lower than cloud endpoints"],
          ["File adapter: read with schema", "50 MB (CSV grows when translated)", "Keep CSV files under 50 MB so post-translation stays under 50 MB"],
          ["File adapter: read/download without schema", "1 GB", "Big files bypass the transform ceiling"],
          ["FTP read/download", "1 GB; 100 MB via schema on cloud", "Sizing depends on endpoint type and schema"],
          ["Database invoke (stored proc / PureSQL)", "10 MB with schema", "Tiny compared to files — keep SQL results lean"],
          ["Database select", "100 MB public/private, 50 MB agent", "The read path is more generous than the procedure path"],
          ["Kafka / JMS / MQ produce-consume", "10 MB", "Messaging ceilings are the tightest"],
          ["AS2 adapter", "100 MB", "B2B document ceiling"],
          ["Salesforce bulk batch", "8 MB per batch (~10,000 records)", "Use bulk async for large data sets"],
          ["Stage-file: read entire file", "100 MB", "Beyond that use Read File in Segments"],
          ["Stage-file: encrypt/decrypt", "1 GB", "Encryption ceiling is generous"],
          ["OIC messaging message size", "10 MB", "The platform message envelope cap"],
        ]}
      />
      <Callout type="tip">
        A rule of thumb from these tables: <strong>structured, schema-driven payloads stay under 50–100
        MB; binary attachments and unparsed files can reach 1 GB; message queues top out at 10 MB.</strong>{" "}
        Design data movement with those three bands in mind.
      </Callout>

      <H2>Concurrency — what your message packs buy you</H2>
      <P>
        Concurrent request limits come from your <strong>license type</strong> times the number of{" "}
        <strong>message packs</strong>. This is a business decision, not just a technical one:
      </P>
      <DataTable
        headers={["Message packs", "Sync limit (included license)", "Sync limit (BYOL)", "Async limit (either)"]}
        rows={[
          ["1", "100", "400", "50 / 200"],
          ["2", "200", "800", "100 / 400"],
          ["3", "300", "1,200", "150 / 600"],
          ["4", "400", "1,600", "200 / 800"],
          ["5", "500", "2,000", "250 / 1,000"],
          ["10", "1,000", "2,000", "500 / 1,000"],
          ["20+", "2,000 (max)", "2,000 (max)", "1,000 (max)"],
        ]}
      />
      <UL>
        <li>Synchronous ceiling: <strong>2,000</strong> concurrent requests; async ceiling: <strong>1,000</strong>.</li>
        <li>Async requests beyond the limit are <strong>queued</strong>, not rejected — the queue depth depends on your assigned packs.</li>
        <li>Parallel action branches count toward the sync concurrency: a parallel action with three branches needs two extra slots.</li>
        <li>Additional packs raise concurrency — the lever for high-concurrency requirements is commercial, not code.</li>
      </UL>

      <H2>Flow execution — durations and deadlines</H2>
      <DataTable
        headers={["Type", "Limit", "What happens at the limit"]}
        rows={[
          ["Synchronous integration flow", "5 minutes / 300 s timeout", "HTTP 502; sync message timeout at 300 s"],
          ["Asynchronous integration flow", "6 hours", "Instance marked aborted (deadline timeout)"],
          ["Scheduled integration flow", "6 hours", "Instance terminated by Oracle Integration"],
          ["JavaScript execution", "15 seconds", "Flow errors if script runs longer"],
          ["XSLT execution", "120 seconds", "Flow errors if the transform runs longer"],
          ["Integration invocation depth", "16 nested invocations", "Recursive parent→child chains cap at 16"],
          ["Outbound adapter timeout", "5 min read / 5 min connect", "Agent-based connect timeout is 4 minutes"],
          ["Database adapter invoke (stored proc/PureSQL)", "240 seconds", "DB statement ceiling"],
        ]}
      />
      <Callout type="warning">
        If a flow <em>must</em> run past the hour mark, a single synchronous or async integration is
        the wrong shape — split the work, run it on a schedule, or queue chunks. The 6-hour ceiling
        on async and scheduled flows is not negotiable.
      </Callout>

      <H2>Loops, data, and strings</H2>
      <DataTable
        headers={["Resource", "Limit", "Implication"]}
        rows={[
          ["While loop iterations", "5,000", "Design loops to terminate well under this"],
          ["For-each loop iterations", "No limit", "The safe way to iterate large collections"],
          ["Tracked loop iterations per instance", "1,000", "Beyond this, tracking data is not captured"],
          ["String variable size", "No hard limit (warning above 10,000 chars)", "Bear in mind; subject to future cap"],
          ["Tracking variable value", "8,191 characters", "Keep tracking keys short"],
          ["Global variables", "20 per integration", "Rarely a constraint, but real"],
          ["Lookup columns", "100", "Very wide lookups hit this wall"],
          ["Lookup import", "100 MB", "Bulk lookup loading has a ceiling"],
          ["Lookup column length", "2,048 characters", "Keep codes short"],
          ["Activity stream payload", "32 KB per payload (25 MB total per instance)", "Bigger payloads move to Object Store"],
          ["Parallel action branches", "5", "Fan-out beyond 5 needs a different shape"],
          ["Notification email body", "500 KB body, ~2 MB total with attachments (default)", "Trim email bodies and attachments"],
          ["Outbound emails (rolling 24 h)", "10,000 (default method)", "Watch blast-heavy notification flows"],
        ]}
      />

      <H2>Volume and scale ceilings</H2>
      <DataTable
        headers={["Resource", "Limit", "Implication"]}
        rows={[
          ["Active integrations", "800", "Enough for almost any portfolio; archive old ones"],
          ["Event integrations (subscribe to events)", "50 per instance", "Event fans-out is bounded"],
          ["Tracking events per instance", "20,000 non-error · 30,000 with errors · 2,000 max errors recorded", "Beyond this events stop being recorded, not processed"],
          ["Instances returned per monitoring request", "50", "Page through monitoring"],
          ["Resubmissions per instance ID", "10", "Retry policies must respect this"],
          ["Integrations per project", "200", "Split projects as you scale"],
          ["Connections per project", "100", "Reuse connections across integrations"],
          ["Lookups / JS libraries / deployments / queues / events per project", "100 / 50 / 100 / 50 / 50", "Project hygiene matters at scale"],
          ["API Gateway integrations", "20 deployments × 50 routes ≈ 1,000 endpoints per gateway", "Plan API exposure across gateways"],
        ]}
      />

      <H2>Console and tenancy limits</H2>
      <DataTable
        headers={["Resource", "Limit", "Implication"]}
        rows={[
          ["Integration service instances per region", "200", "Provisioning budget per region, not per activated integration"],
          ["Private endpoints", "1 per service instance", "One private endpoint, one subnet each"],
          ["Custom endpoints", "1 per service instance", "One custom domain per instance"],
          ["Tenant/user UI requests", "100/s per tenant, 20/s per user", "Rapid UI scraping hits this"],
          ["Observability API", "50 requests/s", "Monitoring API is rate-limited"],
        ]}
      />

      <H2>Retention and recovery</H2>
      <DataTable
        headers={["Data", "Retention", "Design consequence"]}
        rows={[
          ["Production trace data", "32 days (default) · 184 days Healthcare", "Monitoring history is not permanent — archive reports you need"],
          ["Audit data", "8 days", "Audit forensics happen early"],
          ["Debug trace", "24 hours (auto-resets to Production)", "Never rely on debug data for post-incident review"],
          ["Recoverable failed instance window", "Until aborted, recovered, or past retention", "Resubmission is time-boxed"],
        ]}
      />

      <H2>Connectivity that is not what it seems</H2>
      <P>
        Beyond numbers, three adapter behaviors surprise designers:
      </P>
      <UL>
        <li>
          <strong>Database adapter is invoke-only</strong> — no trigger. Subscribe via polling or
          change-data-capture instead.
        </li>
        <li>
          <strong>No direct SQL to the Fusion database</strong> — Fusion's DB is forbidden to
          customers; read Fusion data through its services (see{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/fusion/overview">
            Fusion overview
          </a>
          ).
        </li>
        <li>
          <strong>Agent paths are far smaller</strong> — 50 MB (agent) vs 100 MB (cloud) for the
          same structured payload. Know which path you are on.
        </li>
      </UL>

      <H2>When OIC is the wrong tool</H2>
      <DataTable
        headers={["Requirement", "Which limit bites", "Consider instead"]}
        rows={[
          ["Very high-volume streaming", "10 MB messaging cap, per-message overhead", "OCI Streaming / Functions with a lean consumer"],
          ["Sub-second low-latency API", "Synchronous flow layer is heavier than a direct call", "API Gateway in front of a function/service"],
          ["Heavy CPU-bound transformation", "XSLT 120 s / JavaScript 15 s ceilings", "OCI Functions, Autonomous DB, dedicated processor"],
          ["Flows that must run 6+ hours", "Async/scheduled 6 h deadline", "Split work, schedule, or chunk"],
          ["Persistent message queue consumers", "OIC is a flow engine, not a broker", "MQ / Streaming / Kafka, with OIC subscribing"],
        ]}
      />
      <Callout type="info">
        The decision rule stands: OIC owns <strong>orchestrated, governed flows</strong> between
        APIs and files. When the workload becomes bulk data engineering, streaming, or hosting, hand
        it to an OCI service and keep OIC on orchestration. These limits are the reason that rule
        exists — design with them, and your flows fail in review, not in production.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Revisit the strengths you are designing around in <a className="font-semibold text-sky-300 hover:underline" href="/oic/overview">OIC overview</a>.</li>
        <li>Confirm which edition and tenancy you are on in <a className="font-semibold text-sky-300 hover:underline" href="/oic/gen3">Gen 3 orientation</a>.</li>
        <li>Keep the healthy patterns alive in <a className="font-semibold text-sky-300 hover:underline" href="/oic/monitoring">monitoring</a>.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Error Handling & Monitoring",
};

export default function OicErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Error handling and monitoring in OIC"
        description="Why integrations fail, how to build fault handling into a flow, how to surface Fusion business errors cleanly, and how to use OIC Monitoring, resubmission, alerting, and retries."
        breadcrumbs={[{ label: "OIC" }, { label: "Error Handling & Monitoring" }]}
        updated="February 2025"
      />

      <P>
        A healthy integration portfolio is not one where nothing ever fails — it is one where{" "}
        <strong>failures are visible, isolated, and recoverable</strong>. OIC gives you both the
        designer-side controls (fault handlers, retries, routing) and the runtime visibility
        (Monitoring, alerts, resubmission).
      </P>

      <H2>Why errors happen in integrations</H2>
      <P>
        Integrations fail for a handful of recurring reasons. Knowing the category determines the
        remedy:
      </P>
      <DataTable
        headers={["Category", "Typical cause", "Where it shows up"]}
        rows={[
          ["Network / connectivity", "Target down, DNS, firewall, agent offline", "Connection timeout on the invoke"],
          ["Authentication", "Expired credential, rotated secret, revoked OAuth client", "401 / 403 on connect"],
          ["Schema drift", "Fusion changed an API field or FBDI template", "Mapping failure or row-level validation error"],
          ["Data validation", "Payload violates business rules (wrong amount, missing reference)", "Fusion business errors, jobsStatus FAILED"],
          ["Timeout", "Synchronous call that outlives the budget", "500/504, instance stuck"],
          ["Contract mismatch", "Caller sends an old envelope shape", "Mapping errors at the trigger"],
        ]}
      />
      <Callout type="info">
        Classify before you code. <strong>Transient</strong> failures (network blips, timeouts)
        deserve retries; <strong>permanent</strong> ones (schema drift, bad data) deserve alerts and
        a human — retrying those only creates duplicate mail.
      </Callout>

      <H2>Fault handling in the integration</H2>
      <P>
        Every invoke in the designer can get a <strong>fault handler</strong>: a branch that runs
        when the call fails, instead of the whole integration dying. Use it to diagnose, retry, and
        return a clean answer:
      </P>
      <UL>
        <li>
          <strong>Retry for transient errors:</strong> add a bounded retry with backoff on the invoke
          when the error is connectivity/timeout-class.
        </li>
        <li>
          <strong>Switch for error routing:</strong> inside the fault handler, branch on the fault
          code to decide whether to retry, resubmit, or escalate.
        </li>
        <li>
          <strong>Map the error to a response:</strong> translate the internal fault into a
          structured JSON the caller can parse — not a raw stack trace.
        </li>
        <li>
          <strong>Poison-message handling:</strong> when a payload keeps failing, park it (log,
          quarantine file, or a correction process) rather than retrying forever.
        </li>
      </UL>
      <CodeBlock
        language="json"
        filename="Structured fault response returned to the caller"
        code={`{
  "success": false,
  "errorCode": "BIP1100",
  "message": "Invoice total does not match the PO reference amount",
  "details": [
    { "field": "InvoiceTotal", "expected": 12500.00, "received": 12100.00 }
  ],
  "instanceId": "3100000987654"
}`}
      />
      <P>
        The caller logs <K>instanceId</K> and <K>errorCode</K> and can look the instance up in
        Monitoring without reading logs.
      </P>

      <H2>Business errors from Fusion</H2>
      <P>
        The trickiest failures are the ones where <em>everything worked and Fusion still said
        no</em>. When a REST create or an FBDI load rejects data — invoice total mismatch, missing
        reference, invalid combination — Fusion returns a <strong>business error</strong>, often as
        an attachment or a row in the import <K>businessErrors</K> file.
      </P>
      <UL>
        <li>
          <strong>Distinguish technical from business:</strong> a business error is a completed
          handshake with a data problem; it must be reported cleanly, not blindly retried.
        </li>
        <li>
          <strong>Capture the error text</strong> from the response and record it on the instance so
          Monitoring shows the reason at a glance.
        </li>
        <li>
          For FBDI, <strong>download and preserve the businessErrors file</strong>; fix the affected
          rows and re-import only them.
        </li>
      </UL>
      <Callout type="warning">
        Treat business errors as <strong>data incidents</strong>, not code bugs. An automatic retry
        will reproduce them forever. Route them to a correction path (a process task or a
        quarantine bucket) where a human fixes the root data and re-submits once.
      </Callout>

      <H2>Monitoring &amp; dashboards</H2>
      <P>
        OIC Monitoring is the operations console for everything you've deployed:
      </P>
      <DataTable
        headers={["View", "What it tells you", "Typical action"]}
        rows={[
          ["Instances by integration", "Every run, its status, duration, and error text", "Find the failing integration, open the instance"],
          ["Status summary", "Success / failure counts across the portfolio", "Spot the hot spot for the day"],
          ["Errors", "Fault messages and the offending activity", "Read errorCode + business error text"],
          ["Resubmission", "Fix the payload and rerun an instance", "Correct data, resubmit the same run"],
          ["Instance tracking fields", "Your business keys (PO, invoice) on each instance", "Find a run by invoice number, not by time"],
        ]}
      />
      <UL>
        <li>
          <strong>Resubmission</strong> is the killer feature: pick a failed instance, edit the
          request payload, and rerun it without rebuilding the integration.
        </li>
        <li>
          Set <strong>tracking fields</strong> (e.g., invoice number) on your integration so you can
          search by business key.
        </li>
        <li>
          Dashboard trends help capacity planning: growing durations mean a target is slowing down
          before it starts failing.
        </li>
      </UL>

      <H2>Alerting &amp; audit</H2>
      <P>
        Monitoring is reactive — alerts make it proactive. OIC can raise an <strong>integration
        error event</strong> on failure, and OIC lets you subscribe event subscribers (email, custom
        REST, Slack-style webhooks) to it:
      </P>
      <UL>
        <li>
          <strong>Integration errors → event:</strong> a failed instance emits an event with
          integration code, instance ID, and error text.
        </li>
        <li>
          <strong>Audit logs</strong> capture activation, deactivation, and payload changes — keep
          them for compliance and post-mortems.
        </li>
        <li>
          <strong>Agent down alerts:</strong> watch OPC connectivity alerts; an offline agent fails
          every agent-based integration silently.
        </li>
        <li>
          Correlate: your alert should carry <K>instanceId</K> so support can jump straight into
          Monitoring.
        </li>
      </UL>

      <H2>Retry strategy best practices</H2>
      <P>
        Retries are a safety net, and the net must be designed so it doesn't double your writes:
      </P>
      <UL>
        <li>
          <strong>Idempotency for Fusion:</strong> where possible key the write on a business
          reference (e.g., <K>InvoiceNumber</K>) or check-before-create so a retry updates rather
          than duplicates.
        </li>
        <li>
          <strong>Exponential backoff:</strong> on transient errors, back off 5s → 25s → 125s
          instead of hammering at fixed intervals.
        </li>
        <li>
          <strong>Bounded retries:</strong> cap the attempt count; after the cap, surface the error
          through the fault path, not more retries.
        </li>
        <li>
          <strong>Retry the right thing:</strong> re-request the token if the fault is 401, retry the
          call if it is 503, and never retry a 4xx business validation.
        </li>
      </UL>
      <Callout type="tip">
        Build a small <strong>reusable "retry invoke" pattern</strong> (fault handler + backoff +
        cap) and reuse it across integrations. Consistent retry behavior makes the whole portfolio
        predictable — and much easier to tune when one endpoint turns flaky.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>
          Refresh the building blocks that fail and recover:{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/concepts">
            key concepts
          </a>
          .
        </li>
        <li>
          Design faults into the flow shape with{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/styles">
            integration styles
          </a>
          .
        </li>
        <li>
          Handle Fusion's own rejections in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/fbdi-integration">
            FBDI integration
          </a>
          .
        </li>
      </UL>
    </>
  );
}
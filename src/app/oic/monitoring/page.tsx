import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "OIC Monitoring & Tracking",
};

export default function OicMonitoringPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Monitoring, tracking & observability"
        description="Every run of an integration is an instance. This page is about seeing those instances clearly: tracking fields so you search by the business key you already know, dashboards and traces for diagnosis, and message inspection when something went wrong mid-payload."
        breadcrumbs={[{ label: "OIC" }, { label: "Monitoring & Tracking" }]}
        updated="February 2025"
        level="Module"
      />

      <P>
        The <strong>Monitoring</strong> area turns the runtime into a searchable record of every
        execution. The difference between "we can find it" and "we can't see anything" is decided
        before a flow ever runs — by the <strong>tracking fields</strong> you define.
      </P>

      <H2>The unit of visibility: the instance</H2>
      <P>
        Every time a trigger fires, OIC records an <strong>instance</strong> with a lifecycle.
        Monitoring lists instances; you filter and open one to inspect every step it took.
      </P>
      <Diagram title="Instance lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Received" subtitle="trigger fired" />
        <Arrow label="processing" />
        <DiagramNode tone="oic" title="In-progress" subtitle="stages running" />
        <Arrow label="ends" />
        <DiagramNode tone="success" title="Completed" subtitle="finished cleanly" />
        <Arrow label="or" />
        <DiagramNode tone="warning" title="Aborted / Failed" subtitle="fault raised" />
      </Diagram>
      <Callout type="info">
        Instance status is what your ops team monitors. The{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/errors">error handling page</a> tells
        you how to fix failures; this page tells you how to <em>see</em> them first.
      </Callout>

      <H2>Tracking fields — visibility by business key</H2>
      <P>
        A tracking field is a value from the payload you declare as a searchable key. If you track{" "}
        <K>PO_Number</K>, the monitoring search box accepts that PO number and lists every instance
        that touched it.
      </P>
      <UL>
        <li>
          Track the <strong>business identifier</strong> your callers already use — invoice number,
          PO number, employee ID — never an internal OIC ID.
        </li>
        <li>
          A flow can carry <strong>several</strong> tracking fields; keep it to the two or three an
          operator would actually type.
        </li>
        <li>
          Assign the value <strong>early</strong> in the flow, before the first invoke, so a failed
          request is still searchable.
        </li>
      </UL>
      <Callout type="tip">
        Tracking fields are cheap to add and expensive to retrofit. Every new integration should
        define at least one before its first go-live.
      </Callout>

      <H2>Flow traces</H2>
      <P>
        Open an instance and OIC shows its <strong>flow trace</strong> — the ordered list of stages,
        each with duration, status, and payload snapshots. This is the fastest diagnostic tool:
      </P>
      <UL>
        <li>
          <strong>Which stage failed</strong> — the trace highlights it; the stage's fault handler
          (if any) shows what it decided.
        </li>
        <li>
          <strong>Where time went</strong> — a long invoke reveals a slow target; a long map
          suggests a heavy transform.
        </li>
        <li>
          <strong>What was sent</strong> — inspect the request/response payload at any stage.
        </li>
      </UL>
      <Callout type="warning">
        Payload inspection can include sensitive data — limit the <strong>log / tracing</strong>
        level to what you need and review access to Monitoring accordingly. See
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/security"> security</a>.
      </Callout>

      <H2>Message inspection & resubmission</H2>
      <P>
        When an instance failed, the question is almost always "what exactly did the target receive?"
        Message inspection lets you open the <em>messages</em> exchanged at each connection — request
        body, response, status code. Once the cause is clear, a properly built integration can be{" "}
        <strong>resubmitted</strong> after the fix without re-entering data:
      </P>
      <DataTable
        headers={["Capability", "What it answers", "How you act on it"]}
        rows={[
          ["Instance search", "Did a specific business key run?", "Filter by tracking field / status / date"],
          ["Flow trace", "Which step failed and why?", "Open the stage, read the fault"],
          ["Message inspection", "What did we actually send/receive?", "Check request vs response payloads"],
          ["Resubmission", "Can this finish now?", "Fix the cause, resubmit the instance"],
        ]}
      />

      <H2>Dashboards, alerts & reports</H2>
      <UL>
        <li>
          <strong>Dashboards</strong> — at-a-glance counters: completed, aborted, and faulty
          instances per integration over time.
        </li>
        <li>
          <strong>Alerts</strong> — notify on fault thresholds (e.g., more than N failed instances
          in an hour) to Slack or email.
        </li>
        <li>
          <strong>Reports</strong> — packaged or custom reports on instance outcomes, volumes, and
          durations, for weekly operations review.
        </li>
      </UL>
      <Callout type="example" title="Worked example: an overnight invoice load fails">
        <p className="mb-2"><strong>Find:</strong> ops searches Monitoring by the supplier's batch reference and sees the scheduled instance in <K>Aborted</K>.</p>
        <p className="mb-2"><strong>Traces:</strong> the flow trace shows the Fusion invoke returned 403 — not the map.</p>
        <p className="mb-2"><strong>Inspect:</strong> message inspection shows the exact token error → the client secret was rotated (see <a className="font-semibold text-sky-300 hover:underline" href="/oic/security">security</a>).</p>
        <p className="mb-0"><strong>Recover:</strong> update the connection, resubmit the instance, verify it completes, and set an alert so the next rotation never waits for a user.</p>
      </Callout>

      <H2>Observability best practices</H2>
      <UL>
        <li>Define tracking fields on day one; search is only as good as the keys you track.</li>
        <li>Keep a log stage at decision points so traces answer "why this branch?" without opening payloads.</li>
        <li>Alert on the business symptom (missed invoices), not just on instance counts.</li>
        <li>Package the dashboards/reports with the integration so a new environment inherits the same views.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Fix what you see in <a className="font-semibold text-sky-300 hover:underline" href="/oic/errors">error handling</a>.</li>
        <li>Track the right keys — build them into the flow in <a className="font-semibold text-sky-300 hover:underline" href="/oic/orchestration">orchestration</a>.</li>
        <li>Promote the same visibility into production in <a className="font-semibold text-sky-300 hover:underline" href="/oic/deployment">deployment</a>.</li>
      </UL>
    </>
  );
}
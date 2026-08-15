import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "OIC Integration Styles",
};

export default function OicStylesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Integration styles and when to use each"
        description="Every OIC integration is app-driven, scheduled, or event-driven. Understand the three styles, how to build each one, and how to pick the right trigger for your use case."
        breadcrumbs={[{ label: "OIC" }, { label: "Integration Styles" }]}
        updated="February 2025"
      />

      <P>
        The single most important design decision in OIC is <strong>what starts the flow</strong>.
        Everything downstream — the mapping strategy, the fault handling, the way other systems call
        back — follows from the trigger you choose.
      </P>

      <H2>The three integration styles</H2>
      <P>
        OIC categorizes integrations by trigger into three styles. Most teams mix all three in one
        portfolio.
      </P>
      <DataTable
        headers={["Style", "Trigger", "When to use", "Example"]}
        rows={[
          ["App-Driven / Orchestration", "An incoming request (REST, SOAP, file, DB event)", "A caller waits for a result; you orchestrate multiple steps", "A PO arrives from a portal; OIC validates and imports it into Fusion"],
          ["Data-Driven / Scheduled", "A time-based schedule (ESS-like job)", "Bulk, periodic, no one waiting on the response", "Every night, GET changed suppliers from Fusion REST and sync downstream"],
          ["Event-Driven", "A change notification pushed from a system", "React in real time to something that already happened", "Fusion fires a business event when a PO is approved; OIC notifies the next system"],
        ]}
      />
      <Callout type="info">
        The styles are not a framework you have to fit into — they are a <strong>vocabulary</strong>.
        The same integration can even be cloned and activated with a different trigger if the
        requirement changes.
      </Callout>

      <H2>Building an app-driven integration</H2>
      <P>
        The app-driven (request/response) style is the workhorse: a caller sends data and expects a
        structured answer. In the designer the flow is always the same shape:
      </P>
      <Diagram title="App-driven (orchestration) anatomy" className="mb-8">
        <DiagramNode tone="neutral" icon="🌐" title="External" subtitle="portal · app · scheduler · webhook" />
        <Arrow label="POST /invoke" />
        <DiagramNode tone="oic" title="Trigger" subtitle="REST / SOAP / file adapter" />
        <Arrow label="request payload" />
        <DiagramNode tone="oic" title="Map" subtitle="validate · transform · lookup" />
        <Arrow label="canonical form" />
        <DiagramNode tone="oic" title="Invoke Fusion" subtitle="file/SOAP invocation to a Fusion resource" />
        <Arrow label="result or fault" />
        <DiagramNode tone="vbcs" title="Response" subtitle="200 result · 4xx business error" />
      </Diagram>
      <H3>Synchronous vs asynchronous</H3>
      <P>
        Deciding whether the caller should wait is the real architectural choice:
      </P>
      <UL>
        <li>
          <strong>Synchronous</strong> — the integration runs to completion, then returns the result
          in the HTTP response. Use it when the caller needs a value immediately (a lookup, a
          single-record create whose ID informs the next step).
        </li>
        <li>
          <strong>Asynchronous</strong> — the trigger takes the request, returns{" "}
          <K>202 Accepted</K> right away, and the flow continues in the background. Use it for slow
          or batched work (FBDI loads, multi-step orchestrations). Callers poll a status endpoint or
          receive a callback instead of blocking.
        </li>
      </UL>
      <Callout type="tip">
        A common anti-pattern is making an asynchronous workload synchronous "just to be simple."
        The caller times out at ~90 seconds; big imports fail. If the work can take longer than a
        few seconds, <strong>return 202 and poll</strong>.
      </Callout>

      <H2>Scheduled integrations</H2>
      <P>
        A scheduled integration has <em>no incoming request</em>. Instead, OIC's enterprise
        scheduler wakes it up on a cron-like schedule — every hour, nightly, the first Monday of the
        month — and the flow performs the work end to end on its own.
      </P>
      <UL>
        <li>
          <strong>Pull what changed:</strong> the classic pattern is to query the source with a
          date-range predicate (e.g., Fusion REST with <K>lastUpdateDate &gt; :lastRun</K>), then
          upsert the delta into the target.
        </li>
        <li>
          <strong>Operate in batches:</strong> read a page, process it, remember a bookmark, and
          resume next run. Never reprocess the whole table.
        </li>
        <li>
          <strong>Schedule granularity:</strong> OIC supports schedules down to minute-level repeats
          plus a scheduler service similar in spirit to Fusion's Enterprise Scheduler for calendar
          (e.g., monthly on day 5) patterns.
        </li>
        <li>
          <strong>Overlap guard:</strong> if a run is still going when the next one is due, OIC you
          can signal the previous deployment so you know a run is late — monitor duration, not just
          success.
        </li>
      </UL>
      <P>
        Scheduled integrations are the natural home for <strong>bulk data movement</strong> and for
        "reconciliation" flows that correct what real-time styles missed.
      </P>

      <H2>Event-driven with Fusion business events</H2>
      <P>
        Fusion publishes <strong>Business Objects events</strong> when the state of a business object
        changes — a PO is approved, an invoice is rejected, a worker is hired. OIC can subscribe to
        those events and react the instant they fire, with the event payload delivered directly into
        the integration.
      </P>
      <UL>
        <li>
          The <strong>trigger</strong> is the Fusion Applications (event) adapter configured to
          consume a specific business event; no polling server side needed.
        </li>
        <li>
          Because it is push — not poll — latency is <strong>real-time</strong>, and the downstream
          systems get notified only when something actually changed.
        </li>
        <li>
          Events carry a payload and event context (who, when, which object). Map that payload
          straight into your downstream calls.
        </li>
      </UL>
      <Callout type="example">
        Example: a supplier invoice is approved in Fusion. The <strong>"Supplier Invoice Approved"</strong>{" "}
        business event fires, OIC picks up the payload, looks up the invoice in Fusion REST to
        enrich it, and posts the payment-window data to the bank portal. No polling, no schedule —
        the event is the schedule.
      </Callout>

      <H2>Choosing the right style</H2>
      <P>
        When a requirement arrives, classify it with these questions before opening the designer:
      </P>
      <UL>
        <li>
          Is someone <strong>waiting on the result</strong>, and does it involve more than a single
          call? → <strong>App-driven</strong>.
        </li>
        <li>
          Is it <strong>bulk</strong>, <strong>nightly</strong>, or "process everything since
          midnight"? → <strong>Scheduled</strong>.
        </li>
        <li>
          Is it a <strong>notification of change</strong> ("when X happens, tell Y")? →{" "}
          <strong>Event-driven</strong>.
        </li>
      </UL>
      <Callout type="tip">
        Two rules cover most decisions. <strong>Writes to Fusion that need orchestration — use
        app-driven.</strong> <strong>Bulk window loads — use scheduled.</strong> If a write also
        needs human approval, hand the request to a process (see{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/process">
          process automation
        </a>
        ) and let the process continue the flow when approved.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>
          Refresh the grounding vocabulary in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/concepts">
            key concepts
          </a>
          .
        </li>
        <li>
          Apply the app-driven style to bulk Fusion loads in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/fbdi-integration">
            FBDI integration
          </a>
          .
        </li>
        <li>
          Expose a style over a clean API in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/rest">
            REST &amp; RESTful APIs
          </a>
          .
        </li>
      </UL>
    </>
  );
}
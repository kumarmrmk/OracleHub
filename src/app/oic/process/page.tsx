import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "OIC Process Automation",
};

export default function OicProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Process automation with OIC"
        description="Model human approval workflows in OIC's Process Builder: BPMN-style components, approval patterns, data flowing through task assignments, and how processes talk to integrations and VBCS pages."
        breadcrumbs={[{ label: "OIC" }, { label: "Process Automation" }]}
        updated="February 2025"
      />

      <P>
        Integrations move data; <strong>processes move decisions</strong>. OIC's Process Builder
        models <em>human-in-the-loop</em> workflows — approvals, reviews, exception handling — as
        diagrams that route a payload from person to person with an audit trail.
      </P>

      <H2>OIC Process Builder</H2>
      <P>
        You draw a process like a flowchart (BPMN-flavored): a <strong>start event</strong>, a chain
        of <strong>user tasks</strong> assigned to people or roles, <strong>service tasks</strong>{" "}
        that call out to REST/integrations, <strong>gateways</strong> that branch the flow, and an{" "}
        <strong>end event</strong>.
      </P>
      <Diagram title="Anatomy of a process" className="mb-8">
        <DiagramNode tone="oic" title="Start event" subtitle="restService · message · schedule" />
        <Arrow label="payload" />
        <DiagramNode tone="oic" title="Business rule / decision" subtitle="route by amount, role, region" />
        <Arrow label="approve path" />
        <DiagramNode tone="oic" title="User task" subtitle="form rendered in VBCS, assignee approves" />
        <Arrow label="decision" />
        <DiagramNode tone="oic" title="Service task" subtitle="call integration / Fusion REST" />
        <Arrow label="result" />
        <DiagramNode tone="oic" title="End event" subtitle="instance closes with outcome" />
      </Diagram>
      <P>
        Every process lives in a <strong>process application</strong> (a project-like container), and
        each task keeps an <strong>instance and audit history</strong> — who saw it, when, and what
        they decided.
      </P>

      <H2>Process components</H2>
      <DataTable
        headers={["Component", "Purpose", "Typical configuration"]}
        rows={[
          ["Start event", "Receives the initial payload", "REST service, JMS/message, or a scheduled start"],
          ["User task", "Shows work to a human, waits for a decision", "Accepts payload via data associations; assignee/role"],
          ["Service task (REST)", "Calls an integration or REST endpoint mid-flow", "OIC integration invoke or any REST service"],
          ["Business rule", "Evaluates data and returns a decision", "Route by approval amount, region, or product line"],
          ["Decision / gateway", "Branches the diagram", "EXCLUSIVE for the old approver's verdict"],
          ["Approval task", "Structured single/multi-approver task", "Sequential or parallel routing, due dates"],
          ["End event", "Closes the instance", "Optionally throws the result back to the caller"],
        ]}
      />
      <Callout type="info">
        The distinction between a <strong>task</strong> and a <strong>decision</strong> is worth
        internalizing: tasks involve people; decisions are automatic. A business rule can pre-filter
        <em>"no approval needed"</em> and skip straight to the end, saving your approvers time.
      </Callout>

      <H2>Approval patterns</H2>
      <P>
        Most processes are a few approval patterns composed together. The <strong>data
        associations</strong> connecting tasks are what carry the REST payload along the diagram —
        map request fields into the task's temporary variables, and map the approver's answer back
        out.
      </P>
      <UL>
        <li>
          <strong>Single approver:</strong> one person or role sees the task; their approve/reject
          ends the branch.
        </li>
        <li>
          <strong>Routing by amount:</strong> a business rule checks the request total — under $5,000
          auto-approves, between $5k and $50k goes to the manager, above $50k escalates to finance +
          director.
        </li>
        <li>
          <strong>Sequential approvals:</strong> task B waits for task A (e.g., manager first, then
          finance).
        </li>
        <li>
          <strong>Parallel approvals:</strong> several groups review the same payload at once; the
          gateway re-combines their verdicts (all-approved vs. any-rejected).
        </li>
      </UL>
      <Callout type="tip">
        Keep the process <strong>data-light</strong>: pass a reference (an ID) plus the fields the
        reviewers actually need, and let a service task fetch the rest from Fusion REST when the
        decision is made. Reviewers see a clean form, and you avoid stale copies of large payloads.
      </Callout>

      <H2>Integrating processes with integrations &amp; pages</H2>
      <P>
        Processes expose their start and task endpoints over REST, which is exactly how VBCS surfaces
        an inbox:
      </P>
      <CodeBlock
        language="bash"
        filename="List my open tasks"
        code={`curl -X GET "https://<oic-host>/ic/api/bpm/v1/ws/workflow/task/list" \\
  -H "Authorization: Bearer <user-or-app-token>"

# → 200  {
#   "taskList": [
#     { "taskId": "90010", "title": "Approve PO 300012", "state": "ASSIGNED" }
#   ]
# }`}
      />
      <UL>
        <li>
          A VBCS page binds a table to this <strong>task list</strong> service, so approvers get an
          online "approvals" dashboard built from the same REST task API.
        </li>
        <li>
          The process can also brake on an <strong>integration call</strong>: after approval, a
          service task invokes your OIC integration that performs the Fusion write.
        </li>
        <li>
          Call the process start from an integration's fault path too — e.g., "FBDI row rejected →
          start a correction process for a human."
        </li>
      </UL>

      <H2>Groovy &amp; scripting</H2>
      <P>
        Beyond mapping, process tasks can run embedded <strong>Groovy</strong> snippets — useful for
        enrichment (computing an approver from a rule), validation, and light formatting. Groovy can
        read process variables and call out to REST:
      </P>
      <UL>
        <li>
          <strong>Enrichment:</strong> set the assignee from a participant table before the user
          task.
        </li>
        <li>
          <strong>Logic you don't want as a gateway:</strong> a one-line computation that avoids
          adding a decision node.
        </li>
        <li>
          Keep Groovy <strong>small and side-effect-free</strong>; heavy orchestration belongs in the
          integration, not a script.
        </li>
      </UL>

      <H2>When process vs. integration</H2>
      <P>
        The overlap confuses new OIC users. Use the decision differently from the overflow reasoning:
      </P>
      <Callout type="example">
        <strong>Orchestrate-in-integration</strong> when the flow is automatic — transform, call,{" "}
        no human ever looks at it. <strong>Approve-in-process</strong> when a human must review and{" "}
        <em>decide</em>. The robust pattern combines them: the integration does the work and hands
        the interesting cases to a process; the process, on approval, invokes the integration again
        to complete the write. Each tool does what it does best.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>
          Ground the integration side in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/concepts">
            key concepts
          </a>
          .
        </li>
        <li>
          Learn how a process hands work off via{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/rest">
            REST endpoints
          </a>
          .
        </li>
        <li>
          Watch failing processes and their instances in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/errors">
            error handling and monitoring
          </a>
          .
        </li>
      </UL>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Approvals & Workflow",
};

export default function ApprovalsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Approvals & Workflow"
        description="Every Fusion business flow that needs a sign-off — AP invoices, purchase orders, expense reports, project spend — runs on Oracle BPM Workflow. This page explains approval rules, approval groups, the worklist, routing, and Groovy conditions."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Approvals & Workflow" }]}
        updated="February 2025"
      />

      <H2>What runs on the approval engine</H2>
      <DataTable
        headers={["Flow", "What is approved", "Typical routing"]}
        rows={[
          ["AP invoice", "Supplier invoices above a threshold", "Amount tier → Finance Manager → CFO"],
          ["Purchase order", "Buying documents", "Buyer → Category Manager → (large) Director"],
          ["Expense report", "Employee claims", "Employee's Manager → Finance"],
          ["Project spend", "Project costs / change requests", "Project Manager → Portfolio Manager"],
          ["Payment", "Payment batches / manual payments", "Payables Specialist → Treasury Manager"],
        ]}
      />

      <H2>How an approval flows</H2>
      <P>
        A transaction submits to the workflow, a <strong>task</strong> is created in the approver's
        worklist, and the task routes through the configured path until it ends.
      </P>
      <Diagram title="Approval lifecycle" className="mb-8">
        <DiagramNode tone="neutral" title="Submit" subtitle="transaction reaches approval threshold" />
        <Arrow label="BPM" />
        <DiagramNode tone="fusion" title="Task in worklist" subtitle="notification + task in Inbox" />
        <Arrow label="approve" />
        <DiagramNode tone="success" title="Next approver or done" subtitle="serial or parallel" />
        <Arrow label="reject" />
        <DiagramNode tone="warning" title="Returned / Rejected" subtitle="resubmit after change" />
      </Diagram>

      <H2>Core concepts</H2>
      <DataTable
        headers={["Concept", "What it is"]}
        rows={[
          ["Approval rule", "A condition that decides who approves and in what order (by amount, attribute, org, territory)"],
          ["Approval group", "A named list of users/roles; the group's routing (serial / parallel, any / all) defines the task path"],
          ["Worklist (Inbox)", "Where tasks appear: 'My Worklist' / Notifications page; approvers act, delegate, or add comments"],
          ["Routing", "Serial (one after another) vs parallel (multiple at once); 'any approver' vs 'all approvers'"],
          ["Groovy condition", "A Groovy expression on approval attributes that returns the next step (e.g. route by amount or manager)"],
          ["Delegation / On-behalf", "An approver assigns the task to someone else to act"],
          ["Status", "Waiting on Approver · In Progress · Approved · Rejected · Withdrawn · Resubmitted"],
          ["Escalation", "Automatic reminder/forward if a task waits too long"],
        ]}
      />

      <H2>Approval groups & routing</H2>
      <P>
        Groups are the workhorses. A group holds <strong>members</strong> (users or roles) and
        defines how they vote:
      </P>
      <DataTable
        headers={["Group type", "Behavior", "Used for"]}
        rows={[
          ["Serial", "Members act one after the other, in order", "Tiered sign-off (manager → director)"],
          ["Parallel — all", "Every member must approve", "Compliance sign-offs"],
          ["Parallel — any", "The first member to act decides", "Fast-track approvals"],
          ["List-based", "A pre-approved list of users", "Project teams, cost centers"],
        ]}
      />

      <H2>Groovy conditions</H2>
      <P>
        Business rules can route on any <strong>approval attribute</strong> using Groovy. The result
        returns which group/role handles the next step:
      </P>
      <CodeBlock
        language="groovy"
        filename="approval-rule.groovy"
        code={`import oracle.apps.fnd.approvals.core.ApprovalProcessContext

// Illustrative rule on an AP invoice approval
if (amount >= 50000) {
    return "Finance Director"
}
if (amount >= 10000) {
    return "Department Manager"
}
return "Auto-approve"`}
      />
      <Callout type="info">
        The attribute names (here <K>amount</K>) come from the transaction's workflow attributes —
        check the approval rule setup to see which are available for the flow you're configuring.
      </Callout>

      <H2>Where approval data lives</H2>
      <P>
        Tasks are BPM instances. The commonly queried tables (with the usual caveat to verify against
        your release):
      </P>
      <DataTable
        headers={["Table", "Holds", "Key columns"]}
        rows={[
          [<K key="t1">WFTASK_PV</K>, "Active workflow tasks", "TASK_ID, TITLE, STATUS, ASSIGNEE, PROCESS_INSTANCE_ID"],
          [<K key="t2">WFTASK_HISTORY_PV</K>, "Task history (actions taken)", "TASK_ID, ACTION, ACTION_DATE, ACTIONED_BY"],
          [<K key="t3">WF_PROCESS_INSTANCES</K>, "Workflow process instances", "PROCESS_INSTANCE_ID, STATUS, START_DATE, END_DATE"],
        ]}
      />
      <Callout type="tip">
        For integrations, act on tasks through the worklist REST/service rather than the tables, and
        never rely on table-level access for approvals.
      </Callout>

      <H2>Integration notes</H2>
      <UL>
        <li>Documents submitted to approval are <strong>not final</strong> until the last task
        approves — always check the approval status before assuming a record is posted.</li>
        <li>A created AP invoice may sit in <em>Requires Re-approval</em> after a change — this is
        normal workflow behavior, not an error.</li>
        <li>OIC can query and act on approval tasks (approve/reject/resubmit) via the approval REST
        services, or notify approvers by email.</li>
        <li>Escalations and notifications are configured per flow — missing notifications usually
        mean a setup gap, not a data problem.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Approvals gate the records described on the <a className="font-semibold text-accent hover:underline" href="/fusion/financials">ERP Financials</a> pages.</li>
        <li>Approval tasks are acted on inside OIC flows — see <a className="font-semibold text-accent hover:underline" href="/oic/overview">Integration Cloud</a>.</li>
        <li>Worklist behavior ties into <a className="font-semibold text-accent hover:underline" href="/fusion/security">security roles</a> (who can approve).</li>
      </UL>
    </>
  );
}
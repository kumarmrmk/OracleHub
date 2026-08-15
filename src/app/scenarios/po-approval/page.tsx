import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PO Approval Scenario",
};

export default function PoApprovalPage() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture & Scenarios"
        title="PO Approval Scenario"
        description="A concrete, step-by-step walkthrough of a purchase order request flowing through the stack — from a buyer's form in VBCS, through OIC orchestration and approval, back to a refreshed portal status."
        breadcrumbs={[{ label: "Architecture & Scenarios" }, { label: "PO Approval" }]}
        updated="February 2025"
      />

      <H2>The business case</H2>
      <P>
        A buyer who does not have access to Fusion needs to raise a purchase order. They open a{" "}
        <strong>VBCS portal</strong> — an extranet form — and submit their request. The request does
        not go straight to Fusion: it lands in <strong>OIC</strong>, which validates it, looks up
        supplier data, and creates a draft PO in <strong>Fusion</strong>. The PO then enters an{" "}
        <strong>OIC approval process</strong> where the buyer's manager signs off. Once approved, the
        status flows all the way back to the portal so the buyer sees "Approved" without ever logging
        into Fusion.
      </P>
      <P>
        Four layers participate, and each owns one job:
      </P>
      <UL>
        <li>
          <strong>VBCS portal:</strong> collects the request and shows the result. It never touches
          Fusion directly.
        </li>
        <li>
          <strong>OIC integration:</strong> receives the request, validates the supplier against
          Fusion REST, enriches it with payment terms, and creates the PO.
        </li>
        <li>
          <strong>Fusion:</strong> holds the PO as the system of record, in{" "}
          <strong>pending approval</strong> status.
        </li>
        <li>
          <strong>OIC process:</strong> runs the human approval task and reports the final status
          back to the portal.
        </li>
      </UL>

      <H2>The end-to-end flow</H2>
      <P>
        Trace the request through its five stops. Every hop is an Arrow label you can watch in OIC
        Monitoring:
      </P>
      <Diagram title="PO request trace" className="mb-8">
        <DiagramNode tone="vbcs" title="VBCS Portal" subtitle="buyer submits PO form" />
        <Arrow label="POST /invocations" />
        <DiagramNode tone="oic" title="OIC Integration" subtitle="validate supplier via Fusion REST" />
        <Arrow label="REST lookup" />
        <DiagramNode tone="fusion" title="Fusion" subtitle="PO created, pending approval" />
        <Arrow label="task assignment" />
        <DiagramNode tone="oic" title="OIC Process" subtitle="manager approval task" />
        <Arrow label="callback" />
        <DiagramNode tone="vbcs" title="Portal Update" subtitle="page refresh shows 'Approved'" />
      </Diagram>

      <H2>Step 1 - The VBCS page</H2>
      <P>
        The portal is a VBCS page built around a <strong>page variable</strong> called{" "}
        <K key="var-por">poRequest</K>. The form binds directly to it, so whatever the buyer types is
        the payload that leaves the page:
      </P>
      <UL>
        <li>
          <strong>Supplier:</strong> the supplier number or name the buyer wants to purchase from.
        </li>
        <li>
          <strong>Line items:</strong> item, quantity, and unit price for each line.
        </li>
        <li>
          <strong>Amount:</strong> the total, used later to decide whether the order needs a manager.
        </li>
        <li>
          <strong>Currency:</strong> ISO code such as <K key="usd">USD</K> or <K key="eur">EUR</K>.
        </li>
        <li>
          <strong>Payment terms:</strong> left blank on purpose — OIC fills it from a lookup.
        </li>
      </UL>
      <CodeBlock
        language="json"
        filename="page variable: poRequest"
        code={`{
  "supplierNumber": "SUP-10023",
  "currency": "USD",
  "paymentTerms": null,
  "lines": [
    { "item": "Laptop", "quantity": 5, "unitPrice": 1200.00 },
    { "item": "Docking station", "quantity": 5, "unitPrice": 140.00 }
  ],
  "totalAmount": 6700.00
}`}
      />
      <P>
        When the buyer clicks <strong>Submit</strong>, an <em>action chain</em> fires: it runs a{" "}
        <strong>Call Rest Endpoint</strong> action against the OIC service connection. The service
        connection hides the endpoint URL and the OAuth token, so the page only needs to send the
        variable and await a response.
      </P>

      <H2>Step 2 - OIC integration</H2>
      <P>
        The hit arrives at an <strong>app-driven integration</strong> exposed as a REST endpoint.
        OIC's first job is to confirm the supplier actually exists in Fusion. It makes a GET against
        the supplier resource:
      </P>
      <CodeBlock
        language="bash"
        filename="Validate supplier via Fusion REST"
        code={`curl -u "username:password" \\
  "https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/suppliers?finder=SupplierFindAll;number=SUP-10023" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />
      <P>
        If a supplier record returns, OIC <strong>enriches the payload</strong>: a lookup maps the
        supplier's payment terms code to the human name, and the amounts carry over untouched. It
        then <strong>POSTs to Fusion</strong> to create the PO in draft, gets a Fusion{" "}
        <K key="po-id">PONumber</K> back, and stashes it in a variable for the approval step.
      </P>

      <H2>Step 3 - Approval process</H2>
      <P>
        Next the integration hands off to an <strong>OIC Process Builder</strong> flow. The gate is a
        business rule on the order total:
      </P>
      <UL>
        <li>
          Under <K key="thresh">$5,000</K>, the PO is{" "}
          <strong>auto-approved</strong> — no human in the loop.
        </li>
        <li>
          At or above it, the flow creates a <strong>manager approval task</strong> and assigns it by
          the buyer's reporting line: <em>manager task</em>.
        </li>
      </UL>
      <P>
        The <strong>data association</strong> between the integration and the process carries the
        whole PO payload — supplier, lines, total, and the PONumber — so the approval screen shows the
        manager exactly what they are signing off on. The manager can approve, reject, or request
        changes; the outcome becomes the process result.
      </P>

      <H2>Step 4 - Status callback</H2>
      <P>
        When the process completes, control returns to the integration, which does two things:
      </P>
      <UL>
        <li>
          <strong>Updates Fusion:</strong> approves (or rejects) the pending PO so the status written
          by Step 2 becomes final.
        </li>
        <li>
          <strong>Notifies the portal:</strong> fires the callback return path so VBCS learns the
          outcome.
        </li>
      </UL>
      <P>
        Back in the page, the action chain wasn't waiting synchronously for the approval — it
        returned as soon as the PO was accepted. The portal <strong>refreshes</strong> (or polls) a
        small status endpoint that OIC keeps current, and the buyer's card flips to{" "}
        <strong>"Approved"</strong> or <strong>"Rejected"</strong>.
      </P>

      <H2>Error scenarios</H2>
      <P>
        The same flow, when things go wrong — these are the cases you will actually chase in OIC
        Monitoring:
      </P>
      <DataTable
        headers={["Failure", "Where it surfaces", "OIC behavior"]}
        rows={[
          [
            "Supplier not found",
            "OIC integration, Stage: GET suppliers",
            "Fusion returns 404; OIC routes to a fault handler that logs the reason and returns a clean error to the portal",
          ],
          [
            "Fusion rejects the PO",
            "OIC integration, Stage: POST createPO",
            "Fusion returns a business error in the payload; OIC marks the instance as failed and shows the Fusion message in Monitoring",
          ],
          [
            "Approval task times out",
            "OIC process, Task",
            "Process escalates to a second approver or ends with a timeout status that the callback relays to the portal",
          ],
        ]}
      />
      <Callout type="warning">
        Every one of these failures leaves an entry in <strong>OIC Monitoring</strong> with the exact
        stage and payload. Get into the habit of matching an error message back to the arrow in the
        diagram above — the culprit is always the last step that actually ran.
      </Callout>

      <H2>Key takeaways</H2>
      <Callout type="info">
        The rule that keeps this scenario clean: <strong>VBCS asks, OIC does, Fusion stores.</strong>{" "}
        The portal never formats the data or approves the order; OIC owns validation, enrichment,
        and the human gate; Fusion is the only place the PO truly exists.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>
          See how this scenario fits the wider landscape in{" "}
          <a className="font-semibold text-fuchsia-300 hover:underline" href="/architecture">architecture</a>.
        </li>
        <li>
          Learn why this is an orchestration style in{" "}
          <a className="font-semibold text-fuchsia-300 hover:underline" href="/oic/styles">OIC styles</a>.
        </li>
        <li>
          Wire the portal side with{" "}
          <a className="font-semibold text-fuchsia-300 hover:underline" href="/vbcs/connecting">VBCS connecting</a>.
        </li>
        <li>
          Read how failures like the ones above look from the inside in{" "}
          <a className="font-semibold text-fuchsia-300 hover:underline" href="/oic/errors">OIC errors</a>.
        </li>
      </UL>
    </>
  );
}
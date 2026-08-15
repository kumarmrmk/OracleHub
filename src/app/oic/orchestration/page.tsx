import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "Orchestration & the Flow Toolbox",
};

export default function OicOrchestrationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Orchestration & the flow toolbox"
        description="An integration is a sequence of steps — trigger, map, invoke, branch, loop, and end. This page lists the complete set of actions Oracle Integration puts on the canvas, what each one does, and when to use it."
        breadcrumbs={[{ label: "OIC" }, { label: "Orchestration & Flow" }]}
        updated="February 2025"
        level="Module"
      />

      <P>
        The action palette is Oracle's official list from the integration canvas. Use it as a
        reference: skim the categories, then dive into the action your flow actually needs. The
        choice is rarely "which action does Oracle have" — it is "which action fits the step I am
        designing."
      </P>

      <H2>The lifecycle of a flow</H2>
      <Diagram title="A typical orchestrated flow" className="mb-8">
        <DiagramNode tone="oic" title="Trigger" subtitle="REST / file / schedule / event" />
        <Arrow label="parse" />
        <DiagramNode tone="oic" title="Map or Stitch" subtitle="reshape or build the payload" />
        <Arrow label="validate" />
        <DiagramNode tone="oic" title="Invoke (Connection)" subtitle="call an adapter" />
        <Arrow label="check response" />
        <DiagramNode tone="oic" title="Map / Logger" subtitle="extract the reply, log it" />
        <Arrow label="end" />
        <DiagramNode tone="success" title="Return / Callback / Stop" subtitle="finish the flow" />
      </Diagram>

      <H2>Actions — the full official palette</H2>
      <Callout type="info">
        This is the complete palette documented for Oracle Integration 3, grouped exactly as the
        canvas groups it. Every action listed here is drawn verbatim from Oracle's{" "}
        <em>Using Integrations in Oracle Integration 3</em> guide.
      </Callout>

      <H3>Core actions</H3>
      <DataTable
        headers={["Action", "What it does", "Use it when…"]}
        rows={[
          ["Assign", "Set variable/property values using the Expression Builder", "Track a counter, flag, or key without a full map"],
          ["Map", "Transform one payload into another (XSLT-backed)", "Nearly every hop between systems or actions"],
          ["Data translate", "Convert between OIC's native XML payload and stringified JSON", "An endpoint expects raw JSON strings rather than a typed JSON body"],
          ["Data stitch", "Incrementally build a message payload from one or more existing payloads, via an editor that assigns values to variables", "Assemble a payload bit by bit from several sources into one structure"],
          ["Logger", "Write a static or variable-populated message to the activity stream and logs", "Diagnostic breadcrumbs without stopping the flow"],
          ["Notification", "Send an email with To/From/Subject and an Expression-Builder body", "Tell a human about completion or a problem"],
          ["Note", "Add a placeholder sticky note in the flow", "Document intent — e.g. 'define the invoke connection here later'"],
          ["Wait", "Delay processing for a specified period", "Invoke an operation at a certain time, or pace-rate a downstream system"],
          ["Stage File", "Read (strip trailer), write, zip, and unzip files in a staging area", "Post-process files downloaded by the FTP adapter"],
          ["B2B", "Translate a message to/from EDI format inside the flow", "Exchange EDI documents (850/855/856/810…) with partners"],
          ["Healthcare", "Exchange messages/events between healthcare applications", "HL7-style healthcare message flows"],
        ]}
      />

      <H3>Logic actions</H3>
      <DataTable
        headers={["Action", "What it does", "Use it when…"]}
        rows={[
          ["For each", "Loop over a repeating element and process child actions once per iteration", "Process every invoice line, every CSV row, every order item"],
          ["Parallel", "Split the path into multiple branches that run in parallel", "Independent calls you don't want serialized — watch your concurrency slots (see service limits)"],
          ["Switch", "Define branches with routing expressions; an otherwise branch handles the fall-through", "Three or more mutually exclusive paths"],
          ["While", "Loop over actions while a condition stays true (Expression Builder)", "Poll a status until it leaves PENDING, retry-until-success"],
          ["Scope", "Group child actions and invokes with their own fault handlers", "Wrap a multi-call unit you may need to compensate or retry as a whole"],
        ]}
      />

      <H3>Error-handling actions</H3>
      <DataTable
        headers={["Action", "What it does", "Use it when…"]}
        rows={[
          ["Throw New Fault", "Generate an error with a code, reason, details, and skip condition", "Raise a deliberate, structured business error to the caller"],
          ["Re-throw Fault", "Send the captured error onward — to the global fault (if defined) and then the error hospital", "After logging/compensation, let the failure surface for analysis"],
        ]}
      />
      <Callout type="warning">
        OIC also has a <strong>global fault handler</strong> (the View Global Fault Handler toggle on
        the canvas) — a single error path the whole integration can fall into, ending in a re-throw
        to the error hospital. See{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/errors">error handling</a> for
        the failure-lifecycle detail.
      </Callout>

      <H3>Call actions</H3>
      <DataTable
        headers={["Action", "What it does", "Use it when…"]}
        rows={[
          ["Decision", "Invoke an activated decision model", "Route by business rules you keep editable outside the flow"],
          ["Integration", "Invoke another (active) integration", "Reuse a shared child flow instead of duplicating steps"],
          ["File server", "List, write, move, download, read, or delete files on File Server", "Governed file operations with the built-in SFTP host"],
          ["Human in the loop", "Invoke an activated human-in-the-loop workflow", "A task must pause for a person (approve, verify, correct)"],
          ["JavaScript", "Call JavaScript functions from the flow", "Custom logic beyond the visual map's functions"],
          ["OCI Function", "Invoke a native OCI function", "Compute you don't want to host inside the integration"],
          ["OCI Object Storage", "Invoke Object Storage", "Land/read bulky files, archives, interchanged payloads"],
          ["Process", "Invoke a process application", "Start a human approval process from an integration"],
          ["Publish event", "Publish an event that subscription integrations listen for", "Decouple producers from consumers; event-driven fan-out"],
          ["Robot flow", "Add a robot the integration can call", "Automate a system with no APIs (RPA) from inside the flow"],
        ]}
      />

      <H3>End actions</H3>
      <DataTable
        headers={["Action", "What it does", "Use it when…"]}
        rows={[
          ["Return", "Return an immediate response to the trigger", "You have the answer right now — stop and reply"],
          ["Callback", "End and return to the trigger (e.g. inside a switch branch)", "One branch says 'not continuing' — stop and signal the trigger"],
          ["Fault return", "Return a defined fault to the trigger", "The trigger declares faults; reply with the right one (a mapper opens for the fault body)"],
          ["Stop", "Terminate the integration with no response message", "Silent termination — no reply at all"],
        ]}
      />

      <H3>OCI AI Services & agentic actions</H3>
      <DataTable
        headers={["Action", "What it does", "Use it when…"]}
        rows={[
          ["OCI Document Understanding", "ML/AI extraction from documents", "Pull PO number and amount from an invoice PDF"],
          ["OCI Generative AI", "Ask questions, receive responses", "Generate prompts/summaries inside a flow"],
          ["OCI Generative AI Agents RAG", "Query knowledge bases for context answers", "Compare a prompt against company policy (auto-approve/reject)"],
          ["OCI Language", "Text analysis and machine translation", "Sentiment analysis on customer messages"],
          ["OCI Speech", "Transcribe speech to text", "Process voicemails or recorded calls"],
          ["OCI Vision", "Image analysis / text extraction from images", "Extract data from photos or scans"],
          ["AI Agent", "Invoke an AI agent from the integration", "Agentic workflows that plan and call tools"],
        ]}
      />

      <H2>Choosing the right action</H2>
      <UL>
        <li><strong>Shape data?</strong> → Map (transform), Data stitch (build from parts), Data translate (JSON/XML), Assign (small values).</li>
        <li><strong>Choose a path?</strong> → Switch (many branches) or Wait/While (time/condition driven).</li>
        <li><strong>Repeat?</strong> → For each (collections), While (until condition).</li>
        <li><strong>Speed up?</strong> → Parallel for independent branches.</li>
        <li><strong>Call out?</strong> → Invoke (connections), Integration (child flow), OCI Function, Publish event.</li>
        <li><strong>Involve a person?</strong> → Human in the loop, Process, Robot flow, Notification.</li>
        <li><strong>Fail safely?</strong> → Scope + fault handling, Throw New Fault, Re-throw Fault.</li>
        <li><strong>Finish?</strong> → Return (answer), Callback (branch end), Fault return (declare fault), Stop (silent).</li>
      </UL>

      <H2>Working example — a quote request end to end</H2>
      <Callout type="example" title="Worked example: quote request through stitch → switch → invoke → return">
        <p className="mb-2"><strong>Trigger:</strong> REST request with {"{ supplier, amount, region }"}.</p>
        <p className="mb-2"><strong>Switch:</strong> region ≠ "EU" → Callback with a 400 (no unnecessary calls).</p>
        <p className="mb-2"><strong>Data stitch:</strong> build the Fusion PO payload from the supplier, amount, and a lookup's translated payment terms.</p>
        <p className="mb-2"><strong>For each + invoke:</strong> per line, invoke Fusion REST (small batch); Logger records progress.</p>
        <p className="mb-0"><strong>End:</strong> Return the created PO number to the caller; on failure, Throw New Fault with a readable body.</p>
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Transform the payloads between stages in <a className="font-semibold text-sky-300 hover:underline" href="/oic/mapping">mapping</a>.</li>
        <li>Choose what each stage reaches in <a className="font-semibold text-sky-300 hover:underline" href="/oic/adapters">adapters</a>.</li>
        <li>Keep the flow observable in <a className="font-semibold text-sky-300 hover:underline" href="/oic/monitoring">monitoring</a>.</li>
      </UL>
    </>
  );
}
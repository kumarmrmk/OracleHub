import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Core Concepts",
};

export default function FusionConceptsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Core Concepts"
        description="Flexfields, value sets, trees, attachments, Enterprise Scheduler, and approval workflows — the platform-level building blocks you must understand before any Fusion integration. These concepts cut across every module."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Core Concepts" }]}
        updated="February 2025"
      />

      <P>
        If modules are the <em>where</em> of Fusion, these concepts are the <em>how</em>. They are
        implemented once by the Fusion platform and used by every module, which is why a single
        concept (a flexfield segment, for example) can appear in Finance, Procurement, and HCM at the
        same time. None of them are optional reading for an integration developer.
      </P>

      <H2>Flexfields</H2>
      <P>
        A <strong>flexfield</strong> is Fusion's way of letting each customer extend standard data
        structures without changing code. There are two kinds, and confusing them is a classic
        source of integration bugs:
      </P>
      <DataTable
        headers={["Flexfield type", "What it is", "Example"]}
        rows={[
          [
            "KEY flexfield (KFF)",
            "A set of segments that together form a composite key — most famously the chart of accounts. The segments take values from value sets, and each segment's value becomes part of the key string.",
            "Account flexfield 50.10.1230.00 (Company.Cost Center.Natural Account.Subaccount) encoded as one concatenated value in FBDI columns like COA segments",
          ],
          [
            "DESCRIPTIVE flexfield (DFF)",
            "Extra context-sensitive columns bolted onto a form or object. They hold free-form or value-set attributes that are not part of any key.",
            "A 'Vehicle Registration No' column on an expense report DFF attached to the Expense Report header",
          ],
        ]}
      />
      <P>
        Key flexfields are composed of <strong>context-sensitive segments</strong>: depending on the{" "}
        <strong>context</strong> (for example the operating unit or the account type), a different
        set of segments applies. When you read a record via REST you often get the segments as
        separate attributes (e.g. <K>Company</K>, <K>CostCenter</K>); when you load via FBDI you must
        concatenate them into the segment columns in the exact order the template defines.
      </P>
      <Callout type="warning">
        The <strong>account flexfield format is the #1 FBDI failure</strong>. A value like{" "}
        <K>01-120-00000-000</K> must match the template's segment order and value-set-driven
        validations exactly, or the import job fails for '"Segment1" is not valid'. Check the
        concatenation separator and the number of segments on your instance before you build the
        file.
      </Callout>

      <H2>Value Sets</H2>
      <P>
        A <strong>value set</strong> is a named list that constrains what a flexfield segment or a
        profile option is allowed to hold. You will see them everywhere because they are the data
        dictionary behind most dropdowns in Fusion.
      </P>
      <UL>
        <li>
          <strong>Independent</strong> — a standalone list ("Payment Terms", "Countries") whose
          values carry optional effective dates and descriptions.
        </li>
        <li>
          <strong>Dependent</strong> — a second value set whose valid values depend on a value
          already chosen in another segment (Province depends on Country).
        </li>
        <li>
          <strong>Table</strong> — values come from a SQL table at runtime; used when the list is
          huge or driven by another object.
        </li>
        <li>
          <strong>Validation type</strong> — the rules applied on top: format-only, pair-to-segment,
          special, or none. This determines whether a segment accepts free text or only listed
          values.
        </li>
      </UL>
      <P>
        Value sets are exposed as REST resources under <K>vmValueSets</K>, which is handy when you
        want to validate data before you send it, or to drive a VBCS dropdown from Fusion:
      </P>
      <CodeBlock
        language="json"
        filename="GET /vmValueSets — a value set"
        code={`{
  "ValueSetCode": "ZZ_PAYMENT_TERMS",
  "ValueSetName": "Payment Terms",
  "ValidationType": "Independent",
  "FlexValueSetUsageSyncOption": "SynchronizeOnSchedule",
  "flexValueSetValues": [
    { "Value": "IMMEDIATE", "EnabledFlag": true },
    { "Value": "NET30", "EnabledFlag": true },
    { "Value": "NET60", "EnabledFlag": true }
  ]
}`}
      />

      <H2>Trees &amp; Tree Structures</H2>
      <P>
        A <strong>tree</strong> is a hierarchical grouping that Fusion uses when plain flat lists are
        not enough — for example organizing <strong>cost centers</strong> under regions, or storing a
        hierarchy of segments. The <strong>tree structure</strong> defines the node vocabulary
        (which value set the nodes draw from) and the <strong>tree version</strong> holds the
        actual hierarchy for a date range.
      </P>
      <P>
        You integrate against trees when a requirement says things like "roll up all sales cost
        centers to region level for reporting." You typically call the{" "}
        <strong>TreeManagementService</strong> REST resources (<K>treeDefinition</K>,{" "}
        <K>treeStructureDefinition</K>, <K>treeData</K>) to fetch the hierarchy, then walk it in
        your code. Trees are versioned, so a report that uses "as of" dates can read a historical
        version without disruption.
      </P>

      <H2>Attachments &amp; UCM</H2>
      <P>
        Files attached to any Fusion object are not stored in the business table — they live in{" "}
        <strong>UCM (Universal Content Manager)</strong>. The public handling points are the{" "}
        <strong>documentResource</strong> REST endpoints, which let you upload, download, and delete
        files on most main objects.
      </P>
      <Diagram title="Where attachments live" className="mb-8">
        <DiagramNode tone="fusion" title="Business object" subtitle="invoice, PO, worker" />
        <Arrow label="documentResource" />
        <DiagramNode tone="neutral" title="UCM / DLC" subtitle="content store with versions" />
        <Arrow label="URL back to object" />
        <DiagramNode tone="neutral" title="Client app" subtitle="download or preview" />
      </Diagram>
      <P>
        Uploading an attachment to a purchase order in REST parlance means POSTing the file, then
        attaching the resulting document ID back to the business object. With curl, a common pattern
        is a <strong>multipart</strong> POST to the document resource:
      </P>
      <CodeBlock
        language="bash"
        filename="Upload an attachment to a business object"
        code={`curl -u "username:password" \\
  -X POST \\
  "https://yourinstance.oraclecloud.com/soa-infra/services/dbCommunicationServices/documentService" \\
  -F "fileName=PO_100.pdf" \\
  -F "file=@PO_100.pdf" \\
  -F "relatedBusinessObject=PurchaseOrderHeaderVOService" \\
  -F "bindingKey=300100220012345"`}
      />
      <P>
        The response returns a <strong>docId</strong> and a download URL. Store that docId in your
        integration metadata — you will use it later to fetch or delete the file.
      </P>

      <H2>Batch processing &amp; ESS</H2>
      <P>
        The <strong>Enterprise Scheduler Service (ESS)</strong> runs every background job in Fusion:
        FBDI imports, scheduled reports, and many module-specific processes. When you submit an
        FBDI load, ESS is what actually executes the import.
      </P>
      <P>
        ESS exposes a REST surface (base <K>erpintegrationservice</K>) where you submit jobs and,{" "}
        <strong>crucially, poll for status</strong>. The job status is available while the job runs
        and after it finishes, so batch integrations use a simple poll loop rather than a blocking
        call:
      </P>
      <CodeBlock
        language="bash"
        filename="Check ESS job status"
        code={`curl -u "username:password" \\
  "https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/erpintegrationservice/scheduling/jobsStatus/300100220012345" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />
      <P>
        The response envelope carries fields like <K>completionMessage</K> and a job status of{" "}
        <K>SUCCEEDED</K>, <K>RUNNING</K>, or <K>FAILED</K>. On failure, the payload also points you
        at the error CSV that ESS writes back to UCM.
      </P>
      <Callout type="info">
        ESS also accepts <strong>scheduling</strong>: you submit a job with a <K>schedule</K> (or
        point it at an existing ESS schedule), so your "nightly FBDI load" can be driven entirely
        from Fusion rather than from OIC.
      </Callout>

      <H2>Approval workflows</H2>
      <P>
        Many Fusion objects carry an approval step — a requisition needs a manager, an invoice
        needs an AP + finance approver. Historically that logic lives in <strong>Oracle Business
        Process</strong> (the BPEL/SOA-based approval service) that ships with Fusion.
      </P>
      <P>
        For new integrations Oracle increasingly routes these human steps through{" "}
        <strong>OIC Process</strong>, which extends and (in time) replaces parts of the native Fusion
        approval engine. You can still query approval state on the object itself — for reversible
        read paths check the object's status and the <K>approvals</K> REST resource — but if you
        need custom workflows with your own approver tables, plan to build them in OIC Process and
        trigger them from Fusion via events or REST.
      </P>
      <UL>
        <li>
          <strong>Fusion-native:</strong> approvals configured per object; lifecycle states like{" "}
          <K>PENDING_APPROVAL</K>, <K>APPROVED</K>, <K>REJECTED</K> on the object.
        </li>
        <li>
          <strong>OIC Process:</strong> custom human tasks, approval hierarchies, and timeouts that
          you design and that call Fusion REST to apply the final state.
        </li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>
          Apply these concepts through the{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/rest-api">
            REST API fundamentals
          </a>
          .
        </li>
        <li>
          See flexfields and ESS in action during{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">
            FBDI loads
          </a>
          .
        </li>
        <li>
          Check which module owns the object you need in{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/modules">
            application modules
          </a>
          .
        </li>
      </UL>
    </>
  );
}
import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "Mapping & Data Transformation",
};

export default function OicMappingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Mapping & data transformation"
        description="Integrations rarely agree on shape. One side sends XML, the other wants JSON; one calls a field customerName, the other calls it name; one day it is 01, the next Net 30. Mapping is how OIC reshapes payloads — the single most common task in any integration."
        breadcrumbs={[{ label: "OIC" }, { label: "Mapping & Transformation" }]}
        updated="February 2025"
        level="Foundation"
      />

      <P>
        A <strong>map</strong> connects a source element to a destination element. It sounds trivial;
        the craft is in the details: converting formats, looking up codes, splitting and joining
        records, and guarding against nulls. OIC's <strong>map editor</strong> generates
        XSLT under the hood, but you work visually — drag source to target, then use functions to
        transform the values.
      </P>

      <H2>The map editor at a glance</H2>
      <P>
        Open any <K>map</K> action in an integration and you see three areas: the source schema on
        the left, the target schema on the right, and the mapping expressions in the middle. A
        straight drag creates a <em>direct assignment</em>; almost everything else wraps the source
        in a function.
      </P>
      <Diagram title="Anatomy of a simple map" className="mb-8">
        <DiagramNode tone="oic" title="Source" subtitle="e.g. JSON invoice from a portal" />
        <Arrow label="function" />
        <DiagramNode tone="oic" title="Map editor" subtitle="drag + functions → XSLT" />
        <Arrow label="mapped output" />
        <DiagramNode tone="neutral" title="Target" subtitle="e.g. Fusion invoice REST payload" />
      </Diagram>

      <H3>Direct assignment vs transformed</H3>
      <UL>
        <li><strong>Direct:</strong> source <K>customerName</K> → target <K>name</K>. Same value, same type.</li>
        <li><strong>Transformed:</strong> source <K>orderDate</K> → target <K>requiredDeliveryDate</K> formatted as <K>yyyy-MM-dd</K>.</li>
        <li><strong>Looked up:</strong> source <K>"01"</K> → lookup → target <K>"Net 30"</K>.</li>
        <li><strong>Computed:</strong> source <K>quantity</K> × source <K>unitPrice</K> → target <K>lineTotal</K>.</li>
      </UL>

      <H2>Map functions — the toolbox</H2>
      <P>
        Functions are the real power. They fall into a few families; you will use the first three
        constantly.
      </P>
      <DataTable
        headers={["Family", "What it does", "Examples"]}
        rows={[
          ["String", "Shape text: concat, substring, upper/lower, trim, split", <span key="s">concat(firstName, ' ', lastName)</span>],
          ["Number / math", "Compute and round values", "sum, multiply, floor, abs, money format"],
          ["Date / time", "Parse and format dates between sides", "dateTime-add, formatDateTime, get-current-dateTime"],
          ["Collection", "Work on repeating groups (order lines)", "for-each, position, count, distinct"],
          ["Lookup", "Translate codes through a lookup table", "lookupValue, storedLookup"],
          ["Conditional", "Choose a value branch", "if-then-else, switch, toggle"],
          ["Target", "Set flags on the target side", "set-to-null, remove-namespaces"],
        ]}
      />
      <Callout type="tip">
        Test a function before relying on it: use the <strong>map test / preview</strong> pane with a
        sample payload. The most common mapping bug is a date format that looks right in preview
        data but differs in production.
      </Callout>

      <H2>Flattening and unflattening</H2>
      <P>
        Sometimes the source nests data and the target is flat (or the reverse). Two function
        families handle this:
      </P>
      <DataTable
        headers={["Pattern", "When you use it", "Example"]}
        rows={[
          ["Flatten", "A repeating group of lines becomes a flat list", "Portal invoice lines → one row per FBDI interface line"],
          ["Unflatten / group", "Repeating rows must nest under a parent", "CSV rows → XML with an <order> parent and <lines> children"],
          ["Attributes ↔ elements", "JSON attributes must become XML elements or vice versa", "REST JSON → Fusion SOAP"],
        ]}
      />
      <Callout type="info">
        For the classic <strong>portal → FBDI</strong> case you map the whole payload into the CSV
        structure that the import expects. That map usually pairs one source collection with a
        <K>for-each</K> that emits one CSV line per record — see{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/fbdi-integration">
          FBDI integration
        </a>
        {" "}for the end-to-end flow.
      </Callout>

      <H2>Formats: XML, JSON, CSV and the envelopes</H2>
      <P>
        Every map sits between two payload shapes. Knowing which envelope you are in matters because
        the envelope rules change how you reach into the payload:
      </P>
      <DataTable
        headers={["Format", "Payload shape", "Where you meet it in OIC"]}
        rows={[
          ["XML", "Elements and attributes; namespace prefixes", "SOAP adapters, Fusion REST XML, file payloads"],
          ["JSON", "Objects and arrays; <K>{ request: ... }</K> wrapper on OIC endpoints", "REST trigger/invoke, VBCS, most modern APIs"],
          ["CSV / delimited", "Rows and columns; no built-in hierarchy", "File and FTP adapters, FBDI templates"],
          ["Flat file", "Fixed-width positional data", "Bank files, legacy ERP extracts"],
        ]}
      />
      <Callout type="warning">
        OIC wraps JSON requests in a <K>{"{ request: ... }"}</K> object and responses in{" "}
        <K>{"{ response: ... }"}</K>. If a map reacts "why is everything nested one level deeper than my
        REST call?" — that is the envelope. It applies to both trigger and invoke sides.
      </Callout>

      <H2>XSLT under the hood</H2>
      <P>
        OIC generates <strong>XSLT</strong> from your visual map. Knowing that helps you in three
        situations: reading the generated source when a map behaves unexpectedly, dropping in a{" "}
        <strong>custom XSLT</strong> map when a transform is too awkward to build visually, and
        understanding performance — recursive or unguarded XSLT can throttle a flow.
      </P>
      <CodeBlock
        language="xml"
        filename="generated_xslt_view.xml"
        code={`<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>
  <xsl:template match="/">
    <invoice>
      <number><xsl:value-of select="request/invoiceNumber"/></number>
      <total>
        <xsl:value-of select="request/quantity * request/unitPrice"/>
      </total>
    </invoice>
  </xsl:template>
</xsl:stylesheet>`}
      />
      <P>
        The visual map and the generated XSLT stay in sync: change one and the other updates.{" "}
        <strong>Custom XSLT</strong> maps are the exception — you author the transform directly and
        OIC runs it as-is.
      </P>

      <H2>Working example — one invoice line through a map</H2>
      <Callout type="example" title="Worked example: portal JSON → Fusion supplier-hierarchy shape">
        <p className="mb-2"><strong>Source:</strong> {"{ \"supplier\": \"Acme IT\", \"amount\": \"1200.5\", \"terms\": \"01\" }"}</p>
        <p className="mb-2"><strong>Target:</strong> Fusion REST expects <K>supplierName</K>, a numeric <K>invoiceAmount</K>, and a translated <K>paymentTerms</K>.</p>
        <p className="mb-2"><strong>The map:</strong> <K>supplier</K> → <K>supplierName</K> (direct); <K>amount</K> → <K>invoiceAmount</K> via a decimal function; <K>terms</K> → lookup → <K>paymentTerms</K>.</p>
        <p className="mb-0"><strong>Result:</strong> the integration receives a payload that Fusion will accept without rework — the classic job of an integration map.</p>
      </Callout>

      <H2>Mapping best practices</H2>
      <UL>
        <li><strong>Route codes through lookups</strong> — never hard-code translations in an expression.</li>
        <li><strong>Guard nulls</strong> — a function on an empty source returns null; decide what the target should get explicitly.</li>
        <li><strong>Use libraries</strong> for transforms reused across integrations; fix once, deploy everywhere.</li>
        <li><strong>Keep dates typed</strong> until the last hop, then format — converting to strings early causes locale bugs.</li>
        <li><strong>Name the map and test it</strong> — an unlabeled map in a 400-line flow is undebuggable in six months.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>See which <a className="font-semibold text-sky-300 hover:underline" href="/oic/adapters">adapters</a> produce the payloads you will map.</li>
        <li>Read how maps plug into the flow toolbox in <a className="font-semibold text-sky-300 hover:underline" href="/oic/orchestration">orchestration</a>.</li>
        <li>Keep an integration healthy through a bad map with <a className="font-semibold text-sky-300 hover:underline" href="/oic/errors">error handling</a>.</li>
      </UL>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "Adapters & Connectivity",
};

export default function OicAdaptersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Adapters & connectivity"
        description="An adapter is OIC's pre-built knowledge of one protocol or product family. Pick the adapter, configure a connection, and OIC handles the protocol details — REST, SOAP, files, databases, SaaS APIs, queues, and OCI services. This page is the map of what reaches where."
        breadcrumbs={[{ label: "OIC" }, { label: "Adapters & Connectivity" }]}
        updated="February 2025"
        level="Foundation"
      />

      <P>
        You rarely write protocol code in OIC. Instead you choose an <strong>adapter</strong> — the
        pattern for speaking to a system — and create a <strong>connection</strong> — the concrete
        instance with an endpoint, credentials, and options. One adapter backs many connections; one
        connection serves many integrations.
      </P>

      <H2>The adapter families</H2>
      <P>
        Adapters fall into groups by what they talk to. Each family has different concerns that
        change how you build the integration.
      </P>
      <DataTable
        headers={["Family", "Adapters", "What changes in your integration"]}
        rows={[
          ["SaaS", "Fusion HCM/ERP, Sales Cloud, Service Cloud, NetSuite, Salesforce, Workday, ServiceNow, Slack, Gmail, Oracle HCM", "Business objects and their fields; the adapter generates the schema"],
          ["Protocol", "REST, SOAP, FTP/SFTP, File, Database (Oracle/third-party JDBC), JMS", "Endpoint style, authentication, and payload format"],
          ["OCI", "Object Storage, Functions, Streaming, Autonomous Database, OCI API Gateway", "OCI IAM, region and compartment, resource-type semantics"],
          ["Messaging", "OCI Streaming, Oracle MQ, Kafka, JMS queues", "Publish/consume semantics; batching and acknowledgement"],
          ["Partner / niche", "SAP, MFT, HL7, Oracle E-Business Suite", "Domain-specific formats and behaviors (from SAP IDocs to health messages)"],
        ]}
      />

      <H2>Protocol adapters in detail</H2>
      <P>
        These five adapters cover the majority of non-SaaS connectivity. Master the decision between
        them and you can handle almost any file- or protocol-driven requirement.
      </P>
      <DataTable
        headers={["Adapter", "Speaks to", "Trigger or invoke", "Watch out for"]}
        rows={[
          ["REST", "Any HTTP/JSON or XML API; OpenAPI import", "Trigger (expose) and invoke (call)", "Auth type, rate limits, large responses"],
          ["SOAP", "Any WSDL-based web service", "Invoke mostly; sometimes trigger", "WSDL 1.1/2.0 differences, namespaces, WS-Security headers"],
          ["FTP / SFTP", "File servers over FTPS/SFTP", "Trigger (poll a folder) and invoke (put/get)", "File presence, naming, and cleanup; key-based vs password auth"],
          ["File", "OCI Object Storage and file servers", "Trigger and invoke with file lifecycle", "Inbound/outbound directories, file naming conventions"],
          ["Database", "Oracle and third-party DBs over JDBC", "Invoke (SQL) — no trigger", "SQL injection surface, connection pools, elapsed-time limits"],
        ]}
      />
      <Callout type="warning">
        A <strong>Database adapter</strong> has no trigger — you cannot subscribe to a change in a
        table. If you need "when the DB changes", poll with a <K>scheduled</K> integration or use a
        change-data capture feed instead.
      </Callout>

      <H2>SaaS adapters — why they matter for Fusion work</H2>
      <P>
        Fusion work almost always pairs with other SaaS. These adapters generate the schema of the
        business object, so the map in your integration is prettily typed rather than a raw free-form
        payload:
      </P>
      <DataTable
        headers={["Adapter", "Typical Fusion-neighbor use"]}
        rows={[
          ["Fusion Applications", "The star: POs, invoices, payments, workers, journals through Fusion REST/SOAP"],
          ["Salesforce", "Opportunities and accounts that feed a sales-to-order cycle"],
          ["NetSuite", "Journal entries, transactions, or customer records syncing with Fusion"],
          ["Workday", "Worker/HR data feeding Fusion Finance or project setups"],
          ["ServiceNow", "Tickets that trigger procure-to-pay or fulfillment flows"],
        ]}
      />

      <H2>Messaging and OCI adapters</H2>
      <P>
        For bulky or high-volume data, adapters exist that decouple the integration from the
        consumer:
      </P>
      <DataTable
        headers={["Adapter", "Pattern", "When to reach for it"]}
        rows={[
          ["OCI Streaming", "Publish/consume an ordered stream of messages", "Telemetry-ish flows, event fan-out, decoupled microservices"],
          ["Oracle MQ / JMS", "Queue and topic semantics with acknowledges", "Reliable hand-off where a consumer must confirm processing"],
          ["OCI Object Storage", "Store and fetch files in buckets", "Staging bulk files for FBDI, archiving payloads, media interchange"],
          ["OCI Functions", "Trigger a serverless function as part of a flow", "Custom logic you do not want inside the integration"],
        ]}
      />

      <H2>Choosing the right adapter</H2>
      <P>
        When you hit "which one?" in a design, run down this list:
      </P>
      <UL>
        <li><strong>Is it a SaaS app with a business object?</strong> Use its SaaS adapter.</li>
        <li><strong>Is it a plain HTTP API?</strong> REST adapter.</li>
        <li><strong>Is it a legacy web service?</strong> SOAP adapter.</li>
        <li><strong>Is it a file exchange?</strong> FTP/SFTP or File, depending on where the file lives.</li>
        <li><strong>Is it a database we query?</strong> Database adapter (invoke only).</li>
        <li><strong>Is it decoupled delivery?</strong> A messaging adapter: Streaming, MQ, or JMS.</li>
        <li><strong>Is it an on-premises system?</strong> Add the <K>connectivity agent</K> and make the connection agent-based.</li>
      </UL>

      <H2>Connections are the risk surface</H2>
      <P>
        Adapters are free; connections carry the risk. A connection bundles the endpoint, the
        credentials, the <strong>security policy</strong> (basic vs agent + message protection), and
        the retry behavior. Treat connections like production secrets:
      </P>
      <Callout type="tip">
        Keep credentials out of the integration body — store them in the connection (or an OCI
        secret) and reference the connection, not the password, in the flow. Promote a connection as
        part of the package so new environments inherit the same configuration.
      </Callout>

      <H2>Working example — file in, Fusion out</H2>
      <Callout type="example" title="Worked example: supplier sends a CSV of invoices">
        <p className="mb-2"><strong>Trigger:</strong> FTP/SFTP adapter polls <K>/inbound/invoices/</K> for new CSV files.</p>
        <p className="mb-2"><strong>Logic:</strong> OIC reads the CSV, maps each row (see <a className="font-semibold text-sky-300 hover:underline" href="/oic/mapping">mapping</a>), and stages it for FBDI.</p>
        <p className="mb-2"><strong>Invoke:</strong> Fusion Applications adapter loads the staged rows, or the File adapter hands the ZIP to the FBDI pattern.</p>
        <p className="mb-0"><strong>Result:</strong> the supplier never touches OIC or Fusion; the file adapter is the whole front door.</p>
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Build a real flow with these adapters in <a className="font-semibold text-sky-300 hover:underline" href="/oic/orchestration">orchestration</a>.</li>
        <li>Secure every connection properly in <a className="font-semibold text-sky-300 hover:underline" href="/oic/security">security & auth</a>.</li>
        <li>See the file-to-Fusion pattern end to end in <a className="font-semibold text-sky-300 hover:underline" href="/oic/fbdi-integration">FBDI integration</a>.</li>
      </UL>
    </>
  );
}
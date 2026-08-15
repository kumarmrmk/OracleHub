import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "OIC Key Concepts",
};

export default function OicConceptsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Key concepts in Oracle Integration Cloud"
        description="The vocabulary you need to work in OIC: connections and adapters, activation and runtime endpoints, lookups, on-premises agents, reusable libraries, and how integrations are organized."
        breadcrumbs={[{ label: "OIC" }, { label: "Key Concepts" }]}
        updated="February 2025"
      />

      <P>
        OIC leans heavily on a few recurring ideas. Once you understand that a{" "}
        <strong>connection</strong> is an adapter instance, that <strong>activation</strong> turns a
        design into a live endpoint, and that <strong>lookups</strong> keep translations out of your
        mappings, most of the console becomes instantly readable.
      </P>

      <H2>Connections and adapters</H2>
      <P>
        An <strong>adapter</strong> is a pre-built connector that knows how to speak one protocol or
        to one product family. A <strong>connection</strong> is an <em>instance</em> of that adapter:
        you pick the adapter, then fill in the endpoint URL, credentials, and options. One adapter
        can back many connections, and a connection can be shared by many integrations.
      </P>
      <DataTable
        headers={["Adapter", "What it talks to", "Typical use"]}
        rows={[
          ["Fusion Applications", "Fusion REST and SOAP services (ERP, SCM, HCM, CX)", "Read or operate on POs, invoices, workers, and other Fusion objects"],
          ["REST", "Any REST API; OpenAPI import or manual request build", "Third-party web services, VBCS endpoints, internal microservices"],
          ["SOAP", "WS-* web services with a WSDL", "Legacy on-prem SOAP providers and external trading partners"],
          ["Database", "Oracle and third-party databases over JDBC", "Read/write operational tables, log and staging schemas"],
          ["FTP / SFTP", "File servers (push and pull)", "CSV exchange with partners, batch file pickup"],
          ["File", "OCI Object Storage and file servers", "Stage files for FBDI uploads or archive outputs"],
          ["Salesforce", "Salesforce object API", "Sync leads, accounts, and opportunities"],
          ["NetSuite", "NetSuite REST and SuiteTalk", "GL entries, transactions, customer records"],
          ["OCI Object Storage", "OCI bucket objects", "Bulky payloads, archives, media, interchange"],
        ]}
      />
      <Callout type="info">
        Connection <strong>security policies</strong> decide whether the integration runs inside
        OIC ("basic") or requires an agent and the extra handshake of message protection. For
        on-premises Fusion, agent-based connections are the norm; for SaaS targets you almost always
        use the plain (non-agent) connection.
      </Callout>

      <H2>The runtime &amp; active endpoints</H2>
      <P>
        An integration in the designer is only a definition. <strong>Activating</strong> it
        publishes the design to the OIC runtime engine and creates a real, callable endpoint. An
        app-driven integration gets a REST URL under{" "}
        <K>/ic/api/integration/v1/integrations/</K>; a scheduled integration instead registers a
        job with OIC's enterprise scheduler that fires on the schedule you configure.
      </P>
      <UL>
        <li>
          <strong>Activate</strong> a new version, and OIC switches traffic to it. Deactivate, and
          the endpoint returns a hard <K>404</K> so callers fail loudly instead of silently.
        </li>
        <li>
          Each activation increments a <strong>version number</strong>. Older versions can be
          activated later as an instant rollback.
        </li>
        <li>
          Activating a scheduled integration starts it <strong>running on its schedule</strong> —
          but only starts it, so you can pre-validate before production go-live.
        </li>
      </UL>
      <CodeBlock
        language="bash"
        filename="Invoke an activated integration"
        code={`curl -X POST "https://<oic-host>/ic/api/integration/v1/integrations/ImportSupplier/activate/invoke" \\
  -H "Authorization: Bearer <oauth-access-token>" \\
  -H "Content-Type: application/vnd.oracle.resource+json" \\
  -d '{"request":{"supplierNumber":"SUP-10023"}}'`}
      />
      <P>
        The call is wrapped in a <K>{"{ request: ... }"}</K> envelope; OIC unwraps it, runs the
        flow, and returns either <K>200</K> (synchronous result) or <K>202 Accepted</K> (asynchronous
        processing kicked off).
      </P>

      <H2>Lookups</H2>
      <P>
        A <strong>lookup</strong> is a two-column (or multi-column) runtime translation table. You
        define it once in the designer, then reference it inside a map. Because the translation
        lives <em>outside</em> your mappings, it can be maintained without redeploying the
        integration — and the same lookup can serve many integrations.
      </P>
      <UL>
        <li>
          Define the <strong>codes</strong> column and the <strong>meaning</strong> column; map the
          source field to the codes and read the paired meaning on the destination side.
        </li>
        <li>
          Typical example: Fusion stores a payment term as <K>"01"</K>, <K>"02"</K>… and you map it
          to <K>"Immediate"</K>, <K>"Net 30"</K> for an external portal.
        </li>
        <li>
          Lookups can be <strong>cached</strong> at runtime, so high-volume integrations should mark
          rarely changing tables as cacheable.
        </li>
      </UL>
      <Callout type="tip">
        Never hard-code translations inside a mapping expression. The moment a code changes, three
        different integrations all silently break. Route every code through a{" "}
        <strong>lookup</strong> so one edit fixes the whole portfolio.
      </Callout>

      <H2>Agents</H2>
      <P>
        The <strong>Oracle Connectivity Agent (OCA)</strong> — historically called the{" "}
        <em>connectivity agent</em> or <em>on-premises agent</em> — is a small runtime you install
        inside your own data center. It opens a <strong>secure, outbound-only tunnel</strong> back
        to OIC, which lets the cloud reach systems that have no public address: on-prem Flexcube or
        SAP, a warehouse database, an internal FTP box.
      </P>
      <UL>
        <li>
          <strong>Outbound-only</strong> — the agent initiates all connections to OIC, so you never
          need to expose inbound firewall ports.
        </li>
        <li>
          One agent group can serve <strong>multiple hosts</strong>; use separate groups for
          separate environments (prod vs. non-prod).
        </li>
        <li>
          The agent is a <strong>Java process</strong> on your server — renew its certificate
          regularly and watch the OPC alerts in Monitoring for a disconnect.
        </li>
      </UL>
      <Callout type="warning">
        For any on-premises target you must do all three: define an <strong>agent group</strong>,
        install the <strong>agent</strong> on the target host, and create the connection as{" "}
        <strong>agent-based</strong>. A non-agent connection to an on-prem system simply times out.
      </Callout>

      <H2>Libraries, schemas, and packages</H2>
      <P>
        Large integration portfolios repeat the same transformation logic over and over. OIC gives
        you three reuse mechanisms, from smallest to largest:
      </P>
      <UL>
        <li>
          <strong>Libraries</strong> — reusable map fragments (and JavaScript snippets) you import
          into a mapping. Fix a bug once in the library and every consumer picks it up on next
          deployment.
        </li>
        <li>
          <strong>Common schemas</strong> (XSD/WSDL definitions) used across multiple integrations,
          so payload contracts stay in one place.
        </li>
        <li>
          <strong>Packages</strong> — downloadable, importable solution bundles produced by Oracle
          and partners. The Fusion Financials packages, for instance, ship pre-built integrations
          for supplier invoices, payments, and GL entries that you import, configure with your
          connections, and activate.
        </li>
      </UL>

      <H2>Projects and workspaces</H2>
      <P>
        As the portfolio grows, the console fills up. <strong>Projects</strong> are a hierarchy of
        folders that group integrations by business process, department, or release. They give you a
        place to organize without changing runtime behavior:
      </P>
      <DataTable
        headers={["Folder", "Contents", "Good for"]}
        rows={[
          ["01-AP-INTEGRATIONS", "Payables orchestration flows", "Separating processing domains (AP, AR, GL)"],
          ["02-HCM-INTEGRATIONS", "Worker sync and onboarding flows", "Keeping HR flows out of finance folders"],
          ["SHARED-LIBRARIES", "Map libraries and common schemas", "One place for reusable assets"],
          ["PROCESS-APPROVALS", "Process Builder applications", "Co-locating human workflows with their data flows"],
        ]}
      />
      <Callout type="example">
        A common convention: a <strong>"platform"</strong> project holds all shared libraries and
        schemas, while per-domain projects only contain integrations. New team members learn the
        convention in minutes instead of reading every flow.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>
          Learn the three ways integrations get triggered in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/styles">
            integration styles
          </a>
          .
        </li>
        <li>
          See the classic bulk pattern in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/fbdi-integration">
            FBDI integration
          </a>
          .
        </li>
        <li>
          Keep integrations healthy with{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/errors">
            error handling and monitoring
          </a>
          .
        </li>
      </UL>
    </>
  );
}
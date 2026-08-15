import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "REST & RESTful APIs",
};

export default function OicRestPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="REST and RESTful APIs in OIC"
        description="Consume Fusion REST from OIC, expose integrations as clean REST endpoints, understand the request/response envelope, and secure your endpoints with OAuth 2.0 client credentials."
        breadcrumbs={[{ label: "OIC" }, { label: "REST & RESTful APIs" }]}
        updated="February 2025"
      />

      <P>
        REST is the lingua franca of OIC. You use it in three directions: <strong>consuming</strong>{" "}
        Fusion's REST services on the invoke side, <strong>exposing</strong> your own integrations as
        REST endpoints on the trigger side, and <strong>securing</strong> those endpoints so only
        authorized callers get in.
      </P>

      <H2>Consuming Fusion REST from OIC</H2>
      <P>
        Inside an integration, talk to Fusion through the <strong>Fusion Applications adapter</strong>{" "}
        (which knows the module's REST resources) or the lower-level <strong>REST adapter</strong>.
        Both let you import a resource definition, configure authentication, and then map into the
        payload.
      </P>
      <UL>
        <li>
          <strong>Import the resource:</strong> the Fusion adapter lets you browse and select a
          resource (e.g., <K>invoices</K>, <K>suppliers</K>) and request its JSON schema.
        </li>
        <li>
          <strong>Authentication:</strong> basic (a service account) or OAuth 2.0 client
          credentials. Prefer OAuth where Fusion's OAuth client support is enabled.
        </li>
        <li>
          <strong>Map it:</strong> once the schema is loaded it appears in the mapper like any other
          payload — drag fields across, add lookups and expressions.
        </li>
        <li>
          Every Fusion REST call should send the <K>REST-Framework-Version</K> header that matches
          your instance; OIC carries it automatically from the adapter configuration.
        </li>
      </UL>
      <Callout type="info">
        For simple reads with no orchestration, VBCS can call Fusion REST directly and skip OIC
        entirely. OIC earns its place when you need <strong>chained calls, transformation,
        retries</strong>, or a stable endpoint that hides Fusion's schema version churn.
      </Callout>

      <H2>Exposing integrations as REST</H2>
      <P>
        When you create an integration with a <strong>REST/HTTP trigger</strong> and activate it, OIC
        auto-generates a public endpoint. The URL pattern is versioned and predictable:
      </P>
      <CodeBlock
        language="bash"
        filename="OIC auto-generated endpoint"
        code={`POST https://<oic-host>/ic/api/integration/v1/integrations/ImportSupplier/activate/invoke
Content-Type: application/vnd.oracle.resource+json
Authorization: Bearer <oauth-access-token>

→ 200  { "response": { "supplierId": "SUP-10023", "status": "CREATED" } }`}
      />
      <UL>
        <li>
          <K>/ic/api/integration/v1/…</K> is the OIC integration REST namespace;{" "}
          <K>/activate/invoke</K> marks the live activation of the integration whose code is in the
          path.
        </li>
        <li>
          The <K>Content-Type: application/vnd.oracle.resource+json</K> header tells OIC the payload
          is the standard request <strong>envelope</strong>, not a raw body.
        </li>
        <li>
          Inbound auth is configured at design time (basic, OAuth, or access-token). Choose the
          level that matches who calls — VBCS service connections, partners, or anonymous.
        </li>
      </UL>

      <H2>Request/response envelope</H2>
      <P>
        OIC app-driven integrations expect the incoming JSON in a <K>{"{ request: … }"}</K> wrapper
        and return results wrapped in <K>{"{ response: … }"}</K>:
      </P>
      <CodeBlock
        language="json"
        filename="Request envelope"
        code={`{
  "request": {
    "supplierNumber": "SUP-10023",
    "payload": {
      "name": "Acme GmbH",
      "address": "Main Street 1"
    }
  }
}`}
      />
      <P>
        The integration trigger's <strong>request parameter</strong> is this entire envelope; you map
        from <K>request</K> into the target payload, and map your output into{" "}
        <K>response</K>. Keep the envelope shape stable across versions so callers don't break.
      </P>

      <H2>Authentication for your endpoints</H2>
      <P>
        The standard for machine-to-machine callers is <strong>OAuth 2.0 client credentials</strong>{" "}
        against OCI IAM (or Identity Cloud Service on older tenancies):
      </P>
      <CodeBlock
        language="bash"
        filename="Get an access token (client credentials)"
        code={`curl -X POST "https://<tenant-domain>/oauth2/v1/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "scope=urn:opc:resource:consumer::all" \\
  -d "client_id=<client-id>" \\
  -d "client_secret=<client-secret>"

# → 200  { "access_token": "...", "expires_in": 3600 }`}
      />
      <UL>
        <li>
          <strong>Create an OAuth client</strong> in OCI IAM with the proper scopes, <strong>grant
          access</strong> to the OIC instance, and use the returned client ID/secret in{" "}
          <K>grant_type=client_credentials</K>.
        </li>
        <li>
          Tokens are short-lived and signed; pass them as <K>Authorization: Bearer</K> and refresh
          before expiry.
        </li>
        <li>
          For <strong>private-key flows</strong> (JWT client assertions instead of a shared secret),
          you sign a JWT with your key and submit <K>client_assertion</K> — it eases rotation because
          there is no client secret to rotate.
        </li>
      </UL>
      <Callout type="warning">
        Never embed a client secret in browser code or a VBCS page. The page should use an{" "}
        <strong>SSO/OAuth authorization-code flow</strong> or a proxied connection; the client-
        credentials secret belongs in OIC connections or OCI secrets.
      </Callout>

      <H2>Pagination &amp; large payloads</H2>
      <P>
        Fusion REST returns collections with <K>limit</K>/<K>offset</K> paging and links. OIC handles
        large payloads with a scanner:
      </P>
      <UL>
        <li>
          Use the Fusion adapter's <strong>query with pagination</strong> settings — the adapter
          issues the paged reads and exposes an iterator in the mapper.
        </li>
        <li>
          For very large transfers, <strong>hand off to FBDI or Object Storage</strong> instead of
          streaming one giant REST response through memory.
        </li>
        <li>
          Prefer <K>fields</K> filters to fetch only the columns you need; big payloads cost time and
          quota.
        </li>
      </UL>

      <H2>Versioning &amp; change management</H2>
      <P>
        Every activation creates a new version of the integration and republishes the endpoint —
        callers hit the newest active version automatically. Treat that as a discipline, not a trap:
      </P>
      <DataTable
        headers={["Practice", "Why it matters"]}
        rows={[
          ["Keep the envelope contract stable", "Callers compile against { request / response }; breaking it breaks them"],
          ["Activate new versions consciously", "Old versions remain available for instant rollback"],
          ["Keep integrations in version control", "The console stores versions; your repo stores source + docs"],
          ["Deprecate, then delete", "A path that callers still hit should return a clear message"],
          ["Test activation in a sandbox first", "Catching a bad map before production activation"],
        ]}
      />

      <H2>Next steps</H2>
      <UL>
        <li>
          See how orchestration shapes an endpoint in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/styles">
            integration styles
          </a>
          .
        </li>
        <li>
          Switch to the bulk channel when rows pile up:{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/fbdi-integration">
            FBDI integration
          </a>
          .
        </li>
        <li>
          Debug slow or failing invokes in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/oic/errors">
            error handling
          </a>
          .
        </li>
      </UL>
    </>
  );
}
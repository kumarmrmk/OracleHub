import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "VBCS Connecting to Fusion & OIC",
};

export default function VbcsConnectingPage() {
  return (
    <>
      <PageHeader
        eyebrow="VBCS"
        title="Connecting to Fusion & OIC"
        description="VBCS pages are only as good as the data behind them. Service connections point your pages at Fusion REST or OIC integrations with credentials attached — this page shows how to create them, secure them, and keep URLs environment-aware."
        breadcrumbs={[{ label: "VBCS" }, { label: "Connecting" }]}
        updated="February 2025"
      />

      <P>
        A VBCS page never hard-codes a URL or a password. Instead, every external system is reached
        through a <strong>service connection</strong>: a named object holding the base URL, the
        authentication scheme, and the credentials — created once in design time and reused by{" "}
        <strong>action chains</strong> and <strong>data providers</strong> across the app.
      </P>

      <Callout type="info">
        The rule that keeps VBCS portable: <strong>credentials live in the connection, not the
        code.</strong> When you later deploy to production, only the connection settings change —
        the pages, chains, and expressions stay identical.
      </Callout>

      <H2>Service connections 101</H2>
      <P>
        Every connection has three parts you configure when you create it:
      </P>
      <UL>
        <li>
          <strong>Base URL</strong> — the root of the REST API (e.g.{" "}
          <K>https://{"<fusion>"}/fscmRestApi/resources/11.13.18.05</K>).
        </li>
        <li>
          <strong>Authentication</strong> — basic, OAuth 2.0 client credentials, or SSO, plus the
          secrets.
        </li>
        <li>
          <strong>Operations</strong> — the endpoint definitions (paths, methods, schemas) that show
          up as invokable actions and table data sources.
        </li>
      </UL>
      <P>
        Once created, a connection appears in two places: as a source for the <K>Call Rest
        Endpoint</K> action (fetch into a variable) and as a <K>data provider</K> you can drag onto
        a Table or List View for automatic lazy loading.
      </P>

      <H2>Connecting to Fusion REST</H2>
      <P>
        Fusion exposes its business services through <K>fscmRestApi</K> (ERP/SCM) and{" "}
        <K>hcmRestApi</K> (HCM), versioned under <K>/resources/{"{version}"}</K>. Create a connection
        with the Fusion base URL, choose <strong>basic</strong> (a Fusion user) or{" "}
        <strong>OAuth</strong>, and add the required <K>REST-Framework-Version</K> header so Fusion
        knows which resource version to serve.
      </P>
      <CodeBlock
        language="bash"
        filename="Direct Fusion REST call (as VBCS sends it)"
        code={`GET https://<fusion>/fscmRestApi/resources/11.13.18.05/suppliers/{SupplierId}
Authorization: Basic <base64(user:pass)>
REST-Framework-Version: 11.13.18.05
Accept: application/json

# → 200 JSON: supplier record with links, flexfields, and children`}
      />
      <Diagram title="VBCS → Fusion via service connection" className="mb-8">
        <DiagramNode tone="vbcs" title="VBCS Page" subtitle="Call Rest Endpoint / data provider" />
        <Arrow label="HTTPS + auth" />
        <DiagramNode tone="oic" title="Service Connection" subtitle="fscmRestApi base URL + credentials" />
        <Arrow label="REST / JSON" />
        <DiagramNode tone="fusion" title="Fusion Cloud" subtitle="fscmRestApi resources" />
      </Diagram>
      <Callout type="tip">
        Direct Fusion calls are great for <strong>simple, read-mostly lookups</strong>. If the flow
        needs orchestration, scheduled sync, transformations, or a human approval, route through OIC
        instead and keep Fusion access out of your pages.
      </Callout>

      <H2>Connecting to OIC</H2>
      <P>
        OIC integrations are exposed as REST endpoints under{" "}
        <K>/ic/api/integration/v1/integrations/{"{integrationName}"}/activate/invoke</K>. Create a
        connection to that base, authenticate with <strong>OAuth 2.0 client credentials</strong>{" "}
        (OIC issues you a client id/secret), and OIC returns a bearer token you send on every call.
      </P>
      <CodeBlock
        language="bash"
        filename="Invoke an OIC integration from VBCS"
        code={`POST https://<oic>/ic/api/integration/v1/integrations/ImportSupplier/activate/Invoke
Content-Type: application/vnd.oracle.resource+json
Authorization: Bearer <oauth-token>

{
  "request": {
    "supplierNumber": "SUP-10023",
    "payload": {
      "name": "Acme GmbH",
      "taxId": "DE123456789"
    }
  }
}

# → 202 Accepted — OIC processes asynchronously`}
      />
      <P>
        Notice the <K>{'{ "request": { … } }'}</K> envelope: app-driven OIC integrations expect
        their input wrapped in a <K>request</K> object, and return output under <K>response</K>. In
        your action chain, map the incoming page data into that envelope and read the reply from the
        <K> body.response </K> path.
      </P>
      <H3>Obtaining the OAuth token</H3>
      <P>
        VBCS handles the token dance for you: the connection stores the client id and secret, VBCS
        calls the token endpoint (<K>…/oauth2/v1/token</K> with{" "}
        <K>grant_type=client_credentials</K>), caches the access token, and refreshes it when it
        expires. You never see the secret in the browser.
      </P>

      <H2>Security tokens & OAuth</H2>
      <DataTable
        headers={["Flow", "Who is identified", "Used for", "Secret location"]}
        rows={[
          ["Authorization code", "The logged-in end user (SSO session)", "Fusion REST with the user's context, process tasks", "IDCS/OCI IAM; browser holds only the short-lived token"],
          ["Client credentials", "The application itself (machine-to-machine)", "OIC invoke endpoints, service-to-service calls", "Stored inside the service connection"],
          ["Basic", "A fixed user/password pair", "Legacy or simple Fusion read calls", "Stored inside the service connection (or OIC connection)"],
        ]}
      />
      <Callout type="warning">
        Never paste client secrets, passwords, or private keys into page expressions, code snippets,
        or business object fields. Anything you put in the front end is visible in the browser.{" "}
        <strong>Secrets belong in the service connection's secure storage</strong> — VBCS then sends
        only tokens over the wire.
      </Callout>

      <H2>Consuming process tasks</H2>
      <P>
        Human approval tasks from OIC <strong>Process Builder</strong> can surface right in your VBCS
        page. Point a connection at the OIC process/task API and authenticate with the{" "}
        <strong>logged-in user's session</strong> so each person sees only their own tasks; bind a
        Table to the task list data source (title, assignee, priority, due date); and per row, an
        action chain calls <K>approve</K> / <K>reject</K> / <K>claim</K>, then refreshes the table —
        the same pattern as any CRUD button.
      </P>

      <H2>Reacting to Fusion Business Events</H2>
      <P>
        Fusion can <strong>notify</strong> when something happens — an invoice is approved, a PO is
        released, a worker is hired — via <strong>business events</strong>. The event itself is
        consumed in the integration layer (OIC subscribes using the Fusion adapter's event
        subscription — see{" "}
        <a className="font-semibold text-emerald-300 hover:underline" href="/oic/styles">
          event-driven integrations
        </a>
        ). A VBCS page then has two clean ways to reflect that activity:
      </P>
      <UL>
        <li>
          <strong>Poll the result</strong> — the page's action chain calls the OIC endpoint (or
          Fusion REST) on a refresh/timer and re-renders the changed data. The page never subscribes
          to the raw event.
        </li>
        <li>
          <strong>Push via OIC → VBCS</strong> — OIC handles the event and updates data your page
          reads (e.g. writes to a business object or an OIC REST endpoint the page exposes), and the
          page refreshes on its schedule or on user action.
        </li>
      </UL>
      <Callout type="info">
        The pattern to remember: <strong>the event fires in Fusion, OIC reacts, VBCS reflects.</strong>{" "}
        A VBCS page is a consumer of the <em>result</em> — it does not subscribe to Fusion business
        events directly. Keep event handling in OIC (where the adapters and fault handling live) and
        let the page stay a thin view.
      </Callout>
      <Callout type="warning">
        If you need "live" updates, route them through an OIC-sourced refresh or a polling timer on
        the page. Relying on a manually triggered refresh means users see stale data until they act —
        decide the acceptable delay per feature.
      </Callout>

      <H2>Environment-specific endpoints (configuration)</H2>
      <P>
        Dev and production instances have different URLs. Rather than editing every connection on
        deploy, VBCS supports <strong>connection variables</strong> and{" "}
        <strong>environment inheritance</strong>: define the connection once with a placeholder like{" "}
        <K>https://{"{{ fusionHost }}"}/…</K>, then set <K>fusionHost</K> per environment. The same
        archive then runs anywhere without code changes.
      </P>
      <Callout type="info">
        Prefer <strong>environment-level variables</strong> over baking concrete hosts into
        connections. On import, the target environment's values take over automatically, so{" "}
        <em>one archive, many environments</em> — the key to a clean deployment story.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Build the data layer behind these connections with <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/business-objects">business objects & REST</a>.</li>
        <li>Put the fetched data on screen with <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/ui">UI components & patterns</a>.</li>
        <li>Keep credentials safe — see <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/security">security & roles</a>.</li>
        <li>Understand OIC's side of the call in the <a className="font-semibold text-emerald-300 hover:underline" href="/oic/overview">OIC overview</a>.</li>
      </UL>
    </>
  );
}
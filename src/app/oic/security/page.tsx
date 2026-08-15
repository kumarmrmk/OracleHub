import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "OIC Security & Authentication",
};

export default function OicSecurityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Security & authentication"
        description="Every connection in OIC has an identity, and every exposed endpoint must be protected. This page maps the auth types, the credential vault, certificates, OAuth 2.0 flows, and the roles that decide who can build, run, and manage integrations."
        breadcrumbs={[{ label: "OIC" }, { label: "Security & Auth" }]}
        updated="February 2025"
        level="Advanced"
      />

      <P>
        Security in OIC sits in four layers: who may <strong>use</strong> the cloud service
        (roles), what identity a <strong>connection</strong> presents to a target (auth types),
        where secrets live (<K>key stores</K> and the credential <K>vault</K>), and how a caller is
        admitted to your <strong>exposed endpoint</strong> (security policies).
      </P>

      <H2>Application roles that gate the console</H2>
      <P>
        OIC authorization is role-based. Oracle ships roles you grant to users or user groups:
      </P>
      <DataTable
        headers={["Role", "Sees / can do", "Typical owner"]}
        rows={[
          ["Service Administrator", "Everything: environments, agents, packages, all integrations", "OIC platform admin"],
          ["Integration Administrator", "Create, edit, activate, and manage integrations", "Integration lead"],
          ["Integration Developer", "Design and test integrations within allowed projects", "Developer/consultant"],
          ["Integration Ops / Monitor", "Start/stop, view instances, resubmit — but not redesign", "Operations analyst"],
          ["Insights / Reporting", "Read dashboards and packaged reports", "Ops or business"],
        ]}
      />
      <Callout type="info">
        The exact role names and what each grants vary slightly by OIC edition (gen 2 vs gen 3 —
        see <a className="font-semibold text-sky-300 hover:underline" href="/oic/gen3">the Gen 3 page</a>). The
        principle holds on both: <strong>least privilege</strong> — give the user only the role the
        job needs.
      </Callout>

      <H2>Authentication types on a connection</H2>
      <P>
        Each connection carries the credentials the target expects. Match the auth type to the
        target's contract:
      </P>
      <DataTable
        headers={["Auth type", "What it sends", "Used for"]}
        rows={[
          ["Basic", "Username/password", "Legacy endpoints and many on-prem systems"],
          ["Bearer token", "<K>Authorization: Bearer &lt;token&gt;</K>", "REST APIs that issue a token"],
          ["OAuth 2.0 client credentials", "Exchanges a client id/secret for an access token", "Modern SaaS: Fusion, Salesforce, NetSuite, OCI"],
          ["OAuth 2.0 resource owner", "User's credentials traded for a token", "APIs that act on behalf of a user"],
          ["Mutual TLS (mTLS)", "Present a client certificate to the server", "High-assurance partner APIs, banks"],
          ["Certificate / key", "Sign or decrypt with a stored key", "SOAP WSS, signing, MFT/PGP"],
        ]}
      />
      <Callout type="warning">
        In Fusion you almost always choose <K>OAuth 2.0 client credentials</K>: register an
        integration client in the Fusion console, put the client id/secret in the connection, and
        let OIC handle token acquisition and refresh. Never paste a token into the integration body —
        it expires and the flow breaks silently.
      </Callout>

      <H2>Where secrets live</H2>
      <P>
        OIC keeps secrets out of your flow and your code:
      </P>
      <UL>
        <li>
          <strong>Credentials stored in the connection</strong> — the normal place for passwords and
          client secrets. They travel with the connection but stay out of the integration body.
        </li>
        <li>
          <strong>OCI Vault / secrets</strong> — for Gen 3 and OCI-based setups, store sensitive
          values centrally and reference them.
        </li>
        <li>
          <strong>Key stores</strong> — hold the certificates and keys used for signing, TLS, and
          PGP. Renew them on a schedule; a lapsed cert is a classic "works in dev, fails in prod"
          cause.
        </li>
      </UL>

      <H2>Protecting the endpoints you expose</H2>
      <P>
        An activated app-driven integration is a real, callable URL. You control who can call it:
      </P>
      <DataTable
        headers={["Security policy", "Who can invoke", "When to choose"]}
        rows={[
          ["No security (open)", "Anyone with the URL", "Internal demos only — never production"],
          ["Basic auth", "Caller sends username/password", "Systems that cannot do OAuth"],
          ["OAuth 2.0 (client credentials)", "A registered client's token", "The standard for production API-to-API"],
          ["Custom / policy-based", "Your own authorization policy", "When entitlement logic lives outside OIC"],
        ]}
      />
      <Callout type="example" title="Worked example: exposing an integration for VBCS">
        <p className="mb-2"><strong>Setup:</strong> OAuth 2.0 resource owner policy; a VBCS page uses a service connection with its client id and secret.</p>
        <p className="mb-2"><strong>Call:</strong> VBCS exchanges the client credentials for an access token and calls the trigger endpoint with <K>Bearer</K>.</p>
        <p className="mb-0"><strong>Result:</strong> the integration stays private to your apps — no token in page code, no open endpoint.</p>
      </Callout>

      <H2>Agents and message protection</H2>
      <P>
        For on-premises targets, the <strong>connectivity agent</strong> opens an outbound-only
        tunnel to OIC. Two security controls matter there:
      </P>
      <UL>
        <li>
          <strong>Agent-based connection</strong> — the target is only reachable through the agent
          group you install on-premises.
        </li>
        <li>
          <strong>Message protection</strong> — integrity/encryption over the tunnel for
          sensitive payloads; the agent and OIC exchange credentials and the connection is marked
          accordingly.
        </li>
      </UL>

      <H2>Keys, certificates, and rotation</H2>
      <P>
        Certificates are the source of most OIC "sudden break" incidents. Keep a hygiene rule:
      </P>
      <DataTable
        headers={["Asset", "Purpose", "Renew before"]}
        rows={[
          ["Connectivity agent cert", "Identity for the agent tunnel", "Its expiry in OPC"],
          ["TLS truststore", "Server-side certs you trust", "Server migration / cert change at the target"],
          ["Signing key / PGP key", "Signing and file encryption", "Partner key rotation schedule"],
          ["Integration client secret", "OAuth token acquisition", "Fusion/OCI console rotation window"],
        ]}
      />
      <Callout type="danger">
        When an integration that worked fails with <K>401</K>/<K>403</K> or a cert error overnight,
        check <em>rotation</em> first: an OAuth secret or certificate was likely rotated at the
        target and the connection still holds the old value. It is rarely "the integration".
      </Callout>
      <CodeBlock
        language="bash"
        filename="test_access_token.sh"
        code={`# Quick check that a connection's OAuth credentials are still valid
curl -s -X POST "https://<tenant>.identity.oraclecloud.com/oauth2/v1/token" \\
  -u "<clientId>:<clientSecret>" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials&scope=urn:opc:idm:__myscopes__"`}
      />

      <H2>Next steps</H2>
      <UL>
        <li>Apply auth types when you pick adapters in <a className="font-semibold text-sky-300 hover:underline" href="/oic/adapters">adapters</a>.</li>
        <li>Watch tokens and instances in <a className="font-semibold text-sky-300 hover:underline" href="/oic/monitoring">monitoring</a>.</li>
        <li>Ship the secured portfolio safely in <a className="font-semibold text-sky-300 hover:underline" href="/oic/deployment">deployment</a>.</li>
      </UL>
    </>
  );
}
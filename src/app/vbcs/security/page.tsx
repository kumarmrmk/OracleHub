import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "VBCS Security & Roles",
};

export default function VbcsSecurityPage() {
  return (
    <>
      <PageHeader
        eyebrow="VBCS"
        title="Security & Roles"
        description="Who can see, build, and administer your VBCS app — and how it authenticates. This page covers SSO identity, application roles, page-level access, and the extra controls that appear when you embed an app inside Fusion."
        breadcrumbs={[{ label: "VBCS" }, { label: "Security" }]}
        updated="February 2025"
      />

      <P>
        VBCS separates <strong>who builds the app</strong> from <strong>who uses the app</strong>.
        Developers are managed in the environment's identity store; end users are managed through{" "}
        <strong>application roles</strong> that VBCS maps to your identity provider's users and
        groups. Understanding these two rails keeps your app both open to the right people and
        closed to everyone else.
      </P>

      <Callout type="info">
        A VBCS app is <strong>not</strong> a public website. By default it enforces login, and every
        user's identity — plus the roles attached to them — is checked on each page access. You
        decide how strict that gets.
      </Callout>

      <H2>Identity & SSO</H2>
      <P>
        End users authenticate through the environment's identity provider — Oracle Identity Cloud
        Service (IDCS) or, on OCI, <strong>OCI IAM</strong>. VBCS issues a session token at login,
        which also seeds the <K>SSO</K> context used by service connections:
      </P>
      <UL>
        <li>
          Users sign in once; VBCS redirects them to the provider's login page (or a corporate IdP
          via SAML federation) and back with a validated identity.
        </li>
        <li>
          That identity is passed to Fusion and OIC, giving{" "}
          <strong>single sign-on across the whole stack</strong> — log into Fusion, click into the
          VBCS extension, no second password.
        </li>
        <li>
          Access control is <strong>role-based</strong>: VBCS maps the user's provider groups to
          application roles, and pages/objects check those roles.
        </li>
      </UL>

      <H2>Application roles</H2>
      <P>
        Every VBCS app ships with a set of <strong>application roles</strong>. You assign provider
        users and groups to these roles, then control access by role.
      </P>
      <DataTable
        headers={["Role", "Default capability"]}
        rows={[
          ["Administrators", "Full app access: design, settings, role assignment, service connections"],
          ["Developers", "Can open the app in the designer and edit pages, flows, and logic"],
          ["Maintain_&lt;AppID&gt;", "Operational role: run the app, manage app data, access the object data pages"],
          ["Obligatory admin (OIC-created)", "Auto-created role that grants the app owner admin rights; never remove it"],
          ["Custom roles", "You define these and grant them specific page/object access in the app"],
        ]}
      />
      <Callout type="warning">
        Don't hand out <strong>Administrators</strong> to everyone "to keep it simple." Keep
        design-time roles lean; give end users a <strong>custom role</strong> with access to just
        the pages they need. Least privilege scales and survives audits.
      </Callout>

      <H2>Page & object access</H2>
      <P>
        Two granular controls decide what a logged-in user can actually reach:
      </P>
      <UL>
        <li>
          <strong>Page access</strong> — each page has an <K>Access</K> setting: public, logged-in
          user, or a specific role. Set it from the page's properties; unauthorized users get an
          access-denied screen or are redirected to login.
        </li>
        <li>
          <strong>Object access</strong> — business objects have their own read/write settings.
          You can even configure <strong>row-level security</strong> so users only see rows they
          own (e.g. "my drafts"), not the whole collection.
        </li>
      </UL>
      <Diagram title="Access decision for one request" className="mb-8">
        <DiagramNode tone="neutral" title="User session" subtitle="signed in via IDCS / OCI IAM" />
        <Arrow label="roles from groups" />
        <DiagramNode tone="vbcs" title="Application Roles" subtitle="custom role per use case" />
        <Arrow label="checked per request" />
        <DiagramNode tone="neutral" title="Page + Object access" subtitle="public / logged-in / role-based" />
      </Diagram>

      <H2>Embedded apps inside Fusion (ADV)</H2>
      <P>
        When you build in <strong>Application Development scope inside Fusion (ADV)</strong>, your
        VBCS app becomes an <strong>extension</strong> hosted under Fusion's own{" "}
        <strong>vanity URL</strong>. The big payoff is identity: the app inherits Fusion's security
        context, so there is no separate login.
      </P>
      <UL>
        <li>
          Users sign in to Fusion and reach your extension without a second authentication — true{" "}
          <strong>single sign-on</strong>.
        </li>
        <li>
          Roles can be aligned to Fusion job roles, so a Fusion user with "Manager" sees the
          extension's manager pages automatically.
        </li>
        <li>
          The extension appears inside the Fusion navigation (a menu item), feeling native to
          Fusion even though it is a VBCS app under the hood.
        </li>
      </UL>
      <Callout type="note">
        A standalone VBCS app and an ADV extension use the <em>same</em> page model. The difference
        is <strong>where it is hosted and who authenticates it</strong> — which is why the same app
        can be republished either way.
      </Callout>

      <H2>Securing service connections</H2>
      <P>
        Service connections hold credentials at <strong>design time</strong> and never expose them
        to the browser at runtime. Depending on the connection type:
      </P>
      <UL>
        <li>
          <strong>Basic</strong> — the username/password stays in the connection; the browser only
          sees the resulting <K>Authorization</K> header.
        </li>
        <li>
          <strong>OAuth client credentials</strong> — the client secret is stored securely; VBCS
          fetches and refreshes bearer tokens server-side.
        </li>
        <li>
          <strong>SSO</strong> — the token is tied to the user's session, so the backend sees{" "}
          <em>who</em> is acting, not one shared account.
        </li>
      </UL>
      <Callout type="danger">
        Treat the credentials in service connections as <strong>production secrets</strong>: export
        them only to trusted environments, restrict who can edit connections, and never paste a
        client secret or password into a page expression, a code snippet, or a business object
        field. Once a secret is in browser code, it is compromised.
      </Callout>

      <H2>Anonymous access</H2>
      <P>
        VBCS apps require sign-in by default. If a page must be public — a quote request form, a
        product catalog, a self-registration screen — you can turn on <strong>anonymous
        access</strong>:
      </P>
      <UL>
        <li>
          In the app's <strong>Settings → Security</strong>, deselect{" "}
          <K>Require authenticated access</K>. Visitors then get the <strong>Anonymous User</strong>{" "}
          authentication role automatically.
        </li>
        <li>
          Anonymous users are <strong>denied data by default</strong> — to let them read/write
          business objects, enable role-based security on the object and grant operations to the{" "}
          <K>Anonymous User</K> role explicitly.
        </li>
        <li>
          For service connections, enable <K>Allow anonymous access to the service connection
          infrastructure</K> and choose the authentication mechanism for anonymous users. (You may
          need <K>Override Security</K> if the option is inherited and disabled.)
        </li>
      </UL>
      <Callout type="danger">
        Allowing anonymous access to a backend exposes those endpoints <strong>without any
        authentication</strong> at a public URL. If you must do it: create a <em>dedicated
        backend</em> for the anonymous connections, and give it only the <em>minimal read-only
        credentials</em> those connections need. Do not hand the public the same backend your
        authenticated users use.
      </Callout>
      <Callout type="info">
        Change takes effect on the next <strong>stage or publish</strong> — a live app needs a new
        version, the setting change, and re-publish before anonymous access actually works.
      </Callout>

      <H2>Allowing access to your APIs</H2>
      <P>
        External clients — Process Automation, OIC, report tools — may need to read or update your
        app's business objects over REST. VBCS exposes a <strong>catalog API</strong> describing the
        endpoints of every business object, one per app version (Development, Staging, Live):
      </P>
      <UL>
        <li>
          Open <strong>Settings → Business Objects</strong> to copy each version's catalog URL. The
          Staged and Live URLs only return data after the app is staged/published.
        </li>
        <li>
          Under <strong>Security</strong>, choose the access model: allow anonymous access to the
          Describe endpoint, or enable basic authentication for the object REST APIs.
        </li>
        <li>
          Click <strong>Get Access Token</strong> in the Security pane to obtain a bearer token for
          calls made from outside Visual Builder.
        </li>
        <li>
          Anonymous Describe access still requires an <K>Authorization: Public</K> header — VBCS
          injects it for its own pages; external callers add it manually (curl example below).
        </li>
      </UL>
      <CodeBlock
        language="bash"
        filename="describe_endpoint.sh"
        code={`# Anonymous access to the business objects catalog requires the Public header
curl -v "https://<vbcshost>/ic/builder/rt/myapp/1.0/resources/data/describe?metadataMode=minimal" \\
  -H 'Authorization: Public'`}
      />
      <Callout type="warning">
        Cross-origin callers may need to be added to the CORS allowlist by an administrator, and
        non-browser clients may need to send a matching <K>Origin</K> header (or add CSRF headers
        to POSTs). If an external integration "works in the browser but fails from a server", CORS
        is the first suspect.
      </Callout>

      <H2>Audit & entitlement basics</H2>
      <P>
        VBCS and the surrounding Oracle services record what happened and who is entitled to what:
      </P>
      <UL>
        <li>
          <strong>Entitlements</strong> — the environment itself is governed by OIC/VBCS
          service entitlements; only entitled users can even open the designer or publish.
        </li>
        <li>
          <strong>Audit trails</strong> — the identity provider logs sign-ins; Fusion logs changes
          to records your extension writes; OIC logs integration invocations. Together they let you
          answer "who did what, when."
        </li>
        <li>
          <strong>Review habit</strong> — periodically reconcile the app role list against
          reality: remove departed users, demote over-privileged roles, and confirm page access
          settings still match the business rules.
        </li>
      </UL>
      <P>An audit event, as the identity provider would record it for one denied page access:</P>
      <CodeBlock
        language="json"
        filename="sample audit event"
        code={`{
  "eventTime": "2025-02-14T09:41:22Z",
  "actor": "j.doe@acme.com",
  "action": "PAGE_ACCESS",
  "resource": "/vbcs/MyApp/suppliers",
  "result": "DENIED",
  "reason": "role 'Viewers' does not grant this page"
}`}
      />

      <H2>Next steps</H2>
      <UL>
        <li>Harden the connections your pages use — see <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/connecting">connecting to Fusion & OIC</a>.</li>
        <li>Model the data those roles protect in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/business-objects">business objects & REST</a>.</li>
        <li>Take the secured app live in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/deploy">deployment & lifecycle</a>.</li>
      </UL>
    </>
  );
}
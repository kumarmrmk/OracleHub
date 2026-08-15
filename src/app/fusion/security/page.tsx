import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Security & Roles",
};

export default function FusionSecurityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Security & Roles"
        description="Fusion is fully role-based: users and service accounts are granted job roles, duty roles, and privileges, and data security policies decide which rows they may actually see and change. This page explains the role hierarchy and how to configure an integration user that can do its job — and nothing more."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Security & Roles" }]}
        updated="February 2025"
      />

      <P>
        Fusion's security model is the reason an integration "that works in the UI" often fails over
        REST, and vice versa. The API honors <em>exactly the same</em> roles and data policies as the
        web UI, so a service account is just a user whose roles happen to be tuned for machine
        access. Know the three layers below and you can predict most 403s before they happen.
      </P>

      <H2>How security is structured</H2>
      <P>
        Fusion implements <strong>Role-Based Access Control (RBAC)</strong> as a strict hierarchy
        of role types. Nothing is granted at "user" level beyond the roles themselves:
      </P>
      <DataTable
        headers={["Level", "What it is", "Example"]}
        rows={[
          ["Role", "A named set of duties/privileges assigned to a user", "Accounts Payable Manager, zz_zhr_SR_PRIV"],
          ["Duty role", "A functional grouping of one or more privileges", "Manage Supplier Invoices duty, Manage Workers duty"],
          ["Privilege", "The smallest unit of access to a function/data/entity", "Edit Supplier Invoice, View Person"],
        ]}
      />
      <Diagram title="Role hierarchy" className="mb-8">
        <DiagramNode tone="neutral" title="User / Service account" subtitle="job roles + data roles + abstract roles" />
        <Arrow />
        <DiagramNode tone="fusion" title="Job role" subtitle="aggregates duty roles" />
        <Arrow />
        <DiagramNode tone="fusion" title="Duty role" subtitle="groups privileges" />
        <Arrow />
        <DiagramNode tone="neutral" title="Privileges" subtitle="smallest unit of function access" />
      </Diagram>
      <P>
        In practice your grant matrix is: <strong>assign a job role to a user</strong>, the job role
        "contains" the duty roles, and the duty roles carry the privileges. That is why a single
        line in user management can open dozens of functional doors.
      </P>

      <H2>Job roles vs data roles vs abstract roles</H2>
      <P>
        Fusion distinguishes three <em>kinds</em> of role that you will see in Setup &amp;
        Maintenance and in the REST federation feeds:
      </P>
      <DataTable
        headers={["Role kind", "Purpose", "Example"]}
        rows={[
          ["Job role", "The user's function; aggregates duties and privileges into one grant", "Payables Manager, zz_zhr_SR_PRIV"],
          ["Data role", "Couples a role with a data security context (for example a business unit) so the same job role can mean different access in different orgs", "Accounts Payable Manager — Vision Operations"],
          ["Abstract role", "A generic capability independent of function, e.g. 'Employee' or 'Partner'", "ESS (employee self service), Mobile Sales Rep"],
        ]}
      />
      <P>
        For service accounts you usually care about the <strong>job role</strong> (functional
        capability) and the <strong>data role</strong> (scope). A user whose job role grants "Manage
        Suppliers" but whose data role scopes to only one business unit will see only that unit's
        suppliers over REST too.
      </P>
      <Callout type="info">
        A custom job role like <K>zz_zhr_SR_PRIV</K> is the community-standard naming for a
        "self-service" integration role: a narrowly scoped set of duties that gives an external
        system exactly the HR reads/writes it needs — nothing else.
      </Callout>

      <H2>Data security</H2>
      <P>
        Job/duty/privilege decide <em>what functions</em> you may invoke.{" "}
        <strong>Data security policies</strong> decide <em>which rows</em> those functions may see.
        A policy is a condition evaluated against each record: for example{" "}
        <K>Supplier is in 'Supplier BU' = Vision Ops</K> or <K>Role = 'ACCOUNTING_MANAGER'</K>.
      </P>
      <P>
        The practical consequence for integration developers:
      </P>
      <UL>
        <li>
          A service account needs a <strong>custom job role</strong> assembled from the exact duty
          roles and privileges the API calls demand — not a broad "all data" admin role.
        </li>
        <li>
          You must also ensure the account's <strong>data security contexts</strong> cover every org
          it touches. If Fusion applies a policy the account fails, you get a 403 even though the
          endpoint and credentials are correct.
        </li>
        <li>
          Test in a stage environment where you can inspect and adjust policies; a "works in dev,
          403 in prod" difference is almost always a data policy difference between environments.
        </li>
      </UL>

      <H2>REST service security</H2>
      <P>
        Calling a REST resource requires more than API credentials: the acting user must hold the{" "}
        <strong>IT Security user</strong> profile and the relevant{" "}
        <strong>REST Service</strong> access — Oracle grants REST invocation through a duty called{" "}
        <K>REST Service Invoke</K> on the service account.
      </P>
      <CodeBlock
        language="text"
        filename="Minimal checklist for a Fusion REST account"
        code={`1. User added to a job role with 'REST Service Invoke' duty
2. User assigned the specific REST resource duties it calls
   (e.g. 'Manage Suppliers REST Service', 'Import Payables Invoices REST Service')
3. User's data roles scope to the business units it accesses
4. For SOAP: user has the corresponding SOA web-services permission`}
      />
      <P>
        In OIC the <strong>Fusion adapter</strong> stores these credentials in the connection and
        reuses them per call. FBDI submissions use the same identity model plus a UCM upload
        permission for the <K>dataloader</K> folder, so the job-role checklist applies there too.
      </P>
      <Callout type="tip">
        When in doubt, reproduce the failing call in the{" "}
        <K>fscmRestApi</K> metadata explorer in a browser where you are logged in as the same user. If
        the explorer succeeds and your OIC invocation fails, the gap is usually the connection's
        credentials — not the role setup.
      </Callout>

      <H2>Passwords &amp; credentials vault</H2>
      <P>
        Fusion <strong>password policies force periodic expiry</strong> and often enforce complexity.
        An integration that hard-codes a Fusion password will silently break on rotation day — the
        most common cause of "the sync failed overnight" incidents.
      </P>
      <UL>
        <li>
          <strong>Prefer OAuth 2.0 client credentials</strong> with tokens minted from IDCS / OCI
          IAM instead of basic passwords; tokens are short-lived and never sit in config.
        </li>
        <li>
          For the Fusion adapter in OIC, store credentials in the <strong>connection</strong> and
          rotate them in one place, not in every integration.
        </li>
        <li>
          If you must keep a password-based service user, use long expiry, rotate on a calendar
          reminder, and monitor for failed logins after every maintenance window.
        </li>
      </UL>
      <Callout type="warning">
        A <strong>service account whose password expires</strong> breaks every integration that uses
        it at once. Put expiry checks and a shared rotation step (catalog or OIC connection, not the
        codebase) into your runbook — and treat any credential that reaches source control as fully
        compromised.
      </Callout>

      <H2>Sign-on &amp; federation</H2>
      <P>
        Fusion identity really lives in <strong>IDCS (Identity Cloud Service)</strong> / OCI IAM.
        Fusion users authenticate via <strong>SSO</strong>, and for organizational single sign-on
        Fusion acts as a <strong>SAML service provider</strong>: your IdP (Azure AD, Okta, AD FS…)
        issues assertions, IDCS maps them to Fusion users, and the session flows into both the UI
        and the REST/SOAP calls the browser makes.
      </P>
      <P>
        For automated process-to-process calls you usually <em>skip</em> SAML entirely and use OAuth
        client credentials directly from IDCS/OCI IAM — the token is your identity and scope is
        controlled there. Federation only matters when a human's session must map to a Fusion job
        role (the "SSO user clicks and the API uses their identity" pattern).
      </P>

      <H2>Next steps</H2>
      <UL>
        <li>
          See the identity flows wired across the whole stack in{" "}
          <a className="font-semibold text-accent hover:underline" href="/architecture">
            end-to-end architecture
          </a>
          .
        </li>
        <li>
          Protect the same boundary when calling REST in{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/rest-api">
            REST API fundamentals
          </a>
          .
        </li>
        <li>
          Understand how OIC connections hold these credentials safely in{" "}
          <a className="font-semibold text-accent hover:underline" href="/oic/overview">
            OIC overview
          </a>
          .
        </li>
      </UL>
    </>
  );
}
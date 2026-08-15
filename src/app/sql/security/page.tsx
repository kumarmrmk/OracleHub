import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Security",
};

export default function SqlSecurityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Security"
        title="Security"
        description="Users and roles, system vs object privileges, GRANT and REVOKE, profiles and password concepts, synonyms for controlled access, and row-level security with Virtual Private Database."
        breadcrumbs={[{ label: "SQL" }, { label: "Security" }]}
        updated="2026"
      />

      <P>
        Database security is a story of <strong>two lists</strong>: <em>who</em> (users and the
        roles they hold) and <em>what</em> (the privileges attached). Almost everything in this page
        reduces to keeping those two lists small and deliberate — the database enforces them hard,
        which is precisely why the rights you grant here are the ones an auditor asks about.
      </P>

      <H2>Users and roles</H2>
      <P>
        A <strong>user</strong> is an account; a <strong>role</strong> is a named bundle of
        privileges you grant to users. Roles are what let you manage hundreds of accounts without
        hundreds of GRANT statements:
      </P>
      <CodeBlock
        language="sql"
        filename="Create a login, build a role, attach it"
        code={`CREATE USER sales_app IDENTIFIED BY StrongPass123;
CREATE ROLE sales_read_role;

GRANT  CREATE SESSION TO sales_app;
GRANT  sales_read_role TO sales_app;`}
      />
      <UL>
        <li>Never hand out <K>DBA</K> casually — it is the everything-role.</li>
        <li>Role membership can be default (always active) or granted on demand; quiz yourself on which privileges are "role-granted" when a user shows a surprising capability.</li>
        <li>Account lifecycle: lock unused accounts (<K>ALTER USER … ACCOUNT LOCK</K>), rotate passwords, and revoke roles when people change jobs.</li>
      </UL>

      <H2>System vs object privileges</H2>
      <DataTable
        headers={["Kind", "Scope", "Examples"]
        }
        rows={[
          ["System privilege", "Actions on the database as a whole", "CREATE SESSION, CREATE TABLE, CREATE ANY VIEW, ALTER ANY TABLE"],
          ["Object privilege", "Actions on a specific table/view/etc.", "SELECT on HR.EMPLOYEES, UPDATE on custom extras, EXECUTE on a procedure"],
        ]}
      />
      <P>
        The wrinkle: <K>CREATE TABLE</K> is a system privilege (you may create tables in your own
        schema), but working on <em>someone else's</em> table is an object privilege on that table.
      </P>

      <H2>GRANT and REVOKE</H2>
      <CodeBlock
        language="sql"
        filename="Object privileges, sized to the job"
        code={`GRANT SELECT, INSERT, UPDATE ON customers TO sales_app;
GRANT EXECUTE ON pkg_payments TO billing_clerk;

REVOKE UPDATE ON customers FROM sales_app;   -- remove read-write

-- The recursive version: grant with ADMIN OPTION passes it on
GRANT SELECT, UPDATE ON customers TO app_owner WITH GRANT OPTION;`}
      />
      <UL>
        <li>Grant the <em>minimum</em> — SELECT where reading suffices, not SELECT+ALL.</li>
        <li><K>WITH GRANT OPTION</K> lets the grantee re-grant; use it only when you mean delegation.</li>
        <li>Dictionary check: <K>USER_TAB_PRIVS</K> shows what you hold on which object.</li>
      </UL>
      <Callout type="danger">
        <K>PUBLIC</K> means everyone, forever, and auditing it is hard. Grants to <K>PUBLIC</K> (old
        demos and sample setups do this constantly) are a classic security finding — check{" "}
        <K>ALL_TAB_PRIVS WHERE grantee = 'PUBLIC'</K> before going live.
      </Callout>

      <H2>Profiles and password concepts</H2>
      <P>
        A <strong>profile</strong> sets account limits — password rules, lifetime, failed-login
        locking. It applies to a user, not to a schema:
      </P>
      <CodeBlock
        language="sql"
        filename="A sane default account policy"
        code={`CREATE PROFILE app_user_profile LIMIT
  FAILED_LOGIN_ATTEMPTS  5
  PASSWORD_LOCK_TIME     1
  PASSWORD_LIFE_TIME     90
  PASSWORD_REUSE_MAX     5
  PASSWORD_VERIFY_FUNCTION VERIFY_FUNCTION_11G;   -- complexity check

ALTER USER sales_app PROFILE app_user_profile;`}
      />
      <Callout type="tip">
        The <K>DEFAULT</K> profile ships permissive (no expiry). Organizations that care apply
        versions of the above globally; anyone who inherits DEFAULT should expect an audit flag.
      </Callout>

      <H2>Synonyms for controlled access</H2>
      <P>
        A <strong>synonym</strong> is a private alias. Used well, it both shortens names and, more
        importantly, hides <em>where</em> an object really lives — so you can relocate tables
        without breaking every query:
      </P>
      <CodeBlock
        language="sql"
        filename="Public synonyms and the schema they point at"
        code={`GRANT SELECT ON hr.employees TO reporting;
CREATE PUBLIC SYNONYM employees FOR hr.employees;

-- reporting now runs "SELECT * FROM employees" -> hr.employees
-- If the table moves to REPORTING schema, only the synonym changes.`}
      />
      <P>
        Synonym + revoke is the controlled-access recipe: the user sees <K>employees</K>, never{" "}
        <K>HR.PAY_ROLL_RAW</K> — and if the real table must move, the pointer changes, the users do
        not.
      </P>

      <H2>Row-level security / Virtual Private Database (VPD)</H2>
      <P>
        Object privileges control <em>which tables</em>; <strong>VPD</strong> controls{" "}
        <em>which rows</em>. A policy function appends a <K>WHERE</K> to every SQL against the
        table, driven by <K>SYS_CONTEXT</K> values (the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/oracle-specific">Oracle-specific page</a>{" "}
        introduced SYS_CONTEXT):
      </P>
      <CodeBlock
        language="sql"
        filename="A VPD policy: salespeople see only their own customers"
        code={`-- The policy body is a PL/SQL function returning a WHERE-clause string
CREATE OR REPLACE FUNCTION restrict_sales (schema_name VARCHAR2, table_name VARCHAR2)
RETURN VARCHAR2
IS
BEGIN
  RETURN 'owner = SYS_CONTEXT(''APP'', ''SALES_REP'')';
END;

BEGIN
  DBMS_RLS.ADD_POLICY('SALES', 'CUSTOMERS', 'sales_policy',
    'SALES', 'RESTRICT_SALES', 'SELECT, UPDATE');
END;`}
      />
      <UL>
        <li>VPD applies invisibly and centrally — you cannot forget the WHERE. That is its power and its danger: code that writes through the policy sees only its own rows.</li>
        <li>Row-level restrictions can also be built with views (the "views as security" pattern) — simpler, but easier to bypass than VPD.</li>
        <li>Enable <K>AUDIT</K> traces for privileged roles; data-touching SQL before role changes is the usual audit ask.</li>
      </UL>
    </>
  );
}
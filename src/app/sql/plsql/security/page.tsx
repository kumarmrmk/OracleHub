import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — Security & Deployment",
};

export default function SqlPlsqlSecurityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="Security & deployment"
        description="Definer rights vs invoker rights (AUTHID), grants for procedures and packages, dependencies and recompilation, compile errors and warnings, and source-controlled deployment scripts."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "Security & Deployment" }]}
        updated="2026"
      />

      <P>
        A stored program is only useful if people can run it safely and the right version ships
        everywhere. This page is the boundary between "I wrote a procedure" and "the organisation
        trusts and deploys that procedure" — <K>AUTHID</K> rights, explicit grants, dependency
        management, and compile hygiene baked into a promotion pipeline.
      </P>

      <H2>Definer rights vs invoker rights (AUTHID)</H2>
      <P>
        When a procedure runs, whose privileges decide what SQL is allowed inside it? That is the{" "}
        <K>AUTHID</K> question, and it is Oracle's single most security-relevant PL/SQL switch:
      </P>
      <DataTable
        headers={["Mode", "Runs SQL as…", "Effect"]
        }
        rows={[
          ["AUTHID DEFINER (default)", "The owner of the procedure", "Callers run with the owner's privileges — the classic trusted-wrapper pattern"],
          ["AUTHID CURRENT_USER (invoker)", "The caller (current user)", "Callers' own privileges apply — safer for shared objects, needs grants on every table"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Declaring the mode explicitly"
        code={`CREATE OR REPLACE PROCEDURE pay_vendor (p_inv NUMBER)
AUTHID CURRENT_USER          -- invoker rights
IS
BEGIN
  -- inside here, SQL runs with the CALLER's privileges:
  -- the caller must hold UPDATE on the tables used
  UPDATE ap_controls SET paid_flag = 'Y' WHERE invoice_id = p_inv;
END;
/`}
      />
      <Callout type="warning">
        <K>DEFINER</K> rights are how you hand users a "trusted wrapper" around tables they may not
        touch directly — but the same mechanism silently endows <em>every</em> caller with the
        owner's power for that procedure. Audit what each definer-rights program does; a careless
        <K>EXECUTE</K> to a broad role is how privilege leaks.
      </Callout>

      <H2>Grants for procedures and packages</H2>
      <P>
        Granting <K>EXECUTE</K> controls who may run the program; grant on the package covers its
        whole surface:
      </P>
      <CodeBlock
        language="sql"
        filename="The grant dance"
        code={`CREATE ROLE app_processor;
GRANT EXECUTE ON pkg_finance TO app_processor;      -- one grant, whole API
GRANT app_processor TO staff01, staff02;

-- the inverse
REVOKE EXECUTE ON pkg_finance FROM staff02;`}
      />
      <UL>
        <li>Grant <K>EXECUTE</K>, never direct table DML, when the package is your API.</li>
        <li>Roles vs direct grants: roles group entitlements and are changed everywhere at once.</li>
        <li>Object-level audit: <K>ALL_TAB_PRIVS</K> shows which role holds <K>EXECUTE</K> on what.</li>
      </UL>

      <H2>Dependencies and recompilation</H2>
      <P>
        PL/SQL objects record dependencies: a procedure touching <K>customers</K> is "dependent" on
        it. Change the table and the dependent becomes <strong>INVALID</strong>; Oracle recompiles
        it on next use, or you force a recompile:
      </P>
      <CodeBlock
        language="sql"
        filename="Find and fix invalid objects"
        code={`SELECT object_name, object_type, status
FROM   user_objects
WHERE  object_type IN ('PROCEDURE','FUNCTION','PACKAGE','TRIGGER')
  AND  status = 'INVALID';

-- force recompile (also after changing the underlying table)
ALTER PACKAGE pkg_finance COMPILE BODY;   -- or: ALTER PROCEDURE <name> COMPILE

-- the classic one-command sweep for a pushed change
EXEC DBMS_UTILITY.COMPILE_SCHEMA(USER);`}
      />
      <Callout type="info">
        Package <em>bodies</em> are invalidated less often than package <em>specs</em> — one more
        reason to keep logic in the body: changing the body often recompiles quietly, changing a
        spec signature can ripple through every caller.
      </Callout>

      <H2>Compile errors and warnings</H2>
      <P>
        A failed <K>CREATE OR REPLACE</K> leaves the object <em>compiled-with-errors</em>. The
        compiler also surfaces warnings the compiler sees during PLW checks. The three commands for
        the review loop:
      </P>
      <CodeBlock
        language="sql"
        filename="See what the compiler thought"
        code={`-- errors on the last creation
SHOW ERRORS;

-- persistent view of both
SELECT * FROM user_errors WHERE name = 'PKG_FINANCE';

-- compiler warnings (optional strictness)
ALTER SESSION SET PLSQL_WARNINGS = 'ENABLE:ALL';`}
      />
      <Callout type="tip">
        Make friendly errors a habit: a bad <K>CREATE</K> in a script should stop the deployment,
        not leave a "compiled with errors" object that silently old-version executes. Check{" "}
        <K>USER_ERRORS</K> for the count before promoting.
      </Callout>

      <H2>Source control and deployment scripts</H2>
      <P>
        PL/SQL ships as <strong>files</strong> (the CREATE scripts) — so it belongs in Git exactly
        like the rest of the codebase, and promotion is a scripted, tested play:
      </P>
      <UL>
        <li><strong>Files, not the live</strong> — one file per object (or per package pair: spec + body), versioned.</li>
        <li><strong>Idempotent promotable</strong> — <K>CREATE OR REPLACE</K> everywhere, so rerunning the script is safe.</li>
        <li><strong>Environments in steps</strong> — dev → test → prod, each with its own schema/grants/git tag.</li>
        <li><strong>Compile-and-check gate</strong> — run the file, then verify <K>USER_ERRORS</K> is empty and objects are VALID.</li>
        <li><strong>Rollback strategy</strong> — keep the previous file(s)/tag; <K>CREATE OR REPLACE</K> with the old version restores behavior (data-schema changes still need a plan).</li>
      </UL>
      <CodeBlock
        language="sql"
        filename="The promotion-play shape (conceptual)"
        code={`-- 01_package_spec.sql   (git, tagged v2.1)
CREATE OR REPLACE PACKAGE pkg_finance ... ;
-- 02_package_body.sql
CREATE OR REPLACE PACKAGE BODY pkg_finance ... ;
-- 03_grants.sql
GRANT EXECUTE ON pkg_finance TO app_processor;

-- post-run check (fail the play if any rows):
SELECT COUNT(*) FROM user_errors;       -- expect 0`}
      />
      <Callout type="example">
        Tie it together: <K>AUTHID DEFINER</K> + a package + a role + an idempotent file + a compile
        gate is the exact artifact an Oracle shop runs through its pipeline hundreds of times. That
        combination — not any single keyword — is what "production PL/SQL" means.
      </Callout>
    </>
  );
}
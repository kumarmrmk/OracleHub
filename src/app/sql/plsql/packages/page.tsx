import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — Packages",
};

export default function SqlPlsqlPackagesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="Packages"
        description="Package specification vs body, public vs private objects, package-level variables and the initialization block, why real projects are built around packages, and the built-ins DBMS_OUTPUT, UTL_FILE, and DBMS_SCHEDULER."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "Packages" }]}
        updated="2026"
      />

      <P>
        A <strong>package</strong> bundles related procedures, functions, types, and variables into
        one deployable, grantable unit. Standalone programs exist, but production Oracle code is
        organized into packages almost without exception — because they deliver encapsulation,
        overloading, shared state, and one-grant deployment that loose procedures cannot.
      </P>

      <H2>Specification vs body</H2>
      <P>
        A package is <strong>two files</strong>: the <strong>specification</strong> (the public
        contract) and the <strong>body</strong> (the implementation). They are compiled separately
        and can even be re-deployed separately:
      </P>
      <CodeBlock
        language="sql"
        filename="Spec first, then body"
        code={`-- SPECIFICATION: what the world may call
CREATE OR REPLACE PACKAGE pkg_finance AS
  FUNCTION total_spend (p_customer NUMBER) RETURN NUMBER;
  PROCEDURE apply_credit (p_customer NUMBER, p_amount NUMBER);
  c_default_limit CONSTANT NUMBER := 1000;   -- public constant
END pkg_finance;
/

-- BODY: how it actually works
CREATE OR REPLACE PACKAGE BODY pkg_finance AS
  v_calls NUMBER := 0;                       -- PRIVATE package variable

  FUNCTION total_spend (p_customer NUMBER) RETURN NUMBER IS
    v_total NUMBER;
  BEGIN
    SELECT NVL(SUM(total_amount),0) INTO v_total FROM orders
    WHERE customer_id = p_customer;
    RETURN v_total;
  END;

  PROCEDURE apply_credit (p_customer NUMBER, p_amount NUMBER) IS
  BEGIN
    UPDATE customers SET credit_limit = NVL(credit_limit,0) + p_amount
    WHERE customer_id = p_customer;
    v_calls := v_calls + 1;
  END;
END pkg_finance;
/

SELECT pkg_finance.total_spend(101) FROM dual;  -- public use`}
      />
      <UL>
        <li>Calling convention: <K>package_name.program_name</K>.</li>
        <li>Anything only declared in the body is <strong>private</strong> — invisible to callers, which is how you hide internals.</li>
        <li>The spec is a contract; grant <K>EXECUTE</K> on the <em>package</em> and the whole surface becomes available.</li>
      </UL>

      <H2>Public vs private</H2>
      <DataTable
        headers={["Visibility", "Declared in", "Can callers use it?"]
        }
        rows={[
          ["Public", "The package specification", "Yes — the documented API"],
          ["Private", "Only the package body", "No — implementation detail, changeable without breaking callers"],
        ]}
      />
      <Callout type="tip">
        Design rule that keeps packages healthy: the specification exposes the <em>what</em>, and
        everything volatile lives in the body. Change the body all you like; callers depending on the
        spec rarely notice. This is exactly why Oracle ships <K>DBMS_*</K> as packages — you inherit
        a stable API around a swappable engine.
      </Callout>

      <H2>Package variables &amp; the initialization block</H2>
      <P>
        A package can hold <strong>session-level state</strong>: variables declared in the spec or
        body persist for your whole session between calls — and the body may run an initialization
        block the first time the package is touched:
      </P>
      <CodeBlock
        language="sql"
        filename="State + run-once initialization"
        code={`CREATE OR REPLACE PACKAGE pkg_config AS
  PROCEDURE get (p_key VARCHAR2, p_value OUT VARCHAR2);
END;
/
CREATE OR REPLACE PACKAGE BODY pkg_config AS
  v_cache DATE;                 -- package variable: lives for the session

  PROCEDURE get (p_key VARCHAR2, p_value OUT VARCHAR2) IS
  BEGIN
    p_value := p_key;  -- real impl reads a config table
  END;

BEGIN                          -- package initialization block
  v_cache := SYSDATE;          -- runs once per session, at first touch
END;
/`}
      />
      <Callout type="warning">
        Package state is <strong>per session</strong> and reset at session end, not per package
        compile — and it is shared by every program in the package. That is perfect for caches and
        counters, and a subtle bug source if you reuse one "global" variable for two purposes.
      </Callout>

      <H2>Why real projects are built on packages</H2>
      <UL>
        <li><strong>Encapsulation</strong> — a stable public API over a swappable engine.</li>
        <li><strong>Deployment as one unit</strong> — grant <K>EXECUTE ON pkg</K> once; no per-procedure grants.</li>
        <li><strong>Overloading</strong> — only possible inside packages (the procedures page showed it).</li>
        <li><strong>Shared, session-cached data</strong> — lookup tables loaded once into memory per session.</li>
        <li><strong>Matching the vendor pattern</strong> — Fusion/OIC integration code calls <K>DBMS_*</K> packages constantly; your own code belongs in packages so it looks like the platform's.</li>
      </UL>

      <H2>Common built-in packages you will actually use</H2>
      <DataTable
        headers={["Package", "What you use it for", "Look out for"]
        }
        rows={[
          ["DBMS_OUTPUT", "PUT_LINE/PUT — server-side debugging output", "Only visible with SERVEROUTPUT ON; not for production logging"],
          ["UTL_FILE", "Read/write server-side files (via directories)", "Needs a DIRECTORY object + OS privileges (files page)"],
          ["DBMS_SCHEDULER", "Create OS-independent jobs, schedules, programs", "Job failures surface in DBA_SCHEDULER_JOB_RUN_DETAILS"],
          ["DBMS_APPLICATION_INFO", "Set the session/client info strings for monitoring", "The instrumentation tool the performance page recommends"],
          ["DBMS_MVIEW / DBMS_REFRESH", "Refresh materialized views", "Plumbing behind Fast Refresh settings"],
          ["DBMS_STATS", "Gather optimizer statistics", "The single best performance lever there is"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="A one-off DBMS_SCHEDULER job — the modern replacement for DBMS_JOB"
        code={`BEGIN
  DBMS_SCHEDULER.CREATE_JOB(
    job_name        => 'J_REFRESH_REPORTS',
    job_type        => 'PLSQL_BLOCK',
    job_action      => 'BEGIN pkg_reports.refresh_all; END;',
    start_date      => SYSTIMESTAMP,
    repeat_interval => 'FREQ=DAILY; BYHOUR=2',
    enabled         => TRUE
  );
END;
/`}
      />
    </>
  );
}
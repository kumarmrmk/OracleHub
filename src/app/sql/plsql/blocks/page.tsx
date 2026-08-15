import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — Blocks, Variables & Scope",
};

export default function SqlPlsqlBlocksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="Blocks, variables & scope"
        description="The DECLARE / BEGIN / EXCEPTION / END skeleton, anonymous blocks, comments and DBMS_OUTPUT.PUT_LINE, variables and constants, %TYPE and %ROWTYPE anchoring, bind variables, and how scope flows through nested blocks."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "Blocks & Variables" }]}
        updated="2026"
      />

      <P>
        Every PL/SQL program is a <strong>block</strong>. Learning the block's skeleton first makes
        every later topic (procedures, packages, triggers) feel like variations on it. This page
        also settles the variable rules that govern everything you write — including the{" "}
        <K>%TYPE</K> / <K>%ROWTYPE</K> anchoring that is a PL/SQL signature skill.
      </P>

      <H2>Block structure</H2>
      <CodeBlock
        language="sql"
        filename="The four-section skeleton"
        code={`DECLARE
  v_message  VARCHAR2(50) := 'Hello';    -- declarations (optional)
BEGIN
  DBMS_OUTPUT.PUT_LINE(v_message);       -- executable statements
EXCEPTION
  WHEN OTHERS THEN                       -- handlers (optional)
    DBMS_OUTPUT.PUT_LINE(SQLERRM);
END;
/`}
      />
      <DataTable
        headers={["Section", "Mandatory?", "Contents"]
        }
        rows={[
          ["DECLARE", "No", "Variables, constants, types, cursors"],
          ["BEGIN ... END", "Yes", "The executable statements — the only required pair"],
          ["EXCEPTION", "No", "Error handlers (covered on the exceptions page)"],
          ["labels", "No", "Optional <<name>> labels and trailing / in SQL*Plus/SQLcl"],
        ]}
      />

      <H2>Anonymous blocks</H2>
      <P>
        A block that is <em>not</em> stored in the database runs once and is gone — that is an{" "}
        <strong>anonymous block</strong>. It is the scratchpad: testing logic, running ad-hoc SQL,
        wrapping a multi-step job in a script:
      </P>
      <CodeBlock
        language="sql"
        filename="An anonymous block in SQLcl / SQL Developer"
        code={`SET SERVEROUTPUT ON

DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM orders;
  DBMS_OUTPUT.PUT_LINE('Total orders: ' || v_count);
END;
/`}
      />
      <UL>
        <li><K>SET SERVEROUTPUT ON</K> makes <K>DBMS_OUTPUT</K> visible; without it nothing prints.</li>
        <li>Anonymous blocks cannot be called by other code — turn them into procedures/functions when other code must invoke them.</li>
        <li>They are perfect for one-off PL/SQL in a migration script or a test harness.</li>
      </UL>

      <H2>Comments and output</H2>
      <CodeBlock
        language="sql"
        filename="Both comment styles + PUT_LINE"
        code={`DECLARE
  v_x NUMBER := 42;
BEGIN
  -- single-line comment
  /* multi-line
     comment */
  DBMS_OUTPUT.PUT_LINE('x  = ' || v_x);
  DBMS_OUTPUT.PUT_LINE('x*2 = ' || (v_x * 2));
END;
/`}
      />
      <P>
        <K>DBMS_OUTPUT.PUT_LINE</K> writes to the server message buffer that the session displays.
        It is for development and small volumes — for production logging you use your own tables or{" "}
        <K>DBMS_APPLICATION_INFO</K> (see the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/plsql/performance">performance page</a>),
        never <K>PUT_LINE</K> on huge loops.
      </P>

      <H2>Variables, constants, initialization</H2>
      <CodeBlock
        language="sql"
        filename="Declarations with defaults"
        code={`DECLARE
  v_name      VARCHAR2(60) := 'Acme';     -- initialized at declaration
  v_total     NUMBER(12,2) DEFAULT 0;     -- DEFAULT also works
  v_created   DATE := SYSDATE;
  v_status    VARCHAR2(10);
  c_tax_rate  CONSTANT NUMBER := 0.10;    -- a constant: never changes
BEGIN
  v_status := 'OPEN';                      -- assignment uses :=
  DBMS_OUTPUT.PUT_LINE(v_name || ' ' || v_status);
END;
/`}
      />
      <UL>
        <li>Variable naming convention <K>v_</K>, constant <K>c_</K>, parameter <K>p_</K>, cursor <K>c_</K>/<K>cur_</K> — shops differ but naming is expected.</li>
        <li><K>CONSTANT</K> values cannot be reassigned; declaring them documents intent and lets the compiler catch mistakes.</li>
        <li>Don't initialize in DECLARE with expressions that fail (e.g. a <K>SELECT</K>) — keep that in BEGIN.</li>
      </UL>

      <H2>%TYPE and %ROWTYPE — anchor to the schema</H2>
      <P>
        The single most valuable PL/SQL habit. Instead of guessing a column's type, you{" "}
        <strong>anchor</strong> your variable to it — if the table changes, your code follows:
      </P>
      <CodeBlock
        language="sql"
        filename="%TYPE for a column, %ROWTYPE for a whole row"
        code={`DECLARE
  v_name    customers.customer_name%TYPE;   -- exactly the column's type
  v_row     customers%ROWTYPE;              -- a record with every column
BEGIN
  SELECT customer_name INTO v_name FROM customers WHERE customer_id = 101;
  DBMS_OUTPUT.PUT_LINE(v_name);

  -- %ROWTYPE: fetch the whole row into the record
  SELECT * INTO v_row FROM customers WHERE customer_id = 101;
  DBMS_OUTPUT.PUT_LINE(v_row.customer_name || ' / ' || v_row.credit_limit);
END;
/`}
      />
      <UL>
        <li><K>%TYPE</K> tracks a single column's type, precision, nullability.</li>
        <li><K>%ROWTYPE</K> gives you one record with all columns — dot-reference them as <K>v_row.column</K>.</li>
        <li>
          <K>SELECT * INTO v_row</K> works because the record's column list matches the table —
          the reason anchoring is safer than spelling out dozens of scalars.
        </li>
      </UL>

      <H2>Bind variables</H2>
      <P>
        Outside PL/SQL-anonymous names, <K>:</K>variables in dynamic SQL and SQLcl are{" "}
        <strong>bind variables</strong>: placeholders the server parses once and fills per call
        (the performance rule from the SQL section). In a PL/SQL script you can declare them with{" "}
        <K>VARIABLE</K>:
      </P>
      <CodeBlock
        language="sql"
        filename="A session-level bind variable in SQLcl"
        code={`VARIABLE v_amt NUMBER
BEGIN
  :v_amt := 5000;                          -- assign through the colon
END;
/
SELECT customer_name FROM customers WHERE credit_limit >= :v_amt;`}
      />
      <P>
        Inside standalone PL/SQL you rarely need <K>VARIABLE</K> — your <K>v_</K> variables are the
        in-memory values, and bind variables come back into play with{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/plsql/dml">EXECUTE IMMEDIATE</a>{" "}
        and applications that drive PL/SQL from Java/Python.
      </P>

      <H2>Scope: local, global, package</H2>
      <DataTable
        headers={["Scope", "Visible where", "Lives where"]
        }
        rows={[
          ["Local", "Only inside the block that declares it (and nested blocks)", "A block's DECLARE section"],
          ["Global-ish", "Visible to nested blocks declared beneath it", "An outer block's DECLARE, seen by inner blocks"],
          ["Package-level", "Across every program in the package, for the session", "A package spec's or body's declarations"],
          ["Subprogram parameter", "Inside that procedure/function only", "The IN/OUT parameter list"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Outer visible inside; inner hidden outside"
        code={`DECLARE
  v_outer NUMBER := 10;
BEGIN
  DECLARE
    v_inner NUMBER := 20;
  BEGIN
    DBMS_OUTPUT.PUT_LINE(v_outer);   -- 10 — outer is visible here
    DBMS_OUTPUT.PUT_LINE(v_inner);   -- 20 — own variable
  END;
  -- v_inner is gone here; referencing it is a compile error
END;
/`}
      />
      <Callout type="warning">
        A nested block may <em>shadow</em> an outer name by redeclaring it — then both "exist" but
        the inner one wins. Shadowing is legal and a common source of "why did my variable change"
        bugs. The compiler will often warn; don't rely on that — avoid reusing names.
      </Callout>
    </>
  );
}
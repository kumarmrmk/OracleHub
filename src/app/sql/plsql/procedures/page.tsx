import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — Procedures & Functions",
};

export default function SqlPlsqlProceduresPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="Procedures & functions"
        description="CREATE / REPLACE / EXECUTE / DROP, the IN / OUT / IN OUT parameter modes, default parameters, function return types, calling functions from SQL, and overloading."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "Procedures & Functions" }]}
        updated="2026"
      />

      <P>
        <strong>Procedures</strong> do things; <strong>functions</strong> return values. Both are
        stored in the database, callable from SQL, applications, and other PL/SQL. The distinction
        matters more in Oracle than most languages because of one hard SQL-rule, and the parameter
        modes govern how data travels in and out.
      </P>

      <H2>Procedures — and the IN / OUT / IN OUT modes</H2>
      <DataTable
        headers={["Mode", "Data direction", "Default?", "Typical use"]
        }
        rows={[
          ["IN", "Into the procedure (read-only)", "Yes", "The inputs; cannot be assigned"],
          ["OUT", "Out of the procedure", "No", "Return values, e.g. OUT p_error, OUT result set"],
          ["IN OUT", "In, changed, and back out again", "No", "Accumulators and 'update this value' parameters"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Create, call, and check the modes"
        code={`CREATE OR REPLACE PROCEDURE adjust_credit (
  p_customer IN  customers.customer_id%TYPE,
  p_amount   IN  NUMBER,          -- read only
  p_new_limit OUT customers.credit_limit%TYPE,   -- caller gets this
  p_count    IN OUT NUMBER        -- in, incremented, handed back
) IS
BEGIN
  UPDATE customers
  SET    credit_limit = NVL(credit_limit, 0) + p_amount
  WHERE  customer_id = p_customer;

  SELECT credit_limit INTO p_new_limit FROM customers WHERE customer_id = p_customer;
  p_count := p_count + 1;     -- IN OUT: changes flow back to the caller
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    p_new_limit := -1;
END adjust_credit;
/

DECLARE
  v_customer NUMBER := 101;
  v_limit    customers.credit_limit%TYPE;
  v_count    NUMBER := 0;
BEGIN
  adjust_credit(v_customer, 500, v_limit, v_count);
  DBMS_OUTPUT.PUT_LINE('new limit ' || v_limit || '. calls=' || v_count);
END;
/`}
      />
      <Callout type="warning">
        An <K>OUT</K> parameter holds no trustworthy value when the procedure raises an exception
        mid-way — code the error path explicitly (as the <K>WHEN NO_DATA_FOUND</K> above does), and
        never read an <K>OUT</K> expecting the pre-call value.
      </Callout>

      <H2>Default parameters</H2>
      <P>
        Parameters can carry defaults, letting callers omit them — the classic pattern for optional
        switches:
      </P>
      <CodeBlock
        language="sql"
        filename="Defaults make calls shorter"
        code={`CREATE OR REPLACE PROCEDURE run_report (
  p_report  VARCHAR2,
  p_format  VARCHAR2 DEFAULT 'PDF',
  p_once    BOOLEAN  DEFAULT TRUE
) IS
BEGIN
  DBMS_OUTPUT.PUT_LINE(p_report || ' as ' || p_format);
END;
/

BEGIN
  run_report('AP_AGING');                      -- uses both defaults
  run_report('AP_AGING', 'CSV');               -- format only, default once
  run_report('AP_AGING', p_once => FALSE);     -- named notation
END;
/`}
      />
      <P>
        Oracle supports <strong>positional</strong> (in order) and <strong>named</strong> (
        <K>param =&gt; value</K>) notation. Overlapping both is allowed but ugly — pick positional for
        short lists, named when skipping defaults.
      </P>

      <H2>Functions and return types</H2>
      <CodeBlock
        language="sql"
        filename="A function that returns a NUMBER"
        code={`CREATE OR REPLACE FUNCTION customer_spend (p_customer NUMBER)
RETURN NUMBER
IS
  v_total NUMBER;
BEGIN
  SELECT NVL(SUM(total_amount), 0) INTO v_total
  FROM   orders WHERE customer_id = p_customer;
  RETURN v_total;
EXCEPTION
  WHEN NO_DATA_FOUND THEN RETURN 0;
END;
/

-- call from SQL
SELECT customer_name, customer_spend(customer_id) AS spend FROM customers;`}
      />
      <DataTable
        headers={["Return type", "Notes"]
        }
        rows={[
          ["Scalar (NUMBER, DATE, VARCHAR2, BOOLEAN)", "BOOLEAN return cannot be used directly inside plain SQL"],
          ["%TYPE / %ROWTYPE / records", "Return a fetched row as one result"],
          ["Typed collections / SYS_REFCURSOR/table type", "Return whole result sets (listed on the collections page)"],
        ]}
      />

      <H2>Calling functions from SQL</H2>
      <P>
        Functions that are pure (no DML, no side effects) can run inside <K>SELECT</K> — that is
        what makes <K>customer_spend(customer_id)</K> above work. But there are rules, and they
        matter for the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/indexes-performance">performance page</a>:
      </P>
      <UL>
        <li>The function must behave as a <em>pure</em> function — a <K>SELECT</K> with no DML.</li>
        <li>If it must be callable from SQL, declare it <K>WITH DETERMINISM</K> (19c+) or keep it side-effect free; otherwise the optimizer cannot fold/prune calls.</li>
        <li>Calling a function in a <K>WHERE</K> on indexed columns blocks index use (the SQL page's warning) unless it's function-based-index friendly.</li>
      </UL>

      <H2>Overloading</H2>
      <P>
        Like most languages, PL/SQL lets the <em>same name</em> back different signatures — the
        compiler picks the version by argument count/types. Overloading only works inside a{" "}
        <strong>package</strong>:
      </P>
      <CodeBlock
        language="sql"
        filename="Two PROCESS_ORDER signatures in one package"
        code={`CREATE OR REPLACE PACKAGE pkg_orders AS
  PROCEDURE process_order (p_id NUMBER);
  PROCEDURE process_order (p_name VARCHAR2);   -- overload: same name, diff type
END pkg_orders;
/
CREATE OR REPLACE PACKAGE BODY pkg_orders AS
  PROCEDURE process_order (p_id NUMBER) IS
  BEGIN DBMS_OUTPUT.PUT_LINE('by id ' || p_id); END;

  PROCEDURE process_order (p_name VARCHAR2) IS
  BEGIN DBMS_OUTPUT.PUT_LINE('by name ' || p_name); END;
END pkg_orders;
/

BEGIN pkg_orders.process_order(7);           -- NUMBER version
      pkg_orders.process_order('Acme');      -- VARCHAR2 version
END;
/`}
      />
      <Callout type="tip">
        Keep the overloaded versions behaving <em>similarly</em> — two <K>process_order</K> functions
        that do unrelated things is a maintenance trap. Use overloading for "same operation,
        different input flavor", not as a naming hack.
      </Callout>

      <H2>DROP and REPLACE</H2>
      <CodeBlock
        language="sql"
        filename="Lifecycle verbs"
        code={`-- REPLACE re-creates atomically (keeps grants) — the daily dev loop
CREATE OR REPLACE PROCEDURE my_proc ... ;

-- DROP removes
DROP PROCEDURE my_proc;
DROP FUNCTION  my_func;`}
      />
      <Callout type="info">
        Prefer <K>CREATE OR REPLACE</K> over <K>DROP … CREATE</K>: the former keeps existing
        object grants and is a single atomic step. The security &amp; deployment page covers what
        happens to dependents and how compile warnings flow through.
      </Callout>
    </>
  );
}
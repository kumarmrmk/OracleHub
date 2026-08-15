import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — Records & Object Types",
};

export default function SqlPlsqlRecordsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="Records & object types"
        description="User-defined records and table-based %ROWTYPE records, plus an introduction to object types and object methods with the MAP / ORDER / MEMBER methods that power custom SQL types."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "Records & Object Types" }]}
        updated="2026"
      />

      <P>
        A <strong>record</strong> bundles several values (of possibly different types) under one
        name — PL/SQL's struct. Records combine <em>naturally</em> with the collections page: a
        table of records (<K>TABLE OF t_my_rec</K>) is the shape you want for "many rich rows in
        memory". Object types take records a step further into database-first classes.
      </P>

      <H2>User-defined records</H2>
      <CodeBlock
        language="sql"
        filename="Declare the type, then use it"
        code={`DECLARE
  TYPE t_cust IS RECORD (
    name    customers.customer_name%TYPE,
    region  regions.region_name%TYPE,
    score   NUMBER(3) DEFAULT 0
  );
  v_c t_cust;                 -- one record
  v_scores t_cust;            -- same shape again
BEGIN
  v_c.name   := 'Acme Corp';
  v_c.region := 'West';
  v_c.score  := 95;
  DBMS_OUTPUT.PUT_LINE(v_c.name || ' / ' || v_c.region || ' / ' || v_c.score);
END;
/`}
      />
      <UL>
        <li>Record fields can be anchored with <K>%TYPE</K> — the same schema-tracking habit as variables.</li>
        <li>A record is copied whole: <K>v_scores := v_c;</K> — no per-field copies.</li>
        <li><K>%ROWTYPE</K> (the blocks page) is a one-liner record that mirrors a whole table.</li>
      </UL>

      <H2>Table-based records with %ROWTYPE</H2>
      <P>
        When the record must match a query's output — not just one table — you have two idioms,
        each with a distinct feel:
      </P>
      <DataTable
        headers={["Idiom", "Shape comes from", "Use when"]
        }
        rows={[
          ["%ROWTYPE record", "One table", "Fetching a whole row with SELECT * or a cursor FOR row"],
          ["SELECT col, col INTO record", "Exact declarations", "Projecting a <em>subset</em> into a hand-defined record"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Full row vs projected row"
        code={`DECLARE
  v_row customers%ROWTYPE;                      -- whole table row
BEGIN
  SELECT * INTO v_row FROM customers WHERE customer_id = 101;
  DBMS_OUTPUT.PUT_LINE(v_row.customer_name);

  -- projected: a record that only carries two columns
  v_projected.name  := v_row.customer_name;
  v_projected.limit := v_row.credit_limit;
END;
/`}
      />

      <H2>Records inside collections — the workhorse shape</H2>
      <CodeBlock
        language="sql"
        filename="A collection of records is what bulk loads naturally produce"
        code={`DECLARE
  TYPE t_row IS RECORD (
    cid  customers.customer_id%TYPE,
    name customers.customer_name%TYPE
  );
  TYPE t_rows IS TABLE OF t_row;            -- collection OF records
  v_list t_rows := t_rows();
BEGIN
  v_list.EXTEND; v_list(1).cid := 1; v_list(1).name := 'One';
  v_list.EXTEND; v_list(2).cid := 2; v_list(2).name := 'Two';

  FOR i IN v_list.FIRST .. v_list.LAST LOOP
    DBMS_OUTPUT.PUT_LINE(v_list(i).cid || ' ' || v_list(i).name);
  END LOOP;
END;
/`}
      />
      <P>
        This is precisely the intermediate form the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/plsql/bulk">bulk page</a>{" "}
        turns into a <K>BULK COLLECT</K>/<K>FORALL</K>: query into an array of records, then push it
        to the table in one shot.
      </P>

      <H2>Object types and methods — the advanced layer</H2>
      <P>
        <strong>Object types</strong> are Oracle's database-visible classes: a type with attributes,
        stored like a schema object, with methods defined alongside. They are heavier machinery than
        records — used for genuinely object-shaped domains and for custom column/table types:
      </P>
      <CodeBlock
        language="sql"
        filename="CREATE TYPE with a MEMBER method"
        code={`CREATE OR REPLACE TYPE address_t AS OBJECT (
  street VARCHAR2(60),
  city   VARCHAR2(30),
  postcode VARCHAR2(10),
  MEMBER FUNCTION label RETURN VARCHAR2        -- member method: runs on a value
);
/

CREATE OR REPLACE TYPE BODY address_t AS
  MEMBER FUNCTION label RETURN VARCHAR2 IS
  BEGIN
    RETURN self.street || ', ' || self.city;   -- SELF = the current value
  END;
END;
/

-- use it in a table column and read owned methods in SQL
SELECT a.home_address.label()
FROM   customers c,
       TABLE (c.address_books) a;   -- illustrative: object columns & collections`}
      />
      <DataTable
        headers={["Method kind", "What it means"]
        }
        rows={[
          ["MEMBER", "Runs on an object value; sees SELF"],
          ["STATIC", "Runs without an instance — type-level utility"],
          ["MAP", "Returns a scalar Oracle uses to ORDER/COMPARE values"],
          ["ORDER", "Compares two objects when MAP is not usable"],
          ["CONSTRUCTOR", "Creates an initial value (default exists, or custom)"],
        ]}
      />
      <Callout type="tip">
        "Object types going <em>too</em> deep" is a known Oracle anti-pattern — schema-on-records
        plus JSON reduces the need for full object modeling. The useful level for most projects: a{" "}
        <strong>TYPE ... IS RECORD</strong> in a package for in-memory shapes, and reserve{" "}
        <strong>CREATE TYPE ... OBJECT</strong> for domain columns you genuinely store and query
        (the JSON/SQL macros pages show the modern, lighter alternative).
      </Callout>
    </>
  );
}
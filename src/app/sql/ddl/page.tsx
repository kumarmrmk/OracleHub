import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "DDL — Database Objects",
};

export default function SqlDdlPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Database objects"
        title="DDL — database objects"
        description="CREATE, ALTER, DROP, TRUNCATE, RENAME; tables and temporary tables; and the object family you define once and query forever: views, sequences, synonyms, indexes, and constraints."
        breadcrumbs={[{ label: "SQL" }, { label: "DDL" }]}
        updated="2026"
      />

      <P>
        <strong>DDL</strong> (Data Definition Language) builds or changes the structure itself —
        not the rows, the containers. It is immediate, permanent, and commits your open work, which
        is the one behavioral difference you must never forget. Each major verb gets its own
        example below, and the dedicated object types — constraints, views, sequences, indexes —
        each have a full page of their own.
      </P>

      <H2>The five verbs</H2>
      <DataTable
        headers={["Verb", "What it does", "Example"]
        }
        rows={[
          ["CREATE", "Define a new object", "CREATE TABLE … / CREATE INDEX … / CREATE VIEW …"],
          ["ALTER", "Change an existing object", "ALTER TABLE … ADD column / ALTER TABLE … ENABLE constraint"],
          ["DROP", "Remove the object permanently", "DROP TABLE … PURGE"],
          ["TRUNCATE", "Delete all rows, keep the structure", "TRUNCATE TABLE staging_load"],
          ["RENAME", "Rename an object", "RENAME employees TO staff"],
        ]}
      />

      <H2>CREATE TABLE</H2>
      <P>
        The full shape of a table definition — columns with types, inline constraints, and a
        default — was previewed in the data types and foundations pages. The canonical form:
      </P>
      <CodeBlock
        language="sql"
        filename="A table with everything from one statement"
        code={`CREATE TABLE orders (
  order_id      NUMBER PRIMARY KEY,
  customer_id   NUMBER NOT NULL
                CONSTRAINT fk_orders_cust REFERENCES customers(customer_id),
  order_date    DATE DEFAULT SYSDATE,
  total_amount  NUMBER(12,2) NOT NULL CHECK (total_amount >= 0)
);`}
      />
      <UL>
        <li>Constraints get names — named constraints are debuggable, unnamed are not.</li>
        <li>
          <K>DEFAULT</K> fills the column when an insert omits it, but does not make it{" "}
          <K>NOT NULL</K>.
        </li>
        <li>
          Simpler <K>CREATE TABLE x AS SELECT ...</K> ("CTAS") builds a table from a query — the
          fast way to clone or snapshot rows (but it does <em>not</em> copy constraints or indexes).
        </li>
      </UL>
      <Callout type="tip">
        <K>CREATE TABLE t AS SELECT ...</K> is one of the most-used DDL statements in migration
        work. Remember it copies data and column nullability but <strong>not</strong> keys,
        constraints, defaults, or indexes — you re-create those afterwards.
      </Callout>

      <H2>Temporary tables</H2>
      <P>
        Oracle temporary tables hold data visible only to the session (or transaction) that wrote
        it — a scratchpad for complex multi-step logic inside a PL/SQL program or a batch flow:
      </P>
      <CodeBlock
        language="sql"
        filename="A session-private temp table"
        code={`CREATE GLOBAL TEMPORARY TABLE stage_sums (
  region_name VARCHAR2(30),
  total       NUMBER
) ON COMMIT PRESERVE ROWS;   -- PRESERVE / DELETE options

-- Only this session sees its own rows; cleared at session end.`}
      />
      <P>
        <K>ON COMMIT PRESERVE ROWS</K> keeps the data for the whole session;{" "}
        <K>ON COMMIT DELETE ROWS</K> empties it at each commit. Unlike other databases, the table
        definition is shared — only the rows are private.
      </P>

      <H2>ALTER TABLE</H2>
      <P>
        Change the shape of an existing table — add, drop, or modify columns, and manage
        constraints. Constraint-specific work is on the (
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/constraints">constraints page</a>):
      </P>
      <CodeBlock
        language="sql"
        filename="Add, modify, drop columns"
        code={`ALTER TABLE customers ADD (region_code VARCHAR2(2));
ALTER TABLE customers MODIFY (credit_limit NUMBER(14,2));
ALTER TABLE customers DROP COLUMN region_code;

-- or mark a column unused first (fast, reversible-ish) then drop it
ALTER TABLE customers RENAME COLUMN credit_limit TO credit_cap;`}
      />

      <H2>DROP and TRUNCATE</H2>
      <P>
        These look alike and act very differently:
      </P>
      <DataTable
        headers={["", "DROP TABLE", "TRUNCATE TABLE"]
        }
        rows={[
          ["Rows", "Gone", "Gone"],
          ["Structure", "Gone", "Kept"],
          ["Rollback-able?", "No (unless recycle bin)", "No"],
          ["Triggers", "Dropped", "Bypassed (none fire)"],
          ["Speed", "N/A", "Very fast — drops storage to free space tables"],
          ["Typical use", "Retire unused objects", "Reset a stage/reload table before a new load"],
        ]}
      />
      <Callout type="danger">
        Both are DDL, so both commit your open work and neither can be rolled back normally. Oracle
        recently added real "recoverable" purge options on FLASHBACK-Friendly tables, but the
        default expectation in production is: <K>TRUNCATE</K> and <K>DROP</K> are final. Add{" "}
        <K>PURGE</K> to <K>DROP TABLE</K> to skip even the recycle bin.
      </Callout>

      <H2>The object family you will define every week</H2>
      <P>
        Beyond tables, DDL creates the objects everything else in this section uses:
      </P>
      <DataTable
        headers={["Object", "What it is", "Defined by", "Full page"]
        }
        rows={[
          ["View", "A stored SELECT shown as a table", "CREATE VIEW ... AS SELECT ...", "views"],
          ["Sequence", "A number generator (IDs)", "CREATE SEQUENCE ...", "sequences & identity"],
          ["Synonym", "An alias pointing at another object", "CREATE SYNONYM ... FOR ...", "oracle-specific / security"],
          ["Index", "A fast-lookup structure for a table's columns", "CREATE INDEX ...", "indexes & performance"],
          ["Constraint", "A data-integrity rule on columns", "In CREATE TABLE / ALTER TABLE ... ADD", "constraints"],
        ]}
      />
      <P>
        The pattern to internalize: <strong>data lives in tables; everything else is metadata and
        speed</strong>. Views and synonyms shape <em>how people see</em> the data, indexes and
        partitions shape <em>how fast</em> the database finds it, and constraints shape{" "}
        <em>what the data may be</em>.
      </P>
      <CodeBlock
        language="sql"
        filename="One line each: view, synonym, and a fast name lookup"
        code={`CREATE VIEW active_customers AS
  SELECT customer_id, customer_name FROM customers WHERE void_date IS NULL;

CREATE SYNONYM cust FOR customers;            -- now "cust" works everywhere

CREATE INDEX idx_cust_name ON customers(customer_name);`}
      />
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Constraints & Data Integrity",
};

export default function SqlConstraintsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Database objects"
        title="Constraints & data integrity"
        description="PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, default values, enabling and disabling constraints, and the cascading delete behaviors that protect your relationships."
        breadcrumbs={[{ label: "SQL" }, { label: "Constraints" }]}
        updated="2026"
      />

      <P>
        A <strong>constraint</strong> is a rule the database enforces automatically on every insert
        and update. Constraints are how the schema stays healthy even when a careless script writes
        to it — which is far more robust than "remember to check in the application". Each rule can
        be declared inline (with the column) or at table level (with a name).
      </P>

      <H2>The five types</H2>
      <DataTable
        headers={["Constraint", "Rule it enforces", "Example declaration"]
        }
        rows={[
          ["PRIMARY KEY", "Column(s) uniquely identify each row; cannot be NULL", "order_id NUMBER PRIMARY KEY"],
          ["FOREIGN KEY", "Value must exist in the referenced parent column, or be NULL", "customer_id REFERENCES customers(customer_id)"],
          ["UNIQUE", "No two rows share the value (NULLs allowed, multiple)", "email VARCHAR2(100) UNIQUE"],
          ["NOT NULL", "Column must always have a value", "customer_name VARCHAR2(60) NOT NULL"],
          ["CHECK", "Values must satisfy the boolean expression", "total_amount NUMBER CHECK (total_amount >= 0)"],
        ]}
      />
      <Callout type="info">
        Primary, unique, and foreign keys <em>generally create an index automatically</em> (Oracle
        builds one for a PK/unique constraint). NOT NULL and CHECK create none. That is why querying
        "hard by primary key" is fast even with no hand-written index.
      </Callout>

      <H2>Table-level declaration with names</H2>
      <P>
        Named, table-level constraints are what survive in production schemas — you can find, drop,
        and re-enable them later:
      </P>
      <CodeBlock
        language="sql"
        filename="Named constraints for debuggability"
        code={`CREATE TABLE orders (
  order_id      NUMBER,
  customer_id   NUMBER,
  order_date    DATE DEFAULT SYSDATE,
  total_amount  NUMBER(12,2),
  CONSTRAINT pk_orders PRIMARY KEY (order_id),
  CONSTRAINT fk_orders_cust FOREIGN KEY (customer_id)
             REFERENCES customers(customer_id),
  CONSTRAINT ck_orders_amount CHECK (total_amount >= 0)
);`}
      />
      <Callout type="tip">
        The error a bad insert throws — <K>ORA-02290: check constraint (SCHEMA.CK_ORDERS_AMOUNT)
        violated</K> — names the rule. Unnamed constraints end up auto-generated things like{" "}
        <K>SYS_C00988</K> that tell you nothing. Name yours.
      </Callout>

      <H2>Default values</H2>
      <P>
        A <strong>default</strong> is not a constraint but the two live together at column
        definition. It fills the column when an INSERT omits it; it does <em>not</em> prevent NULL
        from being inserted explicitly:
      </P>
      <CodeBlock
        language="sql"
        filename="DEFAULT fills only when the value is omitted"
        code={`CREATE TABLE orders (
  order_id   NUMBER PRIMARY KEY,
  order_date DATE DEFAULT SYSDATE,          -- omitted -> now
  status     VARCHAR2(10) DEFAULT 'OPEN'    -- omitted -> 'OPEN'
);`}
      />

      <H2>Enabling and disabling constraints</H2>
      <P>
        The dictionary lets you disable rules with <K>DISABLE</K> and re-enforce later with{" "}
        <K>ENABLE</K> — the standard choreography for a huge migration that loads messy historical
        data:
      </P>
      <CodeBlock
        language="sql"
        filename="Load fast, then re-validate"
        code={`ALTER TABLE customers DISABLE CONSTRAINT fk_cust_region;   -- load 5M rows fast
-- ... bulk load ...
ALTER TABLE customers ENABLE CONSTRAINT fk_cust_region;      -- re-check everything`}
      />
      <UL>
        <li>
          <K>DISABLE NOVALIDATE</K>/<K>ENABLE NOVALIDATE</K>/<K>ENABLE VALIDATE</K> control whether
          existing rows are scanned. Default <K>ENABLE</K> validates old rows too.
        </li>
        <li>
          Disabling a PK/unique constraint also drops its backing index — the load need not
          maintain it — then enabling recreates it (a big win for bulk load time).
        </li>
        <li>
          The flip side: a disabled constraint protects <em>nothing</em>. Re-enable as the last step
          of the migration, and check the dictionary after:
        </li>
      </UL>
      <CodeBlock
        language="sql"
        filename="Find anything disabled"
        code={`SELECT constraint_name, constraint_type, status
FROM   user_constraints
WHERE  status = 'DISABLED';`}
      />

      <H2>Cascading delete behavior</H2>
      <P>
        What happens when you delete a parent row that children still reference? The foreign key
        decides, via <K>ON DELETE</K>:
      </P>
      <DataTable
        headers={["ON DELETE clause", "Deleting parent row", "Typical use"]
        }
        rows={[
          ["(default)", "Refused with ORA-02292 (integrity constraint violated — child exists)", "Protect financial/audit data"],
          ["ON DELETE CASCADE", "Children deleted with the parent", "Order → order lines cleanup"],
          ["ON DELETE SET NULL", "Children's FK set to NULL (column must be nullable)", "Keep history, unlink parent"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="The two non-default options"
        code={`CREATE TABLE order_lines (
  line_id   NUMBER PRIMARY KEY,
  order_id  NUMBER
            CONSTRAINT fk_lines_order REFERENCES orders(order_id)
            ON DELETE CASCADE,            -- delete order -> delete its lines
  ...
);

-- Alternative: keep lines, clear the FK
order_id NUMBER REFERENCES orders(order_id) ON DELETE SET NULL`}
      />
      <Callout type="warning">
        Choose cascade <em>deliberately</em>. A blanket <K>ON DELETE CASCADE</K> on a financial table
        is how one innocent <K>DELETE FROM customers</K> deletes every order, every line, and every
        allocation beneath it — with no warning and no rollback hope once committed. Prefer the
        default (refuse) wherever audit matters.
      </Callout>

      <H2>Constraint lookup dictionary queries</H2>
      <CodeBlock
        language="sql"
        filename="See every rule a table carries"
        code={`SELECT c.constraint_name,
       c.constraint_type,     -- P, R, U, C, V (check/view), or O
       c.status,
       cc.column_name
FROM   user_constraints c
LEFT JOIN user_cons_columns cc
       ON cc.constraint_name = c.constraint_name
      AND cc.table_name = c.table_name
WHERE  c.table_name = 'ORDERS';`}
      />
    </>
  );
}
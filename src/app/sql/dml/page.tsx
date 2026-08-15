import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "DML — Changing Data",
};

export default function SqlDmlPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Changing data"
        title="DML — changing data"
        description="Insert, update, delete, and the workhorses around them: MERGE upserts, INSERT ALL and multi-table inserts, INSERT ... SELECT, and RETURNING INTO to get values back."
        breadcrumbs={[{ label: "SQL" }, { label: "DML" }]}
        updated="2026"
      />

      <P>
        DML changes the <em>rows</em> inside tables that already exist. None of it is permanent
        until you <K>COMMIT</K> — that sentence, and what it implies for multi-statement bank
        transfers, is the substance of the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/transactions">transactions page</a>.
        Here is the syntax.
      </P>

      <H2>INSERT</H2>
      <P>
        Insert rows with an explicit column list (best practice) or positionally. Omitting a column
        means "use its default or NULL":
      </P>
      <CodeBlock
        language="sql"
        filename="INSERT with a column list — one row"
        code={`INSERT INTO customers (customer_id, customer_name, region_id, credit_limit)
VALUES (101, 'Acme Corp', 1, 50000);

-- Fewer columns: credit_limit defaults to NULL
INSERT INTO customers (customer_id, customer_name, region_id)
VALUES (102, 'Beta Ltd', 2);`}
      />
      <P>
        <K>INSERT INTO ... SELECT</K> loads a whole result set — the canonical "copy from one table
        to another" and the meat of data migrations:
      </P>
      <CodeBlock
        language="sql"
        filename="Bulk copy into an archive table"
        code={`INSERT INTO orders_archive (order_id, customer_id, order_date, total_amount)
SELECT order_id, customer_id, order_date, total_amount
FROM   orders
WHERE  order_date < DATE '2025-01-01';`}
      />

      <H2>UPDATE</H2>
      <P>
        Update changes the values of existing rows by pattern. The <K>WHERE</K> you forget is how
        you update the whole table:
      </P>
      <CodeBlock
        language="sql"
        filename="UPDATE with and without a filter"
        code={`UPDATE customers
SET    credit_limit = credit_limit * 1.05
WHERE  region_id = 1;          -- only Western customers

-- DANGER: no WHERE -> every row, same value
UPDATE customers SET credit_limit = 0;`}
      />
      <Callout type="warning">
        There is no "are you sure?" In <K>SQL*Plus</K> and SQLcl you can set{" "}
        <K>SET DEFINE</K> tricks, and SQL Developer supports "commit on close" prompts — but the
        reliable discipline is <strong>count first</strong>:{" "}
        <K>SELECT COUNT(*) … WHERE …</K> the exact filter before <K>UPDATE</K>/<K>DELETE</K>, then
        verify <K>SQL%ROWCOUNT</K> after.
      </Callout>

      <H2>DELETE</H2>
      <P>
        Delete removes whole rows. Because a DELETE can trip a foreign key (e.g. deleting a region
        that customers still point at), the constraints page covers{" "}
        <K>ON DELETE CASCADE</K> / <K>ON DELETE SET NULL</K>:
      </P>
      <CodeBlock
        language="sql"
        filename="DELETE with a filter, and count-checking"
        code={`DELETE FROM orders WHERE order_id = 999;
-- "1 rows deleted" — verify ROWCOUNT before commit`}
      />
      <Callout type="tip">
        For purging <em>massive</em> chunks of a table, <K>DELETE</K> in batches (or well-designed{" "}
        <K>TRUNCATE</K>, which is DDL and drops the data outright) — see the DDL page for why{" "}
        <K>TRUNCATE</K> is fast, permanent, and not rollback-able.
      </Callout>

      <H2>MERGE — upsert in one statement</H2>
      <P>
        <K>MERGE</K> updates a row that exists and inserts one that does not, in a single pass —
        the standard way file-based loads reconcile incoming data against existing rows:
      </P>
      <CodeBlock
        language="sql"
        filename="MERGE: apply staged daily totals"
        code={`MERGE INTO customers c
USING (
  SELECT customer_id, credit_limit FROM staged_limits
) s
ON (c.customer_id = s.customer_id)
WHEN MATCHED THEN
  UPDATE SET c.credit_limit = s.credit_limit
WHEN NOT MATCHED THEN
  INSERT (customer_id, customer_name, credit_limit, region_id)
  VALUES (s.customer_id, 'NEW via merge', s.credit_limit, NULL);`}
      />
      <UL>
        <li>
          The <K>ON</K> condition decides match; when it matches more than one source row per target
          row Oracle raises <K>ORA-30926</K>. Dedupe the source first.
        </li>
        <li>
          <K>WHEN MATCHED THEN UPDATE</K> / <K>WHEN NOT MATCHED THEN INSERT</K> are the two usual
          branches; there is also <K>DELETE</K> inside the matched branch for reconcile-style
          cleanup.
        </li>
      </UL>

      <H2>INSERT ALL and multi-table inserts</H2>
      <P>
        <K>INSERT ALL</K> pushes one source row into several target tables at once, and{" "}
        <K>INSERT FIRST</K> adds an IF/ELSE ladder:
      </P>
      <CodeBlock
        language="sql"
        filename="Fan one source row out to two targets"
        code={`INSERT ALL
  INTO orders_archive   (order_id, total_amount) VALUES (order_id, total_amount)
  INTO orders_flagged   (order_id, total_amount) VALUES (order_id, total_amount)
SELECT order_id, total_amount FROM orders WHERE total_amount > 10000;`}
      />
      <P>
        <K>INSERT FIRST</K> is the classic "routing" statement — each source row goes into the first
        branch whose condition matches:
      </P>
      <CodeBlock
        language="sql"
        filename="Route rows by size"
        code={`INSERT FIRST
  WHEN total_amount >= 10000 THEN
    INTO orders_large (order_id, total_amount) VALUES (order_id, total_amount)
  WHEN total_amount >= 1000 THEN
    INTO orders_medium (order_id, total_amount) VALUES (order_id, total_amount)
  ELSE
    INTO orders_small (order_id, total_amount) VALUES (order_id, total_amount)
SELECT order_id, total_amount FROM orders;`}
      />

      <H2>RETURNING INTO</H2>
      <P>
        <K>RETURNING INTO</K> hands values from the row you just changed straight back into PL/SQL
        variables — typically to fetch a generated key you do not know yet (for identity columns,
        see the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/sequences-identity">sequences page</a>):
      </P>
      <CodeBlock
        language="sql"
        filename="RETURNING INTO fetches the new order_id"
        code={`DECLARE
  v_id NUMBER;
BEGIN
  INSERT INTO orders (customer_id, total_amount)
  VALUES (42, 1234.56)
  RETURNING order_id INTO v_id;

  DBMS_OUTPUT.PUT_LINE('New order id: ' || v_id);
END;`}
      />
      <Callout type="info">
        <K>RETURNING</K> works with <K>INSERT</K>, <K>UPDATE</K>, and <K>DELETE</K> — for BULK
        statements (arrays) you use <K>BULK COLLECT INTO</K>, which we keep for the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/plsql">PL/SQL page</a>.
      </Callout>
    </>
  );
}
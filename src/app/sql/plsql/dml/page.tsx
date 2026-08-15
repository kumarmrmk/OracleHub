import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — SQL Inside PL/SQL",
};

export default function SqlPlsqlDmlPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="SQL inside PL/SQL"
        description="SELECT ... INTO, running INSERT / UPDATE / DELETE / MERGE from PL/SQL, transaction control (COMMIT/ROLLBACK/SAVEPOINT), and dynamic SQL with EXECUTE IMMEDIATE."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "SQL Inside PL/SQL" }]}
        updated="2026"
      />

      <P>
        The point of PL/SQL is that SQL is a <em>first-class citizen</em> inside the block — no
        string-building, no driver, just write the statement. But the rules are stricter than in a
        tool: a <K>SELECT</K> must fetch into variables, and the cardinality must be exactly one row
        unless you handle the two famous exceptions. This page is that contract.
      </P>

      <H2>SELECT ... INTO</H2>
      <P>
        A query in PL/SQL needs a destination. <K>SELECT ... INTO</K> fetches exactly one row into
        variables or a <K>%ROWTYPE</K> record:
      </P>
      <CodeBlock
        language="sql"
        filename="Fetch a row into scalars, or a row into a record"
        code={`DECLARE
  v_row customers%ROWTYPE;
  v_name customers.customer_name%TYPE;
BEGIN
  SELECT * INTO v_row FROM customers WHERE customer_id = 101;
  DBMS_OUTPUT.PUT_LINE(v_row.customer_name);

  SELECT customer_name INTO v_name FROM customers WHERE customer_id = 102;
  DBMS_OUTPUT.PUT_LINE(v_name);
END;
/`}
      />
      <Callout type="danger">
        <K>SELECT INTO</K> demands exactly one row — that is a hard rule:
        <UL>
          <li>Zero rows raises <K>NO_DATA_FOUND</K>.</li>
          <li>More than one raises <K>TOO_MANY_ROWS</K>.</li>
        </UL>
        Both are handled (or ignored) on the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/plsql/exceptions">exceptions page</a>.
        A query that "selects into no variable" outside the block is fine; inside PL/SQL the INTO is
        mandatory.
      </Callout>

      <H2>DML statements — direct and with RETURNING</H2>
      <CodeBlock
        language="sql"
        filename="INSERT, UPDATE, DELETE, MERGE from PL/SQL"
        code={`DECLARE
  v_id customers.customer_id%TYPE;
BEGIN
  -- INSERT
  INSERT INTO customers (customer_id, customer_name, region_id)
  VALUES (seq_customers.NEXTVAL, 'Acme Corp', 1);

  -- UPDATE with an expression based on a variable
  UPDATE customers
  SET    credit_limit = credit_limit * 1.05
  WHERE  customer_id = 101;

  -- DELETE
  DELETE FROM order_lines WHERE order_id = 999;

  -- MERGE: reconcile staged data
  MERGE INTO customers c
  USING staged_customers s ON (c.customer_id = s.customer_id)
  WHEN MATCHED   THEN UPDATE SET c.credit_limit = s.credit_limit
  WHEN NOT MATCHED THEN INSERT (customer_id, customer_name, region_id)
       VALUES (s.customer_id, s.customer_name, s.region_id);

  -- RETURNING captures generated / changed values
  UPDATE customers SET credit_limit = 20000 WHERE customer_id = 101
  RETURNING credit_limit INTO v_id;
  DBMS_OUTPUT.PUT_LINE('new limit ' || v_id);
END;
/`}
      />
      <UL>
        <li>DML in PL/SQL behaves exactly like the SQL pages describe — constraints, defaulting, and all.</li>
        <li><K>RETURNING ... INTO</K> grabs values from the affected row without a second query (its basic use was on the DML page; for collections you pair it with <K>BULK COLLECT</K>, see the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/plsql/bulk">bulk page</a>).</li>
        <li>These statements touch the <em>same transaction</em> as everything else in the session — nothing commits unless you say so.</li>
      </UL>

      <H2>Transaction control — COMMIT, ROLLBACK, SAVEPOINT</H2>
      <P>
        PL/SQL inherits the whole transaction model from the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/transactions">transactions page</a>.
        The disciplined pattern for a long batch: work in chunks, checkpoint with{" "}
        <K>COMMIT</K>, and keep a <K>SAVEPOINT</K> to roll back only a bad chunk:
      </P>
      <CodeBlock
        language="sql"
        filename="A chunked, checkpointed batch with a per-row savepoint"
        code={`DECLARE
  v_count NUMBER := 0;
BEGIN
  FOR rec IN (SELECT * FROM staged_rows ORDER BY row_id)
  LOOP
    SAVEPOINT before_row;                 -- bookmark for this row only
    BEGIN
      INSERT INTO customers (customer_id, customer_name)
      VALUES (rec.id, rec.name);
      v_count := v_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        ROLLBACK TO SAVEPOINT before_row; -- undo THIS row, keep the rest
        log_error(rec.id, SQLERRM);
    END;
  END LOOP;
  COMMIT;
END;
/`}
      />
      <Callout type="tip">
        Commit <em>deliberately</em>: at well-chosen checkpoints, not after every row, and not from
        deep inside a shared helper that other callers may be mid-transaction on. The rule of thumb
        that keeps packages composable: <strong>the outermost caller owns the COMMIT</strong>.
      </Callout>

      <H2>Dynamic SQL with EXECUTE IMMEDIATE</H2>
      <P>
        When the statement itself must be assembled at runtime — unknown table names, dynamic
        filters, DDL — use <K>EXECUTE IMMEDIATE</K>. It parses and runs a string, and the{" "}
        <K>USING</K> clause binds values so they never end up in the SQL text:
      </P>
      <CodeBlock
        language="sql"
        filename="Dynamic SELECT, DML, and DDL"
        code={`DECLARE
  v_sql   VARCHAR2(200);
  v_cnt   NUMBER;
  v_tbl   VARCHAR2(30) := 'ORDERS';
BEGIN
  -- dynamic SELECT with a bind value and an INTO
  v_sql := 'SELECT COUNT(*) FROM ' || v_tbl || ' WHERE total_amount > :x';
  EXECUTE IMMEDIATE v_sql INTO v_cnt USING 100;
  DBMS_OUTPUT.PUT_LINE('big orders: ' || v_cnt);

  -- dynamic DML
  v_sql := 'DELETE FROM ' || v_tbl || ' WHERE customer_id = :id';
  EXECUTE IMMEDIATE v_sql USING 999;

  -- DDL (cannot be bound — only hard-coded after whitelisting!)
  EXECUTE IMMEDIATE 'TRUNCATE TABLE ' || v_tbl;
END;
/`}
      />
      <UL>
        <li><K>USING</K> binds <em>values</em> (safe); table/column <em>names</em> cannot be bound and must be whitelisted.</li>
        <li>DDL via <K>EXECUTE IMMEDIATE</K> commits your open transaction — the DDL rule from the transactions page applies.</li>
        <li>For multi-row dynamic reads, <K>EXECUTE IMMEDIATE ... BULK COLLECT INTO</K> (the bulk page) is the pattern.</li>
        <li>Longer/more flexible dynamic runs use the <K>OPEN cursor FOR ... USING</K> ref-cursor form — the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/plsql/cursors">cursors page</a>.</li>
      </UL>
      <Callout type="danger">
        Dynamic SQL is where <strong>SQL injection</strong> happens. Values go through{" "}
        <K>USING</K>; object names get validated against a hard-coded allow-list (e.g.{" "}
        <K>IF v_tbl NOT IN ('ORDERS','CUSTOMERS') THEN RAISE_APPLICATION_ERROR(...);</K>). Never
        concatenate a user-supplied string straight into the SQL text.
      </Callout>
    </>
  );
}
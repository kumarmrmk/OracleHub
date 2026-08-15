import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — Cursors",
};

export default function SqlPlsqlCursorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="Cursors"
        description="Implicit cursor attributes (SQL%ROWCOUNT, SQL%FOUND, SQL%NOTFOUND), explicit OPEN / FETCH / CLOSE cursors, cursor FOR loops, parameterized and return cursors, FOR UPDATE with WHERE CURRENT OF, and SYS_REFCURSOR ref cursors."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "Cursors" }]}
        updated="2026"
      />

      <P>
        A <strong>cursor</strong> is PL/SQL's handle for "a query, processed row by row". SQL already
        ran <K>FOR rec IN (SELECT ...)</K> loops on earlier pages; here you meet the full ceremony —
        because understanding it explains how to drive queries, count what changed, and hand result
        sets to other programs.
      </P>

      <H2>Implicit cursors and their attributes</H2>
      <P>
        Every SQL statement PL/SQL runs is an <strong>implicit cursor</strong>, named <K>SQL</K>{" "}
        (capital). After a DML or SELECT INTO you can inspect what it just did:
      </P>
      <DataTable
        headers={["Attribute", "Returns"]
        }
        rows={[
          ["SQL%ROWCOUNT", "Rows affected by the last DML / opened by SELECT"],
          ["SQL%FOUND", "TRUE if the last statement affected at least one row"],
          ["SQL%NOTFOUND", "The opposite of SQL%FOUND"],
          ["SQL%ISOPEN", "FALSE for implicit cursors; TRUE while an explicit cursor is open"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Count what you changed, right after you change it"
        code={`BEGIN
  UPDATE customers SET credit_limit = credit_limit * 1.1 WHERE region_id = 1;
  DBMS_OUTPUT.PUT_LINE(SQL%ROWCOUNT || ' customers raised');
  IF SQL%NOTFOUND THEN
    DBMS_OUTPUT.PUT_LINE('Nothing matched - check the filter!');
  END IF;
END;
/`}
      />
      <Callout type="warning">
        <K>SQL%ROWCOUNT</K> refers to the <em>most recent</em> SQL statement — read it immediately
        after, because the next statement resets it.
      </Callout>

      <H2>Explicit cursors — OPEN, FETCH, CLOSE</H2>
      <P>
        When you must manage the fetch yourself — process a batch, stop early, or page — declare the
        cursor, then run the lifecycle manually:
      </P>
      <CodeBlock
        language="sql"
        filename="The full manual lifecycle"
        code={`DECLARE
  CURSOR c_orders IS
    SELECT order_id, total_amount FROM orders WHERE total_amount > 1000;
  v_id     orders.order_id%TYPE;
  v_total  orders.total_amount%TYPE;
BEGIN
  OPEN c_orders;                       -- 1. open
  LOOP
    FETCH c_orders INTO v_id, v_total; -- 2. fetch a row
    EXIT WHEN c_orders%NOTFOUND;       -- 3. stop at the end
    DBMS_OUTPUT.PUT_LINE(v_id || ' = ' || v_total);
  END LOOP;
  CLOSE c_orders;                      -- 4. close
END;
/`}
      />
      <UL>
        <li>Explicit cursors support <K>c_orders%ROWCOUNT</K>, <K>%FOUND</K>, <K>%NOTFOUND</K>, <K>%ISOPEN</K> — note the <em>cursor name</em>, not <K>SQL</K>.</li>
        <li>Forgetting <K>CLOSE</K> leaks a cursor handle; always close, ideally behind the <K>FOR</K>-loop shortcut next.</li>
      </UL>

      <H2>Cursor FOR loops — the recommended default</H2>
      <P>
        The <K>FOR</K>-loop cursor opens, fetches, and closes implicitly — this is what production
        code writes:
      </P>
      <CodeBlock
        language="sql"
        filename="Open/fetch/close handled for you"
        code={`BEGIN
  FOR rec IN (SELECT order_id, total_amount FROM orders WHERE total_amount > 1000)
  LOOP
    DBMS_OUTPUT.PUT_LINE(rec.order_id || ' = ' || rec.total_amount);
  END LOOP;
END;
/`}
      />
      <Callout type="info">
        A <K>FOR</K>-loop cursor (or a <K>SELECT ... BULK COLLECT</K>) is what you reach for 95% of
        the time. The manual OPEN/FETCH/CLOSE exists for special needs — nested control, early
        termination, or dynamic statements. And when the loop's query is small enough that row-by-row
        processing is wasteful, prefer the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/plsql/bulk">bulk page's</a>{" "}
        <K>FORALL</K>.
      </Callout>

      <H2>Parameterized cursors</H2>
      <P>
        A cursor can take <K>IN</K> parameters (no OUT), so one cursor serves many filter values:
      </P>
      <CodeBlock
        language="sql"
        filename="Same cursor, different region each call"
        code={`DECLARE
  CURSOR c_reg (p_region NUMBER) IS
    SELECT customer_name FROM customers WHERE region_id = p_region;
BEGIN
  FOR rec IN c_reg(1) LOOP
    DBMS_OUTPUT.PUT_LINE('West: ' || rec.customer_name);
  END LOOP;
  FOR rec IN c_reg(2) LOOP
    DBMS_OUTPUT.PUT_LINE('East: ' || rec.customer_name);
  END LOOP;
END;
/`}
      />

      <H2>FOR UPDATE and WHERE CURRENT OF</H2>
      <P>
        Two paired tools for "read a row, then safely update just the row you are looking at" —
        <K>FOR UPDATE</K> locks the rows as you read them; <K>WHERE CURRENT OF cursor</K> points an
        <K>UPDATE</K> at the row the loop currently holds:
      </P>
      <CodeBlock
        language="sql"
        filename="Lock, then update exactly the row in hand"
        code={`DECLARE
  CURSOR c_cust IS
    SELECT customer_id, credit_limit FROM customers WHERE region_id = 1
    FOR UPDATE;                              -- lock rows we will change
BEGIN
  FOR rec IN c_cust LOOP
    IF rec.credit_limit IS NULL THEN
      UPDATE customers
      SET    credit_limit = 1000
      WHERE  CURRENT OF c_cust;              -- updates ONLY this row
    END IF;
  END LOOP;
  COMMIT;                                    -- release the locks
END;
/`}
      />
      <Callout type="warning">
        <K>FOR UPDATE</K> holds <strong>row locks until commit/rollback</strong> — the same lock
        behavior as the transactions page. Use it only when you genuinely intend to change the rows,
        and commit promptly so the locks do not block the rest of your estate.
      </Callout>

      <H2>Ref cursors — SYS_REFCURSOR</H2>
      <P>
        A <strong>ref cursor</strong> is a <em>variable</em> that holds a cursor — the typed{" "}
        <K>SYS_REFCURSOR</K> is the generic, referenceable kind. It is how a procedure returns a
        result set to a caller (a Java app, a report tool, another PL/SQL program):
      </P>
      <CodeBlock
        language="sql"
        filename="Return an OPEN result set to the caller"
        code={`CREATE OR REPLACE PROCEDURE get_orders(p_cursor OUT SYS_REFCURSOR) IS
BEGIN
  OPEN p_cursor FOR
    SELECT order_id, total_amount FROM orders WHERE total_amount > 1000;
END;
/

-- caller (SQLcl):
VARIABLE cur REFCURSOR
EXEC get_orders(:cur);
PRINT cur;`}
      />
      <P>
        Ref cursors also drive <strong>dynamic SQL</strong> results — the{" "}
        <K>OPEN cursor FOR dynamic_statement USING binds</K> form returns whatever the string
        queries, which is what data APIs and report backends commonly rely on.
      </P>
      <Callout type="tip">
        The rule that keeps cursors simple: <K>FOR</K>-loop cursors for internal iteration,{" "}
        <K>WHERE CURRENT OF</K> only under <K>FOR UPDATE</K>, and <K>SYS_REFCURSOR</K> when you must
        hand a result set out of a subprogram.
      </Callout>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — Bulk Processing",
};

export default function SqlPlsqlBulkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="Bulk processing"
        description="BULK COLLECT, FORALL, the LIMIT clause, SAVE EXCEPTIONS and SQL%BULK_EXCEPTIONS — and why row-by-row processing is the number one PL/SQL performance sin."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "Bulk Processing" }]}
        updated="2026"
      />

      <P>
        The most consequential performance decision in PL/SQL is <em>context switching</em>: every
        time your block talks to the SQL engine, both engines hand off. A loop that runs one{" "}
        <K>UPDATE</K> per row pays that overhead per row. <strong>Bulk processing</strong> collapses
        the switch into one pass — <K>BULK COLLECT</K> to fill memory, <K>FORALL</K> to push it
        back — and routinely turns 100k-row programs from minutes into seconds.
      </P>

      <H2>BULK COLLECT — fetch many rows at once</H2>
      <P>
        An ordinary <K>FOR rec IN (SELECT ...)</K> row loop fetches one row each iteration.
        <K>BULK COLLECT</K> pulls the whole result into a collection in one go:
      </P>
      <CodeBlock
        language="sql"
        filename="Row-by-row vs one bulk fetch"
        code={`DECLARE
  TYPE t_ids IS TABLE OF orders.order_id%TYPE;
  v_ids t_ids;
BEGIN
  -- the slow way (mental model — don't run 100k rows like this)
  FOR rec IN (SELECT order_id FROM orders) LOOP
    NULL;                            -- one context switch per row
  END LOOP;

  -- the bulk way: one fetch, all rows in memory
  SELECT order_id BULK COLLECT INTO v_ids FROM orders;
  DBMS_OUTPUT.PUT_LINE('fetched ' || v_ids.COUNT || ' ids');
END;
/`}
      />
      <UL>
        <li>BULK COLLECT works with <K>SELECT</K>, cursor <K>FETCH</K>, and <K>EXECUTE IMMEDIATE</K>.</li>
        <li>Each column shares its <em>own</em> collection, or use a record collection for whole rows.</li>
        <li>Always co-Gather any <K>RETURNING</K> with <K>BULK COLLECT INTO</K> so the affected row values come back together.</li>
      </UL>

      <H2>FORALL — one statement over a collection</H2>
      <P>
        The DML twin of BULK COLLECT: one <K>FORALL</K> executes the same statement once per element
        <em>without</em> a per-row round trip:
      </P>
      <CodeBlock
        language="sql"
        filename="Push a whole set of changes in one shot"
        code={`DECLARE
  TYPE t_ids IS TABLE OF customers.customer_id%TYPE;
  v_ids t_ids := t_ids(101, 102, 103);
BEGIN
  FORALL i IN v_ids.FIRST .. v_ids.LAST
    UPDATE customers
    SET    credit_limit = COALESCE(credit_limit, 0) + 100
    WHERE  customer_id = v_ids(i);

  DBMS_OUTPUT.PUT_LINE('updated ' || SQL%ROWCOUNT || ' rows');
END;
/`}
      />
      <Callout type="info">
        <K>FORALL</K> <em>cannot</em> be used with <K>SELECT</K> (that is BULK COLLECT's job) and
        itself performs DML only. It is also usable with <K>INSERT ... VALUES</K> using a collection,
        and its <K>RETURNING</K> pairs with <K>BULK COLLECT INTO</K>.
      </Callout>

      <H2>LIMIT — chunk the fetch for memory</H2>
      <P>
        A <K>BULK COLLECT</K> of a million rows loads a million rows into memory. To bound memory and
        allow periodic commits, chunk with <K>LIMIT</K>:
      </P>
      <CodeBlock
        language="sql"
        filename="Fetch in chunks of 1,000, commit per chunk"
        code={`DECLARE
  CURSOR c_orders IS
    SELECT order_id, total_amount FROM orders WHERE status = 'PENDING';
  TYPE t_rows IS TABLE OF c_orders%ROWTYPE;
  v_batch t_rows;
BEGIN
  OPEN c_orders;
  LOOP
    FETCH c_orders BULK COLLECT INTO v_batch LIMIT 1000;  -- one batch

    EXIT WHEN v_batch.COUNT = 0;

    FORALL i IN 1 .. v_batch.COUNT
      UPDATE orders SET total_amount = v_batch(i).total_amount * 0.9
      WHERE  order_id = v_batch(i).order_id;

    COMMIT;                              -- checkpoint per batch
  END LOOP;
  CLOSE c_orders;
END;
/`}
      />
      <Callout type="tip">
        <K>LIMIT</K> + <K>COMMIT</K> in a loop is the canonical high-volume batch pattern: bounded
        memory, short row locks, and a natural restart point. It is the production-grade successor to
        the row-by-row loop everyone starts with — and the Fusion/OIC-style bulk loads you will be
        asked to write follow exactly this shape.
      </Callout>

      <H2>SAVE EXCEPTIONS and SQL%BULK_EXCEPTIONS</H2>
      <P>
        By default a bad row inside <K>FORALL</K> aborts the whole statement. <K>SAVE EXCEPTIONS</K>{" "}
        makes FORALL keep going, collecting failures into{" "}
        <K>SQL%BULK_EXCEPTIONS</K>, which you walk afterwards:
      </P>
      <CodeBlock
        language="sql"
        filename="Process-anyway, then report the failures"
        code={`DECLARE
  TYPE t_rows IS TABLE OF customers.customer_id%TYPE;
  v_ids t_rows := t_rows(101, 102, 103, 99999);   -- one bad id
BEGIN
  FORALL i IN v_ids.FIRST .. v_ids.LAST
    UPDATE customers SET credit_limit = 100 WHERE customer_id = v_ids(i)
    SAVE EXCEPTIONS;                        -- don't stop on the bad row

EXCEPTION
  WHEN OTHERS THEN
    IF SQL%BULK_EXCEPTIONS.COUNT > 0 THEN
      FOR j IN 1 .. SQL%BULK_EXCEPTIONS.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE(
          'row ' || SQL%BULK_EXCEPTIONS(j).ERROR_INDEX ||
          ' error ' || SQL%BULK_EXCEPTIONS(j).ERROR_CODE);
      END LOOP;
    ELSE
      RAISE;
    END IF;
END;
/`}
      />
      <DataTable
        headers={["Attribute / clause", "Meaning"]
        }
        rows={[
          ["SAVE EXCEPTIONS", "Keep going past per-row errors in FORALL instead of aborting"],
          ["SQL%BULK_EXCEPTIONS", "Array of {ERROR_INDEX, ERROR_CODE} for every failed element"],
          ["SQL%ROWCOUNT (after FORALL)", "Rows changed across the whole bulk"],
        ]}
      />

      <H2>The before-and-after that makes this real</H2>
      <DataTable
        headers={["Pattern", "Context switches", "Typical shape"]
        }
        rows={[
          ["Nested-loop per row (UPDATE inside FOR rec...)", "N (many)", "Slow to very slow at scale"],
          ["SET-based single UPDATE ... WHERE (no loop at all)", "1", "Fastest when the logic is pure SQL"],
          ["BULK COLLECT + FORALL chunks with LIMIT", "A handful (per chunk)", "The right tool for imperative per-row logic at scale"],
        ]}
      />
      <Callout type="tip">
        First ask "can this be one <K>UPDATE</K>?", because a set-based statement beats even bulk
        loops. When the row logic genuinely must live in PL/SQL (decision after reading a value, an
        external call, a counter), reach for <K>BULK COLLECT</K> + <K>FORALL</K> and chunk with{" "}
        <K>LIMIT</K>.
      </Callout>
    </>
  );
}
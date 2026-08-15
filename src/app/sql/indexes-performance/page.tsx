import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Indexes & Performance",
};

export default function SqlIndexesPerformancePage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Performance & scale"
        title="Indexes & performance"
        description="B-tree, bitmap, and function-based indexes; composite indexes; EXPLAIN PLAN and DBMS_XPLAN; full table scan vs index scan; nested loops, hash join, and merge join; statistics and the optimizer; and the bind-variable habit."
        breadcrumbs={[{ label: "SQL" }, { label: "Indexes & Performance" }]}
        updated="2026"
      />

      <P>
        The optimizer turns your SELECT into a <strong>plan</strong> — choices like "full table scan
        or slow index probe", "hash join or nested loops". You cannot make Oracle fast by wishing;
        you make it fast by giving the optimizer good indexes, true statistics, and predictable
        expressions. This page is the vocabulary for that conversation.
      </P>

      <H2>What an index is</H2>
      <P>
        An index is a separate structure holding sorted copies of some columns plus a pointer to the
        row. The database uses it to <strong>jump</strong> to matching rows instead of scanning
        every row. The cost: every insert/update/delete must also maintain the index.
      </P>
      <CodeBlock
        language="sql"
        filename="Create, drop, and see what exists"
        code={`CREATE INDEX idx_cust_region ON customers(region_id);
CREATE INDEX idx_orders_total   ON orders(total_amount DESC);

DROP INDEX idx_orders_total;

SELECT index_name, column_name FROM user_ind_columns;`}
      />

      <H2>Index types</H2>
      <DataTable
        headers={["Index type", "Design", "Best for"]
        }
        rows={[
          ["B-tree", "Standard balanced tree on key values", "Selectivity, equality and range lookups on most columns"],
          ["Bitmap", "One bit vector per distinct value", "Low-cardinality columns (gender, status) in warehouse reads"],
          ["Function-based", "Index on an expression: LOWER(name), TRUNC(date)", "Queries that always filter by a function of the column"],
          ["Composite", "Multiple columns in one index", "Queries whose WHERE/ORDER use several columns together"],
        ]}
      />
      <UL>
        <li>
          <strong>Bitmap</strong> indexes shine in analytics and die on frequent DML — heavy
          single-row updates block them. Keep them to read-mostly warehouses.
        </li>
        <li>
          A composite index's <strong>leading column</strong> dominates: an index{" "}
          <K>(region_id, created_dt)</K> serves filters on <K>region_id</K> efficiently and{" "}
          <K>(region_id, created_dt)</K> together, but a filter on <K>created_dt</K> alone cannot
          use it well. Order your columns: equality first, then range.
        </li>
      </UL>

      <H2>Explain plan and DBMS_XPLAN</H2>
      <P>
        The plan is how you argue with facts. The modern route avoids the old <K>EXPLAIN PLAN FOR</K>{" "}
        buffers and reads the live plan straight back:
      </P>
      <CodeBlock
        language="sql"
        filename="Read the real plan Oracle chose"
        code={`EXPLAIN PLAN FOR
SELECT customer_name FROM customers WHERE credit_limit > 10000;

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- Better: from the actual run (SQLcl / SQL Developer display this natively)
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR(FORMAT => 'ALLSTATS LAST'));`}
      />
      <P>What to read in the plan output, top down:</P>
      <UL>
        <li><strong>Operation</strong> — <K>TABLE ACCESS FULL</K> (bad for selective filters), <K>INDEX RANGE SCAN</K> / <K>INDEX UNIQUE SCAN</K> (good), joins as <K>NESTED LOOPS</K> / <K>HASH JOIN</K>.</li>
        <li><strong>Rows / Bytes / Cost</strong> columns and, with <K>ALLSTATS LAST</K>, the <em>actual</em> <K>Rows</K> used — divergence between estimated and actual is your smoking gun.</li>
        <li>Note at the bottom a warning when the optimizer had stale stats.</li>
      </UL>

      <H2>Full table scan vs index scan — and the selectivity test</H2>
      <DataTable
        headers={["Plan step", "When the optimizer chooses it"]
        }
        rows={[
          ["TABLE ACCESS FULL", "Filter selects a large share of rows, or there is no useful index"],
          ["INDEX UNIQUE SCAN", "Lookup by primary/unique key — at most one row"],
          ["INDEX RANGE SCAN", "Selective non-unique or range lookup — few rows"],
          ["INDEX FAST FULL / SKIP SCAN", "Covering or low-selectivity access on mostly-empty ranges"],
        ]}
      />
      <P>
        The optimizer picks per <strong>selectivity</strong> (how many rows pass vs exist). An
        index that would return 90% of a small table is slower than just reading the table — the
        optimizer knows, and so should you when you look at a plan and see a FULL scan on a small
        table. That is often correct, not a bug.
      </P>

      <H2>Join methods</H2>
      <DataTable
        headers={["Method", "Strategy", "Good when"]
        }
        rows={[
          ["NESTED LOOPS", "For each outer row, probe the inner table via index", "Small driving set + indexed inner; few returned rows"],
          ["HASH JOIN", "Build a hash of one side; probe with the other", "Large joins with no usable index on the inner"],
          ["MERGE JOIN", "Sort both sides, then merge", "Pre-sorted or range join inputs"],
        ]}
      />
      <Callout type="tip">
        Nested loops degrade fast if the optimizer underestimates the driver — that is the #1 reason
        a "fast" query explodes as data grows, and the first thing <K>DBMS_XPLAN</K>'s actual-vs-estimate
        comparison exposes.
      </Callout>

      <H2>Statistics and the optimizer</H2>
      <P>
        The optimizer guesses from <strong>statistics</strong> gathered by DBMS_STATS — row counts,
        distinct values, histograms. Stale statistics produce comically wrong plans. Refresh them
        after large loads:
      </P>
      <CodeBlock
        language="sql"
        filename="Gather stats on one table (or the whole schema)"
        code={`EXEC DBMS_STATS.GATHER_TABLE_STATS(USER, 'ORDERS');
-- or the draw-all plan
EXEC DBMS_STATS.GATHER_SCHEMA_STATS(USER);`}
      />
      <UL>
        <li>Automated stats jobs exist, but a big overnight load that changes table size materially still deserves a targeted gather.</li>
        <li>Histograms matter for skewed columns; they are gathered automatically but check the plan note if you suspect them.</li>
      </UL>

      <H2>Bind variables</H2>
      <P>
        Oracle prepares statements once and reuses the plan while values change — <em>if</em> you
        use <strong>bind variables</strong> instead of splicing constants:
      </P>
      <CodeBlock
        language="sql"
        filename="Bind variables make plans reusable"
        code={`-- In PL/SQL the :name binds automatically:
SELECT customer_name FROM customers WHERE region_id = :r;

-- Hard-coding literals re-parses (and can suffer literal explosion)
SELECT customer_name FROM customers WHERE region_id = 1;`}
      />
      <Callout type="warning">
        Applications that generate a fresh SQL string per value cause{" "}
        <strong>hard parsing</strong>: each query is compiled, serially-ish, and the shared pool
        thrashes. Bind-variable-native drivers (JDBC/Oracle Client, SQLcl scripts with{" "}
        <K>&amp;</K> substitution handled server-side) avoid it. The exception that proves the rule:
        data-skewed columns may deliberately want literals via <K>SQL_PLAN_MANAGEMENT</K> adaptive
        plans.
      </Callout>

      <H2>Avoiding functions on indexed columns</H2>
      <P>
        The single most common performance self-sabotage: wrapping a column in a function in{" "}
        <K>WHERE</K>, so the index on the raw column is unusable:
      </P>
      <CodeBlock
        language="sql"
        filename="FUNCTION(column) turns off a normal index"
        code={`-- Index on order_date is IGNORED:
SELECT * FROM orders WHERE TRUNC(order_date) = DATE '2026-08-15';

-- Same idea, index-friendly:
SELECT * FROM orders
WHERE  order_date >= DATE '2026-08-15'
  AND  order_date <  DATE '2026-08-16';`}
      />
      <UL>
        <li>On <K>LOWER(name)</K> equality use a <strong>function-based index</strong> — <K>CREATE INDEX i ON t(LOWER(name))</K> — and match the expression exactly.</li>
        <li>The <K>NVL(col, 0)</K> and <K>TO_DATE</K>-wrap-RANGE patterns from earlier pages are the same disease.</li>
      </UL>
      <Callout type="example">
        Scan reports for function-wrapped indexed columns and <K>LIKE '%…'</K> leading wildcards —
        together they account for more "why is this query slow" tickets than any other symptom.
      </Callout>
    </>
  );
}
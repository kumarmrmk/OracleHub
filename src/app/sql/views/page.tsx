import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Views",
};

export default function SqlViewsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Database objects"
        title="Views"
        description="Simple and complex views, updatable views, WITH CHECK OPTION, WITH READ ONLY, and materialized views with their refresh concepts."
        breadcrumbs={[{ label: "SQL" }, { label: "Views" }]}
        updated="2026"
      />

      <P>
        A <strong>view</strong> is a saved <K>SELECT</K> presented as if it were a table. It stores
        no data of its own — every query against it runs the underlying statement live. Views are
        the schema's two most useful magic tricks at once: <em>shaping</em> (people see the columns
        they need, masked to what they may) and <em>decoupling</em> (the table behind can change
        without breaking every query above it).
      </P>

      <H2>Simple vs complex views</H2>
      <DataTable
        headers={["", "Simple view", "Complex view"]
        }
        rows={[
          ["Source", "One table", "Multiple tables / joins"],
          ["Functions & expressions", "Only character/number rows usually allowed as columns", "ANY expression, GROUP BY, DISTINCT, aggregates"],
          ["Rows updatable?", "Often yes", "Rarely; usually read-only in practice"],
          ["Example", "active_customers", "region revenue summary"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Simple view — one table, filtered, renamed column"
        code={`CREATE VIEW active_customers AS
SELECT customer_id, customer_name AS name, credit_limit
FROM   customers
WHERE  void_date IS NULL;`}
      />
      <CodeBlock
        language="sql"
        filename="Complex view — join + aggregate"
        code={`CREATE VIEW region_revenue AS
SELECT r.region_name,
       COUNT(o.order_id)  AS order_count,
       SUM(o.total_amount) AS revenue
FROM   orders o
JOIN   customers c ON c.customer_id = o.customer_id
JOIN   regions   r ON r.region_id   = c.region_id
GROUP  BY r.region_name;`}
      />

      <H2>Updatable views</H2>
      <P>
        Believe it or not, <K>UPDATE</K>, <K>DELETE</K>, and <K>INSERT</K> <em>through a simple
        view</em> work — Oracle pushes the change down to the backing table. The practical rule: a
        view is updatable when it selects rows straight from one table (WITH / DISTINCT / GROUP BY /
        set operators break it) and contains no synthesized columns:
      </P>
      <CodeBlock
        language="sql"
        filename="Update through a view"
        code={`UPDATE active_customers SET credit_limit = 100 WHERE name = 'Acme Corp';
-- propagates to customers.credit_limit for customer_id of Acme`}
      />
      <Callout type="warning">
        "Insertable" / "updatable" views are a genuine maintenance hazard: a view can be
        accidentally <em>not</em> updatable in subtle cases, and surprise-Oracle factors mean the
        safest contract is <strong>views are for reading</strong>. Use <K>WITH READ ONLY</K> below to
        harden that intent.
      </Callout>

      <H2>WITH CHECK OPTION</H2>
      <P>
        The classic self-sabotage: insert a row through the view that <em>fails the view's own
        WHERE</em> — you wrote it in, but now you cannot see it. <K>WITH CHECK OPTION</K> bans that:
      </P>
      <CodeBlock
        language="sql"
        filename="The view that cannot be bypassed"
        code={`CREATE VIEW active_customers AS
SELECT customer_id, customer_name, credit_limit
FROM   customers
WHERE  void_date IS NULL
WITH   CHECK OPTION CONSTRAINT chk_active_customers;

-- This NOW FAILS (ORA-01402): it would create a row you can't see
INSERT INTO active_customers (customer_id, customer_name)
VALUES (999, 'Ghost');      -- no void_date NULL -> violates the check`}
      />

      <H2>WITH READ ONLY</H2>
      <CodeBlock
        language="sql"
        filename="Lock the view to read-only"
        code={`CREATE VIEW report_customers AS
SELECT customer_name, credit_limit FROM customers
WITH   READ ONLY;    -- any DML through it -> ORA-42399`}
      />

      <H2>Materialized views</H2>
      <P>
        A <strong>materialized view</strong> behaves like a view but <em>physically stores</em> the
        result — it is a snapshot table refreshed on a schedule. It trades freshness for speed:
      </P>
      <DataTable
        headers={["", "Regular view", "Materialized view"]
        }
        rows={[
          ["Stores data", "No — runs live every time", "Yes — a physical snapshot"],
          ["Freshness", "Always current", "As of the last refresh"],
          ["Speed on big joins", "Repays each time", "Instant reads of the snapshot"],
          ["Refresh", "N/A", "ON DEMAND / ON COMMIT / scheduled"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="A nightly built report snapshot"
        code={`CREATE MATERIALIZED VIEW mv_region_revenue
REFRESH COMPLETE ON DEMAND
START WITH SYSDATE
NEXT  SYSDATE + 1
AS SELECT r.region_name, COUNT(*) AS order_count,
          SUM(o.total_amount) AS revenue
   FROM orders o JOIN customers c ON c.customer_id = o.customer_id
   JOIN regions r ON r.region_id = c.region_id
   GROUP BY r.region_name;

-- Refresh manually:  EXEC DBMS_MVIEW.REFRESH('MV_REGION_REVENUE');`}
      />
      <UL>
        <li><K>REFRESH FAST</K> applies only logged changes and needs MV logs (materialized view logs) on the source tables; <K>REFRESH COMPLETE</K> rebuilds everything and is simpler.</li>
        <li>Use MVs for heavyweight joins you re-run constantly, dashboards, and cross-database replicas (refresh on demand).</li>
        <li>Query rewrite can make the optimizer answer your query from the MV automatically — powerful, but a tuning chapter for the{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/sql/indexes-performance">performance page</a>.</li>
      </UL>
      <Callout type="tip">
        The general ladder: a normal view when freshness matters and the base tables are small
        enough; a materialized view when the same heavy join runs every few minutes and a slightly
        stale number is fine. Federation and replication layers in Oracle 19c/23ai add "refresh on
        a schedule" variants of the same idea.
      </Callout>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Partitioning & Large Data",
};

export default function SqlPartitioningPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Performance & scale"
        title="Partitioning & large data"
        description="Range, list, hash, and interval partitioning; partition pruning; local vs global indexes; and parallel SQL basics for big tables."
        breadcrumbs={[{ label: "SQL" }, { label: "Partitioning" }]}
        updated="2026"
      />

      <P>
        When a table grows past a few hundred million rows, Oracle can split it into{" "}
        <strong>partitions</strong> — separate physical segments that still expose one table name to
        SQL. You query the same way; the optimizer just touches only the partitions it needs
        (<strong>partition pruning</strong>). Partitioning is the difference between a table that
        slows everyone down and one that quietly gets faster.
      </P>

      <H2>The methods</H2>
      <DataTable
        headers={["Method", "Rows go into a partition by…", "Best for"]
        }
        rows={[
          ["RANGE", "A column's value falling into a range (DATEs, IDs)", "Time-series: orders by month"],
          ["LIST", "An explicit value list", "Region codes, status values"],
          ["HASH", "A hash of the partition key spread evenly", "Even distribution, when no natural list/range works"],
          ["INTERVAL", "RANGE, but new partitions created automatically (23ai/12c)", "Never-miss-a-month append-only data"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Orders partitioned by year"
        code={`CREATE TABLE orders (
  order_id   NUMBER,
  customer_id NUMBER,
  order_date DATE,
  total_amount NUMBER(12,2)
)
PARTITION BY RANGE (order_date) (
  PARTITION p2024 VALUES LESS THAN (DATE '2025-01-01'),
  PARTITION p2025 VALUES LESS THAN (DATE '2026-01-01'),
  PARTITION pfuture VALUES LESS THAN (MAXVALUE)
);`}
      />
      <P>
        Or the hands-off <K>INTERVAL</K> variant that makes the monthly partition the moment you
        insert its first row:
      </P>
      <CodeBlock
        language="sql"
        filename="Interval partitioning — partitions appear on demand"
        code={`CREATE TABLE orders (
  order_id NUMBER, customer_id NUMBER, order_date DATE, total_amount NUMBER(12,2)
)
PARTITION BY RANGE (order_date)
INTERVAL (NUMTOYMINTERVAL(1, 'MONTH'))
  (PARTITION p_initial VALUES LESS THAN (DATE '2025-01-01'));`}
      />

      <H2>Partition pruning</H2>
      <P>
        When the <K>WHERE</K> references the partition key, the optimizer can restrict its work to a
        subset of partitions — often one. That is the whole performance point: the query "touches
        only January" even if the table holds ten years' rows:
      </P>
      <CodeBlock
        language="sql"
        filename="Pruning: one partition read, not ten"
        code={`SELECT * FROM orders
WHERE  order_date >= DATE '2026-01-01'
  AND  order_date <  DATE '2026-02-01';   -- Partition Pruned: p2026-01`}
      />
      <Callout type="info">
        A filter that does <em>not</em> reference the partition key forces a full scan of every
        partition (unless another index covers it). Design the partition key around your most common
        query filters — for orders that is the date.
      </Callout>

      <H2>Local and global indexes</H2>
      <DataTable
        headers={["Index type", "Scope", "Note"]
        }
        rows={[
          ["Local index", "One index per partition, aligned with it", "Dropping/adding a partition maintains only its own index — the usual choice for partitioned tables"],
          ["Global index", "Covers all partitions in one index across the table", "Non-partitioned index on a partitioned table; global-partitioned indexes also exist"],
        ]}
      />
      <P>
        A <strong>local index</strong> lives inside each partition and is pruned with it. A{" "}
        <strong>global index</strong> is one structure spanning every partition — useful when you
        need a unique key on a column that is <em>not</em> the partition key. Remember the
        interaction with maintenance: a global index can degrade when you <K>DROP PARTITION</K>{" "}
        without updating it.
      </P>

      <H2>Parallel SQL basics</H2>
      <P>
        For genuinely heavy reads — aggregating a whole big table, a full scan — the{" "}
        <strong>parallel query</strong> feature splits the work across multiple server processes.
        The optimizer decides parallelism from table/partition degree and the <K>PARALLEL</K> hint:
      </P>
      <CodeBlock
        language="sql"
        filename="Hint your heavy scan (and never over-do it)"
        code={`SELECT /*+ PARALLEL(o, 4) */ region_id, COUNT(*)
FROM   orders o
GROUP  BY region_id;`}
      />
      <UL>
        <li>Parallelism shines on big full scans; it hurts on tiny OLTP lookups (setup overhead swamps the gain).</li>
        <li>Don't hard-wire high degrees: honor the datafile/partition degree set by the DBA, or let the hints pick.</li>
        <li>Parallel DML (<K>ALTER SESSION ENABLE PARALLEL DML</K>) for big loads exists but adds locks/transactions complexity — treat it as a DBA-level skill.</li>
      </UL>
      <Callout type="tip">
        Real-world recipe for a large table: RANGE (or INTERVAL) partition by date → most queries
        prune to one partition → local indexes match the keys you query within a partition → a
        parallel full scan for the quarterly analytics job. That combination is how data-warehouse
        tables stay responsive at the hundreds-of-GB scale.
      </Callout>
    </>
  );
}
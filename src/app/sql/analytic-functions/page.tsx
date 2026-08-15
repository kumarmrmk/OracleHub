import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Analytic / Window Functions",
};

export default function SqlAnalyticFunctionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Advanced"
        title="Analytic / window functions"
        description="OVER, PARTITION BY, window ordering, ROWS/RANGE frames, ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, running totals and moving averages, FIRST_VALUE, LAST_VALUE, NTILE, PERCENT_RANK, and CUME_DIST."
        breadcrumbs={[{ label: "SQL" }, { label: "Analytic Functions" }]}
        updated="2026"
      />

      <P>
        These are the single most career-changing feature in Oracle SQL. An{" "}
        <strong>analytic (window) function</strong> computes a value <em>per row</em> while looking
        at a <em>neighborhood</em> of rows: "rank each order within its customer", "each row's share
        of its region total", "the 7-day moving average". Unlike <K>GROUP BY</K>, they do not
        collapse rows — every input row stays in the output, with its computed number attached.
      </P>

      <H2>The anatomy: OVER (PARTITION BY … ORDER BY … frame)</H2>
      <P>
        Every analytic function ends in an <K>OVER</K> clause with three parts:
      </P>
      <DataTable
        headers={["Part", "What it does", "Default"]
        }
        rows={[
          ["PARTITION BY col", "Split rows into groups; the function runs within each partition", "One partition = whole result set"],
          ["ORDER BY col", "Order rows inside each partition (rankings, running totals need it)", "Not needed for simple aggregates"],
          ["frame (ROWS/RANGE)", "Which rows count: all, up to current, a sliding window", "For ORDER BY queries: so far up to the current row"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="The most common shapes, side by side"
        code={`SELECT o.customer_id,
       o.order_id,
       o.total_amount,
       SUM(o.total_amount) OVER (PARTITION BY o.customer_id)          AS customer_total,
       ROW_NUMBER()       OVER (
         PARTITION BY o.customer_id ORDER BY o.total_amount DESC)     AS rank_in_customer,
       LAG(o.total_amount, 1) OVER (
         PARTITION BY o.customer_id ORDER BY o.order_date)            AS prev_order_amount
FROM   orders o;`}
      />
      <UL>
        <li>
          <K>PARTITION BY</K> is "GROUP BY for analytics" — it does not reduce output rows.
        </li>
        <li>
          An <K>ORDER BY</K> inside <K>OVER</K> does not affect the final output order; it only
          defines the order the function sees.
        </li>
      </UL>

      <H2>Ranking: ROW_NUMBER, RANK, DENSE_RANK</H2>
      <DataTable
        headers={["Function", "Ties", "Classic use"]
        }
        rows={[
          ["ROW_NUMBER()", "No ties — each row gets a unique number (arbitrary among equals)", "Top-N per group"],
          ["RANK()", "Ties share a rank, then GAP (1,1,3)", "Leaderboards, competition-style"],
          ["DENSE_RANK()", "Ties share a rank, no gap (1,1,2)", "Close-ranked reports, bands"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Top order per customer, ties aside"
        code={`SELECT customer_id, order_id, total_amount
FROM  (
  SELECT o.customer_id, o.order_id, o.total_amount,
         ROW_NUMBER() OVER (PARTITION BY o.customer_id
                            ORDER BY o.total_amount DESC) AS rn
  FROM   orders o
)
WHERE  rn = 1;   -- "top N per group": change 1 to N`}
      />
      <Callout type="tip">
        "Top N per group" (here: biggest order per customer, top 3 invoices per supplier) is the
        single most useful analytic pattern in business SQL. It replaced the old correlated-subquery
        mess entirely — the optimizer even gets a hint dedicated to it (<K>TOPN</K>).
      </Callout>

      <H2>LAG and LEAD — look at neighboring rows</H2>
      <P>
        <K>LAG</K> reaches into the <em>previous</em> row of the same partition; <K>LEAD</K> the{" "}
        <em>next</em>. Instant "change vs last month" and "next expected item":
      </P>
      <CodeBlock
        language="sql"
        filename="Day-over-day order growth"
        code={`SELECT TRUNC(order_date) AS day,
       COUNT(*) AS orders,
       LAG(COUNT(*)) OVER (
         ORDER BY TRUNC(order_date)) AS prev_day_orders,
       COUNT(*) - LAG(COUNT(*)) OVER (
         ORDER BY TRUNC(order_date)) AS day_change
FROM   orders
GROUP  BY TRUNC(order_date);`}
      />
      <UL>
        <li>Both take <K>(col, offset, default)</K> — offset 1 by default (<K>LAG(x) = LAG(x,1,NULL)</K>).</li>
        <li>The <strong>result of one analytic feeds the next</strong>: nesting to compute a lagged aggregate (as above) is idiomatic.</li>
      </UL>

      <H2>Running totals and moving averages</H2>
      <P>
        The <strong>frame</strong> decides <em>which</em> rows feed the window. With <K>ORDER BY</K>{" "}
        the default frame <K>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</K> gives running
        totals; a sliding <K>ROWS</K> window gives moving averages:
      </P>
      <CodeBlock
        language="sql"
        filename="Running total vs 3-day moving average"
        code={`SELECT TRUNC(order_date) AS day,
       SUM(COUNT(*)) OVER (ORDER BY TRUNC(order_date)
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total,
       AVG(COUNT(*)) OVER (ORDER BY TRUNC(order_date)
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)  AS avg_3_days
FROM   orders
GROUP  BY TRUNC(order_date);`}
      />
      <DataTable
        headers={["Frame", "Rows included"]
        }
        rows={[
          ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "Current row + the two before"],
          ["ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "Everything up to current (running total)"],
          ["RANGE BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING", "Everything from current to the end"],
          ["ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING", "Symmetric sliding window"],
        ]}
      />
      <UL>
        <li><K>ROWS</K> counts physical rows; <K>RANGE</K> groups equal ORDER BY values — subtle, keep to ROWS for sliding windows.</li>
        <li>Moving averages on non-contiguous dates mislead — order the frames by the actual date value, not row position.</li>
      </UL>

      <H2>FIRST_VALUE, LAST_VALUE</H2>
      <P>
        Jump to the first or last row <em>of the frame</em> — often used to attach a benchmark:
      </P>
      <CodeBlock
        language="sql"
        filename="First order date per customer"
        code={`SELECT c.customer_name,
       FIRST_VALUE(o.order_date) OVER (
         PARTITION BY o.customer_id
         ORDER BY o.order_date) AS first_order
FROM   orders o
JOIN   customers c ON c.customer_id = o.customer_id;`}
      />
      <Callout type="warning">
        <K>LAST_VALUE</K> notoriously returns the <em>current</em> row unless you widen the frame to{" "}
        <K>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</K> — one of Oracle's best-known
        analytic surprises. When you mean "last over the whole partition", spell the frame out.
      </Callout>

      <H2>NTILE, PERCENT_RANK, CUME_DIST</H2>
      <P>
        The distribution quartet for buckets and percentile reports:
      </P>
      <DataTable
        headers={["Function", "What it returns", "Use"]
        }
        rows={[
          ["NTILE(n)", "Bucket number 1..n", "Quintiles/deciles of spend, A–E rating bands"],
          ["PERCENT_RANK()", "Relative rank 0..1 between rows", "Percentile-style position"],
          ["CUME_DIST()", "Cumulative distribution (rows ≤ current ÷ total)", "'What % is below this value'"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Split customers into four spend buckets"
        code={`SELECT customer_id, SUM(total_amount) AS spend,
       NTILE(4) OVER (ORDER BY SUM(total_amount) DESC) AS quartile
FROM   orders
GROUP  BY customer_id;`}
      />
    </>
  );
}
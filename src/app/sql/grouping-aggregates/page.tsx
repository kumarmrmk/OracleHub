import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Grouping & Aggregate Functions",
};

export default function SqlGroupingAggregatesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Querying"
        title="Grouping & aggregate functions"
        description="COUNT, SUM, AVG, MIN, MAX; GROUP BY and HAVING; and the reporting workhorses ROLLUP, CUBE, and GROUPING SETS with GROUPING and GROUPING_ID."
        breadcrumbs={[{ label: "SQL" }, { label: "Grouping & Aggregates" }]}
        updated="2026"
      />

      <P>
        Aggregates collapse many rows into one number. The moment your question is "how many",
        "total", or "average" — grouped by something — you are writing aggregate SQL. The two
        mistakes that dominate here are confusing <K>WHERE</K> with <K>HAVING</K>, and forgetting{" "}
        <K>GROUP BY</K> only survives with aggregates on the column list.
      </P>

      <H2>The five core aggregates</H2>
      <DataTable
        headers={["Aggregate", "What it returns", "NULL behavior"]
        }
        rows={[
          ["COUNT(*)", "Number of rows", "Counts every row, even all-NULL"],
          ["COUNT(col)", "Number of non-NULL values in col", "Skips NULLs"],
          ["SUM(col)", "Total of the non-NULL values", "Skips NULLs; all-NULL → NULL (not 0)"],
          ["AVG(col)", "Average of the non-NULL values", "Skips NULLs"],
          ["MIN(col)", "Smallest value", "Skips NULLs"],
          ["MAX(col)", "Largest value", "Skips NULLs"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Min, max, mean, count"
        code={`SELECT COUNT(*)              AS order_count,
       SUM(total_amount)      AS revenue,
       AVG(total_amount)      AS avg_order,
       MIN(total_amount)      AS smallest,
       MAX(total_amount)      AS largest
FROM   orders;`}
      />
      <Callout type="warning">
        <K>SUM(total_amount)</K> on a table whose column is entirely NULL returns <K>NULL</K>, which
        then poisons anything downstream. Wrap with <K>NVL(SUM(total_amount), 0)</K> when a zero
        result is the meaning you need.
      </Callout>

      <H2>GROUP BY — one row per distinct group</H2>
      <P>
        <K>GROUP BY</K> collapses rows that share the listed columns and lets you aggregate within
        each group. The rules that cause the classic <K>ORA-00979</K>:
      </P>
      <UL>
        <li>
          Every column in the <K>SELECT</K> list must be either a <strong>grouped column</strong> or
          inside an <strong>aggregate</strong> — nothing else.
        </li>
        <li>Use the grouped column's raw name, not its alias, in <K>GROUP BY</K>.</li>
        <li>You group by a column you do not even need to output, so you can aggregate by things you keep hidden.</li>
      </UL>
      <CodeBlock
        language="sql"
        filename="Revenue per region"
        code={`SELECT r.region_name,
       COUNT(o.order_id) AS orders_count,
       SUM(o.total_amount) AS revenue
FROM   orders o
JOIN   customers c ON c.customer_id = o.customer_id
JOIN   regions   r ON r.region_id = c.region_id
GROUP  BY r.region_name
ORDER  BY revenue DESC;`}
      />

      <H2>HAVING — filtering groups, not rows</H2>
      <P>
        <K>WHERE</K> filters rows <em>before</em> grouping; <K>HAVING</K> filters groups{" "}
        <em>after</em> aggregation. You cannot put an aggregate in <K>WHERE</K>:
      </P>
      <CodeBlock
        language="sql"
        filename="WHERE first, then HAVING"
        code={`SELECT r.region_name,
       SUM(o.total_amount) AS revenue
FROM   orders o
JOIN   customers c ON c.customer_id = o.customer_id
JOIN   regions   r ON r.region_id = c.region_id
WHERE  o.order_date >= DATE '2026-01-01'   -- drop rows first
GROUP  BY r.region_name
HAVING SUM(o.total_amount) >= 5000         -- then drop groups
ORDER  BY revenue DESC;`}
      />
      <P>
        The same question "filter after grouping" also works for group membership:{" "}
        <K>HAVING COUNT(*) &gt; 1</K> finds duplicate keys, a daily check on data loads:
      </P>
      <CodeBlock
        language="sql"
        filename="Find duplicate region names"
        code={`SELECT region_name, COUNT(*)
FROM   regions
GROUP  BY region_name
HAVING COUNT(*) > 1;`}
      />

      <H2>ROLLUP, CUBE, GROUPING SETS</H2>
      <P>
        These three extend <K>GROUP BY</K> to produce the subtotal rows that reports overwhelmingly
        want. They appear in reporting and analytics:
      </P>
      <DataTable
        headers={["Extension", "Produces", "Typical use"]
        }
        rows={[
          ["ROLLUP(a, b)", "Grouped rows + subtotals rolling up the columns (a+b, a, grand total)", "Monthly revenue + yearly totals"],
          ["CUBE(a, b)", "Every combination of subtotals (a+b, a, b, grand total)", "Multi-dimensional drill-down reports"],
          ["GROUPING SETS((a),(b))", "Exactly the grouped sets you list, no more", "Two separate summaries in one pass"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="ROLLUP adds region subtotals and a grand total"
        code={`SELECT r.region_name,
       COUNT(*) AS customers
FROM   customers c
JOIN   regions r ON r.region_id = c.region_id
GROUP  BY ROLLUP(r.region_name);

-- Rows: Westerners / Easterners / (NULL, grand total)
-- The NULL subtotal row is exactly why GROUPING() matters below`}
      />

      <H2>GROUPING and GROUPING_ID</H2>
      <P>
        A subtotal row produced by <K>ROLLUP</K> shows <K>NULL</K> in the rolled-up columns — but
        NULL can be a real value too. <K>GROUPING(col)</K> returns 1 when the row is a subtotal for
        that column and 0 otherwise, letting you label rows safely:
      </P>
      <CodeBlock
        language="sql"
        filename="Label subtotal rows without confusing NULL"
        code={`SELECT CASE WHEN GROUPING(r.region_name) = 1
                    THEN 'ALL REGIONS'
                    ELSE r.region_name END AS region,
       COUNT(*) AS customers
FROM   customers c
JOIN   regions r ON r.region_id = c.region_id
GROUP  BY ROLLUP(r.region_name);`}
      />
      <Callout type="info">
        <K>GROUPING_ID</K> returns a packed number for many columns at once (e.g.{" "}
        <K>GROUPING_ID(a, b)</K> = 0 for detail, 3 for the grand total) and is what analytic tools
        use to tag result rows. Tuple-ish — treat it as the multi-column cousin of{" "}
        <K>GROUPING</K>.
      </Callout>
    </>
  );
}
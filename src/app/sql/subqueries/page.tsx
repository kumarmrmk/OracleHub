import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Subqueries",
};

export default function SqlSubqueriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Combining tables"
        title="Subqueries"
        description="Single-row and multiple-row subqueries, correlated subqueries, nested subqueries, inline views, scalar subqueries, EXISTS/ANY/ALL, and the WITH clause (CTEs) — plain and recursive."
        breadcrumbs={[{ label: "SQL" }, { label: "Subqueries" }]}
        updated="2026"
      />

      <P>
        A <strong>subquery</strong> is a <K>SELECT</K> used inside another statement — inside{" "}
        <K>WHERE</K>, <K>FROM</K>, or the <K>SELECT</K> list. Subqueries let one query be the answer
        to another's question: "orders bigger than the average order", "customers who never ordered",
        "the December per-region totals".
      </P>

      <H2>Single-row vs multiple-row subqueries</H2>
      <P>
        What a subquery may return decides which operator you pair it with:
      </P>
      <DataTable
        headers={["Subquery returns", "Pair with", "Meaning"]
        }
        rows={[
          ["Exactly one row, one column", "=, >, <, >=, <=", "Compare a value to that single answer"],
          ["Many rows, one column", "IN, ANY, ALL, EXISTS", "Membership or quantified comparison"],
          ["Many rows, many columns", "IN / FROM (inline view)", "Row values, or a whole derived table"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Single-row: orders above the average"
        code={`SELECT order_id, total_amount
FROM   orders
WHERE  total_amount >
       (SELECT AVG(total_amount) FROM orders);   -- returns exactly one number`}
      />
      <Callout type="danger">
        If a "single-row" subquery returns more than one row, Oracle throws{" "}
        <K>ORA-01427: single-row subquery returns more than one row</K>. That is the error to expect
        when a label lookup stops being unique.
      </Callout>

      <H2>IN, ANY, ALL</H2>
      <P>
        Multiple-row subqueries pair with membership or quantified operators:
      </P>
      <CodeBlock
        language="sql"
        filename="IN, ANY, ALL in one go"
        code={`-- IN: customer is anyone in the returned list
SELECT customer_name FROM customers
WHERE  customer_id IN (SELECT customer_id FROM orders);

-- = ANY is identical to IN
WHERE customer_id = ANY (SELECT customer_id FROM orders);

-- > ALL: bigger than every returned value
SELECT order_id FROM orders
WHERE  total_amount > ALL (SELECT total_amount FROM orders);`}
      />
      <DataTable
        headers={["Operator", "TRUE when…", "Cousin"]
        }
        rows={[
          ["x IN (sub)", "x equals any returned value", "= ANY"],
          ["x > ALL (sub)", "x is bigger than the max returned", "> (SELECT MAX …)"],
          ["x > ANY (sub)", "x is bigger than the min returned", "> (SELECT MIN …)"],
          ["EXISTS (sub)", "subquery returns at least one row", "COUNT(*) > 0"],
        ]}
      />
      <P>
        Beware the <K>NOT IN … NULL</K> interaction from the filtering page —{" "}
        <K>ALL</K> and <K>ANY</K> share it. If the subquery's column can be NULL, "not bigger than
        all" never fires for that row.
      </P>

      <H2>Correlated subqueries</H2>
      <P>
        A <strong>correlated</strong> subquery references the outer query's row — it is re-evaluated
        per outer row, which is exactly the <K>EXISTS</K> pattern you saw earlier:
      </P>
      <CodeBlock
        language="sql"
        filename="Correlated EXISTS — evaluated for every customer"
        code={`SELECT c.customer_name
FROM   customers c
WHERE  EXISTS (
  SELECT 1 FROM orders o
  WHERE  o.customer_id = c.customer_id     -- correlated: refers to outer c
    AND  o.total_amount > 5000
);`}
      />
      <UL>
        <li>
          Correlated subqueries are powerful but run once per outer row, so on big tables they lean
          heavily on indexes (see the performance page — this is where a missing index turns minutes
          of pain).
        </li>
        <li>
          "Biggest order per customer" is a canonical correlated query, but the{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/sql/analytic-functions">analytic functions</a>{" "}
          page shows the cleaner <K>ROW_NUMBER</K> way to do the same.
        </li>
      </UL>

      <H2>Nested subqueries</H2>
      <P>
        Subqueries nest arbitrarily: "customers who ordered the product everyone orders". Each level
        simply answers the level above:
      </P>
      <CodeBlock
        language="sql"
        filename="Three levels deep"
        code={`SELECT customer_name FROM customers
WHERE  customer_id IN (
  SELECT customer_id FROM orders
  WHERE  order_id IN (
    SELECT order_id FROM order_lines
    WHERE  product_id = 7
  )
);`}
      />

      <H2>Inline views (FROM subqueries)</H2>
      <P>
        Put a subquery in <K>FROM</K> and it becomes a <strong>derived table</strong> you can treat
        like any other table — the foundation of every "first compute it, then filter it" report:
      </P>
      <CodeBlock
        language="sql"
        filename="Per-customer totals, then pick the big ones"
        code={`SELECT cs.customer_name, totals.spend
FROM   customers cs
JOIN  (
  SELECT customer_id, SUM(total_amount) AS spend
  FROM   orders
  GROUP  BY customer_id
) totals ON totals.customer_id = cs.customer_id
WHERE  totals.spend > 10000;`}
      />

      <H2>Scalar subqueries</H2>
      <P>
        A subquery in the <K>SELECT</K> list that returns one row and one column becomes a{" "}
        <strong>scalar subquery</strong> — a computed column per row. If it returns no row it
        evaluates to <K>NULL</K>, so it never errors:
      </P>
      <CodeBlock
        language="sql"
        filename="A 'latest order date' column per customer"
        code={`SELECT c.customer_name,
       (SELECT MAX(o.order_date) FROM orders o
        WHERE o.customer_id = c.customer_id) AS last_order
FROM   customers c;`}
      />

      <H2>WITH clause / Common Table Expressions (CTEs)</H2>
      <P>
        The <K>WITH</K> clause names a subquery once and reuses it — cleaner than the same inline
        view twice, and it structures complex queries exactly like a packaged report's "extract the
        numbers first":
      </P>
      <CodeBlock
        language="sql"
        filename="WITH names the summary, then you use it"
        code={`WITH region_totals AS (
  SELECT r.region_name, SUM(o.total_amount) AS revenue
  FROM   orders o
  JOIN   customers c ON c.customer_id = o.customer_id
  JOIN   regions   r ON r.region_id = c.region_id
  GROUP  BY r.region_name
)
-- "region_totals" is usable here (and again below) like a table
SELECT * FROM region_totals
WHERE  revenue > (SELECT AVG(revenue) FROM region_totals);`}
      />

      <H2>Recursive WITH queries</H2>
      <P>
        A CTE can call itself, walking a hierarchy level by level — every employee's manager chain,
        a bill-of-materials, an org tree. Oracle also has the older{" "}
        <K>CONNECT BY</K> (the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/oracle-specific">Oracle-specific page</a>{" "}
        covers it), but ANSI <K>WITH RECURSIVE</K> is standard and reads clearly:
      </P>
      <CodeBlock
        language="sql"
        filename="Walk the org chart with a recursive CTE"
        code={`WITH emp_chain (emp_id, emp_name, manager_id, depth) AS (
  -- Anchor: the top of the tree
  SELECT employee_id, full_name, manager_id, 1
  FROM   employees
  WHERE  manager_id IS NULL
  UNION ALL
  -- Recursive part: one level at a time
  SELECT e.employee_id, e.full_name, e.manager_id, ec.depth + 1
  FROM   employees e
  JOIN   emp_chain ec ON e.manager_id = ec.emp_id
)
SELECT emp_id, LPAD(' ', (depth-1) * 3) || emp_name AS tree
FROM   emp_chain;`}
      />
      <Callout type="tip">
        Recursive CTEs must combine <K>UNION ALL</K> (rarely <K>UNION</K>) with an{" "}
        <strong>anchor</strong>, then a <strong>recursive term</strong> that stops when it matches
        nothing new. Missing stop conditions or cycles of the anchor-to-itself kind are the usual
        bugs — filter to a depth or use <K>CONNECT BY NOCYCLE</K> on the legacy side.
      </Callout>
    </>
  );
}
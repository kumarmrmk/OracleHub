import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Filtering",
};

export default function SqlFilteringPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Querying"
        title="Filtering"
        description="The full comparison toolkit: =, <>, >, <, >=, <=, AND/OR/NOT, IN and NOT IN, BETWEEN, LIKE with the % and _ wildcards, IS NULL and IS NOT NULL, and EXISTS / NOT EXISTS."
        breadcrumbs={[{ label: "SQL" }, { label: "Filtering" }]}
        updated="2026"
      />

      <P>
        <K>WHERE</K> decides which rows survive. The operators here are the words every business
        question gets translated into — "customers who have not reordered", "orders in the last
        week", "products whose name contains 'Pro'". Each operator has a NULL-rich trap, so the
        examples deliberately poke at them.
      </P>

      <H2>Comparison operators</H2>
      <DataTable
        headers={["Operator", "Meaning", "Example"]}
        rows={[
          ["=", "Equal", "region_id = 3"],
          ["<> or !=", "Not equal (Oracle accepts both)", "credit_limit <> 0"],
          [">  /  <", "Greater / less than", "total_amount > 500"],
          [">=  /  <=", "Greater-or-equal / less-or-equal", "total_amount >= 500"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="The basics"
        code={`SELECT order_id, total_amount
FROM   orders
WHERE  customer_id = 42
  AND  total_amount >= 100
  AND  total_amount < 1000;   -- inclusive/exclusive range`}
      />
      <Callout type="warning">
        Never equate a value to NULL with <K>= NULL</K> — that is always <K>UNKNOWN</K>, so the
        condition silently matches nothing. Use <K>IS NULL</K> / <K>IS NOT NULL</K>.
      </Callout>

      <H2>AND, OR, NOT — and the precedence trap</H2>
      <P>
        Combine conditions with <K>AND</K> (both must hold), <K>OR</K> (either may hold), and{" "}
        <K>NOT</K> (invert). <K>NOT</K> binds tightest, then <K>AND</K>, then <K>OR</K> — and the
        order surprises people:
      </P>
      <CodeBlock
        language="sql"
        filename="Precedence: AND binds tighter than OR"
        code={`-- Intended: (region 1 OR region 3) AND over 500
SELECT order_id FROM orders
WHERE  region_id = 1 OR region_id = 3
  AND  total_amount > 500;

-- Reality: region_id = 1  OR  (region_id = 3 AND total_amount > 500)
-- Fix: parenthesize the OR
WHERE  (region_id = 1 OR region_id = 3) AND total_amount > 500;`}
      />
      <Callout type="tip">
        When in doubt, parenthesize. Mixed <K>AND</K>/<K>OR</K> without brackets is the most common
        "why is my count wrong" bug in SQL.
      </Callout>

      <H2>IN and NOT IN</H2>
      <P>
        <K>IN</K> is a list membership test — shorthand for a chain of <K>=</K> with <K>OR</K>.{" "}
        <K>NOT IN</K> is its logical inverse, but NOT IN plus a NULL in the list becomes the classic
        empty-result surprise:
      </P>
      <CodeBlock
        language="sql"
        filename="IN works; NOT IN with NULL matches nothing"
        code={`SELECT customer_name
FROM   customers
WHERE  region_id IN (2, 4);            -- regions 2 or 4

-- The trap: if any returned region is NULL, this returns ZERO rows
SELECT customer_name
FROM   customers
WHERE  region_id NOT IN (SELECT region_id FROM regions);
-- Because: x NOT IN (1, 2, NULL)  ==>  x <> 1 AND x <> 2 AND x <> NULL
--                                             ... AND UNKNOWN  ==> never TRUE`}
      />
      <Callout type="danger">
        If the subquery feeding a <K>NOT IN</K> can return NULL, prefer{" "}
        <strong>NOT EXISTS</strong> (below) — it has no such trap. This single rule avoids a whole
        class of production bugs.
      </Callout>

      <H2>BETWEEN</H2>
      <P>
        <K>BETWEEN a AND b</K> is <em>inclusive on both ends</em>: <K>x BETWEEN 10 AND 20</K> is{" "}
        <K>x &gt;= 10 AND x &lt;= 20</K>. It is not a "between but excluding the edges" operator.
      </P>
      <CodeBlock
        language="sql"
        filename="Inclusive range"
        code={`SELECT order_id FROM orders
WHERE  total_amount BETWEEN 100 AND 500;   -- 100 and 500 included`}
      />
      <P>
        For dates, remember the <K>DATE</K> column carries a time component —{" "}
        <K>WHERE order_date BETWEEN DATE '2026-08-01' AND DATE '2026-08-31'</K> misses anything on
        the 31st after midnight. The robust pattern is a half-open range:
      </P>
      <CodeBlock
        language="sql"
        filename="Date range that includes the whole last day"
        code={`WHERE order_date >= DATE '2026-08-01'
  AND order_date <  DATE '2026-09-01'   -- exclusive upper bound`}
      />

      <H2>LIKE and wildcards</H2>
      <P>
        <K>LIKE</K> does pattern matching on strings with two wildcards:{" "}
        <K>%</K> = any sequence of characters (including none), <K>_</K> = exactly one character.
      </P>
      <DataTable
        headers={["Pattern", "Matches"]
        }
        rows={[
          ["'A%'", "Anything starting with A"],
          ["'%A%'", "Anything containing A"],
          ["'_A%'", "Any character, then A, then anything"],
          ["'%o'", "Anything ending in o"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Fuzzy customer lookup"
        code={`SELECT customer_name FROM customers
WHERE  customer_name LIKE 'Tech%'            -- starts with Tech
   OR  customer_name LIKE '% Systems';       -- or ends with ' Systems'`}
      />
      <UL>
        <li>
          <K>ESCAPE</K> lets you search for the wildcard characters themselves:{""}{" "}
          <K>LIKE '50\%' ESCAPE '\'</K> matches a literal <K>50%</K>.
        </li>
        <li>
          Case matters: <K>LIKE 'tech%'</K> will not match <K>TechCorp</K>. Wrap in{" "}
          <K>LOWER()</K>/<K>UPPER()</K> on both sides if you want case-insensitive, at a performance
          cost (the index page shows why).
        </li>
        <li>
          A leading wildcard (<K>'%...'</K>) cannot use a normal B-tree index efficiently — a
          classic performance smell.
        </li>
      </UL>

      <H2>IS NULL and IS NOT NULL</H2>
      <P>
        The correct way to test for missing values:
      </P>
      <CodeBlock
        language="sql"
        filename="Both directions"
        code={`-- Customers with no credit limit set
SELECT customer_name FROM customers WHERE credit_limit IS NULL;

-- Orders that are not voided (a non-null flag)
SELECT order_id FROM orders WHERE void_date IS NOT NULL;`}
      />

      <H2>EXISTS and NOT EXISTS</H2>
      <P>
        <K>EXISTS</K> tests whether a subquery returns at least one row. It evaluates to TRUE/FALSE,
        never NULL, which makes it immune to the NOT IN trap and usually the fastest way to express
        "has at least one X":
      </P>
      <CodeBlock
        language="sql"
        filename="Customers who have ordered — and those who have not"
        code={`-- Customers with at least one order
SELECT c.customer_name
FROM   customers c
WHERE  EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);

-- Customers with no order yet (safe version of NOT IN)
SELECT c.customer_name
FROM   customers c
WHERE  NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id);`}
      />
      <Callout type="tip">
        Inside an <K>EXISTS</K> subquery the <K>SELECT</K> list is irrelevant — convention is{" "}
        <K>SELECT 1</K>. And because <K>ExISTS</K> stops at the first matching row, it is usually
        faster than <K>COUNT(*) &gt; 0</K> against a large child table. Correlations like this are
        the heart of the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/subqueries">subqueries page</a>.
      </Callout>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Basic Querying",
};

export default function SqlBasicQueryingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Querying"
        title="Basic querying"
        description="SELECT, DISTINCT, column aliases, arithmetic and string literals, the WHERE filter, ORDER BY sorting, and the three ways to limit the rows Oracle returns: FETCH FIRST, OFFSET, and the legacy ROWNUM."
        breadcrumbs={[{ label: "SQL" }, { label: "Basic Querying" }]}
        updated="2026"
      />

      <P>
        A <K>SELECT</K> is a question: which columns, from which table, under which filter, in what
        order, and at most how many rows. Oracle evaluates a query in a fixed order that is worth
        learning once, because every error you hit (alias in <K>WHERE</K>, <K>ORDER BY</K> not
        matching) traces back to it.
      </P>

      <H2>SELECT and the logical order of execution</H2>
      <P>
        You write clauses with columns first, but conceptually Oracle processes them in this order:
      </P>
      <DataTable
        headers={["Step", "Clause", "What it does"]}
        rows={[
          ["1", "FROM", "Pick the table(s) and join them"],
          ["2", "WHERE", "Discard rows that fail the filter"],
          ["3", "GROUP BY", "Collapse rows into groups (see grouping page)"],
          ["4", "HAVING", "Discard whole groups that fail"],
          ["5", "SELECT", "Compute the output columns and aliases"],
          ["6", "ORDER BY", "Sort the final rows"],
          ["7", "FETCH FIRST", "Cut the result down to N rows"],
        ]}
      />
      <Callout type="warning">
        Because aliases are created at step 5, you <strong>cannot</strong> use a column alias inside{" "}
        <K>WHERE</K> or <K>GROUP BY</K> — but you <em>can</em> in <K>ORDER BY</K>, which runs after
        <K>SELECT</K>. <K>SELECT customer_name AS name FROM customers WHERE name = 'X'</K> fails;
        <K>... ORDER BY name</K> works.
      </Callout>

      <H2>The basic SELECT</H2>
      <CodeBlock
        language="sql"
        filename="Read all rows, some columns"
        code={`SELECT customer_name, credit_limit    -- the columns you want
FROM   customers                          -- the table
WHERE  region_id = 1;                     -- keep only matching rows`}
      />
      <CodeBlock
        language="sql"
        filename="Everything in the table — and every DISTINCT combination"
        code={`SELECT * FROM orders;            -- every column, every row

SELECT DISTINCT customer_id   -- one row per distinct customer
FROM   orders;                -- (NULLs count once)
`}
      />
      <UL>
        <li>
          <K>SELECT *</K> is fine for exploration, but name columns explicitly in real code — the
          report survives someone adding a column later.
        </li>
        <li>
          <K>DISTINCT</K> deduplicates the <em>whole selected row combination</em>, not just the
          first column. <K>SELECT DISTINCT customer_id, region_id</K> is different from{" "}
          <K>SELECT DISTINCT customer_id</K>.
        </li>
      </UL>

      <H2>Column aliases</H2>
      <P>
        An <strong>alias</strong> renames the output column, which matters when a column is an
        expression or the name is awkward. Use double quotes to keep case, spaces, or special
        characters:
      </P>
      <CodeBlock
        language="sql"
        filename="Aliases, plain and quoted"
        code={`SELECT customer_name AS name,
       credit_limit AS "Credit Limit"
FROM   customers;`}
      />
      <Callout type="info">
        In Oracle, an <strong>unquoted</strong> alias is stored uppercase (<K>NAME</K>), and a{" "}
        <strong>quoted</strong> alias keeps exactly what you typed (<K>Credit Limit</K>). Reference a
        quoted one with the same quotes, or you will get <K>ORA-00904</K>.
      </Callout>

      <H2>Arithmetic and string literals</H2>
      <P>
        Columns can be combined with <K>+ - * /</K> and text with the concatenation operator{" "}
        <K>||</K>. In the <K>SELECT</K> list, literals are written in single quotes:
      </P>
      <CodeBlock
        language="sql"
        filename="Numbers, dates, and strings"
        code={`SELECT order_id,
       total_amount * 1.10   AS total_with_tax,
       'Order ' || order_id  AS order_label,
       DATE '2026-08-15'     AS anchor_date
FROM   orders;`}
      />
      <UL>
        <li>
          Arithmetic on NULL yields NULL — there is no "skip the missing value" by default. That is
          why expressions like <K>qty * price</K> quietly disappear when either is NULL.
        </li>
        <li>
          Integer <K>/</K> division is <em>not</em> integer: <K>7 / 2 = 3.5</K> in Oracle, unlike
          many languages. Use <K>TRUNC</K>/<K>ROUND</K> to shape the result.
        </li>
        <li>
          Date arithmetic in Oracle is in <strong>days</strong>: <K>order_date + 30</K> is 30 days
          later. To add months, use <K>ADD_MONTHS</K> (see single-row functions).
        </li>
        <li>
          Character literal compare is case-sensitive by default, and the rules become surprising
          in <K>WHERE</K> — that is the next page's territory.
        </li>
      </UL>

      <H2>WHERE — the filter</H2>
      <P>
        <K>WHERE</K> applies row-by-row comparisons. It can use the operators you will see in depth
        on the filtering page; here is the basic shape and one regex-free trap-free example:
      </P>
      <CodeBlock
        language="sql"
        filename="WHERE with numbers and strings"
        code={`SELECT customer_name, credit_limit
FROM   customers
WHERE  credit_limit >= 10000          -- numeric comparison
  AND  region_id IN (1, 3);           -- membership test`}
      />

      <H2>ORDER BY</H2>
      <P>
        Sort with <K>ORDER BY</K>, ascending (<K>ASC</K>, default) or descending (<K>DESC</K>).
        You can sort by a column name, an alias, a position, or an expression:
      </P>
      <CodeBlock
        language="sql"
        filename="Sorting three different ways"
        code={`SELECT customer_name, credit_limit
FROM   customers
ORDER  BY credit_limit DESC;          -- biggest first

SELECT order_id, customer_id, total_amount
FROM   orders
ORDER  BY customer_id, total_amount DESC;   -- customer asc, amount desc within each`}
      />
      <UL>
        <li>Sort multiple keys left to right; order is stable within the first key.</li>
        <li>NULLs sort last on <K>ASC</K> and first on <K>DESC</K> (default Oracle behavior). You can override with <K>NULLS FIRST</K> / <K>NULLS LAST</K>.</li>
        <li>Sorting by a <K>character</K> column uses the session's linguistic collation unless you specify <K>COLLATE</K> — accents and case handling differ by database setting.</li>
      </UL>

      <H2>Limiting rows: FETCH FIRST, OFFSET, and ROWNUM</H2>
      <P>
        "Top ten" queries in modern Oracle use <K>FETCH FIRST</K>. The older <K>ROWNUM</K> approach
        predates it and has a famous footgun, so both appear here.
      </P>
      <CodeBlock
        language="sql"
        filename="Modern row limiting (12c+) — with pagination"
        code={`-- Top 5 biggest orders
SELECT order_id, total_amount
FROM   orders
ORDER  BY total_amount DESC
FETCH  FIRST 5 ROWS ONLY;

-- Page 2 of the same list (rows 6..10)
SELECT order_id, total_amount
FROM   orders
ORDER  BY total_amount DESC
OFFSET 5 ROWS FETCH NEXT 5 ROWS ONLY;

-- With a percentage, for sampling
SELECT * FROM customers
FETCH  FIRST 10 PERCENT ROWS ONLY;`}
      />
      <Callout type="danger">
        <K>ROWNUM</K> is assigned <em>before</em> sorting — so{" "}
        <K>SELECT * FROM orders WHERE ROWNUM &lt;= 5 ORDER BY total_amount DESC</K> does{" "}
        <strong>not</strong> give you the five biggest orders; it gives five arbitrary rows (usually
        in insert order) and then sorts them. For correct "top N", nest:
        <K>SELECT * FROM (SELECT * FROM orders ORDER BY total_amount DESC) WHERE ROWNUM &lt;= 5</K>.
        Prefer <K>FETCH FIRST</K> and keep <K>ROWNUM</K> for legacy code and the techniques on the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/advanced-querying">advanced</a>{" "}
        pages.
      </Callout>
      <P>
        And a quirk to remember: Oracle's optimizer performs this row cutoff at the end, so a top-N
        optimizer hint can still avoid sorting everything — that is what makes{" "}
        <K>FETCH FIRST</K> so fast on big tables.
      </P>
    </>
  );
}
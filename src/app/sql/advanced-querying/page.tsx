import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Advanced Querying",
};

export default function SqlAdvancedQueryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Advanced"
        title="Advanced querying"
        description="Hierarchical CONNECT BY queries, PIVOT and UNPIVOT, regular-expression functions, LISTAGG string aggregation, and reading JSON and XML straight from SQL."
        breadcrumbs={[{ label: "SQL" }, { label: "Advanced Querying" }]}
        updated="2026"
      />

      <P>
        These are the "shape-shifting" tools: turn rows into a tree (hierarchies), turn columns into
        rows (unpivot) or vice versa (pivot), aggregate strings, and reach into JSON or XML without
        leaving SQL. They are the difference between writing five queries and writing one.
      </P>

      <H2>Hierarchical queries: CONNECT BY, START WITH, LEVEL, PRIOR</H2>
      <P>
        Oracle's native way to walk a parent/child tree in one statement. Every row gets a{" "}
        <K>LEVEL</K> — how deep it sits — and <K>PRIOR</K> refers to the parent row in the
        current-to-previous comparison:
      </P>
      <CodeBlock
        language="sql"
        filename="The org chart from EMPLOYEES (manager_id chain)"
        code={`SELECT LPAD(' ', 2 * (LEVEL - 1)) || full_name AS employee,
       LEVEL
FROM   employees
START WITH manager_id IS NULL        -- who is the root?
CONNECT BY PRIOR employee_id = manager_id;   -- child.manager_id = parent.employee_id`}
      />
      <DataTable
        headers={["Keyword", "Meaning"]
        }
        rows={[
          ["START WITH", "Which rows are the roots of the tree"],
          ["CONNECT BY", "How a child relates to its parent"],
          ["PRIOR", "The parent side of the connection (used in the CONNECT BY + SELECT)"],
          ["LEVEL", "Depth: 1 at the root, 2 at first children, …"],
          ["ORDER SIBLINGS BY", "Order rows at the same level within the tree"],
        ]}
      />
      <UL>
        <li>Direction matters: <K>PRIOR employee_id = manager_id</K> walks down (parent → children); <K>PRIOR manager_id = employee_id</K> walks up.</li>
        <li>Cycles (A reports to B who reports to A) cause infinite loops — add <K>NOCYCLE</K> and handle <K>CONNECT_BY_ISCYCLE</K>.</li>
        <li>The ANSI alternative — recursive <K>WITH</K> — is on the{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/sql/subqueries">subqueries page</a>; both produce a tree, pick whichever your shop standardizes on.</li>
      </UL>

      <H2>PIVOT and UNPIVOT</H2>
      <P>
        <K>PIVOT</K> rotates rows of category values into new <em>columns</em> — the classic
        "counts per region as columns" report:
      </P>
      <CodeBlock
        language="sql"
        filename="Orders by region, one column per region"
        code={`SELECT *
FROM   (
  SELECT r.region_name, o.order_id
  FROM   orders o
  JOIN   customers c ON c.customer_id = o.customer_id
  JOIN   regions   r ON r.region_id   = c.region_id
)
PIVOT (
  COUNT(order_id)                -- what to compute
  FOR region_name IN ('West' AS west, 'East' AS east)   -- value -> column
);`}
      />
      <P>
        <K>UNPIVOT</K> is the reverse — take several columns you want to treat as one dimension:
      </P>
      <CodeBlock
        language="sql"
        filename="Columns to rows"
        code={`SELECT * FROM sales_totals
UNPIVOT (
  amount FOR quarter IN (q1, q2, q3, q4)
);   -- each row becomes 4 rows with a quarter name column`}
      />

      <H2>Regular expressions</H2>
      <P>
        Oracle's regex functions search, extract, and rewrite text with patterns. They are
        per-row (single-row) and are the escalation when <K>LIKE</K> is too blunt:
      </P>
      <DataTable
        headers={["Function", "What it does"]
        }
        rows={[
          ["REGEXP_LIKE(col, pattern)", "TRUE if the string matches the pattern"],
          ["REGEXP_SUBSTR(col, pattern, start, occ)", "Extracts the matching substring"],
          ["REGEXP_REPLACE(col, pattern, replacement)", "Replaces matches (group refs with \\1)"],
          ["REGEXP_INSTR(col, pattern)", "Position of the first match"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Find valid US phone formats and scrub them"
        code={`-- Rows that are a 10-digit or 3-3-4 phone number
SELECT * FROM contacts
WHERE  REGEXP_LIKE(phone, '^\\(?[0-9]{3}\\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}$');

-- Normalize to 555-123-4567
SELECT REGEXP_REPLACE(phone,
        '\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})',
        '\\1-\\2-\\3') AS normalized
FROM   contacts;`}
      />

      <H2>LISTAGG — string aggregation</H2>
      <P>
        <K>LISTAGG</K> concatenates values within a group into one string — "list the order IDs for
        this customer separated by commas":
      </P>
      <CodeBlock
        language="sql"
        filename="One row per customer with their order numbers"
        code={`SELECT c.customer_name,
       LISTAGG(o.order_id, ', ') WITHIN GROUP (ORDER BY o.order_id)
         AS order_list
FROM   customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
GROUP  BY c.customer_name;`}
      />
      <Callout type="warning">
        The famous <K>LISTAGG</K> limit: the output is a <K>VARCHAR2</K> and hits the 4,000-byte
        ceiling (or 32,767 in extended mode) with <K>ORA-01489</K> on big groups. The 19c+{" "}
        <K>ON OVERFLOW TRUNCATE</K> / <K>ON OVERFLOW ERROR</K> clauses give you control; for
        genuinely huge strings pre-aggregate or use <K>JSON_ARRAYAGG</K>.
      </Callout>

      <H2>Reading JSON and XML in SQL</H2>
      <P>
        Modern Oracle stores JSON in an <K>IS JSON</K>-checked column and lets you pull fields out
        in plain SQL. The deep dive is the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/json-xml">JSON &amp; XML page</a>,
        but the shape you will see daily:
      </P>
      <CodeBlock
        language="sql"
        filename="One JSON document per row, queried in place"
        code={`-- Orders with a JSON attributes column
SELECT o.order_id,
       JSON_VALUE(o.attributes, '$.shipment_tracking') AS tracking,
       JSON_QUERY(o.attributes, '$.packages')          AS packages
FROM   orders o
WHERE  o.attributes IS JSON;`}
      />
      <P>
        And XML with <K>XMLTABLE</K> (XMLTYPE-typed columns) when you integrate with legacy XML
        feeds — the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/plsql">PL/SQL page</a>{" "}
        shows the XMLTYPE handling side. Consider the <K>MODEL</K> clause — Oracle's spreadsheet-like
        "if/then across rows" engine — as the very last tool to reach for; it is powerful, obscure,
        and rarely worth the learning curve versus a self-join or analytic function.
      </P>
    </>
  );
}
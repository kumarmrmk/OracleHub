import PageHeader, { H2, P } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Joins",
};

export default function SqlJoinsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Combining tables"
        title="Joins"
        description="Inner, left/right/full outer, cross, and self joins; equi vs non-equi joins; the ANSI JOIN ... ON syntax; and how to recognize the legacy Oracle outer-join operator (+) you will find in old code."
        breadcrumbs={[{ label: "SQL" }, { label: "Joins" }]}
        updated="2026"
      />

      <P>
        A join combines rows from two tables by matching values — usually a parent's primary key
        against a child's foreign key. The only hard part is deciding which rows survive when a
        match is <em>missing</em>. That decision is what separates INNER, OUTER, and the rest.
      </P>

      <H2>Setting the scene: the data</H2>
      <P>
        The examples use the running schema. A customer belongs to a region (via{" "}
        <K>region_id</K>), and orders belong to customers. Two regions have customers; one region is
        empty; one customer has no region; one customer has no orders — which buys us every join
        case at once.
      </P>

      <H2>Inner join — only matching rows</H2>
      <P>
        An <strong>inner join</strong> keeps rows that have a match on both sides. Rows without a
        key match simply vanish:
      </P>
      <CodeBlock
        language="sql"
        filename="ANSI inner join"
        code={`SELECT c.customer_name, r.region_name
FROM   customers c
INNER JOIN regions r ON r.region_id = c.region_id;
-- Every customer must have a matching region row or it is dropped`}
      />
      <Callout type="info">
        <K>INNER JOIN</K> and just <K>JOIN</K> are the same thing. Because <K>JOIN</K> is a
        start-of-clause keyword and <K>,</K>-comma joins behave identically, join type and join
        method do not decide the plan — the optimizer does. Write what you mean.
      </Callout>

      <H2>Left / right / full outer joins</H2>
      <P>
        An <strong>outer join</strong> keeps the unmatched rows of one (or both) sides, padding the
        other side's columns with <K>NULL</K>:
      </P>
      <DataTable
        headers={["Join", "Keeps", "Classic use"]
        }
        rows={[
          ["LEFT [OUTER] JOIN", "All left rows + matches", "All customers, even region-less"],
          ["RIGHT [OUTER] JOIN", "All right rows + matches", "All regions, even empty ones"],
          ["FULL [OUTER] JOIN", "All rows from both sides", "Find unmatched on either side"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Every customer, showing 'No region' when unmatched"
        code={`SELECT c.customer_name,
       NVL(r.region_name, 'No region') AS region
FROM   customers c
LEFT JOIN regions r ON r.region_id = c.region_id;`}
      />
      <Callout type="warning">
        When an outer join <em>does</em> match, the non-matching side comes back NULL — so filtering
        with <K>WHERE r.region_name = 'West'</K> silently turns your outer join back into an inner
        one (it drops the NULL rows). Move the filter into the <K>ON</K> clause or use{" "}
        <K>IS NULL</K> deliberately (e.g. "customers with no orders"):
        <K>WHERE o.order_id IS NULL</K>.
      </Callout>

      <H2>Cross join</H2>
      <P>
        A <strong>cross join</strong> produces every pair of rows — no condition at all. It is the
        Cartesian product and grows explosively (N×M rows), so it is only for generating
        combinations or testing:
      </P>
      <CodeBlock
        language="sql"
        filename="Every customer × every region"
        code={`SELECT c.customer_name, r.region_name
FROM   customers c
CROSS  JOIN regions r;   -- N customers × M regions = expensive`}
      />

      <H2>Self join</H2>
      <P>
        Joining a table to <em>itself</em> is how you pair each row with another row in the same
        table — employees with their manager, cities with neighboring cities. The trick is aliasing:
      </P>
      <CodeBlock
        language="sql"
        filename="Each customer paired with its own region sibling"
        code={`SELECT a.customer_name AS customer_a,
       b.customer_name AS customer_b,
       r.region_name
FROM   customers a
JOIN   customers b ON b.region_id = a.region_id
JOIN   regions   r ON r.region_id = a.region_id
WHERE  a.customer_id <> b.customer_id
ORDER  BY r.region_name;`}
      />
      <P>
        Read it as "for every <K>a</K>, find a different <K>b</K> in the same region." Self-joins
        with <K>WHERE</K>/<K>ON</K> filters give you pairings, hierarchies, and "next similar row"
        logic.
      </P>

      <H2>Equi and non-equi joins</H2>
      <P>
        Almost every join matches on <K>=</K> — that is an <strong>equi join</strong>. When you need
        a range or an inequality instead, it is a <strong>non-equi join</strong>:
      </P>
      <CodeBlock
        language="sql"
        filename="Non-equi: payment bracket lookup, no = at all"
        code={`CREATE TABLE payment_brackets (
  lower_bound  NUMBER NOT NULL,
  upper_bound  NUMBER NOT NULL,
  fee          NUMBER
);

SELECT o.order_id, pb.fee
FROM   orders o
JOIN   payment_brackets pb
  ON  o.total_amount >= pb.lower_bound
  AND o.total_amount <  pb.upper_bound;`}
      />
      <P>
        Non-equi joins are how you attach a "which tier" answer to every row — but they cannot use a
        plain B-tree foreign key, so watch the plan (the performance page covers why).
      </P>

      <H2>ANSI JOIN vs the old Oracle (+) syntax</H2>
      <P>
        The modern form you have just seen — <K>JOIN … ON</K> — is the ANSI standard and what all
        new code should use. It also works for outer, cross, and self joins, and the join condition
        is explicit and local to the join.
      </P>
      <P>
        Legacy code from before Oracle 9i expresses an outer join with{" "}
        <K>(+)</K> placed on the side that is <em>missing</em> values — the "optional" side. The full
        outer example rewritten:
      </P>
      <CodeBlock
        language="sql"
        filename="Old-style outer join"
        code={`SELECT c.customer_name, r.region_name
FROM   customers c, regions r
WHERE  r.region_id(+) = c.region_id;   -- (+) marks the side that may be absent`}
      />
      <Callout type="warning">
        Read <K>(+)</K> fluently but never write it: the ANSI form is clearer, handles{" "}
        <K>FULL OUTER</K> (which <K>(+)</K> cannot), and avoids the notorious "ORA-01417: a table may
        be outer joined to at most one other table". Every shop-standard is ANSI joins today.
      </Callout>

      <H2>Choosing the join in one table</H2>
      <DataTable
        headers={["I need…", "Write…", "Result"]
        }
        rows={[
          ["Rows that exist on both sides", "INNER JOIN … ON", "Matching pairs only"],
          ["All of the left, plus what matches", "LEFT JOIN … ON", "Left rows with NULL padding on the right"],
          ["Both sides, even unmatched", "FULL OUTER JOIN … ON", "Everything, NULLs on whichever side fails"],
          ["Every combination", "CROSS JOIN", "N × M rows"],
          ["Rows compared within one table", "JOIN table t2 ON …", "Pairs inside the same table"],
        ]}
      />
    </>
  );
}
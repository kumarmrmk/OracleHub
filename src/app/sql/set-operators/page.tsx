import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Set Operators",
};

export default function SqlSetOperatorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Combining tables"
        title="Set operators"
        description="UNION, UNION ALL, INTERSECT, and MINUS (Oracle's EXCEPT) — combining whole result sets vertically, plus the column and ordering rules that make them fail."
        breadcrumbs={[{ label: "SQL" }, { label: "Set Operators" }]}
        updated="2026"
      />

      <P>
        Joins combine tables <em>side by side</em> (more columns). <strong>Set operators</strong>{" "}
        combine result sets <em>one under another</em> (more rows). You use them for "which
        customers appear in either list", "which products we stopped selling", and reconciliation
        questions where two systems' outputs must be compared.
      </P>

      <H2>The four operators</H2>
      <DataTable
        headers={["Operator", "Rows returned", "Dedup?", "Meaning"]
        }
        rows={[
          ["UNION", "Rows in A or B", "Yes", "Everything, once"],
          ["UNION ALL", "Rows in A or B", "No", "Everything, duplicates kept"],
          ["INTERSECT", "Rows in both A and B", "Yes", "The overlap"],
          ["MINUS", "Rows in A but not B", "Yes", "The difference (Oracle's EXCEPT)"],
        ]}
      />
      <Callout type="warning">
        <strong>MINUS</strong> is Oracle's name for what other databases call{" "}
        <K>EXCEPT</K>. New versions of Oracle actually accept <K>EXCEPT</K> as a synonym, but legacy
        scripts say <K>MINUS</K> — know both.
      </Callout>

      <H2>The column rules</H2>
      <P>
        Both queries must return the <strong>same number of columns</strong> with{" "}
        <strong>compatible types</strong>. The column names used for output come from the{" "}
        <em>first</em> query. Violations throw <K>ORA-00933</K> or <K>ORA-01790</K>:
      </P>
      <CodeBlock
        language="sql"
        filename="Customers in both regions, deduplicated"
        code={`SELECT customer_id FROM customers WHERE region_id = 1
UNION
SELECT customer_id FROM customers WHERE region_id = 2;`}
      />
      <P>
        The classic mistake is writing <K>ORDER BY</K> inside one leg — ordering belongs at the very
        end and applies to the whole result:
      </P>
      <CodeBlock
        language="sql"
        filename="Correct ORDER BY placement"
        code={`SELECT customer_name, 'has orders' AS status FROM customers WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = customers.customer_id)
UNION ALL
SELECT customer_name, 'no orders' AS status FROM customers WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = customers.customer_id)
ORDER  BY status, customer_name;   -- one ORDER BY at the end`}
      />
      <Callout type="info">
        Output <strong>column names come from the first leg</strong>, so aliases you set on the
        second leg are ignored for naming. Don't fight it — name things in leg one.
      </Callout>

      <H2>UNION vs UNION ALL — the cost difference</H2>
      <P>
        <K>UNION</K> must sort or hash the whole result to find and drop duplicates.{" "}
        <K>UNION ALL</K> merely appends — no sort. On large sets that is the difference between a
        fast query and an expensive one:
      </P>
      <UL>
        <li>
          If the two legs <em>cannot overlap</em> (distinct key ranges), use <K>UNION ALL</K> and
          skip the sort.
        </li>
        <li>
          If you need the count of distinct rows, <K>UNION</K> is the real meaning — keep it.
        </li>
      </UL>
      <Callout type="tip">
        Rule of thumb: "did I mean duplicates-or-not?" If duplicates are fine or impossible,{" "}
        <K>UNION ALL</K> is almost always the better choice on big data.
      </Callout>

      <H2>INTERSECT and MINUS — the reconciler's tools</H2>
      <P>
        These two are gold in data-quality work: compare what two systems think and find the
        differences in one statement.
      </P>
      <CodeBlock
        language="sql"
        filename="Rows that agree, and rows that differ"
        code={`-- What BOTH sources believe (INTERSECT)
SELECT account_id, balance FROM new_system
INTERSECT
SELECT account_id, balance FROM old_system;

-- What the new system thinks but the old one does not (MINUS)
SELECT account_id, balance FROM new_system
MINUS
SELECT account_id, balance FROM old_system;`}
      />
      <Callout type="warning">
        <K>INTERSECT</K> and <K>MINUS</K> compare the <em>whole</em> selected row, not just the key.
        If the two systems disagree only on <K>balance</K>, the row shows up in both MINUS legs with
        different values — which is exactly what your reconciliation wants to see, but "changed" vs
        "new" rows need a full join plus <K>NULLIF</K> or <K>DECODE</K> to separate.
      </Callout>
    </>
  );
}
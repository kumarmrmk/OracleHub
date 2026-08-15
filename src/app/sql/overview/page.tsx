import PageHeader, { P, H2 } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import LearningPath from "@/components/ui/LearningPath";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Oracle SQL — Overview",
};

export default function SqlOverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL"
        title="Learning Oracle SQL — where to start"
        description="SQL is the language you use every time you touch an Oracle database: asking questions of tables, changing rows, defining objects, and tuning how the database answers. This section walks the full roadmap — from schema and SELECT to analytic functions, partitioning, and PL/SQL — with every example written for a real Oracle database."
        breadcrumbs={[{ label: "SQL" }, { label: "Overview" }]}
        updated="2026"
      />

      <P>
        The pages are ordered so each builds on the previous one. Work through the foundations first
        (what a table is, what the data types mean), then querying, then joins and subqueries, and
        only then move to the object-definition and performance topics. The whole section is written
        against an Oracle database — SQL*Plus, SQL Developer, or <K>sql</K> in SQLcl — so every
        example runs as-is.
      </P>

      <Callout type="tip">
        You do not need an installed Oracle database to start. SQLcl and SQL Developer connect to
        any <strong>free Oracle Database Free (23ai)</strong> instance, and the Oracle Live SQL
        website lets you run many of these examples in the browser. The data dictionary views used
        here (<K>USER_TABLES</K>, <K>ALL_OBJECTS</K>, …) exist in every version.
      </Callout>

      <Callout type="warning">
        <strong>Learn without breaking things.</strong> Examples throughout this section include{" "}
        <K>UPDATE</K>, <K>DELETE</K>, <K>MERGE</K>, <K>TRUNCATE</K>, <K>DROP</K>, and trigger
        code. They are illustrative and version-dependent — run them only against a{" "}
        <strong>disposable learning instance</strong> (a throwaway schema or a free practice
        database), never production. The pages with data-destroying statements mark them with
        <K>DANGER</K> callouts so you can spot them at a glance.
      </Callout>

      <H2>The learning path</H2>
      <LearningPath
        title="Read in this order — each page builds on the last"
        steps={[
          {
            href: "/sql/database-foundations",
            title: "Database foundations",
            level: "Foundation",
            outcome: "The schema model — database, schema, table, row, column, keys — plus DDL/DML/DCL/TCL and the tools you'll use (SQL Developer, SQLcl).",
          },
          {
            href: "/sql/data-types",
            title: "Oracle data types",
            level: "Foundation",
            outcome: "VARCHAR2, CHAR, NUMBER, DATE/TIMESTAMP, CLOB, BLOB, RAW, ROWID, and what NULL really means (three-valued logic).",
          },
          {
            href: "/sql/basic-querying",
            title: "Basic querying",
            level: "Foundation",
            outcome: "SELECT, DISTINCT, aliases, arithmetic and string concatenation, WHERE, ORDER BY, and limiting rows with FETCH FIRST / ROWNUM.",
          },
          {
            href: "/sql/filtering",
            title: "Filtering",
            level: "Foundation",
            outcome: "Comparison operators, AND/OR/NOT, IN, BETWEEN, LIKE wildcards, IS NULL, and EXISTS vs NOT EXISTS.",
          },
          {
            href: "/sql/single-row-functions",
            title: "Single-row functions",
            level: "Foundation",
            outcome: "Character, number, date, and conversion functions; NVL/NVL2/NULLIF/COALESCE; CASE and DECODE.",
          },
          {
            href: "/sql/grouping-aggregates",
            title: "Grouping & aggregate functions",
            level: "Foundation",
            outcome: "COUNT/SUM/AVG/MIN/MAX, GROUP BY, HAVING, and the analytic groundwork of ROLLUP, CUBE, and GROUPING SETS.",
          },
          {
            href: "/sql/joins",
            title: "Joins",
            level: "Foundation",
            outcome: "Inner, outer, cross, and self joins; equi vs non-equi; the ANSI JOIN syntax; and how to recognize the old (+) syntax.",
          },
          {
            href: "/sql/subqueries",
            title: "Subqueries",
            level: "Foundation",
            outcome: "Single-row, multiple-row, and correlated subqueries, inline views, scalar subqueries, ANY/ALL, and WITH (CTE) queries — plain and recursive.",
          },
          {
            href: "/sql/set-operators",
            title: "Set operators",
            level: "Foundation",
            outcome: "UNION, UNION ALL, INTERSECT, and MINUS (Oracle's EXCEPT).",
          },
          {
            href: "/sql/dml",
            title: "DML — changing data",
            level: "Module",
            outcome: "INSERT, UPDATE, DELETE, MERGE upserts, INSERT ALL, multi-table inserts, and RETURNING INTO.",
          },
          {
            href: "/sql/transactions",
            title: "Transactions",
            level: "Module",
            outcome: "COMMIT, ROLLBACK, SAVEPOINT, read consistency, and the locking model behind concurrent access.",
          },
          {
            href: "/sql/ddl",
            title: "DDL — database objects",
            level: "Module",
            outcome: "CREATE/ALTER/DROP/TRUNCATE/RENAME; tables and temporary tables; and the object family: views, sequences, synonyms, indexes, constraints.",
          },
          {
            href: "/sql/constraints",
            title: "Constraints & data integrity",
            level: "Module",
            outcome: "PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK, defaults, cascading deletes, and enabling/disabling constraints.",
          },
          {
            href: "/sql/views",
            title: "Views",
            level: "Module",
            outcome: "Simple vs complex views, updatable views, WITH CHECK OPTION and WITH READ ONLY, and materialized views.",
          },
          {
            href: "/sql/sequences-identity",
            title: "Sequences & identity columns",
            level: "Module",
            outcome: "CREATE SEQUENCE, NEXTVAL and CURRVAL, cache/cycle/increment settings, and 12c+ identity columns.",
          },
          {
            href: "/sql/advanced-querying",
            title: "Advanced querying",
            level: "Advanced",
            outcome: "CONNECT BY hierarchies, PIVOT/UNPIVOT, REGEXP functions, LISTAGG, and reading JSON and XML in SQL.",
          },
          {
            href: "/sql/analytic-functions",
            title: "Analytic / window functions",
            level: "Advanced",
            outcome: "OVER, PARTITION BY, window frames, ROW_NUMBER/RANK/DENSE_RANK, LAG/LEAD, running totals, FIRST_VALUE/LAST_VALUE, NTILE and the rest.",
          },
          {
            href: "/sql/oracle-specific",
            title: "Oracle-specific SQL",
            level: "Advanced",
            outcome: "DUAL, ROWNUM and ROWID, NVL and DECODE, CONNECT BY, format models, and the USER_/ALL_/DBA_ data dictionary views.",
          },
          {
            href: "/sql/indexes-performance",
            title: "Indexes & performance",
            level: "Advanced",
            outcome: "B-tree vs bitmap vs function-based indexes, composite indexes, EXPLAIN PLAN and DBMS_XPLAN, and join methods.",
          },
          {
            href: "/sql/partitioning",
            title: "Partitioning & large data",
            level: "Advanced",
            outcome: "Range/list/hash/interval partitioning, partition pruning, local vs global indexes, and parallel query.",
          },
          {
            href: "/sql/security",
            title: "Security",
            level: "Advanced",
            outcome: "Users, roles, system vs object privileges, GRANT/REVOKE, profiles, synonyms for controlled access, and VPD basics.",
          },
          {
            href: "/sql/json-xml",
            title: "JSON, XML & modern SQL",
            level: "Advanced",
            outcome: "JSON columns, JSON_VALUE/JSON_QUERY/JSON_TABLE, XMLTYPE, and SQL macros — the modern Oracle database.",
          },
          {
            href: "/sql/plsql",
            title: "PL/SQL basics",
            level: "Advanced",
            outcome: "Anonymous blocks, variables, conditions, loops, cursors, procedures, functions, packages, exceptions, triggers, and dynamic SQL.",
          },
        ]}
      />

      <H2>A single worked example that carries through</H2>
      <P>
        Several pages reuse the same small schema so you can follow one story from first{" "}
        <K>SELECT</K> to analytic query. It models a simplified <strong>sales</strong> table that an
        order-to-cash process might own:
      </P>
      <CodeBlock
        language="sql"
        filename="A tiny sales schema you will see again"
        code={`CREATE TABLE regions (
  region_id   NUMBER PRIMARY KEY,
  region_name VARCHAR2(30) NOT NULL
);

CREATE TABLE customers (
  customer_id      NUMBER PRIMARY KEY,
  customer_name    VARCHAR2(60) NOT NULL,
  region_id        NUMBER REFERENCES regions(region_id),
  credit_limit     NUMBER(12,2)
);

CREATE TABLE orders (
  order_id     NUMBER PRIMARY KEY,
  customer_id  NUMBER NOT NULL REFERENCES customers(customer_id),
  order_date   DATE DEFAULT SYSDATE,
  total_amount NUMBER(12,2) NOT NULL
);`}
      />
      <P>
        The <K>regions → customers → orders</K> chain is a classic <strong>one-to-many</strong>
        parent → child relationship, and it reappears in the joins, subqueries, DML, and index pages
        so the examples stay concrete.
      </P>
      <Callout type="note">
        Want a copy-paste runnable dataset? The <a className="font-semibold text-sky-300 hover:underline" href="/sql/dml">DML page</a>{" "}
        includes an <K>INSERT</K> block that populates these three tables with enough rows for the
        later examples.
      </Callout>

      <H2>Quick reference: the four SQL statement families</H2>
      <P>
        Every statement you write falls into one of these categories. Knowing the family tells you
        whether the statement can be rolled back (DML yes, DDL no) and who is allowed to run it.
      </P>
      <DataTable
        headers={["Family", "What it does", "Verbs", "Transactional?"]}
        rows={[
          ["DDL", "Define and change database objects", "CREATE, ALTER, DROP, TRUNCATE, RENAME, COMMENT", "Commits implicitly; cannot be rolled back"],
          ["DML", "Query and modify the rows inside tables", "SELECT, INSERT, UPDATE, DELETE, MERGE", "SELECT is read-only; the rest are part of your transaction"],
          ["DCL", "Grant and revoke security privileges", "GRANT, REVOKE", "Commits implicitly"],
          ["TCL", "Control your transaction", "COMMIT, ROLLBACK, SAVEPOINT", "These are the transaction itself"],
        ]}
      />
      <Callout type="warning">
        A common beginner trap in Oracle: pay attention to DDL's{" "}
        <strong>implicit commit</strong>. Running <K>CREATE INDEX</K> in the middle of a batch
        permanently commits all the work you did before it — which is usually not what you wanted.
      </Callout>
    </>
  );
}
import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Database Foundations",
};

export default function SqlFoundationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Foundations"
        title="Database foundations"
        description="What a database, schema, table, row, column, and key actually are, how SQL is carved into DDL / DML / DCL / TCL, the data dictionary, and the tools you will type SQL into — SQL Developer and SQLcl."
        breadcrumbs={[{ label: "SQL" }, { label: "Foundations" }]}
        updated="2026"
      />

      <P>
        Everything in this section depends on one simple idea: <strong>relational data is stored in
        tables</strong>, and SQL is the language you use to read and change it. Before the first
        query, it is worth being precise about the vocabulary, because words like "schema" and
        "database" mean particular things in Oracle that differ from other products.
      </P>

      <H2>Database, schema, table, row, column</H2>
      <P>
        In Oracle, a <strong>database</strong> is the physical storage: the files and memory
        structures that a running <strong>database instance</strong> manages. Inside it live{" "}
        <strong>schemas</strong>, which are logical containers owned by users. This is a common
        source of confusion because in MySQL a "schema" is basically a "database" — in Oracle the
        words are different.
      </P>
      <Diagram title="Containment: database → schemas → tables" className="mt-6 mb-8">
        <DiagramNode tone="accent" icon="🗄️" title="Database" subtitle="Instance + datafiles + redo logs (one per server)" />
        <Arrow label="contains" />
        <DiagramNode tone="oic" icon="👤" title="Schema (owned by a user)" subtitle="HR · APPS · SCOTT — one container per user" />
        <Arrow label="contains" />
        <DiagramNode tone="success" icon="📋" title="Tables" subtitle="regions, customers, orders — plus views, indexes, …" />
      </Diagram>
      <UL>
        <li>
          <strong>Schema</strong> — the collection of objects owned by one user: tables, views,
          sequences, synonyms, indexes, procedures. The schema name is the owner's username.
        </li>
        <li>
          <strong>Table</strong> — a named collection of <strong>rows</strong> sharing the same
          fixed set of <strong>columns</strong>. Each column has a data type (see the{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/sql/data-types">data types page</a>).
        </li>
        <li>
          <strong>Row</strong> — one record or "tuple": one value for every column.
        </li>
        <li>
          <strong>Column</strong> — one attribute of a record, e.g. <K>customer_name</K>.
        </li>
      </UL>
      <Callout type="info">
        Because a schema is owned by a user, fully-qualified names look like{" "}
        <K>HR.EMPLOYEES</K> — schema <K>HR</K>, table <K>EMPLOYEES</K>. When you reference a
        table without a prefix, Oracle uses your <strong>current schema</strong>.
      </Callout>

      <H2>Primary keys and foreign keys</H2>
      <P>
        Keys are how the database keeps relationships trustworthy. A{" "}
        <strong>primary key (PK)</strong> uniquely identifies every row in a table — it must be
        non-null and unique. A <strong>foreign key (FK)</strong> is a column (or set of columns)
        that references the primary key of another table, enforcing a parent–child relationship:
      </P>
      <DataTable
        headers={["Key", "Guarantees", "Example"]}
        rows={[
          ["Primary key", "Every row is uniquely identified, and no key value is NULL", "orders.order_id"],
          ["Foreign key", "Every value must exist in the referenced parent's primary key", "orders.customer_id → customers.customer_id"],
        ]}
      />
      <P>
        The foreign key is what stops you from inserting an order for a customer that does not
        exist, and it is what lets the database cascade or clean up related rows when a parent is
        deleted. The{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/constraints">constraints page</a>{" "}
        covers the full rules (including what happens on delete).
      </P>

      <H2>SQL statement categories: DDL, DML, DCL, TCL</H2>
      <P>
        SQL is split into four families. You meet one rule from each almost immediately:{" "}
        <strong>DML can be rolled back</strong>, <strong>DDL commits implicitly</strong>,{" "}
        <strong>DCL manages who can do what</strong>, and <strong>TCL is the transaction
        itself</strong>.
      </P>
      <DataTable
        headers={["Family", "Expands to", "Verbs", "You use it when…"]}
        rows={[
          ["DDL", "Data Definition Language", "CREATE, ALTER, DROP, TRUNCATE, RENAME", "Building or changing the structure: tables, indexes, views, synonyms"],
          ["DML", "Data Manipulation Language", "SELECT, INSERT, UPDATE, DELETE, MERGE", "Reading or modifying the rows inside existing tables"],
          ["DCL", "Data Control Language", "GRANT, REVOKE", "Giving users the right to run DML/DDL on objects"],
          ["TCL", "Transaction Control Language", "COMMIT, ROLLBACK, SAVEPOINT", "Making your DML permanent or undoing it"],
        ]}
      />
      <Callout type="warning">
        Oracle executes <strong>implicit commits</strong> before and after many DDL statements. If
        you <K>UPDATE</K> a thousand rows and then run <K>CREATE INDEX</K> before committing, the
        update is committed too — DDL cannot be rolled back and it commits your open work.
      </Callout>

      <H2>Oracle tools: SQL Developer and SQLcl</H2>
      <P>
        Two tools matter for writing SQL against an Oracle database, and both are free:
      </P>
      <DataTable
        headers={["Tool", "What it is", "When to use it"]}
        rows={[
          ["SQL Developer", "A full GUI client: worksheet, data grids, explain plan viewer, PL/SQL debugger", "Interactive development, exploring the data dictionary, debugging"],
          ["SQLcl", "A command-line client (like SQL*Plus, modernized) with history, formatting, spooling, and scripting", "Scripted/automated work, CI pipelines, quick checks in a terminal"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="The same query in both tools"
        code={`-- SQLcl / SQL*Plus / SQL Developer worksheet — identical SQL
SELECT region_name, COUNT(*) AS customer_count
FROM regions r
JOIN customers c ON c.region_id = r.region_id
GROUP BY region_name
ORDER BY customer_count DESC;`}
      />
      <P>
        The SQL text is identical across tools — the tools only change how you run it, see the
        results, and inspect the execution plan (the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/indexes-performance">performance page</a>{" "}
        uses <K>DBMS_XPLAN</K>, available from SQLcl and SQL Developer alike).
      </P>

      <H2>The data dictionary</H2>
      <P>
        Oracle describes itself to you through the <strong>data dictionary</strong> — a set of
        read-only views (owned by <K>SYS</K>) that answer questions like "which tables exist",
        "what columns does this table have", and "what privileges does this user hold". Because it
        is a meta-layer, many dictionary views come in three families:
      </P>
      <DataTable
        headers={["Prefix", "Scope", "Examples"]}
        rows={[
          ["USER_*", "Objects you own", "USER_TABLES, USER_TAB_COLUMNS, USER_VIEWS"],
          ["ALL_*", "Objects you can access (yours + privileged others)", "ALL_TABLES, ALL_OBJECTS, ALL_INDEXES"],
          ["DBA_*", "Everything, requires DBA privileges", "DBA_TABLES, DBA_USERS, DBA_TAB_PRIVS"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="The dictionary in action"
        code={`-- What tables exist in my schema?
SELECT table_name FROM user_tables ORDER BY table_name;

-- What columns does ORDERS have, and what are their types?
SELECT column_name, data_type, data_length, nullable
FROM   user_tab_columns
WHERE  table_name = 'ORDERS'
ORDER  BY column_id;`}
      />
      <Callout type="tip">
        The dictionary is your documentation when someone hands you an unknown schema: scan{" "}
        <K>USER_TABLES</K> first, drill into <K>USER_TAB_COLUMNS</K> for the column list, then{" "}
        <K>USER_CONSTRAINTS</K> to see the keys. The{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/oracle-specific">Oracle-specific page</a>{" "}
        returns to these views in detail.
      </Callout>

      <H2>Schemas in a real enterprise database</H2>
      <P>
        A production Oracle database is never one flat pile of tables. It is many schemas with clear
        ownership, sometimes for separate applications sharing one database:
      </P>
      <DataTable
        headers={["Schema", "Typical content", "Used by"]}
        rows={[
          ["HR", "Employees, departments, jobs", "Human-resources app and the standard HR sample schema"],
          ["APPS", "Application metadata, seeded data, FND tables", "Oracle E-Business Suite style multi-schema setups"],
          ["STAGE", "Landing tables for imports", "ETL/integration jobs that load then transform"],
          ["REPORT", "Views and summary tables", "Reporting tools that should never see raw tables"],
        ]}
      />
      <P>
        This layout is exactly the pattern the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/rest">integrations</a>{" "}
        and{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/fusion/tables">Fusion tables</a>{" "}
        in the rest of this hub rely on — separate owners keep privileges minimal and make it clear
        who is responsible for each object.
      </P>

      <H3>Next up</H3>
      <UL>
        <li>
          Learn the data types before you write your first <K>CREATE TABLE</K> in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/sql/data-types">Oracle data types</a>.
        </li>
        <li>
          Write your first queries in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/sql/basic-querying">basic querying</a>.
        </li>
      </UL>
    </>
  );
}
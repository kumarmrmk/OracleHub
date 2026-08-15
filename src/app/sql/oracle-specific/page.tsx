import PageHeader, { H2, P } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Oracle-Specific SQL",
};

export default function SqlOracleSpecificPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Advanced"
        title="Oracle-specific SQL"
        description="DUAL, ROWID and ROWNUM, NVL and DECODE, CONNECT BY, date and number format models, USER and SYS_CONTEXT, and the USER_ / ALL_ / DBA_ data dictionary views."
        breadcrumbs={[{ label: "SQL" }, { label: "Oracle-Specific" }]}
        updated="2026"
      />

      <P>
        These are the pieces that mark a statement as <em>distinctly Oracle</em>. Some are
        quirks you must read in other people's code (the <K>(+)</K> join, <K>DECODE</K>), others are
        daily tools unique to Oracle (<K>DUAL</K>, <K>ROWNUM</K>, data dictionary views). Knowing
        them separates "writes SQL" from "writes Oracle SQL".
      </P>

      <H2>DUAL</H2>
      <P>
        <K>DUAL</K> is a one-row, one-column dummy table used when you need a <K>SELECT</K> with no
        real table — running functions and literals:
      </P>
      <CodeBlock
        language="sql"
        filename="Exactly one row, always"
        code={`SELECT SYSDATE FROM dual;              -- today
SELECT USER   FROM dual;              -- your schema name
SELECT 60 * 24 * 60 AS minutes       FROM dual;`}
      />
      <Callout type="info">
        Since Oracle 23c you can often write <K>SELECT SYSDATE;</K> without <K>FROM dual</K> — but
        <K>FROM dual</K> works in every version and is what legacy code expects. Keep writing it.
      </Callout>

      <H2>ROWNUM and ROWID</H2>
      <DataTable
        headers={["Pseudo-column", "What it is", "Gotcha"]
        }
        rows={[
          ["ROWNUM", "A running number assigned as Oracle returns each row", "Assigned BEFORE sorting — a top-N trap unless you nest"],
          ["ROWID", "The physical address of the row on disk", "Changes when the row moves; never a durable key"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="ROWNUM genres — correct and the classic mistake"
        code={`-- WRONG intent: five arbitrary rows (then sorted)
SELECT * FROM orders WHERE ROWNUM <= 5 ORDER BY total_amount DESC;

-- RIGHT: sort first inside, then cut
SELECT * FROM (
  SELECT * FROM orders ORDER BY total_amount DESC
) WHERE ROWNUM <= 5;

-- ROWID shines for one-off de-dupe of a heap without a key
DELETE FROM customers c
WHERE  ROWID <> (SELECT MIN(ROWID) FROM customers x
                 WHERE x.customer_id = c.customer_id);`}
      />
      <Callout type="tip">
        Prefer <K>FETCH FIRST</K> for new code (the basic-querying page covers it).{" "}
        <K>ROWNUM</K> survival skill is for reading legacy scripts, and <K>ROWID</K> for quick de-dupe
        surgery where no unique key exists.
      </Callout>

      <H2>NVL, NVL2, NULLIF, DECODE</H2>
      <P>
        The null-handling quartet and Oracle's home-grown conditional were covered in depth on the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/single-row-functions">single-row functions page</a>.
        The shorthand: <K>NVL(a,b)</K> = "a unless NULL, then b"; <K>DECODE(x, a, r1, b, r2, def)</K>{" "}
        = equality-dispatch. You will see both everywhere in existing code, and you will write{" "}
        <K>COALESCE</K> and <K>CASE</K> instead.
      </P>

      <H2>CONNECT BY</H2>
      <P>
        The tree-walker is the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/advanced-querying">advanced querying page's</a>{" "}
        subject; the Oracle-only bits to remember here: <K>START WITH</K>, <K>LEVEL</K>,{" "}
        <K>PRIOR</K>, <K>ORDER SIBLINGS BY</K>, and <K>CONNECT_BY_ROOT</K>/<K>CONNECT_BY_ISCYCLE</K>{" "}
        pseudo-columns for root tracking and cycle detection.
      </P>

      <H2>Date and number format models</H2>
      <P>
        Format models are the mask vocabulary you hand to <K>TO_CHAR</K>/<K>TO_DATE</K> and the{" "}
        <K>NLS</K> session settings. The most used:
      </P>
      <DataTable
        headers={["Element", "Meaning", "Example output"]
        }
        rows={[
          ["DD-MON-YYYY", "Day – month abbrev – year", "15-AUG-2026"],
          ["DD/MM/YYYY", "Day/month/year (locale-neutral)", "15/08/2026"],
          ["HH24:MI:SS", "24-hour time with seconds", "14:30:00"],
          ["YYYY-MM-DD", "ISO date", "2026-08-15"],
          ["FM", "Trim padding (FMMonth)", "FM 'Month' → 'August'"],
          ["YYYY-MM-DD\"T\"HH24:MI", "Literal characters in quotes", "2026-08-15T14:30"],
        ]}
      />
      <DataTable
        headers={["Element", "Meaning", "Example output"]
        }
        rows={[
          ["9 / 0", "Digit placeholders (0 pads, 9 leaves blank)", "999.99"],
          ["$", "Currency symbol", "$1,234.50"],
          [",", "Thousands separator", "1,234"],
          ["S", "Sign placement, front or trailing (MI)", "S9999 / 9999MI"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Format models at work"
        code={`SELECT TO_CHAR(SYSDATE, 'DD-MON-YYYY HH24:MI')   FROM dual;
SELECT TO_CHAR(1234.5, '$999,999.99', 'NLS_CURRENCY=USD') FROM dual;`}
      />
      <Callout type="warning">
        A format mask literal that is <strong>not</strong> a recognisable element must be quoted:{" "}
        <K>TO_CHAR(SYSDATE, 'YYYY"Q"Q')</K>. And vague display formats fail silently in surprising
        ways once the raw value drifts — always pair <K>TO_DATE</K> with the matching mask.
      </Callout>

      <H2>USER and SYS_CONTEXT</H2>
      <CodeBlock
        language="sql"
        filename="Who am I, and what session context is set?"
        code={`SELECT USER FROM dual;                       -- schema name (e.g. HR)
SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') FROM dual;   -- logged-in user
SELECT SYS_CONTEXT('USERENV', 'DB_NAME')        FROM dual;   -- database instance`}
      />
      <P>
        <K>SYS_CONTEXT</K> reads values any application namespace can set — this is the hook{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/security">Virtual Private Database</a>{" "}
        uses to restrict rows per session (e.g. salesperson sees only their own accounts).
      </P>

      <H2>Data dictionary views</H2>
      <P>
        The foundational three families plus the most-called siblings all appear on the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/database-foundations">foundations page</a>.
        A practical quick-reference for the work-week:
      </P>
      <DataTable
        headers={["View", "Answers"]
        }
        rows={[
          ["USER_TABLES / ALL_TABLES", "Which tables exist, rows, blocks, logging"],
          ["USER_TAB_COLUMNS", "Columns, types, nullability, defaults"],
          ["USER_CONSTRAINTS / USER_CONS_COLUMNS", "Keys and rules and which columns they cover"],
          ["USER_INDEXES / USER_IND_COLUMNS", "Indexes and what they index"],
          ["ALL_OBJECTS", "Everything you can see, across schemas, with object type"],
          ["DBA_USERS", "Database accounts (privileged)"],
          ["USER_SEQUENCES", "Sequences and their CACHE/MAXVALUE settings"],
        ]}
      />
      <Callout type="tip">
        When troubleshooting, always ask the dictionary first — the answer to "why is this insert
        slow / why this error" is usually one dictionary lookup away from a concrete fact instead of
        folklore.
      </Callout>
    </>
  );
}
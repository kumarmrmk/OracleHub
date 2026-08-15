import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "Oracle Data Types",
};

export default function SqlDataTypesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Foundations"
        title="Oracle data types"
        description="VARCHAR2, CHAR, NUMBER, DATE and TIMESTAMP with time zones, CLOB, BLOB, RAW, ROWID — and the NULL / three-valued logic trap that bites every beginner."
        breadcrumbs={[{ label: "SQL" }, { label: "Data Types" }]}
        updated="2026"
      />

      <P>
        Every column declares a <strong>data type</strong>, and Oracle is strict about it: you
        cannot store <K>'abc'</K> in a <K>NUMBER</K> column, and you cannot compare a string column
        to a number without an implicit conversion. Learning the core types — and which one to
        reach for — removes the most common beginner errors.
      </P>

      <H2>Character types: VARCHAR2 and CHAR</H2>
      <DataTable
        headers={["Type", "Meaning", "When to use"]}
        rows={[
          ["VARCHAR2(n)", "Variable-length string, up to n characters; uses only as much storage as the value needs (byte semantics by default in most setups)", "Almost everything: names, descriptions, emails, codes"],
          ["CHAR(n)", "Fixed-length string, always padded with blanks to exactly n characters", "Rarely — only for short, always-full values like fixed format codes and flags"],
        ]}
      />
      <Callout type="warning">
        <K>VARCHAR2</K> stores the value and ignores trailing spaces, but <K>CHAR</K> pads them. A
        <K>CHAR(5)</K> column holding <K>'AB'</K> actually holds <K>'AB   '</K>, which has caused
        more than one mysterious <K>WHERE</K> comparison failure. Prefer <K>VARCHAR2</K> unless you
        have a concrete reason not to.
      </Callout>

      <H2>Numeric type: NUMBER</H2>
      <P>
        Oracle's workhorse numeric type is <K>NUMBER(precision, scale)</K> — a floating-range
        decimal that stores integers and fractions alike:
      </P>
      <DataTable
        headers={["Declaration", "Holds", "Example value", "Note"]}
        rows={[
          ["NUMBER", "Any number up to 38 digits", "12345.6789", "No bounds — full precision"],
          ["NUMBER(8)", "Integers up to 8 digits", "12345678", "Scale 0: integer"],
          ["NUMBER(10,2)", "10 significant digits, 2 decimal places", "12345678.12", "Classic money column"],
          ["NUMBER(3,-2)", "Rounded to hundreds", "12300", "Negative scale rounds to the left of the point"],
        ]}
      />
      <UL>
        <li>
          Do not reach for <K>INTEGER</K>, <K>FLOAT</K>, or <K>NUMBER(38)</K> out of habit under
          Oracle — <K>NUMBER</K> covered with an explicit precision is almost always the right
          choice, and <K>BINARY_DOUBLE</K>/<K>BINARY_FLOAT</K> exist only for float math and are
          rarely the right call for application data.
        </li>
        <li>
          For money, <K>NUMBER(10,2)</K>-style scales are conventional; the database rounds on
          insert if you exceed the scale.
        </li>
      </UL>

      <H2>Date and time: DATE vs TIMESTAMP</H2>
      <P>
        The second-most common data-type mistake in Oracle is treating "dates" as strings. A{" "}
        <K>DATE</K> always stores both date <em>and</em> time (accurate to the second); a{" "}
        <K>TIMESTAMP</K> adds fractional seconds; add <K>WITH TIME ZONE</K> or{" "}
        <K>WITH LOCAL TIME ZONE</K> for time-zone awareness.
      </P>
      <DataTable
        headers={["Type", "Holds", "Example"]
        }
        rows={[
          ["DATE", "Day + time to the second", "2026-08-15 14:30:00"],
          ["TIMESTAMP(6)", "Day + time to microseconds", "2026-08-15 14:30:00.123456"],
          ["TIMESTAMP WITH TIME ZONE", "Timestamp + offset or named zone", "2026-08-15 14:30:00 +02:00"],
          ["TIMESTAMP WITH LOCAL TIME ZONE", "Stored normalized to database zone, displayed in session zone", "2026-08-15 12:30:00 (shown in your session zone)"],
          ["INTERVAL", "A span of time, not a point", "INTERVAL '2' MONTH"],
        ]}
      />
      <UL>
        <li>
          On insert you can rely on the default format <K>DD-MON-YYYY</K> in many sessions, but you
          should <strong>never</strong> write <K>TO_DATE('15-08-2026','DD-MM-YYYY')</K> implicitly —
          always give both the literal and the format mask (the{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/sql/single-row-functions">conversion functions</a>{" "}
          page shows <K>TO_DATE</K> / <K>TO_TIMESTAMP</K> properly).
        </li>
        <li>
          <K>SYSDATE</K> is the current date+time of the database session; <K>SYSTIMESTAMP</K> is
          the same with time-zone and fractional seconds.
        </li>
        <li>
          Time-zone data is where record-keeping systems come unstuck: store{" "}
          <K>TIMESTAMP WITH TIME ZONE</K> when the moment in absolute time matters (a flight
          departure), <K>LOCAL</K> when only the local wall-clock time matters (a business day).
        </li>
      </UL>

      <H2>Large objects: CLOB and BLOB</H2>
      <P>
        When a value does not fit in <K>VARCHAR2</K> (whose practical size limits are 4,000 bytes,
        or 32,767 in the extended datatypes mode), Oracle offers <strong>LOB</strong> types:
      </P>
      <DataTable
        headers={["Type", "Contents", "Typical use", "Caveat"]}
        rows={[
          ["CLOB", "Character large object (text)", "Long free-text notes, documents, JSON/XML strings over 4 KB", "Cannot be indexed with a regular B-tree; use full-text or JSON/XML indexes"],
          ["BLOB", "Binary large object", "Files, images, PDFs, encryption payloads", "Never in WHERE or ORDER BY without conversion"],
          ["NCLOB", "National character large object", "Unicode text over 4 KB", "Same caveats as CLOB"],
        ]}
      />
      <Callout type="tip">
        A common pattern: store the document <strong>metadata</strong> in real columns (file name,
        size, uploaded date) and the bytes only in the <K>BLOB</K>. That keeps queries fast and the{" "}
        <K>BLOB</K> untouched until actually needed.
      </Callout>

      <H2>RAW and ROWID</H2>
      <P>
        Two types you will meet mostly in diagnostics and hash storage:
      </P>
      <UL>
        <li>
          <strong>RAW(n)</strong> — fixed-length binary data, typically up to 2,000 bytes. Used for
          stored hashes and identifiers where hex/binary values must survive unaltered (no character
         -set conversion).
        </li>
        <li>
          <strong>ROWID</strong> — the physical address of a row inside a table, e.g.{" "}
          <K>AAAE2XAAFAAAAClAAA</K>. ROWIDs are pseudo-columns, not something you store for long; they
          point at a specific physical location and change when the row moves (see{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/sql/oracle-specific">Oracle-specific SQL</a>).
        </li>
      </UL>

      <H2>NULL and three-valued logic</H2>
      <P>
        <K>NULL</K> means <em>unknown / missing</em> — it is not the empty string and not zero. This
        creates <strong>three-valued logic</strong>: every comparison is <K>TRUE</K>, <K>FALSE</K>,
        or <K>UNKNOWN</K>.
      </P>
      <DataTable
        headers={["Expression", "Result when credit_limit IS NULL"]}
        rows={[
          ["credit_limit = 1000", "UNKNOWN (not found by =)"],
          ["credit_limit < 0", "UNKNOWN"],
          ["credit_limit <> 1000", "UNKNOWN"],
          ["credit_limit IS NULL", "TRUE"],
          ["credit_limit IS NOT NULL", "FALSE"],
          ["NULL = NULL", "UNKNOWN — always!"],
        ]}
      />
      <UL>
        <li>
          You <strong>cannot</strong> find NULLs with <K>= NULL</K>; you must use{" "}
          <K>IS NULL</K>/<K>IS NOT NULL</K>. This is the single most common NULL mistake.
        </li>
        <li>
          <K>WHERE</K> keeps a row only when the filter evaluates to <K>TRUE</K> — rows where the
          condition is <K>UNKNOWN</K> are excluded, so a <K>NOT IN</K> against a subquery that
          returns a NULL matches <em>nothing</em> (explored on the{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/sql/filtering">filtering page</a>).
        </li>
        <li>
          Aggregates skip NULLs: <K>COUNT(*)</K> counts all rows, <K>COUNT(col)</K> counts only
          non-null values of that column.
        </li>
        <li>
          The <K>NVL</K> / <K>COALESCE</K> family replaces NULL with a fallback — covered in{" "}
          <a className="font-semibold text-sky-300 hover:underline" href="/sql/single-row-functions">single-row functions</a>.
        </li>
      </UL>
      <Callout type="example">
        The practical nightmare this causes: a junction "where <K>credit_limit &lt;= 1000</K>" misses
        every customer whose limit was never set. The fix is either{" "}
        <K>WHERE credit_limit &lt;= 1000 OR credit_limit IS NULL</K>, or — better — a{" "}
        <K>NOT NULL</K> constraint and a default, so "no value" becomes an explicit number.
      </Callout>
    </>
  );
}
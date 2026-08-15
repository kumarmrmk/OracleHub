import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Single-Row Functions",
};

export default function SqlSingleRowFunctionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Querying"
        title="Single-row functions"
        description="Functions that return one result per input row: character (UPPER, SUBSTR, INSTR, TRIM, REPLACE…), number (ROUND, TRUNC, CEIL, FLOOR, MOD…), date (SYSDATE, ADD_MONTHS, LAST_DAY…), conversion (TO_CHAR, TO_DATE, TO_NUMBER, CAST), null-handling (NVL, NVL2, NULLIF, COALESCE), and CASE / DECODE."
        breadcrumbs={[{ label: "SQL" }, { label: "Single-Row Functions" }]}
        updated="2026"
      />

      <P>
        A <strong>single-row function</strong> transforms one input row into one output value —
        clearly different from an <strong>aggregate</strong> (many rows → one value, next page).
        These functions run per row, and they are where most formatting logic in real queries lives.
      </P>

      <H2>Character functions</H2>
      <DataTable
        headers={["Function", "Returns", "Example"]
        }
        rows={[
          ["UPPER(s), LOWER(s)", "The string uppercased / lowercased", "UPPER('tech') → 'TECH'"],
          ["INITCAP(s)", "Each word's first letter uppercase", "INITCAP('hello world') → 'Hello World'"],
          ["SUBSTR(s, pos, len)", "Part of the string (1-based position)", "SUBSTR('Oracle', 2, 3) → 'rac'"],
          ["INSTR(s, find)", "Position of the substring (0 if absent)", "INSTR('Oracle', 'a') → 3"],
          ["LENGTH(s)", "Number of characters", "LENGTH('Oracle') → 6"],
          ["TRIM(s) / TRIM(lead|trail|both)", "String with leading/trailing spaces cut", "TRIM('  x  ') → 'x'"],
          ["REPLACE(s, old, new)", "Every occurrence replaced", "REPLACE('1-800','-',' ') → '1 800'"],
          ["LPAD / RPAD(s, n, byte)", "Pad the string to length n", "LPAD('7', 3, '0') → '007'"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Case-insensitive search with character functions"
        code={`SELECT customer_name
FROM   customers
WHERE  LOWER(customer_name) LIKE '%tech%';   -- matches TeChCorp too`}
      />
      <Callout type="info">
        Oracle strings are <strong>1-based</strong>, unlike most programming languages.{" "}
        <K>SUBSTR('ab', 0, 1)</K> and <K>SUBSTR('ab', 1, 1)</K> both return <K>'a'</K>.
      </Callout>

      <H2>Number functions</H2>
      <DataTable
        headers={["Function", "What it does", "Example"]
        }
        rows={[
          ["ROUND(n, d)", "Round to d decimal places (banker-aware)", "ROUND(12.345, 2) → 12.35"],
          ["TRUNC(n, d)", "Chop (not round) at d decimals", "TRUNC(12.345, 1) → 12.3"],
          ["CEIL(n)", "Smallest integer ≥ n", "CEIL(12.01) → 13"],
          ["FLOOR(n)", "Largest integer ≤ n", "FLOOR(12.99) → 12"],
          ["MOD(a, b)", "Remainder of a ÷ b", "MOD(17, 5) → 2"],
          ["ABS(n)", "Absolute value", "ABS(-5) → 5"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Rounding for display vs TRUNC for logic"
        code={`SELECT order_id,
       total_amount,
       ROUND(total_amount * 0.1, 2) AS tax,
       MOD(order_id, 2)             AS is_odd
FROM   orders;`}
      />

      <H2>Date functions</H2>
      <DataTable
        headers={["Function", "Returns", "Example"]
        }
        rows={[
          ["SYSDATE", "Current date and time of the database", "2026-08-15 14:30:00"],
          ["SYSTIMESTAMP", "Current timestamp with time zone / fractions", "2026-08-15 14:30:00.123 +00:00"],
          ["ADD_MONTHS(d, n)", "The date n months later", "ADD_MONTHS(SYSDATE, 12)"],
          ["MONTHS_BETWEEN(d1, d2)", "Fractional months between the two", "MONTHS_BETWEEN(d1, d2) → 11.6"],
          ["NEXT_DAY(d, 'day')", "The next occurrence of the named weekday", "NEXT_DAY(SYSDATE, 'FRIDAY')"],
          ["LAST_DAY(d)", "The last day of d's month", "LAST_DAY(DATE '2026-02-05') → 28-FEB-26"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Aged-receivables style filter"
        code={`SELECT order_id, order_date
FROM   orders
WHERE  order_date >= ADD_MONTHS(SYSDATE, -3)     -- last 3 months
  AND  order_date < TRUNC(SYSDATE);              -- strictly in the past`}
      />

      <H2>Conversion functions</H2>
      <P>
        Conversions turn data between types. The format masks are words Oracle recognizes — the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/oracle-specific">format models</a>{" "}
        page lists them:
      </P>
      <CodeBlock
        language="sql"
        filename="TO_CHAR, TO_DATE, TO_NUMBER, CAST"
        code={`-- Date to formatted text
SELECT TO_CHAR(SYSDATE, 'DD-MON-YYYY HH24:MI') FROM dual;

-- Text to date (always supply the mask!)
SELECT TO_DATE('15/08/2026', 'DD/MM/YYYY') FROM dual;

-- Text to number
SELECT TO_NUMBER('1,234.56', '9,999.99') FROM dual;

-- Standard ANSI-style cast between compatible types
SELECT CAST(total_amount AS NUMBER(10,2)) FROM orders;`}
      />
      <Callout type="danger">
        Oracle performs <strong>implicit conversions</strong> when you mix types — a hidden{" "}
        <K>VARCHAR2 → number</K> conversion on every comparison against a numeric column kills index
        use (see the performance page). Write the explicit <K>TO_DATE</K> / <K>TO_NUMBER</K>{" "}
        yourself, and store dates as <K>DATE</K>, not <K>VARCHAR2</K>.
      </Callout>

      <H2>Dealing with NULL: NVL, NVL2, NULLIF, COALESCE</H2>
      <P>
        These functions replace or test for missing values — the practical keys to three-valued
        logic:
      </P>
      <DataTable
        headers={["Function", "Behavior", "Example"]
        }
        rows={[
          ["NVL(a, b)", "a, or b if a is NULL", "NVL(credit_limit, 0)"],
          ["NVL2(a, b, c)", "b if a is not NULL, else c", "NVL2(credit_limit, 'set', 'missing')"],
          ["NULLIF(a, b)", "NULL when a = b, else a", "NULLIF('', ' ')"],
          ["COALESCE(a, b, c, …)", "First non-NULL argument", "COALESCE(fax, phone, email, 'none')"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="COALESCE walks the list until it finds a value"
        code={`SELECT customer_name,
       COALESCE(credit_limit, 0) AS effective_limit
FROM   customers;`}
      />
      <UL>
        <li>
          <K>COALESCE</K> and <K>NVL</K> look similar, but <K>COALESCE</K> takes many arguments and
          short-circuits; <K>NVL</K> is the older, Oracle-specific two-argument form.
        </li>
        <li>
          <K>NVL(credit_limit, 0)</K> prevents NULL from silently zeroing sums in aggregates; but on
          large tables it also blocks index use — the same note as implicit conversion.
        </li>
      </UL>

      <H2>CASE and DECODE</H2>
      <P>
        <strong>CASE</strong> is the ANSI-standard conditional expression;{" "}
        <strong>DECODE</strong> is Oracle's older, terser equivalent. Both return a value, not run
        statements:
      </P>
      <CodeBlock
        language="sql"
        filename="The same logic with CASE and DECODE"
        code={`SELECT order_id,
       CASE WHEN total_amount >= 10000 THEN 'large'
            WHEN total_amount >= 1000  THEN 'medium'
            ELSE 'small' END AS size
FROM   orders;

-- DECODE fights this because it compares for equality only
SELECT order_id,
       DECODE(SIGN(total_amount - 10000), 1, 'large', -1,
              DECODE(SIGN(total_amount - 1000), 1, 'medium', -1, 'small', 'small'),
              'large') AS size
FROM   orders;`}
      />
      <Callout type="tip">
        Prefer <K>CASE</K>: it is standard, handles ranges and <K>IS NULL</K> cleanly, and reads
        better. Legacy Oracle code is full of <K>DECODE</K> — you must be able to read it, you do
        not need to write it. The one place <K>DECODE</K> shines is a quick equality lookup in a
        tiny expression.
      </Callout>
    </>
  );
}
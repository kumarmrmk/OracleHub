import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "JSON, XML & Modern Oracle SQL",
};

export default function SqlJsonXmlPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Modern database"
        title="JSON, XML & modern Oracle SQL"
        description="JSON columns and IS JSON, JSON_VALUE, JSON_QUERY, JSON_TABLE, XML data and XMLTYPE, and SQL macros — the modern Oracle database beyond the relational model."
        breadcrumbs={[{ label: "SQL" }, { label: "JSON & XML" }]}
        updated="2026"
      />

      <P>
        Oracle stopped being "just rows and columns" a long time ago. You can store a JSON document
        in a column, query inside it with dot-syntax and functions, load XML from old integrations
        into <K>XMLTYPE</K>, and even write <strong>SQL macros</strong> that act like template
        queries. Knowing how far you can push this decides whether "unstructured" data stays out of
        your database or in it, usefully.
      </P>

      <H2>JSON columns and IS JSON</H2>
      <P>
        A <K>JSON</K> column (23c) or a <K>CLOB</K> with a <K>CHECK (col IS JSON)</K> constraint
        stores one JSON document per row, validated on write:
      </P>
      <CodeBlock
        language="sql"
        filename="A validated JSON column"
        code={`-- 21c style: CLOB with a JSON check
CREATE TABLE orders (
  order_id   NUMBER PRIMARY KEY,
  attributes CLOB
    CONSTRAINT ck_orders_json CHECK (attributes IS JSON)
);

-- 23c native:
-- order_id NUMBER PRIMARY KEY, attributes JSON`}
      />
      <UL>
        <li><K>IS JSON</K> validates syntax at insert; queries can also test <K>WHERE attributes IS JSON</K>.</li>
        <li>There is (fast) JSON full-text style query support via <K>JSON</K> indexes and the <K>JSON_EXISTS</K>/<K>JSON_VALUE</K> family below.</li>
      </UL>

      <H2>JSON_VALUE, JSON_QUERY, JSON_EXISTS</H2>
      <P>
        Pull a scalar out of a document with <K>JSON_VALUE</K>, get an object or array back with{" "}
        <K>JSON_QUERY</K>, and test for existence with <K>JSON_EXISTS</K> — all using{" "}
        <strong>dot notation</strong> paths:
      </P>
      <CodeBlock
        language="sql"
        filename="The three ways to reach into a document"
        code={`SELECT o.order_id,
       JSON_VALUE (o.attributes, '$.shipment.courier') AS courier,
       JSON_QUERY (o.attributes, '$.packages')          AS packages,
       CASE WHEN JSON_EXISTS(o.attributes, '$.fraud_flag')
            THEN 'flagged' ELSE 'ok' END                AS fraud
FROM   orders o;`}
      />
      <DataTable
        headers={["Function", "Returns", "NULL when…"]
        }
        rows={[
          ["JSON_VALUE", "A scalar value (text/number/date)", "Path missing or a JSON object/array at the end"],
          ["JSON_QUERY", "A JSON object or array (as JSON)", "Path missing or a scalar at the end"],
          ["JSON_EXISTS", "TRUE/FALSE whether the path matches", "N/A"],
        ]}
      />
      <Callout type="warning">
        The classic pairing mistake: <K>JSON_VALUE</K> at the end of an object path gives NULL (it
        wants a scalar); <K>JSON_QUERY</K> at the end of a scalar path gives NULL (it wants a
        container). If a lookup "silently" returns nothing, check which one you used.
      </Callout>

      <H2>JSON_TABLE — JSON as rows</H2>
      <P>
        <K>JSON_TABLE</K> shreds a JSON array into relational rows — the bridge that lets you
        <K>JOIN</K> a document against ordinary tables:
      </P>
      <CodeBlock
        language="sql"
        filename="Turn the packages array into rows"
        code={`SELECT o.order_id, p.tracking_no, p.weight_kg
FROM   orders o,
       JSON_TABLE(o.attributes, '$.packages[*]'
         COLUMNS (
           tracking_no VARCHAR2(20) PATH '$.tracking',
           weight_kg   NUMBER       PATH '$.weight'
         )
       ) p;`}
      />
      <P>
        It behaves like a lateral inline view: for each order row, produce one output row per array
        element. This is how you write genuinely relational queries over JSON payloads.
      </P>

      <H2>XML data and XMLTYPE</H2>
      <P>
        The XML counterpart — used where SOAP feeds, B2B messages, and old interfaces still speak
        XML: store documents as <K>XMLTYPE</K>, query them with <K>EXTRACT</K>/<K>EXTRACTVALUE</K>{" "}
        (older) or <K>XMLTABLE</K> (modern):
      </P>
      <CodeBlock
        language="sql"
        filename="XMLTABLE rips XML rows into columns"
        code={`SELECT x.order_no, x.amount
FROM   orders_xml o,
       XMLTABLE('/order'
         PASSING o.doc
         COLUMNS order_no NUMBER PATH 'number',
                 amount  NUMBER PATH 'total'
       ) x;`}
      />
      <UL>
        <li>Prefer <K>XMLTABLE</K> over the legacy <K>EXTRACT</K>/<K>EXTRACTVALUE</K> — the latter have been deprecated-ish for years.</li>
        <li>Modern Oracle is JSON-first for new schemas; XML skills remain vital for the SOAP-era systems still running in enterprises.</li>
      </UL>

      <H2>SQL macros (23c)</H2>
      <P>
        A <strong>SQL macro</strong> is a PL/SQL function the optimizer expands into your query at
        parse time — write a reusable fragment once, and get inlined logic (with proper optimizer
        visibility) in every caller. The pattern you'll see: a "scalar" macro returning an
        expression:
      </P>
      <CodeBlock
        language="sql"
        filename="A SQL macro generating a reusable expression."
        code={`CREATE FUNCTION tax_amount (amt NUMBER)
RETURN VARCHAR2 SQL_MACRO(SCALAR)
IS
BEGIN
  RETURN 'amt * 0.10';      -- optimizer folds this into the query
END;

SELECT order_id, tax_amount(total_amount) AS tax FROM orders;`}
      />
      <Callout type="info">
        Macros differ from ordinary functions in one crucial way: the optimizer sees the{" "}
        <em>body</em>, so it can prune, reorder, and index accordingly. An ordinary PL/SQL function in
        a query is a black box that silently blocks some optimizations. Reaching for a macro is the
        modern fix (and the PL/SQL page has the function basics).
      </Callout>
    </>
  );
}
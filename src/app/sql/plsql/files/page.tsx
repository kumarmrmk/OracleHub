import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — Files & External Integration",
};

export default function SqlPlsqlFilesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="Files & external integration"
        description="Reading and writing server-side files with UTL_FILE, DIRECTORY objects and their privileges, calling REST services, and processing JSON and XML from PL/SQL."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "Files & External Integration" }]}
        updated="2026"
      />

      <P>
        PL/SQL is not confined to the database: it can read and write files the database server can
        see, call REST endpoints, and process JSON and XML. For <strong>Fusion/OIC-style work</strong>{" "}
        the JSON-processing half is where most of the day-to-day value sits — integration payloads
        arrive as JSON and leave as JSON, and PL/SQL is often the engine validating and transforming
        them.
      </P>

      <H2>UTL_FILE and DIRECTORY objects</H2>
      <P>
        <K>UTL_FILE</K> reads/writes files <em>on the database server's filesystem</em> — not a
        client's hard drive. The file path comes from a <K>DIRECTORY</K> object, a schema object
        mapping a logical name to an OS path, which the DBA creates and grants:
      </P>
      <CodeBlock
        language="sql"
        filename="Directory setup + a write via UTL_FILE"
        code={`-- DBA creates the directory and the logical name
CREATE DIRECTORY OUT_DIR AS '/u01/app/outbound';
GRANT  READ, WRITE ON DIRECTORY OUT_DIR TO app_user;

-- then PL/SQL writes with it
DECLARE
  v_fh UTL_FILE.FILE_TYPE;
BEGIN
  v_fh := UTL_FILE.FOPEN('OUT_DIR', 'orders.csv', 'W');
  UTL_FILE.PUT_LINE(v_fh, 'order_id,amount');
  UTL_FILE.PUT_LINE(v_fh, '101,500');
  UTL_FILE.FCLOSE(v_fh);
END;
/`}
      />
      <UL>
        <li>Why a <K>DIRECTORY</K> and not a path string? Because raw server paths are a security hole — the grant is the guard.</li>
        <li>Key routines: <K>FOPEN</K>, <K>PUT_LINE</K>, <K>GET_LINE</K>, <K>FCLOSE</K>; also <K>FREMOVE</K> and <K>FGETATTR</K> for cleanup/inspection.</li>
        <li>File errors surface as <K>UTL_FILE</K>-specific exceptions (<K>INVALID_PATH</K>, <K>WRITE_ERROR</K>, <K>ACCESS_DENIED</K>) — read the message from <K>SQLERRM</K>.</li>
        <li>Front-run the DBA (directory + privileges) when a procedure says it will write files — that is the "storage is somewhere else" reality of file-based loads.</li>
      </UL>

      <H2>Calling REST services</H2>
      <P>
        Oracle offers several HTTP-capable packages; which one you may call depends on the version
        and edition. The <strong>APEX_WEB_SERVICE</strong> family is the friendliest for JSON:
      </P>
      <CodeBlock
        language="sql"
        filename="GET a REST endpoint (APEX_WEB_SERVICE)"
        code={`DECLARE
  v_body CLOB;
BEGIN
  v_body := APEX_WEB_SERVICE.make_rest_request_b(
    p_url         => 'https://api.example.com/customers/101',
    p_http_method => 'GET'
  );
  DBMS_OUTPUT.PUT_LINE(DBMS_LOB.SUBSTR(v_body, 4000, 1));
END;
/`}
      />
      <DataTable
        headers={["Package / facility", "When to use"]
        }
        rows={[
          ["APEX_WEB_SERVICE", "Simple REST GET/POST with JSON/CLOB, easy headers; commonly available with an APEX install"],
          ["UTL_HTTP", "Lower-level HTTP with full request control — everywhere Oracle runs, but more code"],
          ["DBMS_CLOUD (Autonomous Database / 23ai)", "Native REST, object storage, and external tables in the cloud database"],
          ["OCI queues/events", "Async messaging when REST is not the right shape"],
        ]}
      />
      <Callout type="warning">
        REST from the database is a <strong>network+latency</strong> decision, not just a code one:
        a loop calling a web service per row is the single most expensive program shape possible.
        Design the remote call to accept a batch (the bulk page's philosophy applied to HTTP), and
        remember this needs outbound ACLs/network access the DBA approves.
      </Callout>

      <H2>JSON processing from PL/SQL</H2>
      <P>
        The essential modern skills — matching what integration work asks for:
      </P>
      <UL>
        <li><strong>Generate JSON</strong> — <K>JSON_OBJECT</K> / <K>JSON_ARRAY</K>, and <K>JSON_OBJECTAGG</K> over rows.</li>
        <li><strong>Parse JSON</strong> — <K>JSON_VALUE</K>, <K>JSON_QUERY</K>, and <K>JSON_TABLE</K> (the SQL page has the full set).</li>
        <li><strong>Validate</strong> — <K>JSON_EXISTS</K> and <K>IS JSON</K> check it is well-formed before you trust it.</li>
      </UL>
      <CodeBlock
        language="sql"
        filename="Build a JSON payload for an API call"
        code={`DECLARE
  v_json CLOB;
BEGIN
  SELECT JSON_OBJECT(
    'request' VALUE JSON_OBJECT(
      'customerId' VALUE c.customer_id,
      'name'       VALUE c.customer_name,
      'orders'     VALUE (
        SELECT JSON_ARRAYAGG(JSON_OBJECT(
                 'orderId'  VALUE order_id,
                 'amount'   VALUE total_amount
               ))
        FROM   orders o WHERE o.customer_id = c.customer_id
      )
    ) RETURNING CLOB
  ) INTO v_json
  FROM   customers c WHERE customer_id = 101;

  DBMS_OUTPUT.PUT_LINE(DBMS_LOB.SUBSTR(v_json, 4000, 1));
END;
/`}
      />
      <P>
        And the other direction — JSON arrives, you shred it into rows and push it to a table
        (typically inside a <K>FORALL</K> per the bulk page):
      </P>
      <CodeBlock
        language="sql"
        filename="Shred an inbound JSON array into rows"
        code={`DECLARE
  v_payload CLOB := '{"lines":[{"sku":"A1","qty":2},{"sku":"B2","qty":5}]}';
BEGIN
  INSERT INTO order_lines (order_id, sku, qty)
  SELECT 1001, jt.sku, jt.qty
  FROM   JSON_TABLE(v_payload, '$.lines[*]'
           COLUMNS (sku VARCHAR2(10) PATH '$.sku',
                    qty NUMBER       PATH '$.qty')) jt;
END;
/`}
      />

      <H2>XML processing</H2>
      <P>
        The legacy counterpart — SOAP-era integrations still speak it. <K>XMLTYPE</K> columns,
        <K>XMLTABLE</K> to shred, <K>DBMS_XMLDOM</K>/XPath for manipulation:
      </P>
      <CodeBlock
        language="sql"
        filename="Read a value out of an XMLTYPE"
        code={`DECLARE
  v_xml XMLTYPE;
  v_id  NUMBER;
BEGIN
  v_xml := XMLTYPE('<order><number>101</number></order>');
  SELECT TO_NUMBER(x.number)
    INTO v_id
    FROM   XMLTABLE('/order' PASSING v_xml
              COLUMNS number VARCHAR2(20) PATH 'number') x;
  DBMS_OUTPUT.PUT_LINE(v_id);
END;
/`}
      />
      <Callout type="info">
        The modern guidance leans on JSON for new contracts and XML only for the SOAP/B2B that will
        not go away. Whichever side you sit on, the pattern is identical: <em>type → shred →
        store</em> and <em>query → assemble → emit</em>, with the shapes nailed down by{" "}
        <K>JSON_TABLE</K>/<K>XMLTABLE</K> and the SQL macros page for reuse.
      </Callout>
    </>
  );
}
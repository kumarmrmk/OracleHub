import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — Performance & Best Practices",
};

export default function SqlPlsqlPerformancePage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="Performance & best practices"
        description="Avoid SQL inside loops, prefer bulk operations, proper exception handling and logging, avoiding unnecessary commits, using bind variables, and instrumentation — the habits that make PL/SQL production-ready."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "Performance & Best Practices" }]}
        updated="2026"
      />

      <P>
        The <strong>first</strong> things you will be taught (and interviewed on) about PL/SQL
        performance are these: don't put SQL in a loop, do it in bulk, log like you mean it, commit
        deliberately, and bind everything. This page is that checklist — each rule shown twice: the
        anti-pattern and the fix.
      </P>

      <H2>1. Don't run SQL inside a loop</H2>
      <CodeBlock
        language="sql"
        filename="The anti-pattern vs the fix"
        code={`-- ANTI-PATTERN: one SELECT per iteration
FOR rec IN (SELECT customer_id FROM customers) LOOP
  SELECT COUNT(*) INTO v_cnt FROM orders
  WHERE customer_id = rec.customer_id;      -- N queries!
END LOOP;

-- FIX: one query that answers for everyone
SELECT c.customer_id, COUNT(o.order_id)
INTO ... -- bulk or join — solve it set-based once`}
      />
      <Callout type="info">
        Rule of thumb: <strong>if a query mentions the outer loop's row, it is a correlated
        subquery that the whole loop could have answered in one pass.</strong> Rewrite as a join
        (reads) or a <K>FORALL</K> (writes). The bulk page showed why row-by-row is the #1 sin.
      </Callout>

      <H2>2. Use bulk operations for high-volume data</H2>
      <P>
        This is the bulk page in one line: fetch with <K>BULK COLLECT</K>, change with{" "}
        <K>FORALL</K>, chunk with <K>LIMIT</K>, and let <K>SAVE EXCEPTIONS</K> keep a failed batch
        diagnosable. At 100k+ rows there is no excuse for per-row context switches.
      </P>

      <H2>3. Exceptional handling and logging</H2>
      <P>
        Production PL/SQL logs to a <strong>table</strong>, not the screen. A common pattern
        (simplified) uses a shared logging helper called from an outer <K>WHEN OTHERS</K>:
      </P>
      <CodeBlock
        language="sql"
        filename="A package-based logger whose own COMMIT never hurts the caller"
        code={`CREATE OR REPLACE PACKAGE pkg_audit AS
  PROCEDURE log_run (p_proc VARCHAR2, p_msg VARCHAR2, p_code NUMBER);
END pkg_audit;
/

CREATE OR REPLACE PACKAGE BODY pkg_audit AS
  PROCEDURE log_run (p_proc VARCHAR2, p_msg VARCHAR2, p_code NUMBER) IS
    PRAGMA AUTONOMOUS_TRANSACTION;   -- logger's COMMIT is independent
  BEGIN
    INSERT INTO app_run_log (proc_name, msg, err_code, at_ts)
    VALUES (p_proc, p_msg, p_code, SYSTIMESTAMP);
    COMMIT;                          -- commits only the log row
  END log_run;
END pkg_audit;
/

-- business code calls it once at the boundary, then re-raises
EXCEPTION
  WHEN OTHERS THEN
    pkg_audit.log_run('PROCESS_ORDERS', SQLERRM, SQLCODE);
    RAISE;
END;
/`}
      />
      <UL>
        <li>An <strong>AUTONOMOUS_TRANSACTION</strong> log writes and commits independently of the failing business transaction — so the audit survives the rollback.</li>
        <li>Log the <em>who/what/when</em>: proc name, message, error code, timestamp, and any business key you were processing.</li>
        <li>Don't blanket-swallow: log for observability, but let <K>RAISE</K> preserve the error journey to the caller.</li>
      </UL>

      <H2>4. Avoid unnecessary commits</H2>
      <P>
        Each <K>COMMIT</K> forces a disk write and releases locks. The habits:
      </P>
      <UL>
        <li><strong>Commit at the boundary</strong> — the outermost caller owns the COMMIT; a helper buried mid-transaction that commits can strand the caller's still-open work.</li>
        <li><strong>Chunk commits for long batches</strong> (the bulk-page LIMIT+COMMIT pattern) to bound undo and row locks.</li>
        <li>Never commit in a loop, in a trigger, or "just in case".</li>
      </UL>

      <H2>5. Bind variables</H2>
      <P>
        In PL/SQL, <K>variable := value</K> statements already bind implicitly — the discipline
        bites in <K>EXECUTE IMMEDIATE</K> and when text gets concatenated. Rule: <strong>values via
        <K>USING</K>, never by string assembly</strong>:
      </P>
      <CodeBlock
        language="sql"
        filename="Bind, or re-parse every call"
        code={`-- BAD: builds fresh text per value
EXECUTE IMMEDIATE 'SELECT COUNT(*) FROM orders WHERE total_amount > ' || v_amt;

-- GOOD: bind the value
EXECUTE IMMEDIATE 'SELECT COUNT(*) FROM orders WHERE total_amount > :amt'
  INTO v_cnt USING v_amt;`}
      />

      <H2>6. Instrumentation — the code should tell you how it ran</H2>
      <P>
        When a batch takes 40 minutes, someone needs to know <em>where</em>. Oracle's native
        instrumentation is <K>DBMS_APPLICATION_INFO</K>, which any DBA can see live:
      </P>
      <CodeBlock
        language="sql"
        filename="Report progress into the live session info"
        code={`BEGIN
  DBMS_APPLICATION_INFO.SET_MODULE(
    module_name => 'AP_PAYMENT_BATCH',
    action_name => 'PHASE 1: VALIDATE');
  -- ... phase 1 ...
  DBMS_APPLICATION_INFO.SET_ACTION('PHASE 2: APPLY');
  -- ... phase 2 ...
  DBMS_APPLICATION_INFO.SET_ACTION(NULL);
END;
/`}
      />
      <UL>
        <li>Combine with <K>V$SQL_MONITOR</K>-style watching: the DBA can see "AP_PAYMENT_BATCH / PHASE 2" taking 30 minutes.</li>
        <li>A small <K>app_run_log</K> plus <K>DBMS_APPLICATION_INFO</K> is the whole observability story most batches need.</li>
      </UL>

      <H2>The checklist</H2>
      <DataTable
        headers={["Rule", "Why", "Where learned"]
        }
        rows={[
          ["No SQL in loops; set-based or bulk", "Context switching costs per row", "bulk page"],
          ["BULK COLLECT / FORALL / LIMIT", "One pass instead of thousands", "bulk page"],
          ["Log to a table; autonomous + RAISE", "Audit survives rollback; errors stay visible", "exceptions page"],
          ["Commit at boundaries, chunk big loads", "Lock and undo hygiene", "transactions page"],
          ["Bind values, never concatenate", "Plan reuse + no injection", "SQL-inside-PL/SQL page"],
          ["Instrument with DBMS_APPLICATION_INFO", "Deployers/DBA can see progress live", "this page"],
        ]}
      />
    </>
  );
}
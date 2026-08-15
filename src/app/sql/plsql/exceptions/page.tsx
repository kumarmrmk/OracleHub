import PageHeader, { H2, P } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — Exception Handling",
};

export default function SqlPlsqlExceptionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="Exception handling"
        description="Predefined exceptions (NO_DATA_FOUND, TOO_MANY_ROWS, ZERO_DIVIDE), the WHEN OTHERS catch-all, user-defined exceptions, RAISE and RAISE_APPLICATION_ERROR, and the SQLCODE / SQLERRM detail functions."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "Exceptions" }]}
        updated="2026"
      />

      <P>
        Exceptions are how PL/SQL fails <em>deliberately</em>. An unhandled error stops the block
        and propagates outward to the caller; a handled one lets your program choose what happens
        next. Good PL/SQL is written around "what can go wrong here" — this page is that section of
        the block.
      </P>

      <H2>The EXCEPTION section</H2>
      <CodeBlock
        language="sql"
        filename="Handlers run in order; WHEN OTHERS is the last net"
        code={`DECLARE
  v_name customers.customer_name%TYPE;
BEGIN
  SELECT customer_name INTO v_name FROM customers WHERE customer_id = 101;
  DBMS_OUTPUT.PUT_LINE(v_name);
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    DBMS_OUTPUT.PUT_LINE('No such customer');
  WHEN TOO_MANY_ROWS THEN
    DBMS_OUTPUT.PUT_LINE('Duplicate keys - the query is not unique');
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Unexpected: ' || SQLERRM);
END;
/`}
      />
      <P>
        Order matters: PL/SQL scans the handlers top-down for the first match. Put the{" "}
        <strong>specific</strong> ones first and <K>WHEN OTHERS</K> last — it is a catch-all, and if
        it comes first nothing else ever fires.
      </P>

      <H2>Predefined exceptions</H2>
      <DataTable
        headers={["Exception", "Raised when"]
        }
        rows={[
          ["NO_DATA_FOUND", "SELECT INTO finds no rows; a collection element is uninitialized"],
          ["TOO_MANY_ROWS", "SELECT INTO finds more than one row"],
          ["ZERO_DIVIDE", "Division by zero"],
          ["DUP_VAL_ON_INDEX", "An insert/update violates a unique constraint"],
          ["VALUE_ERROR", "A conversion or size error (e.g. putting 'x' into a NUMBER)"],
          ["INVALID_NUMBER", "A string can't convert to a number in SQL context"],
          ["CASE_NOT_FOUND", "A simple CASE matches no WHEN and has no ELSE"],
          ["TOO_MANY_... / PROGRAM_ERROR", "Internal engine conditions"],
        ]}
      />
      <Callout type="warning">
        Remember inside a <em>loop</em>: <K>NO_DATA_FOUND</K> thrown by a <K>SELECT INTO</K>{" "}
        terminates the whole block, not just the iteration — it does <strong>not</strong> behave like
        "skip this row". Guard with <K>COUNT(*)</K> first or handle inside a nested block.
      </Callout>

      <H2>User-defined exceptions</H2>
      <P>
        Declare your own exception, then <K>RAISE</K> it — clean domain errors without error-code
        litter:
      </P>
      <CodeBlock
        language="sql"
        filename="Declare, raise, handle"
        code={`DECLARE
  e_limit_exceeded EXCEPTION;          -- user-defined exception
  v_limit NUMBER(12,2) := 15000;
BEGIN
  IF v_limit > 10000 THEN
    RAISE e_limit_exceeded;
  END IF;
EXCEPTION
  WHEN e_limit_exceeded THEN
    DBMS_OUTPUT.PUT_LINE('Credit limit over 10k — adjust.');
END;
/`}
      />

      <H2>RAISE_APPLICATION_ERROR — the friendly error</H2>
      <P>
        To surface a clean error message to the caller (an API, an integration, a screen), use{" "}
        <K>RAISE_APPLICATION_ERROR</K> with a code between <K>-20000</K> and <K>-20999</K>. This is
        what applications actually catch:
      </P>
      <CodeBlock
        language="sql"
        filename="Give callers an actionable message and code"
        code={`DECLARE
  v_customer customers.customer_id%TYPE := 101;
  v_count    NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM orders WHERE customer_id = v_customer;
  IF v_count > 5 THEN
    RAISE_APPLICATION_ERROR(
      -20001,
      'Customer ' || v_customer || ' has too many open orders: ' || v_count
    );
  END IF;
END;
/`}
      />
      <P>
        The caller receives <K>ORA-20001</K> (or <K>ORA-20999</K>, etc.) with your text — the
        standard way exceptions cross the PL/SQL ↔ application boundary.
      </P>

      <H2>WHEN OTHERS — the safety net and the sinhole</H2>
      <Callout type="warning">
        <K>WHEN OTHERS</K> that just prints and returns makes errors <em>disappear</em> — the batch
        "completes" while rows quietly failed. The two acceptable uses: (1) log-then-<K>RAISE</K> to
        keep the error visible, or (2) intentionally swallow-and-continue a <em>scoped</em> error
        you have thought about. Anything else is data loss in waiting.
      </Callout>
      <CodeBlock
        language="sql"
        filename="Log it, then re-raise — never just swallow in production"
        code={`EXCEPTION
  WHEN OTHERS THEN
    log_error(SQLCODE, SQLERRM);   -- your own audit table
    RAISE;                         -- re-raise the SAME error
END;
/`}
      />

      <H2>SQLCODE and SQLERRM — error details</H2>
      <P>
        Inside a handler, <K>SQLCODE</K> is the numeric error code (e.g.{" "}
        <K>-20001</K>, <K>1403</K> for no-data-found) and <K>SQLERRM</K> is the message text. There
        is also the modern <K>DBMS_UTILITY.FORMAT_ERROR_BACKTRACE</K> for the line stack:
      </P>
      <DataTable
        headers={["Detail function", "Returns"]
        }
        rows={[
          ["SQLCODE", "The error number (negative for Oracle errors)"],
          ["SQLERRM", "The full error message"],
          ["DBMS_UTILITY.FORMAT_ERROR_BACKTRACE", "Where the error actually occurred, line by line"],
          ["DBMS_UTILITY.FORMAT_ERROR_STACK", "The stack of exception handlers the error traveled"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Capture the full picture"
        code={`EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('CODE : ' || SQLCODE);
    DBMS_OUTPUT.PUT_LINE('MSG  : ' || SQLERRM);
    DBMS_OUTPUT.PUT_LINE('WHERE: ' ||
      DBMS_UTILITY.FORMAT_ERROR_BACKTRACE);
END;
/`}
      />
      <Callout type="info">
        A <strong>RAISE</strong> inside a handler re-raises the very error being handled;{" "}
        <K>RAISE_APPLICATION_ERROR</K> creates a new one. And an exception inside a nested block
        that is not handled locally <strong>propagates</strong> outward until a block handles it —
        so an outer <K>WHEN OTHERS</K> catches everything beneath it. Structure your outer
        boundaries accordingly.
      </Callout>
    </>
  );
}
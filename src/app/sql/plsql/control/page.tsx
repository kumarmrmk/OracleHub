import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — Control Statements",
};

export default function SqlPlsqlControlPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="Control statements"
        description="IF / ELSIF / ELSE, CASE, the three loop forms (basic LOOP, WHILE-LOOP, FOR-LOOP), and the exit and skip verbs — EXIT, EXIT WHEN, and CONTINUE."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "Control Statements" }]}
        updated="2026"
      />

      <P>
        PL/SQL's control flow is classic structured programming: selection (IF / CASE) and
        repetition (LOOP). The surface is simple, but two habits decide whether your loops are safe:
        always having an <K>EXIT</K> path, and knowing which loop form to pick for work over
        cursors and collections (which the cursors and collections pages build on).
      </P>

      <H2>IF / ELSIF / ELSE</H2>
      <CodeBlock
        language="sql"
        filename="The full IF ladder"
        code={`DECLARE
  v_amount   NUMBER(12,2);
  v_size     VARCHAR2(10);
BEGIN
  v_amount := 1500;

  IF v_amount > 10000 THEN
    v_size := 'LARGE';
  ELSIF v_amount > 1000 THEN
    v_size := 'MEDIUM';
  ELSE
    v_size := 'SMALL';
  END IF;

  DBMS_OUTPUT.PUT_LINE(v_size);   -- MEDIUM
END;
/`}
      />
      <UL>
        <li>It is <K>ELSIF</K> (one word, no E) — the "E" missing is the classic typo.</li>
        <li>Each branch ends with <K>END IF;</K> — easy to miss when nesting.</li>
        <li>Conditions evaluate top-down; the first TRUE branch wins.</li>
        <li><K>NULL</K> in a condition goes to <K>ELSE</K> — three-valued logic applies here too (<K>IF v_x &lt; 0</K> with <K>v_x</K> NULL is not FALSE, it falls to ELSE/ELSIF).</li>
      </UL>

      <H2>CASE</H2>
      <P>
        Two forms. The <strong>simple CASE</strong> matches one expression to values; the{" "}
        <strong>searched CASE</strong> evaluates arbitrary conditions:
      </P>
      <CodeBlock
        language="sql"
        filename="Simple vs searched CASE"
        code={`DECLARE
  v_status  VARCHAR2(10) := 'APPROVED';
  v_note    VARCHAR2(30);
  v_amount  NUMBER := 2500;
  v_rating  VARCHAR2(10);
BEGIN
  -- simple CASE: one expression, many values
  v_note := CASE v_status
              WHEN 'OPEN'     THEN 'still open'
              WHEN 'APPROVED' THEN 'ready to pay'
              ELSE 'other'
            END;

  -- searched CASE: conditions win
  v_rating := CASE
                WHEN v_amount >= 10000 THEN 'premium'
                WHEN v_amount >= 1000  THEN 'standard'
                ELSE 'basic'
              END;

  DBMS_OUTPUT.PUT_LINE(v_note || ' / ' || v_rating);
END;
/`}
      />
      <Callout type="warning">
        If simple CASE matches <em>none</em> of its <K>WHEN</K>s and there is no <K>ELSE</K>, it
        raises <K>CASE_NOT_FOUND</K>. Give searched CASE an <K>ELSE</K> (or ensure a truthy branch).
      </Callout>

      <H2>The three loops</H2>
      <DataTable
        headers={["Form", "When it runs", "Use it for"]
        }
        rows={[
          ["basic LOOP ... END LOOP", "Body runs until an EXIT", "Anything with an explicit, early exit; cursor fetch until no more rows"],
          ["WHILE condition LOOP", "Only while the condition is TRUE", "Unknown count, condition-checked before each pass"],
          ["FOR i IN min..max LOOP", "Counter runs the range once", "Known count; all-NUMBER counters"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="All three, plus EXIT/EXIT WHEN"
        code={`DECLARE
  i NUMBER := 1;
BEGIN
  -- FOR: known count, implicit counter
  FOR j IN 1 .. 3 LOOP
    DBMS_OUTPUT.PUT_LINE('for ' || j);
  END LOOP;

  -- WHILE: condition at the top
  WHILE i <= 3 LOOP
    DBMS_OUTPUT.PUT_LINE('while ' || i);
    i := i + 1;
  END LOOP;

  -- basic LOOP with EXIT WHEN — the cursor idiom
  i := 1;
  LOOP
    EXIT WHEN i > 3;              -- leave when the condition holds
    DBMS_OUTPUT.PUT_LINE('basic ' || i);
    i := i + 1;
  END LOOP;
END;
/`}
      />

      <H2>EXIT, EXIT WHEN, CONTINUE</H2>
      <P>
        The three loop-control verbs, each with a WHEN form:
      </P>
      <DataTable
        headers={["Verb", "What it does"]
        }
        rows={[
          ["EXIT; / EXIT WHEN cond;", "Leave the loop entirely (immediately / when the condition is true)"],
          ["CONTINUE; / CONTINUE WHEN cond;", "Skip to the loop's next iteration"],
          ["EXIT loop_label;", "Leave a specifically labeled outer loop from inside nested ones"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="CONTINUE skips, EXIT leaves"
        code={`DECLARE
  v_sum NUMBER := 0;
BEGIN
  FOR i IN 1 .. 10 LOOP
    CONTINUE WHEN MOD(i, 2) = 0;   -- skip even numbers
    v_sum := v_sum + i;            -- only odds summed = 25
  END LOOP;
  DBMS_OUTPUT.PUT_LINE('sum of odds: ' || v_sum);
END;
/`}
      />
      <Callout type="danger">
        The classic infinite loop is the <strong>bare LOOP with no EXIT path</strong> — plan the
        exit before writing the body. And remember <K>FOR</K>-loop counters are read-only: assigning{" "}
        <K>j := 5</K> inside a <K>FOR j</K> loop is a compile error.
      </Callout>

      <H2>Labeled loops for nested exit</H2>
      <P>
        When you must escape several levels (e.g. "stop scanning this grid early"), label the outer
        loop and <K>EXIT</K> to it by name:
      </P>
      <CodeBlock
        language="sql"
        filename="Exit the outer loop from inside the inner"
        code={`DECLARE
  v_found VARCHAR2(1) := 'N';
BEGIN
  <<outer_loop>>
  FOR i IN 1 .. 3 LOOP
    FOR j IN 1 .. 3 LOOP
      IF i = 2 AND j = 2 THEN
        v_found := 'Y';
        EXIT outer_loop;          -- jump out of BOTH loops
      END IF;
    END LOOP;
  END LOOP;
  DBMS_OUTPUT.PUT_LINE('found at inner cell? ' || v_found);
END;
/`}
      />
      <Callout type="tip">
        For pure SQL problems, ask first whether a loop is even needed — many "loop over a table"
        programs in Fusion/ORM-land are really an <K>UPDATE ... SET ... WHERE</K> in disguise. The{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/plsql/performance">performance page</a>{" "}
        hammers this point.
      </Callout>
    </>
  );
}
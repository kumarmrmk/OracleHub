import PageHeader, { H2, P } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "PL/SQL — Collections",
};

export default function SqlPlsqlCollectionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="Collections"
        description="Associative arrays, nested tables, and VARRAYs — the three PL/SQL collection types — and the methods COUNT, FIRST, LAST, NEXT, DELETE, and EXTEND that manage them."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }, { label: "Collections" }]}
        updated="2026"
      />

      <P>
        A <strong>collection</strong> is PL/SQL's array — a set of values of one type, indexed and
        iterated in code. Collections are the data structure behind the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/plsql/bulk">bulk page's</a>{" "}
        <K>BULK COLLECT</K>/<K>FORALL</K>: bulk loading <em>needs</em> a collection to land into.
        Choosing the right collection type matters less than knowing the methods — the methods are
        where the daily work happens.
      </P>

      <H2>The three types</H2>
      <DataTable
        headers={["Type", "Index", "Shape", "Best for"]
        }
        rows={[
          ["Associative array (Index-By)", "NUMBER or VARCHAR2 you define", "Dense or sparse, no order guarantee", "In-memory lookup tables keyed by name/id (fastest for lookups)"],
          ["Nested table", "Dense 1..n by default, can delete → sparse", "Like a set; grows/shrinks via methods", "General-purpose lists; storage as a database column type"],
          ["VARRAY (variable-size array)", "Dense 1..n, fixed maximum size", "Fully dense once declared max size", "Small, ordered, fixed lists (days, segregation checklists)"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Declare all three"
        code={`DECLARE
  TYPE t_as IS TABLE OF VARCHAR2(20) INDEX BY PLS_INTEGER;  -- assoc array
  TYPE t_nt IS TABLE OF NUMBER;                             -- nested table
  TYPE t_var IS VARRAY(5) OF VARCHAR2(10);                 -- varray, max 5

  v_assoc t_as;
  v_nt    t_nt := t_nt();                 -- initialize empty collections
  v_var   t_var := t_var('Mon', 'Tue');
BEGIN
  v_assoc(1) := 'West';                   -- associative array: any index
  v_assoc(50) := 'East';
  DBMS_OUTPUT.PUT_LINE(v_assoc(50));
END;
/`}
      />
      <Callout type="info">
        Associative arrays are <strong>in-memory only</strong> — they cannot live in a database
        column. Nested tables and VARRAYs can be column types (as a table's <K>element</K> column),
        which is how you store an "answer list" inside a row.
      </Callout>

      <H2>The core methods</H2>
      <DataTable
        headers={["Method", "What it gives you"]
        }
        rows={[
          ["COUNT", "Number of populated elements"],
          ["FIRST / LAST", "Lowest / highest index that has a value"],
          ["NEXT(n) / PRIOR(n)", "Next / previous index after n (walks sparse collections safely)"],
          ["EXISTS(n)", "TRUE if index n holds a value (your way to check before DELETE)"],
          ["DELETE", "Remove all / DELETE(n) one / DELETE(m,n) a range — turns collections sparse"],
          ["EXTEND", "Add one / EXTEND(n) n empty slots (nested tables and VARRAYs only)"],
          ["TRIM", "Drop trailing elements (nested tables and VARRAYs only)"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="Walk a sparse collection with FIRST/NEXT"
        code={`DECLARE
  TYPE t_tbl IS TABLE OF VARCHAR2(10);
  v_days t_tbl;
  v_i    PLS_INTEGER;
BEGIN
  v_days := t_tbl('Mon', 'Tue', 'Wed', 'Thu');
  v_days.DELETE(2);                       -- now sparse: Tue is gone

  DBMS_OUTPUT.PUT_LINE('count = ' || v_days.COUNT);       -- 3
  v_i := v_days.FIRST;
  WHILE v_i IS NOT NULL LOOP
    DBMS_OUTPUT.PUT_LINE('day = ' || v_days(v_i));
    v_i := v_days.NEXT(v_i);              -- always move via NEXT
  END LOOP;
END;
/`}
      />
      <Callout type="danger">
        Reading <K>v_days(2)</K> after <K>DELETE</K> raises <K>NO_DATA_FOUND</K> (collections reuse
        that exception). Guard every risky read with <K>IF v_days.EXISTS(2) THEN</K> — and never
        assume a collection is dense.
      </Callout>

      <H2>Iterating with FOR ... IN</H2>
      <P>
        For dense collections, the <K>FOR</K>-loop with <K>1 .. COUNT</K> works; for sparse ones
        iterate <K>v.FIRST .. v.LAST</K> only if fully dense, otherwise stick to the
        <K>NEXT</K> walk. There is also the newer <K>FOR i IN INDICES OF v</K> that visits only
        populated indexes:
      </P>
      <CodeBlock
        language="sql"
        filename="INDICES OF visits only populated slots"
        code={`DECLARE
  TYPE t_arr IS TABLE OF VARCHAR2(10) INDEX BY PLS_INTEGER;
  v_arr t_arr;
BEGIN
  v_arr(10) := 'x'; v_arr(20) := 'y'; v_arr(30) := 'z';

  FOR i IN INDICES OF v_arr LOOP      -- 10, 20, 30 — skips the gaps
    DBMS_OUTPUT.PUT_LINE(i || '=' || v_arr(i));
  END LOOP;
END;
/`}
      />
      <Callout type="warning">
        <K>INDICES OF</K> needs the collection populated by a <K>BULK COLLECT</K> (or with keys
        already set) and is the sparse-friendly cousin of <K>VALUES OF</K>. When in doubt, the{" "}
        <K>FIRST/NEXT</K> walk always works. And for the pattern "collection → row change", that is
        the <K>FORALL</K> territory of the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/plsql/bulk">bulk page</a>.
      </Callout>

      <H2>Collections as parameter and return types</H2>
      <P>
        Collections shine as <K>IN OUT</K> parameters and function returns — a procedure can accept a
        whole set of "things to insert" in one argument. Define the type in a package spec so
        callers share it:
      </P>
      <CodeBlock
        language="sql"
        filename="Share a collection type through a package"
        code={`CREATE OR REPLACE PACKAGE pkg_ids AS
  TYPE t_id_list IS TABLE OF NUMBER;      -- public collection type
  PROCEDURE process (p_ids IN t_id_list);
END;
/`}
      />
      <P>
        This is the stepping stone to the bulk page: pass a punched list of primary keys once, and{" "}
        <K>FORALL</K> drives it at database speed instead of row-by-row calls.
      </P>
    </>
  );
}
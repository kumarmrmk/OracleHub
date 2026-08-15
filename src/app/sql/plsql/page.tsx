import PageHeader, { P, H2 } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import LearningPath from "@/components/ui/LearningPath";
import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "PL/SQL — Overview & Learning Path",
};

export default function SqlPlsqlPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · PL/SQL"
        title="PL/SQL — from blocks to production code"
        description="The procedural language Oracle runs inside the database itself: blocks and variables, control flow, cursors, procedures, functions, packages, triggers, collections, bulk processing with BULK COLLECT and FORALL, plus performance, security, and deployment."
        breadcrumbs={[{ label: "SQL" }, { label: "PL/SQL" }]}
        updated="2026"
      />

      <P>
        SQL asks questions; <strong>PL/SQL</strong> executes logic. Since PL/SQL runs inside the
        Oracle database — beside the data, with full transaction control — every program you write
        here is deployed, granted, compiled, and secured the same way a table is. This section takes
        you from a first anonymous block to the stored programs real projects ship and maintain,
        ending with the bulk-processing and security skills that separate junior code from
        production code.
      </P>

      <Callout type="tip">
        If your goal is <strong>Oracle Fusion / OIC work</strong>, weight your time toward these
        pages: <strong>procedures &amp; functions</strong>, <strong>packages</strong>,{" "}
        <strong>cursors</strong>, <strong>exception handling</strong>, <strong>bulk
        processing</strong>, <strong>dynamic SQL</strong> (in the SQL-inside-PL/SQL page), and the
        <strong>files &amp; JSON</strong> page — that is the exact skill set integration developers
        are asked for.
      </Callout>

      <H2>The learning path</H2>
      <LearningPath
        title="Read in this order — the recommended sequence"
        steps={[
          {
            href: "/sql/plsql/blocks",
            title: "Blocks, variables, scope",
            level: "Foundation",
            outcome: "DECLARE/BEGIN/EXCEPTION/END, anonymous blocks, DBMS_OUTPUT, variables & constants, %TYPE/%ROWTYPE, bind variables, and scope.",
          },
          {
            href: "/sql/plsql/control",
            title: "Control statements",
            level: "Foundation",
            outcome: "IF/ELSIF/ELSE, CASE, and all three loops (basic, WHILE, FOR) with EXIT, EXIT WHEN, and CONTINUE.",
          },
          {
            href: "/sql/plsql/dml",
            title: "SQL inside PL/SQL",
            level: "Foundation",
            outcome: "SELECT ... INTO, DML (INSERT/UPDATE/DELETE/MERGE), transaction control, and dynamic SQL with EXECUTE IMMEDIATE.",
          },
          {
            href: "/sql/plsql/exceptions",
            title: "Exception handling",
            level: "Foundation",
            outcome: "Predefined exceptions, WHEN OTHERS, user-defined exceptions, RAISE and RAISE_APPLICATION_ERROR, SQLCODE/SQLERRM.",
          },
          {
            href: "/sql/plsql/cursors",
            title: "Cursors",
            level: "Foundation",
            outcome: "Implicit cursor attributes, explicit OPEN/FETCH/CLOSE, cursor FOR loops, parameterized cursors, FOR UPDATE / WHERE CURRENT OF, and ref cursors.",
          },
          {
            href: "/sql/plsql/procedures",
            title: "Procedures & functions",
            level: "Module",
            outcome: "CREATE/REPLACE/DROP, IN / OUT / IN OUT parameters, defaults, return types, calling functions from SQL, and overloading.",
          },
          {
            href: "/sql/plsql/packages",
            title: "Packages",
            level: "Module",
            outcome: "Specification and body, public vs private, package variables and initialization, why packages rule real projects, and built-ins like DBMS_OUTPUT, UTL_FILE, DBMS_SCHEDULER.",
          },
          {
            href: "/sql/plsql/triggers",
            title: "Triggers",
            level: "Module",
            outcome: "BEFORE/AFTER/INSTEAD OF, row vs statement level, :OLD/:NEW, auditing triggers, and the mutating-table error with its fix.",
          },
          {
            href: "/sql/plsql/collections",
            title: "Collections",
            level: "Module",
            outcome: "Associative arrays, nested tables, VARRAYs, and the methods COUNT, FIRST, LAST, NEXT, DELETE, EXTEND.",
          },
          {
            href: "/sql/plsql/records",
            title: "Records & object types",
            level: "Advanced",
            outcome: "User-defined records, %ROWTYPE table records, and object types with methods.",
          },
          {
            href: "/sql/plsql/bulk",
            title: "Bulk processing",
            level: "Advanced",
            outcome: "BULK COLLECT, FORALL, LIMIT, SAVE EXCEPTIONS, SQL%BULK_EXCEPTIONS — and why row-by-row is the #1 PL/SQL performance sin.",
          },
          {
            href: "/sql/plsql/files",
            title: "Files & external integration",
            level: "Advanced",
            outcome: "UTL_FILE and directories, calling REST services, and processing JSON/XML from PL/SQL.",
          },
          {
            href: "/sql/plsql/performance",
            title: "Performance & best practices",
            level: "Advanced",
            outcome: "Avoiding SQL in loops, bulk operations, proper logging, avoiding needless commits, bind variables, and instrumentation.",
          },
          {
            href: "/sql/plsql/security",
            title: "Security & deployment",
            level: "Advanced",
            outcome: "Definer vs invoker rights (AUTHID), grants, dependencies and recompilation, compile errors and warnings, and source-control friendly deployment.",
          },
        ]}
      />

      <H2>The anatomy of every PL/SQL program</H2>
      <P>
        Every PL/SQL program — anonymous block, procedure, function, trigger — shares the same
        skeleton. Learn the skeleton once and every page that follows is just "what goes in each
        section":
      </P>
      <DataTable
        headers={["Section", "Goes inside…", "Typical contents"]
        }
        rows={[
          ["DECLARE (optional)", "Before BEGIN", "Variables, constants, cursors, types"],
          ["BEGIN", "The executable section", "Assignment, control flow, SQL statements"],
          ["EXCEPTION (optional)", "After the executable statements", "WHEN NO_DATA_FOUND THEN … handlers"],
          ["END;", "The close of the block", "Optional labels; trailing / in SQL*Plus/SQLcl"],
        ]}
      />
      <Callout type="info">
        The <strong>EXCEPTION</strong> section turns errors into handled outcomes. A block without
        one simply raises the error to its caller. Nested blocks each may carry their own handlers,
        and an exception not handled locally propagates outward — that is the whole mental model of
        error flow in PL/SQL.
      </Callout>

      <H2>The one rule that governs everything</H2>
      <P>
        PL/SQL and SQL share the same <strong>transaction</strong>. Procedures that run DML change
        the caller's transaction — there is no hidden commit of your own, and you <K>COMMIT</K> (or
        not) deliberately. That single fact, learned on the{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/sql/transactions">transactions page</a>,{" "}
        is why production PL/SQL guidelines are full of "commit in the caller, never deep inside"
        advice.
      </P>
    </>
  );
}
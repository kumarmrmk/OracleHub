import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Transactions",
};

export default function SqlTransactionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle SQL · Changing data"
        title="Transactions"
        description="COMMIT, ROLLBACK, SAVEPOINT, read consistency, locks and concurrency basics, and the isolation model Oracle uses so that readers never block writers."
        breadcrumbs={[{ label: "SQL" }, { label: "Transactions" }]}
        updated="2026"
      />

      <P>
        A <strong>transaction</strong> is a group of DML statements that must all succeed or all
        fail together. Oracle's model is simple: your DML starts a transaction implicitly, and it
        stays open until you <K>COMMIT</K>, <K>ROLLBACK</K>, or end the session. Nothing your
        coworkers see changes until you commit — and you can undo everything until then.
      </P>

      <H2>The four isolation properties</H2>
      <P>
        Transactions guarantee <strong>ACID</strong>: <strong>A</strong>tomicity (all-or-nothing),{" "}
        <strong>C</strong>onsistency (a statement never sees a half-updated state),{" "}
        <strong>I</strong>solation (concurrent transactions cannot corrupt each other), and{" "}
        <strong>D</strong>urability (committed data survives a crash). Oracle's lock manager and redo
        log implement these — you mostly experience them as "why can't I commit if I have uncommitted
        work" and "why did my query show old data".
      </P>

      <H2>COMMIT, ROLLBACK, SAVEPOINT</H2>
      <DataTable
        headers={["Statement", "Effect"]
        }
        rows={[
          ["COMMIT", "Makes all uncommitted changes permanent; releases locks; ends the transaction"],
          ["ROLLBACK", "Undoes all uncommitted changes; releases locks"],
          ["SAVEPOINT name", "Marks a point you can roll back to"],
          ["ROLLBACK TO SAVEPOINT name", "Undoes work since that marker, keeping earlier work"],
        ]}
      />
      <CodeBlock
        language="sql"
        filename="A transfer that survives an error partway"
        code={`SAVEPOINT before_split;

UPDATE accounts SET balance = balance - 1000 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 1000 WHERE account_id = 2;

-- something failed mid-way? Undo just the two updates
ROLLBACK TO SAVEPOINT before_split;

-- or keep them: make it permanent
COMMIT;`}
      />
      <Callout type="danger">
        In Oracle you <strong>cannot COMMIT inside a transaction that has only been started by
        SELECT</strong> in a read-consistency sense, and more practically: sessions with open
        transactions hold <strong>row locks</strong> that block other builders' <K>UPDATE</K>s on
        the same rows — and a hung session holding locks is a production incident. Commit promptly.
      </Callout>

      <H2>Read consistency — the reader never waits</H2>
      <P>
        The behavior that surprises everyone moving from another database: <strong>readers do not
        block writers</strong>. Oracle implements <strong>multiversion read consistency</strong> —
        a query sees the data <em>as of the moment the query started</em>, using an{" "}
        <K>undo</K>/rollback segment to reconstruct the older version of a row that some other
        session is busy updating. Consequences:
      </P>
      <UL>
        <li>
          A long-running report does not get partial updates: it sees a consistent snapshot.
        </li>
        <li>
          Rereading the same row inside <em>one</em> transaction can show different values if you
          explicitly want the newest — plain <K>SELECT</K> is <em>statement-level</em> read
          consistent unless you change it.
        </li>
      </UL>

      <H2>Locks and concurrency basics</H2>
      <Callout type="info">
        The rules in practice: an <K>UPDATE</K>/<K>DELETE</K> locks the rows it touches{" "}
        <em>until commit</em>; readers never lock; two sessions can update the same table but not
        the same row simultaneously; and a <K>CREATE TABLE</K>/<K>DROP</K> against a table being
        updated waits for the updater's commit. The “wait forever behind a zombie session” is why
        you see <K>ORA-01555</K> (snapshot too old) and <K>ORA-00054</K> (resource busy) in
        production.
      </Callout>
      <CodeBlock
        language="sql"
        filename="The e-agreement theatre"
        code={`-- Session A
UPDATE orders SET total_amount = 0 WHERE order_id = 5;  -- row locked by A
-- Session B (separate window) — BLOCKS here until A commits:
UPDATE orders SET total_amount = 0 WHERE order_id = 5;`}
      />

      <H2>Isolation levels and what Oracle actually gives you</H2>
      <DataTable
        headers={["Isolation level", "What it means", "Oracle default?"]
        }
        rows={[
          ["READ COMMITTED", "Each statement sees data committed before it runs; no dirty reads", "Yes — Oracle's default"],
          ["SERIALIZABLE", "Read a single snapshot of the whole transaction — later commits invisible", "Available via SET TRANSACTION ISOLATION LEVEL SERIALIZABLE"],
          ["READ ONLY", "Guarantee only reads, for reporting", "Variant of serializable-oriented reporting"],
        ]}
      />
      <P>
        Oracle's default <K>READ COMMITTED</K> is already very robust because of multiversioning —
        it is not "a plain snapshot per row" like some engines, so the "dirty read" and "lost
        update" anomalies that the ANSI docs warn about are largely engineered out. For true
        serializable reads of a changing table you opt in explicitly.
      </P>

      <H2>The DDL side effect: implicit commits</H2>
      <P>
        This repeats the foundations warning because it is where the money disappears:{" "}
        <K>CREATE</K>/<K>ALTER</K>/<K>DROP</K>/<K>TRUNCATE</K> all <strong>commit your open
        transaction</strong>. Done need <K>GRANT</K> for many objects. If you batch 10,000 updates
        and then re-create an index, the updates are committed without you asking.
      </P>
      <Callout type="tip">
        For long batches, practice <strong>commit in waves</strong>:{" "}
        <K>FOR i IN 1 .. 99999 LOOP … IF MOD(i, 1000) = 0 THEN COMMIT; END IF; END LOOP;</K>. This
        bounds the undo/redo footprint and keeps the row locks short — the pattern every real ETL
        uses.
      </Callout>
    </>
  );
}
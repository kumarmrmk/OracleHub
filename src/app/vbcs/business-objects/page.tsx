import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "VBCS Business Objects & REST",
};

export default function VbcsBusinessObjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="VBCS"
        title="Business Objects & REST"
        description="VBCS business objects give you data without a backend: you define the object, VBCS generates storage plus a REST API, and your pages consume it with a few clicks. This page compares them with REST data sources and service connections."
        breadcrumbs={[{ label: "VBCS" }, { label: "Business Objects" }]}
        updated="February 2025"
      />

      <P>
        When you need data that has no home yet — a draft, a session preference, a lightweight list —
        you don't want to stand up a database. That is exactly the gap{" "}
        <strong>business objects</strong> fill: you declare the object and its fields in the
        designer, and VBCS creates the storage, the CRUD REST API, and the security around it.
      </P>

      <Callout type="info">
        Think of a business object as <strong>"data-as-a-service with zero infrastructure."</strong>{" "}
        It is not the system of record — Fusion remains that. It is VBCS-owned scratch space: drafts,
        session data, app lookups, and prototypes you can later swap for a real service.
      </Callout>

      <H2>What a business object is</H2>
      <P>
        A business object is a VBCS-defined entity with a set of <strong>fields</strong> and an
        auto-generated REST API. VBCS provisions database storage for its rows, so reads and writes
        behave like a small database you never administer. From a page's point of view it is simply
        a REST endpoint — the same mechanism that talks to Fusion. Typical uses:
      </P>
      <UL>
        <li>
          <strong>Draft data</strong> — persist a half-filled form and restore it on the next visit.
        </li>
        <li>
          <strong>Session / preference state</strong> — bookmarks, filters, and "wizard position"
          that survive a browser refresh.
        </li>
        <li>
          <strong>Lookup tables</strong> local to the app (status codes, country lists).
        </li>
        <li>
          <strong>Prototypes</strong> — build against a business object now, swap in Fusion REST
          later.
        </li>
      </UL>

      <H2>Fields & types</H2>
      <P>
        Each field has a data type, an optional default, and resource flags. The same catalog powers
        generated form components, validation, and REST payloads:
      </P>
      <DataTable
        headers={["Field type", "Description", "Notes"]}
        rows={[
          ["String", "Free text up to a configurable length", "Supports max length and pattern validation"],
          ["Number", "Integer or decimal values", "Quantities, prices, counts"],
          ["Boolean", "true / false flag", "Powers checkboxes and visibility conditions"],
          ["Date / Date-Time", "Calendar values with optional time", "Stored as ISO; rendered by date pickers"],
          ["Object", "A nested, single record", "e.g. an embedded address within an Order"],
          ["Array", "A list of nested records", "e.g. order lines inside an Order header"],
          ["File", "An uploaded attachment", "Download via the object's file endpoint"],
        ]}
      />
      <P>
        Business objects support <strong>resource associations</strong> — relationships exposed as
        REST sub-resources:
      </P>
      <DataTable
        headers={["Association", "Meaning", "REST shape"]}
        rows={[
          [
            "One-to-many <K key='bo-1m'>1:&#8734;</K>",
            "A parent owns many children (Order → OrderLines)",
            "GET /businessObjects/Order/child/OrderLines",
          ],
          [
            "Many-to-many <K key='bo-mm'>m:m</K>",
            "Two objects share rows via a join (Projects ↔ Tags)",
            "GET /businessObjects/Project/child/TagMembership",
          ],
          [
            "Self-referencing <K key='bo-self'>1:1</K>",
            "An object points at another row of the same object",
            "e.g. an Employee's manager field",
          ],
        ]}
      />

      <H2>Business object APIs</H2>
      <P>
        For every business object VBCS generates a full REST API under your app's base URL, mirroring
        CRUD plus the associations above:
      </P>
      <CodeBlock
        language="bash"
        filename="Generated REST routes for a business object"
        code={`# List / create a business object collection
GET  /mobile/custom/<AppID>/businessObjects/Supplier
POST /mobile/custom/<AppID>/businessObjects/Supplier

# Single resource (read / update / delete)
GET    /mobile/custom/<AppID>/businessObjects/Supplier/{id}
PATCH  /mobile/custom/<AppID>/businessObjects/Supplier/{id}
DELETE /mobile/custom/<AppID>/businessObjects/Supplier/{id}

# Child resources (associations, e.g. orders under a supplier)
GET /mobile/custom/<AppID>/businessObjects/Supplier/{id}/child/Order

# Query with q, limit, offset, fields, and orderBy
GET /mobile/custom/<AppID>/businessObjects/Supplier?q=Status%3D'ACTIVE'&limit=25`}
      />
      <P>A concrete call with basic auth, as it looks from curl:</P>
      <CodeBlock
        language="bash"
        filename="Create a supplier record"
        code={`curl -u "user@example.com:password" \\
  -H "Content-Type: application/json" \\
  -X POST \\
  -d '{"SupplierName": "Acme GmbH", "Status": "ACTIVE", "CreditLimit": 50000}' \\
  https://<vbcshost>/mobile/custom/MyApp_123/businessObjects/Supplier

# → 201 with the new record's id in the body`}
      />
      <Callout type="tip">
        You rarely write these URLs by hand. A business object can be consumed as a{" "}
        <strong>data source</strong> that fills a table or form, or wired into an action chain's{" "}
        <K>Call Rest Endpoint</K> step, which lists the object's endpoints in a dropdown.
      </Callout>

      <H2>REST data sources vs business objects</H2>
      <P>
        These concepts are frequently confused. A <strong>business object</strong> is VBCS-owned
        storage with a generated API; a <strong>REST data source</strong> describes an{" "}
        <em>external</em> JSON service as a schema for your pages; a <strong>service
        connection</strong> holds the URL and credentials for that external service.
      </P>
      <DataTable
        headers={["Aspect", "Business Object", "REST Data Source / Service Connection"]}
        rows={[
          ["Storage", "VBCS database (auto-created)", "None — reads external JSON"],
          ["API", "Generated CRUD REST by VBCS", "Uses the remote service's API"],
          ["Typical use", "Drafts, session data, app lookups", "Fusion / OIC / 3rd-party JSON"],
          ["Defined in", "Business Objects tab", "Service Connections tab (schema fetch)"],
        ]}
      />
      <Callout type="warning">
        Do not store your "source of truth" in business objects — VBCS storage is not Fusion, and
        duplicated master data drifts. Keep real data in Fusion (via OIC or REST) and reserve
        business objects for <strong>ephemeral or app-local</strong> state.
      </Callout>

      <H2>Exposing your own REST with business objects</H2>
      <P>
        Because a business object is just a REST API, external consumers — a report server, another
        application, a scheduler — can read and write its data over HTTPS:
      </P>
      <UL>
        <li>
          Control who may call the object from its <strong>Endpoints</strong> settings.
        </li>
        <li>
          Use <K>GET</K> for read-only feeds and <K>POST/PATCH</K> for submission channels such as a
          supplier uploading a quote.
        </li>
        <li>
          Give consumers the full <K>/mobile/custom/&lt;AppID&gt;/businessObjects/…</K> URL served
          from VBCS's own domain.
        </li>
      </UL>

      <H2>Business rules</H2>
      <P>
        A business object can carry <strong>server-side rules</strong> that validate data and react
        to changes. Because they run on the server, they apply no matter how the data arrives —
        through the REST API, a page form, or a script. Three kinds exist:
      </P>
      <DataTable
        headers={["Rule type", "What it does", "Example"]}
        rows={[
          ["Validators (object/field)", "Make sure field or record data is correct", "Credit limit must be ≥ 0; a valid email format"],
          ["Triggers (object/field)", "React to an event — insert, update, delete — with actions", "On insert, timestamp a 'createdBy' field"],
          ["Object functions", "Encapsulate reusable logic on the object", "A function that computes discounted total"],
        ]}
      />
      <Callout type="info">
        Rules can be defined visually (conditions + actions in the trigger designer) or as{" "}
        <strong>Groovy scripts</strong> for more complex logic. Both live on the object, so every
        consumer of the REST API gets the same behavior.
      </Callout>

      <H2>Securing business objects</H2>
      <P>
        By default an object is readable/writable by any user who can access the app. To restrict
        data, enable <strong>role-based security</strong> on the object: you get a matrix of user
        roles × operations (view, create, update, delete) and switch each cell on or off.
      </P>
      <UL>
        <li>
          <strong>Operation-level</strong> — e.g. Viewers can read but not delete; Admins get everything.
        </li>
        <li>
          <strong>Row-level security</strong> — add conditions per operation (via a query builder), such
          as <em>"users can View/Update/Delete only rows they created"</em> — perfect for draft or
          "my records" collections.
        </li>
        <li>
          New roles you add start with all operations <strong>disabled</strong> — you grant rights
          deliberately.
        </li>
      </UL>
      <Callout type="warning">
        Security changes apply only when you <strong>stage or publish</strong> the app. If the app is
        already live, you must create a new version, change settings, and stage/publish again for the
        new matrix to take effect.
      </Callout>

      <H2>Exposing objects to external clients</H2>
      <P>
        External services (Process Automation, OIC, report tools) can read and write your business
        objects through their REST endpoints. VBCS exposes a <strong>catalog API</strong> describing
        every object's endpoints — one per app version (Development, Staging, Live).
      </P>
      <UL>
        <li>
          From the app's <strong>Settings → Business Objects</strong> tab you can copy each URL and,
          under Security, choose to <strong>allow anonymous access</strong> to the Describe endpoint
          or enable basic auth for the object APIs.
        </li>
        <li>
          You can also click <strong>Get Access Token</strong> in the Security pane to obtain a bearer
          token for authenticated API calls from outside VBCS.
        </li>
        <li>
          Anonymous API access still requires an <K>Authorization: Public</K> header on requests —
          VBCS injects it automatically for its own pages; external clients add it manually.
        </li>
      </UL>

      <H2>Modeling objects with the diagrammer</H2>
      <P>
        The <strong>diagrammer</strong> gives you a visual data model: business objects as boxes and
        associations as lines. It is the fastest way to design interdependent objects before you build
        screens.
      </P>
      <UL>
        <li>
          Right-click the canvas → <strong>+ Business Object</strong> to create one; click its{" "}
          <strong>+ Field</strong> to add plain or <strong>formula fields</strong>.
        </li>
        <li>
          Draw <strong>relationships</strong> between objects visually instead of typing association
          names.
        </li>
        <li>
          Select a field to edit its name, type, and properties in the Properties pane.
        </li>
      </UL>

      <H2>Import/export of business objects</H2>
      <P>
        Business objects travel with your application archive: <strong>definitions</strong> always
        export and the schema is recreated on import, but <strong>data</strong> is <em>not</em> moved
        by default — use the object's <K>Export/Import Data</K> action to move rows between
        environments. If dev and stage have drifted, reconcile definitions first; VBCS flags
        differences during import.
      </P>

      <H2>Next steps</H2>
      <UL>
        <li>Wire objects (and Fusion!) up in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/connecting">connecting to Fusion & OIC</a>.</li>
        <li>Render your data on pages with <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/ui">UI components & patterns</a>.</li>
        <li>Understand the underlying model in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/concepts">application & page model</a>.</li>
        <li>See where objects fit in the stack on the <a className="font-semibold text-emerald-300 hover:underline" href="/architecture">architecture page</a>.</li>
      </UL>
    </>
  );
}
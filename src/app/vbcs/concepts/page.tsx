import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "VBCS Application & Page Model",
};

export default function VbcsConceptsPage() {
  return (
    <>
      <PageHeader
        eyebrow="VBCS"
        title="Application & Page Model"
        description="How a VBCS application is assembled from web apps, flows, pages, business objects, service connections, and styles — and why every page is really just a small model of variables, action chains, and components."
        breadcrumbs={[{ label: "VBCS" }, { label: "Concepts" }]}
        updated="February 2025"
      />

      <P>
        An <strong>application</strong> is the top-level unit you export and deploy to other
        environments. Inside it sit <K>web apps</K> and <K>flows</K> (navigation contexts with
        routes and layouts), and under each flow you find the <strong>pages</strong> users actually
        see. Alongside the pages sit the <strong>business objects</strong>,{" "}
        <strong>service connections</strong>, and <strong>styles</strong> those pages depend on.
      </P>

      <Callout type="info">
        You never edit raw files in VBCS. Everything — pages, flows, data objects, styles — lives as{" "}
        <strong>metadata</strong> in the design-time repository and is compiled into an OJET
        application when you publish. That is why the <em>model</em> concepts below matter: they are
        the only things you ever touch.
      </Callout>

      <H2>Application anatomy</H2>
      <P>Picture a VBCS application as buckets hanging off one exportable unit:</P>
      <Diagram title="What makes up a VBCS application" className="mb-8">
        <DiagramNode tone="vbcs" title="Application" subtitle="the exportable, deployable unit" />
        <Arrow />
        <DiagramNode tone="vbcs" title="Web Apps / Flows" subtitle="navigation, layouts, routes" />
        <Arrow />
        <DiagramNode tone="vbcs" title="Pages" subtitle="variables + action chains + components" />
        <Arrow />
        <DiagramNode tone="neutral" title="Business Objects & Service Connections" subtitle="the data the pages render" />
        <Arrow />
        <DiagramNode tone="neutral" title="Styles" subtitle="themes, skins, responsive rules" />
      </Diagram>
      <UL>
        <li>
          <strong>Web apps & flows</strong> define how users move around — each flow carries its own
          start page, navigation tabs, and layout templates.
        </li>
        <li>
          <strong>Pages</strong> are the leaf renderables: the actual UI the end user interacts
          with.
        </li>
        <li>
          <strong>Business objects</strong> give you database-backed data with a generated REST API,
          useful for local or draft data.
        </li>
        <li>
          <strong>Service connections</strong> point at external endpoints (Fusion, OIC, third
          parties) with their credentials attached.
        </li>
        <li>
          <strong>Styles</strong> (application- or flow-level themes) control fonts, colors, and
          spacing across every page that uses them.
        </li>
      </UL>

      <H2>The page model</H2>
      <P>
        Every VBCS page has three parts, and everything you do in the designer touches one of them:
      </P>
      <UL>
        <li>
          <strong>Variables</strong> — the page's working memory. A variable has a type (string,
          number, object, array…), a scope, and a default value. The list of POs in your table is a
          variable.
        </li>
        <li>
          <strong>Action chains</strong> — the page's logic as an ordered sequence of steps triggered
          by an event ("when the button is clicked, call the endpoint, assign the result, show a
          toast").
        </li>
        <li>
          <strong>Components</strong> — the visible OJET widgets (tables, buttons, charts) whose
          properties are <em>bound</em> to variables.
        </li>
      </UL>
      <Callout type="tip">
        <strong>Binding</strong> is the core idea: instead of writing{" "}
        <K>{"document.getElementById('x').textContent = ..."}</K>, you point a component property at
        a variable with a double-mustache expression such as <K>{`{{ $variables.orders }}`}</K>. When
        the variable changes, every bound component updates automatically. "All UI is data."
      </Callout>
      <Diagram title="The three parts of a page" className="mb-8">
        <DiagramNode tone="accent" title="Components" subtitle="tables, forms, charts (bound to $variables)" />
        <Arrow label="read / write" />
        <DiagramNode tone="vbcs" title="Variables" subtitle="page state: strings, arrays, objects" />
        <Arrow label="events + setters" />
        <DiagramNode tone="accent" title="Action Chains" subtitle="if, call, assign, for-each, navigate" />
      </Diagram>

      <H2>Variables in depth</H2>
      <P>
        Variables are typed — the type decides how VBCS renders them in forms and tables and how it
        converts values on assignment:
      </P>
      <DataTable
        headers={["Type", "Holds", "Typical use"]}
        rows={[
          ["Any", "Whatever you assign (untyped)", "Generic scratch buckets while designing"],
          ["String <K key='v-str'>string</K>", "Text; dates as ISO strings", "Labels, input fields, ids"],
          ["Number <K key='v-num'>number</K>", "Numeric values", "Quantities, totals"],
          ["Boolean <K key='v-bool'>boolean</K>", "true / false", "Flags that flip visibility"],
          ["Object <K key='v-obj'>object</K>", "A single structured record", "One form row, one API response"],
          ["Array <K key='v-arr'>array</K>", "A list (optionally of a typed item shape)", "Rows feeding a table or list view"],
          ["Date <K key='v-date'>date</K>", "Temporal values", "Date pickers, time ranges"],
        ]}
      />
      <H3>Scope</H3>
      <P>
        A variable can live at <strong>page scope</strong>, <strong>flow scope</strong> (shared by
        every page in the flow), or <strong>application scope</strong>. Narrower scope wins when
        names collide; use application scope sparingly — it is effectively global state.
      </P>
      <H3>Business-object variables</H3>
      <P>
        When data comes from a <strong>business object</strong> (rather than an external REST
        service), the variable that holds its rows or a selected record is still just a page, flow,
        or application variable — but VBCS models it specially: a <strong>data provider</strong> or
        REST data source binds directly to the object's generated endpoint, so the variable tracks
        the record set, and per-row actions receive the selected object. This is the same variable
        machinery seen above, wired to a business object instead of a hand-built JSON call (see{" "}
        <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/business-objects">
          business objects &amp; REST
        </a>
        ).
      </P>
      <H3>Array and object shape</H3>
      <P>
        An array variable can declare an item shape so every element looks alike; when VBCS calls a
        REST endpoint it maps the JSON response onto that shape:
      </P>
      <CodeBlock
        language="json"
        filename="orders variable value (array of order objects)"
        code={`{
  "orders": [
    { "id": 1001, "supplier": "Acme GmbH", "amount": 1240.5, "currency": "EUR", "status": "OPEN" },
    { "id": 1002, "supplier": "Beta S.p.A.", "amount": 89.0, "currency": "EUR", "status": "PENDING" }
  ]
}`}
      />

      <H2>Action chains</H2>
      <P>
        An <strong>action chain</strong> is a named sequence of steps launched by an{" "}
        <strong>event</strong>: the page <K>onLoad</K> event, a <K>uiAction</K> from a component
        (button click, table selection), or a <K>timer</K>. Inside a chain you read variables as{" "}
        <K>{`$variables.orders`}</K> and write them via generated getter/setters like{" "}
        <K>{`$page.variables.orders = response.body.orders`}</K>.
      </P>
      <DataTable
        headers={["Action", "Purpose"]}
        rows={[
          ["Call Rest Endpoint", "Invoke a service connection; put the response into a variable"],
          ["Assign Variable", "Set a variable from an expression or another variable"],
          ["For Each", "Loop over an array and act per item (e.g. call a child endpoint)"],
          ["If / Switch", "Branch the chain on a condition or a value"],
          ["Fire Event", "Trigger another action chain or page event"],
          ["Navigate", "Move to another page or flow, carrying parameters"],
          ["Reset", "Restore variable(s) to defaults (e.g. clear a form)"],
          ["Notification", "Show a toast or banner to the user"],
        ]}
      />
      <Callout type="note">
        Chains are synchronous by default; mark an invocation <strong>asynchronous</strong>, or wrap
        part of a chain in a <K>Promise</K> <strong>When</strong> action, for parallel calls. For
        long-running work, prefer calling OIC and showing a "processing" state.
      </Callout>

      <H2>Fragments</H2>
      <P>
        A <strong>fragment</strong> is a reusable page subset — a header, an address card, a tabular
        list — saved once and dropped into many pages. <strong>Template fragments</strong> declare{" "}
        <K>input variables</K>: the caller binds its input to an expression like{" "}
        <K>{`{{ $page.variables.selectedAddress }}`}</K>, and the fragment re-renders when it
        changes. <strong>Inline fragments</strong> are copied in at design time and edited
        independently. Because a fragment is just another page model element, it can carry its own
        action chains and fire events back to the hosting page.
      </P>

      <H2>Endpoints & service connections overview</H2>
      <P>
        Pages rarely own data; they fetch it. <strong>Service connections</strong> wrap an external
        REST endpoint with its URL and authentication (basic, OAuth, or SSO) and expose a friendly
        invoke-REST action plus <strong>data providers</strong> that feed tables and list views with
        lazy-loaded rows. Fusion, OIC, process tasks, and your own business objects all appear
        through the same mechanism — which is why <em>connectivity</em> deserves its own page.
      </P>

      <H2>Next steps</H2>
      <UL>
        <li>See how VBCS turns objects into REST in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/business-objects">business objects & REST</a>.</li>
        <li>Point your pages at real systems in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/connecting">connecting to Fusion & OIC</a>.</li>
        <li>Learn what to place on those pages in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/ui">UI components & patterns</a>.</li>
        <li>Brush up the platform in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/overview">the VBCS overview</a>.</li>
      </UL>
    </>
  );
}
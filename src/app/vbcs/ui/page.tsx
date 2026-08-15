import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "VBCS UI Components & Patterns",
};

export default function VbcsUiPage() {
  return (
    <>
      <PageHeader
        eyebrow="VBCS"
        title="UI Components & Patterns"
        description="The VBCS canvas gives you Oracle JET (OJET) widgets out of the box. This page covers the component catalog, how to structure pages, and the binding patterns that keep your UI in sync with variables."
        breadcrumbs={[{ label: "VBCS" }, { label: "UI" }]}
        updated="February 2025"
      />

      <P>
        Everything you place on the VBCS canvas is an <strong>Oracle JET (OJET)</strong> component —
        the same widgets that power Fusion's own interfaces. That means accessibility,
        theming, and enterprise look-and-feel come free; your job is to pick the right widget, bind
        it to a variable, and wire up the action chain behind it.
      </P>

      <Callout type="info">
        The canvas reads like simple HTML: you <K>drag a component</K>, set its properties, and its
        bindings appear as expressions such as <K>{`{{ $variables.orders }}`}</K>. VBCS compiles
        this into OJET/Knockout code for you — the designer is the code.
      </Callout>

      <H2>What you get on the canvas</H2>
      <P>
        The common palette covers most business screens. Values flow into components through{" "}
        <strong>data binding</strong> (item/text/selected = a variable or expression) rather than
        imperative code.
      </P>
      <DataTable
        headers={["Component", "Purpose", "Key bound property"]}
        rows={[
          ["Table <K key='ui-table'>Table</K>", "Tabular data with sorting, paging, row selection", "data = a data provider or array"],
          ["List View", "Card or list rendering of items", "data + OJET template per card"],
          ["Form Layout", "Grid of label + field pairs", "fields bound to an object variable"],
          ["Input Text / Number", "Single-value entry", "value = variable"],
          ["Select / Combobox", "Pick one from options", "options + value"],
          ["Button", "Trigger an action chain", "uiAction event binding"],
          ["Chart", "Bar/line/pie visual summaries", "data = series array"],
          ["Tabs", "Split content into panels", "content = per-tab fragment or region"],
          ["Dialog", "Modal overlays (confirm, edit)", "open flag variable"],
          ["Dropdown / Menu", "Compact navigation of actions", "click → uiAction"],
        ]}
      />
      <Callout type="tip">
        Start with the <strong>Form + Create Page pattern</strong>: a Table bound to your data, an
        Add button that opens a Dialog with a Form Layout, and an action chain that calls the REST
        endpoint and refreshes the table. It covers 80% of commerce use cases.
      </Callout>

      <H2>Design page structure</H2>
      <P>
        Every page has a content region you fill with <strong>rows and columns</strong>. Use page's
        <strong> structure</strong> pane to organize:
      </P>
      <UL>
        <li>
          <strong>Layout components</strong> — Columns, Flex, Grid, and Responsive containers hold
          the visible widgets.
        </li>
        <li>
          <strong>Regions</strong> — sticky header/footer bands (page title, action bar, filters)
          that stay put while content scrolls.
        </li>
        <li>
          <strong>Responsive behavior</strong> — columns declare breakpoints (small/medium/large) so
          a 3-column dashboard collapses to a single column on a phone.
        </li>
      </UL>
      <Diagram title="Typical page skeleton" className="mb-8">
        <DiagramNode tone="neutral" title="Header region" subtitle="title + global actions" />
        <Arrow />
        <DiagramNode tone="neutral" title="Filter / toolbar region" subtitle="search, status select" />
        <Arrow />
        <DiagramNode tone="neutral" title="Content grid" subtitle="table / forms / charts, responsive" />
        <Arrow />
        <DiagramNode tone="neutral" title="Footer region" subtitle="paging, save / cancel" />
      </Diagram>

      <H2>Binding components to variables</H2>
      <P>
        Binding is the double-mustache <K>{"{{ … }}"}</K> expression syntax. Any component property —
        text, value, items, enabled — can be an expression that resolves against page scope:
      </P>
      <UL>
        <li>
          <K>{`{{ $variables.orders }}`}</K> — bind a list to a Table/List View's <K>data</K>.
        </li>
        <li>
          <K>{`{{ $variables.selectedOrder.supplier }}`}</K> — display a field of the selected row.
        </li>
        <li>
          <K>{`{{ $variables.loading ? true : false }}`}</K> — drive a spinner's visibility.
        </li>
      </UL>
      <P>
        A Table's data comes from a variable populated by an action chain. Raw JSON from your
        service connection mapped onto a page variable might look like this:
      </P>
      <CodeBlock
        language="json"
        filename="orders array bound to a Table's data"
        code={`[
  { "orderNumber": "SO-1000", "supplier": "Acme GmbH", "amount": 1240.5, "currency": "EUR", "status": "OPEN" },
  { "orderNumber": "SO-1001", "supplier": "Beta S.p.A.", "amount": 89.0,  "currency": "EUR", "status": "PENDING" },
  { "orderNumber": "SO-1002", "supplier": "Gamma AB",   "amount": 512.75, "currency": "SEK", "status": "APPROVED" }
]`}
      />
      <Callout type="info">
        Because bindings are <strong>reactive</strong>, you never "refresh the UI." Assign a new
        value to <K>{`$variables.orders`}</K> in an action chain and every column, every derived
        expression, and every chart bound to it updates in the same tick.
      </Callout>

      <H2>Data providers & quota</H2>
      <P>
        Instead of fetching everything into a variable, bind big lists to a{" "}
        <strong>data provider</strong>: an object that fetches rows on demand from a service
        connection and pages them automatically.
      </P>
      <UL>
        <li>
          Drag a <strong>REST data provider</strong> onto the page and point it at a connection
          operation (e.g. Fusion <K>GET /suppliers</K>).
        </li>
        <li>
          The Table uses <K>data = [[$page.dataProviders.supplierDP]]</K>; scrolling or the pager
          triggers lazy fetches.
        </li>
        <li>
          Fine-tune with <K>limit</K>/<K>offset</K> parameters, and re-query via the provider's{" "}
          <K>refresh()</K> action after a create/update.
        </li>
      </UL>
      <Callout type="note">
        Watch your VBCS <strong>quota</strong> — page size caps and the number of fetch requests
        count against your service limits. Keep page sizes modest and avoid refreshing full lists in
        tight loops.
      </Callout>

      <H2>Validations & forms</H2>
      <P>
        Form fields declare validation like any other binding: mark inputs{" "}
        <strong>required</strong>, add <K>pattern</K>, <K>min/max</K>, and <K>maxLength</K>{" "}
        constraints, and give each field a message. Validation and <strong>disabled</strong> states
        are driven by variables — <K>{`{{ $variables.formValid }}`}</K> gates the Submit button,{" "}
        <K>{`{{ $variables.readOnly }}`}</K> locks every field while an operation runs — and on submit
        an action chain <K>Call Rest Endpoint</K>s, checks the response, and shows a toast or
        navigates away.
      </P>

      <H2>Notifications & UX patterns</H2>
      <P>
        A handful of patterns keep the UI feeling alive without any custom JavaScript:
      </P>
      <DataTable
        headers={["Pattern", "How to ship it", "When to use"]}
        rows={[
          ["Toast / notification", "Notification action in the chain (type: info/success/error)", "After save, delete, or failed call"],
          ["Loading indicator", "Spin/spinner component bound to a $variables.loading flag", "While a slow REST endpoint runs"],
          ["Empty state", "Conditional region: show message when list length is 0", "Tables with no rows yet"],
          ["Confirm dialog", "Dialog opened before destructive actions", "Delete row, discard draft"],
          ["Disabled during save", "formValid + submitting flag gates the button", "Prevent double-submits"],
        ]}
      />

      <H2>Next steps</H2>
      <UL>
        <li>Feed your widgets real data via <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/connecting">connecting to Fusion & OIC</a>.</li>
        <li>Model the state you bind to in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/concepts">application & page model</a>.</li>
        <li>Keep the app secure as it grows in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/security">security & roles</a>.</li>
      </UL>
    </>
  );
}
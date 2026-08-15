import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "VBCS Advanced: JavaScript & Quick Starts",
};

export default function VbcsAdvancedPage() {
  return (
    <>
      <PageHeader
        eyebrow="VBCS"
        title="Advanced: JavaScript, Quick Starts & custom code"
        description="When the visual designer is not enough, VBCS lets you drop in your own logic. This page covers custom JavaScript functions, importing third-party libraries, and the Quick Starts wizards that scaffold common page behavior in seconds."
        breadcrumbs={[{ label: "VBCS" }, { label: "Advanced Techniques" }]}
        updated="February 2025"
        level="Advanced"
      />

      <P>
        VBCS is low-code, but not "no-code." At some point you need a JavaScript function to
        transform a value, validate a form, or load a library — and you want the boring scaffolding
        (variables, types, action chains) built for you. Both are first-class: custom functions for
        the logic, Quick Starts for the wiring.
      </P>

      <H2>JavaScript functions</H2>
      <P>
        A JavaScript function is a reusable block of logic you define once and call from action
        chains, component bindings, or other functions. Define it in the code editor, then assign it
        where the visual designer reaches its limit.
      </P>
      <UL>
        <li>
          <strong>Validation</strong> — check required fields or formats before a save.
        </li>
        <li>
          <strong>Calculation</strong> — compute totals, discounts, or concatenated labels.
        </li>
        <li>
          <strong>Transformation</strong> — reshape an object before it hits a service connection.
        </li>
      </UL>
      <CodeBlock
        language="javascript"
        filename="custom-function.js"
        code={`/**
 * Compute an order total including tax.
 * Called from an action chain: callFunction "computeTotal"
 */
function computeTotal(lines) {
  const subtotal = lines.reduce((sum, line) => sum + (line.qty * line.price), 0);
  const tax = subtotal * 0.10;
  return { subtotal: subtotal, tax: tax, total: subtotal + tax };
}
module.exports = { computeTotal: computeTotal };`}
      />

      <H2>Where modules scope your functions</H2>
      <P>
        Functions live in <strong>modules</strong>, and the module decides where they are visible:
      </P>
      <DataTable
        headers={["Module", "Scope", "Use it when…"]}
        rows={[
          ["PageModule", "One page only", "Load data on page load, page-specific validation"],
          ["FlowModule", "All pages in a flow", "Shared helpers across a multi-page process"],
          ["AppModule", "The whole application", "Reusable functions any page can call"],
          ["FragmentModule / LayoutModule", "Within that fragment/layout only", "Self-contained reusable components"],
        ]}
      />
      <Callout type="tip">
        Put truly reused logic at the <K>AppModule</K> level. Defining the same function in several
        pages guarantees they drift apart after the first edit.
      </Callout>

      <H2>Third-party libraries</H2>
      <P>
        You can import and reference third-party JavaScript libraries — functions, objects, and
        variables you want in your custom code. VB Studio also supports <K>RequireJS</K>, a module
        loader that simplifies managing library references.
      </P>
      <UL>
        <li>Import the library as an app artifact, then reference it from your functions.</li>
        <li>Use RequireJS statements to pull libraries in cleanly.</li>
      </UL>
      <Callout type="danger">
        JavaScript runs on the <strong>client</strong>. Never hard-code credentials, certificates,
        or secrets in custom functions — once it is in browser code, it is exposed. Follow secure
        coding standards; keep secrets in service connections and OCI secrets, not in the page.
      </Callout>

      <H2>Quick Starts — build the scaffolding fast</H2>
      <P>
        A <strong>Quick Start</strong> is a wizard that builds complex behavior for you. It lives in
        the <strong>Quick Starts tab</strong> of a component's Properties pane, and it wires what
        would otherwise take many manual steps: variables, types, action chains, and page events.
      </P>
      <DataTable
        headers={["Quick Start", "What it scaffolds", "Typical next step"]}
        rows={[
          ["Add Data", "Binds a table/list to an endpoint (GET MANY)", "Select which fields to display; add the create form"],
          ["Add Create Page", "A page to create new records from a form", "Wire the save action to POST"],
          ["Add Edit Page", "A page to update an existing record", "Add validation via a custom function"],
          ["Add Delete", "Delete action wired to DELETE", "Confirm dialog before delete"],
          ["List Creation / Detail Navigation", "Master-detail: selecting a row opens its detail", "Pass the selected row's id"],
        ]}
      />
      <Callout type="info">
        A Quick Start often depends on the one before it — for example, <em>Add Data</em> must run
        before the create/edit/detail quick starts become available. If your endpoint isn't listed,
        use the <strong>Manual Setup of Endpoint</strong> icon in the wizard to configure it directly.
      </Callout>

      <Callout type="tip">
        When you customize a quick start's fields after the fact, you may need to re-edit the{" "}
        <strong>type</strong> (Edit From Endpoint on the Types tab) and the UI. For major changes it
        is often simpler to delete the component and re-run the quick start.
      </Callout>

      <H2>Custom code beyond the editor</H2>
      <UL>
        <li>
          <strong>Web components</strong> — bring your own component or a third-party web component
          and use it on the page like a native component.
        </li>
        <li>
          <strong>Groovy on business objects</strong> — complex server-side logic lives in business
          object rules/triggers, not in page JavaScript (see{" "}
          <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/business-objects">
            business objects
          </a>
          ).
        </li>
        <li>
          <strong>RequireJS modules</strong> — manage library references explicitly when your app
          grows past a handful of imports.
        </li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Use the functions with data in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/ui">UI components & patterns</a>.</li>
        <li>Model the object your functions manipulate in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/business-objects">business objects</a>.</li>
        <li>Ship the custom code responsibly in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/deploy">deployment & lifecycle</a>.</li>
      </UL>
    </>
  );
}
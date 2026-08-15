import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "Flexfields & Value Sets",
};

export default function FlexfieldsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="Flexfields & Value Sets"
        description="Flexfields are Fusion's configurable data structures. The chart of accounts is one, and every 'extra field' on a form is another. Value sets define what values those fields accept. You can't understand an account combination or a custom field without them."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "Flexfields & Value Sets" }]}
        updated="February 2025"
      />

      <H2>The three kinds of flexfield</H2>
      <DataTable
        headers={["Type", "Purpose", "Example"]}
        rows={[
          ["Key Flexfield (KFF)", "A structured identifier made of segments", "Chart of accounts: Company.Department.Account.Subaccount"],
          ["Descriptive Flexfield (DFF)", "Extra fields attached to a form or object", "A 'Project Code' field on the supplier form"],
          ["Extensible Flexfield (EFF)", "Drillable, context-driven attributes (analytical)", "Product attributes in SCM or Financials"],
        ]}
      />

      <H2>Value sets</H2>
      <P>
        A <strong>value set</strong> defines the valid values (and their meaning) for a flexfield
        segment or a descriptive attribute.
      </P>
      <DataTable
        headers={["Value set type", "How values are defined"]}
        rows={[
          ["Independent", "A fixed list of values you define"],
          ["Dependent", "Values filtered by a parent independent value (e.g. states per country)"],
          ["Table", "Values come from a database table/view"],
          ["Translatable independent", "An independent list translated per language"],
          ["None", "Any value is allowed (validation only)"],
        ]}
      />

      <H2>Chart of accounts as a KFF</H2>
      <P>
        The COA is a Key Flexfield. Its segments are <strong>account combinations</strong>, and each
        segment uses a value set. Three behaviors decide whether an account is valid:
      </P>
      <UL>
        <li><strong>Segment qualifiers</strong> — mark which segment is the natural account (drives account type, revaluation).</li>
        <li><strong>Cross-validation rules</strong> — allow/deny specific segment combinations (e.g. R&D dept can't use Cash accounts).</li>
        <li><strong>Segment value security</strong> — who can enter/see which values (data-level control).</li>
      </UL>

      <H2>Technical view</H2>
      <UL>
        <li>Flexfield metadata is configurable via REST (<K>commonValueSets</K>, flexfield resources) — read it to discover valid values at runtime.</li>
        <li>FBDI templates and imports use value sets too: a lookup value must exist before a load accepts it.</li>
        <li>Tables: value sets live in the <K>FND_FLEX_VALIDATION_SETS</K>/<K>FND_FLEX_VALUES</K> family; KFF structures in <K>FND_ID_FLEX_STRUCTURES_B</K> — data-dictionary names, confirm per release.</li>
      </UL>

      <H2>SQL — find a valid value</H2>
      <CodeBlock
        language="sql"
        filename="flex_values.sql"
        code={`-- Values for a value set (e.g. the natural account segment)
SELECT fv.flex_value, fv.description,
       fv.enabled_flag, fv.start_date_active, fv.end_date_active
FROM   fnd_flex_values fv
WHERE  fv.flex_value_set_id = :value_set_id
  AND  fv.enabled_flag = 'Y'
ORDER BY fv.flex_value;`}
      />
      <Callout type="info">
        In practice, discovery is easier via the REST metadata (<K>commonValueSets</K> resource)
        than raw tables. Use SQL only when you have explicit data-access approval.
      </Callout>

      <H2>Integration notes</H2>
      <UL>
        <li>An invalid account combination is the #1 FBDI rejection — validate segments before loading.</li>
        <li>When a UI shows a value a load rejected, check the value set, not the data file.</li>
        <li>Cross-validation rules break bulk loads that create new combinations — pre-create combinations.</li>
      </UL>

      <H2>Next steps</H2>
      <UL>
        <li>Ledgers use the COA: <a className="font-semibold text-accent hover:underline" href="/fusion/enterprise-structures">Enterprise Structures</a>.</li>
        <li>Invalid accounts are a top error: <a className="font-semibold text-accent hover:underline" href="/troubleshooting/fbdi">FBDI errors</a>.</li>
      </UL>
    </>
  );
}
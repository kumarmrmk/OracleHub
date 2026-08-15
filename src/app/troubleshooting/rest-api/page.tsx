import PageHeader, { H2, H3, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "REST API Errors",
};

export default function RestApiErrorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Troubleshooting & Errors"
        title="REST API errors"
        description="Every REST failure is an HTTP status code plus an error body. Learn what the codes mean, how to read the body, and the five headers/details that cause most API problems."
        breadcrumbs={[{ label: "Troubleshooting & Errors" }, { label: "REST API Errors" }]}
        updated="February 2025"
      />

      <H2>Reading the error body</H2>
      <P>
        Fusion REST errors return a structured body. Always read <K>title</K> and{" "}
        <K>detail</K> first — they are the human explanation. Additional hints arrive in{" "}
        <K>o:errorDetails</K> or the <K>message</K> field.
      </P>
      <CodeBlock
        language="json"
        filename="error-body.json"
        code={`{
  "type": "http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html",
  "title": "Resource not found",
  "status": 404,
  "o:errorCode": "404-ABC-1001",
  "detail": "No resource exists for path ...",
  "o:errorDetails": [{ "detail": "A more specific hint from the engine" }]
}`}
      />

      <H2>HTTP status codes</H2>
      <DataTable
        headers={["Code", "Meaning", "What to check"]}
        rows={[
          ["400", "Bad request — the payload is malformed", "Field names, data types, required fields, JSON syntax"],
          ["401", "Unauthenticated", "Username/password or OAuth token validity"],
          ["403", "Authenticated but not allowed", "Role/duty grants the REST service (sign-on + data security)"],
          ["404", "Resource or path not found", "Resource name, record ID, environment path"],
          ["409", "Conflict", "ETag/If-Match mismatch, duplicate key, version conflict"],
          ["422 / 500", "Business validation error / server error", "Check the detail; for 500 look in the app/ESS logs"],
          ["503", "Service unavailable", "Maintenance window, environment down"],
        ]}
      />

      <H2>Top causes & fixes</H2>
      <DataTable
        headers={["Symptom", "Cause", "Fix"]}
        rows={[
          ["401 on every call", "Wrong credentials or expired OAuth token", "Verify user/password or refresh the token"],
          ["403 despite valid credentials", "Role lacks the REST service or a record's data access", "Grant the duty/data security to the user"],
          ["404 for a record that exists", "Wrong resource path or the ID belongs to a different resource", "Confirm the resource path and the correct identifier"],
          ["400 'field not recognized'", "Field name differs by release or resource version", "Check the resource metadata (GET on the resource)"],
          ["409 on update", "Stale ETag — someone changed the record", "GET again, then retry with the fresh If-Match"],
          ["Missing REST-Framework-Version header", "Old/unsupported default behavior", "Send a valid REST-Framework-Version header"],
          ["Pagination surprises", "Limit/offset not set or exceeded", "Use the limit/offset/orderBy/totalResults conventions"],
          ["Integration works in UI but not API", "The UI uses a different underlying resource", "Find the API resource that exposes the same data"],
        ]}
      />

      <H2>OAuth & header checklist</H2>
      <UL>
        <li>Authenticate: username/password or OAuth 2.0 client credentials for integrations.</li>
        <li>Always send <K>REST-Framework-Version</K> (e.g. <K>11.13.18.05</K>) — it pins the resource behavior.</li>
        <li>Set <K>Content-Type: application/json</K> for writes, <K>Accept: application/json</K> for reads.</li>
        <li>For updates, GET the current ETag and send it as <K>If-Match</K>.</li>
        <li>Check fields via a <K>GET</K> of the resource's metadata before posting.</li>
      </UL>

      <H2>Prevention checklist</H2>
      <UL>
        <li>Test the call against a sandbox with the exact fields you'll use.</li>
        <li>Log the full request and response for the first failure of every flow.</li>
        <li>Poll for status with retries and backoff for async endpoints.</li>
      </UL>

      <Callout type="info">
        For real-time API work from OIC, also see <a className="font-semibold text-accent hover:underline" href="/oic/rest">REST in OIC</a> and{" "}
        <a className="font-semibold text-accent hover:underline" href="/oic/errors">OIC error handling</a>.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Back to the <a className="font-semibold text-accent hover:underline" href="/troubleshooting">Troubleshooting hub</a>.</li>
        <li>The calls themselves: <a className="font-semibold text-accent hover:underline" href="/fusion/rest-api">REST API Fundamentals</a>.</li>
      </UL>
    </>
  );
}
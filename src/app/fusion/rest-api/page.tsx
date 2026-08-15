import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";

import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "REST API Fundamentals",
};

export default function FusionRestApiPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Fusion Cloud"
        title="REST API Fundamentals"
        description="Every Fusion module exposes a consistent REST API built on the Oracle Application Development Framework (ADF). Learn the resource model, the mandatory REST-Framework-Version header, CRUD semantics, pagination, and the response envelope — and you can talk to any module."
        breadcrumbs={[{ label: "Fusion Cloud" }, { label: "REST API Fundamentals" }]}
        updated="February 2025"
      />

      <P>
        Fusion REST is the first pillar of integration: <strong>synchronous, request-response</strong>{" "}
        calls for reading and writing individual records or small sets. Unlike the database (which is
        forbidden) or FBDI (which is batch), REST is where you do the day-to-day work: look up a
        supplier, create a customer, update a PO line, read an invoice.
      </P>

      <H2>Resource model</H2>
      <P>
        Each module exposes a named set of <strong>REST resources</strong>, each with{" "}
        <strong>child resources</strong> for related records. A resource is addressable as a{" "}
        <strong>collection</strong> (many records) or an <strong>item</strong> (one record). The URL
        shape is consistent everywhere:
      </P>
      <CodeBlock
        language="text"
        filename="Resource URL anatomy"
        code={`{base}/{moduleApi}/resources/{version}/{resourceCollection}/{?.{resourceItem}}

https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/suppliers
                                                                    ^collection
https://<instance>.oraclecloud.com/fscmRestApi/resources/11.13.18.05/suppliers/300100220012345
                                                                    ^item (SupplierId)
.../suppliers/{SupplierId}/child/sites
                                                                    ^child collection`}
      />
      <UL>
        <li>
          <strong>base</strong> — your service instance, e.g.{" "}
          <K>https://yourinstance.oraclecloud.com</K>.
        </li>
        <li>
          <strong>moduleApi</strong> — <K>fscmRestApi</K> (ERP/SCM), <K>hcmRestApi</K> (HCM),{" "}
          <K>crmRestApi</K> (CX).
        </li>
        <li>
          <strong>version</strong> — a release, e.g. <K>11.13.18.05</K>. You must match it with the{" "}
          <K>REST-Framework-Version</K> header.
        </li>
        <li>
          <strong>resource</strong> — the business object, e.g. <K>suppliers</K>,{" "}
          <K>invoices</K>, <K>persons</K>, <K>opportunities</K>.
        </li>
      </UL>
      <Callout type="warning">
        The <K>REST-Framework-Version</K> header is <strong>mandatory on every request</strong>.
        Omit it and you get an error; mismatch it with the URL version and the API may behave
        differently than you expect.
      </Callout>

      <H2>Reading data</H2>
      <P>
        The most common operation is a GET on a collection with query parameters to filter, shape,
        and paginate the payload:
      </P>
      <DataTable
        headers={["Parameter", "What it does", "Example"]}
        rows={[
          ["limit", "Max records in this page", "limit=50"],
          ["offset", "Skip N records (paging)", "offset=50 (page 2)"],
          ["expand", "Include child collections", "expand=lines"],
          ["onlyData", "Return bare data, no metadata envelope", "onlyData=true"],
          ["totalResults", "Include the total record count", "totalResults=true"],
          ["q", "Query string filter (operator-based)", "q=Status='OPEN'"],
          ["orderBy", "Sort the results", "orderBy=LastUpdateDate"],
          ["finders", "Named, pre-built queries by key name", "limit=2&finder=NameFinder;SupplierName=\"ACME\""],
        ]}
      />
      <CodeBlock
        language="bash"
        filename="GET a filtered, paginated supplier collection"
        code={`curl -u "username:password" \\
  "https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/suppliers?q=SupplierName='ACME%'&limit=20&offset=0&totalResults=true" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />
      <P>
        To read one record you address the item directly and pass the primary key in the URL path.{" "}
        <strong>Finders</strong> are the alternative to ad-hoc <K>q</K> filters: Fusion ships dozens
        of named queries (e.g. <K>NameFinder</K>) that are faster and match what the UI uses.
      </P>
      <CodeBlock
        language="bash"
        filename="GET one supplier item"
        code={`curl -u "username:password" \\
  "https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/suppliers/300100220012345?onlyData=true" \\
  -H "REST-Framework-Version: 11.13.18.05"`}
      />

      <H2>Writing data</H2>
      <P>
        Fusion REST follows standard HTTP verbs, with one nuance on PATCH vs PUT:
      </P>
      <DataTable
        headers={["Verb", "Semantics", "Body type", "Typical use"]}
        rows={[
          ["POST", "Create a record in a collection", "singular resource JSON", "Create a supplier, invoice, or person"],
          ["PATCH", "Partial update of an item", "singular JSON with only changed fields", "Update one attribute without clobbering others"],
          ["PUT", "Full replace of an item", "complete resource JSON", "Rarely used; PATCH is preferred"],
          ["DELETE", "Remove an item (may be disabled per object)", "none", "Cleanup in test environments"],
        ]}
      />
      <P>
        Writes use <strong>optimistic locking</strong> to avoid lost updates: read the{" "}
        <K>ETag</K> / <K>If-Match-Token</K> from a GET, then send it back in the{" "}
        <K>If-Match</K> header on PATCH/DELETE. If the record changed since you read it, Fusion
        rejects the write so you can decide what to do — rather than silently overwriting a
        colleague's edit.
      </P>
      <CodeBlock
        language="bash"
        filename="POST to create a supplier"
        code={`curl -u "username:password" \\
  -X POST \\
  "https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/suppliers" \\
  -H "Content-Type: application/vnd.oracle.resource+json; type=singular" \\
  -H "REST-Framework-Version: 11.13.18.05" \\
  -d '{
    "SupplierName": "Acme GmbH",
    "SupplierNumber": "SUP-10023",
    "Addresses": [
      { "Address1": "Industriestr. 7", "City": "Berlin", "Country": "DE" }
    ]
  }'`}
      />

      <H2>REST-Framework-Version</H2>
      <P>
        This custom header is Fusion's backward-compatibility contract. It tells the service which
        release behavior you expect: field sets, validation rules, and payload shapes for that
        version. Because the header and the URL version must agree, Oracle recommends you treat the
        version as a <strong>per-integration constant</strong> you configure once (environment
        variable / connection property) rather than hard-coding it per request.
      </P>
      <Callout type="tip">
        When you upgrade the PPM (patch-period maintenance) that changes the available version, you
        update the header in one place and re-test — the API surface for the old version keeps
        working in the meantime.
      </Callout>

      <H2>Pagination</H2>
      <P>
        Collections never return "everything." A GET returns one <strong>page</strong> and a metadata
        envelope describing where you are. The two fields that matter for looping are{" "}
        <K>totalResults</K> (only present if you ask with <K>totalResults=true</K>) and{" "}
        <K>hasMore</K> / the <K>links</K> (next page) block.
      </P>
      <P>
        The canonical bulk-read pattern in OIC and VBCS looks like this:
      </P>
      <CodeBlock
        language="text"
        filename="Paged read loop (pseudocode)"
        code={`offset = 0;  pageSize = 100
loop:
  GET /resources/{version}/{resource}?limit=pageSize&offset=offset&totalResults=true
  process(page.items)
  if page.hasMore == false → stop
  offset += pageSize`}
      />
      <P>
        For very large extracts (tens of thousands of records) also set{" "}
        <K>onlyData=true</K> to strip the envelope from every item, and consider whether the job is
        better done as an FBDI pull or a BIP report streamed to file.
      </P>

      <H2>Authentication &amp; authorization</H2>
      <P>
        Fusion REST accepts several authentication styles depending on where the caller lives:
      </P>
      <UL>
        <li>
          <strong>Basic auth</strong> — username and password over HTTPS. Simple; used by many
          integrations, but exposes a long-lived credential on every call.
        </li>
        <li>
          <strong>OAuth 2.0 client credentials</strong> — an access token minted from IDCS / OCI IAM.
          Tokens expire; recommended for OIC and VBCS service connections.
        </li>
        <li>
          <strong>Message protection</strong> — WS-Security-style signing used mostly with SOAP or
          with systems that can maintain certificate-based identity.
        </li>
      </UL>
      <P>
        Authorization is <strong>not</strong> just "is the user real." The caller must hold the right{" "}
        <strong>job roles</strong> AND the data must pass the relevant{" "}
        <strong>data security policies</strong>. In other words: a valid login alone is not enough
        to read every record — the policies that govern rows (for example "only own team records")
        still apply through the API.
      </P>
      <Callout type="warning">
        Never hard-code credentials in source code, connection strings, or browser-side code. Put
        them in OIC connections, OCI Vault/Secrets, or environment settings — and treat any leaked
        credential as compromised. Service accounts whose passwords expire are a top cause of
        "integrations broke at 3am" incidents.
      </Callout>

      <H2>Response envelope</H2>
      <P>
        A collection GET returns a JSON envelope that wraps the actual payload. A sample for{" "}
        <K>suppliers</K>:
      </P>
      <CodeBlock
        language="json"
        filename="Collection response envelope (trimmed)"
        code={`{
  "items": [
    { "SupplierId": 300100220012345, "SupplierName": "Acme GmbH", "links": [ ... ] }
  ],
  "itemsCount": 1,
  "hasMore": false,
  "links": [
    { "rel": "canonical", "href": ".../suppliers" },
    { "rel": "self", "href": ".../suppliers?limit=100" }
  ]
}`}
      />
      <DataTable
        headers={["Field", "Meaning"]}
        rows={[
          ["items", "The array of records in this page"],
          ["itemsCount", "Number of records in this page"],
          ["hasMore", "true if another page exists"],
          ["totalResults", "Overall count (only when totalResults=true is passed)"],
          ["links", "Navigation links (self, canonical, next page, child resources)"],
        ]}
      />
      <Callout type="tip">
        When a payload looks wrong, look at what you <em>didn't</em> ask for: with{" "}
        <K>onlyData=false</K> the envelope is what surprises people. Set{" "}
        <K>onlyData=true</K> on reads where you need the bare array.
      </Callout>

      <H2>Metadata explorer tip</H2>
      <P>
        Point a browser at the base URL —{" "}
        <K>https://yourinstance.oraclecloud.com/fscmRestApi/resources/11.13.18.05/</K> — while
        logged in. Fusion serves an interactive explorer that lists every resource, its fields,
        valid query attributes, sample bodies, and even a live "try it" panel. It is faster and more
        accurate than hunting through PDFs, and it reveals added fields (like custom flexfields)
        that generic documentation never shows.
      </P>

      <H2>Next steps</H2>
      <UL>
        <li>
          See how these mechanics handle bulk data in{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/fbdi">
            FBDI &amp; ADFdi
          </a>
          .
        </li>
        <li>
          Ground the resource names in the{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/modules">
            application modules
          </a>
          .
        </li>
        <li>
          Make sure the right roles back your API user in{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/security">
            security &amp; roles
          </a>
          .
        </li>
        <li>
          Look up which REST resource to use for a task in the{" "}
          <a className="font-semibold text-accent hover:underline" href="/fusion/tool-matrix">
            Tool Matrix
          </a>
          .
        </li>
      </UL>
    </>
  );
}
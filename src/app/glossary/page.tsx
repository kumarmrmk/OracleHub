import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";

import DataTable from "@/components/ui/DataTable";

export const metadata = {
  title: "Glossary",
};

export default function GlossaryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture & Scenarios"
        title="Glossary"
        description="Every acronym and term you will meet in Oracle integration and low-code work, explained clearly."
        breadcrumbs={[{ label: "Glossary" }]}
        updated="February 2025"
      />

      <H2>How to read this glossary</H2>
      <P>
        Three tables: <strong>Acronyms</strong> decode the alphabet soup,{" "}
        <strong>Core concepts</strong> explain the building blocks you configure, and{" "}
        <strong>Architecture vocabulary</strong> covers the broader patterns and roles. Terms are
        ordered alphabetically within each table; if a term appears in italics, hang on — its
        expanded meaning is another row.
      </P>

      <H2>Acronyms</H2>
      <DataTable
        headers={["Acronym", "Stands for", "What it is"]}
        rows={[
          ["ADF", "Application Development Framework", "The Java framework that generates most Fusion pages and the REST/SOAP services you consume"],
          ["ADV", "Application Development", "Oracle's low-code mobile/web builder that replaced the older Oracle ADF Mobile visual tools"],
          ["BO", "Business Object", "A VBCS data entity backed by its own tables or a service; the data backbone of a VBCS app"],
          ["BIP", "Business Intelligence Publisher", "Fusion's reporting engine that renders data into formatted PDF/Excel documents"],
          ["CX", "Customer Experience", "Oracle's SaaS suite for sales, service, and marketing; one of the Fusion Cloud modules"],
          ["AutoInvoice", "The bulk billing engine in Receivables: it reads interface lines (RA_INTERFACE_LINES_ALL) and creates AR invoices and credit memos in one batch job"],
          ["AutoCash", "Receivables' rule-based engine that automatically applies receipts to open invoices"],
          ["AutoMatch", "The part of AutoCash that matches receipts to invoices by weighted criteria (amount, reference, date)"],
          ["DFF", "Descriptive Flexfield", "A custom extensible field you add to Fusion transaction pages; KFF = Key Flexfield, used for coded segments like account"],
          ["EBS", "E-Business Suite", "Oracle's older on-premises ERP suite that Fusion Cloud largely replaced"],
          ["ERP", "Enterprise Resource Planning", "The class of software — and the Fusion module — that runs finance, procurement, and projects"],
          ["ESS", "Enterprise Scheduler Service", "Fusion's background job scheduler that runs FBDI loads and report generation"],
          ["FBDI", "File-Based Data Import", "The bulk file-load channel: CSV data plus an XML control file, uploaded to UCM"],
          ["GL", "General Ledger", "The Fusion module that holds the chart of accounts and posting entries"],
          ["HCM", "Human Capital Management", "Fusion's module for core HR, payroll, and workforce management"],
          ["IDR", "Intelligent Document Recognition", "Payables' document-capture technology that scans and reads supplier invoices into the invoice entry flow"],
          ["KFF", "Key Flexfield", "A flexfield whose segments build a coded key — the chart of accounts is a KFF; see DFF"],
          ["MOAC", "Multiple Organizations Access Control", "The Fusion model that lets a user see multiple business units through data access sets"],
          ["PPR", "Payment Process Request", "Payables' payment run object: it selects invoices, builds the payment file, and drives EFT/ACH/check/SEPA formats"],
          ["IAM / IDCS", "Identity and Access Management / Identity Cloud Service", "Oracle's identity service that provides SSO, users, groups, and OAuth tokens across the stack"],
          ["iPaaS", "Integration Platform as a Service", "The category of cloud service that OIC belongs to"],
          ["OIC", "Oracle Integration Cloud", "Oracle's iPaaS — the middle layer for integration, orchestration, and process automation"],
          ["OJET", "Oracle JET", "Oracle's JavaScript UI toolkit that VBCS and OJET-based sites are built on"],
          ["REST", "Representational State Transfer", "The HTTP JSON API style used for most modern Oracle service calls"],
          ["SCM", "Supply Chain Management", "Fusion's module for procurement, sourcing, inventory, and logistics"],
          ["SOAP", "Simple Object Access Protocol", "The older XML web-service style; still used by some Fusion services"],
          ["SSO", "Single Sign-On", "One login across applications, usually via SAML or OAuth, powered by IAM/IDCS"],
          ["UCM", "Universal Content Manager", "Fusion's document repository where FBDI files and attachments are stored"],
          ["VBCS", "Visual Builder Cloud Service", "Oracle's low-code platform for building pages, portals, and process front ends"],
          ["WHT", "Withholding Tax", "Tax deducted from supplier payments (and withheld on invoices) and reported to the tax authority — includes the US 1099 suite"],
          ["XLA", "eXtensible Ledger Architecture / Subledger Accounting", "The engine that turns every sub-ledger event into accounting entries (XLA_AE_HEADERS / XLA_AE_LINES)"],
          ["VB Studio", "Visual Builder Studio", "The team edition of VBCS with version control, CI/CD, and broader app tooling"],
        ]}
      />

      <H2>Core concepts</H2>
      <DataTable
        headers={["Term", "Meaning"]}
        rows={[
          ["Action Chain", "A VBCS sequence of actions (Call Rest Endpoint, refresh variable, show message) that runs in response to a user event"],
          ["Adapter", "A pre-built OIC connector that talks to a specific system type — Fusion, SAP, Salesforce, SFTP, and hundreds more"],
          ["App-driven integration", "An OIC integration triggered by an incoming request such as REST, SOAP, or a file drop"],
          ["Application Role", "A named set of entitlements defining what a user can do in a VBCS app; users get roles, roles get access"],
          ["Business Object", "A named data entity in VBCS; stored in its own tables or sourced from a service via a service connection"],
          ["Call Rest Endpoint", "The VBCS action that invokes a service connection and passes a payload to your service or OIC endpoint"],
          ["Connection", "A reusable OIC resource pairing an adapter, a target system, and its stored credentials"],
          ["Data Provider", "The source behind a VBCS UI component — a business object, a service call, or business object variable"],
          ["Duty", "A Fusion authorization unit that groups privileges; job roles bundle duties for a job function"],
          ["Enterprise Scheduler Service", "The Fusion (and OIC scheduled-style) background executor that runs jobs on a schedule or on demand"],
          ["Fault Handler", "An OIC branch that catches errors (timeout, 404, business error) and defines the recovery or reroute behavior"],
          ["Fragment", "A reusable VBCS UI element kept in a Fragment asset and dropped into multiple pages"],
          ["Integration Style", "The trigger category of an OIC flow: app-driven, data-driven (scheduled), or event-driven"],
          ["Lookup", "A runtime mapping table in OIC (\"01\" → \"Active\") to avoid hard-coded translations in mappings"],
          ["OAuth 2.0", "The token-based authorization standard used to secure VBCS → OIC → Fusion calls"],
          ["Process Builder", "OIC's visual designer for human workflows with user tasks, business rules, and timelines"],
          ["Resubmit", "An OIC Monitoring action that re-runs a failed or abandoned integration instance with the original payload"],
          ["Service Connection", "A VBCS resource that points at an external endpoint and carries its auth; the front end's way to call OIC or Fusion"],
          ["User Task", "A step in an OIC process assigned to a person or role — the approval task in a PO flow"],
          ["Value Set", "A Fusion list of valid values for a field or flexfield segment, enforced on create/update"],
          ["Business Error", "An application-level failure (e.g. \"supplier on hold\") returned in a success HTTP response; OIC routes it via a fault handler"],
          ["Interface Table", "The staging table a bulk load writes to first (e.g. AP_INVOICES_INTERFACE) before an import job validates and moves rows into the base tables"],
          ["erpProcesses", "The Fusion REST resource used to submit scheduled processes (Import Journals, Create Accounting, Post Mass Additions) programmatically"],
          ["Data Access Set", "A GL security object that controls which ledgers/balances a duty can read and post to — the core of MOAC for GL"],
          ["Clearing Account", "A temporary GL account that nets to zero once the related transactions are complete (e.g. AP payment clearing, bank clearing)"],
        ]}
      />

      <H2>Architecture vocabulary</H2>
      <DataTable
        headers={["Term", "Meaning"]}
        rows={[
          ["System of record", "The authoritative home of a piece of data — Fusion for POs, invoices, and employees; everything else is a copy"],
          ["iPaaS", "Integration Platform as a Service; the cloud middle layer (OIC) that connects applications without you running servers"],
          ["Low-code", "Building applications with visual designers and configuration rather than handwritten code; VBCS and OIC are low-code"],
          ["BFF", "Backend for Frontend; a thin service layer that shapes data specifically for one UI, keeping business logic out of the page"],
          ["System-to-system", "Integration where two applications talk directly with no human in between, as opposed to human task flows"],
          ["FBDI load order", "The sequence in which bulk loads must run so lookups exist before the records that reference them (e.g. suppliers before invoices)"],
          ["Staging", "Landing data in a temporary area (VBCS business object or OIC file) to validate, transform, and then commit to the system of record"],
          ["Canonical data model", "A single agreed payload shape used across integrations so each system translates only at its own boundary"],
        ]}
      />

      <H2>Keep learning</H2>
      <P>
        The glossary is cross-referenced across the site. Follow a term into the page where it
        matters most:
      </P>
      <UL>
        <li>
          <a className="font-semibold text-fuchsia-300 hover:underline" href="/architecture">Architecture</a>{" "}
          — where VBCS asks, OIC does, and Fusion stores.
        </li>
        <li>
          <a className="font-semibold text-fuchsia-300 hover:underline" href="/oic/overview">OIC overview</a>{" "}
          — integrations, processes, and adapters in practice.
        </li>
        <li>
          <a className="font-semibold text-fuchsia-300 hover:underline" href="/vbcs/overview">VBCS overview</a>{" "}
          — pages, action chains, and service connections.
        </li>
        <li>
          <a className="font-semibold text-fuchsia-300 hover:underline" href="/fusion/overview">Fusion overview</a>{" "}
          — the system of record and its API surface.
        </li>
        <li>
          <a className="font-semibold text-fuchsia-300 hover:underline" href="/fusion/financials">ERP Financials hub</a>{" "}
          — GL, Payables, Receivables, Cash, Fixed Assets, and Expenses in depth.
        </li>
      </UL>
    </>
  );
}
import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import Diagram, { DiagramNode, Arrow } from "@/components/ui/Diagram";

export const metadata = {
  title: "OIC Managed File Transfer (MFT)",
};

export default function OicMftPage() {
  return (
    <>
      <PageHeader
        eyebrow="Oracle Integration Cloud"
        title="Managed File Transfer (MFT)"
        description="A governed way to exchange files with trading partners: a host in the form of a dedicated service, scheduled delivery, encryption and signing with PGP, and end-to-end transfer status. MFT is the 'bank-quality' file channel that wholesale integrations use when a plain FTP drop is not enough."
        breadcrumbs={[{ label: "OIC" }, { label: "Managed File Transfer (MFT)" }]}
        updated="February 2025"
        level="Advanced"
      />

      <P>
        Most file integrations are fine with an FTP or File adapter. <strong>Managed File
        Transfer</strong> adds the controls those adapters lack: a partner-facing <em>host</em> with
        a known address, who-is-allowed identities, guaranteed delivery, PGP encryption at rest and
        signing, and status visibility for a "did it actually arrive?" answer.
      </P>

      <H2>MFT at a glance</H2>
      <Diagram title="An MFT exchange" className="mb-8">
        <DiagramNode tone="neutral" title="Trading partner" subtitle="submits through a public endpoint" />
        <Arrow label="upload / signed / encrypted" />
        <DiagramNode tone="oic" title="MFT service" subtitle="receives, stores, notifies" />
        <Arrow label="pickup / transformation" />
        <DiagramNode tone="neutral" title="Your integration" subtitle="pulls the file, processes it" />
      </Diagram>
      <Callout type="info">
        Think of MFT as <strong>FTP with an audit trail, PGP, and an SLA</strong>. When a partner
        demands "tell me what happened to my file — and encrypt it", MFT is the answer.
      </Callout>

      <H2>Core building blocks</H2>
      <DataTable
        headers={["Building block", "What it is", "What it buys you"]}
        rows={[
          ["Host (endpoint)", "The partner-facing address where files are exchanged", "A stable contractual endpoint instead of chasing FTP paths"],
          ["Partner / user identities", "Who may connect, with credentials", "Controls which external identity can access which folder"],
          ["File transfer definitions", "The file pattern, folders, and flow per partner", "Packaged rules per exchange — no ad-hoc FTP politics"],
          ["PGP keys", "Encryption and signing key pairs", "Confidentiality and origin proof"],
          ["Schedule & alerts", "When transfers run, and notifications on failure", "SLAs a business can actually see"],
        ]}
      />

      <H2>Why not just use the FTP adapter?</H2>
      <P>
        Good question. The line is about <em>who is responsible</em> and <em>what the partner
        expects</em>:
      </P>
      <DataTable
        headers={["Scenario", "FTP/SFTP adapter", "MFT"]}
        rows={[
          ["Internal file pickup", "Fine — simple, fast", "Usually overkill"],
          ["Partner needs a fixed public endpoint", "No fixed SLA or reporting", "Designed for this"],
          ["Encryption mandated (PGP)", "You build it yourself", "Built-in key management"],
          ["'Did the file arrive?' questions", "You improvise logs", "Native transfer status"],
          ["Large partner portfolios", "One-off scripts per partner", "One governed service"],
        ]}
      />

      <H2>PGP in one paragraph</H2>
      <P>
        <strong>PGP</strong> (Pretty Good Privacy) is the encryption/signing scheme MFT uses. You
        generate a key pair — public and private. A partner encrypts to <em>your</em> public key so
        only your private key can open it, and signs with <em>their</em> private key so you can
        verify the file came from them. MFT manages these key pairs, so exchange definitions point
        at keys rather than a key-management project on your side.
      </P>
      <Callout type="warning">
        Key rotation is the silent killer of MFT setups. When an exchange "stops decrypting"
        overnight, it is almost always a rotated partner key that the exchange still references.
        Track expiry dates like a production SLA (see also{" "}
        <a className="font-semibold text-sky-300 hover:underline" href="/oic/security">security</a>).
      </Callout>

      <H2>Working example — P2P in a banking context</H2>
      <Callout type="example" title="Worked example: suppliers submit invoices via MFT">
        <p className="mb-2"><strong>Exchange:</strong> each supplier uploads a signed, encrypted invoice file to the MFT host as a separate partner account.</p>
        <p className="mb-2"><strong>Verification:</strong> MFT checks the signature, decrypts with your key, and drops the plaintext into a pickup folder.</p>
        <p className="mb-2"><strong>Processing:</strong> a scheduled OIC integration reads the folder, maps it (see <a className="font-semibold text-sky-300 hover:underline" href="/oic/mapping">mapping</a>), and stages it for Fusion FBDI.</p>
        <p className="mb-0"><strong>Answerability:</strong> when a supplier asks "did you get it?", the MFT status screen answers with a timestamp instead of a shrug.</p>
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Connect the other file cases with <a className="font-semibold text-sky-300 hover:underline" href="/oic/adapters">adapters</a>.</li>
        <li>Encrypt and identify correctly with <a className="font-semibold text-sky-300 hover:underline" href="/oic/security">security & auth</a>.</li>
        <li>Govern the transfer lifecycle in <a className="font-semibold text-sky-300 hover:underline" href="/oic/deployment">deployment</a>.</li>
      </UL>
    </>
  );
}
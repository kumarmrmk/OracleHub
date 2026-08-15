import PageHeader, { H2, P, UL } from "@/components/ui/PageHeader";
import Callout, { K } from "@/components/ui/Callout";
import DataTable from "@/components/ui/DataTable";
import CodeBlock from "@/components/ui/CodeBlock";

export const metadata = {
  title: "VBCS Progressive Web Apps (PWA)",
};

export default function VbcsPwaPage() {
  return (
    <>
      <PageHeader
        eyebrow="VBCS"
        title="Progressive Web Apps (PWA)"
        description="Turn a web application into an installable, app-like experience: a home-screen icon, a splash screen, offline fallback, and a QR code users scan to install. This page covers enabling PWA support, the manifest, branding, and offline behavior."
        breadcrumbs={[{ label: "VBCS" }, { label: "PWA Support" }]}
        updated="February 2025"
        level="Module"
      />

      <P>
        A <strong>Progressive Web App (PWA)</strong> is a web app that behaves like an installed
        app: it can live on the home screen, launch with a splash screen, and degrade gracefully
        offline. VBCS enables this from the app's settings — no separate mobile build required.
      </P>
      <Callout type="info">
        A PWA is still a <strong>web app</strong> under the hood — same VBCS pages, same service
        connections. The PWA layer adds installability and offline behavior around it, not a new
        technology stack.
      </Callout>

      <H2>Enabling PWA support</H2>
      <UL>
        <li>Open your app in the web apps navigator, open the app artifact, and go to <strong>Settings</strong>.</li>
        <li>Select the <strong>PWA tab</strong> and click <strong>Enable Progressive Web App (PWA)</strong>.</li>
        <li>
          VBCS adds the required PWA resources to your project: a <strong>web manifest file</strong>{" "}
          (a JSON configuration), required <strong>icons</strong>, and <strong>splash screens</strong>.
        </li>
      </UL>

      <H2>The web manifest</H2>
      <P>
        The manifest stores the configuration a PWA needs. You edit these settings in the{" "}
        <strong>Manifest Settings</strong> section of the PWA tab:
      </P>
      <DataTable
        headers={["Setting", "What it controls"]}
        rows={[
          ["Application name", "Shown in the install prompt"],
          ["Short name", "Used on the home screen below the icon (where space is limited)"],
          ["Background / theme color", "The app's color treatment around the shell"],
          ["Icons & splash screens", "Branded assets shown at launch and on install"],
        ]}
      />
      <CodeBlock
        language="json"
        filename="web-manifest-snippet.json"
        code={`{
  "name": "Supplier Portal",
  "short_name": "Suppliers",
  "display": "standalone",
  "start_url": "/ic/builder/rt/supplier-portal/1.0/",
  "theme_color": "#0B5CAD",
  "background_color": "#0B5CAD",
  "icons": [
    {
      "sizes": "512x512",
      "src": "resources/icons/icon-512x512.png",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}`}
      />
      <Callout type="tip">
        If you use <strong>adaptive icons</strong> (Android 8.0+), keep important content inside a
        "safe zone" — a circle with radius equal to <strong>40% of image size</strong>. VBCS also
        documents the <K>"purpose": "any maskable"</K> setting for such icons.
      </Callout>

      <H2>Branding and resources</H2>
      <P>
        Oracle provides Redwood-themed icons and splash screens as a starting point. From the{" "}
        <strong>Resources</strong> section you can download the <K>pwabranding_redwood.zip</K>{" "}
        sample, modify the images, and upload your branded set in its place.
      </P>

      <H2>Offline fallback page</H2>
      <P>
        You can add an <strong>offline fallback page</strong> that appears when a user performs an
        action needing a connection while the device is offline:
      </P>
      <UL>
        <li>
          Click <strong>Create</strong> next to <K>Offline Fallback Page</K> — VBCS adds a
          Redwood-themed <K>offlinePage.html</K> to your project.
        </li>
        <li>
          Open it in the designer and customize it (message, retry button, links) to fit your app.
        </li>
      </UL>
      <Callout type="warning">
        Offline means the <em>shell</em> and static resources may load, but data still comes from
        service connections that need the network. Plan what a user can realistically do offline —
        often "see that you're offline" is the honest, correct behavior.
      </Callout>

      <H2>Distributing a PWA</H2>
      <P>
        Once enabled, stage and publish the app like any web app. After publishing you can generate
        a <strong>QR code</strong> (using your browser's native capabilities) that users scan to
        quickly open and install the app on a laptop or device.
      </P>
      <Callout type="note">
        Mobile apps are no longer supported in VBCS — but you can <strong>convert an existing
        mobile app to a web app</strong> and deploy it as a PWA, keeping its reach on phones.
      </Callout>

      <H2>Next steps</H2>
      <UL>
        <li>Design the responsive pages a PWA runs in — see <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/ui">UI components & patterns</a>.</li>
        <li>Publish and distribute it in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/deploy">deployment & lifecycle</a>.</li>
        <li>Control who reaches the installed app in <a className="font-semibold text-emerald-300 hover:underline" href="/vbcs/security">security & roles</a>.</li>
      </UL>
    </>
  );
}
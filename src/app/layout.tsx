import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Shell from "@/components/Shell";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kumarmrmk.github.io";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Oracle Cloud Hub — Fusion, OIC, VBCS, SQL & PL/SQL",
    template: "%s · Oracle Cloud Hub",
  },
  description:
    "A detailed reference hub covering Oracle Fusion Cloud, Oracle Integration Cloud, Visual Builder Cloud Service, Oracle SQL and PL/SQL.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "Oracle Cloud Hub",
    title: "Oracle Cloud Hub — Fusion, OIC, VBCS, SQL & PL/SQL",
    description:
      "A self-paced study guide for Oracle Fusion Cloud, OIC, VBCS, Oracle SQL and PL/SQL — explained end to end with one learning path and full-text search.",
    url: `${basePath}/`,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Oracle Cloud Hub — Fusion, OIC, VBCS, SQL & PL/SQL",
    description:
      "A self-paced study guide for Oracle Fusion Cloud, OIC, VBCS, Oracle SQL and PL/SQL.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
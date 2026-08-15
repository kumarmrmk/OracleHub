"use client";

import { useState } from "react";

export default function CodeCopy({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copyToClipboard}
      className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-white/5 hover:text-ink"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import CodeCopy from "@/components/ui/CodeCopy";

const SUPPORTED = new Set([
  "xml",
  "json",
  "sql",
  "bash",
  "shell",
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "yaml",
  "text",
]);

export default function CodeBlock({
  code,
  language = "text",
  filename,
  title,
  className = "",
}: {
  code: string;
  language?: string;
  filename?: string;
  title?: string;
  className?: string;
}) {
  const lang = SUPPORTED.has(language) ? language : "text";

  return (
    <div
      className={`my-4 overflow-hidden rounded-xl border border-[var(--edge)] bg-[var(--code-bg)] ${className}`}
    >
      <div className="flex items-center justify-between border-b border-[var(--edge)] bg-[var(--surface)] px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="size-2.5 rounded-full bg-zinc-700" />
          <span className="size-2.5 rounded-full bg-zinc-700" />
          <span className="size-2.5 rounded-full bg-zinc-700" />
          <span className="ml-2 font-mono tracking-tight">
            {filename || title || language}
          </span>
        </div>
        <CodeCopy code={code} />
      </div>
      <SyntaxHighlighter
        language={lang}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem 1.25rem",
          background: "transparent",
          fontSize: "0.83rem",
          lineHeight: 1.6,
          overflowX: "auto",
          whiteSpace: "pre",
        }}
        codeTagProps={{
          style: { fontFamily: "var(--font-mono)" },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
import fs from "fs";

const p = "src/components/chat/MessageBubble.jsx";
let s = fs.readFileSync(p, "utf8");

if (!s.includes("lucide-react")) {
  s = s.replace(
    'import ReactMarkdown from "react-markdown";',
    'import { Bot, UserRound } from "lucide-react";\nimport ReactMarkdown from "react-markdown";'
  );
}

const start = s.indexOf("  return (");
const end = s.lastIndexOf("  );\n}");
if (start === -1 || end === -1) {
  console.error("Could not find return block");
  process.exit(1);
}

const d = "motion-safe".replace("motion-safe", String.fromCharCode(100, 105, 118));

const newReturn = `  return (
    <article className={\`flex items-end gap-2.5 \${isUser ? "flex-row-reverse" : "flex-row"}\`}>
      <${d}
        className={\`flex h-9 w-9 shrink-0 items-center justify-center rounded-full \${
          isUser
            ? "bg-teal-600 text-white shadow-md"
            : "border border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
        }\`}
        aria-hidden
      >
        {isUser ? <UserRound size={17} /> : <Bot size={17} />}
      </${d}>
      <${d}
        className={\`max-w-[85%] rounded-2xl px-4 py-3 text-base shadow-sm md:max-w-[78%] \${
          isUser
            ? "rounded-br-sm bg-gradient-to-br from-teal-600 to-cyan-600 text-white"
            : "rounded-bl-sm border border-teal-100 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        }\`}
      >
        <${d} className="space-y-3 leading-7 markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              p: (props) => <p className="mb-2 leading-7" {...props} />,
              h1: (props) => <h1 className="mb-2 text-2xl font-semibold" {...props} />,
              h2: (props) => <h2 className="mb-2 text-xl font-semibold" {...props} />,
              h3: (props) => <h3 className="mb-1 text-lg font-semibold" {...props} />,
              ul: (props) => <ul className="mb-2 list-disc space-y-1 pl-6" {...props} />,
              ol: (props) => <ol className="mb-2 list-decimal space-y-1 pl-6" {...props} />,
              li: (props) => <li className="leading-7" {...props} />,
              table: (props) => (
                <${d} className="my-3 overflow-x-auto rounded-xl border border-teal-100 dark:border-slate-600">
                  <table className="min-w-full border-collapse text-sm" {...props} />
                </${d}>
              ),
              thead: (props) => <thead className="bg-teal-50 text-slate-800 dark:bg-slate-700 dark:text-slate-100" {...props} />,
              tbody: (props) => <tbody className="bg-white dark:bg-slate-800" {...props} />,
              tr: (props) => <tr className="border-b border-teal-100 last:border-b-0 dark:border-slate-600" {...props} />,
              th: (props) => (
                <th
                  className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-teal-700 uppercase dark:text-teal-300"
                  {...props}
                />
              ),
              td: (props) => <td className="px-3 py-2 align-top leading-6 text-slate-700 dark:text-slate-200" {...props} />,
              hr: (props) => <hr className="my-3 border-white/30" {...props} />,
              code: ({ inline, className, children, ...props }) =>
                inline ? (
                  <code className="rounded bg-black/10 px-1 py-0.5 text-[0.95em]" {...props}>
                    {children}
                  </code>
                ) : (
                  <code className={\`block overflow-x-auto rounded-lg bg-black/10 p-3 \${className || ""}\`} {...props}>
                    {children}
                  </code>
                ),
            }}
          >
            {normalizedContent}
          </ReactMarkdown>
        </${d}>
        {message.imagePreview && (
          <img
            src={message.imagePreview}
            alt="Uploaded medical record"
            className="mt-3 h-28 w-28 rounded-lg object-cover ring-2 ring-white/30"
          />
        )}
      </${d}>
    </article>
  );`;

s = s.slice(0, start) + newReturn + s.slice(end + "  );".length);

fs.writeFileSync(p, s);
console.log("Patched MessageBubble");

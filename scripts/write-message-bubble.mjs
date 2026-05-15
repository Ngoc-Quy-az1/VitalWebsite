import fs from "fs";

const tag = String.fromCharCode(100, 105, 118);

const content = `import { Bot, UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

function normalizeMathDelimiters(raw) {
  if (!raw) return "";

  let text = raw;
  text = text.replace(/\\s\\\\\\s+/g, "\\n");
  text = text.replace(/\\\\text\\{([^}]*)\\}/g, "$1");
  text = text.replace(/\\$\\$([\\s\\S]*?)\\$\\$/g, (_match, latex) => {
    const candidate = String(latex || "").trim();
    if (!candidate) return _match;
    return \`\\n$$\\n\${candidate}\\n$$\\n\`;
  });
  text = text.replace(/(\\$\\$)\\s*\\\\+(?=\\s|$)/g, "$1");
  text = text.replace(/\\[\\s*(\\\\[\\s\\S]*?)\\s*\\]/g, (_match, latex) => {
    const candidate = String(latex || "").trim();
    if (!candidate) return _match;
    return \`\\n$$\\n\${candidate}\\n$$\\n\`;
  });
  text = text.replace(/\\\\\\[\\s*([\\s\\S]*?)\\s*\\\\\\]/g, (_match, latex) => {
    const candidate = String(latex || "").trim();
    if (!candidate) return _match;
    return \`\\n$$\\n\${candidate}\\n$$\\n\`;
  });
  const mathLike = /\\\\(frac|text|times|cdot|sqrt|left|right|sum|int|leq|geq|mathrm|operatorname)\\b/;
  const lines = text.split(/\\r?\\n/);
  text = lines
    .map((line) => {
      const original = line;
      const trimmed = original.trim();
      if (!trimmed) return original;
      if (trimmed.includes("$$")) return original;
      if (!mathLike.test(trimmed)) return original;
      const cleaned = trimmed.replace(/\\\\+\\s*$/, "").trim();
      if (!cleaned) return original;
      return \`$$ \${cleaned} $$\`;
    })
    .join("\\n");
  text = text.replace(/\\n{3,}/g, "\\n\\n");
  return text.trim();
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const normalizedContent = normalizeMathDelimiters(message.content || "");

  return (
    <article className={\`flex items-end gap-2.5 \${isUser ? "flex-row-reverse" : "flex-row"}\`}>
      <${tag}
        className={\`flex h-9 w-9 shrink-0 items-center justify-center rounded-full \${
          isUser
            ? "bg-teal-600 text-white shadow-md"
            : "border border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
        }\`}
        aria-hidden
      >
        {isUser ? <UserRound size={17} /> : <Bot size={17} />}
      </${tag}>
      <${tag}
        className={\`max-w-[85%] rounded-2xl px-4 py-3 text-base shadow-sm md:max-w-[78%] \${
          isUser
            ? "rounded-br-sm bg-gradient-to-br from-teal-600 to-cyan-600 text-white"
            : "rounded-bl-sm border border-teal-100 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        }\`}
      >
        <${tag} className="space-y-3 leading-7 markdown-content">
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
                <${tag} className="my-3 overflow-x-auto rounded-xl border border-teal-100 dark:border-slate-600">
                  <table className="min-w-full border-collapse text-sm" {...props} />
                </${tag}>
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
        </${tag}>
        {message.imagePreview && (
          <img
            src={message.imagePreview}
            alt="Uploaded medical record"
            className="mt-3 h-28 w-28 rounded-lg object-cover ring-2 ring-white/30"
          />
        )}
      </${tag}>
    </article>
  );
}
`;

fs.writeFileSync("src/components/chat/MessageBubble.jsx", content);
console.log("MessageBubble restored");

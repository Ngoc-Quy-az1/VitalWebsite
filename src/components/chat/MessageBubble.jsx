import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../utils/cn";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const cleanContent = typeof message.content === "string"
    ? message.content.replace(/\s*\(Ảnh đính kèm:[^)]+\)/gi, "")
    : message.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full px-1 md:px-0",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "w-full flex",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            isUser
              ? "px-5 py-3 rounded-[24px] bg-[#f0f4f9] text-[#1f1f1f] max-w-[85%] md:max-w-[70%] shadow-none border-0 dark:bg-slate-800 dark:text-[#e3e3e3]"
              : "w-full text-left bg-transparent border-0 shadow-none p-0 text-[#1f1f1f] dark:text-[#e3e3e3] py-2"
          )}
        >
          {Array.isArray(message.imagePreviews) && message.imagePreviews.length > 0 ? (
            <div className="mb-3">
              <div className="flex gap-3 overflow-x-auto py-1">
                {message.imagePreviews.map((src, i) => (
                  <div key={i} className="w-56 h-40 rounded-2xl overflow-hidden border bg-white dark:bg-slate-900 dark:border-slate-700">
                    <img src={src} alt={`msg-img-${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className={cn(
            "prose prose-slate dark:prose-invert max-w-none break-words",
            isUser ? "[&_*]:text-[#1f1f1f] dark:[&_*]:text-[#e3e3e3] font-normal" : "text-[#1f1f1f] dark:text-[#e3e3e3]"
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {cleanContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

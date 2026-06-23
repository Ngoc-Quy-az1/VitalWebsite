import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../utils/cn";
import { Stethoscope, User } from "lucide-react";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full px-4 md:px-0",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex gap-4 max-w-[85%] md:max-w-[75%]",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
            isUser ? "bg-slate-100" : "bg-teal-600 text-white"
          )}
        >
          {isUser ? <User size={18} className="text-slate-600" /> : <Stethoscope size={18} />}
        </div>

        {/* Content */}
        <div
          className={cn(
            "px-5 py-3.5 rounded-2xl shadow-sm leading-relaxed border",
            isUser
              ? "bg-slate-100 border-transparent text-slate-800 rounded-tr-none dark:bg-teal-950/60 dark:border-teal-800/30 dark:text-slate-100"
              : "bg-white border-teal-50 text-slate-800 rounded-tl-none dark:bg-slate-800 dark:border-slate-700/80 dark:text-slate-200"
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

          <div className="prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

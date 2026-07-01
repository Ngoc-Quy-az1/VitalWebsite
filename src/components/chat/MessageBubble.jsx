import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../utils/cn";
import { useState } from "react";

export default function MessageBubble({ message, onTriggerWebSearch }) {
  const isUser = message.role === "user";
  const [showSources, setShowSources] = useState(false);

  const cleanContent = typeof message.content === "string"
    ? message.content.replace(/\s*\(Ảnh đính kèm:[^)]+\)/gi, "")
    : message.content;

  // Filter to display ONLY medical web sources, hide local PDF chunks ("Tài liệu gốc")
  const webSources = Array.isArray(message.sources)
    ? message.sources.filter((src) => src.source_type === "medical_web")
    : [];

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

          {!isUser && webSources.length > 0 && (
            <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-2 text-sm">
              <button
                onClick={() => setShowSources(!showSources)}
                className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-bold inline-flex items-center gap-1.5 hover:underline bg-teal-50/40 dark:bg-slate-800/40 px-3 py-1.5 rounded-lg border border-teal-100/50 dark:border-slate-700/50 transition-all active:scale-[0.98]"
              >
                <span>🌐</span> {showSources ? "Thu gọn nguồn tham khảo ⬆" : `Xem ${webSources.length} nguồn tham khảo từ internet ⬇`}
              </button>

              {showSources && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {webSources.map((src, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-teal-200 dark:hover:border-teal-800 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            Web y khoa
                          </span>
                          {src.domain && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                              {src.domain}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {src.title || src.label}
                        </h4>
                        {src.preview && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 italic leading-relaxed">
                            "{src.preview}"
                          </p>
                        )}
                      </div>
                      {src.url && (
                        <div className="mt-2 text-right">
                          <a 
                            href={src.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[11px] text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-bold inline-flex items-center gap-0.5 hover:underline"
                          >
                            Xem chi tiết ↗
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isUser && message.suggestWebSearch && (
            <div className="mt-4 p-4 rounded-2xl border border-dashed border-teal-200 dark:border-slate-700 bg-teal-50/20 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">🔍</span>
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Không tìm thấy tài liệu phù hợp trong kho dữ liệu y khoa nội bộ
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Bạn có muốn chatbot mở rộng tìm kiếm trực tiếp trên các website y học uy tín ngoài Internet không?
                  </p>
                </div>
              </div>
              <button
                onClick={() => onTriggerWebSearch && onTriggerWebSearch(message.query)}
                className="self-end sm:self-center shrink-0 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl shadow-md shadow-teal-100 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
              >
                <span>🌐</span> Tìm kiếm Internet
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

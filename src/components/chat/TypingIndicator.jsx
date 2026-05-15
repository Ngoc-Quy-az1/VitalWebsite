import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex w-full px-4 md:px-0 justify-start">
      <div className="flex gap-4 max-w-[85%] md:max-w-[75%] flex-row">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-teal-600 text-white">
          <Stethoscope size={18} />
        </div>

        {/* Typing Bubble */}
        <div className="px-5 py-4 rounded-2xl shadow-sm bg-white border border-teal-50 rounded-tl-none flex items-center gap-1.5 h-11">
          <motion.div
            className="w-1.5 h-1.5 bg-teal-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0 }}
          />
          <motion.div
            className="w-1.5 h-1.5 bg-teal-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.div
            className="w-1.5 h-1.5 bg-teal-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}

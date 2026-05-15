import { PanelLeft, ChevronDown, Activity } from "lucide-react";

export default function ChatHeader({ onOpenMobileSidebar }) {
  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 -ml-2 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg md:hidden transition-colors"
        >
          <PanelLeft size={20} />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl cursor-pointer">
          <span className="font-semibold text-slate-800">VitalAI</span>
          <span className="text-sm text-slate-500 font-medium">Pro</span>
          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full">
          <Activity size={14} className="text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">System Online</span>
        </div>
      </div>
    </header>
  );
}

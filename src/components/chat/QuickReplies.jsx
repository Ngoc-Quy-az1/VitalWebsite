export default function QuickReplies({ suggestions, onSelect, disabled }) {
  if (!suggestions?.length) return null;

  return (
    <nav
      aria-label="Câu hỏi gợi ý"
      className="mt-3 flex flex-wrap justify-center gap-2"
    >
      {suggestions.map((item) => {
        const Icon = item.icon;
        const label = item.label || item;
        const prompt = item.prompt || item;

        return (
          <button
            key={item.id || prompt}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(prompt)}
            className="inline-flex items-center gap-2 rounded-xl border border-teal-200/80 bg-white px-3.5 py-2 text-sm text-slate-700 shadow-sm transition hover:border-teal-400 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-teal-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-600 dark:hover:bg-slate-700"
          >
            {Icon ? <Icon size={16} className="text-teal-600 dark:text-teal-400" /> : null}
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

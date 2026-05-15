import { motion } from "framer-motion";

export default function SuggestionChips({ onSelect }) {
  const chips = [
    "Khám bệnh tổng quát",
    "Phân tích triệu chứng",
    "Đọc kết quả xét nghiệm",
    "Tư vấn dinh dưỡng",
    "Khẩn cấp"
  ];

  return (
    <div className="flex flex-wrap gap-2 px-2 pb-4">
      {chips.map((chip, i) => (
        <motion.button
          key={chip}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onSelect(chip)}
          className="px-4 py-2 bg-white border border-teal-100 rounded-xl text-sm text-teal-800 hover:bg-teal-50 hover:border-teal-200 hover:shadow-sm transition-all whitespace-nowrap"
        >
          {chip}
        </motion.button>
      ))}
    </div>
  );
}

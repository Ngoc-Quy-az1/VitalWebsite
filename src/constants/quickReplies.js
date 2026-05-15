import { Activity, AlertCircle, Apple, FileText } from "lucide-react";

export const QUICK_REPLIES = [
  {
    id: "symptoms",
    label: "Triệu chứng",
    prompt: "Dấu hiệu suy thận giai đoạn 1 là gì?",
    icon: Activity,
  },
  {
    id: "labs",
    label: "Xét nghiệm",
    prompt: "Creatinine cao có nguy hiểm không?",
    icon: FileText,
  },
  {
    id: "diet",
    label: "Ăn uống",
    prompt: "Chế độ ăn uống cho người bệnh thận",
    icon: Apple,
  },
  {
    id: "emergency",
    label: "Khẩn cấp",
    prompt: "Khi nào cần đi khám cấp cứu?",
    icon: AlertCircle,
  },
];

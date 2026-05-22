import { Activity, Droplets, HeartPulse } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function HealthSnapshot() {
  const { t } = useLanguage();

  const metrics = [
    { icon: Droplets, label: "eGFR", value: "72", unit: "mL/min", hint: t("average") },
    { icon: Activity, label: "Creatinine", value: "1.1", unit: "mg/dL", hint: t("stable") },
    { icon: HeartPulse, label: t("bloodPressure"), value: "120/80", unit: "mmHg", hint: t("normal") },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {metrics.map(({ icon: Icon, label, value, unit, hint }) => (
        <div
          key={label}
          className="rounded-xl border border-teal-100/80 bg-white/80 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/80"
        >
          <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold tracking-wide text-teal-600 uppercase dark:text-teal-400">
            <Icon size={12} />
            {label}
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {value}
            <span className="ml-0.5 text-[10px] font-normal text-slate-500">{unit}</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
      ))}
    </div>
  );
}

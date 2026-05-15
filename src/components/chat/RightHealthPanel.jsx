import { motion } from "framer-motion";
import { Activity, Heart, Droplets } from "lucide-react";

export default function RightHealthPanel() {
  const stats = [
    { label: "eGFR", value: "98", unit: "mL/min", status: "Bình thường", icon: Droplets, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Huyết áp", value: "120/80", unit: "mmHg", status: "Tốt", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Creatinine", value: "0.8", unit: "mg/dL", status: "Ổn định", icon: Activity, color: "text-teal-500", bg: "bg-teal-50" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="hidden lg:flex flex-col w-[320px] shrink-0 bg-white border-l border-slate-100 p-6 space-y-6 overflow-y-auto"
    >
      <div className="flex flex-col items-center justify-center pt-4 pb-6 border-b border-slate-100">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-300 flex items-center justify-center p-1 shadow-lg shadow-teal-200">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-teal-500/20"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Heart className="text-teal-600 relative z-10" size={32} />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
        </div>
        <h3 className="mt-4 font-bold text-slate-800 text-lg">Hồ sơ Sức khỏe</h3>
        <p className="text-sm text-slate-500">Cập nhật lúc 14:30</p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Chỉ số sinh tồn</h4>
        
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${stat.bg}`}>
                    <Icon size={16} className={stat.color} />
                  </div>
                  <span className="font-medium text-slate-600">{stat.label}</span>
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {stat.status}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
                <span className="text-sm text-slate-500">{stat.unit}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

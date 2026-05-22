import React, { useState } from "react";
import { X, Check, Crown, Star, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UpgradePlanModal({
  isOpen,
  onClose,
  onUpgradeSuccess,
  currentPlan = "Free",
  language = "VI",
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const t = {
    VI: {
      title: "Nâng cấp tài khoản",
      subtitle: "Giải phóng toàn bộ sức mạnh của KidneyCare AI",
      freePlan: "Gói cơ bản",
      freePrice: "Miễn phí",
      freeDesc: "Tính năng cơ bản để theo dõi thận học.",
      proPlan: "Gói Premium Pro",
      proPrice: "199.000đ",
      proPeriod: "/ tháng",
      proDesc: "Tối ưu hóa sức khỏe thận với công nghệ tốt nhất.",
      active: "Đang hoạt động",
      upgradeNow: "Nâng cấp ngay",
      processing: "Đang xử lý thanh toán...",
      successTitle: "Nâng cấp thành công!",
      successDesc: "Chúc mừng! Bạn đã sở hữu tài khoản Premium Pro và có đầy đủ quyền lợi cao cấp.",
      successBtn: "Trải nghiệm ngay",
      features: [
        "Chatbot AI phân tích thận học chuyên sâu không giới hạn",
        "Tải lên và nhận diện ảnh xét nghiệm tức thì",
        "Hỗ trợ kết nối âm thanh & giọng nói phản hồi ưu tiên",
        "Không giới hạn phiên tư vấn hàng ngày",
        "Trực quan chỉ số sức khỏe & khuyến nghị nâng cao",
        "Hỗ trợ VIP 24/7 từ đội ngũ chuyên gia",
      ],
      freeFeatures: [
        "Phân tích chatbot cơ bản (10 tin nhắn/ngày)",
        "Tải ảnh xét nghiệm cơ bản",
        "Có độ trễ phản hồi khi tải cao",
      ]
    },
    EN: {
      title: "Upgrade Account",
      subtitle: "Unleash the full power of KidneyCare AI",
      freePlan: "Standard Plan",
      freePrice: "Free",
      freeDesc: "Basic features for kidney health tracking.",
      proPlan: "Premium Pro Plan",
      proPrice: "$9.99",
      proPeriod: "/ month",
      proDesc: "Optimize kidney health with advanced technology.",
      active: "Active Plan",
      upgradeNow: "Upgrade Now",
      processing: "Processing payment...",
      successTitle: "Upgrade Successful!",
      successDesc: "Congratulations! You are now a Premium Pro member with full access.",
      successBtn: "Start Premium Experience",
      features: [
        "Unlimited advanced kidney health consultations",
        "Instant health report image OCR & analysis",
        "Priority voice interaction & audio services",
        "No daily message limits or delays",
        "Advanced health snapshot charts & recommendations",
        "24/7 VIP Dedicated Support",
      ],
      freeFeatures: [
        "Basic chatbot interactions (10 msgs/day)",
        "Standard image uploads only",
        "Normal response speed with delay",
      ]
    },
  }[language];

  const handleUpgrade = () => {
    setIsProcessing(true);
    // Mock network request
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (onUpgradeSuccess) {
        onUpgradeSuccess();
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="upgrade-form"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 my-8"
          >
            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-850">
              <div>
                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                  <Crown size={20} className="text-amber-500 fill-amber-500" />
                  {t.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Standard Plan (Free) */}
              <div className="rounded-2xl border border-slate-200 p-5 flex flex-col justify-between dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-350">{t.freePlan}</h4>
                    {currentPlan !== "Premium Pro" && (
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-350">
                        {t.active}
                      </span>
                    )}
                  </div>
                  <div className="my-3 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{t.freePrice}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t.freeDesc}</p>
                  
                  <div className="space-y-2 border-t border-slate-150 pt-4 dark:border-slate-850">
                    {t.freeFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Check size={14} className="mt-0.5 shrink-0 text-slate-400" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pro Plan (Premium) */}
              <div className="relative rounded-2xl border-2 border-teal-500 p-5 flex flex-col justify-between dark:border-teal-500 bg-gradient-to-b from-teal-50/30 to-cyan-50/10 dark:from-slate-900 dark:to-teal-950/20 shadow-lg shadow-teal-500/5">
                <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-teal-600 to-cyan-500 px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white flex items-center gap-1 shadow">
                  <Star size={10} className="fill-white" />
                  PRO
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                      <Sparkles size={14} />
                      {t.proPlan}
                    </h4>
                    {currentPlan === "Premium Pro" && (
                      <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-400">
                        {t.active}
                      </span>
                    )}
                  </div>
                  <div className="my-3 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-850 dark:text-white">{t.proPrice}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{t.proPeriod}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t.proDesc}</p>
                  
                  <div className="space-y-2 border-t border-teal-100 pt-4 dark:border-slate-800">
                    {t.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal-500 dark:text-teal-400" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentPlan !== "Premium Pro" && (
                  <div className="mt-6 pt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleUpgrade}
                      className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 py-3 text-center text-xs font-bold text-white shadow-md hover:from-teal-700 hover:to-cyan-600 transition duration-200 focus:outline-none flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {t.processing}
                        </>
                      ) : (
                        t.upgradeNow
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upgrade-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-850 dark:text-white mb-2">{t.successTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {t.successDesc}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-xs font-bold text-white shadow-md hover:from-emerald-600 hover:to-teal-700 transition duration-200"
            >
              {t.successBtn}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

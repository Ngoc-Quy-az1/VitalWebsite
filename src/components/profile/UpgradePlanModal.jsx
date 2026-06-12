import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Check, Crown, Star, Sparkles, CheckCircle2, ArrowLeft, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

export default function UpgradePlanModal({
  isOpen,
  onClose,
  onUpgradeSuccess,
  currentPlan = "Free",
  language = "VI",
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { user } = useAuth();

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
      processing: "Đang kiểm tra và xác nhận chuyển khoản...",
      successTitle: "Nâng cấp thành công!",
      successDesc: "Chúc mừng! Bạn đã sở hữu tài khoản Premium Pro và có đầy đủ quyền lợi cao cấp.",
      successBtn: "Trải nghiệm ngay",
      paymentTitle: "Thanh toán gói Premium Pro",
      paymentSubtitle: "Quét mã QR dưới đây hoặc chuyển khoản thủ công",
      bankName: "Ngân hàng",
      accountNum: "Số tài khoản",
      accountName: "Chủ tài khoản",
      amount: "Số tiền",
      message: "Nội dung chuyển khoản",
      paidBtn: "Tôi đã chuyển khoản",
      backBtn: "Quay lại",
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
      paymentTitle: "Premium Pro Plan Payment",
      paymentSubtitle: "Scan QR code below or transfer manually",
      bankName: "Bank",
      accountNum: "Account Number",
      accountName: "Account Owner",
      amount: "Amount",
      message: "Transfer Message",
      paidBtn: "I have transferred",
      backBtn: "Back",
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

  // Tên người dùng chuyển khoản tự động
  const transferName = (user?.full_name || user?.username || "Quy Dang").trim();
  const rawTransferMsg = `VitalAI Pro ${transferName}`;
  // Chuẩn hóa sang không dấu cho nội dung chuyển khoản ngân hàng
  const transferMessage = rawTransferMsg
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, "");

  const qrUrl = `https://img.vietqr.io/image/vietinbank-113000000000-compact2.png?amount=199000&addInfo=${encodeURIComponent(transferMessage)}&accountName=VitalAI`;

  const handleUpgradeClick = () => {
    setShowQR(true);
  };

  const handleConfirmPaid = () => {
    setIsProcessing(true);
    // Giả lập check giao dịch
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (onUpgradeSuccess) {
        onUpgradeSuccess();
      }
    }, 2500);
  };

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          !showQR ? (
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
                      <span className="text-2xl font-extrabold text-slate-880 dark:text-white">{t.freePrice}</span>
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
                        onClick={handleUpgradeClick}
                        className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 py-3 text-center text-xs font-bold text-white shadow-md hover:from-teal-700 hover:to-cyan-600 transition duration-200 focus:outline-none flex items-center justify-center gap-2"
                      >
                        {t.upgradeNow}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="payment-form"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 my-8"
            >
              {/* Header */}
              <div className="relative flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-teal-600" size={20} />
                  <div>
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">{t.paymentTitle}</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">{t.paymentSubtitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
                >
                  <X size={18} />
                </button>
              </div>

              {/* QR Panel */}
              <div className="p-6 flex flex-col items-center gap-5">
                <div className="relative rounded-2xl border border-slate-100 bg-white p-2.5 shadow-md dark:border-slate-800">
                  <img
                    src={qrUrl}
                    alt="VietQR Code"
                    className="h-56 w-56 object-contain"
                  />
                </div>

                <div className="w-full space-y-2.5 rounded-2xl bg-slate-50 p-4 text-xs dark:bg-slate-900/60">
                  <div className="flex justify-between border-b border-slate-200/50 pb-2 dark:border-slate-800">
                    <span className="text-slate-400">{t.bankName}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">VietinBank</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-2 dark:border-slate-800">
                    <span className="text-slate-400">{t.accountNum}</span>
                    <span className="font-mono font-bold text-teal-600">113000000000</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-2 dark:border-slate-800">
                    <span className="text-slate-400">{t.accountName}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">VitalAI</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/50 pb-2 dark:border-slate-800">
                    <span className="text-slate-400">{t.amount}</span>
                    <span className="font-bold text-rose-500">199.000 đ</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400">{t.message}</span>
                    <span className="rounded bg-teal-100/50 dark:bg-teal-950/40 px-2 py-1 font-mono font-bold text-teal-700 dark:text-teal-400 text-center select-all">
                      {transferMessage}
                    </span>
                  </div>
                </div>

                <div className="flex w-full gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQR(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-center text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-850 dark:text-slate-400 dark:hover:bg-slate-900 flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    {t.backBtn}
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleConfirmPaid}
                    className="flex-2 w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 py-3 text-center text-xs font-bold text-white shadow-md hover:from-teal-700 hover:to-cyan-600 transition duration-200 focus:outline-none flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {t.processing}
                      </>
                    ) : (
                      t.paidBtn
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )
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
    </div>,
    document.body
  );
}

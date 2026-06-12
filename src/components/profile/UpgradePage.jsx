import React, { useState } from "react";
import {
  ChevronLeft,
  Crown,
  Sparkles,
  Check,
  CheckCircle2,
  Star,
  ShieldCheck,
  HeartPulse,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";

export default function UpgradePage({ onBack, onUpgradeSuccess, currentPlan }) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const localT =
    {
      VI: {
        backBtn: "Quay lại hội thoại",
        title: "Trở thành hội viên Premium Pro",
        subtitle:
          "Nâng tầm chăm sóc và theo dõi sức khỏe thận của bạn với trợ lý AI chuyên nghiệp nhất.",
        freePlan: "Gói cơ bản",
        freePrice: "Miễn phí",
        freePeriod: "vĩnh viễn",
        freeDesc:
          "Tính năng cơ bản phù hợp để làm quen với các khái niệm thận học.",
        proPlan: "Gói Premium Pro",
        proPrice: "199.000đ",
        proPeriod: "/ tháng",
        proDesc:
          "Tối ưu hóa tuyệt đối sức khỏe thận của bạn bằng công nghệ hiện đại nhất.",
        active: "Gói của bạn",
        upgradeNow: "Nâng cấp ngay",
        processing: "Đang kiểm tra và xác nhận chuyển khoản...",
        successTitle: "Tuyệt vời! Giao dịch thành công!",
        successDesc:
          "Hệ thống đã nâng cấp tài khoản của bạn lên gói Premium Pro. Bạn đã sở hữu toàn bộ đặc quyền cao cấp ngay từ bây giờ.",
        successBtn: "Khám phá ngay",
        paymentTitle: "Thanh toán gói Premium Pro",
        paymentSubtitle: "Quét mã QR dưới đây hoặc chuyển khoản thủ công",
        bankName: "Ngân hàng",
        accountNum: "Số tài khoản",
        accountName: "Chủ tài khoản",
        amount: "Số tiền",
        message: "Nội dung chuyển khoản",
        paidBtn: "Tôi đã chuyển khoản",
        backBtnPayment: "Quay lại",
        features: [
          "Chatbot AI Thận học nâng cao, phân tích eGFR, Creatinine không giới hạn",
          "Trích xuất & đọc ảnh xét nghiệm sinh hóa tự động siêu tốc",
          "Kết nối đàm thoại ưu tiên bằng giọng nói với AI cực nhạy",
          "Không giới hạn số lượt hỏi đáp hàng ngày",
          "Bảng biểu theo dõi sức khỏe & đề xuất cảnh báo sớm",
          "Hỗ trợ giải đáp khẩn cấp 24/7 từ chuyên viên kỹ thuật",
        ],
        freeFeatures: [
          "Phân tích chatbot cơ bản (Tối đa 10 tin nhắn/ngày)",
          "Độ phản hồi ở mức trung bình",
          "Tải ảnh xét nghiệm sinh hóa cơ bản",
        ],
        trustTitle: "An tâm chăm sóc sức khỏe 24/7",
        trustDesc:
          "Dữ liệu sức khỏe của bạn được mã hóa hoàn toàn và chỉ sử dụng cho mục đích tư vấn sức khỏe cá nhân.",
      },
      EN: {
        backBtn: "Back to Chat",
        title: "Become a Premium Pro Member",
        subtitle:
          "Elevate your kidney health tracking with our most advanced professional AI assistant.",
        freePlan: "Basic Plan",
        freePrice: "Free",
        freePeriod: "forever",
        freeDesc:
          "Basic functions suitable for getting familiar with kidney health metrics.",
        proPlan: "Premium Pro Plan",
        proPrice: "$9.99",
        proPeriod: "/ month",
        proDesc:
          "Perfect optimization for your kidney health using state-of-the-art tech.",
        active: "Your Plan",
        upgradeNow: "Upgrade Now",
        processing: "Securing your transaction...",
        successTitle: "Awesome! Upgrade Successful!",
        successDesc:
          "Your account is now upgraded to Premium Pro. Enjoy your unlimited access and VIP privileges.",
        successBtn: "Start Exploring Now",
        paymentTitle: "Premium Pro Plan Payment",
        paymentSubtitle: "Scan QR code below or transfer manually",
        bankName: "Bank",
        accountNum: "Account Number",
        accountName: "Account Owner",
        amount: "Amount",
        message: "Transfer Message",
        paidBtn: "I have transferred",
        backBtnPayment: "Back",
        features: [
          "Unlimited advanced kidney health consultations (eGFR, Creatinine)",
          "Automated biochemical lab report OCR & image analysis",
          "Priority latency voice recognition & fluid voice response",
          "No daily message caps or restrictions",
          "Advanced interactive health charts & early warning indicators",
          "24/7 VIP technical & usage support",
        ],
        freeFeatures: [
          "Basic chatbot consultations (Max 10 messages/day)",
          "Normal streaming speeds with delay",
          "Standard biochemical image uploads only",
        ],
        trustTitle: "Peace of mind in care 24/7",
        trustDesc:
          "Your health data is completely encrypted and only used for personal health consultation.",
      },
    }[language] || {};

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
      onUpgradeSuccess?.();
    }, 2500);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-slate-50/50 p-6 md:p-8 dark:bg-slate-950/20">
      <div className="mb-6 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <ChevronLeft size={16} />
          {localT.backBtn}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          !showQR ? (
            <motion.div
            key="upgrade-page-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="mx-auto w-full max-w-4xl space-y-10"
          >
            <div className="space-y-3 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                <Crown size={32} className="fill-amber-500 animate-pulse" />
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl dark:text-white">
                {localT.title}
              </h2>

              <p className="mx-auto max-w-xl text-sm text-slate-500 dark:text-slate-400">
                {localT.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/60">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                      {localT.freePlan}
                    </h3>

                    {currentPlan !== "Premium Pro" && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {localT.active}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      {localT.freePrice}
                    </span>
                    <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
                      ({localT.freePeriod})
                    </span>
                  </div>

                  <p className="mb-6 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {localT.freeDesc}
                  </p>

                  <div className="space-y-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                    {localT.freeFeatures.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400"
                      >
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative flex flex-col justify-between rounded-3xl border-2 border-teal-500 bg-white p-6 shadow-lg shadow-teal-500/5 dark:bg-slate-900/90">
                <div className="absolute -top-3 right-6 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                  <Star size={11} className="fill-white" />
                  PRO
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-base font-bold text-teal-700 dark:text-teal-400">
                      <Sparkles size={16} />
                      {localT.proPlan}
                    </h3>

                    {currentPlan === "Premium Pro" && (
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                        {localT.active}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {localT.proPrice}
                    </span>
                    <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
                      {localT.proPeriod}
                    </span>
                  </div>

                  <p className="mb-6 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {localT.proDesc}
                  </p>

                  <div className="space-y-3 border-t border-teal-50 pt-5 dark:border-slate-800">
                    {localT.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-teal-500 dark:text-teal-400"
                        />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentPlan !== "Premium Pro" && (
                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={handleUpgradeClick}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 py-3.5 text-center text-xs font-bold text-white shadow-lg transition duration-200 hover:from-teal-700 hover:to-cyan-600 hover:shadow-teal-500/20"
                    >
                      {localT.upgradeNow}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-teal-100 bg-teal-50/20 p-6 dark:border-teal-950/40 dark:bg-teal-950/10 md:flex-row">
              <div className="space-y-1">
                <h4 className="flex items-center gap-2 text-sm font-bold text-teal-800 dark:text-teal-400">
                  <ShieldCheck size={18} />
                  {localT.trustTitle}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {localT.trustDesc}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-teal-600">
                <HeartPulse
                  size={16}
                  className="animate-bounce text-rose-500"
                />
                KidneyCare Trust Program
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="payment-page-form"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 p-6 flex flex-col items-center gap-5 my-8 text-center"
          >
            {/* Header */}
            <div className="flex w-full items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-850">
              <CreditCard className="text-teal-600" size={24} />
              <div className="text-left">
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-100">{localT.paymentTitle}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{localT.paymentSubtitle}</p>
              </div>
            </div>

            {/* QR Panel */}
            <div className="relative rounded-2xl border border-slate-100 bg-white p-2.5 shadow-md dark:border-slate-800">
              <img
                src={qrUrl}
                alt="VietQR Code"
                className="h-56 w-56 object-contain"
              />
            </div>

            <div className="w-full space-y-2.5 rounded-2xl bg-slate-50 p-4 text-xs dark:bg-slate-900/60 text-left">
              <div className="flex justify-between border-b border-slate-200/50 pb-2 dark:border-slate-800">
                <span className="text-slate-400">{localT.bankName}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">VietinBank</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2 dark:border-slate-800">
                <span className="text-slate-400">{localT.accountNum}</span>
                <span className="font-mono font-bold text-teal-600">113000000000</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2 dark:border-slate-800">
                <span className="text-slate-400">{localT.accountName}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">VitalAI</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-2 dark:border-slate-800">
                <span className="text-slate-400">{localT.amount}</span>
                <span className="font-bold text-rose-500">199.000 đ</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-400">{localT.message}</span>
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
                {localT.backBtnPayment}
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
                    {localT.processing}
                  </>
                ) : (
                  localT.paidBtn
                )}
              </button>
            </div>
          </motion.div>
        ) ) : (
          <motion.div
            key="upgrade-page-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto my-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 size={44} />
            </div>

            <h3 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">
              {localT.successTitle}
            </h3>

            <p className="mb-8 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {localT.successDesc}
            </p>

            <button
              type="button"
              onClick={onBack}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-xs font-bold text-white shadow-lg transition duration-200 hover:from-emerald-600 hover:to-teal-700"
            >
              {localT.successBtn}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
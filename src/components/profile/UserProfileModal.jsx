import React, { useState } from "react";
import { X, User, Mail, Calendar, ShieldCheck, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function UserProfileModal({
  isOpen,
  onClose,
  user,
  userPlan,
  userInitials,
  language = "VI",
}) {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const t = {
    VI: {
      title: "Hồ sơ cá nhân",
      fullNameLabel: "Họ và tên",
      emailLabel: "Địa chỉ Email",
      planLabel: "Gói dịch vụ hiện tại",
      joinedLabel: "Ngày tham gia",
      saveBtn: "Lưu thay đổi",
      savedSuccess: "Đã cập nhật thông tin thành công!",
      closeBtn: "Đóng",
      roleAdmin: "Quản trị viên",
      standardPlan: "Gói miễn phí (Standard)",
      proPlan: "Gói nâng cao (Premium Pro)",
      memberSince: "Thành viên từ tháng 5, 2026",
    },
    EN: {
      title: "User Profile",
      fullNameLabel: "Full Name",
      emailLabel: "Email Address",
      planLabel: "Current Plan",
      joinedLabel: "Joined Date",
      saveBtn: "Save Changes",
      savedSuccess: "Profile updated successfully!",
      closeBtn: "Close",
      roleAdmin: "Administrator",
      standardPlan: "Free Plan (Standard)",
      proPlan: "Premium Plan (Pro)",
      memberSince: "Member since May, 2026",
    },
  }[language];

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      >
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-850">
          <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">{t.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Big Avatar */}
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-cyan-400 text-2xl font-bold text-white shadow-lg shadow-teal-500/20 dark:from-teal-600 dark:to-cyan-500">
              {userInitials}
              <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-emerald-500 p-1 text-white dark:border-slate-950">
                <ShieldCheck size={14} />
              </div>
            </div>
            <div className="text-center">
              <span className="inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                {userPlan.includes("Pro") || userPlan.includes("Premium") ? t.proPlan : t.standardPlan}
              </span>
            </div>
          </div>

          {/* Full Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <User size={14} />
              {t.fullNameLabel}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:border-teal-500 dark:focus:bg-slate-900"
              required
            />
          </div>

          {/* Email read-only */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Mail size={14} />
              {t.emailLabel}
            </label>
            <input
              type="email"
              value={user?.email || "quydang16012004@gmail.com"}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100/70 px-3.5 py-2.5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400"
            />
          </div>

          {/* Joined Date info */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-900/60">
            <div className="rounded-xl bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{t.joinedLabel}</p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">{t.memberSince}</p>
            </div>
          </div>

          {/* Success Banner */}
          {isSaved && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
            >
              <Check size={14} />
              {t.savedSuccess}
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-850 dark:text-slate-400 dark:hover:bg-slate-900"
            >
              {t.closeBtn}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:from-teal-700 hover:to-cyan-600 focus:outline-none dark:from-teal-600 dark:to-cyan-600"
            >
              {t.saveBtn}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

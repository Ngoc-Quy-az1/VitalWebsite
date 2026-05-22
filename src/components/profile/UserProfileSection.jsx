import React, { useState } from "react";
import ProfileDropdown from "./ProfileDropdown";
import UserProfileButton from "./UserProfileButton";
import UserProfileModal from "./UserProfileModal";
import UpgradePlanModal from "./UpgradePlanModal";
import { useDropdownMenu } from "../../hooks/useDropdownMenu";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";

export default function UserProfileSection({
  rail = false,
  isDark = false,
  onToggleTheme,
  className,
  onNavigateUpgrade, // We will call this if the parent wants to navigate to the upgrade page!
  customPlan: propPlan,
  onUpgradeSuccess,
}) {
  const { isOpen, toggle, close, containerRef, triggerRef, menuId } = useDropdownMenu();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();

  const [localPlan, setLocalPlan] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("vital_plan") || (user?.role === "ADMIN" ? "Admin" : "Standard Plan");
    }
    return "Standard Plan";
  });

  const customPlan = propPlan || localPlan;

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (!user) return null;

  const userName = user.full_name || user.username || "Người dùng";

  // Calculate initials from name
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const userInitials = getInitials(userName);

  const handleNavigate = (action) => {
    if (action !== "language") {
      close();
    }
    
    if (action === "logout") {
      logout();
    } else if (action === "profile") {
      setShowProfileModal(true);
    } else if (action === "upgrade") {
      if (onNavigateUpgrade) {
        onNavigateUpgrade(); // Open custom big page!
      } else {
        setShowUpgradeModal(true); // Fallback to modal
      }
    } else if (action === "language") {
      toggleLanguage();
    } else if (action === "help") {
      if (typeof window !== "undefined" && window.startInteractiveTour) {
        window.startInteractiveTour();
      }
    }
  };

  const handleUpgradeSuccess = () => {
    localStorage.setItem("vital_plan", "Premium Pro");
    if (onUpgradeSuccess) {
      onUpgradeSuccess();
    } else {
      setLocalPlan("Premium Pro");
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative shrink-0",
        "flex flex-col items-center",
        className
      )}
    >
      <UserProfileButton
        collapsed={rail}
        isOpen={isOpen}
        userName={userName}
        userPlan={customPlan}
        userInitials={userInitials}
        onClick={toggle}
        triggerRef={triggerRef}
        menuId={menuId}
      />

      <ProfileDropdown
        isOpen={isOpen}
        menuId={menuId}
        isDark={isDark}
        onThemeChange={onToggleTheme}
        anchorRef={triggerRef}
        usePortal={rail}
        userName={userName}
        userPlan={customPlan}
        userInitials={userInitials}
        language={language}
        rail={rail}
        onNavigate={handleNavigate}
      />

      {/* Profile Details Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        userPlan={customPlan}
        userInitials={userInitials}
        language={language}
      />

      {/* Fallback Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
        currentPlan={customPlan}
        language={language}
      />
    </div>
  );
}

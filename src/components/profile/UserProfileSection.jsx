import ProfileDropdown from "./ProfileDropdown";
import UserProfileButton from "./UserProfileButton";
import { useDropdownMenu } from "../../hooks/useDropdownMenu";
import { cn } from "../../utils/cn";

export default function UserProfileSection({
  rail = false,
  isDark = false,
  onToggleTheme,
  userName = "Ngọc Quý",
  userPlan = "Free",
  userInitials = "NQ",
  className,
}) {
  const { isOpen, toggle, close, containerRef, triggerRef, menuId } = useDropdownMenu();

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
        collapsed
        isOpen={isOpen}
        userName={userName}
        userPlan={userPlan}
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
        userPlan={userPlan}
        userInitials={userInitials}
        onNavigate={() => close()}
      />
    </div>
  );
}

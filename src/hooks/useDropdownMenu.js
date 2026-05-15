import { useCallback, useEffect, useId, useRef, useState } from "react";

export function useDropdownMenu({ onClose } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (containerRef.current?.contains(event.target)) return;
      const menuEl = document.getElementById(menuId);
      if (menuEl?.contains(event.target)) return;
      close();
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close, menuId]);

  return {
    isOpen,
    open,
    close,
    toggle,
    containerRef,
    triggerRef,
    menuId,
  };
}

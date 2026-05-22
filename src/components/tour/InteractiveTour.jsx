import React, { useState, useEffect, useRef } from "react";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext";

const tourSteps = [
  {
    selector: '[data-tour="sidebar"]',
    titleKey: "tourSidebarTitle",
    textKey: "tourSidebarText",
    position: "right",
  },
  {
    selector: '[data-tour="chat-window"]',
    titleKey: "tourChatWindowTitle",
    textKey: "tourChatWindowText",
    position: "bottom",
  },
  {
    selector: '[data-tour="input"]',
    titleKey: "tourInputTitle",
    textKey: "tourInputText",
    position: "top",
  },
  {
    selector: '[data-tour="avatar"]',
    titleKey: "tourAvatarTitle",
    textKey: "tourAvatarText",
    position: "left",
  },
];

export default function InteractiveTour() {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const requestRef = useRef(null);

  // Expose function globally to trigger the tour easily
  useEffect(() => {
    window.startInteractiveTour = () => {
      setCurrentStep(0);
      setIsActive(true);
    };
    return () => {
      delete window.startInteractiveTour;
    };
  }, []);

  // Update bounding rect based on active step
  const updateRect = () => {
    if (!isActive) return;
    const step = tourSteps[currentStep];
    const element = document.querySelector(step.selector);
    
    if (element) {
      const elementRect = element.getBoundingClientRect();
      // Only update if dimensions/coordinates changed to avoid re-renders
      setRect({
        x: elementRect.left,
        y: elementRect.top,
        width: elementRect.width,
        height: elementRect.height,
      });

      // Calculate tooltip position based on placement
      const gap = 16;
      let top = 0;
      let left = 0;

      if (step.position === "right") {
        left = elementRect.right + gap;
        top = elementRect.top + elementRect.height / 2 - 100;
      } else if (step.position === "left") {
        left = elementRect.left - 320 - gap;
        top = elementRect.top + elementRect.height / 2 - 100;
      } else if (step.position === "top") {
        left = elementRect.left + elementRect.width / 2 - 160;
        top = elementRect.top - 200 - gap;
      } else {
        // bottom
        left = elementRect.left + elementRect.width / 2 - 160;
        top = elementRect.bottom + gap;
      }

      // Constrain within viewport bounds
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < 16) left = 16;
      if (left + 320 > viewportWidth) left = viewportWidth - 336;
      if (top < 16) top = 16;
      if (top + 220 > viewportHeight) top = viewportHeight - 236;

      setTooltipPos({ top, left });
    } else {
      setRect(null);
    }
  };

  useEffect(() => {
    if (isActive) {
      updateRect();
      window.addEventListener("resize", updateRect);
      window.addEventListener("scroll", updateRect, true);
    }
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsActive(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsActive(false);
  };

  if (!isActive || !rect) return null;

  const currentInfo = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-[250] pointer-events-none">
      {/* Dim backdrop with transparent spotlight cutout */}
      <svg className="fixed inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            {/* White color leaves backdrop dark */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cutout makes spotlight zone perfectly transparent */}
            <rect
              x={rect.x - 8}
              y={rect.y - 8}
              width={rect.width + 16}
              height={rect.height + 16}
              rx="16"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15, 23, 42, 0.72)"
          mask="url(#spotlight-mask)"
          onClick={handleSkip}
          className="cursor-pointer transition-all duration-300"
        />
      </svg>

      {/* Pulsing highlight border around targeted element */}
      <div
        className="absolute border-2 border-teal-400 rounded-2xl shadow-[0_0_20px_rgba(45,212,191,0.5)] animate-pulse transition-all duration-300 pointer-events-none"
        style={{
          top: rect.y - 8,
          left: rect.x - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        }}
      />

      {/* Onboarding Dialog Card */}
      <div
        className="absolute pointer-events-auto w-[320px] rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950 transition-all duration-300 z-[260]"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1">
            <Sparkles size={12} className="fill-teal-600 dark:fill-teal-400" />
            KidneyCare Guide ({currentStep + 1}/{tourSteps.length})
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <X size={14} />
          </button>
        </div>

        <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 mb-1.5">
          {t(currentInfo.titleKey)}
        </h4>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
          {t(currentInfo.textKey)}
        </p>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-850">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            {t("tourSkip")}
          </button>

          <div className="flex items-center gap-1.5">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-0.5 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-850 dark:text-slate-400 dark:hover:bg-slate-900"
              >
                <ChevronLeft size={12} />
                {t("tourBack")}
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-0.5 rounded-lg bg-teal-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-teal-700 shadow-sm"
            >
              {currentStep === tourSteps.length - 1 ? t("tourDone") : t("tourNext")}
              {currentStep < tourSteps.length - 1 && <ChevronRight size={12} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

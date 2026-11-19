import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility,
  Type,
  Contrast,
  // Moon, (dark mode, later)
  // Sun, (dark mode, later)
  MousePointerClick,
  X,
} from "lucide-react";

interface AccessibilitySettings {
  fontSize: "normal" | "large" | "xlarge";
  highContrast: boolean;
  darkMode: boolean;
  largeCursor: boolean;
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  // Design 2: opened from the "Accessibility" link in the top bar (no extra floating button,
  // so only one round button sits at the bottom of the screen). Esc closes it.
  useEffect(() => {
    const onOpen = () => setOpen((o) => !o);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("pencom:open-a11y", onOpen);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("pencom:open-a11y", onOpen); window.removeEventListener("keydown", onKey); };
  }, []);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: "normal",
    highContrast: false,
    darkMode: false,
    largeCursor: false,
  });

  const toggleFontSize = () => {
    setSettings((prev) => {
      const next =
        prev.fontSize === "normal"
          ? "large"
          : prev.fontSize === "large"
          ? "xlarge"
          : "normal";
      // Apply to document
      const root = document.documentElement;
      root.style.fontSize =
        next === "normal" ? "16px" : next === "large" ? "18px" : "20px";
      return { ...prev, fontSize: next };
    });
  };

  const toggleHighContrast = () => {
    setSettings((prev) => {
      const next = !prev.highContrast;
      const root = document.documentElement;
      if (next) {
        root.classList.add("high-contrast");
      } else {
        root.classList.remove("high-contrast");
      }
      return { ...prev, highContrast: next };
    });
  };

  // DARK MODE: switched off for now (questionnaire DES-17: "Dark mode can come later ... only when it can be
  // properly tested across the whole website and app"). The dark colours already exist in index.css (.dark),
  // but the pages use fixed colours, so every page needs dark versions before this is turned back on.
  // To bring it back: uncomment this function, the "Dark Mode" option below, and Sun/Moon in the import.
  // const toggleDarkMode = () => {
  //   setSettings((prev) => {
  //     const next = !prev.darkMode;
  //     const root = document.documentElement;
  //     if (next) {
  //       root.classList.add("dark");
  //     } else {
  //       root.classList.remove("dark");
  //     }
  //     return { ...prev, darkMode: next };
  //   });
  // };

  const toggleLargeCursor = () => {
    setSettings((prev) => {
      const next = !prev.largeCursor;
      const root = document.documentElement;
      if (next) {
        root.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23117F21%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>') 16 16, auto";
        root.classList.add("large-cursor");
      } else {
        root.style.cursor = "";
        root.classList.remove("large-cursor");
      }
      return { ...prev, largeCursor: next };
    });
  };

  const options = [
    {
      label: "Font Size",
      value:
        settings.fontSize === "normal"
          ? "Normal"
          : settings.fontSize === "large"
          ? "Large"
          : "Extra Large",
      icon: Type,
      action: toggleFontSize,
      active: settings.fontSize !== "normal",
    },
    {
      label: "High Contrast",
      value: settings.highContrast ? "On" : "Off",
      icon: Contrast,
      action: toggleHighContrast,
      active: settings.highContrast,
    },
    // Dark Mode switch: hidden until dark mode is built and tested (see note above)
    // {
    //   label: "Dark Mode",
    //   value: settings.darkMode ? "On" : "Off",
    //   icon: settings.darkMode ? Sun : Moon,
    //   action: toggleDarkMode,
    //   active: settings.darkMode,
    // },
    {
      label: "Large Cursor",
      value: settings.largeCursor ? "On" : "Off",
      icon: MousePointerClick,
      action: toggleLargeCursor,
      active: settings.largeCursor,
    },
  ];

  return (
    <>
      {/* High Contrast CSS */}
      <style>{`
        .high-contrast {
          filter: contrast(1.4) !important;
        }
        .high-contrast img {
          filter: contrast(1.2) !important;
        }
        .large-cursor * {
          cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%23117F21' stroke-width='2'><circle cx='12' cy='12' r='10'/></svg>") 16 16, auto !important;
        }
      `}</style>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            role="dialog" aria-label="Accessibility options" className="fixed top-[calc(var(--header-h,126px)+12px)] right-4 md:right-6 z-[70] w-72 bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-[#326206] px-4 py-3 flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-white" />
              <h3 className="flex-1 !text-white font-bold text-sm">
                Accessibility Options
              </h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded-full text-white hover:bg-white/15" aria-label="Close accessibility options"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-3 space-y-1">
              {options.map((option) => (
                <button
                  key={option.label}
                  onClick={option.action}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    option.active
                      ? "bg-[#EEF3E8] text-[#234504]"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <option.icon
                    className={`w-4.5 h-4.5 shrink-0 ${
                      option.active ? "text-[#326206]" : "text-gray-400"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{option.label}</p>
                    <p
                      className={`text-xs ${
                        option.active ? "text-[#326206]" : "text-gray-400"
                      }`}
                    >
                      {option.value}
                    </p>
                  </div>
                  <div
                    className={`w-8 h-5 rounded-full transition-colors relative ${
                      option.active ? "bg-[#326206]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        option.active ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400">
                PenCom Accessibility Widget v1.0
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

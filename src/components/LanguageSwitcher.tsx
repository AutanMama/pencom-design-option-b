import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check } from "lucide-react";

type Language = {
  code: string;
  label: string;
  native: string;
  flag: string;
};

const languages: Language[] = [
  { code: "en", label: "English", native: "English", flag: "EN" },
  { code: "ha", label: "Hausa", native: "Hausa", flag: "HA" },
  { code: "ig", label: "Igbo", native: "Igbo", flag: "IG" },
  { code: "yo", label: "Yoruba", native: "Yoruba", flag: "YO" },
];

export default function LanguageSwitcher({ bar = false }: { bar?: boolean }) {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(languages[0]);

  const selectLang = (lang: Language) => {
    setCurrentLang(lang);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={bar
          ? "flex items-center gap-1 rounded px-2 py-0.5 border border-white/30 text-white opacity-90 hover:opacity-100 transition-opacity"
          : "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-black bg-white border border-[#D5DCCB] hover:border-[#326206] hover:text-[#326206] transition-colors"}
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{currentLang.flag}</span>
        <span className="sm:hidden">{currentLang.flag}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
            >
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  Select Language
                </p>
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => selectLang(lang)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50 ${
                    currentLang.code === lang.code
                      ? "bg-[#EEF3E8] text-[#234504]"
                      : "text-gray-700"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 ${
                      currentLang.code === lang.code
                        ? "bg-[#326206] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {lang.flag}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{lang.native}</p>
                    <p className="text-[10px] text-gray-400">{lang.label}</p>
                  </div>
                  {currentLang.code === lang.code && (
                    <Check className="w-3.5 h-3.5 text-[#326206]" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

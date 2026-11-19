import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Shield,
} from "lucide-react";

type AlertType = "critical" | "warning" | "info" | "success";

interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  persistent?: boolean;
}

const defaultAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Important Update",
    message:
      "All employers must remit pension contributions by the 7th of every month. Non-compliance will attract penalties under the Pension Reform Act 2014.",
    persistent: true,
  },
  {
    id: "2",
    type: "info",
    title: "New Digital Portal",
    message:
      "PenCom has launched a new online verification portal for retirees. Visit the Services page to learn more.",
  },
  {
    id: "3",
    type: "warning",
    title: "Verification Exercise",
    message:
      "All RSA holders are advised to update their KYC information with their respective PFAs before December 31, 2026.",
  },
];

const alertConfig: Record<
  AlertType,
  { bg: string; border: string; text: string; icon: typeof Info; iconColor: string }
> = {
  critical: {
    bg: "bg-gradient-to-r from-[#9D2B1F] to-[#D32F2F]",
    border: "border-[#7A2118]",
    text: "text-white",
    icon: Shield,
    iconColor: "text-white",
  },
  warning: {
    bg: "bg-gradient-to-r from-[#F59E0B] to-[#D97706]",
    border: "border-[#B45309]",
    text: "text-white",
    icon: AlertTriangle,
    iconColor: "text-white",
  },
  info: {
    bg: "bg-gradient-to-r from-[#4C7F1E] to-[#4C7F1E]",
    border: "border-[#0D47A1]",
    text: "text-white",
    icon: Info,
    iconColor: "text-white",
  },
  success: {
    bg: "bg-gradient-to-r from-[#326206] to-[#4C7F1E]",
    border: "border-[#234504]",
    text: "text-white",
    icon: CheckCircle,
    iconColor: "text-white",
  },
};

export default function AlertBanner() {
  const [alerts] = useState<Alert[]>(defaultAlerts);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const DISPLAY_SECONDS = 20;
  const [countdown, setCountdown] = useState(DISPLAY_SECONDS);

  // Auto-dismiss non-persistent alerts after 20 seconds
  useEffect(() => {
    if (countdown <= 0) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Rotate through multiple alerts
  useEffect(() => {
    if (alerts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [alerts.length]);

  const dismiss = () => setVisible(false);
  const currentAlert = alerts[currentIndex];
  const config = alertConfig[currentAlert.type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="overflow-hidden relative z-[60]"
        >
          <div
            className={`${config.bg} ${config.text} relative`}
          >
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
              <Icon className={`w-4 h-4 ${config.iconColor} shrink-0`} />
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="font-semibold text-xs uppercase tracking-wider shrink-0 hidden sm:inline">
                  {currentAlert.title}:
                </span>
                <span className="text-xs sm:text-sm truncate">
                  {currentAlert.message}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Countdown indicator */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: DISPLAY_SECONDS, ease: "linear" }}
                    />
                  </div>
                  <span className="text-[10px] opacity-70">{countdown}s</span>
                </div>
                {/* Dots for multiple alerts */}
                {alerts.length > 1 && (
                  <div className="flex gap-1">
                    {alerts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === currentIndex
                            ? "bg-white"
                            : "bg-white/40 hover:bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
                <button
                  onClick={dismiss}
                  className="p-1 hover:bg-white/20 rounded transition-colors ml-1"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

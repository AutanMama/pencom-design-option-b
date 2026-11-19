import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Megaphone, X } from "lucide-react";

// Latest updates shown in the bar under the main menu.
// In the real site these come from the CMS ("Announcement" content with start and end dates),
// so the bar only shows while there is something current.
// Order: alerts first (fraud, deadlines), then news, as the questionnaire asks (DES-30).
export const latestUpdates = [
  { label: "Fraud alert", text: "PenCom never asks for your RSA PIN or bank details by phone, SMS or social media", href: "/connect#complaint" },
  { label: "Deadline", text: "Employers must remit pension contributions within 7 working days of paying salaries (Pension Reform Act 2014)", href: "/services" },
  { label: "New circular", text: "Circular on retirees' consent for Pencare enrolment during programmed withdrawal", href: "/regulations" },
  { label: "Reminder", text: "RSA holders: update your KYC details with your PFA before 31 December 2026", href: "/operators" },
  { label: "New portal", text: "New online verification portal for retirees is now available", href: "/services#portals" },
];

export default function UpdatesTicker({ dark = false }: { dark?: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const count = latestUpdates.length;
  const next = () => setIndex((i) => (i + 1) % count);
  const prev = () => setIndex((i) => (i - 1 + count) % count);

  // Changes every 8 seconds; pauses while the mouse or a finger is on it
  useEffect(() => {
    if (paused || hidden || count < 2) return;
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [paused, hidden]);

  // Phones: swipe the bar left/right to change update (the arrows are hidden there)
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; setPaused(true); };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    setPaused(false);
    if (start === null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
  };

  if (hidden || count === 0) return null;
  const item = latestUpdates[index];
  const isAlert = /alert|deadline/i.test(item.label);
  // Design 2: a "breaking news" strip. The label is a coloured block on the left edge
  // (red for alerts, PenCom green for news). White bar under the white menu; see-through dark over photos.
  const block = isAlert ? "bg-[#9D2B1F]" : "bg-[#326206]";
  // Small pulsing dot on important alerts only, to catch the eye (stops if the device asks for less motion)
  const dot = isAlert && (
    <span className="relative inline-flex w-1.5 h-1.5 shrink-0" aria-hidden="true">
      <span className="motion-safe:animate-ping absolute inset-0 rounded-full bg-white opacity-75" />
      <span className="relative w-1.5 h-1.5 rounded-full bg-white" />
    </span>
  );
  const iconBtn = `p-1 ${dark ? "text-white/75 hover:text-white" : "text-[#514F50] hover:text-[#326206]"}`;

  return (
    <div
      className={`text-sm transition-colors duration-300 ${dark ? "bg-black/45 backdrop-blur-sm text-white" : "bg-[#F4F4F4] text-black border-y border-[#E3E3E3]"}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Latest updates"
    >
      <div className="max-w-7xl mx-auto pr-4 sm:px-4 h-[50px] sm:h-[34px] flex items-stretch gap-3">
        {/* Label block, full height of the bar */}
        <span className={`shrink-0 flex items-center gap-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white ${block}`}>
          {dot}
          <span className="max-w-[64px] sm:max-w-none leading-tight">{item.label}</span>
        </span>
        <Link to={item.href} className="group min-w-0 flex items-center gap-2.5" aria-live="polite">
          <span className={`line-clamp-2 sm:line-clamp-1 text-[13px] sm:text-sm leading-snug underline underline-offset-[3px] ${dark ? "text-white decoration-white/35 group-hover:decoration-white" : "text-black decoration-[#326206]/30 group-hover:decoration-[#326206] group-hover:text-[#326206]"}`}>
            {item.text}
          </span>
          <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-colors ${dark ? "bg-white text-[#326206] group-hover:bg-[#EEF3E8]" : "bg-[#326206] text-white group-hover:bg-black"}`}>
            Read<span className="hidden sm:inline"> more</span> <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </span>
        </Link>
        <div className="ml-auto flex items-center shrink-0 gap-1">
          <button onClick={prev} className={`hidden sm:block ${iconBtn}`} aria-label="Previous update">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className={`hidden sm:inline text-[11px] tabular-nums w-7 text-center ${dark ? "text-white/75" : "text-[#514F50]"}`}>{index + 1}/{count}</span>
          <button onClick={next} className={`hidden sm:block ${iconBtn}`} aria-label="Next update">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.dispatchEvent(new Event("pencom:open-updates"))}
            className={`hidden md:inline-flex items-center gap-1.5 ml-2 pl-3 border-l text-[11px] font-semibold uppercase tracking-[0.12em] ${dark ? "border-white/20 text-white/85 hover:text-white" : "border-gray-200 text-[#326206] hover:text-black"}`}
          >
            <Megaphone className="w-3.5 h-3.5" /> All updates
          </button>
          <button onClick={() => setHidden(true)} className={`ml-1 ${iconBtn}`} aria-label="Hide updates">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";

export default function ReportGovBadge({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <motion.a
      href="https://reportgov.ng"
      target="_blank"
      rel="noopener noreferrer"
      className={`items-center bg-gradient-to-r from-[#9D2B1F] to-[#D32F2F] text-white rounded-md transition-all ${compact ? "px-2 py-0.5 ring-1 ring-white/40" : "px-3 py-1.5 shadow-lg hover:shadow-xl"} ${className || "inline-flex"}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      title="ReportGov.ng - Report Government Activities"
    >
      <span className="text-xs font-bold tracking-wide">reportgov</span>
      <span className="ml-0.5 bg-[#326206] text-white text-[9px] font-bold px-1 py-0.5 rounded-sm">
        .ng
      </span>
    </motion.a>
  );
}

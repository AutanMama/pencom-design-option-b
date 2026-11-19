import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ExternalLink, X } from "lucide-react";

// PenCom online services. Before the user leaves, explain what the portal is for,
// who should use it and what to prepare (questionnaire DES-26).
// Only the eHub / old PCC text comes from CCD; the rest must be approved by each portal owner.

export type Portal = { name: string; url: string; what: string; who: string; need: string; next?: string; note?: string };

export const portals: Portal[] = [
  { name: "eHub", url: "https://ehub.pencom.gov.ng", what: "Apply for a new Pension Clearance Certificate (PCC).", who: "Employers", need: "Company registration details and your pension remittance records.", next: "PenCom reviews your application and you are told the outcome through eHub.", note: "Already have an approved certificate? Use the old PCC portal to view, download or print it." },
  { name: "PCC portal (old)", url: "https://pcc.pencom.gov.ng", what: "View, download or print a PCC that has already been approved.", who: "Employers", need: "Your certificate number or company details." },
  { name: "COBRA", url: "https://cobra.pencom.gov.ng", what: "Contribution and Bond Redemption Application.", who: "Employers and government agencies", need: "Your login details from PenCom." },
  { name: "PENCAP", url: "https://pensionrecap.pencom.gov.ng", what: "Pension Recapture Automated Platform.", who: "Employers", need: "Staff and remittance records." },
  { name: "PCRS", url: "https://pcrs.pencom.gov.ng", what: "Pension Contribution Remittance System.", who: "Employers", need: "Payroll and remittance details." },
  { name: "Pencare", url: "https://pencare.pencom.gov.ng", what: "Health insurance for retirees.", who: "Retirees", need: "Your personal details and the name of your PFA." },
  { name: "PPP portal", url: "https://ppp.pencom.gov.ng", what: "Register and save under the Personal Pension Plan.", who: "Self-employed and informal sector workers", need: "A valid ID and your Bank Verification Number (BVN)." },
];

export default function PortalHub({ only }: { only?: string[] }) {
  const [leaving, setLeaving] = useState<Portal | null>(null);
  const list = only ? portals.filter((p) => only.includes(p.name)) : portals;

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {list.map((p) => (
          <button
            key={p.name}
            onClick={() => setLeaving(p)}
            className="group text-left flex flex-col justify-start p-4 rounded-xl border border-gray-200 bg-white text-[#514F50] hover:border-[#326206]/40 hover:shadow-md transition-all"
          >
            <div className="w-full flex items-center justify-between">
              <span className="font-heading font-bold text-black group-hover:text-[#326206]">{p.name}</span>
              <ExternalLink className="w-4 h-4 text-[#ADAEAF] group-hover:text-[#326206]" />
            </div>
            <p className="text-sm mt-1 leading-snug">{p.what}</p>
            <p className="text-xs mt-2 font-medium text-[#326206]">For: {p.who}</p>
          </button>
        ))}
      </div>
      <PortalLeaveDialog portal={leaving} onClose={() => setLeaving(null)} />
    </>
  );
}

// The "Before you go" box. Shared by the portal cards and the footer's portal links,
// so every portal link on the site behaves the same way.
export function PortalLeaveDialog({ portal: leaving, onClose }: { portal: Portal | null; onClose: () => void }) {
  useEffect(() => {
    if (!leaving) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [leaving, onClose]);

  return (
      <AnimatePresence>
        {leaving && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => onClose()}
          >
            <motion.div
              role="dialog" aria-modal="true" aria-labelledby="leave-title"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
            >
              <button onClick={() => onClose()} className="absolute right-4 top-4 text-[#ADAEAF] hover:text-black" aria-label="Close"><X className="w-5 h-5" /></button>
              {/* PenCom identity on the hand-off (questionnaire DES-16) */}
              <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-gray-100">
                <img src="./pencom-logo-sm.png" alt="PenCom" className="h-10 w-auto" />
                <div className="leading-tight border-l border-[#ADAEAF] pl-2.5">
                  <p className="font-logo font-bold text-black">PenCom</p>
                  <p className="text-[10px] font-semibold text-black tracking-wide">ONLINE SERVICE</p>
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#326206]">Before you go</p>
              <h2 id="leave-title" className="text-2xl font-bold mt-1">{leaving.name}</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="font-semibold text-black">What it is for</dt><dd>{leaving.what}</dd></div>
                <div><dt className="font-semibold text-black">Who should use it</dt><dd>{leaving.who}</dd></div>
                <div><dt className="font-semibold text-black">What you need</dt><dd>{leaving.need}</dd></div>
                {leaving.next && <div><dt className="font-semibold text-black">What happens next</dt><dd>{leaving.next}</dd></div>}
                {leaving.note && <div className="rounded-lg bg-[#FBF4E8] p-3 text-[#6B4A16]">{leaving.note}</div>}
              </dl>
              <p className="text-xs mt-5 flex items-center gap-1.5"><ExternalLink className="w-3.5 h-3.5 shrink-0" /> The portal opens in a new tab. This page stays open so you can come back to pencom.gov.ng.</p>
              <div className="mt-4 flex gap-3">
                <a href={leaving.url} target="_blank" rel="noopener noreferrer" onClick={() => onClose()} className="flex-1 inline-flex justify-center items-center gap-2 px-5 py-3 bg-[#326206] text-white font-semibold rounded-lg hover:bg-[#234504]">
                  Continue to {leaving.name} <ArrowRight className="w-4 h-4" />
                </a>
                <button onClick={() => onClose()} className="px-5 py-3 border border-gray-300 font-semibold rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  );
}

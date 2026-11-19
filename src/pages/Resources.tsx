import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  BookOpen, FileText, HelpCircle, GraduationCap, Search, ChevronDown, MessageCircle,
  Headphones, Printer, PlayCircle, ArrowRight
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import DocumentLibrary from "@/components/DocumentLibrary";
import { faqs } from "@/lib/data";
import { matchesQuery } from "@/lib/searchMatch";

// Resources: reports, circulars, guidelines and forms in one searchable library
// (same search and filters as Regulations, built for thousands of PDFs: questionnaire DES-27),
// plus FAQs and learning materials, each with their own search.

type Tab = "documents" | "faq" | "learning";
const tabs: { key: Tab; label: string; icon: typeof BookOpen }[] = [
  { key: "documents", label: "Reports, circulars and forms", icon: FileText },
  { key: "faq", label: "FAQs", icon: HelpCircle },
  { key: "learning", label: "Learn about pensions", icon: GraduationCap },
];
// Old links (footer, menus) still open the right tab and filter
const hashMap: Record<string, { tab: Tab; type?: string }> = {
  publications: { tab: "documents", type: "Report" }, "annual-reports": { tab: "documents", type: "Report" },
  "monthly-reports": { tab: "documents", type: "Report" }, "quarterly-reports": { tab: "documents", type: "Report" },
  general: { tab: "documents" }, presentations: { tab: "documents" }, seminars: { tab: "documents" },
  documents: { tab: "documents" }, circulars: { tab: "documents", type: "Circular" }, downloads: { tab: "documents", type: "Form" },
  faq: { tab: "faq" }, guides: { tab: "learning" }, learning: { tab: "learning" },
};

const learning = [
  { title: "Understanding your RSA", text: "What a Retirement Savings Account is and how your money grows.", formats: ["Read", "Listen", "Print"] },
  { title: "The Pension Reform Act explained", text: "The main rules of the law in plain language.", formats: ["Watch", "Read", "Print"] },
  { title: "How to choose a PFA", text: "What to look at before you choose or change your Pension Fund Administrator.", formats: ["Read", "Listen"] },
  { title: "Saving with the Personal Pension Plan", text: "For traders, artisans and the self-employed.", formats: ["Watch", "Listen", "Print"] },
  { title: "Planning for retirement", text: "Steps to take in the 5 years before you retire.", formats: ["Read", "Print"] },
  { title: "Employers: your pension duties", text: "Registration, deductions, remittance and penalties.", formats: ["Watch", "Read", "Print"] },
];
const formatIcon: Record<string, typeof BookOpen> = { Read: BookOpen, Listen: Headphones, Watch: PlayCircle, Print: Printer };

function SearchBox({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADAEAF]" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full pl-9 pr-3 py-3 rounded-lg border border-gray-300 focus:border-[#326206] focus:ring-2 focus:ring-[#326206]/20 outline-none" />
    </label>
  );
}

export default function Resources() {
  const location = useLocation();
  const fromUrl = location.pathname.endsWith("/faq") ? { tab: "faq" as Tab } : hashMap[location.hash.slice(1)];
  const [tab, setTab] = useState<Tab>(fromUrl?.tab ?? "documents");
  const [docType, setDocType] = useState(fromUrl?.type ?? "");
  const [faqQuery, setFaqQuery] = useState("");
  const [learnQuery, setLearnQuery] = useState("");

  // Follow the address: /resources#downloads opens forms, plain /resources shows everything
  useEffect(() => {
    if (fromUrl) { setTab(fromUrl.tab); setDocType(fromUrl.type ?? ""); }
    else { setTab("documents"); setDocType(""); }
  }, [location.pathname, location.hash, location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredFaq = useMemo(() => faqs.filter((f) => matchesQuery(`${f.question} ${f.answer}`, faqQuery)), [faqQuery]);
  const filteredLearning = useMemo(() => learning.filter((m) => matchesQuery(`${m.title} ${m.text}`, learnQuery)), [learnQuery]);

  const pick = (t: Tab) => { setTab(t); setDocType(""); window.history.replaceState(window.history.state, "", `#/resources#${t}`); };

  return (
    <div>
      <PageBanner
        label="Resources"
        title="Resources"
        description="Search reports, circulars, guidelines and forms, find answers to common questions, and learn about pensions in Nigeria."
        bgImage="./news-tech.jpg"
      />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {Object.keys(hashMap).map((h) => <span key={h} id={h} aria-hidden="true" />)}
        <div className="flex gap-6 overflow-x-auto border-b border-[#E3E8DC]" role="tablist" aria-label="Resources">
          {tabs.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => pick(t.key)}
              className={`shrink-0 inline-flex items-center gap-2 py-3 -mb-px border-b-[3px] text-sm font-semibold transition-colors ${tab === t.key ? "border-[#326206] text-[#326206]" : "border-transparent text-black hover:text-[#326206] hover:border-[#326206]/30"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-8" role="tabpanel">
          {tab === "documents" && (
            <>
              <DocumentLibrary
                types={["Report", "Circular", "Guideline", "Form"]}
                initialType={docType}
                title="Search reports, circulars and forms"
                placeholder="Search by title, reference or topic, e.g. annual report, PCC form"
              />
              <p className="mt-8 text-sm flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link to="/regulations" className="inline-flex items-center gap-1.5 font-semibold text-[#326206] hover:underline">Laws and regulations library <ArrowRight className="w-4 h-4" /></Link>
                <Link to="/performance" className="inline-flex items-center gap-1.5 font-semibold text-[#326206] hover:underline">Industry figures dashboard <ArrowRight className="w-4 h-4" /></Link>
              </p>
            </>
          )}

          {tab === "faq" && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-center">Frequently asked questions</h2>
              <div className="mt-5 mb-2"><SearchBox value={faqQuery} onChange={setFaqQuery} label="Search FAQs" placeholder="Search questions, e.g. transfer, PIN, retire" /></div>
              <p className="text-sm mb-4" aria-live="polite"><strong className="text-black">{filteredFaq.length}</strong> question{filteredFaq.length === 1 ? "" : "s"}</p>
              <div className="space-y-2">
                {filteredFaq.map((f) => (
                  <details key={f.question} className="group bg-[#F5F7F2] rounded-3xl open:border-[#326206]/40">
                    <summary className="flex items-center justify-between gap-3 cursor-pointer list-none p-4 font-semibold text-black">
                      {f.question}<ChevronDown className="w-4 h-4 shrink-0 text-[#326206] transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="px-4 pb-4 text-sm leading-relaxed">{f.answer}</p>
                  </details>
                ))}
                {filteredFaq.length === 0 && <p className="text-center py-8">No questions match your search.</p>}
              </div>
              <div className="text-center mt-8">
                <p className="text-sm">Still have a question?</p>
                <button onClick={() => window.dispatchEvent(new Event("pencom:open-chat"))} className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#326206] text-white font-semibold rounded-full hover:bg-black">
                  <MessageCircle className="w-4 h-4" /> Ask the PenCom Assistant
                </button>
              </div>
            </div>
          )}

          {tab === "learning" && (
            <>
              <h2 className="text-2xl font-bold">Learn about pensions</h2>
              <p className="text-sm mt-1 mb-4">Short guides in simple English. Choose how you want to learn: read, listen, watch or print.</p>
              <div className="max-w-xl mb-5"><SearchBox value={learnQuery} onChange={setLearnQuery} label="Search learning materials" placeholder="Search guides, e.g. retirement, employer" /></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLearning.map((m) => (
                  <div key={m.title} className="bg-[#F5F7F2] rounded-3xl p-5 flex flex-col">
                    <GraduationCap className="w-6 h-6 text-[#326206]" />
                    <h3 className="font-semibold mt-3">{m.title}</h3>
                    <p className="text-sm mt-1 flex-1">{m.text}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {m.formats.map((f) => {
                        const Icon = formatIcon[f];
                        return <button key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold hover:border-[#326206] hover:text-[#326206]"><Icon className="w-3.5 h-3.5" /> {f}</button>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {filteredLearning.length === 0 && <p className="py-8 text-center">No guides match your search.</p>}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

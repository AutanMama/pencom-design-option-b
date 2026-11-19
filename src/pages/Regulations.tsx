import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { Scale, FileText, Shield, Download, ArrowRight, BookOpen } from "lucide-react";
import PageBanner from "@/components/PageBanner";
import DocumentLibrary from "@/components/DocumentLibrary";

// Regulations page: Pension Reform Act highlight + the searchable regulatory library
// (questionnaire DES-23, DES-27).

export default function RegulationsPage() {
  const [params] = useSearchParams();

  return (
    <div>
      <PageBanner
        label="Regulations"
        title="Regulatory library"
        description="Find the Pension Reform Act, regulations, guidelines, circulars, codes, reports and forms. Each document shows its reference number, dates and whether it is still current."
        bgImage="./news-circular.png"
      />

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 space-y-16">
        {/* Pension Reform Act highlight (kept from the original design) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-[#326206] text-white p-8 md:p-12 flex flex-col md:flex-row gap-8 [&_p]:text-white/85">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-[#326206] shrink-0"><Scale className="w-8 h-8" /></div>
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-white">Main law</span>
            <h2 className="text-4xl md:text-5xl font-extrabold mt-3 !text-white">Pension Reform Act 2014</h2>
            <p className="mt-2 leading-relaxed">The law that sets the rules for pensions for all workers in the public and private sectors in Nigeria. It replaced the Pension Reform Act 2004.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/regulations/pension-reform-act-2014" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#326206] ring-1 ring-[#326206]/25 text-sm font-bold rounded-full hover:bg-[#EEF3E8]"><BookOpen className="w-4 h-4" /> Read the Act</Link>
              <Link to="/regulations/pension-reform-act-2014" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/60 text-sm font-bold rounded-full hover:bg-white hover:text-[#326206]"><Download className="w-4 h-4" /> Download PDF</Link>
            </div>
          </div>
        </motion.div>

        {/* Library */}
        <div id="library">
          <DocumentLibrary initialQuery={params.get("q") ?? ""} initialType={params.get("type") ?? ""} />
        </div>

        {/* Data protection and information security (kept from the original design) */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3"><Shield className="w-7 h-7 text-[#326206]" /><h3 className="text-lg font-bold">Data protection</h3></div>
            <p className="text-sm leading-relaxed">PenCom protects the personal data of contributors and stakeholders in line with the Nigeria Data Protection Act 2023. <Link to="/privacy" className="font-semibold text-[#326206] underline">Read our privacy notice</Link>.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3"><FileText className="w-7 h-7 text-[#326206]" /><h3 className="text-lg font-bold">Information security</h3></div>
            <p className="text-sm leading-relaxed">PenCom's Information Security Management System protects the confidentiality, integrity and availability of pension information. <Link to="/accessibility" className="font-semibold text-[#326206] underline inline-flex items-center gap-1">Website standards <ArrowRight className="w-3.5 h-3.5" /></Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

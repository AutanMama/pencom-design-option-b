import { useEffect, useState } from "react";
import PageBanner from "@/components/PageBanner";
import HistoryTimeline, { type Milestone } from "@/components/HistoryTimeline";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Target, Eye, Users, Landmark, CheckCircle, ChevronRight, X,
  Gavel, FileCheck, Search, Scale, BookOpen, Database, MessageSquareWarning,
  Download, UserRound, Building2, History
} from "lucide-react";

// About page (13 Nov meeting + questionnaire sitemap):
// mission/vision/functions, values, organogram with full-profile pop-ups,
// timeline, past leadership, Service Charter as a web page with the signed PDF.

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.45 },
};

type Person = {
  name: string;
  title: string;
  image?: string;
  bio: string;
  duties: string[];
  departments?: string[];
};

// Board level. Name and photo come from CCD.
const chairman: Person = {
  name: "Chairman of the Board",
  title: "Chairman, Governing Board",
  bio: "Leads the Governing Board of the Commission, which sets policy direction and oversees the management of the Commission.",
  duties: ["Presides over Board meetings", "Approves the Commission's strategy and budget", "Oversees governance and accountability"],
};

// Executive management (names and photos from pencom.gov.ng, as in the original design)
const dg: Person = {
  name: "Omolola Oloworaran",
  title: "Director General",
  image: "./exec-dg.jpg",
  bio: "Chief Executive Officer of the National Pension Commission, responsible for the overall direction and administration of the Commission.",
  duties: ["Day-to-day management of the Commission", "Carries out the Board's decisions", "Represents the Commission to government, industry and the public"],
  departments: ["DG's Office", "Corporate Communications", "Internal Audit", "Strategy & Risk"],
};

const executives: Person[] = [
  {
    name: "Hon. Bello Abubakar Malabu", title: "Commissioner, Administration", image: "./exec-admin.jpg",
    bio: "Oversees administrative functions including human resources, corporate services, and general administration of the Commission.",
    duties: ["Staff and human resources", "Offices, facilities and zonal offices", "Procurement and general services"],
    departments: ["Human Resources", "Administration", "Zonal Offices"],
  },
  {
    name: "Dr. Charles Efe Sylvester Emukowhate", title: "Commissioner, Finance", image: "./exec-finance.jpg",
    bio: "Manages the Commission's financial operations, budgeting, accounting, and fiscal policy implementation.",
    duties: ["Budget and financial reporting", "Accounts and payments", "Financial controls"],
    departments: ["Finance & Accounts", "Budget"],
  },
  {
    name: "Hon. Hafiz Muhammad Kawu Ibrahim OON, Mni", title: "Commissioner, Technical", image: "./exec-tech.jpg",
    bio: "Responsible for technical operations including pension regulation, supervision, and industry standards development.",
    duties: ["Regulation and guidelines", "Investment supervision", "Research and industry data"],
    departments: ["Investment Supervision", "Research & Surveillance", "Benefits & Insurance", "Information Technology"],
  },
  {
    name: "Hon. Samuel Chigozie Uwandu, CPA", title: "Commissioner, Inspectorate", image: "./exec-insp.jpg",
    bio: "Leads the inspectorate division ensuring compliance and enforcement of pension regulations across operators.",
    duties: ["Inspection of pension operators", "Employer compliance and enforcement", "Recovery of unremitted contributions"],
    departments: ["Inspectorate", "Compliance & Enforcement", "Surveillance"],
  },
  {
    name: "Mr. Muhammad Sani Muhammad", title: "Commission Secretary / Legal Adviser", image: "./exec-sec.jpg",
    bio: "Provides legal counsel and secretariat services to the Commission, ensuring regulatory compliance and governance.",
    duties: ["Board secretariat", "Legal advice and litigation", "Licensing documentation"],
    departments: ["Legal Services", "Board Secretariat"],
  },
];

const functions = [
  { icon: Gavel, text: "Regulate and supervise the Contributory Pension Scheme (CPS)" },
  { icon: FileCheck, text: "License, regulate and supervise Pension Fund Administrators (PFAs) and Custodians (PFCs)" },
  { icon: BookOpen, text: "Issue regulations, guidelines and circulars for the pension industry" },
  { icon: Search, text: "Inspect operators and make sure employers remit contributions" },
  { icon: MessageSquareWarning, text: "Receive and investigate complaints about pension matters" },
  { icon: Scale, text: "Approve and monitor how pension funds are invested" },
  { icon: Database, text: "Keep a national data bank of pension matters" },
  { icon: Users, text: "Educate the public about pensions" },
];

const values = [
  { icon: Shield, title: "Integrity", desc: "We uphold the highest ethical standards in all our operations" },
  { icon: Target, title: "Professionalism", desc: "We deliver excellence through competence and diligence" },
  { icon: Eye, title: "Transparency", desc: "We maintain open communication with all stakeholders" },
  { icon: Users, title: "Service", desc: "We put the needs of pension contributors first" },
];

// Timeline (dates to be checked by CCD before publishing)
const timeline: Milestone[] = [
  { year: "2004", title: "Pension Reform Act 2004", desc: "The Contributory Pension Scheme (CPS) begins and the National Pension Commission is established to regulate it.", detail: "The Act replaced the old pension arrangements with personal Retirement Savings Accounts for workers in the public and private sectors, so each worker's pension is saved and invested in their own name." },
  { year: "2006", title: "First operators licensed", desc: "Pension Fund Administrators (PFAs) and Custodians (PFCs) are licensed, and workers start opening Retirement Savings Accounts (RSAs).", detail: "PFAs invest the money and PFCs keep it safe, so no single company both manages and holds a worker's pension." },
  { year: "2014", title: "Pension Reform Act 2014", desc: "The 2004 Act is repealed and re-enacted, with stronger penalties for employers who fail to remit and wider coverage.", detail: "Minimum contributions became 8% from the employee and 10% from the employer, and the scheme was opened to more workers." },
  { year: "2019", title: "Micro Pension Plan launched", desc: "Self-employed and informal sector workers can now save for retirement.", detail: "Traders, artisans and small business owners can save small amounts when they can, with part kept aside for emergencies. This is now the Personal Pension Plan." },
  { year: "2021", title: "RSA transfer window opens", desc: "Contributors can move their RSA to another PFA once a year.", detail: "Workers can choose a PFA based on its service and returns, and move at no cost, which encourages PFAs to serve contributors better." },
  { year: "2024", title: "New executive management", desc: "A new Director General and Commissioners take office.", detail: "The current leadership of the Commission. See their profiles in the Leadership section above." },
  { year: "2026", title: "New website and mobile app", desc: "A simpler website and app built around contributors, retirees and employers.", detail: "Guided services, a searchable regulatory library, the PenCom Assistant, and complaints you can track with a case reference." },
];

const charter = [
  "Respond to all enquiries within 48 hours",
  "Process RSA transfers within 5 working days",
  "Issue Pension Clearance Certificates within 10 working days",
  "Acknowledge and resolve complaints within 14 working days",
  "Publish quarterly industry reports promptly",
  "Keep our online services available and secure",
];

const sections = [
  { id: "mission", label: "Who we are" },
  { id: "values", label: "Values" },
  { id: "executive", label: "Leadership" },
  { id: "history", label: "History" },
  { id: "past-leadership", label: "Past leadership" },
  { id: "charter", label: "Service Charter" },
];

function Avatar({ p, className }: { p: Person; className: string }) {
  return p.image ? (
    <img src={p.image} alt="" className={`${className} object-cover object-top`} />
  ) : (
    <div className={`${className} bg-[#EEF3E8] text-[#326206] flex items-center justify-center`}>
      <UserRound className="w-1/2 h-1/2" />
    </div>
  );
}

function ProfileModal({ p, onClose }: { p: Person; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        role="dialog" aria-modal="true" aria-labelledby="profile-name"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid sm:grid-cols-5">
          <div className="sm:col-span-2 relative h-64 sm:h-auto bg-[#EEF3E8]">
            <Avatar p={p} className="absolute inset-0 w-full h-full" />
          </div>
          <div className="sm:col-span-3 p-6 relative">
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center" aria-label="Close profile">
              <X className="w-4 h-4" />
            </button>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#326206]">{p.title}</p>
            <h2 id="profile-name" className="text-xl font-bold mt-1 pr-8">{p.name}</h2>
            <p className="text-sm mt-3 leading-relaxed">{p.bio}</p>

            <h3 className="text-sm font-bold mt-5">Responsibilities</h3>
            <ul className="mt-2 space-y-1.5">
              {p.duties.map((d) => (
                <li key={d} className="flex gap-2 text-sm"><CheckCircle className="w-4 h-4 text-[#326206] shrink-0 mt-0.5" />{d}</li>
              ))}
            </ul>

            {p.departments && (
              <>
                <h3 className="text-sm font-bold mt-5">Departments in this office</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.departments.map((d) => <span key={d} className="text-xs px-2.5 py-1 rounded-full bg-[#EEF3E8] text-[#234504]">{d}</span>)}
                </div>
              </>
            )}

            <h3 className="text-sm font-bold mt-5">Background</h3>
            <p className="text-sm mt-1 italic">Full biography (education, career and appointment date) to be supplied by Corporate Communications.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Design 2 section label
function Kicker({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] ${light ? "text-white" : "text-[#326206]"}`}>
      <span className={`w-10 h-[2px] ${light ? "bg-white" : "bg-[#326206]"}`} aria-hidden="true" />
      {children}
    </p>
  );
}

// Design 2: tall portrait card for a leader (photo with name over it)
function PortraitCard({ p, onOpen }: { p: Person; onOpen: (p: Person) => void }) {
  return (
    <button onClick={() => onOpen(p)} className="group relative block w-full aspect-[3/4] rounded-3xl overflow-hidden bg-[#326206] text-left text-white outline-none focus-visible:ring-4 focus-visible:ring-white">
      <Avatar p={p} className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white">{p.title}</p>
        <p className="mt-1 font-bold leading-snug">{p.name}</p>
        <p className="mt-2 text-xs text-white/75 inline-flex items-center gap-1 group-hover:text-white">View profile <ChevronRight className="w-3.5 h-3.5" /></p>
      </div>
    </button>
  );
}

export default function About() {
  const [selected, setSelected] = useState<Person | null>(null);

  return (
    <div>
      <PageBanner
        label="About Us"
        title="About PenCom"
        description="The National Pension Commission is the apex regulatory body for the Nigerian pension industry, established under the Pension Reform Act 2014."
        bgImage="./banner-abstract.jpg"
      />

      {/* In-page menu */}
      <nav aria-label="On this page" className="sticky top-[var(--header-h,126px)] z-30 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); }}
              className="shrink-0 py-3.5 text-sm font-bold border-b-[3px] border-transparent hover:border-[#326206] hover:text-[#326206]">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="[&>section]:scroll-mt-[calc(var(--header-h,126px)+56px)]">

        {/* Who we are: mission (cream) and vision (dark) side by side */}
        <section id="mission" className="max-w-7xl mx-auto px-4 py-20">
          <motion.div {...fadeUp} className="grid lg:grid-cols-2 gap-5">
            <div className="rounded-3xl bg-[#F4F4F4] p-8 md:p-12">
              <Kicker>Our mission</Kicker>
              <p className="mt-6 font-heading text-2xl md:text-[28px] font-bold leading-snug text-black">To regulate, supervise and ensure the effective administration of pension matters in Nigeria, while promoting a sustainable pension system that guarantees retirement benefits for all Nigerian workers.</p>
            </div>
            <div className="rounded-3xl bg-[#234504] text-white p-8 md:p-12 relative overflow-hidden">
              <Kicker light>Our vision</Kicker>
              <p className="mt-6 font-heading text-2xl md:text-[28px] font-bold leading-snug relative">To be a model pension regulatory authority in Africa, ensuring that every Nigerian worker receives their retirement benefits as and when due, through a well-regulated and supervised pension industry.</p>
            </div>
          </motion.div>

          {/* Functions: numbered 01–08 */}
          <motion.div {...fadeUp} className="mt-20 grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <Kicker>What we do</Kicker>
              <h2 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">Our functions</h2>
              <p className="mt-4">Full list in Section 24 of the Pension Reform Act 2014.</p>
            </div>
            <ol className="lg:col-span-8 grid sm:grid-cols-2 gap-x-10">
              {functions.map((f, i) => (
                <li key={f.text} className="flex gap-5 py-5 border-t border-gray-200">
                  <span className="font-heading text-3xl font-extrabold text-[#326206] w-12 shrink-0">0{i + 1}</span>
                  <span className="pt-1 text-black font-medium leading-snug">{f.text}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        </section>

        {/* Values over a photo */}
        <section id="values" className="relative py-20 md:py-24 text-white overflow-hidden">
          <img src="./d2/team.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 35%" }} loading="lazy" />
          <div className="absolute inset-0 bg-[#326206]/85" aria-hidden="true" />
          <motion.div {...fadeUp} className="relative max-w-7xl mx-auto px-4">
            <Kicker light>What guides us</Kicker>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold !text-white">Core values</h2>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((v) => (
                <div key={v.title} className="border-t-2 border-white/50 pt-6">
                  <v.icon className="w-8 h-8 text-white" />
                  <h3 className="mt-4 text-2xl font-extrabold !text-white">{v.title}</h3>
                  <p className="mt-2 text-white/80">{v.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Leadership: Director General feature + portrait cards */}
        <section id="executive" className="max-w-7xl mx-auto px-4 py-20 md:py-24">
          <motion.div {...fadeUp}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <Kicker>Our leadership</Kicker>
                <h2 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">How the Commission is organised</h2>
              </div>
              <p className="max-w-sm text-sm">Click any person to see their full profile, responsibilities and the departments in their office.</p>
            </div>

            {/* Structure in one line */}
            <ol className="mt-8 flex flex-wrap items-center gap-2 text-sm font-semibold">
              {["Governing Board", "Director General", "Executive Commissioners", "Departments"].map((l, i) => (
                <li key={l} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="w-4 h-4 text-[#326206]" />}
                  <span className="px-3.5 py-1.5 rounded-full bg-[#F5F7F2] text-black">{l}</span>
                </li>
              ))}
            </ol>

            {/* Chairman strip */}
            <button onClick={() => setSelected(chairman)} className="group mt-8 w-full flex items-center gap-5 rounded-3xl border border-gray-200 p-5 text-left hover:border-[#326206]/40 transition-colors">
              <Avatar p={chairman} className="w-16 h-16 rounded-2xl shrink-0" />
              <span className="flex-1">
                <span className="block text-[11px] font-bold uppercase tracking-widest text-[#326206]">Governing Board</span>
                <span className="block text-lg font-extrabold text-black">{chairman.name}</span>
                <span className="block text-sm">{chairman.bio}</span>
              </span>
              <ChevronRight className="w-6 h-6 text-[#326206] group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Director General feature */}
            <div className="mt-5 grid lg:grid-cols-12 rounded-3xl overflow-hidden bg-[#326206] text-white">
              <div className="lg:col-span-5 relative min-h-[380px]">
                <Avatar p={dg} className="absolute inset-0 w-full h-full" />
              </div>
              <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center">
                <Kicker light>Chief Executive</Kicker>
                <p className="mt-4 text-sm font-bold uppercase tracking-widest text-white/70">{dg.title}</p>
                <h3 className="mt-1 text-4xl md:text-5xl font-extrabold !text-white">{dg.name}</h3>
                <p className="mt-5 text-white/85 text-lg">{dg.bio}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {dg.departments?.map((d) => <li key={d} className="text-xs px-3 py-1.5 rounded-full bg-white/10">{d}</li>)}
                </ul>
                <button onClick={() => setSelected(dg)} className="mt-8 self-start inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#326206] ring-1 ring-[#326206]/25 font-bold hover:bg-[#EEF3E8]">View full profile <ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Commissioners and Secretary as portrait cards */}
            <h3 className="mt-12 text-sm font-bold uppercase tracking-widest">Executive Commissioners and Commission Secretary</h3>
            <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {executives.map((p) => (
                <div key={p.name}>
                  <PortraitCard p={p} onOpen={setSelected} />
                  <ul className="mt-3 space-y-1">
                    {p.departments?.map((d) => (
                      <li key={d} className="text-xs flex items-center gap-1.5"><Building2 className="w-3 h-3 text-[#326206]" />{d}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-[11px] mt-6">Department names are shown for layout; the final structure will come from Human Resources.</p>
          </motion.div>
        </section>

        {/* History on a dark band */}
        <section id="history" className="bg-[#326206] py-20 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <Kicker light>Our journey</Kicker>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold !text-white">Our history</h2>
            <p className="mt-3 text-white/75 max-w-2xl">Scroll down through our story, or pick a year to jump straight to it.</p>
            <div className="mt-6"><HistoryTimeline items={timeline} /></div>
            <p className="text-xs mt-6 text-white/60">Dates to be confirmed by Corporate Communications before publishing.</p>
          </div>
        </section>

        {/* Past leadership */}
        <section id="past-leadership" className="max-w-7xl mx-auto px-4 py-20">
          <motion.div {...fadeUp} className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <History className="w-8 h-8 text-[#326206]" />
              <h2 className="mt-4 text-4xl font-extrabold">Past leadership</h2>
              <p className="mt-3">Former Chairmen of the Board and Directors General since 2004, with their years in office.</p>
              <p className="text-xs mt-4">Names, photos and years in office will be added from Corporate Communications records.</p>
            </div>
            <div className="lg:col-span-8 grid md:grid-cols-2 gap-5">
              {["Former Chairmen of the Board", "Former Directors General"].map((group) => (
                <div key={group} className="rounded-3xl bg-[#F5F7F2] p-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#326206] mb-4">{group}</h3>
                  <ul className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <li key={n} className="flex items-center gap-3 bg-white rounded-2xl p-3">
                        <span className="w-12 h-12 rounded-xl bg-[#EEF3E8] text-[#326206] flex items-center justify-center"><UserRound className="w-6 h-6" /></span>
                        <span className="flex-1">
                          <span className="block h-3 w-40 rounded bg-gray-200" />
                          <span className="block h-2.5 w-24 rounded bg-gray-100 mt-1.5" />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Service Charter */}
        <section id="charter" className="max-w-7xl mx-auto px-4 pb-20 md:pb-24">
          <motion.div {...fadeUp} className="rounded-3xl bg-[#F4F4F4] p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <Kicker>Our promise</Kicker>
                <h2 className="mt-4 text-4xl md:text-5xl font-extrabold">Service Charter</h2>
                <p className="mt-4 max-w-2xl">PenCom is committed to efficient, transparent and courteous service. These are the standards you can expect. If we fall short, you can complain and we will put it right.</p>
              </div>
              <a href="#charter" className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#326206] text-white font-bold hover:bg-black">
                <Download className="w-4 h-4" /> Signed Service Charter (PDF)
              </a>
            </div>
            <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
              {charter.map((c, i) => (
                <li key={c} className="flex gap-4 py-5 border-t border-black/10">
                  <span className="font-heading text-2xl font-extrabold text-[#326206]">0{i + 1}</span>
                  <span className="pt-1 font-semibold text-black">{c}</span>
                </li>
              ))}
            </ol>
            <p className="text-xs mt-6 flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5" /> The web version above is a summary; the signed PDF is the official document.</p>
          </motion.div>
        </section>
      </div>

      <AnimatePresence>{selected && <ProfileModal p={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </div>
  );
}

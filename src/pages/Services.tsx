import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowRightLeft, FileCheck, Heart, Calculator, ArrowRight,
  Wallet, MessageSquareWarning, Flag, KeyRound, Armchair, Users, Briefcase,
  CheckCircle2, ListChecks, UserCheck, Compass, Info, Smartphone, PiggyBank, ShieldCheck, Clock
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import PortalHub from "@/components/PortalHub";

// Services page (questionnaire DES-25 + 13 Nov meeting):
// step-by-step guides (who it is for, what you need, steps, where to go next),
// Personal Pension Plan in its own section, calculator with "estimate only" disclaimer,
// and the portal hub. Guide wording must be checked by the departments responsible.

type Audience = "Contributors" | "Retirees" | "Employers";
export type Guide = {
  id: string;
  title: string;
  icon: typeof ArrowRightLeft;
  audience: Audience[];
  summary: string;
  who: string;
  need: string[];
  steps: string[];
  next: { label: string; to: string }[];
  time?: string;
};

export const guides: Guide[] = [
  {
    id: "open-rsa", title: "Open a Retirement Savings Account (RSA)", icon: KeyRound, audience: ["Contributors"],
    summary: "Your RSA is your personal pension account. You keep it for life, even when you change jobs.",
    who: "Anyone working for an employer with 3 or more staff, and self-employed people who want to save for retirement.",
    need: ["National Identification Number (NIN)", "Bank Verification Number (BVN)", "A valid ID (national ID card, driver's licence or passport)", "A recent passport photograph", "Your employer's details (if employed)"],
    steps: ["Choose a licensed Pension Fund Administrator (PFA) from the list of PFAs.", "Visit the PFA's office or website and fill the registration form.", "The PFA captures your details and fingerprints.", "You receive your RSA PIN by SMS. Give the PIN to your employer so your contributions are paid into your account."],
    next: [{ label: "Find a licensed PFA", to: "/operators" }, { label: "Transfer your RSA later", to: "/services#rsa-transfer" }],
    time: "Usually within a few days",
  },
  {
    id: "rsa-transfer", title: "Transfer your RSA to another PFA", icon: ArrowRightLeft, audience: ["Contributors", "Retirees"],
    summary: "You can move your RSA to a different PFA once a year, free of charge.",
    who: "RSA holders whose details are up to date and who have not transferred in the last 12 months.",
    need: ["Your RSA PIN", "Up-to-date KYC (Know Your Customer) details with your current PFA", "A valid ID"],
    steps: ["Look at each PFA's published returns and fees.", "Contact the new PFA you want to move to and fill their transfer request form.", "The new PFA checks your details with your current PFA.", "Your current PFA moves your money and records to the new PFA. You get an SMS when it is done."],
    next: [{ label: "See PFA returns", to: "/operators#performance" }, { label: "Lodge a complaint about a delay", to: "/services#complaints" }],
    time: "Set by the transfer guidelines",
  },
  {
    id: "retirement", title: "Get your retirement benefits", icon: Armchair, audience: ["Retirees"],
    summary: "When you retire, your PFA pays your benefits from your RSA. You choose how you want to be paid.",
    who: "RSA holders who have retired at 50 or above, or who left work because of ill health. Special rules apply if you lose your job before 50.",
    need: ["Your RSA PIN and a valid ID", "Your retirement or exit letter", "Your birth certificate or age declaration", "Your bank account details", "Recent payslips (if asked by your PFA)"],
    steps: ["Contact your PFA a few months before your retirement date.", "Submit your documents and fill the benefits application form.", "Choose how to be paid: Programmed Withdrawal (monthly payments from your PFA) or an Annuity (monthly payments for life from an insurance company).", "You may also receive a lump sum, as long as enough is left to pay your monthly pension.", "Your PFA processes the payment and you start receiving your pension."],
    next: [{ label: "Join Pencare health insurance", to: "/services#pencare" }, { label: "Find your PFA's contact", to: "/operators" }],
  },
  {
    id: "pcc", title: "Get a Pension Clearance Certificate (PCC)", icon: FileCheck, audience: ["Employers"],
    summary: "A PCC shows that your company obeys the Pension Reform Act. You need it to bid for government contracts.",
    who: "Employers and companies doing business with government.",
    need: ["Company registration (CAC) documents", "Evidence of pension remittances for your staff", "Group Life Insurance policy for your staff", "Your employer code"],
    steps: ["Go to eHub to apply for a new PCC.", "Fill the application and upload your documents.", "PenCom checks your records.", "When approved, download your certificate. Certificates approved before eHub can be viewed or printed on the old PCC portal."],
    next: [{ label: "Go to the portals", to: "/services#portals" }, { label: "Register your staff", to: "/services#enrolment" }],
  },
  {
    id: "enrolment", title: "Register your staff (employer enrolment)", icon: Users, audience: ["Employers"],
    summary: "Every employer with 3 or more staff must register and pay pension contributions.",
    who: "Employers in the public and private sector.",
    need: ["Company registration documents", "List of staff and their RSA PINs", "Monthly payroll details"],
    steps: ["Register your company with PenCom to get an employer code.", "Ask every staff member to open an RSA with a PFA of their choice.", "Deduct at least 8% from each staff member's pay and add at least 10% as the employer.", "Remit both to each staff member's PFA by the 7th working day after salary payment."],
    next: [{ label: "Get your PCC", to: "/services#pcc" }],
  },
  {
    id: "complaints", title: "Make an enquiry or complaint", icon: MessageSquareWarning, audience: ["Contributors", "Retirees", "Employers"],
    summary: "If your PFA, PFC or employer has not solved your problem, PenCom can help.",
    who: "Anyone with a pension question or a problem that was not solved.",
    need: ["Your name and contact details", "Your RSA PIN (only if your complaint is about your account; never share your password)", "Any letters or receipts that help explain the problem"],
    steps: ["First contact your PFA and give them a chance to solve it.", "If it is not solved, fill the complaint form on this website.", "You receive a case reference number.", "PenCom acknowledges and works to resolve it within 14 working days."],
    next: [{ label: "Lodge a complaint", to: "/connect#complaint" }, { label: "Ask the PenCom Assistant", to: "#chat" }],
    time: "Within 14 working days",
  },
  {
    id: "report", title: "Report an employer", icon: Flag, audience: ["Contributors"],
    summary: "Tell us if your employer deducts pension from your pay but does not pay it into your RSA.",
    who: "Employees, or anyone who knows an employer is not complying.",
    need: ["The employer's name and address", "The months affected", "Payslips or statements, if you have them"],
    steps: ["Fill the 'Report an employer' form.", "You can choose to keep your identity confidential.", "PenCom's inspectors investigate the employer.", "Unpaid contributions are recovered with penalties where the law allows."],
    next: [{ label: "Report an employer", to: "/connect#report" }],
  },
  {
    id: "pencare", title: "Pencare health insurance for retirees", icon: Heart, audience: ["Retirees"],
    summary: "Pencare gives retirees under the Contributory Pension Scheme access to health insurance.",
    who: "Retirees receiving their pension through their PFA.",
    need: ["Your RSA PIN", "Your consent, given through your PFA"],
    steps: ["Ask your PFA about Pencare.", "Give your consent to enrol.", "Choose a health care provider near you.", "Use your Pencare card when you visit the provider."],
    next: [{ label: "See the Pencare circular", to: "/regulations" }, { label: "Go to the portals", to: "/services#portals" }],
  },
];

const audienceFilters: { key: "All" | Audience; icon: typeof Users }[] = [
  { key: "All", icon: Compass }, { key: "Contributors", icon: Users }, { key: "Retirees", icon: Armchair }, { key: "Employers", icon: Briefcase },
];

const sections = [
  { id: "guides", label: "Step-by-step guides" },
  { id: "ppp", label: "Personal Pension Plan" },
  { id: "calculator", label: "Pension calculator" },
  { id: "portals", label: "Online services" },
];

// Design 2: the chosen guide opens as a wide panel with a dark header and steps laid out across
function GuidePanel({ g }: { g: Guide }) {
  return (
    <motion.article key={g.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="rounded-3xl overflow-hidden border border-gray-200">
      <div className="bg-[#326206] text-white p-7 md:p-10 grid lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-8">
          <span className="w-14 h-14 rounded-2xl bg-white text-[#326206] ring-1 ring-[#326206]/25 flex items-center justify-center"><g.icon className="w-7 h-7" /></span>
          <h3 className="mt-5 text-3xl md:text-4xl font-extrabold !text-white leading-tight">{g.title}</h3>
          <p className="mt-3 text-lg text-white/85">{g.summary}</p>
        </div>
        {g.time && <p className="lg:col-span-4 lg:justify-self-end inline-flex items-center gap-2 text-sm font-bold text-[#326206] bg-white px-4 py-2 rounded-full"><Clock className="w-4 h-4" /> {g.time}</p>}
      </div>

      <div className="p-7 md:p-10 bg-white">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#326206]"><UserCheck className="w-4 h-4" /> Who it is for</h4>
            <p className="mt-3 text-lg text-black">{g.who}</p>
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#326206]"><ListChecks className="w-4 h-4" /> What you need</h4>
            <ul className="mt-3 flex flex-wrap gap-2">
              {g.need.map((n) => <li key={n} className="text-sm px-3.5 py-2 rounded-full bg-[#F5F7F2] text-black flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#326206]" />{n}</li>)}
            </ul>
          </div>
        </div>

        <h4 className="mt-10 text-[11px] font-bold uppercase tracking-widest text-[#326206]">Steps</h4>
        <ol className={`mt-4 grid gap-4 sm:grid-cols-2 ${g.steps.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {g.steps.map((st, i) => (
            <li key={st} className="rounded-2xl bg-[#F4F4F4] p-5">
              <span className="font-heading text-4xl font-extrabold text-[#326206]">0{i + 1}</span>
              <p className="mt-2 font-semibold text-black leading-snug">{st}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center gap-3">
          <span className="font-bold text-sm mr-2">Where to go next</span>
          {g.next.map((n) =>
            n.to === "#chat" ? (
              <button key={n.label} onClick={() => window.dispatchEvent(new Event("pencom:open-chat"))} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border-2 border-[#326206] text-[#326206] text-sm font-bold hover:bg-black hover:text-white">{n.label} <ArrowRight className="w-4 h-4" /></button>
            ) : (
              <Link key={n.label} to={n.to} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-[#326206] ring-1 ring-[#326206]/25 text-sm font-bold hover:bg-[#EEF3E8]">{n.label} <ArrowRight className="w-4 h-4" /></Link>
            )
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function Services() {
  const location = useLocation();
  const [filter, setFilter] = useState<"All" | Audience>("All");
  const hashId = location.hash.slice(1);
  const [activeId, setActiveId] = useState(guides.some((g) => g.id === hashId) ? hashId : guides[0].id);

  // Links like /services#pcc open that guide
  useEffect(() => {
    if (guides.some((g) => g.id === hashId)) {
      setActiveId(hashId);
      setFilter("All");
    }
  }, [hashId]);

  const shown = useMemo(() => (filter === "All" ? guides : guides.filter((g) => g.audience.includes(filter))), [filter]);
  const active = guides.find((g) => g.id === activeId) ?? guides[0];

  // Pick a guide: update the address (so it can be shared) without jumping the page;
  // on phones, scroll down to the guide because the list sits above it.
  const pick = (id: string) => {
    setActiveId(id);
    window.history.replaceState(window.history.state, "", `#/services#${id}`);
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const el = document.getElementById("guide-panel");
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 126) - 60, behavior: "smooth" });
      }, 50);
    }
  };

  return (
    <div>
      <PageBanner
        label="Services"
        title="Pension services"
        description="Simple step-by-step guides for contributors, retirees and employers, plus the Personal Pension Plan, the pension calculator and PenCom's online services."
        bgImage="./banner-family.jpg"
      />

      <nav aria-label="On this page" className="sticky top-[var(--header-h,126px)] z-30 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto">
          {sections.map((s) => (
            <Link key={s.id} to={`/services#${s.id}`} className="shrink-0 py-3.5 text-sm font-bold border-b-[3px] border-transparent hover:border-[#326206] hover:text-[#326206]">{s.label}</Link>
          ))}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20 space-y-20">
        {/* Step-by-step guides */}
        <section id="guides">
          {/* Anchors so /services#pcc etc. scroll here */}
          {guides.map((g) => <span key={g.id} id={g.id} className="block relative -top-4" aria-hidden="true" />)}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#326206]"><span className="w-10 h-[2px] bg-[#326206]" />Step-by-step guides</p>
              <h2 className="mt-4 text-4xl md:text-5xl font-extrabold">What do you want to do?</h2>
            </div>
            <div className="inline-flex flex-wrap gap-1 p-1 rounded-full bg-[#F5F7F2]" role="group" aria-label="Show guides for">
              {audienceFilters.map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)} aria-pressed={filter === f.key}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === f.key ? "bg-[#326206] text-white" : "text-black hover:text-[#326206]"}`}>
                  <f.icon className="w-4 h-4" /> {f.key === "All" ? "All guides" : f.key}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3" aria-label="Guides">
            {shown.map((g) => {
              const on = active.id === g.id;
              return (
                <li key={g.id}>
                  <button onClick={() => pick(g.id)} aria-current={on}
                    className={`group w-full h-full flex flex-col justify-between gap-6 p-5 rounded-3xl text-left transition-colors ${on ? "bg-[#326206] text-white" : "bg-[#F5F7F2] hover:bg-[#EEF3E8]"}`}>
                    <span className="flex items-center justify-between">
                      <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${on ? "bg-white text-[#326206] ring-1 ring-[#326206]/25" : "bg-white text-[#326206]"}`}><g.icon className="w-5 h-5" /></span>
                      <span className={`font-heading text-xl font-extrabold ${on ? "text-white" : "text-[#326206]/30"}`}>0{guides.indexOf(g) + 1}</span>
                    </span>
                    <span className={`font-bold leading-snug ${on ? "text-white" : "text-black"}`}>{g.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6" id="guide-panel">
            <GuidePanel g={active} />
            <p className="text-xs mt-3 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Guides are written in plain language. The departments responsible will check each one before it is published.</p>
          </div>
        </section>

        {/* Personal Pension Plan: its own section (13 Nov meeting) */}
        <section id="ppp" className="rounded-3xl overflow-hidden bg-[#326206] text-white">
          <div className="relative h-56 md:h-72">
            <img src="./d2/trader.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 30%" }} loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
          </div>
          <div className="grid lg:grid-cols-2 -mt-16 relative">
            <div className="p-7 md:p-10">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">For the self-employed and informal sector</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-2">Personal Pension Plan (PPP)</h2>
              <p className="mt-3 text-white/85 leading-relaxed">Traders, artisans, farmers, drivers, small business owners and anyone without an employer can save for retirement with a licensed PFA, in amounts that suit them.</p>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                {[
                  { icon: PiggyBank, t: "Save any amount", d: "Daily, weekly or monthly, when you can" },
                  { icon: Wallet, t: "Emergency savings", d: "Part of what you save can be kept aside for emergencies" },
                  { icon: ShieldCheck, t: "Regulated by PenCom", d: "Your money is kept safe by a licensed custodian" },
                  { icon: Smartphone, t: "Join from your phone", d: "Register online or through your PFA's app" },
                ].map((b) => (
                  <li key={b.t} className="flex gap-3 rounded-2xl bg-white/[0.07] border border-white/10 p-4">
                    <b.icon className="w-5 h-5 text-white shrink-0 mt-0.5" />
                    <span><span className="block font-semibold text-sm">{b.t}</span><span className="block text-xs text-white/75">{b.d}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-7 md:p-10">
              <h3 className="text-xl font-bold">How to join</h3>
              <ol className="mt-4 space-y-3">
                {["Choose a licensed PFA.", "Register with your NIN, BVN and phone number.", "Get your RSA PIN by SMS.", "Start saving through your bank, USSD or the PFA's app."].map((s, i) => (
                  <li key={s} className="flex gap-4"><span className="font-heading text-2xl font-extrabold text-white w-9 shrink-0">0{i + 1}</span><span className="pt-0.5 text-white/90">{s}</span></li>
                ))}
              </ol>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/operators" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#326206] ring-1 ring-[#326206]/25 font-bold hover:bg-[#EEF3E8]">Find a PFA <ArrowRight className="w-4 h-4" /></Link>
                <Link to="/services#portals" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-white/60 font-bold hover:bg-white hover:text-[#326206]">PPP portal</Link>
              </div>
              <div className="mt-8 rounded-2xl border border-dashed border-white/40 p-4">
                <p className="text-sm font-semibold">New PPP products</p>
                <p className="text-xs text-white/70 mt-1">New products and offers under the Personal Pension Plan will be listed here as they are launched.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section id="calculator">
          <PensionCalculator />
        </section>

        {/* Portal hub */}
        <section id="portals">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#326206]"><span className="w-10 h-[2px] bg-[#326206]" />Online services</p>
          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold">PenCom portals</h2>
          <p className="mt-1 mb-6">Choose a portal to see what it is for and what you need before you go.</p>
          <PortalHub />
        </section>
      </div>
    </div>
  );
}

const naira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");

function PensionCalculator() {
  const [salary, setSalary] = useState("");
  const [years, setYears] = useState("");
  const [balance, setBalance] = useState("");
  const [employee, setEmployee] = useState("8");
  const [employer, setEmployer] = useState("10");
  const [result, setResult] = useState<{ total: number; mine: number; theirs: number; monthly: number } | null>(null);

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const s = Number(salary), y = Number(years), b = Number(balance) || 0;
    if (!s || !y) return;
    const mine = s * (Number(employee) / 100) * 12 * y;
    const theirs = s * (Number(employer) / 100) * 12 * y;
    setResult({ total: mine + theirs + b, mine, theirs, monthly: s * (Number(employee) + Number(employer)) / 100 });
  };

  const field = "mt-1.5 w-full px-4 py-3 rounded-2xl bg-white border border-transparent focus:border-[#326206] focus:ring-2 focus:ring-[#326206]/20 outline-none";

  return (
    <div className="grid lg:grid-cols-5 gap-6 items-start">
      <form onSubmit={calculate} className="lg:col-span-3 bg-[#F5F7F2] rounded-3xl p-7 md:p-10">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-12 h-12 rounded-2xl bg-[#326206] flex items-center justify-center"><Calculator className="w-6 h-6 text-white" /></span>
          <div>
            <h2 className="text-3xl font-extrabold">Pension calculator</h2>
            <p className="text-sm">See roughly how much your contributions add up to.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-black">Monthly salary (₦)
            <input type="number" min="0" inputMode="numeric" required value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. 250000" className={field} />
          </label>
          <label className="text-sm font-medium text-black">Years until retirement
            <input type="number" min="1" max="50" inputMode="numeric" required value={years} onChange={(e) => setYears(e.target.value)} placeholder="e.g. 25" className={field} />
          </label>
          <label className="text-sm font-medium text-black">Your contribution (%)
            <input type="number" min="8" step="0.5" value={employee} onChange={(e) => setEmployee(e.target.value)} className={field} />
            <span className="block text-xs font-normal mt-1">At least 8% by law</span>
          </label>
          <label className="text-sm font-medium text-black">Employer contribution (%)
            <input type="number" min="10" step="0.5" value={employer} onChange={(e) => setEmployer(e.target.value)} className={field} />
            <span className="block text-xs font-normal mt-1">At least 10% by law</span>
          </label>
          <label className="text-sm font-medium text-black sm:col-span-2">Current RSA balance (₦, optional)
            <input type="number" min="0" inputMode="numeric" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="Check your latest RSA statement" className={field} />
          </label>
        </div>
        <button className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#326206] text-white font-bold hover:bg-black"><Calculator className="w-4 h-4" /> Calculate</button>
      </form>

      <div className="lg:col-span-2 space-y-4">
        <div className="rounded-3xl bg-[#326206] text-white p-7 md:p-8 [&_dd]:!text-white [&_dt]:text-white/75" aria-live="polite">
          {result ? (
            <>
              <p className="text-sm text-white/80">Your contributions could add up to</p>
              <p className="font-heading text-4xl md:text-5xl font-extrabold text-white mt-2">{naira(result.total)}</p>
              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><dt>Paid in every month</dt><dd className="font-semibold text-black">{naira(result.monthly)}</dd></div>
                <div className="flex justify-between"><dt>From you</dt><dd className="font-semibold text-black">{naira(result.mine)}</dd></div>
                <div className="flex justify-between"><dt>From your employer</dt><dd className="font-semibold text-black">{naira(result.theirs)}</dd></div>
                {Number(balance) > 0 && <div className="flex justify-between"><dt>Current balance</dt><dd className="font-semibold text-black">{naira(Number(balance))}</dd></div>}
              </dl>
            </>
          ) : (
            <p className="font-heading text-2xl font-bold leading-snug text-white">Enter your salary and years until retirement, then press Calculate.</p>
          )}
        </div>
        <div className="rounded-3xl bg-[#F4F4F4] p-6" role="note">
          <p className="font-bold text-sm text-black flex items-center gap-2"><Info className="w-4 h-4 text-[#8A5E1C]" /> Estimate only</p>
          <p className="text-sm mt-1 text-[#5A4A2E]">This figure only adds up contributions. It does not include investment returns, fees, salary changes or gaps in payment, so your real balance will be different. For your actual balance, check your RSA statement or contact your PFA.</p>
        </div>
      </div>
    </div>
  );
}

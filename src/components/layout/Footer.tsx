import { useState, type FormEvent, type SVGProps } from "react";
import { Link } from "react-router";
import {
  Mail, Phone, MapPin, ExternalLink, ArrowRight, ChevronDown, CheckCircle2,
  Apple, Play, Facebook, Linkedin, Instagram, Youtube, ShieldCheck, Accessibility
} from "lucide-react";
import ReportGovBadge from "@/components/ReportGovBadge";
import { portals as allPortals, PortalLeaveDialog, type Portal } from "@/components/PortalHub";

// Current X logo (the old Twitter bird was retired in 2023)
function XLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Compact footer: three layers instead of six (main area, portals row, bottom bar).
// Brand touches: PenCom green and the official logo.
// On phones the link columns fold up so the footer stays short.

const footerLinks: Record<string, { label: string; href: string }[]> = {
  "About PenCom": [
    { label: "About the Commission", href: "/about" },
    { label: "Mission & Vision", href: "/about#mission" },
    { label: "Leadership", href: "/about#executive" },
    { label: "Service Charter", href: "/about#charter" },
  ],
  Services: [
    { label: "Pension Services", href: "/services" },
    { label: "RSA Transfer", href: "/services#rsa-transfer" },
    { label: "Personal Pension Plan", href: "/services#ppp" },
    { label: "Pension Clearance", href: "/services#pcc" },
  ],
  Resources: [
    { label: "Publications", href: "/resources#publications" },
    { label: "Circulars", href: "/resources#circulars" },
    { label: "Downloads", href: "/resources#downloads" },
    { label: "FAQs", href: "/resources/faq" },
    { label: "Regulations", href: "/regulations" },
  ],
};

const socialLinks = [
  { icon: XLogo, href: "https://x.com/PenComNig", label: "X (formerly Twitter)" },
  { icon: Instagram, href: "https://instagram.com/_pencom_", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/PenCom.gov", label: "Facebook" },
  { icon: Youtube, href: "https://youtube.com/@pencomyoutubechannel3230", label: "YouTube" },
  { icon: Linkedin, href: "https://linkedin.com/company/national-pension-commission", label: "LinkedIn" },
];

// Same portal list and "Before you go" box as the portal cards on Home and Services
const footerPortals = ["eHub", "COBRA", "PENCAP", "PCRS", "Pencare", "PPP portal"]
  .map((n) => allPortals.find((p) => p.name === n))
  .filter((p): p is Portal => Boolean(p));

const legal = [
  { label: "Contact us", href: "/connect" },
  { label: "Report an employer", href: "/connect#report" },
  { label: "Privacy notice", href: "/privacy" },
  { label: "Cookie settings", href: "/cookies" },
];

const linkCls = "text-sm text-white/75 hover:text-white transition-colors";

export default function Footer() {
  const [leaving, setLeaving] = useState<Portal | null>(null);
  // Newsletter: check the email, then thank the person (demo; nothing is sent)
  const [email, setEmail] = useState("");
  const [signup, setSignup] = useState<"idle" | "error" | "done">("idle");
  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    setSignup(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? "done" : "error");
  };

  return (
    <footer className="relative bg-[#326206] text-white overflow-hidden">

      {/* Design 2: one compact block. Statement + contact | links | stay updated */}
      <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link to="/" className="inline-flex items-center gap-3" aria-label="PenCom home">
            <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0"><img src="./pencom-logo-sm.png" alt="" className="h-8" /></span>
            <span className="leading-tight">
              <span className="block font-logo font-bold text-lg">PenCom</span>
              <span className="block text-[10px] tracking-[0.12em] text-white/70">NATIONAL PENSION COMMISSION</span>
            </span>
          </Link>
          <p className="mt-5 font-heading text-3xl font-extrabold leading-[1.05]">Your Pension,<br /><span className="text-white/75">Your Future.</span></p>
          <p className="mt-4 text-sm text-white/75 flex flex-wrap gap-x-3 gap-y-1">
            <a href="tel:094611300" className="hover:text-white inline-flex items-center gap-1.5"><Phone className="w-4 h-4" />09-4611300</a>
            <a href="mailto:info@pencom.gov.ng" className="hover:text-white inline-flex items-center gap-1.5"><Mail className="w-4 h-4" />info@pencom.gov.ng</a>
          </p>
          <p className="mt-1.5 text-sm text-white/75 flex gap-1.5"><MapPin className="w-4 h-4 shrink-0 mt-0.5" />174, Adetokunbo Ademola Crescent, Wuse II, Abuja</p>
          <div className="mt-4 flex items-center gap-2">
            {socialLinks.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="w-8 h-8 rounded-full border border-white/25 text-white flex items-center justify-center hover:bg-white hover:text-[#326206] hover:border-white transition-colors">
                <s.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns: open lists on computers, fold-up sections on phones */}
        <nav aria-label="Footer" className="lg:col-span-5 grid sm:grid-cols-3 gap-x-6 gap-y-0 sm:gap-y-6">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <details className="group sm:hidden border-b border-white/10">
                <summary className="list-none flex items-center justify-between py-3 cursor-pointer font-semibold text-sm">
                  {title}<ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="pb-3 space-y-2">{links.map((l) => <li key={l.label}><Link to={l.href} className={linkCls}>{l.label}</Link></li>)}</ul>
              </details>
              <div className="hidden sm:block">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white mb-3">{title}</h2>
                <ul className="space-y-2">{links.map((l) => <li key={l.label}><Link to={l.href} className={linkCls}>{l.label}</Link></li>)}</ul>
              </div>
            </div>
          ))}
        </nav>

        {/* Stay updated: newsletter + app */}
        <div className="lg:col-span-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-white mb-3">Stay updated</h2>
          {signup === "done" ? (
            <p role="status" className="flex items-start gap-2 rounded-2xl bg-white/10 px-3 py-2.5 text-sm">
              <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
              <span>Thank you! You'll get news, circulars and deadlines by email.</span>
            </p>
          ) : (
            <>
              <form onSubmit={subscribe} noValidate className={`flex rounded-full overflow-hidden ring-1 focus-within:ring-white ${signup === "error" ? "ring-[#F2A193]" : "ring-white/25"}`}>
                <label className="flex-1 min-w-0"><span className="sr-only">Email address</span>
                  <input
                    type="email" value={email} placeholder="Your email"
                    onChange={(e) => { setEmail(e.target.value); if (signup === "error") setSignup("idle"); }}
                    aria-invalid={signup === "error"} aria-describedby="signup-hint"
                    className="w-full bg-white/10 pl-4 pr-3 py-2.5 text-sm text-white placeholder:text-white/70 outline-none"
                  />
                </label>
                <button className="px-4 bg-white hover:bg-[#EEF3E8] text-[#326206] font-bold text-sm flex items-center gap-1 shrink-0">Sign up <ArrowRight className="w-4 h-4" /></button>
              </form>
              <p id="signup-hint" className={`mt-2 text-[11px] ${signup === "error" ? "text-[#F2A193] font-medium" : "text-white/70"}`} aria-live="polite">
                {signup === "error" ? "Please enter a valid email address, for example name@example.com" : "News, circulars and deadlines. No spam."}
              </p>
            </>
          )}
          <div className="mt-4 flex gap-2">
            <a href="#/mobile" className="flex-1 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <Apple className="w-5 h-5 shrink-0" /><span className="leading-none"><span className="block text-[9px] opacity-70">Download on the</span><span className="text-xs font-semibold">App Store</span></span>
            </a>
            <a href="#/mobile" className="flex-1 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
              <Play className="w-5 h-5 shrink-0" /><span className="leading-none"><span className="block text-[9px] opacity-70">Get it on</span><span className="text-xs font-semibold">Google Play</span></span>
            </a>
          </div>
        </div>
      </div>

      {/* Online services, one thin row */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="text-xs font-semibold text-white/80 mr-2">Online services</span>
          {footerPortals.map((p) => (
            <button key={p.name} type="button" onClick={() => setLeaving(p)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/20 text-xs text-white/85 hover:border-white hover:text-white transition-colors">
              {p.name}<ExternalLink className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. Bottom bar: official identity, trust, legal */}
      <div className="relative bg-black/30 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-white/70">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0" aria-hidden="true"><img src="./pencom-logo-sm.png" alt="" className="h-3.5" /></span> Official website of the National Pension Commission</span>
            <ReportGovBadge />
            <Link to="/privacy" className="flex items-center gap-1.5 hover:text-white"><ShieldCheck className="w-4 h-4 text-white" /> Data protected under the NDPA 2023</Link>
            <Link to="/accessibility" className="flex items-center gap-1.5 hover:text-white"><Accessibility className="w-4 h-4 text-white" /> Accessibility</Link>
          </div>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-4 gap-y-1 lg:mr-48">
            {legal.map((l) => <Link key={l.label} to={l.href} className="hover:text-white">{l.label}</Link>)}
          </nav>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-24 sm:pb-3 -mt-1 text-[11px] text-white/60 sm:pr-4 lg:pr-48">&copy; 2026 National Pension Commission. All rights reserved.</div>
      </div>
      <PortalLeaveDialog portal={leaving} onClose={() => setLeaving(null)} />
    </footer>
  );
}

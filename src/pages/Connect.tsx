import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Clock, MessageSquare, Send, AlertTriangle, CheckCircle2, Newspaper,
  CalendarDays, Building2, ArrowRight, Search, ShieldCheck, Copy, Check, PlayCircle, Radio,
  Mic, Image as ImageIcon, FileText, Lock, EyeOff, Circle, Video
} from "lucide-react";
import PageBanner from "@/components/PageBanner";
import { latestNews } from "@/lib/data";

// Connect page (13 Nov meeting + questionnaire):
// enquiry/complaint form with a case reference, case status tracker, report an employer
// (can be confidential or anonymous), news and media centre (press releases, speeches,
// photos, videos), livestream and video archive, zonal offices with call and map.

type Tab = "complaint" | "track" | "report" | "media" | "zonal";
const tabs: { key: Tab; label: string; icon: typeof Mail }[] = [
  { key: "complaint", label: "Complaint or enquiry", icon: MessageSquare },
  { key: "track", label: "Track my case", icon: Search },
  { key: "report", label: "Report an employer", icon: AlertTriangle },
  { key: "media", label: "News and media", icon: Newspaper },
  { key: "zonal", label: "Zonal offices", icon: Building2 },
];
const hashToTab: Record<string, Tab> = {
  contact: "complaint", complaint: "complaint", enquiry: "complaint", track: "track", report: "report",
  media: "media", news: "media", videos: "media", livestream: "media", zonal: "zonal", "zonal-offices": "zonal",
};

export const zonalOffices = [
  { city: "Abuja (Headquarters)", address: "174, Adetokunbo Ademola Crescent, Wuse II, Abuja", phone: "09-4611300", email: "info@pencom.gov.ng" },
  { city: "Lagos", address: "Plot 1238, Bishop Oluwole Street, Victoria Island, Lagos", phone: "01-2770000", email: "lagos@pencom.gov.ng" },
  { city: "Kano", address: "12, Bompai Road, Kano", phone: "064-646000", email: "kano@pencom.gov.ng" },
  { city: "Port Harcourt", address: "23, Forces Avenue, Old GRA, Port Harcourt", phone: "084-230000", email: "portharcourt@pencom.gov.ng" },
  { city: "Enugu", address: "67, Ogui Road, Enugu", phone: "042-250000", email: "enugu@pencom.gov.ng" },
  { city: "Ibadan", address: "12, Awolowo Avenue, Bodija, Ibadan", phone: "02-810000", email: "ibadan@pencom.gov.ng" },
];

type MediaKind = "Press release" | "Speech" | "Photos" | "Video";
const media: { kind: MediaKind; title: string; date: string; image: string }[] = [
  ...latestNews.map((n) => ({ kind: "Press release" as const, title: n.title, date: n.date, image: n.image })),
  { kind: "Speech", title: "DG's address at the 2026 Pension Industry Stakeholders' Forum", date: "2026-10-30", image: "./exec-dg.jpg" },
  { kind: "Photos", title: "Photos: Retirees' sensitisation programme, Kano zonal office", date: "2026-10-18", image: "./banner-elders.jpg" },
  { kind: "Video", title: "How to transfer your RSA (explainer video)", date: "2026-09-25", image: "./video-poster.jpg" },
];
const mediaIcon: Record<MediaKind, typeof FileText> = { "Press release": FileText, Speech: Mic, Photos: ImageIcon, Video: PlayCircle };

const archive = [
  { title: "PenCom at Work", date: "2026-08-12", length: "0:08", src: "./highlight-video2.mp4" },
  { title: "Understanding the Contributory Pension Scheme", date: "2025-11-04", length: "0:12", src: "./highlight-video.mp4" },
  { title: "Personal Pension Plan: saving for the self-employed", date: "2025-06-20", length: "0:08", src: "./highlight-video2.mp4" },
];

const events = [
  { title: "Employers' Compliance Workshop", date: "2026-11-27", location: "Online", type: "Workshop" },
  { title: "Retirees' Town Hall: Pencare and benefits", date: "2026-12-04", location: "Lagos zonal office", type: "Town hall" },
  { title: "National Pension Conference 2027", date: "2027-02-18", location: "Abuja", type: "Conference" },
];

const fmt = (d: string) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
const field = "mt-1.5 w-full px-4 py-3 rounded-2xl border border-transparent bg-white focus:border-[#326206] focus:ring-2 focus:ring-[#326206]/20 outline-none";

// Case references made in this browser are remembered so the tracker can find them (demo only)
const STORE = "pencom-demo-cases";
type Case = { ref: string; kind: string; date: string };
const loadCases = (): Case[] => { try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch { return []; } };
const saveCase = (c: Case) => { try { localStorage.setItem(STORE, JSON.stringify([c, ...loadCases()].slice(0, 20))); } catch { /* storage blocked */ } };
const scrollToEl = (id: string) => setTimeout(() => {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 126) - 70, behavior: "smooth" });
}, 50);
const newRef = (prefix: string) => `${prefix}-2026-${Math.floor(100000 + Math.random() * 900000)}`;

function SafetyNote() {
  return (
    <div className="rounded-xl border-l-4 border-[#9D2B1F] bg-[#FBEAE8] p-4 flex gap-3 text-sm text-black">
      <Lock className="w-5 h-5 text-[#9D2B1F] shrink-0 mt-0.5" />
      <p><strong>Never</strong> type your password, bank card details or one-time codes in this form. PenCom staff will never ask for them.</p>
    </div>
  );
}

function Receipt({ refNo, title, text, onAnother }: { refNo: string; title: string; text: string; onAnother: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="text-center py-8" role="status">
      <div className="w-16 h-16 rounded-full bg-[#EEF3E8] flex items-center justify-center mx-auto"><CheckCircle2 className="w-8 h-8 text-[#326206]" /></div>
      <h3 className="text-xl font-bold mt-4">{title}</h3>
      <p className="mt-2 max-w-md mx-auto">{text}</p>
      <div className="mt-5 inline-flex items-center gap-3 rounded-xl border-2 border-dashed border-[#326206]/40 bg-[#EEF3E8] px-5 py-3">
        <span className="text-left"><span className="block text-xs">Your case reference</span><span className="font-heading text-xl font-extrabold text-[#326206] tracking-wide">{refNo}</span></span>
        <button onClick={async () => { try { await navigator.clipboard.writeText(refNo); setCopied(true); } catch { /* blocked */ } }} className="p-2 rounded-lg hover:bg-white" aria-label="Copy case reference">
          {copied ? <Check className="w-5 h-5 text-[#326206]" /> : <Copy className="w-5 h-5 text-[#326206]" />}
        </button>
      </div>
      <p className="text-xs mt-3">Keep this number. We have also sent it to your email or phone.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to={`/connect#track`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#326206] text-white font-semibold rounded-full hover:bg-black">Track this case <ArrowRight className="w-4 h-4" /></Link>
        <button onClick={onAnother} className="px-5 py-2.5 border border-gray-300 font-semibold rounded-lg hover:border-[#326206]">Send another</button>
      </div>
    </div>
  );
}

function ComplaintTab() {
  const [kind, setKind] = useState("Complaint");
  const [refNo, setRefNo] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = newRef(kind === "Complaint" ? "PC" : "PE");
    saveCase({ ref: r, kind, date: new Date().toISOString() });
    setRefNo(r);
    scrollToEl("complaint-form");
  };
  return (
    <div className="grid lg:grid-cols-5 gap-8 items-start">
      <aside className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold">How can we help?</h2>
        <p>Send us a question or a complaint. If your complaint is about your PFA, contact them first; if they do not solve it, we will.</p>
        <ul className="space-y-3">
          {[
            { icon: Phone, label: "Call us", value: "09-4611300, 0700-PENCOM", href: "tel:094611300" },
            { icon: Mail, label: "Email", value: "info@pencom.gov.ng", href: "mailto:info@pencom.gov.ng" },
            { icon: MapPin, label: "Head office", value: "174, Adetokunbo Ademola Crescent, Wuse II, Abuja" },
            { icon: Clock, label: "Opening hours", value: "Monday to Friday, 8am to 5pm" },
          ].map((c) => (
            <li key={c.label} className="flex gap-3 p-3 rounded-xl bg-white border border-gray-200">
              <c.icon className="w-5 h-5 text-[#326206] shrink-0 mt-0.5" />
              <span><span className="block text-sm font-semibold text-black">{c.label}</span>{c.href ? <a href={c.href} className="text-sm hover:text-[#326206] hover:underline">{c.value}</a> : <span className="text-sm">{c.value}</span>}</span>
            </li>
          ))}
        </ul>
        <button onClick={() => window.dispatchEvent(new Event("pencom:open-chat"))} className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#326206] text-white text-left hover:bg-[#234504]">
          <MessageSquare className="w-5 h-5 shrink-0" />
          <span><span className="block text-sm font-semibold">Ask the PenCom Assistant</span><span className="text-xs text-white/80">Quick answers and help finding the right page</span></span>
        </button>
        <div className="rounded-xl bg-[#F7F8F5] p-4 text-sm">
          <p className="font-semibold text-black">What happens next</p>
          <ol className="mt-2 space-y-1 list-decimal list-inside">
            <li>You get a case reference straight away.</li>
            <li>We acknowledge your case and assign it to the right team.</li>
            <li>We aim to resolve complaints within 14 working days.</li>
          </ol>
        </div>
      </aside>

      <div id="complaint-form" className="lg:col-span-3 bg-[#F5F7F2] rounded-3xl p-6 md:p-8">
        {refNo ? (
          <Receipt refNo={refNo} title={`${kind} received`} text="Thank you. Your case has been logged and you can follow its progress with the reference below." onAnother={() => setRefNo(null)} />
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h3 className="text-xl font-bold">Send a complaint or enquiry</h3>
            <SafetyNote />
            <fieldset>
              <legend className="text-sm font-medium text-black">What is this about? *</legend>
              <div className="mt-1 flex flex-wrap gap-2">
                {["Complaint", "Enquiry", "Feedback", "Freedom of Information request"].map((k) => (
                  <button type="button" key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${kind === k ? "bg-[#326206] text-white border-[#326206]" : "border-gray-300 hover:border-[#326206]"}`}>{k}</button>
                ))}
              </div>
            </fieldset>
            {kind === "Complaint" && (
              <label className="block text-sm font-medium text-black">Who is the complaint about? *
                <select required className={field} defaultValue="">
                  <option value="" disabled>Choose one</option>
                  <option>My PFA (Pension Fund Administrator)</option>
                  <option>My employer</option>
                  <option>An insurance company (annuity)</option>
                  <option>PenCom service</option>
                  <option>Other</option>
                </select>
              </label>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-black">Full name *<input required className={field} autoComplete="name" /></label>
              <label className="text-sm font-medium text-black">Phone number *<input required type="tel" className={field} autoComplete="tel" placeholder="080..." /></label>
              <label className="text-sm font-medium text-black">Email<input type="email" className={field} autoComplete="email" /></label>
              <label className="text-sm font-medium text-black">RSA PIN (if it is about your account)<input className={field} placeholder="PEN..." /><span className="block text-xs font-normal mt-1">Your PIN is not a password. Never share your password.</span></label>
            </div>
            <label className="block text-sm font-medium text-black">Tell us what happened *
              <textarea required rows={5} className={`${field} resize-y`} placeholder="What happened, when, and what you have already done" />
            </label>
            <label className="block text-sm font-medium text-black">Attach documents (optional)
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className={`${field} text-sm file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-[#EEF3E8] file:text-[#326206] file:font-semibold`} />
              <span className="block text-xs font-normal mt-1">Letters, statements or receipts. PDF, JPG or PNG, up to 10 MB.</span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" required className="mt-1 w-4 h-4 accent-[#326206]" />
              <span>I agree that PenCom may use these details to handle my case, as explained in the <Link to="/privacy" className="font-semibold text-[#326206] underline">privacy notice</Link>.</span>
            </label>
            <button className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 bg-[#326206] text-white font-semibold rounded-full hover:bg-black"><Send className="w-4 h-4" /> Send {kind.toLowerCase()}</button>
          </form>
        )}
      </div>
    </div>
  );
}

const stages = ["Received", "Assigned to a team", "Under review", "Resolved"];

function TrackTab() {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<{ ref: string; stage: number; date: string; kind: string } | "none" | null>(null);
  const mine = loadCases();
  const check = (e?: FormEvent, value = ref) => {
    e?.preventDefault();
    const r = value.trim().toUpperCase();
    const found = mine.find((c) => c.ref === r);
    if (found) setResult({ ref: r, stage: 0, date: found.date, kind: found.kind });
    else if (r === "PC-2026-104233") setResult({ ref: r, stage: 2, date: "2026-11-05", kind: "Complaint" });
    else setResult("none");
  };
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center">Track my case</h2>
      <p className="text-center mt-2">Enter the case reference you got when you sent your complaint, enquiry or report.</p>
      <form onSubmit={check} className="mt-6 flex gap-2">
        <label className="flex-1"><span className="sr-only">Case reference</span>
          <input value={ref} onChange={(e) => setRef(e.target.value)} required placeholder="e.g. PC-2026-104233" className={`${field} mt-0 uppercase`} />
        </label>
        <button className="px-5 rounded-full bg-[#326206] text-white font-semibold hover:bg-black">Check</button>
      </form>
      {mine.length > 0 && (
        <p className="text-xs mt-2">Your recent cases on this device: {mine.slice(0, 3).map((c, i) => <button key={c.ref} onClick={() => { setRef(c.ref); check(undefined, c.ref); }} className="font-semibold text-[#326206] underline mr-2">{c.ref}{i < Math.min(mine.length, 3) - 1 ? "" : ""}</button>)}</p>
      )}
      <p className="text-xs mt-1">Try the sample reference PC-2026-104233.</p>

      {result === "none" && (
        <div className="mt-6 rounded-xl bg-[#FBF4E8] p-5 text-sm text-black" role="status">
          <p className="font-semibold">We could not find that reference.</p>
          <p className="mt-1">Check the number and try again, or call 09-4611300 with your name and the date you sent it.</p>
        </div>
      )}
      {result && result !== "none" && (
        <div className="mt-6 bg-[#F5F7F2] rounded-3xl p-6" role="status">
          <div className="flex flex-wrap justify-between gap-2">
            <div><p className="text-xs">Case reference</p><p className="font-heading text-lg font-extrabold text-[#326206]">{result.ref}</p></div>
            <div className="text-right"><p className="text-xs">Type · sent</p><p className="font-semibold text-black">{result.kind} · {fmt(result.date)}</p></div>
          </div>
          <ol className="mt-6 space-y-4">
            {stages.map((s, i) => {
              const done = i < result.stage, now = i === result.stage;
              return (
                <li key={s} className="flex gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-[#326206] text-white" : now ? "bg-[#EEF3E8] text-[#326206] ring-2 ring-[#326206]" : "bg-gray-100 text-[#ADAEAF]"}`}>
                    {done ? <Check className="w-4 h-4" /> : <Circle className="w-3 h-3" fill={now ? "currentColor" : "none"} />}
                  </span>
                  <span className="pt-0.5">
                    <span className={`block font-semibold ${i <= result.stage ? "text-black" : ""}`}>{s}{now && <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#326206] text-white">Current stage</span>}</span>
                    {now && i === 2 && <span className="block text-sm">Our team is reviewing your case with your PFA. We will contact you if we need more information.</span>}
                    {now && i === 0 && <span className="block text-sm">We have your case and will assign it to the right team within 2 working days.</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}

function ReportTab() {
  const [anonymous, setAnonymous] = useState(false);
  const [refNo, setRefNo] = useState<string | null>(null);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = newRef("RE");
    saveCase({ ref: r, kind: "Employer report", date: new Date().toISOString() });
    setRefNo(r);
    scrollToEl("report-form");
  };
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-[#FBEAE8] flex items-center justify-center mx-auto"><AlertTriangle className="w-7 h-7 text-[#9D2B1F]" /></div>
        <h2 className="text-2xl font-bold mt-3">Report an employer</h2>
        <p className="mt-2 max-w-xl mx-auto">Is your employer deducting pension from your pay but not paying it into your RSA? Tell us and our inspectors will investigate.</p>
      </div>
      <div id="report-form" className="mt-8 bg-[#F5F7F2] rounded-3xl p-6 md:p-8">
        {refNo ? (
          <Receipt refNo={refNo} title="Report received" text={anonymous ? "Thank you. Because you reported anonymously, we cannot contact you; use the reference to check progress." : "Thank you. Your identity will be kept confidential. Use the reference to check progress."} onAnother={() => setRefNo(null)} />
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => setAnonymous(false)} aria-pressed={!anonymous} className={`flex gap-3 p-4 rounded-xl border text-left ${!anonymous ? "border-[#326206] bg-[#EEF3E8]" : "border-gray-200"}`}>
                <ShieldCheck className="w-5 h-5 text-[#326206] shrink-0" /><span><span className="block font-semibold text-black text-sm">Confidential</span><span className="text-xs">We know who you are but keep it private. We can update you.</span></span>
              </button>
              <button type="button" onClick={() => setAnonymous(true)} aria-pressed={anonymous} className={`flex gap-3 p-4 rounded-xl border text-left ${anonymous ? "border-[#326206] bg-[#EEF3E8]" : "border-gray-200"}`}>
                <EyeOff className="w-5 h-5 text-[#326206] shrink-0" /><span><span className="block font-semibold text-black text-sm">Anonymous</span><span className="text-xs">No name needed. We cannot contact you for more details.</span></span>
              </button>
            </div>
            {!anonymous && (
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="text-sm font-medium text-black">Your full name *<input required className={field} /></label>
                <label className="text-sm font-medium text-black">Phone or email *<input required className={field} /></label>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-black">Employer's name *<input required className={field} /></label>
              <label className="text-sm font-medium text-black">Employer's address or state *<input required className={field} /></label>
              <label className="text-sm font-medium text-black">What is the problem? *
                <select required className={field} defaultValue="">
                  <option value="" disabled>Choose one</option>
                  <option>Deducts pension but does not remit it</option>
                  <option>Does not deduct or pay pension at all</option>
                  <option>Pays late</option>
                  <option>Pays less than the law requires</option>
                  <option>No group life insurance</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="text-sm font-medium text-black">Which months? *<input required className={field} placeholder="e.g. January to June 2026" /></label>
            </div>
            <label className="block text-sm font-medium text-black">More details (optional)<textarea rows={4} className={`${field} resize-y`} /></label>
            <label className="block text-sm font-medium text-black">Evidence (optional)
              <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className={`${field} text-sm file:mr-3 file:px-3 file:py-1 file:rounded-md file:border-0 file:bg-[#EEF3E8] file:text-[#326206] file:font-semibold`} />
              <span className="block text-xs font-normal mt-1">Payslips or RSA statements showing deductions. Up to 10 MB.</span>
            </label>
            <SafetyNote />
            <button className="w-full inline-flex justify-center items-center gap-2 px-6 py-3 bg-[#9D2B1F] text-white font-semibold rounded-lg hover:bg-[#7A2118]"><AlertTriangle className="w-4 h-4" /> Send report</button>
            <p className="text-center text-xs">Reports are protected under the Whistleblower Protection Policy.</p>
          </form>
        )}
      </div>
    </div>
  );
}

function MediaTab() {
  const [kind, setKind] = useState<"All" | MediaKind>("All");
  const shown = media.filter((m) => kind === "All" || m.kind === kind).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="space-y-12">
      {/* Livestream */}
      <section className="grid lg:grid-cols-5 gap-6 items-center rounded-3xl bg-[#326206] text-white p-5 md:p-7">
        <div className="lg:col-span-3 relative rounded-xl overflow-hidden bg-black/30 aspect-video">
          <img src="./video-poster.jpg" alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <Radio className="w-10 h-10" />
            <p className="mt-2 font-semibold">The livestream starts here at the time below</p>
          </div>
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-xs font-bold bg-[#9D2B1F] px-2.5 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-white" /> Next livestream</span>
        </div>
        <div className="lg:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-white/80">Livestream</p>
          <h2 className="text-2xl font-bold mt-1">Employers' Compliance Workshop</h2>
          <p className="mt-2 text-white/85 flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Thursday 27 November 2026, 10:00am</p>
          <p className="mt-3 text-sm text-white/75">Watch live on this page and on PenCom's YouTube channel. The recording is added to the video archive afterwards.</p>
          <a href="https://youtube.com/@pencomyoutubechannel3230" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#234504] font-semibold rounded-lg hover:bg-[#EEF3E8]"><PlayCircle className="w-4 h-4" /> PenCom on YouTube</a>
        </div>
      </section>

      {/* News & media centre */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#326206]"><span className="w-10 h-[2px] bg-[#326206]" />News and media centre</span><h2 className="text-2xl font-bold mt-1">Latest from PenCom</h2></div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Show">
            {(["All", "Press release", "Speech", "Photos", "Video"] as const).map((k) => (
              <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${kind === k ? "bg-[#326206] text-white border-[#326206]" : "border-gray-300 hover:border-[#326206]"}`}>{k === "All" ? "All" : k === "Photos" ? "Photos" : k === "Speech" ? "Speeches" : `${k}s`}</button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {shown.map((m) => {
            const Icon = mediaIcon[m.kind];
            return (
              <article key={m.title} className="group bg-[#F5F7F2] rounded-3xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-44 overflow-hidden bg-gray-100"><img src={m.image} alt="" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" loading="lazy" /></div>
                <div className="p-4">
                  <p className="flex items-center gap-2 text-xs"><span className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-[#326206]"><Icon className="w-3.5 h-3.5" /> {m.kind}</span>· {fmt(m.date)}</p>
                  <h3 className="font-semibold mt-1.5 leading-snug group-hover:text-[#326206]">{m.title}</h3>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Video archive */}
      <section>
        <span className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#326206]"><span className="w-10 h-[2px] bg-[#326206]" />Video archive</span>
        <h2 className="text-2xl font-bold mt-1">Past videos and livestreams</h2>
        <p className="mt-1 text-sm">Older videos stay available here.</p>
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {archive.map((v) => (
            <div key={v.title} className="bg-[#F5F7F2] rounded-3xl overflow-hidden">
              <video controls preload="none" poster="./video-poster.jpg" className="w-full aspect-video object-cover bg-black"><source src={v.src} type="video/mp4" /></video>
              <div className="p-4"><p className="font-semibold text-black">{v.title}</p><p className="text-xs mt-1 flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> {fmt(v.date)} · {v.length}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section>
        <h2 className="text-2xl font-bold">Upcoming events</h2>
        <ul className="mt-5 space-y-3 max-w-3xl">
          {events.map((ev) => (
            <li key={ev.title} className="bg-[#F5F7F2] rounded-3xl p-4 flex items-center gap-4">
              <span className="w-14 h-14 rounded-xl bg-[#326206] text-white flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] uppercase">{new Date(ev.date).toLocaleDateString("en-NG", { month: "short" })}</span>
                <span className="text-lg font-bold leading-none">{new Date(ev.date).getDate()}</span>
              </span>
              <span className="flex-1 min-w-0"><span className="block font-semibold text-black">{ev.title}</span><span className="text-sm flex items-center gap-3"><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ev.location}</span><span>{ev.type}</span></span></span>
              <button className="shrink-0 px-4 py-2 rounded-lg border border-[#326206] text-[#326206] text-sm font-semibold hover:bg-[#326206] hover:text-white">Register</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ZonalTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold">Zonal offices</h2>
      <p className="mt-1">Visit or call the office nearest to you.</p>
      <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zonalOffices.map((o) => (
          <div key={o.city} className="bg-[#F5F7F2] rounded-3xl p-5">
            <h3 className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-[#326206]" /> {o.city}</h3>
            <p className="text-sm mt-2">{o.address}</p>
            <p className="text-sm mt-1"><a href={`mailto:${o.email}`} className="hover:text-[#326206] hover:underline">{o.email}</a></p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${o.phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#326206] text-white text-sm font-semibold hover:bg-black"><Phone className="w-4 h-4" /> Call {o.phone}</a>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(`PenCom ${o.address}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:border-[#326206]"><MapPin className="w-4 h-4" /> Directions</a>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs mt-4">Office addresses and numbers are sample data until confirmed by Administration.</p>
    </div>
  );
}

export default function Connect() {
  const location = useLocation();
  const fromHash = hashToTab[location.hash.slice(1)];
  const [tab, setTab] = useState<Tab>(fromHash ?? "complaint");
  useEffect(() => { if (fromHash) setTab(fromHash); }, [fromHash]);
  useEffect(() => {
    document.querySelector('nav[aria-label="Connect sections"] [aria-selected="true"]')?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [tab]);
  const pick = (t: Tab) => { setTab(t); window.history.replaceState(window.history.state, "", `#/connect#${t}`); };

  return (
    <div>
      <PageBanner
        label="Connect"
        title="Contact and media"
        description="Send a complaint or enquiry, track your case, report an employer, find a zonal office, or catch up on news, videos and livestreams."
        bgImage="./video-poster.jpg"
      />
      {Object.keys(hashToTab).map((h) => <span key={h} id={h} className="block" aria-hidden="true" />)}
      <nav aria-label="Connect sections" className="sticky top-[var(--header-h,126px)] z-30 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto" role="tablist">
          {tabs.map((t) => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => pick(t.key)}
              className={`shrink-0 inline-flex items-center gap-2 py-3.5 border-b-[3px] text-sm font-semibold transition-colors ${tab === t.key ? "border-[#326206] text-[#326206]" : "border-transparent text-black hover:text-[#326206] hover:border-[#326206]/30"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </nav>
      <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="max-w-7xl mx-auto px-4 py-10" role="tabpanel">
        {tab === "complaint" && <ComplaintTab />}
        {tab === "track" && <TrackTab />}
        {tab === "report" && <ReportTab />}
        {tab === "media" && <MediaTab />}
        {tab === "zonal" && <ZonalTab />}
      </motion.div>
    </div>
  );
}

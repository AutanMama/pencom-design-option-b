import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, BookOpen, ClipboardList, Bell, Menu, Search, ChevronLeft, ChevronRight, Users, MessageSquare,
  FileText, Bookmark, BookmarkCheck, Share2, WifiOff, Phone, MapPin, AlertTriangle, Info, Check,
  Landmark, Building2, Settings, ShieldCheck, Smartphone, Send, Paperclip, Camera, X, ArrowRight,
  HelpCircle, Type, Contrast, Download, Copy, MessageCircle, Lock, Globe
} from "lucide-react";
import { heroSlides, faqs, operators } from "@/lib/data";
import { docs, docById, docDate, isOutdated, statusStyle, latestCirculars, type Doc } from "@/lib/library";
import { guides, type Guide } from "@/pages/Services";
import { zonalOffices } from "@/pages/Connect";
import { portals, type Portal } from "@/components/PortalHub";
import { latestUpdates } from "@/components/UpdatesTicker";
import { findAnswer, quickQuestions, secretPatterns, type Answer } from "@/lib/assistant";

// PenCom mobile app prototype (questionnaire Section 5, DES-31 to DES-34):
// tabs Home, Library, Services, Alerts, More; PenCom Assistant on every screen;
// featured cards (swipe, no auto-advance); saved documents readable offline with "last updated";
// notification opt-in per category, asked in context; directories with call and map;
// complaint form with attachment and case reference. Same content as the website.

type TabKey = "home" | "library" | "services" | "alerts" | "more";
type Screen =
  | { name: "doc"; id: string } | { name: "guide"; id: string } | { name: "directory" } | { name: "complaint" }
  | { name: "track" } | { name: "faqs" } | { name: "about" } | { name: "settings" } | { name: "search"; q?: string };

const LAST_SYNC = "17 Nov 2026, 9:42am";
const alertLevel = (label: string) => /fraud/i.test(label) ? "Urgent" : /deadline/i.test(label) ? "Important" : "Notice";
const levelStyle: Record<string, string> = { Urgent: "bg-[#FBEAE8] text-[#9D2B1F]", Important: "bg-[#FBF4E8] text-[#8A5E1C]", Notice: "bg-[#EEF3E8] text-[#326206]" };
const categories = ["Circulars", "Publications", "Announcements", "Deadlines", "Complaint updates"];

// ---------- small building blocks ----------
function TopBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <div className="shrink-0 bg-[#F4F4F4] text-black px-4 h-14 flex items-center gap-2">
      {onBack && <button onClick={onBack} className="w-9 h-9 rounded-full bg-white flex items-center justify-center" aria-label="Back"><ChevronLeft className="w-5 h-5" /></button>}
      <h2 className="flex-1 font-heading font-extrabold text-xl truncate text-black">{title}</h2>
      {right}
    </div>
  );
}
function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="px-5 mt-6">
      <div className="flex items-center justify-between mb-2"><h3 className="font-heading text-base font-extrabold text-black">{title}</h3>{action}</div>
      {children}
    </section>
  );
}
function DocRow({ d, saved, onOpen }: { d: Doc; saved: boolean; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="w-full flex gap-3 p-3 text-left bg-white rounded-3xl active:bg-gray-50">
      <span className="w-11 h-11 rounded-2xl bg-[#326206] text-white flex items-center justify-center shrink-0"><FileText className="w-5 h-5" /></span>
      <span className="flex-1 min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-wide text-[#326206]">{d.type} · {docDate(d.issued)}</span>
        <span className={`block text-[13px] font-semibold leading-snug ${isOutdated(d) ? "text-[#514F50]" : "text-black"}`}>{d.title}</span>
        <span className="mt-1 flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusStyle[d.status]}`}>{d.status}</span>
          {saved && <span className="text-[10px] font-bold text-[#326206] flex items-center gap-0.5"><BookmarkCheck className="w-3 h-3" /> Saved offline</span>}
        </span>
      </span>
    </button>
  );
}
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${on ? "bg-white" : "bg-gray-300"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

// ---------- tab screens ----------
// Design 2 app home: dark greeting header, one big photo card, large tiles, short lists
const appSlidePhotos = ["./d2/slide-family.jpg", "./d2/trader.jpg", "./d2/slide-phone.jpg"];
function HomeTab({ go, saved, openTab, offline }: { go: (s: Screen) => void; saved: string[]; openTab: (t: TabKey) => void; offline: boolean }) {
  const [card, setCard] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const onScroll = () => { const el = scroller.current; if (el) setCard(Math.round(el.scrollLeft / el.clientWidth)); };
  const urgent = latestUpdates[0];
  return (
    <div className="pb-24">
      <div className="bg-[#F4F4F4] text-black px-5 pt-3 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center"><img src="./pencom-logo-sm.png" alt="" className="w-7 h-7 object-contain" /></span>
          <span className="flex-1 leading-tight"><span className="block font-heading font-extrabold text-sm">PenCom</span><span className="block text-[9px] tracking-wider text-black/70">NATIONAL PENSION COMMISSION</span></span>
          <button onClick={() => openTab("alerts")} className="relative w-9 h-9 rounded-full bg-white flex items-center justify-center" aria-label="Alerts"><Bell className="w-4 h-4" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white" /></button>
        </div>
        <p className="mt-5 text-[13px] text-[#514F50]">Welcome</p>
        <p className="font-heading text-2xl font-extrabold leading-tight text-black">How can we help today?</p>
        <button onClick={() => go({ name: "search" })} className="mt-4 w-full flex items-center gap-2 bg-white text-[#514F50] rounded-full px-4 py-3 text-[13px]"><Search className="w-4 h-4" /> Search services, documents, PFAs</button>
      </div>

      {/* One big photo card at a time (swipe) */}
      {!offline && (
        <div className="mt-5">
          <div ref={scroller} onScroll={onScroll} className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Featured" role="region">
            {heroSlides.map((s, i) => (
              <div key={s.title} className="snap-center shrink-0 w-full px-5">
                <div className="relative h-52 rounded-3xl overflow-hidden">
                  <img src={appSlidePhotos[i % appSlidePhotos.length]} alt="" className="absolute inset-0 w-full h-full object-cover object-[center_30%]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white">{s.subtitle}</p>
                    <p className="font-heading font-extrabold text-xl leading-tight mt-1">{s.title}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold bg-white text-[#326206] ring-1 ring-[#326206]/25 px-3 py-1.5 rounded-full">{s.cta.label} <ArrowRight className="w-3.5 h-3.5" /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-1.5 mt-3" aria-hidden="true">
            {heroSlides.map((_, i) => <span key={i} className={`h-1 rounded-full transition-all ${i === card ? "w-6 bg-[#326206]" : "w-3 bg-[#ADAEAF]"}`} />)}
          </div>
        </div>
      )}

      {/* Four big tiles */}
      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        {[
          { label: "Find a PFA", icon: Users, s: { name: "directory" } as Screen, dark: true },
          { label: "Lodge a complaint", icon: MessageSquare, s: { name: "complaint" } as Screen },
          { label: "Track my case", icon: ClipboardList, s: { name: "track" } as Screen },
          { label: "Search", icon: Search, s: { name: "search" } as Screen },
        ].map((a) => (
          <button key={a.label} onClick={() => go(a.s)} className={`flex flex-col items-start gap-6 p-4 rounded-3xl text-left ${a.dark ? "bg-[#326206] text-white" : "bg-white text-black"}`}>
            <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${a.dark ? "bg-white text-[#326206] ring-1 ring-[#326206]/25" : "bg-[#F4F4F4] text-[#326206]"}`}><a.icon className="w-5 h-5" /></span>
            <span className="text-[13px] font-bold leading-tight">{a.label}</span>
          </button>
        ))}
      </div>

      {/* One alert, not a list (keeps the screen calm) */}
      {!offline && urgent && (
        <button onClick={() => openTab("alerts")} className="mx-5 mt-5 w-[calc(100%-40px)] flex gap-3 p-4 rounded-3xl bg-[#9D2B1F] text-white text-left">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-white/80" />
          <span><span className="block text-[10px] font-bold uppercase tracking-widest text-white/80">{urgent.label}</span><span className="block text-[12px] mt-1 leading-snug">{urgent.text}</span><span className="block text-[11px] mt-2 font-bold">All alerts →</span></span>
        </button>
      )}

      {!offline && (
        <Section title="Latest circulars" action={<button onClick={() => openTab("library")} className="text-[11px] font-bold text-[#326206]">Library</button>}>
          <div className="space-y-2">{latestCirculars.slice(0, 2).map((d) => <DocRow key={d.id} d={d} saved={saved.includes(d.id)} onOpen={() => go({ name: "doc", id: d.id })} />)}</div>
        </Section>
      )}

      <Section title="Saved for offline" action={<span className="text-[10px]">Updated {LAST_SYNC}</span>}>
        {saved.length === 0 ? (
          <p className="text-[12px] p-4 rounded-3xl bg-white">Tap <Bookmark className="inline w-3.5 h-3.5" /> on any document to read it without internet.</p>
        ) : (
          <div className="space-y-2">{saved.map((id) => docById(id)).filter(Boolean).map((d) => <DocRow key={d!.id} d={d!} saved onOpen={() => go({ name: "doc", id: d!.id })} />)}</div>
        )}
      </Section>
    </div>
  );
}

function LibraryTab({ go, saved, offline }: { go: (s: Screen) => void; saved: string[]; offline: boolean }) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [onlySaved, setOnlySaved] = useState(false);
  const list = useMemo(() => docs
    .filter((d) => (offline || onlySaved ? saved.includes(d.id) : true) && (type === "All" || d.type === type) && (!q || `${d.title} ${d.ref} ${d.subject}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => b.issued.localeCompare(a.issued)), [q, type, onlySaved, saved, offline]);
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Library" />
      <div className="p-3 space-y-2 bg-white border-b border-gray-200">
        <label className="relative block"><span className="sr-only">Search the library</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADAEAF]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, reference or topic" className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-[13px] outline-none focus:border-[#326206]" /></label>
        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {["All", "Circular", "Regulation", "Guideline", "Act", "Report", "Form"].map((t) => (
            <button key={t} onClick={() => setType(t)} className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border ${type === t ? "bg-[#326206] text-white border-[#326206]" : "border-gray-300"}`}>{t}</button>
          ))}
          <button onClick={() => setOnlySaved(!onlySaved)} className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border inline-flex items-center gap-1 ${onlySaved || offline ? "bg-[#326206] text-white border-[#326206]" : "border-gray-300"}`}><Bookmark className="w-3 h-3" /> Saved</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {offline && <p className="text-[11px] p-2 rounded-lg bg-[#FBF4E8] text-[#6B4A16]">You're offline, so only saved documents are shown.</p>}
        {list.map((d) => <DocRow key={d.id} d={d} saved={saved.includes(d.id)} onOpen={() => go({ name: "doc", id: d.id })} />)}
        {list.length === 0 && <p className="text-center text-[12px] py-8">No documents found.</p>}
      </div>
    </div>
  );
}

function ServicesTab({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Services" />
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <p className="text-[12px] px-1">Step-by-step guides. Each one ends with where to go next.</p>
        {guides.map((g) => (
          <button key={g.id} onClick={() => go({ name: "guide", id: g.id })} className="w-full flex items-center gap-3 p-3 bg-white rounded-3xl text-left active:bg-gray-50">
            <span className="w-9 h-9 rounded-lg bg-[#EEF3E8] text-[#326206] flex items-center justify-center shrink-0"><g.icon className="w-4 h-4" /></span>
            <span className="flex-1 min-w-0"><span className="block text-[13px] font-semibold text-black leading-snug">{g.title}</span><span className="block text-[10px]">For: {g.audience.join(", ")}</span></span>
            <ChevronRight className="w-4 h-4 text-[#ADAEAF]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function AlertsTab({ prefs, setPrefs, asked, askPermission }: { prefs: Record<string, boolean>; setPrefs: (p: Record<string, boolean>) => void; asked: "unknown" | "allowed" | "denied"; askPermission: (then: () => void) => void }) {
  const toggle = (c: string, v: boolean) => {
    const apply = () => setPrefs({ ...prefs, [c]: v });
    if (v && asked !== "allowed") askPermission(apply); else apply();
  };
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Alerts" />
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {latestUpdates.map((u) => {
          const lvl = alertLevel(u.label);
          return (
            <div key={u.text} className="p-3 rounded-3xl bg-white">
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${levelStyle[lvl]}`}>{lvl} · {u.label}</span>
              <p className="text-[12px] text-black mt-1.5 leading-snug">{u.text}</p>
            </div>
          );
        })}
        <div className="mt-4 p-3 rounded-3xl bg-white">
          <p className="text-[13px] font-bold text-black flex items-center gap-1.5"><Bell className="w-4 h-4 text-[#326206]" /> Notify me about</p>
          <p className="text-[11px] mt-0.5">Choose only what you want. You can change this any time.</p>
          <ul className="mt-2 divide-y divide-gray-100">
            {categories.map((c) => (
              <li key={c} className="flex items-center justify-between py-2.5"><span className="text-[13px] text-black">{c}</span><Toggle on={!!prefs[c]} onChange={(v) => toggle(c, v)} label={`Notifications for ${c}`} /></li>
            ))}
          </ul>
          {asked === "denied" && <p className="text-[11px] mt-1 text-[#9D2B1F]">Notifications are off in your phone settings.</p>}
        </div>
      </div>
    </div>
  );
}

function MoreTab({ go }: { go: (s: Screen) => void }) {
  const groups: { title: string; items: { label: string; icon: typeof Info; s?: Screen; href?: string }[] }[] = [
    { title: "Get help", items: [{ label: "Lodge a complaint or enquiry", icon: MessageSquare, s: { name: "complaint" } }, { label: "Track my case", icon: ClipboardList, s: { name: "track" } }, { label: "FAQs", icon: HelpCircle, s: { name: "faqs" } }] },
    { title: "Find", items: [{ label: "Operators and zonal offices", icon: Building2, s: { name: "directory" } }, { label: "About PenCom", icon: Landmark, s: { name: "about" } }] },
    { title: "App", items: [{ label: "Settings and accessibility", icon: Settings, s: { name: "settings" } }, { label: "Privacy notice", icon: ShieldCheck, href: "/privacy" }, { label: "Open the full website", icon: Globe, href: "/" }] },
  ];
  return (
    <div className="flex flex-col h-full">
      <TopBar title="More" />
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-[11px] font-bold uppercase tracking-wider px-1 mb-1.5">{g.title}</p>
            <div className="bg-white rounded-3xl divide-y divide-gray-100">
              {g.items.map((it) => it.href ? (
                <Link key={it.label} to={it.href} className="flex items-center gap-3 px-3 py-3"><it.icon className="w-4 h-4 text-[#326206]" /><span className="flex-1 text-[13px] text-black">{it.label}</span><ArrowRight className="w-4 h-4 text-[#ADAEAF]" /></Link>
              ) : (
                <button key={it.label} onClick={() => go(it.s!)} className="w-full flex items-center gap-3 px-3 py-3 text-left"><it.icon className="w-4 h-4 text-[#326206]" /><span className="flex-1 text-[13px] text-black">{it.label}</span><ChevronRight className="w-4 h-4 text-[#ADAEAF]" /></button>
              ))}
            </div>
          </div>
        ))}
        <p className="text-center text-[10px]">PenCom – National Pension Commission · version 1.0 (prototype)</p>
      </div>
    </div>
  );
}

// ---------- pushed screens ----------
function DocScreen({ d, saved, toggleSave, back }: { d: Doc; saved: boolean; toggleSave: () => void; back: () => void }) {
  const [shared, setShared] = useState(false);
  const replacement = docById(d.supersededBy);
  return (
    <div className="flex flex-col h-full">
      <TopBar title={d.type} onBack={back} right={<>
        <button onClick={() => { setShared(true); setTimeout(() => setShared(false), 1500); }} className="p-1.5" aria-label="Share">{shared ? <Check className="w-5 h-5 text-[#326206]" /> : <Share2 className="w-5 h-5" />}</button>
        <button onClick={toggleSave} className="p-1.5" aria-label={saved ? "Remove from saved" : "Save for offline"}>{saved ? <BookmarkCheck className="w-5 h-5 text-[#326206]" /> : <Bookmark className="w-5 h-5" />}</button>
      </>} />
      <div className="flex-1 overflow-y-auto p-4">
        {isOutdated(d) && <div className="mb-3 p-2.5 rounded-lg bg-[#FBEAE8] text-[11px] text-black"><strong>No longer in force.</strong>{replacement && <> Replaced by {replacement.title}.</>}</div>}
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#326206]">{d.ref}</p>
        <h1 className="font-heading font-bold text-lg leading-tight mt-1">{d.title}</h1>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          {[["Issued", docDate(d.issued)], ["Effective", d.effective ? docDate(d.effective) : "On issue"], ["Department", d.department], ["Status", d.status]].map(([k, v]) => (
            <div key={k} className="p-2 rounded-lg bg-white border border-gray-200"><dt>{k}</dt><dd className="font-semibold text-black">{v}</dd></div>
          ))}
        </dl>
        <h2 className="text-[13px] font-bold mt-4">In plain language</h2>
        <p className="text-[13px] mt-1 leading-relaxed">{d.summary}</p>
        <button onClick={toggleSave} className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-semibold ${saved ? "bg-[#EEF3E8] text-[#326206]" : "bg-[#326206] text-white"}`}>
          {saved ? <><BookmarkCheck className="w-4 h-4" /> Saved · readable offline</> : <><Download className="w-4 h-4" /> Save for offline ({d.size})</>}
        </button>
        {saved && <p className="text-[10px] text-center mt-1.5">Last updated {LAST_SYNC}</p>}
        <p className="text-[10px] mt-4">The official wording is in the signed PDF.</p>
      </div>
    </div>
  );
}

function GuideScreen({ g, back, openPortal }: { g: Guide; back: () => void; openPortal: (p: Portal) => void }) {
  const portal = g.id === "pcc" ? portals[0] : g.id === "pencare" ? portals.find((p) => p.name === "Pencare") : undefined;
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Guide" onBack={back} />
      <div className="flex-1 overflow-y-auto p-4">
        <h1 className="font-heading font-bold text-lg leading-tight">{g.title}</h1>
        <p className="text-[13px] mt-1">{g.summary}</p>
        <div className="mt-3 p-3 rounded-3xl bg-white"><p className="text-[12px] font-bold text-black">Who it is for</p><p className="text-[12px] mt-0.5">{g.who}</p></div>
        <div className="mt-2 p-3 rounded-3xl bg-white"><p className="text-[12px] font-bold text-black">What you need</p><ul className="mt-1 space-y-0.5">{g.need.map((n) => <li key={n} className="text-[12px] flex gap-1.5"><Check className="w-3.5 h-3.5 text-[#326206] shrink-0 mt-0.5" />{n}</li>)}</ul></div>
        <p className="text-[13px] font-bold mt-4">Steps</p>
        <ol className="mt-2 space-y-2">{g.steps.map((s, i) => <li key={s} className="flex gap-2.5"><span className="w-6 h-6 rounded-full bg-[#326206] text-white text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span><span className="text-[12px] text-black pt-0.5">{s}</span></li>)}</ol>
        <div className="mt-5 space-y-2">
          {portal && <button onClick={() => openPortal(portal)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#326206] text-white text-[13px] font-semibold">Go to {portal.name} <ArrowRight className="w-4 h-4" /></button>}
          {g.next.filter((n) => n.to !== "#chat").map((n) => <Link key={n.label} to={n.to} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#326206] text-[#326206] text-[13px] font-semibold">{n.label}</Link>)}
        </div>
      </div>
    </div>
  );
}

function DirectoryScreen({ back }: { back: () => void }) {
  const [kind, setKind] = useState<"PFAs" | "PFCs" | "Zonal offices">("PFAs");
  const [q, setQ] = useState("");
  const rows = kind === "PFAs" ? operators.map((o) => ({ name: o.name, place: o.address, phone: o.phone }))
    : kind === "PFCs" ? [{ name: "First Pension Custodian Nigeria Limited", place: "Lagos", phone: "01-2774880" }, { name: "UBA Pensions Custodian Limited", place: "Lagos", phone: "01-2808222" }, { name: "Zenith Pensions Custodian Limited", place: "Lagos", phone: "01-2787000" }]
    : zonalOffices.map((z) => ({ name: z.city, place: z.address, phone: z.phone }));
  const list = rows.filter((r) => !q || `${r.name} ${r.place}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Directory" onBack={back} />
      <div className="p-3 space-y-2 bg-white border-b border-gray-200">
        <div className="grid grid-cols-3 rounded-lg border border-gray-300 overflow-hidden text-[11px] font-semibold">
          {(["PFAs", "PFCs", "Zonal offices"] as const).map((k) => <button key={k} onClick={() => setKind(k)} className={`py-1.5 ${kind === k ? "bg-[#326206] text-white" : ""}`}>{k}</button>)}
        </div>
        <label className="relative block"><span className="sr-only">Search</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADAEAF]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or city" className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-[13px] outline-none focus:border-[#326206]" /></label>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {list.map((r) => (
          <div key={r.name} className="p-3 bg-white rounded-3xl">
            <p className="text-[13px] font-semibold text-black leading-snug">{r.name}</p>
            <p className="text-[11px] flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {r.place}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a href={`tel:${r.phone.replace(/\D/g, "")}`} className="flex items-center justify-center gap-1.5 py-2 rounded-full bg-[#326206] text-white text-[12px] font-semibold"><Phone className="w-3.5 h-3.5" /> Call</a>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(`${r.name}, ${r.place}, Nigeria`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#326206] text-[#326206] text-[12px] font-semibold"><MapPin className="w-3.5 h-3.5" /> Map</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComplaintScreen({ back, onDone }: { back: () => void; onDone: (ref: string) => void }) {
  const [files, setFiles] = useState<string[]>([]);
  const [ref, setRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const submit = (e: FormEvent) => { e.preventDefault(); const r = `PC-2026-${Math.floor(100000 + Math.random() * 900000)}`; setRef(r); onDone(r); };
  const field = "mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 text-[13px] outline-none focus:border-[#326206] bg-white";
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Complaint or enquiry" onBack={back} />
      <div className="flex-1 overflow-y-auto p-4">
        {ref ? (
          <div className="text-center pt-8">
            <span className="w-14 h-14 mx-auto rounded-full bg-[#EEF3E8] flex items-center justify-center"><Check className="w-7 h-7 text-[#326206]" /></span>
            <p className="font-heading font-bold text-lg mt-3">Received</p>
            <p className="text-[12px] mt-1">Your case reference is</p>
            <button onClick={() => { navigator.clipboard?.writeText(ref).catch(() => {}); setCopied(true); }} className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-[#326206]/40 bg-[#EEF3E8] font-heading font-extrabold text-[#326206]">{ref} {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
            <p className="text-[11px] mt-3">We'll notify you when the status changes (if you turned on "Complaint updates").</p>
            <button onClick={back} className="mt-6 w-full py-2.5 rounded-full bg-[#326206] text-white text-[13px] font-semibold">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="p-2.5 rounded-lg bg-[#FBEAE8] text-[11px] text-black flex gap-2"><Lock className="w-4 h-4 text-[#9D2B1F] shrink-0" /> Never type your password or bank card details.</div>
            <label className="block text-[12px] font-semibold text-black">Type<select className={field}><option>Complaint about my PFA</option><option>Complaint about my employer</option><option>General enquiry</option><option>Report an employer</option></select></label>
            <label className="block text-[12px] font-semibold text-black">Full name<input required className={field} /></label>
            <label className="block text-[12px] font-semibold text-black">Phone number<input required type="tel" className={field} /></label>
            <label className="block text-[12px] font-semibold text-black">What happened?<textarea required rows={4} className={field} /></label>
            <div>
              <p className="text-[12px] font-semibold text-black">Add a photo or document</p>
              <div className="mt-1 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFiles((f) => [...f, `Photo_${f.length + 1}.jpg`])} className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-300 text-[12px] font-semibold"><Camera className="w-4 h-4" /> Take photo</button>
                <button type="button" onClick={() => setFiles((f) => [...f, `Document_${f.length + 1}.pdf`])} className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-300 text-[12px] font-semibold"><Paperclip className="w-4 h-4" /> Attach file</button>
              </div>
              {files.length > 0 && <ul className="mt-2 space-y-1">{files.map((f) => <li key={f} className="flex items-center justify-between text-[11px] px-2 py-1.5 rounded-lg bg-white border border-gray-200">{f}<button type="button" onClick={() => setFiles((x) => x.filter((y) => y !== f))} aria-label={`Remove ${f}`}><X className="w-3.5 h-3.5" /></button></li>)}</ul>}
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#326206] text-white text-[13px] font-semibold"><Send className="w-4 h-4" /> Send</button>
          </form>
        )}
      </div>
    </div>
  );
}

function TrackScreen({ back, cases }: { back: () => void; cases: string[] }) {
  const stages = ["Received", "Assigned to a team", "Under review", "Resolved"];
  const [ref, setRef] = useState(cases[0] ?? "PC-2026-104233");
  const [shown, setShown] = useState<string | null>(null);
  const stage = shown === "PC-2026-104233" ? 2 : 0;
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Track my case" onBack={back} />
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={(e) => { e.preventDefault(); setShown(ref.trim().toUpperCase()); }} className="flex gap-2">
          <label className="flex-1"><span className="sr-only">Case reference</span><input value={ref} onChange={(e) => setRef(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-[13px] uppercase outline-none focus:border-[#326206]" /></label>
          <button className="px-4 rounded-full bg-[#326206] text-white text-[13px] font-semibold">Check</button>
        </form>
        {shown && (cases.includes(shown) || shown === "PC-2026-104233") ? (
          <ol className="mt-5 space-y-3">
            {stages.map((s, i) => (
              <li key={s} className="flex gap-2.5 items-center">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${i < stage ? "bg-[#326206] text-white" : i === stage ? "ring-2 ring-[#326206] bg-[#EEF3E8]" : "bg-gray-100"}`}>{i < stage && <Check className="w-3.5 h-3.5" />}</span>
                <span className={`text-[13px] ${i <= stage ? "font-semibold text-black" : ""}`}>{s}{i === stage && <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#326206] text-white">Now</span>}</span>
              </li>
            ))}
          </ol>
        ) : shown ? <p className="mt-4 text-[12px] p-3 rounded-lg bg-[#FBF4E8]">We could not find that reference.</p> : null}
      </div>
    </div>
  );
}

function FaqScreen({ back }: { back: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="FAQs" onBack={back} />
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {faqs.map((f) => (
          <details key={f.question} className="group bg-white rounded-3xl">
            <summary className="list-none cursor-pointer p-3 text-[13px] font-semibold text-black flex justify-between gap-2">{f.question}<ChevronRight className="w-4 h-4 shrink-0 text-[#326206] transition-transform group-open:rotate-90" /></summary>
            <p className="px-3 pb-3 text-[12px] leading-relaxed">{f.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function AboutScreen({ back }: { back: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="About PenCom" onBack={back} />
      <div className="flex-1 overflow-y-auto p-4 text-[13px] space-y-3">
        <p className="font-heading font-bold text-black">We Regulate. We Protect. We Serve.</p>
        <p>The National Pension Commission regulates and supervises pensions in Nigeria under the Pension Reform Act 2014.</p>
        <Link to="/about" className="block p-3 rounded-3xl bg-white font-semibold text-[#326206]">Leadership, history and Service Charter →</Link>
      </div>
    </div>
  );
}

function SettingsScreen({ back, textScale, setTextScale, contrast, setContrast }: { back: () => void; textScale: number; setTextScale: (n: number) => void; contrast: boolean; setContrast: (b: boolean) => void }) {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Settings" onBack={back} />
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="p-3 bg-white rounded-3xl">
          <p className="text-[13px] font-semibold text-black flex items-center gap-2"><Type className="w-4 h-4 text-[#326206]" /> Text size</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {[[1, "Normal"], [1.12, "Large"], [1.25, "Larger"]].map(([v, l]) => (
              <button key={l} onClick={() => setTextScale(v as number)} className={`py-1.5 rounded-full text-[12px] font-semibold border ${textScale === v ? "bg-[#326206] text-white border-[#326206]" : "border-gray-300"}`}>{l}</button>
            ))}
          </div>
          <p className="text-[10px] mt-1.5">The app also follows your phone's text size setting.</p>
        </div>
        <div className="p-3 bg-white rounded-3xl flex items-center justify-between gap-3">
          <span><span className="block text-[13px] font-semibold text-black flex items-center gap-2"><Contrast className="w-4 h-4 text-[#326206]" /> High contrast</span><span className="block text-[10px]">Stronger colours and outlines</span></span>
          <Toggle on={contrast} onChange={setContrast} label="High contrast" />
        </div>
        <div className="p-3 bg-white rounded-3xl text-[11px]">Works with VoiceOver (iPhone) and TalkBack (Android): every button has a spoken label.</div>
      </div>
    </div>
  );
}

function SearchScreen({ back, go }: { back: () => void; go: (s: Screen) => void }) {
  const [q, setQ] = useState("");
  const docHits = q ? docs.filter((d) => `${d.title} ${d.ref} ${d.subject}`.toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [];
  const guideHits = q ? guides.filter((g) => `${g.title} ${g.summary}`.toLowerCase().includes(q.toLowerCase())) : [];
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Search" onBack={back} />
      <div className="p-3 bg-white border-b border-gray-200">
        <label className="relative block"><span className="sr-only">Search</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ADAEAF]" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. transfer, PCC, circular" className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-[13px] outline-none focus:border-[#326206]" /></label>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {!q && <div className="flex flex-wrap gap-1.5">{["Transfer", "Retirement", "PCC", "Circular", "Pencare"].map((s) => <button key={s} onClick={() => setQ(s)} className="px-2.5 py-1 rounded-full bg-[#EEF3E8] text-[#234504] text-[11px] font-semibold">{s}</button>)}</div>}
        {guideHits.map((g) => <button key={g.id} onClick={() => go({ name: "guide", id: g.id })} className="w-full p-3 bg-white rounded-3xl text-left"><span className="block text-[10px] font-bold uppercase text-[#326206]">Guide</span><span className="text-[13px] font-semibold text-black">{g.title}</span></button>)}
        {docHits.map((d) => <DocRow key={d.id} d={d} saved={false} onOpen={() => go({ name: "doc", id: d.id })} />)}
        {q && guideHits.length + docHits.length === 0 && <p className="text-center text-[12px] py-6">No results. Try the PenCom Assistant.</p>}
      </div>
    </div>
  );
}

// In-app PenCom Assistant (same answers as the website)
function AppChat({ close, open }: { close: () => void; open: (to: string) => void }) {
  const [msgs, setMsgs] = useState<({ from: "user"; text: string } | { from: "bot"; a: Answer | null; secret?: boolean })[]>([]);
  const [input, setInput] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs]);
  const send = (t: string) => {
    if (!t.trim()) return;
    const secret = secretPatterns.some((p) => p.test(t));
    setMsgs((m) => [...m, { from: "user", text: secret ? t.replace(/\d/g, "•") : t }, { from: "bot", a: secret ? null : findAnswer(t), secret }]);
    setInput("");
  };
  return (
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", duration: 0.25 }} className="absolute inset-0 z-40 bg-[#F4F4F4] flex flex-col" role="dialog" aria-label="PenCom Assistant">
      <div className="shrink-0 bg-[#F4F4F4] text-black px-4 h-14 flex items-center gap-2 border-b border-black/5">
        <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center"><img src="./pencom-logo-sm.png" alt="" className="w-5 h-5 object-contain" /></span>
        <span className="flex-1 leading-tight"><span className="block text-[13px] font-bold">PenCom Assistant</span><span className="block text-[9px] text-[#514F50]">Automated help · general information only</span></span>
        <button onClick={close} aria-label="Close assistant" className="p-1.5"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="p-3 rounded-2xl bg-[#FBEAE8] text-[11px] text-black flex gap-2"><Lock className="w-4 h-4 text-[#9D2B1F] shrink-0" /> General information only. Never type your PIN, password or card details.</div>
        <div className="p-3 rounded-3xl rounded-tl-lg bg-white text-[12px] text-black">
          Hello, I'm the PenCom Assistant. What do you need?
          <div className="mt-2 grid gap-1">{quickQuestions.map((q) => <button key={q} onClick={() => send(q)} className="text-left px-3 py-2 rounded-2xl bg-[#F5F7F2] text-[11px] font-semibold text-[#326206]">{q}</button>)}</div>
        </div>
        {msgs.map((m, i) => m.from === "user" ? (
          <p key={i} className="ml-auto max-w-[80%] w-fit px-3 py-2 rounded-3xl rounded-br-lg bg-[#326206] text-white text-[12px]">{m.text}</p>
        ) : (
          <div key={i} className="max-w-[88%] p-3 rounded-3xl rounded-tl-lg bg-white text-[12px] text-black">
            {m.secret ? "Please don't share personal numbers here. I've hidden them." : m.a ? (
              <>{m.a.text}<div className="mt-2 flex flex-wrap gap-1">{m.a.links.map((l) => <button key={l.to} onClick={() => open(l.to)} className="px-2.5 py-1 rounded-full bg-[#326206] text-white text-[10px] font-semibold">{l.label}</button>)}</div></>
            ) : (
              <>Sorry, I don't have an answer for that yet. Call <a href="tel:094611300" className="font-semibold text-[#326206]">09-4611300</a> (Mon–Fri, 8am–5pm) or send an enquiry.</>
            )}
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="shrink-0 p-2 pb-24 flex gap-2">
        <label className="flex-1"><span className="sr-only">Type your question</span><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question…" className="w-full px-4 py-2.5 rounded-full bg-white border border-transparent text-[13px] outline-none focus:border-[#326206]" /></label>
        <button className="w-10 h-10 rounded-full bg-white text-[#326206] ring-1 ring-[#326206]/25 flex items-center justify-center" aria-label="Send"><Send className="w-4 h-4" /></button>
      </form>
    </motion.div>
  );
}

// ---------- the app ----------
const tabsDef: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", icon: Home }, { key: "library", label: "Library", icon: BookOpen },
  { key: "services", label: "Services", icon: ClipboardList }, { key: "alerts", label: "Alerts", icon: Bell }, { key: "more", label: "More", icon: Menu },
];

export default function MobileApp() {
  const [tab, setTab] = useState<TabKey>("home");
  const [stack, setStack] = useState<Screen[]>([]);
  const [saved, setSaved] = useState<string[]>(["pension-reform-act-2014", "benefit-application-form"]);
  const [cases, setCases] = useState<string[]>([]);
  const [offline, setOffline] = useState(false);
  const [chat, setChat] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [permission, setPermission] = useState<"unknown" | "allowed" | "denied">("unknown");
  const [permAsk, setPermAsk] = useState<null | (() => void)>(null);
  const [portal, setPortal] = useState<Portal | null>(null);
  const [textScale, setTextScale] = useState(1);
  const [contrast, setContrast] = useState(false);
  // Opening (splash) screen with the official logo, as real apps show while loading (DES-33)
  const [splash, setSplash] = useState(true);
  useEffect(() => { if (!splash) return; const t = setTimeout(() => setSplash(false), 1800); return () => clearTimeout(t); }, [splash]);

  const go = (s: Screen) => setStack((st) => [...st, s]);
  const back = () => setStack((st) => st.slice(0, -1));
  const openTab = (t: TabKey) => { setTab(t); setStack([]); };
  const toggleSave = (id: string) => setSaved((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const top = stack[stack.length - 1];

  // Links from the PenCom Assistant open the matching screen inside the app (not the website)
  const openLink = (to: string) => {
    const [path, hash = ""] = to.split("#");
    const push = (tabKey: TabKey, s?: Screen) => { setTab(tabKey); setStack(s ? [s] : []); };
    if (path.startsWith("/regulations/")) return push("library", { name: "doc", id: path.split("/")[2] });
    if (path === "/regulations" || path === "/resources") return push("library");
    if (path === "/operators" || hash === "zonal") return push("more", { name: "directory" });
    if (hash === "track") return push("more", { name: "track" });
    if (path === "/connect") return push("more", { name: "complaint" });
    if (path === "/services" && guides.some((g) => g.id === hash)) return push("services", { name: "guide", id: hash });
    if (path === "/services") return push("services");
    if (path === "/about") return push("more", { name: "about" });
    push("home");
  };

  const renderTop = () => {
    if (!top) {
      if (tab === "home") return <div className="h-full overflow-y-auto"><HomeTab go={go} saved={saved} openTab={openTab} offline={offline} /></div>;
      if (tab === "library") return <LibraryTab go={go} saved={saved} offline={offline} />;
      if (tab === "services") return <ServicesTab go={go} />;
      if (tab === "alerts") return <AlertsTab prefs={prefs} setPrefs={setPrefs} asked={permission} askPermission={(then) => setPermAsk(() => then)} />;
      return <MoreTab go={go} />;
    }
    switch (top.name) {
      case "doc": { const d = docById(top.id); return d ? <DocScreen d={d} saved={saved.includes(d.id)} toggleSave={() => toggleSave(d.id)} back={back} /> : null; }
      case "guide": { const g = guides.find((x) => x.id === top.id); return g ? <GuideScreen g={g} back={back} openPortal={setPortal} /> : null; }
      case "directory": return <DirectoryScreen back={back} />;
      case "complaint": return <ComplaintScreen back={back} onDone={(r) => setCases((c) => [r, ...c])} />;
      case "track": return <TrackScreen back={back} cases={cases} />;
      case "faqs": return <FaqScreen back={back} />;
      case "about": return <AboutScreen back={back} />;
      case "settings": return <SettingsScreen back={back} textScale={textScale} setTextScale={setTextScale} contrast={contrast} setContrast={setContrast} />;
      case "search": return <SearchScreen back={back} go={go} />;
    }
  };

  const demoLinks: { label: string; desc: string; act: () => void }[] = [
    { label: "Home", desc: "Featured cards (swipe), alerts, circulars, saved items", act: () => openTab("home") },
    { label: "Library", desc: "Same filters as the website; save for offline", act: () => openTab("library") },
    { label: "Services", desc: "Step-by-step guides ending at the right portal", act: () => openTab("services") },
    { label: "Alerts", desc: "Alert levels and notification choices", act: () => openTab("alerts") },
    { label: "Directory", desc: "PFAs, PFCs, zonal offices with Call and Map", act: () => { setTab("more"); setStack([{ name: "directory" }]); } },
    { label: "Complaint", desc: "Photo or document attachment and case reference", act: () => { setTab("more"); setStack([{ name: "complaint" }]); } },
    { label: "PenCom Assistant", desc: "Available from every screen", act: () => setChat(true) },
    { label: "Accessibility", desc: "Text size and high contrast", act: () => { setTab("more"); setStack([{ name: "settings" }]); } },
  ];

  return (
    <div className="min-h-screen bg-[#326206] text-white flex items-center justify-center gap-14 p-4 md:p-8">
      {/* Explanation panel (desktop) */}
      <div className="hidden lg:block max-w-sm">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-white hover:underline"><ChevronLeft className="w-4 h-4" /> Back to the website</Link>
        <div className="mt-6 flex items-center gap-3">
          <span className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center"><img src="./pencom-logo-sm.png" alt="" className="w-10 h-10 object-contain" /></span>
          <div><h1 className="text-3xl font-extrabold !text-white">PenCom app</h1><p className="text-sm text-white/70">Store name: PenCom – National Pension Commission</p></div>
        </div>
        <p className="mt-4 text-sm text-white/80">The same approved information and services as the website, designed for Android and iPhone. Try the features:</p>
        <div className="mt-4 space-y-1.5">
          {demoLinks.map((l) => (
            <button key={l.label} onClick={l.act} className="w-full flex items-center gap-3 p-2.5 rounded-2xl text-left hover:bg-white/10">
              <Smartphone className="w-4 h-4 text-white shrink-0" /><span><span className="block text-sm font-bold text-white">{l.label}</span><span className="block text-xs text-white/65">{l.desc}</span></span>
            </button>
          ))}
        </div>
        <button onClick={() => setSplash(true)} className="mt-5 w-full p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-left text-sm"><span className="font-bold text-white">Show the opening screen again</span><span className="block text-xs text-white/65">The official logo shown while the app loads</span></button>
        <div className="mt-3 p-3 rounded-2xl bg-white/10 flex items-center justify-between gap-3">
          <span><span className="block text-sm font-bold text-white flex items-center gap-1.5"><WifiOff className="w-4 h-4" /> Show offline mode</span><span className="block text-xs text-white/65">See what works without internet</span></span>
          <Toggle on={offline} onChange={setOffline} label="Show offline mode" />
        </div>
      </div>

      {/* Phone */}
      <div className="relative w-full max-w-[375px] h-[780px] bg-white text-[#514F50] rounded-[48px] shadow-2xl border-[10px] border-[#000] ring-1 ring-white/20 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-8 bg-[#F4F4F4] z-50 flex items-center justify-between px-6 text-black text-[11px] font-semibold">
          <span>9:41</span><span className="w-20 h-5 bg-[#1d1d1f] rounded-full" /><span>{offline ? "No signal" : "4G"}</span>
        </div>
        <div className={`absolute inset-0 top-8 bottom-0 bg-[#F4F4F4] flex flex-col ${contrast ? "[filter:contrast(1.25)]" : ""}`}>
          {offline && <div className="shrink-0 bg-[#514F50] text-white text-[11px] px-3 py-1.5 flex items-center gap-1.5"><WifiOff className="w-3.5 h-3.5" /> You're offline. Showing saved items · updated {LAST_SYNC}</div>}
          <div className="flex-1 min-h-0 [&_.overflow-y-auto]:pb-28" style={{ zoom: textScale }}>
            <AnimatePresence mode="wait">
              <motion.div key={`${tab}-${stack.length}-${top?.name ?? ""}`} initial={{ opacity: 0, x: top ? 16 : 0 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="h-full">
                {renderTop()}
              </motion.div>
            </AnimatePresence>
          </div>
          {/* PenCom Assistant launcher on every screen */}
          {!chat && (
            <button onClick={() => setChat(true)} className="absolute right-4 bottom-24 z-30 w-12 h-12 rounded-full bg-white text-[#326206] ring-1 ring-[#326206]/25 shadow-lg flex items-center justify-center" aria-label="Open the PenCom Assistant">
              <MessageCircle className="w-6 h-6" />
            </button>
          )}
          <AnimatePresence>{chat && <AppChat close={() => setChat(false)} open={(to) => { setChat(false); openLink(to); }} />}</AnimatePresence>
        </div>

        {/* Opening screen */}
        <AnimatePresence>
          {splash && (
            <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 z-[70] bg-[#326206] flex flex-col items-center justify-center" aria-label="PenCom app is opening">
              <motion.img src="./pencom-logo-sm.png" alt="PenCom" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="h-40 w-auto bg-white rounded-[32px] p-4" />
              <p className="mt-6 font-heading font-extrabold text-xl text-white">PenCom</p>
              <p className="text-[11px] font-semibold tracking-wider text-white/75">NATIONAL PENSION COMMISSION</p>
              <p className="absolute bottom-10 text-[12px] text-white font-bold">Your Pension, Your Future</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab bar */}
        <nav className="absolute bottom-3 inset-x-3 h-16 bg-[#326206] rounded-full grid grid-cols-5 z-40 px-1" aria-label="App tabs">
          {tabsDef.map((t) => (
            <button key={t.key} onClick={() => { openTab(t.key); setChat(false); }} aria-current={tab === t.key && !stack.length} className={`flex flex-col items-center justify-center gap-0.5 ${tab === t.key ? "text-white" : "text-white/70"}`}>
              <span className={`px-3 py-0.5 rounded-full ${tab === t.key ? "bg-white/10" : ""}`}><t.icon className="w-5 h-5" /></span>
              <span className={`text-[10px] ${tab === t.key ? "font-bold" : "font-medium"}`}>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Notification permission, asked in context (not at first launch) */}
        <AnimatePresence>
          {permAsk && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] bg-black/40 flex items-center justify-center p-8">
              <div className="bg-white rounded-2xl w-full p-4 text-center" role="alertdialog" aria-labelledby="perm-title">
                <Bell className="w-8 h-8 mx-auto text-[#326206]" />
                <p id="perm-title" className="font-bold text-[14px] text-black mt-2">"PenCom" would like to send you notifications</p>
                <p className="text-[11px] mt-1">Only for the topics you chose. You can turn them off any time.</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => { setPermission("denied"); setPermAsk(null); }} className="py-2 rounded-lg border border-gray-300 text-[13px] font-semibold">Don't allow</button>
                  <button onClick={() => { setPermission("allowed"); permAsk(); setPermAsk(null); }} className="py-2 rounded-full bg-[#326206] text-white text-[13px] font-semibold">Allow</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Before you go to a portal */}
        <AnimatePresence>
          {portal && (
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", duration: 0.2 }} className="absolute inset-x-0 bottom-0 z-[60] bg-white rounded-t-3xl shadow-2xl p-5 border-t border-gray-200" role="dialog" aria-labelledby="portal-title">
              <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-3" />
              <div className="flex items-center gap-2 mb-3"><img src="./pencom-logo-sm.png" alt="PenCom" className="h-8 w-auto" /><span className="text-[10px] font-bold tracking-wide text-black border-l border-[#ADAEAF] pl-2">PENCOM ONLINE SERVICE</span></div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#326206]">Before you go</p>
              <p id="portal-title" className="font-heading font-bold text-lg">{portal.name}</p>
              <p className="text-[12px] mt-2"><strong className="text-black">For:</strong> {portal.who}</p>
              <p className="text-[12px] mt-1"><strong className="text-black">What you need:</strong> {portal.need}</p>
              {portal.note && <p className="text-[11px] mt-2 p-2 rounded-lg bg-[#FBF4E8] text-[#6B4A16]">{portal.note}</p>}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => setPortal(null)} className="py-2.5 rounded-xl border border-gray-300 text-[13px] font-semibold">Cancel</button>
                <a href={portal.url} target="_blank" rel="noopener noreferrer" onClick={() => setPortal(null)} className="py-2.5 rounded-full bg-[#326206] text-white text-[13px] font-semibold text-center">Open {portal.name}</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

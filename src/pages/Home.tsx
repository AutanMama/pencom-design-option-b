import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Search, Users, Download, Calculator, FileCheck, MessageCircle, MapPin,
  AlertTriangle, Bell, Info, ChevronDown, PlayCircle, Pause, Play,
} from "lucide-react";
import { heroSlides, latestNews, faqs } from "@/lib/data";
import { popularSearches } from "@/pages/Search";
import { latestCirculars, isNew } from "@/lib/library";
import CookieConsent from "@/components/CookieConsent";
import ReportGovBadge from "@/components/ReportGovBadge";
import PortalHub from "@/components/PortalHub";

// DESIGN 2: "Bold and photo-led".
// Photo banner slider with PenCom photos, slide titles as clickable tabs,
// big photo tiles, a magazine-style news layout and figures over a city photo.
// Same content and order as the questionnaire asks (DES-19).

const openChat = () => window.dispatchEvent(new Event("pencom:open-chat"));
const shortDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

// Slide photos are PenCom's own banner photos (from the slide content), as in design 1
const SLIDE_MS = 7000;

const topTasks = [
  { label: "Find your PFA", icon: Users, href: "/operators" },
  { label: "Lodge a complaint", icon: MessageCircle, href: "/connect#complaint" },
  { label: "Get a PCC", icon: FileCheck, href: "/services#pcc" },
  { label: "Download forms", icon: Download, href: "/resources#downloads" },
  { label: "Pension calculator", icon: Calculator, href: "/services#calculator" },
  { label: "Zonal offices", icon: MapPin, href: "/connect#zonal" },
];

// "I am a…" as tall photo tiles (retirees first, as the 13 Nov meeting asked)
const audiences = [
  { label: "Retiree", text: "Benefits, Pencare, programmed withdrawal or annuity", href: "/services#retirement", img: "./d2/retiree.jpg", pos: "center 20%" },
  { label: "Contributor", text: "Open or transfer your RSA, check your PFA", href: "/services", img: "./d2/contributor.jpg", pos: "70% center" },
  { label: "Employer", text: "Register staff, remit on time, get your PCC", href: "/services#pcc", img: "./d2/employer-man.jpg", pos: "center 20%" },
  { label: "Self-employed", text: "Save with the Personal Pension Plan", href: "/services#ppp", img: "./d2/trader.jpg", pos: "center 30%" },
];

const alerts = [
  { level: "Urgent", title: "Fraud alert: PenCom will never ask for your PIN", text: "Do not share your RSA PIN, passwords or bank card details with anyone who calls, texts or messages you.", date: "2026-11-14", href: "/connect#complaint", icon: AlertTriangle },
  { level: "Important", title: "Employers: remit within 7 working days of payday", text: "Late remittance attracts penalties under the Pension Reform Act 2014.", date: "2026-11-03", href: "/services", icon: Bell },
  { level: "Notice", title: "Update your KYC details before 31 December 2026", text: "Visit your PFA to update your Know Your Customer details.", date: "2026-10-28", href: "/operators", icon: Info },
];

const figures = [
  { label: "Total pension assets", value: "₦20.5 trillion" },
  { label: "RSA holders", value: "10.2 million+" },
  { label: "Licensed PFAs (plus 4 PFCs)", value: "22" },
  { label: "Years of the Contributory Pension Scheme", value: "22" },
];

function Kicker({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] ${light ? "text-white" : "text-[#326206]"}`}>
      <span className={`w-10 h-[2px] ${light ? "bg-white" : "bg-[#326206]"}`} aria-hidden="true" />
      {children}
    </p>
  );
}

type Slide = (typeof heroSlides)[number];
function SlideWords({ s }: { s: Slide }) {
  const btn = "inline-flex items-center gap-2 pl-5 pr-4 py-3 text-[15px] md:text-base md:pl-6 md:pr-5 md:py-3.5 rounded-full bg-[#326206] text-white font-bold hover:bg-black transition-colors";
  return (
    <>
      <Kicker>{s.subtitle}</Kicker>
      <h1 className="mt-3 md:mt-5 text-[28px] leading-[1.1] md:text-5xl font-bold text-black tracking-tight">{s.title}</h1>
      <p className="mt-3 md:mt-5 text-[15px] md:text-lg text-[#4A5548] max-w-[480px]">{s.description}</p>
      <div className="mt-5 md:mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        {s.cta.href.startsWith("#chat") ? (
          <button onClick={openChat} className={btn}><MessageCircle className="w-5 h-5" /> {s.cta.label}</button>
        ) : (
          <Link to={s.cta.href} className={btn}>{s.cta.label} <ArrowRight className="w-5 h-5" /></Link>
        )}
        {/* Second action as a quiet text link, so there is one main button */}
        <Link to={s.secondaryCta.href} className="inline-flex items-center gap-1.5 font-semibold text-[#326206] hover:underline underline-offset-4">
          {s.secondaryCta.label} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [query, setQuery] = useState("");
  const next = () => setCurrent((c) => (c + 1) % heroSlides.length);
  const slideImg = heroSlides[current].image;
  const search = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="bg-white">
      <CookieConsent />

      {/* 1. Wave banner: one label, one heading, one sentence, one main button and the photo.
          Soft off-white panel on the left, one curved green line,
          and PenCom's own photo on the right. Calm: one accent colour, no dark blocks under the menu. */}
      <section className="relative overflow-hidden bg-[#EAF1E3] lg:min-h-[540px] flex flex-col lg:block" aria-roledescription="carousel" aria-label="Featured">
        {/* ReportGov badge: top-right corner of the banner (design 1 has it top-left) */}
        <div className="absolute top-3 inset-x-0 z-30 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 flex justify-end">
            <span className="pointer-events-auto"><ReportGovBadge /></span>
          </div>
        </div>
        {/* Computer: photo fills the right side, the white wave panel sits over its left edge */}
        <div className="hidden lg:block absolute inset-y-0 right-0 w-[64%] bg-[#F4F4F4]" aria-hidden="true">
          <AnimatePresence initial={false}>
            <motion.img
              key={current}
              src={slideImg} alt=""
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 1, transition: { duration: 1 } }}
              transition={{ opacity: { duration: 1 }, scale: { duration: 8, ease: "easeOut" } }}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 35%" }}
            />
          </AnimatePresence>
        </div>
        <svg className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 540" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0 H760 C620 170 900 340 700 540 H0 Z" fill="#EAF1E3" />
          <path d="M776 0 C636 170 916 340 716 540" fill="none" stroke="#326206" strokeWidth="6" vectorEffect="non-scaling-stroke" />
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 pt-5 lg:pt-20 pb-6 lg:pb-14">
          <div className="lg:w-[44%] xl:max-w-[560px]">
            {/* Fixed height: every slide's words sit in the same grid cell (the others hidden),
                so the banner never jumps when the slide changes */}
            <div className="grid grid-cols-[minmax(0,1fr)]" aria-live={playing ? "off" : "polite"}>
              {heroSlides.map((s, i) => (
                <div key={i} className={`[grid-area:1/1] ${i === current ? "" : "invisible"}`} aria-hidden={i !== current}>
                  {i === current ? (
                    <motion.div key={current} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                      <SlideWords s={s} />
                    </motion.div>
                  ) : <SlideWords s={s} />}
                </div>
              ))}
            </div>

            {/* Slide controls: small lines (the active one fills up) and a small pause button */}
            <div className="mt-5 lg:mt-14 flex items-center gap-2">
              {heroSlides.map((s, i) => (
                <button key={i} onClick={() => setCurrent(i)} aria-label={`Show slide ${i + 1}: ${s.title}`} aria-current={i === current} className="py-2">
                  <span className="block w-7 h-[3px] bg-[#D5DDD1] rounded-full overflow-hidden">
                    {i === current && (playing ? (
                      <motion.span key={`${current}-p`} className="block h-full bg-[#326206]" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: SLIDE_MS / 1000, ease: "linear" }} onAnimationComplete={next} />
                    ) : <span className="block h-full w-full bg-[#326206]" />)}
                  </span>
                </button>
              ))}
              <button onClick={() => setPlaying(!playing)} className="ml-1 w-7 h-7 rounded-full text-[#326206] flex items-center justify-center hover:bg-[#EEF3E8]" aria-label={playing ? "Pause slides" : "Play slides"}>
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Phones and tablets: the photo comes FIRST (seen without scrolling), with the curved green edge under it */}
        <div className="lg:hidden order-first relative h-[170px] sm:h-[280px] bg-[#F4F4F4]" aria-hidden="true">
          <AnimatePresence initial={false}>
            <motion.img
              key={current}
              src={slideImg} alt=""
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 1, transition: { duration: 1 } }}
              transition={{ opacity: { duration: 1 }, scale: { duration: 8, ease: "easeOut" } }}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 35%" }}
            />
          </AnimatePresence>
          <svg className="absolute inset-x-0 bottom-0 w-full h-8" viewBox="0 0 390 32" preserveAspectRatio="none">
            <path d="M0 32 H390 V20 C290 -6 120 34 0 12 Z" fill="#EAF1E3" />
            <path d="M0 8 C120 30 290 -10 390 16" fill="none" stroke="#326206" strokeWidth="4" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </section>

      {/* 2. I am a… as tall photo tiles (first, as DES-19 asks) */}
      <section className="py-20 md:py-24" aria-labelledby="audience-title">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <Kicker>I am a…</Kicker>
              <h2 id="audience-title" className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">Find your path</h2>
            </div>
            <p className="text-sm md:text-right">Also for:{" "}
              <Link to="/regulations" className="font-semibold text-[#326206] underline underline-offset-4">Operators</Link> ·{" "}
              <Link to="/about" className="font-semibold text-[#326206] underline underline-offset-4">Members of the public</Link>
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {audiences.map((a, i) => (
              <Link key={a.label} to={a.href} className={`group relative block overflow-hidden rounded-3xl aspect-[3/4] bg-[#326206] ${i % 2 === 1 ? "lg:mt-10" : ""}`}>
                <img src={a.img} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" style={{ objectPosition: a.pos }} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 text-white">
                  <p className="font-heading text-xl md:text-2xl font-extrabold flex items-center justify-between gap-2">
                    {a.label}
                    <span className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/15 group-hover:bg-white group-hover:text-[#326206] flex items-center justify-center transition-colors"><ArrowUpRight className="w-5 h-5" /></span>
                  </p>
                  <p className="hidden sm:block mt-2 text-sm text-white/80">{a.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Search band (light, so it stands apart from the green banner above) */}
      <section className="bg-[#F4F4F4] border-b border-gray-200" aria-labelledby="search-title">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-14 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <h2 id="search-title" className="text-3xl md:text-4xl font-extrabold leading-tight">What are you looking for?</h2>
            <form onSubmit={search} role="search" className="mt-6 flex items-center bg-white rounded-full p-1.5 pl-5 ring-1 ring-gray-300 focus-within:ring-2 focus-within:ring-[#326206]">
              <Search className="w-5 h-5 text-[#7A7B7C] shrink-0" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="RSA transfer, PCC, circular…" aria-label="Search the website" className="flex-1 min-w-0 px-3 py-2.5 text-black outline-none bg-transparent" />
              <button className="px-5 py-2.5 rounded-full bg-[#326206] text-white font-semibold hover:bg-black">Search</button>
            </form>
            <p className="mt-4 text-sm text-[#514F50] flex flex-wrap gap-x-3 gap-y-1">
              Popular:
              {popularSearches.slice(0, 4).map((s) => <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} className="text-[#326206] font-semibold underline underline-offset-4 decoration-[#326206]/40 hover:decoration-[#326206]">{s}</Link>)}
            </p>
          </div>
          <nav aria-label="Most used" className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topTasks.map((t) => (
              <Link key={t.label} to={t.href} className="group flex items-center gap-3 rounded-2xl bg-white border border-gray-200 px-4 py-4 text-black hover:border-[#326206] hover:text-[#326206] transition-colors">
                <t.icon className="w-5 h-5 text-[#326206] shrink-0" />
                <span className="text-sm font-semibold leading-tight">{t.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* 4. Alerts (red panel) + circulars (numbered list) */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-3xl bg-[#9D2B1F] text-white p-7 md:p-9">
            <Kicker light>Stay safe</Kicker>
            <h2 className="mt-4 text-3xl font-extrabold !text-white">Important alerts</h2>
            <ul className="mt-6 divide-y divide-white/15">
              {alerts.map((a) => (
                <li key={a.title}>
                  <Link to={a.href} className="group flex gap-4 py-5">
                    <a.icon className="w-5 h-5 mt-0.5 shrink-0 text-white/80" />
                    <span>
                      <span className="block text-[11px] font-bold uppercase tracking-widest text-white/80">{a.level} · {shortDate(a.date)}</span>
                      <span className="block mt-1 font-semibold group-hover:underline underline-offset-4">{a.title}</span>
                      <span className="block mt-1 text-sm text-white/80">{a.text}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-7 rounded-3xl border border-gray-200 p-7 md:p-9">
            <div className="flex items-end justify-between gap-4">
              <div>
                <Kicker>Regulatory updates</Kicker>
                <h2 className="mt-4 text-3xl font-extrabold">Latest circulars</h2>
              </div>
              <Link to="/regulations" className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold text-[#326206] hover:underline underline-offset-4">All circulars <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <ol className="mt-6">
              {latestCirculars.map((c, i) => (
                <li key={c.ref} className="border-t border-gray-200 first:border-t-0">
                  <Link to={`/regulations/${c.id}`} className="group flex gap-5 py-5">
                    <span className="font-heading text-3xl font-extrabold text-[#326206]/25 group-hover:text-[#326206] w-10 shrink-0 transition-colors">0{i + 1}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold text-black group-hover:text-[#326206] leading-snug">{c.title}</span>
                      <span className="block mt-1 text-sm">{c.ref} · Issued {shortDate(c.issued)}</span>
                    </span>
                    {isNew(c) && <span className="self-start text-[11px] font-bold uppercase px-2.5 py-1 rounded-full bg-white text-[#326206] ring-1 ring-[#326206]/25">New</span>}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 5. Figures over a city photo (right after alerts and circulars) */}
      <section className="relative py-20 md:py-28 text-white overflow-hidden" aria-labelledby="figures-title">
        <img src="./d2/abuja.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 70%" }} loading="lazy" />
        <div className="absolute inset-0 bg-[#326206]/85" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4">
          <Kicker light>By the numbers</Kicker>
          <h2 id="figures-title" className="mt-4 text-4xl md:text-5xl font-extrabold !text-white">Nigeria's pension industry</h2>
          <dl className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
            {figures.map((f) => (
              <div key={f.label} className="border-l-2 border-white/50 pl-5">
                <dd className="font-heading text-3xl lg:text-[42px] font-extrabold lg:whitespace-nowrap">{f.value}</dd>
                <dt className="mt-2 text-sm text-white/80">{f.label}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-12 text-sm text-white/70">As at 30 Sep 2026 · PenCom monthly report. Figures are updated every month after approval by the Research and Surveillance departments.{" "}
            <Link to="/resources#publications" className="text-white font-semibold underline underline-offset-4">See full reports</Link>
          </p>
        </div>
      </section>

      {/* 6. Video right after the figures: the numbers, then the story behind them.
          Kept away from the news (portals sit between), so the photo blocks don't look like a gallery */}
      <section className="py-20 md:py-24" aria-labelledby="video-title">
        <div className="max-w-7xl mx-auto px-4">
          {/* PenCom at Work video, side by side */}
          <div className="mt-6 grid lg:grid-cols-12 rounded-3xl overflow-hidden bg-[#F4F4F4]">
            <div className="lg:col-span-7 relative">
              <video controls poster="./video-poster.jpg" className="w-full h-full aspect-video object-cover" preload="metadata">
                <source src="./highlight-video2.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <PlayCircle className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="lg:col-span-5 p-7 md:p-10 flex flex-col justify-center">
              <Kicker>Video</Kicker>
              <h2 id="video-title" className="mt-4 text-3xl font-extrabold">PenCom at Work</h2>
              <p className="mt-3">See how the Commission protects retirement savings for millions of Nigerians. Watch past events and livestreams in the video archive.</p>
              <Link to="/connect" className="mt-6 self-start inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#326206] text-white font-bold hover:bg-black">Video archive <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Online services on a light band */}
      <section className="py-20 md:py-24 bg-[#F4F4F4]" aria-labelledby="portals-title">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-6 mb-10 items-end">
            <div className="lg:col-span-7">
              <Kicker>Online services</Kicker>
              <h2 id="portals-title" className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight">PenCom portals</h2>
            </div>
            <p className="lg:col-span-5">Choose a portal to see what it is for and what you need before you go.</p>
          </div>
          <PortalHub />
        </div>
      </section>

      {/* 8. News like a magazine: one big story and two smaller ones */}
      <section className="py-20 md:py-24" aria-labelledby="news-title">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <Kicker>News and events</Kicker>
              <h2 id="news-title" className="mt-4 text-4xl md:text-5xl font-extrabold">Latest from PenCom</h2>
            </div>
            <Link to="/connect" className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold text-[#326206] hover:underline underline-offset-4">All news <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid lg:grid-cols-12 gap-6">
            {latestNews.slice(0, 1).map((n) => (
              <Link key={n.id} to="/connect" className="group lg:col-span-7 relative block rounded-3xl overflow-hidden min-h-[380px] md:min-h-[460px] bg-[#326206]">
                <img src={n.image} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white text-[#326206] ring-1 ring-[#326206]/25">{n.category}</span>
                  <h3 className="mt-4 text-2xl md:text-3xl font-extrabold !text-white leading-tight group-hover:underline underline-offset-4">{n.title}</h3>
                  <p className="mt-2 text-white/80 max-w-xl">{n.excerpt}</p>
                  <p className="mt-3 text-sm text-white/70">{shortDate(n.date)}</p>
                </div>
              </Link>
            ))}
            <div className="lg:col-span-5 grid gap-6">
              {latestNews.slice(1, 3).map((n) => (
                <Link key={n.id} to="/connect" className="group grid grid-cols-5 gap-4 rounded-3xl border border-gray-200 p-3 hover:border-[#326206]/40 transition-colors">
                  <div className="col-span-2 rounded-2xl overflow-hidden min-h-[140px]">
                    <img src={n.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                  </div>
                  <div className="col-span-3 py-2 pr-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#326206]">{n.category}</p>
                    <h3 className="mt-2 font-bold text-black leading-snug group-hover:text-[#326206]">{n.title}</h3>
                    <p className="mt-2 text-sm">{shortDate(n.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* (Design 2 keeps Home short: the services list is reached from "Find your path",
          the task buttons and the Services menu, so it is not repeated here.) */}

      {/* 9. FAQs (contact details are in the footer and top bar, so no repeat here) */}
      <section className="py-20 md:py-24 border-t border-gray-100" aria-labelledby="faq-title">
        <div className="max-w-7xl mx-auto px-4">
          <div>
            <Kicker>Help</Kicker>
            <h2 id="faq-title" className="mt-4 text-4xl font-extrabold">Questions people ask</h2>
            <div className="mt-8 space-y-3">
              {faqs.slice(0, 5).map((f) => (
                <details key={f.question} className="group rounded-2xl bg-[#F5F7F2] open:bg-white open:ring-2 open:ring-[#326206]/20">
                  <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-6 py-5 font-bold text-black">
                    {f.question}
                    <span className="w-8 h-8 rounded-full bg-white group-open:bg-[#326206] group-open:text-white flex items-center justify-center shrink-0 text-[#326206]"><ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" /></span>
                  </summary>
                  <p className="px-6 pb-6 -mt-1 leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
            <Link to="/resources/faq" className="mt-6 inline-flex items-center gap-1.5 font-bold text-[#326206] hover:underline underline-offset-4">All FAQs <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      </section>

    </div>
  );
}

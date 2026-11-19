import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ArrowRight, Pause, Play } from "lucide-react";

// Announcement pop-up (13 Nov meeting, sections 4 and 5):
// "images that pop up when someone visits the website to highlight updates",
// "updates to work like the slider", and management information kept prominent.
// Not an advert: it shows approved PenCom updates only, in the CMS this would be an
// "Announcement" content type with an image, link, start date and end date.
// Shows on the Home page only, about 1 second after it opens (team decision),
// unless the person ticked "Don't show again". On other pages it opens only from the Updates bar. Easy to close (X, Esc, click outside), pauses on hover,
// can be reopened from the Updates bar. How often it shows can be adjusted later (e.g. once per visit).

const VERSION = "2026-11-17"; // change when new announcements are published, so people see them again
const HIDE = "pencom-updates-hide";

const slides = [
  { label: "From the Director General", date: "17 Nov 2026", title: "Faster, simpler service for retirees", text: "A message from the Director General on our priorities for retirees and contributors this year.", image: "./exec-dg.jpg", position: "object-[center_18%]", href: "/about#executive", cta: "Read the message" },
  { label: "New circular", date: "10 Nov 2026", title: "Pencare enrolment for retirees", text: "PFAs must now get each retiree's consent before enrolling them in Pencare health insurance.", image: "./news-circular.png", position: "object-center md:object-[20%_center]", href: "/regulations/pencare-consent-circular-2026", cta: "Read the circular" },
  { label: "Fraud alert", date: "14 Nov 2026", title: "PenCom will never ask for your PIN", text: "Do not share your RSA PIN, password or bank details with anyone who calls or messages you.", image: "./banner-elders.jpg", position: "object-[60%_center]", href: "/connect#complaint", cta: "Report a scam" },
  { label: "Personal Pension Plan", date: "22 Oct 2026", title: "Self-employed? Start saving today", text: "Traders, artisans and small business owners can now save for retirement in amounts that suit them.", image: "./banner-family.jpg", position: "object-[55%_center]", href: "/services#ppp", cta: "Find out more" },
];
const SLIDE_MS = 7000;

const read = (store: Storage, key: string) => { try { return store.getItem(key); } catch { return null; } };
const write = (store: Storage, key: string, v: string) => { try { store.setItem(key, v); } catch { /* storage blocked */ } };

export default function UpdatesPopup() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [stopped, setStopped] = useState(false); // the pause button
  const paused = hovering || stopped;
  const reduce = useReducedMotion();
  const [hideNext, setHideNext] = useState(false);
  // Focus goes to the pop-up itself (not the X), so no ring appears for mouse users;
  // keyboard users land inside the pop-up and can Tab to the X.
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const location = useLocation();
  const skipNext = useRef(false); // true when the person clicked a link inside the pop-up

  // Show on the Home page only, about 1 second after it opens, unless the person chose "Don't show again".
  // On the first visit to the home page the cookie banner comes first; the pop-up waits until it is answered,
  // so only one thing asks for attention at a time.
  useEffect(() => {
    setOpen(false);
    if (location.pathname !== "/") return; // Home page only
    if (read(localStorage, HIDE) === VERSION) return;
    if (skipNext.current) { skipNext.current = false; return; }
    let t: ReturnType<typeof setTimeout> | undefined;
    const show = (delay: number) => {
      t = setTimeout(() => {
        if (read(localStorage, HIDE) === VERSION) return;
        lastFocus.current = document.activeElement as HTMLElement;
        setI(0);
        setOpen(true);
      }, delay);
    };
    const cookieBannerComing = location.pathname === "/" && !read(localStorage, "pencom-cookie-consent");
    if (!cookieBannerComing) { show(1000); return () => clearTimeout(t); }
    const after = () => show(800);
    window.addEventListener("pencom:cookie-banner-closed", after, { once: true });
    return () => { window.removeEventListener("pencom:cookie-banner-closed", after); clearTimeout(t); };
  }, [location.pathname]);

  // The Updates bar can reopen it
  useEffect(() => {
    const reopen = () => { lastFocus.current = document.activeElement as HTMLElement; setI(0); setOpen(true); };
    window.addEventListener("pencom:open-updates", reopen);
    return () => window.removeEventListener("pencom:open-updates", reopen);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => dialogRef.current?.focus({ preventScroll: true }), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") setI((x) => (x + 1) % slides.length);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + slides.length) % slides.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    if (hideNext) write(localStorage, HIDE, VERSION);
    setOpen(false);
    lastFocus.current?.focus?.();
  };

  const s = slides[i];
  const next = slides[(i + 1) % slides.length];
  const go = (n: number) => setI((n + slides.length) % slides.length);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            ref={dialogRef} tabIndex={-1}
            role="dialog" aria-modal="true" aria-labelledby="updates-title" aria-roledescription="carousel"
            initial={{ y: 30, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}
            className="relative outline-none w-full max-w-[420px] h-[min(680px,calc(100svh-32px))] rounded-[28px] overflow-hidden bg-[#326206] text-white shadow-2xl"
          >
            {/* Design 2: a tall "story" card. The photo fills the card, words sit on the photo. */}
            <AnimatePresence initial={false}>
              <motion.img
                key={s.image} src={s.image} alt=""
                className={`absolute inset-0 w-full h-full object-cover ${s.position}`}
                initial={{ opacity: 0, scale: reduce ? 1 : 1.12 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 1 }}
                transition={{ opacity: { duration: 0.6 }, scale: { duration: reduce ? 0 : SLIDE_MS / 1000, ease: "linear" } }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/85 to-transparent" aria-hidden="true" />

            {/* Timer bars across the top, like a status update */}
            <div className="absolute top-0 inset-x-0 p-4 z-10">
              <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}>
                {slides.map((x, n) => (
                  <button key={x.title} onClick={() => go(n)} aria-label={`Update ${n + 1} of ${slides.length}: ${x.title}`} aria-current={n === i} className="h-[3px] rounded-full bg-white/30 overflow-hidden">
                    {n < i && <span className="block h-full bg-white" />}
                    {n === i && reduce && <span className="block h-full bg-white" />}
                    {n === i && !reduce && (
                      <span
                        key={`${i}-${open}`}
                        className="block h-full bg-white origin-left"
                        style={{ animation: `pencom-progress ${SLIDE_MS}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
                        onAnimationEnd={() => go(i + 1)}
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center"><img src="./pencom-logo-sm.png" alt="" className="h-7" /></span>
                  <span className="leading-tight">
                    <span className="block text-sm font-bold">PenCom</span>
                    <span className="block text-[11px] text-white/75">{s.date}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {!reduce && <button onClick={() => setStopped(!stopped)} className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center" aria-label={stopped ? "Play updates" : "Pause updates"}>
                    {stopped ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>}
                  <button onClick={close} className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center" aria-label="Close updates">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tap the left or right side of the photo to go back or forward */}
            <button onClick={() => go(i - 1)} className="absolute left-0 top-24 bottom-1/2 w-1/3 z-[5]" aria-label="Previous update" />
            <button onClick={() => go(i + 1)} className="absolute right-0 top-24 bottom-1/2 w-1/3 z-[5]" aria-label="Next update" />

            {/* Words on the photo */}
            <div className="absolute inset-x-0 bottom-0 p-6 z-10" aria-live={paused ? "polite" : "off"}>
              <AnimatePresence mode="wait">
                <motion.div key={s.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                  <span className={`inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${/fraud/i.test(s.label) ? "bg-[#9D2B1F] text-white" : "bg-white text-[#326206] ring-1 ring-[#326206]/25"}`}>{s.label}</span>
                  <h2 id="updates-title" className="mt-3 text-3xl font-extrabold leading-[1.1] !text-white">{s.title}</h2>
                  <p className="mt-3 text-white/85 leading-relaxed">{s.text}</p>
                  <Link to={s.href} onClick={() => { skipNext.current = true; close(); }} className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-white text-[#326206] font-bold hover:bg-[#EEF3E8] transition-colors">
                    {s.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                <button onClick={() => go(i + 1)} className="flex items-center gap-2 min-w-0 text-left text-white/80 hover:text-white">
                  <img src={next.image} alt="" className={`w-8 h-8 rounded-full object-cover ring-2 ring-white/40 ${next.position}`} />
                  <span className="truncate"><span className="font-bold">Next:</span> {next.title}</span>
                </button>
                <label className="shrink-0 flex items-center gap-1.5 cursor-pointer text-white/80">
                  <input type="checkbox" checked={hideNext} onChange={(e) => setHideNext(e.target.checked)} className="w-4 h-4 accent-[#326206]" />
                  Don't show again
                </label>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

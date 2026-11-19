import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useReducedMotion, AnimatePresence } from "framer-motion";

// Vertical history timeline (top to bottom), animated as the user scrolls:
// - the green line fills down the page as you read
// - each milestone slides in when it reaches the screen
// - the milestone in the middle of the screen is highlighted and opens its details
// - the year list on the left lets people jump to (select) any year
// Animations switch off for people who have asked their device for less motion.

export type Milestone = { year: string; title: string; desc: string; detail: string };

export default function HistoryTimeline({ items }: { items: Milestone[] }) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState<number | null>(null);

  // Green line grows with scroll progress through the timeline
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start 70%", "end 50%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  // The milestone crossing the middle of the screen becomes the active one
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); }),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  // When the user scrolls on their own, the highlight follows the scroll again
  useEffect(() => { if (pinned !== null && pinned !== active) { const t = setTimeout(() => setPinned(null), 900); return () => clearTimeout(t); } }, [active, pinned]);

  const select = (i: number) => {
    setPinned(i);
    setActive(i);
    const el = refs.current[i];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2 + el.offsetHeight / 2;
      window.scrollTo({ top: y, behavior: reduce ? ("instant" as ScrollBehavior) : "smooth" });
    }
  };
  const current = pinned ?? active;

  // Design 2: dark storytelling layout. Year chips across the top; each milestone has a huge year
  // on the left, a gold line that fills as you scroll, and the story on the right.
  return (
    <div className="text-white">
      <nav aria-label="Choose a year" className="sticky top-[calc(var(--header-h,126px)+56px)] z-10 -mx-4 px-4 py-3 bg-[#326206]/95 backdrop-blur">
        <ol className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          {items.map((m, i) => (
            <li key={m.year} className="shrink-0">
              <button
                onClick={() => select(i)}
                aria-current={current === i ? "step" : undefined}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${current === i ? "bg-white text-[#326206] ring-1 ring-[#326206]/25" : i < current ? "bg-white/15 text-white" : "border border-white/25 text-white/70 hover:text-white hover:border-white"}`}
              >
                {m.year}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div ref={wrap} className="relative mt-8">
        <div className="absolute left-[118px] md:left-[248px] top-0 bottom-0 w-[2px] bg-white/10" aria-hidden="true" />
        <motion.div className="absolute left-[118px] md:left-[248px] top-0 bottom-0 w-[2px] bg-white origin-top" style={{ scaleY: reduce ? 1 : fill }} aria-hidden="true" />
        <ol>
          {items.map((m, i) => {
            const on = current === i;
            return (
              <motion.li
                key={m.year}
                ref={(el) => { refs.current[i] = el; }}
                data-i={i}
                initial={reduce ? false : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative grid grid-cols-[100px_1fr] md:grid-cols-[220px_1fr] gap-9 md:gap-14 py-6"
              >
                <button onClick={() => select(i)} className={`text-left font-heading font-extrabold leading-none transition-all duration-300 ${on ? "text-5xl md:text-7xl text-white" : "text-4xl md:text-6xl text-white/25 hover:text-white/60"}`} aria-label={`Show ${m.year}`}>
                  {m.year}
                </button>
                <span className={`absolute left-[112px] md:left-[242px] top-9 w-3.5 h-3.5 rounded-full transition-all ${on ? "bg-white ring-4 ring-white/30 scale-125" : "bg-[#326206] border-2 border-white/40"}`} aria-hidden="true" />
                <button onClick={() => select(i)} aria-expanded={on} className="text-left pt-1">
                  <h3 className={`text-xl md:text-2xl font-extrabold leading-snug ${on ? "text-white" : "text-white/70"}`}>{m.title}</h3>
                  <p className={`mt-2 leading-relaxed ${on ? "text-white/85" : "text-white/50"}`}>{m.desc}</p>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.3 }}
                        className="overflow-hidden text-sm leading-relaxed text-white/75"
                      >
                        <span className="block mt-4 pl-4 border-l-2 border-white/40">{m.detail}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

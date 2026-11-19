import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { docs, isOutdated, isNew, docDate, statusStyle, type Doc, type DocType } from "@/lib/library";
import { matchesQuery } from "@/lib/searchMatch";

// One searchable, filterable document library, used on Regulations and on Resources
// (questionnaire DES-23 and DES-27). Built to cope with thousands of PDFs:
// keyword search (everyday words + abbreviations), six filters, sorting and pages of results.

type StatusFilter = "current" | "all" | "outdated";
const PAGE_SIZE = 12;
const uniq = (xs: string[]) => Array.from(new Set(xs)).sort();

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block text-sm font-medium text-black">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 bg-white font-normal text-[#514F50] focus:border-[#326206] outline-none">
        <option value="">All</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </label>
  );
}

// Design 2: documents as wide rows with a bold type tile on the left (like a file cabinet)
export function DocCard({ d }: { d: Doc }) {
  const short = d.type === "Circular" ? "CIR" : d.type === "Regulation" ? "REG" : d.type === "Guideline" ? "GDL" : d.type === "Form" ? "FORM" : d.type === "Report" ? "RPT" : d.type.slice(0, 3).toUpperCase();
  return (
    <Link to={`/regulations/${d.id}`} className="group flex items-stretch gap-5 rounded-3xl bg-[#F5F7F2] p-4 hover:bg-[#EEF3E8] transition-colors">
      <span className={`w-20 shrink-0 rounded-2xl flex flex-col items-center justify-center font-heading font-extrabold ${isOutdated(d) ? "bg-gray-200 text-[#514F50]" : "bg-[#326206] text-white"}`}>
        <span className="text-lg leading-none">{short}</span>
        <span className="mt-1 text-[10px] font-bold text-white/60">{d.issued.slice(0, 4)}</span>
      </span>
      <span className="flex-1 min-w-0 py-1">
        <span className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="font-bold uppercase tracking-widest text-[#326206]">{d.type}</span>
          <span>{d.ref}</span>
          <span className={`font-bold px-2 py-0.5 rounded-full ${statusStyle[d.status]}`}>{d.status}</span>
          {isNew(d) && !isOutdated(d) && <span className="font-bold px-2 py-0.5 rounded-full bg-white text-[#326206] ring-1 ring-[#326206]/25">New</span>}
        </span>
        <span className={`block mt-1.5 text-lg font-bold leading-snug group-hover:text-[#326206] ${isOutdated(d) ? "text-[#514F50]" : "text-black"}`}>{d.title}</span>
        <span className="block text-sm mt-1 line-clamp-2">{d.summary}</span>
        <span className="block text-xs mt-2">{d.department} · Issued {docDate(d.issued)}{d.size && ` · PDF ${d.size}`}</span>
      </span>
      <span className="hidden sm:flex items-center pr-2"><span className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#326206] group-hover:bg-white group-hover:text-[#326206] transition-colors">→</span></span>
    </Link>
  );
}

export default function DocumentLibrary({
  types, initialType = "", initialQuery = "", title = "Search the library", placeholder = "Search by title, reference number or topic, e.g. RSA transfer",
}: { types?: DocType[]; initialType?: string; initialQuery?: string; title?: string; placeholder?: string }) {
  const pool = useMemo(() => (types ? docs.filter((d) => types.includes(d.type)) : docs), [types]);
  const [q, setQ] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [department, setDepartment] = useState("");
  const [appliesTo, setAppliesTo] = useState("");
  const [status, setStatus] = useState<StatusFilter>("current");
  const [sort, setSort] = useState<"newest" | "oldest" | "az">("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => { setType(initialType); }, [initialType]);

  const options = useMemo(() => ({
    type: uniq(pool.map((d) => d.type)),
    subject: uniq(pool.map((d) => d.subject)),
    year: uniq(pool.map((d) => d.issued.slice(0, 4))).reverse(),
    department: uniq(pool.map((d) => d.department)),
    appliesTo: uniq(pool.flatMap((d) => d.appliesTo)),
  }), [pool]);

  const results = useMemo(() => pool
    .filter((d) =>
      (!type || d.type === type) && (!subject || d.subject === subject) && (!year || d.issued.startsWith(year)) &&
      (!department || d.department === department) && (!appliesTo || d.appliesTo.includes(appliesTo)) &&
      (status === "all" || (status === "current" ? !isOutdated(d) : isOutdated(d))) &&
      matchesQuery(`${d.title} ${d.ref} ${d.summary} ${d.subject} ${d.type} ${d.department}`, q))
    .sort((a, b) => sort === "az" ? a.title.localeCompare(b.title) : sort === "oldest" ? a.issued.localeCompare(b.issued) : b.issued.localeCompare(a.issued)),
  [pool, q, type, subject, year, department, appliesTo, status, sort]);

  // Back to page 1 whenever the search or a filter changes
  useEffect(() => { setPage(1); }, [q, type, subject, year, department, appliesTo, status, sort]);

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const shown = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const from = results.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(page * PAGE_SIZE, results.length);
  const goTo = (p: number) => {
    setPage(p);
    const el = top.current;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 126) - 16, behavior: "instant" as ScrollBehavior });
  };

  const active = [type, subject, year, department, appliesTo].filter(Boolean).length + (status !== "current" ? 1 : 0);
  const clear = () => { setType(""); setSubject(""); setYear(""); setDepartment(""); setAppliesTo(""); setStatus("current"); setQ(""); };

  return (
    <section aria-label={title} ref={top}>
      <h2 className="text-4xl md:text-5xl font-extrabold">{title}</h2>
      <div className="mt-4 flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search documents</span>
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A7B7C]" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
            className="w-full pl-12 pr-4 py-4 rounded-full bg-[#F5F7F2] border-2 border-transparent focus:border-[#326206] focus:bg-white outline-none text-base" />
        </label>
        <button onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen} className="lg:hidden inline-flex items-center gap-2 px-4 rounded-lg border border-gray-300 font-semibold text-sm">
          <SlidersHorizontal className="w-4 h-4" /> Filters{active > 0 && ` (${active})`}
        </button>
      </div>
      <p className="mt-2 text-xs">Tip: short forms work too, for example PFA, RSA, PCC or PPP.</p>

      <div className="mt-6 grid lg:grid-cols-4 gap-6 items-start">
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block rounded-3xl bg-[#326206] p-6 space-y-4 [&_label]:!text-white [&_legend]:!text-white lg:sticky lg:top-[calc(var(--header-h,126px)+16px)]`} aria-label="Filters">
          <fieldset>
            <legend className="text-sm font-medium text-black">Status</legend>
            <div className="mt-1 grid grid-cols-3 rounded-lg border border-gray-300 overflow-hidden text-xs font-semibold">
              {([["current", "Current"], ["all", "All"], ["outdated", "Outdated"]] as const).map(([k, l]) => (
                <button key={k} type="button" onClick={() => setStatus(k)} aria-pressed={status === k} className={`py-2 ${status === k ? "bg-white text-[#326206] ring-1 ring-[#326206]/25" : "bg-white hover:bg-[#EEF3E8]"}`}>{l}</button>
              ))}
            </div>
          </fieldset>
          {options.type.length > 1 && <Select label="Document type" value={type} onChange={setType} options={options.type} />}
          <Select label="Subject" value={subject} onChange={setSubject} options={options.subject} />
          <Select label="Year issued" value={year} onChange={setYear} options={options.year} />
          <Select label="Department" value={department} onChange={setDepartment} options={options.department} />
          <Select label="Applies to (operator or user type)" value={appliesTo} onChange={setAppliesTo} options={options.appliesTo} />
          {(active > 0 || q) && (
            <button onClick={clear} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline"><X className="w-4 h-4" /> Clear all filters</button>
          )}
        </aside>

        <div className="lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <p className="text-sm" aria-live="polite">
              {results.length > 0 ? <>Showing <strong className="text-black">{from}–{to}</strong> of <strong className="text-black">{results.length}</strong> document{results.length === 1 ? "" : "s"}</> : "No documents"}
            </p>
            <label className="text-sm flex items-center gap-2">Sort
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="px-2 py-1.5 rounded-lg border border-gray-300 bg-white">
                <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="az">Title A–Z</option>
              </select>
            </label>
          </div>
          <div className="grid gap-3">{shown.map((d) => <DocCard key={d.id} d={d} />)}</div>

          {pages > 1 && (
            <nav aria-label="Pages of results" className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
              <button onClick={() => goTo(page - 1)} disabled={page === 1} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold disabled:opacity-40"><ChevronLeft className="w-4 h-4" /> Previous</button>
              {Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1).map((p, i, arr) => (
                <span key={p} className="flex items-center gap-1.5">
                  {i > 0 && p - arr[i - 1] > 1 && <span className="px-1">…</span>}
                  <button onClick={() => goTo(p)} aria-current={p === page ? "page" : undefined} className={`w-10 h-10 rounded-lg text-sm font-semibold ${p === page ? "bg-[#326206] text-white" : "border border-gray-300 hover:border-[#326206]"}`}>{p}</button>
                </span>
              ))}
              <button onClick={() => goTo(page + 1)} disabled={page === pages} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold disabled:opacity-40">Next <ChevronRight className="w-4 h-4" /></button>
            </nav>
          )}

          {results.length === 0 && (
            <div className="rounded-xl bg-[#EEF3E8] p-6 text-sm">
              <p className="font-semibold text-black">No documents found</p>
              <p className="mt-1">Try fewer words, or <button onClick={clear} className="font-semibold text-[#326206] underline">clear the filters</button>. Outdated documents are hidden unless you choose "All" or "Outdated".</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

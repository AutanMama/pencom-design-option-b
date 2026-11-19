import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Search as SearchIcon, FileText, BookOpen, HelpCircle, Building2, Compass, ArrowRight } from "lucide-react";
import PageBanner from "@/components/PageBanner";
import { services, faqs, operators } from "@/lib/data";
import { docs } from "@/lib/library";
import { matchesQuery } from "@/lib/searchMatch";

// Site search (questionnaire DES-27): everyday words and abbreviations both work,
// results can be filtered by type, and a "no results" search shows helpful next steps.

type Result = { type: string; title: string; text: string; href: string; date?: string };

const pages: Result[] = [
  { type: "Page", title: "Find your PFA (Pension Fund Administrator)", text: "List of licensed PFAs with phone numbers and websites", href: "/operators" },
  { type: "Page", title: "Lodge a complaint or enquiry", text: "Complaint form, report an employer, track your case", href: "/connect#complaint" },
  { type: "Page", title: "Zonal offices", text: "PenCom offices across Nigeria, addresses and phone numbers", href: "/connect#zonal" },
  { type: "Page", title: "Pension calculator", text: "Estimate your retirement savings (estimate only)", href: "/services#calculator" },
  { type: "Page", title: "Retirement benefits", text: "How retirees access benefits: programmed withdrawal, annuity, lump sum", href: "/services#retirement" },
  { type: "Page", title: "Pension Clearance Certificate (PCC)", text: "New PCC applications on eHub; view or print approved certificates", href: "/services#pcc" },
  { type: "Page", title: "Circulars", text: "Latest circulars and regulatory updates", href: "/regulations" },
  { type: "Page", title: "Forms and downloads", text: "Application forms, checklists and guides", href: "/resources#downloads" },
  { type: "Page", title: "About PenCom", text: "Mission, leadership, Service Charter", href: "/about" },
];

const allResults: Result[] = [
  ...pages,
  ...services.map((s) => ({ type: "Service", title: s.title, text: s.description, href: s.href })),
  ...docs.map((d) => ({ type: d.type === "Report" || d.type === "Form" ? "Document" : "Regulation", title: d.title, text: `${d.type} · ${d.ref} · ${d.status} · ${d.summary}`, href: `/regulations/${d.id}`, date: d.issued })),
  ...faqs.map((f) => ({ type: "FAQ", title: f.question, text: f.answer, href: "/resources/faq" })),
  ...operators.map((o) => ({ type: "Operator", title: o.name, text: `${o.type} · ${o.address} · ${o.phone}`, href: "/operators" })),
];

const typeIcons: Record<string, typeof FileText> = {
  Page: Compass, Service: BookOpen, Regulation: FileText, Document: FileText, FAQ: HelpCircle, Operator: Building2,
};

export const popularSearches = ["Find my PFA", "RSA transfer", "Retirement benefits", "PCC", "Circular", "Form", "Complaint", "Zonal office"];

function matches(r: Result, q: string) {
  if (!q.trim()) return false;
  return matchesQuery(`${r.title} ${r.text}`, q, false);
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") ?? "";
  const [draft, setDraft] = useState(q);
  const [type, setType] = useState("All");

  // Results whose title matches come first, then the rest
  const found = useMemo(() => {
    if (!q.trim()) return [];
    const hits = allResults.filter((r) => matches(r, q));
    const inTitle = hits.filter((r) => matches({ ...r, text: "" }, q));
    return [...inTitle, ...hits.filter((r) => !inTitle.includes(r))];
  }, [q]);
  const types = ["All", ...Array.from(new Set(found.map((r) => r.type)))];
  const shown = type === "All" ? found : found.filter((r) => r.type === type);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setType("All");
    navigate(`/search?q=${encodeURIComponent(draft.trim())}`);
  };

  return (
    <>
      <PageBanner label="Search" title="Search the website" description="Search services, documents, FAQs and operators. You can type everyday words or abbreviations like PFA, RSA or PCC." />
      <section className="max-w-4xl mx-auto px-4 py-10">
        <form onSubmit={submit} role="search" className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ADAEAF]" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What are you looking for?"
            aria-label="Search the website"
            className="w-full pl-12 pr-28 py-3.5 rounded-xl border border-gray-300 focus:border-[#326206] focus:ring-2 focus:ring-[#326206]/20 outline-none text-base"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#326206] text-white font-semibold rounded-lg hover:bg-[#234504]">Search</button>
        </form>

        {q && (
          <>
            <p className="mt-6 text-sm">
              <strong className="text-black">{found.length}</strong> result{found.length === 1 ? "" : "s"} for "<strong className="text-black">{q}</strong>"
            </p>
            {found.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
                {types.map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    aria-pressed={type === t}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${type === t ? "bg-[#326206] text-white border-[#326206]" : "border-gray-300 hover:border-[#326206] hover:text-[#326206]"}`}
                  >
                    {t}{t !== "All" && ` (${found.filter((r) => r.type === t).length})`}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <ul className="mt-6 space-y-3">
          {shown.map((r) => {
            const Icon = typeIcons[r.type] ?? FileText;
            return (
              <li key={r.type + r.title}>
                <Link to={r.href} className="group flex gap-4 p-4 rounded-xl border border-gray-200 hover:border-[#326206]/40 hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#EEF3E8] text-[#326206] flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#326206]">{r.type}{r.date && <span className="text-[#514F50] font-medium normal-case tracking-normal"> · {new Date(r.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>}</p>
                    <p className="font-semibold text-black group-hover:text-[#326206]">{r.title}</p>
                    <p className="text-sm line-clamp-2">{r.text}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {(!q || found.length === 0) && (
          <div className="mt-8 rounded-2xl bg-[#EEF3E8] p-6">
            {q && <h2 className="text-lg font-bold mb-1">No results found</h2>}
            <p className="text-sm mb-4">{q ? "Check the spelling, try fewer words, or try one of these popular searches:" : "Popular searches:"}</p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((s) => (
                <Link key={s} to={`/search?q=${encodeURIComponent(s)}`} onClick={() => { setDraft(s); setType("All"); }} className="px-3 py-1.5 bg-white rounded-full text-sm font-medium border border-[#326206]/20 hover:border-[#326206] hover:text-[#326206]">{s}</Link>
              ))}
            </div>
            {q && (
              <p className="text-sm mt-5">
                Still can't find it? <button onClick={() => window.dispatchEvent(new Event("pencom:open-chat"))} className="font-semibold text-[#326206] underline">Ask the PenCom Assistant</button> or call <a href="tel:094611300" className="font-semibold text-[#326206] underline">09-4611300</a>. <ArrowRight className="inline w-3.5 h-3.5" />
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}

import { useState } from "react";
import { Link, useParams } from "react-router";
import { ChevronRight, Download, Printer, Link2, Check, AlertTriangle, FileText, ArrowRight, Info } from "lucide-react";
import { docById, docs, docDate, isOutdated, statusStyle } from "@/lib/library";
import { NotFoundPage } from "@/pages/Legal";

// Regulatory item page (questionnaire DES-22, DES-23): title, type, reference number,
// issuing department, issue and effective dates, status, amended/replaced by, related documents,
// a plain-language summary and the official PDF.

export default function RegulationItem() {
  const { id } = useParams();
  const d = docById(id);
  const [copied, setCopied] = useState(false);
  if (!d) return <NotFoundPage />;

  const replacement = docById(d.supersededBy);
  const replaces = docById(d.supersedes);
  const amends = docById(d.amends);
  const amendedBy = (d.amendedBy ?? []).map((x) => docById(x)).filter(Boolean);
  const related = [
    ...(d.related ?? []).map((x) => docById(x)),
    ...docs.filter((o) => o.id !== d.id && o.subject === d.subject && !(d.related ?? []).includes(o.id)),
  ].filter((x, i, arr) => x && arr.findIndex((y) => y?.id === x.id) === i && x.id !== d.supersededBy && x.id !== d.supersedes).slice(0, 4);

  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  };

  const facts: [string, React.ReactNode][] = [
    ["Type", d.type],
    ["Reference number", d.ref],
    ["Issued by", d.department],
    ["Date issued", docDate(d.issued)],
    ["Effective date", d.effective ? docDate(d.effective) : "On issue"],
    ["Status", <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusStyle[d.status]}`}>{d.status}</span>],
    ["Applies to", d.appliesTo.join(", ")],
    ["Subject", d.subject],
  ];

  return (
    <div className="bg-[#F7F8F5]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm flex flex-wrap items-center gap-1 print:hidden">
          <Link to="/" className="hover:text-[#326206]">Home</Link><ChevronRight className="w-3.5 h-3.5" />
          <Link to="/regulations" className="hover:text-[#326206]">Regulations</Link><ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black line-clamp-1">{d.title}</span>
        </nav>

        {isOutdated(d) && (
          <div role="alert" className="mt-5 rounded-xl border-l-4 border-[#9D2B1F] bg-[#FBEAE8] p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-[#9D2B1F] shrink-0 mt-0.5" />
            <div className="text-sm text-black">
              <p className="font-bold">This document is no longer in force ({d.status.toLowerCase()}).</p>
              {replacement ? (
                <p className="mt-0.5">It has been replaced by <Link to={`/regulations/${replacement.id}`} className="font-semibold text-[#326206] underline">{replacement.title}</Link>.</p>
              ) : (
                <p className="mt-0.5">It is kept here for reference only.</p>
              )}
            </div>
          </div>
        )}
        {amendedBy.length > 0 && (
          <div className="mt-5 rounded-xl border-l-4 border-[#CA8D32] bg-[#FBF4E8] p-4 flex gap-3 text-sm text-black">
            <Info className="w-5 h-5 text-[#8A5E1C] shrink-0 mt-0.5" />
            <p>This document has been amended. Read it together with {amendedBy.map((a, i) => <span key={a!.id}>{i > 0 && ", "}<Link to={`/regulations/${a!.id}`} className="font-semibold text-[#326206] underline">{a!.title}</Link></span>)}.</p>
          </div>
        )}

        <div className="mt-6 grid lg:grid-cols-3 gap-6 items-start">
          <article className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#326206]">{d.type} · {d.ref}</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-2 leading-tight">{d.title}</h1>

            <div className="mt-5 flex flex-wrap gap-2 print:hidden">
              <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#326206] text-white text-sm font-semibold rounded-lg hover:bg-[#234504]">
                <Download className="w-4 h-4" /> Download official PDF{d.size && ` (${d.size})`}
              </a>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-sm font-semibold rounded-lg hover:border-[#326206] hover:text-[#326206]"><Printer className="w-4 h-4" /> Print</button>
              <button onClick={copy} className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-sm font-semibold rounded-lg hover:border-[#326206] hover:text-[#326206]">
                {copied ? <><Check className="w-4 h-4" /> Link copied</> : <><Link2 className="w-4 h-4" /> Copy link</>}
              </button>
            </div>

            <h2 className="text-lg font-bold mt-8">In plain language</h2>
            <p className="mt-2 leading-relaxed">{d.summary}</p>

            <div className="mt-6 rounded-xl bg-[#F7F8F5] p-4 text-sm flex gap-3">
              <FileText className="w-5 h-5 text-[#326206] shrink-0 mt-0.5" />
              <p>The summary above explains the document in simple words. The <strong className="text-black">official wording</strong> is in the signed PDF and does not change. If they differ, the PDF is correct.</p>
            </div>

            {(replaces || amends) && (
              <div className="mt-6 text-sm space-y-1">
                {replaces && <p>This document replaced <Link to={`/regulations/${replaces.id}`} className="font-semibold text-[#326206] underline">{replaces.title}</Link>.</p>}
                {amends && <p>This document amends <Link to={`/regulations/${amends.id}`} className="font-semibold text-[#326206] underline">{amends.title}</Link>.</p>}
              </div>
            )}
          </article>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold">Document details</h2>
              <dl className="mt-3 divide-y divide-gray-100 text-sm">
                {facts.map(([k, v]) => (
                  <div key={k} className="py-2 flex justify-between gap-4"><dt>{k}</dt><dd className="text-right font-medium text-black">{v}</dd></div>
                ))}
                {replacement && <div className="py-2 flex justify-between gap-4"><dt>Replaced by</dt><dd className="text-right"><Link to={`/regulations/${replacement.id}`} className="font-semibold text-[#326206] underline">{replacement.ref}</Link></dd></div>}
              </dl>
            </div>

            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 print:hidden">
                <h2 className="font-bold">Related documents</h2>
                <ul className="mt-3 space-y-2">
                  {related.map((r) => (
                    <li key={r!.id}>
                      <Link to={`/regulations/${r!.id}`} className="group flex gap-2 text-sm">
                        <FileText className="w-4 h-4 text-[#326206] shrink-0 mt-0.5" />
                        <span><span className="text-black font-medium group-hover:text-[#326206] group-hover:underline">{r!.title}</span><span className="block text-xs">{r!.type} · {docDate(r!.issued)}{isOutdated(r!) && ` · ${r!.status}`}</span></span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link to="/regulations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#326206] hover:underline print:hidden">Back to the library <ArrowRight className="w-4 h-4" /></Link>
          </aside>
        </div>
        <p className="text-xs mt-6">Sample document for the design. Details are confirmed by the issuing department before publication.</p>
      </div>
    </div>
  );
}

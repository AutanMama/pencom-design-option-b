// Shared keyword matching for site search and the document libraries (questionnaire DES-27):
// people can type everyday words or abbreviations (PFA, RSA, PCC...) and still find the right thing.

const synonyms: Record<string, string[]> = {
  pfa: ["pension fund administrator", "pfa"],
  pfc: ["pension fund custodian", "pfc"],
  cpfa: ["closed pension fund administrator", "cpfa"],
  rsa: ["retirement savings account", "rsa"],
  pcc: ["pension clearance certificate", "pension clearance", "pcc"],
  ppp: ["personal pension plan", "ppp", "micro pension"],
  cps: ["contributory pension scheme", "cps"],
  pra: ["pension reform act", "pra"],
  avc: ["voluntary contribution", "avc"],
  kyc: ["know your customer", "kyc"],
  retire: ["retire", "retiree", "retirement", "benefit"],
  complain: ["complain", "complaint", "enquiry"],
  office: ["office", "zonal"],
  form: ["form", "download"],
  invest: ["invest", "investment"],
  transfer: ["transfer"],
  law: ["act", "law", "regulation"],
};

const stopWords = new Set(["my", "the", "a", "an", "of", "for", "how", "to", "i", "do", "can", "is", "find", "get", "and", "on", "in", "about", "what"]);

/** Every meaningful word in the query must appear in the text (directly or through a synonym). */
export function matchesQuery(text: string, query: string, emptyMatchesAll = true): boolean {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w && !stopWords.has(w));
  if (words.length === 0) return emptyMatchesAll;
  const hay = text.toLowerCase();
  return words.every((w) => {
    const key = Object.keys(synonyms).find((k) => w.startsWith(k));
    return [w, ...(key ? synonyms[key] : [])].some((o) => hay.includes(o));
  });
}

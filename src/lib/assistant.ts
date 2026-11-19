// Answers for the PenCom Assistant (questionnaire DES-35 to DES-37).
// General information only, taken from the site's own guides and library.
// Each answer links to the page where the user can read more or act.

export type Answer = {
  id: string;
  keywords: string[];
  text: string;
  links: { label: string; to: string }[];
  source?: { label: string; to: string };
};

export const answers: Answer[] = [
  {
    id: "cps", keywords: ["cps", "contributory pension", "what is pension", "pension scheme", "how does pension work"],
    text: "The Contributory Pension Scheme (CPS) is the pension system for workers in Nigeria. Each month you pay at least 8% of your pay and your employer pays at least 10% into your Retirement Savings Account (RSA). The money is invested by your Pension Fund Administrator (PFA) and paid to you when you retire.",
    links: [{ label: "Open an RSA", to: "/services#open-rsa" }, { label: "Pension calculator", to: "/services#calculator" }],
    source: { label: "Pension Reform Act 2014", to: "/regulations/pension-reform-act-2014" },
  },
  {
    id: "open-rsa", keywords: ["open rsa", "open an rsa", "register rsa", "new rsa", "rsa pin", "get pin", "retirement savings account"],
    text: "To open an RSA, choose a licensed PFA and register with your NIN, BVN, a valid ID and a passport photo. The PFA captures your details and you receive your RSA PIN by SMS. Give the PIN to your employer so your contributions go into your account.",
    links: [{ label: "Step-by-step guide", to: "/services#open-rsa" }, { label: "Find a PFA", to: "/operators" }],
  },
  {
    id: "find-pfa", keywords: ["find pfa", "my pfa", "which pfa", "list of pfa", "pfa contact", "pfa phone", "pension fund administrator", "pfa"],
    text: "You can see all licensed PFAs with their phone numbers, websites and locations on the Operators page. If you don't know which PFA holds your RSA, check an old payslip or RSA statement, or ask your employer's HR office.",
    links: [{ label: "Licensed PFAs", to: "/operators" }],
  },
  {
    id: "transfer", keywords: ["transfer", "change pfa", "move pfa", "switch pfa", "rsa transfer", "move my rsa"],
    text: "You can move your RSA to another PFA once a year, free of charge. Contact the new PFA you want and fill their transfer request form; the two PFAs move your money and records, and you get an SMS when it is done. Your KYC details must be up to date first.",
    links: [{ label: "RSA transfer guide", to: "/services#rsa-transfer" }, { label: "See PFA returns", to: "/operators#performance" }],
    source: { label: "Guidelines on Transfer of RSAs", to: "/regulations/rsa-transfer-guidelines-2021" },
  },
  {
    id: "retire", keywords: ["retire", "retirement", "benefit", "withdraw", "access pension", "programmed withdrawal", "annuity", "lump sum", "50"],
    text: "When you retire at 50 or above, your PFA pays your benefits from your RSA. You can choose Programmed Withdrawal (monthly payments from your PFA) or an Annuity (monthly payments for life from an insurance company), and you may get a lump sum if enough is left for your monthly pension. Contact your PFA a few months before you retire.",
    links: [{ label: "Retirement benefits guide", to: "/services#retirement" }, { label: "Benefit application form", to: "/regulations/benefit-application-form" }],
    source: { label: "Regulation on Retirement Benefits", to: "/regulations/regulation-on-administration-2020" },
  },
  {
    id: "lost-job", keywords: ["lost my job", "lose my job", "sacked", "unemployed", "before 50", "laid off"],
    text: "If you lose your job before 50 and do not get another one, the law allows you to take part of your RSA balance after a waiting period. Your PFA will check that you qualify. The rest stays in your RSA until you retire.",
    links: [{ label: "Retirement benefits guide", to: "/services#retirement" }],
    source: { label: "Pension Reform Act 2014", to: "/regulations/pension-reform-act-2014" },
  },
  {
    id: "pcc", keywords: ["pcc", "clearance", "certificate", "ehub", "contract", "bid"],
    text: "A Pension Clearance Certificate (PCC) shows that a company obeys the Pension Reform Act. Employers apply for a new PCC on eHub. A certificate approved before eHub can be viewed or printed on the old PCC portal.",
    links: [{ label: "PCC guide", to: "/services#pcc" }, { label: "Go to the portals", to: "/services#portals" }],
  },
  {
    id: "ppp", keywords: ["ppp", "personal pension", "self employed", "self-employed", "informal", "trader", "artisan", "micro pension", "business owner"],
    text: "The Personal Pension Plan (PPP) lets self-employed people and informal sector workers save for retirement with a licensed PFA, in amounts that suit them. Part of what you save can be kept aside for emergencies. Register with your NIN, BVN and phone number.",
    links: [{ label: "Personal Pension Plan", to: "/services#ppp" }, { label: "Find a PFA", to: "/operators" }],
    source: { label: "PPP guidelines (2026)", to: "/regulations/ppp-guidelines-2026" },
  },
  {
    id: "employer", keywords: ["employer", "remit", "remittance", "deduct", "staff pension", "register my company", "employer code"],
    text: "Every employer with 3 or more staff must register with PenCom, deduct at least 8% from each staff member's pay, add at least 10%, and remit both to each staff member's PFA within 7 working days of paying salaries. Late or missing remittance attracts penalties.",
    links: [{ label: "Employer guide", to: "/services#enrolment" }, { label: "Employer registration form", to: "/regulations/employer-registration-form" }],
    source: { label: "Pension Reform Act 2014", to: "/regulations/pension-reform-act-2014" },
  },
  {
    id: "not-remitting", keywords: ["not remitting", "not paying my pension", "employer not paying", "deducted but", "not remitted", "report employer", "report my employer"],
    text: "If your employer deducts pension from your pay but does not pay it into your RSA, you can report them. You can stay confidential or report anonymously, and you will get a case reference to follow up.",
    links: [{ label: "Report an employer", to: "/connect#report" }],
  },
  {
    id: "pencare", keywords: ["pencare", "health", "insurance", "hospital", "hmo"],
    text: "Pencare gives retirees under the Contributory Pension Scheme access to health insurance. Ask your PFA about Pencare; they need your consent to enrol you, then you choose a health care provider near you.",
    links: [{ label: "Pencare guide", to: "/services#pencare" }],
    source: { label: "Pencare consent circular", to: "/regulations/pencare-consent-circular-2026" },
  },
  {
    id: "complaint", keywords: ["complain", "complaint", "petition", "grievance", "not happy", "delay", "problem with my pfa"],
    text: "First contact your PFA and give them a chance to solve it. If they don't, send a complaint to PenCom: you get a case reference straight away and we aim to resolve complaints within 14 working days.",
    links: [{ label: "Lodge a complaint", to: "/connect#complaint" }, { label: "Track my case", to: "/connect#track" }],
  },
  {
    id: "track", keywords: ["track", "case status", "case reference", "follow up", "my case"],
    text: "Enter your case reference on the Track my case page to see whether your case is received, assigned, under review or resolved.",
    links: [{ label: "Track my case", to: "/connect#track" }],
  },
  {
    id: "circular", keywords: ["circular", "regulation", "guideline", "law", "act", "document", "form", "download"],
    text: "All circulars, regulations, guidelines, reports and forms are in the regulatory library. You can filter by type, subject, year and department, and each document shows whether it is still current.",
    links: [{ label: "Regulatory library", to: "/regulations" }, { label: "Forms", to: "/resources#downloads" }],
  },
  {
    id: "office", keywords: ["office", "zonal", "address", "visit", "location", "where are you", "contact", "phone number", "call"],
    text: "PenCom's head office is at 174, Adetokunbo Ademola Crescent, Wuse II, Abuja, and there are zonal offices across Nigeria. You can call 09-4611300, Monday to Friday, 8am to 5pm.",
    links: [{ label: "Zonal offices", to: "/connect#zonal" }],
  },
  {
    id: "fraud", keywords: ["fraud", "scam", "someone called", "asked for my pin", "fake", "pay to get"],
    text: "PenCom will never ask for your RSA PIN, password or bank details, and never asks you to pay money to get your pension. If someone did, do not reply. Report it to PenCom and to your PFA.",
    links: [{ label: "Report it", to: "/connect#complaint" }],
  },
];

// Questions about a person's own account need their PFA or an official channel
export const personalPatterns = [/\bmy (balance|statement|account|money|savings|contribution)s?\b/i, /\bhow much (is|do i have)\b/i, /\bcheck my\b/i, /\bwhen will i (get|be paid|receive)\b/i];

// Things a user must never type into the chat
export const secretPatterns = [/\bpen\s?\d{9,15}\b/i, /\b\d{11}\b/, /\b\d{16}\b/, /\bpassword\b/i, /\bpin (is|:)/i, /\botp\b/i, /\bcvv\b/i];

export function findAnswer(input: string): Answer | null {
  const q = ` ${input.toLowerCase().replace(/[^a-z0-9 ]/g, " ")} `;
  let best: { a: Answer; score: number } | null = null;
  for (const a of answers) {
    let score = 0;
    for (const k of a.keywords) if (q.includes(` ${k} `) || q.includes(` ${k}s `) || (k.includes(" ") && q.includes(k))) score += k.split(" ").length + 1;
    if (score > (best?.score ?? 0)) best = { a, score };
  }
  return best?.a ?? null;
}

export const quickQuestions = ["Find my PFA", "Transfer my RSA", "Get my retirement benefits", "Personal Pension Plan", "Get a PCC", "Lodge a complaint"];

// Regulatory and document library (questionnaire DES-22, DES-23, DES-27).
// One list feeds the Regulations library, each document page, Resources, Home and site search.
// In the real site these come from the CMS; every entry here is sample data for the design.

export type DocType = "Act" | "Regulation" | "Guideline" | "Circular" | "Framework" | "Code" | "Report" | "Form";
export type DocStatus = "Current" | "Amended" | "Superseded" | "Revoked";

export type Doc = {
  id: string;
  title: string;
  type: DocType;
  subject: string;
  ref: string;
  department: string;
  issued: string; // yyyy-mm-dd
  effective?: string;
  status: DocStatus;
  appliesTo: string[];
  summary: string;
  supersededBy?: string;
  supersedes?: string;
  amends?: string;
  amendedBy?: string[];
  related?: string[];
  size?: string;
};

export const docs: Doc[] = [
  {
    id: "pension-reform-act-2014", title: "Pension Reform Act 2014", type: "Act", subject: "Legislation", ref: "PRA 2014", department: "Legal Services",
    issued: "2014-07-01", effective: "2014-07-01", status: "Current", appliesTo: ["Everyone"], supersedes: "pension-reform-act-2004", size: "3.1 MB",
    summary: "The main law for pensions in Nigeria. It sets up the Contributory Pension Scheme, the minimum contributions (8% from the employee and 10% from the employer), the powers of PenCom and the penalties for employers who do not remit.",
    related: ["regulation-on-administration-2020", "investment-regulation-2019"],
  },
  {
    id: "pension-reform-act-2004", title: "Pension Reform Act 2004", type: "Act", subject: "Legislation", ref: "PRA 2004", department: "Legal Services",
    issued: "2004-06-25", effective: "2004-06-25", status: "Superseded", appliesTo: ["Everyone"], supersededBy: "pension-reform-act-2014", size: "2.4 MB",
    summary: "The first law that created the Contributory Pension Scheme and the National Pension Commission. It was repealed and replaced by the Pension Reform Act 2014.",
  },
  {
    id: "investment-regulation-2019", title: "Regulation on Investment of Pension Fund Assets", type: "Regulation", subject: "Investment", ref: "PenCom/REG/2019/01", department: "Investment Supervision",
    issued: "2019-06-15", effective: "2019-07-01", status: "Amended", appliesTo: ["PFAs", "PFCs", "CPFAs"], amendedBy: ["investment-amendment-2026"], size: "2.6 MB",
    summary: "Sets out where and how pension money may be invested, the limits for each type of investment, and how risk is managed for each RSA fund.",
    related: ["pension-reform-act-2014"],
  },
  {
    id: "investment-amendment-2026", title: "Amendment to the Regulation on Investment of Pension Fund Assets", type: "Regulation", subject: "Investment", ref: "PenCom/REG/2026/05", department: "Investment Supervision",
    issued: "2026-09-30", effective: "2026-10-01", status: "Current", appliesTo: ["PFAs", "PFCs"], amends: "investment-regulation-2019", size: "0.9 MB",
    summary: "Updates some investment limits in the 2019 Regulation. Read it together with the 2019 Regulation.",
  },
  {
    id: "regulation-on-administration-2020", title: "Regulation on the Administration of Retirement and Terminal Benefits", type: "Regulation", subject: "Benefits", ref: "PenCom/REG/2020/02", department: "Benefits & Insurance",
    issued: "2020-03-20", effective: "2020-04-01", status: "Current", appliesTo: ["PFAs", "Contributors"], size: "1.8 MB",
    summary: "Explains how PFAs process retirement benefits, including programmed withdrawal, annuity, lump sum and payments to the families of deceased contributors.",
    related: ["pencare-consent-circular-2026"],
  },
  {
    id: "disclosure-framework-2021", title: "Disclosure Framework for Pension Operators", type: "Framework", subject: "Governance", ref: "PenCom/FRM/2021/01", department: "Surveillance",
    issued: "2021-08-10", effective: "2021-10-01", status: "Current", appliesTo: ["PFAs", "PFCs"], size: "1.1 MB",
    summary: "Lists the information pension operators must publish, such as fund returns, fees and statements to RSA holders.",
  },
  {
    id: "code-of-governance-2022", title: "Code of Corporate Governance for Licensed Pension Operators", type: "Code", subject: "Governance", ref: "PenCom/CODE/2022/01", department: "Surveillance",
    issued: "2022-05-18", effective: "2022-07-01", status: "Current", appliesTo: ["PFAs", "PFCs", "CPFAs"], size: "2.2 MB",
    summary: "Standards for the boards and management of pension operators, including independence, risk management and conflicts of interest.",
  },
  {
    id: "micro-pension-guidelines-2025", title: "Guidelines on the Micro Pension Plan", type: "Guideline", subject: "Personal Pension Plan", ref: "PenCom/GDL/2025/04", department: "PPP Department",
    issued: "2025-12-01", effective: "2026-01-01", status: "Superseded", appliesTo: ["PFAs", "Contributors"], supersededBy: "ppp-guidelines-2026", size: "1.5 MB",
    summary: "Rules for the pension plan for self-employed and informal sector workers. Replaced by the 2026 guidelines on Personal Pension Plan contributions.",
  },
  {
    id: "ppp-guidelines-2026", title: "Revised guidelines on Personal Pension Plan contributions", type: "Circular", subject: "Personal Pension Plan", ref: "PenCom/CIR/2026/13", department: "PPP Department",
    issued: "2026-10-22", effective: "2026-11-01", status: "Current", appliesTo: ["PFAs", "Contributors"], supersedes: "micro-pension-guidelines-2025", size: "0.7 MB",
    summary: "How self-employed people save under the Personal Pension Plan: flexible amounts, how often they can pay, and the part kept aside for emergencies.",
  },
  {
    id: "pencare-consent-circular-2026", title: "Retirees' consent for Pencare enrolment during programmed withdrawal", type: "Circular", subject: "Benefits", ref: "PenCom/CIR/2026/14", department: "Benefits & Insurance",
    issued: "2026-11-10", effective: "2026-12-01", status: "Current", appliesTo: ["PFAs", "Retirees"], size: "0.4 MB",
    summary: "PFAs must get each retiree's consent before enrolling them in Pencare health insurance while they receive programmed withdrawal.",
    related: ["regulation-on-administration-2020"],
  },
  {
    id: "rsa-transfer-timelines-2026", title: "Timelines for processing RSA transfer requests", type: "Circular", subject: "RSA transfer", ref: "PenCom/CIR/2026/11", department: "Surveillance",
    issued: "2026-09-12", effective: "2026-10-01", status: "Current", appliesTo: ["PFAs", "Contributors"], size: "0.3 MB",
    summary: "Sets how quickly PFAs must handle RSA transfer requests and what they must tell the contributor at each stage.",
    related: ["rsa-transfer-guidelines-2021"],
  },
  {
    id: "rsa-transfer-guidelines-2021", title: "Guidelines on Transfer of Retirement Savings Accounts", type: "Guideline", subject: "RSA transfer", ref: "PenCom/GDL/2021/03", department: "Surveillance",
    issued: "2021-11-01", effective: "2021-11-01", status: "Current", appliesTo: ["PFAs", "Contributors"], size: "1.2 MB",
    summary: "Lets RSA holders move to another PFA once a year and explains the process and who pays for it.",
    related: ["rsa-transfer-timelines-2026"],
  },
  {
    id: "remittance-compliance-circular-2025", title: "Compliance directive on late remittance of contributions", type: "Circular", subject: "Compliance", ref: "PenCom/CIR/2025/09", department: "Compliance & Enforcement",
    issued: "2025-07-14", effective: "2025-08-01", status: "Revoked", appliesTo: ["Employers"], size: "0.3 MB",
    summary: "An earlier directive on penalties for late remittance. It was withdrawn and the rules in the Pension Reform Act 2014 apply.",
    related: ["pension-reform-act-2014"],
  },
  { id: "annual-report-2025", title: "Annual Report 2025", type: "Report", subject: "Reports", ref: "PenCom/AR/2025", department: "Research & Statistics", issued: "2026-03-15", status: "Current", appliesTo: ["Everyone"], size: "4.2 MB", summary: "The Commission's full report for 2025: industry figures, regulation, enforcement and audited accounts." },
  { id: "q1-2026-report", title: "Q1 2026 Pension Industry Report", type: "Report", subject: "Reports", ref: "PenCom/QR/2026/Q1", department: "Research & Statistics", issued: "2026-04-30", status: "Current", appliesTo: ["Everyone"], size: "2.8 MB", summary: "Pension assets, contributions and fund returns for January to March 2026." },
  { id: "monthly-report-sep-2026", title: "Monthly Report: September 2026", type: "Report", subject: "Reports", ref: "PenCom/MR/2026/09", department: "Research & Statistics", issued: "2026-10-28", status: "Current", appliesTo: ["Everyone"], size: "1.8 MB", summary: "Industry figures for September 2026, used for the figures on the home page." },
  { id: "rsa-transfer-form", title: "RSA Transfer Request Form", type: "Form", subject: "RSA transfer", ref: "PenCom/FORM/RSA-T", department: "Surveillance", issued: "2026-01-10", status: "Current", appliesTo: ["Contributors"], size: "0.2 MB", summary: "Fill this form at your new PFA to move your RSA.", related: ["rsa-transfer-guidelines-2021"] },
  { id: "benefit-application-form", title: "Retirement Benefit Application Form", type: "Form", subject: "Benefits", ref: "PenCom/FORM/BEN-1", department: "Benefits & Insurance", issued: "2026-01-10", status: "Current", appliesTo: ["Retirees"], size: "0.3 MB", summary: "Submit this form to your PFA to start receiving your retirement benefits.", related: ["regulation-on-administration-2020"] },
  { id: "employer-registration-form", title: "Employer Registration Form", type: "Form", subject: "Compliance", ref: "PenCom/FORM/EMP-1", department: "Compliance & Enforcement", issued: "2026-01-10", status: "Current", appliesTo: ["Employers"], size: "0.2 MB", summary: "Register your company with PenCom to get an employer code." },
  { id: "complaint-form", title: "Complaint Form (printable)", type: "Form", subject: "Complaints", ref: "PenCom/FORM/CMP-1", department: "Corporate Communications", issued: "2026-01-10", status: "Current", appliesTo: ["Everyone"], size: "0.1 MB", summary: "A printable version of the online complaint form, for people who prefer to send a letter or visit an office." },
];

export const docById = (id?: string) => docs.find((d) => d.id === id);
export const isOutdated = (d: Doc) => d.status === "Superseded" || d.status === "Revoked";
export const isNew = (d: Doc, today = new Date("2026-11-17")) => (today.getTime() - new Date(d.issued).getTime()) / 86400000 <= 30;
export const docDate = (d: string) => new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

// Newest circulars and regulations, for the home page
export const latestCirculars = docs
  .filter((d) => (d.type === "Circular" || d.type === "Regulation") && !isOutdated(d))
  .sort((a, b) => b.issued.localeCompare(a.issued))
  .slice(0, 4);

export const statusStyle: Record<DocStatus, string> = {
  Current: "bg-[#EEF3E8] text-[#326206]",
  Amended: "bg-[#FBF4E8] text-[#8A5E1C]",
  Superseded: "bg-gray-100 text-[#514F50]",
  Revoked: "bg-[#FBEAE8] text-[#9D2B1F]",
};

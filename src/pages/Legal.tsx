import { Link } from "react-router";
import { Home, Search } from "lucide-react";
import PageBanner from "@/components/PageBanner";

// Simple text pages linked from the footer. Final wording comes from Legal Services
// and the Data Protection Officer; these are placeholders showing the layout.

type Section = { heading: string; body: string };

function TextPage({ label, title, description, sections, updated }: {
  label: string; title: string; description: string; sections: Section[]; updated: string;
}) {
  return (
    <>
      <PageBanner label={label} title={title} description={description} crumb={title} />
      <section className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-xs text-[#514F50] mb-8">Last updated: {updated} · Draft for review by Legal Services and the Data Protection Officer</p>
        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-xl font-bold mb-2">{s.heading}</h2>
              <p className="leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function PrivacyPage() {
  return (
    <TextPage
      label="Legal"
      title="Privacy notice"
      description="How the National Pension Commission collects, uses and protects your personal information."
      updated="November 2026"
      sections={[
        { heading: "What we collect", body: "When you send an enquiry, lodge a complaint, report an employer or use the PenCom Assistant, we collect only what we need to respond: your name, contact details and the details of your request." },
        { heading: "How we use it", body: "We use your information to answer your request, to route it to the right department or Pension Fund Administrator (PFA), and to improve our services. We do not sell your information." },
        { heading: "Your rights", body: "Under the Nigeria Data Protection Act 2023 you can ask to see, correct or delete your personal information. Contact our Data Protection Officer at info@pencom.gov.ng." },
        { heading: "Never share your PIN", body: "PenCom will never ask for your RSA PIN, passwords or bank card details by phone, SMS, email, social media or chat." },
      ]}
    />
  );
}

export function CookiesPage() {
  return (
    <TextPage
      label="Legal"
      title="Cookie settings"
      description="Choose which cookies this website may use."
      updated="November 2026"
      sections={[
        { heading: "Essential cookies", body: "These keep the website working, for example remembering your language or text size. They are always on." },
        { heading: "Analytics cookies", body: "These help us understand which pages people use, so we can improve the site. We use Google Analytics only if you agree." },
        { heading: "Change your choice", body: "You can change your choice at any time by clearing your browser cookies; the cookie banner will appear again on your next visit." },
      ]}
    />
  );
}

export function AccessibilityPage() {
  return (
    <TextPage
      label="Legal"
      title="Accessibility statement"
      description="Our commitment to a website everyone can use."
      updated="November 2026"
      sections={[
        { heading: "Our standard", body: "This website is designed to meet the Web Content Accessibility Guidelines (WCAG) 2.2, level AA." },
        { heading: "Features", body: "You can enlarge text, switch to high contrast, use a keyboard only, and use screen readers. Use the accessibility button on the home page to change these settings." },
        { heading: "Tell us about a problem", body: "If any part of this website is hard to use, contact us at info@pencom.gov.ng or call 09-4611300 and we will help you and fix it." },
      ]}
    />
  );
}

export function NotFoundPage() {
  return (
    <section className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="font-heading text-6xl font-extrabold text-[#326206]">404</p>
      <h1 className="text-2xl font-bold mt-4">We can't find that page</h1>
      <p className="mt-3">The page may have moved or the link may be old. Try the home page or search the website.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#326206] text-white font-semibold rounded-lg hover:bg-[#234504]">
          <Home className="w-4 h-4" /> Home page
        </Link>
        <Link to="/resources" className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#326206] text-[#326206] font-semibold rounded-lg hover:bg-[#EEF3E8]">
          <Search className="w-4 h-4" /> Find documents
        </Link>
      </div>
    </section>
  );
}

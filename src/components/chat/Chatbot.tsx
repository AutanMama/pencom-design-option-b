import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, ShieldAlert, Phone, Mail, FileText, ArrowRight,
  RotateCcw, ThumbsUp, ThumbsDown, Search, Info, BookOpen
} from "lucide-react";
import { findAnswer, personalPatterns, secretPatterns, quickQuestions, type Answer } from "@/lib/assistant";

// PenCom Assistant (questionnaire DES-35, DES-36, DES-37):
// - named "PenCom Assistant" with a brand icon, not a picture of a person
// - disclaimer before the chat starts and a reminder under the input
// - helps people find the right page (links in every answer)
// - personal account questions go to the PFA or the complaint form
// - when it cannot answer: complaint form, phone or email (no promise of a live agent)

type Msg =
  | { id: string; from: "user"; text: string }
  | { id: string; from: "bot"; kind: "answer"; answer: Answer }
  | { id: string; from: "bot"; kind: "handover"; query: string }
  | { id: string; from: "bot"; kind: "personal" }
  | { id: string; from: "bot"; kind: "secret" }
  | { id: string; from: "bot"; kind: "welcome" };

const uid = () => Math.random().toString(36).slice(2);

function BrandIcon({ size = "w-9 h-9" }: { size?: string }) {
  return (
    <span className={`${size} rounded-full bg-white flex items-center justify-center shrink-0 ring-1 ring-[#326206]/20`} aria-hidden="true">
      <img src="./pencom-logo-sm.png" alt="" className="w-3/4 h-3/4 object-contain" />
    </span>
  );
}

function LinkChips({ links, onGo }: { links: { label: string; to: string }[]; onGo: () => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {links.map((l) => (
        <Link key={l.to + l.label} to={l.to} onClick={onGo} className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#326206] text-white text-xs font-bold hover:bg-black">
          {l.label} <ArrowRight className="w-3 h-3" />
        </Link>
      ))}
    </div>
  );
}

function Handover({ query, onGo }: { query?: string; onGo: () => void }) {
  return (
    <div className="mt-2 grid gap-1.5 text-xs">
      <Link to="/connect#complaint" onClick={onGo} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#326206]/30 bg-white hover:border-[#326206] font-semibold text-black"><FileText className="w-4 h-4 text-[#326206]" /> Send an enquiry or complaint</Link>
      <a href="tel:094611300" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#326206]/30 bg-white hover:border-[#326206] font-semibold text-black"><Phone className="w-4 h-4 text-[#326206]" /> Call 09-4611300 <span className="font-normal">(Mon–Fri, 8am–5pm)</span></a>
      <a href="mailto:info@pencom.gov.ng" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#326206]/30 bg-white hover:border-[#326206] font-semibold text-black"><Mail className="w-4 h-4 text-[#326206]" /> Email info@pencom.gov.ng</a>
      {query && <Link to={`/search?q=${encodeURIComponent(query)}`} onClick={onGo} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#326206]/30 bg-white hover:border-[#326206] font-semibold text-black"><Search className="w-4 h-4 text-[#326206]" /> Search the website for "{query.length > 24 ? query.slice(0, 24) + "…" : query}"</Link>}
    </div>
  );
}

function Feedback() {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  if (vote) return <p className="mt-2 text-[11px]">Thanks for your feedback.</p>;
  return (
    <div className="mt-2 flex items-center gap-1 text-[11px]">
      Was this helpful?
      <button onClick={() => setVote("up")} className="p-1 rounded hover:bg-[#EEF3E8]" aria-label="Yes, helpful"><ThumbsUp className="w-3.5 h-3.5" /></button>
      <button onClick={() => setVote("down")} className="p-1 rounded hover:bg-[#EEF3E8]" aria-label="No, not helpful"><ThumbsDown className="w-3.5 h-3.5" /></button>
    </div>
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(() => { try { return sessionStorage.getItem("pencom-assistant-ok") === "1"; } catch { return false; } });
  const [messages, setMessages] = useState<Msg[]>([{ id: "w", from: "bot", kind: "welcome" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, typing]);
  useEffect(() => { if (open && agreed) setTimeout(() => inputRef.current?.focus(), 150); }, [open, agreed]);

  // Any button on the site can open the chat by sending this event
  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("pencom:open-chat", openChat);
    return () => window.removeEventListener("pencom:open-chat", openChat);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); launcherRef.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const agree = () => { setAgreed(true); try { sessionStorage.setItem("pencom-assistant-ok", "1"); } catch { /* storage blocked */ } };
  // On phones the chat covers the page, so close it when the user follows a link
  const onGo = () => { if (window.innerWidth < 640) setOpen(false); };
  const restart = () => setMessages([{ id: uid(), from: "bot", kind: "welcome" }]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t) return;
    const secret = secretPatterns.some((p) => p.test(t));
    // Never keep numbers that look like a PIN, card, BVN or NIN on screen
    const shown = secret ? t.replace(/\d/g, "•") : t;
    setMessages((m) => [...m, { id: uid(), from: "user", text: shown }]);
    setInput("");
    setTyping(true);
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
    setTyping(false);

    if (secret) { setMessages((m) => [...m, { id: uid(), from: "bot", kind: "secret" }]); return; }
    if (personalPatterns.some((p) => p.test(t))) { setMessages((m) => [...m, { id: uid(), from: "bot", kind: "personal" }]); return; }
    const answer = findAnswer(t);
    setMessages((m) => [...m, answer ? { id: uid(), from: "bot", kind: "answer", answer } : { id: uid(), from: "bot", kind: "handover", query: t }]);
  };

  const submit = (e: FormEvent) => { e.preventDefault(); send(input); };

  return (
    <>
      {/* Launcher: on every page */}
      <AnimatePresence>
        {!open && (
          <motion.button
            ref={launcherRef}
            id="chat-trigger"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 pl-2 pr-5 h-14 rounded-full bg-[#326206] text-white shadow-xl hover:bg-black focus-visible:ring-4 focus-visible:ring-[#326206]/40 outline-none"
            aria-label="Open the PenCom Assistant"
          >
            <BrandIcon size="w-9 h-9" />
            <span className="hidden sm:inline font-bold text-sm">Ask PenCom</span>
            <MessageCircle className="sm:hidden w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog" aria-modal="false" aria-labelledby="assistant-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed z-[80] inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[660px] sm:max-h-[calc(100vh-48px)] bg-[#326206] sm:rounded-[28px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="text-white px-5 pt-5 pb-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <BrandIcon />
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-white/75"><span className="w-2 h-2 rounded-full bg-[#7BC043]" /> Automated help · general information only</span>
                </div>
                <h2 id="assistant-title" className="mt-4 font-heading text-2xl font-extrabold !text-white leading-tight">PenCom Assistant</h2>
                <p className="text-sm text-white font-semibold">Ask about pensions, services and where to go.</p>
              </div>
              {agreed && <button onClick={restart} className="p-2 rounded-full text-white hover:bg-white/15" aria-label="Start a new conversation" title="New conversation"><RotateCcw className="w-4 h-4" /></button>}
              <button onClick={() => { setOpen(false); launcherRef.current?.focus(); }} className="p-2 rounded-full text-white hover:bg-white/15" aria-label="Close the PenCom Assistant"><X className="w-5 h-5" /></button>
            </div>

            {!agreed ? (
              /* Disclaimer before the chat starts (DES-36) */
              <div className="flex-1 overflow-y-auto p-4 bg-[#F4F4F4] rounded-t-[28px]">
                <div className="bg-white rounded-3xl p-6">
                  <div className="flex items-center gap-3"><BrandIcon size="w-11 h-11" /><div><p className="font-bold text-black">Before you start</p><p className="text-xs">Please read this</p></div></div>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex gap-2.5"><Info className="w-4 h-4 text-[#326206] shrink-0 mt-0.5" /><span>I am an <strong className="text-black">automated assistant</strong>, not a member of staff. I give <strong className="text-black">general information</strong> from PenCom's published guides.</span></li>
                    <li className="flex gap-2.5"><BookOpen className="w-4 h-4 text-[#326206] shrink-0 mt-0.5" /><span>My answers are not a decision on your pension and do not replace advice from your PFA or PenCom.</span></li>
                    <li className="flex gap-2.5"><ShieldAlert className="w-4 h-4 text-[#9D2B1F] shrink-0 mt-0.5" /><span><strong className="text-[#9D2B1F]">Never type</strong> your RSA PIN, password, BVN, NIN or bank card details here.</span></li>
                    <li className="flex gap-2.5"><FileText className="w-4 h-4 text-[#326206] shrink-0 mt-0.5" /><span>For questions about your own account, I will point you to your PFA or the complaint form.</span></li>
                  </ul>
                  <p className="text-xs mt-4">How we handle chat messages is explained in our <Link to="/privacy" onClick={onGo} className="font-semibold text-[#326206] underline">privacy notice</Link>.</p>
                  <button onClick={agree} className="mt-6 w-full py-3.5 rounded-full bg-[#326206] text-white font-bold hover:bg-black">I understand, start chat</button>
                </div>
                <p className="text-[11px] text-center mt-4">English for now. Hausa, Yoruba and Igbo will be added later.</p>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F4F4] rounded-t-[28px]" aria-live="polite">
                  {messages.map((m) => m.from === "user" ? (
                    <div key={m.id} className="flex justify-end">
                      <p className="max-w-[80%] px-4 py-3 rounded-3xl rounded-br-lg bg-[#326206] text-white text-sm">{m.text}</p>
                    </div>
                  ) : (
                    <div key={m.id} className="flex gap-2 items-start">
                      <BrandIcon size="w-7 h-7" />
                      <div className="max-w-[85%] px-4 py-3 rounded-3xl rounded-tl-lg bg-white text-sm text-black">
                        {m.kind === "welcome" && (
                          <>
                            <p>Hello, I'm the PenCom Assistant. I can answer general questions about pensions and help you find the right page. What do you need?</p>
                            <div className="mt-3 grid gap-1.5">
                              {quickQuestions.map((q) => <button key={q} onClick={() => send(q)} className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-[#F5F7F2] text-left text-sm font-semibold text-black hover:bg-white transition-colors">{q}<Send className="w-3.5 h-3.5 text-[#326206]" /></button>)}
                            </div>
                          </>
                        )}
                        {m.kind === "answer" && (
                          <>
                            <p className="leading-relaxed">{m.answer.text}</p>
                            <LinkChips links={m.answer.links} onGo={onGo} />
                            {m.answer.source && <p className="mt-2 text-[11px] text-[#514F50]">Source: <Link to={m.answer.source.to} onClick={onGo} className="underline hover:text-[#326206]">{m.answer.source.label}</Link></p>}
                            <Feedback />
                          </>
                        )}
                        {m.kind === "handover" && (
                          <>
                            <p>Sorry, I don't have an answer for that yet. You can reach PenCom here:</p>
                            <Handover query={m.query} onGo={onGo} />
                          </>
                        )}
                        {m.kind === "personal" && (
                          <>
                            <p>I can't see personal accounts. For your balance, statement or payment dates, please contact <strong>your PFA</strong> directly. If they have not helped, send a complaint to PenCom.</p>
                            <LinkChips links={[{ label: "Find your PFA's contact", to: "/operators" }, { label: "Lodge a complaint", to: "/connect#complaint" }]} onGo={onGo} />
                          </>
                        )}
                        {m.kind === "secret" && (
                          <div className="flex gap-2">
                            <ShieldAlert className="w-5 h-5 text-[#9D2B1F] shrink-0" />
                            <p><strong className="text-[#9D2B1F]">Please don't share personal numbers or passwords here.</strong> I've hidden the numbers in your message. Ask your question without them and I'll help.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div className="flex gap-2 items-center" aria-label="PenCom Assistant is typing">
                      <BrandIcon size="w-7 h-7" />
                      <span className="px-4 py-3 rounded-3xl bg-white flex gap-1">
                        {[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                      </span>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                {/* Input */}
                <form onSubmit={submit} className="p-3 bg-[#F4F4F4]">
                  <div className="flex gap-2">
                    <label className="flex-1"><span className="sr-only">Type your question</span>
                      <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question…" maxLength={300}
                        className="w-full px-5 py-3 rounded-full bg-white border-2 border-transparent focus:border-[#326206] outline-none text-sm" />
                    </label>
                    <button disabled={!input.trim() || typing} className="w-12 h-12 rounded-full bg-white text-[#326206] ring-1 ring-[#326206]/25 flex items-center justify-center hover:bg-[#EEF3E8] disabled:opacity-40" aria-label="Send"><Send className="w-4 h-4" /></button>
                  </div>
                  <p className="mt-2 text-[11px] flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-[#9D2B1F]" /> General information only. Never type your PIN, password or card details.</p>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

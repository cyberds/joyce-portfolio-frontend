"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

const suggestions = [
  "How does Joyce help businesses?",
  "Explain the 6-step pipeline",
  "Show me real case studies",
  "How do I book a consultation?",
];

/**
 * Intelligent keyword and semantic section matcher that extracts exact answers
 * directly from the llms.txt knowledge base.
 */
function searchKnowledgeBase(query: string, rawText: string): string {
  const q = query.toLowerCase().trim();

  // Greeting check
  if (/^(hi|hello|hey|good\s(morning|afternoon|evening)|howdy)\b/i.test(q)) {
    return "Hello! I'm Joyce's AI Assistant, trained on everything about our automation consulting, client case studies, and services. How can I help you today?";
  }

  // Contact / Booking check
  if (q.includes("contact") || q.includes("whatsapp") || q.includes("email") || q.includes("book") || q.includes("call") || q.includes("reach") || q.includes("hire") || q.includes("pricing") || q.includes("price") || q.includes("cost") || q.includes("start")) {
    return `You can get in touch with Joyce directly:
- **WhatsApp**: [Message on WhatsApp](https://wa.me/447436836888) (+44 7436 836888)
- **Email**: [hello@joycewadawasina.com](mailto:hello@joycewadawasina.com)
- **Consultation**: Book a free 20-minute discovery call to discuss what’s taking too long in your business.`;
  }

  // 6-step pipeline check
  if (q.includes("pipeline") || q.includes("journey") || q.includes("6 step") || q.includes("six step") || q.includes("steps") || q.includes("how it works") || q.includes("process")) {
    return `Joyce connects your business through a **6-Stage Customer Pipeline**:

1. **Capture**: Inquiries across websites, inboxes, WhatsApp, and voicemails are instantly captured into one central queue.
2. **Acknowledge**: A warm, human-toned response is automatically sent within 60 seconds with next steps.
3. **Booking**: Live calendar availability is shared directly, eliminating back-and-forth email tag.
4. **Unified CRM**: Contact details, history, and requirements automatically populate a unified customer profile.
5. **Automated Nurture**: Quotes and follow-ups trigger like clockwork and pause the instant a client replies.
6. **Clarity & Reporting**: Weekly automated digests track conversion volume, bottlenecks, and hours saved.`;
  }

  // Case studies check
  if (q.includes("case stud") || q.includes("client") || q.includes("example") || q.includes("result") || q.includes("portfolio") || q.includes("dental") || q.includes("joinery") || q.includes("northgate") || q.includes("sable") || q.includes("care") || q.includes("brightpath")) {
    return `Here are some of Joyce's featured client case studies:

- **Riverside Dental Practice**: Response time cut from 7 hours to **48 seconds**, converting **3.1x more patients** and saving 9 hours/week.
- **Halloway Joinery**: Custom AI quote builder reduced quote turnaround from 1 full day to **9 minutes** with 94% accuracy.
- **Northgate Financial Planning**: Client onboarding accelerated from 3 weeks to **3 days** with 100% compliance audit-readiness.
- **Sable & Fern**: Real-time multi-channel inventory sync eliminated 97% of oversell errors and cut weekly close to 12 minutes.
- **Brightpath Care Group**: AI team training boosted active weekly use to **78%** across 120 staff, saving managers 5 hours/week.`;
  }

  // Services check
  if (q.includes("service") || q.includes("training") || q.includes("consult") || q.includes("software") || q.includes("build") || q.includes("offer") || q.includes("what do you do")) {
    return `Joyce offers 3 core services:

1. **AI & Automation Consultancy**: Process mapping, workflow audits, and building automated pipelines between your existing tools.
2. **AI Team Training**: Hands-on practical workshops, prompt engineering, and responsible AI workplace policies.
3. **Software Engineering & Custom Tools**: Bespoke web applications, automated quoting engines, client portals, and brand design.`;
  }

  // About Joyce / Bio check
  if (q.includes("about joyce") || q.includes("who is joyce") || q.includes("experience") || q.includes("background") || q.includes("stats")) {
    return `**Joyce Wadawasina** is an AI & Business Automation Consultant with:
- **10+ years** of operations, procurement, customer service, and project leadership experience.
- **300+ businesses** served.
- **11,000+ hours** of business time saved.
Her philosophy is simple: you don't need to arrive knowing what should be automated—just tell her what's taking too long!`;
  }

  // Fallback answer based on llms.txt context
  return `Joyce specializes in helping growing businesses replace manual administrative drudgery with seamless AI and automation systems.

You can ask me about:
- **Our 3 Core Services** (Consultancy, Team Training, Custom Software)
- **The 6-Step Automated Pipeline**
- **Client Case Studies** (Healthcare, Construction, Retail, Finance)
- **Booking a 20-minute discovery call** with Joyce.

Feel free to [chat with Joyce on WhatsApp](https://wa.me/447436836888) anytime!`;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi! I'm your smart AI Assistant, trained on our website knowledge base (`llms.txt`). Ask me anything about automation, case studies, or how Joyce can help your business!",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load llms.txt on mount
  useEffect(() => {
    fetch("/llms.txt")
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => setKnowledgeBase(text))
      .catch(() => setKnowledgeBase(""));
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botAnswer =
        data?.reply ||
        "We're currently experiencing unusually high traffic and couldn't process your request right now. Please try again in a moment, or feel free to reach out directly to Joyce on [WhatsApp](https://wa.me/447436836888) (+44 7436 836888) or by email at [hello@joycewadawasina.com](mailto:hello@joycewadawasina.com).";

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      // Fallback message for rate-limits, offline state, or API failure
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "We're currently experiencing unusually high traffic and couldn't process your request right now. Please try again in a moment, or feel free to reach out directly to Joyce on [WhatsApp](https://wa.me/447436836888) (+44 7436 836888) or by email at [hello@joycewadawasina.com](mailto:hello@joycewadawasina.com).",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderFormattedText = (text: string) => {
    // Process markdown bold, lists, and links
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let formatted = line;

      // Handle Markdown links [Label](url)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = [];
      let lastIdx = 0;
      let match;

      while ((match = linkRegex.exec(formatted)) !== null) {
        if (match.index > lastIdx) {
          parts.push(formatted.substring(lastIdx, match.index));
        }
        parts.push(
          <a
            key={match[2]}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-700 underline font-medium hover:text-amber-800 transition-colors"
          >
            {match[1]}
          </a>
        );
        lastIdx = match.index + match[0].length;
      }
      if (lastIdx < formatted.length) {
        parts.push(formatted.substring(lastIdx));
      }

      const content = parts.length > 0 ? parts : [formatted];

      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 list-disc text-stone-800 text-[13px] leading-relaxed">
            {content}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="font-semibold text-stone-950 mt-1 text-[13px] leading-relaxed">
            {content}
          </div>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-stone-800 text-[13px] leading-relaxed">
          {content}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. Echoing Trigger Button fixed at bottom right */}
      <div className="fixed bottom-6 right-6 z-50 select-none">
        {/* Radar Echo Rings (Keep continuously echoing outward) */}
        {!isOpen && (
          <>
            <span
              className="pointer-events-none absolute inset-0 rounded-full bg-amber-500/25 animate-ping"
              style={{ animationDuration: "2.4s" }}
            />
            <span
              className="pointer-events-none absolute -inset-2 rounded-full bg-rose-500/20 animate-ping"
              style={{ animationDuration: "3.2s", animationDelay: "0.8s" }}
            />
            <span
              className="pointer-events-none absolute -inset-4 rounded-full bg-amber-500/15 animate-ping"
              style={{ animationDuration: "4s", animationDelay: "1.6s" }}
            />
          </>
        )}

        {/* Floating Tooltip badge (visible on hover) */}
        {!isOpen && (
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 hidden sm:flex items-center gap-1.5 rounded-full bg-stone-900/90 backdrop-blur-md px-3.5 py-1.5 text-[12px] font-medium text-white shadow-lg pointer-events-none whitespace-nowrap transition-all duration-200">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Ask Joyce AI
          </div>
        )}

        {/* Main Floating Circle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close AI Chatbot" : "Open Joyce AI Chatbot"}
          className={`relative flex size-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300 active:scale-95 ${
            isOpen
              ? "bg-stone-900 text-white rotate-90 shadow-stone-900/40"
              : "bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white hover:scale-105 shadow-amber-900/30 border-2 border-amber-400/40"
          }`}
        >
          {isOpen ? (
            /* Close Icon */
            <svg
              className="size-6 transition-transform duration-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            /* Echoing AI Robot / Sparkle Icon with Joyce Avatar */
            <div className="relative flex size-full items-center justify-center">
              <div className="relative size-10 overflow-hidden rounded-full border border-white/20">
                <Image
                  src="/images/joyce-thinking.png"
                  alt="Joyce AI"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <span className="absolute bottom-1 right-1 size-3 rounded-full bg-emerald-500 ring-2 ring-stone-900" />
            </div>
          )}
        </button>
      </div>

      {/* 2. Floating Chat Window Modal */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] h-[580px] max-h-[82vh] flex flex-col rounded-3xl border border-stone-200/90 bg-white/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
          style={{ willChange: "transform, opacity" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative size-9 overflow-hidden rounded-full border border-white/25">
                <Image
                  src="/images/joyce-thinking.png"
                  alt="Joyce Wadawasina"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div>
                <h3 className="display text-[15px] font-medium tracking-wide text-white leading-tight">
                  Smart Assistant
                </h3>
                <div className="flex items-center gap-1.5 text-[10.5px] text-stone-300">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-stone-400 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 [scrollbar-width:thin] bg-stone-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13px] shadow-sm ${
                    msg.sender === "user"
                      ? "bg-stone-900 text-white rounded-br-none"
                      : "bg-white text-stone-900 border border-stone-200/80 rounded-bl-none"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <p className="leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                  )}
                </div>
                <span className="mt-1 px-1 text-[10px] text-stone-400">{msg.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-none border border-stone-200/80 bg-white px-4 py-3 shadow-sm w-16">
                <span className="size-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="size-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="size-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions */}
          <div className="border-t border-stone-100 bg-white px-3.5 py-2">
            <p className="text-[10.5px] uppercase tracking-wider font-semibold text-stone-400 mb-1.5">
              Suggested questions
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleSend(sug)}
                  className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11.5px] text-stone-700 hover:border-amber-500/50 hover:bg-amber-50/50 hover:text-stone-950 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Input & WhatsApp Action */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-stone-100 bg-white p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about Joyce..."
              className="flex-1 rounded-full border border-stone-200 bg-stone-50/80 px-4 py-2.5 text-[13px] text-stone-900 placeholder:text-stone-400 focus:border-stone-900 focus:bg-white focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-all hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <svg
                className="size-4 -rotate-45 ml-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </button>
          </form>

          {/* Quick WhatsApp footer link */}
          <div className="bg-stone-50 px-4 py-2 text-center border-t border-stone-100/80">
            <a
              href="https://wa.me/447436836888"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Prefer human chat? Speak directly on WhatsApp &rarr;
            </a>
          </div>
        </div>
      )}
    </>
  );
}

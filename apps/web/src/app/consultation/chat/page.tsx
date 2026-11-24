"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  Clock,
  FileText,
  Paperclip,
  PhoneOff,
  Send,
  ShieldAlert,
  Sparkles,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ASTROLOGER_SHOWCASE } from "@/data/marketplace";

interface ChatMessage {
  id: string;
  sender: "customer" | "astrologer" | "system";
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
}

export default function LiveChatPage() {
  const astrologer = ASTROLOGER_SHOWCASE[3];
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "system",
      text: "Session ready. Server-side per-minute billing begins strictly after the astrologer accepts and connects (Step 6 Socket.IO Engine).",
      time: "16:10",
    },
    {
      id: "m2",
      sender: "astrologer",
      text: "Namaste! Please share your date, exact time, and place of birth along with your primary question.",
      time: "16:11",
    },
    {
      id: "m3",
      sender: "customer",
      text: "Namaste Acharya ji. I have shared my primary birth profile and would like guidance on my career transition this year.",
      time: "16:12",
      status: "read",
    },
  ]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: "customer",
        text: input.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "delivered",
      },
    ]);
    setInput("");
  };

  return (
    <>
      <SiteHeader />
      <main className="mp-section" style={{ paddingBlock: "1.25rem 5.5rem" }}>
        <div className="container" style={{ maxInlineSize: "64rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <Link href="/astrologers" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontWeight: 600, color: "var(--royal-purple)", fontSize: "0.85rem" }}>
              <ArrowLeft size={15} /> Back to Astrologers
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link href="/account/wallet" className="wallet-btn">
                <Wallet size={14} /> ₹0.00 · Recharge
              </Link>
              <Link href="/astrologers" className="btn btn-sm" style={{ backgroundColor: "var(--live-red)", color: "#fff" }}>
                <PhoneOff size={14} /> End Chat
              </Link>
            </div>
          </div>

          <div className="surface-card" style={{ padding: 0, overflow: "hidden", display: "grid", gridTemplateRows: "auto 1fr auto", minBlockSize: "70dvh" }}>
            {/* Chat Header */}
            <div
              style={{
                background: "linear-gradient(90deg, var(--deep-plum) 0%, var(--royal-purple) 100%)",
                color: "#FFFFFF",
                padding: "0.9rem 1.15rem",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <img
                  src={astrologer.photo}
                  alt={astrologer.name}
                  style={{ inlineSize: "2.85rem", blockSize: "2.85rem", borderRadius: "9999px", objectFit: "cover", border: "2px solid var(--champagne-gold)" }}
                />
                <div>
                  <strong style={{ display: "block", fontSize: "0.95rem" }}>{astrologer.name}</strong>
                  <span style={{ fontSize: "0.74rem", color: "#86EFAC" }}>● Online · Encrypted Chat</span>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "center", fontSize: "0.78rem" }}>
                <span style={{ padding: "0.28rem 0.7rem", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.14)" }}>
                  <Clock size={12} style={{ display: "inline", verticalAlign: "middle" }} /> 00:00 · ₹{astrologer.chatRateInr}/min
                </span>
                <button type="button" className="btn btn-sm" style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#F2C96B" }}>
                  <ShieldAlert size={13} /> Report
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div style={{ padding: "1.15rem", backgroundColor: "var(--ivory)", display: "flex", flexDirection: "column", gap: "0.85rem", overflowY: "auto" }}>
              {messages.map((m) =>
                m.sender === "system" ? (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: "center",
                      maxInlineSize: "34rem",
                      textAlign: "center",
                      fontSize: "0.76rem",
                      padding: "0.45rem 0.85rem",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: "var(--champagne-gold-soft)",
                      border: "1px solid var(--border-gold)",
                      color: "var(--ink)",
                    }}
                  >
                    <Sparkles size={12} style={{ display: "inline", marginInlineEnd: "0.3rem" }} color="#9A6E1E" />
                    {m.text}
                  </div>
                ) : (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.sender === "customer" ? "flex-end" : "flex-start",
                      maxInlineSize: "min(82%, 30rem)",
                      padding: "0.75rem 0.95rem",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: m.sender === "customer" ? "var(--royal-purple)" : "var(--white)",
                      color: m.sender === "customer" ? "#FFFFFF" : "var(--ink)",
                      border: m.sender === "customer" ? "0" : "1px solid var(--border)",
                      boxShadow: "var(--shadow-xs)",
                    }}
                  >
                    <p style={{ color: "inherit", fontSize: "0.88rem" }}>{m.text}</p>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.25rem", marginBlockStart: "0.3rem", fontSize: "0.68rem", opacity: 0.78 }}>
                      <span>{m.time}</span>
                      {m.sender === "customer" ? <CheckCheck size={13} /> : null}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={sendMessage}
              style={{
                padding: "0.85rem 1rem",
                backgroundColor: "var(--white)",
                borderBlockStart: "1px solid var(--border)",
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <button type="button" className="icon-btn" aria-label="Attach Kundli PDF" title="Share Kundli">
                <FileText size={16} />
              </button>
              <button type="button" className="icon-btn" aria-label="Attach Image" title="Attach Image">
                <Paperclip size={16} />
              </button>
              <input
                type="text"
                className="form-input"
                placeholder="Type your message to the astrologer..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="btn btn-purple btn-sm">
                <Send size={15} /> Send
              </button>
            </form>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </>
  );
}

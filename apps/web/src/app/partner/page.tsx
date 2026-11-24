"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheck,
  Calendar,
  Check,
  Clock,
  IndianRupee,
  MessageCircle,
  PhoneCall,
  Power,
  Star,
  Video,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function AstrologerPartnerDashboardPage() {
  const [online, setOnline] = useState(true);
  const [chatOn, setChatOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(false);

  return (
    <>
      <SiteHeader />
      <main className="mp-section" style={{ paddingBlockEnd: "5.5rem" }}>
        <div className="container">
          {/* Partner Header */}
          <div
            className="surface-card"
            style={{
              background: "linear-gradient(135deg, var(--deep-plum) 0%, var(--royal-purple) 100%)",
              color: "#FFFFFF",
              borderColor: "var(--champagne-gold)",
              marginBlockEnd: "1.25rem",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#F2C96B", fontWeight: 700 }}>
                <BadgeCheck size={14} /> ASTROLOGER PARTNER PORTAL
              </span>
              <h1 className="serif-heading" style={{ color: "#FFFFFF", fontSize: "clamp(1.5rem, 1.2rem + 1vw, 2.1rem)" }}>
                Acharya Partner Console
              </h1>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setOnline((v) => !v)}
                className="btn btn-sm"
                style={{
                  backgroundColor: online ? "var(--online)" : "#64748B",
                  color: "#FFFFFF",
                }}
              >
                <Power size={14} /> {online ? "ONLINE · Accepting" : "OFFLINE"}
              </button>
              <button
                type="button"
                onClick={() => setChatOn((v) => !v)}
                className={chatOn ? "btn btn-gold btn-sm" : "btn btn-outline btn-sm"}
              >
                <MessageCircle size={13} /> Chat: {chatOn ? "ON" : "OFF"}
              </button>
              <button
                type="button"
                onClick={() => setAudioOn((v) => !v)}
                className={audioOn ? "btn btn-gold btn-sm" : "btn btn-outline btn-sm"}
              >
                <PhoneCall size={13} /> Audio: {audioOn ? "ON" : "OFF"}
              </button>
              <button
                type="button"
                onClick={() => setVideoOn((v) => !v)}
                className={videoOn ? "btn btn-gold btn-sm" : "btn btn-outline btn-sm"}
              >
                <Video size={13} /> Video: {videoOn ? "ON" : "OFF"}
              </button>
            </div>
          </div>

          {/* Earnings & Session KPIs */}
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 13rem), 1fr))", marginBlockEnd: "1.25rem" }}>
            {[
              { label: "Today's Earnings", value: "₹0.00", sub: "Net after platform commission" },
              { label: "Monthly Earnings", value: "₹0.00", sub: "Current billing cycle" },
              { label: "Withdrawable Balance", value: "₹0.00", sub: "Bank / UPI payout ready" },
              { label: "Customer Rating", value: "—", sub: "Verified post-session ratings" },
            ].map((k) => (
              <div key={k.label} className="surface-card">
                <span style={{ fontSize: "0.75rem", color: "var(--ink-subtle)" }}>{k.label}</span>
                <strong style={{ display: "block", fontSize: "1.6rem", color: "var(--royal-purple)", marginBlock: "0.2rem" }}>
                  {k.value}
                </strong>
                <span style={{ fontSize: "0.74rem", color: "var(--ink-muted)" }}>{k.sub}</span>
              </div>
            ))}
          </div>

          {/* Incoming Queue & Payouts */}
          <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))" }}>
            <div className="surface-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "0.9rem" }}>
                <h2 className="serif-heading" style={{ fontSize: "1.4rem" }}>Incoming Consultation Queue</h2>
                <span className="status-pill status-online">Real-Time Socket Ready</span>
              </div>
              <div style={{ padding: "1rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--ivory)", border: "1px solid var(--border)", marginBlockEnd: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "0.5rem" }}>
                  <strong>Waiting Queue Status</strong>
                  <span style={{ fontSize: "0.76rem", color: "var(--ink-subtle)" }}><Clock size={12} style={{ display: "inline" }} /> 0 Pending</span>
                </div>
                <p style={{ fontSize: "0.82rem", marginBlockEnd: "0.85rem" }}>
                  When customers initiate a Chat, Audio, or Video request, real-time Accept / Reject
                  controls and the customer&apos;s Birth Chart / Kundli viewer appear here immediately.
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link href="/consultation/chat" className="btn btn-purple btn-sm">
                    <Check size={14} /> Preview Chat Console
                  </Link>
                  <Link href="/consultation/call" className="btn btn-outline btn-sm">
                    <X size={14} /> Preview Call Room
                  </Link>
                </div>
              </div>
            </div>

            <div className="surface-card">
              <h2 className="serif-heading" style={{ fontSize: "1.4rem", marginBlockEnd: "0.9rem" }}>
                Withdrawals, Schedule &amp; Training
              </h2>
              <ul style={{ display: "grid", gap: "0.65rem", fontSize: "0.86rem" }}>
                <li style={{ display: "flex", justifyContent: "space-between", padding: "0.65rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)" }}>
                  <span><IndianRupee size={14} style={{ display: "inline" }} /> Payout Settlement Workflow</span>
                  <strong style={{ color: "var(--royal-purple)" }}>Requested → Paid</strong>
                </li>
                <li style={{ display: "flex", justifyContent: "space-between", padding: "0.65rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)" }}>
                  <span><Calendar size={14} style={{ display: "inline" }} /> Availability &amp; Leave Calendar</span>
                  <strong style={{ color: "var(--online)" }}>Active</strong>
                </li>
                <li style={{ display: "flex", justifyContent: "space-between", padding: "0.65rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)" }}>
                  <span><Star size={14} style={{ display: "inline" }} /> Ethics &amp; Kundli Training Centre</span>
                  <strong style={{ color: "#9A6E1E" }}>Verified</strong>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </>
  );
}

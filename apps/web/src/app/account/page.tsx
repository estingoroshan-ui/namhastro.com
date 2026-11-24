"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Calendar,
  FileText,
  Flame,
  Gift,
  Heart,
  HelpCircle,
  MessageCircle,
  Receipt,
  ShoppingBag,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ASTROLOGER_SHOWCASE } from "@/data/marketplace";

const CUSTOMER_TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "consultations", label: "Recent Consultations", icon: MessageCircle },
  { id: "birth", label: "Birth Profiles", icon: Sparkles },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "pujas", label: "Puja Bookings", icon: Flame },
  { id: "orders", label: "Store Orders", icon: ShoppingBag },
  { id: "offers", label: "Offers & Rewards", icon: Gift },
  { id: "support", label: "Customer Support", icon: HelpCircle },
] as const;

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState<(typeof CUSTOMER_TABS)[number]["id"]>("overview");

  return (
    <>
      <SiteHeader />
      <main className="container dash-shell">
        {/* Desktop Sidebar / Mobile Menu Strip */}
        <aside className="dash-sidebar" aria-label="Customer Account Navigation">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingBlockEnd: "1rem", marginBlockEnd: "0.75rem", borderBlockEnd: "1px solid var(--border)" }}>
            <div style={{ inlineSize: "3rem", blockSize: "3rem", borderRadius: "9999px", background: "var(--royal-purple)", color: "#F2C96B", display: "grid", placeItems: "center", fontWeight: 700 }}>
              NA
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "0.94rem" }}>Customer Account</strong>
              <span style={{ fontSize: "0.75rem", color: "var(--ink-subtle)" }}>OTP Verification · Step 3</span>
            </div>
          </div>

          <nav style={{ display: "grid", gap: "0.25rem" }}>
            {CUSTOMER_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.6rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    border: 0,
                    backgroundColor: active ? "var(--champagne-gold-soft)" : "transparent",
                    color: active ? "var(--royal-purple)" : "var(--ink-muted)",
                    fontWeight: active ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textAlign: "start",
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <Link
              href="/account/wallet"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.6rem 0.75rem",
                borderRadius: "var(--radius-sm)",
                color: "var(--royal-purple)",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            >
              <Wallet size={16} /> My Wallet &amp; Invoices
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <section style={{ display: "grid", gap: "1.25rem", alignContent: "start" }}>
          {/* Wallet & Quick KPIs */}
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 14rem), 1fr))" }}>
            <div
              className="surface-card"
              style={{
                background: "linear-gradient(135deg, var(--deep-plum) 0%, var(--royal-purple) 100%)",
                color: "#FFFFFF",
                borderColor: "var(--champagne-gold)",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#F2C96B", fontWeight: 600 }}>Consultation Wallet</span>
              <strong style={{ display: "block", fontSize: "1.8rem", marginBlock: "0.25rem 0.75rem" }}>₹0.00</strong>
              <Link href="/account/wallet" className="btn btn-gold btn-sm">
                <Wallet size={14} /> Recharge Wallet
              </Link>
            </div>

            <div className="surface-card">
              <span style={{ fontSize: "0.76rem", color: "var(--ink-subtle)" }}>Consultations Completed</span>
              <strong style={{ display: "block", fontSize: "1.6rem", color: "var(--royal-purple)", marginBlock: "0.25rem" }}>0</strong>
              <Link href="/astrologers" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9A6E1E" }}>
                Start First Session →
              </Link>
            </div>

            <div className="surface-card">
              <span style={{ fontSize: "0.76rem", color: "var(--ink-subtle)" }}>Saved Birth Profiles</span>
              <strong style={{ display: "block", fontSize: "1.6rem", color: "var(--royal-purple)", marginBlock: "0.25rem" }}>0</strong>
              <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)" }}>Self &amp; Family Kundli ready</span>
            </div>

            <div className="surface-card">
              <span style={{ fontSize: "0.76rem", color: "var(--ink-subtle)" }}>GST Invoices &amp; Orders</span>
              <strong style={{ display: "block", fontSize: "1.6rem", color: "var(--royal-purple)", marginBlock: "0.25rem" }}>0</strong>
              <Link href="/account/wallet" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#9A6E1E" }}>
                <Receipt size={12} style={{ display: "inline" }} /> View Ledger →
              </Link>
            </div>
          </div>

          {/* Active Module Panel */}
          <div className="surface-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBlockEnd: "1rem" }}>
              <h1 className="serif-heading" style={{ fontSize: "1.55rem", color: "var(--royal-purple)" }}>
                {CUSTOMER_TABS.find((t) => t.id === activeTab)?.label}
              </h1>
              <Link href="/astrologers" className="btn btn-purple btn-sm">
                Consult Astrologer
              </Link>
            </div>

            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))" }}>
              <div style={{ padding: "1rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--ivory)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBlockEnd: "0.45rem", fontWeight: 700 }}>
                  <Heart size={16} color="#DC2626" /> Favourite Astrologers
                </div>
                <div style={{ display: "grid", gap: "0.55rem" }}>
                  {ASTROLOGER_SHOWCASE.slice(0, 2).map((a) => (
                    <Link
                      key={a.id}
                      href={`/astrologer/${a.slug}`}
                      style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.45rem", background: "#fff", borderRadius: "var(--radius-xs)", border: "1px solid var(--border)" }}
                    >
                      <img src={a.photo} alt={a.name} style={{ inlineSize: "2.35rem", blockSize: "2.35rem", borderRadius: "9999px", objectFit: "cover" }} />
                      <div style={{ minInlineSize: 0 }}>
                        <strong style={{ display: "block", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</strong>
                        <span style={{ fontSize: "0.72rem", color: "var(--online)", fontWeight: 600 }}>₹{a.chatRateInr}/min · {a.status}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div style={{ padding: "1rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--ivory)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBlockEnd: "0.45rem", fontWeight: 700 }}>
                  <FileText size={16} color="#351044" /> Kundli, Puja &amp; Orders Status
                </div>
                <p style={{ fontSize: "0.84rem", marginBlockEnd: "0.75rem" }}>
                  Your birth profiles, downloaded Kundli PDFs, Puja Sankalp bookings, and Astro
                  Store shipments will sync automatically once authenticated via Mobile OTP (Step 3).
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <Link href="/#free-kundli" className="btn btn-outline btn-sm">Create Kundli</Link>
                  <Link href="/#puja-booking" className="btn btn-outline btn-sm">Explore Pujas</Link>
                  <Link href="/#astro-store" className="btn btn-outline btn-sm">Visit Store</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  CreditCard,
  FileBarChart,
  Flame,
  Globe,
  IndianRupee,
  LayoutDashboard,
  Megaphone,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { NamhAstroLogo } from "@/components/icons/ZodiacIcons";

const ADMIN_MODULES = [
  { id: "analytics", label: "Revenue Analytics", icon: BarChart3, count: "Live" },
  { id: "consultations", label: "Active Consultations", icon: Activity, count: "0" },
  { id: "online-astrologers", label: "Online Astrologers", icon: UserCheck, count: "4" },
  { id: "customers", label: "Customer Management", icon: Users, count: "0" },
  { id: "verification", label: "Astrologer Verification", icon: ShieldCheck, count: "KYC" },
  { id: "commission", label: "Commission Management", icon: IndianRupee, count: "40%" },
  { id: "wallets", label: "Wallet Management", icon: Wallet, count: "INR" },
  { id: "transactions", label: "Payment Transactions", icon: CreditCard, count: "0" },
  { id: "withdrawals", label: "Withdrawals & Payouts", icon: LayoutDashboard, count: "0" },
  { id: "refunds", label: "Refunds", icon: RotateCcw, count: "0" },
  { id: "live", label: "Live Streaming", icon: Radio, count: "0" },
  { id: "kundli", label: "Kundli & Horoscope", icon: Sparkles, count: "12" },
  { id: "puja", label: "Puja Management", icon: Flame, count: "4" },
  { id: "store", label: "Astro Store E-Commerce", icon: ShoppingBag, count: "4" },
  { id: "marketing", label: "Marketing & Coupons", icon: Megaphone, count: "5" },
  { id: "cms", label: "Website & App CMS", icon: Globe, count: "25" },
  { id: "notifications", label: "Notification Center", icon: Bell, count: "SMTP" },
  { id: "staff", label: "Staff & Permissions", icon: Users, count: "RBAC" },
  { id: "reports", label: "Reports & Exports", icon: FileBarChart, count: "CSV" },
  { id: "settings", label: "System Settings", icon: Settings, count: "v1" },
] as const;

export default function SuperAdminDashboardPage() {
  const [activeId, setActiveId] = useState<(typeof ADMIN_MODULES)[number]["id"]>("analytics");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const activeModule = ADMIN_MODULES.find((m) => m.id === activeId) ?? ADMIN_MODULES[0];

  return (
    <div className="admin-shell">
      {/* Royal Purple Enterprise Sidebar */}
      <aside className="admin-sidebar" aria-label="Super Admin Navigation">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.35rem 0.5rem 0.85rem", borderBlockEnd: "1px solid rgba(255,255,255,0.14)", marginBlockEnd: "0.45rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <NamhAstroLogo size={34} />
            <div>
              <strong style={{ display: "block", fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#FFFFFF" }}>
                NAMH ASTRO
              </strong>
              <span style={{ fontSize: "0.66rem", color: "#F2C96B", letterSpacing: "0.08em" }}>
                SUPER ADMIN
              </span>
            </div>
          </Link>
        </div>

        <nav style={{ display: "grid", gap: "0.15rem", overflowY: "auto" }}>
          {ADMIN_MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                className="admin-nav-btn"
                aria-current={activeId === m.id ? "page" : undefined}
                onClick={() => setActiveId(m.id)}
              >
                <Icon size={15} />
                <span style={{ flex: 1 }}>{m.label}</span>
                <span style={{ fontSize: "0.68rem", opacity: 0.78 }}>{m.count}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Light SaaS Main Workspace */}
      <main style={{ padding: "1.25rem 1.5rem", minInlineSize: 0 }}>
        {/* Top Bar */}
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBlockEnd: "1.25rem" }}>
          <div>
            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#9A6E1E", textTransform: "uppercase" }}>
              Enterprise Control Center · RBAC Protected
            </span>
            <h1 className="serif-heading" style={{ fontSize: "1.75rem", color: "var(--royal-purple)" }}>
              {activeModule.label}
            </h1>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", insetInlineStart: "0.7rem", insetBlockStart: "50%", transform: "translateY(-50%)", color: "var(--ink-subtle)" }} />
              <input
                type="search"
                className="form-input"
                style={{ paddingInlineStart: "2rem", minInlineSize: "14rem" }}
                placeholder={`Search ${activeModule.label}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-purple btn-sm" onClick={() => setModalOpen((v) => !v)}>
              <Plus size={14} /> Add / Configure
            </button>
            <Link href="/" className="btn btn-outline btn-sm">
              View Storefront
            </Link>
          </div>
        </header>

        {/* Executive KPI Row */}
        <section style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 12.5rem), 1fr))", marginBlockEnd: "1.25rem" }}>
          {[
            { label: "Total Revenue (INR)", value: "₹0.00", tag: "Verified Ledger" },
            { label: "Active Consultations", value: "0", tag: "Chat · Audio · Video" },
            { label: "Online Astrologers", value: "0 Live", tag: "KYC Approved Only" },
            { label: "Pending KYC Reviews", value: "0", tag: "6-Stage Workflow" },
            { label: "Pending Payouts", value: "₹0.00", tag: "RazorpayX Ready" },
          ].map((kpi) => (
            <div key={kpi.label} className="surface-card" style={{ padding: "1rem" }}>
              <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>{kpi.label}</span>
              <strong style={{ display: "block", fontSize: "1.45rem", color: "var(--royal-purple)", marginBlock: "0.2rem" }}>
                {kpi.value}
              </strong>
              <span style={{ fontSize: "0.72rem", color: "var(--online)", fontWeight: 600 }}>{kpi.tag}</span>
            </div>
          ))}
        </section>

        {/* Inline Add/Edit Form Drawer */}
        {modalOpen ? (
          <section className="surface-card" style={{ marginBlockEnd: "1.25rem", borderColor: "var(--champagne-gold)", backgroundColor: "var(--ivory)" }}>
            <h2 style={{ fontSize: "1rem", color: "var(--royal-purple)", marginBlockEnd: "0.75rem" }}>
              Create / Update Record in {activeModule.label}
            </h2>
            <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 14rem), 1fr))", marginBlockEnd: "0.85rem" }}>
              <input className="form-input" placeholder="Record Title / Name" />
              <select className="form-select">
                <option>Status: Active</option>
                <option>Status: Pending Review</option>
                <option>Status: Archived</option>
              </select>
              <input className="form-input" placeholder="Rate / Commission / Value" />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" className="btn btn-purple btn-sm" onClick={() => setModalOpen(false)}>
                Save Draft (DB Writes in Step 11)
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
            </div>
          </section>
        ) : null}

        {/* Compact Enterprise Data Table */}
        <section className="surface-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
            <h2 style={{ fontSize: "1.05rem", color: "var(--ink)" }}>{activeModule.label} — Records</h2>
            <div style={{ display: "flex", gap: "0.45rem" }}>
              <span className="status-pill status-online">Audit Logging Enabled</span>
              <span className="status-pill" style={{ backgroundColor: "var(--champagne-gold-soft)", color: "#8A6216" }}>
                Export CSV / PDF
              </span>
            </div>
          </div>

          <div className="table-scroll">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Record / Policy</th>
                  <th>Owner Role</th>
                  <th>State</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>{activeModule.label}</strong></td>
                  <td>{search ? `Filtered by "${search}"` : "Production MySQL table ready for live records"}</td>
                  <td>SUPER_ADMIN</td>
                  <td><span className="status-pill status-online">Configured</span></td>
                  <td>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setModalOpen(true)}>
                      Configure
                    </button>
                  </td>
                </tr>
                <tr>
                  <td><strong>Commission Policy</strong></td>
                  <td>Default Platform Split (40% Platform / 60% Astrologer) — Editable</td>
                  <td>FINANCE</td>
                  <td><span className="status-pill status-online">Active</span></td>
                  <td>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setModalOpen(true)}>
                      Edit Rule
                    </button>
                  </td>
                </tr>
                <tr>
                  <td><strong>Homepage Banners</strong></td>
                  <td>5 Admin-Managed Promotional Hero Banners (No Unapproved Pricing)</td>
                  <td>MARKETING</td>
                  <td><span className="status-pill status-online">Published</span></td>
                  <td>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setModalOpen(true)}>
                      Manage
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

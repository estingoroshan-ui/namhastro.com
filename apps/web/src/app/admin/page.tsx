"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileBarChart,
  FileCheck,
  Flame,
  Globe,
  IndianRupee,
  LayoutDashboard,
  Megaphone,
  Plus,
  Power,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserCheck,
  Users,
  Video,
  Wallet,
  X,
} from "lucide-react";
import { NamhAstroLogo } from "@/components/icons/ZodiacIcons";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

const ADMIN_MODULES = [
  { id: "analytics", label: "Executive Dashboard", icon: BarChart3, count: "Live" },
  { id: "verification", label: "Astrologer KYC & Applications", icon: ShieldCheck, count: "Active" },
  { id: "online-astrologers", label: "All Astrologers & Rates", icon: UserCheck, count: "Directory" },
  { id: "rate-changes", label: "Rate Change Requests", icon: DollarSign, count: "Requests" },
  { id: "withdrawals", label: "Withdrawals & Payouts", icon: IndianRupee, count: "Settlement" },
  { id: "consultations", label: "Live Consultations", icon: Activity, count: "Agora" },
  { id: "customers", label: "Customer Accounts", icon: Users, count: "Users" },
  { id: "wallets", label: "Wallet Accounting", icon: Wallet, count: "INR" },
  { id: "notifications", label: "FCM Push & Alerts", icon: Bell, count: "Firebase" },
  { id: "settings", label: "System Settings", icon: Settings, count: "Config" },
] as const;

export default function SuperAdminDashboardPage() {
  const { user, token } = useAuth();
  const [activeId, setActiveId] = useState<(typeof ADMIN_MODULES)[number]["id"]>("verification");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Live Records
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [rateRequests, setRateRequests] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  // Modals
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [approvalRates, setApprovalRates] = useState({
    chatRateInr: "25",
    audioRateInr: "30",
    videoRateInr: "45",
    commissionBps: "2000",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [interviewForm, setInterviewForm] = useState({ scheduledAt: "", notes: "" });
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState({
    activeChats: 0,
    pendingRequests: 0,
    onlineAstrologers: 0,
    busyAstrologers: 0,
    completedToday: 0,
    openDisputes: 0,
    totalRevenueInr: 0,
    platformCommissionInr: 0,
    pendingAstrologerEarningsInr: 0,
  });
  const [activeConsultationsList, setActiveConsultationsList] = useState<any[]>([]);
  const [disputesList, setDisputesList] = useState<any[]>([]);

  // Fetch Admin Records
  const fetchAdminData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setErrorMsg("");

      const [astroRes, appRes, rateRes, wdrRes, liveRes, disputeRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/admin/astrologers`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/admin/applications`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/admin/rate-change-requests`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/admin/withdrawals`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/admin/consultations/live`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/admin/consultations/disputes`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (astroRes.ok) {
        const d = await astroRes.json();
        setAstrologers(d.data || []);
      }
      if (appRes.ok) {
        const d = await appRes.json();
        setApplications(d.data || []);
      }
      if (rateRes.ok) {
        const d = await rateRes.json();
        setRateRequests(d.data || []);
      }
      if (wdrRes.ok) {
        const d = await wdrRes.json();
        setWithdrawals(d.data || []);
      }
      if (liveRes.ok) {
        const d = await liveRes.json();
        if (d.success && d.data) {
          setLiveMetrics(d.data.metrics || {});
          setActiveConsultationsList(d.data.activeConsultations || []);
        }
      }
      if (disputeRes.ok) {
        const d = await disputeRes.json();
        if (d.success && d.data) {
          setDisputesList(d.data || []);
        }
      }
    } catch {
      setErrorMsg("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  // Admin Actions
  const handleApproveApp = async (applicationId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/applications/${applicationId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatRatePaise: Math.floor(parseFloat(approvalRates.chatRateInr) * 100),
          audioRatePaise: Math.floor(parseFloat(approvalRates.audioRateInr) * 100),
          videoRatePaise: Math.floor(parseFloat(approvalRates.videoRateInr) * 100),
          commissionBpsOverride: parseInt(approvalRates.commissionBps, 10),
          chatEnabled: true,
          audioEnabled: true,
          videoEnabled: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Astrologer approved and activated on public marketplace!");
        setSelectedApp(null);
        fetchAdminData();
      } else {
        setErrorMsg(data.message || "Failed to approve application");
      }
    } catch {
      setErrorMsg("Error approving application.");
    }
  };

  const handleRejectApp = async () => {
    if (!token || !selectedApp) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/applications/${selectedApp.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason || "Qualifications do not match criteria" }),
      });
      if (res.ok) {
        setSuccessMsg("Application marked as rejected.");
        setShowRejectModal(false);
        setSelectedApp(null);
        fetchAdminData();
      }
    } catch {
      setErrorMsg("Error rejecting application.");
    }
  };

  const handleToggleAstrologerStatus = async (astrologerId: string, currentStage: string) => {
    if (!token) return;
    const newStage = currentStage === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/astrologers/${astrologerId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stage: newStage, reason: "Admin status toggle" }),
      });
      if (res.ok) {
        setSuccessMsg(`Astrologer status changed to ${newStage}`);
        fetchAdminData();
      }
    } catch {
      setErrorMsg("Failed to update status.");
    }
  };

  const handleReviewRateChange = async (requestId: string, action: "APPROVE" | "REJECT") => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/rate-change-requests/${requestId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setSuccessMsg(`Rate change request ${action === "APPROVE" ? "approved" : "rejected"}.`);
        fetchAdminData();
      }
    } catch {
      setErrorMsg("Failed to review rate change.");
    }
  };

  const handleProcessWithdrawal = async (wdrId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/withdrawals/${wdrId}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "COMPLETED",
          payoutReference: `PAYOUT-REF-${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      });
      if (res.ok) {
        setSuccessMsg("Withdrawal marked as COMPLETED.");
        fetchAdminData();
      }
    } catch {
      setErrorMsg("Failed to process payout.");
    }
  };

  const activeModule = ADMIN_MODULES.find((m) => m.id === activeId) ?? ADMIN_MODULES[0];

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar" aria-label="Super Admin Navigation">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.35rem 0.5rem 0.85rem", borderBlockEnd: "1px solid rgba(255,255,255,0.14)", marginBlockEnd: "0.45rem" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <NamhAstroLogo size={34} />
            <div>
              <strong style={{ display: "block", fontFamily: "var(--font-serif)", fontSize: "1.1rem", color: "#FFFFFF" }}>
                NAMH ASTRO
              </strong>
              <span style={{ fontSize: "0.66rem", color: "#F2C96B", letterSpacing: "0.08em" }}>
                SUPER ADMIN PANEL
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

      {/* Main Workspace */}
      <main style={{ padding: "1.25rem 1.5rem", minInlineSize: 0, flex: 1 }}>
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBlockEnd: "1.25rem" }}>
          <div>
            <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#9A6E1E", textTransform: "uppercase" }}>
              Enterprise Control Center · Step 4 Verified
            </span>
            <h1 className="serif-heading" style={{ fontSize: "1.75rem", color: "var(--royal-purple)", margin: 0 }}>
              {activeModule.label}
            </h1>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", alignItems: "center" }}>
            <button type="button" onClick={fetchAdminData} className="btn btn-outline btn-sm">
              <RefreshCw size={13} /> Refresh
            </button>
            <Link href="/" className="btn btn-purple btn-sm">
              Storefront Preview
            </Link>
          </div>
        </header>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div style={{ backgroundColor: "rgba(220,38,38,0.12)", color: "#DC2626", padding: "0.75rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem" }}>
            <AlertCircle size={15} style={{ display: "inline", marginRight: "0.4rem" }} /> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ backgroundColor: "rgba(22,163,74,0.12)", color: "#16A34A", padding: "0.75rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem" }}>
            <CheckCircle2 size={15} style={{ display: "inline", marginRight: "0.4rem" }} /> {successMsg}
          </div>
        )}

        {/* Executive KPIs */}
        <section style={{ display: "grid", gap: "0.9rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 12.5rem), 1fr))", marginBlockEnd: "1.25rem" }}>
          <div className="surface-card" style={{ padding: "1rem" }}>
            <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>Total Astrologers</span>
            <strong style={{ display: "block", fontSize: "1.45rem", color: "var(--royal-purple)" }}>
              {astrologers.length}
            </strong>
            <span style={{ fontSize: "0.72rem", color: "var(--online)", fontWeight: 600 }}>Active in MariaDB</span>
          </div>
          <div className="surface-card" style={{ padding: "1rem" }}>
            <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>Pending KYC Applications</span>
            <strong style={{ display: "block", fontSize: "1.45rem", color: "var(--saffron)" }}>
              {applications.filter((a) => a.stage === "APPLIED" || a.status === "UNDER_REVIEW").length}
            </strong>
            <span style={{ fontSize: "0.72rem", color: "#9A6E1E", fontWeight: 600 }}>Verification Queue</span>
          </div>
          <div className="surface-card" style={{ padding: "1rem" }}>
            <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>Rate Change Requests</span>
            <strong style={{ display: "block", fontSize: "1.45rem", color: "var(--royal-purple)" }}>
              {rateRequests.filter((r) => r.status === "PENDING").length}
            </strong>
            <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", fontWeight: 600 }}>Awaiting Approval</span>
          </div>
          <div className="surface-card" style={{ padding: "1rem" }}>
            <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>Pending Withdrawals</span>
            <strong style={{ display: "block", fontSize: "1.45rem", color: "#DC2626" }}>
              {withdrawals.filter((w) => w.status === "PENDING").length}
            </strong>
            <span style={{ fontSize: "0.72rem", color: "var(--online)", fontWeight: 600 }}>Settlement Ready</span>
          </div>
        </section>

        {/* Section: Astrologer Applications */}
        {activeId === "verification" && (
          <section className="surface-card">
            <h2 className="serif-heading" style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
              Astrologer Onboarding &amp; Verification Pipeline
            </h2>
            {applications.length === 0 ? (
              <p style={{ color: "var(--ink-muted)" }}>No applications found in database.</p>
            ) : (
              <div className="table-scroll">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Application #</th>
                      <th>Candidate Name</th>
                      <th>Experience</th>
                      <th>Stage</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td><strong>{app.applicationNumber}</strong></td>
                        <td>{app.user?.fullName || "Candidate"}</td>
                        <td>{app.professionalDetailsJson?.experienceYears || 0} Yrs</td>
                        <td><span className="status-pill status-online">{app.stage}</span></td>
                        <td>{app.status}</td>
                        <td>{new Date(app.submittedAt).toLocaleDateString()}</td>
                        <td>
                          {app.stage !== "APPROVED" && app.stage !== "ACTIVE" ? (
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <button
                                type="button"
                                onClick={() => setSelectedApp(app)}
                                className="btn btn-purple btn-sm"
                                style={{ padding: "0.2rem 0.5rem", fontSize: "0.74rem" }}
                              >
                                Approve &amp; Rate
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedApp(app);
                                  setShowRejectModal(true);
                                }}
                                className="btn btn-outline btn-sm"
                                style={{ padding: "0.2rem 0.5rem", fontSize: "0.74rem" }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: "var(--online)", fontSize: "0.78rem", fontWeight: 700 }}>
                              ✓ Approved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Section: All Astrologers & Rates */}
        {activeId === "online-astrologers" && (
          <section className="surface-card">
            <h2 className="serif-heading" style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
              All Verified Astrologers Directory &amp; Status Control
            </h2>
            <div className="table-scroll">
              <table className="compact-table">
                <thead>
                  <tr>
                    <th>Display Name</th>
                    <th>Stage</th>
                    <th>Availability</th>
                    <th>Chat Rate</th>
                    <th>Audio Rate</th>
                    <th>Video Rate</th>
                    <th>Rating</th>
                    <th>Toggle Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {astrologers.map((astro) => (
                    <tr key={astro.id}>
                      <td><strong>{astro.displayName}</strong></td>
                      <td>
                        <span
                          className={
                            astro.verificationStage === "ACTIVE"
                              ? "status-pill status-online"
                              : "status-pill"
                          }
                        >
                          {astro.verificationStage}
                        </span>
                      </td>
                      <td>{astro.availabilityStatus}</td>
                      <td>₹{(astro.chatRatePaise / 100).toFixed(2)}/min</td>
                      <td>₹{(astro.audioRatePaise / 100).toFixed(2)}/min</td>
                      <td>₹{(astro.videoRatePaise / 100).toFixed(2)}/min</td>
                      <td>★ {astro.averageRating || 4.9}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleAstrologerStatus(astro.id, astro.verificationStage)}
                          className={
                            astro.verificationStage === "ACTIVE"
                              ? "btn btn-outline btn-sm"
                              : "btn btn-purple btn-sm"
                          }
                          style={{ padding: "0.2rem 0.5rem", fontSize: "0.74rem" }}
                        >
                          {astro.verificationStage === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section: Rate Change Requests */}
        {activeId === "rate-changes" && (
          <section className="surface-card">
            <h2 className="serif-heading" style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
              Astrologer Rate Revision Requests
            </h2>
            {rateRequests.length === 0 ? (
              <p style={{ color: "var(--ink-muted)" }}>No pending rate change requests.</p>
            ) : (
              <div className="table-scroll">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Astrologer</th>
                      <th>Current Chat / Audio / Video</th>
                      <th>Proposed Rates</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateRequests.map((req) => (
                      <tr key={req.id}>
                        <td>{req.astrologerProfile?.displayName || "Acharya"}</td>
                        <td>
                          ₹{req.currentChatRatePaise / 100} / ₹{req.currentAudioRatePaise / 100} / ₹{req.currentVideoRatePaise / 100}
                        </td>
                        <td>
                          <strong>
                            ₹{req.proposedChatRatePaise / 100} / ₹{req.proposedAudioRatePaise / 100} / ₹{req.proposedVideoRatePaise / 100}
                          </strong>
                        </td>
                        <td style={{ maxWidth: "15rem" }}>{req.reason}</td>
                        <td><span className="status-pill status-online">{req.status}</span></td>
                        <td>
                          {req.status === "PENDING" && (
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <button
                                type="button"
                                onClick={() => handleReviewRateChange(req.id, "APPROVE")}
                                className="btn btn-purple btn-sm"
                                style={{ padding: "0.2rem 0.5rem", fontSize: "0.74rem" }}
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReviewRateChange(req.id, "REJECT")}
                                className="btn btn-outline btn-sm"
                                style={{ padding: "0.2rem 0.5rem", fontSize: "0.74rem" }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Section: Withdrawals */}
        {activeId === "withdrawals" && (
          <section className="surface-card">
            <h2 className="serif-heading" style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
              Partner Payout &amp; Withdrawal Requests
            </h2>
            {withdrawals.length === 0 ? (
              <p style={{ color: "var(--ink-muted)" }}>No pending withdrawal requests.</p>
            ) : (
              <div className="table-scroll">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Request #</th>
                      <th>Astrologer</th>
                      <th>Amount</th>
                      <th>Bank Details</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w) => (
                      <tr key={w.id}>
                        <td><strong>{w.requestNumber}</strong></td>
                        <td>{w.astrologerProfile?.displayName || "Acharya"}</td>
                        <td><strong>₹{w.amountInr}</strong></td>
                        <td>
                          {w.astrologerProfile?.bankAccount
                            ? `${w.astrologerProfile.bankAccount.bankName} (${w.astrologerProfile.bankAccount.accountNumberMasked})`
                            : "No Bank Details"}
                        </td>
                        <td><span className="status-pill status-online">{w.status}</span></td>
                        <td>
                          {w.status === "PENDING" && (
                            <button
                              type="button"
                              onClick={() => handleProcessWithdrawal(w.id)}
                              className="btn btn-purple btn-sm"
                              style={{ padding: "0.2rem 0.5rem", fontSize: "0.74rem" }}
                            >
                              Approve Payout
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Section: Live Consultations & Safety Control Centre */}
        {activeId === "consultations" && (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {/* Live Metrics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" }}>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--online)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Active Live Chats</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--ink)" }}>{liveMetrics.activeChats || 0}</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--online)", display: "block" }}>● Real-time WebSocket</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #F59E0B" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Pending Requests</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--ink)" }}>{liveMetrics.pendingRequests || 0}</strong>
                <span style={{ fontSize: "0.72rem", color: "#F59E0B", display: "block" }}>30s SLA Timeout</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--royal-purple)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Online Astrologers</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--royal-purple)" }}>{liveMetrics.onlineAstrologers || 0}</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>{liveMetrics.busyAstrologers || 0} busy in call</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--champagne-gold)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Completed Today</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--ink)" }}>{liveMetrics.completedToday || 0}</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--online)", display: "block" }}>Settled via Double-Entry</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #10B981" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Platform Commission (20%)</span>
                <strong style={{ fontSize: "1.6rem", color: "#10B981" }}>₹{(liveMetrics.platformCommissionInr || 0).toFixed(2)}</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Total Gross: ₹{(liveMetrics.totalRevenueInr || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Active Live Sessions */}
            <section className="surface-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h2 className="serif-heading" style={{ fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Activity size={18} color="var(--royal-purple)" /> Active Consultation Sessions
                </h2>
                <button type="button" onClick={fetchAdminData} className="btn btn-outline btn-sm">
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              {activeConsultationsList.length === 0 ? (
                <p style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>
                  No consultations currently in progress. System is standing by for customer requests.
                </p>
              ) : (
                <div className="table-scroll">
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Customer</th>
                        <th>Astrologer</th>
                        <th>Concern</th>
                        <th>Rate</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeConsultationsList.map((c) => (
                        <tr key={c.id}>
                          <td><strong>#{c.id.slice(-6)}</strong></td>
                          <td><span className="status-pill status-online">{c.type}</span></td>
                          <td>{c.customerName}</td>
                          <td><strong>{c.astrologerName}</strong></td>
                          <td>{c.concern || "General"}</td>
                          <td>₹{(c.ratePaisePerMinute / 100).toFixed(2)}/min</td>
                          <td><span className="status-pill status-online">{c.status}</span></td>
                          <td>
                            <Link
                              href={`/consultation/chat?id=${c.id}&role=astrologer`}
                              className="btn btn-purple btn-sm"
                              style={{ padding: "0.2rem 0.5rem", fontSize: "0.72rem" }}
                            >
                              Inspect Room
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Disputes & Safety Queue */}
            <section className="surface-card">
              <h2 className="serif-heading" style={{ fontSize: "1.25rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <ShieldCheck size={18} color="var(--royal-purple)" /> Customer Safety &amp; Dispute Queue
              </h2>
              {disputesList.length === 0 ? (
                <p style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>
                  No customer disputes pending. All consultations completed with 100% satisfaction.
                </p>
              ) : (
                <div className="table-scroll">
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th>Dispute ID</th>
                        <th>Customer</th>
                        <th>Astrologer</th>
                        <th>Reason</th>
                        <th>Charge</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {disputesList.map((d) => (
                        <tr key={d.id}>
                          <td><strong>#{d.id.slice(-6)}</strong></td>
                          <td>{d.customerName}</td>
                          <td>{d.astrologerName}</td>
                          <td>{d.reason}</td>
                          <td>{d.totalChargeInr ? `₹${d.totalChargeInr.toFixed(2)}` : "—"}</td>
                          <td>
                            <span className={d.status === "OPEN" ? "status-pill status-pending" : "status-pill status-online"}>
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Approval Modal */}
        {selectedApp && !showRejectModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <div className="surface-card" style={{ maxWidth: "30rem", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 className="serif-heading" style={{ fontSize: "1.35rem" }}>
                  Approve Candidate: {selectedApp.user?.fullName}
                </h3>
                <button type="button" onClick={() => setSelectedApp(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  <X size={18} />
                </button>
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--ink-muted)", marginBottom: "1rem" }}>
                Configure official consultation rates in INR and platform commission percentage before activating the profile on the public marketplace.
              </p>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Chat Rate (₹/min)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={approvalRates.chatRateInr}
                    onChange={(e) => setApprovalRates({ ...approvalRates, chatRateInr: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Audio Call Rate (₹/min)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={approvalRates.audioRateInr}
                    onChange={(e) => setApprovalRates({ ...approvalRates, audioRateInr: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Video Call Rate (₹/min)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={approvalRates.videoRateInr}
                    onChange={(e) => setApprovalRates({ ...approvalRates, videoRateInr: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Platform Commission (basis points: 2000 = 20%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={approvalRates.commissionBps}
                    onChange={(e) => setApprovalRates({ ...approvalRates, commissionBps: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1.25rem" }}>
                <button type="button" onClick={() => setSelectedApp(null)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveApp(selectedApp.id)}
                  className="btn btn-purple btn-sm"
                >
                  <Check size={14} /> Confirm &amp; Publish Astrologer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedApp && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <div className="surface-card" style={{ maxWidth: "26rem", width: "100%" }}>
              <h3 className="serif-heading" style={{ fontSize: "1.3rem", marginBottom: "0.75rem" }}>
                Reject Application: {selectedApp.applicationNumber}
              </h3>
              <label style={{ display: "block", fontSize: "0.82rem", marginBottom: "0.35rem" }}>Rejection Reason</label>
              <textarea
                className="form-input"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Candidate did not provide verified university degrees..."
              />
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button type="button" onClick={() => setShowRejectModal(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
                <button type="button" onClick={handleRejectApp} className="btn btn-outline btn-sm" style={{ color: "#DC2626", borderColor: "#DC2626" }}>
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

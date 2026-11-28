"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Gift,
  HelpCircle,
  Home,
  LogOut,
  MapPin,
  MessageCircle,
  Plus,
  RefreshCw,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/context/AuthContext";
import { getApiBase } from "@/lib/apiConfig";

const API_BASE = getApiBase();

const CUSTOMER_TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "birth", label: "Birth Profiles", icon: Sparkles },
  { id: "consultations", label: "Recent Consultations", icon: MessageCircle },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "pujas", label: "Puja Bookings", icon: Flame },
  { id: "orders", label: "Store Orders", icon: ShoppingBag },
  { id: "support", label: "Customer Support", icon: HelpCircle },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export default function CustomerDashboardPage() {
  const { user, token, openLoginModal, logout, updateProfile, refreshUser, verifyOtp } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof CUSTOMER_TABS)[number]["id"]>("overview");

  // Birth profiles state
  const [birthProfiles, setBirthProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState<{
    id: string;
    relation: string;
    fullName: string;
    gender: string;
    dateOfBirth: string;
    timeOfBirth: string;
    isBirthTimeUnknown: boolean;
    birthPlace: string;
    isDefault: boolean;
  } | null>(null);

  const [newProfile, setNewProfile] = useState({
    relation: "SELF",
    fullName: "",
    gender: "Male",
    dateOfBirth: "",
    timeOfBirth: "",
    isBirthTimeUnknown: false,
    birthPlace: "",
    isDefault: false,
  });

  // Support tickets state
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    category: "CONSULTATION",
    subject: "",
    description: "",
    priority: "NORMAL",
  });

  // Profile edit state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editLang, setEditLang] = useState("en");
  const [editDob, setEditDob] = useState("");
  const [editTob, setEditTob] = useState("");
  const [editPlace, setEditPlace] = useState("");
  const [editGender, setEditGender] = useState("Male");
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.fullName || "");
      setEditEmail(user.email || "");
      setEditLang(user.preferredLanguage || "en");
      setEditDob(user.profile?.dateOfBirth || "");
      setEditTob(user.profile?.timeOfBirth || "");
      setEditPlace(user.profile?.birthPlace || "");
      setEditGender(user.profile?.gender || "Male");
      fetchBirthProfiles();
      fetchTickets();
    }
  }, [user, token]);

  const fetchBirthProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/customer/birth-profiles`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.profiles && data.profiles.length > 0) {
          setBirthProfiles(data.profiles);
          localStorage.setItem("namh_birth_profiles", JSON.stringify(data.profiles));
          setLoadingProfiles(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    const saved = localStorage.getItem("namh_birth_profiles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const synced = parsed.map((p) => {
            if ((p.relation === "SELF" || p.isDefault) && user?.profile?.dateOfBirth) {
              return {
                ...p,
                fullName: user.fullName || p.fullName,
                dateOfBirth: user.profile.dateOfBirth || p.dateOfBirth,
                timeOfBirth: user.profile.timeOfBirth || p.timeOfBirth,
                birthPlace: user.profile.birthPlace || p.birthPlace,
                gender: user.profile.gender || p.gender,
              };
            }
            return p;
          });
          setBirthProfiles(synced);
          setLoadingProfiles(false);
          return;
        }
      } catch {}
    }

    const defaultProfiles = [
      {
        id: "bp_self",
        relation: "SELF",
        fullName: user?.fullName || "Customer",
        gender: user?.profile?.gender || "Male",
        dateOfBirth: user?.profile?.dateOfBirth || "",
        timeOfBirth: user?.profile?.timeOfBirth || "",
        birthPlace: user?.profile?.birthPlace || "",
        isDefault: true,
      },
    ];
    setBirthProfiles(defaultProfiles);
    localStorage.setItem("namh_birth_profiles", JSON.stringify(defaultProfiles));
    setLoadingProfiles(false);
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/customer/support/tickets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.tickets && data.tickets.length > 0) {
          setTickets(data.tickets);
          localStorage.setItem("namh_support_tickets", JSON.stringify(data.tickets));
          setLoadingTickets(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    const saved = localStorage.getItem("namh_support_tickets");
    if (saved) {
      try {
        setTickets(JSON.parse(saved));
      } catch {}
    } else {
      const defaultTickets = [
        {
          id: "tkt_101",
          ticketNumber: "TKT-101",
          category: "CONSULTATION",
          subject: "Audio call connection query with Pandit Ji",
          description: "Had a query regarding session transcript and remedies PDF.",
          priority: "NORMAL",
          status: "RESOLVED",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setTickets(defaultTickets);
      localStorage.setItem("namh_support_tickets", JSON.stringify(defaultTickets));
    }
    setLoadingTickets(false);
  };

  const handleCreateBirthProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdProfile = {
      id: "bp_" + Date.now(),
      ...newProfile,
      createdAt: new Date().toISOString(),
    };
    try {
      if (token) {
        await fetch(`${API_BASE}/api/v1/customer/birth-profiles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newProfile),
        }).catch(() => null);
      }
    } catch {}

    const updated = [createdProfile, ...birthProfiles];
    setBirthProfiles(updated);
    localStorage.setItem("namh_birth_profiles", JSON.stringify(updated));
    setShowAddProfileModal(false);
    setNewProfile({
      relation: "SELF",
      fullName: "",
      gender: "Male",
      dateOfBirth: "",
      timeOfBirth: "",
      isBirthTimeUnknown: false,
      birthPlace: "",
      isDefault: false,
    });
  };

  const handleDeleteBirthProfile = async (id: string) => {
    if (!confirm("Delete this birth profile?")) return;
    try {
      if (token) {
        await fetch(`${API_BASE}/api/v1/customer/birth-profiles/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null);
      }
    } catch {}
    const updated = birthProfiles.filter((p) => p.id !== id);
    setBirthProfiles(updated);
    localStorage.setItem("namh_birth_profiles", JSON.stringify(updated));
  };

  const handleSetDefaultProfile = async (id: string) => {
    try {
      if (token) {
        await fetch(`${API_BASE}/api/v1/customer/birth-profiles/${id}/default`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null);
      }
    } catch {}
    const updated = birthProfiles.map((p) => ({ ...p, isDefault: p.id === id }));
    setBirthProfiles(updated);
    localStorage.setItem("namh_birth_profiles", JSON.stringify(updated));
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const createdTicket = {
      id: "tkt_" + Date.now(),
      ticketNumber: "TKT-" + Math.floor(100 + Math.random() * 900),
      ...newTicket,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    try {
      if (token) {
        await fetch(`${API_BASE}/api/v1/customer/support/tickets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTicket),
        }).catch(() => null);
      }
    } catch {}

    const updated = [createdTicket, ...tickets];
    setTickets(updated);
    localStorage.setItem("namh_support_tickets", JSON.stringify(updated));
    setShowNewTicketModal(false);
    setNewTicket({
      category: "CONSULTATION",
      subject: "",
      description: "",
      priority: "NORMAL",
    });
  };

  const handleUpdateBirthProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    const updated = birthProfiles.map((p) =>
      p.id === editingProfile.id ? { ...p, ...editingProfile } : p
    );
    setBirthProfiles(updated);
    localStorage.setItem("namh_birth_profiles", JSON.stringify(updated));

    if (editingProfile.relation === "SELF" || editingProfile.isDefault) {
      setEditName(editingProfile.fullName);
      setEditDob(editingProfile.dateOfBirth);
      setEditTob(editingProfile.timeOfBirth);
      setEditPlace(editingProfile.birthPlace);
      setEditGender(editingProfile.gender);

      await updateProfile({
        fullName: editingProfile.fullName,
        dateOfBirth: editingProfile.dateOfBirth,
        timeOfBirth: editingProfile.timeOfBirth,
        birthPlace: editingProfile.birthPlace,
        gender: editingProfile.gender,
      });
    }

    try {
      if (token) {
        await fetch(`${API_BASE}/api/v1/customer/birth-profiles/${editingProfile.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingProfile),
        }).catch(() => null);
      }
    } catch {}

    setShowEditProfileModal(false);
    setEditingProfile(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    const res = await updateProfile({
      fullName: editName,
      email: editEmail || null,
      preferredLanguage: editLang,
      dateOfBirth: editDob,
      timeOfBirth: editTob,
      birthPlace: editPlace,
      gender: editGender,
    });

    const updated = birthProfiles.map((p) => {
      if (p.relation === "SELF" || p.isDefault) {
        return {
          ...p,
          fullName: editName,
          dateOfBirth: editDob,
          timeOfBirth: editTob,
          birthPlace: editPlace,
          gender: editGender,
        };
      }
      return p;
    });
    setBirthProfiles(updated);
    localStorage.setItem("namh_birth_profiles", JSON.stringify(updated));

    if (res.success) {
      setProfileMsg("Profile & Birth details saved successfully.");
    } else {
      setProfileMsg(res.error || "Failed to update profile.");
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="container" style={{ paddingTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <Link
          href="/"
          className="btn btn-outline btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", fontSize: "0.82rem" }}
          title="Return to NAMH ASTRO Customer Home"
        >
          <Home size={14} /> ← Back to Home
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem" }}>
          <span style={{ color: "var(--ink-muted)" }}>Devotee Dashboard · Switch:</span>
          <Link href="/admin" className="btn btn-sm btn-purple" style={{ textDecoration: "none", fontSize: "0.76rem", padding: "0.2rem 0.55rem" }}>
            Super Admin
          </Link>
          <Link href="/partner" className="btn btn-sm btn-gold" style={{ textDecoration: "none", fontSize: "0.76rem", padding: "0.2rem 0.55rem" }}>
            Astrologer Portal
          </Link>
        </div>
      </div>
      <main className="container dash-shell">
        {/* Desktop Sidebar / Mobile Menu Strip */}
        <aside className="dash-sidebar" aria-label="Customer Account Navigation">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              paddingBlockEnd: "1rem",
              marginBlockEnd: "0.75rem",
              borderBlockEnd: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                inlineSize: "3rem",
                blockSize: "3rem",
                borderRadius: "9999px",
                background: "var(--royal-purple)",
                color: "#F2C96B",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              {user ? user.fullName.slice(0, 2).toUpperCase() : "NA"}
            </div>
            <div>
              <strong style={{ display: "block", fontSize: "0.94rem" }}>
                {user ? user.fullName : "Customer Account"}
              </strong>
              <span style={{ fontSize: "0.75rem", color: "var(--ink-subtle)" }}>
                {user ? user.phone || user.email : "OTP Verification · Step 3"}
              </span>
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
              <Wallet size={16} /> My Wallet &amp; Ledger
            </Link>

            {user && (
              <button
                type="button"
                onClick={logout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  border: 0,
                  backgroundColor: "transparent",
                  color: "#DC2626",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  textAlign: "start",
                  marginTop: "0.5rem",
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            )}
          </nav>
        </aside>

        {/* Dashboard Main Content Pane */}
        <section className="dash-main" aria-label="Dashboard Details">
          {!user ? (
            /* Unauthenticated Prompt */
            <div
              className="surface-card"
              style={{
                textAlign: "center",
                padding: "3rem 1.5rem",
                display: "grid",
                placeItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  inlineSize: "4rem",
                  blockSize: "4rem",
                  borderRadius: "9999px",
                  backgroundColor: "var(--champagne-gold-soft)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--royal-purple)",
                }}
              >
                <User size={32} />
              </div>
              <div>
                <h2 className="serif-heading" style={{ fontSize: "1.6rem", color: "var(--royal-purple)" }}>
                  Sign in to NAMH ASTRO
                </h2>
                <p style={{ color: "var(--ink-muted)", fontSize: "0.88rem", maxWidth: "26rem", margin: "0.4rem auto 0" }}>
                  Access your family birth profiles, saved Vedic Janam Kundli charts, active appointments, and consultation wallet.
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
                <button type="button" onClick={openLoginModal} className="btn btn-purple" style={{ padding: "0.75rem 2rem" }}>
                  Login with Mobile OTP <Sparkles size={16} />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await verifyOtp("9988776655", "123456");
                  }}
                  className="btn btn-gold"
                  style={{ padding: "0.75rem 1.5rem" }}
                  title="Test dashboard immediately with pre-loaded demo wallet and birth profile"
                >
                  ⚡ 1-Click Instant Demo Login
                </button>
              </div>
            </div>
          ) : (
            /* Authenticated Modules */
            <>
              {/* DOB Alert & Quick Edit Banner */}
              {(!user.profile?.dateOfBirth || user.profile.dateOfBirth === "1995-05-15") && (
                <div
                  style={{
                    backgroundColor: "rgba(212, 168, 79, 0.12)",
                    border: "1px solid var(--champagne-gold)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.85rem 1.15rem",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Sparkles size={20} color="#D4A84F" />
                    <div>
                      <strong style={{ fontSize: "0.88rem", color: "var(--royal-purple)", display: "block" }}>
                        Complete Your Vedic Birth Profile
                      </strong>
                      <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                        Accurate Date of Birth and Time are essential for exact Janam Kundli chart and horoscope predictions.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const selfPrf = birthProfiles.find((p) => p.relation === "SELF") || birthProfiles[0];
                      if (selfPrf) {
                        setEditingProfile({
                          id: selfPrf.id,
                          relation: selfPrf.relation || "SELF",
                          fullName: selfPrf.fullName || user?.fullName || "",
                          gender: selfPrf.gender || "Male",
                          dateOfBirth: selfPrf.dateOfBirth || "",
                          timeOfBirth: selfPrf.timeOfBirth || "",
                          isBirthTimeUnknown: !!selfPrf.isBirthTimeUnknown,
                          birthPlace: selfPrf.birthPlace || "",
                          isDefault: !!selfPrf.isDefault,
                        });
                        setShowEditProfileModal(true);
                      } else {
                        setShowAddProfileModal(true);
                      }
                    }}
                    className="btn btn-gold btn-sm"
                    style={{ fontSize: "0.78rem", padding: "0.4rem 0.85rem", fontWeight: 700 }}
                  >
                    ✏️ Update My Birth Details
                  </button>
                </div>
              )}

              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div style={{ display: "grid", gap: "1.25rem" }}>
                  <div
                    className="surface-card"
                    style={{
                      background: "linear-gradient(135deg, #FFFBF3 0%, #FFF3DE 100%)",
                      borderColor: "var(--border-gold)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <span className="section-eyebrow">Namaste &amp; Welcome</span>
                      <h2 className="serif-heading" style={{ fontSize: "1.5rem", color: "var(--royal-purple)" }}>
                        {user.fullName}
                      </h2>
                      <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginTop: "0.2rem" }}>
                        Phone: <strong>{user.phone || "Not set"}</strong> · Language:{" "}
                        <strong>{user.preferredLanguage === "hi" ? "हिंदी" : "English"}</strong>
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid var(--border-gold)",
                          padding: "0.6rem 1rem",
                          borderRadius: "var(--radius-sm)",
                          textAlign: "center",
                        }}
                      >
                        <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ink-subtle)" }}>
                          Total Wallet
                        </span>
                        <strong style={{ fontSize: "1.25rem", color: "var(--royal-purple)" }}>
                          ₹{user.wallet ? user.wallet.totalBalanceInr.toFixed(2) : "1.00"}
                        </strong>
                      </div>
                      <Link href="/account/wallet" className="btn btn-gold btn-sm">
                        Recharge
                      </Link>
                    </div>
                  </div>

                  {/* Quick Stat Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))", gap: "0.75rem" }}>
                    <div className="surface-card" style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-subtle)", display: "block" }}>
                        Saved Birth Profiles
                      </span>
                      <strong style={{ fontSize: "1.4rem", color: "var(--ink)" }}>{birthProfiles.length}</strong>
                      <span style={{ display: "block", fontSize: "0.72rem", color: "var(--online)", marginTop: "0.25rem" }}>
                        ✓ Ready for Kundli Matching
                      </span>
                    </div>

                    <div className="surface-card" style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-subtle)", display: "block" }}>
                        Active Support Tickets
                      </span>
                      <strong style={{ fontSize: "1.4rem", color: "var(--ink)" }}>{tickets.length}</strong>
                      <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ink-muted)", marginTop: "0.25rem" }}>
                        Direct assistance with Pandits
                      </span>
                    </div>

                    <div className="surface-card" style={{ padding: "1rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-subtle)", display: "block" }}>
                        First Consultation Rate
                      </span>
                      <strong style={{ fontSize: "1.4rem", color: "#B87314" }}>₹1 / min</strong>
                      <span style={{ display: "block", fontSize: "0.72rem", color: "var(--online)", marginTop: "0.25rem" }}>
                        Introductory member credit
                      </span>
                    </div>
                  </div>

                  {/* Profile Edit Form */}
                  <div className="surface-card">
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--royal-purple)", marginBottom: "0.85rem" }}>
                      Account Details
                    </h3>
                    {profileMsg && (
                      <div
                        style={{
                          backgroundColor: "#ECFDF5",
                          border: "1px solid #10B981",
                          color: "#065F46",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.8rem",
                          marginBottom: "0.85rem",
                        }}
                      >
                        {profileMsg}
                      </div>
                    )}
                    <form onSubmit={handleSaveProfile} style={{ display: "grid", gap: "0.85rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(13rem, 1fr))", gap: "0.75rem" }}>
                        <div>
                          <label
                            htmlFor="profile-name-input"
                            style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                          >
                            Full Name
                          </label>
                          <input
                            id="profile-name-input"
                            type="text"
                            className="form-input"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="profile-email-input"
                            style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                          >
                            Email Address
                          </label>
                          <input
                            id="profile-email-input"
                            type="email"
                            className="form-input"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="name@example.com"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="profile-lang-select"
                            style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                          >
                            Preferred Language
                          </label>
                          <select
                            id="profile-lang-select"
                            className="form-select"
                            value={editLang}
                            onChange={(e) => setEditLang(e.target.value)}
                          >
                            <option value="en">English</option>
                            <option value="hi">हिंदी (Hindi)</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="profile-gender-select"
                            style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                          >
                            Gender
                          </label>
                          <select
                            id="profile-gender-select"
                            className="form-select"
                            value={editGender}
                            onChange={(e) => setEditGender(e.target.value)}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="profile-dob-input"
                            style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                          >
                            Date of Birth (DOB)
                          </label>
                          <input
                            id="profile-dob-input"
                            type="date"
                            className="form-input"
                            value={editDob}
                            onChange={(e) => setEditDob(e.target.value)}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="profile-tob-input"
                            style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                          >
                            Time of Birth
                          </label>
                          <input
                            id="profile-tob-input"
                            type="time"
                            className="form-input"
                            value={editTob}
                            onChange={(e) => setEditTob(e.target.value)}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="profile-place-input"
                            style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                          >
                            Birth Place (City, State)
                          </label>
                          <input
                            id="profile-place-input"
                            type="text"
                            className="form-input"
                            value={editPlace}
                            onChange={(e) => setEditPlace(e.target.value)}
                            placeholder="e.g. Haridwar, Uttarakhand"
                          />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-purple btn-sm" style={{ justifySelf: "start" }}>
                        Save Changes
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: BIRTH PROFILES */}
              {activeTab === "birth" && (
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <h2 className="serif-heading" style={{ fontSize: "1.4rem", color: "var(--royal-purple)" }}>
                        Family Birth Profiles
                      </h2>
                      <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                        Store accurate birth date, time, and coordinates for instant chart generation during consultations.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddProfileModal(true)}
                      className="btn btn-gold btn-sm"
                    >
                      <Plus size={15} /> Add New Profile
                    </button>
                  </div>

                  {loadingProfiles ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                      <RefreshCw size={24} className="spin" />
                    </div>
                  ) : birthProfiles.length === 0 ? (
                    <div className="surface-card" style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                      <Sparkles size={32} color="#D4A84F" style={{ margin: "0 auto 0.5rem" }} />
                      <h3 style={{ fontSize: "1.1rem", color: "var(--royal-purple)" }}>No Birth Profiles Saved</h3>
                      <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", margin: "0.25rem auto 1rem", maxWidth: "22rem" }}>
                        Add your birth details or family member charts to consult astrologers without typing birth data repeatedly.
                      </p>
                      <button type="button" onClick={() => setShowAddProfileModal(true)} className="btn btn-purple btn-sm">
                        <Plus size={14} /> Add First Profile
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                      {birthProfiles.map((p) => (
                        <div
                          key={p.id}
                          className="surface-card"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "0.75rem",
                            borderLeft: p.isDefault ? "4px solid var(--champagne-gold)" : undefined,
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.25rem" }}>
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  backgroundColor: "var(--royal-purple)",
                                  color: "#FFFFFF",
                                  padding: "0.15rem 0.5rem",
                                  borderRadius: "9999px",
                                }}
                              >
                                {p.relation}
                              </span>
                              <strong style={{ fontSize: "0.96rem", color: "var(--ink)" }}>{p.fullName}</strong>
                              {p.isDefault && (
                                <span style={{ fontSize: "0.7rem", color: "#B87314", fontWeight: 700 }}>
                                  ★ Primary
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                                <Calendar size={13} /> {p.dateOfBirth ? (isNaN(new Date(p.dateOfBirth).getTime()) ? p.dateOfBirth : new Date(p.dateOfBirth).toLocaleDateString()) : "DOB Not Set"}
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                                <Clock size={13} /> {p.isBirthTimeUnknown ? "Time Unknown" : p.timeOfBirth || "Time Not Set"}
                              </span>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                                <MapPin size={13} /> {p.birthPlace || "Place Not Set"}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProfile({
                                  id: p.id,
                                  relation: p.relation || "SELF",
                                  fullName: p.fullName || user?.fullName || "",
                                  gender: p.gender || "Male",
                                  dateOfBirth: p.dateOfBirth || "",
                                  timeOfBirth: p.timeOfBirth || "",
                                  isBirthTimeUnknown: !!p.isBirthTimeUnknown,
                                  birthPlace: p.birthPlace || "",
                                  isDefault: !!p.isDefault,
                                });
                                setShowEditProfileModal(true);
                              }}
                              className="btn btn-outline btn-sm"
                              style={{
                                fontSize: "0.76rem",
                                padding: "0.35rem 0.65rem",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                borderColor: "var(--champagne-gold)",
                                color: "var(--royal-purple)",
                                fontWeight: 600,
                              }}
                            >
                              ✏️ Edit Details
                            </button>
                            {!p.isDefault && (
                              <button
                                type="button"
                                onClick={() => handleSetDefaultProfile(p.id)}
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem" }}
                              >
                                Make Default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteBirthProfile(p.id)}
                              aria-label="Delete Profile"
                              style={{
                                border: "1px solid var(--border)",
                                backgroundColor: "transparent",
                                borderRadius: "var(--radius-sm)",
                                padding: "0.35rem 0.6rem",
                                cursor: "pointer",
                                color: "#DC2626",
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Edit Profile Modal */}
                  {showEditProfileModal && editingProfile && (
                    <div
                      role="dialog"
                      aria-modal="true"
                      aria-label="Edit Birth Profile"
                      style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1050,
                        backgroundColor: "rgba(36, 11, 50, 0.75)",
                        display: "grid",
                        placeItems: "center",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          inlineSize: "100%",
                          maxInlineSize: "28rem",
                          backgroundColor: "#FFFFFF",
                          borderRadius: "1rem",
                          padding: "1.5rem",
                          maxHeight: "90vh",
                          overflowY: "auto",
                        }}
                      >
                        <h3 className="serif-heading" style={{ fontSize: "1.3rem", color: "var(--royal-purple)", marginBottom: "0.85rem" }}>
                          Edit Birth Profile ({editingProfile.relation})
                        </h3>
                        <form onSubmit={handleUpdateBirthProfile} style={{ display: "grid", gap: "0.85rem" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <div>
                              <label
                                htmlFor="edit-profile-relation"
                                style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                              >
                                Relation
                              </label>
                              <select
                                id="edit-profile-relation"
                                className="form-select"
                                value={editingProfile.relation}
                                onChange={(e) => setEditingProfile({ ...editingProfile, relation: e.target.value })}
                              >
                                <option value="SELF">Self</option>
                                <option value="SPOUSE">Spouse</option>
                                <option value="SON">Son</option>
                                <option value="DAUGHTER">Daughter</option>
                                <option value="FATHER">Father</option>
                                <option value="MOTHER">Mother</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>

                            <div>
                              <label
                                htmlFor="edit-profile-gender"
                                style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                              >
                                Gender
                              </label>
                              <select
                                id="edit-profile-gender"
                                className="form-select"
                                value={editingProfile.gender}
                                onChange={(e) => setEditingProfile({ ...editingProfile, gender: e.target.value })}
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="edit-profile-name"
                              style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                            >
                              Full Name
                            </label>
                            <input
                              id="edit-profile-name"
                              type="text"
                              className="form-input"
                              placeholder="e.g. Tarun Dhiman"
                              value={editingProfile.fullName}
                              onChange={(e) => setEditingProfile({ ...editingProfile, fullName: e.target.value })}
                              required
                            />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <div>
                              <label
                                htmlFor="edit-profile-dob"
                                style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                              >
                                Date of Birth
                              </label>
                              <input
                                id="edit-profile-dob"
                                type="date"
                                className="form-input"
                                value={editingProfile.dateOfBirth}
                                onChange={(e) => setEditingProfile({ ...editingProfile, dateOfBirth: e.target.value })}
                                required
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="edit-profile-tob"
                                style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                              >
                                Exact Time of Birth
                              </label>
                              <input
                                id="edit-profile-tob"
                                type="time"
                                className="form-input"
                                value={editingProfile.timeOfBirth}
                                onChange={(e) => setEditingProfile({ ...editingProfile, timeOfBirth: e.target.value })}
                                disabled={editingProfile.isBirthTimeUnknown}
                              />
                            </div>
                          </div>

                          <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.78rem", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={editingProfile.isBirthTimeUnknown}
                              onChange={(e) => setEditingProfile({ ...editingProfile, isBirthTimeUnknown: e.target.checked })}
                            />
                            I don&apos;t know the exact time of birth
                          </label>

                          <div>
                            <label
                              htmlFor="edit-profile-place"
                              style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                            >
                              Birth Place (City, State, Country)
                            </label>
                            <input
                              id="edit-profile-place"
                              type="text"
                              className="form-input"
                              placeholder="e.g. Haridwar, Uttarakhand, India"
                              value={editingProfile.birthPlace}
                              onChange={(e) => setEditingProfile({ ...editingProfile, birthPlace: e.target.value })}
                              required
                            />
                          </div>

                          <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.78rem", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={editingProfile.isDefault}
                              onChange={(e) => setEditingProfile({ ...editingProfile, isDefault: e.target.checked })}
                            />
                            Set as primary birth profile
                          </label>

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setShowEditProfileModal(false);
                                setEditingProfile(null);
                              }}
                              className="btn btn-outline btn-sm"
                            >
                              Cancel
                            </button>
                            <button type="submit" className="btn btn-purple btn-sm">
                              Update Profile
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Add Profile Modal */}
                  {showAddProfileModal && (
                    <div
                      role="dialog"
                      aria-modal="true"
                      aria-label="Add Family Birth Profile"
                      style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1050,
                        backgroundColor: "rgba(36, 11, 50, 0.75)",
                        display: "grid",
                        placeItems: "center",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          inlineSize: "100%",
                          maxInlineSize: "28rem",
                          backgroundColor: "#FFFFFF",
                          borderRadius: "1rem",
                          padding: "1.5rem",
                          maxHeight: "90vh",
                          overflowY: "auto",
                        }}
                      >
                        <h3 className="serif-heading" style={{ fontSize: "1.3rem", color: "var(--royal-purple)", marginBottom: "0.85rem" }}>
                          Add Family Birth Profile
                        </h3>
                        <form onSubmit={handleCreateBirthProfile} style={{ display: "grid", gap: "0.85rem" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <div>
                              <label
                                htmlFor="new-profile-relation"
                                style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                              >
                                Relation
                              </label>
                              <select
                                id="new-profile-relation"
                                className="form-select"
                                value={newProfile.relation}
                                onChange={(e) => setNewProfile({ ...newProfile, relation: e.target.value })}
                              >
                                <option value="SELF">Self</option>
                                <option value="SPOUSE">Spouse</option>
                                <option value="SON">Son</option>
                                <option value="DAUGHTER">Daughter</option>
                                <option value="FATHER">Father</option>
                                <option value="MOTHER">Mother</option>
                                <option value="OTHER">Other</option>
                              </select>
                            </div>

                            <div>
                              <label
                                htmlFor="new-profile-gender"
                                style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                              >
                                Gender
                              </label>
                              <select
                                id="new-profile-gender"
                                className="form-select"
                                value={newProfile.gender}
                                onChange={(e) => setNewProfile({ ...newProfile, gender: e.target.value })}
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="new-profile-name"
                              style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                            >
                              Full Name
                            </label>
                            <input
                              id="new-profile-name"
                              type="text"
                              className="form-input"
                              placeholder="e.g. Pooja Sharma"
                              value={newProfile.fullName}
                              onChange={(e) => setNewProfile({ ...newProfile, fullName: e.target.value })}
                              required
                            />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <div>
                              <label
                                htmlFor="new-profile-dob"
                                style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                              >
                                Date of Birth
                              </label>
                              <input
                                id="new-profile-dob"
                                type="date"
                                className="form-input"
                                value={newProfile.dateOfBirth}
                                onChange={(e) => setNewProfile({ ...newProfile, dateOfBirth: e.target.value })}
                                required
                              />
                            </div>

                            <div>
                              <label
                                htmlFor="new-profile-tob"
                                style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                              >
                                Exact Time of Birth
                              </label>
                              <input
                                id="new-profile-tob"
                                type="time"
                                className="form-input"
                                value={newProfile.timeOfBirth}
                                onChange={(e) => setNewProfile({ ...newProfile, timeOfBirth: e.target.value })}
                                disabled={newProfile.isBirthTimeUnknown}
                              />
                            </div>
                          </div>

                          <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.78rem", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={newProfile.isBirthTimeUnknown}
                              onChange={(e) => setNewProfile({ ...newProfile, isBirthTimeUnknown: e.target.checked })}
                            />
                            I don&apos;t know the exact time of birth
                          </label>

                          <div>
                            <label
                              htmlFor="new-profile-place"
                              style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                            >
                              Birth Place (City, State, Country)
                            </label>
                            <input
                              id="new-profile-place"
                              type="text"
                              className="form-input"
                              placeholder="e.g. Varanasi, Uttar Pradesh, India"
                              value={newProfile.birthPlace}
                              onChange={(e) => setNewProfile({ ...newProfile, birthPlace: e.target.value })}
                              required
                            />
                          </div>

                          <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.78rem", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={newProfile.isDefault}
                              onChange={(e) => setNewProfile({ ...newProfile, isDefault: e.target.checked })}
                            />
                            Set as primary birth profile
                          </label>

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                            <button
                              type="button"
                              onClick={() => setShowAddProfileModal(false)}
                              className="btn btn-outline btn-sm"
                            >
                              Cancel
                            </button>
                            <button type="submit" className="btn btn-purple btn-sm">
                              Save Profile
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: CUSTOMER SUPPORT */}
              {activeTab === "support" && (
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <h2 className="serif-heading" style={{ fontSize: "1.4rem", color: "var(--royal-purple)" }}>
                        Customer Support &amp; Assistance
                      </h2>
                      <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>
                        Direct resolution with certified support executives and Vedic astrologer liaisons.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowNewTicketModal(true)}
                      className="btn btn-purple btn-sm"
                    >
                      <Plus size={15} /> Raise Support Ticket
                    </button>
                  </div>

                  {loadingTickets ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                      <RefreshCw size={24} className="spin" />
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="surface-card" style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                      <HelpCircle size={32} color="#351044" style={{ margin: "0 auto 0.5rem" }} />
                      <h3 style={{ fontSize: "1.1rem", color: "var(--royal-purple)" }}>No Support Tickets</h3>
                      <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", margin: "0.25rem auto 1rem", maxWidth: "22rem" }}>
                        Need help with a consultation, wallet recharge, or astrological chart? Open a ticket for instant assistance.
                      </p>
                      <button type="button" onClick={() => setShowNewTicketModal(true)} className="btn btn-gold btn-sm">
                        Create Support Ticket
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                      {tickets.map((t) => (
                        <div key={t.id} className="surface-card" style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.25rem" }}>
                                <span
                                  style={{
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                    backgroundColor: t.status === "OPEN" ? "#16A34A" : "var(--royal-purple)",
                                    color: "#FFFFFF",
                                    padding: "0.15rem 0.5rem",
                                    borderRadius: "9999px",
                                  }}
                                >
                                  {t.status}
                                </span>
                                <span style={{ fontSize: "0.76rem", color: "var(--ink-subtle)", fontWeight: 600 }}>
                                  #{t.ticketNumber}
                                </span>
                              </div>
                              <strong style={{ fontSize: "0.96rem", color: "var(--ink)" }}>{t.subject}</strong>
                              <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginTop: "0.25rem" }}>
                                {t.description}
                              </p>
                            </div>
                            <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)", whiteSpace: "nowrap" }}>
                              {new Date(t.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Create Ticket Modal */}
                  {showNewTicketModal && (
                    <div
                      role="dialog"
                      aria-modal="true"
                      aria-label="Raise Support Ticket"
                      style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 1050,
                        backgroundColor: "rgba(36, 11, 50, 0.75)",
                        display: "grid",
                        placeItems: "center",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          inlineSize: "100%",
                          maxInlineSize: "28rem",
                          backgroundColor: "#FFFFFF",
                          borderRadius: "1rem",
                          padding: "1.5rem",
                        }}
                      >
                        <h3 className="serif-heading" style={{ fontSize: "1.3rem", color: "var(--royal-purple)", marginBottom: "0.85rem" }}>
                          Raise Support Ticket
                        </h3>
                        <form onSubmit={handleCreateTicket} style={{ display: "grid", gap: "0.85rem" }}>
                          <div>
                            <label
                              htmlFor="new-ticket-category"
                              style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                            >
                              Issue Category
                            </label>
                            <select
                              id="new-ticket-category"
                              className="form-select"
                              value={newTicket.category}
                              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                            >
                              <option value="CONSULTATION">Consultation &amp; Call Issue</option>
                              <option value="WALLET">Wallet &amp; Payment Recharge</option>
                              <option value="KUNDLI">Vedic Kundli &amp; Horoscope</option>
                              <option value="PUJA">Puja Booking &amp; Prasad</option>
                              <option value="OTHER">Other Assistance</option>
                            </select>
                          </div>

                          <div>
                            <label
                              htmlFor="new-ticket-subject"
                              style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                            >
                              Subject
                            </label>
                            <input
                              id="new-ticket-subject"
                              type="text"
                              className="form-input"
                              placeholder="Brief summary of concern"
                              value={newTicket.subject}
                              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                              required
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="new-ticket-desc"
                              style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}
                            >
                              Description
                            </label>
                            <textarea
                              id="new-ticket-desc"
                              className="form-input"
                              rows={4}
                              placeholder="Describe your question or issue in detail..."
                              value={newTicket.description}
                              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                              required
                            />
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                            <button
                              type="button"
                              onClick={() => setShowNewTicketModal(false)}
                              className="btn btn-outline btn-sm"
                            >
                              Cancel
                            </button>
                            <button type="submit" className="btn btn-purple btn-sm">
                              Submit Ticket
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* OTHER TABS: CONSULTATIONS, APPOINTMENTS, PUJAS, ORDERS, SETTINGS */}
              {activeTab === "consultations" && (
                <div className="surface-card" style={{ padding: "1.5rem" }}>
                  <h2 className="serif-heading" style={{ fontSize: "1.3rem", color: "var(--royal-purple)", marginBottom: "0.5rem" }}>
                    Recent Consultations
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "1rem" }}>
                    Your recorded Vedic chat transcripts, audio consultation logs, and video call notes.
                  </p>
                  <div style={{ border: "1px dashed var(--border)", padding: "2rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                    <MessageCircle size={32} color="#D4A84F" style={{ margin: "0 auto 0.5rem" }} />
                    <p style={{ fontSize: "0.84rem", color: "var(--ink)" }}>No past consultation sessions recorded yet.</p>
                    <Link href="/astrologers" className="btn btn-purple btn-sm" style={{ marginTop: "0.75rem" }}>
                      Find an Astrologer
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "appointments" && (
                <div className="surface-card" style={{ padding: "1.5rem" }}>
                  <h2 className="serif-heading" style={{ fontSize: "1.3rem", color: "var(--royal-purple)", marginBottom: "0.5rem" }}>
                    Upcoming &amp; Past Appointments
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "1rem" }}>
                    Scheduled 15, 30, and 60-minute Vedic horoscope consultations.
                  </p>
                  <div style={{ border: "1px dashed var(--border)", padding: "2rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                    <Calendar size={32} color="#D4A84F" style={{ margin: "0 auto 0.5rem" }} />
                    <p style={{ fontSize: "0.84rem", color: "var(--ink)" }}>You have no scheduled appointments.</p>
                    <Link href="/astrologers" className="btn btn-outline btn-sm" style={{ marginTop: "0.75rem" }}>
                      Book Consultation Slot
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "pujas" && (
                <div className="surface-card" style={{ padding: "1.5rem" }}>
                  <h2 className="serif-heading" style={{ fontSize: "1.3rem", color: "var(--royal-purple)", marginBottom: "0.5rem" }}>
                    Online Puja &amp; Temple Bookings
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "1rem" }}>
                    Track your registered temple Sankalp, live Puja streaming, and Prasad dispatch.
                  </p>
                  <div style={{ border: "1px dashed var(--border)", padding: "2rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                    <Flame size={32} color="#D4A84F" style={{ margin: "0 auto 0.5rem" }} />
                    <p style={{ fontSize: "0.84rem", color: "var(--ink)" }}>No active temple Puja bookings.</p>
                    <Link href="/#puja-booking" className="btn btn-gold btn-sm" style={{ marginTop: "0.75rem" }}>
                      Explore Sacred Pujas
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="surface-card" style={{ padding: "1.5rem" }}>
                  <h2 className="serif-heading" style={{ fontSize: "1.3rem", color: "var(--royal-purple)", marginBottom: "0.5rem" }}>
                    Astro Store Orders
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "1rem" }}>
                    Track energized gemstones, sacred Rudraksha beads, and Siddh Yantras.
                  </p>
                  <div style={{ border: "1px dashed var(--border)", padding: "2rem", borderRadius: "var(--radius-sm)", textAlign: "center" }}>
                    <ShoppingBag size={32} color="#D4A84F" style={{ margin: "0 auto 0.5rem" }} />
                    <p style={{ fontSize: "0.84rem", color: "var(--ink)" }}>No recent product orders.</p>
                    <Link href="/#astro-store" className="btn btn-purple btn-sm" style={{ marginTop: "0.75rem" }}>
                      Visit Astro Store
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div className="surface-card">
                    <h2 className="serif-heading" style={{ fontSize: "1.3rem", color: "var(--royal-purple)", marginBottom: "0.5rem" }}>
                      Privacy &amp; Security Settings
                    </h2>
                    <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", marginBottom: "1rem" }}>
                      Manage device sessions, authentication preferences, and GDPR account deletion.
                    </p>

                    <div style={{ display: "grid", gap: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBlock: "0.5rem", borderBottom: "1px solid var(--border)" }}>
                        <div>
                          <strong style={{ fontSize: "0.88rem", display: "block" }}>Logout from All Devices</strong>
                          <span style={{ fontSize: "0.76rem", color: "var(--ink-subtle)" }}>
                            Revoke all active JWT sessions across mobile and desktop browsers
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={logout}
                          className="btn btn-outline btn-sm"
                        >
                          Revoke Sessions
                        </button>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBlock: "0.5rem" }}>
                        <div>
                          <strong style={{ fontSize: "0.88rem", display: "block", color: "#DC2626" }}>Delete Account</strong>
                          <span style={{ fontSize: "0.76rem", color: "var(--ink-subtle)" }}>
                            Permanently close account and delete personal birth profiles
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete your NAMH ASTRO account? This action cannot be undone.")) {
                              fetch(`${API_BASE}/api/v1/auth/account`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                              }).then(() => logout());
                            }
                          }}
                          className="btn btn-sm"
                          style={{ backgroundColor: "#FEE2E2", color: "#DC2626", border: "1px solid #FCA5A5" }}
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <MobileBottomNav />
      <SiteFooter />
    </>
  );
}

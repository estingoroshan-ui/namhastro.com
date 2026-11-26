"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  Check,
  Clock,
  Home,
  IndianRupee,
  MessageCircle,
  PhoneCall,
  PhoneOff,
  Power,
  Star,
  Video,
  X,
  Upload,
  ShieldCheck,
  FileText,
  AlertCircle,
  TrendingUp,
  Wallet,
  Building,
  UserCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

interface DashboardData {
  profile: {
    id: string;
    displayName: string;
    slug: string;
    avatarUrl?: string;
    verificationStage: string;
    availabilityStatus: string;
    isOnline: boolean;
    chatEnabled: boolean;
    audioEnabled: boolean;
    videoEnabled: boolean;
    chatRatePaise: number;
    audioRatePaise: number;
    videoRatePaise: number;
    averageRating: number;
    totalReviews: number;
    totalConsultations: number;
  };
  earnings: {
    grossRevenuePaise: number;
    grossRevenueInr: string;
    platformCommissionPaise: number;
    commissionPercent: string;
    netEarningsPaise: number;
    netEarningsInr: string;
    withdrawableBalancePaise: number;
    withdrawableBalanceInr: string;
  };
  pendingRequestsCount: number;
  pendingRequests: Array<{
    id: string;
    type: string;
    ratePaisePerMinute: number;
    concern?: string;
    preferredLanguage?: string;
    customer: { fullName: string; phoneE164?: string };
    createdAt: string;
  }>;
  waitingQueueCount: number;
  waitingQueue: Array<{
    id: string;
    consultationType: string;
    position: number;
    estimatedWaitMinutes: number;
  }>;
  bankAccountConfigured: boolean;
  bankAccountVerified: boolean;
}

const DEMO_DASHBOARD_DATA: DashboardData = {
  profile: {
    id: "demo-acharya-someshwar",
    displayName: "Acharya Someshwar Shastri",
    slug: "acharya-someshwar",
    verificationStage: "APPROVED",
    availabilityStatus: "ONLINE",
    isOnline: true,
    chatEnabled: true,
    audioEnabled: true,
    videoEnabled: true,
    chatRatePaise: 3000,
    audioRatePaise: 3500,
    videoRatePaise: 5000,
    averageRating: 4.95,
    totalReviews: 842,
    totalConsultations: 1250,
  },
  earnings: {
    grossRevenuePaise: 1850000,
    grossRevenueInr: "18,500.00",
    platformCommissionPaise: 370000,
    commissionPercent: "20.0",
    netEarningsPaise: 1480000,
    netEarningsInr: "14,800.00",
    withdrawableBalancePaise: 1245000,
    withdrawableBalanceInr: "12,450.00",
  },
  pendingRequestsCount: 0,
  pendingRequests: [],
  waitingQueueCount: 0,
  waitingQueue: [],
  bankAccountConfigured: true,
  bankAccountVerified: true,
};

const DEMO_EARNINGS_DETAILS = {
  summary: {
    todayEarningsInr: 2850.0,
    yesterdayEarningsInr: 4200.0,
    thisWeekEarningsInr: 16800.0,
    thisMonthEarningsInr: 68400.0,
    availableBalanceInr: 12450.0,
    pendingEarningsInr: 2350.0,
    reservedWithdrawalInr: 5000.0,
    completedWithdrawalsInr: 52000.0,
    tdsDeductedInr: 684.0,
    grossEarningsInr: 85500.0,
  },
  bankAccount: {
    id: "bank_demo_01",
    accountHolderName: "Acharya Someshwar Shastri",
    bankName: "HDFC Bank Ltd",
    accountNumberMasked: "•••• •••• 7890",
    ifscCode: "HDFC0001234",
    accountType: "SAVINGS",
    panNumber: "ABCDE1234F",
    isVerified: true,
  },
  ledgerEntries: [
    {
      id: "le_01",
      type: "EARNING_CREDIT",
      amountInr: "475.20",
      balanceAfterInr: "12450.00",
      status: "AVAILABLE",
      description: "VIDEO consultation (10 min @ 80% share, 1% TDS deducted)",
      createdAt: "2026-11-26T00:00:00Z",
    },
    {
      id: "le_02",
      type: "EARNING_CREDIT",
      amountInr: "332.64",
      balanceAfterInr: "11974.80",
      status: "AVAILABLE",
      description: "AUDIO consultation (12 min @ 80% share, 1% TDS deducted)",
      createdAt: "2026-11-25T23:00:00Z",
    },
  ],
  withdrawals: [
    {
      id: "wdr_01",
      requestNumber: "NA-WDR-8921",
      amountInr: "5000.00",
      tdsAmountInr: "50.00",
      netAmountInr: "4950.00",
      status: "REQUESTED",
      requestedAt: "2026-11-26T00:00:00Z",
    },
  ],
};

export default function AstrologerPartnerPage() {
  const { user, token, openLoginModal } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "requests" | "earnings" | "rates" | "bank">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as any;
      if (tabParam && ["dashboard", "requests", "earnings", "rates", "bank"].includes(tabParam)) {
        return tabParam;
      }
    }
    return "dashboard";
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(DEMO_DASHBOARD_DATA);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Rate Change Modal State
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [proposedChatRate, setProposedChatRate] = useState(30);
  const [proposedAudioRate, setProposedAudioRate] = useState(35);
  const [proposedVideoRate, setProposedVideoRate] = useState(50);
  const [rateReason, setRateReason] = useState("");

  // Withdrawal Modal State
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("withdrawModal") === "1";
    }
    return false;
  });
  const [withdrawAmountInr, setWithdrawAmountInr] = useState(500);

  // Step 8 Enterprise Earnings & Bank Account Details
  const [earningsDetails, setEarningsDetails] = useState<any>(DEMO_EARNINGS_DETAILS);

  const [bankForm, setBankForm] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "SAVINGS",
    panNumber: "",
    upiId: "",
  });
  const [bankEditMode, setBankEditMode] = useState(false);

  // Incoming Call State
  const [incomingCall, setIncomingCall] = useState<{
    consultationId: string;
    customerName: string;
    type: "AUDIO" | "VIDEO" | "CHAT";
    ratePaisePerMinute: number;
    concern: string;
    timeoutSeconds: number;
  } | null>(null);
  const callCountdownRef = useRef<NodeJS.Timeout | null>(null);

  // Application Form State (For non-partners)
  const [onboardingData, setOnboardingData] = useState({
    fullName: "",
    displayName: "",
    email: "",
    phoneE164: "",
    dateOfBirth: "1985-01-01",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    preferredLanguage: "hi",
    experienceYears: 10,
    qualifications: "Jyotish Acharya, Maharishi Vedic University",
    specialisations: ["Vedic", "Kundli", "Vastu"],
    languages: ["Hindi", "English"],
    bio: "Certified Vedic Astrologer with over a decade of experience guiding devotees worldwide.",
    proposedChatRatePaise: 2500,
    proposedAudioRatePaise: 3000,
    proposedVideoRatePaise: 4500,
  });

  // Fetch Partner Dashboard Data
  const loadDashboard = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/partner/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setDashboardData(json.data);
      }
    } catch (err: any) {
      console.error("Failed to load partner dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["dashboard", "requests", "earnings", "rates", "bank"].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
      if (params.get("withdrawModal") === "1") {
        setWithdrawModalOpen(true);
      }
      if (params.get("demo") === "1" || !token) {
        setDashboardData({
          profile: {
            id: "demo-acharya-someshwar",
            displayName: "Acharya Someshwar Shastri",
            slug: "acharya-someshwar",
            verificationStage: "APPROVED",
            availabilityStatus: "ONLINE",
            isOnline: true,
            chatEnabled: true,
            audioEnabled: true,
            videoEnabled: true,
            chatRatePaise: 3000,
            audioRatePaise: 3500,
            videoRatePaise: 5000,
            averageRating: 4.95,
            totalReviews: 842,
            totalConsultations: 1250,
          },
          earnings: {
            grossRevenuePaise: 1850000,
            grossRevenueInr: "18,500.00",
            platformCommissionPaise: 370000,
            commissionPercent: "20.0",
            netEarningsPaise: 1480000,
            netEarningsInr: "14,800.00",
            withdrawableBalancePaise: 1245000,
            withdrawableBalanceInr: "12,450.00",
          },
          pendingRequestsCount: 0,
          pendingRequests: [],
          waitingQueueCount: 0,
          waitingQueue: [],
          bankAccountConfigured: true,
          bankAccountVerified: true,
        });

        setEarningsDetails({
          summary: {
            todayEarningsInr: 2850.0,
            yesterdayEarningsInr: 4200.0,
            thisWeekEarningsInr: 16800.0,
            thisMonthEarningsInr: 68400.0,
            availableBalanceInr: 12450.0,
            pendingEarningsInr: 2350.0,
            reservedWithdrawalInr: 5000.0,
            completedWithdrawalsInr: 52000.0,
            tdsDeductedInr: 684.0,
            grossEarningsInr: 85500.0,
          },
          bankAccount: {
            id: "bank_demo_01",
            accountHolderName: "Acharya Someshwar Shastri",
            bankName: "HDFC Bank Ltd",
            accountNumberMasked: "•••• •••• 7890",
            ifscCode: "HDFC0001234",
            accountType: "SAVINGS",
            panNumber: "ABCDE1234F",
            isVerified: true,
          },
          ledgerEntries: [
            {
              id: "le_01",
              type: "EARNING_CREDIT",
              amountInr: "475.20",
              balanceAfterInr: "12450.00",
              status: "AVAILABLE",
              description: "VIDEO consultation (10 min @ 80% share, 1% TDS deducted)",
              createdAt: new Date().toISOString(),
            },
            {
              id: "le_02",
              type: "EARNING_CREDIT",
              amountInr: "332.64",
              balanceAfterInr: "11974.80",
              status: "AVAILABLE",
              description: "AUDIO consultation (12 min @ 80% share, 1% TDS deducted)",
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: "le_03",
              type: "WITHDRAWAL_RESERVE",
              amountInr: "-5000.00",
              balanceAfterInr: "11642.16",
              status: "RESERVED",
              description: "Payout request #NA-WDR-8921 reserved for IMPS bank transfer",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: "le_04",
              type: "WITHDRAWAL_SETTLE",
              amountInr: "0.00",
              balanceAfterInr: "11642.16",
              status: "SETTLED",
              description: "Disbursed ₹4,950.00 via Bank Transfer (UTR: HDFC982173002)",
              createdAt: new Date(Date.now() - 172800000).toISOString(),
            },
          ],
          withdrawals: [
            {
              id: "wdr_01",
              requestNumber: "NA-WDR-8921",
              amountInr: "5000.00",
              tdsAmountInr: "50.00",
              netAmountInr: "4950.00",
              status: "APPROVED",
              requestedAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: "wdr_02",
              requestNumber: "NA-WDR-7412",
              amountInr: "10000.00",
              tdsAmountInr: "100.00",
              netAmountInr: "9900.00",
              status: "PAID",
              utrNumber: "HDFC982173002",
              requestedAt: new Date(Date.now() - 604800000).toISOString(),
            },
          ],
        });
      }
    }

    if (token) {
      loadDashboard();
      loadEarnings();

      // Listen for incoming Audio/Video/Chat consultations
      const socket = io(API_BASE, {
        auth: { token: `Bearer ${token}` },
        transports: ["websocket", "polling"],
      });

      const handleIncoming = (data: any) => {
        setIncomingCall({
          consultationId: data.consultationId,
          customerName: data.customerName || "Devotee / Customer",
          type: data.type || "AUDIO",
          ratePaisePerMinute: data.ratePaisePerMinute || 3500,
          concern: data.concern || "Vedic Astrological Guidance",
          timeoutSeconds: 30,
        });

        // Trigger gentle astrological ringtone
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.85);
          }
        } catch (e) { }

        let remain = 30;
        if (callCountdownRef.current) clearInterval(callCountdownRef.current);
        callCountdownRef.current = setInterval(() => {
          remain -= 1;
          if (remain <= 0) {
            clearInterval(callCountdownRef.current!);
            setIncomingCall(null);
          } else {
            setIncomingCall((prev) => (prev ? { ...prev, timeoutSeconds: remain } : null));
          }
        }, 1000);
      };

      socket.on("call:incoming", handleIncoming);
      socket.on("consultation:incoming", handleIncoming);

      return () => {
        socket.disconnect();
        if (callCountdownRef.current) clearInterval(callCountdownRef.current);
      };
    }
  }, [token]);

  const acceptIncomingCall = async () => {
    if (!incomingCall) return;
    if (callCountdownRef.current) clearInterval(callCountdownRef.current);
    const cId = incomingCall.consultationId;
    const cType = incomingCall.type;

    try {
      await fetch(`${API_BASE}/api/v1/consultations/${cId}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setIncomingCall(null);
      if (cType === "CHAT") {
        window.location.href = `/consultation/chat?id=${cId}&role=astrologer`;
      } else {
        window.location.href = `/consultation/call?id=${cId}&role=astrologer&type=${cType}`;
      }
    } catch (err) {
      setIncomingCall(null);
    }
  };

  const declineIncomingCall = async () => {
    if (!incomingCall) return;
    if (callCountdownRef.current) clearInterval(callCountdownRef.current);
    const cId = incomingCall.consultationId;
    setIncomingCall(null);

    try {
      await fetch(`${API_BASE}/api/v1/consultations/${cId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: "Astrologer is currently occupied" }),
      });
    } catch (e) { }
  };

  // Toggle Availability
  const toggleAvailability = async (key: "isOnline" | "chatEnabled" | "audioEnabled" | "videoEnabled") => {
    if (!token || !dashboardData) return;
    try {
      const nextVal = !dashboardData.profile[key];
      const payload: any = { [key]: nextVal };
      if (key === "isOnline") {
        payload.availabilityStatus = nextVal ? "ONLINE" : "OFFLINE";
      }

      const res = await fetch(`${API_BASE}/api/v1/partner/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await loadDashboard();
        setSuccessMsg(`Availability updated: ${key} is now ${nextVal ? "ON" : "OFF"}`);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      setErrorMsg("Failed to update availability.");
    }
  };

  // Accept Consultation Request
  const acceptRequest = async (consultationId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/consultations/${consultationId}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        window.location.href = `/consultation/call?id=${consultationId}`;
      }
    } catch (err) {
      setErrorMsg("Failed to accept consultation request.");
    }
  };

  // Reject Consultation Request
  const rejectRequest = async (consultationId: string) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/v1/consultations/${consultationId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: "Astrologer is busy with another consultation" }),
      });
      await loadDashboard();
    } catch (err) {
      setErrorMsg("Failed to reject consultation.");
    }
  };

  // Submit Rate Change Request
  const submitRateChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/partner/rate-change-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proposedChatRatePaise: proposedChatRate * 100,
          proposedAudioRatePaise: proposedAudioRate * 100,
          proposedVideoRatePaise: proposedVideoRate * 100,
          reason: rateReason || "Rate revision requested based on experience and client demand.",
        }),
      });
      if (res.ok) {
        setRateModalOpen(false);
        setSuccessMsg("Rate change request submitted for Super Admin review.");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      setErrorMsg("Failed to submit rate change.");
    }
  };

  // Submit Withdrawal Request
  const submitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/partner/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amountPaise: withdrawAmountInr * 100,
        }),
      });
      if (res.ok) {
        setWithdrawModalOpen(false);
        setSuccessMsg("Withdrawal request submitted! Funds atomically reserved.");
        setTimeout(() => setSuccessMsg(""), 4000);
        await Promise.all([loadDashboard(), loadEarnings()]);
      } else {
        const errJson = await res.json();
        setErrorMsg(errJson.error || errJson.message || "Failed to submit withdrawal.");
      }
    } catch (err) {
      setErrorMsg("Withdrawal request failed.");
    }
  };

  // Load Step 8 Earnings & Ledger Data
  const loadEarnings = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/partner/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setEarningsDetails(json.data);
      }
    } catch (err) {
      console.error("Failed to load earnings:", err);
    }
  };

  // Save Bank Account
  const saveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/partner/bank-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bankForm),
      });
      if (res.ok) {
        setSuccessMsg("Bank account updated and verified!");
        setBankEditMode(false);
        setTimeout(() => setSuccessMsg(""), 4000);
        await Promise.all([loadDashboard(), loadEarnings()]);
      } else {
        const err = await res.json();
        setErrorMsg(err.message || "Failed to save bank account.");
      }
    } catch {
      setErrorMsg("Error saving bank account.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel Withdrawal Request
  const cancelWithdrawal = async (withdrawalId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/partner/withdrawals/${withdrawalId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccessMsg("Withdrawal cancelled. Reserved balance restored.");
        setTimeout(() => setSuccessMsg(""), 4000);
        await Promise.all([loadDashboard(), loadEarnings()]);
      } else {
        const err = await res.json();
        setErrorMsg(err.message || "Failed to cancel withdrawal.");
      }
    } catch {
      setErrorMsg("Error cancelling withdrawal.");
    }
  };

  // Submit Onboarding Application
  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      openLoginModal();
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/partner/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(onboardingData),
      });

      if (res.ok) {
        setSuccessMsg("Application submitted successfully! Your profile is now under review.");
        await loadDashboard();
      } else {
        const errJson = await res.json();
        setErrorMsg(errJson.message || "Failed to submit application.");
      }
    } catch (err) {
      setErrorMsg("Error submitting application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="mp-section" style={{ paddingBlock: "1.25rem 5.5rem" }}>
        <div className="container" style={{ maxInlineSize: "72rem" }}>
          {/* Universal Back Navigation & Portal Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
            <Link
              href="/"
              className="btn btn-outline btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", textDecoration: "none", fontSize: "0.82rem" }}
              title="Return to NAMH ASTRO Customer Home"
            >
              <Home size={14} /> ← Back to Home
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.82rem" }}>
              <span style={{ color: "var(--ink-muted)" }}>Astrologer Portal · Switch:</span>
              <Link href="/admin" className="btn btn-sm btn-purple" style={{ textDecoration: "none", fontSize: "0.76rem", padding: "0.2rem 0.55rem" }}>
                Super Admin
              </Link>
              <Link href="/account" className="btn btn-sm btn-outline" style={{ textDecoration: "none", fontSize: "0.76rem", padding: "0.2rem 0.55rem" }}>
                Devotee Dashboard
              </Link>
            </div>
          </div>
          {/* Notifications / Alerts */}
          {successMsg ? (
            <div style={{ padding: "0.85rem 1.25rem", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(22,163,74,0.12)", border: "1px solid #16A34A", color: "#16A34A", marginBlockEnd: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Check size={16} /> {successMsg}
            </div>
          ) : null}

          {errorMsg ? (
            <div style={{ padding: "0.85rem 1.25rem", borderRadius: "var(--radius-sm)", backgroundColor: "rgba(220,38,38,0.12)", border: "1px solid #DC2626", color: "#DC2626", marginBlockEnd: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={16} /> {errorMsg}
            </div>
          ) : null}

          {/* If user has an active partner profile */}
          {dashboardData ? (
            <>
              {/* Partner Header Banner */}
              <div
                className="surface-card"
                style={{
                  background: "linear-gradient(135deg, var(--deep-plum) 0%, var(--royal-purple) 60%, #4A1861 100%)",
                  color: "#FFFFFF",
                  borderColor: "var(--champagne-gold)",
                  marginBlockEnd: "1.25rem",
                  padding: "1.5rem",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1.25rem",
                }}
              >
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#F2C96B", fontWeight: 700, textTransform: "uppercase" }}>
                    <BadgeCheck size={15} /> VERIFIED ACHARYA PARTNER CONSOLE
                  </span>
                  <h1 className="serif-heading" style={{ color: "#FFFFFF", fontSize: "clamp(1.5rem, 1.2rem + 1vw, 2.2rem)", marginBlock: "0.2rem" }}>
                    {dashboardData.profile.displayName}
                  </h1>
                  <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.78)" }}>
                    Stage: <strong style={{ color: "#F2C96B" }}>{dashboardData.profile.verificationStage}</strong> · Rating: <strong style={{ color: "#FBBF24" }}>★ {dashboardData.profile.averageRating}</strong> ({dashboardData.profile.totalReviews} reviews)
                  </p>
                </div>

                {/* Real-Time Availability Controls */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => toggleAvailability("isOnline")}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: dashboardData.profile.isOnline ? "var(--online)" : "#64748B",
                      color: "#FFFFFF",
                      fontWeight: 700,
                    }}
                  >
                    <Power size={14} /> {dashboardData.profile.isOnline ? "ONLINE · Taking Consultations" : "OFFLINE"}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAvailability("chatEnabled")}
                    className={dashboardData.profile.chatEnabled ? "btn btn-gold btn-sm" : "btn btn-outline btn-sm"}
                    style={{ color: dashboardData.profile.chatEnabled ? "#201627" : "#FFFFFF", borderColor: "rgba(255,255,255,0.3)" }}
                  >
                    <MessageCircle size={13} /> Chat: {dashboardData.profile.chatEnabled ? `ON (₹${(dashboardData.profile.chatRatePaise / 100).toFixed(0)}/m)` : "OFF"}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAvailability("audioEnabled")}
                    className={dashboardData.profile.audioEnabled ? "btn btn-gold btn-sm" : "btn btn-outline btn-sm"}
                    style={{ color: dashboardData.profile.audioEnabled ? "#201627" : "#FFFFFF", borderColor: "rgba(255,255,255,0.3)" }}
                  >
                    <PhoneCall size={13} /> Audio: {dashboardData.profile.audioEnabled ? `ON (₹${(dashboardData.profile.audioRatePaise / 100).toFixed(0)}/m)` : "OFF"}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleAvailability("videoEnabled")}
                    className={dashboardData.profile.videoEnabled ? "btn btn-gold btn-sm" : "btn btn-outline btn-sm"}
                    style={{ color: dashboardData.profile.videoEnabled ? "#201627" : "#FFFFFF", borderColor: "rgba(255,255,255,0.3)" }}
                  >
                    <Video size={13} /> Video: {dashboardData.profile.videoEnabled ? `ON (₹${(dashboardData.profile.videoRatePaise / 100).toFixed(0)}/m)` : "OFF"}
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div style={{ display: "flex", gap: "0.5rem", borderBlockEnd: "1px solid var(--border)", marginBlockEnd: "1.25rem", overflowX: "auto" }}>
                {[
                  { id: "dashboard", label: "Dashboard & KPIs" },
                  { id: "requests", label: `Incoming Requests (${dashboardData.pendingRequestsCount})` },
                  { id: "earnings", label: "Earnings & Payouts" },
                  { id: "rates", label: "My Consultation Rates" },
                  { id: "bank", label: "Bank Account & KYC" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      padding: "0.65rem 1rem",
                      fontWeight: activeTab === tab.id ? 700 : 500,
                      color: activeTab === tab.id ? "var(--royal-purple)" : "var(--ink-subtle)",
                      borderBlockEnd: activeTab === tab.id ? "3px solid var(--royal-purple)" : "3px solid transparent",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: DASHBOARD & KPIS */}
              {activeTab === "dashboard" && (
                <>
                  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 14rem), 1fr))", marginBlockEnd: "1.5rem" }}>
                    <div className="surface-card">
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-subtle)", textTransform: "uppercase" }}>Total Consultations</span>
                      <strong style={{ display: "block", fontSize: "1.8rem", color: "var(--royal-purple)", marginBlock: "0.2rem" }}>
                        {dashboardData.profile.totalConsultations}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--online)" }}>Verified Sessions Completed</span>
                    </div>

                    <div className="surface-card">
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-subtle)", textTransform: "uppercase" }}>Gross Revenue</span>
                      <strong style={{ display: "block", fontSize: "1.8rem", color: "var(--royal-purple)", marginBlock: "0.2rem" }}>
                        ₹{dashboardData.earnings.grossRevenueInr}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-muted)" }}>Platform fee: {dashboardData.earnings.commissionPercent}%</span>
                    </div>

                    <div className="surface-card">
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-subtle)", textTransform: "uppercase" }}>Net Partner Earnings</span>
                      <strong style={{ display: "block", fontSize: "1.8rem", color: "var(--royal-purple)", marginBlock: "0.2rem" }}>
                        ₹{dashboardData.earnings.netEarningsInr}
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--online)" }}>Withdrawable immediately</span>
                    </div>

                    <div className="surface-card" style={{ borderColor: "var(--champagne-gold)", backgroundColor: "var(--ivory)" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-subtle)", textTransform: "uppercase" }}>Payout Ready Balance</span>
                      <strong style={{ display: "block", fontSize: "1.8rem", color: "var(--saffron)", marginBlock: "0.2rem" }}>
                        ₹{dashboardData.earnings.withdrawableBalanceInr}
                      </strong>
                      <button
                        type="button"
                        onClick={() => setWithdrawModalOpen(true)}
                        className="btn btn-purple btn-sm"
                        style={{ marginBlockStart: "0.35rem", width: "100%" }}
                      >
                        Request Payout
                      </button>
                    </div>
                  </div>

                  {/* Consultation Request Highlight */}
                  {dashboardData.pendingRequests.length > 0 ? (
                    <div className="surface-card" style={{ borderColor: "var(--saffron)", backgroundColor: "rgba(245,158,11,0.06)", marginBlockEnd: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "0.75rem" }}>
                        <h2 style={{ fontSize: "1.1rem", color: "var(--royal-purple)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <AlertCircle size={18} color="var(--saffron)" /> Incoming Consultation Request Active!
                        </h2>
                        <span className="status-pill status-live">30s Countdown</span>
                      </div>
                      {dashboardData.pendingRequests.map((req) => (
                        <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", background: "#FFFFFF", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                          <div>
                            <strong style={{ display: "block", fontSize: "1.05rem" }}>{req.customer.fullName}</strong>
                            <span style={{ fontSize: "0.82rem", color: "var(--ink-subtle)" }}>
                              {req.type} Consultation · ₹{(req.ratePaisePerMinute / 100).toFixed(0)}/min · Concern: {req.concern || "General inquiry"}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              type="button"
                              onClick={() => acceptRequest(req.id)}
                              className="btn btn-purple btn-sm"
                            >
                              <Check size={14} /> Accept &amp; Start Call
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectRequest(req.id)}
                              className="btn btn-outline btn-sm"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              )}

              {/* TAB 2: INCOMING REQUESTS */}
              {activeTab === "requests" && (
                <div className="surface-card">
                  <h2 className="serif-heading" style={{ fontSize: "1.3rem", marginBlockEnd: "1rem" }}>
                    Active Consultations &amp; Waiting Queue
                  </h2>
                  {dashboardData.pendingRequests.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--ink-subtle)" }}>
                      <Clock size={36} style={{ margin: "0 auto 0.75rem", opacity: 0.5 }} />
                      <p style={{ fontSize: "0.95rem" }}>No pending consultation requests at this moment.</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--ink-muted)" }}>Ensure your status is set to ONLINE to receive incoming chat and audio/video calls.</p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                      {dashboardData.pendingRequests.map((req) => (
                        <div key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                          <div>
                            <strong>{req.customer.fullName}</strong>
                            <div style={{ fontSize: "0.82rem", color: "var(--ink-subtle)" }}>
                              Type: {req.type} · Rate: ₹{(req.ratePaisePerMinute / 100).toFixed(0)}/min · Concern: {req.concern}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => acceptRequest(req.id)} className="btn btn-purple btn-sm">Accept</button>
                            <button onClick={() => rejectRequest(req.id)} className="btn btn-outline btn-sm">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ENTERPRISE EARNINGS & PAYOUTS (STEP 8) */}
              {activeTab === "earnings" && (
                <div className="surface-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--saffron)", fontWeight: 700, textTransform: "uppercase" }}>
                        DOUBLE-ENTRY EARNINGS LEDGER &amp; SETTLEMENTS
                      </span>
                      <h2 className="serif-heading" style={{ fontSize: "1.4rem", marginBlock: "0.15rem" }}>
                        Financial Accounts &amp; Payouts
                      </h2>
                      <p style={{ fontSize: "0.82rem", color: "var(--ink-subtle)" }}>
                        Authoritative balances calculated in integer paise. TDS withheld under Section 194C/194J.
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={loadEarnings} className="btn btn-outline btn-sm">
                        <RefreshCw size={13} /> Refresh
                      </button>
                      <button onClick={() => setWithdrawModalOpen(true)} className="btn btn-gold btn-sm">
                        <IndianRupee size={14} /> Request Payout
                      </button>
                    </div>
                  </div>

                  {/* 8-Card Financial Metric Grid */}
                  <div style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 13rem), 1fr))", marginBlockEnd: "1.5rem" }}>
                    <div style={{ padding: "0.95rem 1.15rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)", fontWeight: 600 }}>TODAY&apos;S EARNINGS</span>
                      <strong style={{ display: "block", fontSize: "1.35rem", color: "var(--royal-purple)", marginBlockStart: "0.2rem" }}>
                        ₹{earningsDetails?.summary.todayEarningsInr?.toFixed(2) ?? "0.00"}
                      </strong>
                    </div>

                    <div style={{ padding: "0.95rem 1.15rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)", fontWeight: 600 }}>YESTERDAY</span>
                      <strong style={{ display: "block", fontSize: "1.35rem", color: "var(--ink-muted)", marginBlockStart: "0.2rem" }}>
                        ₹{earningsDetails?.summary.yesterdayEarningsInr?.toFixed(2) ?? "0.00"}
                      </strong>
                    </div>

                    <div style={{ padding: "0.95rem 1.15rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)", fontWeight: 600 }}>THIS WEEK</span>
                      <strong style={{ display: "block", fontSize: "1.35rem", color: "var(--royal-purple)", marginBlockStart: "0.2rem" }}>
                        ₹{earningsDetails?.summary.thisWeekEarningsInr?.toFixed(2) ?? "0.00"}
                      </strong>
                    </div>

                    <div style={{ padding: "0.95rem 1.15rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)", fontWeight: 600 }}>THIS MONTH</span>
                      <strong style={{ display: "block", fontSize: "1.35rem", color: "var(--royal-purple)", marginBlockStart: "0.2rem" }}>
                        ₹{earningsDetails?.summary.thisMonthEarningsInr?.toFixed(2) ?? "0.00"}
                      </strong>
                    </div>

                    <div style={{ padding: "0.95rem 1.15rem", background: "rgba(22,163,74,0.06)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(22,163,74,0.3)" }}>
                      <span style={{ fontSize: "0.72rem", color: "#16A34A", fontWeight: 700 }}>AVAILABLE FOR PAYOUT</span>
                      <strong style={{ display: "block", fontSize: "1.45rem", color: "#16A34A", marginBlockStart: "0.2rem" }}>
                        ₹{earningsDetails?.summary.availableBalanceInr?.toFixed(2) ?? dashboardData.earnings.withdrawableBalanceInr}
                      </strong>
                    </div>

                    <div style={{ padding: "0.95rem 1.15rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)", fontWeight: 600 }}>RESERVED IN PAYOUT</span>
                      <strong style={{ display: "block", fontSize: "1.35rem", color: "#D97706", marginBlockStart: "0.2rem" }}>
                        ₹{earningsDetails?.summary.reservedWithdrawalInr?.toFixed(2) ?? "0.00"}
                      </strong>
                    </div>

                    <div style={{ padding: "0.95rem 1.15rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)", fontWeight: 600 }}>TOTAL DISBURSED</span>
                      <strong style={{ display: "block", fontSize: "1.35rem", color: "var(--ink-muted)", marginBlockStart: "0.2rem" }}>
                        ₹{earningsDetails?.summary.completedWithdrawalsInr?.toFixed(2) ?? "0.00"}
                      </strong>
                    </div>

                    <div style={{ padding: "0.95rem 1.15rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)", fontWeight: 600 }}>TDS WITHHELD (1%)</span>
                      <strong style={{ display: "block", fontSize: "1.35rem", color: "var(--ink-subtle)", marginBlockStart: "0.2rem" }}>
                        ₹{earningsDetails?.summary.tdsDeductedInr?.toFixed(2) ?? "0.00"}
                      </strong>
                    </div>
                  </div>

                  {/* Section 1: Recent Withdrawal Requests */}
                  <div style={{ marginBlockEnd: "2rem" }}>
                    <h3 style={{ fontSize: "1.1rem", color: "var(--royal-purple)", marginBlockEnd: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Wallet size={16} /> Withdrawal &amp; Settlement Requests
                    </h3>
                    {earningsDetails?.withdrawals && earningsDetails.withdrawals.length > 0 ? (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ inlineSize: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                          <thead>
                            <tr style={{ background: "var(--ivory)", borderBlockEnd: "1px solid var(--border)", textAlign: "left" }}>
                              <th style={{ padding: "0.6rem 0.75rem" }}>Request #</th>
                              <th style={{ padding: "0.6rem 0.75rem" }}>Gross</th>
                              <th style={{ padding: "0.6rem 0.75rem" }}>TDS (1%)</th>
                              <th style={{ padding: "0.6rem 0.75rem" }}>Net Disbursed</th>
                              <th style={{ padding: "0.6rem 0.75rem" }}>Status</th>
                              <th style={{ padding: "0.6rem 0.75rem" }}>UTR / Reference</th>
                              <th style={{ padding: "0.6rem 0.75rem" }}>Requested At</th>
                              <th style={{ padding: "0.6rem 0.75rem" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {earningsDetails.withdrawals.map((w: any) => (
                              <tr key={w.id} style={{ borderBlockEnd: "1px solid var(--border)" }}>
                                <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>{w.requestNumber}</td>
                                <td style={{ padding: "0.6rem 0.75rem" }}>₹{w.amountInr}</td>
                                <td style={{ padding: "0.6rem 0.75rem", color: "var(--ink-subtle)" }}>₹{w.tdsAmountInr}</td>
                                <td style={{ padding: "0.6rem 0.75rem", fontWeight: 700, color: "var(--royal-purple)" }}>₹{w.netAmountInr}</td>
                                <td style={{ padding: "0.6rem 0.75rem" }}>
                                  <span
                                    className="status-pill"
                                    style={{
                                      backgroundColor:
                                        w.status === "PAID"
                                          ? "rgba(22,163,74,0.12)"
                                          : w.status === "REJECTED"
                                            ? "rgba(220,38,38,0.12)"
                                            : "rgba(217,119,6,0.12)",
                                      color:
                                        w.status === "PAID"
                                          ? "#16A34A"
                                          : w.status === "REJECTED"
                                            ? "#DC2626"
                                            : "#D97706",
                                    }}
                                  >
                                    {w.status}
                                  </span>
                                </td>
                                <td style={{ padding: "0.6rem 0.75rem", fontFamily: "monospace", fontSize: "0.78rem" }}>
                                  {w.utrNumber || (w.rejectionReason ? `Reason: ${w.rejectionReason}` : "Pending Bank Ack")}
                                </td>
                                <td style={{ padding: "0.6rem 0.75rem", color: "var(--ink-subtle)" }}>
                                  {new Date(w.requestedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </td>
                                <td style={{ padding: "0.6rem 0.75rem" }}>
                                  {w.status === "REQUESTED" ? (
                                    <button
                                      type="button"
                                      onClick={() => cancelWithdrawal(w.id)}
                                      className="btn btn-outline btn-xs"
                                      style={{ color: "#DC2626", borderColor: "#DC2626" }}
                                    >
                                      Cancel
                                    </button>
                                  ) : (
                                    <span style={{ color: "var(--ink-muted)", fontSize: "0.75rem" }}>—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: "1.25rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", textAlign: "center", color: "var(--ink-subtle)", fontSize: "0.85rem" }}>
                        No withdrawal requests yet. Your earnings accumulate in your available balance and can be withdrawn anytime.
                      </div>
                    )}
                  </div>

                  {/* Section 2: Double-Entry Earnings Ledger */}
                  <div>
                    <h3 style={{ fontSize: "1.1rem", color: "var(--royal-purple)", marginBlockEnd: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <FileText size={16} /> Authoritative Earnings Ledger
                    </h3>
                    {earningsDetails?.ledgerEntries && earningsDetails.ledgerEntries.length > 0 ? (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ inlineSize: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                          <thead>
                            <tr style={{ background: "var(--ivory)", borderBlockEnd: "1px solid var(--border)", textAlign: "left" }}>
                              <th style={{ padding: "0.6rem 0.75rem" }}>Date &amp; Time</th>
                              <th style={{ padding: "0.6rem 0.75rem" }}>Type</th>
                              <th style={{ padding: "0.6rem 0.75rem" }}>Description</th>
                              <th style={{ padding: "0.6rem 0.75rem" }}>Amount (₹)</th>
                              <th style={{ padding: "0.6rem 0.75rem" }}>Balance After</th>
                              <th style={{ padding: "0.6rem 0.75rem" }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {earningsDetails.ledgerEntries.map((e: any) => {
                              const isPositive = Number(e.amountInr) > 0;
                              return (
                                <tr key={e.id} style={{ borderBlockEnd: "1px solid var(--border)" }}>
                                  <td style={{ padding: "0.6rem 0.75rem", color: "var(--ink-subtle)", whiteSpace: "nowrap" }}>
                                    {new Date(e.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                  </td>
                                  <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>{e.type}</td>
                                  <td style={{ padding: "0.6rem 0.75rem", color: "var(--ink-muted)" }}>{e.description}</td>
                                  <td style={{ padding: "0.6rem 0.75rem", fontWeight: 700, color: isPositive ? "#16A34A" : Number(e.amountInr) < 0 ? "#DC2626" : "var(--ink-muted)" }}>
                                    {isPositive ? `+₹${e.amountInr}` : Number(e.amountInr) < 0 ? `-₹${Math.abs(Number(e.amountInr)).toFixed(2)}` : "₹0.00"}
                                  </td>
                                  <td style={{ padding: "0.6rem 0.75rem", fontWeight: 600 }}>₹{e.balanceAfterInr}</td>
                                  <td style={{ padding: "0.6rem 0.75rem" }}>
                                    <span className="status-pill status-online">{e.status}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: "1.25rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", textAlign: "center", color: "var(--ink-subtle)", fontSize: "0.85rem" }}>
                        Ledger entries will record automatically as consultations are completed.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: MY CONSULTATION RATES */}
              {activeTab === "rates" && (
                <div className="surface-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "1rem" }}>
                    <h2 className="serif-heading" style={{ fontSize: "1.3rem" }}>My Consultation Rates</h2>
                    <button onClick={() => setRateModalOpen(true)} className="btn btn-purple btn-sm">
                      Request Rate Revision
                    </button>
                  </div>
                  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))" }}>
                    <div style={{ padding: "1.25rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--ink-subtle)" }}>Chat Consultation Rate</span>
                      <strong style={{ display: "block", fontSize: "1.6rem", color: "var(--royal-purple)", marginBlock: "0.25rem" }}>
                        ₹{(dashboardData.profile.chatRatePaise / 100).toFixed(2)} / min
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: dashboardData.profile.chatEnabled ? "var(--online)" : "#64748B" }}>
                        {dashboardData.profile.chatEnabled ? "● Enabled" : "○ Disabled"}
                      </span>
                    </div>

                    <div style={{ padding: "1.25rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--ink-subtle)" }}>Audio Call Rate</span>
                      <strong style={{ display: "block", fontSize: "1.6rem", color: "var(--royal-purple)", marginBlock: "0.25rem" }}>
                        ₹{(dashboardData.profile.audioRatePaise / 100).toFixed(2)} / min
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: dashboardData.profile.audioEnabled ? "var(--online)" : "#64748B" }}>
                        {dashboardData.profile.audioEnabled ? "● Enabled" : "○ Disabled"}
                      </span>
                    </div>

                    <div style={{ padding: "1.25rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--ink-subtle)" }}>HD Video Consultation Rate</span>
                      <strong style={{ display: "block", fontSize: "1.6rem", color: "var(--royal-purple)", marginBlock: "0.25rem" }}>
                        ₹{(dashboardData.profile.videoRatePaise / 100).toFixed(2)} / min
                      </strong>
                      <span style={{ fontSize: "0.75rem", color: dashboardData.profile.videoEnabled ? "var(--online)" : "#64748B" }}>
                        {dashboardData.profile.videoEnabled ? "● Enabled" : "○ Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BANK ACCOUNT & KYC (STEP 8 ENHANCED) */}
              {activeTab === "bank" && (
                <div className="surface-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--saffron)", fontWeight: 700, textTransform: "uppercase" }}>
                        PAYOUT DESTINATION &amp; TAX COMPLIANCE
                      </span>
                      <h2 className="serif-heading" style={{ fontSize: "1.35rem", marginBlock: "0.15rem" }}>
                        Bank Account &amp; Verification
                      </h2>
                      <p style={{ fontSize: "0.82rem", color: "var(--ink-subtle)" }}>
                        Required for direct bank disbursements. PAN is verified for Section 194C/194J compliance.
                      </p>
                    </div>
                    {!bankEditMode && (
                      <button onClick={() => setBankEditMode(true)} className="btn btn-outline btn-sm">
                        {dashboardData.bankAccountConfigured ? "Update Bank Account" : "Add Bank Account"}
                      </button>
                    )}
                  </div>

                  <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 20rem), 1fr))" }}>
                    {/* Linked Bank Card or Form */}
                    <div style={{ padding: "1.25rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--ivory)" }}>
                      <h3 style={{ fontSize: "1.05rem", color: "var(--royal-purple)", marginBlockEnd: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Building size={16} /> Verified Settlement Bank Account
                      </h3>

                      {earningsDetails?.bankAccount && !bankEditMode ? (
                        <div style={{ display: "grid", gap: "0.6rem", fontSize: "0.85rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBlockEnd: "1px solid var(--border)", paddingBlockEnd: "0.4rem" }}>
                            <span style={{ color: "var(--ink-subtle)" }}>Bank Name</span>
                            <strong>{earningsDetails.bankAccount.bankName}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBlockEnd: "1px solid var(--border)", paddingBlockEnd: "0.4rem" }}>
                            <span style={{ color: "var(--ink-subtle)" }}>Beneficiary Name</span>
                            <strong>{earningsDetails.bankAccount.accountHolderName}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBlockEnd: "1px solid var(--border)", paddingBlockEnd: "0.4rem" }}>
                            <span style={{ color: "var(--ink-subtle)" }}>Account Number</span>
                            <strong style={{ fontFamily: "monospace" }}>{earningsDetails.bankAccount.accountNumberMasked}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBlockEnd: "1px solid var(--border)", paddingBlockEnd: "0.4rem" }}>
                            <span style={{ color: "var(--ink-subtle)" }}>IFSC Code</span>
                            <strong style={{ fontFamily: "monospace" }}>{earningsDetails.bankAccount.ifscCode}</strong>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", borderBlockEnd: "1px solid var(--border)", paddingBlockEnd: "0.4rem" }}>
                            <span style={{ color: "var(--ink-subtle)" }}>Account Type</span>
                            <strong>{earningsDetails.bankAccount.accountType}</strong>
                          </div>
                          {earningsDetails.bankAccount.panNumber && (
                            <div style={{ display: "flex", justifyContent: "space-between", borderBlockEnd: "1px solid var(--border)", paddingBlockEnd: "0.4rem" }}>
                              <span style={{ color: "var(--ink-subtle)" }}>PAN Number</span>
                              <strong style={{ fontFamily: "monospace" }}>{earningsDetails.bankAccount.panNumber}</strong>
                            </div>
                          )}
                          <div style={{ marginBlockStart: "0.5rem" }}>
                            <span className="status-pill status-online" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                              <ShieldCheck size={14} /> Active &amp; Verified for Payouts
                            </span>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={saveBankAccount} style={{ display: "grid", gap: "0.75rem" }}>
                          <div>
                            <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Account Holder Name (as in bank)</label>
                            <input
                              type="text"
                              className="form-input"
                              value={bankForm.accountHolderName}
                              onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                              placeholder="e.g. Acharya Ramesh Sharma"
                              required
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Bank Name</label>
                            <input
                              type="text"
                              className="form-input"
                              value={bankForm.bankName}
                              onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                              placeholder="e.g. State Bank of India, HDFC Bank"
                              required
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Account Number</label>
                            <input
                              type="text"
                              className="form-input"
                              value={bankForm.accountNumber}
                              onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                              placeholder="Enter bank account number"
                              required
                            />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <div>
                              <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>IFSC Code</label>
                              <input
                                type="text"
                                className="form-input"
                                value={bankForm.ifscCode}
                                onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                                placeholder="SBIN0001234"
                                maxLength={11}
                                required
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Account Type</label>
                              <select
                                className="form-input"
                                value={bankForm.accountType}
                                onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                              >
                                <option value="SAVINGS">SAVINGS</option>
                                <option value="CURRENT">CURRENT</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>PAN Number (for TDS 1% compliance)</label>
                            <input
                              type="text"
                              className="form-input"
                              value={bankForm.panNumber}
                              onChange={(e) => setBankForm({ ...bankForm, panNumber: e.target.value.toUpperCase() })}
                              placeholder="ABCDE1234F"
                              maxLength={10}
                            />
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", marginBlockStart: "0.5rem" }}>
                            <button type="submit" className="btn btn-purple btn-sm" style={{ flex: 1 }}>Save &amp; Verify Bank Account</button>
                            {bankEditMode && (
                              <button type="button" onClick={() => setBankEditMode(false)} className="btn btn-outline btn-sm">Cancel</button>
                            )}
                          </div>
                        </form>
                      )}
                    </div>

                    {/* Tax & Compliance Details Card */}
                    <div style={{ padding: "1.25rem", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--ivory)" }}>
                      <h3 style={{ fontSize: "1.05rem", color: "var(--royal-purple)", marginBlockEnd: "0.75rem" }}>
                        Indian Tax Compliance &amp; Policy
                      </h3>
                      <div style={{ display: "grid", gap: "0.6rem", fontSize: "0.82rem", lineHeight: 1.6 }}>
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                          <ShieldCheck size={16} color="#16A34A" />
                          <span><strong>Section 194C / 194J TDS:</strong> 1% tax withheld on net consultation earnings.</span>
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                          <ShieldCheck size={16} color="#16A34A" />
                          <span><strong>Form 16A Certificate:</strong> Issued quarterly to your verified PAN address.</span>
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                          <ShieldCheck size={16} color="#16A34A" />
                          <span><strong>GST on Platform Commission:</strong> 18% GST (CGST+SGST/IGST) borne by platform.</span>
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                          <ShieldCheck size={16} color="#16A34A" />
                          <span><strong>Disbursement Schedule:</strong> IMPS / NEFT payouts processed within 24 business hours.</span>
                        </div>
                        <p style={{ color: "var(--ink-subtle)", marginBlockStart: "0.5rem" }}>
                          All financial transactions are reconciled against double-entry ledgers matching Reserve Bank of India standards.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RATE CHANGE MODAL */}
              {rateModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                  <div className="surface-card" style={{ inlineSize: "100%", maxInlineSize: "28rem", background: "#FFFFFF", padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "1rem" }}>
                      <h3 style={{ fontSize: "1.2rem", color: "var(--royal-purple)" }}>Request Rate Revision</h3>
                      <button onClick={() => setRateModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
                    </div>
                    <form onSubmit={submitRateChange} style={{ display: "grid", gap: "0.85rem" }}>
                      <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Proposed Chat Rate (₹/min)</label>
                        <input type="number" min="1" className="form-input" value={proposedChatRate} onChange={(e) => setProposedChatRate(Number(e.target.value))} required />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Proposed Audio Rate (₹/min)</label>
                        <input type="number" min="1" className="form-input" value={proposedAudioRate} onChange={(e) => setProposedAudioRate(Number(e.target.value))} required />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Proposed Video Rate (₹/min)</label>
                        <input type="number" min="1" className="form-input" value={proposedVideoRate} onChange={(e) => setProposedVideoRate(Number(e.target.value))} required />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Reason for Rate Change</label>
                        <textarea className="form-input" rows={2} value={rateReason} onChange={(e) => setRateReason(e.target.value)} placeholder="Experience, consultations milestone, etc." required />
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", marginBlockStart: "0.5rem" }}>
                        <button type="submit" className="btn btn-purple btn-sm" style={{ flex: 1 }}>Submit to Super Admin</button>
                        <button type="button" onClick={() => setRateModalOpen(false)} className="btn btn-outline btn-sm">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* WITHDRAWAL MODAL WITH TDS CALCULATION PREVIEW (STEP 8) */}
              {withdrawModalOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                  <div className="surface-card" style={{ inlineSize: "100%", maxInlineSize: "28rem", background: "#FFFFFF", padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "1rem" }}>
                      <h3 style={{ fontSize: "1.2rem", color: "var(--royal-purple)" }}>Request Payout</h3>
                      <button onClick={() => setWithdrawModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
                    </div>
                    <form onSubmit={submitWithdrawal} style={{ display: "grid", gap: "0.85rem" }}>
                      <div style={{ padding: "0.75rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: "0.82rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--ink-subtle)" }}>Available Balance:</span>
                          <strong style={{ color: "#16A34A" }}>₹{earningsDetails?.summary.availableBalanceInr?.toFixed(2) ?? dashboardData.earnings.withdrawableBalanceInr}</strong>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600 }}>Payout Amount (₹, min ₹500, max ₹50,000)</label>
                        <input
                          type="number"
                          min="500"
                          max={Math.min(50000, Number(earningsDetails?.summary.availableBalanceInr ?? dashboardData.earnings.withdrawableBalanceInr))}
                          className="form-input"
                          value={withdrawAmountInr}
                          onChange={(e) => setWithdrawAmountInr(Number(e.target.value))}
                          required
                        />
                      </div>

                      {/* Live TDS & Net Payout Calculation Card */}
                      <div style={{ padding: "0.85rem", background: "#F8FAFC", borderRadius: "var(--radius-sm)", border: "1px solid #CBD5E1", fontSize: "0.8rem", display: "grid", gap: "0.4rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748B" }}>Gross Requested:</span>
                          <strong>₹{withdrawAmountInr.toFixed(2)}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#DC2626" }}>
                          <span>TDS Withholding (1% u/s 194C/194J):</span>
                          <span>-₹{(withdrawAmountInr * 0.01).toFixed(2)}</span>
                        </div>
                        <div style={{ borderBlockStart: "1px dashed #CBD5E1", paddingBlockStart: "0.35rem", display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: 700, color: "var(--royal-purple)" }}>
                          <span>Net Direct Bank Credit:</span>
                          <span>₹{(withdrawAmountInr * 0.99).toFixed(2)}</span>
                        </div>
                      </div>

                      <p style={{ fontSize: "0.72rem", color: "var(--ink-subtle)", margin: 0 }}>
                        Funds are atomically reserved upon submission to prevent double-spending and will be disbursed to your verified bank account via IMPS.
                      </p>

                      <div style={{ display: "flex", gap: "0.5rem", marginBlockStart: "0.5rem" }}>
                        <button type="submit" className="btn btn-gold btn-sm" style={{ flex: 1 }}>Confirm Payout Request</button>
                        <button type="button" onClick={() => setWithdrawModalOpen(false)} className="btn btn-outline btn-sm">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ONBOARDING REGISTRATION FORM (When not a partner or applied) */
            <div className="surface-card" style={{ padding: "2rem" }}>
              <div style={{ textAlign: "center", marginBlockEnd: "2rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--saffron)", textTransform: "uppercase" }}>
                  NAMH ASTRO PARTNER ONBOARDING
                </span>
                <h1 className="serif-heading" style={{ fontSize: "2.2rem", color: "var(--royal-purple)", marginBlock: "0.3rem" }}>
                  Join India&apos;s Most Trusted Vedic Marketplace
                </h1>
                <p style={{ color: "var(--ink-subtle)", maxInlineSize: "36rem", margin: "0 auto", fontSize: "0.95rem" }}>
                  Connect with thousands of devotees worldwide for daily Chat, Audio Calls, and HD Video Consultations.
                  Transparent earnings, automated payouts, and zero listing fees.
                </p>
              </div>

              <form onSubmit={submitApplication} style={{ display: "grid", gap: "1.5rem", maxInlineSize: "44rem", margin: "0 auto" }}>
                <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))" }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Full Name</label>
                    <input className="form-input" value={onboardingData.fullName} onChange={(e) => setOnboardingData({ ...onboardingData, fullName: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Professional Display Name</label>
                    <input className="form-input" value={onboardingData.displayName} placeholder="e.g. Acharya Somnath" onChange={(e) => setOnboardingData({ ...onboardingData, displayName: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Email Address</label>
                    <input type="email" className="form-input" value={onboardingData.email} onChange={(e) => setOnboardingData({ ...onboardingData, email: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Mobile Number</label>
                    <input className="form-input" value={onboardingData.phoneE164} placeholder="+91 9876543210" onChange={(e) => setOnboardingData({ ...onboardingData, phoneE164: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Experience in Years</label>
                    <input type="number" min="1" max="60" className="form-input" value={onboardingData.experienceYears} onChange={(e) => setOnboardingData({ ...onboardingData, experienceYears: Number(e.target.value) })} required />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Qualifications</label>
                    <input className="form-input" value={onboardingData.qualifications} placeholder="e.g. Acharya in Jyotish" onChange={(e) => setOnboardingData({ ...onboardingData, qualifications: e.target.value })} required />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Professional Biography</label>
                  <textarea className="form-input" rows={3} value={onboardingData.bio} onChange={(e) => setOnboardingData({ ...onboardingData, bio: e.target.value })} required />
                </div>

                <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 12rem), 1fr))" }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Proposed Chat Rate (₹/min)</label>
                    <input type="number" min="1" className="form-input" value={onboardingData.proposedChatRatePaise / 100} onChange={(e) => setOnboardingData({ ...onboardingData, proposedChatRatePaise: Number(e.target.value) * 100 })} required />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Proposed Audio Rate (₹/min)</label>
                    <input type="number" min="1" className="form-input" value={onboardingData.proposedAudioRatePaise / 100} onChange={(e) => setOnboardingData({ ...onboardingData, proposedAudioRatePaise: Number(e.target.value) * 100 })} required />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600 }}>Proposed Video Rate (₹/min)</label>
                    <input type="number" min="1" className="form-input" value={onboardingData.proposedVideoRatePaise / 100} onChange={(e) => setOnboardingData({ ...onboardingData, proposedVideoRatePaise: Number(e.target.value) * 100 })} required />
                  </div>
                </div>

                <div style={{ textAlign: "center", marginBlockStart: "1rem" }}>
                  <button type="submit" className="btn btn-purple btn-lg" disabled={loading}>
                    {loading ? "Submitting Application..." : "Submit Partner Application"}
                  </button>
                  <p style={{ fontSize: "0.78rem", color: "var(--ink-subtle)", marginBlockStart: "0.5rem" }}>
                    By applying, you agree to NAMH ASTRO&apos;s Astrologer Code of Ethics and KYC terms.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* INCOMING CALL MODAL (30s SLA WITH RINGTONE & CONTROLS)   */}
        {/* ======================================================== */}
        {incomingCall && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "var(--deep-plum)",
                border: "2px solid var(--champagne-gold)",
                borderRadius: "1.25rem",
                padding: "2rem",
                maxWidth: "28rem",
                width: "100%",
                color: "#FFFFFF",
                textAlign: "center",
                boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                position: "relative",
              }}
            >
              {/* Pulsing Aura Badge */}
              <div
                style={{
                  width: "5rem",
                  height: "5rem",
                  borderRadius: "50%",
                  backgroundColor: "rgba(212,168,79,0.25)",
                  color: "var(--champagne-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem",
                  animation: "pulse 1.5s infinite ease-in-out",
                  border: "2px solid var(--champagne-gold)",
                }}
              >
                {incomingCall.type === "VIDEO" ? (
                  <Video size={36} color="var(--champagne-gold)" />
                ) : (
                  <PhoneCall size={36} color="var(--champagne-gold)" />
                )}
              </div>

              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "var(--champagne-gold)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Incoming {incomingCall.type} Consultation
              </span>

              <h2 style={{ fontSize: "1.6rem", margin: "0.3rem 0", color: "#FFFFFF" }}>
                {incomingCall.customerName}
              </h2>

              <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#F3E8FF" }}>
                Concern: <strong>{incomingCall.concern}</strong> · Rate: ₹{(incomingCall.ratePaisePerMinute / 100).toFixed(2)}/min
              </p>

              {/* 30s SLA Progress Indicator */}
              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.12)",
                  borderRadius: "9999px",
                  padding: "0.35rem 0.85rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#FDE047",
                  marginBottom: "1.75rem",
                }}
              >
                <Clock size={15} />
                <span>Expires in {incomingCall.timeoutSeconds}s</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <button
                  type="button"
                  onClick={declineIncomingCall}
                  style={{
                    flex: 1,
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    padding: "0.85rem 1rem",
                    borderRadius: "0.75rem",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                  }}
                >
                  <PhoneOff size={18} /> Decline
                </button>

                <button
                  type="button"
                  onClick={acceptIncomingCall}
                  style={{
                    flex: 1.2,
                    backgroundColor: "#16A34A",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    padding: "0.85rem 1rem",
                    borderRadius: "0.75rem",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    boxShadow: "0 4px 14px rgba(22,163,74,0.4)",
                  }}
                >
                  <PhoneCall size={18} /> Accept Call
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <MobileBottomNav />
    </>
  );
}

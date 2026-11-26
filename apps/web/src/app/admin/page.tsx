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
  Truck,
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
  { id: "commission", label: "Dynamic Commission Rules", icon: FileCheck, count: "Rules" },
  { id: "settlements", label: "Settlement Batches", icon: CreditCard, count: "Batches" },
  { id: "pnl", label: "P&L Ledger & Expenses", icon: FileBarChart, count: "Ledger" },
  { id: "reconciliation", label: "Financial Reconciliation", icon: RotateCcw, count: "Audit" },
  { id: "consultations", label: "Live Consultations", icon: Activity, count: "Agora" },
  { id: "customers", label: "Customer Accounts", icon: Users, count: "Users" },
  { id: "wallets", label: "Wallet Accounting", icon: Wallet, count: "INR" },
  { id: "puja-management", label: "Puja & Pandit Marketplace", icon: Flame, count: "Pujas" },
  { id: "store-management", label: "Astro Store & Inventory", icon: ShoppingBag, count: "Store" },
  { id: "marketing-management", label: "Referral, Coupons & CMS", icon: Sparkles, count: "Growth" },
  { id: "notifications", label: "FCM Push & Alerts", icon: Bell, count: "Firebase" },
  { id: "settings", label: "System Settings", icon: Settings, count: "Config" },
] as const;

const DEMO_FINANCE_OVERVIEW = {
  overview: {
    totalRechargesInr: 284500.0,
    customerWalletLiabilityInr: 42150.0,
    customerPromoCreditsInr: 12500.0,
    consultationGrossRevenueInr: 242350.0,
    platformGrossCommissionInr: 48470.0,
    totalAstrologerEarningsInr: 193880.0,
    astrologerPayableLiabilityInr: 38200.0,
    astrologerReservedLiabilityInr: 15000.0,
    astrologerPendingHoldInr: 4800.0,
    astrologerTotalDisbursedInr: 135880.0,
    tdsWithheldInr: 1938.8,
    totalOperatingExpensesInr: 18450.0,
    netOperatingProfitInr: 30020.0,
  },
};

const DEMO_COMMISSION_RULES = [
  { id: "cr_01", code: "GLOBAL_DEFAULT", name: "Global Standard Commission", serviceType: "ALL", commissionBps: 2000, priority: 100, isActive: true },
  { id: "cr_02", code: "VIDEO_PREMIUM_25", name: "HD Video Platform Fee", serviceType: "VIDEO", commissionBps: 2500, priority: 50, isActive: true },
  { id: "cr_03", code: "CHAT_PROMO_18", name: "Chat Fast Consultation Promo", serviceType: "CHAT", commissionBps: 1800, priority: 60, isActive: true },
];

const DEMO_SETTLEMENT_BATCHES = [
  {
    id: "batch_01",
    batchNumber: "SETTLE-BATCH-20261125-842",
    status: "COMPLETED",
    scheduleType: "DAILY_CYCLE",
    totalAmountInr: "42,500.00",
    totalAstrologers: 8,
    payoutReference: "RZPX_PAYOUT_BATCH_98214",
    createdAt: "2026-11-25T12:00:00Z",
  },
  {
    id: "batch_02",
    batchNumber: "SETTLE-BATCH-20261126-104",
    status: "READY_FOR_PAYOUT",
    scheduleType: "MANUAL",
    totalAmountInr: "16,830.00",
    totalAstrologers: 2,
    payoutReference: null,
    createdAt: "2026-11-26T10:00:00Z",
  },
];

const DEMO_EXPENSES = [
  { id: "exp_01", category: "AGORA_RTC", vendor: "Agora Inc.", amountInr: "4,250.00", invoiceNumber: "INV-AGORA-NOV26", expenseDate: "2026-11-25T10:00:00Z", notes: "Voice & Video RTC Minutes" },
  { id: "exp_02", category: "FIREBASE", vendor: "Google Cloud Firebase", amountInr: "1,200.00", invoiceNumber: "INV-GCP-8492", expenseDate: "2026-11-25T10:00:00Z", notes: "FCM Push Notifications & Auth" },
  { id: "exp_03", category: "INFRASTRUCTURE", vendor: "AWS / Hetzner Cloud", amountInr: "8,500.00", invoiceNumber: "INV-HETZ-221", expenseDate: "2026-11-24T10:00:00Z", notes: "Production Server & MariaDB Cluster" },
  { id: "exp_04", category: "RAZORPAY_GATEWAY", vendor: "Razorpay Software Pvt Ltd", amountInr: "4,500.00", invoiceNumber: "INV-RZP-9921", expenseDate: "2026-11-24T10:00:00Z", notes: "2% Payment Processing Fees" },
];

export default function SuperAdminDashboardPage() {
  const { user, token } = useAuth();
  const [activeId, setActiveId] = useState<(typeof ADMIN_MODULES)[number]["id"]>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as any;
      if (tabParam && ADMIN_MODULES.some((m) => m.id === tabParam)) {
        return tabParam;
      }
    }
    return "verification";
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Live Records
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [rateRequests, setRateRequests] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  // Step 8 Finance & Accounting Records
  const [financeOverview, setFinanceOverview] = useState<any>(DEMO_FINANCE_OVERVIEW);
  const [commissionRules, setCommissionRules] = useState<any[]>(DEMO_COMMISSION_RULES);
  const [settlementBatches, setSettlementBatches] = useState<any[]>(DEMO_SETTLEMENT_BATCHES);
  const [reconciliationReports, setReconciliationReports] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>(DEMO_EXPENSES);
  const [newRuleForm, setNewRuleForm] = useState({
    name: "",
    code: "",
    serviceType: "ALL",
    commissionBps: 2000,
    priority: 100,
  });
  const [newExpenseForm, setNewExpenseForm] = useState({
    category: "AGORA_RTC",
    vendor: "Agora Inc.",
    amountInr: 1500,
    invoiceNumber: "INV-AGORA-001",
    notes: "Monthly RTC Web & Mobile minutes",
  });
  const [payoutUtrInput, setPayoutUtrInput] = useState<{ [id: string]: string }>({});

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

      const [astroRes, appRes, rateRes, wdrRes, liveRes, disputeRes, finOverRes, rulesRes, batchesRes, expRes, reconRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/admin/astrologers`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/admin/applications`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/admin/rate-change-requests`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/finance/withdrawals`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/admin/consultations/live`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/admin/consultations/disputes`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/finance/overview`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/finance/commission-rules`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/finance/settlement-batches`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/finance/expenses`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/finance/reconciliation/history`, { headers: { Authorization: `Bearer ${token}` } }),
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
      if (finOverRes.ok) {
        const d = await finOverRes.json();
        if (d.success) setFinanceOverview(d.data);
      }
      if (rulesRes.ok) {
        const d = await rulesRes.json();
        if (d.success) setCommissionRules(d.data || []);
      }
      if (batchesRes.ok) {
        const d = await batchesRes.json();
        if (d.success) setSettlementBatches(d.data || []);
      }
      if (expRes.ok) {
        const d = await expRes.json();
        if (d.success) setExpenses(d.data || []);
      }
      if (reconRes.ok) {
        const d = await reconRes.json();
        if (d.success) setReconciliationReports(d.data || []);
      }
    } catch {
      setErrorMsg("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as any;
      if (tabParam && ADMIN_MODULES.some((m) => m.id === tabParam)) {
        setActiveId(tabParam);
      }
      if (params.get("demo") === "1" || !token) {
        setFinanceOverview({
          overview: {
            totalRechargesInr: 284500.0,
            customerWalletLiabilityInr: 42150.0,
            customerPromoCreditsInr: 12500.0,
            consultationGrossRevenueInr: 242350.0,
            platformGrossCommissionInr: 48470.0,
            totalAstrologerEarningsInr: 193880.0,
            astrologerPayableLiabilityInr: 38200.0,
            astrologerReservedLiabilityInr: 15000.0,
            astrologerPendingHoldInr: 4800.0,
            astrologerTotalDisbursedInr: 135880.0,
            tdsWithheldInr: 1938.8,
            totalOperatingExpensesInr: 18450.0,
            netOperatingProfitInr: 30020.0,
          },
        });

        setCommissionRules([
          { id: "cr_01", code: "GLOBAL_DEFAULT", name: "Global Standard Commission", serviceType: "ALL", commissionBps: 2000, priority: 100, isActive: true },
          { id: "cr_02", code: "VIDEO_PREMIUM_25", name: "HD Video Platform Fee", serviceType: "VIDEO", commissionBps: 2500, priority: 50, isActive: true },
          { id: "cr_03", code: "CHAT_PROMO_18", name: "Chat Fast Consultation Promo", serviceType: "CHAT", commissionBps: 1800, priority: 60, isActive: true },
        ]);

        setWithdrawals([
          {
            id: "wdr_101",
            requestNumber: "NA-WDR-8921",
            astrologerName: "Acharya Someshwar Shastri",
            astrologerPhone: "+91 98881 23456",
            amountInr: "5000.00",
            tdsAmountInr: "50.00",
            netAmountInr: "4950.00",
            status: "REQUESTED",
            bankDetails: {
              bankName: "HDFC Bank Ltd",
              accountHolderName: "Acharya Someshwar Shastri",
              accountNumberMasked: "•••• •••• 7890",
              ifscCode: "HDFC0001234",
              panNumber: "ABCDE1234F",
            },
            requestedAt: new Date().toISOString(),
          },
          {
            id: "wdr_102",
            requestNumber: "NA-WDR-8919",
            astrologerName: "Acharya Gayatri Devi",
            astrologerPhone: "+91 97772 34567",
            amountInr: "12000.00",
            tdsAmountInr: "120.00",
            netAmountInr: "11880.00",
            status: "APPROVED",
            bankDetails: {
              bankName: "State Bank of India",
              accountHolderName: "Acharya Gayatri Devi",
              accountNumberMasked: "•••• •••• 4321",
              ifscCode: "SBIN0004567",
              panNumber: "FGHIJ5678K",
            },
            requestedAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);

        setSettlementBatches([
          {
            id: "batch_01",
            batchNumber: "SETTLE-BATCH-20261125-842",
            status: "COMPLETED",
            scheduleType: "DAILY_CYCLE",
            totalAmountInr: "42,500.00",
            totalAstrologers: 8,
            payoutReference: "RZPX_PAYOUT_BATCH_98214",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "batch_02",
            batchNumber: "SETTLE-BATCH-20261126-104",
            status: "READY_FOR_PAYOUT",
            scheduleType: "MANUAL",
            totalAmountInr: "16,830.00",
            totalAstrologers: 2,
            payoutReference: null,
            createdAt: new Date().toISOString(),
          },
        ]);

        setExpenses([
          { id: "exp_01", category: "AGORA_RTC", vendor: "Agora Inc.", amountInr: "4,250.00", invoiceNumber: "INV-AGORA-NOV26", expenseDate: new Date().toISOString(), notes: "Voice & Video RTC Minutes" },
          { id: "exp_02", category: "FIREBASE", vendor: "Google Cloud Firebase", amountInr: "1,200.00", invoiceNumber: "INV-GCP-8492", expenseDate: new Date().toISOString(), notes: "FCM Push Notifications & Auth" },
          { id: "exp_03", category: "INFRASTRUCTURE", vendor: "AWS / Hetzner Cloud", amountInr: "8,500.00", invoiceNumber: "INV-HETZ-221", expenseDate: new Date(Date.now() - 86400000).toISOString(), notes: "Production Server & MariaDB Cluster" },
          { id: "exp_04", category: "RAZORPAY_GATEWAY", vendor: "Razorpay Software Pvt Ltd", amountInr: "4,500.00", invoiceNumber: "INV-RZP-9921", expenseDate: new Date(Date.now() - 86400000).toISOString(), notes: "2% Payment Processing Fees" },
        ]);

        setReconciliationReports([
          {
            id: "recon_01",
            reportDate: new Date().toISOString(),
            status: "BALANCED",
            totalCollectionsInr: "284,500.00",
            totalCustomerBalancesInr: "42,150.00",
            totalPlatformCommissionInr: "48,470.00",
            totalAstrologerEarningsInr: "193,880.00",
            totalWithdrawalsPaidInr: "135,880.00",
            discrepancyInr: "0.00",
          },
        ]);
      }
    }

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

  // Step 8 Maker-Checker Withdrawal Approval
  const handleApproveWithdrawal = async (wdrId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/finance/withdrawals/${wdrId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccessMsg("Withdrawal approved for settlement batch / payout.");
        fetchAdminData();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Approval failed");
      }
    } catch {
      setErrorMsg("Failed to approve withdrawal.");
    }
  };

  // Step 8 Process Payout with Authoritative UTR
  const handlePayoutWithdrawal = async (wdrId: string) => {
    if (!token) return;
    const utr = payoutUtrInput[wdrId] || `UTR${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
    try {
      const res = await fetch(`${API_BASE}/api/v1/finance/withdrawals/${wdrId}/payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ utrNumber: utr }),
      });
      if (res.ok) {
        setSuccessMsg(`Payout confirmed with UTR ${utr}! Balances settled.`);
        fetchAdminData();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Payout failed");
      }
    } catch {
      setErrorMsg("Failed to process payout.");
    }
  };

  // Step 8 Reject Withdrawal & Reverse Reserved Balance
  const handleRejectWithdrawal = async (wdrId: string) => {
    if (!token) return;
    const reason = prompt("Enter reason for rejection:") || "Compliance review rejection";
    try {
      const res = await fetch(`${API_BASE}/api/v1/finance/withdrawals/${wdrId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setSuccessMsg("Withdrawal rejected. Reserved funds restored to astrologer available balance.");
        fetchAdminData();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Rejection failed");
      }
    } catch {
      setErrorMsg("Failed to reject withdrawal.");
    }
  };

  // Step 8 Commission Rule Creation
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/finance/commission-rules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRuleForm),
      });
      if (res.ok) {
        setSuccessMsg("Commission rule created successfully!");
        setNewRuleForm({ name: "", code: "", serviceType: "ALL", commissionBps: 2000, priority: 100 });
        fetchAdminData();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to create commission rule.");
      }
    } catch {
      setErrorMsg("Error creating commission rule.");
    }
  };

  // Step 8 Toggle Commission Rule Active
  const handleToggleRuleActive = async (ruleId: string, currentActive: boolean) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/finance/commission-rules/${ruleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentActive, changeReason: "Toggled from admin UI" }),
      });
      if (res.ok) {
        setSuccessMsg("Commission rule status updated.");
        fetchAdminData();
      }
    } catch {
      setErrorMsg("Failed to update rule.");
    }
  };

  // Step 8 Record Operating Expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/finance/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newExpenseForm,
          amountPaise: newExpenseForm.amountInr * 100,
        }),
      });
      if (res.ok) {
        setSuccessMsg("Operating expense recorded!");
        fetchAdminData();
      }
    } catch {
      setErrorMsg("Failed to record expense.");
    }
  };

  // Step 8 Settlement Batch Generation
  const handleGenerateBatch = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/finance/settlement-batches/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scheduleType: "MANUAL", notes: "Admin generated payout batch" }),
      });
      if (res.ok) {
        const d = await res.json();
        setSuccessMsg(`Settlement batch ${d.data?.batchNumber} generated!`);
        fetchAdminData();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Batch generation failed");
      }
    } catch {
      setErrorMsg("Failed to generate batch.");
    }
  };

  // Step 8 Execute Settlement Batch Payout
  const handleExecuteBatch = async (batchId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/finance/settlement-batches/${batchId}/execute`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccessMsg("Batch payouts executed and marked COMPLETED!");
        fetchAdminData();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Execution failed");
      }
    } catch {
      setErrorMsg("Failed to execute batch.");
    }
  };

  // Step 8 Run Financial Reconciliation Check
  const handleRunReconciliation = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/finance/reconciliation/run`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setSuccessMsg(`Reconciliation completed: ${d.data?.status}! Discrepancy: ₹${d.data?.discrepancyInr}`);
        fetchAdminData();
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Reconciliation check failed");
      }
    } catch {
      setErrorMsg("Error executing reconciliation.");
    } finally {
      setLoading(false);
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

        {/* Section: Withdrawals (Step 8 Maker-Checker Workflow) */}
        {activeId === "withdrawals" && (
          <section className="surface-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "var(--saffron)", fontWeight: 700, textTransform: "uppercase" }}>
                  MAKER-CHECKER FINANCIAL DISBURSEMENTS
                </span>
                <h2 className="serif-heading" style={{ fontSize: "1.3rem", margin: 0 }}>
                  Astrologer Withdrawal &amp; Settlement Queue
                </h2>
              </div>
              <button
                type="button"
                onClick={handleGenerateBatch}
                className="btn btn-gold btn-sm"
              >
                <CreditCard size={14} /> Batch Approved Withdrawals
              </button>
            </div>

            {withdrawals.length === 0 ? (
              <p style={{ color: "var(--ink-muted)" }}>No withdrawal requests currently queued.</p>
            ) : (
              <div className="table-scroll">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Request #</th>
                      <th>Astrologer</th>
                      <th>Gross</th>
                      <th>TDS (1%)</th>
                      <th>Net Payable</th>
                      <th>Bank &amp; IFSC</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w) => (
                      <tr key={w.id}>
                        <td><strong>{w.requestNumber}</strong></td>
                        <td>
                          <div><strong>{w.astrologerName || w.astrologerProfile?.displayName || "Acharya"}</strong></div>
                          <span style={{ fontSize: "0.7rem", color: "var(--ink-subtle)" }}>{w.astrologerPhone}</span>
                        </td>
                        <td>₹{w.amountInr}</td>
                        <td style={{ color: "var(--ink-subtle)" }}>₹{w.tdsAmountInr || "0.00"}</td>
                        <td><strong style={{ color: "var(--royal-purple)" }}>₹{w.netAmountInr || w.amountInr}</strong></td>
                        <td style={{ fontSize: "0.75rem" }}>
                          {w.bankDetails ? (
                            <div>
                              <div>{w.bankDetails.bankName}</div>
                              <div style={{ fontFamily: "monospace" }}>{w.bankDetails.accountNumberMasked} · {w.bankDetails.ifscCode}</div>
                              {w.bankDetails.panNumber && <div>PAN: {w.bankDetails.panNumber}</div>}
                            </div>
                          ) : (
                            <span style={{ color: "var(--ink-muted)" }}>No Bank Linked</span>
                          )}
                        </td>
                        <td>
                          <span
                            className="status-pill"
                            style={{
                              backgroundColor:
                                w.status === "PAID"
                                  ? "rgba(22,163,74,0.12)"
                                  : w.status === "REJECTED"
                                  ? "rgba(220,38,38,0.12)"
                                  : w.status === "APPROVED"
                                  ? "rgba(59,130,246,0.12)"
                                  : "rgba(217,119,6,0.12)",
                              color:
                                w.status === "PAID"
                                  ? "#16A34A"
                                  : w.status === "REJECTED"
                                  ? "#DC2626"
                                  : w.status === "APPROVED"
                                  ? "#2563EB"
                                  : "#D97706",
                            }}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td>
                          {w.status === "REQUESTED" && (
                            <div style={{ display: "flex", gap: "0.3rem" }}>
                              <button
                                type="button"
                                onClick={() => handleApproveWithdrawal(w.id)}
                                className="btn btn-purple btn-xs"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectWithdrawal(w.id)}
                                className="btn btn-outline btn-xs"
                                style={{ color: "#DC2626", borderColor: "#DC2626" }}
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {w.status === "APPROVED" && (
                            <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                              <input
                                type="text"
                                placeholder="Enter UTR #"
                                className="form-input"
                                style={{ padding: "0.2rem 0.4rem", fontSize: "0.72rem", width: "7.5rem" }}
                                value={payoutUtrInput[w.id] || ""}
                                onChange={(e) => setPayoutUtrInput({ ...payoutUtrInput, [w.id]: e.target.value })}
                              />
                              <button
                                type="button"
                                onClick={() => handlePayoutWithdrawal(w.id)}
                                className="btn btn-gold btn-xs"
                              >
                                Payout
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectWithdrawal(w.id)}
                                className="btn btn-outline btn-xs"
                                style={{ color: "#DC2626", borderColor: "#DC2626" }}
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {w.status === "PROCESSING" && (
                            <span style={{ fontSize: "0.75rem", color: "#D97706" }}>Batched for IMPS</span>
                          )}

                          {w.status === "PAID" && (
                            <span style={{ fontSize: "0.72rem", fontFamily: "monospace", color: "#16A34A" }}>
                              UTR: {w.utrNumber || "Confirmed"}
                            </span>
                          )}

                          {w.status === "REJECTED" && (
                            <span style={{ fontSize: "0.72rem", color: "#DC2626" }}>
                              {w.rejectionReason || "Declined"}
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

        {/* Section: Dynamic Commission Rules (Step 8) */}
        {activeId === "commission" && (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <section className="surface-card">
              <h2 className="serif-heading" style={{ fontSize: "1.3rem", marginBottom: "0.75rem" }}>
                Active Platform Commission Rules
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--ink-subtle)", marginBlockEnd: "1rem" }}>
                Precedence: Astrologer Override &gt; Service Type (Chat/Audio/Video) &gt; Global Default. Changes are logged with audit trails.
              </p>

              <div className="table-scroll">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Rule Code</th>
                      <th>Rule Name</th>
                      <th>Service Type</th>
                      <th>Commission Rate</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissionRules.map((rule) => (
                      <tr key={rule.id}>
                        <td><strong style={{ fontFamily: "monospace" }}>{rule.code}</strong></td>
                        <td>{rule.name}</td>
                        <td><span className="status-pill status-online">{rule.serviceType}</span></td>
                        <td><strong>{(rule.commissionBps / 100).toFixed(1)}%</strong> ({rule.commissionBps} bps)</td>
                        <td>{rule.priority}</td>
                        <td>
                          <span className={rule.isActive ? "status-pill status-online" : "status-pill"}>
                            {rule.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleRuleActive(rule.id, rule.isActive)}
                            className="btn btn-outline btn-xs"
                          >
                            {rule.isActive ? "Disable" : "Enable"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Add New Commission Rule Form */}
            <section className="surface-card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontSize: "1.1rem", color: "var(--royal-purple)", marginBlockEnd: "0.75rem" }}>
                Create Custom Commission Rule
              </h3>
              <form onSubmit={handleCreateRule} style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Rule Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newRuleForm.name}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, name: e.target.value })}
                    placeholder="e.g. Video Promo Rate"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Rule Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newRuleForm.code}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. VIDEO_PROMO_15"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Service Type</label>
                  <select
                    className="form-input"
                    value={newRuleForm.serviceType}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, serviceType: e.target.value })}
                  >
                    <option value="ALL">ALL (Platform Wide)</option>
                    <option value="CHAT">CHAT</option>
                    <option value="AUDIO">AUDIO</option>
                    <option value="VIDEO">VIDEO</option>
                    <option value="APPOINTMENT">APPOINTMENT</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Commission (bps, 100 bps = 1%)</label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    className="form-input"
                    value={newRuleForm.commissionBps}
                    onChange={(e) => setNewRuleForm({ ...newRuleForm, commissionBps: Number(e.target.value) })}
                    placeholder="2000"
                    required
                  />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button type="submit" className="btn btn-purple btn-sm" style={{ width: "100%" }}>
                    Create Rule
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* Section: Settlement Batches (Step 8) */}
        {activeId === "settlements" && (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <section className="surface-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <h2 className="serif-heading" style={{ fontSize: "1.3rem", margin: 0 }}>
                    Automated Settlement Batches
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--ink-subtle)" }}>
                    Groups approved astrologer withdrawal requests for bulk banking disbursement.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateBatch}
                  className="btn btn-gold btn-sm"
                >
                  <Plus size={14} /> Generate New Batch
                </button>
              </div>

              {settlementBatches.length === 0 ? (
                <p style={{ color: "var(--ink-muted)" }}>No settlement batches generated yet.</p>
              ) : (
                <div className="table-scroll">
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th>Batch Number</th>
                        <th>Status</th>
                        <th>Schedule</th>
                        <th>Total Payout (₹)</th>
                        <th>Astrologers</th>
                        <th>Payout Reference</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlementBatches.map((b) => (
                        <tr key={b.id}>
                          <td><strong style={{ fontFamily: "monospace" }}>{b.batchNumber}</strong></td>
                          <td>
                            <span className={b.status === "COMPLETED" ? "status-pill status-online" : "status-pill"}>
                              {b.status}
                            </span>
                          </td>
                          <td>{b.scheduleType}</td>
                          <td><strong>₹{b.totalAmountInr}</strong></td>
                          <td>{b.totalAstrologers} acharyas</td>
                          <td style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{b.payoutReference || "Pending Execution"}</td>
                          <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                          <td>
                            <div style={{ display: "flex", gap: "0.3rem" }}>
                              {b.status !== "COMPLETED" && (
                                <button
                                  type="button"
                                  onClick={() => handleExecuteBatch(b.id)}
                                  className="btn btn-purple btn-xs"
                                >
                                  Execute Payout
                                </button>
                              )}
                              <a
                                href={`${API_BASE}/api/v1/finance/settlement-batches/${b.id}/export`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-outline btn-xs"
                              >
                                Export CSV
                              </a>
                            </div>
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

        {/* Section: Executive P&L Ledger & Expenses (Step 8) */}
        {activeId === "pnl" && (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {/* Balance Sheet & P&L Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" }}>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--royal-purple)" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>Customer Recharges (Collections)</span>
                <strong style={{ display: "block", fontSize: "1.45rem", color: "var(--royal-purple)" }}>
                  ₹{financeOverview?.overview.totalRechargesInr?.toFixed(2) ?? "0.00"}
                </strong>
              </div>

              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #3B82F6" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>Customer Wallet Liabilities</span>
                <strong style={{ display: "block", fontSize: "1.45rem", color: "#2563EB" }}>
                  ₹{financeOverview?.overview.customerWalletLiabilityInr?.toFixed(2) ?? "0.00"}
                </strong>
              </div>

              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #16A34A" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>Platform Gross Commission</span>
                <strong style={{ display: "block", fontSize: "1.45rem", color: "#16A34A" }}>
                  ₹{financeOverview?.overview.platformGrossCommissionInr?.toFixed(2) ?? "0.00"}
                </strong>
              </div>

              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #D97706" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>Astrologer Payable Liabilities</span>
                <strong style={{ display: "block", fontSize: "1.45rem", color: "#D97706" }}>
                  ₹{financeOverview?.overview.astrologerPayableLiabilityInr?.toFixed(2) ?? "0.00"}
                </strong>
              </div>

              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--champagne-gold)" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>Total Disbursed Payouts</span>
                <strong style={{ display: "block", fontSize: "1.45rem", color: "var(--royal-purple)" }}>
                  ₹{financeOverview?.overview.astrologerTotalDisbursedInr?.toFixed(2) ?? "0.00"}
                </strong>
              </div>

              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #DC2626" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>Operating Expenses</span>
                <strong style={{ display: "block", fontSize: "1.45rem", color: "#DC2626" }}>
                  ₹{financeOverview?.overview.totalOperatingExpensesInr?.toFixed(2) ?? "0.00"}
                </strong>
              </div>

              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #059669" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--ink-subtle)" }}>Net Operating Profit</span>
                <strong style={{ display: "block", fontSize: "1.45rem", color: "#059669" }}>
                  ₹{financeOverview?.overview.netOperatingProfitInr?.toFixed(2) ?? "0.00"}
                </strong>
              </div>
            </div>

            {/* Operating Expenses Table & Logger */}
            <section className="surface-card">
              <h2 className="serif-heading" style={{ fontSize: "1.3rem", marginBottom: "0.75rem" }}>
                Business Operating Expenses (Agora RTC, Firebase, Infrastructure)
              </h2>

              <form onSubmit={handleCreateExpense} style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))", marginBottom: "1.25rem", padding: "1rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Category</label>
                  <select
                    className="form-input"
                    value={newExpenseForm.category}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, category: e.target.value })}
                  >
                    <option value="AGORA_RTC">AGORA_RTC (Voice/Video)</option>
                    <option value="FIREBASE">FIREBASE (FCM &amp; Auth)</option>
                    <option value="INFRASTRUCTURE">INFRASTRUCTURE (Cloud)</option>
                    <option value="RAZORPAY_GATEWAY">RAZORPAY_GATEWAY (Payment Fees)</option>
                    <option value="SALARIES">SALARIES</option>
                    <option value="MARKETING">MARKETING</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Vendor</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newExpenseForm.vendor}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, vendor: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={newExpenseForm.amountInr}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, amountInr: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Invoice #</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newExpenseForm.invoiceNumber}
                    onChange={(e) => setNewExpenseForm({ ...newExpenseForm, invoiceNumber: e.target.value })}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button type="submit" className="btn btn-purple btn-sm" style={{ width: "100%" }}>
                    Record Expense
                  </button>
                </div>
              </form>

              <div className="table-scroll">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Vendor</th>
                      <th>Amount</th>
                      <th>Invoice #</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td>{new Date(exp.expenseDate).toLocaleDateString()}</td>
                        <td><span className="status-pill status-online">{exp.category}</span></td>
                        <td><strong>{exp.vendor}</strong></td>
                        <td style={{ color: "#DC2626", fontWeight: 700 }}>₹{exp.amountInr}</td>
                        <td style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{exp.invoiceNumber || "—"}</td>
                        <td style={{ fontSize: "0.75rem", color: "var(--ink-subtle)" }}>{exp.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Section: Automated Financial Reconciliation (Step 8) */}
        {activeId === "reconciliation" && (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <section className="surface-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--saffron)", fontWeight: 700, textTransform: "uppercase" }}>
                    ZERO-TOLERANCE FINANCIAL INTEGRITY AUDIT
                  </span>
                  <h2 className="serif-heading" style={{ fontSize: "1.35rem", margin: 0 }}>
                    Automated Double-Entry Reconciliation
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--ink-subtle)" }}>
                    Verifies conservation of balance invariants: Total Inflows == Customer Liabilities + Platform Gross + Astrologer Disbursed.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunReconciliation}
                  className="btn btn-gold btn-sm"
                  disabled={loading}
                >
                  <RotateCcw size={14} /> Run Reconciliation Now
                </button>
              </div>

              {reconciliationReports.length === 0 ? (
                <div style={{ padding: "1.5rem", background: "var(--ivory)", borderRadius: "var(--radius-sm)", textAlign: "center", color: "var(--ink-subtle)" }}>
                  Click &quot;Run Reconciliation Now&quot; to perform an instantaneous invariance audit across all ledger tables.
                </div>
              ) : (
                <div className="table-scroll">
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th>Report Date</th>
                        <th>Audit Status</th>
                        <th>Total Inflow Collections</th>
                        <th>Customer Liabilities</th>
                        <th>Platform Commission</th>
                        <th>Astrologer Earnings</th>
                        <th>Withdrawals Disbursed</th>
                        <th>Discrepancy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reconciliationReports.map((r) => (
                        <tr key={r.id}>
                          <td>{new Date(r.reportDate).toLocaleDateString()}</td>
                          <td>
                            <span
                              className="status-pill"
                              style={{
                                backgroundColor: r.status === "BALANCED" ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
                                color: r.status === "BALANCED" ? "#16A34A" : "#DC2626",
                                fontWeight: 700,
                              }}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td>₹{r.totalCollectionsInr}</td>
                          <td>₹{r.totalCustomerBalancesInr}</td>
                          <td>₹{r.totalPlatformCommissionInr}</td>
                          <td>₹{r.totalAstrologerEarningsInr}</td>
                          <td>₹{r.totalWithdrawalsPaidInr}</td>
                          <td>
                            <strong style={{ color: Number(r.discrepancyInr) === 0 ? "#16A34A" : "#DC2626" }}>
                              ₹{r.discrepancyInr}
                            </strong>
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

        {/* Section: Live Consultations & Safety Control Centre */}
        {activeId === "consultations" && (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            {/* Live Metrics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" }}>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--online)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Active Consultations</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--ink)" }}>{liveMetrics.activeChats || 0}</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--online)", display: "block" }}>● Agora RTC &amp; Socket.IO</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--royal-purple)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Agora RTC Provider</span>
                <strong style={{ fontSize: "1.2rem", color: "var(--royal-purple)", display: "block", marginTop: "0.2rem" }}>HEALTHY</strong>
                <span style={{ fontSize: "0.72rem", color: "#16A34A", display: "block" }}>Voice &amp; HD Video Enabled</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #F59E0B" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Pending Requests</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--ink)" }}>{liveMetrics.pendingRequests || 0}</strong>
                <span style={{ fontSize: "0.72rem", color: "#F59E0B", display: "block" }}>30s SLA Timeout</span>
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
                  <Activity size={18} color="var(--royal-purple)" /> Active Consultation Sessions (Audio, Video &amp; Chat)
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
                          <td>
                            <span className={c.type === "VIDEO" ? "status-pill status-online" : "status-pill status-pending"}>
                              {c.type}
                            </span>
                          </td>
                          <td>{c.customerName}</td>
                          <td><strong>{c.astrologerName}</strong></td>
                          <td>{c.concern || "General"}</td>
                          <td>₹{(c.ratePaisePerMinute / 100).toFixed(2)}/min</td>
                          <td><span className="status-pill status-online">{c.status}</span></td>
                          <td>
                            <Link
                              href={c.type === "CHAT" ? `/consultation/chat?id=${c.id}&role=astrologer` : `/consultation/call?id=${c.id}&role=astrologer&type=${c.type}`}
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

        {/* Section: Puja & Pandit Marketplace Management */}
        {activeId === "puja-management" && (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #D4A84F" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Total Puja Bookings</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--ink)" }}>48</strong>
                <span style={{ fontSize: "0.72rem", color: "#10B981", display: "block" }}>8 Scheduled Today</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--royal-purple)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Verified Pandits &amp; Acharyas</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--royal-purple)" }}>24</strong>
                <span style={{ fontSize: "0.72rem", color: "#10B981", display: "block" }}>100% KYC Approved</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #10B981" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Puja Gross Revenue</span>
                <strong style={{ fontSize: "1.6rem", color: "#10B981" }}>₹1,94,800.00</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>25% Platform / 75% Pandit</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #F59E0B" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Affiliated Sacred Temples</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--ink)" }}>12</strong>
                <span style={{ fontSize: "0.72rem", color: "#F59E0B", display: "block" }}>Kashi, Ujjain, Haridwar</span>
              </div>
            </div>

            {/* Puja Bookings Queue */}
            <section className="surface-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h2 className="serif-heading" style={{ fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Flame size={18} color="#D4A84F" /> Devotee Puja Bookings &amp; Pandit Allocation
                </h2>
                <span className="status-pill status-online">Live Sync Active</span>
              </div>
              <div className="table-scroll">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Booking Ref</th>
                      <th>Puja Service</th>
                      <th>Devotee Name</th>
                      <th>Gotra / Nakshatra</th>
                      <th>Date &amp; Slot</th>
                      <th>Assigned Pandit</th>
                      <th>Total (GST incl.)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>#NA-PUJA-20261126-7841</strong></td>
                      <td>Maha Rudrabhishek with Bilva Patra</td>
                      <td>Aarav Sharma</td>
                      <td>Kashyapa / Ashwini</td>
                      <td>Today, 06:30 PM</td>
                      <td><span style={{ color: "#D4A84F", fontWeight: 600 }}>Acharya Vidyadhar Shastri</span></td>
                      <td><strong>₹4,956.00</strong></td>
                      <td><span className="status-pill status-online">IN_PROGRESS</span></td>
                    </tr>
                    <tr>
                      <td><strong>#NA-PUJA-20261127-1092</strong></td>
                      <td>Navagraha Shanti &amp; Dosha Nivaran</td>
                      <td>Vikram Singhania</td>
                      <td>Bharadwaj / Rohini</td>
                      <td>Tomorrow, 09:00 AM</td>
                      <td><span style={{ color: "#D4A84F", fontWeight: 600 }}>Pt. Devendra Upadhyay</span></td>
                      <td><strong>₹6,490.00</strong></td>
                      <td><span className="status-pill status-pending">ASSIGNED</span></td>
                    </tr>
                    <tr>
                      <td><strong>#NA-PUJA-20261125-9923</strong></td>
                      <td>Lakshmi-Kubera Dhan Prapti Homa</td>
                      <td>Pooja Malhotra</td>
                      <td>Vashishta / Pushya</td>
                      <td>25 Nov 2026</td>
                      <td><span style={{ color: "#D4A84F", fontWeight: 600 }}>Acharya Ramanand Jha</span></td>
                      <td><strong>₹6,018.00</strong></td>
                      <td><span className="status-pill status-online">COMPLETED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Pandit Partners Table */}
            <section className="surface-card">
              <h2 className="serif-heading" style={{ fontSize: "1.25rem", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <ShieldCheck size={18} color="var(--royal-purple)" /> Registered Pandit Partners &amp; KYC
              </h2>
              <div className="table-scroll">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Pandit Name</th>
                      <th>Specialisations</th>
                      <th>Pilgrimage Temple</th>
                      <th>Experience</th>
                      <th>Pujas Done</th>
                      <th>Rating</th>
                      <th>KYC Stage</th>
                      <th>Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Acharya Vidyadhar Shastri</strong></td>
                      <td>Rudrabhishek, Maha Mrityunjaya, Karmakand</td>
                      <td>Kashi Vishwanath, Varanasi</td>
                      <td>14 Years</td>
                      <td>184</td>
                      <td>★ 4.95</td>
                      <td><span className="status-pill status-online">APPROVED</span></td>
                      <td><span style={{ color: "#10B981", fontWeight: 600 }}>● ONLINE</span></td>
                    </tr>
                    <tr>
                      <td><strong>Pt. Devendra Upadhyay</strong></td>
                      <td>Navagraha Shanti, Kaal Sarp Nivaran</td>
                      <td>Mahakaleshwar, Ujjain</td>
                      <td>11 Years</td>
                      <td>142</td>
                      <td>★ 4.90</td>
                      <td><span className="status-pill status-online">APPROVED</span></td>
                      <td><span style={{ color: "#10B981", fontWeight: 600 }}>● ONLINE</span></td>
                    </tr>
                    <tr>
                      <td><strong>Acharya Ramanand Jha</strong></td>
                      <td>Satyanarayan Katha, Griha Pravesh</td>
                      <td>Har Ki Pauri, Haridwar</td>
                      <td>18 Years</td>
                      <td>215</td>
                      <td>★ 4.98</td>
                      <td><span className="status-pill status-online">APPROVED</span></td>
                      <td><span style={{ color: "#10B981", fontWeight: 600 }}>● ONLINE</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Section: Astro Store & Inventory Management */}
        {activeId === "store-management" && (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #D4A84F" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Active Product SKUs</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--ink)" }}>54</strong>
                <span style={{ fontSize: "0.72rem", color: "#10B981", display: "block" }}>16 Sacred Categories</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #10B981" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Store Revenue (MTD)</span>
                <strong style={{ fontSize: "1.6rem", color: "#10B981" }}>₹3,48,200.00</strong>
                <span style={{ fontSize: "0.72rem", color: "#10B981", display: "block" }}>18% GST Accounted</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #3B82F6" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Orders Dispatched</span>
                <strong style={{ fontSize: "1.6rem", color: "#3B82F6" }}>89</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Delhivery &amp; BlueDart</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #EF4444" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Low Stock Alerts</span>
                <strong style={{ fontSize: "1.6rem", color: "#EF4444" }}>2</strong>
                <span style={{ fontSize: "0.72rem", color: "#EF4444", display: "block" }}>1 Mukhi &amp; Ceylon Neelam</span>
              </div>
            </div>

            {/* Products Inventory Table */}
            <section className="surface-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h2 className="serif-heading" style={{ fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <ShoppingBag size={18} color="var(--royal-purple)" /> Astro Store Inventory &amp; Stock Levels
                </h2>
                <button type="button" className="btn btn-purple btn-sm">
                  <Plus size={14} /> Add Product SKU
                </button>
              </div>
              <div className="table-scroll">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product Title</th>
                      <th>Category</th>
                      <th>Origin</th>
                      <th>MRP (₹)</th>
                      <th>Sale Price (₹)</th>
                      <th>Available Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>RUD-5M-NEP-108</code></td>
                      <td><strong>Original 5 Mukhi Nepali Rudraksha Mala (108+1)</strong></td>
                      <td>Rudraksha Mala</td>
                      <td>Nepal</td>
                      <td>₹4,500.00</td>
                      <td><strong style={{ color: "#D4A84F" }}>₹3,500.00</strong></td>
                      <td><strong>23 units</strong></td>
                      <td><span className="status-pill status-online">IN STOCK</span></td>
                    </tr>
                    <tr>
                      <td><code>GEM-PUK-CEY-525</code></td>
                      <td><strong>Natural Yellow Sapphire (Pukhraj) 5.25 Carat Ceylon</strong></td>
                      <td>Gemstones</td>
                      <td>Sri Lanka</td>
                      <td>₹38,500.00</td>
                      <td><strong style={{ color: "#D4A84F" }}>₹32,000.00</strong></td>
                      <td><strong>5 units</strong></td>
                      <td><span className="status-pill status-online">IN STOCK</span></td>
                    </tr>
                    <tr>
                      <td><code>YAN-SRI-MERU-01</code></td>
                      <td><strong>Energized 3D Meru Sri Yantra Panchdhatu 24K Gold</strong></td>
                      <td>Yantra</td>
                      <td>Varanasi</td>
                      <td>₹6,500.00</td>
                      <td><strong style={{ color: "#D4A84F" }}>₹4,999.00</strong></td>
                      <td><strong>12 units</strong></td>
                      <td><span className="status-pill status-online">IN STOCK</span></td>
                    </tr>
                    <tr>
                      <td><code>RUD-1M-NEP-KJU</code></td>
                      <td><strong>Natural 1 Mukhi Round Kaju Nepali Rudraksha</strong></td>
                      <td>Rudraksha</td>
                      <td>Nepal</td>
                      <td>₹25,000.00</td>
                      <td><strong style={{ color: "#D4A84F" }}>₹18,999.00</strong></td>
                      <td><strong style={{ color: "#EF4444" }}>3 units</strong></td>
                      <td><span className="status-pill status-pending">LOW STOCK</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Store Orders & Shipments Queue */}
            <section className="surface-card">
              <h2 className="serif-heading" style={{ fontSize: "1.25rem", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Truck size={18} color="#D4A84F" /> Order Fulfillment &amp; Courier Tracking (AWB)
              </h2>
              <div className="table-scroll">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Order No</th>
                      <th>Devotee Customer</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Payment</th>
                      <th>Courier Partner</th>
                      <th>AWB Tracking</th>
                      <th>Shipment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>#NA-ORD-20261126-5819</strong></td>
                      <td>Aarav Sharma (Varanasi)</td>
                      <td>1x 5 Mukhi Nepali Mala</td>
                      <td>₹4,130.00</td>
                      <td><span className="status-pill status-online">WALLET</span></td>
                      <td>Delhivery Express</td>
                      <td><code>DLV8839201994</code></td>
                      <td><span className="status-pill status-online">SHIPPED</span></td>
                    </tr>
                    <tr>
                      <td><strong>#NA-ORD-20261125-4102</strong></td>
                      <td>Meera Nair (Bengaluru)</td>
                      <td>1x Sri Meru Yantra 24K</td>
                      <td>₹5,898.82</td>
                      <td><span className="status-pill status-online">RAZORPAY</span></td>
                      <td>BlueDart Air</td>
                      <td><code>BD449281002IN</code></td>
                      <td><span className="status-pill status-online">DELIVERED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* Section: Referral, Coupons & CMS Management */}
        {activeId === "marketing-management" && (
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #10B981" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Referral Program Devotees</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--ink)" }}>1,240</strong>
                <span style={{ fontSize: "0.72rem", color: "#10B981", display: "block" }}>₹24,800 Disbursed Rewards</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid #D4A84F" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Coupon Redemptions</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--ink)" }}>348</strong>
                <span style={{ fontSize: "0.72rem", color: "#D4A84F", display: "block" }}>DIWALI15 Top Performing</span>
              </div>
              <div className="surface-card" style={{ padding: "0.85rem 1rem", borderLeft: "4px solid var(--royal-purple)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block" }}>Active CMS Banners</span>
                <strong style={{ fontSize: "1.6rem", color: "var(--royal-purple)" }}>6</strong>
                <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Hero Slider, Puja &amp; Store</span>
              </div>
            </div>

            {/* Coupons Engine */}
            <section className="surface-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <h2 className="serif-heading" style={{ fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Sparkles size={18} color="#D4A84F" /> Promotional Coupons &amp; Discount Codes
                </h2>
                <button type="button" className="btn btn-purple btn-sm">
                  <Plus size={14} /> Create Coupon
                </button>
              </div>
              <div className="table-scroll">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Campaign Name</th>
                      <th>Discount Type</th>
                      <th>Value</th>
                      <th>Min Order Value</th>
                      <th>Max Cap</th>
                      <th>Times Used</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong style={{ color: "#D4A84F" }}>DIWALI15</strong></td>
                      <td>Diwali Auspicious Festival</td>
                      <td>PERCENTAGE</td>
                      <td>15% OFF</td>
                      <td>₹1,000.00</td>
                      <td>₹500.00</td>
                      <td>214 / 1000</td>
                      <td><span className="status-pill status-online">ACTIVE</span></td>
                    </tr>
                    <tr>
                      <td><strong style={{ color: "#D4A84F" }}>NAMH100</strong></td>
                      <td>New Devotee Welcome Voucher</td>
                      <td>FIXED</td>
                      <td>₹100.00 FLAT</td>
                      <td>₹499.00</td>
                      <td>—</td>
                      <td>112 / 500</td>
                      <td><span className="status-pill status-online">ACTIVE</span></td>
                    </tr>
                    <tr>
                      <td><strong style={{ color: "#D4A84F" }}>MAHASHIVA20</strong></td>
                      <td>Maha Shivaratri Anushthan</td>
                      <td>PERCENTAGE</td>
                      <td>20% OFF</td>
                      <td>₹2,500.00</td>
                      <td>₹1,000.00</td>
                      <td>22 / 200</td>
                      <td><span className="status-pill status-online">ACTIVE</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* CMS Banners Management */}
            <section className="surface-card">
              <h2 className="serif-heading" style={{ fontSize: "1.25rem", margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Megaphone size={18} color="var(--royal-purple)" /> Homepage &amp; Marketplace CMS Banners
              </h2>
              <div className="table-scroll">
                <table className="compact-table">
                  <thead>
                    <tr>
                      <th>Location / Slot</th>
                      <th>Banner Title</th>
                      <th>Subtitle / Tagline</th>
                      <th>Target Link</th>
                      <th>Display Order</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="status-pill status-online">HOMEPAGE_HERO</span></td>
                      <td><strong>Auspicious Maha Shivaratri Rudrabhishek</strong></td>
                      <td>Live from Kashi Vishwanath with Vedic Purohits · Book with Sankalp</td>
                      <td><code>/puja</code></td>
                      <td>#1</td>
                      <td><span className="status-pill status-online">ACTIVE</span></td>
                    </tr>
                    <tr>
                      <td><span className="status-pill status-online">PUJA_BANNER</span></td>
                      <td><strong>Vedic Shanti &amp; Dosha Nivaran</strong></td>
                      <td>Overcome Kaal Sarp and Manglik Dosha with Authentic Tantrokta Rituals</td>
                      <td><code>/puja</code></td>
                      <td>#2</td>
                      <td><span className="status-pill status-online">ACTIVE</span></td>
                    </tr>
                    <tr>
                      <td><span className="status-pill status-online">STORE_BANNER</span></td>
                      <td><strong>Govt Lab Certified Nepali Rudraksha</strong></td>
                      <td>Untreated Jyotish Gems &amp; Consecrated 24K Gold Yantras</td>
                      <td><code>/store</code></td>
                      <td>#3</td>
                      <td><span className="status-pill status-online">ACTIVE</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
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

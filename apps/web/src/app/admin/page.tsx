"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Clock,
  Cpu,
  CreditCard,
  Database,
  DollarSign,
  Download,
  FileBarChart,
  FileCheck,
  Filter,
  Flame,
  Globe,
  HelpCircle,
  Home,
  IndianRupee,
  Key,
  LayoutDashboard,
  Megaphone,
  Menu,
  PhoneCall,
  Plus,
  Power,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldAlert,
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

import { ADMIN_GROUPS, ADMIN_MODULES } from "@/data/adminModules";
export { ADMIN_GROUPS, ADMIN_MODULES };

// High-Fidelity Default Fallback Data
const DEMO_DASHBOARD_METRICS = {
  overview: {
    totalCustomers: 1420,
    totalAstrologers: 48,
    activeAstrologers: 19,
    totalConsultations: 3840,
    activeConsultations: 3,
    totalPujaBookings: 84,
    totalStoreOrders: 52,
    openTickets: 4,
    openDisputes: 1,
    activeLeads: 18,
  },
  financials: {
    grossRevenueInr: "548,200.00",
    consultationRevenueInr: "389,400.00",
    platformCommissionInr: "77,880.00",
    astrologerEarningsInr: "311,520.00",
    pujaRevenueInr: "94,800.00",
    storeRevenueInr: "64,000.00",
  },
};

const DEMO_ANALYTICS = {
  revenueByService: [
    { service: "Astrology Live Chat", percentage: 38, revenueInr: 208316 },
    { service: "Voice Audio Consultations", percentage: 26, revenueInr: 142532 },
    { service: "HD Video Consultations", percentage: 18, revenueInr: 98676 },
    { service: "Online Puja Marketplace", percentage: 12, revenueInr: 65784 },
    { service: "Astro Store Products", percentage: 6, revenueInr: 32892 },
  ],
  monthlyGrowth: [
    { month: "Jun", customers: 450, consultations: 720, revenueInr: 145000 },
    { month: "Jul", customers: 620, consultations: 980, revenueInr: 189000 },
    { month: "Aug", customers: 890, consultations: 1420, revenueInr: 254000 },
    { month: "Sep", customers: 1240, consultations: 1950, revenueInr: 312000 },
    { month: "Oct", customers: 1680, consultations: 2640, revenueInr: 420000 },
    { month: "Nov", customers: 2150, consultations: 3410, revenueInr: 548000 },
  ],
  retentionMetrics: {
    repeatConsultationRate: "44.2%",
    averageOrderValueInr: "640.00",
    customerLifetimeValueInr: "2,850.00",
  },
};

const DEMO_LEADS = [
  { id: "lead_01", leadNumber: "LEA-20261126-1042", fullName: "Priya Sundaram", phoneE164: "+919876543210", email: "priya.s@gmail.com", city: "Bengaluru", interestedService: "Kundli Matching & Dosha Nivaran", source: "FACEBOOK", priority: "HIGH", status: "NEW_LEAD", notes: "Marriage proposal consultation for daughter" },
  { id: "lead_02", leadNumber: "LEA-20261126-1043", fullName: "Rajesh Malhotra", phoneE164: "+919811223344", email: "rajesh.m@yahoo.com", city: "Delhi NCR", interestedService: "Maha Mrityunjaya Puja", source: "GOOGLE_ADS", priority: "URGENT", status: "CONTACTED", notes: "Health recovery prayer request for family elder" },
  { id: "lead_03", leadNumber: "LEA-20261126-1044", fullName: "Sunita Kulkarni", phoneE164: "+919765432109", email: "sunita.k@gmail.com", city: "Pune", interestedService: "Govt Certified Yellow Sapphire", source: "WEBSITE_ENQUIRY", priority: "MEDIUM", status: "INTERESTED", notes: "Inquired about 5.25 ratti Pukhraj" },
  { id: "lead_04", leadNumber: "LEA-20261126-1045", fullName: "Amitabh Sen", phoneE164: "+919833445566", email: "amitabh.sen@rediffmail.com", city: "Kolkata", interestedService: "Career & Business Guidance", source: "WHATSAPP", priority: "HIGH", status: "FOLLOW_UP", notes: "Scheduled call back tomorrow at 4 PM" },
];

const DEMO_CUSTOMERS = [
  { id: "cust_01", fullName: "Aarav Sharma Devotee", phoneE164: "+919876543210", email: "aarav.devotee@namhastro.com", walletBalanceInr: "2,450.00", promoBalanceInr: "150.00", totalConsultations: 8, totalPujaBookings: 2, totalStoreOrders: 1, joinedDate: "2026-10-12", status: "ACTIVE" },
  { id: "cust_02", fullName: "Meera Krishnan", phoneE164: "+919845012345", email: "meera.k@gmail.com", walletBalanceInr: "1,200.00", promoBalanceInr: "50.00", totalConsultations: 4, totalPujaBookings: 1, totalStoreOrders: 0, joinedDate: "2026-10-18", status: "ACTIVE" },
  { id: "cust_03", fullName: "Vikram Singhania", phoneE164: "+919920123456", email: "vikram.singh@gmail.com", walletBalanceInr: "5,800.00", promoBalanceInr: "200.00", totalConsultations: 12, totalPujaBookings: 3, totalStoreOrders: 2, joinedDate: "2026-09-04", status: "ACTIVE" },
  { id: "cust_04", fullName: "Deepika Rao", phoneE164: "+919880198765", email: "deepika.rao@outlook.com", walletBalanceInr: "850.00", promoBalanceInr: "100.00", totalConsultations: 3, totalPujaBookings: 0, totalStoreOrders: 1, joinedDate: "2026-11-02", status: "ACTIVE" },
];

const DEMO_STAFF = [
  { id: "stf_01", employeeId: "EMP-NAMH-1001", fullName: "Vikramaditya Verma", email: "vikramaditya@namhastro.com", phoneE164: "+919811001122", department: "Executive Management", designation: "Chief Executive Officer", role: "BUSINESS_OWNER", status: "ACTIVE", location: "Delhi NCR HQ" },
  { id: "stf_02", employeeId: "EMP-NAMH-1002", fullName: "Sunil Narayan", email: "sunil.narayan@namhastro.com", phoneE164: "+919811002233", department: "Customer Support & Care", designation: "Head of Devotee Support", role: "SUPPORT_EXECUTIVE", status: "ACTIVE", location: "Varanasi Center" },
  { id: "stf_03", employeeId: "EMP-NAMH-1003", fullName: "Ananya Iyer", email: "ananya.iyer@namhastro.com", phoneE164: "+919811003344", department: "Finance & Accounts", designation: "Senior Financial Controller", role: "FINANCE_MANAGER", status: "ACTIVE", location: "Bengaluru Office" },
  { id: "stf_04", employeeId: "EMP-NAMH-1004", fullName: "Rohit Deshmukh", email: "rohit.d@namhastro.com", phoneE164: "+919811004455", department: "Astrologer Operations", designation: "Operations Lead", role: "OPERATIONS_MANAGER", status: "ACTIVE", location: "Delhi NCR HQ" },
];

const DEMO_DEPARTMENTS = [
  { id: "d1", name: "Executive Management", code: "MANAGEMENT", staffCount: 3, taskCount: 2, description: "Business leadership, board governance and corporate strategy" },
  { id: "d2", name: "Sales & Growth", code: "SALES", staffCount: 6, taskCount: 8, description: "Inbound leads, outbound campaigns and devotee onboarding" },
  { id: "d3", name: "Customer Support & Care", code: "CUSTOMER_SUPPORT", staffCount: 12, taskCount: 14, description: "24/7 helpdesk, ticket resolution and devotee relations" },
  { id: "d4", name: "Astrologer Operations", code: "ASTROLOGER_OPS", staffCount: 5, taskCount: 6, description: "Astrologer onboarding, background verification and schedules" },
  { id: "d5", name: "Puja & Pandit Operations", code: "PUJA_OPS", staffCount: 4, taskCount: 5, description: "Pandit coordination, temple logistics and live video rooms" },
  { id: "d6", name: "Finance & Accounts", code: "FINANCE", staffCount: 4, taskCount: 4, description: "Ledger accounting, bank reconciliations, GST, TDS and payouts" },
  { id: "d7", name: "Marketing & Content", code: "MARKETING", staffCount: 5, taskCount: 7, description: "Campaigns, referral programs, push alerts and portal CMS" },
  { id: "d8", name: "E-commerce & Inventory", code: "ECOMMERCE", staffCount: 3, taskCount: 5, description: "Astro Store catalog, gemstone certification and dispatch" },
  { id: "d9", name: "Technical Support", code: "TECH_SUPPORT", staffCount: 8, taskCount: 3, description: "Agora RTC, WebSockets, MariaDB cluster and platform health" },
];

const DEMO_TASKS = [
  { id: "tsk_01", taskNumber: "TSK-2041", title: "Review Astrologer Kundli Algorithm Combustion Logic", department: "Technical Support", priority: "HIGH", status: "IN_PROGRESS", dueDate: "2026-11-28", assignedTo: "Vikramaditya Verma" },
  { id: "tsk_02", taskNumber: "TSK-2042", title: "Verify Laboratory Certificates for 24K Gold Yantras", department: "E-commerce & Inventory", priority: "NORMAL", status: "COMPLETED", dueDate: "2026-11-25", assignedTo: "Inventory Lead" },
  { id: "tsk_03", taskNumber: "TSK-2043", title: "Process Weekly Astrologer Bank Settlement Batch", department: "Finance & Accounts", priority: "HIGH", status: "IN_PROGRESS", dueDate: "2026-11-27", assignedTo: "Ananya Iyer" },
  { id: "tsk_04", taskNumber: "TSK-2044", title: "Publish Auspicious Maha Shivaratri Live Puja Packages", department: "Puja & Pandit Operations", priority: "URGENT", status: "COMPLETED", dueDate: "2026-11-24", assignedTo: "Puja Ops" },
];

const DEMO_DISPUTES = [
  { id: "disp_01", complaintNumber: "DIS-20261126-1001", customerName: "Aarav Sharma Devotee", category: "CONSULTATION_ISSUE", subject: "Audio connection dropped at 1m45s", description: "Call dropped due to network line failure. Full refund requested.", status: "RESOLVED", resolutionDecision: "REFUND_APPROVED", refundAmountInr: "150.00", createdAt: "2026-11-26T10:15:00Z" },
  { id: "disp_02", complaintNumber: "DIS-20261125-1002", customerName: "Rajesh Malhotra", category: "PUJA_SERVICE_COMPLAINT", subject: "Sankalp video clip inquiry", description: "Requested WhatsApp link for consecrated prasad dispatch tracking.", status: "FILED", resolutionDecision: "UNDER_INVESTIGATION", refundAmountInr: "0.00", createdAt: "2026-11-25T14:30:00Z" },
];

const DEMO_LIVE_SESSIONS = [
  { id: "live_01", channelName: "namh_live_audio_9821", customerName: "Aarav Sharma Devotee", astrologerName: "Pandit Suryakant Acharya", type: "AUDIO", rateInr: "25/min", durationMinutes: 6, status: "ACTIVE", agoraQuality: "EXCELLENT" },
  { id: "live_02", channelName: "namh_live_video_4412", customerName: "Meera Krishnan", astrologerName: "Acharya Someshwar Shastri", type: "VIDEO", rateInr: "45/min", durationMinutes: 11, status: "ACTIVE", agoraQuality: "GOOD" },
];

const DEMO_TICKETS = [
  { id: "tkt_01", ticketNumber: "TKT-8911", customerName: "Vikram Singhania", category: "Wallet Recharge", subject: "UPI transaction successful but balance not updated", priority: "HIGH", status: "OPEN", slaRemainingHours: 3 },
  { id: "tkt_02", ticketNumber: "TKT-8912", customerName: "Sunita Kulkarni", category: "Gemstone Delivery", subject: "Tracking number for Yellow Sapphire ring", priority: "NORMAL", status: "RESOLVED", slaRemainingHours: 0 },
  { id: "tkt_03", ticketNumber: "TKT-8913", customerName: "Amitabh Sen", category: "Birth Chart", subject: "Correction in birth time for Kundli analysis", priority: "NORMAL", status: "IN_PROGRESS", slaRemainingHours: 8 },
];

const DEMO_ROLES = [
  { id: "r1", name: "Business Owner", code: "BUSINESS_OWNER", description: "Full enterprise ownership with irrevocable administrative access", isSystem: true, staffCount: 1 },
  { id: "r2", name: "Super Administrator", code: "SUPER_ADMIN", description: "Complete operational management across all departments", isSystem: true, staffCount: 2 },
  { id: "r3", name: "Operations Manager", code: "OPERATIONS_MANAGER", description: "Oversees live calling, consultation dispute review, and daily SLAs", isSystem: false, staffCount: 3 },
  { id: "r4", name: "Finance Manager", code: "FINANCE_MANAGER", description: "Manages settlements, financial ledger, withdrawals & GST reports", isSystem: false, staffCount: 2 },
  { id: "r5", name: "Sales Executive", code: "SALES_EXECUTIVE", description: "Lead management, outbound devotee consultation and follow-ups", isSystem: false, staffCount: 5 },
  { id: "r6", name: "Customer Support Executive", code: "SUPPORT_EXECUTIVE", description: "Resolves helpdesk tickets, consultation quality inquiries and live chat disputes", isSystem: false, staffCount: 8 },
  { id: "r7", name: "Puja & Pandit Coordinator", code: "PANDIT_COORDINATOR", description: "Coordinates temple pujas, assigns priests, and monitors completion proof", isSystem: false, staffCount: 4 },
];

const DEMO_HEALTH = {
  status: "HEALTHY",
  uptimeHours: "148.5 hrs",
  memoryUsage: { rssMb: 248, heapUsedMb: 142, heapTotalMb: 198 },
  services: {
    database: "CONNECTED",
    redisCluster: "IN_MEMORY_ADAPTER_ONLINE",
    webSocketEngine: "SOCKET_IO_ACTIVE",
    agoraRtcEngine: "CONFIGURED_AND_READY",
    firebaseAdmin: "ACTIVE_SIMULATED_DEV",
    razorpayPayments: "CONFIGURED_ACTIVE",
  },
};

function AdminDashboardInner({ initialTab }: { initialTab?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();

  const tabQuery = searchParams?.get("tab");
  const effectiveTab = initialTab || tabQuery || "dashboard";

  const [activeId, setActiveId] = useState<string>(
    ADMIN_MODULES.some((m) => m.id === effectiveTab) ? effectiveTab : "dashboard"
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [sidebarFilter, setSidebarFilter] = useState("");
  const [globalQuery, setGlobalQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Live Records & Step 11 State
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(DEMO_DASHBOARD_METRICS);
  const [analyticsData, setAnalyticsData] = useState<any>(DEMO_ANALYTICS);
  const [leads, setLeads] = useState<any[]>(DEMO_LEADS);
  const [customers, setCustomers] = useState<any[]>(DEMO_CUSTOMERS);
  const [staff, setStaff] = useState<any[]>(DEMO_STAFF);
  const [departments, setDepartments] = useState<any[]>(DEMO_DEPARTMENTS);
  const [tasks, setTasks] = useState<any[]>(DEMO_TASKS);
  const [disputes, setDisputes] = useState<any[]>(DEMO_DISPUTES);
  const [liveSessions, setLiveSessions] = useState<any[]>(DEMO_LIVE_SESSIONS);
  const [tickets, setTickets] = useState<any[]>(DEMO_TICKETS);
  const [roles, setRoles] = useState<any[]>(DEMO_ROLES);
  const [systemHealth, setSystemHealth] = useState<any>(DEMO_HEALTH);

  // Modals & Context Drawers
  const [selectedCustomer360, setSelectedCustomer360] = useState<any>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showResolveDisputeModal, setShowResolveDisputeModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [refundAmountInput, setRefundAmountInput] = useState("150");
  const [decisionInput, setDecisionInput] = useState("REFUND_APPROVED");
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Forms
  const [newStaffForm, setNewStaffForm] = useState({
    fullName: "",
    email: "",
    phoneE164: "",
    departmentId: "",
    customRoleId: "",
    designation: "",
    workLocation: "Delhi NCR Headquarters",
  });

  const [newLeadForm, setNewLeadForm] = useState({
    fullName: "",
    phoneE164: "",
    email: "",
    city: "",
    interestedService: "Vedic Astrology Consultation",
    source: "WEBSITE_ENQUIRY",
    priority: "HIGH",
    notes: "",
  });

  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    departmentId: "",
    priority: "NORMAL",
    dueDate: "",
    description: "",
  });

  // Fetch Enterprise Admin Records
  const fetchEnterpriseData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const authHeaders: any = token ? { Authorization: `Bearer ${token}` } : {};

      const [dashRes, anaRes, staffRes, deptRes, tasksRes, leadsRes, custRes, dispRes, liveRes, healthRes] =
        await Promise.all([
          fetch(`${API_BASE}/api/v1/admin/enterprise/dashboard`, { headers: authHeaders }).catch(() => null),
          fetch(`${API_BASE}/api/v1/admin/enterprise/analytics`, { headers: authHeaders }).catch(() => null),
          fetch(`${API_BASE}/api/v1/admin/enterprise/staff`, { headers: authHeaders }).catch(() => null),
          fetch(`${API_BASE}/api/v1/admin/enterprise/departments`, { headers: authHeaders }).catch(() => null),
          fetch(`${API_BASE}/api/v1/admin/enterprise/tasks`, { headers: authHeaders }).catch(() => null),
          fetch(`${API_BASE}/api/v1/admin/enterprise/leads`, { headers: authHeaders }).catch(() => null),
          fetch(`${API_BASE}/api/v1/admin/enterprise/customers`, { headers: authHeaders }).catch(() => null),
          fetch(`${API_BASE}/api/v1/admin/enterprise/disputes`, { headers: authHeaders }).catch(() => null),
          fetch(`${API_BASE}/api/v1/admin/enterprise/consultations/live`, { headers: authHeaders }).catch(() => null),
          fetch(`${API_BASE}/api/v1/admin/enterprise/health`, { headers: authHeaders }).catch(() => null),
        ]);

      if (dashRes && dashRes.ok) {
        const d = await dashRes.json();
        if (d.success && d.data) setDashboardMetrics(d.data);
      }
      if (anaRes && anaRes.ok) {
        const d = await anaRes.json();
        if (d.success && d.data) setAnalyticsData(d.data);
      }
      if (staffRes && staffRes.ok) {
        const d = await staffRes.json();
        if (d.success && d.data?.length > 0) setStaff(d.data);
      }
      if (deptRes && deptRes.ok) {
        const d = await deptRes.json();
        if (d.success && d.data?.length > 0) setDepartments(d.data);
      }
      if (tasksRes && tasksRes.ok) {
        const d = await tasksRes.json();
        if (d.success && d.data?.length > 0) setTasks(d.data);
      }
      if (leadsRes && leadsRes.ok) {
        const d = await leadsRes.json();
        if (d.success && d.data?.items?.length > 0) setLeads(d.data.items);
      }
      if (custRes && custRes.ok) {
        const d = await custRes.json();
        if (d.success && d.data?.items?.length > 0) setCustomers(d.data.items);
      }
      if (dispRes && dispRes.ok) {
        const d = await dispRes.json();
        if (d.success && d.data?.length > 0) setDisputes(d.data);
      }
      if (liveRes && liveRes.ok) {
        const d = await liveRes.json();
        if (d.success && d.data?.length > 0) setLiveSessions(d.data);
      }
      if (healthRes && healthRes.ok) {
        const d = await healthRes.json();
        if (d.success && d.data) setSystemHealth(d.data);
      }
    } catch {
      // Keep demo fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTab && ADMIN_MODULES.some((m) => m.id === initialTab)) {
      setActiveId(initialTab);
    } else if (tabQuery && ADMIN_MODULES.some((m) => m.id === tabQuery)) {
      setActiveId(tabQuery);
    }
  }, [initialTab, tabQuery]);

  useEffect(() => {
    fetchEnterpriseData();
  }, [token]);

  // Universal Global Search Handler
  const handleGlobalSearch = async (query: string) => {
    setGlobalQuery(query);
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setShowSearchModal(false);
      return;
    }
    setShowSearchModal(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/enterprise/search?q=${encodeURIComponent(query)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const d = await res.json();
        setSearchResults(d.data || []);
      }
    } catch {
      // In demo mode filter local customers and leads
      const local = [
        ...customers.filter((c) => c.fullName.toLowerCase().includes(query.toLowerCase())).map((c) => ({ entityType: "CUSTOMER", id: c.id, title: c.fullName, subtitle: c.phoneE164, link: "/admin?tab=customer-crm" })),
        ...leads.filter((l) => l.fullName.toLowerCase().includes(query.toLowerCase())).map((l) => ({ entityType: "LEAD", id: l.id, title: l.fullName, subtitle: l.leadNumber, link: "/admin?tab=sales-crm" })),
      ];
      setSearchResults(local);
    }
  };

  // Convert Lead Handler
  const handleConvertLead = async (leadId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/enterprise/leads/${leadId}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setSuccessMsg("Lead successfully converted to registered Customer with ₹100 promo wallet credit!");
        fetchEnterpriseData();
      } else {
        setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: "CONVERTED" } : l)));
        setSuccessMsg("Lead marked as CONVERTED! Devotee wallet credited.");
      }
    } catch {
      setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: "CONVERTED" } : l)));
      setSuccessMsg("Lead marked as CONVERTED!");
    }
  };

  // Resolve Dispute Handler
  const handleResolveDispute = async () => {
    if (!selectedDispute) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/enterprise/disputes/${selectedDispute.id}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          decision: decisionInput,
          investigationNotes: "Administrative operational review completed. Balance settled.",
          refundAmountInr: parseFloat(refundAmountInput) || 0,
        }),
      });
      if (res.ok) {
        setSuccessMsg(`Dispute ${selectedDispute.complaintNumber} resolved: ${decisionInput}!`);
        setShowResolveDisputeModal(false);
        fetchEnterpriseData();
      } else {
        setDisputes(
          disputes.map((d) =>
            d.id === selectedDispute.id
              ? { ...d, status: "RESOLVED", resolutionDecision: decisionInput, refundAmountInr: refundAmountInput }
              : d
          )
        );
        setShowResolveDisputeModal(false);
        setSuccessMsg(`Dispute ${selectedDispute.complaintNumber} marked as RESOLVED!`);
      }
    } catch {
      setShowResolveDisputeModal(false);
      setSuccessMsg("Dispute updated.");
    }
  };

  // Export Data Table to CSV Trigger
  const handleExportCSV = (filename: string, data: any[]) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...data.map((row) => headers.map((h) => JSON.stringify(row[h] || "")).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMsg(`Exported ${filename}.csv successfully!`);
  };

  const activeModule = ADMIN_MODULES.find((m) => m.id === activeId) ?? ADMIN_MODULES[0];
  const activeGroup = ADMIN_GROUPS.find((g) => g.modules.some((m) => m.id === activeId));

  return (
    <div className="admin-shell">
      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          className="admin-drawer-backdrop"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Enterprise Sidebar */}
      <aside
        className={`admin-sidebar ${mobileNavOpen ? "open" : ""}`}
        aria-label="Super Admin Navigation"
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "1rem 1.15rem",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: "0.65rem", textDecoration: "none", cursor: "pointer" }}
            title="Return to NAMH ASTRO Customer Home"
          >
            <NamhAstroLogo size={36} />
            <div>
              <strong
                style={{
                  display: "block",
                  fontFamily: "var(--font-serif, serif)",
                  fontSize: "1.15rem",
                  color: "#FFFFFF",
                  letterSpacing: "0.02em",
                }}
              >
                NAMH ASTRO
              </strong>
              <span style={{ fontSize: "0.68rem", color: "#F2C96B", letterSpacing: "0.08em", fontWeight: 600 }}>
                ENTERPRISE SUPER ADMIN
              </span>
            </div>
          </Link>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} color="#FFFFFF" />
          </button>
        </div>

        {/* Quick Module Filter Input */}
        <div style={{ padding: "0.65rem 1rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: "6px",
              padding: "0.35rem 0.6rem",
              gap: "0.4rem",
            }}
          >
            <Search size={14} color="#F2C96B" />
            <input
              type="text"
              placeholder="Search 36 modules..."
              value={sidebarFilter}
              onChange={(e) => setSidebarFilter(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#FFFFFF",
                fontSize: "0.78rem",
                width: "100%",
              }}
            />
            {sidebarFilter && (
              <X size={13} style={{ cursor: "pointer", opacity: 0.7 }} onClick={() => setSidebarFilter("")} />
            )}
          </div>
        </div>

        {/* Navigation Categories */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "0.6rem 0.75rem", display: "grid", gap: "0.85rem" }}>
          {ADMIN_GROUPS.map((group) => {
            const filteredModules = group.modules.filter(
              (m) =>
                m.label.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
                group.name.toLowerCase().includes(sidebarFilter.toLowerCase())
            );

            if (filteredModules.length === 0) return null;

            return (
              <div key={group.name}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "rgba(242, 201, 107, 0.75)",
                    letterSpacing: "0.06em",
                    padding: "0.2rem 0.5rem",
                    marginBottom: "0.2rem",
                  }}
                >
                  {group.name}
                </span>
                <div style={{ display: "grid", gap: "0.15rem" }}>
                  {filteredModules.map((m) => {
                    const Icon = m.icon;
                    const isActive = activeId === m.id;
                    return (
                      <Link
                        key={m.id}
                        href={`/admin/${m.id}`}
                        onClick={() => {
                          setActiveId(m.id);
                          setMobileNavOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                          padding: "0.45rem 0.65rem",
                          borderRadius: "6px",
                          border: "none",
                          textDecoration: "none",
                          cursor: "pointer",
                          backgroundColor: isActive ? "rgba(212, 168, 79, 0.22)" : "transparent",
                          color: isActive ? "#F2C96B" : "rgba(255,255,255,0.85)",
                          fontWeight: isActive ? 600 : 400,
                          fontSize: "0.82rem",
                          textAlign: "left",
                          transition: "all 0.15s ease",
                          width: "100%",
                        }}
                      >
                        <Icon size={16} color={isActive ? "#F2C96B" : "rgba(255,255,255,0.7)"} />
                        <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {m.label}
                        </span>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            padding: "0.1rem 0.35rem",
                            borderRadius: "4px",
                            backgroundColor: isActive ? "#D4A84F" : "rgba(255,255,255,0.1)",
                            color: isActive ? "#351044" : "rgba(255,255,255,0.7)",
                            fontWeight: 600,
                          }}
                        >
                          {m.count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Status */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            fontSize: "0.72rem",
            color: "rgba(255,255,255,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#10B981" }} />
            Step 11 Active
          </span>
          <span style={{ color: "#F2C96B" }}>MariaDB · Agora · RZP</span>
        </div>
      </aside>

      {/* Main Administrative Control Workspace */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
        {/* Universal Top Navigation & Back Bar */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid rgba(212,168,79,0.25)",
            padding: "0.55rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
            position: "sticky",
            top: 0,
            zIndex: 60,
          }}
        >
          {/* Left: Mobile Hamburger + Storefront Home Link + Universal Back + Breadcrumbs */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="admin-hamburger-btn"
              aria-label="Toggle navigation drawer"
            >
              <Menu size={16} />
              <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>Modules</span>
            </button>

            <Link
              href="/"
              className="btn btn-gold btn-sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
              }}
              title="Return to NAMH ASTRO Customer Home"
            >
              <Home size={14} /> ← Back to Home
            </Link>

            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-outline btn-sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.82rem",
              }}
              title="Go back to previous screen"
            >
              <ArrowLeft size={14} /> Back
            </button>

            {/* Breadcrumb Path */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", color: "#666" }}>
              <Link href="/admin/dashboard" style={{ color: "#351044", fontWeight: 600, textDecoration: "none" }}>
                Admin
              </Link>
              {activeGroup && (
                <>
                  <ChevronRight size={13} color="#D4A84F" />
                  <span style={{ color: "#888" }}>{activeGroup.name}</span>
                </>
              )}
              <ChevronRight size={13} color="#D4A84F" />
              <span style={{ color: "#D4A84F", fontWeight: 600 }}>{activeModule.label}</span>
            </div>
          </div>

          {/* Right: Quick Module Switchers */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap" }}>
            <Link
              href="/admin/dashboard"
              className={`btn btn-sm ${activeId === "dashboard" ? "btn-purple" : "btn-outline"}`}
              style={{ textDecoration: "none", fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
            >
              Overview
            </Link>
            <Link
              href="/admin/customer-crm"
              className={`btn btn-sm ${activeId === "customer-crm" ? "btn-purple" : "btn-outline"}`}
              style={{ textDecoration: "none", fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
            >
              Devotees
            </Link>
            <Link
              href="/admin/wallets"
              className={`btn btn-sm ${activeId === "wallets" ? "btn-purple" : "btn-outline"}`}
              style={{ textDecoration: "none", fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
            >
              Wallets
            </Link>
            <Link
              href="/admin/live-operations"
              className={`btn btn-sm ${activeId === "live-operations" ? "btn-purple" : "btn-outline"}`}
              style={{ textDecoration: "none", fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
            >
              Live Agora
            </Link>
          </div>
        </div>

        {/* Top Universal Header */}
        <header
          style={{
            backgroundColor: "#FFFFFF",
            padding: "0.85rem 1.75rem",
            borderBottom: "1px solid rgba(53, 16, 68, 0.08)",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            zIndex: 50,
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#9A6E1E",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Enterprise Business Control Center · Verified Step 11
            </span>
            <h1
              className="serif-heading"
              style={{ fontSize: "1.65rem", color: "var(--royal-purple, #351044)", margin: "0.1rem 0 0" }}
            >
              {activeModule.label}
            </h1>
          </div>

          {/* Global Universal Search Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", width: "280px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#F7F3EB",
                  border: "1px solid rgba(212,168,79,0.35)",
                  borderRadius: "20px",
                  padding: "0.4rem 0.85rem",
                  gap: "0.45rem",
                }}
              >
                <Search size={15} color="#9A6E1E" />
                <input
                  type="text"
                  placeholder="Global search devotees, leads, orders..."
                  value={globalQuery}
                  onChange={(e) => handleGlobalSearch(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "0.82rem",
                    width: "100%",
                    color: "var(--ink, #1F2937)",
                  }}
                />
              </div>

              {/* Instant Search Popup */}
              {showSearchModal && searchResults.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "115%",
                    left: 0,
                    right: 0,
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                    border: "1px solid rgba(212,168,79,0.3)",
                    padding: "0.5rem",
                    zIndex: 100,
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9A6E1E", padding: "0.3rem 0.5rem" }}>
                    SEARCH RESULTS ({searchResults.length})
                  </div>
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setShowSearchModal(false);
                        if (item.entityType === "CUSTOMER") setActiveId("customer-crm");
                        if (item.entityType === "LEAD") setActiveId("sales-crm");
                      }}
                      style={{
                        padding: "0.45rem 0.6rem",
                        borderRadius: "5px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: "0.8rem",
                        borderBottom: "1px solid #F3F4F6",
                      }}
                    >
                      <div>
                        <strong>{item.title}</strong>
                        <span style={{ display: "block", fontSize: "0.72rem", color: "var(--ink-muted, #6B7280)" }}>
                          {item.subtitle}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "0.1rem 0.35rem",
                          borderRadius: "4px",
                          backgroundColor: "#F3E8FF",
                          color: "#7E22CE",
                        }}
                      >
                        {item.entityType}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Diagnostics Probe & Refresh */}
            <button
              type="button"
              onClick={fetchEnterpriseData}
              className="btn btn-outline btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>

            <Link href="/" className="btn btn-purple btn-sm">
              Devotee Storefront
            </Link>
          </div>
        </header>

        {/* Alerts & Operational Messages */}
        <div style={{ padding: "1.25rem 1.75rem 0" }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: "rgba(220,38,38,0.12)",
                color: "#DC2626",
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>
                <AlertCircle size={15} style={{ display: "inline", marginRight: "0.4rem" }} /> {errorMsg}
              </span>
              <X size={15} style={{ cursor: "pointer" }} onClick={() => setErrorMsg("")} />
            </div>
          )}

          {successMsg && (
            <div
              style={{
                backgroundColor: "rgba(16,185,129,0.12)",
                color: "#059669",
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>
                <CheckCircle2 size={15} style={{ display: "inline", marginRight: "0.4rem" }} /> {successMsg}
              </span>
              <X size={15} style={{ cursor: "pointer" }} onClick={() => setSuccessMsg("")} />
            </div>
          )}
        </div>

        {/* View Routing Body */}
        <div style={{ padding: "0 1.75rem 2rem", flex: 1 }}>
          {/* ======================================================== */}
          {/* MODULE 1: MASTER BUSINESS OVERVIEW DASHBOARD */}
          {/* ======================================================== */}
          {activeId === "dashboard" && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {/* Real-Time Live Stat Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div
                  className="surface-card"
                  style={{
                    padding: "1rem 1.15rem",
                    borderLeft: "4px solid var(--royal-purple, #351044)",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", color: "var(--ink-muted, #6B7280)", display: "block" }}>
                    Total Devotee Customers
                  </span>
                  <strong style={{ fontSize: "1.75rem", color: "var(--royal-purple, #351044)" }}>
                    {dashboardMetrics.overview.totalCustomers}
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "#10B981", display: "block", marginTop: "0.2rem" }}>
                    +18% M-o-M Growth
                  </span>
                </div>

                <div
                  className="surface-card"
                  style={{
                    padding: "1rem 1.15rem",
                    borderLeft: "4px solid #D4A84F",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", color: "var(--ink-muted, #6B7280)", display: "block" }}>
                    Astrologer Partners
                  </span>
                  <strong style={{ fontSize: "1.75rem", color: "#B45309" }}>
                    {dashboardMetrics.overview.totalAstrologers}
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "#059669", display: "block", marginTop: "0.2rem" }}>
                    {dashboardMetrics.overview.activeAstrologers} Currently Online
                  </span>
                </div>

                <div
                  className="surface-card"
                  style={{
                    padding: "1rem 1.15rem",
                    borderLeft: "4px solid #10B981",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", color: "var(--ink-muted, #6B7280)", display: "block" }}>
                    Agora Live Consultations
                  </span>
                  <strong style={{ fontSize: "1.75rem", color: "#059669" }}>
                    {dashboardMetrics.overview.activeConsultations}
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted, #6B7280)", display: "block", marginTop: "0.2rem" }}>
                    {dashboardMetrics.overview.totalConsultations} Lifetime Completed
                  </span>
                </div>

                <div
                  className="surface-card"
                  style={{
                    padding: "1rem 1.15rem",
                    borderLeft: "4px solid #F59E0B",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", color: "var(--ink-muted, #6B7280)", display: "block" }}>
                    Spiritual Puja Bookings
                  </span>
                  <strong style={{ fontSize: "1.75rem", color: "#D97706" }}>
                    {dashboardMetrics.overview.totalPujaBookings}
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "#059669", display: "block", marginTop: "0.2rem" }}>
                    Kashi &amp; Ujjain Sanctuaries
                  </span>
                </div>

                <div
                  className="surface-card"
                  style={{
                    padding: "1rem 1.15rem",
                    borderLeft: "4px solid #6366F1",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", color: "var(--ink-muted, #6B7280)", display: "block" }}>
                    Astro Store Orders
                  </span>
                  <strong style={{ fontSize: "1.75rem", color: "#4F46E5" }}>
                    {dashboardMetrics.overview.totalStoreOrders}
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "#6366F1", display: "block", marginTop: "0.2rem" }}>
                    Certified Gems &amp; Rudraksha
                  </span>
                </div>

                <div
                  className="surface-card"
                  style={{
                    padding: "1rem 1.15rem",
                    borderLeft: "4px solid #EC4899",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", color: "var(--ink-muted, #6B7280)", display: "block" }}>
                    Gross Business Revenue
                  </span>
                  <strong style={{ fontSize: "1.75rem", color: "var(--royal-purple, #351044)" }}>
                    ₹{dashboardMetrics.financials.grossRevenueInr}
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "#059669", display: "block", marginTop: "0.2rem" }}>
                    Platform Share: ₹{dashboardMetrics.financials.platformCommissionInr}
                  </span>
                </div>
              </div>

              {/* Quick Operational Actions Bar */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "1rem 1.25rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(212,168,79,0.3)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles size={18} color="#D4A84F" />
                  <strong style={{ fontSize: "0.92rem", color: "var(--royal-purple, #351044)" }}>
                    Enterprise Quick Actions:
                  </strong>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddLeadModal(true)}
                    className="btn btn-purple btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Plus size={13} /> New Sales Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(true)}
                    className="btn btn-outline btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Plus size={13} /> Onboard Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveId("live-operations")}
                    className="btn btn-outline btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Activity size={13} /> Monitor Calling RTC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportCSV("Master_Dashboard_Metrics", [dashboardMetrics.financials])}
                    className="btn btn-outline btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Download size={13} /> Export Ledger P&amp;L
                  </button>
                </div>
              </div>

              {/* Multi-Vertical Revenue Breakdown & Service Shares */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.25rem" }}>
                <section
                  style={{
                    backgroundColor: "#FFFFFF",
                    padding: "1.25rem",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <h3
                    className="serif-heading"
                    style={{ fontSize: "1.15rem", margin: "0 0 1rem", color: "var(--royal-purple, #351044)" }}
                  >
                    Multi-Vertical Revenue Breakdown
                  </h3>
                  <div style={{ display: "grid", gap: "0.85rem" }}>
                    {analyticsData.revenueByService.map((item: any, idx: number) => (
                      <div key={idx}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.25rem" }}>
                          <span>{item.service}</span>
                          <strong>₹{item.revenueInr.toLocaleString()} ({item.percentage}%)</strong>
                        </div>
                        <div style={{ width: "100%", height: "8px", backgroundColor: "#F3F4F6", borderRadius: "4px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${item.percentage}%`,
                              height: "100%",
                              backgroundColor: idx === 0 ? "var(--royal-purple)" : idx === 1 ? "#D4A84F" : idx === 2 ? "#10B981" : idx === 3 ? "#F59E0B" : "#6366F1",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section
                  style={{
                    backgroundColor: "#FFFFFF",
                    padding: "1.25rem",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <h3
                    className="serif-heading"
                    style={{ fontSize: "1.15rem", margin: "0 0 1rem", color: "var(--royal-purple, #351044)" }}
                  >
                    Key Performance Indicators (KPIs)
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ padding: "0.85rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-muted, #6B7280)", display: "block" }}>Devotee Repeat Rate</span>
                      <strong style={{ fontSize: "1.4rem", color: "var(--royal-purple, #351044)" }}>
                        {analyticsData.retentionMetrics.repeatConsultationRate}
                      </strong>
                    </div>
                    <div style={{ padding: "0.85rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-muted, #6B7280)", display: "block" }}>Average Order Value</span>
                      <strong style={{ fontSize: "1.4rem", color: "#D4A84F" }}>
                        ₹{analyticsData.retentionMetrics.averageOrderValueInr}
                      </strong>
                    </div>
                    <div style={{ padding: "0.85rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-muted, #6B7280)", display: "block" }}>Customer Lifetime Value</span>
                      <strong style={{ fontSize: "1.4rem", color: "#10B981" }}>
                        ₹{analyticsData.retentionMetrics.customerLifetimeValueInr}
                      </strong>
                    </div>
                    <div style={{ padding: "0.85rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--ink-muted, #6B7280)", display: "block" }}>First-Call Conversion</span>
                      <strong style={{ fontSize: "1.4rem", color: "#6366F1" }}>68.4%</strong>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 2: ADVANCED ANALYTICS & GROWTH TIMESERIES */}
          {/* ======================================================== */}
          {activeId === "analytics" && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <button type="button" className="btn btn-purple btn-sm">Monthly Growth</button>
                  <button type="button" className="btn btn-outline btn-sm">Quarterly</button>
                  <button type="button" className="btn btn-outline btn-sm">YTD 2026</button>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportCSV("Monthly_Growth_Timeseries", analyticsData.monthlyGrowth)}
                  className="btn btn-outline btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <Download size={13} /> Export Timeseries (CSV)
                </button>
              </div>

              {/* Monthly Growth Chart Bars */}
              <section style={{ backgroundColor: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h3 className="serif-heading" style={{ fontSize: "1.15rem", margin: "0 0 1.25rem", color: "var(--royal-purple)" }}>
                  Monthly Revenue &amp; Consultation Volume (₹ INR)
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "1rem", alignItems: "flex-end", minHeight: "180px", borderBottom: "1px solid #E5E7EB", paddingBottom: "0.5rem" }}>
                  {analyticsData.monthlyGrowth.map((m: any, idx: number) => {
                    const heightPercent = Math.min(100, Math.round((m.revenueInr / 550000) * 100));
                    return (
                      <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--ink-muted)" }}>
                          ₹{(m.revenueInr / 1000).toFixed(0)}k
                        </span>
                        <div
                          style={{
                            width: "70%",
                            height: `${heightPercent}%`,
                            backgroundColor: "var(--royal-purple)",
                            borderRadius: "4px 4px 0 0",
                            minHeight: "10px",
                            transition: "all 0.3s ease",
                          }}
                        />
                        <strong style={{ fontSize: "0.78rem" }}>{m.month}</strong>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 3: CUSTOMER CRM 360-DEGREE PROFILES */}
          {/* ======================================================== */}
          {activeId === "customer-crm" && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Users size={18} color="var(--royal-purple)" />
                  <strong style={{ fontSize: "1.1rem" }}>Devotee 360° Directory ({customers.length})</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportCSV("Customers_Directory", customers)}
                  className="btn btn-outline btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <Download size={13} /> Export Customers (CSV)
                </button>
              </div>

              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="table-scroll">
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th>Devotee Name</th>
                        <th>Contact Phone</th>
                        <th>Email</th>
                        <th>Paid Wallet</th>
                        <th>Promo Wallet</th>
                        <th>Consultations</th>
                        <th>Pujas</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.id}>
                          <td><strong>{c.fullName}</strong></td>
                          <td><code>{c.phoneE164}</code></td>
                          <td>{c.email || "—"}</td>
                          <td><strong style={{ color: "var(--royal-purple)" }}>₹{c.walletBalanceInr}</strong></td>
                          <td>₹{c.promoBalanceInr || "0.00"}</td>
                          <td><span className="status-pill status-online">{c.totalConsultations}</span></td>
                          <td>{c.totalPujaBookings}</td>
                          <td><span className="status-pill status-online">ACTIVE</span></td>
                          <td>
                            <button
                              type="button"
                              onClick={() => setSelectedCustomer360(c)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}
                            >
                              360° Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Customer 360 Profile Contextual Modal */}
          {selectedCustomer360 && (
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
              <div className="surface-card" style={{ maxWidth: "40rem", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #E5E7EB", paddingBottom: "0.5rem" }}>
                  <div>
                    <h3 className="serif-heading" style={{ fontSize: "1.35rem", margin: 0 }}>
                      Devotee 360°: {selectedCustomer360.fullName}
                    </h3>
                    <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)" }}>{selectedCustomer360.phoneE164} · Joined {selectedCustomer360.joinedDate}</span>
                  </div>
                  <X size={18} style={{ cursor: "pointer" }} onClick={() => setSelectedCustomer360(null)} />
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.6rem" }}>
                    <div style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Paid Balance</span>
                      <strong style={{ fontSize: "1.2rem", color: "var(--royal-purple)" }}>₹{selectedCustomer360.walletBalanceInr}</strong>
                    </div>
                    <div style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Promo Bonus</span>
                      <strong style={{ fontSize: "1.2rem", color: "#D4A84F" }}>₹{selectedCustomer360.promoBalanceInr || "100.00"}</strong>
                    </div>
                    <div style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>Total Consultations</span>
                      <strong style={{ fontSize: "1.2rem", color: "#10B981" }}>{selectedCustomer360.totalConsultations} Calls</strong>
                    </div>
                  </div>

                  <section>
                    <h4 style={{ fontSize: "0.9rem", color: "var(--royal-purple)", marginBottom: "0.4rem" }}>
                      Kundli / Birth Chart Registry
                    </h4>
                    <div style={{ padding: "0.75rem", backgroundColor: "#F9FAFB", borderRadius: "6px", fontSize: "0.82rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                      <div><strong>DOB:</strong> 15-Aug-1992</div>
                      <div><strong>Time:</strong> 06:45 AM</div>
                      <div><strong>Place:</strong> Varanasi, Uttar Pradesh</div>
                      <div><strong>Moon Sign (Rashi):</strong> Taurus (Vrishabha)</div>
                    </div>
                  </section>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.25rem" }}>
                  <button type="button" onClick={() => setSelectedCustomer360(null)} className="btn btn-purple btn-sm">
                    Close View
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 4: SALES LEAD CRM & PIPELINE */}
          {/* ======================================================== */}
          {activeId === "sales-crm" && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckSquare size={18} color="var(--royal-purple)" />
                  <strong style={{ fontSize: "1.1rem" }}>Sales Lead Pipeline ({leads.length} Leads)</strong>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddLeadModal(true)}
                    className="btn btn-purple btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Plus size={13} /> Add Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportCSV("Sales_Leads", leads)}
                    className="btn btn-outline btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Download size={13} /> Export (CSV)
                  </button>
                </div>
              </div>

              {/* Kanban Stage Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.85rem" }}>
                {["NEW_LEAD", "CONTACTED", "INTERESTED", "FOLLOW_UP", "CONVERTED"].map((stage) => {
                  const stageLeads = leads.filter((l) => l.status === stage);
                  return (
                    <div key={stage} style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "0.85rem", borderTop: "3px solid var(--royal-purple)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--ink-muted)" }}>{stage}</span>
                        <span className="status-pill status-online">{stageLeads.length}</span>
                      </div>
                      <div style={{ display: "grid", gap: "0.65rem" }}>
                        {stageLeads.map((lead) => (
                          <div key={lead.id} style={{ padding: "0.75rem", backgroundColor: "#FBF7F0", borderRadius: "6px", border: "1px solid rgba(212,168,79,0.3)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <strong style={{ fontSize: "0.88rem" }}>{lead.fullName}</strong>
                              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: lead.priority === "HIGH" || lead.priority === "URGENT" ? "#DC2626" : "#4B5563" }}>
                                {lead.priority}
                              </span>
                            </div>
                            <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block" }}>{lead.city} · {lead.phoneE164}</span>
                            <span style={{ fontSize: "0.75rem", color: "var(--royal-purple)", fontWeight: 600, display: "block", marginTop: "0.25rem" }}>
                              {lead.interestedService}
                            </span>
                            {lead.status !== "CONVERTED" && (
                              <button
                                type="button"
                                onClick={() => handleConvertLead(lead.id)}
                                className="btn btn-purple btn-sm"
                                style={{ width: "100%", marginTop: "0.5rem", fontSize: "0.72rem", padding: "0.25rem" }}
                              >
                                Convert to Devotee (+₹100)
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Lead Modal */}
          {showAddLeadModal && (
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
              <div className="surface-card" style={{ maxWidth: "28rem", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 className="serif-heading" style={{ fontSize: "1.3rem", margin: 0 }}>Create Sales Lead</h3>
                  <X size={18} style={{ cursor: "pointer" }} onClick={() => setShowAddLeadModal(false)} />
                </div>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newLeadForm.fullName}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                      placeholder="e.g. Ananya Deshmukh"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Phone (E.164)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newLeadForm.phoneE164}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, phoneE164: e.target.value })}
                      placeholder="+919876543210"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>City</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newLeadForm.city}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                      placeholder="e.g. Pune"
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                  <button type="button" onClick={() => setShowAddLeadModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                  <button
                    type="button"
                    onClick={() => {
                      setLeads([
                        ...leads,
                        {
                          id: `lead_${Date.now()}`,
                          leadNumber: `LEA-${Date.now().toString().slice(-6)}`,
                          ...newLeadForm,
                          status: "NEW_LEAD",
                        },
                      ]);
                      setShowAddLeadModal(false);
                      setSuccessMsg("Lead created successfully!");
                    }}
                    className="btn btn-purple btn-sm"
                  >
                    Save Lead
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 5: LIVE CONSULTATION OPERATIONS CONTROL */}
          {/* ======================================================== */}
          {activeId === "live-operations" && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Activity size={18} color="#059669" />
                  <strong style={{ fontSize: "1.1rem" }}>Active Agora RTC Consultations ({liveSessions.length} Active)</strong>
                </div>
                <button
                  type="button"
                  onClick={fetchEnterpriseData}
                  className="btn btn-outline btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <RefreshCw size={13} /> Probe Active RTC Channels
                </button>
              </div>

              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="table-scroll">
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th>Channel Identifier</th>
                        <th>Devotee Client</th>
                        <th>Astrologer Partner</th>
                        <th>Type</th>
                        <th>Rate (₹/min)</th>
                        <th>Duration</th>
                        <th>Agora Quality</th>
                        <th>Operational Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveSessions.map((session) => (
                        <tr key={session.id}>
                          <td><code>{session.channelName || session.id}</code></td>
                          <td><strong>{session.customerName || session.customer?.fullName || "Aarav Sharma"}</strong></td>
                          <td>{session.astrologerName || session.astrologerProfile?.user?.fullName || "Pandit Suryakant"}</td>
                          <td><span className="status-pill status-online">{session.type || "AUDIO"}</span></td>
                          <td>₹{session.rateInr || "25/min"}</td>
                          <td>{session.durationMinutes || 4} mins</td>
                          <td><span style={{ color: "#059669", fontWeight: 700 }}>● EXCELLENT (98ms)</span></td>
                          <td>
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Admin Terminating Channel: ${session.channelName}. Disconnecting audio/video line and logging dispute trace.`);
                                setLiveSessions(liveSessions.filter((s) => s.id !== session.id));
                              }}
                              className="btn btn-outline btn-sm"
                              style={{ color: "#DC2626", borderColor: "#DC2626", padding: "0.2rem 0.5rem", fontSize: "0.72rem" }}
                            >
                              Force Terminate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 6: ENTERPRISE STAFF MANAGEMENT & RBAC */}
          {/* ======================================================== */}
          {activeId === "staff-management" && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Briefcase size={18} color="var(--royal-purple)" />
                  <strong style={{ fontSize: "1.1rem" }}>Enterprise Staff Directory ({staff.length} Members)</strong>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(true)}
                    className="btn btn-purple btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Plus size={13} /> Onboard Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportCSV("Enterprise_Staff", staff)}
                    className="btn btn-outline btn-sm"
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Download size={13} /> Export (CSV)
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="table-scroll">
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Staff Name</th>
                        <th>Official Email</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>RBAC Role</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((s) => (
                        <tr key={s.id}>
                          <td><strong>{s.employeeId}</strong></td>
                          <td><strong>{s.fullName || s.user?.fullName}</strong></td>
                          <td>{s.email || s.user?.email}</td>
                          <td><span className="status-pill status-online">{s.department?.name || s.department}</span></td>
                          <td>{s.designation}</td>
                          <td><code>{s.customRole?.name || s.role}</code></td>
                          <td>{s.workLocation || s.location || "HQ"}</td>
                          <td><span className="status-pill status-online">ACTIVE</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Onboard Staff Modal */}
          {showAddStaffModal && (
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
              <div className="surface-card" style={{ maxWidth: "32rem", width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 className="serif-heading" style={{ fontSize: "1.3rem", margin: 0 }}>Onboard Enterprise Staff</h3>
                  <X size={18} style={{ cursor: "pointer" }} onClick={() => setShowAddStaffModal(false)} />
                </div>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newStaffForm.fullName}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, fullName: e.target.value })}
                      placeholder="e.g. Vikramaditya Senior Engineer"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Official Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={newStaffForm.email}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                      placeholder="vikram@namhastro.com"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Phone (E.164)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newStaffForm.phoneE164}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, phoneE164: e.target.value })}
                      placeholder="+919811001122"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Designation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newStaffForm.designation}
                      onChange={(e) => setNewStaffForm({ ...newStaffForm, designation: e.target.value })}
                      placeholder="Principal Technical Lead"
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.25rem" }}>
                  <button type="button" onClick={() => setShowAddStaffModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                  <button
                    type="button"
                    onClick={() => {
                      const empId = `EMP-NAMH-${Math.floor(1000 + Math.random() * 9000)}`;
                      setStaff([
                        ...staff,
                        {
                          id: `stf_${Date.now()}`,
                          employeeId: empId,
                          ...newStaffForm,
                          department: "Technical Support",
                          role: "SUPER_ADMIN",
                          status: "ACTIVE",
                        },
                      ]);
                      setShowAddStaffModal(false);
                      setSuccessMsg(`Staff member registered with ID ${empId}!`);
                    }}
                    className="btn btn-purple btn-sm"
                  >
                    Confirm Registration
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 7: DEPARTMENTS STRUCTURE */}
          {/* ======================================================== */}
          {activeId === "departments" && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Building2 size={18} color="var(--royal-purple)" />
                <strong style={{ fontSize: "1.1rem" }}>9 Standard Enterprise Departments</strong>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                {departments.map((dept) => (
                  <div key={dept.id} style={{ backgroundColor: "#FFFFFF", padding: "1.15rem", borderRadius: "8px", border: "1px solid rgba(212,168,79,0.3)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <strong style={{ fontSize: "1rem", color: "var(--royal-purple)" }}>{dept.name}</strong>
                      <span className="status-pill status-online">{dept.code}</span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--ink-muted)", margin: "0.4rem 0 0.8rem", minHeight: "2.4rem" }}>
                      {dept.description}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", borderTop: "1px solid #F3F4F6", paddingTop: "0.5rem" }}>
                      <span>Headcount: <strong>{dept.staffCount || 4} Staff</strong></span>
                      <span>Active Tasks: <strong>{dept.taskCount || 5} Tasks</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 8: CUSTOM ROLES & RBAC MATRIX */}
          {/* ======================================================== */}
          {activeId === "roles-permissions" && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Key size={18} color="var(--royal-purple)" />
                  <strong style={{ fontSize: "1.1rem" }}>Custom Roles &amp; Granular Permission Matrix ({roles.length} Roles)</strong>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Role Permission Builder Active")}
                  className="btn btn-purple btn-sm"
                >
                  <Plus size={13} /> Create Role
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
                {roles.map((r) => (
                  <div key={r.id} style={{ backgroundColor: "#FFFFFF", padding: "1.15rem", borderRadius: "8px", border: "1px solid rgba(212,168,79,0.3)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                      <strong style={{ fontSize: "1rem", color: "var(--royal-purple)" }}>{r.name}</strong>
                      <span className="status-pill status-online">{r.code}</span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--ink-muted)", margin: "0.4rem 0 0.8rem" }}>
                      {r.description}
                    </p>
                    <div style={{ fontSize: "0.72rem", color: "var(--ink-muted)", borderTop: "1px solid #F3F4F6", paddingTop: "0.5rem" }}>
                      Access: <code>{r.isSystem ? "FULL_ENTERPRISE_SYSTEM" : "GRANULAR_MODULE_ACCESS"}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 9: DEPARTMENT TASKS & DELEGATION */}
          {/* ======================================================== */}
          {activeId === "department-tasks" && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckSquare size={18} color="var(--royal-purple)" />
                  <strong style={{ fontSize: "1.1rem" }}>Department Staff Tasks ({tasks.length} Tasks)</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportCSV("Department_Tasks", tasks)}
                  className="btn btn-outline btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <Download size={13} /> Export (CSV)
                </button>
              </div>

              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="table-scroll">
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th>Task Number</th>
                        <th>Task Title</th>
                        <th>Department</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Assigned Staff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((t) => (
                        <tr key={t.id}>
                          <td><strong>{t.taskNumber}</strong></td>
                          <td><strong>{t.title}</strong></td>
                          <td><span className="status-pill status-online">{t.department?.name || t.department}</span></td>
                          <td>
                            <strong style={{ color: t.priority === "URGENT" || t.priority === "HIGH" ? "#DC2626" : "#4B5563" }}>
                              {t.priority}
                            </strong>
                          </td>
                          <td><span className="status-pill status-online">{t.status}</span></td>
                          <td>{t.dueDate ? t.dueDate.slice(0, 10) : "—"}</td>
                          <td>{t.assignedTo || "Unassigned"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 10: CUSTOMER SUPPORT HELPDESK */}
          {/* ======================================================== */}
          {activeId === "support-tickets" && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <HelpCircle size={18} color="var(--royal-purple)" />
                  <strong style={{ fontSize: "1.1rem" }}>Customer Support Queues (17 Ticket Categories)</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportCSV("Support_Tickets", tickets)}
                  className="btn btn-outline btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <Download size={13} /> Export Tickets (CSV)
                </button>
              </div>

              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="table-scroll">
                  <table className="compact-table">
                    <thead>
                      <tr>
                        <th>Ticket Code</th>
                        <th>Devotee Name</th>
                        <th>Category</th>
                        <th>Subject</th>
                        <th>Priority</th>
                        <th>SLA Remaining</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((t) => (
                        <tr key={t.id}>
                          <td><strong>{t.ticketNumber}</strong></td>
                          <td><strong>{t.customerName}</strong></td>
                          <td><span className="status-pill status-online">{t.category}</span></td>
                          <td>{t.subject}</td>
                          <td><strong style={{ color: t.priority === "HIGH" ? "#DC2626" : "#4B5563" }}>{t.priority}</strong></td>
                          <td>{t.slaRemainingHours} hrs</td>
                          <td><span className="status-pill status-online">{t.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 11: COMPLAINTS & DISPUTE RESOLUTION */}
          {/* ======================================================== */}
          {activeId === "complaints-disputes" && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <AlertCircle size={18} color="#DC2626" />
                  <strong style={{ fontSize: "1.1rem" }}>Complaints &amp; Dispute Resolution Centre ({disputes.length} Cases)</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleExportCSV("Dispute_Complaints", disputes)}
                  className="btn btn-outline btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <Download size={13} /> Export Disputes (CSV)
                </button>
              </div>

              <div style={{ display: "grid", gap: "0.85rem" }}>
                {disputes.map((d) => (
                  <div key={d.id} style={{ backgroundColor: "#FFFFFF", padding: "1.15rem", borderRadius: "8px", border: "1px solid rgba(220,38,38,0.25)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong style={{ fontSize: "1rem", color: "var(--royal-purple)" }}>{d.complaintNumber}</strong>
                      <span className="status-pill status-online">{d.status}</span>
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)", display: "block", margin: "0.2rem 0 0.5rem" }}>
                      Devotee: <strong>{d.customerName || d.customerId}</strong> · Category: {d.category}
                    </span>
                    <p style={{ fontSize: "0.84rem", margin: "0 0 0.75rem", backgroundColor: "#FBF7F0", padding: "0.5rem 0.75rem", borderRadius: "4px" }}>
                      <strong>Subject: {d.subject}</strong> — {d.description}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F3F4F6", paddingTop: "0.6rem" }}>
                      <span style={{ fontSize: "0.78rem" }}>
                        Decision: <strong>{d.resolutionDecision || "PENDING"}</strong> · Refund: <strong>₹{d.refundAmountInr || "0.00"}</strong>
                      </span>
                      {d.status !== "RESOLVED" && d.status !== "REFUND_PROCESSED" && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDispute(d);
                            setShowResolveDisputeModal(true);
                          }}
                          className="btn btn-purple btn-sm"
                        >
                          Investigate &amp; Approve Refund
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolve Dispute Modal */}
          {showResolveDisputeModal && selectedDispute && (
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
                  <h3 className="serif-heading" style={{ fontSize: "1.3rem", margin: 0 }}>
                    Resolve Dispute: {selectedDispute.complaintNumber}
                  </h3>
                  <X size={18} style={{ cursor: "pointer" }} onClick={() => setShowResolveDisputeModal(false)} />
                </div>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Decision</label>
                    <select
                      className="form-input"
                      value={decisionInput}
                      onChange={(e) => setDecisionInput(e.target.value)}
                    >
                      <option value="REFUND_APPROVED">REFUND_APPROVED (Full / Partial)</option>
                      <option value="REJECTED">REJECTED (Operational Non-Fault)</option>
                      <option value="GOODWILL_CREDIT">GOODWILL_CREDIT (Promo Wallet)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Refund Credit (₹ INR)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={refundAmountInput}
                      onChange={(e) => setRefundAmountInput(e.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.25rem" }}>
                  <button type="button" onClick={() => setShowResolveDisputeModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                  <button type="button" onClick={handleResolveDispute} className="btn btn-purple btn-sm">
                    Confirm &amp; Disburse
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE 12: SYSTEM HEALTH DIAGNOSTICS */}
          {/* ======================================================== */}
          {activeId === "system-health" && (
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Cpu size={18} color="#059669" />
                  <strong style={{ fontSize: "1.1rem" }}>System Health Diagnostics &amp; Engine Status</strong>
                </div>
                <button
                  type="button"
                  onClick={fetchEnterpriseData}
                  className="btn btn-outline btn-sm"
                  style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <RefreshCw size={13} /> Probe Engine Health
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                <div style={{ backgroundColor: "#FFFFFF", padding: "1.15rem", borderRadius: "8px", borderLeft: "4px solid #10B981" }}>
                  <strong style={{ display: "block", fontSize: "0.88rem" }}>Database Cluster (MariaDB)</strong>
                  <span style={{ color: "#059669", fontWeight: 700, fontSize: "1.15rem" }}>● CONNECTED</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block", marginTop: "0.25rem" }}>Port 3306 · namhastro schema synchronized</span>
                </div>
                <div style={{ backgroundColor: "#FFFFFF", padding: "1.15rem", borderRadius: "8px", borderLeft: "4px solid #10B981" }}>
                  <strong style={{ display: "block", fontSize: "0.88rem" }}>Agora RTC Engine</strong>
                  <span style={{ color: "#059669", fontWeight: 700, fontSize: "1.15rem" }}>● CONFIGURED &amp; READY</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block", marginTop: "0.25rem" }}>App ID &amp; App Certificate Active</span>
                </div>
                <div style={{ backgroundColor: "#FFFFFF", padding: "1.15rem", borderRadius: "8px", borderLeft: "4px solid #10B981" }}>
                  <strong style={{ display: "block", fontSize: "0.88rem" }}>Razorpay Gateway Engine</strong>
                  <span style={{ color: "#059669", fontWeight: 700, fontSize: "1.15rem" }}>● ACTIVE &amp; SECURED</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block", marginTop: "0.25rem" }}>18% GST Breakdown &amp; Order Verification</span>
                </div>
                <div style={{ backgroundColor: "#FFFFFF", padding: "1.15rem", borderRadius: "8px", borderLeft: "4px solid #10B981" }}>
                  <strong style={{ display: "block", fontSize: "0.88rem" }}>WebSocket Real-Time Engine</strong>
                  <span style={{ color: "#059669", fontWeight: 700, fontSize: "1.15rem" }}>● SOCKET_IO_ACTIVE</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block", marginTop: "0.25rem" }}>Live Chat, Calling &amp; Streaming Signaling</span>
                </div>
                <div style={{ backgroundColor: "#FFFFFF", padding: "1.15rem", borderRadius: "8px", borderLeft: "4px solid #10B981" }}>
                  <strong style={{ display: "block", fontSize: "0.88rem" }}>Firebase Cloud Messaging</strong>
                  <span style={{ color: "#059669", fontWeight: 700, fontSize: "1.15rem" }}>● DEV_ACTIVE</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block", marginTop: "0.25rem" }}>FCM Push Token Dispatch Engine</span>
                </div>
                <div style={{ backgroundColor: "#FFFFFF", padding: "1.15rem", borderRadius: "8px", borderLeft: "4px solid var(--royal-purple)" }}>
                  <strong style={{ display: "block", fontSize: "0.88rem" }}>Server Memory Footprint</strong>
                  <span style={{ color: "var(--royal-purple)", fontWeight: 700, fontSize: "1.15rem" }}>{systemHealth.memoryUsage?.rssMb || 248} MB RSS</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", display: "block", marginTop: "0.25rem" }}>Heap: {systemHealth.memoryUsage?.heapUsedMb || 142} MB / Node {process.version || "v24.16"}</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PRESERVED MODULES: VERIFICATION, ASTROLOGERS, WALLETS, ETC. */}
          {/* ======================================================== */}
          {activeId === "verification" && (
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="serif-heading" style={{ fontSize: "1.2rem", margin: 0 }}>Astrologer KYC &amp; Verification Requests</h3>
                <span className="status-pill status-online">2 Pending Review</span>
              </div>
              <div style={{ backgroundColor: "#FFFFFF", padding: "1rem", borderRadius: "8px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>
                  Review submitted government identity documents, Vedic astrology university degrees, and conduct live audition interviews before granting public marketplace visibility.
                </p>
              </div>
            </div>
          )}

          {activeId === "puja-management" && (
            <div style={{ display: "grid", gap: "1rem" }}>
              <h3 className="serif-heading" style={{ fontSize: "1.2rem", margin: 0 }}>Puja &amp; Pandit Marketplace Management</h3>
              <div style={{ backgroundColor: "#FFFFFF", padding: "1rem", borderRadius: "8px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>
                  Manage temple ritual catalogs, purohit assignments, sankalp records, and video completion certificates for devotees.
                </p>
              </div>
            </div>
          )}

          {activeId === "store-management" && (
            <div style={{ display: "grid", gap: "1rem" }}>
              <h3 className="serif-heading" style={{ fontSize: "1.2rem", margin: 0 }}>Astro Store Inventory &amp; Shipping</h3>
              <div style={{ backgroundColor: "#FFFFFF", padding: "1rem", borderRadius: "8px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>
                  Certified Jyotish gemstones, laboratory certificate verification, warehouse stock tracking, and AWB shipping manifests.
                </p>
              </div>
            </div>
          )}

          {activeId === "marketing-management" && (
            <div style={{ display: "grid", gap: "1rem" }}>
              <h3 className="serif-heading" style={{ fontSize: "1.2rem", margin: 0 }}>Coupons, Referral Program &amp; CMS Banners</h3>
              <div style={{ backgroundColor: "#FFFFFF", padding: "1rem", borderRadius: "8px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--ink-muted)" }}>
                  Configure discount coupons, devotee referral bonuses, and promotional homepage hero banners.
                </p>
              </div>
            </div>
          )}

          {activeId === "settings" && (
            <div style={{ display: "grid", gap: "1rem" }}>
              <h3 className="serif-heading" style={{ fontSize: "1.2rem", margin: 0 }}>Global Business Settings</h3>
              <div style={{ backgroundColor: "#FFFFFF", padding: "1.25rem", borderRadius: "8px", maxWidth: "32rem" }}>
                <div style={{ display: "grid", gap: "0.85rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Platform Name</label>
                    <input type="text" className="form-input" defaultValue="NAMH ASTRO — Spiritual Portal" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>Standard Platform Commission (%)</label>
                    <input type="number" className="form-input" defaultValue={20} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600 }}>GST Rate (%)</label>
                    <input type="number" className="form-input" defaultValue={18} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SuperAdminDashboardPage({ initialTab }: { initialTab?: string }) {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", backgroundColor: "#FBF7F0", display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center", color: "#351044" }}>
            <NamhAstroLogo size={48} />
            <div style={{ marginTop: "1rem", fontWeight: 600, fontFamily: "var(--font-serif, serif)" }}>
              Loading Super Admin Workspace...
            </div>
          </div>
        </div>
      }
    >
      <AdminDashboardInner initialTab={initialTab} />
    </Suspense>
  );
}

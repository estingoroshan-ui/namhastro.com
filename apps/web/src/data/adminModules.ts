import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CheckSquare,
  Clock,
  Cpu,
  CreditCard,
  Database,
  DollarSign,
  FileBarChart,
  FileCheck,
  Flame,
  Globe,
  HelpCircle,
  IndianRupee,
  Key,
  LayoutDashboard,
  RotateCcw,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

export interface AdminModuleItem {
  id: string;
  label: string;
  icon: any;
  count: string;
}

export interface AdminGroupItem {
  name: string;
  modules: AdminModuleItem[];
}

export const ADMIN_GROUPS: AdminGroupItem[] = [
  {
    name: "Executive & Growth",
    modules: [
      { id: "dashboard", label: "Master Business Overview", icon: LayoutDashboard, count: "Live" },
      { id: "analytics", label: "Advanced Analytics & Growth", icon: BarChart3, count: "Metrics" },
    ],
  },
  {
    name: "Customer CRM & Sales",
    modules: [
      { id: "customer-crm", label: "Customer 360° Directory", icon: Users, count: "Devotees" },
      { id: "sales-crm", label: "Sales Lead Pipeline", icon: CheckSquare, count: "CRM" },
    ],
  },
  {
    name: "Live Operations & Calling",
    modules: [
      { id: "live-operations", label: "Live Consultation Control", icon: Activity, count: "Active" },
      { id: "consultations", label: "Consultation Queue & Logs", icon: Clock, count: "Agora" },
      { id: "verification", label: "Astrologer KYC & Verification", icon: ShieldCheck, count: "KYC" },
      { id: "online-astrologers", label: "Astrologer Directory & Rates", icon: UserCheck, count: "Partners" },
      { id: "rate-changes", label: "Rate Change Requests", icon: DollarSign, count: "Requests" },
    ],
  },
  {
    name: "Spiritual Marketplace",
    modules: [
      { id: "puja-management", label: "Online Puja & Rituals", icon: Flame, count: "Pujas" },
      { id: "store-management", label: "Astro Store & Inventory", icon: ShoppingBag, count: "Store" },
    ],
  },
  {
    name: "Finance, Ledger & Settlements",
    modules: [
      { id: "wallets", label: "Devotee Wallet Accounts", icon: Wallet, count: "Ledger" },
      { id: "commission", label: "Dynamic Commission Rules", icon: FileCheck, count: "Rules" },
      { id: "withdrawals", label: "Withdrawals & Payouts", icon: IndianRupee, count: "Payouts" },
      { id: "settlements", label: "Settlement Batches", icon: CreditCard, count: "Batches" },
      { id: "pnl", label: "P&L Ledger & Expenses", icon: FileBarChart, count: "P&L" },
      { id: "reconciliation", label: "Three-Way Reconciliation", icon: RotateCcw, count: "Audit" },
    ],
  },
  {
    name: "Customer Support & Disputes",
    modules: [
      { id: "support-tickets", label: "Customer Support Helpdesk", icon: HelpCircle, count: "17 Queues" },
      { id: "complaints-disputes", label: "Complaints & Dispute Resolution", icon: AlertCircle, count: "Refunds" },
    ],
  },
  {
    name: "Staff Management & RBAC",
    modules: [
      { id: "staff-management", label: "Enterprise Staff Directory", icon: Briefcase, count: "HR" },
      { id: "departments", label: "Department Structure", icon: Building2, count: "9 Depts" },
      { id: "roles-permissions", label: "Custom Roles & Permissions", icon: Key, count: "RBAC" },
      { id: "department-tasks", label: "Department Tasks & Delegation", icon: CheckSquare, count: "Tasks" },
    ],
  },
  {
    name: "Content & Marketing CMS",
    modules: [
      { id: "marketing-management", label: "Referral & Coupon Engine", icon: Sparkles, count: "Growth" },
      { id: "website-cms", label: "Website & Mobile App CMS", icon: Globe, count: "CMS" },
      { id: "notifications", label: "Notification Templates & FCM", icon: Bell, count: "Alerts" },
    ],
  },
  {
    name: "System Diagnostics & Governance",
    modules: [
      { id: "system-health", label: "System Health Diagnostics", icon: Cpu, count: "Diagnostics" },
      { id: "security-audit", label: "Security & Audit Controls", icon: ShieldAlert, count: "Audit" },
      { id: "backup-recovery", label: "Backup & Recovery Strategy", icon: Database, count: "Backups" },
      { id: "settings", label: "Global Platform Settings", icon: Settings, count: "Config" },
    ],
  },
];

export const ADMIN_MODULES: AdminModuleItem[] = ADMIN_GROUPS.flatMap((g) => g.modules);

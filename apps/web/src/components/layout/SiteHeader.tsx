"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  BookOpen,
  Compass,
  Flame,
  HeartHandshake,
  Home,
  LayoutGrid,
  Menu,
  MessageCircle,
  PhoneCall,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Sun,
  User,
  UserPlus,
  Video,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NamhAstroLogo } from "@/components/icons/ZodiacIcons";

const SERVICE_NAV = [
  { label: "Home", href: "/", icon: Home },
  { label: "Chat with Astrologer", href: "/astrologers?mode=chat", icon: MessageCircle },
  { label: "Talk to Astrologer", href: "/astrologers?mode=call", icon: PhoneCall },
  { label: "Video Consultation", href: "/astrologers?mode=video", icon: Video },
  { label: "Free Kundli", href: "/kundli", icon: LayoutGrid },
  { label: "Kundli Matching", href: "/kundli?tab=matching", icon: HeartHandshake },
  { label: "Horoscope", href: "/horoscope", icon: Sun },
  { label: "Panchang", href: "/panchang", icon: Compass },
  { label: "Live Astrologers", href: "/astrologers?filter=online", icon: Radio, isLive: true },
  { label: "Puja Booking", href: "/puja", icon: Flame },
  { label: "Astro Store", href: "/store", icon: ShoppingBag },
  { label: "Become an Astrologer", href: "/partner", icon: UserPlus },
  { label: "Customer Dashboard", href: "/account", icon: User },
  { label: "Super Admin", href: "/admin", icon: ShieldCheck },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openLoginModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("EN");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/astrologers?q=${encodeURIComponent(q)}` : "/astrologers");
  };

  return (
    <>
      {/* 1. Premium Announcement Bar */}
      <div className="announcement-bar">
        <div className="container announcement-inner">
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", minInlineSize: 0 }}>
            <Sparkles size={14} color="#F2C96B" aria-hidden="true" />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span className="announcement-highlight">NAMH ASTRO</span> — 100% Verified Vedic
              Astrologers · Confidential Chat, Audio &amp; Video Consultations
            </span>
          </div>
          <div className="announcement-links">
            <a href="/account">Devotee Dashboard</a>
            <a href="/partner">Astrologer Portal</a>
            <a href="/admin" style={{ color: "#F2C96B", fontWeight: 700 }}>★ Admin Panel</a>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <header className="site-header">
        <div className="container header-main">
          <Link href="/" className="brand-lockup" aria-label="NAMH ASTRO Home">
            <NamhAstroLogo size={42} />
            <div>
              <span className="brand-name">NAMH ASTRO</span>
              <span className="brand-sub">Sacred Vedic Wisdom</span>
            </div>
          </Link>

          <form className="header-search" onSubmit={handleSearch} role="search">
            <input
              type="search"
              className="header-search-input"
              placeholder="Search Astrologer, Service, Report..."
              aria-label="Search Astrologer, Service, Report"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="header-search-btn" aria-label="Search">
              <Search size={17} />
            </button>
          </form>

          <div className="header-utilities">
            <a href="/namhastro.apk" download="namhastro.apk" className="download-app-chip" title="Download NAMH ASTRO Android App (.apk)">
              <Smartphone size={18} color="#351044" aria-hidden="true" />
              <span>
                <strong style={{ display: "block", color: "var(--ink)" }}>Download App</strong>
                <span style={{ color: "var(--ink-muted)" }}>Android (.APK)</span>
              </span>
            </a>

            <select
              aria-label="Select Language"
              className="lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="EN">EN</option>
              <option value="HI">हिंदी</option>
            </select>

            <Link href="/account" className="icon-btn" aria-label="Notifications">
              <Bell size={17} />
              <span className="icon-btn-dot">2</span>
            </Link>

            <Link href="/account/wallet" className="wallet-btn" aria-label="Wallet Balance">
              <Wallet size={15} />
              <span>₹{user?.wallet ? user.wallet.totalBalanceInr.toFixed(2) : "0.00"}</span>
              <Plus size={13} />
            </Link>

            {user ? (
              <Link href="/account" className="login-btn" title={`Signed in as ${user.fullName}`}>
                <User size={15} />
                <span>{user.fullName.split(" ")[0]}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="login-btn"
                style={{ border: 0, cursor: "pointer" }}
              >
                <User size={15} />
                <span>Login / Register</span>
              </button>
            )}

            <a
              href="/admin"
              className="login-btn"
              style={{
                backgroundColor: "rgba(53, 16, 68, 0.08)",
                border: "1px solid rgba(212, 168, 79, 0.5)",
                color: "var(--royal-purple)",
                fontWeight: 700,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
              title="Super Admin Workspace"
            >
              <ShieldCheck size={15} color="#D4A84F" />
              <span>Admin</span>
            </a>

            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* 3. Dedicated Royal Purple Service Navigation Bar */}
        <nav className="service-nav-bar" aria-label="Astrology Services">
          <div className="container">
            <ul className="service-nav-list">
              {SERVICE_NAV.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href.split("?")[0]) && item.href !== "/";
                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="service-nav-link"
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon size={14} aria-hidden="true" />
                      <span>{item.label}</span>
                      {item.isLive ? <span className="live-chip">Live</span> : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Drawer */}
      {drawerOpen ? (
        <div
          className="mobile-drawer-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          onClick={() => setDrawerOpen(false)}
        >
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                background: "var(--royal-purple)",
                color: "var(--white)",
              }}
            >
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  textDecoration: "none",
                  color: "#FFFFFF",
                }}
                aria-label="NAMH ASTRO Home"
              >
                <NamhAstroLogo size={34} />
                <strong style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem" }}>
                  NAMH ASTRO
                </strong>
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                style={{
                  background: "rgba(255,255,255,0.14)",
                  border: 0,
                  borderRadius: "9999px",
                  color: "#fff",
                  padding: "0.4rem",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "0.85rem", borderBlockEnd: "1px solid var(--border)" }}>
              <form
                onSubmit={(e) => {
                  handleSearch(e);
                  setDrawerOpen(false);
                }}
                style={{ display: "flex", gap: "0.5rem" }}
              >
                <input
                  type="search"
                  className="form-input"
                  placeholder="Search astrologer or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="btn btn-purple btn-sm">
                  Go
                </button>
              </form>
            </div>

            <ul style={{ padding: "0.65rem", display: "grid", gap: "0.2rem" }}>
              {SERVICE_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.7rem",
                        padding: "0.65rem 0.75rem",
                        borderRadius: "var(--radius-sm)",
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        color: "var(--ink)",
                      }}
                    >
                      <Icon size={17} color="#351044" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <div
              style={{
                marginBlockStart: "auto",
                padding: "1rem",
                borderBlockStart: "1px solid var(--border)",
                display: "grid",
                gap: "0.55rem",
                background: "var(--ivory)",
              }}
            >
              <a
                href="/account"
                className="btn btn-purple"
                onClick={() => setDrawerOpen(false)}
              >
                <User size={16} /> Customer Dashboard
              </a>
              <a
                href="/partner"
                className="btn btn-outline"
                onClick={() => setDrawerOpen(false)}
              >
                <BookOpen size={16} /> Astrologer Partner Portal
              </a>
              <a
                href="/admin"
                className="btn btn-sm btn-gold"
                onClick={() => setDrawerOpen(false)}
                style={{ textAlign: "center" }}
              >
                <ShieldCheck size={16} /> Super Admin (36 Modules)
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

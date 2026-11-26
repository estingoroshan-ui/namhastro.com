"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, PhoneCall, Radio, User } from "lucide-react";

const TABS = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "chat", label: "Chat", href: "/consultation/chat", icon: MessageCircle },
  { id: "call", label: "Call", href: "/consultation/call", icon: PhoneCall },
  { id: "live", label: "Live", href: "/astrologers?filter=online", icon: Radio },
  { id: "profile", label: "Profile", href: "/account", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href.split("#")[0]) && tab.href !== "/";
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className="mobile-tab"
            aria-current={active ? "page" : undefined}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

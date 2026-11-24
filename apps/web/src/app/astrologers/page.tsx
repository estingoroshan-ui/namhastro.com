"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, MessageCircle, PhoneCall, Search, SlidersHorizontal, Video } from "lucide-react";
import { ASTROLOGY_SPECIALISATIONS } from "@namhastro/shared";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { AstrologerCard } from "@/components/marketplace/AstrologerCard";
import { ASTROLOGER_SHOWCASE } from "@/data/marketplace";

function AstrologerDirectoryContent() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [mode, setMode] = useState<"all" | "chat" | "call" | "video">(
    (params.get("mode") as "chat" | "call" | "video") || "all"
  );
  const [speciality, setSpeciality] = useState(params.get("speciality") ?? "All");
  const [language, setLanguage] = useState(params.get("lang") ?? "All");
  const [onlineOnly, setOnlineOnly] = useState(params.get("status") === "ONLINE");
  const [sortBy, setSortBy] = useState<"rating" | "price-asc" | "price-desc" | "exp">(
    (params.get("sort") as "rating") || "rating"
  );

  const filtered = useMemo(() => {
    const list = ASTROLOGER_SHOWCASE.filter((a) => {
      if (onlineOnly && a.status !== "ONLINE") return false;
      if (speciality !== "All" && !a.specialisations.includes(speciality)) return false;
      if (language !== "All" && !a.languages.includes(language)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${a.name} ${a.specialisations.join(" ")} ${a.languages.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "price-asc") return a.chatRateInr - b.chatRateInr;
      if (sortBy === "price-desc") return b.chatRateInr - a.chatRateInr;
      if (sortBy === "exp") return b.experienceYears - a.experienceYears;
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  }, [query, speciality, language, onlineOnly, sortBy]);

  return (
    <main className="mp-section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="section-eyebrow">KYC Verified Vedic Experts</span>
            <h1 className="section-title">
              {mode === "chat"
                ? "Chat with Verified Astrologers"
                : mode === "call"
                  ? "Talk to Verified Astrologers"
                  : mode === "video"
                    ? "Video Consultation with Astrologers"
                    : "Explore All Verified Astrologers"}
            </h1>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem" }}>
            <button
              type="button"
              className={mode === "all" ? "btn btn-purple btn-sm" : "btn btn-outline btn-sm"}
              onClick={() => setMode("all")}
            >
              All Modes
            </button>
            <button
              type="button"
              className={mode === "chat" ? "btn btn-purple btn-sm" : "btn btn-outline btn-sm"}
              onClick={() => setMode("chat")}
            >
              <MessageCircle size={14} /> Chat
            </button>
            <button
              type="button"
              className={mode === "call" ? "btn btn-purple btn-sm" : "btn btn-outline btn-sm"}
              onClick={() => setMode("call")}
            >
              <PhoneCall size={14} /> Audio Call
            </button>
            <button
              type="button"
              className={mode === "video" ? "btn btn-purple btn-sm" : "btn btn-outline btn-sm"}
              onClick={() => setMode("video")}
            >
              <Video size={14} /> Video Call
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div
          className="surface-card"
          style={{
            marginBlockEnd: "1.5rem",
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 11.5rem), 1fr))",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              style={{ position: "absolute", insetInlineStart: "0.75rem", insetBlockStart: "50%", transform: "translateY(-50%)", color: "var(--ink-subtle)" }}
            />
            <input
              type="search"
              className="form-input"
              style={{ paddingInlineStart: "2.2rem" }}
              placeholder="Search name or skill..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            aria-label="Filter by Speciality"
            className="form-select"
            value={speciality}
            onChange={(e) => setSpeciality(e.target.value)}
          >
            <option value="All">All Specialities</option>
            {ASTROLOGY_SPECIALISATIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            aria-label="Filter by Language"
            className="form-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="All">All Languages</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
            <option value="Marathi">Marathi</option>
            <option value="Gujarati">Gujarati</option>
            <option value="Bengali">Bengali</option>
            <option value="Punjabi">Punjabi</option>
          </select>

          <select
            aria-label="Sort Astrologers"
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "rating" | "price-asc" | "price-desc" | "exp")}
          >
            <option value="rating">Sort: Highest Rated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="exp">Experience: Most Senior</option>
          </select>

          <label style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.84rem", fontWeight: 600, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => setOnlineOnly(e.target.checked)}
            />
            <SlidersHorizontal size={14} color="#16A34A" /> Online Now Only
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "1rem", fontSize: "0.84rem", color: "var(--ink-muted)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <Filter size={14} /> Showing <strong>{filtered.length}</strong> astrologers
          </span>
          {(query || speciality !== "All" || language !== "All" || onlineOnly) ? (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setQuery("");
                setSpeciality("All");
                setLanguage("All");
                setOnlineOnly(false);
              }}
            >
              Reset Filters
            </button>
          ) : null}
        </div>

        <div className="astro-grid">
          {filtered.map((a) => (
            <AstrologerCard key={a.id} astrologer={a} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function AstrologersPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<div className="container mp-section">Loading verified astrologers...</div>}>
        <AstrologerDirectoryContent />
      </Suspense>
      <SiteFooter />
      <MobileBottomNav />
    </>
  );
}

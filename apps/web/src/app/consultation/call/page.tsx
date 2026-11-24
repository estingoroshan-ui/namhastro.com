"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  RefreshCw,
  ShieldCheck,
  Signal,
  Video,
  Volume2,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { ASTROLOGER_SHOWCASE } from "@/data/marketplace";

export default function AudioVideoCallPage() {
  const astrologer = ASTROLOGER_SHOWCASE[3];
  const [mode, setMode] = useState<"video" | "audio">("video");
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);

  return (
    <>
      <SiteHeader />
      <main className="mp-section" style={{ paddingBlock: "1.25rem 5.5rem" }}>
        <div className="container" style={{ maxInlineSize: "64rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.65rem", marginBlockEnd: "1rem" }}>
            <Link href="/astrologers" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontWeight: 600, color: "var(--royal-purple)", fontSize: "0.85rem" }}>
              <ArrowLeft size={15} /> Back to Astrologers
            </Link>
            <div style={{ display: "flex", gap: "0.45rem" }}>
              <button
                type="button"
                className={mode === "video" ? "btn btn-purple btn-sm" : "btn btn-outline btn-sm"}
                onClick={() => setMode("video")}
              >
                <Video size={14} /> Video Consultation
              </button>
              <button
                type="button"
                className={mode === "audio" ? "btn btn-purple btn-sm" : "btn btn-outline btn-sm"}
                onClick={() => setMode("audio")}
              >
                <PhoneCall size={14} /> Audio Call
              </button>
            </div>
          </div>

          <div
            className="surface-card"
            style={{
              background: "linear-gradient(160deg, var(--deep-plum) 0%, var(--royal-purple) 60%, #4A1861 100%)",
              color: "#FFFFFF",
              borderColor: "var(--champagne-gold)",
              padding: "1.5rem",
              display: "grid",
              gap: "1.5rem",
            }}
          >
            {/* Top Status Bar */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", color: "#F2C96B", fontWeight: 700, textTransform: "uppercase" }}>
                  {mode === "video" ? "HD WebRTC Video Room" : "Encrypted Voice Room"} · Ready for RTC Token (Step 7)
                </span>
                <h1 className="serif-heading" style={{ color: "#FFFFFF", fontSize: "1.6rem" }}>
                  {astrologer.name}
                </h1>
              </div>
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", fontSize: "0.8rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.7rem", borderRadius: "9999px", backgroundColor: "rgba(22,163,74,0.22)", color: "#86EFAC" }}>
                  <Signal size={13} /> HD Quality
                </span>
                <Link href="/account/wallet" className="wallet-btn">
                  <Wallet size={14} /> ₹0.00
                </Link>
              </div>
            </div>

            {/* Stage */}
            <div
              style={{
                minBlockSize: "20rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(0,0,0,0.26)",
                border: "1px solid rgba(212,168,79,0.35)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "1.5rem",
                textAlign: "center",
                gap: "0.85rem",
              }}
            >
              <img
                src={astrologer.photo}
                alt={astrologer.name}
                style={{
                  inlineSize: mode === "video" ? "9.5rem" : "7.5rem",
                  blockSize: mode === "video" ? "9.5rem" : "7.5rem",
                  borderRadius: "9999px",
                  objectFit: "cover",
                  border: "3px solid var(--champagne-gold)",
                }}
              />
              <div>
                <strong style={{ display: "block", fontSize: "1.05rem" }}>
                  {mode === "video" ? `₹${astrologer.videoRateInr}/min Video Consultation` : `₹${astrologer.audioRateInr}/min Audio Consultation`}
                </strong>
                <p style={{ color: "rgba(255,255,255,0.78)", fontSize: "0.82rem", marginBlockStart: "0.25rem" }}>
                  Personal phone numbers are never shared. Ephemeral WebRTC credentials are minted server-side.
                </p>
              </div>
            </div>

            {/* Controls Bar */}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem" }}>
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: muted ? "var(--saffron)" : "rgba(255,255,255,0.14)", color: "#fff" }}
                onClick={() => setMuted((v) => !v)}
              >
                {muted ? <MicOff size={16} /> : <Mic size={16} />}
                {muted ? "Unmute" : "Mute"}
              </button>

              <button
                type="button"
                className="btn"
                style={{ backgroundColor: speakerOn ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)", color: "#fff" }}
                onClick={() => setSpeakerOn((v) => !v)}
              >
                <Volume2 size={16} /> Speaker
              </button>

              {mode === "video" ? (
                <>
                  <button
                    type="button"
                    className="btn"
                    style={{ backgroundColor: !cameraOn ? "var(--saffron)" : "rgba(255,255,255,0.14)", color: "#fff" }}
                    onClick={() => setCameraOn((v) => !v)}
                  >
                    {cameraOn ? <Camera size={16} /> : <CameraOff size={16} />}
                    {cameraOn ? "Camera On" : "Camera Off"}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    style={{ backgroundColor: "rgba(255,255,255,0.14)", color: "#fff" }}
                  >
                    <RefreshCw size={16} /> Flip Camera
                  </button>
                </>
              ) : null}

              <Link href="/astrologers" className="btn" style={{ backgroundColor: "var(--live-red)", color: "#fff" }}>
                <PhoneOff size={16} /> End Call
              </Link>
            </div>

            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.45rem", fontSize: "0.76rem", color: "rgba(255,255,255,0.75)" }}>
              <ShieldCheck size={14} color="#F2C96B" />
              Calls are never recorded without explicit notice and user consent.
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </>
  );
}

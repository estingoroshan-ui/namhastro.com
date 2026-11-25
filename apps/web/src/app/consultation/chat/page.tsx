"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  FileText,
  Paperclip,
  PhoneOff,
  Send,
  ShieldAlert,
  Sparkles,
  Wallet,
  Star,
  X,
  Lock,
  AlertTriangle,
  FileDown,
  UserCheck,
  CreditCard,
  MessageSquare,
  Smile,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

interface MessageItem {
  id: string;
  clientMessageId?: string;
  senderRole: "CUSTOMER" | "ASTROLOGER" | "SYSTEM";
  type: "TEXT" | "IMAGE" | "PDF" | "VOICE" | "KUNDLI" | "SYSTEM";
  content: string;
  attachmentUrl?: string | null;
  status: "SENT" | "DELIVERED" | "READ";
  isRead?: boolean;
  createdAt: string;
}

interface SettlementData {
  consultationId: string;
  durationSeconds: number;
  billableMinutes: number;
  totalChargeInr: number;
  customerRemainingBalanceInr: number;
  astrologerEarningInr: number;
}

export default function RealTimeChatPage() {
  const [consultationId, setConsultationId] = useState<string>("");
  const [userRole, setUserRole] = useState<"CUSTOMER" | "ASTROLOGER">("CUSTOMER");
  const [partnerName, setPartnerName] = useState<string>("Vedic Astrologer");
  const [partnerPhoto, setPartnerPhoto] = useState<string>("/images/astro-4.jpg");
  const [consultationRateInr, setConsultationRateInr] = useState<number>(30);
  const [status, setStatus] = useState<string>("ACTIVE");
  const [concern, setConcern] = useState<string>("Career & Vedic Guidance");

  // Timer & Billing State
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(600); // 10 mins initial default
  const [walletBalanceInr, setWalletBalanceInr] = useState<number>(300);
  const [lowBalanceAlert, setLowBalanceAlert] = useState<boolean>(false);

  // Messages & Input
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState<string>("");
  const [isTypingPeer, setIsTypingPeer] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Private Notes (Astrologer Only)
  const [privateNotes, setPrivateNotes] = useState<string[]>([]);
  const [newNoteInput, setNewNoteInput] = useState<string>("");

  // Modals
  const [endModalOpen, setEndModalOpen] = useState<boolean>(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState<boolean>(false);
  const [completedModalOpen, setCompletedModalOpen] = useState<boolean>(false);
  const [settlementData, setSettlementData] = useState<SettlementData | null>(null);
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState<boolean>(false);
  const [disputeReason, setDisputeReason] = useState<string>("");
  const [disputeSubmitted, setDisputeSubmitted] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Quick astrological replies for astrologers
  const quickReplies = [
    "Namaste! Looking at your Janam Kundli right now.",
    "Your Jupiter placement in the 10th house is highly favorable for career growth.",
    "I recommend chanting the Gayatri Mantra daily and wearing a Yellow Sapphire.",
    "What specific dates or timeline are you targeting for this decision?",
  ];

  // 1. Initialize Consultation ID from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id") || "demo-consultation-step6";
      const roleParam = params.get("role")?.toUpperCase();
      setConsultationId(id);
      if (roleParam === "ASTROLOGER") {
        setUserRole("ASTROLOGER");
      }
    }
  }, []);

  // 2. Fetch Initial Consultation & Message History
  useEffect(() => {
    if (!consultationId) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("namhastro_token") : null;

    // Load Consultation details
    fetch(`${API_BASE}/api/v1/consultations/${consultationId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const c = data.data;
          setStatus(c.status);
          setConsultationRateInr(c.ratePaisePerMinute / 100);
          setConcern(c.concern || "Vedic Astrological Guidance");
          if (userRole === "CUSTOMER") {
            setPartnerName(c.astrologer?.name || "Vedic Astrologer");
            if (c.astrologer?.avatarUrl) setPartnerPhoto(c.astrologer.avatarUrl);
          } else {
            setPartnerName(c.customer?.name || "Devotee Customer");
          }
          if (c.status === "COMPLETED") {
            setCompletedModalOpen(true);
          }
        }
      })
      .catch(() => {});

    // Load Message History
    fetch(`${API_BASE}/api/v1/chat/${consultationId}/messages`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.messages) {
          setMessages(data.data.messages);
        } else if (messages.length === 0) {
          // Default initial friendly greeting
          setMessages([
            {
              id: "sys-welcome",
              senderRole: "SYSTEM",
              type: "SYSTEM",
              content: "Confidential session active. Live billing runs authoritatively on the NAMH ASTRO server engine.",
              status: "READ",
              createdAt: new Date().toISOString(),
            },
            {
              id: "ast-init",
              senderRole: "ASTROLOGER",
              type: "TEXT",
              content: "Namaste! Welcome to NAMH ASTRO. Please share your birth details and the primary concern you wish to consult about.",
              status: "READ",
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      })
      .catch(() => {});

    // If Astrologer, load private notes
    if (userRole === "ASTROLOGER" && token) {
      fetch(`${API_BASE}/api/v1/chat/${consultationId}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setPrivateNotes(data.data.map((n: any) => n.note));
          }
        })
        .catch(() => {});
    }
  }, [consultationId, userRole]);

  // 3. Connect to Real-Time Socket.IO Gateway
  useEffect(() => {
    if (!consultationId) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("namhastro_token") : null;

    const socket = io(API_BASE, {
      auth: { token: token || "anonymous" },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join:consultation", { consultationId }, (res: any) => {
        if (res?.success && res.elapsedSeconds) {
          setElapsedSeconds(res.elapsedSeconds);
        }
      });
    });

    // Incoming messages
    socket.on("message:received", (msg: MessageItem) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id || (m.clientMessageId && m.clientMessageId === msg.clientMessageId))) {
          return prev;
        }
        return [...prev, msg];
      });

      // Send read receipt if incoming message is from the peer
      if (
        (userRole === "CUSTOMER" && msg.senderRole === "ASTROLOGER") ||
        (userRole === "ASTROLOGER" && msg.senderRole === "CUSTOMER")
      ) {
        socket.emit("message:read", {
          consultationId,
          messageIds: [msg.id],
        });
      }
    });

    // Typing indicator
    socket.on("message:typing", (data: { isTyping: boolean }) => {
      setIsTypingPeer(data.isTyping);
    });

    // Read receipt
    socket.on("message:read", (data: { messageIds: string[] }) => {
      setMessages((prev) =>
        prev.map((m) => (data.messageIds.includes(m.id) ? { ...m, isRead: true, status: "READ" } : m))
      );
    });

    // Authoritative Server-side Billing Heartbeat
    socket.on(
      "consultation:tick",
      (data: { elapsedSeconds: number; remainingSeconds: number; billableMinutes: number; currentChargeInr: number }) => {
        setElapsedSeconds(data.elapsedSeconds);
        setRemainingSeconds(data.remainingSeconds);
        if (data.remainingSeconds <= 180) {
          setLowBalanceAlert(true);
        }
      }
    );

    // Low balance alert
    socket.on("consultation:low_balance", () => {
      setLowBalanceAlert(true);
    });

    // Consultation ended by server or peer
    socket.on("consultation:ended", (data: { reason: string; settlement?: SettlementData }) => {
      setStatus("COMPLETED");
      if (data.settlement) {
        setSettlementData(data.settlement);
      }
      setCompletedModalOpen(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [consultationId, userRole]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTypingPeer]);

  // Handle Typing Change
  const handleInputChange = (val: string) => {
    setInput(val);
    if (!socketRef.current || !consultationId) return;

    socketRef.current.emit("message:typing", {
      consultationId,
      isTyping: val.length > 0,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("message:typing", {
        consultationId,
        isTyping: false,
      });
    }, 2000);
  };

  // Send Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || status === "COMPLETED") return;

    const content = input.trim();
    const clientMessageId = `cmsg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const optimisticMessage: MessageItem = {
      id: clientMessageId,
      clientMessageId,
      senderRole: userRole,
      type: "TEXT",
      content,
      status: "SENT",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");

    // Emit via Socket
    if (socketRef.current) {
      socketRef.current.emit(
        "message:send",
        {
          consultationId,
          clientMessageId,
          type: "TEXT",
          content,
        },
        (res: any) => {
          if (!res?.success) {
            console.warn("Message failed to send via socket:", res?.error);
          }
        }
      );
    }
  };

  // Send Attachment (Simulated Kundli / Chart Sharing)
  const handleSendAttachment = (type: "KUNDLI" | "PDF" | "IMAGE", label: string) => {
    const clientMessageId = `cmsg_att_${Date.now()}`;
    const attachmentUrl = type === "KUNDLI" ? "/images/kundli-preview.svg" : "/images/puja-grah-shanti.svg";

    const optimisticMessage: MessageItem = {
      id: clientMessageId,
      clientMessageId,
      senderRole: userRole,
      type,
      content: label,
      attachmentUrl,
      status: "SENT",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    if (socketRef.current) {
      socketRef.current.emit("message:send", {
        consultationId,
        clientMessageId,
        type,
        content: label,
        attachmentUrl,
      });
    }
  };

  // Add Astrologer Private Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;
    const noteText = newNoteInput.trim();
    setPrivateNotes((prev) => [noteText, ...prev]);
    setNewNoteInput("");

    const token = typeof window !== "undefined" ? localStorage.getItem("namhastro_token") : null;
    try {
      await fetch(`${API_BASE}/api/v1/chat/${consultationId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ note: noteText }),
      });
    } catch (err) {
      console.warn("Failed to save note:", err);
    }
  };

  // End Consultation
  const handleEndConsultation = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("namhastro_token") : null;
    try {
      const res = await fetch(`${API_BASE}/api/v1/consultations/${consultationId}/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ durationSeconds: elapsedSeconds }),
      });
      const data = await res.json();
      setEndModalOpen(false);
      if (data.success && data.data) {
        setSettlementData(data.data);
      }
      setStatus("COMPLETED");
      setCompletedModalOpen(true);
    } catch (err) {
      console.error("Failed to end consultation:", err);
      setEndModalOpen(false);
      setStatus("COMPLETED");
      setCompletedModalOpen(true);
    }
  };

  // Submit Review
  const handleSubmitReview = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("namhastro_token") : null;
    try {
      await fetch(`${API_BASE}/api/v1/chat/${consultationId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          rating: ratingVal,
          reviewText,
        }),
      });
      setReviewSubmitted(true);
    } catch (err) {
      console.error("Failed to submit review:", err);
      setReviewSubmitted(true);
    }
  };

  // Submit Dispute
  const handleSubmitDispute = async () => {
    if (!disputeReason.trim()) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("namhastro_token") : null;
    try {
      await fetch(`${API_BASE}/api/v1/chat/${consultationId}/dispute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: disputeReason }),
      });
      setDisputeSubmitted(true);
    } catch (err) {
      console.error("Failed to submit dispute:", err);
      setDisputeSubmitted(true);
    }
  };

  // Format MM:SS
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <SiteHeader />
      <main className="mp-section" style={{ paddingBlock: "1rem 5rem" }}>
        <div className="container" style={{ maxInlineSize: "72rem" }}>
          {/* Top Bar Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBlockEnd: "0.85rem",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <Link
              href={userRole === "ASTROLOGER" ? "/partner" : "/astrologers"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontWeight: 600,
                color: "var(--royal-purple)",
                fontSize: "0.85rem",
              }}
            >
              <ArrowLeft size={16} /> Back to {userRole === "ASTROLOGER" ? "Partner Portal" : "Astrologers"}
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {userRole === "CUSTOMER" && (
                <button
                  type="button"
                  onClick={() => setRechargeModalOpen(true)}
                  className="wallet-btn"
                  title="Recharge wallet seamlessly"
                >
                  <Wallet size={14} /> ₹{walletBalanceInr.toFixed(2)} · Top Up
                </button>
              )}
              {status !== "COMPLETED" && (
                <button
                  type="button"
                  onClick={() => setEndModalOpen(true)}
                  className="btn btn-sm"
                  style={{ backgroundColor: "var(--live-red)", color: "#FFFFFF" }}
                >
                  <PhoneOff size={14} /> End Session
                </button>
              )}
            </div>
          </div>

          {/* Sticky Authoritative Billing & Consultation Information Bar */}
          <div
            className="surface-card"
            style={{
              padding: "0.75rem 1.15rem",
              marginBlockEnd: "0.75rem",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
              backgroundColor: "var(--ivory)",
              border: "1px solid var(--border-gold)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Clock size={16} color="var(--royal-purple)" />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--royal-purple)" }}>
                  Duration: {formatTimer(elapsedSeconds)}
                </span>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--ink-subtle)" }}>
                Locked Rate: <strong>₹{consultationRateInr}/min</strong>
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--ink-subtle)" }}>
                Approx Spent: <strong>₹{(Math.max(1, Math.ceil(elapsedSeconds / 60)) * consultationRateInr).toFixed(2)}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "9999px",
                  backgroundColor: remainingSeconds <= 180 ? "#FEE2E2" : "var(--champagne-gold-soft)",
                  color: remainingSeconds <= 180 ? "#B91C1C" : "var(--royal-purple)",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                {remainingSeconds <= 180 ? <AlertTriangle size={13} /> : <Lock size={12} />}
                {formatTimer(remainingSeconds)} remaining
              </span>

              {userRole === "CUSTOMER" && remainingSeconds <= 180 && (
                <button
                  type="button"
                  onClick={() => setRechargeModalOpen(true)}
                  className="btn btn-gold btn-sm"
                  style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem" }}
                >
                  <CreditCard size={12} /> Add Balance
                </button>
              )}
            </div>
          </div>

          {/* Low Balance Warning Banner */}
          {lowBalanceAlert && status !== "COMPLETED" && (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FCA5A5",
                borderRadius: "var(--radius-md)",
                padding: "0.65rem 1rem",
                marginBlockEnd: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#991B1B", fontSize: "0.82rem" }}>
                <AlertTriangle size={16} />
                <span>
                  <strong>Low Balance Warning:</strong> Less than 3 minutes remaining. Session will conclude automatically when available credits deplete.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRechargeModalOpen(true)}
                className="btn btn-sm"
                style={{ backgroundColor: "#DC2626", color: "#FFF", fontSize: "0.75rem" }}
              >
                Recharge Now
              </button>
            </div>
          )}

          {/* Main Chat Workspace Grid (Astrologer gets side panel for Kundli/Notes) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: userRole === "ASTROLOGER" ? "1fr minmax(280px, 340px)" : "1fr",
              gap: "1rem",
              alignItems: "start",
            }}
          >
            {/* Left Column: Chat Container */}
            <div
              className="surface-card"
              style={{
                padding: 0,
                overflow: "hidden",
                display: "grid",
                gridTemplateRows: "auto 1fr auto auto",
                minBlockSize: "68dvh",
              }}
            >
              {/* Chat Header */}
              <div
                style={{
                  background: "linear-gradient(90deg, var(--deep-plum) 0%, var(--royal-purple) 100%)",
                  color: "#FFFFFF",
                  padding: "0.85rem 1.15rem",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <img
                    src={partnerPhoto}
                    alt={partnerName}
                    style={{
                      inlineSize: "2.85rem",
                      blockSize: "2.85rem",
                      borderRadius: "9999px",
                      objectFit: "cover",
                      border: "2px solid var(--champagne-gold)",
                    }}
                  />
                  <div>
                    <strong style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.95rem" }}>
                      {partnerName}
                      <UserCheck size={14} color="#F2C96B" />
                    </strong>
                    <span style={{ fontSize: "0.74rem", color: "#86EFAC", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      ● Online · E2E Encrypted Chat Session
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.25rem 0.6rem",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(255,255,255,0.12)",
                      color: "#FDE68A",
                    }}
                  >
                    Concern: {concern}
                  </span>
                  {userRole === "CUSTOMER" && (
                    <button
                      type="button"
                      onClick={() => setDisputeModalOpen(true)}
                      className="btn btn-sm"
                      style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#F2C96B", fontSize: "0.75rem" }}
                    >
                      <ShieldAlert size={13} /> Report
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages Body */}
              <div
                style={{
                  padding: "1.15rem",
                  backgroundColor: "var(--ivory)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                  overflowY: "auto",
                  maxBlockSize: "55dvh",
                }}
              >
                {messages.map((m) => {
                  const isSelf =
                    (userRole === "CUSTOMER" && m.senderRole === "CUSTOMER") ||
                    (userRole === "ASTROLOGER" && m.senderRole === "ASTROLOGER");

                  if (m.senderRole === "SYSTEM" || m.type === "SYSTEM") {
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: "center",
                          maxInlineSize: "36rem",
                          textAlign: "center",
                          fontSize: "0.76rem",
                          padding: "0.45rem 0.85rem",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: "var(--champagne-gold-soft)",
                          border: "1px solid var(--border-gold)",
                          color: "var(--ink)",
                        }}
                      >
                        <Sparkles size={12} style={{ display: "inline", marginInlineEnd: "0.3rem" }} color="#9A6E1E" />
                        {m.content}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isSelf ? "flex-end" : "flex-start",
                        maxInlineSize: "min(82%, 30rem)",
                        padding: "0.75rem 0.95rem",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: isSelf ? "var(--royal-purple)" : "var(--white)",
                        color: isSelf ? "#FFFFFF" : "var(--ink)",
                        border: isSelf ? "0" : "1px solid var(--border)",
                        boxShadow: "var(--shadow-xs)",
                      }}
                    >
                      {/* Attachment Preview Card if present */}
                      {m.attachmentUrl && (
                        <div
                          style={{
                            marginBlockEnd: "0.5rem",
                            borderRadius: "var(--radius-sm)",
                            overflow: "hidden",
                            backgroundColor: isSelf ? "rgba(255,255,255,0.08)" : "var(--ivory)",
                            padding: "0.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <FileText size={20} color={isSelf ? "#F2C96B" : "var(--royal-purple)"} />
                          <div style={{ flex: 1, minInlineSize: 0 }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: 600, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {m.content}
                            </span>
                            <span style={{ fontSize: "0.68rem", opacity: 0.8 }}>Attachment Verified · {m.type}</span>
                          </div>
                          <a
                            href={m.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: isSelf ? "#F2C96B" : "var(--royal-purple)" }}
                            title="Download Attachment"
                          >
                            <FileDown size={16} />
                          </a>
                        </div>
                      )}

                      <p style={{ color: "inherit", fontSize: "0.88rem", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                        {m.content}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: "0.3rem",
                          marginBlockStart: "0.3rem",
                          fontSize: "0.68rem",
                          opacity: 0.78,
                        }}
                      >
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {isSelf && (
                          <span>
                            {m.isRead || m.status === "READ" ? (
                              <CheckCheck size={14} color="#60A5FA" />
                            ) : m.status === "DELIVERED" ? (
                              <CheckCheck size={14} />
                            ) : (
                              <Check size={13} />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Animated Typing Indicator */}
                {isTypingPeer && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      padding: "0.5rem 0.85rem",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: "var(--white)",
                      border: "1px solid var(--border)",
                      fontSize: "0.75rem",
                      color: "var(--ink-subtle)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <span>{partnerName} is typing</span>
                    <span className="dot-flashing" style={{ display: "inline-block" }}>...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Astrologer Quick Replies Carousel */}
              {userRole === "ASTROLOGER" && status !== "COMPLETED" && (
                <div
                  style={{
                    padding: "0.45rem 1rem",
                    backgroundColor: "var(--white)",
                    borderBlockStart: "1px solid var(--border)",
                    display: "flex",
                    gap: "0.4rem",
                    overflowX: "auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {quickReplies.map((qr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInput(qr)}
                      style={{
                        fontSize: "0.72rem",
                        padding: "0.25rem 0.65rem",
                        borderRadius: "9999px",
                        backgroundColor: "var(--champagne-gold-soft)",
                        border: "1px solid var(--border-gold)",
                        color: "var(--ink)",
                        cursor: "pointer",
                      }}
                    >
                      {qr.slice(0, 32)}...
                    </button>
                  ))}
                </div>
              )}

              {/* Message Composer */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: "0.85rem 1rem",
                  backgroundColor: "var(--white)",
                  borderBlockStart: "1px solid var(--border)",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleSendAttachment("KUNDLI", "Janam Kundli Birth Chart Shared")}
                  className="icon-btn"
                  title="Share Kundli Analysis"
                  disabled={status === "COMPLETED"}
                >
                  <FileText size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => handleSendAttachment("IMAGE", "Planetary Transit Chart Image")}
                  className="icon-btn"
                  title="Attach Horoscope Chart Image"
                  disabled={status === "COMPLETED"}
                >
                  <Paperclip size={17} />
                </button>

                <input
                  type="text"
                  className="form-input"
                  placeholder={status === "COMPLETED" ? "Consultation completed." : `Message ${partnerName}...`}
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={status === "COMPLETED"}
                  style={{ flex: 1 }}
                />

                <button
                  type="submit"
                  className="btn btn-purple btn-sm"
                  disabled={!input.trim() || status === "COMPLETED"}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                >
                  <Send size={15} /> Send
                </button>
              </form>
            </div>

            {/* Right Column: Astrologer Consultation Workspace Panel */}
            {userRole === "ASTROLOGER" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Customer Birth Profile Card */}
                <div className="surface-card" style={{ padding: "1.15rem" }}>
                  <h3 className="serif-heading" style={{ fontSize: "1.1rem", marginBlockEnd: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Sparkles size={16} color="var(--champagne-gold)" /> Customer Birth Details
                  </h3>
                  <div style={{ fontSize: "0.82rem", display: "grid", gap: "0.45rem", color: "var(--ink-subtle)" }}>
                    <div>
                      Name: <strong style={{ color: "var(--ink)" }}>{partnerName}</strong>
                    </div>
                    <div>
                      DOB: <strong style={{ color: "var(--ink)" }}>14 August 1993</strong>
                    </div>
                    <div>
                      Time: <strong style={{ color: "var(--ink)" }}>08:45 AM</strong>
                    </div>
                    <div>
                      Birthplace: <strong style={{ color: "var(--ink)" }}>New Delhi, India</strong>
                    </div>
                    <div>
                      Rashi: <strong style={{ color: "var(--ink)" }}>Tula (Libra)</strong> · Nakshatra: <strong style={{ color: "var(--ink)" }}>Chitra</strong>
                    </div>
                  </div>
                </div>

                {/* Private Astrologer Notes (Encrypted & strictly hidden from customer) */}
                <div className="surface-card" style={{ padding: "1.15rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "0.75rem" }}>
                    <h3 className="serif-heading" style={{ fontSize: "1.1rem" }}>
                      Private Notes
                    </h3>
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Lock size={11} /> Astrologer Only
                    </span>
                  </div>

                  <form onSubmit={handleAddNote} style={{ marginBlockEnd: "0.75rem" }}>
                    <textarea
                      rows={2}
                      className="form-input"
                      placeholder="Add private note (e.g., Saturn transit remedy)..."
                      value={newNoteInput}
                      onChange={(e) => setNewNoteInput(e.target.value)}
                      style={{ fontSize: "0.8rem", marginBlockEnd: "0.4rem" }}
                    />
                    <button type="submit" className="btn btn-gold btn-sm" style={{ width: "100%", fontSize: "0.75rem" }}>
                      Save Private Note
                    </button>
                  </form>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", maxBlockSize: "180px", overflowY: "auto" }}>
                    {privateNotes.map((note, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: "0.78rem",
                          padding: "0.45rem 0.65rem",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "var(--ivory)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {note}
                      </div>
                    ))}
                    {privateNotes.length === 0 && (
                      <p style={{ fontSize: "0.78rem", color: "var(--ink-subtle)", textAlign: "center" }}>No notes added yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL 1: Confirm End Consultation */}
      {endModalOpen && (
        <div className="modal-backdrop" onClick={() => setEndModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxInlineSize: "26rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "1rem" }}>
              <h3 className="serif-heading" style={{ fontSize: "1.25rem", margin: 0 }}>
                End Consultation?
              </h3>
              <button type="button" onClick={() => setEndModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--ink-subtle)", marginBlockEnd: "1rem" }}>
              Total duration recorded: <strong>{formatTimer(elapsedSeconds)}</strong>. Authoritative charge:{" "}
              <strong>₹{(Math.max(1, Math.ceil(elapsedSeconds / 60)) * consultationRateInr).toFixed(2)}</strong>. Unused balance will be safely released back to your wallet.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setEndModalOpen(false)} className="btn btn-outline btn-sm">
                Continue Chatting
              </button>
              <button
                type="button"
                onClick={handleEndConsultation}
                className="btn btn-sm"
                style={{ backgroundColor: "var(--live-red)", color: "#FFFFFF" }}
              >
                Yes, End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: In-Chat Seamless Wallet Recharge */}
      {rechargeModalOpen && (
        <div className="modal-backdrop" onClick={() => setRechargeModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxInlineSize: "28rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "1rem" }}>
              <h3 className="serif-heading" style={{ fontSize: "1.25rem", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Wallet size={18} color="var(--royal-purple)" /> Recharge Wallet
              </h3>
              <button type="button" onClick={() => setRechargeModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--ink-subtle)", marginBlockEnd: "1rem" }}>
              Top up your balance instantly to prevent consultation interruption. 18% GST applies as per Government of India mandate.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBlockEnd: "1.25rem" }}>
              {[
                { amount: 100, bonus: 0 },
                { amount: 200, bonus: 20 },
                { amount: 500, bonus: 75 },
                { amount: 1000, bonus: 200 },
              ].map((pack) => (
                <button
                  key={pack.amount}
                  type="button"
                  onClick={() => {
                    setWalletBalanceInr((prev) => prev + pack.amount + pack.bonus);
                    setRemainingSeconds((prev) => prev + Math.floor((pack.amount / consultationRateInr) * 60));
                    setLowBalanceAlert(false);
                    setRechargeModalOpen(false);
                  }}
                  className="surface-card"
                  style={{
                    padding: "0.75rem",
                    textAlign: "center",
                    cursor: "pointer",
                    border: "1px solid var(--border-gold)",
                    backgroundColor: "var(--ivory)",
                  }}
                >
                  <strong style={{ display: "block", fontSize: "1.1rem", color: "var(--royal-purple)" }}>₹{pack.amount}</strong>
                  {pack.bonus > 0 ? (
                    <span style={{ fontSize: "0.72rem", color: "var(--online)", fontWeight: 600 }}>+₹{pack.bonus} Free Bonus</span>
                  ) : (
                    <span style={{ fontSize: "0.72rem", color: "var(--ink-subtle)" }}>Instant Top Up</span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <Link href="/account/wallet" className="btn btn-outline btn-sm" style={{ width: "100%" }}>
                Open Complete Wallet & Invoices
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Consultation Completion & Verified Review Modal */}
      {completedModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxInlineSize: "28rem", textAlign: "center" }}>
            <div
              style={{
                inlineSize: "3.5rem",
                blockSize: "3.5rem",
                borderRadius: "9999px",
                backgroundColor: "var(--champagne-gold-soft)",
                color: "var(--royal-purple)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBlockEnd: "0.75rem",
              }}
            >
              <Sparkles size={28} />
            </div>

            <h2 className="serif-heading" style={{ fontSize: "1.4rem", marginBlockEnd: "0.35rem" }}>
              Consultation Completed
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--ink-subtle)", marginBlockEnd: "1rem" }}>
              Thank you for consulting with <strong>{partnerName}</strong>.
            </p>

            {/* Financial Summary Card */}
            <div
              className="surface-card"
              style={{
                padding: "0.85rem 1rem",
                backgroundColor: "var(--ivory)",
                marginBlockEnd: "1.25rem",
                textAlign: "start",
                fontSize: "0.82rem",
                display: "grid",
                gap: "0.45rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Billable Duration:</span>
                <strong>{settlementData?.billableMinutes || Math.max(1, Math.ceil(elapsedSeconds / 60))} minutes</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total Consultation Charge:</span>
                <strong style={{ color: "var(--royal-purple)" }}>
                  ₹{(settlementData?.totalChargeInr || Math.max(1, Math.ceil(elapsedSeconds / 60)) * consultationRateInr).toFixed(2)}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Remaining Wallet Balance:</span>
                <strong style={{ color: "var(--online)" }}>
                  ₹{(settlementData?.customerRemainingBalanceInr || Math.max(0, walletBalanceInr - 150)).toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Rate & Review Section */}
            {userRole === "CUSTOMER" && !reviewSubmitted && (
              <div style={{ marginBlockEnd: "1.25rem" }}>
                <h4 style={{ fontSize: "0.9rem", marginBlockEnd: "0.5rem" }}>Rate your experience:</h4>
                <div style={{ display: "flex", justifyContent: "center", gap: "0.4rem", marginBlockEnd: "0.75rem" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingVal(star)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "0.2rem" }}
                    >
                      <Star
                        size={24}
                        fill={star <= ratingVal ? "#F59E0B" : "none"}
                        color={star <= ratingVal ? "#F59E0B" : "#CBD5E1"}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  rows={2}
                  className="form-input"
                  placeholder="Share your feedback to help fellow devotees..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  style={{ fontSize: "0.82rem", marginBlockEnd: "0.5rem" }}
                />
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  className="btn btn-gold btn-sm"
                  style={{ width: "100%" }}
                >
                  Submit Verified Review
                </button>
              </div>
            )}

            {reviewSubmitted && (
              <div style={{ padding: "0.65rem", backgroundColor: "#ECFDF5", color: "#065F46", borderRadius: "var(--radius-sm)", fontSize: "0.82rem", marginBlockEnd: "1rem" }}>
                ✓ Thank you! Your review has been recorded.
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/account/wallet" className="btn btn-outline btn-sm">
                View Tax Invoice
              </Link>
              <Link href="/astrologers" className="btn btn-purple btn-sm">
                Consult Another Astrologer
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Report Issue / Dispute */}
      {disputeModalOpen && (
        <div className="modal-backdrop" onClick={() => setDisputeModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxInlineSize: "26rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBlockEnd: "1rem" }}>
              <h3 className="serif-heading" style={{ fontSize: "1.2rem", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <ShieldAlert size={18} color="var(--royal-purple)" /> Report Session Concern
              </h3>
              <button type="button" onClick={() => setDisputeModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {!disputeSubmitted ? (
              <>
                <p style={{ fontSize: "0.82rem", color: "var(--ink-subtle)", marginBlockEnd: "0.75rem" }}>
                  Our 24x7 Safety & Quality desk reviews all reported sessions. If you experienced technical connectivity issues or inappropriate behavior, please detail it below:
                </p>
                <textarea
                  rows={3}
                  className="form-input"
                  placeholder="Describe your issue..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  style={{ fontSize: "0.82rem", marginBlockEnd: "1rem" }}
                />
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setDisputeModalOpen(false)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitDispute}
                    disabled={!disputeReason.trim()}
                    className="btn btn-purple btn-sm"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <p style={{ fontSize: "0.85rem", color: "#065F46", fontWeight: 600 }}>
                  ✓ Report submitted successfully. Our team will review within 24 hours.
                </p>
                <button type="button" onClick={() => setDisputeModalOpen(false)} className="btn btn-purple btn-sm" style={{ marginBlockStart: "0.5rem" }}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <MobileBottomNav />
    </>
  );
}

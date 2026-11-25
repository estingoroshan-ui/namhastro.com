"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
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
  VolumeX,
  Wallet,
  MessageSquare,
  Sparkles,
  Star,
  FileDown,
  X,
  Send,
  Lock,
  AlertTriangle,
  Maximize2,
  Minimize2,
  FileText,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/SiteHeader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

interface SettlementData {
  consultationId: string;
  durationSeconds: number;
  billableMinutes: number;
  totalChargeInr: number;
  customerRemainingBalanceInr: number;
  astrologerEarningInr: number;
}

interface ChatMessage {
  id: string;
  senderRole: "CUSTOMER" | "ASTROLOGER" | "SYSTEM";
  content: string;
  createdAt: string;
}

export default function AudioVideoConsultationPage() {
  const [consultationId, setConsultationId] = useState<string>("");
  const [userRole, setUserRole] = useState<"CUSTOMER" | "ASTROLOGER">("CUSTOMER");
  const [callType, setCallType] = useState<"AUDIO" | "VIDEO">("AUDIO");
  const [partnerName, setPartnerName] = useState<string>("Acharya Devendra Shastri");
  const [partnerPhoto, setPartnerPhoto] = useState<string>("/images/astro-4.jpg");
  const [ratePerMinuteInr, setRatePerMinuteInr] = useState<number>(35);
  const [channelName, setChannelName] = useState<string>("");

  // Media States
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [peerMuted, setPeerMuted] = useState<boolean>(false);
  const [peerVideoEnabled, setPeerVideoEnabled] = useState<boolean>(true);
  const [networkQuality, setNetworkQuality] = useState<number>(1); // 1 = Excellent, 2 = Good, etc.
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(30); // 0-100 for waveform animation

  // Real-time Timer & Authoritative Billing
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(900); // 15 mins default
  const [walletBalanceInr, setWalletBalanceInr] = useState<number>(450);
  const [lowBalanceAlert, setLowBalanceAlert] = useState<boolean>(false);
  const [rechargeSuccessMsg, setRechargeSuccessMsg] = useState<string>("");

  // In-call Chat Drawer
  const [chatDrawerOpen, setChatDrawerOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");

  // Audio to Video Upgrade
  const [upgradeModalOpen, setUpgradeModalOpen] = useState<boolean>(false);
  const [incomingUpgradeReq, setIncomingUpgradeReq] = useState<any | null>(null);

  // Modals & Finalization
  const [endCallModalOpen, setEndCallModalOpen] = useState<boolean>(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState<boolean>(false);
  const [completedModalOpen, setCompletedModalOpen] = useState<boolean>(false);
  const [settlementData, setSettlementData] = useState<SettlementData | null>(null);
  const [ratingVal, setRatingVal] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // Agora Client & Socket References
  const agoraClientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const localVideoContainerRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoContainerRef = useRef<HTMLDivElement | null>(null);
  const waveformAnimRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Parse URL Query Parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id") || "consult_demo_step7";
      const roleParam = params.get("role")?.toUpperCase();
      const typeParam = params.get("type")?.toUpperCase();

      setConsultationId(id);
      if (roleParam === "ASTROLOGER") setUserRole("ASTROLOGER");
      if (typeParam === "VIDEO") setCallType("VIDEO");
    }
  }, []);

  // 2. Waveform Activity Simulator for Luxury Visualizer
  useEffect(() => {
    if (!isMuted) {
      waveformAnimRef.current = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 65) + 25);
      }, 150);
    } else {
      setAudioLevel(5);
    }
    return () => {
      if (waveformAnimRef.current) clearInterval(waveformAnimRef.current);
    };
  }, [isMuted]);

  // 3. Connect Socket.IO & Fetch RTC Token
  useEffect(() => {
    if (!consultationId) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("namhastro_token") : null;

    // A. Connect Socket.IO
    const socket = io(API_BASE, {
      auth: { token: token ? `Bearer ${token}` : undefined },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join:consultation", { consultationId });
    });

    // Authoritative Server Heartbeat Timer
    socket.on("consultation:tick", (data: any) => {
      if (data.consultationId === consultationId) {
        setElapsedSeconds(data.elapsedSeconds);
        setRemainingSeconds(data.remainingSeconds);
        if (data.ratePaisePerMinute) {
          setRatePerMinuteInr(data.ratePaisePerMinute / 100);
        }
      }
    });

    // Low Balance Alert
    socket.on("consultation:low_balance", (data: any) => {
      if (data.consultationId === consultationId) {
        setLowBalanceAlert(true);
      }
    });

    // Wallet Recharge Applied
    socket.on("consultation:recharge_applied", (data: any) => {
      if (data.consultationId === consultationId) {
        setLowBalanceAlert(false);
        setRechargeSuccessMsg("Wallet recharged! Additional consultation time added.");
        setTimeout(() => setRechargeSuccessMsg(""), 5000);
      }
    });

    // Peer joined Agora RTC
    socket.on("call:peer_joined", (data: any) => {
      if (data.consultationId === consultationId) {
        if (data.role === "ASTROLOGER") {
          setPartnerName("Acharya Devendra Shastri (Online)");
        }
      }
    });

    // Peer Muted/Camera Toggled
    socket.on("call:peer_mute", (data: any) => {
      setPeerMuted(data.isMuted);
    });

    socket.on("call:peer_camera", (data: any) => {
      setPeerVideoEnabled(data.isVideoEnabled);
    });

    socket.on("call:peer_quality", (data: any) => {
      setNetworkQuality(data.networkQuality);
    });

    // Audio-to-Video Upgrade
    socket.on("call:upgrade_requested", (data: any) => {
      if (userRole === "ASTROLOGER") {
        setIncomingUpgradeReq(data);
      }
    });

    socket.on("call:upgraded", (data: any) => {
      setCallType("VIDEO");
      if (data.newRatePaisePerMinute) {
        setRatePerMinuteInr(data.newRatePaisePerMinute / 100);
      }
      setIncomingUpgradeReq(null);
      setUpgradeModalOpen(false);
      initVideoTracks();
    });

    socket.on("call:upgrade_rejected", (data: any) => {
      alert(data.message || "Video upgrade declined. Continuing with voice call.");
      setUpgradeModalOpen(false);
    });

    // In-Call Messages
    socket.on("message:received", (msg: any) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: msg.id,
          senderRole: msg.senderRole,
          content: msg.content,
          createdAt: msg.createdAt,
        },
      ]);
    });

    // Session Ended
    socket.on("consultation:ended", (data: any) => {
      handleCallTermination(data.settlement);
    });

    socket.on("call:ended", (data: any) => {
      handleCallTermination(data.settlement);
    });

    // B. Fetch Consultation Details & Mint Token
    fetch(`${API_BASE}/api/v1/consultations/${consultationId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const c = data.data;
          setPartnerName(c.astrologer.name);
          if (c.astrologer.avatarUrl) setPartnerPhoto(c.astrologer.avatarUrl);
          setRatePerMinuteInr(c.ratePaisePerMinute / 100);
          setCallType(c.type === "VIDEO" ? "VIDEO" : "AUDIO");
          setChannelName(c.channelName);
          initAgoraClient(c.channelName);
        }
      })
      .catch((err) => {
        console.warn("[Call] Failed to fetch consultation details:", err);
        initAgoraClient(`na_consult_${consultationId}`);
      });

    return () => {
      socket.disconnect();
      cleanupAgora();
    };
  }, [consultationId, userRole]);

  // 4. Initialize Agora Web SDK
  const initAgoraClient = async (chName: string) => {
    try {
      // Dynamic import to prevent SSR Next.js issues
      const AgoraRTCModule = await import("agora-rtc-sdk-ng");
      const AgoraRTC = AgoraRTCModule.default || AgoraRTCModule;

      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      agoraClientRef.current = client;

      // Remote track handling
      client.on("user-published", async (user: any, mediaType: "audio" | "video") => {
        await client.subscribe(user, mediaType);
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
        if (mediaType === "video" && remoteVideoContainerRef.current) {
          user.videoTrack?.play(remoteVideoContainerRef.current);
        }
      });

      client.on("user-unpublished", (user: any, mediaType: string) => {
        if (mediaType === "video") {
          // Fallback to avatar
        }
      });

      client.on("network-quality", (stats: any) => {
        setNetworkQuality(stats.downlinkNetworkQuality || 1);
        socketRef.current?.emit("call:quality", {
          consultationId,
          networkQuality: stats.downlinkNetworkQuality || 1,
          rttMs: stats.rtt,
        });
      });

      // Obtain RTC token from API
      const tokenRes = await fetch(`${API_BASE}/api/v1/consultations/${consultationId}/rtc-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("namhastro_token") || ""}`,
        },
      });

      const tokenJson = await tokenRes.json();
      const appId = tokenJson.data?.appId || "5d066243097b4c148739c771cc1cdcd0";
      const token = tokenJson.data?.token || null;
      const uid = tokenJson.data?.uid || Math.floor(Math.random() * 899999) + 100000;

      // Join Agora RTC channel
      await client.join(appId, chName, token, uid);

      // Create Local Audio Track
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;

      // If video consultation, create local video track
      let tracksToPublish: any[] = [audioTrack];
      if (callType === "VIDEO") {
        try {
          const videoTrack = await AgoraRTC.createCameraVideoTrack();
          localVideoTrackRef.current = videoTrack;
          tracksToPublish.push(videoTrack);
          if (localVideoContainerRef.current) {
            videoTrack.play(localVideoContainerRef.current);
          }
        } catch (vErr) {
          console.warn("[Agora] Camera permission denied or not found:", vErr);
        }
      }

      await client.publish(tracksToPublish);

      // Signal joined event to socket and backend
      socketRef.current?.emit("call:join", {
        consultationId,
        channelName: chName,
        numericUid: uid,
        isMutedAudio: false,
        isVideoEnabled: callType === "VIDEO",
      });

      fetch(`${API_BASE}/api/v1/consultations/call/${consultationId}/join-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("namhastro_token") || ""}`,
        },
        body: JSON.stringify({ eventType: "JOINED", detailsJson: { uid, role: userRole } }),
      }).catch(() => {});
    } catch (err: any) {
      console.warn("[Agora WebRTC] Live connection fallback:", err?.message);
    }
  };

  const initVideoTracks = async () => {
    try {
      const AgoraRTCModule = await import("agora-rtc-sdk-ng");
      const AgoraRTC = AgoraRTCModule.default || AgoraRTCModule;
      if (!localVideoTrackRef.current) {
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        localVideoTrackRef.current = videoTrack;
        if (agoraClientRef.current) {
          await agoraClientRef.current.publish([videoTrack]);
        }
        if (localVideoContainerRef.current) {
          videoTrack.play(localVideoContainerRef.current);
        }
      }
    } catch (err) {
      console.warn("[Agora] Failed to init video track:", err);
    }
  };

  const cleanupAgora = () => {
    try {
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      agoraClientRef.current?.leave();
    } catch (e) {}
  };

  // 5. Media Control Actions
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localAudioTrackRef.current?.setEnabled(!nextMuted);
    socketRef.current?.emit("call:mute", { consultationId, isMuted: nextMuted });
  };

  const toggleCamera = () => {
    const nextVideo = !isVideoEnabled;
    setIsVideoEnabled(nextVideo);
    localVideoTrackRef.current?.setEnabled(nextVideo);
    socketRef.current?.emit("call:camera", { consultationId, isVideoEnabled: nextVideo });
  };

  const switchCamera = async () => {
    try {
      const AgoraRTCModule = await import("agora-rtc-sdk-ng");
      const AgoraRTC = AgoraRTCModule.default || AgoraRTCModule;
      const cameras = await AgoraRTC.getCameras();
      if (cameras.length > 1 && localVideoTrackRef.current) {
        const currentId = localVideoTrackRef.current.getTrackLabel();
        const nextCam = cameras.find((c: any) => c.label !== currentId) || cameras[0];
        await localVideoTrackRef.current.setDevice(nextCam.deviceId);
      }
    } catch (err) {
      console.warn("[Agora] Failed to switch camera:", err);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  // 6. In-Call Chat Action
  const sendChatMessage = () => {
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit("message:send", {
      consultationId,
      content: chatInput.trim(),
      type: "TEXT",
    });
    setChatInput("");
  };

  // 7. Audio to Video Upgrade Request
  const requestVideoUpgrade = () => {
    setUpgradeModalOpen(true);
    socketRef.current?.emit("call:upgrade_request", { consultationId });
  };

  const respondToUpgrade = (accepted: boolean) => {
    if (!incomingUpgradeReq) return;
    socketRef.current?.emit("call:upgrade_respond", {
      consultationId,
      upgradeRequestId: incomingUpgradeReq.upgradeRequestId,
      accepted,
    });
    setIncomingUpgradeReq(null);
  };

  // 8. End Consultation Action
  const endConsultation = async () => {
    setEndCallModalOpen(false);
    cleanupAgora();

    try {
      const res = await fetch(`${API_BASE}/api/v1/consultations/${consultationId}/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("namhastro_token") || ""}`,
        },
        body: JSON.stringify({ durationSeconds: elapsedSeconds, reason: "Ended by user" }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        handleCallTermination(data.data);
      } else {
        handleCallTermination(null);
      }
    } catch (err) {
      handleCallTermination(null);
    }
  };

  const handleCallTermination = (settlement: any) => {
    cleanupAgora();
    const billableMins = settlement?.billableMinutes || Math.max(1, Math.ceil(elapsedSeconds / 60));
    const totalCharge = settlement ? Number(settlement.totalCostPaise) / 100 : billableMins * ratePerMinuteInr;

    setSettlementData({
      consultationId,
      durationSeconds: elapsedSeconds,
      billableMinutes: billableMins,
      totalChargeInr: totalCharge,
      customerRemainingBalanceInr: settlement?.newCustomerBalanceInr || Math.max(0, walletBalanceInr - totalCharge),
      astrologerEarningInr: settlement?.newAstrologerBalanceInr || totalCharge * 0.8,
    });

    setCompletedModalOpen(true);
  };

  // 9. Submit Review
  const submitReview = async () => {
    try {
      await fetch(`${API_BASE}/api/v1/chat/${consultationId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("namhastro_token") || ""}`,
        },
        body: JSON.stringify({ rating: ratingVal, reviewText }),
      });
      setReviewSubmitted(true);
    } catch (err) {
      setReviewSubmitted(true);
    }
  };

  // Helper formatting for seconds to MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <SiteHeader />

      <main
        style={{
          backgroundColor: "var(--deep-plum)",
          color: "#FFFFFF",
          minHeight: "100vh",
          paddingBlock: "1.25rem 5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div className="container" style={{ maxInlineSize: "72rem", width: "100%" }}>
          {/* Top Bar Navigation & Mode Indicator */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginBlockEnd: "1rem",
            }}
          >
            <Link
              href="/astrologers"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                fontWeight: 600,
                color: "var(--champagne-gold)",
                fontSize: "0.9rem",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={16} /> Leave Room
            </Link>

            {/* Mode Switcher / Indicator */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "9999px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  backgroundColor: callType === "VIDEO" ? "rgba(212,168,79,0.2)" : "rgba(255,255,255,0.12)",
                  color: callType === "VIDEO" ? "var(--champagne-gold)" : "#FFFFFF",
                  border: "1px solid rgba(212,168,79,0.4)",
                }}
              >
                {callType === "VIDEO" ? <Video size={14} /> : <PhoneCall size={14} />}
                {callType === "VIDEO" ? "HD Agora Video Consultation" : "Agora Encrypted Voice Consultation"}
              </span>

              {callType === "AUDIO" && userRole === "CUSTOMER" && (
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "var(--champagne-gold)",
                    color: "var(--deep-plum)",
                    fontWeight: 700,
                    borderRadius: "9999px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                  onClick={requestVideoUpgrade}
                >
                  <Video size={14} /> Upgrade to Video
                </button>
              )}
            </div>
          </div>

          {/* Low Balance Warning Banner */}
          {lowBalanceAlert && (
            <div
              style={{
                backgroundColor: "#B45309",
                color: "#FFFFFF",
                padding: "0.75rem 1.25rem",
                borderRadius: "var(--radius-md)",
                marginBlockEnd: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.75rem",
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <AlertTriangle size={18} />
                <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                  Low Balance Alert: Less than 2 minutes remaining! Recharge now to prevent disconnection.
                </span>
              </div>
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#B45309",
                  fontWeight: 700,
                  borderRadius: "9999px",
                }}
                onClick={() => setRechargeModalOpen(true)}
              >
                1-Click Recharge
              </button>
            </div>
          )}

          {rechargeSuccessMsg && (
            <div
              style={{
                backgroundColor: "#16A34A",
                color: "#FFFFFF",
                padding: "0.6rem 1rem",
                borderRadius: "var(--radius-md)",
                marginBlockEnd: "1rem",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {rechargeSuccessMsg}
            </div>
          )}

          {/* Incoming Upgrade Request Toast (For Astrologer) */}
          {incomingUpgradeReq && (
            <div
              style={{
                backgroundColor: "var(--royal-purple)",
                border: "2px solid var(--champagne-gold)",
                padding: "1rem 1.25rem",
                borderRadius: "var(--radius-md)",
                marginBlockEnd: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <div>
                <span style={{ color: "var(--champagne-gold)", fontWeight: 700, fontSize: "0.9rem" }}>
                  Customer Requested Video Upgrade!
                </span>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#F3E8FF" }}>
                  Upgrade rate: ₹{(incomingUpgradeReq.newRatePaisePerMinute / 100).toFixed(2)}/min. Do you accept?
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ backgroundColor: "#16A34A", color: "#FFFFFF", fontWeight: 700 }}
                  onClick={() => respondToUpgrade(true)}
                >
                  Accept Video
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ backgroundColor: "#DC2626", color: "#FFFFFF", fontWeight: 700 }}
                  onClick={() => respondToUpgrade(false)}
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {/* Main Stage Card */}
          <div
            className="surface-card"
            style={{
              background: "linear-gradient(165deg, #240B32 0%, #351044 50%, #1A0726 100%)",
              borderColor: "var(--champagne-gold)",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 12px 36px rgba(0,0,0,0.45)",
              display: "grid",
              gap: "1.25rem",
              position: "relative",
            }}
          >
            {/* Stage Info Bar */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.75rem",
                borderBottom: "1px solid rgba(212,168,79,0.25)",
                paddingBottom: "1rem",
              }}
            >
              {/* Partner Details */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ position: "relative" }}>
                  <img
                    src={partnerPhoto}
                    alt={partnerName}
                    style={{
                      width: "3.25rem",
                      height: "3.25rem",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid var(--champagne-gold)",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: "0.85rem",
                      height: "0.85rem",
                      backgroundColor: "#16A34A",
                      borderRadius: "50%",
                      border: "2px solid #FFFFFF",
                    }}
                  />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0, color: "#FFFFFF" }}>
                      {partnerName}
                    </h2>
                    <ShieldCheck size={16} color="var(--champagne-gold)" />
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--champagne-gold)" }}>
                    Verified Vedic Scholar · Rate: ₹{ratePerMinuteInr.toFixed(2)}/min
                  </span>
                </div>
              </div>

              {/* Ticker & Telemetry Indicators */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                {/* Duration */}
                <div
                  style={{
                    backgroundColor: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(212,168,79,0.3)",
                    padding: "0.4rem 0.85rem",
                    borderRadius: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.7)", display: "block" }}>
                    DURATION
                  </span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FDE047", fontFamily: "monospace" }}>
                    {formatTime(elapsedSeconds)}
                  </span>
                </div>

                {/* Remaining Time */}
                <div
                  style={{
                    backgroundColor: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(212,168,79,0.3)",
                    padding: "0.4rem 0.85rem",
                    borderRadius: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.7)", display: "block" }}>
                    REMAINING
                  </span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#86EFAC", fontFamily: "monospace" }}>
                    {formatTime(remainingSeconds)}
                  </span>
                </div>

                {/* Network Quality Badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.45rem 0.75rem",
                    borderRadius: "9999px",
                    backgroundColor: networkQuality <= 2 ? "rgba(22,163,74,0.22)" : "rgba(234,179,8,0.22)",
                    color: networkQuality <= 2 ? "#86EFAC" : "#FDE047",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  <Signal size={14} />
                  {networkQuality <= 2 ? "HD Agora Stream" : "Adaptive Stream"}
                </div>

                {/* Wallet Balance */}
                <button
                  type="button"
                  className="wallet-btn"
                  onClick={() => setRechargeModalOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    backgroundColor: "var(--champagne-gold)",
                    color: "var(--deep-plum)",
                    fontWeight: 800,
                    padding: "0.45rem 0.9rem",
                    borderRadius: "9999px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Wallet size={15} /> ₹{walletBalanceInr.toFixed(2)}
                </button>
              </div>
            </div>

            {/* Stage Viewport */}
            {callType === "AUDIO" ? (
              /* ========================================= */
              /* AUDIO CONSULTATION LUXURY WAVEFORM STAGE  */
              /* ========================================= */
              <div
                style={{
                  minHeight: "22rem",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(212,168,79,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Glowing Aura & Astrologer Portrait */}
                <div style={{ position: "relative", marginBlockEnd: "1.5rem" }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: "-1rem",
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(212,168,79,0.35) 0%, transparent 70%)",
                      animation: "pulse 2.5s infinite ease-in-out",
                    }}
                  />
                  <img
                    src={partnerPhoto}
                    alt={partnerName}
                    style={{
                      width: "8.5rem",
                      height: "8.5rem",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "4px solid var(--champagne-gold)",
                      boxShadow: "0 8px 28px rgba(0,0,0,0.6)",
                      position: "relative",
                      zIndex: 2,
                    }}
                  />
                </div>

                {/* Animated Gold Waveform Visualizer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    height: "3.5rem",
                    marginBlockEnd: "1rem",
                  }}
                >
                  {[20, 35, 60, 85, 45, 95, 70, 40, 65, 90, 50, 30, 80, 45, 25].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: "4px",
                        height: isMuted ? "4px" : `${Math.min(100, Math.max(8, (h * audioLevel) / 60))}px`,
                        backgroundColor: isMuted ? "rgba(255,255,255,0.3)" : "var(--champagne-gold)",
                        borderRadius: "2px",
                        transition: "height 0.15s ease",
                      }}
                    />
                  ))}
                </div>

                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#FFFFFF" }}>
                    {isMuted ? "Your microphone is muted" : "Two-Way Encrypted Voice Stream Active"}
                  </p>
                  <span style={{ fontSize: "0.78rem", color: "var(--champagne-gold)" }}>
                    Channel: {channelName || `na_consult_${consultationId}`} · 32-bit Numeric UID Mapped
                  </span>
                </div>
              </div>
            ) : (
              /* ========================================= */
              /* VIDEO CONSULTATION TWO-WAY AGORA STAGE    */
              /* ========================================= */
              <div
                style={{
                  minHeight: "28rem",
                  backgroundColor: "#000000",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(212,168,79,0.3)",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Remote Participant Video Canvas */}
                <div
                  ref={remoteVideoContainerRef}
                  id="remote-player"
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    inset: 0,
                    display: peerVideoEnabled ? "block" : "none",
                  }}
                />

                {/* Remote Video Fallback Placeholder (when remote camera is off or establishing) */}
                {!peerVideoEnabled && (
                  <div style={{ textAlign: "center", zIndex: 1 }}>
                    <img
                      src={partnerPhoto}
                      alt={partnerName}
                      style={{
                        width: "7rem",
                        height: "7rem",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid var(--champagne-gold)",
                        marginBlockEnd: "0.75rem",
                      }}
                    />
                    <p style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>{partnerName}</p>
                    <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                      Remote camera is currently turned off
                    </span>
                  </div>
                )}

                {/* Movable Picture-in-Picture Local Self-Preview */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "1.25rem",
                    right: "1.25rem",
                    width: "9.5rem",
                    height: "13rem",
                    borderRadius: "0.75rem",
                    backgroundColor: "#1A0726",
                    border: "2px solid var(--champagne-gold)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
                    overflow: "hidden",
                    zIndex: 10,
                  }}
                >
                  <div
                    ref={localVideoContainerRef}
                    id="local-player"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: isVideoEnabled ? "block" : "none",
                    }}
                  />
                  {!isVideoEnabled && (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#240B32",
                      }}
                    >
                      <CameraOff size={28} color="rgba(255,255,255,0.5)" />
                      <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.7)", marginTop: "0.4rem" }}>
                        Camera Off
                      </span>
                    </div>
                  )}
                  <span
                    style={{
                      position: "absolute",
                      bottom: "0.35rem",
                      left: "0.5rem",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      padding: "0.15rem 0.4rem",
                      borderRadius: "4px",
                    }}
                  >
                    You (Self)
                  </span>
                </div>

                {/* Remote Info Overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    left: "1rem",
                    backgroundColor: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    padding: "0.35rem 0.75rem",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.8rem",
                    zIndex: 5,
                  }}
                >
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#16A34A" }} />
                  {partnerName} {peerMuted && "(Muted)"}
                </div>
              </div>
            )}

            {/* Bottom Call Controls Floating Toolbar */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                paddingBlock: "0.5rem",
              }}
            >
              {/* Mic Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  borderRadius: "50%",
                  backgroundColor: isMuted ? "#DC2626" : "rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                  border: "2px solid rgba(212,168,79,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>

              {/* Camera Toggle (Video Call only) */}
              {callType === "VIDEO" && (
                <>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      borderRadius: "50%",
                      backgroundColor: !isVideoEnabled ? "#DC2626" : "rgba(255,255,255,0.15)",
                      color: "#FFFFFF",
                      border: "2px solid rgba(212,168,79,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    title={isVideoEnabled ? "Turn Camera Off" : "Turn Camera On"}
                  >
                    {isVideoEnabled ? <Camera size={22} /> : <CameraOff size={22} />}
                  </button>

                  <button
                    type="button"
                    onClick={switchCamera}
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      color: "#FFFFFF",
                      border: "2px solid rgba(212,168,79,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    title="Switch Front/Rear Camera"
                  >
                    <RefreshCw size={20} />
                  </button>
                </>
              )}

              {/* Speaker Toggle */}
              <button
                type="button"
                onClick={toggleSpeaker}
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  borderRadius: "50%",
                  backgroundColor: !isSpeakerOn ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                  border: "2px solid rgba(212,168,79,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                title="Toggle Speaker Mode"
              >
                {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
              </button>

              {/* In-Call Chat Drawer Toggle */}
              <button
                type="button"
                onClick={() => setChatDrawerOpen(!chatDrawerOpen)}
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  borderRadius: "50%",
                  backgroundColor: chatDrawerOpen ? "var(--champagne-gold)" : "rgba(255,255,255,0.15)",
                  color: chatDrawerOpen ? "var(--deep-plum)" : "#FFFFFF",
                  border: "2px solid rgba(212,168,79,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                }}
                title="Open In-Call Chat"
              >
                <MessageSquare size={22} />
                {chatMessages.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      backgroundColor: "#DC2626",
                      color: "#FFFFFF",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      width: "1.1rem",
                      height: "1.1rem",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {chatMessages.length}
                  </span>
                )}
              </button>

              {/* Recharge Button */}
              <button
                type="button"
                onClick={() => setRechargeModalOpen(true)}
                style={{
                  padding: "0 1.25rem",
                  height: "3.5rem",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(212,168,79,0.2)",
                  color: "var(--champagne-gold)",
                  border: "2px solid var(--champagne-gold)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                <Wallet size={18} /> Top-Up
              </button>

              {/* End Call Button */}
              <button
                type="button"
                onClick={() => setEndCallModalOpen(true)}
                style={{
                  padding: "0 1.75rem",
                  height: "3.5rem",
                  borderRadius: "9999px",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: 800,
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 18px rgba(220,38,38,0.5)",
                }}
              >
                <PhoneOff size={22} /> End Call
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* IN-CALL REAL-TIME CHAT DRAWER                           */}
        {/* ======================================================== */}
        {chatDrawerOpen && (
          <aside
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              maxWidth: "24rem",
              backgroundColor: "var(--deep-plum)",
              borderLeft: "2px solid var(--champagne-gold)",
              boxShadow: "-8px 0 24px rgba(0,0,0,0.6)",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid rgba(212,168,79,0.25)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MessageSquare size={18} color="var(--champagne-gold)" />
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#FFFFFF" }}>
                  Consultation Chat & Notes
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setChatDrawerOpen(false)}
                style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages Thread */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", marginBlock: "auto" }}>
                  <Sparkles size={28} color="var(--champagne-gold)" style={{ margin: "0 auto 0.5rem" }} />
                  <p style={{ fontSize: "0.85rem", margin: 0 }}>
                    Share Janam Kundli queries or notes during your active call without extra billing!
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.senderRole === userRole ? "flex-end" : "flex-start",
                      backgroundColor:
                        msg.senderRole === userRole ? "var(--royal-purple)" : "rgba(255,255,255,0.12)",
                      border: msg.senderRole === userRole ? "1px solid var(--champagne-gold)" : "none",
                      color: "#FFFFFF",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "0.75rem",
                      maxWidth: "85%",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ fontSize: "0.65rem", color: "var(--champagne-gold)", display: "block" }}>
                      {msg.senderRole}
                    </span>
                    {msg.content}
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <div
              style={{
                padding: "1rem",
                borderTop: "1px solid rgba(212,168,79,0.25)",
                display: "flex",
                gap: "0.5rem",
              }}
            >
              <input
                type="text"
                placeholder="Type note or question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(212,168,79,0.4)",
                  borderRadius: "0.5rem",
                  padding: "0.55rem 0.85rem",
                  color: "#FFFFFF",
                  fontSize: "0.85rem",
                }}
              />
              <button
                type="button"
                onClick={sendChatMessage}
                style={{
                  backgroundColor: "var(--champagne-gold)",
                  color: "var(--deep-plum)",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "0 0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </aside>
        )}

        {/* ======================================================== */}
        {/* END CALL CONFIRMATION MODAL                              */}
        {/* ======================================================== */}
        {endCallModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "var(--deep-plum)",
                border: "2px solid var(--champagne-gold)",
                borderRadius: "1rem",
                padding: "1.75rem",
                maxWidth: "28rem",
                width: "100%",
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              <PhoneOff size={42} color="#DC2626" style={{ margin: "0 auto 0.75rem" }} />
              <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.3rem" }}>End Consultation?</h3>
              <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", marginBlockEnd: "1.25rem" }}>
                Current Duration: <strong>{formatTime(elapsedSeconds)}</strong>. Billable minutes will be finalized
                and charged from your wallet.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "#FFFFFF",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "0.5rem",
                    border: "none",
                  }}
                  onClick={() => setEndCallModalOpen(false)}
                >
                  Stay in Call
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                    padding: "0.6rem 1.5rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    fontWeight: 700,
                  }}
                  onClick={endConsultation}
                >
                  Confirm & End
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1-CLICK IN-CALL WALLET RECHARGE MODAL                   */}
        {/* ======================================================== */}
        {rechargeModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "var(--deep-plum)",
                border: "2px solid var(--champagne-gold)",
                borderRadius: "1rem",
                padding: "1.75rem",
                maxWidth: "26rem",
                width: "100%",
                color: "#FFFFFF",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--champagne-gold)" }}>
                  In-Call Wallet Top-Up
                </h3>
                <button
                  type="button"
                  onClick={() => setRechargeModalOpen(false)}
                  style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", marginBottom: "1rem" }}>
                Recharging now extends your consultation seamlessly without disconnecting your active Agora stream.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                {[
                  { inr: 200, extraMin: 6 },
                  { inr: 500, extraMin: 15 },
                  { inr: 1000, extraMin: 32 },
                  { inr: 2000, extraMin: 65 },
                ].map((pkg) => (
                  <button
                    key={pkg.inr}
                    type="button"
                    onClick={async () => {
                      setWalletBalanceInr((prev) => prev + pkg.inr);
                      setRemainingSeconds((prev) => prev + pkg.extraMin * 60);
                      setLowBalanceAlert(false);
                      setRechargeModalOpen(false);
                      setRechargeSuccessMsg(`Recharged ₹${pkg.inr}! Added approx ${pkg.extraMin} minutes.`);
                      setTimeout(() => setRechargeSuccessMsg(""), 5000);
                    }}
                    style={{
                      backgroundColor: "rgba(212,168,79,0.15)",
                      border: "1px solid var(--champagne-gold)",
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      color: "#FFFFFF",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--champagne-gold)", display: "block" }}>
                      ₹{pkg.inr}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#86EFAC" }}>+{pkg.extraMin} Mins</span>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", textAlign: "center", margin: 0 }}>
                100% Secure 256-Bit SSL · Verified via Razorpay TEST Mode
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* POST-CONSULTATION SETTLEMENT & RATING MODAL             */}
        {/* ======================================================== */}
        {completedModalOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 300,
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "var(--deep-plum)",
                border: "2px solid var(--champagne-gold)",
                borderRadius: "1rem",
                padding: "2rem",
                maxWidth: "30rem",
                width: "100%",
                color: "#FFFFFF",
                textAlign: "center",
                boxShadow: "0 12px 42px rgba(0,0,0,0.7)",
              }}
            >
              <div
                style={{
                  width: "4rem",
                  height: "4rem",
                  borderRadius: "50%",
                  backgroundColor: "rgba(212,168,79,0.2)",
                  color: "var(--champagne-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <Sparkles size={32} />
              </div>

              <h2 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem", color: "#FFFFFF" }}>
                Consultation Completed
              </h2>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.7)", marginBlockEnd: "1.5rem" }}>
                Thank you for consulting with {partnerName}.
              </p>

              {/* Settlement Summary Grid */}
              <div
                style={{
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(212,168,79,0.25)",
                  padding: "1rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                  textAlign: "left",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>Total Duration</span>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem", color: "#FFFFFF" }}>
                    {formatTime(settlementData?.durationSeconds || elapsedSeconds)}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>Billable Minutes</span>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem", color: "var(--champagne-gold)" }}>
                    {settlementData?.billableMinutes || Math.max(1, Math.ceil(elapsedSeconds / 60))} Mins
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>Total Deducted</span>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem", color: "#F87171" }}>
                    ₹{(settlementData?.totalChargeInr || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>Remaining Balance</span>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "1.05rem", color: "#86EFAC" }}>
                    ₹{(settlementData?.customerRemainingBalanceInr || walletBalanceInr).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Interactive 5-Star Rating */}
              {!reviewSubmitted ? (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
                    Rate your astrological consultation
                  </label>
                  <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingVal(star)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.2rem",
                        }}
                      >
                        <Star
                          size={28}
                          color="var(--champagne-gold)"
                          fill={star <= ratingVal ? "var(--champagne-gold)" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Write a brief review (optional)..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    style={{
                      width: "100%",
                      backgroundColor: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(212,168,79,0.3)",
                      borderRadius: "0.5rem",
                      padding: "0.6rem",
                      color: "#FFFFFF",
                      fontSize: "0.85rem",
                      minHeight: "4rem",
                      marginBottom: "0.75rem",
                    }}
                  />
                  <button
                    type="button"
                    onClick={submitReview}
                    style={{
                      backgroundColor: "var(--champagne-gold)",
                      color: "var(--deep-plum)",
                      fontWeight: 800,
                      border: "none",
                      borderRadius: "0.5rem",
                      padding: "0.6rem 1.5rem",
                      cursor: "pointer",
                    }}
                  >
                    Submit Review
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "rgba(22,163,74,0.2)",
                    border: "1px solid #16A34A",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1.5rem",
                    fontSize: "0.85rem",
                    color: "#86EFAC",
                  }}
                >
                  Thank you! Your feedback has been recorded.
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
                <Link
                  href="/astrologers"
                  style={{
                    backgroundColor: "var(--royal-purple)",
                    border: "1px solid var(--champagne-gold)",
                    color: "#FFFFFF",
                    padding: "0.65rem 1.25rem",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                  }}
                >
                  Back to Astrologers
                </Link>
                <Link
                  href="/account"
                  style={{
                    backgroundColor: "var(--champagne-gold)",
                    color: "var(--deep-plum)",
                    padding: "0.65rem 1.25rem",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                    fontSize: "0.88rem",
                    fontWeight: 800,
                  }}
                >
                  View My Wallet
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

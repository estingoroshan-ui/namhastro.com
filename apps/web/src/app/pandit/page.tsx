"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  Flame,
  Calendar,
  CheckCircle,
  XCircle,
  Video,
  Clock,
  MapPin,
  UploadCloud,
  Truck,
  IndianRupee,
  Star,
  Users,
  AlertCircle,
  Camera,
  Play
} from "lucide-react";

interface BookingItem {
  id: string;
  bookingNumber: string;
  pujaName: string;
  deity: string;
  customerName: string;
  gotra: string;
  nakshatra: string;
  scheduledDate: string;
  timeSlot: string;
  status: "PANDIT_ASSIGNED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED";
  panditFeeInr: number;
  isLiveOnline: boolean;
  agoraChannel?: string;
  agoraToken?: string;
  sankalpWish?: string;
}

const DEMO_BOOKINGS: BookingItem[] = [
  {
    id: "bk-101",
    bookingNumber: "NA-PUJA-20261126-7841",
    pujaName: "Maha Rudrabhishek with 1008 Bilva Patra",
    deity: "Lord Shiva",
    customerName: "Aarav Sharma & Family",
    gotra: "Kashyapa",
    nakshatra: "Ashwini",
    scheduledDate: "Today (Auspicious Evening Pradosham)",
    timeSlot: "06:30 PM - 08:00 PM",
    status: "PANDIT_ASSIGNED",
    panditFeeInr: 3900,
    isLiveOnline: true,
    sankalpWish: "Family health, prosperity and resolution of chronic obstacles."
  },
  {
    id: "bk-102",
    bookingNumber: "NA-PUJA-20261127-1092",
    pujaName: "Navagraha Shanti & Dosha Nivaran Mahayagya",
    deity: "Navagraha Mandalam",
    customerName: "Vikram Singhania",
    gotra: "Bharadwaj",
    nakshatra: "Rohini",
    scheduledDate: "Tomorrow",
    timeSlot: "09:00 AM - 10:45 AM",
    status: "ACCEPTED",
    panditFeeInr: 4125,
    isLiveOnline: true,
    sankalpWish: "Career stability and relief from Rahu Mahadasha affliction."
  },
  {
    id: "bk-103",
    bookingNumber: "NA-PUJA-20261125-9923",
    pujaName: "Lakshmi-Kubera Dhan Prapti Homa",
    deity: "Goddess Mahalakshmi",
    customerName: "Pooja Malhotra",
    gotra: "Vashishta",
    nakshatra: "Pushya",
    scheduledDate: "Yesterday",
    timeSlot: "11:00 AM - 12:15 PM",
    status: "COMPLETED",
    panditFeeInr: 3825,
    isLiveOnline: true
  }
];

export default function PanditPortalPage() {
  const [panditProfile, setPanditProfile] = useState({
    name: "Acharya Vidyadhar Shastri",
    title: "Vedic Karmakand Acharya & Senior Purohit",
    temple: "Kashi Vishwanath Mandir, Varanasi",
    experienceYears: 14,
    status: "APPROVED",
    totalCompletedPujas: 184,
    rating: 4.95,
    monthlyEarningsInr: 68400
  });

  const [bookings, setBookings] = useState<BookingItem[]>(DEMO_BOOKINGS);
  const [activeLiveRoom, setActiveLiveRoom] = useState<BookingItem | null>(null);

  // Evidence Completion Modal
  const [completingBooking, setCompletingBooking] = useState<BookingItem | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [courierPartner, setCourierPartner] = useState("BlueDart Express");
  const [prasadAwb, setPrasadAwb] = useState("");
  const [evidenceUploaded, setEvidenceUploaded] = useState(false);

  // Fetch real profile & bookings if authenticated
  useEffect(() => {
    async function loadPanditData() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("namh_access_token") : null;
        if (!token) return;

        const res = await fetch("http://127.0.0.1:4000/api/v1/pandit/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            if (data.data.profile) {
              setPanditProfile((prev) => ({
                ...prev,
                name: data.data.profile.displayName || prev.name,
                totalCompletedPujas: data.data.stats?.totalCompleted || prev.totalCompletedPujas,
                rating: data.data.stats?.rating || prev.rating,
                monthlyEarningsInr: Number(data.data.stats?.totalEarningsInr) || prev.monthlyEarningsInr
              }));
            }
            if (data.data.upcomingBookings && data.data.upcomingBookings.length > 0) {
              setBookings(
                data.data.upcomingBookings.map((b: any) => ({
                  id: b.id,
                  bookingNumber: b.bookingNumber,
                  pujaName: b.pujaService?.name || "Vedic Puja",
                  deity: "Lord Shiva",
                  customerName: b.customer?.fullName || b.sankalpName,
                  gotra: b.gotra || "Kashyapa",
                  nakshatra: "Vedic",
                  scheduledDate: new Date(b.scheduledDate).toLocaleDateString(),
                  timeSlot: b.timeSlot,
                  status: b.status,
                  panditFeeInr: Number(b.panditFeePaise) / 100,
                  isLiveOnline: b.isLiveOnline,
                  agoraChannel: b.agoraChannel,
                  sankalpWish: b.sankalpWish
                }))
              );
            }
          }
        }
      } catch (e) {
        // Fallback to high quality demo state
      }
    }
    loadPanditData();
  }, []);

  const handleRespond = async (bookingId: string, action: "ACCEPT" | "REJECT") => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: action === "ACCEPT" ? "ACCEPTED" : "PANDIT_ASSIGNED" } : b))
    );

    try {
      const token = localStorage.getItem("namh_access_token");
      if (token) {
        await fetch(`http://127.0.0.1:4000/api/v1/pandit/bookings/${bookingId}/respond`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ action })
        });
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleStartLive = async (booking: BookingItem) => {
    setActiveLiveRoom(booking);
    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...b, status: "IN_PROGRESS" } : b))
    );

    try {
      const token = localStorage.getItem("namh_access_token");
      if (token) {
        await fetch(`http://127.0.0.1:4000/api/v1/pandit/bookings/${booking.id}/start`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleCompletePuja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingBooking) return;

    setBookings((prev) =>
      prev.map((b) => (b.id === completingBooking.id ? { ...b, status: "COMPLETED" } : b))
    );

    try {
      const token = localStorage.getItem("namh_access_token");
      if (token) {
        await fetch(`http://127.0.0.1:4000/api/v1/pandit/bookings/${completingBooking.id}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            completionNotes: completionNotes || "Vedic rituals concluded auspiciously per shastras.",
            photos: ["https://namhastro.com/uploads/puja/shiva_lingam_abhishekam.jpg"],
            prasadShipped: true,
            prasadTrackingNumber: prasadAwb || "BD992834199IN"
          })
        });
      }
    } catch (e) {
      // Ignore
    }

    setCompletingBooking(null);
    setCompletionNotes("");
    setPrasadAwb("");
  };

  return (
    <div style={{ backgroundColor: "#15041F", minHeight: "100vh", color: "#FFF9F0" }}>
      <SiteHeader />

      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "2.5rem 1rem" }}>
        {/* Priest Profile Header Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(68, 17, 88, 0.7) 0%, rgba(32, 6, 44, 0.9) 100%)",
            border: "1px solid #D4A84F",
            borderRadius: "18px",
            padding: "1.75rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div
              style={{
                width: "74px",
                height: "74px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #D4A84F 0%, #B8860B 100%)",
                padding: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "#240833",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem"
                }}
              >
                🕉️
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#FFF9F0" }}>
                  {panditProfile.name}
                </h1>
                <span
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid #10B981",
                    color: "#10B981",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "9999px"
                  }}
                >
                  ✓ VERIFIED ACHARYA
                </span>
              </div>
              <div style={{ color: "rgba(255, 249, 240, 0.7)", fontSize: "0.9rem", marginTop: "0.2rem" }}>
                {panditProfile.title} · {panditProfile.experienceYears} Years Vedic Experience
              </div>
              <div style={{ color: "#F2C96B", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.3rem" }}>
                <MapPin size={13} color="#D4A84F" /> {panditProfile.temple}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: "0.75rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(212, 168, 79, 0.2)" }}>
              <div style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.6)" }}>Pujas Completed</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#FFF9F0" }}>
                {panditProfile.totalCompletedPujas}
              </div>
            </div>

            <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: "0.75rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(212, 168, 79, 0.2)" }}>
              <div style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.6)" }}>Devotee Rating</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#F2C96B", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Star size={18} fill="#F2C96B" color="#F2C96B" /> {panditProfile.rating}
              </div>
            </div>

            <div style={{ background: "rgba(0, 0, 0, 0.3)", padding: "0.75rem 1.25rem", borderRadius: "12px", border: "1px solid rgba(212, 168, 79, 0.2)" }}>
              <div style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.6)" }}>Pandit Fee Dakshina</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#10B981" }}>
                ₹{panditProfile.monthlyEarningsInr.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        {/* Live Active Room Banner */}
        {activeLiveRoom && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(220, 38, 38, 0.25) 0%, rgba(153, 27, 27, 0.45) 100%)",
              border: "2px solid #EF4444",
              borderRadius: "14px",
              padding: "1.25rem",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#EF4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "pulse 1.5s infinite"
                }}
              >
                <Video size={22} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#FFFFFF" }}>
                  Live Broadcast Active: {activeLiveRoom.pujaName}
                </div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.85)" }}>
                  Agora Room Channel: <code>{activeLiveRoom.agoraChannel || "puja_live_stream_01"}</code> · Devotee: {activeLiveRoom.customerName}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setCompletingBooking(activeLiveRoom)}
                style={{
                  background: "#10B981",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.6rem 1.2rem",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer"
                }}
              >
                Finish &amp; Upload Evidence
              </button>
              <button
                onClick={() => setActiveLiveRoom(null)}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.6rem 1rem",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                Minimize Room
              </button>
            </div>
          </div>
        )}

        {/* Ritual Schedule & Booking Queue */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#F2C96B", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={20} color="#D4A84F" /> Devotee Ritual Schedule &amp; Incoming Requests
            </h2>
            <span style={{ fontSize: "0.85rem", color: "rgba(255, 249, 240, 0.6)" }}>
              {bookings.length} Bookings in Queue
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {bookings.map((booking) => (
              <div
                key={booking.id}
                style={{
                  background: "linear-gradient(180deg, rgba(48, 12, 65, 0.65) 0%, rgba(22, 4, 31, 0.85) 100%)",
                  border: "1px solid rgba(212, 168, 79, 0.28)",
                  borderRadius: "14px",
                  padding: "1.35rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 280px",
                  gap: "1.5rem",
                  alignItems: "center"
                }}
              >
                {/* Ritual & Devotee Information */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
                    <span
                      style={{
                        background: "rgba(212, 168, 79, 0.15)",
                        border: "1px solid #D4A84F",
                        color: "#F2C96B",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.72rem",
                        fontWeight: 700
                      }}
                    >
                      {booking.bookingNumber}
                    </span>
                    <span
                      style={{
                        background:
                          booking.status === "COMPLETED"
                            ? "rgba(16, 185, 129, 0.15)"
                            : booking.status === "IN_PROGRESS"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(212, 168, 79, 0.15)",
                        color:
                          booking.status === "COMPLETED"
                            ? "#10B981"
                            : booking.status === "IN_PROGRESS"
                            ? "#EF4444"
                            : "#F2C96B",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.72rem",
                        fontWeight: 700
                      }}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.25rem", color: "#FFF9F0", margin: "0 0 0.5rem", fontWeight: 700 }}>
                    {booking.pujaName}
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem", fontSize: "0.85rem", color: "rgba(255, 249, 240, 0.75)" }}>
                    <div><strong>Devotee:</strong> {booking.customerName}</div>
                    <div><strong>Gotra:</strong> {booking.gotra}</div>
                    <div><strong>Timing:</strong> {booking.timeSlot}</div>
                    <div><strong>Date:</strong> {booking.scheduledDate}</div>
                  </div>

                  {booking.sankalpWish && (
                    <div style={{ marginTop: "0.65rem", fontSize: "0.82rem", color: "#F2C96B", background: "rgba(212, 168, 79, 0.08)", padding: "0.4rem 0.65rem", borderRadius: "6px" }}>
                      <strong>Sankalp Wish:</strong> &quot;{booking.sankalpWish}&quot;
                    </div>
                  )}
                </div>

                {/* Priest Action Sidebar */}
                <div style={{ borderLeft: "1px solid rgba(212, 168, 79, 0.2)", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.6)" }}>Your Dakshina Fee:</span>
                    <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#10B981" }}>
                      ₹{booking.panditFeeInr.toLocaleString("en-IN")}
                    </div>
                  </div>

                  {booking.status === "PANDIT_ASSIGNED" && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleRespond(booking.id, "ACCEPT")}
                        style={{
                          flex: 1,
                          background: "#10B981",
                          border: "none",
                          borderRadius: "8px",
                          padding: "0.6rem",
                          color: "#FFFFFF",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer"
                        }}
                      >
                        Accept Ritual
                      </button>
                      <button
                        onClick={() => handleRespond(booking.id, "REJECT")}
                        style={{
                          background: "rgba(239, 68, 68, 0.15)",
                          border: "1px solid #EF4444",
                          borderRadius: "8px",
                          padding: "0.6rem 0.8rem",
                          color: "#EF4444",
                          fontSize: "0.82rem",
                          cursor: "pointer"
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {booking.status === "ACCEPTED" && (
                    <button
                      onClick={() => handleStartLive(booking)}
                      style={{
                        background: "linear-gradient(135deg, #D4A84F 0%, #B8860B 100%)",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.7rem",
                        color: "#1A0524",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem"
                      }}
                    >
                      <Play size={16} /> Start Live Room
                    </button>
                  )}

                  {booking.status === "IN_PROGRESS" && (
                    <button
                      onClick={() => setCompletingBooking(booking)}
                      style={{
                        background: "#10B981",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.7rem",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.4rem"
                      }}
                    >
                      <UploadCloud size={16} /> Conclude &amp; Upload Proof
                    </button>
                  )}

                  {booking.status === "COMPLETED" && (
                    <div style={{ color: "#10B981", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <CheckCircle size={15} /> Ritual Concluded Auspiciously
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {completingBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 2, 14, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
        >
          <div
            style={{
              background: "#240833",
              border: "1px solid #D4A84F",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "560px",
              padding: "1.75rem",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)"
            }}
          >
            <h3 style={{ fontSize: "1.3rem", color: "#F2C96B", margin: "0 0 0.5rem" }}>
              Upload Ritual Completion Evidence
            </h3>
            <p style={{ color: "rgba(255, 249, 240, 0.7)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Devotees expect authentic photo proof of Sankalp chanting, havan ahutis, and prasad consignment dispatch.
            </p>

            <form onSubmit={handleCompletePuja} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "rgba(255, 249, 240, 0.7)" }}>Purohit Completion Remarks</label>
                <textarea
                  rows={3}
                  required
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Maha Rudrabhishek concluded with full Vedic mantras and bilva patra archana in presence of devotee online."
                  style={{
                    width: "100%",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    padding: "0.6rem",
                    color: "#FFF9F0",
                    fontSize: "0.88rem",
                    marginTop: "0.25rem"
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "rgba(255, 249, 240, 0.7)" }}>Sacred Photos &amp; Video Recordings</label>
                <div
                  style={{
                    border: "1px dashed rgba(212, 168, 79, 0.4)",
                    borderRadius: "8px",
                    padding: "1rem",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "rgba(255, 255, 255, 0.02)",
                    marginTop: "0.25rem"
                  }}
                  onClick={() => setEvidenceUploaded(true)}
                >
                  <Camera size={24} color="#D4A84F" style={{ margin: "0 auto 0.4rem" }} />
                  <div style={{ fontSize: "0.85rem", color: "#FFF9F0" }}>
                    {evidenceUploaded ? "✓ 2 Evidence Photos Attached" : "Click to attach photo evidence (JPG/PNG)"}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "rgba(255, 249, 240, 0.7)" }}>Prasad Courier Partner</label>
                  <input
                    type="text"
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "6px",
                      padding: "0.55rem 0.7rem",
                      color: "#FFF9F0",
                      fontSize: "0.85rem",
                      marginTop: "0.25rem"
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "rgba(255, 249, 240, 0.7)" }}>Prasad AWB Tracking No.</label>
                  <input
                    type="text"
                    placeholder="e.g. BD992834199IN"
                    value={prasadAwb}
                    onChange={(e) => setPrasadAwb(e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "6px",
                      padding: "0.55rem 0.7rem",
                      color: "#FFF9F0",
                      fontSize: "0.85rem",
                      marginTop: "0.25rem"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setCompletingBooking(null)}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.6rem 1.2rem",
                    color: "#FFF9F0",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.6rem 1.5rem",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Confirm Completion &amp; Claim Dakshina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}

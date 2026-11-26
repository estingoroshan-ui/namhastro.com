"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Tag,
  ArrowRight,
  CheckCircle,
  Truck,
  CreditCard,
  Wallet,
  Sparkles,
  ChevronRight,
  PackageCheck
} from "lucide-react";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  priceInr: number;
  quantity: number;
  coverImageUrl?: string;
}

export default function CartAndCheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "ci-1",
      productId: "prod-01",
      name: "Original 5 Mukhi Nepali Rudraksha Mala (108+1 Beads)",
      priceInr: 3500,
      quantity: 1,
      coverImageUrl: "/images/store-rudraksha.svg"
    }
  ]);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState("");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "Aarav Sharma",
    phone: "+91 98765 43210",
    addressLine1: "Flat 402, Shanti Vihar, Sigra",
    city: "Varanasi",
    state: "Uttar Pradesh",
    pincode: "221001"
  });

  const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "RAZORPAY">("WALLET");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Load cart from localStorage or backend
  useEffect(() => {
    try {
      const stored = localStorage.getItem("namh_local_cart");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCartItems(
            parsed.map((item: any, idx: number) => ({
              id: item.id || `ci-${idx}`,
              productId: item.productId || `prod-${idx}`,
              name: item.name,
              priceInr: Number(item.priceInr) || 3500,
              quantity: Number(item.quantity) || 1,
              coverImageUrl: item.coverImageUrl || "/images/store-rudraksha.svg"
            }))
          );
        }
      }
    } catch (e) {
      // Keep default demo item
    }
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Pricing calculations
  const subtotalInr = cartItems.reduce((acc, it) => acc + it.priceInr * it.quantity, 0);
  const shippingInr = subtotalInr >= 999 || subtotalInr === 0 ? 0 : 99;
  const gstInr = Math.round(subtotalInr * 0.18 * 100) / 100;

  let discountInr = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      discountInr = (subtotalInr * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && discountInr > appliedCoupon.maxDiscount) {
        discountInr = appliedCoupon.maxDiscount;
      }
    } else {
      discountInr = appliedCoupon.discountValue;
    }
  }

  const totalInr = Math.max(0, subtotalInr + shippingInr + gstInr - discountInr);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "DIWALI15") {
      if (subtotalInr < 1000) {
        setCouponError("DIWALI15 requires a minimum order value of ₹1,000.");
        return;
      }
      setAppliedCoupon({
        code: "DIWALI15",
        discountType: "PERCENTAGE",
        discountValue: 15,
        maxDiscount: 500,
        name: "Diwali Special 15% Off"
      });
      return;
    }

    if (code === "NAMH100") {
      setAppliedCoupon({
        code: "NAMH100",
        discountType: "FIXED",
        discountValue: 100,
        name: "Welcome ₹100 Flat Voucher"
      });
      return;
    }

    setCouponError("Invalid or expired coupon code. Try DIWALI15 or NAMH100.");
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true);

    const orderNumber = `NA-ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("namh_access_token") : null;
      if (token) {
        const res = await fetch("http://127.0.0.1:4000/api/v1/store/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            items: cartItems.map((c) => ({
              productId: c.productId,
              quantity: c.quantity
            })),
            shippingAddress,
            couponCode: appliedCoupon?.code
          })
        });

        if (res.ok) {
          const oData = await res.json();
          setConfirmedOrder(oData.data);
          localStorage.removeItem("namh_local_cart");
          setIsCheckingOut(false);
          return;
        }
      }

      // Offline / Demo checkout fallback
      setConfirmedOrder({
        orderNumber,
        status: "CONFIRMED",
        subtotalInr,
        taxAmountInr: gstInr,
        shippingAmountInr: shippingInr,
        discountInr,
        totalInr,
        shippingAddress,
        items: cartItems,
        awbNumber: "DLV9948201994",
        courier: "Delhivery Express"
      });
      localStorage.removeItem("namh_local_cart");
    } catch (e) {
      setConfirmedOrder({
        orderNumber,
        status: "CONFIRMED",
        subtotalInr,
        totalInr,
        shippingAddress,
        items: cartItems
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#15041F", minHeight: "100vh", color: "#FFF9F0" }}>
      <SiteHeader />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1rem" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "rgba(255, 249, 240, 0.6)", marginBottom: "1.5rem" }}>
          <Link href="/" style={{ color: "#D4A84F", textDecoration: "none" }}>Home</Link>
          <ChevronRight size={14} />
          <Link href="/store" style={{ color: "#D4A84F", textDecoration: "none" }}>Astro Store</Link>
          <ChevronRight size={14} />
          <span style={{ color: "#FFF9F0" }}>Shopping Cart &amp; Secure Checkout</span>
        </div>

        {confirmedOrder ? (
          /* Order Confirmation Screen */
          <div
            style={{
              background: "linear-gradient(180deg, rgba(54, 13, 73, 0.7) 0%, rgba(27, 5, 38, 0.9) 100%)",
              border: "1px solid #D4A84F",
              borderRadius: "18px",
              padding: "3rem 1.5rem",
              textAlign: "center",
              maxWidth: "640px",
              margin: "2rem auto",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)"
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.15)",
                border: "2px solid #10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem"
              }}
            >
              <PackageCheck size={40} color="#10B981" />
            </div>

            <h1
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "2.2rem",
                color: "#F2C96B",
                margin: "0 0 0.5rem"
              }}
            >
              Order Placed Successfully!
            </h1>

            <p style={{ color: "rgba(255, 249, 240, 0.8)", fontSize: "0.95rem", marginBottom: "1.75rem" }}>
              Your sacred consignment has been registered for consecrated packaging and express dispatch.
            </p>

            <div
              style={{
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px dashed rgba(212, 168, 79, 0.4)",
                borderRadius: "12px",
                padding: "1.25rem",
                textAlign: "left",
                marginBottom: "2rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <span style={{ color: "rgba(255, 249, 240, 0.6)", fontSize: "0.85rem" }}>Order Number:</span>
                <strong style={{ color: "#D4A84F" }}>{confirmedOrder.orderNumber}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <span style={{ color: "rgba(255, 249, 240, 0.6)", fontSize: "0.85rem" }}>Shipping Partner:</span>
                <span style={{ color: "#FFF9F0" }}>{confirmedOrder.courier || "Delhivery Express"} (AWB: {confirmedOrder.awbNumber || "Pending"})</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                <span style={{ color: "rgba(255, 249, 240, 0.6)", fontSize: "0.85rem" }}>Delivery Address:</span>
                <span style={{ color: "#FFF9F0", textAlign: "right", maxWidth: "260px", fontSize: "0.85rem" }}>
                  {confirmedOrder.shippingAddress?.fullName}, {confirmedOrder.shippingAddress?.city} ({confirmedOrder.shippingAddress?.pincode})
                </span>
              </div>
              <div
                style={{
                  borderTop: "1px solid rgba(212, 168, 79, 0.25)",
                  paddingTop: "0.6rem",
                  marginTop: "0.6rem",
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700
                }}
              >
                <span>Total Paid:</span>
                <span style={{ color: "#10B981", fontSize: "1.15rem" }}>₹{totalInr.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <Link
                href="/store"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  padding: "0.7rem 1.5rem",
                  color: "#FFF9F0",
                  textDecoration: "none",
                  fontSize: "0.9rem"
                }}
              >
                Continue Shopping
              </Link>
              <Link
                href="/account"
                style={{
                  background: "linear-gradient(135deg, #D4A84F 0%, #B8860B 100%)",
                  borderRadius: "8px",
                  padding: "0.7rem 1.5rem",
                  color: "#1A0524",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.9rem"
                }}
              >
                Track Shipment
              </Link>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Empty Cart */
          <div
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(212, 168, 79, 0.2)",
              borderRadius: "16px",
              padding: "4rem 2rem",
              textAlign: "center"
            }}
          >
            <ShoppingCart size={48} color="#D4A84F" style={{ margin: "0 auto 1rem", opacity: 0.6 }} />
            <h2 style={{ fontSize: "1.5rem", color: "#FFF9F0", margin: "0 0 0.5rem" }}>Your Sacred Cart is Empty</h2>
            <p style={{ color: "rgba(255, 249, 240, 0.6)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              Explore consecrated Rudrakshas, unheated Ceylon gemstones, and Vedic samagri in our store.
            </p>
            <Link
              href="/store"
              style={{
                background: "linear-gradient(135deg, #D4A84F 0%, #B8860B 100%)",
                borderRadius: "8px",
                padding: "0.75rem 1.75rem",
                color: "#1A0524",
                textDecoration: "none",
                fontWeight: 700
              }}
            >
              Browse Astro Store
            </Link>
          </div>
        ) : (
          /* Cart & Checkout Two-Column Grid */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 420px",
              gap: "2rem",
              alignItems: "start"
            }}
          >
            {/* Left Column: Cart Items & Delivery Address */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Cart Items List */}
              <div
                style={{
                  background: "linear-gradient(180deg, rgba(50, 12, 68, 0.6) 0%, rgba(25, 5, 35, 0.8) 100%)",
                  border: "1px solid rgba(212, 168, 79, 0.25)",
                  borderRadius: "16px",
                  padding: "1.5rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#F2C96B", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ShoppingCart size={18} color="#D4A84F" /> Items in Cart ({cartItems.length})
                  </h2>
                  <Link href="/store" style={{ fontSize: "0.82rem", color: "#D4A84F", textDecoration: "none" }}>
                    + Add More Items
                  </Link>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        paddingBottom: "1rem",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
                      }}
                    >
                      <div
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "10px",
                          background: "#240833",
                          overflow: "hidden",
                          flexShrink: 0
                        }}
                      >
                        <img
                          src={item.coverImageUrl || "/images/store-rudraksha.svg"}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>

                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem", color: "#FFF9F0", fontWeight: 600 }}>
                          {item.name}
                        </h4>
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#D4A84F" }}>
                          ₹{item.priceInr.toLocaleString("en-IN")}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255, 255, 255, 0.05)", borderRadius: "8px", padding: "0.25rem 0.5rem" }}>
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          style={{ background: "transparent", border: "none", color: "#FFF9F0", cursor: "pointer", padding: "0.2rem" }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, minWidth: "20px", textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          style={{ background: "transparent", border: "none", color: "#FFF9F0", cursor: "pointer", padding: "0.2rem" }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        style={{ background: "transparent", border: "none", color: "rgba(255, 249, 240, 0.4)", cursor: "pointer", padding: "0.4rem" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address Form */}
              <div
                style={{
                  background: "linear-gradient(180deg, rgba(50, 12, 68, 0.6) 0%, rgba(25, 5, 35, 0.8) 100%)",
                  border: "1px solid rgba(212, 168, 79, 0.25)",
                  borderRadius: "16px",
                  padding: "1.5rem"
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#F2C96B", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Truck size={18} color="#D4A84F" /> Delivery Address
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.65)" }}>Full Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      style={{
                        width: "100%",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        padding: "0.6rem 0.8rem",
                        color: "#FFF9F0",
                        fontSize: "0.88rem",
                        marginTop: "0.2rem"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.65)" }}>Mobile Number *</label>
                    <input
                      type="text"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      style={{
                        width: "100%",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        padding: "0.6rem 0.8rem",
                        color: "#FFF9F0",
                        fontSize: "0.88rem",
                        marginTop: "0.2rem"
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "0.85rem" }}>
                  <label style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.65)" }}>Address Line *</label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    style={{
                      width: "100%",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      padding: "0.6rem 0.8rem",
                      color: "#FFF9F0",
                      fontSize: "0.88rem",
                      marginTop: "0.2rem"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.85rem", marginTop: "0.85rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.65)" }}>City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      style={{
                        width: "100%",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        padding: "0.6rem 0.8rem",
                        color: "#FFF9F0",
                        fontSize: "0.88rem",
                        marginTop: "0.2rem"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.65)" }}>State</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      style={{
                        width: "100%",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        padding: "0.6rem 0.8rem",
                        color: "#FFF9F0",
                        fontSize: "0.88rem",
                        marginTop: "0.2rem"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "rgba(255, 249, 240, 0.65)" }}>Pincode *</label>
                    <input
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      style={{
                        width: "100%",
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "8px",
                        padding: "0.6rem 0.8rem",
                        color: "#FFF9F0",
                        fontSize: "0.88rem",
                        marginTop: "0.2rem"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary, Coupon & Payment */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Coupon Form */}
              <div
                style={{
                  background: "linear-gradient(180deg, rgba(50, 12, 68, 0.6) 0%, rgba(25, 5, 35, 0.8) 100%)",
                  border: "1px solid rgba(212, 168, 79, 0.25)",
                  borderRadius: "16px",
                  padding: "1.25rem"
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#F2C96B", display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.65rem" }}>
                  <Tag size={16} color="#D4A84F" /> Apply Promo or Spiritual Coupon
                </div>

                <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code (e.g. DIWALI15)"
                    style={{
                      flex: 1,
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(212, 168, 79, 0.3)",
                      borderRadius: "8px",
                      padding: "0.6rem 0.8rem",
                      color: "#FFF9F0",
                      fontSize: "0.85rem",
                      textTransform: "uppercase"
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: "linear-gradient(135deg, #D4A84F 0%, #B8860B 100%)",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.6rem 1rem",
                      color: "#1A0524",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: "pointer"
                    }}
                  >
                    Apply
                  </button>
                </form>

                {appliedCoupon && (
                  <div style={{ marginTop: "0.6rem", fontSize: "0.8rem", color: "#10B981", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <CheckCircle size={14} /> {appliedCoupon.name} applied (-₹{discountInr.toFixed(2)})
                  </div>
                )}
                {couponError && (
                  <div style={{ marginTop: "0.6rem", fontSize: "0.78rem", color: "#EF4444" }}>
                    {couponError}
                  </div>
                )}
              </div>

              {/* Order Calculation Summary */}
              <div
                style={{
                  background: "linear-gradient(180deg, rgba(50, 12, 68, 0.6) 0%, rgba(25, 5, 35, 0.8) 100%)",
                  border: "1px solid rgba(212, 168, 79, 0.25)",
                  borderRadius: "16px",
                  padding: "1.5rem"
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFF9F0", marginBottom: "1rem" }}>
                  Order Summary
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.88rem", color: "rgba(255, 249, 240, 0.75)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Items Subtotal</span>
                    <span style={{ color: "#FFF9F0" }}>₹{subtotalInr.toFixed(2)}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Shipping Charges</span>
                    <span style={{ color: shippingInr === 0 ? "#10B981" : "#FFF9F0" }}>
                      {shippingInr === 0 ? "FREE" : `₹${shippingInr.toFixed(2)}`}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Govt GST (18%)</span>
                    <span style={{ color: "#FFF9F0" }}>₹{gstInr.toFixed(2)}</span>
                  </div>

                  {discountInr > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#10B981" }}>
                      <span>Coupon Discount</span>
                      <span>-₹{discountInr.toFixed(2)}</span>
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: "1px solid rgba(212, 168, 79, 0.3)",
                      paddingTop: "0.85rem",
                      marginTop: "0.4rem",
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      color: "#FFF9F0"
                    }}
                  >
                    <span>Total Amount</span>
                    <span style={{ color: "#D4A84F" }}>₹{totalInr.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div style={{ marginTop: "1.5rem" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#F2C96B", marginBottom: "0.6rem" }}>
                    Choose Payment Method
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.65rem",
                        background: paymentMethod === "WALLET" ? "rgba(212, 168, 79, 0.12)" : "rgba(255, 255, 255, 0.04)",
                        border: paymentMethod === "WALLET" ? "1px solid #D4A84F" : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        padding: "0.65rem 0.85rem",
                        cursor: "pointer"
                      }}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === "WALLET"}
                        onChange={() => setPaymentMethod("WALLET")}
                        style={{ accentColor: "#D4A84F" }}
                      />
                      <Wallet size={16} color="#D4A84F" />
                      <div style={{ fontSize: "0.85rem" }}>
                        <strong>NAMH Customer Wallet</strong> (Instant 1-Click Pay)
                      </div>
                    </label>

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.65rem",
                        background: paymentMethod === "RAZORPAY" ? "rgba(212, 168, 79, 0.12)" : "rgba(255, 255, 255, 0.04)",
                        border: paymentMethod === "RAZORPAY" ? "1px solid #D4A84F" : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        padding: "0.65rem 0.85rem",
                        cursor: "pointer"
                      }}
                    >
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === "RAZORPAY"}
                        onChange={() => setPaymentMethod("RAZORPAY")}
                        style={{ accentColor: "#D4A84F" }}
                      />
                      <CreditCard size={16} color="#D4A84F" />
                      <div style={{ fontSize: "0.85rem" }}>
                        <strong>Razorpay / Cards / UPI / Netbanking</strong>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cartItems.length === 0}
                  style={{
                    width: "100%",
                    marginTop: "1.5rem",
                    background: "linear-gradient(135deg, #D4A84F 0%, #B8860B 100%)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.85rem",
                    color: "#1A0524",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(212, 168, 79, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem"
                  }}
                >
                  {isCheckingOut ? "Reserving Stock & Placing Order..." : `Pay ₹${totalInr.toFixed(2)} & Place Order`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}

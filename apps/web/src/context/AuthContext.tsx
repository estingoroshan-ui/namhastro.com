"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://127.0.0.1:4000"
    : "http://127.0.0.1:4000");

export interface CustomerUser {
  id: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  role: string;
  status: string;
  preferredLanguage: string;
  profile?: {
    avatarUrl?: string | null;
    dateOfBirth?: string | null;
    timeOfBirth?: string | null;
    isBirthTimeUnknown?: boolean;
    birthPlace?: string | null;
    birthLatitude?: number | null;
    birthLongitude?: number | null;
    birthTimezone?: string;
    currentCity?: string | null;
    gender?: string | null;
    maritalStatus?: string | null;
    consultationInterests?: string[];
  } | null;
  wallet?: {
    paidBalanceInr: number;
    promoBalanceInr: number;
    totalBalanceInr: number;
  };
}

interface AuthContextType {
  user: CustomerUser | null;
  token: string | null;
  loading: boolean;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; debugOtp?: string; message?: string }>;
  verifyOtp: (phone: string, otp: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPassword: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (data: { fullName: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    // Hydrate from localStorage
    try {
      const savedToken = localStorage.getItem("namh_auth_token");
      const savedUser = localStorage.getItem("namh_user");
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify token in background
        fetch(`${API_BASE}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.user) {
              setUser(data.user);
              localStorage.setItem("namh_user", JSON.stringify(data.user));
            }
          })
          .catch(() => {});
      }
    } catch {
      // Ignore storage errors
    } finally {
      setLoading(false);
    }
  }, []);

  const openLoginModal = () => setLoginModalOpen(true);
  const closeLoginModal = () => setLoginModalOpen(false);

  const sendOtp = async (phone: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "LOGIN" }),
      });
      const data = await res.json();
      return { success: res.ok, debugOtp: data.debugOtp, message: data.message };
    } catch {
      return { success: false, message: "Could not connect to authentication service." };
    }
  };

  const verifyOtp = async (phone: string, otp: string, fullName?: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Invalid OTP code." };
      }

      setUser(data.user);
      setToken(data.tokens.accessToken);
      localStorage.setItem("namh_auth_token", data.tokens.accessToken);
      localStorage.setItem("namh_refresh_token", data.tokens.refreshToken);
      localStorage.setItem("namh_user", JSON.stringify(data.user));
      closeLoginModal();
      return { success: true };
    } catch {
      return { success: false, error: "Authentication verification failed." };
    }
  };

  const loginWithPassword = async (identifier: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Invalid credentials." };
      }

      setUser(data.user);
      setToken(data.tokens.accessToken);
      localStorage.setItem("namh_auth_token", data.tokens.accessToken);
      localStorage.setItem("namh_refresh_token", data.tokens.refreshToken);
      localStorage.setItem("namh_user", JSON.stringify(data.user));
      closeLoginModal();
      return { success: true };
    } catch {
      return { success: false, error: "Login request failed." };
    }
  };

  const registerWithEmail = async (regData: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Registration failed." };
      }

      setUser(data.user);
      setToken(data.tokens.accessToken);
      localStorage.setItem("namh_auth_token", data.tokens.accessToken);
      localStorage.setItem("namh_refresh_token", data.tokens.refreshToken);
      localStorage.setItem("namh_user", JSON.stringify(data.user));
      closeLoginModal();
      return { success: true };
    } catch {
      return { success: false, error: "Registration request failed." };
    }
  };

  const logout = () => {
    if (token) {
      const refreshToken = localStorage.getItem("namh_refresh_token");
      fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("namh_auth_token");
    localStorage.removeItem("namh_refresh_token");
    localStorage.removeItem("namh_user");
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("namh_user", JSON.stringify(data.user));
      }
    } catch {
      // Ignore
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!token) return { success: false, error: "Not authenticated" };
    try {
      const res = await fetch(`${API_BASE}/api/v1/customer/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || "Update failed." };
      }
      await refreshUser();
      return { success: true };
    } catch {
      return { success: false, error: "Could not save profile." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginModalOpen,
        openLoginModal,
        closeLoginModal,
        sendOtp,
        verifyOtp,
        loginWithPassword,
        registerWithEmail,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

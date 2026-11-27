export const getApiBase = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // When running on namhastro.com or remote domains, use same-origin relative URLs (/api/...)
    if (host !== "localhost" && host !== "127.0.0.1") {
      return "";
    }
  }
  return "http://127.0.0.1:4000";
};

export const API_BASE = getApiBase();

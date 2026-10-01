export function setAuthCookie(name: string, value: string, maxAge = 86400) {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  // 1. Current origin / host cookie
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  // 2. Wildcard root domain cookie so officex.pro and www.officex.pro share context in InPrivate windows
  if (typeof window !== "undefined" && window.location.hostname.includes("officex.pro")) {
    document.cookie = `${name}=${encodeURIComponent(value)}; domain=.officex.pro; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  }
}

export function getAuthCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : "";
}

export function clearAuthCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  if (typeof window !== "undefined" && window.location.hostname.includes("officex.pro")) {
    document.cookie = `${name}=; domain=.officex.pro; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  }
}

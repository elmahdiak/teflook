"use client";

import { useEffect, useState } from "react";
import { ADMIN_LOGIN_PATH } from "./admin-config";

const ADMIN_TOKEN_KEY = "teflook_admin_token";
const DEFAULT_USER = "admin";
const DEFAULT_PASS = "teflook2026";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  return token === "authenticated_admin_session";
}

export function loginAdmin(username: string, pass: string): boolean {
  if (
    (username.trim().toLowerCase() === DEFAULT_USER || username.trim().toLowerCase() === "admin@teflook.com") &&
    pass === DEFAULT_PASS
  ) {
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_TOKEN_KEY, "authenticated_admin_session");
      document.cookie = `teflook_admin_auth=true; path=/; max-age=86400; SameSite=Lax`;
    }
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    document.cookie = `teflook_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    window.location.href = ADMIN_LOGIN_PATH;
  }
}

export function useAdminAuth() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  return {
    isAuthenticated: isAuth,
    login: loginAdmin,
    logout: logoutAdmin,
  };
}

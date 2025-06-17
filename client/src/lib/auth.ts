import { User } from "../types";

export const setAuthData = (token: string, user: User): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", user.role);
    localStorage.setItem("userEmail", user.email);
  }
};

export const clearAuthData = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
  }
};

export const getUserEmail = (): string | null => {
  return typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
};

export const getUserRole = (): string | null => {
  return typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
};

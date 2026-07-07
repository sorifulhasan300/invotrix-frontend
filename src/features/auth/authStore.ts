import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import apiClient from "../../services/api";

interface User {
  _id: string;
  email: string;
  name: string;
  role: "Admin" | "Manager" | "Employee";
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  fetchCurrentUser: () => Promise<void>;
  logout: () => void;
}

// Custom Cookie Storage Engine for Zustand Persist
const cookieStorage = {
  getItem: (name: string): string | null => {
    const value = Cookies.get(name);
    return value !== undefined ? value : null;
  },
  setItem: (name: string, value: string): void => {
    Cookies.set(name, value, {
      expires: 7,
      secure: window.location.protocol === "https:",
      sameSite: "strict",
      path: "/",
    });
  },
  removeItem: (name: string): void => {
    Cookies.remove(name, { path: "/" });
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isCheckingAuth: true,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isCheckingAuth: false,
        });
      },

      fetchCurrentUser: async () => {
        const currentToken = get().token;
        const currentUser = get().user;
        const currentLoading = get().isLoading;

        // 1. Guard: If no token exists, clean up state and stop checking auth
        if (!currentToken) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isCheckingAuth: false,
          });
          return;
        }

        // 2. Guard: If already loading, or if the user is already fetched, do not repeat the call
        if (currentLoading || currentUser) {
          if (get().isCheckingAuth) {
            set({ isCheckingAuth: false });
          }
          return;
        }

        try {
          set({ isLoading: true, isCheckingAuth: true });
          const response = await apiClient.get<{ data: { user: User } }>(
            "/auth/me",
          );
          set({
            user: response.data.data.user,
            isAuthenticated: true,
            isLoading: false,
            isCheckingAuth: false,
          });
        } catch (error) {
          console.error("Auth verification failed:", error);
          get().logout();
        }
      },
      logout: () => {
        cookieStorage.removeItem("auth-storage");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isCheckingAuth: false,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({ token: state.token }),
    },
  ),
);

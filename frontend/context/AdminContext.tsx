"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  adminGetMe,
  adminLogout,
  adminGetDashboardStats,
  adminGetRegistrations,
  adminGetRegistrationDetails,
  adminGetTeams,
  adminGetTeamDetails,
  adminGetEvents,
  AdminProfile,
  AdminDashboardStats,
  AdminRegistrationListItem,
  AdminRegistrationDetail,
  AdminTeamListItem,
  AdminTeamDetail,
  PaginationMeta,
} from "@/lib/api";

interface RegistrationsQueryResponse {
  registrations: AdminRegistrationListItem[];
  pagination: PaginationMeta;
}

interface TeamsQueryResponse {
  teams: AdminTeamListItem[];
  pagination: PaginationMeta;
}

interface AdminContextType {
  admin: AdminProfile | null;
  isLoadingAdmin: boolean;
  logout: () => Promise<void>;

  // Dashboard
  dashboardStats: AdminDashboardStats | null;
  getDashboardStats: (forceRefresh?: boolean) => Promise<AdminDashboardStats | null>;

  // Events
  events: Array<{ id: string; name: string; slug: string; category?: string }> | null;
  getEvents: () => Promise<Array<{ id: string; name: string; slug: string; category?: string }>>;

  // Registrations
  getRegistrations: (
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      eventId?: string;
      registrationType?: string;
      status?: string;
    },
    forceRefresh?: boolean
  ) => Promise<RegistrationsQueryResponse>;

  // Registration Detail
  getRegistrationDetails: (
    registrationId: string,
    forceRefresh?: boolean
  ) => Promise<AdminRegistrationDetail>;

  // Teams
  getTeams: (
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      eventId?: string;
      status?: string;
    },
    forceRefresh?: boolean
  ) => Promise<TeamsQueryResponse>;

  // Team Detail
  getTeamDetails: (
    teamId: string,
    forceRefresh?: boolean
  ) => Promise<AdminTeamDetail>;

  // Sidebar Collapse State (pure UI state)
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // Theme State (dark / light)
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // 1. Session State
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const authCheckedRef = useRef(false);

  // 2. In-Memory Data Caches
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [events, setEvents] = useState<Array<{ id: string; name: string; slug: string; category?: string }> | null>(null);

  // Use refs for query caches so lookups are instantaneous without triggering layout re-renders
  const registrationsCache = useRef<Record<string, RegistrationsQueryResponse>>({});
  const registrationDetailsCache = useRef<Record<string, AdminRegistrationDetail>>({});
  const teamsCache = useRef<Record<string, TeamsQueryResponse>>({});
  const teamDetailsCache = useRef<Record<string, AdminTeamDetail>>({});

  // 3. Pure Client-Side Sidebar Collapse State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("xavitech_admin_sidebar_collapsed");
      if (saved !== null) {
        setIsSidebarCollapsed(saved === "true");
      }
    } catch (e) {
      // In SSR or restricted storage environments
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("xavitech_admin_sidebar_collapsed", String(next));
      } catch (e) {}
      return next;
    });
  }, []);

  // 4. Dark / Light Theme State with LocalStorage Persistence
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("xavitech_admin_theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
      }
    } catch (e) {
      // In SSR or restricted storage environments
    }
  }, []);

  const setTheme = useCallback((newTheme: "dark" | "light") => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("xavitech_admin_theme", newTheme);
    } catch (e) {}
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("xavitech_admin_theme", next);
      } catch (e) {}
      return next;
    });
  }, []);

  // 5. Resolve Admin Authentication Once at Layout Level
  useEffect(() => {
    // If on the login page itself, don't perform protected auth guard
    if (pathname === "/xavitech-superadmin") {
      setIsLoadingAdmin(false);
      return;
    }

    // Only verify once per browser memory session
    if (authCheckedRef.current) {
      return;
    }

    let isMounted = true;
    authCheckedRef.current = true;

    async function verifyAdminSession() {
      try {
        const profile = await adminGetMe();
        if (isMounted) {
          setAdmin(profile);
          setIsLoadingAdmin(false);
        }
      } catch (err) {
        if (isMounted) {
          setAdmin(null);
          setIsLoadingAdmin(false);
          router.replace("/xavitech-superadmin");
        }
      }
    }

    verifyAdminSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  // 4. Logout Handler
  const logout = useCallback(async () => {
    try {
      await adminLogout();
    } catch (err) {
      console.error("Error during admin logout:", err);
    } finally {
      // Clear in-memory cache
      setAdmin(null);
      setDashboardStats(null);
      setEvents(null);
      registrationsCache.current = {};
      registrationDetailsCache.current = {};
      teamsCache.current = {};
      teamDetailsCache.current = {};
      authCheckedRef.current = false;
      router.replace("/xavitech-superadmin");
    }
  }, [router]);

  // 5. Cached Dashboard Stats Getter
  const getDashboardStats = useCallback(
    async (forceRefresh = false): Promise<AdminDashboardStats | null> => {
      if (!forceRefresh && dashboardStats) {
        return dashboardStats;
      }
      try {
        const data = await adminGetDashboardStats();
        setDashboardStats(data);
        return data;
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        return null;
      }
    },
    [dashboardStats]
  );

  // 6. Cached Events Getter
  const getEvents = useCallback(async (): Promise<
    Array<{ id: string; name: string; slug: string; category?: string }>
  > => {
    if (events && events.length > 0) {
      return events;
    }
    try {
      const data = await adminGetEvents();
      setEvents(data);
      return data;
    } catch (err) {
      console.error("Failed to load events:", err);
      return [];
    }
  }, [events]);

  // 7. Cached Registrations Query Getter
  const getRegistrations = useCallback(
    async (
      params?: {
        page?: number;
        limit?: number;
        search?: string;
        eventId?: string;
        registrationType?: string;
        status?: string;
      },
      forceRefresh = false
    ): Promise<RegistrationsQueryResponse> => {
      const cacheKey = JSON.stringify({
        page: params?.page || 1,
        limit: params?.limit || 15,
        search: (params?.search || "").trim(),
        eventId: params?.eventId || "",
        registrationType: params?.registrationType || "",
        status: params?.status || "",
      });

      if (!forceRefresh && registrationsCache.current[cacheKey]) {
        return registrationsCache.current[cacheKey];
      }

      const result = await adminGetRegistrations(params);
      registrationsCache.current[cacheKey] = result;
      return result;
    },
    []
  );

  // 8. Cached Registration Details Getter
  const getRegistrationDetails = useCallback(
    async (
      registrationId: string,
      forceRefresh = false
    ): Promise<AdminRegistrationDetail> => {
      const cleanId = (registrationId || "").trim();
      if (!forceRefresh && registrationDetailsCache.current[cleanId]) {
        return registrationDetailsCache.current[cleanId];
      }

      const result = await adminGetRegistrationDetails(cleanId);
      registrationDetailsCache.current[cleanId] = result;
      return result;
    },
    []
  );

  // 9. Cached Teams Query Getter
  const getTeams = useCallback(
    async (
      params?: {
        page?: number;
        limit?: number;
        search?: string;
        eventId?: string;
        status?: string;
      },
      forceRefresh = false
    ): Promise<TeamsQueryResponse> => {
      const cacheKey = JSON.stringify({
        page: params?.page || 1,
        limit: params?.limit || 15,
        search: (params?.search || "").trim(),
        eventId: params?.eventId || "",
        status: params?.status || "",
      });

      if (!forceRefresh && teamsCache.current[cacheKey]) {
        return teamsCache.current[cacheKey];
      }

      const result = await adminGetTeams(params);
      teamsCache.current[cacheKey] = result;
      return result;
    },
    []
  );

  // 10. Cached Team Details Getter
  const getTeamDetails = useCallback(
    async (teamId: string, forceRefresh = false): Promise<AdminTeamDetail> => {
      const cleanId = (teamId || "").trim();
      if (!forceRefresh && teamDetailsCache.current[cleanId]) {
        return teamDetailsCache.current[cleanId];
      }

      const result = await adminGetTeamDetails(cleanId);
      teamDetailsCache.current[cleanId] = result;
      return result;
    },
    []
  );

  const value: AdminContextType = {
    admin,
    isLoadingAdmin,
    logout,
    dashboardStats,
    getDashboardStats,
    events,
    getEvents,
    getRegistrations,
    getRegistrationDetails,
    getTeams,
    getTeamDetails,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    toggleSidebar,
    theme,
    toggleTheme,
    setTheme,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

export default AdminContext;

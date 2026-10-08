"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  api,
  TrackLeaderProfile,
  TrackLeaderAssignedTrack,
  TrackLeaderEvent,
  AdminRegistrationListItem,
  AdminDashboardStats,
  ApiError,
} from "@/lib/api";

interface TrackLeaderContextType {
  trackLeader: TrackLeaderProfile | null;
  assignedTrack: TrackLeaderAssignedTrack | null;
  events: TrackLeaderEvent[];
  dashboardStats: AdminDashboardStats | null;
  isStatsLoading: boolean;
  refreshDashboardStats: () => Promise<AdminDashboardStats | null>;
  loading: boolean;
  isEventsLoading: boolean;
  error: string | null;
  registrations: AdminRegistrationListItem[];
  registrationsLoading: boolean;
  registrationsRefreshing: boolean;
  registrationsError: string | null;
  registrationsLoaded: boolean;
  refreshRegistrations: (forceRefresh?: boolean) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (curr: string, next: string) => Promise<void>;
  refreshProfile: () => Promise<TrackLeaderProfile | null>;
  refreshTrackAndEvents: () => Promise<void>;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
}

const TrackLeaderContext = createContext<TrackLeaderContextType | undefined>(
  undefined
);

export function TrackLeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [trackLeader, setTrackLeader] = useState<TrackLeaderProfile | null>(null);
  const [assignedTrack, setAssignedTrack] = useState<TrackLeaderAssignedTrack | null>(null);
  const [events, setEvents] = useState<TrackLeaderEvent[]>([]);
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  const refreshDashboardStats = useCallback(async (): Promise<AdminDashboardStats | null> => {
    setIsStatsLoading(true);
    try {
      const stats = await api.trackLeaderGetDashboardStats();
      setDashboardStats(stats);
      return stats;
    } catch (err: any) {
      if (err.data?.code !== "PASSWORD_CHANGE_REQUIRED") {
        console.error("Failed to fetch track leader stats:", err);
      }
      return null;
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // Cached Registrations dataset scoped strictly to assigned track
  const [registrations, setRegistrations] = useState<AdminRegistrationListItem[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsRefreshing, setRegistrationsRefreshing] = useState(false);
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);
  const [registrationsLoaded, setRegistrationsLoaded] = useState(false);

  const inFlightPromiseRef = useRef<Promise<void> | null>(null);
  const registrationsLoadedRef = useRef(false);

  // Fetch track registrations strictly scoped to assigned track (with deduplication and caching)
  const refreshRegistrations = useCallback(async (forceRefresh = false): Promise<void> => {
    // If not forced and we already have loaded the dataset, don't refetch
    if (!forceRefresh && registrationsLoadedRef.current) {
      return;
    }

    // If an identical request is already in flight, return that in-flight promise
    if (inFlightPromiseRef.current) {
      return inFlightPromiseRef.current;
    }

    const runFetch = async () => {
      // If we already have loaded data, this is a background/subtle refresh
      if (registrationsLoadedRef.current) {
        setRegistrationsRefreshing(true);
      } else {
        setRegistrationsLoading(true);
      }
      setRegistrationsError(null);

      try {
        const firstPage = await api.trackLeaderGetRegistrations({ page: 1, limit: 100 });
        let allRegs = [...(firstPage?.registrations || [])];

        // If there are more pages, fetch all remaining in parallel
        if (firstPage?.pagination && firstPage.pagination.totalPages > 1) {
          const remainingPromises = [];
          for (let p = 2; p <= firstPage.pagination.totalPages; p++) {
            remainingPromises.push(api.trackLeaderGetRegistrations({ page: p, limit: 100 }));
          }
          const results = await Promise.all(remainingPromises);
          for (const res of results) {
            if (res?.registrations) {
              allRegs = allRegs.concat(res.registrations);
            }
          }
        }

        setRegistrations(allRegs);
        registrationsLoadedRef.current = true;
        setRegistrationsLoaded(true);
      } catch (err: any) {
        console.error("Failed to load track leader registrations:", err);
        const errorText = err.message || "Failed to load registrations for your assigned track.";
        setRegistrationsError(errorText);
      } finally {
        setRegistrationsLoading(false);
        setRegistrationsRefreshing(false);
        inFlightPromiseRef.current = null;
      }
    };

    inFlightPromiseRef.current = runFetch();
    return inFlightPromiseRef.current;
  }, []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("xavitech_tl_theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setTheme = useCallback((newTheme: "dark" | "light") => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("xavitech_tl_theme", newTheme);
    } catch {
      // Ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("xavitech_tl_theme", next);
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  // Fetch track and events if password change is complete
  const refreshTrackAndEvents = useCallback(async () => {
    setIsEventsLoading(true);
    try {
      const [trackData, eventsData] = await Promise.all([
        api.trackLeaderGetTrack(),
        api.trackLeaderGetEvents(),
      ]);
      setAssignedTrack(trackData.track || null);
      setEvents(eventsData.events || []);
    } catch (err: any) {
      if (err.data?.code !== "PASSWORD_CHANGE_REQUIRED") {
        console.error("Failed to load track leader track/events:", err);
      }
    } finally {
      setIsEventsLoading(false);
    }
  }, []);

  // Fetch profile on initialization
  const refreshProfile = useCallback(async () => {
    try {
      const profile = await api.trackLeaderGetMe();
      if (profile && profile.role === "TRACK_LEADER") {
        setTrackLeader(profile);
        if (profile.assignedTrack) {
          setAssignedTrack(profile.assignedTrack);
        }
        if (!profile.must_change_password) {
          await Promise.all([
            refreshTrackAndEvents(),
            refreshDashboardStats(),
          ]);
          refreshRegistrations(false).catch(() => {});
        }
        return profile;
      } else {
        api.clearTrackLeaderToken();
        setTrackLeader(null);
        setAssignedTrack(null);
        setEvents([]);
        setDashboardStats(null);
        setRegistrations([]);
        registrationsLoadedRef.current = false;
        setRegistrationsLoaded(false);
        return null;
      }
    } catch {
      api.clearTrackLeaderToken();
      setTrackLeader(null);
      setAssignedTrack(null);
      setEvents([]);
      setDashboardStats(null);
      setRegistrations([]);
      registrationsLoadedRef.current = false;
      setRegistrationsLoaded(false);
      return null;
    }
  }, [refreshTrackAndEvents, refreshDashboardStats, refreshRegistrations]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await refreshProfile();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [refreshProfile]);

  // Auth routing and guards
  useEffect(() => {
    if (loading) return;

    const normalizedPath = pathname?.replace(/\/$/, "") || "";
    const isLogin = normalizedPath === "/track-leader/login";
    const isForgotPassword = normalizedPath === "/track-leader/forgot-password";
    const isResetPassword = normalizedPath === "/track-leader/reset-password";
    const isPublicRecovery = isLogin || isForgotPassword || isResetPassword;
    const isChangePassword = normalizedPath === "/track-leader/change-password";
    const isPortalRoute = normalizedPath.startsWith("/track-leader");

    if (!isPortalRoute) return;

    if (!trackLeader) {
      // Unauthenticated: force to login page unless on recovery routes
      if (!isPublicRecovery) {
        router.replace("/track-leader/login");
      }
    } else {
      // Authenticated Track Leader
      if (trackLeader.must_change_password) {
        // Must change password first
        if (!isChangePassword) {
          router.replace("/track-leader/change-password");
        }
      } else {
        // Password already changed: block login or change-password pages
        if (isPublicRecovery || isChangePassword || normalizedPath === "/track-leader") {
          router.replace("/track-leader/dashboard");
        }
      }
    }
  }, [trackLeader, loading, pathname, router]);

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      const res = await api.trackLeaderLogin(email, pass);
      setTrackLeader(res.user);
      if (res.user.assignedTrack) {
        setAssignedTrack(res.user.assignedTrack);
      }
      if (res.user.must_change_password) {
        router.push("/track-leader/change-password");
      } else {
        await refreshTrackAndEvents();
        refreshRegistrations(false).catch(() => {});
        router.push("/track-leader/dashboard");
      }
    } catch (err: any) {
      const msg = err.message || "Invalid track leader credentials.";
      setError(msg);
      throw err;
    }
  };

  const changePassword = async (curr: string, next: string) => {
    setError(null);
    try {
      await api.trackLeaderChangePassword(curr, next);
      // Update local profile state
      setTrackLeader((prev) => (prev ? { ...prev, must_change_password: false } : null));
      await refreshTrackAndEvents();
      refreshRegistrations(false).catch(() => {});
      router.push("/track-leader/dashboard");
    } catch (err: any) {
      const msg = err.message || "Failed to change password.";
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.trackLeaderLogout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setTrackLeader(null);
      setAssignedTrack(null);
      setEvents([]);
      setRegistrations([]);
      registrationsLoadedRef.current = false;
      setRegistrationsLoaded(false);
      setRegistrationsLoading(false);
      setRegistrationsRefreshing(false);
      setRegistrationsError(null);
      router.replace("/track-leader/login");
    }
  };

  return (
    <TrackLeaderContext.Provider
      value={{
        trackLeader,
        assignedTrack,
        events,
        dashboardStats,
        isStatsLoading,
        refreshDashboardStats,
        loading,
        isEventsLoading,
        error,
        registrations,
        registrationsLoading,
        registrationsRefreshing,
        registrationsError,
        registrationsLoaded,
        refreshRegistrations,
        login,
        logout,
        changePassword,
        refreshProfile,
        refreshTrackAndEvents,
        isSidebarCollapsed,
        toggleSidebar,
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </TrackLeaderContext.Provider>
  );
}

export function useTrackLeader() {
  const context = useContext(TrackLeaderContext);
  if (!context) {
    throw new Error(
      "useTrackLeader must be used within a TrackLeaderProvider"
    );
  }
  return context;
}

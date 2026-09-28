"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  api,
  TrackLeaderProfile,
  TrackLeaderAssignedTrack,
  TrackLeaderEvent,
  ApiError,
} from "@/lib/api";

interface TrackLeaderContextType {
  trackLeader: TrackLeaderProfile | null;
  assignedTrack: TrackLeaderAssignedTrack | null;
  events: TrackLeaderEvent[];
  loading: boolean;
  isEventsLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (curr: string, next: string) => Promise<void>;
  refreshProfile: () => Promise<TrackLeaderProfile | null>;
  refreshTrackAndEvents: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          refreshTrackAndEvents();
        }
        return profile;
      } else {
        setTrackLeader(null);
        setAssignedTrack(null);
        setEvents([]);
        return null;
      }
    } catch {
      setTrackLeader(null);
      setAssignedTrack(null);
      setEvents([]);
      return null;
    }
  }, [refreshTrackAndEvents]);

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

    const isLogin = pathname === "/track-leader/login";
    const isForgotPassword = pathname === "/track-leader/forgot-password";
    const isResetPassword = pathname === "/track-leader/reset-password";
    const isPublicRecovery = isLogin || isForgotPassword || isResetPassword;
    const isChangePassword = pathname === "/track-leader/change-password";
    const isPortalRoute = pathname.startsWith("/track-leader");

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
        if (isPublicRecovery || isChangePassword || pathname === "/track-leader") {
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
      router.replace("/track-leader/login");
    }
  };

  return (
    <TrackLeaderContext.Provider
      value={{
        trackLeader,
        assignedTrack,
        events,
        loading,
        isEventsLoading,
        error,
        login,
        logout,
        changePassword,
        refreshProfile,
        refreshTrackAndEvents,
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

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider, hasFirebaseConfig } from "../lib/firebase/client";
import {
  api,
  UserProfile,
  UpdateProfilePayload,
  ApiError,
  RegistrationIndexItem,
  UUID_TO_EVENT_SLUG,
} from "../lib/api";

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<UserProfile>;
  getIdToken: () => Promise<string | null>;
  // Centralized Registration Index Cache
  registrations: RegistrationIndexItem[];
  registrationsLoading: boolean;
  refreshRegistrations: () => Promise<RegistrationIndexItem[]>;
  getRegistrationForEvent: (eventSlugOrId: string) => RegistrationIndexItem | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Centralized Registration Index State
  const [registrations, setRegistrations] = useState<RegistrationIndexItem[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const lastFetchedUidRef = useRef<string | null>(null);

  // Helper to retrieve current ID token
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!auth?.currentUser) return null;
    return await auth.currentUser.getIdToken();
  }, []);

  // Fetch or refresh the PostgreSQL user profile from backend
  const syncBackendUser = useCallback(
    async (fbUser: FirebaseUser): Promise<UserProfile> => {
      const token = await fbUser.getIdToken();
      const profile = await api.fetchUserProfile(token);
      setUser(profile);
      return profile;
    },
    []
  );

  // Fetch lightweight registration index for the authenticated user
  const fetchRegistrationsIndex = useCallback(
    async (fbUser: FirebaseUser): Promise<RegistrationIndexItem[]> => {
      setRegistrationsLoading(true);
      try {
        const token = await fbUser.getIdToken();
        const index = await api.fetchMyRegistrationIndex(token);
        const safeIndex = Array.isArray(index) ? index : [];
        setRegistrations(safeIndex);
        return safeIndex;
      } catch (error) {
        console.error("Failed to load user registration index:", error);
        setRegistrations([]);
        return [];
      } finally {
        setRegistrationsLoading(false);
      }
    },
    []
  );

  // Re-fetch profile manually
  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!auth?.currentUser) {
      setUser(null);
      return null;
    }
    return await syncBackendUser(auth.currentUser);
  }, [syncBackendUser]);

  // Re-fetch registration index manually (e.g. after registration creation or payment)
  const refreshRegistrations = useCallback(async (): Promise<RegistrationIndexItem[]> => {
    if (!auth?.currentUser) {
      setRegistrations([]);
      return [];
    }
    return await fetchRegistrationsIndex(auth.currentUser);
  }, [fetchRegistrationsIndex]);

  // Lookup existing registration for an event from the centralized in-memory index
  const getRegistrationForEvent = useCallback(
    (eventSlugOrId: string): RegistrationIndexItem | null => {
      if (!eventSlugOrId || !registrations.length) return null;
      const target = eventSlugOrId.trim().toLowerCase();

      const matches = registrations.filter((r) => {
        const slug = (r.eventSlug || "").trim().toLowerCase();
        const id = (r.eventId || "").trim().toLowerCase();
        if (slug === target || id === target) return true;
        if (UUID_TO_EVENT_SLUG[target] && UUID_TO_EVENT_SLUG[target] === slug) return true;
        if (UUID_TO_EVENT_SLUG[id] && UUID_TO_EVENT_SLUG[id] === target) return true;
        return false;
      });

      if (matches.length === 0) return null;
      // Prefer active (non-cancelled) registrations
      const active = matches.find((r) => r.status !== "CANCELLED");
      return active || matches[0];
    },
    [registrations]
  );

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          await syncBackendUser(fbUser);
        } catch (error) {
          console.error("Failed to sync backend user on auth state change:", error);
          // If backend token sync fails, reset user state
          setUser(null);
        }

        // Fetch centralized registration index ONCE per authenticated UID
        if (lastFetchedUidRef.current !== fbUser.uid) {
          lastFetchedUidRef.current = fbUser.uid;
          fetchRegistrationsIndex(fbUser).catch(() => {});
        }
      } else {
        lastFetchedUidRef.current = null;
        setUser(null);
        setRegistrations([]);
        setRegistrationsLoading(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncBackendUser, fetchRegistrationsIndex]);

  // Google Sign-In Flow
  const loginWithGoogle = async (): Promise<UserProfile> => {
    if (!hasFirebaseConfig || !auth || !googleProvider) {
      throw new Error(
        "Google sign-in is not configured. Add the Firebase web app values to frontend/.env.local and restart the dev server."
      );
    }

    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await syncBackendUser(result.user);
      setFirebaseUser(result.user);
      if (lastFetchedUidRef.current !== result.user.uid) {
        lastFetchedUidRef.current = result.user.uid;
        fetchRegistrationsIndex(result.user).catch(() => {});
      }
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign-Out Flow
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      if (auth) await firebaseSignOut(auth);
      lastFetchedUidRef.current = null;
      setFirebaseUser(null);
      setUser(null);
      setRegistrations([]);
      setRegistrationsLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Update Profile Flow
  const updateProfile = async (
    payload: UpdateProfilePayload
  ): Promise<UserProfile> => {
    const token = await getIdToken();
    if (!token) {
      throw new ApiError("Authentication required. Please sign in.", 401);
    }
    const updated = await api.updateUserProfile(token, payload);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAuthenticated: Boolean(user && firebaseUser),
        loginWithGoogle,
        logout,
        refreshProfile,
        updateProfile,
        getIdToken,
        registrations,
        registrationsLoading,
        refreshRegistrations,
        getRegistrationForEvent,
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

export default AuthContext;

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase/client";
import {
  api,
  UserProfile,
  UpdateProfilePayload,
  ApiError,
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to retrieve current ID token
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
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

  // Re-fetch profile manually
  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!auth.currentUser) {
      setUser(null);
      return null;
    }
    return await syncBackendUser(auth.currentUser);
  }, [syncBackendUser]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
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
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncBackendUser]);

  // Google Sign-In Flow
  const loginWithGoogle = async (): Promise<UserProfile> => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await syncBackendUser(result.user);
      setFirebaseUser(result.user);
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
      await firebaseSignOut(auth);
      setFirebaseUser(null);
      setUser(null);
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

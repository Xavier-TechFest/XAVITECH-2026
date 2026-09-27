/**
 * API Client for XAVITECH-2026 Backend Services
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface UserProfile {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  profileImage: string | null;
  phone: string | null;
  collegeName: string | null;
  role: string;
  isActive: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  college_name?: string;
  profile_image?: string;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Fetch current authenticated user's profile from the backend.
 * Backend verifies the Firebase ID token and syncs the PostgreSQL user.
 */
export async function fetchUserProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to fetch user profile",
      response.status,
      json
    );
  }

  return json.data;
}

/**
 * Update current authenticated user's profile.
 * Only sends safe editable fields (name, phone, college_name, profile_image).
 */
export async function updateUserProfile(
  token: string,
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = Array.isArray(json.error)
      ? json.error.join(", ")
      : json.message || "Failed to update profile";
    throw new ApiError(errorMsg, response.status, json);
  }

  return json.data;
}

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  sessionId?: string | null;
}

/**
 * Authenticate admin using email, password, and server-side secret key.
 * Uses credentials: 'include' for HttpOnly cookie persistence.
 */
export async function adminLogin(payload: {
  email: string;
  password: string;
  secretKey: string;
}): Promise<{ admin: AdminProfile; token: string }> {
  const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      json.message || "Invalid admin credentials.",
      response.status,
      json
    );
  }

  return json.data;
}

/**
 * Fetch authenticated admin profile from current session.
 */
export async function adminGetMe(): Promise<AdminProfile> {
  const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to fetch admin profile.",
      response.status,
      json
    );
  }

  return json.data;
}

/**
 * Log out current admin session.
 */
export async function adminLogout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    throw new ApiError(
      json.message || "Failed to logout admin session.",
      response.status,
      json
    );
  }
}

export const api = {
  fetchUserProfile,
  updateUserProfile,
  adminLogin,
  adminGetMe,
  adminLogout,
};

export default api;

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

export const api = {
  fetchUserProfile,
  updateUserProfile,
};

export default api;

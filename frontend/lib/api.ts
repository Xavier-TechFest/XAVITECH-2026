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

// =============================================================================
// Phase 7: Admin Registration Management Types & Functions
// =============================================================================

export interface AdminDashboardStats {
  totalRegistrations: number;
  totalParticipants: number;
  totalTeams: number;
  activeEvents: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface AdminRegistrationListItem {
  id: string;
  registrationId: string;
  registrationType: "INDIVIDUAL" | "TEAM";
  status: string;
  createdAt: string;
  updatedAt: string;
  participantCount: number;
  event: {
    id: string;
    name: string;
    slug: string;
    category?: string;
    fee: number;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    institution: string | null;
  } | null;
  team: {
    id: string;
    teamName: string;
    status: string;
    memberCount: number;
    totalTeamSize: number;
  } | null;
}

export interface AdminRegistrationDetail {
  id: string;
  registrationId: string;
  registrationType: "INDIVIDUAL" | "TEAM";
  status: string;
  createdAt: string;
  updatedAt: string;
  totalParticipants: number;
  event: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    registrationType: string;
    minTeamSize: number | null;
    maxTeamSize: number | null;
    fee: number;
    isActive: boolean;
    registrationOpen: boolean;
  } | null;
  leader: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    institution: string | null;
    profileImage: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
  } | null;
  team: {
    id: string;
    teamName: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    leader: {
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
      institution: string | null;
    } | null;
    members: Array<{
      id: string;
      name: string;
      memberOrder: number;
      createdAt: string;
    }>;
    memberCount: number;
    totalTeamSize: number;
  } | null;
}

export interface AdminTeamListItem {
  id: string;
  teamName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  totalTeamSize: number;
  event: {
    id: string;
    name: string;
    slug: string;
    fee: number;
    minTeamSize: number | null;
    maxTeamSize: number | null;
  } | null;
  leader: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    institution: string | null;
  } | null;
  registration: {
    id: string;
    registrationId: string;
    status: string;
  } | null;
}

export interface AdminTeamDetail {
  id: string;
  teamName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalTeamSize: number;
  memberCount: number;
  event: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    registrationType: string;
    minTeamSize: number | null;
    maxTeamSize: number | null;
    fee: number;
    isActive: boolean;
    registrationOpen: boolean;
  } | null;
  leader: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    institution: string | null;
    profileImage: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
  } | null;
  members: Array<{
    id: string;
    name: string;
    memberOrder: number;
    createdAt: string;
  }>;
  registration: {
    id: string;
    registrationId: string;
    status: string;
    registrationType: string;
    createdAt: string;
  } | null;
}

/**
 * Fetch overview statistics for the admin dashboard.
 */
export async function adminGetDashboardStats(): Promise<AdminDashboardStats> {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to fetch dashboard stats", response.status, json);
  }
  return json.data;
}

/**
 * Fetch paginated, searchable, filterable registrations list.
 */
export async function adminGetRegistrations(params?: {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: string;
  registrationType?: string;
  status?: string;
}): Promise<{ registrations: AdminRegistrationListItem[]; pagination: PaginationMeta }> {
  const url = new URL(`${API_BASE_URL}/admin/registrations`);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.eventId) url.searchParams.set("eventId", params.eventId);
  if (params?.registrationType) url.searchParams.set("registrationType", params.registrationType);
  if (params?.status) url.searchParams.set("status", params.status);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to fetch registrations", response.status, json);
  }
  return json.data;
}

/**
 * Fetch complete details for a specific registration.
 */
export async function adminGetRegistrationDetails(
  registrationId: string
): Promise<AdminRegistrationDetail> {
  const response = await fetch(`${API_BASE_URL}/admin/registrations/${encodeURIComponent(registrationId)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Registration not found", response.status, json);
  }
  return json.data;
}

/**
 * Fetch paginated, searchable, filterable teams list.
 */
export async function adminGetTeams(params?: {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: string;
  status?: string;
}): Promise<{ teams: AdminTeamListItem[]; pagination: PaginationMeta }> {
  const url = new URL(`${API_BASE_URL}/admin/teams`);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.eventId) url.searchParams.set("eventId", params.eventId);
  if (params?.status) url.searchParams.set("status", params.status);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to fetch teams", response.status, json);
  }
  return json.data;
}

/**
 * Fetch complete details for a specific team.
 */
export async function adminGetTeamDetails(teamId: string): Promise<AdminTeamDetail> {
  const response = await fetch(`${API_BASE_URL}/admin/teams/${encodeURIComponent(teamId)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Team not found", response.status, json);
  }
  return json.data;
}

/**
 * Fetch all active events for admin dropdown filter selection.
 */
export async function adminGetEvents(): Promise<Array<{ id: string; name: string; slug: string; category?: string }>> {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    return [];
  }
  return json.data || [];
}

export const api = {
  fetchUserProfile,
  updateUserProfile,
  adminLogin,
  adminGetMe,
  adminLogout,
  adminGetDashboardStats,
  adminGetRegistrations,
  adminGetRegistrationDetails,
  adminGetTeams,
  adminGetTeamDetails,
  adminGetEvents,
};

export default api;


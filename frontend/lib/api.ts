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

/**
 * Fetch all active tracks for admin dropdown selection.
 */
export async function adminGetTracks(): Promise<Array<{ id: string; name: string; slug: string; is_active: boolean }>> {
  const response = await fetch(`${API_BASE_URL}/tracks`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    return [];
  }
  return json.data || [];
}

export interface AdminTrackLeaderListItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  is_active: boolean;
  must_change_password: boolean;
  track: {
    id: string;
    name: string;
    slug: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface AdminTrackLeaderSession {
  id: string;
  userAgent: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
}

export interface AdminTrackLeaderDetail extends AdminTrackLeaderListItem {
  activeSessionsCount: number;
  sessions: AdminTrackLeaderSession[];
}

export interface AdminCreateTrackLeaderPayload {
  name: string;
  email: string;
  trackId: string;
}

export interface AdminUpdateTrackLeaderPayload {
  name?: string;
  email?: string;
  trackId?: string;
}

export interface AdminTrackLeaderCreateResult {
  user: AdminTrackLeaderListItem;
  track: {
    id: string;
    name: string;
    slug: string;
  };
  temporaryPassword?: string;
  emailSent?: boolean;
}

export interface AdminTrackLeaderResetResult {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    is_active: boolean;
    must_change_password: boolean;
    updated_at: string;
  };
  temporaryPassword: string;
  emailSent?: boolean;
}

/**
 * Fetch paginated, searchable, filterable track leaders list.
 */
export async function adminGetTrackLeaders(params?: {
  page?: number;
  limit?: number;
  search?: string;
  trackId?: string;
  status?: string;
}): Promise<{ trackLeaders: AdminTrackLeaderListItem[]; pagination: PaginationMeta }> {
  const url = new URL(`${API_BASE_URL}/admin/track-leaders`);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.trackId) url.searchParams.set("trackId", params.trackId);
  if (params?.status) url.searchParams.set("status", params.status);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to fetch track leaders", response.status, json);
  }
  return json.data;
}

/**
 * Fetch complete details for a specific track leader.
 */
export async function adminGetTrackLeader(id: string): Promise<AdminTrackLeaderDetail> {
  const response = await fetch(`${API_BASE_URL}/admin/track-leaders/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Track leader not found", response.status, json);
  }
  return json.data;
}

/**
 * Create a new Track Leader with assigned track.
 */
export async function adminCreateTrackLeader(
  payload: AdminCreateTrackLeaderPayload
): Promise<AdminTrackLeaderCreateResult> {
  const response = await fetch(`${API_BASE_URL}/admin/track-leaders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to create track leader", response.status, json);
  }
  return json.data;
}

/**
 * Update track leader name, email, and/or reassign track.
 */
export async function adminUpdateTrackLeader(
  id: string,
  payload: AdminUpdateTrackLeaderPayload
): Promise<AdminTrackLeaderDetail> {
  const response = await fetch(`${API_BASE_URL}/admin/track-leaders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to update track leader", response.status, json);
  }
  return json.data;
}

/**
 * Activate or deactivate a track leader account.
 */
export async function adminUpdateTrackLeaderStatus(
  id: string,
  isActive: boolean
): Promise<AdminTrackLeaderListItem> {
  const response = await fetch(
    `${API_BASE_URL}/admin/track-leaders/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ is_active: isActive }),
    }
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to update track leader status", response.status, json);
  }
  return json.data;
}

/**
 * Reissue / reset credentials for a track leader.
 */
export async function adminResetTrackLeaderCredentials(
  id: string
): Promise<AdminTrackLeaderResetResult> {
  const response = await fetch(
    `${API_BASE_URL}/admin/track-leaders/${encodeURIComponent(id)}/reset-credentials`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to reset credentials", response.status, json);
  }
  return json.data;
}

export interface TrackLeaderAssignedTrack {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
}

export interface TrackLeaderProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  is_active: boolean;
  must_change_password: boolean;
  sessionId?: string | null;
  assignedTrack?: TrackLeaderAssignedTrack | null;
  assignment?: {
    id: string;
    track_id: string;
    is_active: boolean;
  } | null;
}

export interface TrackLeaderEvent {
  id: string;
  title: string;
  name?: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  category?: string;
  track_id: string;
  is_active: boolean;
  registration_open: boolean;
  registration_type: "INDIVIDUAL" | "TEAM";
  min_team_size: number;
  max_team_size: number;
  entry_fee: number;
  prize_pool?: string | number | null;
}

export async function trackLeaderLogin(
  email: string,
  password: string
): Promise<{ user: TrackLeaderProfile; token: string }> {
  const response = await fetch(`${API_BASE_URL}/track-leader/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Invalid track leader credentials.", response.status, json);
  }
  return json.data;
}

export async function trackLeaderGetMe(): Promise<TrackLeaderProfile> {
  const response = await fetch(`${API_BASE_URL}/track-leader/auth/me`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Session invalid or expired", response.status, json);
  }
  return json.data?.user || json.data;
}

export async function trackLeaderChangePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ user: Partial<TrackLeaderProfile> }> {
  const response = await fetch(`${API_BASE_URL}/track-leader/auth/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to change password", response.status, json);
  }
  return json.data;
}

export async function trackLeaderLogout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/track-leader/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to log out", response.status, json);
  }
}

export async function trackLeaderGetTrack(): Promise<{
  assigned: boolean;
  track: TrackLeaderAssignedTrack | null;
}> {
  const response = await fetch(`${API_BASE_URL}/track-leader/track`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to fetch track information", response.status, json);
  }
  return json.data;
}

export async function trackLeaderGetEvents(): Promise<{
  track: TrackLeaderAssignedTrack | null;
  events: TrackLeaderEvent[];
  totalEvents: number;
}> {
  const response = await fetch(`${API_BASE_URL}/track-leader/events`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to fetch track events", response.status, json);
  }
  return json.data;
}

export async function trackLeaderForgotPassword(
  email: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/track-leader/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to process password recovery request",
      response.status,
      json
    );
  }
  return json;
}

export async function trackLeaderResetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/track-leader/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, newPassword, confirmPassword }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Invalid or expired password reset link.",
      response.status,
      json
    );
  }
  return json;
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
  adminGetTracks,
  adminGetTrackLeaders,
  adminGetTrackLeader,
  adminCreateTrackLeader,
  adminUpdateTrackLeader,
  adminUpdateTrackLeaderStatus,
  adminResetTrackLeaderCredentials,
  trackLeaderLogin,
  trackLeaderGetMe,
  trackLeaderChangePassword,
  trackLeaderLogout,
  trackLeaderGetTrack,
  trackLeaderGetEvents,
  trackLeaderForgotPassword,
  trackLeaderResetPassword,
};

export default api;





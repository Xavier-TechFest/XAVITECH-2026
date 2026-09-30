/**
 * API Client for XAVITECH-2026 Backend Services
 */

/**
 * Resolves the standardized API base URL.
 * Ensures the returned URL always ends with "/api" and has no trailing slash,
 * gracefully handling environments where NEXT_PUBLIC_API_URL is configured
 * either with or without the "/api" suffix, or with trailing slashes.
 */
function resolveApiBaseUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  let trimmed = rawUrl.trim().replace(/\/+$/, "");

  // Fallback to default if empty
  if (!trimmed) {
    trimmed = "http://localhost:5000/api";
  }

  // If a relative path was passed (e.g. "/api"), resolve against browser origin
  if (trimmed.startsWith("/") && typeof window !== "undefined" && window.location?.origin) {
    trimmed = `${window.location.origin}${trimmed}`;
  }

  // Ensure path ends with /api
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();

// =============================================================================
// Session Token Management (LocalStorage with SSR Safety)
// =============================================================================
const ADMIN_TOKEN_KEY = "xavitech_admin_token";
const TRACK_LEADER_TOKEN_KEY = "xavitech_track_leader_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {}
}

export function clearAdminToken(): void {
  setAdminToken(null);
}

export function getTrackLeaderToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TRACK_LEADER_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setTrackLeaderToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TRACK_LEADER_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TRACK_LEADER_TOKEN_KEY);
    }
  } catch {}
}

export function clearTrackLeaderToken(): void {
  setTrackLeaderToken(null);
}

export function getAdminHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };
  const token = getAdminToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function getTrackLeaderHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };
  const token = getTrackLeaderToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

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

export interface ParticipantRegistration {
  id: string;
  registrationId?: string;
  registration_id?: string;
  eventId?: string;
  event_id?: string;
  eventSlug?: string;
  event_slug?: string;
  status?: string;
  registrationType?: string;
  registration_type?: string;
  createdAt?: string;
  created_at?: string;
  event?: {
    id?: string;
    slug?: string;
    name?: string;
    title?: string;
    trackName?: string;
    track?: string;
    date?: string;
    venue?: string;
    status?: string;
  };
}

export async function fetchMyRegistrations(token: string): Promise<ParticipantRegistration[]> {
  const response = await fetch(`${API_BASE_URL}/registrations/my`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to fetch registrations",
      response.status,
      json
    );
  }
  return json.data || json || [];
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

  // Persist session token for Authorization Bearer fallback in cross-origin environments
  if (json.data?.token) {
    setAdminToken(json.data.token);
  }

  return json.data;
}

/**
 * Fetch authenticated admin profile from current session.
 */
export async function adminGetMe(): Promise<AdminProfile> {
  const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
    method: "GET",
    headers: getAdminHeaders(),
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
  try {
    const response = await fetch(`${API_BASE_URL}/admin/auth/logout`, {
      method: "POST",
      headers: getAdminHeaders(),
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
  } finally {
    clearAdminToken();
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
    trackId?: string;
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
    trackId?: string;
    track_id?: string;
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
    headers: getAdminHeaders(),
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
  trackId?: string;
  eventId?: string;
  registrationType?: string;
  status?: string;
}): Promise<{ registrations: AdminRegistrationListItem[]; pagination: PaginationMeta }> {
  const url = new URL(`${API_BASE_URL}/admin/registrations`);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.trackId) url.searchParams.set("trackId", params.trackId);
  if (params?.eventId) url.searchParams.set("eventId", params.eventId);
  if (params?.registrationType) url.searchParams.set("registrationType", params.registrationType);
  if (params?.status) url.searchParams.set("status", params.status);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAdminHeaders(),
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
    headers: getAdminHeaders(),
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
    headers: getAdminHeaders(),
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
    headers: getAdminHeaders(),
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
export async function adminGetEvents(): Promise<
  Array<{
    id: string;
    name: string;
    slug: string;
    category?: string;
    trackId?: string;
    track?: { id: string; name: string; slug: string };
  }>
> {
  const response = await fetch(`${API_BASE_URL}/events`, {
    method: "GET",
    headers: getAdminHeaders(),
    credentials: "include",
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
    headers: getAdminHeaders(),
    credentials: "include",
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
    headers: getAdminHeaders(),
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
    headers: getAdminHeaders(),
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
    headers: getAdminHeaders(),
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
    headers: getAdminHeaders(),
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
      headers: getAdminHeaders(),
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
      headers: getAdminHeaders(),
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
  entry_fee?: number;
  fee?: number;
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

  // Persist session token for Authorization Bearer fallback in cross-origin environments
  if (json.data?.token) {
    setTrackLeaderToken(json.data.token);
  }

  return json.data;
}

export async function trackLeaderGetMe(): Promise<TrackLeaderProfile> {
  const response = await fetch(`${API_BASE_URL}/track-leader/auth/me`, {
    method: "GET",
    headers: getTrackLeaderHeaders(),
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
    headers: getTrackLeaderHeaders(),
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
  try {
    const response = await fetch(`${API_BASE_URL}/track-leader/auth/logout`, {
      method: "POST",
      headers: getTrackLeaderHeaders(),
      credentials: "include",
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(json.message || "Failed to log out", response.status, json);
    }
  } finally {
    clearTrackLeaderToken();
  }
}

export async function trackLeaderGetTrack(): Promise<{
  assigned: boolean;
  track: TrackLeaderAssignedTrack | null;
}> {
  const response = await fetch(`${API_BASE_URL}/track-leader/track`, {
    method: "GET",
    headers: getTrackLeaderHeaders(),
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
    headers: getTrackLeaderHeaders(),
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
): Promise<{ success?: boolean; message: string; data?: any }> {
  const response = await fetch(`${API_BASE_URL}/track-leader/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg =
      (typeof json?.message === "string" && json.message) ||
      (typeof json?.error?.message === "string" && json.error.message) ||
      (Array.isArray(json?.error) ? json.error.join(", ") : null) ||
      (typeof json?.error === "string" && json.error) ||
      "Failed to process password recovery request";
    throw new ApiError(errorMsg, response.status, json);
  }

  const successMessage =
    (typeof json?.message === "string" && json.message) ||
    (typeof json?.data?.message === "string" && json.data.message) ||
    "If a Track Leader account exists for this email, a password reset link has been dispatched.";

  return {
    success: true,
    message: successMessage,
    data: json?.data || { message: successMessage },
  };
}

export async function trackLeaderResetPassword(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ success?: boolean; message: string; data?: any }> {
  const response = await fetch(`${API_BASE_URL}/track-leader/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, newPassword, confirmPassword }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg =
      (typeof json?.message === "string" && json.message) ||
      (typeof json?.error?.message === "string" && json.error.message) ||
      (Array.isArray(json?.error) ? json.error.join(", ") : null) ||
      (typeof json?.error === "string" && json.error) ||
      "Invalid or expired password reset link.";
    throw new ApiError(errorMsg, response.status, json);
  }

  const successMessage =
    (typeof json?.message === "string" && json.message) ||
    (typeof json?.data?.message === "string" && json.data.message) ||
    "Password reset successfully completed.";

  return {
    success: true,
    message: successMessage,
    data: json?.data || { message: successMessage },
  };
}

export async function trackLeaderGetRegistrations(params?: {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: string;
  registrationType?: string;
  status?: string;
}): Promise<{ registrations: AdminRegistrationListItem[]; pagination: PaginationMeta }> {
  const url = new URL(`${API_BASE_URL}/track-leader/registrations`);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.eventId) url.searchParams.set("eventId", params.eventId);
  if (params?.registrationType) url.searchParams.set("registrationType", params.registrationType);
  if (params?.status) url.searchParams.set("status", params.status);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getTrackLeaderHeaders(),
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to fetch registrations", response.status, json);
  }
  return json.data;
}

export async function trackLeaderGetRegistrationDetails(
  registrationId: string
): Promise<AdminRegistrationDetail> {
  const response = await fetch(`${API_BASE_URL}/track-leader/registrations/${registrationId}`, {
    method: "GET",
    headers: getTrackLeaderHeaders(),
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to fetch registration details",
      response.status,
      json
    );
  }
  return json.data;
}

export const api = {
  fetchUserProfile,
  updateUserProfile,
  fetchMyRegistrations,
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
  getAdminToken,
  setAdminToken,
  clearAdminToken,
  getAdminHeaders,
  trackLeaderLogin,
  trackLeaderGetMe,
  trackLeaderChangePassword,
  trackLeaderLogout,
  trackLeaderGetTrack,
  trackLeaderGetEvents,
  trackLeaderGetRegistrations,
  trackLeaderGetRegistrationDetails,
  trackLeaderForgotPassword,
  trackLeaderResetPassword,
  getTrackLeaderToken,
  setTrackLeaderToken,
  clearTrackLeaderToken,
  getTrackLeaderHeaders,
};

export default api;





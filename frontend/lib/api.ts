/**
 * API Client for XAVITECH-2026 Backend Services
 */

/**
 * Resolves the standardized API base URL.
 * Ensures the returned URL always ends with "/api" and has no trailing slash,
 * gracefully handling environments where NEXT_PUBLIC_API_URL is configured
 * either with or without the "/api" suffix (e.g. http://localhost:5000 or https://xavitech-2026.onrender.com).
 * Also automatically falls back to http://localhost:5000/api on local dev hosts (localhost, 127.0.0.1)
 * and https://xavitech-2026.onrender.com/api in production.
 */
export function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    let trimmed = configured.replace(/\/+$/, "");
    if (trimmed.startsWith("/") && typeof window !== "undefined" && window.location?.origin) {
      trimmed = `${window.location.origin}${trimmed}`;
    }
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }

  // Automatic environment fallback if NEXT_PUBLIC_API_URL is not explicitly provided:
  if (typeof window !== "undefined" && window.location?.hostname) {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000/api";
    }
    return "https://xavitech-2026.onrender.com/api";
  }

  if (process.env.NODE_ENV === "production") {
    return "https://xavitech-2026.onrender.com/api";
  }

  return "http://localhost:5000/api";
}

export function getApiBaseUrl(): string {
  return resolveApiBaseUrl();
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
  userId?: string;
  user_id?: string;
  eventId?: string;
  event_id?: string;
  eventSlug?: string;
  event_slug?: string;
  teamId?: string | null;
  team_id?: string | null;
  status?: string;
  registrationType?: string;
  registration_type?: string;
  payableAmount?: number | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  event?: {
    id?: string;
    slug?: string;
    name?: string;
    title?: string;
    trackName?: string;
    track?: string | { id?: string; name?: string; slug?: string } | null;
    category?: string | null;
    eventType?: string | null;
    registrationType?: string;
    fee?: number;
    currency?: string;
    date?: string;
    venue?: string;
    status?: string;
  };
  team?: {
    id?: string;
    teamName?: string;
    team_name?: string;
    status?: string;
    members?: Array<{ id: string; name: string; memberOrder?: number }>;
    teamSize?: number;
  };
  user?: {
    id?: string;
    name?: string | null;
    email?: string;
    phone?: string | null;
    collegeName?: string | null;
  };
  participants?: Array<{
    id?: string;
    participantOrder?: number;
    participantRole?: string;
    fullName?: string;
    institutionName?: string;
    mobileNumber?: string;
    email?: string;
    city?: string | null;
    studentId?: string | null;
    standardClass?: string | null;
    idCardUrl?: string | null;
    profilePhotoUrl?: string | null;
    customFields?: Record<string, any>;
  }>;
}

/**
 * Lightweight registration index item stored in centralized frontend cache.
 * Contains only essential identification and status fields without heavy participant snapshots or documents.
 */
export interface RegistrationIndexItem {
  id: string;
  registrationId: string;
  userId?: string;
  eventId: string;
  eventSlug: string | null;
  eventName?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  registrationType: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Canonical database UUID to official event slug mapping for all 13 official festival events.
 */
export const UUID_TO_EVENT_SLUG: Record<string, string> = {
  "213a4266-b523-4317-b80e-c0120965cbe4": "innocraft",
  "abeecd1f-e07d-43e5-8970-691e6ed010b2": "webweave",
  "b631bfc9-ac25-4958-9bb0-c908ae8967b8": "runtime-rush",
  "c83ca21b-9787-4c8d-9bb4-0a1ac7c5b793": "vlookup",
  "15328fe9-412b-4f0a-93fc-96ff567f6f93": "debug-derby",
  "770970ed-6e63-4bd7-b9e9-ff4874acd060": "unscripted-nations",
  "b5c3b61d-2b26-45d2-9ff4-92cce891b727": "circuit-of-minds",
  "218f1371-b8e6-4d59-8e90-e0a5d0f000f6": "battle-of-bots",
  "ae0bcfc2-517a-4b86-be13-88abe1ce5ea0": "thoughtlab",
  "620c5d8b-9e67-4a6c-82e3-0366c071d153": "loot-goblins",
  "74693e7b-9409-4934-a154-dc351f9ceb73": "cipher-chase",
  "2dfb0b0d-ffba-4cbc-993f-72aa907da3b7": "velocityx",
  "f3c690be-8655-4d7f-a7e9-75d3e84a5e54": "hack-the-skill",
};

/**
 * Fetch lightweight registration index for the authenticated user.
 * Returns only essential routing/status fields without heavy participant snapshots or documents.
 * Called ONCE when Firebase auth resolves to populate the centralized registration cache.
 */
export async function fetchMyRegistrationIndex(
  token: string
): Promise<RegistrationIndexItem[]> {
  const url = `${API_BASE_URL}/registrations/my?format=index`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to fetch registrations index",
      response.status,
      json
    );
  }
  return json.data || json || [];
}

export async function fetchMyRegistrations(
  token: string,
  options?: { eventSlug?: string; eventId?: string }
): Promise<ParticipantRegistration[]> {
  const query = new URLSearchParams();
  if (options?.eventSlug) query.append("eventSlug", options.eventSlug);
  if (options?.eventId) query.append("eventId", options.eventId);
  const qs = query.toString();
  const url = `${API_BASE_URL}/registrations/my${qs ? `?${qs}` : ""}`;

  const response = await fetch(url, {
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

/**
 * Fetch the active or latest registration for a specific event for the authenticated user.
 * Returns null if no registration exists for the event.
 */
export async function fetchMyRegistrationForEvent(
  token: string,
  eventIdOrSlug: string
): Promise<ParticipantRegistration | null> {
  const list = await fetchMyRegistrations(token, {
    eventSlug: eventIdOrSlug,
    eventId: eventIdOrSlug,
  });
  if (!Array.isArray(list) || list.length === 0) return null;
  // If multiple exist (e.g. earlier cancelled one), prioritize active/non-cancelled
  const active = list.find((r) => r.status !== "CANCELLED");
  return active || list[0] || null;
}

export interface RegistrationParticipantInput {
  fullName?: string;
  institutionName?: string;
  mobileNumber?: string;
  email?: string;
  city?: string;
  studentId?: string;
  standardClass?: string;
  idCardUrl?: string;
  [key: string]: any;
}

export interface CreateRegistrationPayload {
  eventId: string;
  registrationType?: "INDIVIDUAL" | "TEAM";
  teamId?: string;
  teamName?: string;
  participants?: RegistrationParticipantInput[];
}

export interface CreatedRegistrationResponse {
  id: string;
  registrationId: string;
  userId: string;
  eventId: string;
  teamId?: string | null;
  registrationType: string;
  status: string;
  payableAmount?: number | null;
  createdAt: string;
  event?: any;
  team?: any;
  user?: any;
  participants?: any[];
}

export async function createRegistration(
  token: string,
  payload: CreateRegistrationPayload
): Promise<CreatedRegistrationResponse> {
  const response = await fetch(`${API_BASE_URL}/registrations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_id: payload.eventId,
      registration_type: payload.registrationType || "INDIVIDUAL",
      team_id: payload.teamId,
      team_name: payload.teamName,
      participants: payload.participants,
    }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to create registration",
      response.status,
      json
    );
  }
  return json.data;
}

export async function submitRegistration(
  token: string,
  registrationId: string
): Promise<CreatedRegistrationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/registrations/${encodeURIComponent(registrationId)}/submit`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to submit registration",
      response.status,
      json
    );
  }
  return json.data;
}

export interface UploadDocumentResponse {
  success: boolean;
  documentType: string;
  participantId: string;
  participantOrder: number;
  document: {
    url: string;
    publicId: string;
    mimeType: string;
    resourceType: string;
    bytes: number;
    fileName: string;
  };
  participant: {
    id: string;
    fullName: string;
    idCardUrl?: string | null;
    profilePhotoUrl?: string | null;
  };
}

export async function uploadParticipantDocument(
  token: string,
  registrationId: string,
  participantId: string,
  file: File,
  documentType: string = "id_card"
): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);

  const response = await fetch(
    `${API_BASE_URL}/registrations/${encodeURIComponent(registrationId)}/participants/${encodeURIComponent(participantId)}/documents`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to upload document",
      response.status,
      json
    );
  }
  return json.data;
}

export async function getParticipantDocuments(
  token: string,
  registrationId: string,
  participantId: string
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/registrations/${encodeURIComponent(registrationId)}/participants/${encodeURIComponent(participantId)}/documents`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to retrieve documents",
      response.status,
      json
    );
  }
  return json.data;
}

export async function deleteParticipantDocument(
  token: string,
  registrationId: string,
  participantId: string,
  documentType: string
): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/registrations/${encodeURIComponent(registrationId)}/participants/${encodeURIComponent(participantId)}/documents/${encodeURIComponent(documentType)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to delete document",
      response.status,
      json
    );
  }
  return json.data;
}

export async function createTeam(
  token: string,
  payload: { eventId: string; teamName: string }
): Promise<{ team: { id: string; teamName: string; eventId: string; status: string } }> {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_id: payload.eventId,
      team_name: payload.teamName,
    }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to create team",
      response.status,
      json.error || json.data || json
    );
  }
  return json.data?.team ? json.data : (json.data || json.message);
}

export async function addTeamMember(
  token: string,
  teamId: string,
  payload: { name: string }
): Promise<{ member: { id: string; name: string; memberOrder: number } }> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/members`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: payload.name,
    }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to add team member",
      response.status,
      json.error || json.data || json
    );
  }
  return json.data?.member ? json.data : (json.data || json.message);
}

export async function fetchMyTeams(token: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/teams/my`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      json.message || "Failed to fetch user teams",
      response.status,
      json
    );
  }
  return json.data || [];
}

export async function fetchRegistrationDetails(
  token: string,
  registrationId: string
): Promise<CreatedRegistrationResponse> {
  const response = await fetch(`${API_BASE_URL}/registrations/${registrationId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
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
  confirmedRegistrations?: number;
  pendingRegistrations?: number;
  paymentPendingRegistrations?: number;
  failedOrCancelledRegistrations?: number;
  registrationStatusCounts?: Record<string, number>;
  paymentStatusCounts?: Record<string, number>;
  eventCounts?: Array<{ eventId: string; name: string; slug: string; trackId?: string; count: number }>;
  trackCounts?: Array<{ trackId: string; name: string; slug: string; count: number }>;
  assignedTrack?: TrackLeaderAssignedTrack | null;
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
  paymentStatus?: string;
  payableAmount?: number;
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
    track?: {
      id: string;
      name: string;
      slug: string;
    } | null;
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
  participants?: Array<{
    id: string;
    fullName: string;
    email?: string | null;
    mobileNumber?: string | null;
    institutionName?: string | null;
    participantRole: string;
    participantOrder: number;
    customFields?: Record<string, any>;
    idCardUrl?: string | null;
    profilePhotoUrl?: string | null;
  }>;
  payment?: {
    transactionId?: string | null;
    status?: string;
    amount?: number;
    currency?: string;
    gateway?: string | null;
    failureReason?: string | null;
    createdAt?: string | null;
  } | null;
}

export interface AdminRegistrationDetail {
  id: string;
  registrationId: string;
  registrationType: "INDIVIDUAL" | "TEAM";
  status: string;
  paymentStatus?: string;
  payableAmount?: number;
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
    track?: {
      id: string;
      name: string;
      slug: string;
      description?: string | null;
      isActive?: boolean;
    } | null;
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
      email?: string;
      phone?: string;
      mobileNumber?: string;
      institution?: string;
      institutionName?: string;
      standardClass?: string;
      createdAt?: string;
    }>;
    memberCount: number;
    totalTeamSize: number;
  } | null;
  participants: Array<{
    id: string;
    participantOrder: number;
    participantRole: string;
    fullName: string;
    email: string | null;
    mobileNumber: string | null;
    institutionName: string | null;
    city?: string | null;
    studentId?: string | null;
    standardClass?: string | null;
    customFields?: Record<string, any>;
    documents?: {
      idCard?: {
        url: string;
        publicId?: string;
        mimeType?: string;
        resourceType?: string;
      } | null;
      profilePhoto?: {
        url: string;
        publicId?: string;
        mimeType?: string;
        resourceType?: string;
      } | null;
    };
    idCardUrl?: string | null;
    profilePhotoUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
  }>;
  payment?: {
    status: string;
    transactionId?: string | null;
    amount: number;
    currency: string;
    gateway?: string | null;
    gatewayReference?: string | null;
    paymentMode?: string | null;
    failureReason?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    transactions?: Array<any>;
  };
}

export interface AdminTeamListItem {
  id: string;
  teamName: string;
  status: string;
  teamStatus?: string;
  registrationStatus?: string | null;
  paymentStatus?: string | null;
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
    trackId?: string | null;
    track?: {
      id: string;
      name: string;
      slug: string;
    } | null;
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
    paymentStatus?: string | null;
    createdAt?: string;
  } | null;
}

export interface AdminTeamDetail {
  id: string;
  teamName: string;
  status: string;
  teamStatus?: string;
  registrationStatus?: string | null;
  paymentStatus?: string | null;
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
    trackId?: string | null;
    track?: {
      id: string;
      name: string;
      slug: string;
    } | null;
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
    email?: string;
    phone?: string;
    mobileNumber?: string;
    institution?: string;
    institutionName?: string;
    standardClass?: string;
    createdAt?: string;
  }>;
  registration: {
    id: string;
    registrationId: string;
    status: string;
    registrationType: string;
    paymentStatus?: string | null;
    createdAt: string;
  } | null;
  participants?: Array<{
    id: string;
    participantOrder: number;
    participantRole: string;
    fullName: string;
    email: string;
    mobileNumber?: string;
    institutionName?: string;
    city?: string;
    studentId?: string;
    standardClass?: string;
    customFields?: Record<string, any>;
  }>;
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
  paymentStatus?: string;
}): Promise<{ registrations: AdminRegistrationListItem[]; pagination: PaginationMeta }> {
  const url = new URL(`${API_BASE_URL}/admin/registrations`);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.trackId) url.searchParams.set("trackId", params.trackId);
  if (params?.eventId) url.searchParams.set("eventId", params.eventId);
  if (params?.registrationType) url.searchParams.set("registrationType", params.registrationType);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.paymentStatus) url.searchParams.set("paymentStatus", params.paymentStatus);

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
  teamStatus?: string;
  registrationStatus?: string;
}): Promise<{ teams: AdminTeamListItem[]; pagination: PaginationMeta }> {
  const url = new URL(`${API_BASE_URL}/admin/teams`);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.eventId) url.searchParams.set("eventId", params.eventId);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.teamStatus) url.searchParams.set("teamStatus", params.teamStatus);
  if (params?.registrationStatus) url.searchParams.set("registrationStatus", params.registrationStatus);

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

export type EventRegistrationStatus = "DISABLED" | "CLOSED" | "COMING_SOON" | "FULL" | "OPEN";

export interface AdminEventItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string | null;
  track?: { id: string; name: string; slug: string } | null;
  trackId?: string | null;
  eventType?: string | null;
  registrationType: "INDIVIDUAL" | "TEAM";
  minTeamSize?: number;
  maxTeamSize?: number;
  fee: number;
  currency: string;
  isActive: boolean;
  registrationOpen: boolean;
  registrationStartAt?: string | null;
  registrationEndAt?: string | null;
  capacity?: number | null;
  registeredCount: number;
  remainingCapacity?: number | null;
  isFull: boolean;
  registrationStatus: EventRegistrationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminEventRegistrationSettings {
  eventId: string;
  id: string;
  name: string;
  slug: string;
  track?: { id: string; name: string; slug: string } | null;
  trackId?: string | null;
  isActive: boolean;
  registrationOpen: boolean;
  registrationStartAt?: string | null;
  registrationEndAt?: string | null;
  capacity?: number | null;
  registeredCount: number;
  remainingCapacity?: number | null;
  isFull: boolean;
  registrationStatus: EventRegistrationStatus;
  updatedAt?: string;
}

export interface UpdateEventRegistrationSettingsPayload {
  registrationOpen?: boolean;
  isActive?: boolean;
  registrationStartAt?: string | null;
  registrationEndAt?: string | null;
  capacity?: number | null;
}

/**
 * Fetch all events with live counts, capacity, and registration status for Superadmin.
 */
export async function adminGetEventsList(): Promise<AdminEventItem[]> {
  const response = await fetch(`${API_BASE_URL}/admin/events`, {
    method: "GET",
    headers: getAdminHeaders(),
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || "Failed to fetch admin events list");
  }
  return json.data || [];
}

/**
 * Fetch registration settings for a specific event.
 */
export async function adminGetEventRegistrationSettings(
  eventId: string
): Promise<AdminEventRegistrationSettings> {
  const response = await fetch(`${API_BASE_URL}/admin/events/${encodeURIComponent(eventId)}/registration-settings`, {
    method: "GET",
    headers: getAdminHeaders(),
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || "Failed to fetch event registration settings");
  }
  return json.data;
}

/**
 * Update registration settings for a specific event.
 */
export async function adminUpdateEventRegistrationSettings(
  eventId: string,
  payload: UpdateEventRegistrationSettingsPayload
): Promise<AdminEventRegistrationSettings> {
  const response = await fetch(`${API_BASE_URL}/admin/events/${encodeURIComponent(eventId)}/registration-settings`, {
    method: "PATCH",
    headers: getAdminHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || "Failed to update event registration settings");
  }
  return json.data;
}

export interface PublicEventItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string | null;
  track: { id: string; name: string; slug: string } | null;
  trackId: string | null;
  eventType: string | null;
  registrationType: "INDIVIDUAL" | "TEAM";
  minTeamSize: number;
  maxTeamSize: number;
  fee: number;
  currency: string;
  isActive: boolean;
  registrationOpen: boolean;
  registrationStartAt: string | null;
  registrationEndAt: string | null;
  capacity: number | null;
  registeredCount: number;
  remainingCapacity: number | null;
  isFull: boolean;
  registrationStatus: EventRegistrationStatus;
}

export async function getPublicEvents(): Promise<PublicEventItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const json = await response.json().catch(() => ({}));
    return json.data || [];
  } catch (error) {
    console.error("Failed to fetch public events:", error);
    return [];
  }
}

export async function getPublicEventBySlug(slug: string): Promise<PublicEventItem | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/slug/${encodeURIComponent(slug)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok || !json.data) return null;
    return json.data;
  } catch (error) {
    console.error(`Failed to fetch public event by slug "${slug}":`, error);
    return null;
  }
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

export async function trackLeaderGetDashboardStats(): Promise<AdminDashboardStats> {
  const response = await fetch(`${API_BASE_URL}/track-leader/stats`, {
    method: "GET",
    headers: getTrackLeaderHeaders(),
    credentials: "include",
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(json.message || "Failed to fetch track leader statistics", response.status, json);
  }
  return json.data;
}

export async function trackLeaderGetRegistrations(params?: {
  page?: number;
  limit?: number;
  search?: string;
  eventId?: string;
  registrationType?: string;
  status?: string;
  paymentStatus?: string;
}): Promise<{ registrations: AdminRegistrationListItem[]; pagination: PaginationMeta }> {
  const url = new URL(`${API_BASE_URL}/track-leader/registrations`);
  if (params?.page) url.searchParams.set("page", String(params.page));
  if (params?.limit) url.searchParams.set("limit", String(params.limit));
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.eventId) url.searchParams.set("eventId", params.eventId);
  if (params?.registrationType) url.searchParams.set("registrationType", params.registrationType);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.paymentStatus) url.searchParams.set("paymentStatus", params.paymentStatus);

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

// =============================================================================
// Phase 9: Dynamic Export System Types & Methods
// =============================================================================

export type ExportFormat = "xlsx" | "csv";
export type ExportScope = "all" | "filtered" | "track" | "event" | "my_track";

export interface ExportFilterParams {
  search?: string;
  trackId?: string;
  eventId?: string;
  registrationType?: string;
  status?: string;
}

export interface ExportRequestPayload {
  format: ExportFormat;
  scope: ExportScope;
  filters?: ExportFilterParams;
  fields?: string[];
  trackId?: string;
  eventId?: string;
}

export interface ExportPreviewResponse {
  totalRecords: number;
  scope: string;
  trackName: string;
  eventName: string;
  selectedFieldsCount: number;
  format: ExportFormat;
  filename: string;
  columns: string[];
  fields: string[];
}

export interface ExportFieldOption {
  key: string;
  label: string;
  category: string;
  description?: string;
  default: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export const EXPORT_FIELD_OPTIONS: ExportFieldOption[] = [
  // PARTICIPANT DETAILS
  { key: "registrationId", label: "Registration ID", category: "PARTICIPANT DETAILS", default: true },
  { key: "participantName", label: "Name", category: "PARTICIPANT DETAILS", default: true },
  { key: "email", label: "Email", category: "PARTICIPANT DETAILS", default: true },
  { key: "phone", label: "Phone", category: "PARTICIPANT DETAILS", default: true },
  { key: "institution", label: "Institution", category: "PARTICIPANT DETAILS", default: true },
  { key: "standardClass", label: "Class / Year", category: "PARTICIPANT DETAILS", default: false },

  // EVENT DETAILS
  { key: "eventName", label: "Event Name", category: "EVENT DETAILS", default: true },
  { key: "eventSlug", label: "Event Slug", category: "EVENT DETAILS", default: false },
  { key: "trackName", label: "Track", category: "EVENT DETAILS", default: true },
  { key: "participationType", label: "Participation Type", category: "EVENT DETAILS", default: true },
  { key: "status", label: "Registration Status", category: "EVENT DETAILS", default: true },
  { key: "registeredDate", label: "Registration Date", category: "EVENT DETAILS", default: true },
  { key: "eventFee", label: "Fee", category: "EVENT DETAILS", default: false },

  // TEAM DETAILS
  { key: "teamName", label: "Team Name", category: "TEAM DETAILS", default: true },
  { key: "teamLeader", label: "Team Leader", category: "TEAM DETAILS", default: false },
  { key: "teamSize", label: "Team Size", category: "TEAM DETAILS", default: true },
  { key: "teamMembers", label: "Team Members", category: "TEAM DETAILS", default: true },

  // PAYMENT DETAILS
  { key: "paymentStatus", label: "Payment Status", category: "PAYMENT DETAILS", default: false },
  { key: "paymentAmount", label: "Amount Paid", category: "PAYMENT DETAILS", default: false },
  { key: "transactionId", label: "Transaction ID", category: "PAYMENT DETAILS", default: false },
];

/**
 * Trigger in-browser file download from a Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * POST /api/admin/registrations/export/preview
 */
export async function adminExportRegistrationsPreview(
  payload: ExportRequestPayload,
  signal?: AbortSignal
): Promise<ExportPreviewResponse> {
  const url = `${getApiBaseUrl()}/admin/registrations/export/preview`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: getAdminHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err: any) {
    if (err?.name === "AbortError" || signal?.aborted) {
      throw err;
    }
    const isNetwork =
      err?.name === "TypeError" ||
      err?.message === "Failed to fetch" ||
      err?.message?.includes("NetworkError");
    if (isNetwork) {
      throw new ApiError(
        "Unable to reach the server. Please check your network connection or verify that the API server is online.",
        0
      );
    }
    throw err;
  }

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg =
      (typeof json?.message === "string" && json.message) ||
      (typeof json?.error?.message === "string" && json.error.message) ||
      (typeof json?.error === "string" && json.error) ||
      `Failed to generate export preview (${response.status})`;
    throw new ApiError(errorMsg, response.status, json);
  }
  return json.data;
}

/**
 * POST /api/admin/registrations/export
 */
export async function adminExportRegistrations(
  payload: ExportRequestPayload
): Promise<{ blob: Blob; filename: string }> {
  const url = `${getApiBaseUrl()}/admin/registrations/export`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: getAdminHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    const isNetwork =
      err?.name === "TypeError" ||
      err?.message === "Failed to fetch" ||
      err?.message?.includes("NetworkError");
    if (isNetwork) {
      throw new ApiError(
        "Unable to reach the server to download export file. Please check your connection.",
        0
      );
    }
    throw err;
  }

  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    const errorMsg =
      (typeof json?.message === "string" && json.message) ||
      (typeof json?.error?.message === "string" && json.error.message) ||
      (typeof json?.error === "string" && json.error) ||
      `Failed to download export file (${response.status})`;
    throw new ApiError(errorMsg, response.status, json);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition");
  let filename = `XAVITECH-2026-Registrations.${payload.format === "csv" ? "csv" : "xlsx"}`;
  if (disposition) {
    const match = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i);
    if (match && match[1]) {
      filename = decodeURIComponent(match[1]);
    }
  }

  return { blob, filename };
}

/**
 * POST /api/track-leader/registrations/export/preview
 */
export async function trackLeaderExportRegistrationsPreview(
  payload: ExportRequestPayload,
  signal?: AbortSignal
): Promise<ExportPreviewResponse> {
  const url = `${getApiBaseUrl()}/track-leader/registrations/export/preview`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: getTrackLeaderHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err: any) {
    if (err?.name === "AbortError" || signal?.aborted) {
      throw err;
    }
    const isNetwork =
      err?.name === "TypeError" ||
      err?.message === "Failed to fetch" ||
      err?.message?.includes("NetworkError");
    if (isNetwork) {
      throw new ApiError(
        "Unable to reach the server. Please check your network connection or verify that the API server is online.",
        0
      );
    }
    throw err;
  }

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg =
      (typeof json?.message === "string" && json.message) ||
      (typeof json?.error?.message === "string" && json.error.message) ||
      (typeof json?.error === "string" && json.error) ||
      `Failed to generate export preview (${response.status})`;
    throw new ApiError(errorMsg, response.status, json);
  }
  return json.data;
}

/**
 * POST /api/track-leader/registrations/export
 */
export async function trackLeaderExportRegistrations(
  payload: ExportRequestPayload
): Promise<{ blob: Blob; filename: string }> {
  const url = `${getApiBaseUrl()}/track-leader/registrations/export`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: getTrackLeaderHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    const isNetwork =
      err?.name === "TypeError" ||
      err?.message === "Failed to fetch" ||
      err?.message?.includes("NetworkError");
    if (isNetwork) {
      throw new ApiError(
        "Unable to reach the server to download export file. Please check your connection.",
        0
      );
    }
    throw err;
  }

  if (!response.ok) {
    const json = await response.json().catch(() => ({}));
    const errorMsg =
      (typeof json?.message === "string" && json.message) ||
      (typeof json?.error?.message === "string" && json.error.message) ||
      (typeof json?.error === "string" && json.error) ||
      `Failed to download export file (${response.status})`;
    throw new ApiError(errorMsg, response.status, json);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition");
  let filename = `XAVITECH-2026-Track-Export.${payload.format === "csv" ? "csv" : "xlsx"}`;
  if (disposition) {
    const match = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i);
    if (match && match[1]) {
      filename = decodeURIComponent(match[1]);
    }
  }

  return { blob, filename };
}

/**
 * Initiate Easebuzz payment for a registration in PAYMENT_PENDING status.
 */
export async function initiatePayment(
  token: string,
  registrationId: string
): Promise<{
  transactionId: string;
  registrationId: string;
  amount: number;
  currency: string;
  accessKey: string;
  paymentUrl: string;
  liveMode: boolean;
  event: { name: string; slug: string };
}> {
  const url = `${API_BASE_URL}/payments/initiate`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ registrationId }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    const error: any = new Error(data.message || "Failed to initiate payment");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data.data;
}

/**
 * Fetch payment status by transaction reference ID.
 */
export async function fetchPaymentStatus(
  token: string,
  transactionId: string
): Promise<{
  transactionId: string;
  registrationId: string;
  amount: number;
  currency: string;
  status: string;
  gatewayReference?: string;
  paymentMode?: string;
  failureReason?: string;
  registrationStatus?: string;
}> {
  const url = `${API_BASE_URL}/payments/status/${encodeURIComponent(transactionId)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    const error: any = new Error(data.message || "Failed to fetch payment status");
    error.status = response.status;
    throw error;
  }

  return data.data;
}

export const api = {
  fetchUserProfile,
  updateUserProfile,
  fetchMyRegistrationIndex,
  fetchMyRegistrations,
  fetchMyRegistrationForEvent,
  createRegistration,
  submitRegistration,
  initiatePayment,
  fetchPaymentStatus,
  uploadParticipantDocument,
  getParticipantDocuments,
  deleteParticipantDocument,
  createTeam,
  addTeamMember,
  fetchMyTeams,
  fetchRegistrationDetails,
  adminLogin,
  adminGetMe,
  adminLogout,
  adminGetDashboardStats,
  adminGetRegistrations,
  adminGetRegistrationDetails,
  adminGetTeams,
  adminGetTeamDetails,
  adminGetEvents,
  adminGetEventsList,
  adminGetEventRegistrationSettings,
  adminUpdateEventRegistrationSettings,
  getPublicEvents,
  getPublicEventBySlug,
  adminGetTracks,
  adminGetTrackLeaders,
  adminGetTrackLeader,
  adminCreateTrackLeader,
  adminUpdateTrackLeader,
  adminUpdateTrackLeaderStatus,
  adminResetTrackLeaderCredentials,
  adminExportRegistrationsPreview,
  adminExportRegistrations,
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
  trackLeaderGetDashboardStats,
  trackLeaderGetRegistrations,
  trackLeaderGetRegistrationDetails,
  trackLeaderForgotPassword,
  trackLeaderResetPassword,
  trackLeaderExportRegistrationsPreview,
  trackLeaderExportRegistrations,
  downloadBlob,
  getTrackLeaderToken,
  setTrackLeaderToken,
  clearTrackLeaderToken,
  getApiBaseUrl,
  resolveApiBaseUrl,
  getTrackLeaderHeaders,
};

export default api;





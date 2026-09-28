import { getSupabaseClient } from '../config/database.js';
import TrackModel from '../models/track.model.js';
import TrackLeaderModel from '../models/trackLeader.model.js';
import TrackLeaderAssignmentModel from '../models/trackLeaderAssignment.model.js';
import {
  hashPassword,
  generateTemporaryPassword,
} from '../utils/security.util.js';
import logger from '../utils/logger.util.js';
import brevoEmailService from './brevoEmail.service.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeSearchTerm = (term) => {
  if (!term || typeof term !== 'string') return '';
  return term.trim().replace(/[,()"'%]/g, '');
};

/**
 * Admin Track Leader Management Service
 * Encapsulates listing, provisioning, track assignments, updates, activation, and credential resets.
 */
export const adminTrackLeaderService = {
  /**
   * Paginated, searchable, and filterable listing of Track Leaders.
   */
  listTrackLeaders: async ({
    page = 1,
    limit = 20,
    search = '',
    trackId = '',
    status = '',
  } = {}) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    // Filter by track assignment if requested
    let matchingLeaderIds = null;
    if (trackId && typeof trackId === 'string' && trackId.trim()) {
      const cleanTrackId = trackId.trim();
      matchingLeaderIds = await TrackLeaderAssignmentModel.getLeaderUserIdsForTrack(cleanTrackId);
      if (matchingLeaderIds.length === 0) {
        return {
          trackLeaders: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalRecords: 0,
            totalPages: 1,
          },
        };
      }
    }

    // Build query on users table strictly for TRACK_LEADER role
    let query = client
      .from('users')
      .select('id, name, email, role, is_active, must_change_password, created_at, updated_at', {
        count: 'exact',
      })
      .eq('role', 'TRACK_LEADER');

    if (matchingLeaderIds !== null) {
      query = query.in('id', matchingLeaderIds);
    }

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    const cleanSearch = sanitizeSearchTerm(search);
    if (cleanSearch) {
      query = query.or(`name.ilike.%${cleanSearch}%,email.ilike.%${cleanSearch}%`);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: users, count, error } = await query;
    if (error) {
      logger.error('Error listing track leaders:', error);
      throw error;
    }

    const leaderUsers = users || [];
    const leaderIds = leaderUsers.map((u) => u.id);

    // Fetch active track assignments for all returned leaders in batch
    const assignments = await TrackLeaderAssignmentModel.getActiveAssignmentsForUsers(leaderIds);
    const assignmentMap = new Map();
    for (const a of assignments) {
      assignmentMap.set(a.track_leader_user_id, a);
    }

    const trackLeaders = leaderUsers.map((u) => {
      const assign = assignmentMap.get(u.id);
      return {
        id: u.id,
        name: u.name || null,
        email: u.email,
        role: u.role,
        is_active: u.is_active,
        must_change_password: u.must_change_password || false,
        track: assign?.track
          ? {
              id: assign.track.id,
              name: assign.track.name,
              slug: assign.track.slug,
            }
          : null,
        created_at: u.created_at,
        updated_at: u.updated_at,
      };
    });

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limitNum) || 1;

    return {
      trackLeaders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages,
      },
    };
  },

  /**
   * Create a new Track Leader and assign to an active track.
   */
  createTrackLeader: async ({ name, email, trackId }) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      const err = new Error('Name is required and must be at least 2 characters.');
      err.statusCode = 400;
      throw err;
    }
    const cleanName = name.trim();

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      const err = new Error('A valid email address is required.');
      err.statusCode = 400;
      throw err;
    }
    const cleanEmail = email.trim().toLowerCase();

    if (!trackId || typeof trackId !== 'string' || !UUID_REGEX.test(trackId.trim())) {
      const err = new Error('A valid track ID is required.');
      err.statusCode = 400;
      throw err;
    }
    const cleanTrackId = trackId.trim();

    // 2. Validate target track exists and is active
    const targetTrack = await TrackModel.findById(cleanTrackId);
    if (!targetTrack || !targetTrack.is_active) {
      const err = new Error('Assigned track must be an active existing track.');
      err.statusCode = 400;
      throw err;
    }

    // 3. Enforce case-insensitive email uniqueness across all user roles
    const { data: existingUser } = await client
      .from('users')
      .select('id, role')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      const err = new Error('An account with this email already exists.');
      err.statusCode = 409;
      throw err;
    }

    // 4. Generate secure random temporary password and hash with bcrypt
    const temporaryPassword = generateTemporaryPassword(12);
    const passwordHash = await hashPassword(temporaryPassword);

    // 5. Insert Track Leader user record (strictly role = TRACK_LEADER, firebase_uid = NULL)
    const { data: newUser, error: insertError } = await client
      .from('users')
      .insert([
        {
          name: cleanName,
          email: cleanEmail,
          password_hash: passwordHash,
          role: 'TRACK_LEADER',
          is_active: true,
          must_change_password: true,
          firebase_uid: null,
        },
      ])
      .select('id, name, email, role, is_active, must_change_password, created_at, updated_at')
      .single();

    if (insertError) {
      logger.error('Error creating track leader user record:', insertError);
      throw insertError;
    }

    // 6. Create Track Leader -> Track assignment
    const assignment = await TrackLeaderAssignmentModel.assignTrack(newUser.id, targetTrack.id);

    logger.info(`Track Leader created by Admin: ${cleanEmail} -> Track: ${targetTrack.name}`);

    // 7. Dispatch Welcome Email via Brevo (Backend only)
    let emailSent = false;
    let emailError = null;
    try {
      const emailResult = await brevoEmailService.sendTrackLeaderWelcomeEmail({
        name: newUser.name,
        email: newUser.email,
        trackName: targetTrack.name,
        temporaryPassword,
      });
      emailSent = Boolean(emailResult?.success);
      if (!emailResult?.success && emailResult?.error) {
        emailError = emailResult.error;
      }
    } catch (emailErr) {
      logger.error(`Failed to send welcome email to track leader (${cleanEmail}): ${emailErr.message}`);
      emailSent = false;
      emailError = emailErr.message;
    }

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        is_active: newUser.is_active,
        must_change_password: newUser.must_change_password || false,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
      },
      track: {
        id: targetTrack.id,
        name: targetTrack.name,
        slug: targetTrack.slug,
      },
      temporaryPassword,
      emailSent,
      ...(emailError ? { emailError } : {}),
    };
  },

  /**
   * Fetch single Track Leader details by ID.
   */
  getTrackLeaderById: async (id) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    if (!id || !UUID_REGEX.test(id)) {
      const err = new Error('Invalid track leader ID format.');
      err.statusCode = 400;
      throw err;
    }

    const { data: user, error } = await client
      .from('users')
      .select('id, name, email, role, is_active, must_change_password, created_at, updated_at')
      .eq('id', id)
      .eq('role', 'TRACK_LEADER')
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      const err = new Error('Track leader not found.');
      err.statusCode = 404;
      throw err;
    }

    const assignment = await TrackLeaderAssignmentModel.getActiveAssignment(user.id);
    const sessions = await TrackLeaderModel.getActiveSessionsForUser(user.id);

    return {
      id: user.id,
      name: user.name || null,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      must_change_password: user.must_change_password || false,
      track: assignment?.track
        ? {
            id: assignment.track.id,
            name: assignment.track.name,
            slug: assignment.track.slug,
          }
        : null,
      activeSessionsCount: sessions.length,
      sessions: sessions.map((s) => ({
        id: s.id,
        userAgent: s.user_agent,
        expiresAt: s.expires_at,
        createdAt: s.created_at,
        lastUsedAt: s.last_used_at,
      })),
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  },

  /**
   * Update Track Leader profile and/or reassign track.
   */
  updateTrackLeader: async (id, { name, email, trackId }) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    if (!id || !UUID_REGEX.test(id)) {
      const err = new Error('Invalid track leader ID format.');
      err.statusCode = 400;
      throw err;
    }

    // Verify target exists and is a TRACK_LEADER
    const existing = await adminTrackLeaderService.getTrackLeaderById(id);

    const userUpdates = {};
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        const err = new Error('Name must be at least 2 characters.');
        err.statusCode = 400;
        throw err;
      }
      userUpdates.name = name.trim();
    }

    if (email !== undefined) {
      if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        const err = new Error('A valid email address is required.');
        err.statusCode = 400;
        throw err;
      }
      const cleanEmail = email.trim().toLowerCase();

      // Check email uniqueness excluding current user
      const { data: conflictUser } = await client
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .neq('id', id)
        .maybeSingle();

      if (conflictUser) {
        const err = new Error('An account with this email already exists.');
        err.statusCode = 409;
        throw err;
      }
      userUpdates.email = cleanEmail;
    }

    if (Object.keys(userUpdates).length > 0) {
      userUpdates.updated_at = new Date().toISOString();
      const { error: updateErr } = await client
        .from('users')
        .update(userUpdates)
        .eq('id', id)
        .eq('role', 'TRACK_LEADER');

      if (updateErr) throw updateErr;
    }

    // Reassign track if requested
    if (trackId !== undefined) {
      if (!trackId || typeof trackId !== 'string' || !UUID_REGEX.test(trackId.trim())) {
        const err = new Error('A valid track ID is required.');
        err.statusCode = 400;
        throw err;
      }
      const cleanTrackId = trackId.trim();
      const targetTrack = await TrackModel.findById(cleanTrackId);
      if (!targetTrack || !targetTrack.is_active) {
        const err = new Error('Assigned track must be an active existing track.');
        err.statusCode = 400;
        throw err;
      }

      await TrackLeaderAssignmentModel.assignTrack(id, targetTrack.id);
      logger.info(`Track Leader ${existing.email} reassigned to track: ${targetTrack.name}`);
    }

    return adminTrackLeaderService.getTrackLeaderById(id);
  },

  /**
   * Activate or deactivate a Track Leader account.
   * Deactivation immediately revokes all active sessions.
   */
  updateTrackLeaderStatus: async (id, isActive) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    if (!id || !UUID_REGEX.test(id)) {
      const err = new Error('Invalid track leader ID format.');
      err.statusCode = 400;
      throw err;
    }

    if (typeof isActive !== 'boolean') {
      const err = new Error('Status "is_active" must be a boolean.');
      err.statusCode = 400;
      throw err;
    }

    // Check user exists
    const { data: user, error: findError } = await client
      .from('users')
      .select('id, name, email, role, is_active')
      .eq('id', id)
      .eq('role', 'TRACK_LEADER')
      .maybeSingle();

    if (findError) throw findError;
    if (!user) {
      const err = new Error('Track leader not found.');
      err.statusCode = 404;
      throw err;
    }

    const now = new Date().toISOString();
    const { data: updatedUser, error: updateError } = await client
      .from('users')
      .update({ is_active: isActive, updated_at: now })
      .eq('id', id)
      .eq('role', 'TRACK_LEADER')
      .select('id, name, email, role, is_active, updated_at')
      .single();

    if (updateError) throw updateError;

    // If deactivated, revoke all active sessions immediately
    if (!isActive) {
      const revokedCount = await TrackLeaderModel.revokeAllSessions(id);
      logger.info(`Track Leader ${user.email} deactivated. Revoked ${revokedCount} active session(s).`);
    } else {
      logger.info(`Track Leader ${user.email} reactivated.`);
    }

    return updatedUser;
  },

  /**
   * Reset credentials:
   * Generates new secure temporary password, hashes with bcrypt, sets must_change_password = true,
   * and revokes all active sessions.
   */
  resetCredentials: async (id) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    if (!id || !UUID_REGEX.test(id)) {
      const err = new Error('Invalid track leader ID format.');
      err.statusCode = 400;
      throw err;
    }

    const { data: user, error: findError } = await client
      .from('users')
      .select('id, name, email, role, is_active')
      .eq('id', id)
      .eq('role', 'TRACK_LEADER')
      .maybeSingle();

    if (findError) throw findError;
    if (!user) {
      const err = new Error('Track leader not found.');
      err.statusCode = 404;
      throw err;
    }

    // 1. Generate new temporary password
    const temporaryPassword = generateTemporaryPassword(12);
    const passwordHash = await hashPassword(temporaryPassword);

    const now = new Date().toISOString();

    // 2. Update user credentials
    const { data: updatedUser, error: updateError } = await client
      .from('users')
      .update({
        password_hash: passwordHash,
        must_change_password: true,
        updated_at: now,
      })
      .eq('id', id)
      .eq('role', 'TRACK_LEADER')
      .select('id, name, email, role, is_active, must_change_password, updated_at')
      .single();

    if (updateError) throw updateError;

    // 3. Revoke all existing sessions
    const revokedCount = await TrackLeaderModel.revokeAllSessions(id);

    logger.info(
      `Credentials reset for Track Leader: ${user.email}. Revoked ${revokedCount} active session(s).`
    );

    // 4. Determine assigned track name for email notification
    let trackName = 'Assigned Track';
    try {
      const activeAssignment = await TrackLeaderAssignmentModel.getActiveAssignment(id);
      if (activeAssignment?.track?.name) {
        trackName = activeAssignment.track.name;
      }
    } catch (trackLookupErr) {
      logger.warn(
        `Could not determine track name for email notification (${user.email}): ${trackLookupErr.message}`
      );
    }

    // 5. Dispatch Credential Reset Email via Brevo
    let emailSent = false;
    let emailError = null;
    try {
      const emailResult = await brevoEmailService.sendTrackLeaderCredentialResetEmail({
        name: user.name,
        email: user.email,
        trackName,
        temporaryPassword,
      });
      emailSent = Boolean(emailResult?.success);
      if (!emailResult?.success && emailResult?.error) {
        emailError = emailResult.error;
      }
    } catch (emailErr) {
      logger.error(
        `Failed to send credential reset email to track leader (${user.email}): ${emailErr.message}`
      );
      emailSent = false;
      emailError = emailErr.message;
    }

    return {
      user: updatedUser,
      temporaryPassword,
      emailSent,
      ...(emailError ? { emailError } : {}),
    };
  },
};

export default adminTrackLeaderService;

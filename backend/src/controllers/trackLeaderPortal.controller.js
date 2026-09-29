import TrackLeaderAssignmentModel from '../models/trackLeaderAssignment.model.js';
import TrackModel from '../models/track.model.js';
import adminRegistrationService from '../services/adminRegistration.service.js';
import { getSupabaseClient } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import logger from '../utils/logger.util.js';

/**
 * Track Leader Portal Controller
 * Provides portal endpoints strictly isolated to the authenticated Track Leader's active assigned track.
 */
export const trackLeaderPortalController = {
  /**
   * GET /api/track-leader/track
   * Retrieve the authenticated Track Leader's active track assignment.
   */
  getMyTrack: async (req, res, next) => {
    try {
      const activeAssignment = await TrackLeaderAssignmentModel.getActiveAssignment(req.user.id);

      if (!activeAssignment || !activeAssignment.track) {
        return sendSuccess(
          res,
          'No track is currently assigned to your account.',
          {
            assigned: false,
            track: null,
          },
          200
        );
      }

      return sendSuccess(
        res,
        'Assigned track retrieved successfully',
        {
          assigned: true,
          track: {
            id: activeAssignment.track.id,
            name: activeAssignment.track.name,
            slug: activeAssignment.track.slug,
            description: activeAssignment.track.description || null,
            is_active: activeAssignment.track.is_active,
          },
          assignmentId: activeAssignment.id,
        },
        200
      );
    } catch (error) {
      logger.error('Error fetching track leader track:', error);
      next(error);
    }
  },

  /**
   * GET /api/track-leader/events
   * Retrieve ONLY events belonging to the authenticated Track Leader's active track.
   * Client-supplied track IDs are strictly forbidden from overriding the DB assignment.
   */
  getMyEvents: async (req, res, next) => {
    try {
      const activeAssignment = await TrackLeaderAssignmentModel.getActiveAssignment(req.user.id);

      // Defend against client-supplied track override attempts
      if (req.query.trackId && activeAssignment?.track_id !== req.query.trackId) {
        return sendError(
          res,
          'Access denied. You can only access events for your assigned track.',
          null,
          403
        );
      }

      if (!activeAssignment || !activeAssignment.track_id) {
        return sendSuccess(
          res,
          'No events found. You currently have no active track assigned.',
          {
            track: null,
            events: [],
            totalEvents: 0,
          },
          200
        );
      }

      const events = await TrackModel.findEventsByTrackId(activeAssignment.track_id);

      return sendSuccess(
        res,
        'Track events retrieved successfully',
        {
          track: activeAssignment.track,
          events,
          totalEvents: events.length,
        },
        200
      );
    } catch (error) {
      logger.error('Error fetching track leader events:', error);
      next(error);
    }
  },

  /**
   * GET /api/track-leader/tracks/:trackId/events
   * Route ensuring track isolation: returns 403 Forbidden if trackId does not match assignment.
   */
  getTrackEventsWithId: async (req, res, next) => {
    try {
      const { trackId } = req.params;
      const activeAssignment = await TrackLeaderAssignmentModel.getActiveAssignment(req.user.id);

      if (!activeAssignment || activeAssignment.track_id !== trackId) {
        return sendError(
          res,
          'Access denied. You can only access events for your assigned track.',
          null,
          403
        );
      }

      const events = await TrackModel.findEventsByTrackId(trackId);

      return sendSuccess(
        res,
        'Track events retrieved successfully',
        {
          track: activeAssignment.track,
          events,
          totalEvents: events.length,
        },
        200
      );
    } catch (error) {
      logger.error('Error fetching track leader events with ID:', error);
      next(error);
    }
  },

  /**
   * GET /api/track-leader/registrations
   * Retrieve ONLY registrations belonging to the authenticated Track Leader's assigned track.
   */
  getMyRegistrations: async (req, res, next) => {
    try {
      const activeAssignment = await TrackLeaderAssignmentModel.getActiveAssignment(req.user.id);

      if (!activeAssignment || !activeAssignment.track_id) {
        return sendSuccess(
          res,
          'No registrations found. You currently have no active track assigned.',
          {
            registrations: [],
            pagination: {
              page: 1,
              limit: 15,
              totalRecords: 0,
              totalPages: 1,
            },
          },
          200
        );
      }

      const { page, limit, search, eventId, registrationType, status } = req.query;

      // If an eventId filter is requested, strictly verify it belongs to this track
      if (eventId) {
        const events = await TrackModel.findEventsByTrackId(activeAssignment.track_id);
        const validEventIds = (events || []).map((e) => e.id);
        if (!validEventIds.includes(eventId)) {
          return sendError(
            res,
            'Access denied. Event does not belong to your assigned track.',
            null,
            403
          );
        }
      }

      const result = await adminRegistrationService.listRegistrations({
        page,
        limit,
        search,
        trackId: activeAssignment.track_id, // Strictly scoped to assigned track!
        eventId,
        registrationType,
        status,
      });

      return sendSuccess(res, 'Track registrations retrieved successfully', result, 200);
    } catch (error) {
      logger.error('Error fetching track leader registrations:', error);
      next(error);
    }
  },

  /**
   * GET /api/track-leader/registrations/:registrationId
   * Retrieve full details for a registration, strictly ensuring it belongs to the assigned track.
   */
  getRegistrationDetails: async (req, res, next) => {
    try {
      const { registrationId } = req.params;
      const activeAssignment = await TrackLeaderAssignmentModel.getActiveAssignment(req.user.id);

      if (!activeAssignment || !activeAssignment.track_id) {
        return sendError(
          res,
          'Access denied. You currently have no active track assigned.',
          null,
          403
        );
      }

      const registration = await adminRegistrationService.getRegistrationDetails(registrationId);
      if (!registration) {
        return sendError(res, 'Registration not found', null, 404);
      }

      // Canonical database track isolation check:
      // Track Leader -> active track_leader_assignments -> track_id
      // Event -> track_id
      // Registration -> event_id -> event.track_id
      let eventTrackId = registration.event?.track_id || registration.event?.trackId;

      // Fallback: if not present on registration.event object, query directly from DB using registration's event ID
      if (!eventTrackId && (registration.eventId || registration.event?.id)) {
        const targetEventId = registration.eventId || registration.event?.id;
        const client = getSupabaseClient();
        if (client) {
          const { data: eventRow } = await client
            .from('events')
            .select('track_id')
            .eq('id', targetEventId)
            .maybeSingle();
          if (eventRow) {
            eventTrackId = eventRow.track_id;
          }
        }
      }

      const assignedTrackId = String(activeAssignment.track_id).trim().toLowerCase();
      const resolvedEventTrackId = eventTrackId ? String(eventTrackId).trim().toLowerCase() : null;

      if (!resolvedEventTrackId || resolvedEventTrackId !== assignedTrackId) {
        return sendError(
          res,
          'Access denied. You can only view registrations for your assigned track.',
          null,
          403
        );
      }

      return sendSuccess(res, 'Registration details retrieved successfully', registration, 200);
    } catch (error) {
      logger.error('Error fetching track leader registration details:', error);
      next(error);
    }
  },
};

export default trackLeaderPortalController;

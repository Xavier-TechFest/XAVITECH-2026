import TrackLeaderAssignmentModel from '../models/trackLeaderAssignment.model.js';
import TrackModel from '../models/track.model.js';
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
};

export default trackLeaderPortalController;

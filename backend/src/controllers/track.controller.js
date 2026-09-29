import trackService from '../services/track.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import { isValidUUID } from '../validators/event.validator.js';

/**
 * Track Controller
 * Handles public endpoints for querying active tracks and their associated events.
 */

/**
 * GET /api/tracks
 * Returns all active official tracks.
 */
export const listActiveTracks = async (req, res, next) => {
  try {
    const tracks = await trackService.getActiveTracks();
    return sendSuccess(res, 'Active tracks retrieved successfully', tracks);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tracks/:identifier
 * GET /api/tracks/slug/:slug
 * Resolves a track either by its database UUID or unique slug.
 */
export const getTrackByIdOrSlug = async (req, res, next) => {
  try {
    const identifier = req.params.identifier || req.params.slug || req.params.id;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return sendError(res, 'Track identifier or slug is required', null, 400);
    }

    const trimmed = identifier.trim();
    let track = null;

    if (isValidUUID(trimmed)) {
      track = await trackService.getTrackById(trimmed);
    }

    if (!track) {
      track = await trackService.getTrackBySlug(trimmed);
    }

    if (!track) {
      return sendError(res, 'Track not found or is currently inactive', null, 404);
    }

    return sendSuccess(res, 'Track details retrieved successfully', track);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tracks/:identifier/events
 * Returns all active events belonging to the specified track (by UUID or slug).
 */
export const getTrackEvents = async (req, res, next) => {
  try {
    const identifier = req.params.identifier || req.params.id;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return sendError(res, 'Track identifier is required', null, 400);
    }

    const trimmed = identifier.trim();
    let track = null;

    if (isValidUUID(trimmed)) {
      track = await trackService.getTrackById(trimmed);
    }

    if (!track) {
      track = await trackService.getTrackBySlug(trimmed);
    }

    if (!track) {
      return sendError(res, 'Track not found or is currently inactive', null, 404);
    }

    const events = await trackService.getEventsByTrackId(track.id);
    return sendSuccess(res, 'Track events retrieved successfully', events);
  } catch (error) {
    next(error);
  }
};

export default {
  listActiveTracks,
  getTrackByIdOrSlug,
  getTrackEvents,
};

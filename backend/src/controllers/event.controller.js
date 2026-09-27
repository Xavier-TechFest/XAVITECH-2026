import eventService from '../services/event.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';
import { isValidUUID } from '../validators/event.validator.js';

/**
 * Event Controller
 * Handles public endpoints for querying active events and individual event details.
 */

/**
 * GET /api/events
 * Returns only active events where registration_open is true.
 */
export const listActiveEvents = async (req, res, next) => {
  try {
    const events = await eventService.getActiveEvents();
    return sendSuccess(res, 'Active events retrieved successfully', events);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/:id
 * Returns event details for an active event by UUID.
 */
export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return sendError(res, 'Invalid event ID format. Must be a valid UUID.', null, 400);
    }

    const event = await eventService.getEventById(id);

    if (!event) {
      return sendError(res, 'Event not found or is currently inactive', null, 404);
    }

    return sendSuccess(res, 'Event details retrieved successfully', event);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/events/slug/:slug
 * Returns event details for an active event by its URL slug.
 */
export const getEventBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return sendError(res, 'Event slug is required', null, 400);
    }

    const event = await eventService.getEventBySlug(slug.trim().toLowerCase());

    if (!event) {
      return sendError(res, 'Event not found or is currently inactive', null, 404);
    }

    return sendSuccess(res, 'Event details retrieved successfully', event);
  } catch (error) {
    next(error);
  }
};

export default {
  listActiveEvents,
  getEventById,
  getEventBySlug,
};

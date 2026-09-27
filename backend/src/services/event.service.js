import EventModel from '../models/event.model.js';

/**
 * Standardize event database record into API response format
 */
export const formatEventResponse = (event) => {
  if (!event) return null;
  return {
    id: event.id,
    name: event.name,
    slug: event.slug,
    description: event.description || '',
    category: event.category || null,
    track: event.track || event.category || null,
    eventType: event.event_type || null,
    registrationType: event.registration_type,
    minTeamSize: event.min_team_size,
    maxTeamSize: event.max_team_size,
    fee: Number(event.fee || 0),
    currency: event.currency || 'INR',
    isActive: event.is_active,
    registrationOpen: event.registration_open,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  };
};

/**
 * Event Service
 * Contains all business logic for event discovery, availability validation, and configuration.
 */
export const eventService = {
  /**
   * Fetch all active events that currently have registration open.
   *
   * @returns {Promise<Array>} Array of formatted event objects
   */
  getActiveEvents: async () => {
    const events = await EventModel.getAllActiveEvents({ registrationOpenOnly: true });
    return events.map(formatEventResponse);
  },

  /**
   * Fetch details for a specific active event by UUID.
   * Inactive events are not exposed to public endpoints.
   *
   * @param {string} id - Event UUID
   * @returns {Promise<Object|null>} Formatted event object or null
   */
  getEventById: async (id) => {
    const event = await EventModel.getEventById(id);
    if (!event || !event.is_active) {
      return null;
    }
    return formatEventResponse(event);
  },

  /**
   * Fetch details for a specific active event by slug.
   * Inactive events are not exposed to public endpoints.
   *
   * @param {string} slug - Unique event slug
   * @returns {Promise<Object|null>} Formatted event object or null
   */
  getEventBySlug: async (slug) => {
    if (!slug) return null;
    const normalizedSlug = slug.trim().toLowerCase().replace(/\u0430/g, 'a');
    const event = await EventModel.getEventBySlug(normalizedSlug);
    if (!event || !event.is_active) {
      return null;
    }
    return formatEventResponse(event);
  },

  /**
   * Validates whether an event is eligible for new registrations.
   *
   * Checks:
   * 1. Event exists
   * 2. Event is active
   * 3. Event registration is open
   * 4. Registration type matches event configuration (with support for flexible individual/pair events)
   *
   * @param {string} eventId - Event UUID
   * @param {string} requestedType - 'INDIVIDUAL' | 'TEAM'
   * @returns {Promise<{ isValid: boolean, statusCode?: number, message?: string, event?: Object }>}
   */
  validateEventForRegistration: async (eventId, requestedType = 'INDIVIDUAL') => {
    const event = await EventModel.getEventById(eventId);

    if (!event) {
      return {
        isValid: false,
        statusCode: 404,
        message: 'Event not found with the provided ID',
      };
    }

    if (!event.is_active) {
      return {
        isValid: false,
        statusCode: 400,
        message: 'This event is currently inactive',
      };
    }

    if (!event.registration_open) {
      return {
        isValid: false,
        statusCode: 400,
        message: 'Registration for this event is currently closed',
      };
    }

    const normalizedRequestedType = requestedType.toUpperCase();
    const isFlexibleTeam = event.registration_type === 'TEAM' && event.min_team_size === 1;
    const isAllowed =
      event.registration_type === normalizedRequestedType ||
      (isFlexibleTeam && (normalizedRequestedType === 'INDIVIDUAL' || normalizedRequestedType === 'TEAM'));

    if (!isAllowed) {
      return {
        isValid: false,
        statusCode: 400,
        message: `This event requires ${event.registration_type} registration, but ${normalizedRequestedType} was requested`,
      };
    }

    return {
      isValid: true,
      event,
    };
  },
};

export default eventService;

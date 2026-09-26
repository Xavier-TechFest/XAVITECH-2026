import { sendSuccess } from '../utils/response.util.js';

/**
 * Event Controller Placeholder
 * Handles fetching event lists, details, rules, and capacities.
 */

export const listEvents = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Events list placeholder endpoint', {
      events: [],
    });
  } catch (error) {
    next(error);
  }
};

export const getEventDetails = async (req, res, next) => {
  try {
    return sendSuccess(res, 'Event details placeholder endpoint', {
      event: {
        id: req.params.id,
        title: 'Event Details Placeholder',
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  listEvents,
  getEventDetails,
};

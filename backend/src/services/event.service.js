import EventModel from '../models/event.model.js';

/**
 * Compute the derived registration status for an event.
 *
 * Precedence Order:
 * 1. DISABLED: event.is_active is false
 * 2. CLOSED: event.registration_open is false
 * 3. COMING_SOON: registration_start_at is set and now < registration_start_at
 * 4. CLOSED: registration_end_at is set and now > registration_end_at
 * 5. FULL: capacity is set and registrationCount >= capacity
 * 6. OPEN: all criteria satisfied
 *
 * @param {Object} event - Event record
 * @param {number} [registrationCount=0] - Number of active non-cancelled registrations
 * @param {Date|number} [now=new Date()] - Reference timestamp
 * @returns {'DISABLED'|'CLOSED'|'COMING_SOON'|'FULL'|'OPEN'}
 */
export const computeEventRegistrationStatus = (event, registrationCount = 0, now = new Date()) => {
  if (!event) return 'DISABLED';

  if (!event.is_active) {
    return 'DISABLED';
  }

  if (!event.registration_open) {
    return 'CLOSED';
  }

  const currentTime = now instanceof Date ? now.getTime() : new Date(now).getTime();

  if (event.registration_start_at) {
    const startTime = new Date(event.registration_start_at).getTime();
    if (currentTime < startTime) {
      return 'COMING_SOON';
    }
  }

  if (event.registration_end_at) {
    const endTime = new Date(event.registration_end_at).getTime();
    if (currentTime > endTime) {
      return 'CLOSED';
    }
  }

  if (event.capacity !== null && event.capacity !== undefined) {
    const numericCapacity = Number(event.capacity);
    if (numericCapacity > 0 && registrationCount >= numericCapacity) {
      return 'FULL';
    }
  }

  return 'OPEN';
};

/**
 * Standardize event database record into public API response format
 */
export const formatEventResponse = (event, registrationCount = 0, delegateCount = 0) => {
  if (!event) return null;

  const capacity = event.capacity !== null && event.capacity !== undefined ? Number(event.capacity) : null;
  const capacityMode = event.capacity_mode === 'PER_DELEGATE' ? 'PER_DELEGATE' : 'PER_REGISTRATION';
  const registeredCount = Number(registrationCount || 0);
  const delegates = Number(delegateCount || 0);
  const currentOccupancy = capacityMode === 'PER_DELEGATE' ? delegates : registeredCount;
  const remainingCapacity = capacity !== null ? Math.max(0, capacity - currentOccupancy) : null;
  const isFull = capacity !== null ? currentOccupancy >= capacity : false;
  const registrationStatus = computeEventRegistrationStatus(event, currentOccupancy);

  return {
    id: event.id,
    name: event.name,
    slug: event.slug,
    description: event.description || '',
    category: event.category || null,
    track: event.tracks
      ? {
          id: event.tracks.id,
          name: event.tracks.name,
          slug: event.tracks.slug,
        }
      : (event.track || event.category || null),
    trackId: event.track_id || (event.tracks ? event.tracks.id : null),
    eventType: event.event_type || null,
    registrationType: event.registration_type,
    minTeamSize: event.min_team_size,
    maxTeamSize: event.max_team_size,
    fee: Number(event.fee || 0),
    currency: event.currency || 'INR',
    isActive: event.is_active,
    registrationOpen: event.registration_open,
    registrationStartAt: event.registration_start_at || null,
    registrationEndAt: event.registration_end_at || null,
    capacityMode,
    capacity,
    registeredCount,
    delegateCount: delegates,
    currentOccupancy,
    remainingCapacity,
    isFull,
    registrationStatus,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  };
};

/**
 * Standardize event database record for Admin response format
 */
export const formatAdminEventResponse = (event, registrationCount = 0, delegateCount = 0) => {
  return formatEventResponse(event, registrationCount, delegateCount);
};

/**
 * Standardize registration settings format for Admin edit view
 */
export const formatEventRegistrationSettings = (event, registrationCount = 0, delegateCount = 0) => {
  if (!event) return null;
  const base = formatEventResponse(event, registrationCount, delegateCount);
  return {
    eventId: base.id,
    id: base.id,
    name: base.name,
    slug: base.slug,
    track: base.track,
    trackId: base.trackId,
    isActive: base.isActive,
    registrationOpen: base.registrationOpen,
    registrationStartAt: base.registrationStartAt,
    registrationEndAt: base.registrationEndAt,
    capacityMode: base.capacityMode,
    capacity: base.capacity,
    registeredCount: base.registeredCount,
    delegateCount: base.delegateCount,
    currentOccupancy: base.currentOccupancy,
    remainingCapacity: base.remainingCapacity,
    isFull: base.isFull,
    registrationStatus: base.registrationStatus,
    updatedAt: base.updatedAt,
  };
};

/**
 * Event Service
 * Contains business logic for event discovery, availability validation, and configuration.
 */
export const eventService = {
  /**
   * Fetch all active events with live registration status and counts.
   *
   * @param {Object} options
   * @param {boolean} [options.registrationOpenOnly=false]
   * @returns {Promise<Array>} Array of formatted event objects
   */
  getActiveEvents: async ({ registrationOpenOnly = false } = {}) => {
    const events = await EventModel.getAllActiveEvents({ registrationOpenOnly });
    const counts = await EventModel.getCountsForAllEvents();
    return events.map((e) => {
      const c = counts[e.id] || { registrationCount: 0, delegateCount: 0 };
      return formatEventResponse(e, c.registrationCount, c.delegateCount);
    });
  },

  /**
   * Fetch details for a specific event by UUID.
   *
   * @param {string} id - Event UUID
   * @returns {Promise<Object|null>} Formatted event object or null
   */
  getEventById: async (id) => {
    const event = await EventModel.getEventById(id);
    if (!event) {
      return null;
    }
    const counts = await EventModel.getCountsByEventId(event.id);
    return formatEventResponse(event, counts.registrationCount, counts.delegateCount);
  },

  /**
   * Fetch details for a specific event by slug.
   *
   * @param {string} slug - Unique event slug
   * @returns {Promise<Object|null>} Formatted event object or null
   */
  getEventBySlug: async (slug) => {
    if (!slug) return null;
    const normalizedSlug = slug.trim().toLowerCase().replace(/\u0430/g, 'a');
    const event = await EventModel.getEventBySlug(normalizedSlug);
    if (!event) {
      return null;
    }
    const counts = await EventModel.getCountsByEventId(event.id);
    return formatEventResponse(event, counts.registrationCount, counts.delegateCount);
  },

  /**
   * Fetch all events for superadmin inspection with live counts.
   *
   * @returns {Promise<Array>}
   */
  getAdminEvents: async () => {
    const events = await EventModel.getAllEvents();
    const counts = await EventModel.getCountsForAllEvents();
    return events.map((e) => {
      const c = counts[e.id] || { registrationCount: 0, delegateCount: 0 };
      return formatAdminEventResponse(e, c.registrationCount, c.delegateCount);
    });
  },

  /**
   * Fetch registration settings for a specific event by UUID or slug.
   *
   * @param {string} eventId - UUID or slug
   * @returns {Promise<Object|null>}
   */
  getAdminEventRegistrationSettings: async (eventId) => {
    if (!eventId) return null;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId);
    const event = isUUID
      ? await EventModel.getEventById(eventId)
      : await EventModel.getEventBySlug(eventId.trim().toLowerCase());

    if (!event) return null;

    const counts = await EventModel.getCountsByEventId(event.id);
    return formatEventRegistrationSettings(event, counts.registrationCount, counts.delegateCount);
  },

  /**
   * Update event registration settings with capacity & window validation.
   *
   * @param {string} eventId - UUID or slug
   * @param {Object} payload - Update parameters
   * @returns {Promise<Object>}
   */
  updateEventRegistrationSettings: async (eventId, payload = {}) => {
    if (!eventId) {
      const error = new Error('Event ID is required');
      error.statusCode = 400;
      throw error;
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId);
    const event = isUUID
      ? await EventModel.getEventById(eventId)
      : await EventModel.getEventBySlug(eventId.trim().toLowerCase());

    if (!event) {
      const error = new Error('Event not found with the provided identifier');
      error.statusCode = 404;
      throw error;
    }

    // 0. Validate and determine capacity mode
    let parsedCapacityMode = undefined;
    if (payload.capacityMode !== undefined || payload.capacity_mode !== undefined) {
      const rawMode = String(payload.capacityMode ?? payload.capacity_mode ?? '').trim().toUpperCase();
      if (!['PER_REGISTRATION', 'PER_DELEGATE'].includes(rawMode)) {
        const error = new Error("Capacity counting mode must be either 'PER_REGISTRATION' or 'PER_DELEGATE'.");
        error.statusCode = 400;
        throw error;
      }
      parsedCapacityMode = rawMode;
    }

    const effectiveMode = parsedCapacityMode || event.capacity_mode || 'PER_REGISTRATION';
    const counts = await EventModel.getCountsByEventId(event.id);
    const currentActiveOccupancy = effectiveMode === 'PER_DELEGATE' ? counts.delegateCount : counts.registrationCount;
    const unitLabel = effectiveMode === 'PER_DELEGATE' ? 'delegate' : 'registration';

    // 1. Capacity validation
    let parsedCapacity = undefined;
    if (payload.capacity !== undefined) {
      if (payload.capacity === null || payload.capacity === '' || payload.capacity === 0) {
        if (payload.capacity === 0) {
          const error = new Error('Capacity must be a positive integer or null for unlimited.');
          error.statusCode = 400;
          throw error;
        }
        parsedCapacity = null;
      } else {
        const numCap = Number(payload.capacity);
        if (isNaN(numCap) || !Number.isInteger(numCap) || numCap <= 0) {
          const error = new Error('Capacity must be a positive integer or null for unlimited.');
          error.statusCode = 400;
          throw error;
        }

        if (numCap < currentActiveOccupancy) {
          const error = new Error(
            `Capacity cannot be lower than the current active ${unitLabel} count of ${currentActiveOccupancy}.`
          );
          error.statusCode = 400;
          throw error;
        }

        parsedCapacity = numCap;
      }
    }

    // 2. Registration Window Date Validation
    const candidateStartAt =
      payload.registrationStartAt !== undefined
        ? payload.registrationStartAt
        : payload.registration_start_at !== undefined
        ? payload.registration_start_at
        : event.registration_start_at;

    const candidateEndAt =
      payload.registrationEndAt !== undefined
        ? payload.registrationEndAt
        : payload.registration_end_at !== undefined
        ? payload.registration_end_at
        : event.registration_end_at;

    let parsedStartAt = undefined;
    if (payload.registrationStartAt !== undefined || payload.registration_start_at !== undefined) {
      const rawStart = payload.registrationStartAt ?? payload.registration_start_at;
      if (!rawStart) {
        parsedStartAt = null;
      } else {
        const startDate = new Date(rawStart);
        if (isNaN(startDate.getTime())) {
          const error = new Error('Invalid registration start date format.');
          error.statusCode = 400;
          throw error;
        }
        parsedStartAt = startDate.toISOString();
      }
    }

    let parsedEndAt = undefined;
    if (payload.registrationEndAt !== undefined || payload.registration_end_at !== undefined) {
      const rawEnd = payload.registrationEndAt ?? payload.registration_end_at;
      if (!rawEnd) {
        parsedEndAt = null;
      } else {
        const endDate = new Date(rawEnd);
        if (isNaN(endDate.getTime())) {
          const error = new Error('Invalid registration end date format.');
          error.statusCode = 400;
          throw error;
        }
        parsedEndAt = endDate.toISOString();
      }
    }

    // Check window relation if both are set
    const effectiveStart = parsedStartAt !== undefined ? parsedStartAt : event.registration_start_at;
    const effectiveEnd = parsedEndAt !== undefined ? parsedEndAt : event.registration_end_at;

    if (effectiveStart && effectiveEnd) {
      if (new Date(effectiveStart).getTime() > new Date(effectiveEnd).getTime()) {
        const error = new Error('Registration start date must be before or equal to the closing date.');
        error.statusCode = 400;
        throw error;
      }
    }

    // 3. Build update payload
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (parsedCapacityMode !== undefined) {
      updateData.capacity_mode = parsedCapacityMode;
    }

    if (payload.registrationOpen !== undefined || payload.registration_open !== undefined) {
      updateData.registration_open = Boolean(payload.registrationOpen ?? payload.registration_open);
    }

    if (payload.isActive !== undefined || payload.is_active !== undefined) {
      updateData.is_active = Boolean(payload.isActive ?? payload.is_active);
    }

    if (parsedCapacity !== undefined) {
      updateData.capacity = parsedCapacity;
    }

    if (parsedStartAt !== undefined) {
      updateData.registration_start_at = parsedStartAt;
    }

    if (parsedEndAt !== undefined) {
      updateData.registration_end_at = parsedEndAt;
    }

    const updatedEvent = await EventModel.updateEvent(event.id, updateData);
    const newCounts = await EventModel.getCountsByEventId(updatedEvent.id);

    return formatEventRegistrationSettings(updatedEvent, newCounts.registrationCount, newCounts.delegateCount);
  },

  /**
   * Validates whether an event is eligible for new registrations.
   *
   * Checks with strict precedence:
   * 1. Event exists
   * 2. Event is active (DISABLED)
   * 3. Event registration is open (CLOSED)
   * 4. Registration start time has arrived (COMING_SOON)
   * 5. Registration end time has not passed (CLOSED)
   * 6. Capacity is not exhausted (FULL)
   * 7. Registration type matches event configuration
   *
   * @param {string} eventId - Event UUID
   * @param {string} [requestedType='INDIVIDUAL'] - 'INDIVIDUAL' | 'TEAM'
   * @param {Object} [options={}]
   * @param {string} [options.excludeRegistrationId] - Ignore specific registration slot (e.g. existing draft being submitted)
   * @param {Date|number} [options.now] - Custom time reference for testing
   * @returns {Promise<{ isValid: boolean, statusCode?: number, code?: string, registrationStatus?: string, message?: string, event?: Object }>}
   */
  validateEventForRegistration: async (eventId, requestedType = 'INDIVIDUAL', options = {}) => {
    const event = await EventModel.getEventById(eventId);

    if (!event) {
      return {
        isValid: false,
        statusCode: 404,
        code: 'EVENT_NOT_FOUND',
        message: 'Event not found with the provided ID',
      };
    }

    // 1. Inactive Event
    if (!event.is_active) {
      return {
        isValid: false,
        statusCode: 400,
        code: 'REGISTRATION_UNAVAILABLE',
        registrationStatus: 'DISABLED',
        message: 'This event is currently inactive',
      };
    }

    // 2. Admin Manually Closed
    if (!event.registration_open) {
      return {
        isValid: false,
        statusCode: 400,
        code: 'REGISTRATION_CLOSED',
        registrationStatus: 'CLOSED',
        message: 'Registration for this event is currently closed',
      };
    }

    const now = options.now ? new Date(options.now) : new Date();

    // 3. Registration Window Start Time
    if (event.registration_start_at) {
      const startTime = new Date(event.registration_start_at);
      if (now.getTime() < startTime.getTime()) {
        return {
          isValid: false,
          statusCode: 400,
          code: 'REGISTRATION_NOT_STARTED',
          registrationStatus: 'COMING_SOON',
          message: 'Registration for this event has not started yet',
        };
      }
    }

    // 4. Registration Window End Time
    if (event.registration_end_at) {
      const endTime = new Date(event.registration_end_at);
      if (now.getTime() > endTime.getTime()) {
        return {
          isValid: false,
          statusCode: 400,
          code: 'REGISTRATION_CLOSED',
          registrationStatus: 'CLOSED',
          message: 'Registration for this event has closed',
        };
      }
    }

    // 5. Capacity Limit
    if (event.capacity !== null && event.capacity !== undefined) {
      const numericCapacity = Number(event.capacity);
      if (numericCapacity > 0) {
        const capacityMode = event.capacity_mode === 'PER_DELEGATE' ? 'PER_DELEGATE' : 'PER_REGISTRATION';
        const isDelegateMode = capacityMode === 'PER_DELEGATE';

        const counts = await EventModel.getCountsByEventId(event.id);
        let currentOccupancy = isDelegateMode ? counts.delegateCount : counts.registrationCount;

        if (options.excludeRegistrationId) {
          const { count: ownCount, delegateCount: ownDelegates } = await EventModel.checkIfRegistrationBelongsToEvent(
            options.excludeRegistrationId,
            event.id
          );
          if (ownCount) {
            currentOccupancy = Math.max(0, currentOccupancy - (isDelegateMode ? ownDelegates : ownCount));
          }
        }

        // Determine requested occupancy slots
        let requestedSlots = options.requestedSlots;
        if (requestedSlots === undefined || requestedSlots === null) {
          if (isDelegateMode) {
            requestedSlots = options.participantCount || (requestedType.toUpperCase() === 'TEAM' ? (event.min_team_size || 1) : 1);
          } else {
            requestedSlots = 1;
          }
        }

        if (currentOccupancy + requestedSlots > numericCapacity || currentOccupancy >= numericCapacity) {
          return {
            isValid: false,
            statusCode: 400,
            code: 'REGISTRATION_FULL',
            registrationStatus: 'FULL',
            message: isDelegateMode
              ? `Registration is full. This event has reached its maximum delegate capacity limit of ${numericCapacity}.`
              : `Registration is full. This event has reached its maximum registration capacity limit of ${numericCapacity}.`,
          };
        }
      }
    }

    // 6. Registration Type Check
    const normalizedRequestedType = requestedType.toUpperCase();
    const isBoth = event.registration_type === 'BOTH' || event.slug === 'unscripted-nations';
    const isFlexibleTeam = event.registration_type === 'TEAM' && event.min_team_size === 1;
    const isAllowed =
      event.registration_type === normalizedRequestedType ||
      (isBoth && (normalizedRequestedType === 'INDIVIDUAL' || normalizedRequestedType === 'TEAM')) ||
      (isFlexibleTeam && (normalizedRequestedType === 'INDIVIDUAL' || normalizedRequestedType === 'TEAM'));

    if (!isAllowed) {
      return {
        isValid: false,
        statusCode: 400,
        code: 'INVALID_REGISTRATION_TYPE',
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

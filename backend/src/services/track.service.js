import TrackModel from '../models/track.model.js';
import { formatEventResponse } from './event.service.js';

/**
 * Standardize track database record into API response format
 */
export const formatTrackResponse = (track) => {
  if (!track) return null;
  return {
    id: track.id,
    name: track.name,
    slug: track.slug,
    description: track.description || '',
    isActive: track.is_active,
    createdAt: track.created_at,
    updatedAt: track.updated_at,
  };
};

/**
 * Track Service
 * Encapsulates business logic for discovering official tracks and their associated events.
 */
export const trackService = {
  /**
   * Fetch all active official tracks.
   *
   * @returns {Promise<Array>}
   */
  getActiveTracks: async () => {
    const tracks = await TrackModel.findAllActiveTracks();
    return tracks.map(formatTrackResponse);
  },

  /**
   * Fetch a track by UUID.
   *
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  getTrackById: async (id) => {
    if (!id) return null;
    const track = await TrackModel.findById(id);
    if (!track || !track.is_active) {
      return null;
    }
    return formatTrackResponse(track);
  },

  /**
   * Fetch a track by slug.
   *
   * @param {string} slug
   * @returns {Promise<Object|null>}
   */
  getTrackBySlug: async (slug) => {
    if (!slug) return null;
    const normalizedSlug = slug.trim().toLowerCase();
    const track = await TrackModel.findBySlug(normalizedSlug);
    if (!track || !track.is_active) {
      return null;
    }
    return formatTrackResponse(track);
  },

  /**
   * Fetch all active events belonging to a track by track ID.
   *
   * @param {string} trackId
   * @returns {Promise<Array>}
   */
  getEventsByTrackId: async (trackId) => {
    if (!trackId) return [];
    const events = await TrackModel.findEventsByTrackId(trackId);
    return events.map(formatEventResponse);
  },
};

export default trackService;

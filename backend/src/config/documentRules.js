/**
 * Canonical Event Document Requirement Rules
 *
 * Defines mandatory document requirements per event slug.
 * Source of truth aligns with frontend/lib/eventsData.ts.
 */

export const EVENT_DOCUMENT_RULES = {
  'cipher-chase': {
    eventName: 'CIPHER CHASE',
    requiresIdCard: true,
    requiresProfilePhoto: false,
    allMembersRequireId: true, // Every team member (1..4) requires college ID
    coreMembersCount: 4,
  },
  'loot-goblins': {
    eventName: 'BATTLEGROUND BLITZ',
    aliases: ['battleground-blitz', 'battlefield-blitz', 'bgmi'],
    requiresIdCard: true,
    requiresProfilePhoto: false,
    allMembersRequireId: true, // Core players 1..4 require ID card; optional sub (P5) requires ID if registered
    coreMembersCount: 4,
  },
  'innocraft': {
    eventName: 'INNOCRAFT',
    requiresIdCard: true,
    requiresProfilePhoto: false,
    allMembersRequireId: true,
    coreMembersCount: 4,
  },
  'webweave': {
    eventName: 'WEBWEAVE',
    requiresIdCard: true,
    requiresProfilePhoto: false,
    allMembersRequireId: true,
    coreMembersCount: 2,
  },
  'runtime-rush': {
    eventName: 'RUNTIME RUSH',
    requiresIdCard: true,
    requiresProfilePhoto: false,
    allMembersRequireId: true,
    coreMembersCount: 2,
  },
  'vlookup': {
    eventName: 'VLOOKUP',
    requiresIdCard: true,
    requiresProfilePhoto: false,
    allMembersRequireId: true,
    coreMembersCount: 2,
  },
  'debug-derby': {
    eventName: 'DEBUG DERBY',
    requiresIdCard: true,
    requiresProfilePhoto: false,
    allMembersRequireId: true,
    coreMembersCount: 1,
  },
  'unscripted-nations': {
    eventName: 'UNSCRIPTED NATIONS',
    aliases: ['model-united-nations', 'mun'],
    requiresIdCard: true,
    requiresProfilePhoto: true,
    allMembersRequireId: true,
    coreMembersCount: 1,
  },
  'circuit-of-minds': {
    eventName: 'CIRCUIT OF MINDS',
    aliases: ['tech-quiz'],
    requiresIdCard: true,
    requiresProfilePhoto: false,
    allMembersRequireId: true,
    coreMembersCount: 2,
  },
  'battle-of-bots': {
    eventName: 'BATTLE OF BOTS',
    requiresIdCard: true,
    requiresProfilePhoto: false,
    allMembersRequireId: true,
    coreMembersCount: 1,
  },
  'thoughtlab': {
    eventName: 'THOUGHTLAB',
    aliases: ['ideathon'],
    requiresIdCard: true,
    requiresProfilePhoto: false,
    allMembersRequireId: true,
    coreMembersCount: 2,
  },
  'velocityx': {
    eventName: 'VELOCITYX',
    aliases: ['death-race'],
    requiresIdCard: true,
    requiresProfilePhoto: false,
    allMembersRequireId: true,
    coreMembersCount: 2,
  },
  'hack-the-skill': {
    eventName: 'HACK THE SKILL',
    aliases: ['hack-the-skills'],
    requiresIdCard: true,
    requiresProfilePhoto: true,
    allMembersRequireId: true,
    coreMembersCount: 1,
  },
};

/**
 * Resolves document rules for a given event slug or identifier.
 * Defaults to standard rule requiring collegeId for all participants.
 *
 * @param {string} slugOrId
 * @returns {Object} Document rules
 */
export const getEventDocumentRules = (slugOrId = '') => {
  const clean = String(slugOrId || '').toLowerCase().trim();

  // Direct slug match
  if (EVENT_DOCUMENT_RULES[clean]) {
    return EVENT_DOCUMENT_RULES[clean];
  }

  // Alias match
  for (const [key, rule] of Object.entries(EVENT_DOCUMENT_RULES)) {
    if (rule.aliases && rule.aliases.includes(clean)) {
      return rule;
    }
  }

  // Default fallback rule for any XAVITECH event
  return {
    eventName: clean,
    requiresIdCard: true,
    requiresProfilePhoto: false,
    allMembersRequireId: true,
    coreMembersCount: 1,
  };
};

export default {
  EVENT_DOCUMENT_RULES,
  getEventDocumentRules,
};

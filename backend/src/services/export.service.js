import * as XLSX from 'xlsx';
import { getSupabaseClient } from '../config/database.js';
import logger from '../utils/logger.util.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * PostgREST search input sanitizer.
 */
const sanitizeSearchTerm = (term) => {
  if (!term || typeof term !== 'string') return '';
  return term.trim().replace(/[,()"'%]/g, '');
};

/**
 * Format ISO dates into human-readable YYYY-MM-DD HH:mm:ss string.
 */
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toISOString().replace('T', ' ').substring(0, 19);
  } catch {
    return dateStr;
  }
};

/**
 * Definitive Map of Supported Export Fields
 */
export const EXPORT_FIELDS_MAP = {
  // PARTICIPANT DETAILS
  registrationId: {
    label: 'Registration ID',
    category: 'PARTICIPANT DETAILS',
    default: true,
    extract: (reg) => reg.registration_id || reg.id || '',
  },
  participantName: {
    label: 'Participant Name',
    category: 'PARTICIPANT DETAILS',
    default: true,
    extract: (reg) => reg.user?.name || (reg.team?.leader?.name ? `${reg.team.leader.name} (Team Leader)` : 'N/A'),
  },
  email: {
    label: 'Email',
    category: 'PARTICIPANT DETAILS',
    default: true,
    extract: (reg) => reg.user?.email || reg.team?.leader?.email || 'N/A',
  },
  phone: {
    label: 'Phone',
    category: 'PARTICIPANT DETAILS',
    default: true,
    extract: (reg) => reg.user?.phone || reg.team?.leader?.phone || 'N/A',
  },
  institution: {
    label: 'Institution',
    category: 'PARTICIPANT DETAILS',
    default: true,
    extract: (reg) => reg.user?.college_name || reg.team?.leader?.college_name || 'N/A',
  },

  // EVENT DETAILS
  eventName: {
    label: 'Event Name',
    category: 'EVENT DETAILS',
    default: true,
    extract: (reg) => reg.event?.name || 'N/A',
  },
  trackName: {
    label: 'Track',
    category: 'EVENT DETAILS',
    default: true,
    extract: (reg) => reg.event?.track?.name || 'N/A',
  },
  participationType: {
    label: 'Participation Type',
    category: 'EVENT DETAILS',
    default: true,
    extract: (reg) => reg.registration_type || 'INDIVIDUAL',
  },
  status: {
    label: 'Registration Status',
    category: 'EVENT DETAILS',
    default: true,
    extract: (reg) => reg.status || 'DRAFT',
  },
  registeredDate: {
    label: 'Registration Date',
    category: 'EVENT DETAILS',
    default: true,
    extract: (reg) => formatDate(reg.created_at),
  },
  eventFee: {
    label: 'Fee',
    category: 'EVENT DETAILS',
    default: false,
    extract: (reg) => (reg.event?.fee != null ? `₹${Number(reg.event.fee).toFixed(2)}` : 'Free'),
  },

  // TEAM DETAILS
  teamName: {
    label: 'Team Name',
    category: 'TEAM DETAILS',
    default: true,
    extract: (reg) => reg.team?.team_name || (reg.registration_type === 'TEAM' ? 'Pending' : 'N/A'),
  },
  teamLeader: {
    label: 'Team Leader',
    category: 'TEAM DETAILS',
    default: false,
    extract: (reg) => reg.team?.leader?.name || reg.user?.name || 'N/A',
  },
  teamSize: {
    label: 'Team Size',
    category: 'TEAM DETAILS',
    default: true,
    extract: (reg) => (reg.registration_type === 'TEAM' ? 1 + (reg.team?.members?.length || 0) : 1),
  },
  teamMembers: {
    label: 'Team Members',
    category: 'TEAM DETAILS',
    default: true,
    extract: (reg) => {
      if (reg.registration_type !== 'TEAM' || !reg.team?.members || reg.team.members.length === 0) {
        return reg.registration_type === 'TEAM' ? 'Leader Only' : 'N/A';
      }
      const sorted = [...reg.team.members].sort((a, b) => (a.member_order || 0) - (b.member_order || 0));
      return sorted.map((m) => m.name).join('; ');
    },
  },

  // PAYMENT DETAILS (Only real data model fields; frozen gateway information omitted)
  paymentStatus: {
    label: 'Payment Status',
    category: 'PAYMENT DETAILS',
    default: false,
    extract: (reg) => reg.status || 'DRAFT',
  },
};

export const DEFAULT_EXPORT_FIELDS = Object.keys(EXPORT_FIELDS_MAP).filter(
  (key) => EXPORT_FIELDS_MAP[key].default
);

/**
 * Generate CSV Buffer with UTF-8 BOM for Microsoft Excel compatibility.
 */
export const generateCsvBuffer = (headers, rows) => {
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((r) => r.map(escapeCell).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
  return Buffer.from(csvContent, 'utf-8');
};

/**
 * Generate XLSX Buffer using SheetJS.
 */
export const generateXlsxBuffer = (headers, rows) => {
  const wb = XLSX.utils.book_new();
  const aoa = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Dynamic column width calculation
  const colWidths = headers.map((header, colIdx) => {
    let maxLen = header.length;
    for (const row of rows) {
      const cellVal = row[colIdx];
      if (cellVal != null) {
        maxLen = Math.max(maxLen, String(cellVal).length);
      }
    }
    return { wch: Math.min(50, Math.max(12, maxLen + 2)) };
  });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

/**
 * Generate clean, human-readable file name.
 */
export const generateFilename = ({ format, scope, trackName, eventName }) => {
  const sanitize = (str) =>
    (str || '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  let part = 'Registrations';
  if (scope === 'event' && eventName) {
    part = `${sanitize(eventName)}-Registrations`;
  } else if ((scope === 'track' || scope === 'my_track') && trackName) {
    part = `${sanitize(trackName)}-Registrations`;
  } else if (scope === 'filtered') {
    part = 'Filtered-Registrations';
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const ext = format === 'csv' ? 'csv' : 'xlsx';
  return `XAVITECH-2026-${part}-${dateStr}.${ext}`;
};

export const exportService = {
  /**
   * Fetch matching registrations strictly adhering to filters and track isolation constraints.
   */
  fetchRegistrationsForExport: async ({
    search = '',
    trackId = '',
    eventId = '',
    registrationType = '',
    status = '',
    trackIdConstraint = null, // Mandatory enforcement for Track Leader
  }) => {
    const client = getSupabaseClient();
    if (!client) throw new Error('Database client is not available');

    const cleanSearch = sanitizeSearchTerm(search);

    // 1. Search resolution for users and teams
    let matchingUserIds = [];
    let matchingTeamIds = [];

    if (cleanSearch) {
      const [usersRes, teamsRes] = await Promise.all([
        client
          .from('users')
          .select('id')
          .or(`email.ilike.%${cleanSearch}%,name.ilike.%${cleanSearch}%`)
          .limit(150),
        client
          .from('teams')
          .select('id')
          .ilike('team_name', `%${cleanSearch}%`)
          .limit(150),
      ]);

      if (usersRes.data) matchingUserIds = usersRes.data.map((u) => u.id);
      if (teamsRes.data) matchingTeamIds = teamsRes.data.map((t) => t.id);
    }

    // 2. Build base query with full relational hierarchy
    let query = client.from('registrations').select(
      `
      id,
      registration_id,
      registration_type,
      status,
      created_at,
      updated_at,
      event:events(id, name, slug, category, registration_type, fee, track_id, track:tracks(id, name, slug)),
      user:users(id, name, email, phone, college_name, profile_image, firebase_uid),
      team:teams(id, team_name, status, leader:users(id, name, email, phone, college_name), members:team_members(id, name, member_order))
    `,
      { count: 'exact' }
    );

    // 3. Search conditions
    if (cleanSearch) {
      const orClauses = [`registration_id.ilike.%${cleanSearch}%`];
      if (matchingUserIds.length > 0) {
        orClauses.push(`user_id.in.(${matchingUserIds.join(',')})`);
      }
      if (matchingTeamIds.length > 0) {
        orClauses.push(`team_id.in.(${matchingTeamIds.join(',')})`);
      }
      query = query.or(orClauses.join(','));
    }

    // 4. Track Isolation & Scoping:
    // If trackIdConstraint is present (Track Leader), it OVERRIDES everything.
    const effectiveTrackId = trackIdConstraint || trackId;

    if (eventId && UUID_REGEX.test(eventId)) {
      query = query.eq('event_id', eventId);
    } else if (effectiveTrackId && typeof effectiveTrackId === 'string' && effectiveTrackId.trim()) {
      let targetTrackId = effectiveTrackId.trim();
      if (!UUID_REGEX.test(targetTrackId)) {
        const { data: trackRow } = await client
          .from('tracks')
          .select('id')
          .eq('slug', targetTrackId.toLowerCase())
          .maybeSingle();
        if (trackRow) {
          targetTrackId = trackRow.id;
        }
      }

      if (UUID_REGEX.test(targetTrackId)) {
        const { data: trackEvents } = await client
          .from('events')
          .select('id')
          .eq('track_id', targetTrackId);

        const trackEventIds = (trackEvents || []).map((e) => e.id);
        if (trackEventIds.length === 0) {
          return [];
        }
        query = query.in('event_id', trackEventIds);
      }
    }

    // 5. Registration type filter
    if (registrationType && ['INDIVIDUAL', 'TEAM'].includes(registrationType.toUpperCase())) {
      query = query.eq('registration_type', registrationType.toUpperCase());
    }

    // 6. Status filter
    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    // 7. Order and execute without pagination limits (up to safe max 10,000)
    query = query.order('created_at', { ascending: false }).limit(10000);

    const { data: rows, error } = await query;
    if (error) {
      logger.error('Error fetching registrations for export:', error);
      throw error;
    }

    return rows || [];
  },

  /**
   * Validate requested field keys and return valid list.
   */
  validateFields: (fields) => {
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return DEFAULT_EXPORT_FIELDS;
    }

    const invalid = fields.filter((f) => !EXPORT_FIELDS_MAP[f]);
    if (invalid.length > 0) {
      const err = new Error(`Invalid export field(s): ${invalid.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    return fields;
  },

  /**
   * Resolve human-readable track and event labels for filenames and preview summary.
   */
  resolveLabels: async ({ trackId, eventId, trackIdConstraint, assignedTrackName }) => {
    const client = getSupabaseClient();
    let trackName = assignedTrackName || '';
    let eventName = '';

    const effectiveTrackId = trackIdConstraint || trackId;

    if (effectiveTrackId && !trackName && client) {
      if (UUID_REGEX.test(effectiveTrackId)) {
        const { data } = await client.from('tracks').select('name').eq('id', effectiveTrackId).maybeSingle();
        if (data) trackName = data.name;
      } else {
        const { data } = await client.from('tracks').select('name').eq('slug', effectiveTrackId.toLowerCase()).maybeSingle();
        if (data) trackName = data.name;
      }
    }

    if (eventId && UUID_REGEX.test(eventId) && client) {
      const { data } = await client.from('events').select('name, track:tracks(name)').eq('id', eventId).maybeSingle();
      if (data) {
        eventName = data.name;
        if (!trackName && data.track?.name) {
          trackName = data.track.name;
        }
      }
    }

    return {
      trackName: trackName || 'All Tracks',
      eventName: eventName || 'All Events',
    };
  },

  /**
   * Generate an Export Preview Summary.
   */
  getExportPreview: async ({
    scope = 'all',
    filters = {},
    fields = null,
    format = 'xlsx',
    trackIdConstraint = null,
    assignedTrack = null,
  }) => {
    const validFields = exportService.validateFields(fields);
    const validFormat = format === 'csv' ? 'csv' : 'xlsx';

    // Normalize scope filters
    let search = filters.search || '';
    let trackId = filters.trackId || '';
    let eventId = filters.eventId || '';
    let registrationType = filters.registrationType || '';
    let status = filters.status || '';

    if (scope === 'all' && !trackIdConstraint) {
      search = '';
      trackId = '';
      eventId = '';
      registrationType = '';
      status = '';
    } else if (scope === 'my_track' && trackIdConstraint) {
      search = '';
      eventId = '';
      registrationType = '';
      status = '';
      trackId = trackIdConstraint;
    } else if (scope === 'track') {
      search = '';
      eventId = '';
      registrationType = '';
      status = '';
    } else if (scope === 'event') {
      search = '';
      registrationType = '';
      status = '';
    }

    const { trackName, eventName } = await exportService.resolveLabels({
      trackId,
      eventId,
      trackIdConstraint,
      assignedTrackName: assignedTrack?.name,
    });

    const rows = await exportService.fetchRegistrationsForExport({
      search,
      trackId,
      eventId,
      registrationType,
      status,
      trackIdConstraint,
    });

    const columns = validFields.map((key) => EXPORT_FIELDS_MAP[key].label);
    const filename = generateFilename({
      format: validFormat,
      scope,
      trackName: trackName !== 'All Tracks' ? trackName : '',
      eventName: eventName !== 'All Events' ? eventName : '',
    });

    return {
      totalRecords: rows.length,
      scope,
      trackName,
      eventName,
      selectedFieldsCount: validFields.length,
      format: validFormat,
      filename,
      columns,
      fields: validFields,
    };
  },

  /**
   * Generate Complete Export File Buffer & Metadata.
   */
  generateExport: async ({
    scope = 'all',
    filters = {},
    fields = null,
    format = 'xlsx',
    trackIdConstraint = null,
    assignedTrack = null,
  }) => {
    const validFields = exportService.validateFields(fields);
    const validFormat = format === 'csv' ? 'csv' : 'xlsx';

    // Normalize scope filters
    let search = filters.search || '';
    let trackId = filters.trackId || '';
    let eventId = filters.eventId || '';
    let registrationType = filters.registrationType || '';
    let status = filters.status || '';

    if (scope === 'all' && !trackIdConstraint) {
      search = '';
      trackId = '';
      eventId = '';
      registrationType = '';
      status = '';
    } else if (scope === 'my_track' && trackIdConstraint) {
      search = '';
      eventId = '';
      registrationType = '';
      status = '';
      trackId = trackIdConstraint;
    } else if (scope === 'track') {
      search = '';
      eventId = '';
      registrationType = '';
      status = '';
    } else if (scope === 'event') {
      search = '';
      registrationType = '';
      status = '';
    }

    const { trackName, eventName } = await exportService.resolveLabels({
      trackId,
      eventId,
      trackIdConstraint,
      assignedTrackName: assignedTrack?.name,
    });

    const records = await exportService.fetchRegistrationsForExport({
      search,
      trackId,
      eventId,
      registrationType,
      status,
      trackIdConstraint,
    });

    const headers = validFields.map((key) => EXPORT_FIELDS_MAP[key].label);
    const rows = records.map((record) =>
      validFields.map((key) => EXPORT_FIELDS_MAP[key].extract(record))
    );

    let buffer;
    let contentType;

    if (validFormat === 'csv') {
      buffer = generateCsvBuffer(headers, rows);
      contentType = 'text/csv; charset=utf-8';
    } else {
      buffer = generateXlsxBuffer(headers, rows);
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }

    const filename = generateFilename({
      format: validFormat,
      scope,
      trackName: trackName !== 'All Tracks' ? trackName : '',
      eventName: eventName !== 'All Events' ? eventName : '',
    });

    return {
      buffer,
      filename,
      contentType,
      totalRecords: records.length,
    };
  },
};

export default exportService;

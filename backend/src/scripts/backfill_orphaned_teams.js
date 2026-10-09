/**
 * Backfill Script: backfill_orphaned_teams.js
 * 
 * PURPOSE:
 * Resolves historical unlinked registrations and populates team_members for teams
 * that were created before the atomic team-member persistence fix.
 * 
 * SAFETY:
 * - Defaults to DRY RUN mode. Will NOT modify any database records unless invoked with `--execute`.
 * - Does NOT invent missing emails, institutions, or personal details.
 * - Preserves existing registrations, teams, payments, and participant records.
 * - Uses existing schema constraints and foreign keys.
 * 
 * USAGE:
 * Dry Run (safe inspection):
 *   node backend/src/scripts/backfill_orphaned_teams.js
 * 
 * Execution (requires explicit administrator decision):
 *   node backend/src/scripts/backfill_orphaned_teams.js --execute
 */

import { getSupabaseClient } from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const isExecute = process.argv.includes('--execute');

async function runBackfill() {
  console.log('===============================================================');
  console.log(`XAVITECH-2026: Orphaned Teams & Team Members Backfill Script`);
  console.log(`Mode: ${isExecute ? 'EXECUTE (Modifying Database)' : 'DRY RUN (Read Only Preview)'}`);
  console.log('===============================================================\n');

  const client = getSupabaseClient();
  if (!client) {
    console.error('ERROR: Database client could not be initialized.');
    process.exit(1);
  }

  // 1. Find all TEAM registrations where team_id is NULL
  const { data: unlinkedRegs, error: unlinkedError } = await client
    .from('registrations')
    .select(`
      id,
      registration_id,
      user_id,
      event_id,
      status,
      created_at,
      event:events(id, name, slug),
      user:users(id, name, email),
      participants:registration_participants(*)
    `)
    .eq('registration_type', 'TEAM')
    .is('team_id', null);

  if (unlinkedError) {
    console.error('Error fetching unlinked registrations:', unlinkedError);
    process.exit(1);
  }

  console.log(`Found ${unlinkedRegs?.length || 0} TEAM registrations with team_id = NULL:\n`);

  for (const reg of unlinkedRegs || []) {
    console.log(`- Registration [${reg.registration_id}] for Event "${reg.event?.name}" (${reg.event?.slug})`);
    console.log(`  Leader: ${reg.user?.name} (${reg.user?.email})`);
    console.log(`  Participants count: ${reg.participants?.length || 0}`);

    // Check if an existing team already exists for this leader and event
    const { data: existingTeam } = await client
      .from('teams')
      .select('id, team_name, status')
      .eq('leader_user_id', reg.user_id)
      .eq('event_id', reg.event_id)
      .maybeSingle();

    let targetTeamId = existingTeam?.id;

    if (existingTeam) {
      console.log(`  -> Found existing team: "${existingTeam.team_name}" (${existingTeam.id})`);
    } else {
      console.log(`  -> No existing team found. Proposed new team name: "${reg.user?.name || 'Participant'}'s Team"`);
    }

    if (isExecute) {
      if (!targetTeamId) {
        const { data: createdTeam, error: createTeamErr } = await client
          .from('teams')
          .insert({
            event_id: reg.event_id,
            leader_user_id: reg.user_id,
            team_name: `${reg.user?.name || 'Participant'}'s Team`,
            status: reg.status === 'CONFIRMED' || reg.status === 'PAYMENT_SUCCESS' ? 'SUBMITTED' : 'DRAFT',
          })
          .select()
          .single();

        if (createTeamErr) {
          console.error(`  ERROR creating team:`, createTeamErr);
          continue;
        }
        targetTeamId = createdTeam.id;
        console.log(`  -> Successfully created team: ${targetTeamId}`);
      }

      // Link team to registration
      const { error: linkErr } = await client
        .from('registrations')
        .update({ team_id: targetTeamId })
        .eq('id', reg.id);

      if (linkErr) {
        console.error(`  ERROR linking team to registration:`, linkErr);
      } else {
        console.log(`  -> Successfully linked registration to team ${targetTeamId}`);
      }
    }
  }

  // 2. Check all teams and sync members from registration_participants if team_members is missing
  console.log('\n---------------------------------------------------------------');
  console.log('Inspecting team_members table synchronization...');
  console.log('---------------------------------------------------------------\n');

  const { data: allTeams } = await client
    .from('teams')
    .select(`
      id,
      team_name,
      event_id,
      leader_user_id,
      registrations:registrations(
        id,
        registration_id,
        participants:registration_participants(*)
      ),
      members:team_members(*)
    `);

  let missingMemberCount = 0;

  for (const team of allTeams || []) {
    const existingMemberNames = new Set((team.members || []).map((m) => m.name.toLowerCase().trim()));
    const regList = team.registrations || [];
    const activeReg = regList[0];

    if (!activeReg || !Array.isArray(activeReg.participants)) continue;

    const secondaryParticipants = activeReg.participants.filter(
      (p) => p.participant_order > 1 || p.participant_role === 'MEMBER'
    );

    for (const p of secondaryParticipants) {
      const name = p.full_name?.trim();
      if (name && !existingMemberNames.has(name.toLowerCase())) {
        missingMemberCount++;
        console.log(`- Team "${team.team_name}" (${team.id}) missing member record for: ${name}`);
        if (isExecute) {
          const { data: newMember, error: addErr } = await client
            .from('team_members')
            .insert({
              team_id: team.id,
              name: name,
              member_order: p.participant_order ? p.participant_order - 1 : 1,
            })
            .select()
            .single();

          if (addErr) {
            console.error(`  ERROR inserting member:`, addErr);
          } else {
            console.log(`  -> Created team_member record: ${newMember.id}`);
            // Link to registration_participant
            await client
              .from('registration_participants')
              .update({ team_member_id: newMember.id })
              .eq('id', p.id);
            console.log(`  -> Updated registration_participant ${p.id} with team_member_id`);
          }
        }
      }
    }
  }

  if (missingMemberCount === 0) {
    console.log('All existing secondary participants already have corresponding team_members records (or all historical teams had 1 participant).');
  }

  console.log('\n===============================================================');
  console.log(`Backfill inspection completed.`);
  if (!isExecute) {
    console.log('Note: Run with `--execute` when approved to persist changes to the database.');
  }
  console.log('===============================================================\n');
}

runBackfill().catch((err) => {
  console.error('Fatal error during backfill run:', err);
  process.exit(1);
});

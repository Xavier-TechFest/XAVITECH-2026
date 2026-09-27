import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import AdminModel from '../models/admin.model.js';
import { hashPassword } from '../utils/security.util.js';

/**
 * CLI script to update the single existing XAVITECH Admin account.
 * Used when coordinator changes or credentials need updating.
 * Usage:
 *   Interactive: npm run update-admin
 *   Arguments:   node src/scripts/updateAdmin.js --email new-coord@college.edu --name "New Coordinator" --password "newSecret123"
 */
export const runUpdateAdmin = async () => {
  console.log('====================================================');
  console.log('XAVITECH 2026 — UPDATE ADMIN ACCOUNT CLI');
  console.log('====================================================\n');

  try {
    // 1. Fetch the single existing admin
    const existingAdmin = await AdminModel.getAdminUser();
    if (!existingAdmin) {
      console.error('\n❌ ERROR: No ADMIN account exists in the database.');
      console.error('Use: npm run create-admin to create the initial admin account.\n');
      process.exit(1);
    }

    console.log('Found existing ADMIN account:');
    console.log(`   ID:    ${existingAdmin.id}`);
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   Name:  ${existingAdmin.name}\n`);

    // 2. Parse arguments or prompt interactively
    let email = null;
    let name = null;
    let password = null;

    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--email' && args[i + 1]) email = args[++i];
      if (args[i] === '--name' && args[i + 1]) name = args[++i];
      if (args[i] === '--password' && args[i + 1]) password = args[++i];
    }

    if (!email && !name && !password) {
      const rl = readline.createInterface({ input, output });
      const promptEmail = await rl.question(`New Email (leave empty to keep "${existingAdmin.email}"): `);
      const promptName = await rl.question(`New Name (leave empty to keep "${existingAdmin.name}"): `);
      const promptPassword = await rl.question('New Password (leave empty to keep existing password): ');
      rl.close();

      if (promptEmail.trim()) email = promptEmail.trim();
      if (promptName.trim()) name = promptName.trim();
      if (promptPassword.trim()) password = promptPassword.trim();
    }

    const updates = {};
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      if (!cleanEmail.includes('@')) {
        console.error('❌ Invalid email format.');
        process.exit(1);
      }
      updates.email = cleanEmail;
    }

    if (name) {
      const cleanName = name.trim();
      if (cleanName.length < 2) {
        console.error('❌ Name must be at least 2 characters long.');
        process.exit(1);
      }
      updates.name = cleanName;
    }

    if (password) {
      const cleanPassword = password.trim();
      if (cleanPassword.length < 8) {
        console.error('❌ Password must be at least 8 characters long.');
        process.exit(1);
      }
      updates.password_hash = await hashPassword(cleanPassword);
    }

    if (Object.keys(updates).length === 0) {
      console.log('No updates provided. Admin account left unchanged.');
      process.exit(0);
    }

    // 3. Update the existing admin record
    const updatedAdmin = await AdminModel.updateAdminUser(existingAdmin.id, updates);

    console.log('\n✅ SUCCESS: Admin account updated successfully!');
    console.log(`   ID:    ${updatedAdmin.id}`);
    console.log(`   Email: ${updatedAdmin.email}`);
    console.log(`   Name:  ${updatedAdmin.name}`);
    console.log(`   Role:  ${updatedAdmin.role}`);
    console.log('\n(No duplicate admin account created. Password hash updated securely.)\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to update admin account:', error.message);
    process.exit(1);
  }
};

runUpdateAdmin();

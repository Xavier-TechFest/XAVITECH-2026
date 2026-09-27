import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import AdminModel from '../models/admin.model.js';
import { hashPassword } from '../utils/security.util.js';
import logger from '../utils/logger.util.js';

/**
 * CLI script to create the single XAVITECH Admin account.
 * Usage:
 *   Interactive: npm run create-admin
 *   Arguments:   node src/scripts/createAdmin.js --email admin@college.edu --name "Coordinator" --password "secret123"
 */
export const runCreateAdmin = async () => {
  console.log('====================================================');
  console.log('XAVITECH 2026 — CREATE ADMIN ACCOUNT CLI');
  console.log('====================================================\n');

  try {
    // 1. Check if an admin already exists in the system
    const existingAdmin = await AdminModel.getAdminUser();
    if (existingAdmin) {
      console.error('\n❌ ERROR: An ADMIN account already exists in the database:');
      console.error(`   ID:    ${existingAdmin.id}`);
      console.error(`   Email: ${existingAdmin.email}`);
      console.error(`   Name:  ${existingAdmin.name}`);
      console.error('\nXAVITECH architecture permits EXACTLY ONE admin account.');
      console.error('To update coordinator details, use: npm run update-admin\n');
      process.exit(1);
    }

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

    if (!email || !name || !password) {
      const rl = readline.createInterface({ input, output });
      if (!email) email = await rl.question('Enter Admin Email: ');
      if (!name) name = await rl.question('Enter Admin Full Name: ');
      if (!password) password = await rl.question('Enter Admin Password: ');
      rl.close();
    }

    // 3. Validate inputs
    email = (email || '').trim().toLowerCase();
    name = (name || '').trim();
    password = (password || '').trim();

    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email format.');
      process.exit(1);
    }

    if (!name || name.length < 2) {
      console.error('❌ Name must be at least 2 characters long.');
      process.exit(1);
    }

    if (!password || password.length < 8) {
      console.error('❌ Password must be at least 8 characters long.');
      process.exit(1);
    }

    // 4. Hash password securely
    const passwordHash = await hashPassword(password);

    // 5. Insert single admin record
    const createdAdmin = await AdminModel.createAdminUser({
      email,
      name,
      password_hash: passwordHash,
    });

    console.log('\n✅ SUCCESS: Admin account created successfully!');
    console.log(`   ID:    ${createdAdmin.id}`);
    console.log(`   Email: ${createdAdmin.email}`);
    console.log(`   Name:  ${createdAdmin.name}`);
    console.log(`   Role:  ${createdAdmin.role}`);
    console.log('\n(Password hash saved. Raw password is never stored or logged.)\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to create admin account:', error.message);
    process.exit(1);
  }
};

runCreateAdmin();

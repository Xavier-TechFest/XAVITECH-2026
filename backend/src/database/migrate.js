import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import config from '../config/env.config.js';
import logger from '../utils/logger.util.js';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getDatabaseConfig = () => {
  if (config.supabase.databaseUrl) {
    return {
      connectionString: config.supabase.databaseUrl,
      ssl: { rejectUnauthorized: false },
    };
  }

  if (config.supabase.url && process.env.SUPABASE_database_password) {
    try {
      const parsedUrl = new URL(config.supabase.url);
      const projectRef = parsedUrl.hostname.split('.')[0];
      return {
        host: `db.${projectRef}.supabase.co`,
        port: 5432,
        user: 'postgres',
        password: process.env.SUPABASE_database_password,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
      };
    } catch (e) {
      // Fall through
    }
  }

  return null;
};

/**
 * Executes pending database migrations in sequential order.
 */
export const runMigrations = async () => {
  const dbConfig = getDatabaseConfig();

  if (!dbConfig) {
    logger.error('Cannot run migrations: Database configuration or Supabase credentials are missing.');
    process.exit(1);
  }

  const client = new Client(dbConfig);

  try {
    await client.connect();
    logger.info('Connected to PostgreSQL database for migration.');

    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Fetch applied migrations
    const { rows: appliedRows } = await client.query(
      'SELECT name FROM schema_migrations ORDER BY id ASC'
    );
    const appliedSet = new Set(appliedRows.map((r) => r.name));

    // 3. Scan migrations directory
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      logger.warn(`Migrations directory not found at: ${migrationsDir}`);
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    let appliedCount = 0;

    for (const file of files) {
      if (appliedSet.has(file)) {
        continue;
      }

      logger.info(`Applying migration: ${file} ...`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');

      // Run each migration inside a dedicated transaction
      await client.query('BEGIN');
      try {
        await client.query(sqlContent);
        await client.query(
          'INSERT INTO schema_migrations (name) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        logger.info(`✅ Successfully applied: ${file}`);
        appliedCount++;
      } catch (migrationError) {
        await client.query('ROLLBACK');
        logger.error(`❌ Failed to apply ${file}:`, migrationError.message);
        throw migrationError;
      }
    }

    if (appliedCount === 0) {
      logger.info('Database schema is already up to date. No pending migrations.');
    } else {
      logger.info(`Migration complete: ${appliedCount} migration(s) applied successfully.`);
    }
  } catch (error) {
    logger.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

// Execute directly if run as a CLI script
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations();
}

export default runMigrations;

import "dotenv/config";

const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const up = async (pgm) => {
  console.log("Creating initial schema: main tables plus the update triggers.");
  pgm.sql(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      new_email VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      api_key VARCHAR(64) UNIQUE,
      is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
      confirmation_token VARCHAR(64) UNIQUE,
      password_reset_token VARCHAR(64) DEFAULT NULL,
      password_reset_expires TIMESTAMPTZ DEFAULT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE templates (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      entrypoint VARCHAR(255) NOT NULL DEFAULT 'template.html',
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE pdfs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      template_id INTEGER NOT NULL,
      storage_object_key VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE
    );

    CREATE OR REPLACE FUNCTION update_timestamp_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW(); 
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

    CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const down = async (pgm) => {
  console.log("Reverting initial schema...");
  pgm.sql(`
    DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    DROP FUNCTION IF EXISTS update_timestamp_column();
    DROP TABLE IF EXISTS pdfs;
    DROP TABLE IF EXISTS templates;
    DROP TABLE IF EXISTS users;
  `);
};

export { down, shorthands, up };

import "dotenv/config";

const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const up = async (pgm) => {
  console.log("Adding events table for tracking user actions.");
  pgm.sql(`
    CREATE TYPE action_type AS ENUM (
      'AUTH_LOGIN',
      'AUTH_LOGOUT',
      'AUTH_REGISTER',
      'AUTH_CONFIRMED_EMAIL',
      'AUTH_PASSWORD_FORGOT',
      'AUTH_PASSWORD_RESET',
      'USER_EMAIL_UPDATED',
      'USER_PASSWORD_UPDATED',
      'USER_APIKEY_GENERATED',
      'USER_ACCOUNT_DELETED',
      'TEMPLATE_CREATED',
      'TEMPLATE_UPDATED',
      'TEMPLATE_DELETED',
      'PDF_GENERATED',
      'PDF_URL_GENERATED'
    );
    
    CREATE TYPE status_type AS ENUM ('SUCCESS', 'FAILURE', 'PENDING');

    CREATE TABLE events (
      id SERIAL PRIMARY KEY,
      public_id VARCHAR(17) NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      action action_type NOT NULL,
      status status_type NOT NULL DEFAULT 'SUCCESS',
      cost NUMERIC NOT NULL DEFAULT 0,
      details JSONB,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE INDEX idx_events_user_id_created_at ON events (user_id, created_at);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const down = (pgm) => {
  console.log("Dropping events table and associated types.");
  pgm.sql(`
    DROP INDEX IF EXISTS idx_events_user_id_created_at;
    DROP TABLE IF EXISTS events;
    DROP TYPE IF EXISTS status_type;
    DROP TYPE IF EXISTS action_type;
  `);
};

export { shorthands, up, down };

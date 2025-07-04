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
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_REGISTER',
      'USER_CONFIRM_EMAIL',
      'USER_RESEND_CONFIRM_EMAIL',
      'USER_PASSWORD_FORGOT',
      'USER_PASSWORD_RESET',
      'USER_EMAIL_UPDATE',
      'USER_PASSWORD_UPDATE',
      'USER_APIKEY_GENERATE',
      'USER_ACCOUNT_REMOVE',
      'TEMPLATE_CREATE',
      'TEMPLATE_UPDATE',
      'TEMPLATE_REMOVE',
      'PDF_GENERATE',
      'PDF_URL_GENERATE'
    );
    
    CREATE TYPE status_type AS ENUM ('SUCCESS', 'FAILURE', 'PENDING');

    CREATE TABLE events (
      id SERIAL PRIMARY KEY,
      public_id VARCHAR(17) NOT NULL UNIQUE,
      user_id INTEGER,
      action action_type NOT NULL,
      status status_type NOT NULL DEFAULT 'SUCCESS',
      cost NUMERIC NOT NULL DEFAULT 0,
      details JSONB,
      ip_address INET,
      user_agent TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
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

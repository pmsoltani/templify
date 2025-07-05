/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
const up = (pgm) => {
  console.log("Adding public_id columns to all tables...");

  pgm.sql(`
    -- Add public_id columns
    ALTER TABLE users ADD COLUMN public_id VARCHAR(17) NOT NULL UNIQUE;
    ALTER TABLE templates ADD COLUMN public_id VARCHAR(17) NOT NULL UNIQUE;
    ALTER TABLE pdfs ADD COLUMN public_id VARCHAR(17) NOT NULL UNIQUE;
    
    -- Create indexes for performance (public_id will be queried frequently)
    CREATE INDEX idx_users_public_id ON users (public_id);
    CREATE INDEX idx_templates_public_id ON templates (public_id);
    CREATE INDEX idx_pdfs_public_id ON pdfs (public_id);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
const down = (pgm) => {
  console.log("Removing public_id columns...");

  pgm.sql(`
    -- Drop indexes
    DROP INDEX IF EXISTS idx_pdfs_public_id;
    DROP INDEX IF EXISTS idx_templates_public_id;
    DROP INDEX IF EXISTS idx_users_public_id;
    
    -- Drop public_id columns
    ALTER TABLE pdfs DROP COLUMN IF EXISTS public_id;
    ALTER TABLE templates DROP COLUMN IF EXISTS public_id;
    ALTER TABLE users DROP COLUMN IF EXISTS public_id;
  `);
};

export { down, shorthands, up };

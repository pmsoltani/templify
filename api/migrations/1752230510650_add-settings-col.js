import "dotenv/config";

const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
const up = (pgm) => {
  console.log("Adding settings column to the templates table...");

  pgm.sql(`
    ALTER TABLE templates ADD COLUMN settings JSONB DEFAULT '{}';
    
    CREATE INDEX idx_templates_settings ON templates USING GIN (settings);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
const down = (pgm) => {
  console.log("Removing settings column...");

  pgm.sql(`
    DROP INDEX IF EXISTS idx_templates_settings;

    ALTER TABLE templates DROP COLUMN IF EXISTS settings;
  `);
};

export { down, shorthands, up };

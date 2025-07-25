import "dotenv/config";

const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
const up = async (pgm) => {
  console.log("Adding role column to the users table...");

  pgm.sql(`
    CREATE TYPE user_role_type AS ENUM ('user', 'admin');

    ALTER TABLE users ADD COLUMN role user_role_type NOT NULL DEFAULT 'user';
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
const down = async (pgm) => {
  console.log("Removing role column from users table...");

  pgm.sql(`
    ALTER TABLE users DROP COLUMN IF EXISTS role;

    DROP TYPE IF EXISTS user_role_type;
  `);
};

export { down, shorthands, up };

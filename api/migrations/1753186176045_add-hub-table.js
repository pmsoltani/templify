import "dotenv/config";

const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const up = async (pgm) => {
  console.log("Adding hub table for showcasing public templates.");
  pgm.sql(`
    CREATE TABLE hub (
      id SERIAL PRIMARY KEY,
      public_id VARCHAR(17) NOT NULL UNIQUE,
      template_id INTEGER NOT NULL REFERENCES templates(id),
      author_id INTEGER NOT NULL REFERENCES users(id),
      name VARCHAR(255) NOT NULL,
      entrypoint VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      tags TEXT[],
      downloads INTEGER DEFAULT 0,
      featured BOOLEAN DEFAULT FALSE,
      approved BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_hub_public_id ON hub(public_id);
    CREATE INDEX idx_hub_template_id ON hub(template_id);
    CREATE INDEX idx_hub_author_id ON hub(author_id);
    CREATE INDEX idx_hub_category ON hub(category);
    CREATE INDEX idx_hub_featured ON hub(featured);
    CREATE INDEX idx_hub_approved ON hub(approved);
    CREATE INDEX idx_hub_created_at ON hub(created_at);
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const down = (pgm) => {
  console.log("Dropping hub table and associated indexes.");
  pgm.sql(`
    DROP INDEX IF EXISTS idx_hub_created_at;
    DROP INDEX IF EXISTS idx_hub_approved;
    DROP INDEX IF EXISTS idx_hub_featured;
    DROP INDEX IF EXISTS idx_hub_category;
    DROP INDEX IF EXISTS idx_hub_author_id;
    DROP INDEX IF EXISTS idx_hub_template_id;
    DROP INDEX IF EXISTS idx_hub_public_id;

    DROP TABLE IF EXISTS hub;
  `);
};

export { down, shorthands, up };

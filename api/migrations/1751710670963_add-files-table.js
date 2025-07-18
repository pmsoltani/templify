import "dotenv/config";

const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const up = async (pgm) => {
  console.log("Adding files table for tracking template source files.");
  pgm.sql(` 
    CREATE TABLE files (
      id SERIAL PRIMARY KEY,
      public_id VARCHAR(17) NOT NULL UNIQUE,
      template_id INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      size INTEGER,
      mime VARCHAR(100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE CASCADE,
      UNIQUE(template_id, name)
    );

    CREATE INDEX idx_files_template_id ON files (template_id);

    CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

    CREATE OR REPLACE FUNCTION update_template_on_file_change()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Update the parent template's updated_at timestamp
      UPDATE templates 
      SET updated_at = NOW() 
      WHERE id = COALESCE(NEW.template_id, OLD.template_id);
      RETURN COALESCE(NEW, OLD);
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_template_on_file_insert
    AFTER INSERT ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_template_on_file_change();

    CREATE TRIGGER update_template_on_file_update
    AFTER UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_template_on_file_change();

    CREATE TRIGGER update_template_on_file_delete
    AFTER DELETE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_template_on_file_change();
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const down = (pgm) => {
  console.log("Dropping files table and associated triggers.");
  pgm.sql(`
    DROP TRIGGER IF EXISTS update_template_on_file_delete ON files;
    DROP TRIGGER IF EXISTS update_template_on_file_update ON files;
    DROP TRIGGER IF EXISTS update_template_on_file_insert ON files;
    DROP FUNCTION IF EXISTS update_template_on_file_change();

    DROP TRIGGER IF EXISTS update_files_updated_at ON files;
    DROP INDEX IF EXISTS idx_files_template_id;
    DROP TABLE IF EXISTS files;
  `);
};

export { down, shorthands, up };
